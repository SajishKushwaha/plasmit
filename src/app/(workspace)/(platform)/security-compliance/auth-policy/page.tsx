import { mockAuthPolicies } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Authentication Policy Review"
      description="MFA, password policy, account lockout, session timeout, privileged role gaps, review status, and print placeholders."
      records={mockAuthPolicies}
    />
  );
}
