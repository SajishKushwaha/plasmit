import { mockSecurityEvents } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Consolidated Audit Trail"
      description="Cross-module audit filters, actor, role, module, action, entity, timestamp, IP/device placeholder, severity, sensitive access, and read-only detail."
      records={mockSecurityEvents}
    />
  );
}
