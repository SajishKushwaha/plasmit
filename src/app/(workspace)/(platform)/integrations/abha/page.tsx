import { mockAbhaSync } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="ABHA Integration"
      description="Health ID link/unlink placeholders, verification, patient consent, sync history, failed sync, privacy, and ABHA audit state."
      records={mockAbhaSync}
    />
  );
}
