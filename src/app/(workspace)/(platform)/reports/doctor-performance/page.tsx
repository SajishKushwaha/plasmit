import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="reports" title="Doctor Performance Reports" description="Consultations, procedures, follow-ups, feedback, revenue placeholder, wait time, and role restriction reports." records={mockReports} />;
}
