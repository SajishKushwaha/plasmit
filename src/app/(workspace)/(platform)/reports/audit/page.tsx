import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="reports" title="Audit Reports" description="Actor, role, module, action, entity, timestamp, IP/device placeholder, severity, sensitive access, and read-only detail reports." records={mockReports} />;
}
