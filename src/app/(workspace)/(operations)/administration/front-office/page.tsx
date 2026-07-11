import { mockFrontOfficeAdmin } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="administration" title="Front Office Administration" description="Desk allocation, reception counters, service request overview, reassignment, handoff queue, and counter open/close placeholders." records={mockFrontOfficeAdmin} />;
}
