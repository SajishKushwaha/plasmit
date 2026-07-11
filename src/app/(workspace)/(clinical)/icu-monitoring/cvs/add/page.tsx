import { Suspense } from "react";

import { CvsAddPage } from "@/features/clinical/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CvsAddPage />
    </Suspense>
  );
}
