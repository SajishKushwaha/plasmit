import { DoctorOrdersPage } from "@/features/doctor-orders/doctor-orders";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IcuCommandCenterRoute({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const department = firstParam(params.department);

  return <DoctorOrdersPage department={department} />;
}
