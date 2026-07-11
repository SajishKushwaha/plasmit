import { mockAppraisals } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="hrms" title="Appraisal Management" description="Appraisal cycles, self review, manager review, ratings, finalization, restricted visibility, and print placeholders." records={mockAppraisals} />;
}
