import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";

export default function CriticalResultsPage() {
  return (
    <ResultsCenterView
      criticalOnly
      viewTitle="Critical Results"
      viewDescription="Critical laboratory and POCT results that require notification, acknowledgement, and audit tracking."
    />
  );
}
