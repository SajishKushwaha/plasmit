import { FinanceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockFinanceLedgers } from "@/data/finance";

export default function Page() {
  return <FinanceSimplePage title="Ledger Management" description="Patient, payer, company, vendor, and cash counter ledger placeholders." records={mockFinanceLedgers} />;
}
