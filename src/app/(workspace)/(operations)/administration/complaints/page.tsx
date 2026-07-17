import { mockComplaints } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="administration"
      title="Complaint Management"
      description="Complaint queue, priority, owner, due date, SLA overdue, notes, resolution, reopen, and print placeholders."
      records={mockComplaints}
    />
  );
}
