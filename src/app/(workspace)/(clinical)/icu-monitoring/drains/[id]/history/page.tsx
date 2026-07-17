import { DrainHistoryPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DrainHistoryPage id={id} />;
}
