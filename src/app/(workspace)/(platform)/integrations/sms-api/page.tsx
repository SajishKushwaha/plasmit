import { mockMessageProviderSync } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="integrations"
      title="SMS API Integration"
      description="SMS provider settings, delivery logs, consent/DND state, failure reasons, retry queue, and print placeholders."
      records={mockMessageProviderSync.filter((item) => item.channel === "SMS")}
    />
  );
}
