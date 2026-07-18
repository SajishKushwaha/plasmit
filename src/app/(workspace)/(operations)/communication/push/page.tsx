import { mockCommunicationLogs } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="Push Notifications"
      description="Push templates, app audience, delivery state, retry placeholder, staff segment targeting, and print placeholders."
      records={mockCommunicationLogs.filter((item) => item.channel === "Push")}
    />
  );
}
