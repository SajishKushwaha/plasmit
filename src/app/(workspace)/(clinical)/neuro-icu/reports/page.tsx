import { Suspense } from "react";

import { NeuroReportsPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroReportsPage />
    </Suspense>
  );
}
