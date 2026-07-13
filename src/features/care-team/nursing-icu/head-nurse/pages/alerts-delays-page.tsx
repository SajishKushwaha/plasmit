"use client";

import * as React from "react";

import { CenterModal } from "@/components/ui/center-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { icuAlerts, icuTasks } from "../../nursing-icu-data";
import { headNursePatients } from "../head-nurse-mock-data";
import { HeadNurseTonePill, InfoTile } from "../head-nurse-patient-context";
import type { HeadNursePageProps, HeadNurseTone } from "../head-nurse-types";

type EscalationAction = "Review" | "Forward" | "Resolve";
type EscalationStatus = "Open" | "Awaiting Review" | "Forwarded" | "Resolved";
type EscalationSeverity = "Critical" | "High" | "Medium" | "Info";
type EscalationKind = "alert" | "task";

type EscalationRow = {
  recordKey: string;
  sourceKind: EscalationKind;
  sourceId: string;
  patientId: string;
  patientName: string;
  bedNo: string;
  unit: string;
  raisedBy: string;
  raisedByNote: string;
  escalation: string;
  escalationDetail: string;
  severity: EscalationSeverity;
  status: EscalationStatus;
  unitAction: string;
  unitActionNote: string;
  sourceLabel: string;
  createdAt: string;
};

type EscalationStore = Record<string, { status: EscalationStatus; unitAction: string; unitActionNote: string; updatedAt: string }>;

type ActiveActionState = {
  row: EscalationRow;
  action: EscalationAction;
};

const ESCALATION_STORE_KEY = "head-nurse-escalation-history";

const PAGE_SIZE = 5;

export function AlertsDelaysPage({ initialPatientId }: HeadNursePageProps) {
  void initialPatientId;
  return <AlertsDelaysView />;
}

function AlertsDelaysView() {
  const [search, setSearch] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<"All severity" | EscalationSeverity>("All severity");
  const [statusFilter, setStatusFilter] = React.useState<"Open work" | "All work" | EscalationStatus>("Open work");
  const [dateFilter, setDateFilter] = React.useState("");
  const [store, setStore] = React.useState<EscalationStore>({});
  const [page, setPage] = React.useState(1);
  const [activeAction, setActiveAction] = React.useState<ActiveActionState | null>(null);

  React.useEffect(() => {
    const refresh = () => setStore(readEscalationStore());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("head-nurse-escalation-store-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("head-nurse-escalation-store-change", refresh);
    };
  }, []);

  const rows = React.useMemo(() => buildEscalationRows(store), [store]);
  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !query || [row.patientName, row.bedNo, row.unit, row.raisedBy, row.raisedByNote, row.escalation, row.escalationDetail, row.unitAction, row.unitActionNote].join(" ").toLowerCase().includes(query);
      const matchesSeverity = severityFilter === "All severity" || row.severity === severityFilter;
      const matchesStatus = statusFilter === "All work" || (statusFilter === "Open work" ? true : row.status === statusFilter);
      const matchesDate = !dateFilter || getEscalationDateKey(row.createdAt) === dateFilter;
      return matchesSearch && matchesSeverity && matchesStatus && matchesDate;
    });
  }, [dateFilter, rows, search, severityFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  const firstVisible = filteredRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const counts = React.useMemo(() => getEscalationCounts(rows), [rows]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
            <SummaryChip tone="danger" label="Open escalations" value={counts.open} />
            <SummaryChip tone="critical" label="Critical" value={counts.critical} />
            <SummaryChip tone="warning" label="Awaiting review" value={counts.awaitingReview} />
            <SummaryChip tone="info" label="Forwarded" value={counts.forwarded} />
            <SummaryChip tone="success" label="Resolved" value={counts.resolved} />

          </div>
          <div className="flex justify-start ">
            <Button
              variant="outline"
              className="h-8 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_190px_170px_auto]">
            <div className="relative">
              <Input
                aria-label="Search escalations"
                className="h-10 rounded-xl border-slate-200 bg-white pl-4 pr-4 text-sm font-semibold text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search escalation, unit, nurse..."
                value={search}
              />
            </div>
            <select
              aria-label="Filter severity"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              onChange={(event) => setSeverityFilter(event.target.value as "All severity" | EscalationSeverity)}
              value={severityFilter}
            >
              {['All severity', 'Critical', 'Medium', 'Info'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              onChange={(event) => setStatusFilter(event.target.value as "Open work" | "All work" | EscalationStatus)}
              value={statusFilter}
            >
              {['Open work', 'All work', 'Awaiting Review', 'Forwarded', 'Resolved'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              aria-label="Filter date"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              onChange={(event) => setDateFilter(event.target.value)}
              type="date"
              value={dateFilter}
            />
            <Button
              className="h-10 rounded-xl px-4 text-sm font-black"
              onClick={() => {
                setSearch("");
                setSeverityFilter("All severity");
                setStatusFilter("Open work");
                setDateFilter("");
              }}
              variant="outline"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[1100px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
                  <th className="sticky left-0 z-30 w-[230px] bg-slate-50 px-5 py-4 text-left shadow-[1px_0_0_0_#e2e8f0]">Patient</th>
                  <th className="px-4 py-4 text-left">Raised By</th>
                  <th className="px-4 py-4 ">Date & Time</th>
                  <th className="px-4 py-4 text-left min-w-[180px]">Escalation</th>
                  <th className="px-4 py-4 text-center">Severity</th>
                  <th className="px-4 py-4 text-center">Unit Action</th>
                  <th className="px-4 py-4 text-center min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length ? (
                  visibleRows.map((row) => (
                    <tr className="border-b border-slate-100 last:border-b-0" key={row.recordKey}>
                      <td className="sticky left-0 z-20 border-r border-slate-100 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
                        <div className={cn("relative min-h-[116px] px-4 py-6 before:absolute before:inset-y-0 before:left-0 before:w-1", patientAccentClass(row.severity))}>
                          <p className={cn("text-base font-black", patientNameClass(row.severity))}>{row.patientName}</p>
                          <p className="mt-2 text-sm font-black text-slate-950">
                            {row.bedNo} | {row.unit}
                          </p>
                        </div>
                      </td>
                      <td className="min-w-[180px] px-4 py-4 align-middle">
                        <p className="font-medium text-slate-950 py2">{row.raisedBy}</p>
                        {/* <p className="text-xs font-semibold text-slate-500">{row.raisedByNote}</p> */}
                      </td>
                      <td className="px-4 py-4 text-center align-middle">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-950 py2">{formatEscalationDate(row.createdAt)}</p>
                          <p className="text-xs font-semibold text-slate-500">{formatEscalationTime(row.createdAt)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle">
                        <p className="font-medium text-slate-950 py2">{row.escalation}</p>
                        <p className="text-xs font-semibold text-slate-500">{row.escalationDetail}</p>
                      </td>
                      <td className="px-4 py-4 text-center align-middle">
                        <HeadNurseTonePill tone={severityTone(row.severity)}>{displaySeverityLabel(row.severity)}</HeadNurseTonePill>
                      </td>
                      <td className="px-4 py-4 text-center align-middle">
                        <p className="font-medium text-slate-950 py2">{row.unitAction}</p>
                        <p className="text-xs font-semibold text-slate-500">{row.unitActionNote}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <ActionButton label="View" onClick={() => setActiveAction({ row, action: "Review" })} tone="outline" />
                          <ActionButton label="Forward" onClick={() => applyEscalationAction(row, "Forward")} tone="outline" />
                          <ActionButton label="Resolve" onClick={() => applyEscalationAction(row, "Resolve")} tone="solid" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm font-semibold text-slate-500" colSpan={7}>
                      No escalations match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Showing <span className="text-slate-950">{firstVisible}-{lastVisible}</span> of <span className="text-slate-950">{filteredRows.length}</span> escalations
        </p>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            type="button"
          >
            Prev
          </button>
          <span className="inline-flex h-9 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">
            Page {currentPage} / {pageCount}
          </span>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      {activeAction ? (
        <CenterModal
          open={Boolean(activeAction)}
          onOpenChange={(open) => {
            if (!open) setActiveAction(null);
          }}
          title={activeAction.action === "Review" ? "View escalation details" : `${activeAction.action} escalation`}
          description={`${activeAction.row.patientName} | ${activeAction.row.bedNo} | ${activeAction.row.unit}`}
        >
          <div className="space-y-4">
            {activeAction.action === "Review" ? (
              <>
                {/* <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm"> */}
                  

                  <div className="max-h-[70vh] overflow-y-auto px-5">
                    
                    <div className="flex justify-end">
                      <div className="flex items-center gap-2 py-2">
                        <span className="text-sm font-semibold text-slate-500">Severity</span>
                        <HeadNurseTonePill
                          tone={
                            activeAction.row.severity === "Critical"
                              ? "critical"
                              : activeAction.row.severity === "High"
                                ? "warning"
                                : activeAction.row.severity === "Medium"
                                  ? "info"
                                  : "muted"
                          }
                        >
                          {displaySeverityLabel(activeAction.row.severity)}
                        </HeadNurseTonePill>
                      </div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
                      <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <InfoTile label="Patient" value={activeAction.row.patientName} />
                          <InfoTile label="Bed / Unit" value={`${activeAction.row.bedNo} | ${activeAction.row.unit}`} />
                          {/* <InfoTile label="Severity" value={displaySeverityLabel(activeAction.row.severity)} />  */}
                          <InfoTile label="Unit action" value={`${activeAction.row.unitAction} | ${activeAction.row.unitActionNote}`} />
                          <InfoTile label="Raised by" value={activeAction.row.raisedBy} />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {/* <InfoTile label="Raised by" value={activeAction.row.raisedBy} /> */}
                          <InfoTile label="Raised note" value={activeAction.row.raisedByNote} />
                          <InfoTile label="Escalation" value={activeAction.row.escalation} />
                          <InfoTile label="Escalation detail" value={activeAction.row.escalationDetail} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Escalation decision</p>
                          <div className="mt-4 space-y-3">
                            <InfoTile label="Source" value={activeAction.row.sourceLabel} />
                            <InfoTile inline label="Date & Time" value={`${formatEscalationDate(activeAction.row.createdAt)} | ${formatEscalationTime(activeAction.row.createdAt)}`} />
                          </div>
                        </div>

                        {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-600">{actionMessage(activeAction.action, activeAction.row)}</p>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-white px-5 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" onClick={() => setActiveAction(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                {/* </div> */}
              </>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoTile label="Raised by" value={activeAction.row.raisedBy} />
                  <InfoTile label="Severity" value={displaySeverityLabel(activeAction.row.severity)} />
                  <InfoTile label="Current unit action" value={activeAction.row.unitAction} />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-600">{actionMessage(activeAction.action, activeAction.row)}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setActiveAction(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      applyEscalationAction(activeAction.row, activeAction.action);
                      setActiveAction(null);
                    }}
                  >
                    {confirmLabel(activeAction.action)}
                  </Button>
                </div>
              </>
            )}
          </div>
        </CenterModal>
      ) : null}
    </div>
  );
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone: HeadNurseTone }) {
  return (
    <div className={cn("flex items-center justify-between rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wide shadow-sm", summaryChipClass(tone))}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}


function formatEscalationDate(label: string) {
  const parsed = parseEscalationDate(label);
  return `${parsed.getDate()}/${parsed.getMonth() + 1}/${parsed.getFullYear()}`;
}


function formatEscalationTime(label: string) {
  const parsed = parseEscalationDate(label);
  return parsed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function parseEscalationDate(label: string) {
  const now = new Date();
  const minutes = label.match(/(\d+)\s*min/i)?.[1];
  const hours = label.match(/(\d+)\s*hr/i)?.[1];
  const next = new Date(now);
  if (minutes) next.setMinutes(next.getMinutes() - Number(minutes));
  else if (hours) next.setHours(next.getHours() - Number(hours));
  return next;
}

function getEscalationDateKey(label: string) {
  return toDateKey(parseEscalationDate(label));
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function displaySeverityLabel(severity: EscalationSeverity) {
  return severity === "High" ? "Critical" : severity;
}

function ActionButton({ label, onClick, tone }: { label: string; onClick: () => void; tone: "outline" | "solid" }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg px-4 text-sm font-bold shadow-sm transition",
        tone === "outline" ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-sky-600 text-white hover:bg-sky-700",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function patientAccentClass(severity: EscalationSeverity) {
  if (severity === "Critical" || severity === "High") return "before:bg-red-500";
  if (severity === "Medium") return "before:bg-amber-500";
  return "before:bg-sky-500";
}

function patientNameClass(severity: EscalationSeverity) {
  if (severity === "Critical" || severity === "High") return "text-red-700";
  if (severity === "Medium") return "text-amber-700";
  return "text-sky-700";
}

function severityTone(severity: EscalationSeverity): HeadNurseTone {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "danger";
  if (severity === "Medium") return "warning";
  return "info";
}

function unitActionToneClass(status: EscalationStatus) {
  if (status === "Resolved") return "bg-green-700 text-white hover:bg-green-800";
  if (status === "Forwarded") return "bg-sky-600 text-white hover:bg-sky-700";
  if (status === "Awaiting Review") return "bg-orange-500 text-white hover:bg-orange-600";
  return "bg-red-600 text-white hover:bg-red-700";
}

function unitActionNoteForStatus(status: EscalationStatus) {
  if (status === "Resolved") return "Closed";
  if (status === "Forwarded") return "Forward To: Duty Doctor";
  if (status === "Awaiting Review") return "Under review by head nurse";
  return "Forward to duty doctor";
}

function summaryChipClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "border-red-200 bg-red-50 text-red-700";
  if (tone === "warning") return "border-orange-200 bg-orange-50 text-orange-700";
  if (tone === "info") return "border-sky-200 bg-sky-50 text-sky-700";
  if (tone === "success") return "border-green-200 bg-green-50 text-green-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function actionMessage(action: EscalationAction, row: EscalationRow) {
  if (action === "Review") return `Review this escalation for ${row.unit}. The status will move to Awaiting Review and the unit action will update.`;
  if (action === "Forward") return `Forward this escalation for ${row.unit}. The unit action will update to Forwarded.`;
  return `Resolve this escalation and close the case. The history will keep the last action for head nurse review.`;
}

function confirmLabel(action: EscalationAction) {
  if (action === "Review") return "Mark as reviewed";
  if (action === "Forward") return "Forward escalation";
  return "Resolve case";
}

function buildEscalationRows(store: EscalationStore): EscalationRow[] {
  return headNursePatients.flatMap((patient) => {
    const unitNurse = patient.assignedUnitNurse || "Unit Nurse";
    const forwardTarget = patient.dutyDoctor || "Duty Doctor";

    const alertRows = icuAlerts
      .filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved")
      .map((alert) => {
        const recordKey = `alert:${alert.id}`;
        const baseRow: EscalationRow = {
          recordKey,
          sourceKind: "alert",
          sourceId: alert.id,
          patientId: patient.id,
          patientName: patient.patientName,
          bedNo: patient.bedNo,
          unit: patient.unit,
          raisedBy: unitNurse,
          raisedByNote: `To ${forwardTarget}`,
          escalation: alert.type,
          escalationDetail: `${alert.message} | ${alert.source}`,
          severity: alert.severity,
          status: alert.status === "Acknowledged" ? "Awaiting Review" : "Open",
          unitAction: alert.status === "Acknowledged" ? "Awaiting Review" : "Pending",
          unitActionNote: unitActionNoteForStatus(alert.status === "Acknowledged" ? "Awaiting Review" : "Open"),
          sourceLabel: `Alert | ${alert.owner}`,
          createdAt: alert.createdAt,
        };
        return applyStoredState(baseRow, store[recordKey]);
      });

    const taskRows = icuTasks
      .filter((task) => task.patientId === patient.id && ["Pending", "Overdue", "Escalated", "In progress"].includes(task.status))
      .map((task) => {
        const recordKey = `task:${task.id}`;
        const taskSeverity = task.priority === "Critical" ? "Critical" : task.priority === "High" ? "High" : task.priority === "Medium" ? "Medium" : "Info";
        const baseRow: EscalationRow = {
          recordKey,
          sourceKind: "task",
          sourceId: task.id,
          patientId: patient.id,
          patientName: patient.patientName,
          bedNo: patient.bedNo,
          unit: patient.unit,
          raisedBy: unitNurse,
          raisedByNote: `To ${forwardTarget}`,
          escalation: task.title,
          escalationDetail: `${task.taskType} | ${task.remarks}`,
          severity: taskSeverity,
          status: task.status === "Escalated" || task.status === "Overdue" ? "Open" : "Awaiting Review",
          unitAction: task.status === "Escalated" || task.status === "Overdue" ? "Pending" : "Awaiting Review",
          unitActionNote: unitActionNoteForStatus(task.status === "Escalated" || task.status === "Overdue" ? "Open" : "Awaiting Review"),
          sourceLabel: `Task | ${task.createdBy}`,
          createdAt: task.dueTime,
        };
        return applyStoredState(baseRow, store[recordKey]);
      });

    return [...alertRows, ...taskRows];
  }).sort((left, right) => severityRank(left.severity) - severityRank(right.severity) || statusRank(left.status) - statusRank(right.status) || left.patientName.localeCompare(right.patientName));
}

function applyStoredState(row: EscalationRow, stored?: EscalationStore[string]): EscalationRow {
  if (!stored) return row;
  return {
    ...row,
    status: stored.status,
    unitAction: stored.unitAction,
    unitActionNote: stored.unitActionNote,
  };
}

function severityRank(severity: EscalationSeverity) {
  if (severity === "Critical") return 0;
  if (severity === "High") return 1;
  if (severity === "Medium") return 2;
  return 3;
}

function statusRank(status: EscalationStatus) {
  if (status === "Open") return 0;
  if (status === "Awaiting Review") return 1;
  if (status === "Forwarded") return 2;
  return 3;
}

function getEscalationCounts(rows: EscalationRow[]) {
  return {
    open: rows.filter((row) => row.status !== "Resolved").length,
    critical: rows.filter((row) => row.severity === "Critical").length,
    awaitingReview: rows.filter((row) => row.status === "Awaiting Review").length,
    forwarded: rows.filter((row) => row.status === "Forwarded").length,
    resolved: rows.filter((row) => row.status === "Resolved").length,
  };
}

function readEscalationStore(): EscalationStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ESCALATION_STORE_KEY);
    return raw ? (JSON.parse(raw) as EscalationStore) : {};
  } catch {
    return {};
  }
}

function writeEscalationStore(store: EscalationStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ESCALATION_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("head-nurse-escalation-store-change"));
}

function applyEscalationAction(row: EscalationRow, action: EscalationAction) {
  const store = readEscalationStore();
  const nextStatus: EscalationStatus = action === "Review" ? "Awaiting Review" : action === "Forward" ? "Forwarded" : "Resolved";
  const nextUnitAction = action === "Review" ? "Awaiting Review" : action === "Forward" ? "Escalated" : "Resolved";
  store[row.recordKey] = {
    status: nextStatus,
    unitAction: nextUnitAction,
    unitActionNote: unitActionNoteForStatus(nextStatus),
    updatedAt: new Date().toISOString(),
  };
  writeEscalationStore(store);
}
