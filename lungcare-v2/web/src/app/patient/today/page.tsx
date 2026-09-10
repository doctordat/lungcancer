import { FoundationNotice } from "@/components/foundation-notice";

export default function PatientTodayPage() {
  return (
    <FoundationNotice
      eyebrow="Patient · Cancer Companion"
      title="Today"
      description="This route will show the patient's next safe action, symptom reporting, and signed care-plan updates."
      nextStep="Connect a validated symptom-report draft and online submission flow."
    />
  );
}
