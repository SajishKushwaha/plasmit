import { mockIntegrations } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="LIS Device Integration"
      description="Analyzer/device list, connection status, pending results, error log, retry, critical result handoff, and print placeholders."
      records={mockIntegrations.filter((item) => String(item.connector).includes("LIS"))}
    />
  );
}
