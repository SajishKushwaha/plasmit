"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalFrame } from "@/components/worklist/ModalFrame";
import { taskCategories, taskFrequencies, taskPriorities, type WorklistTaskForm, type WorklistTaskFormErrors } from "@/types/worklist";

function FieldError({ message }: { message?: string }) {
  return message ? <div className="mt-1 text-xs font-medium text-danger">{message}</div> : null;
}

export function TaskFormModal({
  mode,
  form,
  errors,
  onChange,
  onClose,
  onSubmit,
}: {
  mode: "add" | "edit";
  form: WorklistTaskForm;
  errors: WorklistTaskFormErrors;
  onChange: (updates: Partial<WorklistTaskForm>) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <ModalFrame title={mode === "add" ? "Add Task" : "Edit Task"} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-foreground">
          Task Name
          <Input className="mt-1" value={form.taskName} onChange={(event) => onChange({ taskName: event.target.value })} />
          <FieldError message={errors.taskName} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Category
          <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={form.category} onChange={(event) => onChange({ category: event.target.value as WorklistTaskForm["category"] })}>
            <option value="">Select category</option>
            {taskCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <FieldError message={errors.category} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Priority
          <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={form.priority} onChange={(event) => onChange({ priority: event.target.value as WorklistTaskForm["priority"] })}>
            <option value="">Select priority</option>
            {taskPriorities.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
          <FieldError message={errors.priority} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Frequency
          <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={form.frequency} onChange={(event) => onChange({ frequency: event.target.value as WorklistTaskForm["frequency"] })}>
            <option value="">Select frequency</option>
            {taskFrequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}
          </select>
          <FieldError message={errors.frequency} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Start Date
          <Input className="mt-1" type="date" value={form.startDate} onChange={(event) => onChange({ startDate: event.target.value })} />
          <FieldError message={errors.startDate} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Start Time
          <Input className="mt-1" type="time" value={form.startTime} onChange={(event) => onChange({ startTime: event.target.value })} />
          <FieldError message={errors.startTime} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          End Date
          <Input className="mt-1" type="date" value={form.endDate ?? ""} onChange={(event) => onChange({ endDate: event.target.value })} />
          <FieldError message={errors.endDate} />
        </label>
        <label className="text-xs font-semibold text-foreground sm:col-span-2">
          Comments
          <textarea className="mt-1 min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={form.comments ?? ""} onChange={(event) => onChange({ comments: event.target.value })} />
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onSubmit}>{mode === "add" ? "Save" : "Update"}</Button>
        </div>
      </div>
    </ModalFrame>
  );
}
