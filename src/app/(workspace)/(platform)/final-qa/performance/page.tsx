import { mockQaPerformance } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="qa"
      title="Performance QA"
      description="Worklist rendering, large table scroll containers, drawer lazy rendering, skeletons, chart dimensions, layout shift, and bundle placeholder checks."
      records={mockQaPerformance}
    />
  );
}
