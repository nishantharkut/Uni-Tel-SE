create table public.marks_records (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  semester_id uuid not null,
  subject_name text not null,
  exam_type text not null,
  total_marks integer not null,
  obtained_marks integer not null,
  percentage numeric GENERATED ALWAYS as (
    round(
      (
        (
          (obtained_marks)::numeric / (total_marks)::numeric
        ) * (100)::numeric
      ),
      2
    )
  ) STORED (5, 2) null,
  source_json_import boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  weightage numeric(5, 2) null default 100.00,
  weighted_percentage numeric GENERATED ALWAYS as (
    round(
      (
        (
          (
            (
              (obtained_marks)::numeric / (total_marks)::numeric
            ) * (100)::numeric
          ) * weightage
        ) / (100)::numeric
      ),
      2
    )
  ) STORED (5, 2) null,
  constraint marks_records_pkey primary key (id),
  constraint marks_records_semester_id_fkey foreign KEY (semester_id) references semesters (id) on delete CASCADE,
  constraint marks_records_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint check_marks_subject_name_not_empty check (
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
  constraint check_weightage_range check (
    (
      (weightage >= (0)::numeric)
      and (weightage <= (100)::numeric)
    )
  ),
  constraint check_exam_type_length check (
    (
      (
        length(
          TRIM(
            both
            from
              exam_type
          )
        ) >= 1
      )
      and (
        length(
          TRIM(
            both
            from
              exam_type
          )
        ) <= 50
      )
    )
  ),
  constraint marks_records_obtained_marks_check check ((obtained_marks >= 0)),
  constraint marks_records_total_marks_check check ((total_marks > 0)),
  constraint marks_records_check check ((obtained_marks <= total_marks)),
  constraint check_marks_percentage_range check (
    (
      (percentage is null)
      or (
        (percentage >= (0)::numeric)
        and (percentage <= (100)::numeric)
      )
    )
  ),
  constraint check_marks_range check (
    (
      (total_marks > 0)
      and (obtained_marks >= 0)
      and (obtained_marks <= total_marks)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_marks_user_semester on public.marks_records using btree (user_id, semester_id) TABLESPACE pg_default;

create index IF not exists idx_marks_weightage on public.marks_records using btree (weightage) TABLESPACE pg_default;

create index IF not exists idx_marks_weighted_percentage on public.marks_records using btree (weighted_percentage) TABLESPACE pg_default;

create index IF not exists idx_marks_user_exam_type on public.marks_records using btree (user_id, exam_type) TABLESPACE pg_default;

create index IF not exists idx_marks_percentage on public.marks_records using btree (percentage) TABLESPACE pg_default
where
  (percentage is not null);

create index IF not exists idx_marks_created_at on public.marks_records using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_marks_subject_name on public.marks_records using btree (subject_name) TABLESPACE pg_default;

create index IF not exists idx_marks_exam_type on public.marks_records using btree (exam_type) TABLESPACE pg_default;

create index IF not exists idx_marks_user_percentage on public.marks_records using btree (user_id, percentage) TABLESPACE pg_default
where
  (percentage is not null);

create index IF not exists idx_marks_excellent on public.marks_records using btree (user_id, semester_id) TABLESPACE pg_default
where
  (percentage >= (90)::numeric);