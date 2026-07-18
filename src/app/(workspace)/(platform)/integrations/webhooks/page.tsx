import { mockWebhookEvents } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="Webhook And Event Queue"
      description="Webhook endpoints, event type, delivery status, retry count, failed reason, masked payload preview, disable state, and print placeholders."
      records={mockWebhookEvents}
    />
  );
}
