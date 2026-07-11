import { Suspense } from "react";

import { NeuroDeliriumPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroDeliriumPage />
    </Suspense>
  );
}
