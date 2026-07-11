import { Suspense } from "react";

import { NeuroGcsPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroGcsPage />
    </Suspense>
  );
}
