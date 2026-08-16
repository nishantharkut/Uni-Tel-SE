create table public.subjects (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  semester_id uuid not null,
  name text not null,
  credits integer not null,
  grade text null,
  grade_points numeric(3, 1) null,
  source_json_import boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint subjects_pkey primary key (id),
  constraint subjects_user_id_semester_id_name_key unique (user_id, semester_id, name),
  constraint subjects_semester_id_fkey foreign KEY (semester_id) references semesters (id) on delete CASCADE,
  constraint subjects_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint subjects_credits_check check (
    (
      (credits >= 1)
      and (credits <= 6)
    )
  ),
  constraint subjects_grade_check check (
    (
      grade = any (
        array[
          'A'::text,
          'A-'::text,
          'B'::text,
          'B-'::text,
          'C'::text,
          'C-'::text,
          'D'::text,
          'E'::text,
          'F'::text,
          'I'::text
        ]
      )
    )
  ),
  constraint check_subject_name_not_empty check (
    (
      length(
        TRIM(
          both
          from
            name
        )
      ) > 0
    )
  ),
  constraint check_grade_points_range check (
    (
      (grade_points is null)
      or (
        (grade_points >= (0)::numeric)
        and (grade_points <= (10)::numeric)
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_subjects_user_semester on public.subjects using btree (user_id, semester_id) TABLESPACE pg_default;

create index IF not exists idx_subjects_grade on public.subjects using btree (grade) TABLESPACE pg_default
where
  (grade is not null);

create index IF not exists idx_subjects_grade_points on public.subjects using btree (grade_points) TABLESPACE pg_default
where
  (grade_points is not null);

create index IF not exists idx_subjects_name on public.subjects using btree (name) TABLESPACE pg_default;

create index IF not exists idx_subjects_user_grade on public.subjects using btree (user_id, grade) TABLESPACE pg_default
where
  (grade is not null);

create index IF not exists idx_subjects_backlogs on public.subjects using btree (user_id, semester_id) TABLESPACE pg_default
where
  (
    grade = any (array['E'::text, 'F'::text, 'I'::text])
  );

create trigger subjects_grade_points_trigger BEFORE INSERT
or
update OF grade on subjects for EACH row
execute FUNCTION set_grade_points ();

create trigger subjects_update_sgpa_trigger
after INSERT
or DELETE
or
update on subjects for EACH row
execute FUNCTION update_semester_sgpa ();