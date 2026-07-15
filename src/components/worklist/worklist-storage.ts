import type { TaskFrequency, TaskPriority, WorklistTask } from "@/types/worklist";
import { toDateInputValue, toTimeInputValue } from "@/components/worklist/worklist-utils";

const linkedTasksStorageKey = "plasmit.linked-worklist-tasks";
const linkedTasksChangedEvent = "plasmit:linked-worklist-tasks-changed";
const carePlanTaskPrefix = "care-plan:";

export function createCarePlanWorklistTaskId({
  planId,
  problemId,
  goalId,
  interventionId,
}: {
  planId: string;
  problemId: string;
  goalId: string;
  interventionId: string;
}) {
  return `${carePlanTaskPrefix}${planId}:${problemId}:${goalId}:${interventionId}`;
}

export function isLinkedCarePlanTask(task: WorklistTask) {
  return task.id.startsWith(carePlanTaskPrefix);
}

function normalizePriority(priority: string): TaskPriority {
  if (/high|stat|urgent|critical/i.test(priority)) return "High";
  if (/moderate|medium/i.test(priority)) return "Moderate";
  return "Routine";
}

function normalizeFrequency(frequency: string): TaskFrequency {
  if (/once/i.test(frequency)) return "Once a day";
  if (/hour/i.test(frequency)) return "Hourly";
  return "As Needed";
}

export function readLinkedWorklistTasks(): WorklistTask[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(linkedTasksStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLinkedWorklistTasks(tasks: WorklistTask[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(linkedTasksStorageKey, JSON.stringify(tasks));
  window.dispatchEvent(new Event(linkedTasksChangedEvent));
}

export function subscribeToLinkedWorklistTasks(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(linkedTasksChangedEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(linkedTasksChangedEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

export function replaceLinkedWorklistTask(task: WorklistTask) {
  const current = readLinkedWorklistTasks();
  writeLinkedWorklistTasks(
    current.some((item) => item.id === task.id)
      ? current.map((item) => (item.id === task.id ? task : item))
      : [...current, task],
  );
}

export function upsertCarePlanWorklistTask({
  id,
  taskName,
  priority,
  startDate,
  startTime,
  endDate,
  frequency,
  comments,
}: {
  id: string;
  taskName: string;
  priority: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  frequency: string;
  comments?: string;
}) {
  const now = new Date();
  const current = readLinkedWorklistTasks();
  const existing = current.find((task) => task.id === id);
  const nextTask: WorklistTask = {
    id,
    taskName: taskName.trim() || "Care plan intervention",
    category: "Care Plans",
    priority: normalizePriority(priority),
    startDate: startDate || toDateInputValue(now),
    startTime: startTime || toTimeInputValue(now),
    endDate: endDate || "",
    frequency: normalizeFrequency(frequency),
    comments: [comments, frequency ? `Care plan frequency: ${frequency}` : ""]
      .filter(Boolean)
      .join(" | "),
    status: existing?.status ?? "Active",
    reason: existing?.reason ?? "",
    source: "Care Plans",
    discontinuedOn: existing?.discontinuedOn,
  };
  writeLinkedWorklistTasks(
    existing ? current.map((task) => (task.id === id ? nextTask : task)) : [...current, nextTask],
  );
}
