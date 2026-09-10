import { describe, expect, it } from "vitest";

const BASE_URL = "http://localhost:3000";

describe("Vertical Slice #1 E2E HTTP API & Shared Clinical State Verification", () => {
  it("executes the complete Patient -> Nurse -> Doctor -> Patient loop with persistence", async () => {
    // 0. Reset to clean baseline
    const resetRes = await fetch(`${BASE_URL}/api/state`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    const resetJson = await resetRes.json();
    expect(resetJson.success).toBe(true);
    expect(resetJson.data.activeCarePlan.version).toBe(1);
    expect(resetJson.data.activeReport).toBeNull();

    // 1. Patient Submits Symptom Report
    const reportRes = await fetch(`${BASE_URL}/api/patient/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptom: "diarrhea",
        diarrheaEpisodes: 5,
        fever: true,
        notes: "Mệt lả từ sáng, đi ngoài 5 lần kèm sốt nhẹ.",
      }),
    });
    const reportJson = await reportRes.json();
    expect(reportJson.success).toBe(true);
    const reportId = reportJson.reportId;
    const s1 = reportJson.data;

    expect(s1.activeReport.status).toBe("submitted");
    expect(s1.activeReport.workflowVersion).toBe(1);
    expect(s1.triageAssessment.priority).toBe("review_today");
    expect(s1.triageAssessment.triggers).toContain("diarrhea_episodes:gte_4");
    expect(s1.triageAssessment.triggers).toContain("fever:true");

    // 2. Nurse validates and escalates
    const nurseRes = await fetch(`${BASE_URL}/api/nurse/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        expectedVersion: s1.activeReport.workflowVersion,
        escalationRequired: true,
        context: "Đã liên hệ điện thoại: bệnh nhân mất nước độ 1, sốt 38.2C, phân lỏng 5 lần. Đề nghị bác sĩ hội chẩn.",
      }),
    });
    const nurseJson = await nurseRes.json();
    expect(nurseJson.success).toBe(true);
    const s2 = nurseJson.data;
    expect(s2.activeReport.status).toBe("escalated");
    expect(s2.activeReport.workflowVersion).toBe(3);
    expect(s2.nurseValidation.escalationRequired).toBe(true);

    // 3. Doctor reviews, signs off, and creates Care Plan V2
    const doctorRes = await fetch(`${BASE_URL}/api/doctor/signoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        expectedVersion: s2.activeReport.workflowVersion,
        outcome: "care_plan_update",
        rationale: "Độc tính tiêu hóa độ 2 do Osimertinib kết hợp sốt nhẹ.",
        newPlanSummary: "Tạm ngưng Osimertinib 48h. Dùng Loperamide 4mg khởi đầu, sau đó 2mg mỗi lần đi ngoài phân lỏng (tối đa 16mg/ngày). Bù nước Oresol 1000ml/ngày.",
      }),
    });
    const doctorJson = await doctorRes.json();
    expect(doctorJson.success).toBe(true);
    const s3 = doctorJson.data;
    expect(s3.activeReport.status).toBe("patient_notified");
    expect(s3.activeCarePlan.version).toBe(2);
    expect(s3.activeCarePlan.summary).toContain("Tạm ngưng Osimertinib 48h");
    expect(s3.carePlanVersions.length).toBe(2);

    // 4. Patient Acknowledges Care Plan V2
    const ackRes = await fetch(`${BASE_URL}/api/patient/acknowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carePlanVersionId: s3.activeCarePlan.id,
        expectedVersion: s3.activeReport.workflowVersion,
      }),
    });
    const ackJson = await ackRes.json();
    expect(ackJson.success).toBe(true);
    const s4 = ackJson.data;
    expect(s4.activeReport.status).toBe("acknowledged");
    expect(s4.acknowledgements.length).toBe(1);

    // 5. Persistence across new request / role switching
    const fetchStateRes = await fetch(`${BASE_URL}/api/state`, { cache: "no-store" });
    const fetchJson = await fetchStateRes.json();
    expect(fetchJson.success).toBe(true);
    expect(fetchJson.data.activeReport.status).toBe("acknowledged");
    expect(fetchJson.data.activeCarePlan.version).toBe(2);
    expect(fetchJson.data.auditEvents.length).toBeGreaterThanOrEqual(6);
  });
});
