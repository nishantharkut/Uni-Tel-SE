-- UNI-TEL fresh Supabase baseline schema.
--
-- This migration is intended for a new Supabase project. It replaces the
-- imported patch-style SQL history with one deterministic database foundation.
-- It creates the complete application contract: profiles, academic records,
-- optional persistent preferences/notifications, RLS, academic calculation RPCs,
-- validation helpers, triggers, views, grants, and indexes.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Academic rule helpers
-- ---------------------------------------------------------------------------

create or replace function public.normalize_grade(grade_letter text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when grade_letter is null then null
    when upper(trim(grade_letter)) = '' then null
    when upper(trim(grade_letter)) = 'A(-)' then 'A-'
    when upper(trim(grade_letter)) = 'B(-)' then 'B-'
    when upper(trim(grade_letter)) = 'C(-)' then 'C-'
    else upper(trim(grade_letter))
  end;
$$;

create or replace function public.validate_grade_letter(letter text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(public.normalize_grade(letter) in (
    'A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F',
    'I', 'S', 'X', 'NP', 'NF'
  ), false);
$$;

create or replace function public.is_gpa_grade(letter text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select coalesce(public.normalize_grade(letter) in (
    'A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'F'
  ), false);
$$;

create or replace function public.grade_to_points(grade_letter text)
returns numeric
language sql
immutable
set search_path = public, pg_temp
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
set search_path = public, pg_temp
as $$
  select case
    when lower(trim(coalesce(exam_type, ''))) like '%minor%' then 30.0
    when lower(trim(coalesce(exam_type, ''))) like '%mid%' then 30.0
    when lower(trim(coalesce(exam_type, ''))) like '%major%' then 50.0
    when lower(trim(coalesce(exam_type, ''))) like '%end%' then 50.0
    else 30.0
  end;
$$;

create or replace function public.validate_assessment_weightage(exam_type text, weightage numeric)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select weightage is null
    or (
      weightage >= 0
      and weightage <= public.assessment_weightage_limit(exam_type)
    );
$$;

-- ---------------------------------------------------------------------------
-- Core tables
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
  constraint profiles_role_check
    check (role in ('student', 'graduate', 'researcher', 'faculty', 'admin')),
  constraint profiles_full_name_check
    check (full_name is null or length(trim(full_name)) between 1 and 200),
  constraint profiles_college_check
    check (college is null or length(trim(college)) between 1 and 200),
  constraint profiles_updated_after_created_check
    check (updated_at >= created_at)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  grade_scale text not null default '10-point',
  attendance_warning_threshold integer not null default 75,
  cgpa_target numeric(4,2) not null default 8.50,
  exam_reminder_days integer not null default 7,
  attendance_warnings_enabled boolean not null default true,
  grade_updates_enabled boolean not null default true,
  exam_reminders_enabled boolean not null default true,
  data_health_alerts_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_preferences_grade_scale_check
    check (grade_scale in ('10-point', '4-point', 'percentage')),
  constraint user_preferences_attendance_threshold_check
    check (attendance_warning_threshold between 50 and 95),
  constraint user_preferences_cgpa_target_check
    check (cgpa_target >= 0 and cgpa_target <= 10),
  constraint user_preferences_exam_reminder_days_check
    check (exam_reminder_days between 0 and 30),
  constraint user_preferences_updated_after_created_check
    check (updated_at >= created_at)
);

create table public.semesters (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number integer not null,
  sgpa numeric(4,2),
  total_credits integer not null default 0,
  source_json_import boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint semesters_number_check
    check (number between 1 and 12),
  constraint semesters_sgpa_check
    check (sgpa is null or (sgpa >= 0 and sgpa <= 10)),
  constraint semesters_total_credits_check
    check (total_credits >= 0),
  constraint semesters_updated_after_created_check
    check (updated_at >= created_at),
  constraint semesters_user_number_key
    unique (user_id, number),
  constraint semesters_id_user_id_key
    unique (id, user_id)
);

create table public.subjects (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null,
  name text not null,
  credits integer not null,
  grade text,
  grade_points numeric(3,1) generated always as (public.grade_to_points(grade)) stored,
  is_backlog boolean generated always as (grade = 'F') stored,
  is_audit boolean not null default false,
  source_json_import boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subjects_semester_owner_fkey
    foreign key (semester_id, user_id)
    references public.semesters(id, user_id)
    on delete cascade,
  constraint subjects_name_check
    check (length(trim(name)) between 1 and 200),
  constraint subjects_credits_check
    check (credits between 1 and 6),
  constraint subjects_grade_check
    check (grade is null or public.validate_grade_letter(grade)),
  constraint subjects_updated_after_created_check
    check (updated_at >= created_at),
  constraint subjects_user_semester_name_key
    unique (user_id, semester_id, name)
);

create table public.attendance_records (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null,
  subject_name text not null,
  total_classes integer not null default 0,
  attended_classes integer not null default 0,
  percentage numeric(5,2) generated always as (
    case
      when total_classes > 0 then
        round((attended_classes::numeric / total_classes::numeric) * 100, 2)
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
  constraint attendance_records_subject_name_check
    check (length(trim(subject_name)) between 1 and 200),
  constraint attendance_records_total_classes_check
    check (total_classes >= 0),
  constraint attendance_records_attended_classes_check
    check (attended_classes >= 0 and attended_classes <= total_classes),
  constraint attendance_records_percentage_check
    check (percentage >= 0 and percentage <= 100),
  constraint attendance_records_note_length_check
    check (note is null or length(note) <= 1000),
  constraint attendance_records_updated_after_created_check
    check (updated_at >= created_at),
  constraint attendance_records_user_semester_subject_key
    unique (user_id, semester_id, subject_name)
);

create table public.marks_records (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_id uuid not null,
  subject_name text not null,
  exam_type text not null,
  total_marks integer not null default 0,
  obtained_marks integer not null default 0,
  percentage numeric(5,2) generated always as (
    case
      when total_marks > 0 then
        round((obtained_marks::numeric / total_marks::numeric) * 100, 2)
      else null
    end
  ) stored,
  weightage numeric(5,2) not null default 30.00,
  weighted_percentage numeric(5,2) generated always as (
    case
      when total_marks > 0 then
        round(((obtained_marks::numeric / total_marks::numeric) * 100 * weightage / 100), 2)
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
  constraint marks_records_subject_name_check
    check (length(trim(subject_name)) between 1 and 200),
  constraint marks_records_exam_type_check
    check (length(trim(exam_type)) between 2 and 100),
  constraint marks_records_marks_check
    check (
      total_marks >= 0
      and obtained_marks >= 0
      and (
        (total_marks = 0 and obtained_marks = 0)
        or (total_marks > 0 and obtained_marks <= total_marks)
      )
    ),
  constraint marks_records_percentage_check
    check (percentage is null or (percentage >= 0 and percentage <= 100)),
  constraint marks_records_weightage_check
    check (weightage >= 0 and weightage <= public.assessment_weightage_limit(exam_type)),
  constraint marks_records_weighted_percentage_check
    check (weighted_percentage is null or (weighted_percentage >= 0 and weighted_percentage <= 100)),
  constraint marks_records_updated_after_created_check
    check (updated_at >= created_at),
  constraint marks_records_user_semester_subject_exam_key
    unique (user_id, semester_id, subject_name, exam_type)
);

create table public.notifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  action_url text,
  action_text text,
  read boolean not null default false,
  source text not null default 'manual',
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notifications_title_check
    check (length(trim(title)) between 1 and 160),
  constraint notifications_message_check
    check (length(trim(message)) between 1 and 1000),
  constraint notifications_type_check
    check (type in ('info', 'success', 'warning', 'error')),
  constraint notifications_source_check
    check (source in ('manual', 'academic-alert', 'system')),
  constraint notifications_action_url_check
    check (action_url is null or length(trim(action_url)) between 1 and 500),
  constraint notifications_action_text_check
    check (action_text is null or length(trim(action_text)) between 1 and 80),
  constraint notifications_metadata_object_check
    check (jsonb_typeof(metadata) = 'object'),
  constraint notifications_updated_after_created_check
    check (updated_at >= created_at)
);

-- ---------------------------------------------------------------------------
-- Row normalization and timestamp triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.normalize_profile_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.email := nullif(trim(new.email), '');
  new.full_name := nullif(trim(new.full_name), '');
  new.college := nullif(trim(new.college), '');
  new.role := lower(nullif(trim(new.role), ''));
  new.avatar_url := nullif(trim(new.avatar_url), '');

  if new.role is null then
    new.role := 'student';
  end if;

  return new;
end;
$$;

create or replace function public.normalize_subject_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.name := trim(new.name);
  new.grade := public.normalize_grade(new.grade);
  return new;
end;
$$;

create or replace function public.normalize_attendance_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.subject_name := trim(new.subject_name);
  new.note := nullif(trim(new.note), '');
  return new;
end;
$$;

create or replace function public.normalize_marks_row()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.subject_name := trim(new.subject_name);
  new.exam_type := trim(new.exam_type);
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
    new.sgpa := null;
    new.total_credits := 0;
  elsif coalesce(current_setting('uni_tel.recalculating_semester_rollup', true), 'off') <> 'on' then
    new.sgpa := old.sgpa;
    new.total_credits := old.total_credits;
  end if;

  return new;
end;
$$;

create trigger profiles_normalize_before_write
  before insert or update on public.profiles
  for each row execute function public.normalize_profile_row();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

create trigger subjects_normalize_before_write
  before insert or update on public.subjects
  for each row execute function public.normalize_subject_row();

create trigger subjects_set_updated_at
  before update on public.subjects
  for each row execute function public.set_updated_at();

create trigger attendance_records_normalize_before_write
  before insert or update on public.attendance_records
  for each row execute function public.normalize_attendance_row();

create trigger attendance_records_set_updated_at
  before update on public.attendance_records
  for each row execute function public.set_updated_at();

create trigger marks_records_normalize_before_write
  before insert or update on public.marks_records
  for each row execute function public.normalize_marks_row();

create trigger marks_records_set_updated_at
  before update on public.marks_records
  for each row execute function public.set_updated_at();

create trigger semesters_protect_rollup_before_write
  before insert or update on public.semesters
  for each row execute function public.protect_semester_rollup_row();

create trigger semesters_set_updated_at
  before update on public.semesters
  for each row execute function public.set_updated_at();

create trigger notifications_set_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Profile/preferences bootstrap from Supabase Auth
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (
    user_id,
    email,
    full_name,
    college,
    role,
    avatar_url
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), 'User'),
    coalesce(new.raw_user_meta_data ->> 'college', 'University'),
    coalesce(new.raw_user_meta_data ->> 'role', 'student'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- Academic aggregate maintenance
-- ---------------------------------------------------------------------------

create or replace function public.recalculate_semester_sgpa_for(sem_id uuid, usr_id uuid)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  total_credits_sum integer;
  weighted_points numeric;
  calculated_sgpa numeric;
begin
  select
    coalesce(sum(credits), 0)::integer,
    coalesce(sum(credits * grade_points), 0)
  into total_credits_sum, weighted_points
  from public.subjects
  where semester_id = sem_id
    and user_id = usr_id
    and is_audit = false
    and grade_points is not null;

  if total_credits_sum > 0 then
    calculated_sgpa := round(weighted_points / total_credits_sum, 2);
  else
    calculated_sgpa := null;
  end if;

  perform set_config('uni_tel.recalculating_semester_rollup', 'on', true);

  begin
    update public.semesters
    set total_credits = total_credits_sum,
        sgpa = calculated_sgpa,
        updated_at = now()
    where id = sem_id
      and user_id = usr_id;
  exception
    when others then
      perform set_config('uni_tel.recalculating_semester_rollup', 'off', true);
      raise;
  end;

  perform set_config('uni_tel.recalculating_semester_rollup', 'off', true);
end;
$$;

create or replace function public.refresh_semester_after_subject_change()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    perform public.recalculate_semester_sgpa_for(new.semester_id, new.user_id);
    return new;
  end if;

  if tg_op = 'DELETE' then
    perform public.recalculate_semester_sgpa_for(old.semester_id, old.user_id);
    return old;
  end if;

  if old.semester_id is distinct from new.semester_id
     or old.user_id is distinct from new.user_id then
    perform public.recalculate_semester_sgpa_for(old.semester_id, old.user_id);
  end if;

  perform public.recalculate_semester_sgpa_for(new.semester_id, new.user_id);
  return new;
end;
$$;

create trigger subjects_refresh_semester_after_write
  after insert or update or delete on public.subjects
  for each row execute function public.refresh_semester_after_subject_change();

create or replace function public.get_user_cgpa(target_user_id uuid)
returns numeric
language plpgsql
security invoker
stable
set search_path = public, pg_temp
as $$
declare
  total_credits_sum numeric;
  weighted_points numeric;
begin
  if target_user_id is null then
    return null;
  end if;

  select
    coalesce(sum(credits), 0),
    coalesce(sum(credits * grade_points), 0)
  into total_credits_sum, weighted_points
  from public.subjects
  where user_id = target_user_id
    and is_audit = false
    and grade_points is not null;

  if total_credits_sum > 0 then
    return round(weighted_points / total_credits_sum, 2);
  end if;

  return null;
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
begin
  if auth.uid() is null then
    return;
  end if;

  return query
  with semester_stats as (
    select
      count(*)::bigint as total_semesters,
      coalesce(sum(s.total_credits), 0)::bigint as total_credits,
      round(avg(s.sgpa), 2) as average_sgpa
    from public.semesters s
    where s.user_id = auth.uid()
  ),
  subject_stats as (
    select
      count(*)::bigint as total_subjects,
      count(*) filter (where sub.grade = 'F')::bigint as backlogs
    from public.subjects sub
    where sub.user_id = auth.uid()
  )
  select
    auth.uid() as user_id,
    semester_stats.total_semesters,
    subject_stats.total_subjects,
    semester_stats.total_credits,
    semester_stats.average_sgpa,
    public.get_user_cgpa(auth.uid()) as cgpa,
    subject_stats.backlogs
  from semester_stats
  cross join subject_stats;
end;
$$;

-- ---------------------------------------------------------------------------
-- Marks aggregate helpers and views
-- ---------------------------------------------------------------------------

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
  weighted_sum numeric;
  total_weight numeric;
begin
  select
    coalesce(sum(percentage * weightage), 0),
    coalesce(sum(weightage), 0)
  into weighted_sum, total_weight
  from public.marks_records
  where user_id = p_user_id
    and semester_id = p_semester_id
    and lower(trim(subject_name)) = lower(trim(p_subject_name))
    and percentage is not null
    and weightage > 0;

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
  weighted_sum numeric;
  total_weight numeric;
begin
  select
    coalesce(sum(percentage * weightage), 0),
    coalesce(sum(weightage), 0)
  into weighted_sum, total_weight
  from public.marks_records
  where user_id = p_user_id
    and semester_id = p_semester_id
    and percentage is not null
    and weightage > 0;

  if total_weight > 0 then
    return round(weighted_sum / total_weight, 2);
  end if;

  return null;
end;
$$;

create view public.user_custom_exam_types as
select
  user_id,
  exam_type,
  count(*)::bigint as usage_count,
  round(avg(weightage), 2) as avg_weightage,
  min(weightage) as min_weightage,
  max(weightage) as max_weightage,
  round(avg(percentage), 2) as avg_performance
from public.marks_records
where user_id = auth.uid()
group by user_id, exam_type;

create view public.subject_weighted_performance as
select
  mr.user_id,
  mr.semester_id,
  s.number as semester_number,
  mr.subject_name,
  count(*)::bigint as total_exams,
  coalesce(sum(mr.weightage), 0) as total_weight,
  public.get_subject_weighted_average(mr.user_id, mr.semester_id, mr.subject_name) as weighted_average,
  round(avg(mr.percentage), 2) as simple_average,
  max(mr.percentage) as best_performance,
  min(mr.percentage) as worst_performance
from public.marks_records mr
join public.semesters s
  on s.id = mr.semester_id
 and s.user_id = mr.user_id
where mr.user_id = auth.uid()
group by mr.user_id, mr.semester_id, s.number, mr.subject_name;

alter view public.user_custom_exam_types set (security_invoker = true);
alter view public.subject_weighted_performance set (security_invoker = true);

-- ---------------------------------------------------------------------------
-- Data health and cleanup RPCs
-- ---------------------------------------------------------------------------

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
begin
  return query
  select
    'subjects'::text,
    'semester_user_mismatch'::text,
    'Subject user_id does not match its semester owner.'::text,
    sub.id
  from public.subjects sub
  join public.semesters s on s.id = sub.semester_id
  where sub.user_id = auth.uid()
    and sub.user_id <> s.user_id;

  return query
  select
    'attendance_records'::text,
    'semester_user_mismatch'::text,
    'Attendance record user_id does not match its semester owner.'::text,
    att.id
  from public.attendance_records att
  join public.semesters s on s.id = att.semester_id
  where att.user_id = auth.uid()
    and att.user_id <> s.user_id;

  return query
  select
    'marks_records'::text,
    'semester_user_mismatch'::text,
    'Marks record user_id does not match its semester owner.'::text,
    mr.id
  from public.marks_records mr
  join public.semesters s on s.id = mr.semester_id
  where mr.user_id = auth.uid()
    and mr.user_id <> s.user_id;

  return query
  select
    'subjects'::text,
    'invalid_grade_points'::text,
    'Generated grade points do not match the stored grade.'::text,
    sub.id
  from public.subjects sub
  where sub.user_id = auth.uid()
    and sub.grade_points is distinct from public.grade_to_points(sub.grade);

  return query
  select
    'semesters'::text,
    'academic_rollup_mismatch'::text,
    'Stored SGPA or total_credits differs from recalculated subject grade points.'::text,
    s.id
  from public.semesters s
  left join lateral (
    select
      coalesce(sum(sub.credits), 0)::integer as expected_credits,
      case
        when coalesce(sum(sub.credits), 0) > 0 then
          round(coalesce(sum(sub.credits * sub.grade_points), 0) / sum(sub.credits), 2)
        else null
      end as expected_sgpa
    from public.subjects sub
    where sub.user_id = s.user_id
      and sub.semester_id = s.id
      and sub.is_audit = false
      and sub.grade_points is not null
  ) expected on true
  where s.user_id = auth.uid()
    and (
      s.total_credits is distinct from expected.expected_credits
      or s.sgpa is distinct from expected.expected_sgpa
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
  deleted_subjects bigint := 0;
  deleted_attendance bigint := 0;
  deleted_marks bigint := 0;
begin
  delete from public.subjects sub
  where sub.user_id = auth.uid()
    and not exists (
      select 1
      from public.semesters s
      where s.id = sub.semester_id
        and s.user_id = sub.user_id
    );
  get diagnostics deleted_subjects = row_count;

  delete from public.attendance_records att
  where att.user_id = auth.uid()
    and not exists (
      select 1
      from public.semesters s
      where s.id = att.semester_id
        and s.user_id = att.user_id
    );
  get diagnostics deleted_attendance = row_count;

  delete from public.marks_records mr
  where mr.user_id = auth.uid()
    and not exists (
      select 1
      from public.semesters s
      where s.id = mr.semester_id
        and s.user_id = mr.user_id
    );
  get diagnostics deleted_marks = row_count;

  return query
  values
    ('subjects'::text, deleted_subjects),
    ('attendance_records'::text, deleted_attendance),
    ('marks_records'::text, deleted_marks);
end;
$$;

-- ---------------------------------------------------------------------------
-- Notification helpers and views
-- ---------------------------------------------------------------------------

create or replace function public.get_unread_notification_count()
returns bigint
language sql
security invoker
stable
set search_path = public, pg_temp
as $$
  select count(*)::bigint
  from public.notifications
  where user_id = auth.uid()
    and read = false
    and (expires_at is null or expires_at > now());
$$;

create or replace function public.mark_all_notifications_read()
returns bigint
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  updated_count bigint;
begin
  update public.notifications
  set read = true,
      updated_at = now()
  where user_id = auth.uid()
    and read = false;

  get diagnostics updated_count = row_count;
  return updated_count;
end;
$$;

create view public.user_notification_summary as
select
  auth.uid() as user_id,
  count(n.id)::bigint as total_notifications,
  count(n.id) filter (where n.read = false)::bigint as unread_notifications,
  max(n.created_at) as latest_notification_at
from public.notifications n
where n.user_id = auth.uid()
  and (n.expires_at is null or n.expires_at > now());

alter view public.user_notification_summary set (security_invoker = true);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.semesters enable row level security;
alter table public.subjects enable row level security;
alter table public.attendance_records enable row level security;
alter table public.marks_records enable row level security;
alter table public.notifications enable row level security;

create policy profiles_own_rows
  on public.profiles
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy user_preferences_own_rows
  on public.user_preferences
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy semesters_own_rows
  on public.semesters
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy subjects_own_rows
  on public.subjects
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy attendance_records_own_rows
  on public.attendance_records
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy marks_records_own_rows
  on public.marks_records
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_own_rows
  on public.notifications
  for all
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
create index idx_subjects_user_backlog on public.subjects(user_id, semester_id) where is_backlog;
create index idx_attendance_user_semester on public.attendance_records(user_id, semester_id);
create index idx_attendance_user_percentage on public.attendance_records(user_id, percentage);
create index idx_marks_user_semester on public.marks_records(user_id, semester_id);
create index idx_marks_user_exam_type on public.marks_records(user_id, exam_type);
create index idx_marks_user_exam_date on public.marks_records(user_id, exam_date) where exam_date is not null;
create index idx_marks_user_weightage on public.marks_records(user_id, weightage);
create index idx_notifications_user_read_created on public.notifications(user_id, read, created_at desc);
create index idx_notifications_user_expires on public.notifications(user_id, expires_at) where expires_at is not null;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.user_preferences,
  public.semesters,
  public.subjects,
  public.attendance_records,
  public.marks_records,
  public.notifications
to authenticated;

grant select on
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
grant execute on function public.get_unread_notification_count() to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

-- ---------------------------------------------------------------------------
-- Documentation comments
-- ---------------------------------------------------------------------------

comment on table public.profiles is 'One profile per Supabase Auth user.';
comment on table public.user_preferences is 'Optional backend persistence for academic display and notification preferences.';
comment on table public.semesters is 'Per-user semester records. SGPA and total_credits are maintained from subjects.';
comment on table public.subjects is 'Per-semester subjects with IIITM-style GPA grades and generated grade points.';
comment on table public.attendance_records is 'Subject-level attendance totals with generated percentage.';
comment on table public.marks_records is 'Assessment marks with weightage, optional exam schedule, and generated percentages.';
comment on table public.notifications is 'Optional persistent notification store for manual and generated academic alerts.';

comment on column public.subjects.grade is 'Allowed GPA grades: A, A-, B, B-, C, C-, D, F. Allowed non-GPA statuses: I, S, X, NP, NF.';
comment on column public.subjects.grade_points is 'Generated from grade. Non-GPA statuses return NULL and are excluded from SGPA/CGPA.';
comment on column public.subjects.is_audit is 'Audit courses are excluded from SGPA, CGPA, and semester credit rollups.';
comment on column public.semesters.sgpa is 'Maintained by subjects_refresh_semester_after_write using GPA-grade subjects only.';
comment on column public.semesters.total_credits is 'Maintained with SGPA; counts GPA-grade subject credits only.';
comment on column public.attendance_records.percentage is 'Generated attendance percentage. Returns 0 when total_classes is 0.';
comment on column public.marks_records.percentage is 'Generated marks percentage. Returns NULL when total_marks is 0.';
comment on column public.marks_records.weightage is 'Assessment weightage. Minor/mid and internal/default assessments are capped at 30; major/end assessments are capped at 50.';
comment on column public.marks_records.weighted_percentage is 'Generated contribution percentage: marks percentage multiplied by weightage / 100.';
comment on function public.get_user_academic_summary() is 'Returns the authenticated user academic summary row; returns no rows for unauthenticated callers.';
comment on function public.validate_academic_data_consistency() is 'Reports data consistency anomalies visible to the authenticated user.';
comment on function public.cleanup_orphaned_academic_data() is 'Best-effort cleanup RPC retained for app compatibility; fresh schema FKs prevent normal orphan creation.';
