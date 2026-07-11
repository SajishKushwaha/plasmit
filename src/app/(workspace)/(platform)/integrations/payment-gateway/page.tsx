import { mockPaymentGatewaySync } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="integrations" title="Payment Gateway Integration" description="Gateway settings placeholder, transaction sync, failed payment queue, reconciliation placeholder, failed reason, and Phase 10 billing handoff." records={mockPaymentGatewaySync} />;
}
