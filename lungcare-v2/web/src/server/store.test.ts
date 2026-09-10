import { describe, expect, it, beforeEach } from "vitest";
import {
  resetClinicalState,
  readClinicalState,
  submitSymptomReport,
  nurseValidateReport,
  doctorSignOffDecision,
  patientAcknowledgeCarePlan,
} from "./store";

describe("Clinical State Store Lifecycle", () => {
  beforeEach(() => {
    resetClinicalState();
  });

  it("initializes with patient profile and initial Care Plan V1", () => {
    const state = readClinicalState();
    expect(state.patient.name).toBe("Nguyễn Văn An");
    expect(state.activeCarePlan.version).toBe(1);
    expect(state.activeReport).toBeNull();
  });

  it("completes full Patient -> Nurse -> Doctor -> Care Plan -> Patient loop with audit trail", () => {
    // 1. Patient reports diarrhea Grade 2 (>= 4 episodes)
    const { state: s1, reportId } = submitSymptomReport({
      symptom: "diarrhea",
      diarrheaEpisodes: 5,
      fever: true,
      notes: "Đi ngoài nhiều lần từ sáng, người mệt mỏi.",
    });

    expect(s1.activeReport?.status).toBe("submitted");
    expect(s1.activeReport?.workflowVersion).toBe(1);
    expect(s1.triageAssessment?.priority).toBe("review_today");
    expect(s1.triageAssessment?.triggers).toContain("diarrhea_episodes:gte_4");
    expect(s1.triageAssessment?.triggers).toContain("fever:true");

    // 2. Nurse validates and escalates
    const s2 = nurseValidateReport({
      reportId,
      expectedVersion: s1.activeReport!.workflowVersion,
      escalationRequired: true,
      context: "Đã gọi điện cho bệnh nhân. Mệt lả, phân lỏng 5 lần, sốt nhẹ 38.1C. Đề nghị bác sĩ xử trí độc tính TKI.",
    });

    expect(s2.activeReport?.status).toBe("escalated");
    expect(s2.activeReport?.workflowVersion).toBe(3);
    expect(s2.nurseValidation?.escalationRequired).toBe(true);

    // 3. Doctor reviews, signs decision and updates care plan
    const s3 = doctorSignOffDecision({
      reportId,
      expectedVersion: s2.activeReport!.workflowVersion,
      outcome: "care_plan_update",
      rationale: "Độc tính tiêu hóa độ 2 (CTCAE v5.0) do Osimertinib kết hợp sốt nhẹ.",
      newPlanSummary: "Tạm ngưng Osimertinib 48 giờ. Uống Loperamide 4mg khởi đầu, sau đó 2mg mỗi lần đi ngoài phân lỏng (tối đa 16mg/ngày). Bù nước Oresol 1000ml/ngày. Báo cáo lại sau 24h.",
    });

    expect(s3.activeReport?.status).toBe("patient_notified");
    expect(s3.activeCarePlan.version).toBe(2);
    expect(s3.activeCarePlan.summary).toContain("Tạm ngưng Osimertinib 48 giờ");
    expect(s3.carePlanVersions.length).toBe(2);

    // 4. Patient acknowledges new care plan
    const s4 = patientAcknowledgeCarePlan({
      carePlanVersionId: s3.activeCarePlan.id,
      expectedVersion: s3.activeReport!.workflowVersion,
    });

    expect(s4.activeReport?.status).toBe("acknowledged");
    expect(s4.acknowledgements.length).toBe(1);
    expect(s4.auditEvents.length).toBeGreaterThan(4);
  });
});
