import { NursingIcuModulePage } from "@/features/care-team/nursing-icu/nursing-icu-pages";

export default async function IcuCommandCenterExecutiveDrilldownRoute({
  searchParams,
}: {
  searchParams: Promise<{ focus?: string; unit?: string }>;
}) {
  const { focus, unit } = await searchParams;
  return <NursingIcuModulePage initialExecutiveFocus={focus} initialExecutiveUnitId={unit} page="executive-drilldown" />;
}
