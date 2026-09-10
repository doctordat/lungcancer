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
  { from: "draft", to: "submitted", roles: ["patient"] },
  { from: "submitted", to: "nurse_validated", roles: ["nurse"] },
  { from: "submitted", to: "needs_information", roles: ["nurse"] },
  { from: "nurse_validated", to: "escalated", roles: ["nurse"] },
  { from: "escalated", to: "doctor_reviewed", roles: ["doctor"] },
  { from: "doctor_reviewed", to: "signed", roles: ["doctor"] },
  { from: "doctor_reviewed", to: "needs_information", roles: ["doctor"] },
  { from: "signed", to: "patient_notified", roles: ["system"] },
  { from: "patient_notified", to: "acknowledged", roles: ["patient"] },
  { from: "signed", to: "superseded", roles: ["doctor"] },
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
