"use client";

import * as React from "react";

import { ActiveTasksSection } from "@/components/worklist/ActiveTasksSection";
import { CompleteTaskModal } from "@/components/worklist/CompleteTaskModal";
import { ContinueTaskModal, type ContinueTaskErrors, type ContinueTaskForm } from "@/components/worklist/ContinueTaskModal";
import { DiscontinueReasonModal } from "@/components/worklist/DiscontinueReasonModal";
import { DiscontinuedTasksSection } from "@/components/worklist/DiscontinuedTasksSection";
import { SkipReasonModal } from "@/components/worklist/SkipReasonModal";
import { TaskFormModal } from "@/components/worklist/TaskFormModal";
import { WorklistHeader } from "@/components/worklist/WorklistHeader";
import {
  groupTasksByDateTime,
  hasTaskFormErrors,
  toDateInputValue,
  toLocalDateTime,
  toTimeInputValue,
  validateTaskForm,
} from "@/components/worklist/worklist-utils";
import { isLinkedCarePlanTask, readLinkedWorklistTasks, replaceLinkedWorklistTask, subscribeToLinkedWorklistTasks } from "@/components/worklist/worklist-storage";
import { NursingPatientStrip, NursingShell } from "@/features/nursing/nursing-shared";
import type { TaskCategory, TaskFrequency, TaskPriority, WorklistTask, WorklistTaskForm, WorklistTaskFormErrors } from "@/types/worklist";

function defaultTaskForm(now = new Date()): WorklistTaskForm {
  return {
    taskName: "",
    category: "",
    priority: "",
    startDate: toDateInputValue(now),
    startTime: toTimeInputValue(now),
    endDate: "",
    frequency: "",
    comments: "",
  };
}

function createInitialTasks(): WorklistTask[] {
  const now = new Date();
  const today = toDateInputValue(now);
  const olderHigh = new Date(now.getTime() - 45 * 60000);
  const olderRoutine = new Date(now.getTime() - 90 * 60000);
  return [
    {
      id: "1",
      taskName: "Capture Vitals",
      category: "Assessment",
      priority: "Moderate",
      startDate: today,
      startTime: toTimeInputValue(olderRoutine),
      endDate: "",
      frequency: "Once a day",
      comments: "",
      status: "Active",
      reason: "",
      source: "Assessment",
    },
    {
      id: "2",
      taskName: "Turn and Reposition",
      category: "Activity",
      priority: "Routine",
      startDate: today,
      startTime: toTimeInputValue(now),
      endDate: "",
      frequency: "BID",
      comments: "Turn patient every 2 hours",
      status: "Active",
      reason: "",
      source: "Manual",
    },
    {
      id: "3",
      taskName: "Administer Medication",
      category: "Medication",
      priority: "High",
      startDate: today,
      startTime: toTimeInputValue(olderHigh),
      endDate: "",
      frequency: "BID",
      comments: "",
      status: "Active",
      reason: "",
      source: "MAR",
    },
    {
      id: "4",
      taskName: "Ambulation support",
      category: "Activity",
      priority: "Routine",
      startDate: today,
      startTime: toTimeInputValue(now),
      endDate: "",
      frequency: "TID",
      comments: "Walk with assistance",
      status: "Discontinued",
      reason: "Patient on bed rest after consultant review",
      discontinuedOn: toLocalDateTime(now),
      source: "Manual",
    },
  ];
}

function toTaskForm(task: WorklistTask): WorklistTaskForm {
  return {
    taskName: task.taskName,
    category: task.category,
    priority: task.priority,
    startDate: task.startDate,
    startTime: task.startTime,
    endDate: task.endDate ?? "",
    frequency: task.frequency,
    comments: task.comments ?? "",
  };
}

function isValidCompletedForm(form: WorklistTaskForm): form is WorklistTaskForm & {
  category: TaskCategory;
  priority: TaskPriority;
  frequency: TaskFrequency;
} {
  return Boolean(form.category && form.priority && form.frequency && form.taskName.trim() && form.startDate && form.startTime);
}

export function WorklistPage() {
  const today = React.useMemo(() => toDateInputValue(new Date()), []);
  const [fromDate, setFromDate] = React.useState(today);
  const [toDate, setToDate] = React.useState(today);
  const [tasks, setTasks] = React.useState<WorklistTask[]>(() => [...createInitialTasks(), ...readLinkedWorklistTasks()]);
  const [taskForm, setTaskForm] = React.useState<WorklistTaskForm>(() => defaultTaskForm());
  const [taskFormErrors, setTaskFormErrors] = React.useState<WorklistTaskFormErrors>({});
  const [formMode, setFormMode] = React.useState<"add" | "edit" | null>(null);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = React.useState<WorklistTask | null>(null);
  const [skipTarget, setSkipTarget] = React.useState<WorklistTask | null>(null);
  const [discontinueTarget, setDiscontinueTarget] = React.useState<WorklistTask | null>(null);
  const [continueTarget, setContinueTarget] = React.useState<WorklistTask | null>(null);
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState("");
  const [continueForm, setContinueForm] = React.useState<ContinueTaskForm>(() => ({
    startDate: today,
    startTime: toTimeInputValue(new Date()),
    frequency: "",
    comments: "",
  }));
  const [continueErrors, setContinueErrors] = React.useState<ContinueTaskErrors>({});

  const dateRangeError = fromDate && toDate && fromDate > toDate ? "From Date cannot be greater than To Date." : "";

  React.useEffect(() => {
    const syncLinkedTasks = () => {
      const linkedTasks = readLinkedWorklistTasks();
      setTasks((current) => [...current.filter((task) => !isLinkedCarePlanTask(task)), ...linkedTasks]);
    };
    syncLinkedTasks();
    return subscribeToLinkedWorklistTasks(syncLinkedTasks);
  }, []);

  function updateTasks(update: (current: WorklistTask[]) => WorklistTask[]) {
    setTasks((current) => {
      const next = update(current);
      next.filter(isLinkedCarePlanTask).forEach(replaceLinkedWorklistTask);
      return next;
    });
  }

  function handleDateFilterChange(field: "fromDate" | "toDate", value: string) {
    if (field === "fromDate") setFromDate(value);
    else setToDate(value);
  }

  function handleAddTask() {
    setTaskForm(defaultTaskForm());
    setTaskFormErrors({});
    setEditingTaskId(null);
    setFormMode("add");
  }

  function handleEditTask(task: WorklistTask) {
    setTaskForm(toTaskForm(task));
    setTaskFormErrors({});
    setEditingTaskId(task.id);
    setFormMode("edit");
  }

  function saveTaskForm() {
    const errors = validateTaskForm(taskForm);
    setTaskFormErrors(errors);
    if (hasTaskFormErrors(errors) || !isValidCompletedForm(taskForm)) return;

    if (formMode === "add") {
      const nextTask: WorklistTask = {
        id: `task-${Date.now()}`,
        taskName: taskForm.taskName.trim(),
        category: taskForm.category,
        priority: taskForm.priority,
        startDate: taskForm.startDate,
        startTime: taskForm.startTime,
        endDate: taskForm.endDate,
        frequency: taskForm.frequency,
        comments: taskForm.comments,
        status: "Active",
        reason: "",
        source: "Manual",
      };
      updateTasks((current) => [...current, nextTask]);
    }

    if (formMode === "edit" && editingTaskId) {
      // Backend integration note: editing a repeating task should update only future pending occurrences and should not modify already completed occurrences.
      updateTasks((current) => current.map((task) => task.id === editingTaskId ? {
        ...task,
        taskName: taskForm.taskName.trim(),
        category: taskForm.category,
        priority: taskForm.priority,
        startDate: taskForm.startDate,
        startTime: taskForm.startTime,
        endDate: taskForm.endDate,
        frequency: taskForm.frequency,
        comments: taskForm.comments,
      } : task));
    }

    setFormMode(null);
    setEditingTaskId(null);
  }

  function handleCompleteTask(task: WorklistTask) {
    setCompleteTarget(task);
  }

  function markComplete() {
    if (!completeTarget) return;
    updateTasks((current) => current.map((task) => task.id === completeTarget.id ? { ...task, status: "Completed", reason: "" } : task));
    setCompleteTarget(null);
  }

  function handleSkipTask(task: WorklistTask) {
    setSkipTarget(task);
    setReason(task.reason ?? "");
    setReasonError("");
  }

  function saveSkipReason() {
    if (!skipTarget) return;
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setReasonError("Reason for skip is required.");
      return;
    }
    updateTasks((current) => current.map((task) => task.id === skipTarget.id ? { ...task, status: "Skipped", reason: cleanReason } : task));
    setSkipTarget(null);
    setReason("");
  }

  function handleDiscontinueTask(task: WorklistTask) {
    setDiscontinueTarget(task);
    setReason("");
    setReasonError("");
  }

  function saveDiscontinueReason() {
    if (!discontinueTarget) return;
    const cleanReason = reason.trim();
    if (!cleanReason) {
      setReasonError("Reason for discontinuing is required.");
      return;
    }
    updateTasks((current) => current.map((task) => task.id === discontinueTarget.id ? {
      ...task,
      status: "Discontinued",
      reason: cleanReason,
      discontinuedOn: toLocalDateTime(new Date()),
    } : task));
    setDiscontinueTarget(null);
    setReason("");
  }

  function handleContinueTask(task: WorklistTask) {
    setContinueTarget(task);
    setContinueForm({
      startDate: today,
      startTime: toTimeInputValue(new Date()),
      frequency: "",
      comments: task.comments ?? "",
    });
    setContinueErrors({});
  }

  function saveContinueTask() {
    if (!continueTarget) return;
    const errors: ContinueTaskErrors = {};
    if (!continueForm.startDate) errors.startDate = "Start date is required.";
    if (!continueForm.startTime) errors.startTime = "Start time is required.";
    if (!continueForm.frequency) errors.frequency = "Frequency is required.";
    setContinueErrors(errors);
    if (Object.keys(errors).length) return;

    const continuedTask: WorklistTask = {
      ...continueTarget,
      id: isLinkedCarePlanTask(continueTarget) ? continueTarget.id : `continued-${Date.now()}`,
      startDate: continueForm.startDate,
      startTime: continueForm.startTime,
      endDate: "",
      frequency: continueForm.frequency as TaskFrequency,
      comments: continueForm.comments,
      status: "Active",
      reason: "",
      discontinuedOn: undefined,
      source: continueTarget.source ?? "Manual",
    };
    // Backend integration note: real systems may keep the discontinued record as immutable history while creating this new active occurrence.
    updateTasks((current) => [...current.filter((task) => task.id !== continueTarget.id), continuedTask]);
    setContinueTarget(null);
  }

  const visibleTasks = React.useMemo(() => {
    if (dateRangeError) return [];
    return tasks.filter((task) => task.startDate >= fromDate && task.startDate <= toDate);
  }, [dateRangeError, fromDate, tasks, toDate]);

  const activeGroups = React.useMemo(() => groupTasksByDateTime(visibleTasks.filter((task) => task.status === "Active" || task.status === "Skipped")), [visibleTasks]);
  const discontinuedTasks = visibleTasks.filter((task) => task.status === "Discontinued");

  return (
    <NursingShell title="Worklist" description="Nursing task worklist with date filtering, grouped active tasks, overdue rules, and discontinuation workflows.">
      <NursingPatientStrip />
      <WorklistHeader fromDate={fromDate} toDate={toDate} error={dateRangeError} onAddTask={handleAddTask} onDateFilterChange={handleDateFilterChange} />
      <ActiveTasksSection groups={activeGroups} onEdit={handleEditTask} onComplete={handleCompleteTask} onSkip={handleSkipTask} onDiscontinue={handleDiscontinueTask} />
      <DiscontinuedTasksSection tasks={discontinuedTasks} onContinue={handleContinueTask} />

      {formMode ? (
        <TaskFormModal
          mode={formMode}
          form={taskForm}
          errors={taskFormErrors}
          onChange={(updates) => setTaskForm((current) => ({ ...current, ...updates }))}
          onClose={() => setFormMode(null)}
          onSubmit={saveTaskForm}
        />
      ) : null}
      {completeTarget ? <CompleteTaskModal task={completeTarget} onClose={() => setCompleteTarget(null)} onComplete={markComplete} /> : null}
      {skipTarget ? (
        <SkipReasonModal
          task={skipTarget}
          reason={reason}
          error={reasonError}
          onReasonChange={(value) => {
            setReason(value);
            setReasonError("");
          }}
          onClose={() => setSkipTarget(null)}
          onSave={saveSkipReason}
        />
      ) : null}
      {discontinueTarget ? (
        <DiscontinueReasonModal
          task={discontinueTarget}
          reason={reason}
          error={reasonError}
          onReasonChange={(value) => {
            setReason(value);
            setReasonError("");
          }}
          onClose={() => setDiscontinueTarget(null)}
          onSave={saveDiscontinueReason}
        />
      ) : null}
      {continueTarget ? (
        <ContinueTaskModal
          task={continueTarget}
          form={continueForm}
          errors={continueErrors}
          onChange={(updates) => setContinueForm((current) => ({ ...current, ...updates }))}
          onClose={() => setContinueTarget(null)}
          onContinue={saveContinueTask}
        />
      ) : null}
    </NursingShell>
  );
}
