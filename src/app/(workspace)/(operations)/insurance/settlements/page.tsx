import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockClaimSettlements } from "@/data/finance";

export default function Page() {
  return (
    <InsuranceSimplePage
      title="Claim Settlement"
      description="Settlement list, received amount, deductions, shortfall, patient payable adjustment, ledger impact, and print."
      records={mockClaimSettlements}
    />
  );
}
