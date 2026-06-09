import { RadiologyOrderDetailView } from "@/features/radiology/components/RadiologyWorkflowViews";

interface RadiologyOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RadiologyOrderDetailPage({ params }: RadiologyOrderDetailPageProps) {
  const { id } = await params;

  return <RadiologyOrderDetailView orderId={id} />;
}
