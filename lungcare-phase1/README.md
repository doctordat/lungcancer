# LungCare Oncology · Phase 1 Demo

Static web prototype for the connected clinical decision-support flow (Phase 1 + Decision Brief evidence map), not an EMR:

Patient previsit → Nurse intake → Doctor Decision Brief + Evidence Map → Clinician decision → Nurse teach-back → Patient home-care active → Red dyspnea alert.

Core product boundary: LungCare is a connected clinical decision-support handbook. It surfaces context, provenance, missing data, safety gates and handoff tasks; it is not an EMR, does not sign orders, and does not replace local protocols.

Run locally:

```bash
cd lungcare-phase1
python3 -m http.server 5173
```

Open: http://localhost:5173

No real patient data. Clinical suggestions are demo-only and require physician confirmation.
