import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockPatientPolicies } from "@/data/finance";

export default function Page() {
  return <InsuranceSimplePage title="Patient Policy Mapping" description="Patient policy, coverage, limits, validity, co-pay, document status, and eligibility placeholders." records={mockPatientPolicies} />;
}
