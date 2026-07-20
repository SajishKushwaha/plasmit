import type { TaskDisplayStatus, WorklistTask, WorklistTaskForm, WorklistTaskFormErrors } from "@/types/worklist";

export function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toTimeInputValue(date: Date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function toLocalDateTime(date: Date) {
  return `${toDateInputValue(date)}T${toTimeInputValue(date)}`;
}

export function parseTaskDateTime(task: Pick<WorklistTask, "startDate" | "startTime">) {
  const parsed = new Date(`${task.startDate}T${task.startTime || "00:00"}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateTime(dateTime: string) {
  const normalized = dateTime.includes("T") ? dateTime : dateTime.replace(" ", "T");
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateTime || "-";
  return `${pad2(parsed.getDate())}/${pad2(parsed.getMonth() + 1)}/${parsed.getFullYear()} ${pad2(parsed.getHours())}:${pad2(parsed.getMinutes())}`;
}

export function formatTaskDateTime(task: Pick<WorklistTask, "startDate" | "startTime">) {
  return formatDateTime(`${task.startDate}T${task.startTime}`);
}

export function isTaskOverdue(task: WorklistTask, now = new Date()) {
  if (task.status !== "Active") return false;
  const scheduledAt = parseTaskDateTime(task);
  if (!scheduledAt) return false;
  const diffMinutes = (now.getTime() - scheduledAt.getTime()) / 60000;
  if (task.priority === "High") return diffMinutes > 30;
  return diffMinutes > 60;
}

export function getTaskDisplayStatus(task: WorklistTask, now = new Date()): TaskDisplayStatus {
  if (isTaskOverdue(task, now)) return "Overdue";
  return task.status;
}

export function groupTasksByDateTime(tasks: WorklistTask[]) {
  const groups = new Map<string, WorklistTask[]>();
  tasks.forEach((task) => {
    const key = `${task.startDate}T${task.startTime}`;
    groups.set(key, [...(groups.get(key) ?? []), task]);
  });
  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([dateTime, groupedTasks]) => ({
      dateTime,
      label: formatDateTime(dateTime),
      tasks: groupedTasks.sort((left, right) => left.taskName.localeCompare(right.taskName)),
    }));
}

export function validateTaskForm(form: WorklistTaskForm): WorklistTaskFormErrors {
  const errors: WorklistTaskFormErrors = {};
  if (!form.taskName.trim()) errors.taskName = "Task name is required.";
  if (!form.category) errors.category = "Category is required.";
  if (!form.priority) errors.priority = "Priority is required.";
  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.startTime) errors.startTime = "Start time is required.";
  if (!form.frequency) errors.frequency = "Frequency is required.";
  if (form.endDate && form.startDate && form.endDate < form.startDate) errors.endDate = "End date cannot be before start date.";
  return errors;
}

export function hasTaskFormErrors(errors: WorklistTaskFormErrors) {
  return Object.keys(errors).length > 0;
}
