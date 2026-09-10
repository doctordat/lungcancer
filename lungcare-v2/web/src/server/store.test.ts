import { describe, expect, it, beforeEach } from "vitest";
import {
  resetClinicalState,
  readClinicalState,
  submitSymptomReport,
  nurseValidateReport,
  doctorSignOffDecision,
  patientAcknowledgeCarePlan,
} from "./store";

describe("LungCare V4 Gate A Clinical State Lifecycle", () => {
  beforeEach(() => {
    resetClinicalState();
  });

  it("initializes with normalized patient profile and initial Care Plan V1", () => {
    const state = readClinicalState();
    expect(state.patient.name).toBe("Nguyễn Văn An");
    expect(state.patient.regimen).toContain("Osimertinib 80 mg");
    expect(state.activeCarePlan.version).toBe(1);
    expect(state.activeReport).toBeNull();
  });

  it("executes the complete 6-step closed loop for acute dyspnea episode", () => {
    // 1. Patient Submits Symptom Check: Dyspnea at rest, SpO2 91%, Fever 38.1°C
    const { state: s1, reportId } = submitSymptomReport({
      symptom: "dyspnea",
      dyspneaTrigger: "at_rest",
      progression: "worse",
      spo2: 91,
      temperature: 38.1,
      notes: "Hụt hơi khi ngồi nghỉ, người gai sốt và mệt từ sáng nay.",
    });

    expect(s1.activeReport?.status).toBe("submitted");
    expect(s1.activeReport?.symptom).toBe("dyspnea");
    expect(s1.activeReport?.spo2).toBe(91);
    expect(s1.triageAssessment?.priority).toBe("urgent");
    expect(s1.triageAssessment?.triggers).toContain("symptom:dyspnea");
    expect(s1.triageAssessment?.triggers).toContain("dyspnea:at_rest");
    expect(s1.triageAssessment?.triggers).toContain("spo2_hypoxia:91%");

    // 2. Nurse validates in assessment workspace & escalates
    const s2 = nurseValidateReport({
      reportId,
      expectedVersion: s1.activeReport!.workflowVersion,
      repeatSpo2: 91,
      respiratoryRate: 24,
      temperature: 38.1,
      dyspneaSeverity: "at_rest",
      cough: true,
      chestPain: false,
      syncope: false,
      cyanosis: false,
      onsetProgression: "Khó thở khi nghỉ từ sáng nay, SpO2 91%, nhịp thở 24 l/p, ho khan ít.",
      escalationRequired: true,
      context: "Đã liên hệ điện thoại: bệnh nhân mệt nhiều, hụt hơi khi nghỉ, ho khan ít. Đề nghị bác sĩ hội chẩn khẩn cấp.",
    });

    expect(s2.activeReport?.status).toBe("escalated");
    expect(s2.nurseValidation?.repeatSpo2).toBe(91);
    expect(s2.nurseValidation?.escalationRequired).toBe(true);

    // 3. Doctor reviews in Command Center & signs decision
    const s3 = doctorSignOffDecision({
      reportId,
      expectedVersion: s2.activeReport!.workflowVersion,
      outcome: "care_plan_update",
      rationale: "Khó thở mới xuất hiện khi nghỉ ngơi kèm SpO2 giảm xuống 91% và sốt nhẹ trên bệnh nhân Osimertinib.",
      differentials: [
        "Viêm phổi kẽ / Độc tính phổi do Osimertinib (Drug-induced ILD/Pneumonitis)",
        "Viêm phổi nhiễm trùng",
        "Thuyên tắc phổi (PE)",
      ],
      investigationsOrdered: [
        "Chụp HRCT lồng ngực khẩn",
        "Công thức máu (CBC), CRP",
        "Khí máu động mạch (ABG)",
      ],
      clinicalActions: "Tạm dừng Osimertinib 80mg từ hôm nay. Chỉ định chụp HRCT lồng ngực khẩn, xét nghiệm CTM, CRP và khám chuyên khoa hô hấp.",
      patientInstructionsPlain: "Bác An tạm dừng uống viên Osimertinib hôm nay. Hãy nghỉ ngơi, đo lại SpO2 sau mỗi 2 giờ. Điều dưỡng Mai sẽ gọi điện hướng dẫn và hẹn giờ kiểm tra lúc 18:00 hôm nay.",
      monitoring: "Theo dõi SpO2 liên tục, thân nhiệt mỗi 4 giờ, nhịp thở.",
      followUpAssignedTo: "ĐD. Lê Thị Mai",
      followUpTime: "Hôm nay · 18:00",
    });

    expect(s3.activeReport?.status).toBe("patient_notified");
    expect(s3.activeCarePlan.version).toBe(2);
    expect(s3.activeCarePlan.patientInstructionsPlain).toContain("Bác An tạm dừng uống viên Osimertinib hôm nay");
    expect(s3.activeCarePlan.followUpAssignedTo).toBe("ĐD. Lê Thị Mai");

    // 4. Patient acknowledges updated Care Plan V2
    const s4 = patientAcknowledgeCarePlan({
      carePlanVersionId: s3.activeCarePlan.id,
      expectedVersion: s3.activeReport!.workflowVersion,
    });

    expect(s4.activeReport?.status).toBe("acknowledged");
    expect(s4.acknowledgements.length).toBe(1);
    expect(s4.auditEvents.length).toBeGreaterThan(4);
  });
});
