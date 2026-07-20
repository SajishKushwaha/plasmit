"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalFrame } from "@/components/worklist/ModalFrame";
import { taskFrequencies, type TaskFrequency, type WorklistTask } from "@/types/worklist";

export type ContinueTaskForm = {
  startDate: string;
  startTime: string;
  frequency: TaskFrequency | "";
  comments: string;
};

export type ContinueTaskErrors = Partial<Record<keyof ContinueTaskForm, string>>;

export function ContinueTaskModal({
  task,
  form,
  errors,
  onChange,
  onClose,
  onContinue,
}: {
  task: WorklistTask;
  form: ContinueTaskForm;
  errors: ContinueTaskErrors;
  onChange: (updates: Partial<ContinueTaskForm>) => void;
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <ModalFrame title="Continue Task" onClose={onClose} maxWidth="max-w-lg">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-foreground sm:col-span-2">
          Task Name
          <Input className="mt-1" readOnly value={task.taskName} />
        </label>
        <label className="text-xs font-semibold text-foreground">
          Start Date
          <Input className="mt-1" type="date" value={form.startDate} onChange={(event) => onChange({ startDate: event.target.value })} />
          {errors.startDate ? <div className="mt-1 text-xs font-medium text-danger">{errors.startDate}</div> : null}
        </label>
        <label className="text-xs font-semibold text-foreground">
          Start Time
          <Input className="mt-1" type="time" value={form.startTime} onChange={(event) => onChange({ startTime: event.target.value })} />
          {errors.startTime ? <div className="mt-1 text-xs font-medium text-danger">{errors.startTime}</div> : null}
        </label>
        <label className="text-xs font-semibold text-foreground sm:col-span-2">
          Frequency
          <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={form.frequency} onChange={(event) => onChange({ frequency: event.target.value as TaskFrequency })}>
            <option value="">Select frequency</option>
            {taskFrequencies.map((frequency) => <option key={frequency}>{frequency}</option>)}
          </select>
          {errors.frequency ? <div className="mt-1 text-xs font-medium text-danger">{errors.frequency}</div> : null}
        </label>
        <label className="text-xs font-semibold text-foreground sm:col-span-2">
          Comments
          <textarea className="mt-1 min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={form.comments} onChange={(event) => onChange({ comments: event.target.value })} />
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onContinue}>Continue</Button>
        </div>
      </div>
    </ModalFrame>
  );
}
