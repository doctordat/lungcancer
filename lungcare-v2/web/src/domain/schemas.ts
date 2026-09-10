import { z } from "zod";

export const schemaVersion = "1.0.0" as const;
export const idSchema = z.string().uuid();
export const timestampSchema = z.string().datetime({ offset: true });
export const actorRoleSchema = z.enum(["patient", "nurse", "doctor", "system"]);
export const workflowStatusSchema = z.enum([
  "draft", "submitted", "nurse_validated", "escalated", "doctor_reviewed",
  "signed", "patient_notified", "acknowledged", "needs_information",
  "cancelled", "superseded",
]);

const versionedEntity = {
  id: idSchema,
  organizationId: idSchema,
  patientId: idSchema,
  schemaVersion: z.literal(schemaVersion),
  createdAt: timestampSchema,
};

export const symptomKindSchema = z.enum([
  "none", "dyspnea", "diarrhea", "pain", "fever", "rash", "nausea", "fatigue", "chest_pain", "other"
]);

export const dyspneaTriggerSchema = z.enum(["exertion_heavy", "walking", "at_rest"]).nullable();
export const progressionSchema = z.enum(["better", "same", "worse"]).nullable();

export const symptomReportSchema = z.object({
  ...versionedEntity,
  submittedBy: idSchema,
  symptom: symptomKindSchema,
  dyspneaTrigger: dyspneaTriggerSchema.default(null),
  progression: progressionSchema.default(null),
  spo2: z.number().min(50).max(100).nullable().default(null),
  temperature: z.number().min(34).max(43).nullable().default(null),
  diarrheaEpisodes: z.number().int().min(0).max(99).default(0),
  fever: z.boolean().default(false),
  notes: z.string().trim().max(1000).default(""),
  status: workflowStatusSchema,
  workflowVersion: z.number().int().min(0),
});

export const triagePrioritySchema = z.enum(["stable", "review_today", "urgent"]);
export const triageAssessmentSchema = z.object({
  ...versionedEntity,
  symptomReportId: idSchema,
  priority: triagePrioritySchema,
  ruleVersion: z.string().min(1),
  triggers: z.array(z.string().min(1)),
  explanation: z.string().min(1),
  clinicallyValidated: z.literal(false),
});

export const nurseValidationSchema = z.object({
  ...versionedEntity,
  symptomReportId: idSchema,
  validatedBy: idSchema,
  validatedAt: timestampSchema,
  repeatSpo2: z.number().min(50).max(100).nullable().default(null),
  respiratoryRate: z.number().min(5).max(60).nullable().default(null),
  temperature: z.number().min(34).max(43).nullable().default(null),
  dyspneaSeverity: z.enum(["none", "mild", "moderate", "at_rest"]).default("at_rest"),
  cough: z.boolean().default(true),
  chestPain: z.boolean().default(false),
  syncope: z.boolean().default(false),
  cyanosis: z.boolean().default(false),
  onsetProgression: z.string().trim().max(2000).default(""),
  escalationRequired: z.boolean(),
  context: z.string().trim().min(1).max(2000),
});

export const physicianDecisionSchema = z.object({
  ...versionedEntity,
  symptomReportId: idSchema,
  reviewedBy: idSchema,
  reviewedAt: timestampSchema,
  outcome: z.enum(["needs_information", "no_plan_change", "care_plan_update"]),
  differentials: z.array(z.string()).default([]),
  investigationsOrdered: z.array(z.string()).default([]),
  clinicalActions: z.string().trim().default(""),
  patientInstructionsPlain: z.string().trim().default(""),
  monitoring: z.string().trim().default(""),
  followUpAssignedTo: z.string().trim().default(""),
  followUpTime: z.string().trim().default(""),
  rationale: z.string().trim().min(1).max(4000),
  signedAt: timestampSchema.nullable(),
});

export const carePlanVersionSchema = z.object({
  ...versionedEntity,
  version: z.number().int().positive(),
  physicianDecisionId: idSchema,
  summary: z.string().trim().min(1).max(4000),
  patientInstructionsPlain: z.string().trim().default(""),
  clinicalActions: z.string().trim().default(""),
  monitoring: z.string().trim().default(""),
  followUpAssignedTo: z.string().trim().default(""),
  followUpTime: z.string().trim().default(""),
  signedBy: idSchema,
  signedByName: z.string().default("BS. CKII Trần Hoàng Long"),
  signedAt: timestampSchema,
  supersedesId: idSchema.nullable(),
});

export const workflowEventSchema = z.object({
  ...versionedEntity,
  symptomReportId: idSchema,
  actorId: idSchema,
  actorRole: actorRoleSchema,
  fromStatus: workflowStatusSchema,
  toStatus: workflowStatusSchema,
  reason: z.string().trim().min(1).max(2000),
  workflowVersion: z.number().int().positive(),
});

export const patientAcknowledgementSchema = z.object({
  ...versionedEntity,
  carePlanVersionId: idSchema,
  acknowledgedBy: idSchema,
  acknowledgedAt: timestampSchema,
});

export type ActorRole = z.infer<typeof actorRoleSchema>;
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;
export type SymptomKind = z.infer<typeof symptomKindSchema>;
export type DyspneaTrigger = z.infer<typeof dyspneaTriggerSchema>;
export type Progression = z.infer<typeof progressionSchema>;
export type SymptomReport = z.infer<typeof symptomReportSchema>;
export type TriageAssessment = z.infer<typeof triageAssessmentSchema>;
export type NurseValidation = z.infer<typeof nurseValidationSchema>;
export type PhysicianDecision = z.infer<typeof physicianDecisionSchema>;
export type CarePlanVersion = z.infer<typeof carePlanVersionSchema>;
export type WorkflowEvent = z.infer<typeof workflowEventSchema>;
export type PatientAcknowledgement = z.infer<typeof patientAcknowledgementSchema>;
