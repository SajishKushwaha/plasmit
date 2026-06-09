import { Button } from "@/components/ui/button";
import { ModalFrame } from "@/components/worklist/ModalFrame";
import type { WorklistTask } from "@/types/worklist";

const documentationCategories = ["Medication", "Assessment", "Care Plans", "POCT", "Procedure", "Diet"];

export function needsDocumentationNavigation(task: WorklistTask) {
  return documentationCategories.includes(task.category);
}

export function CompleteTaskModal({
  task,
  onClose,
  onComplete,
}: {
  task: WorklistTask;
  onClose: () => void;
  onComplete: () => void;
}) {
  const categoryMessage = needsDocumentationNavigation(task);
  return (
    <ModalFrame title="Complete Task" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="rounded-md border border-border bg-surface-muted p-3 text-sm">
          <div className="font-semibold">{task.taskName}</div>
          <div className="mt-1 text-xs text-muted-foreground">{task.category} • {task.priority}</div>
        </div>
        <p className="text-sm text-foreground">
          {categoryMessage
            ? `This task belongs to ${task.category}. In real system, user should navigate to the related ${task.category} screen for documentation.`
            : "Are you sure you want to complete this task?"}
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={onComplete}>{categoryMessage ? "Mark Complete" : "Complete"}</Button>
        </div>
      </div>
    </ModalFrame>
  );
}
