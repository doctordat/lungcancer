# Antigravity Execution Prompt — LungCare V3 Foundation

Execution started on 2026-09-10 and is bounded to the foundation/domain checkpoint below.

---

Read `ANTIGRAVITY_MASTER.md`, `lungcare-v2/ARCHITECTURE_V3.md`, and `lungcare-v2/BUILD_STATUS.md` completely before changing files. Inspect the current Git status and preserve all existing Phase 0 changes. Treat `lungcare-phase1/` and `lungcare-v2/mobile/` as reference baselines; do not rewrite or delete them.

Implement only the LungCare V3 foundation and domain-model checkpoint. Do not build the full product and do not create broad placeholder navigation.

1. Scaffold a new Next.js App Router application with TypeScript, Tailwind CSS, ESLint, a `src/` directory, and the `@/*` alias at `lungcare-v2/web/`, using pnpm and currently supported stable packages. Do not overwrite any existing directory.
2. Add Vitest for domain tests and Playwright configuration for later end-to-end tests. Do not download browser binaries unless they are needed for an actual verification run.
3. Create the folder boundaries described in `lungcare-v2/ARCHITECTURE_V3.md`: `app`, `components`, `domain`, `server`, `test`, and `e2e`.
4. Implement versioned Zod schemas and pure TypeScript types for `SymptomReport`, `TriageAssessment`, `NurseValidation`, `PhysicianDecision`, `CarePlanVersion`, `WorkflowEvent`, and `PatientAcknowledgement`.
5. Implement a pure, deterministic workflow state machine. Enforce role-authorized transitions and optimistic version checks. Do not implement sign-off as a client-only state change.
6. Extract the current demo triage behavior into a versioned pure rule function with an explanation/triggers result. Mark every rule as demo/non-clinically-validated. Add unit tests for stable, review-today, urgent, invalid transition, unauthorized role, and stale-version cases.
7. Add `lungcare-v2/web/.env.example` containing names only—no credentials—and a short local setup README.
8. Create an initial Supabase migrations directory and draft relational schema/RLS policy files for review, but do not connect to or create a remote Supabase project and do not use real patient data.
9. Add minimal role route shells only for `/patient/today`, `/nurse/queue`, and `/doctor/review/[reportId]`. They must clearly say the foundation is not yet connected; do not use fake success actions or `alert()`.
10. Update `lungcare-v2/BUILD_STATUS.md` with exact completed and remaining items.

Before finishing, run formatting, lint, type checking, unit tests, and a production build. Report every command run, the resulting directory tree, test results, known limitations, and Git diff summary. Stop after the foundation/domain checkpoint. Do not implement Supabase cloud provisioning, authentication screens, realtime subscriptions, the full vertical slice, AI features, or visual redesign without a new explicit instruction.

---
