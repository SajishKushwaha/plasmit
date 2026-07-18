import { mockRetentionIncidents } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Data Retention And Privacy Incidents"
      description="Retention policy, archive placeholder, legal hold placeholder, privacy incident workflow, owner, resolution, and print."
      records={mockRetentionIncidents}
    />
  );
}
