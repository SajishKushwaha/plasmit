import { RenalPatientWorkspace } from "@/features/clinical/renal/renal-pages";

export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <RenalPatientWorkspace patientId={patientId} />;
}
