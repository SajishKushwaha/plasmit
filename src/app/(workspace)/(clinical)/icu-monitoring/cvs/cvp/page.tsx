import { Suspense } from "react";

import { CvsParameterFormPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CvsParameterFormPage parameter="cvp" />
    </Suspense>
  );
}
