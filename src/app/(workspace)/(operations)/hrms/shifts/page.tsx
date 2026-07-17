import { mockShifts } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="hrms"
      title="Shift Management"
      description="Shift roster, department schedules, staffing gaps, swap requests, published state, approval, and print placeholders."
      records={mockShifts}
    />
  );
}
