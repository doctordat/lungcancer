import { z } from "zod";
import {
  actorRoleSchema,
  idSchema,
  timestampSchema,
  workflowStatusSchema,
  type ActorRole,
  type WorkflowStatus,
} from "./schemas";

export const workflowAggregateSchema = z.object({
  symptomReportId: idSchema,
  organizationId: idSchema,
  patientId: idSchema,
  status: workflowStatusSchema,
  version: z.number().int().min(0),
  updatedAt: timestampSchema,
});

export const transitionRequestSchema = z.object({
  actorId: idSchema,
  actorRole: actorRoleSchema,
  toStatus: workflowStatusSchema,
  reason: z.string().trim().min(1).max(2000),
  expectedVersion: z.number().int().min(0),
  occurredAt: timestampSchema,
});

export type WorkflowAggregate = z.infer<typeof workflowAggregateSchema>;
export type TransitionRequest = z.infer<typeof transitionRequestSchema>;

type TransitionRule = {
  from: WorkflowStatus;
  to: WorkflowStatus;
  roles: readonly ActorRole[];
};

const rules: readonly TransitionRule[] = [
  // 1. Patient initiates
  { from: "draft", to: "submitted", roles: ["patient"] },

  // 2. Nurse processes and reviews
  { from: "submitted", to: "nurse_reviewing", roles: ["nurse"] },
  { from: "submitted", to: "nurse_assessed", roles: ["nurse"] },
  { from: "submitted", to: "escalated", roles: ["nurse"] },
  { from: "submitted", to: "needs_information", roles: ["nurse"] },

  { from: "nurse_reviewing", to: "nurse_assessed", roles: ["nurse"] },
  { from: "nurse_reviewing", to: "escalated", roles: ["nurse"] },
  { from: "nurse_reviewing", to: "needs_information", roles: ["nurse"] },

  { from: "nurse_assessed", to: "escalated", roles: ["nurse"] },
  { from: "nurse_assessed", to: "needs_information", roles: ["nurse"] },

  // 3. Doctor review (STRICT GUARD: Only accessible AFTER valid escalation)
  { from: "escalated", to: "doctor_reviewing", roles: ["doctor"] },
  { from: "escalated", to: "decision_drafted", roles: ["doctor"] },
  { from: "escalated", to: "signed", roles: ["doctor"] },
  { from: "escalated", to: "needs_information", roles: ["doctor"] },

  { from: "doctor_reviewing", to: "decision_drafted", roles: ["doctor"] },
  { from: "doctor_reviewing", to: "signed", roles: ["doctor"] },
  { from: "doctor_reviewing", to: "needs_information", roles: ["doctor"] },

  { from: "decision_drafted", to: "signed", roles: ["doctor"] },
  { from: "decision_drafted", to: "needs_information", roles: ["doctor"] },

  // 4. System publishes care plan & Patient notification
  { from: "signed", to: "patient_notified", roles: ["system"] },
  { from: "signed", to: "superseded", roles: ["doctor"] },

  // 5. Patient acknowledges
  { from: "patient_notified", to: "acknowledged", roles: ["patient"] },

  // 6. Clarification loop
  { from: "needs_information", to: "submitted", roles: ["patient"] },
];

export class WorkflowTransitionError extends Error {
  constructor(
    message: string,
    readonly code: "STALE_VERSION" | "INVALID_TRANSITION" | "UNAUTHORIZED_ROLE",
  ) {
    super(message);
    this.name = "WorkflowTransitionError";
  }
}

export function transitionWorkflow(
  currentInput: WorkflowAggregate,
  requestInput: TransitionRequest,
): WorkflowAggregate {
  const current = workflowAggregateSchema.parse(currentInput);
  const request = transitionRequestSchema.parse(requestInput);

  if (request.expectedVersion !== current.version) {
    throw new WorkflowTransitionError(
      `Expected workflow version ${request.expectedVersion}, received ${current.version}.`,
      "STALE_VERSION",
    );
  }

  const matchingTransition = rules.filter(
    (rule) => rule.from === current.status && rule.to === request.toStatus,
  );
  if (matchingTransition.length === 0) {
    throw new WorkflowTransitionError(
      `Transition ${current.status} → ${request.toStatus} is not allowed.`,
      "INVALID_TRANSITION",
    );
  }
  if (!matchingTransition.some((rule) => rule.roles.includes(request.actorRole))) {
    throw new WorkflowTransitionError(
      `Role ${request.actorRole} cannot perform ${current.status} → ${request.toStatus}.`,
      "UNAUTHORIZED_ROLE",
    );
  }

  return workflowAggregateSchema.parse({
    ...current,
    status: request.toStatus,
    version: current.version + 1,
    updatedAt: request.occurredAt,
  });
}
