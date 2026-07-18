import { mockSecurityDesk } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="administration"
      title="Security Desk"
      description="Gate entry, visitor/staff movement, security incidents, severity, action assignment, resolution, and print placeholders."
      records={mockSecurityDesk}
    />
  );
}
