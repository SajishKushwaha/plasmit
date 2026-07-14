import { mockLeaves } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="hrms"
      title="Leave Management"
      description="Leave request, approval queue, rejection, balance, department calendar, reason capture, and print placeholders."
      records={mockLeaves}
    />
  );
}
