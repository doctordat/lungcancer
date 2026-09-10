import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  schemaVersion,
  sanitizeSymptomInput,
  type SymptomReport,
  type TriageAssessment,
  type NurseValidation,
  type PhysicianDecision,
  type CarePlanVersion,
  type WorkflowEvent,
  type PatientAcknowledgement,
  type WorkflowStatus,
  type SymptomKind,
  type DyspneaTrigger,
  type Progression,
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
  histology: string;
  stage: string;
  mutation: string;
  regimen: string;
  currentCycle: string;
  dayInCycle: number;
  totalCycleDays: number;
  adherencePercent: number;
  recistResponse: string;
  targetLesions: string;
  baselineEcog: number;
  currentEcog: string;
  qtc: number;
  egfr: number;
  weightBaseline: number;
  weightCurrent: number;
  weightLossKg: number;
  hospital: string;
  primaryDoctorName: string;
  primaryDoctorTitle: string;
  primaryNurseName: string;
  toxicities: { name: string; grade: string; note: string }[];
  weightTrend: { date: string; weight: number }[];
  spo2Trend: { date: string; value: number }[];
  upcomingAppointments: { title: string; date: string; remainingDays: number; prep: string }[];
  dailyTasks: { id: string; time: string; title: string; completed: boolean; required: boolean }[];
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
  diagnosis: "Ung thư phổi không tế bào nhỏ (NSCLC) Tuyến",
  histology: "Adenocarcinoma",
  stage: "Giai đoạn IVB",
  mutation: "EGFR L858R dương tính (Exon 21)",
  regimen: "Osimertinib 80 mg hàng ngày",
  currentCycle: "Chu kỳ 3",
  dayInCycle: 14,
  totalCycleDays: 28,
  adherencePercent: 96,
  recistResponse: "PR −34% (Đáp ứng một phần)",
  targetLesions: "Khối u mục tiêu ↓ 34%, không có tổn thương mới",
  baselineEcog: 0,
  currentEcog: "0 → Đang đánh giá",
  qtc: 432,
  egfr: 86,
  weightBaseline: 64.0,
  weightCurrent: 62.8,
  weightLossKg: 1.2,
  hospital: "Bệnh viện K — Trung tâm Ung bướu",
  primaryDoctorName: "BS. CKII Trần Hoàng Long",
  primaryDoctorTitle: "Khoa Nội Ung bướu Phổi",
  primaryNurseName: "ĐD. Lê Thị Mai",
  toxicities: [
    { name: "Tiêu chảy", grade: "Độ 2 (G2)", note: "4-5 lần/ngày, đang bù Oresol" },
    { name: "Phát ban da", grade: "Độ 1 (G1)", note: "Mẩn nhẹ vùng mặt/ngực" },
    { name: "Khó thở", grade: "Chưa phân độ", note: "Đợt mới khởi phát hôm nay" },
  ],
  weightTrend: [
    { date: "01/08", weight: 64.0 },
    { date: "15/08", weight: 64.0 },
    { date: "01/09", weight: 63.0 },
    { date: "10/09", weight: 62.8 },
  ],
  spo2Trend: [
    { date: "01/09", value: 98 },
    { date: "05/09", value: 97 },
    { date: "08/09", value: 96 },
    { date: "10/09", value: 91 },
  ],
  upcomingAppointments: [
    {
      title: "Chụp CT ngực đối chiếu",
      date: "15/09/2026",
      remainingDays: 5,
      prep: "Nhịn ăn 4 tiếng trước chụp. Đã có xét nghiệm chức năng thận eGFR 86 (Đủ điều kiện).",
    },
  ],
  dailyTasks: [
    { id: "task-1", time: "08:00", title: "Uống Osimertinib 80 mg", completed: true, required: true },
    { id: "task-2", time: "14:00", title: "Kiểm tra triệu chứng hàng ngày", completed: false, required: true },
    { id: "task-3", time: "16:30", title: "Xét nghiệm máu định kỳ", completed: false, required: false },
  ],
};

const DEFAULT_INITIAL_PLAN: CarePlanVersion = {
  id: INITIAL_CARE_PLAN_ID,
  organizationId: ORG_ID,
  patientId: PATIENT_ID,
  schemaVersion,
  createdAt: "2026-09-01T08:00:00.000Z",
  version: 1,
  physicianDecisionId: INITIAL_DECISION_ID,
  summary: "Duy trì Osimertinib 80 mg hàng ngày. Uống vào 08:00 sáng sau ăn. Theo dõi sát tần suất đại tiện và báo cáo nếu sốt hoặc khó thở.",
  patientInstructionsPlain: "Bác An tiếp tục uống viên Osimertinib 80mg mỗi sáng sau ăn. Ăn chín uống sôi và theo dõi cân nặng hàng tuần.",
  clinicalActions: "Duy trì phác đồ Osimertinib 80mg/ngày. Đánh giá đáp ứng chu kỳ 3.",
  monitoring: "Theo dõi SpO2, thân nhiệt, cân nặng hàng ngày.",
  followUpAssignedTo: "ĐD. Lê Thị Mai",
  followUpTime: "Khám định kỳ 15/09",
  signedBy: DOCTOR_ID,
  signedByName: "BS. CKII Trần Hoàng Long",
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
        reason: "Khởi tạo Kế hoạch Chăm sóc V1 (Phác đồ Osimertinib 80 mg Chu kỳ 3)",
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
    // Memory fallback
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
    // If parse fails
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
    // Keep in memory
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
  dyspneaTrigger?: DyspneaTrigger;
  progression?: Progression;
  spo2?: number | null;
  temperature?: number | null;
  diarrheaEpisodes?: number;
  fever?: boolean;
  notes?: string;
}): { state: ClinicalStateBundle; reportId: string } {
  const state = readClinicalState();
  const now = new Date().toISOString();
  const reportId = crypto.randomUUID();
  const triageId = crypto.randomUUID();

  // Strict symptom state isolation
  const sanitized = sanitizeSymptomInput(input);

  // Run deterministic triage engine
  const triageResult = assessDemoTriage({
    symptom: sanitized.symptom,
    dyspneaTrigger: sanitized.dyspneaTrigger,
    progression: sanitized.progression,
    spo2: sanitized.spo2,
    temperature: sanitized.temperature,
    diarrheaEpisodes: sanitized.diarrheaEpisodes,
    fever: sanitized.fever,
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
    reason: `Người bệnh gửi kiểm tra triệu chứng: ${sanitized.symptom === "dyspnea" ? "Khó thở đợt mới" : sanitized.symptom}. Phân tầng ưu tiên: ${triageResult.priority.toUpperCase()}`,
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
    symptom: sanitized.symptom,
    dyspneaTrigger: sanitized.dyspneaTrigger,
    progression: sanitized.progression,
    spo2: sanitized.spo2,
    temperature: sanitized.temperature,
    diarrheaEpisodes: sanitized.diarrheaEpisodes,
    fever: sanitized.fever,
    notes: sanitized.notes,
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
    reason: `Báo cáo triệu chứng: ${sanitized.symptom}, SpO2 ${sanitized.spo2 !== null ? sanitized.spo2 + "%" : "N/A"}, Thân nhiệt ${sanitized.temperature !== null ? sanitized.temperature + "°C" : "N/A"}. Triage: ${triageResult.priority}`,
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
  repeatSpo2?: number | null;
  respiratoryRate?: number | null;
  temperature?: number | null;
  dyspneaSeverity?: "none" | "mild" | "moderate" | "at_rest";
  cough?: boolean;
  chestPain?: boolean;
  syncope?: boolean;
  cyanosis?: boolean;
  onsetProgression?: string;
  escalationRequired: boolean;
  context: string;
}): ClinicalStateBundle {
  const state = readClinicalState();
  if (!state.activeReport || state.activeReport.id !== input.reportId) {
    throw new Error("Không tìm thấy báo cáo cần đánh giá.");
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

  // Step 1: nurse_assessed
  const assessedWorkflow = transitionWorkflow(currentWorkflow, {
    actorId: NURSE_ID,
    actorRole: "nurse",
    toStatus: "nurse_assessed",
    reason: `Điều dưỡng Lê Thị Mai hoàn tất đánh giá hô hấp: ${input.context}`,
    expectedVersion: input.expectedVersion,
    occurredAt: now,
  });

  let finalWorkflow = assessedWorkflow;
  let toStatus: WorkflowStatus = "nurse_assessed";

  if (input.escalationRequired) {
    // Step 2: escalated
    finalWorkflow = transitionWorkflow(assessedWorkflow, {
      actorId: NURSE_ID,
      actorRole: "nurse",
      toStatus: "escalated",
      reason: `Điều dưỡng chuyển khẩn Bác sĩ Trần Hoàng Long: ${input.context}`,
      expectedVersion: assessedWorkflow.version,
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
    repeatSpo2: typeof input.repeatSpo2 === "number" ? input.repeatSpo2 : 91,
    respiratoryRate: typeof input.respiratoryRate === "number" ? input.respiratoryRate : 24,
    temperature: typeof input.temperature === "number" ? input.temperature : 38.1,
    dyspneaSeverity: input.dyspneaSeverity || "at_rest",
    cough: input.cough ?? true,
    chestPain: input.chestPain ?? false,
    syncope: input.syncope ?? false,
    cyanosis: input.cyanosis ?? false,
    onsetProgression: (input.onsetProgression || "").trim(),
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
      ? `Điều dưỡng xác minh đánh giá hô hấp và chuyển khẩn Bác sĩ. SpO2 đo lại: ${input.repeatSpo2 || 91}%, Nhịp thở: ${input.respiratoryRate || 24} l/p`
      : `Điều dưỡng hoàn tất xác minh triệu chứng.`,
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

// 3. Doctor Reviews, Signs Decision & Updates Shared Care Plan
export function doctorSignOffDecision(input: {
  reportId: string;
  expectedVersion: number;
  outcome: "care_plan_update" | "no_plan_change" | "needs_information";
  rationale: string;
  differentials?: string[];
  investigationsOrdered?: string[];
  clinicalActions?: string;
  patientInstructionsPlain?: string;
  monitoring?: string;
  followUpAssignedTo?: string;
  followUpTime?: string;
  doctorName?: string;
}): ClinicalStateBundle {
  const state = readClinicalState();
  if (!state.activeReport || state.activeReport.id !== input.reportId) {
    throw new Error("Không tìm thấy ca bệnh cần duyệt.");
  }

  // CLINICAL SAFETY GUARD: Doctor cannot review or sign before Nurse has escalated!
  if (!["escalated", "doctor_reviewing", "decision_drafted"].includes(state.activeReport.status)) {
    throw new WorkflowTransitionError(
      `CLINICAL_SAFETY_GUARD: Doctor review is locked until nursing assessment and escalation are completed (current status: ${state.activeReport.status}).`,
      "INVALID_TRANSITION",
    );
  }

  if (!input.rationale || input.rationale.trim().length === 0) {
    throw new Error("Căn cứ lâm sàng (rationale) của bác sĩ không được để trống.");
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

  // Step 1: Doctor signs decision
  const signedWorkflow = transitionWorkflow(currentWorkflow, {
    actorId: DOCTOR_ID,
    actorRole: "doctor",
    toStatus: "signed",
    reason: `Bác sĩ ký duyệt quyết định lâm sàng (${input.outcome}). Biện luận: ${input.rationale}`,
    expectedVersion: input.expectedVersion,
    occurredAt: now,
  });

  // Step 2: System notifies patient
  const notifiedWorkflow = transitionWorkflow(signedWorkflow, {
    actorId: SYSTEM_ID,
    actorRole: "system",
    toStatus: "patient_notified",
    reason: "Hệ thống tự động đồng bộ Kế hoạch Chăm sóc cập nhật tới Người bệnh và Điều dưỡng",
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
    differentials: input.differentials || [],
    investigationsOrdered: input.investigationsOrdered || [],
    clinicalActions: input.clinicalActions || "",
    patientInstructionsPlain: input.patientInstructionsPlain || "",
    monitoring: input.monitoring || "",
    followUpAssignedTo: input.followUpAssignedTo || "ĐD. Lê Thị Mai",
    followUpTime: input.followUpTime || "Hôm nay · 18:00",
    rationale: input.rationale.trim(),
    signedAt: now,
  };

  // Care Plan Version increment
  if (input.outcome === "care_plan_update") {
    const nextVersionNumber = state.activeCarePlan ? state.activeCarePlan.version + 1 : 2;
    const newCarePlan: CarePlanVersion = {
      id: crypto.randomUUID(),
      organizationId: ORG_ID,
      patientId: PATIENT_ID,
      schemaVersion,
      createdAt: now,
      version: nextVersionNumber,
      physicianDecisionId: decisionId,
      summary: input.clinicalActions || "Cập nhật kế hoạch chăm sóc theo chỉ định bác sĩ.",
      patientInstructionsPlain: input.patientInstructionsPlain || "Bác An tuân thủ theo hướng dẫn mới từ bác sĩ.",
      clinicalActions: input.clinicalActions || "",
      monitoring: input.monitoring || "",
      followUpAssignedTo: input.followUpAssignedTo || "ĐD. Lê Thị Mai",
      followUpTime: input.followUpTime || "Hôm nay · 18:00",
      signedBy: DOCTOR_ID,
      signedByName: input.doctorName || "BS. CKII Trần Hoàng Long",
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
    reason: `Bác sĩ ký duyệt quyết định (${input.outcome}). Kế hoạch Chăm sóc V${state.activeCarePlan.version}.`,
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
    reason: "Đã gửi thông báo kế hoạch chăm sóc mới tới người bệnh và gán lịch tái đánh giá cho điều dưỡng",
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

// 4. Patient Acknowledges Care Plan
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
    reason: "Người bệnh xác nhận đã hiểu và tuân thủ kế hoạch điều trị mới",
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
