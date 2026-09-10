import { describe, expect, it, beforeEach } from "vitest";
import {
  resetClinicalState,
  readClinicalState,
  submitSymptomReport,
  nurseValidateReport,
  doctorSignOffDecision,
  patientAcknowledgeCarePlan,
} from "./store";
import { WorkflowTransitionError } from "../domain/workflow";

describe("LungCare V4 Gate B1 Clinical Safety & Workflow Integrity", () => {
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

  // P0 Defect 1: Symptom-state contamination
  it("isolates symptom state: diarrhea report never inherits dyspnea SpO2, triggers or temperature", () => {
    // User started in dyspnea, had SpO2 91 and temp 38.1 in form memory, then switched to diarrhea
    const { state, reportId } = submitSymptomReport({
      symptom: "diarrhea",
      // Even if previous dyspnea values were in memory:
      dyspneaTrigger: "at_rest",
      progression: "worse",
      spo2: 91,
      temperature: 38.1,
      diarrheaEpisodes: 4,
      notes: "Đi ngoài 4 lần phân lỏng.",
    });

    expect(state.activeReport?.id).toBe(reportId);
    expect(state.activeReport?.symptom).toBe("diarrhea");
    expect(state.activeReport?.diarrheaEpisodes).toBe(4);
    // Incompatible dyspnea fields MUST be stripped / null
    expect(state.activeReport?.dyspneaTrigger).toBeNull();
    expect(state.activeReport?.progression).toBeNull();
    expect(state.activeReport?.spo2).toBeNull();
    expect(state.activeReport?.temperature).toBeNull();
  });

  // P0 Defect 2: Enforce workflow server-side & Patient -> Doctor shortcut guard
  it("guards against Doctor review/signoff before valid Nurse escalation", () => {
    // Patient submits symptom report
    const { state: s1, reportId } = submitSymptomReport({
      symptom: "dyspnea",
      dyspneaTrigger: "at_rest",
      spo2: 91,
      temperature: 38.1,
    });

    expect(s1.activeReport?.status).toBe("submitted");
    const initialAuditCount = s1.auditEvents.length;

    // Direct Doctor signoff attempt BEFORE nurse escalation MUST be blocked
    expect(() =>
      doctorSignOffDecision({
        reportId,
        expectedVersion: s1.activeReport!.workflowVersion,
        outcome: "care_plan_update",
        rationale: "Bác sĩ can thiệp sớm mà không qua điều dưỡng.",
      }),
    ).toThrowError(/CLINICAL_SAFETY_GUARD|locked until nursing assessment/i);

    // Assert state was not corrupted and no fraudulent audit event was added
    const sAfterFail = readClinicalState();
    expect(sAfterFail.activeReport?.status).toBe("submitted");
    expect(sAfterFail.auditEvents.length).toBe(initialAuditCount);
  });

  // P0 Defect 3 & 4: Safe physician decision model & empty decision guard
  it("rejects doctor sign-off if rationale is empty", () => {
    // 1. Patient submits
    const { state: s1, reportId } = submitSymptomReport({
      symptom: "dyspnea",
      dyspneaTrigger: "at_rest",
      spo2: 91,
      temperature: 38.1,
    });

    // 2. Nurse escalates
    const s2 = nurseValidateReport({
      reportId,
      expectedVersion: s1.activeReport!.workflowVersion,
      repeatSpo2: 91,
      respiratoryRate: 24,
      temperature: 38.1,
      escalationRequired: true,
      context: "Đã liên hệ điều dưỡng và chuyển tuyến.",
    });

    expect(s2.activeReport?.status).toBe("escalated");

    // 3. Attempt signoff with empty rationale
    expect(() =>
      doctorSignOffDecision({
        reportId,
        expectedVersion: s2.activeReport!.workflowVersion,
        outcome: "care_plan_update",
        rationale: "   ", // Empty whitespace
      }),
    ).toThrowError(/rationale/i);

    // Assert status remained escalated (not signed)
    const sAfterFail = readClinicalState();
    expect(sAfterFail.activeReport?.status).toBe("escalated");
  });

  // P0 Defect 5: Stale expectedVersion and mutation failures
  it("rejects nurse validation on stale expectedVersion or invalid reportId", () => {
    const { state: s1, reportId } = submitSymptomReport({
      symptom: "dyspnea",
      dyspneaTrigger: "at_rest",
      spo2: 91,
      temperature: 38.1,
    });

    // Stale version
    expect(() =>
      nurseValidateReport({
        reportId,
        expectedVersion: 999, // wrong version
        escalationRequired: true,
        context: "Ghi chú điều dưỡng",
      }),
    ).toThrowError(WorkflowTransitionError);

    // Invalid reportId
    expect(() =>
      nurseValidateReport({
        reportId: "00000000-0000-0000-0000-000000000000",
        expectedVersion: s1.activeReport!.workflowVersion,
        escalationRequired: true,
        context: "Ghi chú điều dưỡng",
      }),
    ).toThrowError(/Không tìm thấy báo cáo/);
  });

  // P0 Defect 7 & 8: Complete closed loop, persistence, and audit integrity
  it("executes the full closed loop with intact audit trail and disk persistence", () => {
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
    expect(s1.triageAssessment?.priority).toBe("urgent");

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

    // 3. Doctor reviews & signs decision with explicit rationale
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

    // 4. Patient acknowledges updated Care Plan V2
    const s4 = patientAcknowledgeCarePlan({
      carePlanVersionId: s3.activeCarePlan.id,
      expectedVersion: s3.activeReport!.workflowVersion,
    });

    expect(s4.activeReport?.status).toBe("acknowledged");
    expect(s4.acknowledgements.length).toBe(1);

    // Verify audit events integrity
    expect(s4.auditEvents.length).toBeGreaterThanOrEqual(5);
    const statuses = s4.auditEvents.map((e) => e.toStatus);
    expect(statuses).toContain("submitted");
    expect(statuses).toContain("escalated");
    expect(statuses).toContain("signed");
    expect(statuses).toContain("patient_notified");
    expect(statuses).toContain("acknowledged");

    // Verify disk reload persistence
    const reloaded = readClinicalState();
    expect(reloaded.activeReport?.status).toBe("acknowledged");
    expect(reloaded.activeCarePlan.version).toBe(2);
  });
});
