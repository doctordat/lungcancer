import { describe, expect, it } from "vitest";

const BASE_URL = "http://localhost:3000";

describe("LungCare V4 Gate A E2E HTTP API & Shared State Verification", () => {
  it("executes the complete 6-screen closed care loop with real persistence", async () => {
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

    // 1. Patient Submits Symptom Check (Screen 2)
    const reportRes = await fetch(`${BASE_URL}/api/patient/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        symptom: "dyspnea",
        dyspneaTrigger: "at_rest",
        progression: "worse",
        spo2: 91,
        temperature: 38.1,
        notes: "Cảm thấy hụt hơi ngay cả khi ngồi nghỉ, người gai sốt và mệt từ sáng nay.",
      }),
    });
    const reportJson = await reportRes.json();
    expect(reportJson.success).toBe(true);
    const reportId = reportJson.reportId;
    const s1 = reportJson.data;

    expect(s1.activeReport.status).toBe("submitted");
    expect(s1.activeReport.symptom).toBe("dyspnea");
    expect(s1.activeReport.spo2).toBe(91);
    expect(s1.triageAssessment.priority).toBe("urgent");

    // 2. Nurse validates in workspace & escalates (Screen 4)
    const nurseRes = await fetch(`${BASE_URL}/api/nurse/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        expectedVersion: s1.activeReport.workflowVersion,
        repeatSpo2: 91,
        respiratoryRate: 24,
        temperature: 38.1,
        dyspneaSeverity: "at_rest",
        cough: true,
        chestPain: false,
        syncope: false,
        cyanosis: false,
        onsetProgression: "Khởi phát khó thở khi nghỉ ngơi từ sáng nay, SpO2 đo lại 91%, sốt 38.1°C.",
        escalationRequired: true,
        context: "Đã liên hệ điện thoại: bệnh nhân mệt nhiều, hụt hơi khi nghỉ, ho khan ít. Đề nghị bác sĩ hội chẩn khẩn cấp.",
      }),
    });
    const nurseJson = await nurseRes.json();
    expect(nurseJson.success).toBe(true);
    const s2 = nurseJson.data;
    expect(s2.activeReport.status).toBe("escalated");
    expect(s2.nurseValidation.repeatSpo2).toBe(91);
    expect(s2.nurseValidation.escalationRequired).toBe(true);

    // 3. Doctor reviews in Command Center & signs decision (Screen 6)
    const doctorRes = await fetch(`${BASE_URL}/api/doctor/signoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reportId,
        expectedVersion: s2.activeReport.workflowVersion,
        outcome: "care_plan_update",
        rationale: "Khó thở mới xuất hiện khi nghỉ ngơi kèm SpO2 giảm xuống 91% và sốt nhẹ trên bệnh nhân Osimertinib.",
        differentials: [
          "Viêm phổi kẽ / Độc tính phổi do Osimertinib (Drug-induced ILD/Pneumonitis)",
          "Viêm phổi nhiễm trùng / Sốt giảm bạch cầu",
          "Thuyên tắc phổi (PE)",
        ],
        investigationsOrdered: [
          "Chụp HRCT lồng ngực khẩn",
          "Công thức máu (CBC), CRP",
          "Khí máu động mạch (ABG)",
          "Khám chuyên khoa hô hấp",
        ],
        clinicalActions: "Tạm dừng Osimertinib 80mg từ hôm nay. Chỉ định chụp HRCT lồng ngực khẩn, xét nghiệm CTM, CRP và khám chuyên khoa hô hấp.",
        patientInstructionsPlain: "Bác An tạm dừng uống viên Osimertinib hôm nay. Hãy nghỉ ngơi, đo lại SpO2 sau mỗi 2 giờ. Điều dưỡng Mai sẽ gọi điện hướng dẫn và hẹn giờ kiểm tra lúc 18:00 hôm nay.",
        monitoring: "Theo dõi SpO2 liên tục, thân nhiệt mỗi 4 giờ, nhịp thở.",
        followUpAssignedTo: "ĐD. Lê Thị Mai",
        followUpTime: "Hôm nay · 18:00",
      }),
    });
    const doctorJson = await doctorRes.json();
    expect(doctorJson.success).toBe(true);
    const s3 = doctorJson.data;
    expect(s3.activeReport.status).toBe("patient_notified");
    expect(s3.activeCarePlan.version).toBe(2);
    expect(s3.activeCarePlan.patientInstructionsPlain).toContain("Bác An tạm dừng uống viên Osimertinib");

    // 4. Patient acknowledges Care Plan V2 (Screen 1)
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

    // 5. Persistence across refresh
    const fetchStateRes = await fetch(`${BASE_URL}/api/state`, { cache: "no-store" });
    const fetchJson = await fetchStateRes.json();
    expect(fetchJson.success).toBe(true);
    expect(fetchJson.data.activeReport.status).toBe("acknowledged");
    expect(fetchJson.data.activeCarePlan.version).toBe(2);
    expect(fetchJson.data.auditEvents.length).toBeGreaterThanOrEqual(6);
  });
});
