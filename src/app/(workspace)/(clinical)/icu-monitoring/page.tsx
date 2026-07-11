import { Suspense } from "react";

import { IcuMonitoringPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IcuMonitoringPage />
    </Suspense>
  );
}
