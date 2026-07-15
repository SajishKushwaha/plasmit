import { mockEmergencyAlerts } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="communication"
      title="Emergency Alert System"
      description="Broadcast, audience, severity, preview, acknowledgement, escalation, history, confirmation, and print placeholders."
      records={mockEmergencyAlerts}
    />
  );
}
