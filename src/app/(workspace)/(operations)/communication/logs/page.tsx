import { mockCommunicationLogs } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="Communication Logs"
      description="Unified SMS, email, WhatsApp, push, alert, and emergency history with failed reason, consent block, retry, cancel, and masking placeholders."
      records={mockCommunicationLogs}
    />
  );
}
