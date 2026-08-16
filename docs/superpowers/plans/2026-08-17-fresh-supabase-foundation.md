# Fresh Supabase Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken imported Supabase SQL history with one clean fresh-database baseline that matches the current UNI-TEL app contract.

**Architecture:** The database source of truth becomes one baseline migration under `supabase/migrations/`. The frontend continues using the existing table and RPC names, while generated TypeScript types and setup docs are aligned to the new schema.

**Tech Stack:** Supabase PostgreSQL, Row-Level Security, PL/pgSQL, React/TypeScript, Supabase JS generated types.

---

## File structure

- Create: `supabase/migrations/20260817000000_initial_schema.sql`
- Create: `docs/database/supabase-setup.md`
- Modify: `src/integrations/supabase/types.ts`
- Modify: `README.md`
- Modify: `SETUP.md`
- Delete: old files in `supabase/migrations/*.sql`
- Delete: root-level `supabase_migration_*.sql`
- Delete: `tables schema/*.sql`

## Task 1: Document approved database design

- [x] **Step 1: Write design spec**

Create `docs/superpowers/specs/2026-08-17-fresh-supabase-foundation-design.md` covering goals, schema, RLS, functions, TypeScript compatibility, docs, validation, and risks.

- [ ] **Step 2: Commit design and plan**

Run:

```powershell
git add docs/superpowers/specs/2026-08-17-fresh-supabase-foundation-design.md docs/superpowers/plans/2026-08-17-fresh-supabase-foundation.md
git commit -m "docs(database): define fresh Supabase foundation"
```

Expected: one documentation commit.

## Task 2: Replace imported SQL history with clean baseline migration

- [ ] **Step 1: Delete stale SQL sources**

Remove:

```text
supabase/migrations/20250102000000_add_missing_analytics_functions.sql
supabase/migrations/20250102000001_add_data_integrity_constraints.sql
supabase/migrations/20250103000000_fix_sgpa_cgpa_calculations.sql
supabase/migrations/20250104000000_add_exam_datetime_and_weightage.sql
supabase/migrations/20250105000000_fix_division_by_zero_weighted_percentage.sql
supabase/migrations/20250827194740_9e5b13e5-435d-4c91-8fe6-a28d520bf2c0.sql
supabase/migrations/20260411000000_fix_corrupted_semester_numbers.sql
supabase_migration_custom_exam_types.sql
supabase_migration_custom_exam_types_safe.sql
supabase_migration_custom_exam_types_final.sql
supabase_migration_notifications.sql
tables schema/attendance_records.sql
tables schema/marks_records.sql
tables schema/notifications.sql
tables schema/profiles.sql
tables schema/semesters.sql
tables schema/subjects.sql
```

- [ ] **Step 2: Add baseline migration**

Create `supabase/migrations/20260817000000_initial_schema.sql` with:

```sql
create extension if not exists "pgcrypto" with schema extensions;

create or replace function public.grade_to_points(grade_letter text)
returns numeric
language sql
immutable
as $$
  select case upper(trim(coalesce(grade_letter, '')))
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
```

Then define all tables, constraints, triggers, RLS policies, RPCs, views, grants, and comments described in the design spec.

- [ ] **Step 3: Validate source structure**

Run:

```powershell
Get-ChildItem supabase/migrations -Filter *.sql | Select-Object -ExpandProperty Name
rg -n "get_semester_performance_trends|get_grade_distribution_analytics|get_attendance_analytics|get_marks_performance_analytics|get_academic_achievements" supabase
```

Expected:

- only `20260817000000_initial_schema.sql`
- no stale analytics RPC matches

- [ ] **Step 4: Commit schema reset**

Run:

```powershell
git add supabase/migrations supabase_migration_custom_exam_types.sql supabase_migration_custom_exam_types_safe.sql supabase_migration_custom_exam_types_final.sql supabase_migration_notifications.sql "tables schema"
git commit -m "fix(database): replace imported migrations with clean baseline"
```

Expected: one schema commit.

## Task 3: Align generated Supabase TypeScript contract

- [ ] **Step 1: Update generated type file**

Modify `src/integrations/supabase/types.ts` to include:

- tables: `profiles`, `semesters`, `subjects`, `attendance_records`, `marks_records`, `notifications`, `user_preferences`
- views: `user_custom_exam_types`, `subject_weighted_performance`, `user_notification_summary`
- functions: all public RPCs listed in the design spec

- [ ] **Step 2: Typecheck**

Run:

```powershell
npx tsc -p tsconfig.app.json --noEmit --pretty false
```

Expected: exit code `0`.

- [ ] **Step 3: Commit type alignment**

Run:

```powershell
git add src/integrations/supabase/types.ts
git commit -m "fix(database): align Supabase types with fresh schema"
```

Expected: one type contract commit.

## Task 4: Update setup and database documentation

- [ ] **Step 1: Add database setup guide**

Create `docs/database/supabase-setup.md` with exact steps for:

- creating/linking a new Supabase project
- setting `VITE_SUPABASE_URL`
- setting `VITE_SUPABASE_PUBLISHABLE_KEY`
- applying the baseline migration
- deploying `import-academic-data`
- generating TypeScript types
- running verification SQL

- [ ] **Step 2: Update repository docs**

Update `README.md` and `SETUP.md` to point to:

```text
supabase/migrations/20260817000000_initial_schema.sql
docs/database/supabase-setup.md
```

Remove references to:

```text
tables schema/
supabase/migrations/20250827194740_9e5b13e5-435d-4c91-8fe6-a28d520bf2c0.sql
```

- [ ] **Step 3: Build validation**

Run:

```powershell
npm run build
```

Expected: build exits `0`; existing Browserslist/chunk warnings may remain.

- [ ] **Step 4: Commit documentation**

Run:

```powershell
git add docs/database/supabase-setup.md README.md SETUP.md
git commit -m "docs(database): document fresh Supabase setup"
```

Expected: one documentation commit.

## Task 5: Final verification and publish

- [ ] **Step 1: Run final verification**

Run:

```powershell
git diff --check
npx tsc -p tsconfig.app.json --noEmit --pretty false
npm run build
```

Expected: all commands exit `0`.

- [ ] **Step 2: Inspect final scope**

Run:

```powershell
git diff --stat fix/app-typecheck-stability..HEAD
git log --oneline fix/app-typecheck-stability..HEAD
```

Expected: focused database reset PR, below the user’s 5k-7k LOC review limit.

- [ ] **Step 3: Push and open draft PR**

Run:

```powershell
git push -u origin fix/fresh-supabase-foundation
gh pr create --draft --base fix/app-typecheck-stability --head fix/fresh-supabase-foundation --title "Rebuild Supabase foundation for fresh project setup" --body-file <prepared-body.md>
```

Expected: draft PR stacked on `fix/app-typecheck-stability`.
