import { NursingIcuModulePage } from "@/features/care-team/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterEscalatedOwnerChainRoute({
  searchParams,
}: {
  searchParams: Promise<{ caseId?: string }>;
}) {
  const { caseId } = await searchParams;
  return <NursingIcuModulePage initialEscalatedCaseId={caseId} page="escalated-owner-chain" />;
}
