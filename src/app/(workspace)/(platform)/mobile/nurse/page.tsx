import { mockMobileRoleTasks } from "@/data/phase12";
import { MobileRolePage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <MobileRolePage
      title="Nurse Mobile App UI"
      description="Nurse task list, vitals, MAR review, nursing notes, escalation alerts, ward/bed context, offline sync, and push placeholders."
      roleView="Nurse"
      records={mockMobileRoleTasks.filter((item) => item.roleView === "Nurse")}
    />
  );
}
