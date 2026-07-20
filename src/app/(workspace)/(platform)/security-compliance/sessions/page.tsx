import { mockSessions } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="security" title="Session Management" description="Active sessions, suspicious state, force logout placeholder, trusted state, reason capture, and audit placeholders." records={mockSessions} />;
}
