"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NativeSelect } from "@/features/operations/admin/admin-shared";
import { cn } from "@/lib/utils";
import {
  icuAlerts,
  icuPatients,
  icuTasks,
} from "@/features/care-team/nursing-icu/nursing-icu-data";

function icuPatientDetailHref(patientId: string) {
  return `/icu-command-center/patients/${patientId}?tab=overview`;
}

function toneForPriority(priority: string) {
  if (priority === "Critical") return "critical";
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  return "info";
}

function toneForStatus(status: string) {
  if (status === "Closed" || status === "Completed" || status === "Resolved") return "success";
  if (
    status === "Pending" ||
    status === "Open" ||
    status === "In progress" ||
    status === "In Progress" ||
    status === "Ready"
  )
    return "warning";
  if (status === "Late" || status === "Overdue") return "danger";
  return "info";
}

const criticalTypeOptions = [
  "All critical types",
  "Medication",
  "Device",
  "Doctor instruction",
  "Clinical alert",
  "Task",
];

function CollapsibleCommandPanel({
  children,
  summary,
  title,
}: {
  children: React.ReactNode;
  summary: string;
  title: string;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        className="flex w-full items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-left"
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <div>
          <div className="text-base font-black text-slate-950">{title}</div>
          <div className="mt-1 text-xs font-semibold text-slate-500">{summary}</div>
        </div>
        <div
          className={cn(
            "rounded-full border border-slate-200 bg-slate-50 p-2 transition",
            open ? "rotate-180" : "rotate-0",
          )}
        >
          ⌄
        </div>
      </button>
      {open ? children : null}
    </div>
  );
}
function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "critical" | "danger" | "warning" | "success" | "info";
}) {
  const toneClass =
    tone === "critical"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "danger"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : tone === "warning"
          ? "border-orange-200 bg-orange-50 text-orange-700"
          : tone === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-sky-200 bg-sky-50 text-sky-700";
  return (
    <div className={cn("rounded-2xl border px-4 py-3 shadow-sm", toneClass)}>
      <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}

export function ControlAuditPage() {
  const [search, setSearch] = React.useState("");
  const [unit, setUnit] = React.useState("All units");
  const [priority, setPriority] = React.useState("All priority");
  const [criticalType, setCriticalType] = React.useState("All critical types");
  const [status, setStatus] = React.useState("All status");
  const [tab, setTab] = React.useState("pending");

  const unitOptions = React.useMemo(
    () => ["All units", ...Array.from(new Set(icuPatients.map((patient) => patient.unit))).sort()],
    [],
  );
  const criticalRows = React.useMemo(
    () =>
      icuTasks.filter(
        (task) =>
          task.priority === "Critical" ||
          task.status === "Overdue" ||
          task.status === "Pending" ||
          task.status === "In progress",
      ),
    [],
  );
  const alertRows = React.useMemo(
    () => icuAlerts.filter((alert) => alert.status !== "Resolved"),
    [],
  );

  const pendingRows = criticalRows.map((task) => {
    const patient = icuPatients.find((item) => item.id === task.patientId);
    return {
      id: task.id,
      patientName: task.patientName,
      uhid: patient?.mrn ?? task.patientId,
      unit: patient?.unit ?? task.bedNo,
      bed: task.bedNo,
      criticalItem: task.taskType,
      description: task.title,
      priority: task.priority,
      dueTime: task.dueTime,
      delayDuration:
        task.status === "Overdue"
          ? `${task.dueTime} late`
          : task.status === "In progress"
            ? "Active"
            : "Pending",
      assignedNurse: task.assignedTo,
      currentStatus: task.status,
      patientId: task.patientId,
    };
  });

  const escalationRows = alertRows.map((alert) => {
    const patient = icuPatients.find((item) => item.id === alert.patientId);
    return {
      id: alert.id,
      patientName: patient?.patientName ?? alert.patientId,
      uhid: patient?.mrn ?? alert.patientId,
      unit: patient?.unit ?? alert.bedNo,
      escalationType: alert.type,
      escalationReason: alert.message,
      raisedBy: alert.owner,
      assignedTo: alert.source,
      priority:
        alert.severity === "Critical" ? "Critical" : alert.severity === "High" ? "High" : "Medium",
      raisedAt: alert.createdAt,
      currentStatus: alert.status,
      patientId: alert.patientId,
    };
  });

  const closureRows = icuPatients.map((patient) => ({
    id: patient.id,
    patientName: patient.patientName,
    uhid: patient.mrn,
    unit: patient.unit,
    bed: patient.bedNo,
    assignedUnitNurse: patient.assignedUnitNurse || patient.assignedWardNurse || "-",
    reviewStatus:
      patient.currentStatus === "Critical"
        ? "Pending"
        : patient.currentStatus === "Ready for transfer"
          ? "Ready"
          : "Pending",
    auditStatus:
      patient.currentStatus === "Critical"
        ? "Open"
        : patient.currentStatus === "Ready for transfer"
          ? "Completed"
          : "In Progress",
    handoverStatus: patient.currentStatus === "Ready for transfer" ? "Closed" : "Pending",
    documentationStatus: patient.currentStatus === "Ready for transfer" ? "Closed" : "Pending",
    closureStatus: patient.currentStatus === "Ready for transfer" ? "Closed" : "Pending",
    patientId: patient.id,
  }));

  const query = search.trim().toLowerCase();
  const filteredPending = pendingRows.filter(
    (row) =>
      (!query ||
        `${row.patientName} ${row.uhid} ${row.unit} ${row.bed} ${row.criticalItem} ${row.description} ${row.assignedNurse} ${row.currentStatus}`
          .toLowerCase()
          .includes(query)) &&
      (unit === "All units" || row.unit === unit) &&
      (priority === "All priority" || row.priority === priority) &&
      (criticalType === "All critical types" || row.criticalItem === criticalType) &&
      (status === "All status" || row.currentStatus === status),
  );
  const filteredEscalation = escalationRows.filter(
    (row) =>
      (!query ||
        `${row.patientName} ${row.uhid} ${row.unit} ${row.escalationType} ${row.escalationReason} ${row.raisedBy} ${row.assignedTo} ${row.currentStatus}`
          .toLowerCase()
          .includes(query)) &&
      (unit === "All units" || row.unit === unit) &&
      (priority === "All priority" || row.priority === priority) &&
      (criticalType === "All critical types" || row.escalationType === criticalType) &&
      (status === "All status" || row.currentStatus === status),
  );
  const filteredClosure = closureRows.filter(
    (row) =>
      (!query ||
        `${row.patientName} ${row.uhid} ${row.unit} ${row.bed} ${row.assignedUnitNurse} ${row.reviewStatus} ${row.auditStatus} ${row.handoverStatus} ${row.documentationStatus} ${row.closureStatus}`
          .toLowerCase()
          .includes(query)) &&
      (unit === "All units" || row.unit === unit) &&
      (status === "All status" ||
        [
          row.reviewStatus,
          row.auditStatus,
          row.handoverStatus,
          row.documentationStatus,
          row.closureStatus,
        ].includes(status)),
  );

  const summary = {
    criticalPatients: icuPatients.filter(
      (patient) => patient.currentStatus === "Critical" || patient.criticalityScore >= 8,
    ).length,
    overdueItems: criticalRows.filter((row) => row.status === "Overdue").length,
    pendingTasks: criticalRows.filter(
      (row) => row.status === "Pending" || row.status === "In progress",
    ).length,
    openAlerts: alertRows.length,
  };

  const reset = () => {
    setSearch("");
    setUnit("All units");
    setPriority("All priority");
    setCriticalType("All critical types");
    setStatus("All status");
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
        <div className="shrink-0"><SummaryCard label="Critical Patients" value={summary.criticalPatients} tone="critical" /></div>
        <div className="shrink-0"><SummaryCard label="Overdue Items" value={summary.overdueItems} tone={summary.overdueItems ? "danger" : "success"} /></div>
        <div className="shrink-0"><SummaryCard label="Pending Tasks" value={summary.pendingTasks} tone={summary.pendingTasks ? "warning" : "success"} /></div>
        <div className="shrink-0"><SummaryCard label="Open Alerts" value={summary.openAlerts} tone={summary.openAlerts ? "danger" : "success"} /></div>
      </div> */}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="space-y-0 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_170px_190px_135px_105px] lg:items-end">
            <label className="space-y-1 text-sm">
              <span className="block text-xs font-semibold text-slate-700">Search patient</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 border-slate-300 bg-white pl-9 text-sm"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Patient, UHID, item, alert..."
                />
              </div>
            </label>
            <NativeSelect label="ICU unit" value={unit} onChange={setUnit} options={unitOptions} />
            <NativeSelect
              label="Priority"
              value={priority}
              onChange={setPriority}
              options={["All priority", "Critical", "High", "Medium", "Routine"]}
            />
            <NativeSelect
              label="Critical type"
              value={criticalType}
              onChange={setCriticalType}
              options={criticalTypeOptions}
            />
            <NativeSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                "All status",
                "Pending",
                "Late",
                "Overdue",
                "Completed",
                "Open",
                "In Progress",
                "Resolved",
                "Closed",
                "Ready",
              ]}
            />
            {/* <Button className="h-10" variant="outline" onClick={reset}>Reset</Button> */}
          </div>

          <Tabs className="w-full p-4" value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-slate-200 bg-slate-50 p-0">
              <TabsTrigger
                className="rounded-none border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition data-[state=active]:!border-b-2 data-[state=active]:!border-b-sky-600 data-[state=active]:!bg-white data-[state=active]:!text-sky-700"
                value="pending"
              >
                Pending Critical Items
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none border-r border-slate-200 px-4 py-3 text-sm font-semibold text-slate-500 transition data-[state=active]:!border-b-2 data-[state=active]:!border-b-sky-600 data-[state=active]:!bg-white data-[state=active]:!text-sky-700"
                value="escalation"
              >
                Escalation Oversight
              </TabsTrigger>
              <TabsTrigger
                className="rounded-none px-4 py-3 text-sm font-semibold text-slate-500 transition data-[state=active]:!border-b-2 data-[state=active]:!border-b-sky-600 data-[state=active]:!bg-white data-[state=active]:!text-sky-700"
                value="closure"
              >
                Final Review / Closure
              </TabsTrigger>
            </TabsList>

            <TabsContent className="m-0" value="pending">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px] border-collapse text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left">Patient</th>
                      <th className="px-4 py-3 text-left">ICU Unit</th>
                      <th className="px-4 py-3 text-left">Critical Item</th>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-center">Priority</th>
                      <th className="px-4 py-3 text-left">Due Time</th>
                      <th className="px-4 py-3 text-left">Delay Duration</th>
                      {/* <th className="px-4 py-3 text-left">Assigned Nurse</th> */}
                      <th className="px-4 py-3 text-center">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredPending.map((row) => (
                      <tr className="align-middle hover:bg-sky-50/40" key={row.id}>
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            <p className="text-sm font-black tracking-tight text-slate-950">
                              {row?.patientName ?? row.patientName ?? "Unknown patient"}
                            </p>
                            <p className="text-xs font-semibold text-slate-700">
                              {row.uhid} | {row?.bed ?? row.patientId}
                            </p>
                            <p className="text-xs text-slate-500">
                              {row?.assignedNurse ?? row.assignedNurse}{" "}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{row.unit}</td>
                        <td className="px-4 py-4 text-slate-700">{row.criticalItem}</td>
                        <td className="px-4 py-4 text-slate-700">{row.description}</td>
                        <td className="px-4 py-4 text-center">
                          <StatusPill tone={toneForPriority(row.priority)}>
                            {row.priority}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{row.dueTime}</td>
                        <td className="px-4 py-4 text-slate-700">{row.delayDuration}</td>
                        {/* <td className="px-4 py-4 text-slate-700">{row.assignedNurse}</td> */}
                        <td className="px-4 py-4 text-center">
                          <Link
                            className="inline-flex"
                            href={`/nursing-icu/audit-and-control?patientId=${row.patientId}`}
                          >
                            <StatusPill tone={toneForStatus(row.currentStatus)}>
                              {row.currentStatus}
                            </StatusPill>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {!filteredPending.length ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={11}>
                          No critical item matched the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent className="m-0" value="escalation">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left">Patient</th>
                      {/* <th className="px-4 py-3 text-left">UHID</th> */}
                      {/* <th className="px-4 py-3 text-left">ICU Unit</th> */}
                      <th className="px-4 py-3 text-left">Escalation Type</th>
                      <th className="px-4 py-3 text-left">Escalation Reason</th>
                      <th className="px-4 py-3 text-left">Raised By</th>
                      <th className="px-4 py-3 text-left">Assigned To</th>
                      <th className="px-4 py-3 text-center">Priority</th>
                      <th className="px-4 py-3 text-left">Raised Date & Time</th>
                      <th className="px-4 py-3 text-center">Current Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredEscalation.map((row) => (
                      <tr className="align-middle hover:bg-sky-50/40" key={row.id}>
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            <p className="text-sm font-black tracking-tight text-slate-950">
                              {row?.patientName ?? row.patientName ?? "Unknown patient"}
                            </p>
                            <p className="text-xs font-semibold text-slate-700">
                              {row.uhid} | {row?.unit ?? row.patientId}
                            </p>
                          </div>
                        </td>
                        {/* <td className="px-4 py-4 text-slate-700">{row.uhid}</td>
                        <td className="px-4 py-4 text-slate-700">{row.unit}</td> */}
                        <td className="px-4 py-4 text-slate-700">{row.escalationType}</td>
                        <td className="px-4 py-4 text-slate-700">{row.escalationReason}</td>
                        <td className="px-4 py-4 text-slate-700">{row.raisedBy}</td>
                        <td className="px-4 py-4 text-slate-700">{row.assignedTo}</td>
                        <td className="px-4 py-4 text-center">
                          <StatusPill tone={toneForPriority(row.priority)}>
                            {row.priority}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{row.raisedAt}</td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            className="inline-flex"
                            href={`/icu-command-center/critical-care/escalation-center?patientId=${row.patientId}`}
                          >
                            <StatusPill tone={toneForStatus(row.currentStatus)}>
                              {row.currentStatus}
                            </StatusPill>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {!filteredEscalation.length ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={10}>
                          No escalation matched the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent className="m-0" value="closure">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px] border-collapse text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left">Patient</th>
                      <th className="px-4 py-3 text-left">ICU Unit</th>
                      <th className="px-4 py-3 text-left">Assigned Unit Nurse</th>
                      <th className="px-4 py-3 text-center">Review Status</th>
                      <th className="px-4 py-3 text-center">Audit Status</th>
                      <th className="px-4 py-3 text-center">Handover Status</th>
                      <th className="px-4 py-3 text-center">Documentation Status</th>
                      <th className="px-4 py-3 text-center">Closure Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredClosure.map((row) => (
                      <tr className="align-middle hover:bg-sky-50/40" key={row.id}>
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            <p className="text-sm font-black tracking-tight text-slate-950">
                              {row?.patientName ?? row.patientName ?? "Unknown patient"}
                            </p>
                            <p className="text-xs font-semibold text-slate-700">
                              {row.uhid} | {row?.bed ?? row.patientId}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{row.unit}</td>
                        <td className="px-4 py-4 text-slate-700">{row.assignedUnitNurse}</td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            className="inline-flex"
                            href={`/nursing-icu/audit-and-control?patientId=${row.patientId}`}
                          >
                            <StatusPill tone={toneForStatus(row.reviewStatus)}>
                              {row.reviewStatus}
                            </StatusPill>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            className="inline-flex"
                            href={`/nursing-icu/audit-and-control?patientId=${row.patientId}`}
                          >
                            <StatusPill tone={toneForStatus(row.auditStatus)}>
                              {row.auditStatus}
                            </StatusPill>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            className="inline-flex"
                            href={`/nursing-icu/head-nurse-console/verify-handover?patientId=${row.patientId}`}
                          >
                            <StatusPill tone={toneForStatus(row.handoverStatus)}>
                              {row.handoverStatus}
                            </StatusPill>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <StatusPill tone={toneForStatus(row.documentationStatus)}>
                            {row.documentationStatus}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link
                            className="inline-flex"
                            href={`/nursing-icu/head-nurse-console/verify-handover?patientId=${row.patientId}`}
                          >
                            <StatusPill tone={toneForStatus(row.closureStatus)}>
                              {row.closureStatus}
                            </StatusPill>
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {!filteredClosure.length ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={10}>
                          No closure row matched the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
