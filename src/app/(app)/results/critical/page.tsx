import { ResultsSidebarView } from "@/features/results/components/ResultsSidebarView";

export default function CriticalResultsPage() {
  return (
    <ResultsSidebarView
      criticalOnly
      viewTitle="Critical Results"
      viewDescription="Critical laboratory and POCT results that require notification, acknowledgement, and audit tracking."
    />
  );
}
