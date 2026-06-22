import { IcuCommandCenterPatientPage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ tab?: string; subtab?: string; ordersTab?: string; type?: string; category?: string }>;
}) {
  const { patientId } = await params;
  const { category, ordersTab, subtab, tab, type } = await searchParams;
  return <IcuCommandCenterPatientPage initialMonitoringTab={subtab} initialOrdersSubTab={ordersTab} initialResultType={type ?? category} initialTab={tab} patientId={patientId} />;
}
