import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="reports" title="MIS Reports" description="Hospital-wide OPD/IPD, department, patient volume, admission/discharge, collection, and occupancy summaries." records={mockReports} />;
}
