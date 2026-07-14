import { mockPayroll } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="hrms"
      title="Payroll Placeholder"
      description="Payroll run list, salary structure placeholders, attendance inputs, deductions, approvals, holds, and payslip preview without real calculation."
      records={mockPayroll}
    />
  );
}
