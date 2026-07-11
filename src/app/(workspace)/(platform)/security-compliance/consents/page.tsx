import { mockConsents } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="security" title="Consent Tracking" description="Patient consent audit, consent type, source, expiry, withdrawal, renewal, restriction, privacy state, and print placeholders." records={mockConsents} />;
}
