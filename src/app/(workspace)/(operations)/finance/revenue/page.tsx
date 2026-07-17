import { FinanceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockRevenueSummaries } from "@/data/finance";

export default function Page() {
  return (
    <FinanceSimplePage
      title="Revenue Management"
      description="Department, doctor, service, payer, payment-mode, OPD/IPD, collection, and outstanding views."
      records={mockRevenueSummaries}
    />
  );
}
