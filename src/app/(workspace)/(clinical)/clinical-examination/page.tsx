import { Suspense } from "react";

import { ClinicalExaminationPage } from "@/features/clinical/clinical-examination/clinical-examination-page";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ClinicalExaminationPage />
    </Suspense>
  );
}
