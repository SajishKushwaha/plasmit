import { ResultsSidebarView } from "@/features/results/components/ResultsSidebarView";

export default function LaboratoryResultsPage() {
  return (
    <ResultsSidebarView
      initialDepartment="laboratory"
      viewTitle="Laboratory Results"
      viewDescription="Specimen collection, analyzer progress, result verification, and final lab report review."
    />
  );
}
