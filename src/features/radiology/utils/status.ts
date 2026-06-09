import type { Priority, RadiologyStatus } from "@/features/radiology/types";

export const radiologyStatusLabels: Record<RadiologyStatus, string> = {
  ORDER_CREATED: "Order Created",
  PAYMENT_PENDING: "Payment Pending",
  PAYMENT_DONE: "Payment Done",
  SCHEDULED: "Scheduled",
  PATIENT_ARRIVED: "Patient Arrived",
  PREPARATION_PENDING: "Preparation Pending",
  READY_FOR_SCAN: "Ready for Scan",
  SCAN_IN_PROGRESS: "Scan in Progress",
  SCAN_COMPLETED: "Scan Completed",
  IMAGE_SENT_TO_PACS: "Sent to PACS",
  REPORT_PENDING: "Report Pending",
  REPORT_DRAFTED: "Report Drafted",
  REPORT_VERIFIED: "Report Verified",
  REPORT_RELEASED: "Report Released",
  REPORT_DELIVERED: "Report Delivered",
  CANCELLED: "Cancelled",
};

export const radiologyStatusOrder: RadiologyStatus[] = [
  "ORDER_CREATED",
  "PAYMENT_PENDING",
  "PAYMENT_DONE",
  "SCHEDULED",
  "PATIENT_ARRIVED",
  "PREPARATION_PENDING",
  "READY_FOR_SCAN",
  "SCAN_IN_PROGRESS",
  "SCAN_COMPLETED",
  "IMAGE_SENT_TO_PACS",
  "REPORT_PENDING",
  "REPORT_DRAFTED",
  "REPORT_VERIFIED",
  "REPORT_RELEASED",
  "REPORT_DELIVERED",
];

export const priorityLabels: Record<Priority, string> = {
  ROUTINE: "Routine",
  URGENT: "Urgent",
  EMERGENCY: "Emergency",
  STAT: "STAT",
};

export function getRadiologyStatusTone(status: RadiologyStatus): string {
  const tones: Record<RadiologyStatus, string> = {
    ORDER_CREATED: "border-slate-200 bg-slate-50 text-slate-700",
    PAYMENT_PENDING: "border-amber-200 bg-amber-50 text-amber-800",
    PAYMENT_DONE: "border-emerald-200 bg-emerald-50 text-emerald-800",
    SCHEDULED: "border-sky-200 bg-sky-50 text-sky-800",
    PATIENT_ARRIVED: "border-indigo-200 bg-indigo-50 text-indigo-800",
    PREPARATION_PENDING: "border-yellow-200 bg-yellow-50 text-yellow-800",
    READY_FOR_SCAN: "border-cyan-200 bg-cyan-50 text-cyan-800",
    SCAN_IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-800",
    SCAN_COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-800",
    IMAGE_SENT_TO_PACS: "border-violet-200 bg-violet-50 text-violet-800",
    REPORT_PENDING: "border-orange-200 bg-orange-50 text-orange-800",
    REPORT_DRAFTED: "border-purple-200 bg-purple-50 text-purple-800",
    REPORT_VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-800",
    REPORT_RELEASED: "border-teal-200 bg-teal-50 text-teal-800",
    REPORT_DELIVERED: "border-green-200 bg-green-50 text-green-800",
    CANCELLED: "border-rose-200 bg-rose-50 text-rose-800",
  };

  return tones[status];
}

export function getPriorityTone(priority: Priority): string {
  const tones: Record<Priority, string> = {
    ROUTINE: "border-slate-200 bg-slate-50 text-slate-700",
    URGENT: "border-amber-200 bg-amber-50 text-amber-800",
    EMERGENCY: "border-rose-200 bg-rose-50 text-rose-800",
    STAT: "border-red-200 bg-red-50 text-red-800",
  };

  return tones[priority];
}

export function getRadiologyProgress(status: RadiologyStatus): number {
  if (status === "CANCELLED") {
    return 0;
  }

  const index = radiologyStatusOrder.indexOf(status);
  return index < 0 ? 0 : Math.round(((index + 1) / radiologyStatusOrder.length) * 100);
}
