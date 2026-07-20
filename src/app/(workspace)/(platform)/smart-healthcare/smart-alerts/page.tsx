import { mockAiItems } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="smart" title="Smart Alerts" description="Smart alert rules, triggers, suggested actions, acknowledgement, escalation, override, model freshness, and print placeholders." records={mockAiItems.filter((item) => item.surface === "Smart alerts")} />;
}
