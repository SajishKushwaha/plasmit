import { mockMobileRoleTasks } from "@/data/phase12";
import { MobileRolePage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <MobileRolePage
      title="Doctor Mobile App UI"
      description="Doctor dashboard, OPD queue, rounds, prescription review, assigned patient context, critical alerts, offline sync, and restricted action placeholders."
      roleView="Doctor"
      records={mockMobileRoleTasks.filter((item) => item.roleView === "Doctor")}
    />
  );
}
