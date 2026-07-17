import { mockQaResponsive } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="qa"
      title="Responsive QA"
      description="Phone, tablet, laptop, desktop, wide desktop, drawer behavior, sticky header/action overlap, mobile preview, and horizontal scroll risk checks."
      records={mockQaResponsive}
    />
  );
}
