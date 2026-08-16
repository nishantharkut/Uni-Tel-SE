# Fresh Supabase Foundation Design

## Context

UNI-TEL is moving to a new Supabase project with no live production data. The existing SQL history is a patch stack imported from earlier project work: it has duplicated table snapshots, root-level migration files, stale analytics RPCs, contradictory grade and marks constraints, seed statements, and at least one syntax error. That history is not a reliable zero-to-latest database bootstrap.

The database foundation must therefore be rebuilt as one clean baseline migration that matches the current application contract and IIITM-oriented academic rules used in the frontend.

## Goals

- Provide a fresh Supabase schema that can be applied to an empty project from scratch.
- Preserve the current application table and RPC contract.
- Enforce user isolation with Row-Level Security on every user-owned table.
- Prevent cross-user child records through database constraints, not only RLS.
- Keep SGPA, CGPA, attendance percentage, marks percentage, and weighted marks calculations deterministic.
- Remove stale migration snapshots that could mislead setup or documentation.
- Document the Supabase setup path for a new project.

## Non-goals

- No live Supabase project mutation from this workstation.
- No CI/CD workflow changes.
- No committed test harness or test infrastructure.
- No analytics RPCs that were already replaced by client-side analytics calculations.
- No sample or demo data inside production migrations.

## Recommended approach

Use a single authoritative baseline migration:

`supabase/migrations/20260817000000_initial_schema.sql`

Delete the old patch-style migrations and loose SQL snapshots. The repository should have one source of truth for a fresh Supabase database: the migration directory. Documentation can explain that earlier imported SQL files were intentionally removed because the new project has no live migration continuity requirement.

## Schema design

### Tables

| Table | Purpose |
| --- | --- |
| `profiles` | One profile row per Supabase Auth user. |
| `semesters` | Per-user semester records, unique by semester number. |
| `subjects` | Per-semester courses with credits and grade state. |
| `attendance_records` | Per-subject attendance totals and generated attendance percentage. |
| `marks_records` | Assessment marks, weightage, optional schedule, and generated percentages. |
| `notifications` | Optional persistent notification storage for future backend-backed notifications. |
| `user_preferences` | Optional persistent academic/user settings for future backend-backed preferences. |

### Academic rules

- GPA grades: `A`, `A-`, `B`, `B-`, `C`, `C-`, `D`, `F`.
- Grade points: `10`, `9`, `8`, `7`, `6`, `5`, `4`, `0`.
- Non-GPA statuses may be stored for completeness: `I`, `S`, `X`, `NP`, `NF`.
- SGPA and CGPA include only GPA-grade subjects with positive credits.
- `F` contributes zero grade points and remains a backlog.
- Attendance percentage is generated from `attended_classes / total_classes`, returning `0` when no classes are recorded.
- Marks percentage is generated from `obtained_marks / total_marks`, returning `NULL` when `total_marks = 0`.
- Weightage limits follow the frontend domain rule:
  - exam type containing `minor` or `mid`: max `30`
  - exam type containing `major` or `end`: max `50`
  - all other assessment types: max `30`

### Relationships and ownership

Every user-owned child table stores `user_id`. Child records reference `semesters` through a composite foreign key `(semester_id, user_id)` to prevent a row from claiming one user while pointing to another user's semester.

Required constraints:

- `semesters`: unique `(user_id, number)`, number `1..12`.
- `subjects`: unique `(user_id, semester_id, name)`, credits `1..6`, valid grades only.
- `attendance_records`: unique `(user_id, semester_id, subject_name)`, attended classes cannot exceed total classes.
- `marks_records`: unique `(user_id, semester_id, subject_name, exam_type)`, non-negative marks, optional zero-total placeholder allowed only with zero obtained marks.
- text fields trim to non-empty where required.

### Functions and views

The baseline migration must define the RPCs currently used or useful for typed compatibility:

- `validate_grade_letter(text)`
- `grade_to_points(text)`
- `assessment_weightage_limit(text)`
- `recalculate_semester_sgpa_for(uuid, uuid)`
- `get_user_cgpa(uuid)`
- `get_user_academic_summary()`
- `validate_academic_data_consistency()`
- `cleanup_orphaned_academic_data()`
- `get_subject_weighted_average(uuid, uuid, text)`
- `get_semester_weighted_average(uuid, uuid)`
- notification helper functions for unread count and bulk read state

Views should be `security_invoker = true` and only expose caller-owned records through RLS:

- `user_custom_exam_types`
- `subject_weighted_performance`
- `user_notification_summary`

### RLS design

Enable RLS on every user-owned table.

Policies:

- `profiles`: authenticated users can select, insert, update, and delete only their own profile.
- `semesters`, `subjects`, `attendance_records`, `marks_records`: authenticated users can perform CRUD only where `user_id = auth.uid()`.
- `notifications` and `user_preferences`: authenticated users can perform CRUD only on their own rows.

Database functions should use `SECURITY INVOKER` unless a trigger requires elevated access. The auth-user profile creation trigger may use `SECURITY DEFINER` with a fixed `search_path`.

### TypeScript compatibility

`src/integrations/supabase/types.ts` must be aligned manually in this PR because there is no connected live Supabase project yet. It must include:

- added `marks_records` columns: `weightage`, `weighted_percentage`, `exam_date`, `exam_time`
- new `notifications` and `user_preferences` tables
- summary and validation RPC signatures
- weighted-performance views

The current service-level interfaces in `src/services/academicService.ts` should continue to compile without functional changes.

## Documentation design

Add `docs/database/supabase-setup.md` with:

- fresh project setup steps
- environment variables
- migration application options
- Edge Function deployment command
- type generation command to run after the Supabase project exists
- verification SQL snippets for tables, RLS, summary RPC, and generated calculations

Update `README.md` and `SETUP.md` so they no longer refer to the old migration filename or `tables schema/` snapshots.

## Validation plan

Run:

- source scan to confirm only one migration remains
- source scan to confirm stale analytics RPCs are absent from migrations
- `npx tsc -p tsconfig.app.json --noEmit --pretty false`
- `npm run build`
- SQL structural inspection using available local tools; if no PostgreSQL/Supabase CLI database is available, document that live DB application was not performed locally

## Risks and mitigations

- **Manual type drift:** mitigated by aligning `types.ts` with the baseline and documenting the post-setup `supabase gen types` command.
- **No live project verification:** mitigated by not claiming remote application and by providing exact verification SQL for the user’s new Supabase project.
- **Old SQL references:** mitigated by deleting stale SQL snapshots and updating setup docs.
- **Future schema migration continuity:** acceptable because this is a new database with no live migration history.
