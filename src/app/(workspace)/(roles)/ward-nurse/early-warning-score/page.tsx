import EarlyWarningScoreClient from "./early-warning-score-client";

type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function WardNurseEarlyWarningScoreRoute({
  searchParams,
}: {
  searchParams?: PageSearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const patientId = resolvedSearchParams.patientId;
  const initialPatientId = Array.isArray(patientId) ? patientId[0] ?? "" : patientId ?? "";

  return <EarlyWarningScoreClient initialPatientId={initialPatientId} />;
}
