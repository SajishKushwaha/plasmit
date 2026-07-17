import { mockIpRules } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="IP Restriction"
      description="Allowed/blocked IP rules, attempted access, failed attempts, disable rule, lockout warning placeholder, and print placeholders."
      records={mockIpRules}
    />
  );
}
