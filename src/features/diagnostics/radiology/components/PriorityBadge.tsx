import type { Priority } from "@/features/diagnostics/radiology/types";
import { getPriorityTone, priorityLabels } from "@/features/diagnostics/radiology/utils/status";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
        getPriorityTone(priority),
      ].join(" ")}
    >
      {priorityLabels[priority]}
    </span>
  );
}
