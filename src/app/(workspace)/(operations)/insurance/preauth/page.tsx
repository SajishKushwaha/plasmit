import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockPreauthorizations } from "@/data/finance";

export default function Page() {
  return <InsuranceSimplePage title="Preauthorization" description="Preauth request, patient/admission, policy, estimated amount, documents, query, approval, rejection, and print." records={mockPreauthorizations} />;
}
