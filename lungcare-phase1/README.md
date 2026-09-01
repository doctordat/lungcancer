# LungCare Oncology · Phase 1 Demo

Static web prototype for the connected clinical decision-support flow (Phase 1 + Decision Brief evidence map), not an EMR:

Patient previsit → Nurse intake → Doctor plan → Nurse teach-back → Patient home-care active → Red dyspnea alert.

Run locally:

```bash
cd lungcare-phase1
python3 -m http.server 5173
```

Open: http://localhost:5173

No real patient data. Clinical suggestions are demo-only and require physician confirmation.
