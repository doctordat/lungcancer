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

export const symptomKindSchema = z.enum(["none", "diarrhea", "rash", "dyspnea", "chest_pain"]);

export const symptomReportSchema = z.object({
  ...versionedEntity,
  submittedBy: idSchema,
  symptom: symptomKindSchema,
  diarrheaEpisodes: z.number().int().min(0).max(99),
  fever: z.boolean(),
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
  escalationRequired: z.boolean(),
  context: z.string().trim().min(1).max(2000),
});

export const physicianDecisionSchema = z.object({
  ...versionedEntity,
  symptomReportId: idSchema,
  reviewedBy: idSchema,
  reviewedAt: timestampSchema,
  outcome: z.enum(["needs_information", "no_plan_change", "care_plan_update"]),
  rationale: z.string().trim().min(1).max(4000),
  signedAt: timestampSchema.nullable(),
});

export const carePlanVersionSchema = z.object({
  ...versionedEntity,
  version: z.number().int().positive(),
  physicianDecisionId: idSchema,
  summary: z.string().trim().min(1).max(4000),
  signedBy: idSchema,
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
export type SymptomReport = z.infer<typeof symptomReportSchema>;
export type TriageAssessment = z.infer<typeof triageAssessmentSchema>;
export type NurseValidation = z.infer<typeof nurseValidationSchema>;
export type PhysicianDecision = z.infer<typeof physicianDecisionSchema>;
export type CarePlanVersion = z.infer<typeof carePlanVersionSchema>;
export type WorkflowEvent = z.infer<typeof workflowEventSchema>;
export type PatientAcknowledgement = z.infer<typeof patientAcknowledgementSchema>;
