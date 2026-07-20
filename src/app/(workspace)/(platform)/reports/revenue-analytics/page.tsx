import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="reports" title="Revenue Analytics" description="Department, doctor, service, payer, payment-mode, OPD/IPD, collection, and outstanding analytics placeholders." records={mockReports} />;
}
