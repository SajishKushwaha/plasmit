import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="reports"
      title="Operational Reports"
      description="Appointments, queue wait time, bed movement, diagnostic TAT, housekeeping, complaints, visitor movement, and service volume reports."
      records={mockReports}
    />
  );
}
