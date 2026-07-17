import { Edit3, PauseCircle, SkipForward, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorklistTask } from "@/types/worklist";
import { getTaskDisplayStatus, isTaskOverdue } from "@/components/worklist/worklist-utils";
import { StatusBadge } from "@/components/worklist/StatusBadge";

export function ActiveTasksSection({
  groups,
  onEdit,
  onComplete,
  onSkip,
  onDiscontinue,
}: {
  groups: Array<{ dateTime: string; label: string; tasks: WorklistTask[] }>;
  onEdit: (task: WorklistTask) => void;
  onComplete: (task: WorklistTask) => void;
  onSkip: (task: WorklistTask) => void;
  onDiscontinue: (task: WorklistTask) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div className="overflow-hidden rounded-md border border-border" key={group.dateTime}>
            <div className="border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-foreground">
              Date/Time: {group.label}
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead className="bg-background text-xs text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-3 py-2 text-left font-semibold">
                      Task Name
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left font-semibold">
                      Priority
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left font-semibold">
                      Category
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left font-semibold">
                      Status
                    </th>
                    <th className="border-b border-border px-3 py-2 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.tasks.map((task) => {
                    const overdue = isTaskOverdue(task);
                    const displayStatus = getTaskDisplayStatus(task);
                    return (
                      <tr
                        className={cn(
                          "align-top",
                          overdue && "bg-danger/5",
                          task.status === "Skipped" && "bg-warning/5",
                        )}
                        key={task.id}
                      >
                        <td className="border-b border-border px-3 py-2">
                          <div className="font-medium text-foreground">{task.taskName}</div>
                          {task.comments ? (
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              {task.comments}
                            </div>
                          ) : null}
                        </td>
                        <td className="border-b border-border px-3 py-2">
                          <Badge
                            tone={
                              task.priority === "High"
                                ? "danger"
                                : task.priority === "Moderate"
                                  ? "warning"
                                  : "muted"
                            }
                          >
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="border-b border-border px-3 py-2">{task.category}</td>
                        <td className="border-b border-border px-3 py-2">
                          <StatusBadge
                            priority={task.priority}
                            reason={task.reason}
                            status={displayStatus}
                          />
                        </td>
                        <td className="border-b border-border px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => onEdit(task)}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => onComplete(task)}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => onSkip(task)}
                            >
                              <SkipForward className="h-3.5 w-3.5" />
                              Skip
                            </Button>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => onDiscontinue(task)}
                            >
                              <PauseCircle className="h-3.5 w-3.5" />
                              Discontinue
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {groups.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No active tasks found for the selected date range.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
