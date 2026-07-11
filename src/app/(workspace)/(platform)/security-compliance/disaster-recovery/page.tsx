import { mockDisasterRecovery } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="security" title="Disaster Recovery" description="Recovery readiness, RPO/RTO placeholders, drill calendar/log, DR gaps, owner sign-off, restore placeholder, and print." records={mockDisasterRecovery} />;
}
