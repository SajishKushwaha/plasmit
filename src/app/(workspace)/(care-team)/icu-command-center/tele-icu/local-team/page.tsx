import { NursingIcuModulePage } from "@/features/care-team/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterTeleIcuLocalTeamRoute({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const { patientId } = await searchParams;
  return <NursingIcuModulePage initialTeleIcuPatientId={patientId} page="tele-icu-local-team" />;
}
