import { mockCommunicationLogs } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="SMS Gateway Placeholder"
      description="SMS provider status, send log, failed delivery, retry, consent block, quiet-hour/DND state, and print placeholders."
      records={mockCommunicationLogs.filter((item) => item.channel === "SMS")}
    />
  );
}
