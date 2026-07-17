import { mockCommunicationLogs } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="Email Notifications"
      description="Email template, send log, delivery state, retry placeholder, internal staff recipients, and print placeholders."
      records={mockCommunicationLogs.filter((item) => item.channel === "Email")}
    />
  );
}
