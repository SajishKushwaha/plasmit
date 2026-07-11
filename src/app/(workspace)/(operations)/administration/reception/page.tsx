import { mockFrontOfficeAdmin } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="administration" title="Reception Management" description="Reception counters, desk queue, handoffs, service requests, owner reassignment, and resolution placeholders." records={mockFrontOfficeAdmin} />;
}
