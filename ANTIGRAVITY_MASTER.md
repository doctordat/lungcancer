# LungCare V3 — Antigravity Master

## 1. Product north star

LungCare V3 is a connected oncology care workflow:

> Patient → Nurse → Clinical Engine → Doctor review/sign-off → Shared Care Plan → Patient

The first release is successful only when this loop works end to end with persisted, auditable state. A screen, menu, score, or AI response that is not connected to that loop is not a completed feature.

## 2. Product boundaries

- LungCare supports care coordination and clinical decision review; it is not an HIS/EMR.
- AI may summarize, explain, identify missing data, and suggest items for review.
- AI must not diagnose, prescribe, change medication, or sign a clinical decision.
- Every clinical decision and care-plan change requires physician review and explicit sign-off.
- Patient-facing content must distinguish education from individualized medical advice.
- Urgent symptoms must use deterministic safety rules and clear escalation paths, not an LLM-only decision.
- V3 must not contain real patient data until security, consent, access control, and audit requirements are implemented.

## 3. Role contracts

### Patient — Cancer Companion

Optimized for the next safe action: today's treatment, symptom reporting, instructions, and the signed care plan. Language must be plain, reassuring, and unambiguous.

### Nurse — Care Command Center

Optimized for queue priority, validation, documentation, escalation, handoff, and follow-up. Nurse actions prepare and route clinical information; they do not replace physician decisions.

### Doctor — Clinical Command Center

Optimized for a concise clinical brief, source evidence, consistency issues, pending decisions, and explicit sign-off. The doctor must be able to see what changed, who supplied it, and why it needs review.

The three roles share clinical state but must not share a generic dashboard or identical navigation.

## 4. Non-negotiable implementation rules

- Build vertical slices before broad feature catalogs.
- Every primary control must perform a real, testable state transition.
- Do not use `alert()` or static copy to simulate a feature.
- Hide unavailable modules or label them clearly as planned; do not present fake working menus.
- Keep clinical rules deterministic, versioned, source-attributed, and testable.
- Record actor, action, timestamp, prior state, next state, and reason for clinical workflow transitions.
- Preserve the legacy application. V3 work stays within `lungcare-v2/` unless a migration is explicitly approved.
- Use accessible semantic controls, readable contrast, large touch targets, and keyboard support.
- Avoid decorative gradients, emoji as primary icons, excessive cards, and generic AI-dashboard styling.

## 5. First vertical slice

The first implementation target is one complete pathway:

1. Patient submits a symptom report.
2. The report is persisted in shared clinical state with provenance and a status.
3. Deterministic triage assigns a queue priority and explains the triggering rule.
4. Nurse receives the report, validates it, adds structured context, and escalates when required.
5. Doctor reviews the report, evidence, and nurse context.
6. Doctor signs an explicit decision or returns it for more information.
7. The signed decision creates a versioned care-plan update.
8. Patient sees the updated plan and acknowledges receipt.
9. The full transition history is auditable.

### Minimum state machine

`draft → submitted → nurse_validated → escalated → doctor_reviewed → signed → patient_notified → acknowledged`

Exceptional states must include `needs_information`, `cancelled`, and `superseded`. Only authorized role transitions are allowed.

### Definition of done

- Works across separate role sessions, not only within one browser's `localStorage`.
- Survives refresh and restart.
- Rejects invalid or unauthorized transitions.
- Shows loading, empty, error, offline, and retry states.
- Produces an audit record for every transition.
- Has automated tests for stable, review-today, and urgent symptom cases.
- Has no placeholder control on the critical path.
- Has a documented clinical owner for triage rules and sign-off copy.

## 6. Workspace and delivery strategy

### Phase 0 — Baseline and guardrails

- Preserve a clean baseline and document current behavior.
- Track implemented, simulated, broken, and planned capabilities in `lungcare-v2/BUILD_STATUS.md`.
- Fix only baseline defects that block inspection or reliable demo use.
- Add a repeatable local run and smoke-test path before architectural migration.

### Phase 1 — Shared domain model

- Define versioned schemas for patient, symptom report, triage result, nurse validation, physician decision, care plan, and audit event.
- Select persistence and identity/access architecture through a short ADR.
- Separate domain rules from presentation code.

### Phase 2 — End-to-end slice

- Implement the first vertical slice behind a narrow API.
- Build role-specific screens around the same authorized workflow.
- Add deterministic clinical-rule tests and end-to-end role tests.

### Phase 3 — Product system

- Establish design tokens, accessible components, observability, error handling, and deployment checks.
- Expand modules only after the first slice meets its definition of done.

## 7. Decision gates before major refactoring

Do not begin a framework rewrite or backend build until these are agreed:

1. Deployment target and data residency.
2. Authentication and role/organization model.
3. Persistence, realtime needs, and offline conflict policy.
4. Clinical rule ownership, versioning, and validation process.
5. Audit retention and privacy/security requirements.
6. Whether existing Phase 1 assets are reference material or migration sources.

## 8. Current baseline

As inspected on 2026-09-10, `lungcare-v2/mobile/` is a static offline demo. It contains one HTML application, a deterministic consistency helper, a manifest, and a service worker. Its state is browser-local and cannot yet support a real shared Patient → Nurse → Doctor loop. See `lungcare-v2/BUILD_STATUS.md` for the evidence-backed inventory.
