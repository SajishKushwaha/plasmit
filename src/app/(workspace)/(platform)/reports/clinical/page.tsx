import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="reports" title="Clinical Reports" description="Diagnosis, procedures, visits, outcomes, prescriptions, chronic disease, and diagnostic activity placeholders with privacy restrictions." records={mockReports} />;
}
