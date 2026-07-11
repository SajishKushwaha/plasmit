import { mockSecurityEvents } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="security" title="Activity Monitoring" description="Live activity placeholders, risk flags, unusual behavior, review, escalation, actor/device context, and print placeholders." records={mockSecurityEvents} />;
}
