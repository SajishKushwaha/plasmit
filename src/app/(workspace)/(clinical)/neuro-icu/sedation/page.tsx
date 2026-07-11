import { Suspense } from "react";

import { NeuroSedationPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroSedationPage />
    </Suspense>
  );
}
