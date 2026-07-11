import { ConsultationPage } from "@/features/clinical/opd/opd-pages";

export default async function Page({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  return <ConsultationPage visitId={visitId} />;
}
