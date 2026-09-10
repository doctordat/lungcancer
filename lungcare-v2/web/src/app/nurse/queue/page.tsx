import { FoundationNotice } from "@/components/foundation-notice";

export default function NurseQueuePage() {
  return (
    <FoundationNotice
      eyebrow="Nurse · Care Command Center"
      title="Priority queue"
      description="This route will receive persisted symptom reports and support structured validation and escalation."
      nextStep="Connect an RLS-protected queue and role-authorized validation transaction."
    />
  );
}
