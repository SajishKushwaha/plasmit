import { mockHousekeeping } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return <Phase11SimplePage module="administration" title="Housekeeping Management" description="Cleaning tasks, ward/room board, assignment, delayed state, infection/isolation warning, completion, reopen, and print placeholders." records={mockHousekeeping} />;
}
