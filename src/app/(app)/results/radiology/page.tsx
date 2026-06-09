import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";

export default function RadiologyResultsPage() {
  return (
    <ResultsCenterView
      initialDepartment="radiology"
      viewTitle="Radiology Results"
      viewDescription="Radiology study status, PACS image availability, accession details, and verified report preview."
    />
  );
}
