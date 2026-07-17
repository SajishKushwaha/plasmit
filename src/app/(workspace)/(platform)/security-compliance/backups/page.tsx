import { mockBackups } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="security"
      title="Backup Management"
      description="Backup schedules, history, failed backups, restore request placeholder, storage status, RPO, and print placeholders."
      records={mockBackups}
    />
  );
}
