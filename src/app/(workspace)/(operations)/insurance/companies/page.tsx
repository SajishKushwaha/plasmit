import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockInsuranceCompanies } from "@/data/finance";

export default function Page() {
  return <InsuranceSimplePage title="Insurance Companies" description="Insurance company list, contracts, tariff metadata, active/inactive blocking, and contacts." records={mockInsuranceCompanies} />;
}
