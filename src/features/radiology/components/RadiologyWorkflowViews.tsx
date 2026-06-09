"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileCheck2,
  FilePlus2,
  MonitorUp,
  Play,
  Printer,
  RotateCcw,
  Send,
  Truck,
  UserCheck,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CriticalAlertCard } from "@/features/radiology/components/CriticalAlertCard";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";
import { OrderTimeline } from "@/features/radiology/components/OrderTimeline";
import { PatientQueueTable } from "@/features/radiology/components/PatientQueueTable";
import { PatientSummaryCard } from "@/features/radiology/components/PatientSummaryCard";
import { PreparationChecklistCard } from "@/features/radiology/components/PreparationChecklistCard";
import { RadiologyFilterBar } from "@/features/radiology/components/RadiologyFilterBar";
import { RadiologyNewOrderDialog } from "@/features/radiology/components/RadiologyNewOrderDialog";
import { RadiologyStatsCard } from "@/features/radiology/components/RadiologyStatsCard";
import { RadiologyStatusBadge } from "@/features/radiology/components/RadiologyStatusBadge";
import { ReportPreview } from "@/features/radiology/components/ReportPreview";
import { ScanStatusCard } from "@/features/radiology/components/ScanStatusCard";
import { SchedulingCalendar } from "@/features/radiology/components/SchedulingCalendar";
import { PACSStudyTable } from "@/features/radiology/components/PACSStudyTable";
import { TechnicianWorklistTable } from "@/features/radiology/components/TechnicianWorklistTable";
import { radiologyModalities } from "@/features/radiology/data/modalities";
import { radiologyPatients } from "@/features/radiology/data/patients";
import { radiologists } from "@/features/radiology/data/radiologists";
import { reportTemplates } from "@/features/radiology/data/reports";
import { radiologyTechnicians } from "@/features/radiology/data/technicians";
import { radiologyTests } from "@/features/radiology/data/tests";
import { useRadiologyWorkspace } from "@/features/radiology/hooks/useRadiologyWorkspace";
import type { CriticalAlert, PACSStudy, RadiologyOrder, RadiologyReport, RadiologyStatus, Schedule } from "@/features/radiology/types";
import { formatCurrency, formatDateTime } from "@/features/radiology/utils/formatters";

type RadiologyFilterValues = {
  search: string;
  modalityId: string;
  status: RadiologyStatus | "ALL";
  dateRange: string;
};

const defaultRadiologyFilters: RadiologyFilterValues = {
  search: "",
  modalityId: "ALL",
  status: "ALL",
  dateRange: "ALL",
};

function patientName(patientId: string) {
  return radiologyPatients.find((patient) => patient.id === patientId)?.name ?? patientId;
}

function orderTotal(order: RadiologyOrder) {
  return radiologyTests.filter((test) => order.testIds.includes(test.id)).reduce((sum, test) => sum + test.price, 0);
}

function minutesBetween(start: string | undefined, end: string | undefined) {
  if (!start || !end) {
    return null;
  }

  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime < startTime) {
    return null;
  }

  return Math.round((endTime - startTime) / 60000);
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function matchesDateRange(value: string | undefined, dateRange: string) {
  if (!value || dateRange === "ALL" || dateRange === "CUSTOM") {
    return true;
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return true;
  }

  const today = new Date();
  const targetKey = dateKey(target);

  if (dateRange === "TODAY") {
    return targetKey === dateKey(today);
  }

  if (dateRange === "TOMORROW") {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return targetKey === dateKey(tomorrow);
  }

  if (dateRange === "THIS_WEEK") {
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    return target >= new Date(dateKey(today)) && target <= weekFromNow;
  }

  return true;
}

function orderSearchText(order: RadiologyOrder) {
  const patient = radiologyPatients.find((item) => item.id === order.patientId);
  const tests = radiologyTests.filter((test) => order.testIds.includes(test.id));

  return [
    order.orderNo,
    order.billingStatus,
    order.status,
    order.priority,
    order.clinicalIndication,
    order.provisionalDiagnosis,
    order.orderedBy,
    patient?.name,
    patient?.mrn,
    patient?.phone,
    patient?.location,
    ...tests.map((test) => `${test.name} ${test.code} ${test.bodyPart}`),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterOrders(orders: RadiologyOrder[], filters: RadiologyFilterValues) {
  const search = filters.search.trim().toLowerCase();

  return orders.filter((order) => {
    const matchesSearch = search.length === 0 || orderSearchText(order).includes(search);
    const matchesModality = filters.modalityId === "ALL" || order.modalityId === filters.modalityId;
    const matchesStatus = filters.status === "ALL" || order.status === filters.status;
    const matchesDate = matchesDateRange(order.scheduledAt ?? order.createdAt, filters.dateRange);

    return matchesSearch && matchesModality && matchesStatus && matchesDate;
  });
}

function filterSchedules(schedules: Schedule[], orders: RadiologyOrder[], filters: RadiologyFilterValues) {
  const filteredOrderIds = new Set(filterOrders(orders, filters).map((order) => order.id));

  return schedules.filter((schedule) => {
    const matchesOrder = filteredOrderIds.has(schedule.orderId);
    const matchesModality = filters.modalityId === "ALL" || schedule.modalityId === filters.modalityId;
    const matchesStatus = filters.status === "ALL" || schedule.status === filters.status;
    const matchesDate = matchesDateRange(schedule.date, filters.dateRange);

    return matchesOrder && matchesModality && matchesStatus && matchesDate;
  });
}

function filterPacsStudies(studies: PACSStudy[], orders: RadiologyOrder[], filters: RadiologyFilterValues) {
  const filteredOrderIds = new Set(filterOrders(orders, filters).map((order) => order.id));
  const search = filters.search.trim().toLowerCase();

  return studies.filter((study) => {
    const patient = radiologyPatients.find((item) => item.id === study.patientId);
    const text = [study.accessionNo, study.studyDescription, study.pacsStatus, patient?.name, patient?.mrn].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || text.includes(search);
    const matchesOrder = filteredOrderIds.has(study.orderId);
    const matchesModality = filters.modalityId === "ALL" || study.modalityId === filters.modalityId;
    const matchesDate = matchesDateRange(study.studyDateTime, filters.dateRange);

    return matchesSearch && matchesOrder && matchesModality && matchesDate;
  });
}

function filterReports(reports: RadiologyReport[], orders: RadiologyOrder[], filters: RadiologyFilterValues) {
  const filteredOrderIds = new Set(filterOrders(orders, filters).map((order) => order.id));
  const search = filters.search.trim().toLowerCase();

  return reports.filter((report) => {
    const patient = radiologyPatients.find((item) => item.id === report.patientId);
    const order = orders.find((item) => item.id === report.orderId);
    const text = [report.templateName, report.findings, report.impression, report.status, patient?.name, patient?.mrn, order?.orderNo].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || text.includes(search);
    const matchesOrder = filteredOrderIds.has(report.orderId);
    const matchesDate = matchesDateRange(report.releasedAt ?? report.verifiedAt ?? report.createdAt, filters.dateRange);

    return matchesSearch && matchesOrder && matchesDate;
  });
}

function filterAlerts(alerts: CriticalAlert[], orders: RadiologyOrder[], filters: RadiologyFilterValues) {
  const filteredOrderIds = new Set(filterOrders(orders, filters).map((order) => order.id));
  const search = filters.search.trim().toLowerCase();

  return alerts.filter((alert) => {
    const patient = radiologyPatients.find((item) => item.id === alert.patientId);
    const order = orders.find((item) => item.id === alert.orderId);
    const text = [alert.finding, alert.status, alert.severity, alert.notifiedTo, patient?.name, patient?.mrn, order?.orderNo].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = search.length === 0 || text.includes(search);
    const matchesOrder = filteredOrderIds.has(alert.orderId);
    const matchesDate = matchesDateRange(alert.notifiedAt, filters.dateRange);

    return matchesSearch && matchesOrder && matchesDate;
  });
}

function WorkflowEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1">{description}</p>
    </div>
  );
}

type RadiologyWorkspaceActions = ReturnType<typeof useRadiologyWorkspace>["actions"];

function WorkflowActionButtons({
  actions,
  order,
  allowCancel = false,
}: {
  actions: RadiologyWorkspaceActions;
  order: RadiologyOrder;
  allowCancel?: boolean;
}) {
  const canCancel = allowCancel && !["REPORT_DELIVERED", "CANCELLED"].includes(order.status);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(order.billingStatus === "Pending" || order.status === "PAYMENT_PENDING") && order.status !== "CANCELLED" ? (
        <Button onClick={() => actions.clearBilling(order.id)} size="sm">
          <CreditCard className="h-4 w-4" />
          Clear Bill
        </Button>
      ) : null}
      {["ORDER_CREATED", "PAYMENT_DONE"].includes(order.status) && order.billingStatus !== "Pending" ? (
        <Button onClick={() => actions.scheduleOrder(order.id)} size="sm">
          <Clock className="h-4 w-4" />
          Schedule
        </Button>
      ) : null}
      {order.status === "SCHEDULED" ? (
        <Button onClick={() => actions.checkIn(order.id)} size="sm">
          <UserCheck className="h-4 w-4" />
          Check-in
        </Button>
      ) : null}
      {["PATIENT_ARRIVED", "PREPARATION_PENDING"].includes(order.status) ? (
        <Button onClick={() => actions.completePreparation(order.id)} size="sm">
          <CheckCircle2 className="h-4 w-4" />
          Prep Done
        </Button>
      ) : null}
      {order.status === "READY_FOR_SCAN" ? (
        <Button onClick={() => actions.startScan(order.id)} size="sm">
          <Play className="h-4 w-4" />
          Start Scan
        </Button>
      ) : null}
      {order.status === "SCAN_IN_PROGRESS" ? (
        <Button onClick={() => actions.completeScan(order.id)} size="sm">
          Complete Scan
        </Button>
      ) : null}
      {order.status === "SCAN_COMPLETED" ? (
        <Button onClick={() => actions.sendToPacs(order.id)} size="sm">
          <MonitorUp className="h-4 w-4" />
          Send PACS
        </Button>
      ) : null}
      {["IMAGE_SENT_TO_PACS", "REPORT_PENDING", "REPORT_DRAFTED"].includes(order.status) ? (
        <Button asChild size="sm">
          <Link href="/radiology/reporting">
            <Send className="h-4 w-4" />
            Reporting
          </Link>
        </Button>
      ) : null}
      {order.status === "REPORT_VERIFIED" ? (
        <Button asChild size="sm">
          <Link href="/radiology/report-verification">
            <FileCheck2 className="h-4 w-4" />
            Release
          </Link>
        </Button>
      ) : null}
      {order.status === "REPORT_RELEASED" ? (
        <Button asChild size="sm">
          <Link href="/radiology/report-delivery">
            <Truck className="h-4 w-4" />
            Deliver
          </Link>
        </Button>
      ) : null}
      <Button asChild size="sm" variant="outline">
        <Link href={`/radiology/orders/${order.id}`}>
          <Eye className="h-4 w-4" />
          View
        </Link>
      </Button>
      {canCancel ? (
        <Button onClick={() => actions.cancelOrder(order.id)} size="sm" variant="outline">
          <XCircle className="h-4 w-4" />
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

export function RadiologyDashboardView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredOrders = filterOrders(workspace.orders, filters);
  const filteredAlerts = filterAlerts(workspace.criticalAlerts, workspace.orders, filters);
  const pendingReports = filteredOrders.filter((order) => ["IMAGE_SENT_TO_PACS", "REPORT_PENDING", "REPORT_DRAFTED"].includes(order.status)).length;
  const activeScans = filteredOrders.filter((order) => ["READY_FOR_SCAN", "SCAN_IN_PROGRESS"].includes(order.status)).length;
  const openAlerts = filteredAlerts.filter((alert) => alert.status === "Open").length;
  const actionableOrders = filteredOrders.filter((order) => !["REPORT_DELIVERED", "CANCELLED"].includes(order.status)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-end gap-2">
        <RadiologyNewOrderDialog
          trigger={
            <Button size="sm" type="button">
              <FilePlus2 className="h-4 w-4" />
              New Order
            </Button>
          }
        />
        <Button asChild size="sm" variant="outline">
          <Link href="/radiology/order-list">Open Orders</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/radiology/analytics">Analytics</Link>
        </Button>
        <Button onClick={workspace.actions.resetWorkspace} size="sm" variant="outline">
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </Button>
      </div>
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RadiologyStatsCard subtext="Filtered workspace view" title="Orders" value={filteredOrders.length} />
        <RadiologyStatsCard subtext="Ready or in scan room" title="Active Scans" value={activeScans} />
        <RadiologyStatsCard subtext="Awaiting radiologist action" title="Pending Reports" value={pendingReports} />
        <RadiologyStatsCard subtext="Need acknowledgement" title="Open Alerts" value={openAlerts} />
      </section>
      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Live Next Actions</h2>
            <p className="text-sm text-muted-foreground">Continue the workflow directly from the dashboard.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/radiology/order-list">View full worklist</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {actionableOrders.length === 0 ? (
            <WorkflowEmptyState title="No pending action" description="Filtered orders are completed or cancelled." />
          ) : (
            actionableOrders.map((order) => (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted p-3" key={order.id}>
                <div>
                  <p className="font-semibold text-foreground">{order.orderNo} - {patientName(order.patientId)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <RadiologyStatusBadge compact status={order.status} />
                    <ModalityBadge modalityId={order.modalityId} />
                  </div>
                </div>
                <WorkflowActionButtons actions={workspace.actions} order={order} />
              </div>
            ))
          )}
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <PatientQueueTable orders={filteredOrders.slice(0, 6)} patients={radiologyPatients} tests={radiologyTests} />
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? <WorkflowEmptyState title="No critical alerts" description="Critical report alerts will appear here." /> : null}
          {filteredAlerts.slice(0, 3).map((alert) => {
            const patient = radiologyPatients.find((item) => item.id === alert.patientId);
            const order = workspace.orders.find((item) => item.id === alert.orderId);
            return patient && order ? <CriticalAlertCard alert={alert} key={alert.id} order={order} patient={patient} /> : null;
          })}
        </div>
      </section>
    </div>
  );
}

export function RadiologyBillingStatusView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredOrders = filterOrders(workspace.orders, filters);
  const pendingOrders = filteredOrders.filter((order) => order.billingStatus === "Pending" || order.status === "PAYMENT_PENDING");

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <RadiologyStatsCard icon={<CreditCard className="h-5 w-5" />} subtext="Click clear bill to continue workflow" title="Pending Billing" value={pendingOrders.length} />
        <RadiologyStatsCard subtext="Paid, package, or corporate approved" title="Cleared Orders" value={filteredOrders.length - pendingOrders.length} />
        <RadiologyStatsCard subtext="This page now updates local workflow" title="Mode" value="Working" />
      </section>
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Study</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <tr>
                <td className="px-4 py-10" colSpan={6}>
                  <WorkflowEmptyState title="No billing records" description="Change filters or create a new radiology order." />
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr className="hover:bg-surface-muted" key={order.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{order.orderNo}</p>
                    <RadiologyStatusBadge compact status={order.status} />
                  </td>
                  <td className="px-4 py-3">{patientName(order.patientId)}</td>
                  <td className="px-4 py-3">
                    <ModalityBadge modalityId={order.modalityId} />
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{order.billingStatus}</td>
                  <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(orderTotal(order))}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <WorkflowActionButtons actions={workspace.actions} order={order} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RadiologyPatientQueueView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredOrders = filterOrders(workspace.orders, filters);
  const queueActionOrders = filteredOrders.filter((order) =>
    ["PAYMENT_PENDING", "PAYMENT_DONE", "ORDER_CREATED", "SCHEDULED", "PATIENT_ARRIVED", "PREPARATION_PENDING"].includes(order.status),
  );

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <PatientQueueTable orders={filteredOrders} patients={radiologyPatients} tests={radiologyTests} />
      <div className="grid gap-3 lg:grid-cols-2">
        {queueActionOrders.length === 0 ? <WorkflowEmptyState title="No queue action" description="Patients needing reception action will appear here." /> : null}
        {queueActionOrders.map((order) => (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm" key={order.id}>
              <div>
                <p className="font-semibold text-foreground">{patientName(order.patientId)}</p>
                <p className="text-sm text-muted-foreground">{order.orderNo}</p>
              </div>
              <WorkflowActionButtons actions={workspace.actions} order={order} />
            </div>
          ))}
      </div>
    </div>
  );
}

export function RadiologySchedulingWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const [slotDate, setSlotDate] = useState(new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState("10:00");
  const [technicianId, setTechnicianId] = useState(radiologyTechnicians[0]?.id ?? "");
  const filteredOrders = filterOrders(workspace.orders, filters);
  const filteredSchedules = filterSchedules(workspace.schedules, workspace.orders, filters);
  const unscheduledOrders = filteredOrders.filter(
    (order) => ["ORDER_CREATED", "PAYMENT_DONE"].includes(order.status) && order.billingStatus !== "Pending",
  );

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px_220px] md:items-end">
          <div>
            <h2 className="text-base font-semibold text-foreground">Schedule Setup</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select a date, time, and technician, then schedule ready orders.</p>
          </div>
          <label className="text-sm font-medium text-foreground">
            Date
            <input className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setSlotDate(event.target.value)} type="date" value={slotDate} />
          </label>
          <label className="text-sm font-medium text-foreground">
            Time
            <input className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setSlotTime(event.target.value)} type="time" value={slotTime} />
          </label>
          <label className="text-sm font-medium text-foreground">
            Technician
            <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setTechnicianId(event.target.value)} value={technicianId}>
              {radiologyTechnicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>
      {unscheduledOrders.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-base font-semibold text-foreground">Ready to Schedule</h2>
            <p className="text-sm text-muted-foreground">Click schedule to place the order in the calendar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unscheduledOrders.map((order) => (
              <Button
                key={order.id}
                onClick={() => workspace.actions.scheduleOrder(order.id, { date: slotDate, startTime: slotTime, technicianId })}
                size="sm"
                variant="outline"
              >
                {order.orderNo} · Schedule
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <WorkflowEmptyState title="No order ready for scheduling" description="Billing-cleared orders will appear here." />
      )}
      <SchedulingCalendar modalities={radiologyModalities} patients={radiologyPatients} schedules={filteredSchedules} tests={radiologyTests} />
    </div>
  );
}

export function RadiologyCheckInView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const checkInOrders = filterOrders(workspace.orders, filters).filter((order) => ["SCHEDULED", "PATIENT_ARRIVED", "PREPARATION_PENDING"].includes(order.status));

  return (
    <div className="space-y-4">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      {checkInOrders.length === 0 ? <WorkflowEmptyState title="No scheduled patient waiting" description="Schedule an order first, then check-in will appear here." /> : null}
      {checkInOrders.map((order) => (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm" key={order.id}>
          <div>
            <p className="font-semibold text-foreground">{patientName(order.patientId)}</p>
            <p className="text-sm text-muted-foreground">{order.orderNo} · {order.location}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RadiologyStatusBadge status={order.status} />
            <WorkflowActionButtons actions={workspace.actions} order={order} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RadiologyPreparationView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredOrders = filterOrders(workspace.orders, filters).filter((order) =>
    ["PATIENT_ARRIVED", "PREPARATION_PENDING", "READY_FOR_SCAN"].includes(order.status),
  );

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      {filteredOrders.length === 0 ? <WorkflowEmptyState title="No preparation case" description="Checked-in patients will appear here for checklist completion." /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {filteredOrders.map((order) => {
          const patient = radiologyPatients.find((item) => item.id === order.patientId);
          const test = radiologyTests.find((item) => item.id === order.testIds[0]);
          if (!patient || !test) {
            return null;
          }

          return (
            <div className="space-y-3" key={order.id}>
              <PreparationChecklistCard order={order} patient={patient} test={test} />
              <WorkflowActionButtons actions={workspace.actions} order={order} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RadiologyScanWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredOrders = filterOrders(workspace.orders, filters).filter((order) =>
    ["READY_FOR_SCAN", "SCAN_IN_PROGRESS", "SCAN_COMPLETED", "IMAGE_SENT_TO_PACS"].includes(order.status),
  );

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      {filteredOrders.length === 0 ? <WorkflowEmptyState title="No scan case" description="Prepared patients will appear here for scan management." /> : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {filteredOrders.map((order) => {
          const patient = radiologyPatients.find((item) => item.id === order.patientId);
          const test = radiologyTests.find((item) => item.id === order.testIds[0]);
          const modality = radiologyModalities.find((item) => item.id === order.modalityId);
          if (!patient || !test || !modality) {
            return null;
          }

          return (
            <div className="space-y-3" key={order.id}>
              <ScanStatusCard modality={modality} order={order} patient={patient} test={test} />
              <WorkflowActionButtons actions={workspace.actions} order={order} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RadiologyTechnicianWorklistView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredSchedules = filterSchedules(workspace.schedules, workspace.orders, filters);
  const filteredOrders = filterOrders(workspace.orders, filters);
  const technicianOrders = filteredOrders.filter((order) =>
    ["SCHEDULED", "PATIENT_ARRIVED", "PREPARATION_PENDING", "READY_FOR_SCAN", "SCAN_IN_PROGRESS", "SCAN_COMPLETED"].includes(order.status),
  );

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <TechnicianWorklistTable
        orders={filteredOrders}
        patients={radiologyPatients}
        schedules={filteredSchedules}
        technicians={radiologyTechnicians}
        tests={radiologyTests}
      />
      <section className="grid gap-4 xl:grid-cols-2">
        {technicianOrders.length === 0 ? <WorkflowEmptyState title="No technician action" description="Scheduled and scan-room cases will appear here." /> : null}
        {technicianOrders.map((order) => {
          const patient = radiologyPatients.find((item) => item.id === order.patientId);
          const test = radiologyTests.find((item) => item.id === order.testIds[0]);
          const modality = radiologyModalities.find((item) => item.id === order.modalityId);
          if (!patient || !test || !modality) {
            return null;
          }

          return (
            <div className="space-y-3" key={order.id}>
              <ScanStatusCard modality={modality} order={order} patient={patient} test={test} />
              <WorkflowActionButtons actions={workspace.actions} order={order} />
            </div>
          );
        })}
      </section>
    </div>
  );
}

export function RadiologyPacsStudiesView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredStudies = filterPacsStudies(workspace.pacsStudies, workspace.orders, filters);

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      {filteredStudies.length === 0 ? <WorkflowEmptyState title="No PACS study" description="Complete a scan and send images to PACS first." /> : null}
      <PACSStudyTable modalities={radiologyModalities} patients={radiologyPatients} studies={filteredStudies} />
      <section className="grid gap-3 lg:grid-cols-2">
        {filteredStudies.map((study) => {
          const order = workspace.orders.find((item) => item.id === study.orderId);
          return (
            <article className="rounded-lg border border-border bg-surface p-4 shadow-sm" key={study.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{study.accessionNo}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{patientName(study.patientId)} - {study.studyDescription}</p>
                </div>
                <ModalityBadge modalityId={study.modalityId} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <select
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  onChange={(event) => workspace.actions.updatePacsStatus(study.id, event.target.value as PACSStudy["pacsStatus"])}
                  value={study.pacsStatus}
                >
                  <option value="Queued">Queued</option>
                  <option value="Images Available">Images Available</option>
                  <option value="Synced">Synced</option>
                  <option value="Failed">Failed</option>
                </select>
                {order ? <WorkflowActionButtons actions={workspace.actions} order={order} /> : null}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export function RadiologyReportingWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const reportingOrders = filterOrders(workspace.orders, filters).filter((order) => ["IMAGE_SENT_TO_PACS", "REPORT_PENDING", "REPORT_DRAFTED"].includes(order.status));
  const [orderId, setOrderId] = useState(reportingOrders[0]?.id ?? "");
  const [templateName, setTemplateName] = useState(reportTemplates[0]?.name ?? "General Radiology Report");
  const [findings, setFindings] = useState("Structured findings entered by radiologist.");
  const [impression, setImpression] = useState("No acute abnormality in demo report.");
  const [critical, setCritical] = useState(false);
  const selectedOrder = reportingOrders.find((order) => order.id === orderId) ?? reportingOrders[0];
  const selectedOrderId = selectedOrder?.id ?? "";

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        {reportingOrders.length === 0 ? <WorkflowEmptyState title="No reporting case" description="Send completed images to PACS before drafting a report." /> : null}
        <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setOrderId(event.target.value)} value={selectedOrderId}>
            {reportingOrders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNo} · {patientName(order.patientId)}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap items-center gap-2">
            {selectedOrder ? <RadiologyStatusBadge status={selectedOrder.status} /> : null}
            {selectedOrder ? <ModalityBadge modalityId={selectedOrder.modalityId} /> : null}
          </div>
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
          <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setTemplateName(event.target.value)} value={templateName}>
            {reportTemplates.map((template) => (
              <option key={template.id} value={template.name}>
                {template.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-muted-foreground">Select a template, edit the findings and impression, then send the report for verification.</div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <textarea className="min-h-64 rounded-lg border border-input bg-background p-3 text-sm" onChange={(event) => setFindings(event.target.value)} value={findings} />
          <div className="space-y-3">
            <textarea className="min-h-36 w-full rounded-lg border border-input bg-background p-3 text-sm" onChange={(event) => setImpression(event.target.value)} value={impression} />
            <label className="flex items-center gap-2 text-sm">
              <input checked={critical} onChange={(event) => setCritical(event.target.checked)} type="checkbox" />
              Mark as critical finding
            </label>
            <Button
              disabled={!selectedOrderId || findings.trim().length === 0 || impression.trim().length === 0}
              onClick={() => workspace.actions.saveReportDraft(selectedOrderId, findings, impression, critical, templateName)}
            >
              <Send className="h-4 w-4" />
              Send for Verification
            </Button>
          </div>
        </div>
      </div>
      <PatientQueueTable orders={reportingOrders} patients={radiologyPatients} tests={radiologyTests} />
    </div>
  );
}

export function RadiologyVerificationWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredReports = filterReports(workspace.reports, workspace.orders, filters);
  const [reportId, setReportId] = useState("");
  const report = filteredReports.find((item) => item.id === reportId) ?? filteredReports.find((item) => item.status === "Pending Verification") ?? filteredReports[0];
  const order = workspace.orders.find((item) => item.id === report?.orderId);
  const patient = radiologyPatients.find((item) => item.id === report?.patientId);
  const test = radiologyTests.find((item) => item.id === report?.testId);
  const radiologist = radiologists.find((item) => item.id === report?.radiologistId);

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <RadiologyStatsCard icon={<FileCheck2 className="h-5 w-5" />} subtext="Click verify, then release from preview or delivery" title="Pending Verification" value={filteredReports.filter((item) => item.status === "Pending Verification").length} />
      {filteredReports.length > 0 ? (
        <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setReportId(event.target.value)} value={report?.id ?? ""}>
          {filteredReports.map((item) => (
            <option key={item.id} value={item.id}>
              {item.templateName} - {patientName(item.patientId)} - {item.status}
            </option>
          ))}
        </select>
      ) : null}
      {report && order && patient && test && radiologist ? (
        <>
          <ReportPreview order={order} patient={patient} radiologist={radiologist} report={report} test={test} />
          <div className="flex flex-wrap justify-end gap-2">
            <Button disabled={report.status === "Verified" || report.status === "Released"} onClick={() => workspace.actions.verifyReport(report.id)}>
              Verify Report
            </Button>
            <Button disabled={report.status !== "Verified"} onClick={() => workspace.actions.releaseReport(report.id)} variant="outline">
              Release Report
            </Button>
          </div>
        </>
      ) : (
        <WorkflowEmptyState title="No report available" description="Draft a report first from Reporting Workbench." />
      )}
    </div>
  );
}

export function RadiologyReportPreviewWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredReports = filterReports(workspace.reports, workspace.orders, filters);
  const [reportId, setReportId] = useState(filteredReports.find((report) => report.status === "Released")?.id ?? filteredReports[0]?.id ?? "");
  const report = filteredReports.find((item) => item.id === reportId) ?? filteredReports[0];
  const order = workspace.orders.find((item) => item.id === report?.orderId);
  const patient = radiologyPatients.find((item) => item.id === report?.patientId);
  const test = radiologyTests.find((item) => item.id === report?.testId);
  const radiologist = radiologists.find((item) => item.id === report?.radiologistId);

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setReportId(event.target.value)} value={report?.id ?? ""}>
          {filteredReports.map((item) => (
            <option key={item.id} value={item.id}>
              {item.templateName} · {patientName(item.patientId)} · {item.status}
            </option>
          ))}
        </select>
        <Button onClick={() => window.print()} variant="outline">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </section>
      <RadiologyStatsCard icon={<Printer className="h-5 w-5" />} subtext="Preview reflects current workspace report state" title="Report Preview" value={report?.status ?? "No Report"} />
      {report && order && patient && test && radiologist ? <ReportPreview order={order} patient={patient} radiologist={radiologist} report={report} test={test} /> : <WorkflowEmptyState title="No report available" description="Create a draft report first from Reporting Workbench." />}
    </div>
  );
}

export function RadiologyDeliveryWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const reports = filterReports(workspace.reports, workspace.orders, filters).filter((report) => report.status === "Verified" || report.status === "Released");

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <RadiologyStatsCard icon={<Truck className="h-5 w-5" />} subtext="Portal, print counter, ward dispatch" title="Ready for Delivery" value={reports.length} />
      {reports.length === 0 ? <WorkflowEmptyState title="No report ready for delivery" description="Verify and release a report first." /> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => {
          const order = workspace.orders.find((item) => item.id === report.orderId);
          return (
            <article className="rounded-lg border border-border bg-surface p-4 shadow-sm" key={report.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{patientName(report.patientId)}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{order?.orderNo ?? report.orderId}</p>
                </div>
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-medium">{report.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {order ? <RadiologyStatusBadge status={order.status} /> : null}
                <Button disabled={report.status !== "Verified"} onClick={() => workspace.actions.releaseReport(report.id)} size="sm" variant="outline">
                  Release
                </Button>
                <Button disabled={!order || report.status !== "Released" || order.status === "REPORT_DELIVERED"} onClick={() => order && workspace.actions.deliverReport(order.id)} size="sm">
                  <Truck className="h-4 w-4" />
                  Mark Delivered
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function RadiologyAnalyticsWorkflowView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredOrders = filterOrders(workspace.orders, filters);
  const filteredReports = filterReports(workspace.reports, workspace.orders, filters);
  const filteredStudies = filterPacsStudies(workspace.pacsStudies, workspace.orders, filters);
  const filteredAlerts = filterAlerts(workspace.criticalAlerts, workspace.orders, filters);
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + orderTotal(order), 0);
  const tatValues = filteredReports
    .map((report) => {
      const order = workspace.orders.find((item) => item.id === report.orderId);
      return minutesBetween(order?.createdAt, report.releasedAt ?? report.verifiedAt ?? report.createdAt);
    })
    .filter((value): value is number => value !== null);
  const averageTat = tatValues.length === 0 ? 0 : Math.round(tatValues.reduce((sum, value) => sum + value, 0) / tatValues.length);

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RadiologyStatsCard icon={<BarChart3 className="h-5 w-5" />} subtext="Filtered local workspace" title="Total Studies" value={filteredOrders.length} />
        <RadiologyStatsCard icon={<CreditCard className="h-5 w-5" />} subtext="Based on selected studies" title="Revenue" value={formatCurrency(totalRevenue)} />
        <RadiologyStatsCard icon={<FileCheck2 className="h-5 w-5" />} subtext={`${filteredStudies.length} PACS studies`} title="Reports" value={filteredReports.length} />
        <RadiologyStatsCard icon={<Clock className="h-5 w-5" />} subtext="Order to latest report event" title="Avg TAT" value={averageTat ? `${averageTat} min` : "N/A"} />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Modality Utilization</h2>
          <div className="mt-4 space-y-4">
            {radiologyModalities.map((modality) => {
              const count = filteredOrders.filter((order) => order.modalityId === modality.id).length;
              const percentage = filteredOrders.length === 0 ? 0 : Math.max(8, Math.round((count / filteredOrders.length) * 100));

              return (
                <div key={modality.id}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ModalityBadge modalityId={modality.id} />
                      <span className="font-medium text-foreground">{modality.name}</span>
                    </div>
                    <span className="text-muted-foreground">{count} studies</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Operational Signals</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">{filteredReports.filter((report) => report.status === "Verified" || report.status === "Released").length} reports verified or released</div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sky-900">{filteredOrders.filter((order) => order.status === "SCAN_IN_PROGRESS").length} scans currently in progress</div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">{filteredAlerts.filter((alert) => alert.status === "Open").length} critical alerts open</div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function RadiologyCriticalAlertsView() {
  const workspace = useRadiologyWorkspace();
  const [filters, setFilters] = useState(defaultRadiologyFilters);
  const filteredAlerts = filterAlerts(workspace.criticalAlerts, workspace.orders, filters);

  return (
    <div className="space-y-5">
      <RadiologyFilterBar modalities={radiologyModalities} onChange={setFilters} />
      <section className="grid gap-4 md:grid-cols-3">
        <RadiologyStatsCard icon={<AlertTriangle className="h-5 w-5" />} subtext="Open critical communications" title="Open" value={filteredAlerts.filter((alert) => alert.status === "Open").length} />
        <RadiologyStatsCard subtext="Clinician acknowledged" title="Acknowledged" value={filteredAlerts.filter((alert) => alert.status === "Acknowledged").length} />
        <RadiologyStatsCard subtext="Generated from critical report drafts" title="Total" value={filteredAlerts.length} />
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {filteredAlerts.length === 0 ? <WorkflowEmptyState title="No critical alert" description="Critical findings marked in reporting will appear here." /> : null}
        {filteredAlerts.map((alert) => {
          const patient = radiologyPatients.find((item) => item.id === alert.patientId);
          const order = workspace.orders.find((item) => item.id === alert.orderId);
          return patient && order ? (
            <div className="space-y-2" key={alert.id}>
              <CriticalAlertCard alert={alert} order={order} patient={patient} />
              <div className="flex flex-wrap gap-2">
                <Button disabled={alert.status !== "Open"} onClick={() => workspace.actions.acknowledgeAlert(alert.id)} size="sm">
                  Acknowledge
                </Button>
                <Button disabled={alert.status === "Closed"} onClick={() => workspace.actions.closeAlert(alert.id)} size="sm" variant="outline">
                  Close
                </Button>
              </div>
            </div>
          ) : null;
        })}
      </section>
    </div>
  );
}

export function RadiologyOrderDetailActions({ orderId }: { orderId: string }) {
  const workspace = useRadiologyWorkspace();
  const order = workspace.orders.find((item) => item.id === orderId);

  if (!order) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm">
      <Button asChild size="sm" variant="outline">
        <Link href="/radiology/order-list">Back to Orders</Link>
      </Button>
      <WorkflowActionButtons actions={workspace.actions} allowCancel order={order} />
      <span className="ml-auto text-xs text-muted-foreground">Updated: {formatDateTime(order.timeline.at(-1)?.timestamp ?? order.createdAt)}</span>
    </div>
  );
}

export function RadiologyOrderDetailView({ orderId }: { orderId: string }) {
  const workspace = useRadiologyWorkspace();
  const order = workspace.orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <WorkflowEmptyState
        title="Order not found"
        description="This order may have been reset from local demo data. Go back to order list and choose another order."
      />
    );
  }

  const patient = radiologyPatients.find((item) => item.id === order.patientId);
  const modality = radiologyModalities.find((item) => item.id === order.modalityId);
  const tests = radiologyTests.filter((test) => order.testIds.includes(test.id));

  if (!patient) {
    return <WorkflowEmptyState title="Patient not found" description="The selected order has no matching patient in demo data." />;
  }

  return (
    <div className="space-y-5">
      <RadiologyOrderDetailActions orderId={order.id} />
      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">{order.orderNo}</p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">Radiology Order Detail</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {formatDateTime(order.createdAt)} by {order.orderedBy}
            </p>
          </div>
          <RadiologyStatusBadge status={order.status} />
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <PatientSummaryCard order={order} patient={patient} />
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Study Information</h2>
            <div className="mt-3 space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Modality:</span> {modality?.name ?? order.modalityId}
              </p>
              <p>
                <span className="font-medium text-foreground">Location:</span> {order.location}
              </p>
              <p>
                <span className="font-medium text-foreground">Billing:</span> {order.billingStatus}
              </p>
              <p>
                <span className="font-medium text-foreground">Diagnosis:</span> {order.provisionalDiagnosis}
              </p>
            </div>
            <div className="mt-4 space-y-2">
              {tests.map((test) => (
                <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={test.id}>
                  <p className="font-medium text-foreground">{test.name}</p>
                  <p className="text-muted-foreground">{test.preparation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <OrderTimeline order={order} />
      </section>
    </div>
  );
}
