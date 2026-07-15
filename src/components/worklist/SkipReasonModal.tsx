import { Button } from "@/components/ui/button";
import { ModalFrame } from "@/components/worklist/ModalFrame";
import type { WorklistTask } from "@/types/worklist";

export function SkipReasonModal({
  task,
  reason,
  error,
  onReasonChange,
  onClose,
  onSave,
}: {
  task: WorklistTask;
  reason: string;
  error?: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <ModalFrame title="Reason for Skip" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-3">
        <div className="rounded-md border border-border bg-surface-muted p-3 text-sm">
          <b>Task Name:</b> {task.taskName}
        </div>
        <label className="text-xs font-semibold text-foreground">
          Reason
          <textarea
            className="mt-1 min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
        </label>
        {error ? <div className="text-xs font-medium text-danger">{error}</div> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </ModalFrame>
  );
}
