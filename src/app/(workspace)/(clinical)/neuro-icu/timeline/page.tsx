import { Suspense } from "react";

import { NeuroTimelinePage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroTimelinePage />
    </Suspense>
  );
}
