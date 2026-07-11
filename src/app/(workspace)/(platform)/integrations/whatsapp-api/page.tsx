import { mockMessageProviderSync } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="integrations" title="WhatsApp API Integration" description="WhatsApp provider settings, template sync placeholders, delivery logs, consent/DND, failed queue, retry, and print placeholders." records={mockMessageProviderSync.filter((item) => item.channel === "WhatsApp")} />;
}
