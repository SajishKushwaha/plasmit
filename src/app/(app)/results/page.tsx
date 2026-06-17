import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";

export default function ResultsPage() {
  return (
    <ResultsCenterView
      defaultDepartment="all"
      viewTitle="Results Center"
      viewDescription="Unified results inbox for Laboratory, Radiology, POCT, reports, images, and critical alerts."
    />
  );
}
