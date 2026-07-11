import { PropertiesConfigurationPage } from "@/features/operations/hospital-admin/properties-configuration-page";

export default async function PropertiesConfigurationRoute({
  searchParams,
}: {
  searchParams: Promise<{ ldtId?: string }>;
}) {
  const { ldtId } = await searchParams;
  return <PropertiesConfigurationPage ldtId={ldtId} />;
}
