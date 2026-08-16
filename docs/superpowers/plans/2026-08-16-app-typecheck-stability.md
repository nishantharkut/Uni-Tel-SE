# App Typecheck Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove stale analytics RPC typing blockers so the app TypeScript check can pass without database migration repair.

**Architecture:** Keep the existing `analyticsService` and `useAnalytics` public API stable, but replace untyped/stale Supabase RPC calls with client-side calculations over the already-supported academic tables. Put calculation logic in a focused domain module so it can be privately asserted without adding committed test infrastructure.

**Tech Stack:** React, TypeScript, TanStack Query, existing Supabase table services, local pure TypeScript calculations.

---

## Scope Boundaries

- Do not repair Supabase migrations in this PR.
- Do not regenerate Supabase types in this PR.
- Do not add CI/CD or committed test files.
- Do not change active analytics page design.
- Keep this stacked on `fix/base-platform-workflows`.

## Files

- Create: `src/domain/analyticsCalculations.ts`
- Modify: `src/services/analyticsService.ts`
- Modify if needed: `src/hooks/useAnalytics.ts`

## Task 1: Add Pure Analytics Calculations

- [ ] Create `src/domain/analyticsCalculations.ts`.
- [ ] Export functions for semester trends, grade distribution, attendance analytics, marks analytics, and achievements.
- [ ] Use ordinance-aware grade helpers from `src/domain/academicRules.ts`.
- [ ] Use attendance percentage planning from `src/domain/attendancePlanning.ts`.
- [ ] Keep outputs compatible with the existing interfaces in `src/services/analyticsService.ts`.
- [ ] Run private assertions from `%TEMP%` to verify failed-course counts, distribution percentages, and attendance buckets.

## Task 2: Replace Stale RPC Service Calls

- [ ] Update `src/services/analyticsService.ts` to import table services from `src/services/academicService.ts`.
- [ ] Fetch semesters, subjects, attendance, and marks using existing service methods.
- [ ] Return data from the pure analytics calculation functions.
- [ ] Remove all `.rpc('get_*_analytics')` calls from this service.
- [ ] Make `getDashboardAnalytics` call service methods without relying on `this` binding.

## Task 3: Verify Hook Compatibility

- [ ] Keep the hook names in `src/hooks/useAnalytics.ts` unchanged.
- [ ] Confirm query functions are stable method references or closures.
- [ ] Confirm no active imports break.

## Task 4: Verification and Publish

- [ ] Run `rg` to confirm stale analytics RPC names are removed from source.
- [ ] Run `npx tsc -p tsconfig.app.json --noEmit --pretty false`.
- [ ] Run `npm run build`.
- [ ] Run `git diff --check`.
- [ ] Commit with a professional message.
- [ ] Push `fix/app-typecheck-stability` and open a stacked draft PR against `fix/base-platform-workflows`.
