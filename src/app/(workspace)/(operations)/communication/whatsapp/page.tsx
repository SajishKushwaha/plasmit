import { mockCommunicationLogs } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="WhatsApp Notifications"
      description="WhatsApp templates, send log, patient consent, opt-out block, retry placeholders, and print placeholders."
      records={mockCommunicationLogs.filter((item) => item.channel === "WhatsApp")}
    />
  );
}
