import { mockCompliance } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Compliance Management"
      description="Checklist, policy documents, evidence, gaps, readiness, owner sign-off, audit preparation, and print placeholders."
      records={mockCompliance}
    />
  );
}
