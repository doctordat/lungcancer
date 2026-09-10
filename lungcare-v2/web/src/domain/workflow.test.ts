import { describe, expect, it } from "vitest";
import { transitionWorkflow, WorkflowTransitionError, type WorkflowAggregate } from "./workflow";

const ids = {
  report: "00000000-0000-4000-8000-000000000001",
  organization: "00000000-0000-4000-8000-000000000002",
  patient: "00000000-0000-4000-8000-000000000003",
  actor: "00000000-0000-4000-8000-000000000004",
};

const submitted: WorkflowAggregate = {
  symptomReportId: ids.report,
  organizationId: ids.organization,
  patientId: ids.patient,
  status: "submitted",
  version: 1,
  updatedAt: "2026-09-10T06:00:00.000Z",
};

function request(actorRole: "patient" | "nurse" | "doctor", toStatus: "nurse_validated" | "signed", expectedVersion = 1) {
  return {
    actorId: ids.actor,
    actorRole,
    toStatus,
    reason: "Synthetic workflow test.",
    expectedVersion,
    occurredAt: "2026-09-10T06:05:00.000Z",
  } as const;
}

describe("workflow state machine", () => {
  it("allows a nurse to validate a submitted report", () => {
    expect(transitionWorkflow(submitted, request("nurse", "nurse_validated"))).toMatchObject({
      status: "nurse_validated",
      version: 2,
    });
  });

  it("rejects a transition that skips required review states", () => {
    expect(() => transitionWorkflow(submitted, request("doctor", "signed"))).toThrowError(WorkflowTransitionError);
    try {
      transitionWorkflow(submitted, request("doctor", "signed"));
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_TRANSITION" });
    }
  });

  it("rejects an unauthorized role", () => {
    expect(() => transitionWorkflow(submitted, request("patient", "nurse_validated"))).toThrowError(WorkflowTransitionError);
    try {
      transitionWorkflow(submitted, request("patient", "nurse_validated"));
    } catch (error) {
      expect(error).toMatchObject({ code: "UNAUTHORIZED_ROLE" });
    }
  });

  it("rejects a stale optimistic version", () => {
    expect(() => transitionWorkflow(submitted, request("nurse", "nurse_validated", 0))).toThrowError(WorkflowTransitionError);
    try {
      transitionWorkflow(submitted, request("nurse", "nurse_validated", 0));
    } catch (error) {
      expect(error).toMatchObject({ code: "STALE_VERSION" });
    }
  });
});
