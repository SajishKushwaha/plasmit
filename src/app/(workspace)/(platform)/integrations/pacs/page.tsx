import { mockIntegrations } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="PACS Integration"
      description="PACS connection placeholder, study sync, DICOM status, failed study reason, radiology handoff, retry, and print placeholders."
      records={mockIntegrations.filter((item) => String(item.connector).includes("PACS"))}
    />
  );
}
