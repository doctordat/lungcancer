# LungCare V2/V3 Build Status

Last inspected: 2026-09-10  
Baseline branch: `main`  
Baseline commit before Phase 0: `49e6ce7`

## Status legend

- **Working demo** — performs a browser-local state transition and can be exercised.
- **Simulated** — displays fixed/demo clinical content without a complete implementation.
- **Broken** — intended behavior contains a known runtime or asset-path defect.
- **Planned** — required for V3 but not implemented.

## Current implementation inventory

| Area | Status | Evidence / limitation | Next decision |
|---|---|---|---|
| Role selection | Working demo | Patient, Nurse, and Doctor roles are selected locally and stored in the browser. No authentication or authorization. | Define identity and role claims. |
| Patient medication acknowledgement | Working demo | Writes `report.taken` to `localStorage`; no timestamp, dose event, actor, or sync. | Model medication events separately from symptom reports. |
| Patient symptom form | Working demo | Captures a symptom, diarrhea count, and fever; priority is assigned locally. | Define a versioned PRO schema and clinically owned rules. |
| Triage priority | Simulated | Hard-coded conditions produce `urgent`, `review_today`, or `stable`; no rule version or explanation object. | Extract, validate, version, and test deterministic rules. |
| Nurse queue | Simulated | Renders the same browser-local report and fixed queue copy; no shared queue or assignment. | Build persisted queue queries and nurse workflow states. |
| Nurse validation/escalation | Working demo | Acknowledgement metadata can be stored locally after the Phase 0 baseline fix. It does not enforce nurse-only transitions or structured validation. | Implement role-authorized state transitions. |
| Doctor review/sign-off | Simulated | Buttons acknowledge a report but there is no review record, decision form, signature, or care-plan update. | Define physician decision and sign-off contract. |
| Shared care plan | Planned | No cross-role/versioned care-plan state exists. | Add versioned plan updates derived only from signed decisions. |
| Cross-device shared state | Planned | The README explicitly describes an offline/local snapshot; all state uses `localStorage`. | Choose backend, identity, realtime, and offline policy. |
| Clinical Consistency Engine | Partial demo | `buildClinicalState()` and three deterministic issue checks exist; the current mobile UI shows fixed metrics and does not integrate detected issues. | Add fixtures/tests and connect to normalized state later. |
| Treatment, support, AI, clinical tools | Simulated | Several controls call `alert()` with descriptive text. | Hide or replace one module at a time with real flows. |
| Command search | Simulated | UI only echoes text; an unused helper maps a few keywords to labels. | Remove from critical path until backed by real destinations. |
| PWA install/offline shell | Partial demo | Manifest and cache-first service worker exist; no icons, update UX, cache version strategy, or offline mutation queue. | Define supported offline behavior and test it. |
| Audit/provenance | Planned | A few timestamps and descriptive strings exist, but no immutable audit event model. | Define actor/action/before/after/reason event schema. |
| Automated regression tests | Planned | No tests exist under `lungcare-v2/`. | Add domain smoke tests before migration. |
| Accessibility and responsive verification | Planned | Semantic/accessibility audit and device/browser matrix are absent. | Establish acceptance checklist and automated checks. |

## Phase 0 changes

- Added the V3 north star, safety boundaries, role contracts, vertical-slice definition, and decision gates to the repository root master plan.
- Corrected nurse/doctor acknowledgement persistence to use the application's existing save path.
- Corrected the service worker asset path for `consistency-engine.js`.
- No framework migration, backend implementation, visual redesign, or broad feature build has started.

## Known issues retained intentionally

- Primary and secondary UI controls still use inline event handlers.
- Placeholder `alert()` controls remain and must not be counted as delivered features.
- Most clinical values are fixed demo content.
- State shape mixes patient, medication, and symptom concerns.
- There is no authorization boundary between roles.
- Cache-first fetch behavior has no expiry or update notification.
- `manifest.json` has no install icons.
- The minified single-file UI is difficult to test and maintain.

These issues are documented rather than broadly refactored in Phase 0 so the next architecture decision is deliberate and the baseline remains reviewable.

## Next checkpoint

The architecture setup is documented in `lungcare-v2/ARCHITECTURE_V3.md`. The bounded foundation instruction in `lungcare-v2/ANTIGRAVITY_EXECUTION_PROMPT.md` was executed through the foundation/domain checkpoint on 2026-09-10.

Before implementation continues, review the architecture brief covering:

1. V3 frontend/runtime choice.
2. Backend and database choice.
3. Authentication and role authorization.
4. Realtime/offline behavior.
5. Clinical rule governance and audit requirements.

Completed at this checkpoint:

- Scaffolded `lungcare-v2/web/` with Next.js App Router, TypeScript, Tailwind CSS, ESLint, and pnpm.
- Added Zod domain schemas for all first-slice records.
- Added deterministic, explicitly non-clinically-validated demo triage rules.
- Added a role-authorized workflow state machine with optimistic version checks.
- Added Vitest domain coverage and Playwright configuration without browser downloads.
- Added minimal, clearly labelled Patient, Nurse, and Doctor route shells.
- Added a default-deny Supabase schema/RLS draft under `lungcare-v2/supabase/`.
- Verification passed: ESLint, TypeScript, 7 domain unit tests, and the production build.
- Production build uses Next.js Webpack mode because the managed workspace blocks the loopback port used by Turbopack's CSS worker.

Still intentionally not implemented: remote Supabase provisioning, authentication UI, realtime subscriptions, persistence integration, transactional physician sign-off, the full vertical slice, AI features, or a broad visual redesign.
