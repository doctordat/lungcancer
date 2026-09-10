# LungCare V4 — Gate A Build Status

Last inspected & updated: 2026-09-10  
Baseline branch: `main`  
Foundation milestone commit: `f602cc2`  
V4 Gate A milestone: Closed-Loop 6-Screen Oncology Care Experience

## Status Legend

- **Working live** — fully working multi-role flow connected to persistent shared clinical state with audit trail and schema validation.
- **Working demo** — performs a state transition and can be exercised locally.
- **Simulated** — displays fixed/demo clinical content without a complete implementation.
- **Broken** — intended behavior contains a known runtime or asset-path defect.
- **Planned** — required for future milestones (Phase 2).

## Gate A 6-Screen Inventory

| # | Screen & Route | Role | Status | Key Features / Verified Flow |
|---|---|---|---|---|
| 1 | **Patient Today**<br>`/patient/today` | Patient | Working live | Plain Vietnamese, 3 daily actions, "Tôi thấy không ổn" persistent CTA, treatment summary (Osimertinib C3D14, PR −34%), 7-day health summary, care team cards, bottom nav, live Care Plan update banner with acknowledgement. |
| 2 | **Patient Symptom Check**<br>`/patient/symptom-check` | Patient | Working live | Conversational multi-step flow (Dyspnea, dyspnea at rest, SpO2 91%, 38.1°C), calm urgent guidance, care team dispatch, emergency instructions, live workflow status timeline updating from shared state. |
| 3 | **Nurse Care Queue**<br>`/nurse/queue` | Nurse | Working live | Operational clinical triage queue, workload summary (3 urgent, 8 today, 12 stable), urgent card for Nguyễn Văn An (SpO2 91% ↓, 38.1°C, Osimertinib C3), "Đánh giá ngay" CTA. |
| 4 | **Nurse Assessment Workspace**<br>`/nurse/patient/[id]/assessment` | Nurse | Working live | "Why this matters" clinical brief, structured vitals intake (SpO2, temp, RR, severity, cough, chest pain), longitudinal mini-trend sparklines (SpO2 98→91, Weight 64→62.8 kg), physician escalation with audit event generation. |
| 5 | **Doctor Clinical Command Center**<br>`/doctor/command` | Doctor | Working live | High-density oncology brief, "New since last review" (dyspnea at rest, SpO2 91%, fever 38.1°C), 4-quadrant snapshot (Response, Performance, Safety, Toxicity), differential possibilities requiring review, compact Digital Twin preview, priority decision queue. |
| 6 | **Doctor Decision → Shared Care Plan**<br>`/doctor/review/[reportId]` | Doctor | Working live | Full pulmonary episode review, patient report vs. nurse vitals vs. clinical context, physician-authored decision formulation, structured clinical orders (investigations, Nurse Mai 18:00 follow-up), plain Vietnamese patient instructions, cryptographic digital signature, Care Plan V2 generator. |

## Required Cross-Role State Machine

```
PATIENT_SUBMITTED (draft/submitted)
       ↓
NURSE_RECEIVED (received)
       ↓
NURSE_ASSESSED / ESCALATED_TO_DOCTOR (escalated)
       ↓
DOCTOR_REVIEWING / DOCTOR_SIGNED (signed)
       ↓
PATIENT_NOTIFIED (patient_notified)
       ↓
FOLLOWUP_PENDING / ACKNOWLEDGED (acknowledged)
```

## Verification Summary

1. `pnpm run lint`: Passed (0 errors, 0 warnings).
2. `pnpm run typecheck`: Passed.
3. `pnpm run test`: Passed (10 tests in 4 suites: store, triage, workflow, live HTTP E2E).
4. `pnpm run build`: Production Webpack build generated successfully (`next build --webpack`).
5. Running Server: Dev/production server running on `http://localhost:3000`.
6. Live HTTP Route Verification: All 6 routes return HTTP 200 OK.
7. Acceptance Test: Complete 22-step closed care loop verified end-to-end with persistent disk storage.
