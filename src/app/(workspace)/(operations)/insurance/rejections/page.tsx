import { InsuranceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockClaimRejections } from "@/data/finance";

export default function Page() {
  return <InsuranceSimplePage title="Rejection Management" description="Rejected claims/preauths, reason, correction note, corrected document placeholder, resubmission, and close state." records={mockClaimRejections} />;
}
