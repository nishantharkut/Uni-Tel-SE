# Base Platform Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the most visible UNI-TEL base-platform student workflows without touching CI/CD, committed test infrastructure, database migration repair, or design polish.

**Architecture:** Keep work stacked on top of the IIITM ordinance foundation branch so shared academic rules remain the single source of truth. Add small domain/services modules for calculations, preferences, search, and data health, then wire them into existing pages/components.

**Tech Stack:** React, TypeScript, Vite, TanStack Query, Supabase client, localStorage for client-only preferences/notifications.

---

## Scope Boundaries

- Do not add CI/CD pipelines.
- Do not commit test files or test infrastructure.
- Do not regenerate Supabase types or repair migrations in this branch.
- Do not perform visual redesign; only add functional UI where needed.
- Keep commits professional and below the agreed line-count limit.

## Task 1: Resolve Source-Level Workflow Blockers

**Files:**

- Modify: `src/components/academic/AttendanceDialog.tsx`
- Modify: `src/components/academic/AttendanceEditor.tsx`
- Modify: `src/components/layout/AppSidebar.tsx`
- Modify: `src/pages/Landing.tsx`

- [ ] Move `resetForm` before the `useEffect` that depends on it in `AttendanceDialog`.
- [ ] Move `filteredRecords` before any dependent selectors in `AttendanceEditor`.
- [ ] Ensure `AttendanceEditor` maps records as `AttendanceRecord` so edit/delete handlers receive complete records.
- [ ] Replace invalid Lucide icon imports with real exported icons.
- [ ] Fix the Landing profile lookup to use the same `user_id` relationship used elsewhere.
- [ ] Verify with `npx tsc -p tsconfig.app.json --noEmit --pretty false` and confirm these specific errors are gone, even if unrelated generated-type errors remain.

## Task 2: Add Attendance Planning Utilities

**Files:**

- Create: `src/domain/attendancePlanning.ts`
- Modify: `src/components/academic/AttendanceDialog.tsx`
- Modify: `src/components/academic/AttendanceEditor.tsx`
- Modify: `src/components/academic/ActiveAttendanceCard.tsx`
- Modify: `src/pages/Attendance.tsx`

- [ ] Add pure functions for attendance percentage, risk level, safe skips, and required recovery classes.
- [ ] Use the utility in attendance forms and lists.
- [ ] Show safe-skip/recovery guidance for each attendance record.
- [ ] Keep the IIITM minimum attendance threshold as the default target.
- [ ] Validate locally with private assertions for safe-skip and recovery calculations.

## Task 3: Add Student Planning Utilities for Marks and CGPA

**Files:**

- Create: `src/domain/studentPlanning.ts`
- Create: `src/components/academic/StudentPlanningPanel.tsx`
- Modify: `src/pages/Analytics.tsx`
- Modify: `src/pages/Marks.tsx`

- [ ] Add pure functions for target CGPA planning and required weighted marks.
- [ ] Add a small panel that calculates required average grade points for a target CGPA.
- [ ] Add a marks target calculator that uses existing marks records and weightage.
- [ ] Avoid claiming grade prediction as authoritative; label calculations as planning estimates.
- [ ] Validate locally with private assertions for target CGPA and required marks calculations.

## Task 4: Add Academic Data Health Checks

**Files:**

- Create: `src/domain/academicDataHealth.ts`
- Create: `src/components/academic/AcademicDataHealthPanel.tsx`
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/Analytics.tsx`

- [ ] Detect duplicate-looking semesters, subjects, attendance records, and marks records.
- [ ] Detect missing grades, failed subjects, below-minimum attendance, marks missing weightage, and empty semesters.
- [ ] Show a concise data health panel with severity, count, and route target.
- [ ] Keep checks client-side and read-only.

## Task 5: Complete Global Academic Search

**Files:**

- Create: `src/services/academicSearchService.ts`
- Create: `src/hooks/useAcademicSearch.ts`
- Modify: `src/components/layout/AppHeader.tsx`
- Modify: `src/components/ui/MobileSearchModal.tsx`

- [ ] Search subjects, semesters, attendance, marks, and known knowledge resources.
- [ ] Show category, title, description, and destination for each result.
- [ ] Navigate to the relevant route on click.
- [ ] Store recent searches safely in localStorage.
- [ ] Replace the “coming soon” placeholder result area.

## Task 6: Complete Smart Local Notifications and Preferences

**Files:**

- Create: `src/services/userPreferencesService.ts`
- Create: `src/hooks/useUserPreferences.ts`
- Modify: `src/services/notificationService.ts`
- Modify: `src/hooks/useNotifications.ts`
- Modify: `src/components/ui/notifications-dropdown.tsx`
- Modify: `src/pages/Settings.tsx`

- [ ] Persist attendance warning threshold, CGPA target, exam reminder window, and notification toggles.
- [ ] Generate deterministic local notifications from real academic data: low attendance, upcoming exams, failed subjects, missing grades, and low marks.
- [ ] Scope localStorage keys by authenticated user id when available.
- [ ] Replace fake enable buttons with real preference controls.
- [ ] Keep backend notification tables out of scope.

## Task 7: Make Placeholder Modules Honest and Useful

**Files:**

- Modify: `src/pages/ComingSoon.tsx`
- Modify: `src/components/layout/AppSidebar.tsx`

- [ ] Convert Knowledge Hub routes to useful static academic resources: ordinance link, grading rules, attendance policy, JSON import guide, study planning.
- [ ] Label admin routes as planned/internal rather than pretending they are completed controls.
- [ ] Remove misleading placeholder copy that makes the project look unfinished.

## Task 8: Harden Import/Export User Flow

**Files:**

- Modify: `src/components/academic/ImportExport.tsx`
- Modify: `src/components/academic/ExportButton.tsx`
- Modify: `src/services/jsonImportService.ts`

- [ ] Add import preview counts before calling the edge function.
- [ ] Show JSON parse errors with actionable messages.
- [ ] Warn when exporting an empty academic profile.
- [ ] Keep export shape compatible with the existing import format.

## Verification Plan

- Run private pure-function assertions from a temporary directory only.
- Run `git diff --check`.
- Run `npm run build`.
- Run `npx tsc -p tsconfig.app.json --noEmit --pretty false` as diagnostic; report any remaining unrelated generated-type/database blockers.
- Push branch and open a draft PR stacked on `fix/ordinance-academic-foundation`.
