import { mockMobileRoleTasks } from "@/data/phase12";
import { MobileRolePage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <MobileRolePage title="Patient Mobile App UI" description="Appointments, reports, prescriptions, bills, profile, notifications, own-data restriction, payment placeholder, and ABHA placeholder." roleView="Patient" records={mockMobileRoleTasks.filter((item) => item.roleView === "Patient")} />;
}
