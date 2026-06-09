import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";

export default function LaboratoryResultsPage() {
  return (
    <ResultsCenterView
      initialDepartment="laboratory"
      viewTitle="Laboratory Results"
      viewDescription="Specimen collection, analyzer progress, result verification, and final lab report review."
    />
  );
}
