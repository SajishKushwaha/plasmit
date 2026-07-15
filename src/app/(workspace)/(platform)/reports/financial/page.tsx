import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="reports"
      title="Financial Reports"
      description="Revenue, collections, outstanding, refunds, discounts, payer, cash counter, and Phase 10 billing summary placeholders."
      records={mockReports}
    />
  );
}
