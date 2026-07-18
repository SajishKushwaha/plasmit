import { mockAccessReviews } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Access Control Review"
      description="Role list, permission matrix, sensitive permissions, recent changes, review status, revoke placeholder, and print placeholders."
      records={mockAccessReviews}
    />
  );
}
