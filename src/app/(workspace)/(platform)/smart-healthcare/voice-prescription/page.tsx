import { mockAiItems } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return (
    <SimpleWorkflowPage
      module="smart"
      title="Voice Prescription"
      description="Voice capture placeholder, transcript, extracted medicine review, allergy/drug warning handoff, doctor confirmation, and print placeholders."
      records={mockAiItems.filter((item) => item.surface === "Voice prescription")}
    />
  );
}
