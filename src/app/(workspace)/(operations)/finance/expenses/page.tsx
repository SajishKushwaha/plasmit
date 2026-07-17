import { FinanceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockExpenses } from "@/data/finance";

export default function Page() {
  return (
    <FinanceSimplePage
      title="Expense Management"
      description="Expense entries, category, approval, rejection, payment status, and voucher print placeholders."
      records={mockExpenses}
    />
  );
}
