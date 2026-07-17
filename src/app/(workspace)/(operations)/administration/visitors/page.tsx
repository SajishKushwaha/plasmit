import { mockVisitors } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="administration"
      title="Visitor Management"
      description="Visitor registration, ID proof placeholder, pass validity, pass print, patient/staff mapping, check-in/out, overstay, extension, and blocklist placeholder."
      records={mockVisitors}
    />
  );
}
