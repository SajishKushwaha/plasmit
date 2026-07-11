import { Suspense } from "react";

import { NeuroSeizurePage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroSeizurePage />
    </Suspense>
  );
}
