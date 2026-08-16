# UNI-TEL Base Platform Completion Roadmap

This roadmap covers the base application work required before the project is split across the five-person Software Engineering deliverables. It intentionally excludes CI/CD setup, committed test suites, and design polish because those are assigned outside the current base-completion scope.

## Current Priority

The platform must first be made academically correct for IIITM Gwalior UG/IPG usage. Any downstream feature, report, analytics card, import workflow, or documentation becomes unreliable if grades, credits, attendance, or assessment weightage use the wrong academic rules.

## PR Sequence

### 1. Ordinance Academic Foundation

Status: in progress in this branch.

Scope:

- Centralize IIITM academic rules for grades, GPA calculation, attendance threshold, and assessment weightage limits.
- Remove stale grade assumptions such as `E`, `A+`, `B+`, `C+`, and `I` as GPA-bearing grades.
- Treat `F` as GPA-bearing with 0 points.
- Exclude `I`, `S`, `X`, audit, and ungraded courses from GPA denominators.
- Count earned credits only for `D` or better.
- Replace hardcoded 160-credit progress assumptions with programme-dependent wording.
- Align marks forms and import flows with ordinance weightage caps.

Acceptance:

- Production build succeeds.
- No visible source references remain for the old grade scale or 160-credit target.
- Academic rules are documented in `docs/requirements/academic-rules.md`.

### 2. Database Contract Repair

Scope:

- Repair Supabase migration ordering so a fresh database can be built from migrations without manual SQL.
- Update table constraints for the ordinance grade set.
- Update marks constraints for weightage, exam schedule fields, and import-safe validation.
- Regenerate generated Supabase types after schema repair.
- Align environment variable names used by the client and deployment configuration.

Acceptance:

- Fresh Supabase reset or equivalent migration replay succeeds.
- Generated types match the live schema.
- Application code no longer depends on stale generated database contracts.

### 3. Marks and Assessment Completion

Scope:

- Persist weightage consistently across all marks creation/editing/import paths.
- Prevent duplicate marks records per subject, semester, and assessment type where appropriate.
- Validate aggregate assessment weightage by subject, not only a single marks record.
- Support scheduled assessments where total marks are not known yet.
- Ensure export/import round trips preserve marks, weightage, date, and time.

Acceptance:

- A student can plan exams, enter marks later, and export/import the same data without losing assessment metadata.
- Invalid marks and invalid weightage combinations are rejected before storage.

### 4. Attendance Completion

Scope:

- Ensure attendance records cannot store impossible values.
- Surface the 75 percent minimum consistently in dashboard, analytics, and subject-level views.
- Distinguish recorded attendance from attendance eligibility.
- Add clear recovery guidance when a course falls below 75 percent.

Acceptance:

- Attendance status is consistent across the application.
- Below-minimum courses are visible without relying on design polish.

### 5. Notifications and Preferences

Scope:

- Replace local-only notification state with persistent user-specific data.
- Add preferences for attendance warnings, exam reminders, and academic alerts.
- Ensure reminders are derived from persisted exam dates and attendance risk.

Acceptance:

- Notifications survive page reloads and device changes after login.
- Users can turn relevant academic alerts on or off.

### 6. Settings and Account Data Management

Scope:

- Complete account settings beyond placeholder UI.
- Add user-safe export and delete flows for academic data.
- Ensure profile and academic preferences are stored under the authenticated user.

Acceptance:

- Settings actions have real persistence or are removed from the UI until implemented.
- Data management actions are scoped to the logged-in user.

### 7. Search, Knowledge Hub, and Admin Foundations

Scope:

- Replace placeholder search behavior with real search over subjects, marks, attendance, and knowledge content.
- Convert Knowledge Hub placeholders into real, maintainable content records or remove non-functional actions.
- Keep admin features minimal unless there is a real admin workflow.

Acceptance:

- Navigation to a feature means the feature performs a useful action.
- Placeholder-only controls are not presented as completed product features.

## Work Not Included Here

- CI/CD pipelines.
- Formal committed test suite expansion.
- Visual redesign or animation polish.
- Software Engineering report split, PRD/SRS formatting, or team documentation packaging.

These are valid project tasks, but they should be handled in separate branches so the base product work remains reviewable and each PR stays below the agreed line-count limit.
