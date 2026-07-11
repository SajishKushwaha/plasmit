import { FinanceSimplePage } from "@/features/operations/finance/finance-pages";
import { mockGstSummaries } from "@/data/finance";

export default function Page() {
  return <FinanceSimplePage title="GST Management" description="Tax summary, invoice tax fields, GST report, correction and export placeholders." records={mockGstSummaries} />;
}
