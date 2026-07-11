import { mockAiItems } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="smart" title="Clinical Decision Support" description="Recommendations, evidence placeholder, model/rule version, data freshness, severity, suggested action, clinician response, override reason, and safety warnings." records={mockAiItems.filter((item) => item.surface === "CDS")} />;
}
