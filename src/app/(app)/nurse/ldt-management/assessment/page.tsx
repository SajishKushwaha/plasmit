import { LdtAssessmentPage } from "@/features/ldt-management/ldt-assessment-page";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ ldtId?: string }>;
}) {
  const params = await searchParams;
  return <LdtAssessmentPage ldtId={params?.ldtId} />;
}
