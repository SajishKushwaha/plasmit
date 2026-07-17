import { Suspense } from "react";

import { NeuroAnalyticsPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroAnalyticsPage />
    </Suspense>
  );
}
