import { mockInteropMappings } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="HL7 Integration"
      description="HL7 interfaces, message types, direction, mapping, failed message reason, retry, message log, and print placeholders."
      records={mockInteropMappings.filter((item) => String(item.interface).includes("HL7"))}
    />
  );
}
