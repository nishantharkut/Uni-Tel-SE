-- Optimize ownership RLS policies so auth.uid() is evaluated once per query.
-- Supabase advisors recommend `(select auth.uid())` inside policies to avoid
-- row-by-row function re-evaluation at scale.

drop policy if exists profiles_own_rows on public.profiles;
create policy profiles_own_rows
  on public.profiles
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists user_preferences_own_rows on public.user_preferences;
create policy user_preferences_own_rows
  on public.user_preferences
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists semesters_own_rows on public.semesters;
create policy semesters_own_rows
  on public.semesters
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists subjects_own_rows on public.subjects;
create policy subjects_own_rows
  on public.subjects
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists attendance_records_own_rows on public.attendance_records;
create policy attendance_records_own_rows
  on public.attendance_records
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists marks_records_own_rows on public.marks_records;
create policy marks_records_own_rows
  on public.marks_records
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists notifications_own_rows on public.notifications;
create policy notifications_own_rows
  on public.notifications
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
