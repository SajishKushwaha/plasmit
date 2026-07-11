import { Suspense } from "react";

import { NeuroVentilationPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroVentilationPage />
    </Suspense>
  );
}
