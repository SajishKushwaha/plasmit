import { mockEncryptionCoverage } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Data Encryption UI"
      description="Encryption status, data category coverage, key rotation placeholder, gaps, safe secret handling, and print placeholders."
      records={mockEncryptionCoverage}
    />
  );
}
