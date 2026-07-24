"use client";

import { IntakeOutputWorkspace } from "@/features/care-team/nursing-icu/components/intake-output-workspace";

type IntakeOutputPageProps = {
  initialPatientId?: string;
  lockedPatientId?: string;
  hidePatientStrip?: boolean;
  forceFluidBalanceView?: boolean;
};

export function IntakeOutputPage({
  initialPatientId = "icu-001",
  lockedPatientId,
  hidePatientStrip,
  forceFluidBalanceView,
}: IntakeOutputPageProps = {}) {
  return (
    <IntakeOutputWorkspace
      forceFluidBalanceView={forceFluidBalanceView}
      hidePatientStrip={hidePatientStrip}
      initialMode="Graph"
      initialPatientId={initialPatientId}
      initialView="Hourly"
      lockedPatientId={lockedPatientId}
    />
  );
}
