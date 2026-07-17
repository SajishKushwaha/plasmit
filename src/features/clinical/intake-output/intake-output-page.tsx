"use client";

import { IntakeOutputWorkspace } from "@/features/care-team/nursing-icu/components/intake-output-workspace";

type IntakeOutputPageProps = {
  initialPatientId?: string;
  lockedPatientId?: string;
  forceFluidBalanceView?: boolean;
};

export function IntakeOutputPage({
  initialPatientId = "icu-001",
  lockedPatientId,
  forceFluidBalanceView,
}: IntakeOutputPageProps = {}) {
  return (
    <IntakeOutputWorkspace
      forceFluidBalanceView={forceFluidBalanceView}
      initialMode="Graph"
      initialPatientId={initialPatientId}
      initialView="Hourly"
      lockedPatientId={lockedPatientId}
    />
  );
}
