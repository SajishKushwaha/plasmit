import { mockMobileRoleTasks } from "@/data/phase12";
import { MobileRolePage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <MobileRolePage title="Management Mobile App UI" description="Executive summary, revenue, occupancy, claims, receivables, alerts, restricted drill-down, and mobile sign-off placeholders." roleView="Management" records={mockMobileRoleTasks.filter((item) => item.roleView === "Management")} />;
}
