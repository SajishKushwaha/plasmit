import { Suspense } from "react";

import { SurgerySchedulePage } from "@/features/surgery/surgery-pages";

export default function SurgeryScheduleRoute() {
  return (
    <Suspense fallback={null}>
      <SurgerySchedulePage />
    </Suspense>
  );
}
