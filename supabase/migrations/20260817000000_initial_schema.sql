-- UNI-TEL fresh Supabase baseline schema.
--
-- This migration is intended for a brand-new Supabase project. It replaces the
-- earlier imported patch-style SQL history with one deterministic bootstrap.
-- No seed/sample data is inserted here.

create schema if not exists extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- ---------------------------------------------------------------------------
-- Academic rule helpers
-- ---------------------------------------------------------------------------

create or replace function public.normalize_grade(grade_letter text)
returns text
language sql
immutable
as $$
  select case upper(btrim(coalesce(grade_letter, '')))
    when '' then null
    when 'A(-)' then 'A-'
    when 'B(-)' then 'B-'
    when 'C(-)' then 'C-'
    else upper(btrim(coalesce(grade_letter, '')))
  end;
$$;

create or replace function public.validate_grade_letter(letter text)
returns boolean
language sql
immutable
as $$
  select coalesce(
    public.normalize_grade(letter) in ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F', 'I', 'S', 'X', 'NP', 'NF'),
    false
  );
$$;

create or replace function public.is_gpa_grade(letter text)
returns boolean
language sql
immutable
as $$
  select coalesce(public.normalize_grade(letter) in ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F'), false);
$$;

create or replace function public.grade_to_points(grade_letter text)
returns numeric
language sql
immutable
as $$
  select case public.normalize_grade(grade_letter)
    when 'A' then 10.0
    when 'A-' then 9.0
    when 'B' then 8.0
    when 'B-' then 7.0
    when 'C' then 6.0
    when 'C-' then 5.0
    when 'D' then 4.0
    when 'F' then 0.0
    else null
  end;
$$;

create or replace function public.assessment_weightage_limit(exam_type text)
returns numeric
language sql
immutable
as $$
  select case
    when lower(btrim(coalesce(exam_type, ''))) like '%minor%'
      or lower(btrim(coalesce(exam_type, ''))) like '%mid%'
      then 30.0
    when lower(btrim(coalesce(exam_type, ''))) like '%major%'
      or lower(btrim(coalesce(exam_type, ''))) like '%end%'
      then 50.0
    else 30.0
  end;
$$;

create or replace function public.validate_assessment_weightage(exam_type text, weightage numeric)
returns boolean
language sql
immutable
as $$
  select weightage is null
    or (
      weightage >= 0
      and weightage <= public.assessment_weightage_limit(exam_type)
    );
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  college text,
  role text not null default 'student',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_email_format_check
    check (email is null or email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint profiles_full_name_not_blank_check
    check (full_name is null or length(btrim(full_name)) between 1 and 200),
  constraint profiles_college_not_blank_check
    check (college is null or length(btrim(college)) between 1 and 200),
  constraint profiles_role_check
    check (role in ('student', 'graduate', 'researcher', 'faculty', 'admin'))
);

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number integer not null,
  sgpa numeric(4,2),
  total_credits integer not null default 0,
  source_json_import boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint semesters_number_check check (number between 1 and 12),
  constraint semesters_sgpa_check check (sgpa is null or sgpa between 0 and 10),
  constraint semesters_total_credits_check check (total_credits >= 0),
  constraint semesters_user_id_number_key unique (user_id, number),
  constraint semesters_id_user_id_key unique (id, user_id)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null,
  name text not null,
  credits integer not null,
  grade text,
  grade_points numeric(3,1),
  is_audit boolean not null default false,
  source_json_import boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint subjects_semester_owner_fkey
    foreign key (semester_id, user_id)
    references public.semesters(id, user_id)
    on delete cascade,
  constraint subjects_name_not_blank_check check (length(btrim(name)) between 1 and 160),
  constraint subjects_credits_check check (credits between 1 and 6),
  constraint subjects_grade_check check (grade is null or public.validate_grade_letter(grade)),
  constraint subjects_grade_points_check check (grade_points is null or grade_points between 0 and 10),
  constraint subjects_grade_points_consistency_check
    check (grade_points is not distinct from public.grade_to_points(grade)),
  constraint subjects_user_semester_name_key unique (user_id, semester_id, name)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null,
  subject_name text not null,
  total_classes integer not null default 0,
  attended_classes integer not null default 0,
  percentage numeric(5,2) generated always as (
    case
      when total_classes > 0 then round((attended_classes::numeric / total_classes::numeric) * 100, 2)
      else 0
    end
  ) stored,
  note text,
  source_json_import boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint attendance_records_semester_owner_fkey
    foreign key (semester_id, user_id)
    references public.semesters(id, user_id)
    on delete cascade,
  constraint attendance_records_subject_name_not_blank_check
    check (length(btrim(subject_name)) between 1 and 160),
  constraint attendance_records_total_classes_check check (total_classes >= 0),
  constraint attendance_records_attended_classes_check check (attended_classes >= 0),
  constraint attendance_records_counts_check check (attended_classes <= total_classes),
  constraint attendance_records_note_length_check check (note is null or length(note) <= 1000),
  constraint attendance_records_user_semester_subject_key unique (user_id, semester_id, subject_name)
);

create table public.marks_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null,
  subject_name text not null,
  exam_type text not null,
  total_marks numeric(8,2) not null default 0,
  obtained_marks numeric(8,2) not null default 0,
  weightage numeric(5,2) not null default 30,
  percentage numeric(5,2) generated always as (
    case
      when total_marks > 0 then round((obtained_marks / total_marks) * 100, 2)
      else null
    end
  ) stored,
  weighted_percentage numeric(5,2) generated always as (
    case
      when total_marks > 0 then round(((obtained_marks / total_marks) * 100 * weightage / 100), 2)
      else null
    end
  ) stored,
  exam_date date,
  exam_time time,
  source_json_import boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint marks_records_semester_owner_fkey
    foreign key (semester_id, user_id)
    references public.semesters(id, user_id)
    on delete cascade,
  constraint marks_records_subject_name_not_blank_check
    check (length(btrim(subject_name)) between 1 and 160),
  constraint marks_records_exam_type_length_check
    check (length(btrim(exam_type)) between 2 and 100),
  constraint marks_records_total_marks_check check (total_marks >= 0),
  constraint marks_records_obtained_marks_check check (obtained_marks >= 0),
  constraint marks_records_values_check
    check (
      (total_marks = 0 and obtained_marks = 0)
      or (total_marks > 0 and obtained_marks <= total_marks)
    ),
  constraint marks_records_weightage_check
    check (weightage >= 0 and weightage <= public.assessment_weightage_limit(exam_type)),
  constraint marks_records_user_semester_subject_exam_key unique (user_id, semester_id, subject_name, exam_type)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  action_url text,
  action_text text,
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint notifications_title_length_check check (length(btrim(title)) between 1 and 120),
  constraint notifications_message_length_check check (length(btrim(message)) between 1 and 800),
  constraint notifications_type_check check (type in ('info', 'success', 'warning', 'error')),
  constraint notifications_source_check check (source in ('manual', 'academic-alert', 'system')),
  constraint notifications_metadata_object_check check (jsonb_typeof(metadata) = 'object')
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grade_scale text not null default '10-point',
  attendance_warning_threshold numeric(5,2) not null default 75,
  cgpa_target numeric(4,2) not null default 8.5,
  exam_reminder_days integer not null default 7,
  notifications jsonb not null default '{
    "attendanceWarnings": true,
    "gradeUpdates": true,
    "examReminders": true,
    "dataHealthAlerts": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_preferences_grade_scale_check check (grade_scale in ('10-point', '4-point', 'percentage')),
  constraint user_preferences_attendance_threshold_check check (attendance_warning_threshold between 50 and 95),
  constraint user_preferences_cgpa_target_check check (cgpa_target between 0 and 10),
  constraint user_preferences_exam_reminder_days_check check (exam_reminder_days between 0 and 30),
  constraint user_preferences_notifications_object_check check (jsonb_typeof(notifications) = 'object')
);

-- ---------------------------------------------------------------------------
-- Normalization and rollup triggers
-- ---------------------------------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.normalize_profile_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.email = nullif(lower(btrim(new.email)), '');
  new.full_name = nullif(btrim(new.full_name), '');
  new.college = nullif(btrim(new.college), '');
  new.role = coalesce(nullif(lower(btrim(new.role)), ''), 'student');
  new.avatar_url = nullif(btrim(new.avatar_url), '');
  return new;
end;
$$;

create or replace function public.normalize_subject_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.name = btrim(new.name);
  new.grade = public.normalize_grade(new.grade);
  new.grade_points = public.grade_to_points(new.grade);
  return new;
end;
$$;

create or replace function public.normalize_attendance_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.subject_name = btrim(new.subject_name);
  new.note = nullif(btrim(new.note), '');
  return new;
end;
$$;

create or replace function public.normalize_marks_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.subject_name = btrim(new.subject_name);
  new.exam_type = btrim(new.exam_type);
  return new;
end;
$$;

create or replace function public.normalize_notification_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.title = btrim(new.title);
  new.message = btrim(new.message);
  new.type = lower(btrim(new.type));
  new.source = lower(btrim(new.source));
  new.action_url = nullif(btrim(new.action_url), '');
  new.action_text = nullif(btrim(new.action_text), '');
  return new;
end;
$$;

create or replace function public.protect_semester_rollup_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    new.sgpa = null;
    new.total_credits = 0;
  elsif coalesce(current_setting('uni_tel.recalculating_semester_rollup', true), 'off') <> 'on' then
    new.sgpa = old.sgpa;
    new.total_credits = old.total_credits;
  end if;

  return new;
end;
$$;

create or replace function public.recalculate_semester_sgpa_for(sem_id uuid, usr_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  attempted_credits integer := 0;
  weighted_points numeric := 0;
  calculated_sgpa numeric(4,2);
begin
  select
    coalesce(sum(credits), 0)::integer,
    coalesce(sum(credits * public.grade_to_points(grade)), 0)
  into attempted_credits, weighted_points
  from public.subjects
  where semester_id = sem_id
    and user_id = usr_id
    and is_audit = false
    and public.is_gpa_grade(grade);

  if attempted_credits > 0 then
    calculated_sgpa := round(weighted_points / attempted_credits, 2);
  else
    calculated_sgpa := null;
  end if;

  perform set_config('uni_tel.recalculating_semester_rollup', 'on', true);

  update public.semesters
  set total_credits = attempted_credits,
      sgpa = calculated_sgpa,
      updated_at = now()
  where id = sem_id
    and user_id = usr_id;

  perform set_config('uni_tel.recalculating_semester_rollup', 'off', true);
end;
$$;

create or replace function public.update_semester_academic_rollup()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalculate_semester_sgpa_for(new.semester_id, new.user_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform public.recalculate_semester_sgpa_for(old.semester_id, old.user_id);
    return old;
  elsif tg_op = 'UPDATE' then
    if old.semester_id is distinct from new.semester_id
       or old.user_id is distinct from new.user_id then
      perform public.recalculate_semester_sgpa_for(old.semester_id, old.user_id);
      perform public.recalculate_semester_sgpa_for(new.semester_id, new.user_id);
    else
      perform public.recalculate_semester_sgpa_for(new.semester_id, new.user_id);
    end if;
    return new;
  end if;

  return null;
end;
$$;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  insert into public.profiles (user_id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'Student'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger profiles_normalize_before_insert_update
  before insert or update on public.profiles
  for each row execute function public.normalize_profile_row();

create trigger semesters_protect_rollup_before_insert_update
  before insert or update on public.semesters
  for each row execute function public.protect_semester_rollup_row();

create trigger semesters_updated_at_before_update
  before update on public.semesters
  for each row execute function public.update_updated_at_column();

create trigger subjects_normalize_before_insert_update
  before insert or update on public.subjects
  for each row execute function public.normalize_subject_row();

create trigger subjects_updated_at_before_update
  before update on public.subjects
  for each row execute function public.update_updated_at_column();

create trigger subjects_rollup_after_insert_update_delete
  after insert or update or delete on public.subjects
  for each row execute function public.update_semester_academic_rollup();

create trigger attendance_normalize_before_insert_update
  before insert or update on public.attendance_records
  for each row execute function public.normalize_attendance_row();

create trigger attendance_updated_at_before_update
  before update on public.attendance_records
  for each row execute function public.update_updated_at_column();

create trigger marks_normalize_before_insert_update
  before insert or update on public.marks_records
  for each row execute function public.normalize_marks_row();

create trigger marks_updated_at_before_update
  before update on public.marks_records
  for each row execute function public.update_updated_at_column();

create trigger notifications_normalize_before_insert_update
  before insert or update on public.notifications
  for each row execute function public.normalize_notification_row();

create trigger notifications_updated_at_before_update
  before update on public.notifications
  for each row execute function public.update_updated_at_column();

create trigger user_preferences_updated_at_before_update
  before update on public.user_preferences
  for each row execute function public.update_updated_at_column();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

-- ---------------------------------------------------------------------------
-- Query/RPC functions
-- ---------------------------------------------------------------------------

create or replace function public.get_user_cgpa(target_user_id uuid)
returns numeric
language plpgsql
security invoker
stable
set search_path = public, pg_temp
as $$
declare
  total_weighted_points numeric := 0;
  total_credits_sum numeric := 0;
  calculated_cgpa numeric;
begin
  select
    coalesce(sum(credits * public.grade_to_points(grade)), 0),
    coalesce(sum(credits), 0)
  into total_weighted_points, total_credits_sum
  from public.subjects
  where user_id = target_user_id
    and is_audit = false
    and public.is_gpa_grade(grade);

  if total_credits_sum > 0 then
    calculated_cgpa := round(total_weighted_points / total_credits_sum, 2);
  else
    calculated_cgpa := null;
  end if;

  return calculated_cgpa;
end;
$$;

create or replace function public.get_user_academic_summary()
returns table (
  user_id uuid,
  total_semesters bigint,
  total_subjects bigint,
  total_credits bigint,
  average_sgpa numeric,
  cgpa numeric,
  backlogs bigint
)
language plpgsql
security invoker
stable
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    return;
  end if;

  return query
  select
    current_user_id,
    (select count(*) from public.semesters s where s.user_id = current_user_id),
    (select count(*) from public.subjects sub where sub.user_id = current_user_id),
    (select coalesce(sum(s.total_credits), 0)::bigint from public.semesters s where s.user_id = current_user_id),
    (select round(avg(s.sgpa), 2) from public.semesters s where s.user_id = current_user_id and s.sgpa is not null),
    public.get_user_cgpa(current_user_id),
    (
      select count(*)
      from public.subjects sub
      where sub.user_id = current_user_id
        and public.normalize_grade(sub.grade) = 'F'
    );
end;
$$;

create or replace function public.get_subject_weighted_average(
  p_user_id uuid,
  p_semester_id uuid,
  p_subject_name text
)
returns numeric
language plpgsql
security invoker
stable
set search_path = public, pg_temp
as $$
declare
  weighted_sum numeric := 0;
  total_weight numeric := 0;
begin
  select
    coalesce(sum(percentage * weightage), 0),
    coalesce(sum(weightage) filter (where percentage is not null), 0)
  into weighted_sum, total_weight
  from public.marks_records
  where user_id = p_user_id
    and semester_id = p_semester_id
    and lower(subject_name) = lower(btrim(p_subject_name))
    and percentage is not null;

  if total_weight > 0 then
    return round(weighted_sum / total_weight, 2);
  end if;

  return null;
end;
$$;

create or replace function public.get_semester_weighted_average(
  p_user_id uuid,
  p_semester_id uuid
)
returns numeric
language plpgsql
security invoker
stable
set search_path = public, pg_temp
as $$
declare
  weighted_sum numeric := 0;
  total_weight numeric := 0;
begin
  select
    coalesce(sum(percentage * weightage), 0),
    coalesce(sum(weightage) filter (where percentage is not null), 0)
  into weighted_sum, total_weight
  from public.marks_records
  where user_id = p_user_id
    and semester_id = p_semester_id
    and percentage is not null;

  if total_weight > 0 then
    return round(weighted_sum / total_weight, 2);
  end if;

  return null;
end;
$$;

create or replace function public.validate_academic_data_consistency()
returns table (
  table_name text,
  issue_type text,
  issue_description text,
  record_id uuid
)
language plpgsql
security invoker
stable
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    return;
  end if;

  return query
  select
    'subjects'::text,
    'invalid_grade_points'::text,
    'Grade points do not match the stored grade letter'::text,
    sub.id
  from public.subjects sub
  where sub.user_id = current_user_id
    and sub.grade_points is distinct from public.grade_to_points(sub.grade);

  return query
  select
    'subjects'::text,
    'semester_user_mismatch'::text,
    'Subject user_id does not match its semester owner'::text,
    sub.id
  from public.subjects sub
  join public.semesters sem on sem.id = sub.semester_id
  where sub.user_id = current_user_id
    and sem.user_id <> sub.user_id;

  return query
  select
    'attendance_records'::text,
    'semester_user_mismatch'::text,
    'Attendance record user_id does not match its semester owner'::text,
    att.id
  from public.attendance_records att
  join public.semesters sem on sem.id = att.semester_id
  where att.user_id = current_user_id
    and sem.user_id <> att.user_id;

  return query
  select
    'marks_records'::text,
    'semester_user_mismatch'::text,
    'Marks record user_id does not match its semester owner'::text,
    mr.id
  from public.marks_records mr
  join public.semesters sem on sem.id = mr.semester_id
  where mr.user_id = current_user_id
    and sem.user_id <> mr.user_id;

  return query
  select
    'semesters'::text,
    'academic_rollup_mismatch'::text,
    'Stored semester SGPA or total_credits does not match subject grades'::text,
    sem.id
  from public.semesters sem
  cross join lateral (
    select
      coalesce(sum(sub.credits), 0)::integer as attempted_credits,
      case
        when coalesce(sum(sub.credits), 0) > 0 then
          round(coalesce(sum(sub.credits * public.grade_to_points(sub.grade)), 0) / sum(sub.credits), 2)
        else null
      end as calculated_sgpa
    from public.subjects sub
    where sub.user_id = sem.user_id
      and sub.semester_id = sem.id
      and sub.is_audit = false
      and public.is_gpa_grade(sub.grade)
  ) calc
  where sem.user_id = current_user_id
    and (
      sem.total_credits is distinct from calc.attempted_credits
      or sem.sgpa is distinct from calc.calculated_sgpa
    );
end;
$$;

create or replace function public.cleanup_orphaned_academic_data()
returns table (
  cleaned_table text,
  records_deleted bigint
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  deleted_subjects bigint := 0;
  deleted_attendance bigint := 0;
  deleted_marks bigint := 0;
begin
  if current_user_id is null then
    return;
  end if;

  delete from public.subjects sub
  where sub.user_id = current_user_id
    and not exists (
      select 1
      from public.semesters sem
      where sem.id = sub.semester_id
        and sem.user_id = sub.user_id
    );
  get diagnostics deleted_subjects = row_count;

  delete from public.attendance_records att
  where att.user_id = current_user_id
    and not exists (
      select 1
      from public.semesters sem
      where sem.id = att.semester_id
        and sem.user_id = att.user_id
    );
  get diagnostics deleted_attendance = row_count;

  delete from public.marks_records mr
  where mr.user_id = current_user_id
    and not exists (
      select 1
      from public.semesters sem
      where sem.id = mr.semester_id
        and sem.user_id = mr.user_id
    );
  get diagnostics deleted_marks = row_count;

  return query
  select 'subjects'::text, deleted_subjects
  union all
  select 'attendance_records'::text, deleted_attendance
  union all
  select 'marks_records'::text, deleted_marks;
end;
$$;

create or replace function public.get_unread_notifications_count(p_user_id uuid)
returns integer
language sql
security invoker
stable
as $$
  select count(*)::integer
  from public.notifications
  where user_id = p_user_id
    and read = false
    and (expires_at is null or expires_at >= now());
$$;

create or replace function public.mark_all_notifications_read(p_user_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  update public.notifications
  set read = true,
      updated_at = now()
  where user_id = p_user_id
    and user_id = auth.uid()
    and read = false;

  return true;
end;
$$;

create or replace function public.clean_expired_notifications()
returns integer
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  deleted_count integer := 0;
begin
  delete from public.notifications
  where expires_at is not null
    and expires_at < now()
    and user_id = auth.uid();

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- ---------------------------------------------------------------------------
-- Views
-- ---------------------------------------------------------------------------

create or replace view public.user_custom_exam_types
with (security_invoker = true)
as
select
  user_id,
  exam_type,
  count(*) as usage_count,
  avg(weightage) as avg_weightage,
  min(weightage) as min_weightage,
  max(weightage) as max_weightage,
  avg(percentage) as avg_performance
from public.marks_records
where user_id = auth.uid()
group by user_id, exam_type;

create or replace view public.subject_weighted_performance
with (security_invoker = true)
as
select
  mr.user_id,
  mr.semester_id,
  sem.number as semester_number,
  mr.subject_name,
  count(*) as total_exams,
  sum(mr.weightage) as total_weight,
  public.get_subject_weighted_average(mr.user_id, mr.semester_id, mr.subject_name) as weighted_average,
  avg(mr.percentage) as simple_average,
  max(mr.percentage) as best_performance,
  min(mr.percentage) as worst_performance
from public.marks_records mr
join public.semesters sem
  on sem.id = mr.semester_id
 and sem.user_id = mr.user_id
where mr.user_id = auth.uid()
group by mr.user_id, mr.semester_id, sem.number, mr.subject_name;

create or replace view public.user_notification_summary
with (security_invoker = true)
as
select
  user_id,
  count(*) as total_notifications,
  count(*) filter (where read = false) as unread_count,
  count(*) filter (where type = 'info') as info_count,
  count(*) filter (where type = 'success') as success_count,
  count(*) filter (where type = 'warning') as warning_count,
  count(*) filter (where type = 'error') as error_count,
  max(created_at) as latest_notification_at
from public.notifications
where user_id = auth.uid()
  and (expires_at is null or expires_at >= now())
group by user_id;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.attendance_records enable row level security;
alter table public.marks_records enable row level security;
alter table public.notifications enable row level security;
alter table public.user_preferences enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (user_id = auth.uid());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using (user_id = auth.uid());

create policy "semesters_crud_own"
  on public.semesters for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "subjects_crud_own"
  on public.subjects for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "attendance_records_crud_own"
  on public.attendance_records for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "marks_records_crud_own"
  on public.marks_records for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_crud_own"
  on public.notifications for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_preferences_crud_own"
  on public.user_preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index idx_profiles_email on public.profiles(email) where email is not null;
create index idx_semesters_user_number on public.semesters(user_id, number);
create index idx_subjects_user_semester on public.subjects(user_id, semester_id);
create index idx_subjects_user_grade on public.subjects(user_id, grade) where grade is not null;
create index idx_attendance_user_semester on public.attendance_records(user_id, semester_id);
create index idx_attendance_user_percentage on public.attendance_records(user_id, percentage);
create index idx_marks_user_semester on public.marks_records(user_id, semester_id);
create index idx_marks_user_exam_type on public.marks_records(user_id, exam_type);
create index idx_marks_exam_date on public.marks_records(user_id, exam_date) where exam_date is not null;
create index idx_marks_percentage on public.marks_records(user_id, percentage) where percentage is not null;
create index idx_notifications_user_unread on public.notifications(user_id, read, created_at desc) where read = false;
create index idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index idx_notifications_expires_at on public.notifications(expires_at) where expires_at is not null;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

revoke all on all tables in schema public from anon;
revoke all on all functions in schema public from anon;

grant select, insert, update, delete on table
  public.profiles,
  public.semesters,
  public.subjects,
  public.attendance_records,
  public.marks_records,
  public.notifications,
  public.user_preferences
to authenticated;

grant select on table
  public.user_custom_exam_types,
  public.subject_weighted_performance,
  public.user_notification_summary
to authenticated;

grant execute on function public.normalize_grade(text) to authenticated;
grant execute on function public.validate_grade_letter(text) to authenticated;
grant execute on function public.is_gpa_grade(text) to authenticated;
grant execute on function public.grade_to_points(text) to authenticated;
grant execute on function public.assessment_weightage_limit(text) to authenticated;
grant execute on function public.validate_assessment_weightage(text, numeric) to authenticated;
grant execute on function public.recalculate_semester_sgpa_for(uuid, uuid) to authenticated;
grant execute on function public.get_user_cgpa(uuid) to authenticated;
grant execute on function public.get_user_academic_summary() to authenticated;
grant execute on function public.get_subject_weighted_average(uuid, uuid, text) to authenticated;
grant execute on function public.get_semester_weighted_average(uuid, uuid) to authenticated;
grant execute on function public.validate_academic_data_consistency() to authenticated;
grant execute on function public.cleanup_orphaned_academic_data() to authenticated;
grant execute on function public.get_unread_notifications_count(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read(uuid) to authenticated;
grant execute on function public.clean_expired_notifications() to authenticated;

-- ---------------------------------------------------------------------------
-- Documentation comments
-- ---------------------------------------------------------------------------

comment on table public.profiles is 'One profile row per Supabase Auth user.';
comment on table public.semesters is 'Per-user semester records. SGPA and total_credits are maintained from subjects.';
comment on table public.subjects is 'Per-semester subjects with IIITM-oriented grade normalization and grade points.';
comment on table public.attendance_records is 'Per-subject attendance totals with generated attendance percentage.';
comment on table public.marks_records is 'Assessment records with optional scheduling and generated raw/weighted percentages.';
comment on table public.notifications is 'Optional persistent notification store; current app can continue using local notifications.';
comment on table public.user_preferences is 'Optional persistent user preferences aligned with the frontend defaults.';

comment on column public.semesters.total_credits is 'GPA-bearing non-audit credits in this semester, recalculated from subjects.';
comment on column public.subjects.grade is 'Normalized grade. GPA grades are A, A-, B, B-, C, C-, D, F. Non-GPA statuses are I, S, X, NP, NF.';
comment on column public.subjects.is_audit is 'Audit courses are excluded from SGPA/CGPA and credit rollups.';
comment on column public.attendance_records.percentage is 'Generated percentage. Returns 0 when total_classes is 0.';
comment on column public.marks_records.percentage is 'Generated raw percentage. Returns NULL when total_marks is 0.';
comment on column public.marks_records.weightage is 'Assessment weightage percent, capped by assessment_weightage_limit(exam_type).';
comment on column public.marks_records.weighted_percentage is 'Generated weighted percentage contribution from obtained_marks, total_marks, and weightage.';
