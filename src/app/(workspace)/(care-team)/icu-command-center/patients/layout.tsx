import { IcuCommandCenterPatientsLayout } from "@/features/care-team/icu-command-center/patients/icu-patients-surface";

export default function IcuCommandCenterPatientsRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <IcuCommandCenterPatientsLayout>{children}</IcuCommandCenterPatientsLayout>;
}
