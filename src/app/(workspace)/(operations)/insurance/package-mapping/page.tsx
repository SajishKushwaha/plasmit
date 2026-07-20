import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockBillingPackages } from "@/data/finance";

export default function Page() {
  return <InsuranceSimplePage title="Insurance Package Mapping" description="Insurer/TPA package mapping, inclusions, exclusions, validity, inactive state, and payer package placeholders." records={mockBillingPackages} />;
}
