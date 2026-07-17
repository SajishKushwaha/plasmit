import { mockReports } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="reports"
      title="Bed Occupancy Analytics"
      description="Ward and ICU occupancy, trends, discharge readiness, movement, and capacity analytics placeholders."
      records={mockReports}
    />
  );
}
