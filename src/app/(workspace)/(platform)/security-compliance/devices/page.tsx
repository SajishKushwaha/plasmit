import { mockDevices } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Device Management"
      description="Trusted and blocked devices, masked identifiers, device risk, block reason, owner, last seen, and print placeholders."
      records={mockDevices}
    />
  );
}
