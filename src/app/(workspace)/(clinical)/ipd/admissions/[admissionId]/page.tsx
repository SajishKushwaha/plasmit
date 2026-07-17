import { AdmissionDetailPage } from "@/features/clinical/ipd/ipd-pages";

export default async function Page({ params }: { params: Promise<{ admissionId: string }> }) {
  const { admissionId } = await params;
  return <AdmissionDetailPage admissionId={admissionId} />;
}
