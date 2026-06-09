import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function WorklistHeader({
  fromDate,
  toDate,
  error,
  onAddTask,
  onDateFilterChange,
}: {
  fromDate: string;
  toDate: string;
  error?: string;
  onAddTask: () => void;
  onDateFilterChange: (field: "fromDate" | "toDate", value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-end">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Worklist</h1>
          <p className="mt-1 text-xs text-muted-foreground">View, complete, skip, discontinue, and continue nursing tasks by selected date range.</p>
        </div>
        <label className="text-xs font-semibold text-foreground">
          From Date
          <Input className="mt-1 w-full lg:w-44" type="date" value={fromDate} onChange={(event) => onDateFilterChange("fromDate", event.target.value)} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          To Date
          <Input className="mt-1 w-full lg:w-44" type="date" value={toDate} onChange={(event) => onDateFilterChange("toDate", event.target.value)} />
        </label>
        <Button type="button" onClick={onAddTask}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
        {error ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger lg:col-span-4">{error}</div> : null}
      </CardContent>
    </Card>
  );
}
