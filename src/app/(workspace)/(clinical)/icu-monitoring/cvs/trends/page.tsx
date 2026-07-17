import { Suspense } from "react";

import { CvsTrendsPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CvsTrendsPage />
    </Suspense>
  );
}
