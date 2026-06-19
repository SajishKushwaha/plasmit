import { ResultsSidebarView } from "@/features/results/components/ResultsSidebarView";

export default function RadiologyResultsPage() {
  return (
    <ResultsSidebarView
      initialDepartment="radiology"
      viewTitle="Radiology Results"
      viewDescription="Radiology study status, PACS image availability, accession details, and verified report preview."
    />
  );
}
