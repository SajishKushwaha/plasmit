import { mockAiItems } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="smart" title="AI Radiology Assistance" description="Study context, findings suggestion, confidence placeholder, model/version, data freshness, radiologist review, accept/reject, and audit." records={mockAiItems.filter((item) => item.surface === "Radiology AI")} />;
}
