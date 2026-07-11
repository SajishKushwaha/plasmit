import { Suspense } from "react";

import { NeuroMotorSensoryPage } from "@/features/clinical/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroMotorSensoryPage />
    </Suspense>
  );
}
