import { mockIntegrations, mockWebhookEvents } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="integrations" title="Integration Logs" description="Unified integration search, masked payload preview, retry, reviewed state, failed syncs, source/target context, and audit handoff." records={[...mockIntegrations, ...mockWebhookEvents]} />;
}
