import { Suspense } from "react";

import { AbdominalDashboardPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbdominalDashboardPage />
    </Suspense>
  );
}
