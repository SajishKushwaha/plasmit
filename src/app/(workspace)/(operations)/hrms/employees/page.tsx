import { mockEmployees } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="hrms" title="Employee Management" description="Employee list, profile, role, department, documents, employment status, onboarding, offboarding, and access placeholders." records={mockEmployees} />;
}
