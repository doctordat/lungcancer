import { FoundationNotice } from "@/components/foundation-notice";

export default async function DoctorReviewPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  return (
    <FoundationNotice
      eyebrow="Doctor · Clinical Command Center"
      title="Clinical review"
      description={`Review route prepared for report ${reportId}. No clinical record has been loaded.`}
      nextStep="Connect nurse context, evidence, and a server-enforced physician sign-off transaction."
    />
  );
}
