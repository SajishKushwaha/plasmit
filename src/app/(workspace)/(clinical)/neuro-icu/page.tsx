import { Suspense } from "react";

import { NeuroOverviewPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroOverviewPage />
    </Suspense>
  );
}
