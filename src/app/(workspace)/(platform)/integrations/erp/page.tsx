import { mockIntegrations } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="ERP Integration"
      description="Accounting, store, purchase, vendor sync placeholders, failed queue, exceptions, Phase 9/10 handoff, and print placeholders."
      records={mockIntegrations.filter((item) => String(item.connector).includes("ERP"))}
    />
  );
}
