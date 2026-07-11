import { DocumentsPage } from "@/features/clinical/patients/patient-pages";

export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <DocumentsPage patientId={patientId} />;
}
