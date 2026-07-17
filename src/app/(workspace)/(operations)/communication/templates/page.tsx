import { mockCommunicationTemplates } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="Notification Templates"
      description="SMS, email, WhatsApp, and push templates with variables, audience, consent requirements, quiet-hour/DND rules, preview, and active state."
      records={mockCommunicationTemplates}
    />
  );
}
