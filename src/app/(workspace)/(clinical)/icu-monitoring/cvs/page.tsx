import { Suspense } from "react";

import { CvsDashboardPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CvsDashboardPage />
    </Suspense>
  );
}
