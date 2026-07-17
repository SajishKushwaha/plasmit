import { Suspense } from "react";

import { AbdominalTrendsPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbdominalTrendsPage />
    </Suspense>
  );
}
