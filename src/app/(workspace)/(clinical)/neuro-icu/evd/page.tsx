import { Suspense } from "react";

import { NeuroEvdPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroEvdPage />
    </Suspense>
  );
}
