import { RotateCcw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorklistTask } from "@/types/worklist";
import { formatDateTime } from "@/components/worklist/worklist-utils";

export function DiscontinuedTasksSection({
  tasks,
  onContinue,
}: {
  tasks: WorklistTask[];
  onContinue: (task: WorklistTask) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Discontinued Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="bg-background text-xs text-muted-foreground">
              <tr>
                <th className="border-b border-border px-3 py-2 text-left font-semibold">Task Name</th>
                <th className="border-b border-border px-3 py-2 text-left font-semibold">Priority</th>
                <th className="border-b border-border px-3 py-2 text-left font-semibold">Category</th>
                <th className="border-b border-border px-3 py-2 text-left font-semibold">Discontinued On</th>
                <th className="border-b border-border px-3 py-2 text-left font-semibold">Reason</th>
                <th className="border-b border-border px-3 py-2 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="border-b border-border px-3 py-2 font-medium">{task.taskName}</td>
                  <td className="border-b border-border px-3 py-2"><Badge tone={task.priority === "High" ? "danger" : task.priority === "Moderate" ? "warning" : "muted"}>{task.priority}</Badge></td>
                  <td className="border-b border-border px-3 py-2">{task.category}</td>
                  <td className="border-b border-border px-3 py-2">{task.discontinuedOn ? formatDateTime(task.discontinuedOn) : "-"}</td>
                  <td className="border-b border-border px-3 py-2"><span className="cursor-help" title={task.reason}>{task.reason || "-"}</span></td>
                  <td className="border-b border-border px-3 py-2">
                    <Button size="sm" type="button" variant="outline" onClick={() => onContinue(task)}><RotateCcw className="h-3.5 w-3.5" />Continue</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 ? <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No discontinued tasks.</div> : null}
      </CardContent>
    </Card>
  );
}
