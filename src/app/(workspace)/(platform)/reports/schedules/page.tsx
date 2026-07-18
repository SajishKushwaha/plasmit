import { mockScheduledReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="reports"
      title="Scheduled Reports"
      description="Report selection, frequency, recipients, delivery channel, next run, paused/failed states, and access validation placeholders."
      records={mockScheduledReports}
    />
  );
}
