import type { RadiologyStatus } from "@/features/radiology/types";
import { getRadiologyStatusTone, radiologyStatusLabels } from "@/features/radiology/utils/status";

interface RadiologyStatusBadgeProps {
  status: RadiologyStatus;
  compact?: boolean;
}

export function RadiologyStatusBadge({ status, compact = false }: RadiologyStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border font-medium",
        compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        getRadiologyStatusTone(status),
      ].join(" ")}
    >
      {radiologyStatusLabels[status]}
    </span>
  );
}
