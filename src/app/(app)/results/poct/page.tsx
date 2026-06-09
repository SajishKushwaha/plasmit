import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";

export default function PoctResultsPage() {
  return (
    <ResultsCenterView
      initialDepartment="poct"
      viewTitle="POCT Results"
      viewDescription="Rapid bedside and emergency point-of-care results with critical alert handling."
    />
  );
}
