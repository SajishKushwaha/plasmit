"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { criticalAlerts as seedCriticalAlerts } from "@/features/radiology/data/criticalAlerts";
import { pacsStudies as seedPacsStudies } from "@/features/radiology/data/pacsStudies";
import { radiologyOrders as seedOrders } from "@/features/radiology/data/radiologyOrders";
import { radiologyReports as seedReports } from "@/features/radiology/data/reports";
import { radiologySchedules as seedSchedules } from "@/features/radiology/data/schedules";
import { radiologyTechnicians } from "@/features/radiology/data/technicians";
import { radiologists } from "@/features/radiology/data/radiologists";
import { radiologyTests } from "@/features/radiology/data/tests";
import type {
  CriticalAlert,
  PACSStudy,
  Priority,
  RadiologyOrder,
  RadiologyReport,
  RadiologyStatus,
  Schedule,
} from "@/features/radiology/types";

const STORAGE_KEY = "plasmit-radiology-workspace-v1";
const WORKSPACE_EVENT = "plasmit-radiology-workspace-change";

interface RadiologyWorkspaceState {
  orders: RadiologyOrder[];
  schedules: Schedule[];
  reports: RadiologyReport[];
  pacsStudies: PACSStudy[];
  criticalAlerts: CriticalAlert[];
}

interface CreateOrderInput {
  patientId: string;
  testIds: string[];
  priority: Priority;
  billingStatus: RadiologyOrder["billingStatus"];
  clinicalIndication: string;
  provisionalDiagnosis: string;
  orderedBy: string;
}

interface ScheduleOrderInput {
  date?: string;
  startTime?: string;
  room?: string;
  technicianId?: string;
}

const defaultState: RadiologyWorkspaceState = {
  orders: seedOrders,
  schedules: seedSchedules,
  reports: seedReports,
  pacsStudies: seedPacsStudies,
  criticalAlerts: seedCriticalAlerts,
};

let cachedRawWorkspace: string | null = null;
let cachedWorkspace = defaultState;

function cloneDefaultState(): RadiologyWorkspaceState {
  return {
    orders: [...defaultState.orders],
    schedules: [...defaultState.schedules],
    reports: [...defaultState.reports],
    pacsStudies: [...defaultState.pacsStudies],
    criticalAlerts: [...defaultState.criticalAlerts],
  };
}

function readWorkspace(): RadiologyWorkspaceState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      if (cachedRawWorkspace !== null) {
        cachedRawWorkspace = null;
        cachedWorkspace = cloneDefaultState();
      }
      return cachedWorkspace;
    }

    if (saved === cachedRawWorkspace) {
      return cachedWorkspace;
    }

    const parsed = JSON.parse(saved) as Partial<RadiologyWorkspaceState>;
    cachedRawWorkspace = saved;
    cachedWorkspace = {
      orders: parsed.orders ?? defaultState.orders,
      schedules: parsed.schedules ?? defaultState.schedules,
      reports: parsed.reports ?? defaultState.reports,
      pacsStudies: parsed.pacsStudies ?? defaultState.pacsStudies,
      criticalAlerts: parsed.criticalAlerts ?? defaultState.criticalAlerts,
    };
    return cachedWorkspace;
  } catch {
    return cachedWorkspace;
  }
}

function persistWorkspace(state: RadiologyWorkspaceState) {
  const serialized = JSON.stringify(state);
  cachedRawWorkspace = serialized;
  cachedWorkspace = state;
  window.localStorage.setItem(STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(WORKSPACE_EVENT));
}

function subscribeWorkspace(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(WORKSPACE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(WORKSPACE_EVENT, onStoreChange);
  };
}

function appendTimeline(order: RadiologyOrder, status: RadiologyStatus, label: string, actor: string, note?: string): RadiologyOrder {
  return {
    ...order,
    status,
    timeline: [
      ...order.timeline,
      {
        status,
        label,
        timestamp: new Date().toISOString(),
        actor,
        note,
      },
    ],
  };
}

function makeOrderNo(orderCount: number): string {
  return `RAD-2026-${String(7100 + orderCount + 1).padStart(5, "0")}`;
}

function addMinutesToTime(time: string, minutes: number) {
  const [hours = "0", rawMinutes = "0"] = time.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(rawMinutes), 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
}

function firstTechnicianForModality(modalityId: string) {
  return radiologyTechnicians.find((technician) => technician.modalities.includes(modalityId))?.id ?? radiologyTechnicians[0]?.id ?? "tech-1";
}

function firstRadiologistForModality(modalityId: string) {
  return radiologists.find((radiologist) => radiologist.modalities.includes(modalityId))?.id ?? radiologists[0]?.id ?? "rad-1";
}

function updateScheduleStatus(schedules: Schedule[], orderId: string, status: RadiologyStatus) {
  return schedules.map((schedule) => (schedule.orderId === orderId ? { ...schedule, status } : schedule));
}

export function useRadiologyWorkspace() {
  const state = useSyncExternalStore(subscribeWorkspace, readWorkspace, () => defaultState);

  const commit = useCallback((updater: (current: RadiologyWorkspaceState) => RadiologyWorkspaceState, message?: string) => {
    const nextState = updater(readWorkspace());
    persistWorkspace(nextState);

    if (message) {
      toast.success(message);
    }
  }, []);

  const actions = useMemo(
    () => ({
      resetWorkspace() {
        commit(() => cloneDefaultState(), "Radiology demo data reset");
      },

      createOrder(input: CreateOrderInput) {
        const firstTest = radiologyTests.find((test) => test.id === input.testIds[0]);
        if (!firstTest) {
          toast.error("Select at least one radiology test");
          return "";
        }

        const orderId = `ord-local-${Date.now()}`;
        const initialStatus: RadiologyStatus = input.billingStatus === "Pending" ? "PAYMENT_PENDING" : "PAYMENT_DONE";
        const now = new Date().toISOString();

        const newOrder: RadiologyOrder = {
          id: orderId,
          orderNo: makeOrderNo(state.orders.length),
          patientId: input.patientId,
          testIds: input.testIds,
          modalityId: firstTest.modalityId,
          priority: input.priority,
          status: initialStatus,
          billingStatus: input.billingStatus,
          orderedBy: input.orderedBy,
          clinicalIndication: input.clinicalIndication,
          provisionalDiagnosis: input.provisionalDiagnosis,
          createdAt: now,
          location: "Radiology Reception",
          timeline: [
            {
              status: "ORDER_CREATED",
              label: "Order created",
              timestamp: now,
              actor: input.orderedBy,
            },
            {
              status: initialStatus,
              label: initialStatus === "PAYMENT_PENDING" ? "Billing pending" : "Billing cleared",
              timestamp: now,
              actor: "Radiology Desk",
            },
          ],
        };

        commit((current) => ({ ...current, orders: [newOrder, ...current.orders] }), "Radiology order created");
        return orderId;
      },

      updateOrderStatus(orderId: string, status: RadiologyStatus, label: string, actor: string, note?: string) {
        commit(
          (current) => ({
            ...current,
            orders: current.orders.map((order) => (order.id === orderId ? appendTimeline(order, status, label, actor, note) : order)),
          }),
          label,
        );
      },

      clearBilling(orderId: string) {
        commit(
          (current) => ({
            ...current,
            orders: current.orders.map((order) =>
              order.id === orderId
                ? appendTimeline({ ...order, billingStatus: "Paid" }, "PAYMENT_DONE", "Payment received", "Billing Desk")
                : order,
            ),
          }),
          "Billing cleared",
        );
      },

      scheduleOrder(orderId: string, input: ScheduleOrderInput = {}) {
        const now = new Date();
        const start = new Date(now.getTime() + 30 * 60 * 1000);

        commit(
          (current) => {
            const order = current.orders.find((item) => item.id === orderId);
            if (!order) {
              return current;
            }

            const testId = order.testIds[0];
            const test = radiologyTests.find((item) => item.id === testId);
            const startTime = input.startTime ?? start.toTimeString().slice(0, 5);
            const technicianId = input.technicianId ?? order.assignedTechnicianId ?? firstTechnicianForModality(order.modalityId);
            const schedule: Schedule = {
              id: `sch-local-${Date.now()}`,
              orderId,
              patientId: order.patientId,
              testId,
              modalityId: order.modalityId,
              date: input.date ?? start.toISOString().slice(0, 10),
              startTime,
              endTime: addMinutesToTime(startTime, test?.durationMinutes ?? 20),
              room: input.room ?? order.location ?? "Auto Assigned Room",
              technicianId,
              status: "SCHEDULED",
            };

            return {
              ...current,
              schedules: [schedule, ...current.schedules.filter((item) => item.orderId !== orderId)],
              orders: current.orders.map((item) =>
                item.id === orderId
                  ? appendTimeline(
                      {
                        ...item,
                        scheduledAt: `${schedule.date}T${schedule.startTime}:00`,
                        location: schedule.room,
                        assignedTechnicianId: technicianId,
                        assignedRadiologistId: item.assignedRadiologistId ?? firstRadiologistForModality(item.modalityId),
                      },
                      "SCHEDULED",
                      "Slot scheduled",
                      "Radiology Reception",
                    )
                  : item,
              ),
            };
          },
          "Slot scheduled",
        );
      },

      checkIn(orderId: string) {
        commit(
          (current) => ({
            ...current,
            schedules: updateScheduleStatus(current.schedules, orderId, "PATIENT_ARRIVED"),
            orders: current.orders.map((order) =>
              order.id === orderId ? appendTimeline(order, "PATIENT_ARRIVED", "Patient checked in", "Radiology Reception") : order,
            ),
          }),
          "Patient checked in",
        );
      },

      completePreparation(orderId: string) {
        commit(
          (current) => ({
            ...current,
            schedules: updateScheduleStatus(current.schedules, orderId, "READY_FOR_SCAN"),
            orders: current.orders.map((order) =>
              order.id === orderId ? appendTimeline(order, "READY_FOR_SCAN", "Preparation completed", "Nursing Assistant") : order,
            ),
          }),
          "Preparation completed",
        );
      },

      startScan(orderId: string) {
        commit(
          (current) => ({
            ...current,
            schedules: updateScheduleStatus(current.schedules, orderId, "SCAN_IN_PROGRESS"),
            orders: current.orders.map((order) =>
              order.id === orderId ? appendTimeline(order, "SCAN_IN_PROGRESS", "Scan started", "Technician") : order,
            ),
          }),
          "Scan started",
        );
      },

      completeScan(orderId: string) {
        commit(
          (current) => ({
            ...current,
            schedules: updateScheduleStatus(current.schedules, orderId, "SCAN_COMPLETED"),
            orders: current.orders.map((order) =>
              order.id === orderId ? appendTimeline(order, "SCAN_COMPLETED", "Scan completed", "Technician") : order,
            ),
          }),
          "Scan completed",
        );
      },

      sendToPacs(orderId: string) {
        commit(
          (current) => {
            const order = current.orders.find((item) => item.id === orderId);
            if (!order) {
              return current;
            }

            const studyExists = current.pacsStudies.some((study) => study.orderId === orderId);
            const test = radiologyTests.find((item) => item.id === order.testIds[0]);
            const pacsStudy: PACSStudy = {
              id: `pacs-local-${Date.now()}`,
              accessionNo: `ACC-${order.modalityId.toUpperCase()}-${Date.now().toString().slice(-6)}`,
              orderId,
              patientId: order.patientId,
              modalityId: order.modalityId,
              studyDescription: test?.name ?? "Radiology Study",
              imageCount: 96,
              studyDateTime: new Date().toISOString(),
              pacsStatus: "Images Available",
              viewerUrl: `/radiology/pacs-studies?pacs=${orderId}`,
            };

            return {
              ...current,
              pacsStudies: studyExists ? current.pacsStudies : [pacsStudy, ...current.pacsStudies],
              schedules: updateScheduleStatus(current.schedules, orderId, "IMAGE_SENT_TO_PACS"),
              orders: current.orders.map((item) =>
                item.id === orderId ? appendTimeline(item, "IMAGE_SENT_TO_PACS", "Images sent to PACS", "PACS Gateway") : item,
              ),
            };
          },
          "Images sent to PACS",
        );
      },

      saveReportDraft(orderId: string, findings: string, impression: string, critical: boolean, templateName = "General Radiology Report") {
        commit(
          (current) => {
            const order = current.orders.find((item) => item.id === orderId);
            if (!order) {
              return current;
            }

            const existingReport = current.reports.find((report) => report.orderId === orderId);
            const radiologistId = order.assignedRadiologistId ?? radiologists[0]?.id ?? "rad-1";
            const report: RadiologyReport = {
              id: existingReport?.id ?? `rep-local-${Date.now()}`,
              orderId,
              patientId: order.patientId,
              testId: order.testIds[0],
              radiologistId,
              templateName: existingReport?.templateName ?? templateName,
              findings,
              impression,
              status: "Pending Verification",
              critical,
              createdAt: existingReport?.createdAt ?? new Date().toISOString(),
            };

            const existingAlert = current.criticalAlerts.find((item) => item.orderId === orderId && item.status !== "Closed");
            const alert: CriticalAlert | null = critical
              ? {
                  id: existingAlert?.id ?? `alert-local-${Date.now()}`,
                  orderId,
                  patientId: order.patientId,
                  severity: "Critical",
                  finding: impression,
                  notifiedTo: order.orderedBy,
                  notifiedAt: existingAlert?.notifiedAt ?? new Date().toISOString(),
                  status: "Open",
                }
              : null;

            return {
              ...current,
              reports: [report, ...current.reports.filter((item) => item.id !== report.id)],
              criticalAlerts: alert
                ? existingAlert
                  ? current.criticalAlerts.map((item) => (item.id === existingAlert.id ? alert : item))
                  : [alert, ...current.criticalAlerts]
                : current.criticalAlerts,
              orders: current.orders.map((item) =>
                item.id === orderId ? appendTimeline(item, "REPORT_DRAFTED", "Report drafted", "Radiologist") : item,
              ),
            };
          },
          "Report sent for verification",
        );
      },

      verifyReport(reportId: string) {
        commit(
          (current) => {
            const report = current.reports.find((item) => item.id === reportId);
            if (!report) {
              return current;
            }

            return {
              ...current,
              reports: current.reports.map((item) =>
                item.id === reportId ? { ...item, status: "Verified", verifiedAt: new Date().toISOString() } : item,
              ),
              orders: current.orders.map((order) =>
                order.id === report.orderId ? appendTimeline(order, "REPORT_VERIFIED", "Report verified", "Senior Radiologist") : order,
              ),
            };
          },
          "Report verified",
        );
      },

      releaseReport(reportId: string) {
        commit(
          (current) => {
            const report = current.reports.find((item) => item.id === reportId);
            if (!report) {
              return current;
            }

            return {
              ...current,
              reports: current.reports.map((item) =>
                item.id === reportId ? { ...item, status: "Released", releasedAt: new Date().toISOString() } : item,
              ),
              orders: current.orders.map((order) =>
                order.id === report.orderId ? appendTimeline(order, "REPORT_RELEASED", "Report released", "Radiology Desk") : order,
              ),
            };
          },
          "Report released",
        );
      },

      deliverReport(orderId: string) {
        actions.updateOrderStatus(orderId, "REPORT_DELIVERED", "Report delivered", "Report Delivery Desk");
      },

      cancelOrder(orderId: string) {
        commit(
          (current) => ({
            ...current,
            schedules: updateScheduleStatus(current.schedules, orderId, "CANCELLED"),
            orders: current.orders.map((order) => (order.id === orderId ? appendTimeline(order, "CANCELLED", "Order cancelled", "Radiology Desk") : order)),
          }),
          "Order cancelled",
        );
      },

      updatePacsStatus(studyId: string, pacsStatus: PACSStudy["pacsStatus"]) {
        commit(
          (current) => ({
            ...current,
            pacsStudies: current.pacsStudies.map((study) => (study.id === studyId ? { ...study, pacsStatus } : study)),
          }),
          "PACS status updated",
        );
      },

      acknowledgeAlert(alertId: string) {
        commit(
          (current) => ({
            ...current,
            criticalAlerts: current.criticalAlerts.map((alert) =>
              alert.id === alertId
                ? {
                    ...alert,
                    status: "Acknowledged",
                    acknowledgedBy: "Duty Doctor",
                    acknowledgedAt: new Date().toISOString(),
                  }
                : alert,
            ),
          }),
          "Critical alert acknowledged",
        );
      },

      closeAlert(alertId: string) {
        commit(
          (current) => ({
            ...current,
            criticalAlerts: current.criticalAlerts.map((alert) =>
              alert.id === alertId
                ? {
                    ...alert,
                    status: "Closed",
                    acknowledgedBy: alert.acknowledgedBy ?? "Duty Doctor",
                    acknowledgedAt: alert.acknowledgedAt ?? new Date().toISOString(),
                  }
                : alert,
            ),
          }),
          "Critical alert closed",
        );
      },
    }),
    [commit, state.orders.length],
  );

  return {
    ...state,
    actions,
  };
}
