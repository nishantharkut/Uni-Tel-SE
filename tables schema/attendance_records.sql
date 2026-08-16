create table public.attendance_records (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  semester_id uuid not null,
  subject_name text not null,
  total_classes integer null default 0,
  attended_classes integer null default 0,
  percentage numeric GENERATED ALWAYS as (
    case
      when (total_classes > 0) then round(
        (
          (
            (attended_classes)::numeric / (total_classes)::numeric
          ) * (100)::numeric
        ),
        2
      )
      else (0)::numeric
    end
  ) STORED (5, 2) null,
  note text null,
  source_json_import boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint attendance_records_pkey primary key (id),
  constraint attendance_records_user_id_semester_id_subject_name_key unique (user_id, semester_id, subject_name),
  constraint attendance_records_semester_id_fkey foreign KEY (semester_id) references semesters (id) on delete CASCADE,
  constraint attendance_records_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint check_attendance_subject_name_not_empty check (
    (
      length(
        TRIM(
          both
          from
            subject_name
        )
      ) > 0
    )
  ),
  constraint attendance_records_attended_classes_check check ((attended_classes >= 0)),
  constraint check_note_length check (
    (
      (note is null)
      or (length(note) <= 1000)
    )
  ),
  constraint attendance_records_check check ((attended_classes <= total_classes)),
  constraint attendance_records_total_classes_check check ((total_classes >= 0)),
  constraint check_attendance_percentage_range check (
    (
      (percentage is null)
      or (
        (percentage >= (0)::numeric)
        and (percentage <= (100)::numeric)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_attendance_user_semester on public.attendance_records using btree (user_id, semester_id) TABLESPACE pg_default;

create index IF not exists idx_attendance_percentage on public.attendance_records using btree (percentage) TABLESPACE pg_default
where
  (percentage is not null);

create index IF not exists idx_attendance_created_at on public.attendance_records using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_attendance_subject_name on public.attendance_records using btree (subject_name) TABLESPACE pg_default;

create index IF not exists idx_attendance_user_percentage on public.attendance_records using btree (user_id, percentage) TABLESPACE pg_default
where
  (percentage is not null);

create index IF not exists idx_attendance_critical on public.attendance_records using btree (user_id, semester_id) TABLESPACE pg_default
where
  (percentage < (65)::numeric);