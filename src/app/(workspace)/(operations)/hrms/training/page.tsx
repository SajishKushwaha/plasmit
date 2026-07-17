import { mockTraining } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="hrms"
      title="Training Management"
      description="Training calendar, participants, attendance, completion, due alerts, certificates, and print placeholders."
      records={mockTraining}
    />
  );
}
