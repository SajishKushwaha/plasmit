import { mockStaffDocuments } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="hrms"
      title="Staff Documents"
      description="Staff document expiry alerts, verification, rejection, renewal required, restricted access, and expiry report placeholders."
      records={mockStaffDocuments}
    />
  );
}
