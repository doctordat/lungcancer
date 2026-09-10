# LungCare V3 — Architecture Setup

Status: **Ready for execution review**  
Prepared: 2026-09-10  
Scope: first vertical slice only

## Recommended platform

| Layer | Choice | Why it fits the first slice |
|---|---|---|
| Web application | Next.js App Router + TypeScript | Role-specific routes, server/client boundaries, route handlers, and strong typing in one deployable application. |
| Styling | Tailwind CSS with a small internal component system | Fast iteration while keeping LungCare-specific tokens and avoiding a generic dashboard kit. |
| Validation | Zod schemas at every trust boundary | One explicit contract for forms, server actions/API input, domain events, and tests. |
| Database | PostgreSQL through Supabase | Relational workflow state, transactions, migrations, and an auditable event model. |
| Authentication | Supabase Auth | Session identity integrated with PostgreSQL authorization. |
| Authorization | PostgreSQL grants + Row Level Security | Access enforcement remains at the data layer; UI role checks are not treated as security. |
| Realtime | Supabase Postgres Changes, private and RLS-protected | Nurse and Doctor queues can update without polling while respecting row access. |
| Unit/domain tests | Vitest | Fast deterministic tests for schemas, triage rules, and state transitions. |
| End-to-end tests | Playwright | Verify the Patient → Nurse → Doctor → Patient flow in isolated browser sessions. |
| Package manager | pnpm | Reproducible lockfile and efficient local installs. |

Versions must be pinned by the generated lockfile at execution time. Do not hard-code a remembered framework version before scaffolding.

## Repository layout

The current static demo is preserved at `lungcare-v2/mobile/`. The new application is created beside it:

```text
lungcare-v2/
├── mobile/                  # existing static baseline; preserve
├── web/                     # new Next.js application
│   ├── src/
│   │   ├── app/             # role-specific routes and route handlers
│   │   ├── components/      # accessible LungCare UI primitives
│   │   ├── domain/          # schemas, state machine, triage rules
│   │   ├── server/          # authorization and persistence boundary
│   │   └── test/            # fixtures and helpers
│   ├── e2e/
│   └── public/
├── supabase/
│   ├── migrations/
│   ├── seed.sql             # synthetic demo data only
│   └── tests/               # grants/RLS policy tests
├── ARCHITECTURE_V3.md
└── BUILD_STATUS.md
```

Do not copy the existing one-file HTML into React components. Treat it as a behavioral reference and migrate only what the first slice needs.

## Domain boundary

The first slice uses these distinct, versioned entities:

- `profiles`: authenticated identity metadata.
- `organizations`: tenant/care-team boundary.
- `organization_memberships`: role and active membership; authorization data is server-controlled.
- `patients`: patient identity scoped to an organization.
- `care_team_memberships`: which clinicians may access a patient.
- `symptom_reports`: immutable patient submission plus schema version.
- `triage_assessments`: deterministic result, rule version, triggers, and explanation.
- `nurse_validations`: structured verification and escalation context.
- `physician_decisions`: review outcome and explicit sign-off metadata.
- `care_plan_versions`: immutable versions; a new version references a signed decision.
- `workflow_events`: append-only actor/action/from/to/reason/timestamp records.
- `patient_acknowledgements`: receipt of a specific care-plan version.

Clinical records are never overloaded into a single mutable JSON blob. Flexible questionnaire answers may use validated JSON, while ownership, workflow status, timestamps, and foreign keys remain relational columns.

## State-transition policy

All transitions run server-side in a database transaction. The server must:

1. Validate the request schema.
2. Resolve the authenticated actor and active organization membership.
3. Check role and care-team access.
4. Lock/read the current workflow version.
5. Reject stale or invalid transitions.
6. Write the domain record and append-only audit event atomically.
7. Return the new canonical state.

Minimum happy path:

```text
draft → submitted → nurse_validated → escalated
      → doctor_reviewed → signed → patient_notified → acknowledged
```

No patient or nurse action may create `signed`. No signed care-plan version may be edited in place; it can only be superseded by another signed version.

## Authorization baseline

- No clinical table is public or readable by an unauthenticated role.
- RLS is enabled on every exposed table and paired with least-privilege grants.
- Patient access is limited to their own linked record.
- Nurse/Doctor access requires active organization and care-team membership.
- Doctor-only write policies protect review/sign-off operations.
- Service-role credentials remain server-side and are never exposed to the browser.
- Realtime channels are private; public channel access is disabled.
- Role/organization authorization must not rely on user-editable profile metadata.
- RLS policy tests are required before enabling realtime clinical updates.

## Offline policy for the first slice

- Read-only display of the most recently verified non-sensitive demo snapshot may be cached during development.
- Clinical mutations are not silently finalized offline.
- A patient may keep an explicitly labelled local draft, then review and submit it when online.
- Nurse validation and physician sign-off require an online server acknowledgement.
- Conflict resolution is explicit; last-write-wins is forbidden for clinical workflow state.

## Environments and data

- `local`: local Supabase stack and synthetic fixtures.
- `preview`: synthetic data only; isolated database/project.
- `production`: blocked until privacy, security, clinical governance, retention, backup, incident response, and deployment-region decisions are approved.

Do not add real patient information, credentials, access tokens, or production connection strings to the repository. Commit only `.env.example` with names and safe descriptions.

## UI route contract

- `/patient/today` — next actions, report entry, signed plan update.
- `/nurse/queue` — priority queue and validation workspace.
- `/doctor/review/[reportId]` — evidence, nurse context, decision and sign-off.
- `/auth/*` — authentication only; demo role switching is development-only.

The first milestone does not include a general clinical-tool catalog, AI chat, FHIR export, billing, MDT, genomic views, or additional dashboard modules.

## Quality gates

Before the slice is called complete:

- Type check, lint, unit tests, database policy tests, and production build pass.
- Playwright covers stable, review-today, and urgent paths using separate role sessions.
- Invalid role transitions and stale-version writes are rejected.
- Error, empty, loading, offline, and retry states are visible and accessible.
- No critical-path control calls `alert()` or displays a fake success.
- Every care-plan change can be traced to a signed physician decision.

## Deferred decisions

The setup may proceed with synthetic data, but production remains blocked on:

- Vietnam data-residency and healthcare/privacy legal review.
- Clinical owner and validation procedure for triage rule versions.
- Identity assurance, staff provisioning, and organization administration.
- Audit retention, backup/restore objectives, and incident response.
- Integration strategy for HIS/EMR/FHIR and source-of-truth ownership.

## Official references used for this setup

- Next.js App Router and TypeScript documentation.
- Supabase Auth architecture, PostgreSQL RLS, and Realtime Authorization documentation.
- Playwright end-to-end testing documentation.

