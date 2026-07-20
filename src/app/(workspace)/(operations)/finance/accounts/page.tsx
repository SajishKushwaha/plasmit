import { FinanceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockFinanceLedgers } from "@/data/finance";

export default function Page() {
  return <FinanceSimplePage title="Financial Accounting" description="Account summaries, journal/voucher placeholders, approval, and read-only posted states." records={mockFinanceLedgers} />;
}
