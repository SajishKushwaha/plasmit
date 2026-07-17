import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TaskDisplayStatus, TaskPriority } from "@/types/worklist";

export function StatusBadge({
  status,
  priority,
  reason,
}: {
  status: TaskDisplayStatus;
  priority?: TaskPriority;
  reason?: string;
}) {
  if (status === "Overdue") {
    return (
      <span className="inline-flex items-center gap-1" title={reason}>
        {priority === "High" ? (
          <span className="h-2 w-2 animate-pulse rounded-full bg-danger" />
        ) : null}
        <Badge tone="danger">Overdue</Badge>
      </span>
    );
  }

  const tone =
    status === "Active"
      ? "info"
      : status === "Skipped"
        ? "warning"
        : status === "Completed"
          ? "success"
          : "muted";
  return (
    <span title={reason}>
      <Badge className={cn(status === "Skipped" && "cursor-help")} tone={tone}>
        {status}
      </Badge>
    </span>
  );
}
