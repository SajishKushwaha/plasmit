export type TaskPriority = "High" | "Moderate" | "Routine";

export type TaskCategory =
  | "Activity"
  | "Care Plans"
  | "Medication"
  | "Assessment"
  | "Procedure"
  | "POCT"
  | "Diet"
  | "Other";

export type TaskFrequency =
  | "Once a day"
  | "BID"
  | "TID"
  | "QID"
  | "Hourly"
  | "As Needed";

export type TaskStatus = "Active" | "Completed" | "Skipped" | "Discontinued";

export type TaskDisplayStatus = TaskStatus | "Overdue";

export interface WorklistTask {
  id: string;
  taskName: string;
  category: TaskCategory;
  priority: TaskPriority;
  startDate: string;
  startTime: string;
  endDate?: string;
  frequency: TaskFrequency;
  comments?: string;
  status: TaskStatus;
  reason?: string;
  source?: string;
  discontinuedOn?: string;
}

export type WorklistTaskForm = {
  taskName: string;
  category: TaskCategory | "";
  priority: TaskPriority | "";
  startDate: string;
  startTime: string;
  endDate?: string;
  frequency: TaskFrequency | "";
  comments?: string;
};

export type WorklistTaskFormErrors = Partial<Record<keyof WorklistTaskForm, string>>;

export const taskCategories: TaskCategory[] = [
  "Activity",
  "Care Plans",
  "Medication",
  "Assessment",
  "Procedure",
  "POCT",
  "Diet",
  "Other",
];

export const taskPriorities: TaskPriority[] = ["High", "Moderate", "Routine"];

export const taskFrequencies: TaskFrequency[] = ["Once a day", "BID", "TID", "QID", "Hourly", "As Needed"];
