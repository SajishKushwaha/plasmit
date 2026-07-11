import { mockAiItems } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="smart" title="AI Clinical Assistant" description="Patient context, suggestion panel, prompt history, evidence/confidence placeholder, model/version, data freshness, doctor approval, rejection, override, and print." records={mockAiItems.filter((item) => item.surface === "Clinical assistant")} />;
}
