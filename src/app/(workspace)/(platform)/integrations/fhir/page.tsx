import { mockInteropMappings } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="FHIR Integration"
      description="FHIR resource mappings, sync state, failed reason, retry, patient privacy, resource coverage, and print placeholders."
      records={mockInteropMappings.filter((item) => String(item.interface).includes("FHIR"))}
    />
  );
}
