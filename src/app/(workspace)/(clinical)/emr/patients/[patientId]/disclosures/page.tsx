import { DisclosuresPage } from "@/features/clinical/emr/emr-pages";

export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <DisclosuresPage patientId={patientId} />;
}
