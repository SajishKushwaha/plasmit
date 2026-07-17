import { mockAttendance } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="hrms"
      title="Attendance Management"
      description="Attendance grid, punch state, exceptions, correction requests, approval/rejection, department views, and print placeholders."
      records={mockAttendance}
    />
  );
}
