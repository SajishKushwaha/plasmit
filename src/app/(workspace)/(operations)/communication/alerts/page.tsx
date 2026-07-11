import { mockAlertRules } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="communication" title="Alert Management" description="Alert rules, severity, recipients, escalation, activation/deactivation, test placeholders, trigger history, and print placeholders." records={mockAlertRules} />;
}
