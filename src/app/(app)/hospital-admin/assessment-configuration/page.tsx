import { AssessmentConfigurationPage } from "@/features/hospital-admin/assessment-configuration-page";

export default async function AssessmentConfigurationRoute({
  searchParams,
}: {
  searchParams: Promise<{ ldtId?: string }>;
}) {
  const { ldtId } = await searchParams;
  return <AssessmentConfigurationPage ldtId={ldtId} />;
}
