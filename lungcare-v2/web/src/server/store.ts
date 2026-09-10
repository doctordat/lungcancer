import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  schemaVersion,
  type SymptomReport,
  type TriageAssessment,
  type NurseValidation,
  type PhysicianDecision,
  type CarePlanVersion,
  type WorkflowEvent,
  type PatientAcknowledgement,
  type WorkflowStatus,
  type SymptomKind,
} from "../domain/schemas";
import { assessDemoTriage } from "../domain/triage";
import { transitionWorkflow, WorkflowTransitionError } from "../domain/workflow";

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  medicalRecordNumber: string;
  diagnosis: string;
  mutation: string;
  regimen: string;
  currentCycle: string;
  hospital: string;
  primaryDoctorName: string;
  primaryDoctorTitle: string;
  primaryNurseName: string;
}

export interface ClinicalStateBundle {
  patient: PatientProfile;
  organizationId: string;
  activeReport: SymptomReport | null;
  triageAssessment: TriageAssessment | null;
  nurseValidation: NurseValidation | null;
  physicianDecision: PhysicianDecision | null;
  carePlanVersions: CarePlanVersion[];
  activeCarePlan: CarePlanVersion;
  acknowledgements: PatientAcknowledgement[];
  auditEvents: WorkflowEvent[];
  updatedAt: string;
}

const ORG_ID = "11111111-1111-4111-8111-111111111111";
const PATIENT_ID = "22222222-2222-4222-8222-222222222222";
const NURSE_ID = "33333333-3333-4333-8333-333333333333";
const DOCTOR_ID = "44444444-4444-4444-8444-444444444444";
const SYSTEM_ID = "00000000-0000-4000-8000-000000000000";

const INITIAL_CARE_PLAN_ID = "55555555-5555-4555-8555-555555555555";
const INITIAL_DECISION_ID = "66666666-6666-4666-8666-666666666666";

const DEFAULT_PATIENT: PatientProfile = {
  id: PATIENT_ID,
  name: "Nguyễn Văn An",
  age: 58,
  gender: "Nam",
  medicalRecordNumber: "HSBA-2026-9481",
  diagnosis: "K Phổi không tế bào nhỏ (NSCLC) Giai đoạn IVB",
  mutation: "EGFR Exon 21 L858R (+)",
  regimen: "Osimertinib 80mg (1 viên/ngày, uống sáng 08:00)",
  currentCycle: "Chu kỳ 3 — Ngày 14 / 28",
  hospital: "Trung tâm Ung bướu — Khoa Nội Lồng ngực",
  primaryDoctorName: "BS. CKII Trần Hoàng Long",
  primaryDoctorTitle: "Trưởng khoa Nội Ung bướu Phổi",
  primaryNurseName: "ĐD. Lê Thị Mai",
};

const DEFAULT_INITIAL_PLAN: CarePlanVersion = {
  id: INITIAL_CARE_PLAN_ID,
  organizationId: ORG_ID,
  patientId: PATIENT_ID,
  schemaVersion,
  createdAt: "2026-09-01T08:00:00.000Z",
  version: 1,
  physicianDecisionId: INITIAL_DECISION_ID,
  summary: "Duy trì Osimertinib 80mg/ngày. Uống đúng giờ buổi sáng sau ăn. Theo dõi sát tần suất đại tiện và dấu hiệu sốt. Báo cáo ngay trên LungCare nếu có khó thở hoặc tiêu chảy từ 4 lần/ngày.",
  signedBy: DOCTOR_ID,
  signedAt: "2026-09-01T08:00:00.000Z",
  supersedesId: null,
};

function getInitialState(): ClinicalStateBundle {
  return {
    patient: DEFAULT_PATIENT,
    organizationId: ORG_ID,
    activeReport: null,
    triageAssessment: null,
    nurseValidation: null,
    physicianDecision: null,
    carePlanVersions: [DEFAULT_INITIAL_PLAN],
    activeCarePlan: DEFAULT_INITIAL_PLAN,
    acknowledgements: [],
    auditEvents: [
      {
        id: crypto.randomUUID(),
        organizationId: ORG_ID,
        patientId: PATIENT_ID,
        schemaVersion,
        createdAt: "2026-09-01T08:00:00.000Z",
        symptomReportId: INITIAL_DECISION_ID,
        actorId: DOCTOR_ID,
        actorRole: "doctor",
        fromStatus: "draft",
        toStatus: "signed",
        reason: "Khởi tạo Kế hoạch Chăm sóc V1 (Phác đồ Osimertinib 80mg)",
        workflowVersion: 1,
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(DATA_DIR, "clinical-store.json");

let memoryStateCache: ClinicalStateBundle | null = null;

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // In restricted env fallback to memory
  }
}

export function readClinicalState(): ClinicalStateBundle {
  if (memoryStateCache) {
    return memoryStateCache;
  }
  ensureDataDir();
  try {
    if (fs.existsSync(STATE_FILE)) {
      const content = fs.readFileSync(STATE_FILE, "utf-8");
      memoryStateCache = JSON.parse(content) as ClinicalStateBundle;
      return memoryStateCache;
    }
  } catch {
    // If parse fails or file doesn't exist, create fresh
  }
  const initial = getInitialState();
  saveClinicalState(initial);
  return initial;
}

export function saveClinicalState(state: ClinicalStateBundle): void {
  memoryStateCache = state;
  ensureDataDir();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Keep in memory if write fails
  }
}

export function resetClinicalState(): ClinicalStateBundle {
  const fresh = getInitialState();
  saveClinicalState(fresh);
  return fresh;
}

// 1. Patient Submits Symptom Report
export function submitSymptomReport(input: {
  symptom: SymptomKind;
  diarrheaEpisodes: number;
  fever: boolean;
  notes: string;
}): { state: ClinicalStateBundle; reportId: string } {
  const state = readClinicalState();
  const now = new Date().toISOString();
  const reportId = crypto.randomUUID();
  const triageId = crypto.randomUUID();

  // Run deterministic triage engine
  const triageResult = assessDemoTriage({
    symptom: input.symptom,
    diarrheaEpisodes: input.diarrheaEpisodes,
    fever: input.fever,
  });

  const triageAssessment: TriageAssessment = {
    id: triageId,
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: reportId,
    priority: triageResult.priority,
    ruleVersion: triageResult.ruleVersion,
    triggers: triageResult.triggers,
    explanation: triageResult.explanation,
    clinicallyValidated: false,
  };

  const initialWorkflow = {
    symptomReportId: reportId,
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    status: "draft" as const,
    version: 0,
    updatedAt: now,
  };

  const transitioned = transitionWorkflow(initialWorkflow, {
    actorId: PATIENT_ID,
    actorRole: "patient",
    toStatus: "submitted",
    reason: `Người bệnh báo cáo triệu chứng: ${input.symptom !== "none" ? input.symptom : "Đánh giá định kỳ"}. Phân tầng ưu tiên: ${triageResult.priority.toUpperCase()}`,
    expectedVersion: 0,
    occurredAt: now,
  });

  const symptomReport: SymptomReport = {
    id: reportId,
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    submittedBy: PATIENT_ID,
    symptom: input.symptom,
    diarrheaEpisodes: input.diarrheaEpisodes,
    fever: input.fever,
    notes: input.notes.trim(),
    status: transitioned.status,
    workflowVersion: transitioned.version,
  };

  const auditEvent: WorkflowEvent = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: reportId,
    actorId: PATIENT_ID,
    actorRole: "patient",
    fromStatus: "draft",
    toStatus: "submitted",
    reason: `Báo cáo mới đã gửi. Triệu chứng: ${input.symptom}, Tiêu chảy: ${input.diarrheaEpisodes} lần, Sốt: ${input.fever ? "Có" : "Không"}. Triage: ${triageResult.priority}`,
    workflowVersion: transitioned.version,
  };

  state.activeReport = symptomReport;
  state.triageAssessment = triageAssessment;
  state.nurseValidation = null;
  state.physicianDecision = null;
  state.auditEvents.unshift(auditEvent);
  state.updatedAt = now;

  saveClinicalState(state);
  return { state, reportId };
}

// 2. Nurse Validates / Escalates
export function nurseValidateReport(input: {
  reportId: string;
  expectedVersion: number;
  escalationRequired: boolean;
  context: string;
}): ClinicalStateBundle {
  const state = readClinicalState();
  if (!state.activeReport || state.activeReport.id !== input.reportId) {
    throw new Error("Không tìm thấy báo cáo triệu chứng cần xử lý.");
  }

  const now = new Date().toISOString();
  const currentWorkflow = {
    symptomReportId: state.activeReport.id,
    organizationId: state.activeReport.organizationId,
    patientId: state.activeReport.patientId,
    status: state.activeReport.status,
    version: state.activeReport.workflowVersion,
    updatedAt: state.activeReport.createdAt,
  };

  // 1st step: validate
  const validatedWorkflow = transitionWorkflow(currentWorkflow, {
    actorId: NURSE_ID,
    actorRole: "nurse",
    toStatus: "nurse_validated",
    reason: `Điều dưỡng xác minh lâm sàng: ${input.context}`,
    expectedVersion: input.expectedVersion,
    occurredAt: now,
  });

  let finalWorkflow = validatedWorkflow;
  let toStatus: WorkflowStatus = "nurse_validated";

  if (input.escalationRequired) {
    // 2nd step: escalate to doctor
    finalWorkflow = transitionWorkflow(validatedWorkflow, {
      actorId: NURSE_ID,
      actorRole: "nurse",
      toStatus: "escalated",
      reason: `Điều dưỡng chuyển khẩn bác sĩ: ${input.context}`,
      expectedVersion: validatedWorkflow.version,
      occurredAt: now,
    });
    toStatus = "escalated";
  }

  const validationRecord: NurseValidation = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: input.reportId,
    validatedBy: NURSE_ID,
    validatedAt: now,
    escalationRequired: input.escalationRequired,
    context: input.context.trim(),
  };

  const auditEvent: WorkflowEvent = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: input.reportId,
    actorId: NURSE_ID,
    actorRole: "nurse",
    fromStatus: state.activeReport.status,
    toStatus,
    reason: input.escalationRequired
      ? `Đã xác minh và chuyển bác sĩ điều trị (Escalated). Ghi chú: ${input.context}`
      : `Đã xác minh thông tin điều dưỡng. Ghi chú: ${input.context}`,
    workflowVersion: finalWorkflow.version,
  };

  state.activeReport.status = finalWorkflow.status;
  state.activeReport.workflowVersion = finalWorkflow.version;
  state.nurseValidation = validationRecord;
  state.auditEvents.unshift(auditEvent);
  state.updatedAt = now;

  saveClinicalState(state);
  return state;
}

// 3. Doctor Reviews, Signs Decision & Updates Care Plan
export function doctorSignOffDecision(input: {
  reportId: string;
  expectedVersion: number;
  outcome: "care_plan_update" | "no_plan_change" | "needs_information";
  rationale: string;
  newPlanSummary?: string;
  doctorName?: string;
}): ClinicalStateBundle {
  const state = readClinicalState();
  if (!state.activeReport || state.activeReport.id !== input.reportId) {
    throw new Error("Không tìm thấy báo cáo lâm sàng.");
  }

  const now = new Date().toISOString();
  const currentWorkflow = {
    symptomReportId: state.activeReport.id,
    organizationId: state.activeReport.organizationId,
    patientId: state.activeReport.patientId,
    status: state.activeReport.status,
    version: state.activeReport.workflowVersion,
    updatedAt: state.activeReport.createdAt,
  };

  // Step 1: Doctor reviewed
  const reviewedWorkflow = transitionWorkflow(currentWorkflow, {
    actorId: DOCTOR_ID,
    actorRole: "doctor",
    toStatus: "doctor_reviewed",
    reason: `Bác sĩ hoàn thành đánh giá lâm sàng. Hướng xử trí: ${input.outcome}`,
    expectedVersion: input.expectedVersion,
    occurredAt: now,
  });

  // Step 2: Doctor signs decision
  const signedWorkflow = transitionWorkflow(reviewedWorkflow, {
    actorId: DOCTOR_ID,
    actorRole: "doctor",
    toStatus: "signed",
    reason: `Bác sĩ ký duyệt quyết định lâm sàng. Biện luận: ${input.rationale}`,
    expectedVersion: reviewedWorkflow.version,
    occurredAt: now,
  });

  // Step 3: System automatically notifies patient
  const notifiedWorkflow = transitionWorkflow(signedWorkflow, {
    actorId: SYSTEM_ID,
    actorRole: "system",
    toStatus: "patient_notified",
    reason: "Hệ thống tự động thông báo kế hoạch chăm sóc mới tới người bệnh",
    expectedVersion: signedWorkflow.version,
    occurredAt: now,
  });

  const decisionId = crypto.randomUUID();
  const decisionRecord: PhysicianDecision = {
    id: decisionId,
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: input.reportId,
    reviewedBy: DOCTOR_ID,
    reviewedAt: now,
    outcome: input.outcome,
    rationale: input.rationale.trim(),
    signedAt: now,
  };

  // If care plan update, increment version and create CarePlanVersion
  if (input.outcome === "care_plan_update" && input.newPlanSummary) {
    const nextVersionNumber = state.activeCarePlan ? state.activeCarePlan.version + 1 : 2;
    const newCarePlan: CarePlanVersion = {
      id: crypto.randomUUID(),
      organizationId: ORG_ID,
      patientId: PATIENT_ID,
      schemaVersion,
      createdAt: now,
      version: nextVersionNumber,
      physicianDecisionId: decisionId,
      summary: input.newPlanSummary.trim(),
      signedBy: DOCTOR_ID,
      signedAt: now,
      supersedesId: state.activeCarePlan ? state.activeCarePlan.id : null,
    };
    state.carePlanVersions.unshift(newCarePlan);
    state.activeCarePlan = newCarePlan;
  }

  const auditDecision: WorkflowEvent = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: input.reportId,
    actorId: DOCTOR_ID,
    actorRole: "doctor",
    fromStatus: state.activeReport.status,
    toStatus: "signed",
    reason: `Bác sĩ ký duyệt: ${input.outcome}. Biện luận: ${input.rationale}`,
    workflowVersion: signedWorkflow.version,
  };

  const auditNotify: WorkflowEvent = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: input.reportId,
    actorId: SYSTEM_ID,
    actorRole: "system",
    fromStatus: "signed",
    toStatus: "patient_notified",
    reason: "Đã gửi thông báo cập nhật Kế hoạch Chăm sóc tới người bệnh",
    workflowVersion: notifiedWorkflow.version,
  };

  state.activeReport.status = notifiedWorkflow.status;
  state.activeReport.workflowVersion = notifiedWorkflow.version;
  state.physicianDecision = decisionRecord;
  state.auditEvents.unshift(auditNotify);
  state.auditEvents.unshift(auditDecision);
  state.updatedAt = now;

  saveClinicalState(state);
  return state;
}

// 4. Patient Acknowledges Updated Care Plan
export function patientAcknowledgeCarePlan(input: {
  carePlanVersionId: string;
  expectedVersion: number;
}): ClinicalStateBundle {
  const state = readClinicalState();
  if (!state.activeReport) {
    throw new Error("Không có báo cáo lâm sàng đang hoạt động.");
  }

  const now = new Date().toISOString();
  const currentWorkflow = {
    symptomReportId: state.activeReport.id,
    organizationId: state.activeReport.organizationId,
    patientId: state.activeReport.patientId,
    status: state.activeReport.status,
    version: state.activeReport.workflowVersion,
    updatedAt: state.activeReport.createdAt,
  };

  const acknowledgedWorkflow = transitionWorkflow(currentWorkflow, {
    actorId: PATIENT_ID,
    actorRole: "patient",
    toStatus: "acknowledged",
    reason: "Người bệnh xác nhận đã đọc, hiểu và tuân thủ kế hoạch điều trị mới",
    expectedVersion: input.expectedVersion,
    occurredAt: now,
  });

  const ackRecord: PatientAcknowledgement = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    carePlanVersionId: input.carePlanVersionId,
    acknowledgedBy: PATIENT_ID,
    acknowledgedAt: now,
  };

  const auditEvent: WorkflowEvent = {
    id: crypto.randomUUID(),
    organizationId: ORG_ID,
    patientId: PATIENT_ID,
    schemaVersion,
    createdAt: now,
    symptomReportId: state.activeReport.id,
    actorId: PATIENT_ID,
    actorRole: "patient",
    fromStatus: "patient_notified",
    toStatus: "acknowledged",
    reason: `Người bệnh xác nhận tuân thủ Kế hoạch Chăm sóc V${state.activeCarePlan.version}`,
    workflowVersion: acknowledgedWorkflow.version,
  };

  state.activeReport.status = acknowledgedWorkflow.status;
  state.activeReport.workflowVersion = acknowledgedWorkflow.version;
  state.acknowledgements.unshift(ackRecord);
  state.auditEvents.unshift(auditEvent);
  state.updatedAt = now;

  saveClinicalState(state);
  return state;
}

export { WorkflowTransitionError };
