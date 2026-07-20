import { mockQaReleaseReadiness } from "@/data/phase12";
import { SimpleWorkflowPage } from "@/features/platform/phase12/phase12-pages";

export default function Page() {
  return <SimpleWorkflowPage module="qa" title="Release Readiness" description="Phase completion, blockers, waivers, residual risks, sign-off owners, release notes placeholder, route coverage, and print-ready sign-off." records={mockQaReleaseReadiness} />;
}
