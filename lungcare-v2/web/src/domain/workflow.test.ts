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

  it("executes the full vertical slice transition loop", () => {
    // 1. Patient draft -> submitted
    const s1 = transitionWorkflow(
      { ...submitted, status: "draft", version: 0 },
      { actorId: ids.actor, actorRole: "patient", toStatus: "submitted", reason: "Symptom reported", expectedVersion: 0, occurredAt: "2026-09-10T06:01:00.000Z" }
    );
    expect(s1.status).toBe("submitted");
    expect(s1.version).toBe(1);

    // 2. Nurse submitted -> nurse_validated
    const s2 = transitionWorkflow(
      s1,
      { actorId: ids.actor, actorRole: "nurse", toStatus: "nurse_validated", reason: "Vitals confirmed", expectedVersion: 1, occurredAt: "2026-09-10T06:05:00.000Z" }
    );
    expect(s2.status).toBe("nurse_validated");

    // 3. Nurse nurse_validated -> escalated
    const s3 = transitionWorkflow(
      s2,
      { actorId: ids.actor, actorRole: "nurse", toStatus: "escalated", reason: "Grade 2 diarrhea, requires physician review", expectedVersion: 2, occurredAt: "2026-09-10T06:06:00.000Z" }
    );
    expect(s3.status).toBe("escalated");

    // 4. Doctor escalated -> doctor_reviewed
    const s4 = transitionWorkflow(
      s3,
      { actorId: ids.actor, actorRole: "doctor", toStatus: "doctor_reviewed", reason: "Reviewed triage and nurse notes", expectedVersion: 3, occurredAt: "2026-09-10T06:10:00.000Z" }
    );
    expect(s4.status).toBe("doctor_reviewed");

    // 5. Doctor doctor_reviewed -> signed
    const s5 = transitionWorkflow(
      s4,
      { actorId: ids.actor, actorRole: "doctor", toStatus: "signed", reason: "Hold TKI 48h and start Loperamide", expectedVersion: 4, occurredAt: "2026-09-10T06:12:00.000Z" }
    );
    expect(s5.status).toBe("signed");

    // 6. System signed -> patient_notified
    const s6 = transitionWorkflow(
      s5,
      { actorId: ids.actor, actorRole: "system", toStatus: "patient_notified", reason: "Notification dispatched", expectedVersion: 5, occurredAt: "2026-09-10T06:12:01.000Z" }
    );
    expect(s6.status).toBe("patient_notified");

    // 7. Patient patient_notified -> acknowledged
    const s7 = transitionWorkflow(
      s6,
      { actorId: ids.actor, actorRole: "patient", toStatus: "acknowledged", reason: "Patient confirmed understanding", expectedVersion: 6, occurredAt: "2026-09-10T06:15:00.000Z" }
    );
    expect(s7.status).toBe("acknowledged");
    expect(s7.version).toBe(7);
  });
});
