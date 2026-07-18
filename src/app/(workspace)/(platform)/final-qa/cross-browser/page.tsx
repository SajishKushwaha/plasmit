import { mockQaCrossBrowser } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="qa"
      title="Cross-Browser QA"
      description="Browser/device compatibility, rendering differences, touch interactions, date/time/input controls, sticky behavior, and sign-off placeholders."
      records={mockQaCrossBrowser}
    />
  );
}
