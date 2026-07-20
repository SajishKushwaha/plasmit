import { mockApiApps } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="integrations" title="API Management" description="API apps, endpoint catalog, environment, masked key placeholders, usage status, credential expiry, rate limits, logs, regenerate/revoke, and audit." records={mockApiApps} />;
}
