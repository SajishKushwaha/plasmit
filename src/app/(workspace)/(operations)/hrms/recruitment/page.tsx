import { mockRecruitment } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="hrms" title="Recruitment Management" description="Openings, candidates, screening, interviews, offer stage, rejection reasons, and employee conversion placeholders." records={mockRecruitment} />;
}
