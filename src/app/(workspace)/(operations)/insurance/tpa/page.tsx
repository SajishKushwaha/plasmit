import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockTpas } from "@/data/finance";

export default function Page() {
  return (
    <InsuranceSimplePage
      title="TPA Management"
      description="TPA list, insurer links, contract state, contacts, payer mapping, and inactive blocking."
      records={mockTpas}
    />
  );
}
