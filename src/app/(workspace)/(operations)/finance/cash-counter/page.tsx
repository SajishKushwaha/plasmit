import { FinanceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockCashCounters } from "@/data/finance";

export default function Page() {
  return <FinanceSimplePage title="Cash Counter" description="Counter open/close, collection, refund paid, handover, variance, cashier confirmation, and day close print." records={mockCashCounters} />;
}
