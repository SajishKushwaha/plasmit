"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { CenterModal } from "@/components/ui/center-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { doctorInstructions, icuAlerts, icuPatients, icuTasks } from "../../nursing-icu-data";
import { headNursePatients, selectedUnitNurseForPatient } from "../head-nurse-mock-data";
import { HeadNurseTonePill, InfoTile } from "../head-nurse-patient-context";
import type { HeadNursePageProps, HeadNurseTone } from "../head-nurse-types";

type HandoverStatus = "Verified" | "Pending" | "Carry Forward" | "Escalated";

type HandoverRow = {
  recordKey: string;
  patientId: string;
  patientName: string;
  bedNo: string;
  unit: string;
  handoverFrom: string;
  handoverTo: string;
  condition: string;
  conditionDetail: string;
  status: HandoverStatus;
  handoverAt: string;
  openAlerts: number;
  pendingTasks: number;
  pendingOrders: number;
  diagnosis: string;
};

type HandoverFilter = "Open handovers" | "All handovers" | HandoverStatus;
type HandoverConditionFilter = "All conditions" | "Critical" | "Ventilated" | "Stable ICU care" | "Ready for transfer" | "Discharge ordered" | "Death workflow";

type ActiveHandoverState = {
  row: HandoverRow;
};

const PAGE_SIZE = 10;

export function ShiftHandoverPage({ initialPatientId }: HeadNursePageProps) {
  void initialPatientId;
  return <ShiftHandoverView />;
}

function ShiftHandoverView() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<HandoverFilter>("Open handovers");
  const [conditionFilter, setConditionFilter] = React.useState<HandoverConditionFilter>("All conditions");
  const [dateFilter, setDateFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [version, setVersion] = React.useState(0);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const [activeHandover, setActiveHandover] = React.useState<ActiveHandoverState | null>(null);

  React.useEffect(() => {
    setIsHydrated(true);
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener("storage", refresh);
    window.addEventListener("head-nurse-workflow-status-change", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("head-nurse-workflow-status-change", refresh);
    };
  }, []);

  const rows = React.useMemo(() => buildShiftHandoverRows(isHydrated), [isHydrated, version]);
  const filteredRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !query || [row.patientName, row.bedNo, row.unit, row.handoverFrom, row.handoverTo, row.condition, row.conditionDetail, row.diagnosis].join(" ").toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All handovers" || (statusFilter === "Open handovers" ? row.status !== "Verified" : row.status === statusFilter);
      const matchesCondition = conditionFilter === "All conditions" || row.condition === conditionFilter;
      const matchesDate = !dateFilter || getHandoverDateKey(row.handoverAt) === dateFilter;
      return matchesSearch && matchesStatus && matchesCondition && matchesDate;
    });
  }, [conditionFilter, dateFilter, rows, search, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredRows]);

  const firstVisible = filteredRows.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const lastVisible = Math.min(currentPage * PAGE_SIZE, filteredRows.length);
  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_190px_220px_170px_40px_auto]">
            <div className="relative">
              <SearchInput
                aria-label="Search handovers"
                className="h-10 rounded-xl border-slate-200 bg-white pl-4 pr-4 text-sm font-semibold text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search patient, nurse, unit..."
                value={search}
              />
            </div>
            <Select ariaLabel="Filter handover status" onValueChange={(value) => setStatusFilter(value as HandoverFilter)} options={["Open handovers", "All handovers", "Pending", "Carry Forward", "Escalated", "Verified"]} value={statusFilter} />
            <Select ariaLabel="Filter condition" onValueChange={(value) => setConditionFilter(value as HandoverConditionFilter)} options={["All conditions", "Critical", "Ventilated", "Stable ICU care", "Ready for transfer", "Discharge ordered", "Death workflow"]} value={conditionFilter} />
            <DatePicker ariaLabel="Filter date" onChange={setDateFilter} value={dateFilter} />
            <Button
              aria-label="Reset filters"
              className="h-10 w-10 rounded-xl p-0"
              onClick={() => {
                setSearch("");
                setStatusFilter("Open handovers");
                setConditionFilter("All conditions");
                setDateFilter("");
                setPage(1);
              }}
              title="Reset filters"
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              className="h-10 rounded-xl px-4 text-sm font-semibold"
              onClick={() => window.history.back()}
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <Table className="w-full min-w-[1290px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[240px]" />
            <col className="w-[190px]" />
            <col className="w-[100px]" />
            <col className="w-[250px]" />
            <col className="w-[150px]" />
            <col className="w-[100px]" />
          </colgroup>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
              <TableHead className="sticky left-0 z-30 w-[230px] bg-slate-50 px-5 py-3 text-left shadow-[1px_0_0_0_#e2e8f0]">Patient</TableHead>
              <TableHead className="px-4 py-3 text-left">Handover From</TableHead>
              <TableHead className="px-4 py-3 text-left">Handover To</TableHead>
              <TableHead className="px-4 py-3 text-center">Condition</TableHead>
              {/* <TableHead className="px-4 py-3 text-center">Status</TableHead> */}
              <TableHead className="px-4 py-3 text-center">Date & Time</TableHead>
              <TableHead className="px-4 py-3 text-right min-w-[140px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.length ? (
              visibleRows.map((row) => (
                <TableRow className="border-b border-slate-100 last:border-b-0" key={row.recordKey}>
                  <TableCell className="sticky left-0 z-20 h-px border-r border-slate-100 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
                    <div className={cn("relative h-full min-h-[64px] px-4 py-2 before:absolute before:inset-y-0 before:left-0 before:w-1", patientAccentClass(row))}>
                      <p className={cn("text-base font-black", patientNameClass(row))}>{row.patientName}</p>
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {row.bedNo} | {row.unit}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <p className="font-medium text-slate-950">{row.handoverFrom}</p>
                    {/* <p className="text-xs font-semibold text-slate-500">Outgoing nurse</p> */}
                  </TableCell>
                  <TableCell className="px-4 py-2 align-middle">
                    <p className="font-medium text-slate-950">{row.handoverTo}</p>
                    {/* <p className="text-xs font-semibold text-slate-500">Receiving nurse</p> */}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center align-middle">
                    <div className="space-y-1">
                      <HeadNurseTonePill tone={conditionTone(row)}>{row.condition}</HeadNurseTonePill>
                      <p className="text-xs font-semibold text-slate-500 py-2">{row.conditionDetail}</p>
                    </div>
                  </TableCell>
                  {/* <TableCell className="px-4 py-2 text-center align-middle">
                    <HeadNurseTonePill tone={handoverStatusTone(row.status)}>{handoverStatusLabel(row.status)}</HeadNurseTonePill>
                  </TableCell> */}
                  <TableCell className="px-4 py-2 text-center align-middle">
                    <div className="space-y-0.5">
                      <p className="font-medium text-slate-950">{formatHandoverDate(row.handoverAt)}</p>
                      <p className="text-xs font-semibold text-slate-500">{formatHandoverTime(row.handoverAt)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right align-middle">
                    <div className="flex flex-wrap justify-end gap-2">
                      <ActionButton label="View" onClick={() => setActiveHandover({ row })} tone="outline" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="px-4 py-10 text-center text-sm font-semibold text-slate-500" colSpan={6}>
                  No handovers match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Showing <span className="text-slate-950">{firstVisible}-{lastVisible}</span> of <span className="text-slate-950">{filteredRows.length}</span> handovers
        </p>
        <div className="flex items-center gap-2">
          <Button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            type="button"
          >
            Prev
          </Button>
          <span className="inline-flex h-9 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">
            Page {currentPage} / {pageCount}
          </span>
          <Button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            type="button"
          >
            Next
          </Button>
        </div>
      </div>

      {activeHandover ? (
        <CenterModal
          open={Boolean(activeHandover)}
          onOpenChange={(open) => {
            if (!open) setActiveHandover(null);
          }}
          title="View handover details"
          description={`${activeHandover.row.patientName} | ${activeHandover.row.bedNo} | ${activeHandover.row.unit}`}
        >
          <div className="space-y-3">
            {/* <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-sm"> */}
              {/* <div className="border-b border-slate-200 bg-white px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-black text-slate-950">Shift handover summary</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {activeHandover.row.patientName} | {activeHandover.row.bedNo} | {activeHandover.row.unit}
                    </p>
                    <p className="text-xs font-semibold text-slate-500">
                      {activeHandover.row.handoverFrom} to {activeHandover.row.handoverTo}
                    </p>
                  </div>
                </div>
              </div> */}
                  <div className="flex justify-end">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-500">Status</span>
                      <HeadNurseTonePill tone={handoverStatusTone(activeHandover.row.status)}>{handoverStatusLabel(activeHandover.row.status)}</HeadNurseTonePill>
                    </div>
                  </div>

              <div className="max-h-[70vh] overflow-y-auto py-2">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoTile label="Patient" value={activeHandover.row.patientName} />
                      <InfoTile label="Bed / Unit" value={`${activeHandover.row.bedNo} | ${activeHandover.row.unit}`} />
                      <InfoTile label="Outgoing nurse" value={activeHandover.row.handoverFrom} />
                      <InfoTile label="Receiving nurse" value={activeHandover.row.handoverTo} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* <InfoTile label="Patient condition" value={activeHandover.row.condition} /> */}
                      <InfoTile label="Condition detail" value={activeHandover.row.conditionDetail} />
                      <InfoTile label="Diagnosis" value={activeHandover.row.diagnosis} />
                      {/* <InfoTile label="Open items" value={`${activeHandover.row.pendingTasks + activeHandover.row.pendingOrders + activeHandover.row.openAlerts} item(s)`} /> */}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">Handover tracking</p>
                      <div className="mt-4 space-y-3">
                        <InfoTile inline label="Date & Time" value={`${formatHandoverDate(activeHandover.row.handoverAt)} | ${formatHandoverTime(activeHandover.row.handoverAt)}`} />
                        <InfoTile inline label="Pending tasks" value={activeHandover.row.pendingTasks} />
                        <InfoTile inline label="Pending orders" value={activeHandover.row.pendingOrders} />
                        <InfoTile inline label="Open alerts" value={activeHandover.row.openAlerts} />
                      </div>
                    </div>

                    {/* <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-600">{handoverMessage(activeHandover.row)}</p>
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-5 py-4">
                <div className="flex flex-wrap justify-end gap-2">
                  <Button variant="outline" onClick={() => setActiveHandover(null)}>
                    Close
                  </Button>
                </div>
              </div>
            {/* </div> */}
          </div>
        </CenterModal>
      ) : null}
    </div>
  );
}

function buildShiftHandoverRows(includeStoredState = false): HandoverRow[] {
  return headNursePatients.map((patient, index) => {
    const openAlerts = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved");
    const pendingTasks = icuTasks.filter((task) => task.patientId === patient.id && task.status !== "Completed");
    const pendingOrders = doctorInstructions.filter((order) => order.patientId === patient.id && order.status !== "Completed");
    const openItems = openAlerts.length + pendingTasks.length + pendingOrders.length;
    const handoverTo = selectedUnitNurseForPatient(patient, { includeStoredState }) || patient.assignedUnitNurse || "Unit Nurse pending";
    const sourcePatient = icuPatients.find((item) => item.id === patient.id);   const handoverFrom = sourcePatient?.assignedWardNurse || "Ward Nurse pending";
    const isCritical = patient.currentStatus === "Critical" || patient.currentStatus === "Death workflow" || patient.criticalityScore >= 8;
    const isComplex = patient.currentStatus === "Ventilated" || patient.ventilatorStatus.toLowerCase().includes("vent");

    let status: HandoverStatus = openItems ? "Pending" : "Verified";
    if (isCritical && openItems) status = "Escalated";
    else if ((patient.currentStatus === "Ready for transfer" || patient.currentStatus === "Discharge ordered") && openItems) status = "Carry Forward";
    else if (isComplex && openItems >= 2) status = "Carry Forward";

    return {
      recordKey: `${patient.id}-${index}`,
      patientId: patient.id,
      patientName: patient.patientName,
      bedNo: patient.bedNo,
      unit: patient.unit,
      handoverFrom,
      handoverTo,
      condition: patient.currentStatus,
      conditionDetail: `${patient.diagnosis} | ${patient.ventilatorStatus} | ${openItems} open item(s)`,
      status,
      handoverAt: patient.admissionTime,
      openAlerts: openAlerts.length,
      pendingTasks: pendingTasks.length,
      pendingOrders: pendingOrders.length,
      diagnosis: patient.diagnosis,
    };
  });
}

function getHandoverDateKey(label: string) {
  const parsed = parseHandoverDateTime(label);
  return parsed ? toDateKey(parsed) : "";
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function handoverStatusLabel(status: HandoverStatus) {
  if (status === "Carry Forward") return "Carry forward";
  return status;
}

function handoverStatusTone(status: HandoverStatus): HeadNurseTone {
  if (status === "Escalated") return "critical";
  if (status === "Pending") return "warning";
  if (status === "Carry Forward") return "info";
  return "success";
}

function conditionTone(row: HandoverRow): HeadNurseTone {
  if (row.condition === "Critical" || row.condition === "Death workflow") return "critical";
  if (row.condition === "Ventilated") return "warning";
  if (row.condition === "Ready for transfer") return "info";
  return row.status === "Escalated" ? "danger" : "success";
}



function patientAccentClass(row: HandoverRow) {  if (row.status === "Escalated") return "before:bg-red-500";  if (row.status === "Carry Forward") return "before:bg-sky-500";  if (row.status === "Pending") return "before:bg-orange-500";  return "before:bg-green-600";}

function patientNameClass(row: HandoverRow) {  if (row.status === "Escalated") return "text-red-700";  if (row.status === "Carry Forward") return "text-sky-700";  if (row.status === "Pending") return "text-orange-700";  return "text-green-700";}

function formatHandoverDate(label: string) {
  const parsed = parseHandoverDateTime(label);
  if (!parsed) {
    const { date } = splitDateTimeLabel(label);
    return date;
  }

  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatHandoverTime(label: string) {
  const parsed = parseHandoverDateTime(label);
  if (!parsed) {
    const { time } = splitDateTimeLabel(label);
    return time;
  }

  return parsed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
}

function parseHandoverDateTime(label: string) {
  const trimmed = label.trim();
  const { date, time } = splitDateTimeLabel(trimmed);
  const candidates = [trimmed, `${date} ${time}`.trim(), date];

  for (const candidate of candidates) {
    const parsed = parseFlexibleDate(candidate);
    if (parsed) return parsed;
  }

  return null;
}

function parseFlexibleDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const namedMonthMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})(?:,?\s+(.*))?$/);
  if (namedMonthMatch) {
    const [, day, monthName, year, timePart] = namedMonthMatch;
    const month = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(monthName.slice(0, 3).toLowerCase());
    if (month < 0) return null;

    const parsed = new Date(Number(year), month, Number(day));
    if (timePart) {
      const timeMatch = timePart.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = Number(timeMatch[1]);
        const minutes = Number(timeMatch[2] ?? 0);
        const meridiem = timeMatch[3]?.toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        parsed.setHours(hours, minutes, 0, 0);
      }
    }

    return parsed;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(.*))?$/);
  if (slashMatch) {
    const [, day, month, yearRaw, timePart] = slashMatch;
    const year = Number(yearRaw.length === 2 ? `20${yearRaw}` : yearRaw);
    const parsed = new Date(year, Number(month) - 1, Number(day));

    if (timePart) {
      const timeMatch = timePart.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = Number(timeMatch[1]);
        const minutes = Number(timeMatch[2] ?? 0);
        const meridiem = timeMatch[3]?.toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        parsed.setHours(hours, minutes, 0, 0);
      }
    }

    return parsed;
  }

  const dashMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(.*))?$/);
  if (dashMatch) {
    const [, yearRaw, month, day] = dashMatch;
    const parsed = new Date(Number(yearRaw), Number(month) - 1, Number(day));
    return parsed;
  }

  return null;
}

function splitDateTimeLabel(label: string) {
  const trimmed = label.trim();
  const commaIndex = trimmed.indexOf(",");
  if (commaIndex >= 0) {
    return {
      date: trimmed.slice(0, commaIndex).trim() || trimmed,
      time: trimmed.slice(commaIndex + 1).trim() || "-",
    };
  }

  const match = trimmed.match(/^(.*?)\s+(.+)$/);
  if (!match) return { date: trimmed, time: "-" };
  return { date: match[1] || trimmed, time: match[2] || "-" };
}

function handoverMessage(row: HandoverRow) {
  if (row.status === "Escalated") return `Critical handover for ${row.patientName}. Please review the open items, ventilator support, and pending alerts before acceptance.`;
  if (row.status === "Carry Forward") return `Carry forward the open nursing items for ${row.patientName} to the next shift with clear owner confirmation.`;
  if (row.status === "Pending") return `Verify the current condition and pending work for ${row.patientName} before closing the shift handover.`;
  return `Handover verified for ${row.patientName}. Current shift is clear for the receiving nurse.`;
}

function ActionButton({ label, onClick, tone }: { label: string; onClick: () => void; tone: "outline" | "solid" }) {
  return (
    <Button
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-lg px-4 text-sm font-bold shadow-sm transition",
        tone === "outline" ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" : "bg-sky-600 text-white hover:bg-sky-700",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </Button>
  );
}