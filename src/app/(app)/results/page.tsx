import { ResultsSidebarView } from "@/features/results/components/ResultsSidebarView";

export default function ResultsPage() {
  return (
    <ResultsSidebarView
      defaultDepartment="all"
      viewTitle="Results Center"
      viewDescription="Unified results inbox for Laboratory, Radiology, POCT, reports, images, and critical alerts."
    />
  );
}
