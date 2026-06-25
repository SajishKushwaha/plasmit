import { IcuCommandCenterPatientPage } from "@/features/nursing-icu/nursing-icu-pages";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ tab?: string; subtab?: string; ordersTab?: string; type?: string; category?: string; eventFocus?: string; shiftFocus?: string }>;
}) {
  const { patientId } = await params;
  const { category, eventFocus, ordersTab, shiftFocus, subtab, tab, type } = await searchParams;
  return <IcuCommandCenterPatientPage initialEventFocus={eventFocus} initialMonitoringTab={subtab} initialOrdersSubTab={ordersTab} initialResultType={type ?? category} initialShiftFocus={shiftFocus} initialTab={tab} patientId={patientId} />;
}
