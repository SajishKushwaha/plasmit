import { ResultsSidebarView } from "@/features/diagnostics/results/components/ResultsSidebarView";

export default function PoctResultsPage() {
  return (
    <ResultsSidebarView
      initialDepartment="poct"
      viewTitle="POCT Results"
      viewDescription="Rapid bedside and emergency point-of-care results with critical alert handling."
    />
  );
}
