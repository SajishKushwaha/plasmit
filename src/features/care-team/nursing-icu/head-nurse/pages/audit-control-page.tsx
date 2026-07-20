"use client";

import { AlertTriangle, CheckCircle2, ClipboardCheck, FileText, ShieldAlert } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatusPill } from "@/components/ui/status-pill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { StatusTone } from "@/types";
import { cn } from "@/lib/utils";

import { criticalDelayRecords, qualityRecords, type AuditSeverity, type AuditStatus, type CriticalDelayRecord, type QualityRecord } from "../audit-control-data";

export type AuditControlMode = "overview" | "critical-delays" | "quality" | "reports";
type AuditStore = Record<string, { status: AuditStatus; remark: string; updatedAt: string }>;
type ActiveRecord = { kind: "delay"; record: CriticalDelayRecord } | { kind: "quality"; record: QualityRecord };
const STORE_KEY = "head-nurse-audit-control-state";

export function AuditControlPage({ mode }: { mode: AuditControlMode }) {
  const [store, setStore] = React.useState<AuditStore>({});
  React.useEffect(() => {
    const refresh = () => setStore(readStore());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("head-nurse-audit-change", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("head-nurse-audit-change", refresh); };
  }, []);
  const delays = criticalDelayRecords.map((record) => ({ ...record, ...store[record.id] }));
  const quality = qualityRecords.map((record) => ({ ...record, ...store[record.id] }));
  if (mode === "overview") return <AuditOverview delays={delays} quality={quality} />;
  if (mode === "critical-delays") return <CriticalDelays records={delays} />;
  if (mode === "quality") return <QualityWorklist records={quality} />;
  return <AuditReports delays={delays} quality={quality} />;
}

function AuditOverview({ delays, quality }: { delays: CriticalDelayRecord[]; quality: QualityRecord[] }) {
  const all = [...delays, ...quality];
  const stats = [
    { label: "Critical", value: all.filter((row) => row.severity === "Critical" && row.status !== "Closed").length, icon: AlertTriangle, tone: "danger" as StatusTone },
    { label: "Pending Review", value: all.filter((row) => row.status === "Pending Review").length, icon: ClipboardCheck, tone: "warning" as StatusTone },
    { label: "Action Pending", value: all.filter((row) => row.status === "Action Pending").length, icon: ShieldAlert, tone: "info" as StatusTone },
    { label: "Escalated", value: all.filter((row) => row.status === "Escalated").length, icon: AlertTriangle, tone: "critical" as StatusTone },
    { label: "Closed", value: all.filter((row) => row.status === "Closed").length, icon: CheckCircle2, tone: "success" as StatusTone },
  ];
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ icon: Icon, label, tone, value }) => <Card className="p-4" key={label}><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div><span className="rounded-xl bg-slate-50 p-2"><Icon className="h-5 w-5 text-slate-600" /></span></div><div className="mt-2"><StatusPill tone={tone}>Current</StatusPill></div></Card>)}
      </div>
      <Card><CardHeader><CardTitle>Audit control summary</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-3"><Summary label="Critical delays" value={delays.filter((row) => row.status !== "Closed").length} /><Summary label="Quality gaps" value={quality.filter((row) => row.status !== "Closed").length} /><Summary label="Closure rate" value={`${Math.round((all.filter((row) => row.status === "Closed").length / all.length) * 100)}%`} /></CardContent></Card>
    </div>
  );
}

function CriticalDelays({ records }: { records: CriticalDelayRecord[] }) {
  const [active, setActive] = React.useState<ActiveRecord | null>(null);
  const filtered = useFilteredRecords(records);
  const pagination = useTablePagination(filtered.rows);
  return <WorklistShell filters={filtered.filters} title="">
    <Table className="w-full min-w-[1660px] border-collapse text-sm">
      <TableHeader>
        <TableRow className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-950">
          <TableHead className="sticky left-0 z-30 w-[200px] bg-slate-50 px-5 py-3 text-left shadow-[1px_0_0_0_#e2e8f0]">Patient / Bed</TableHead>
          <TableHead className="px-4 py-3 w-[200px] text-center">Activity</TableHead><TableHead className="px-4 py-3 w-[200px] text-center">Assigned Nurse</TableHead><TableHead className="px-4 py-3 w-[120px] text-center">Due</TableHead>
          <TableHead className="px-4 py-3 w-[120px] text-center">Delay</TableHead><TableHead className="px-4 py-3 w-[150px] text-center">Severity</TableHead>
          <TableHead className="px-4 py-3 w-[150px] text-center">Status</TableHead><TableHead className="px-4 py-3 w-[150px] ">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>{pagination.pageRows.map((row) => 
        <TableRow className="border-t border-slate-100" key={row.id}>
          <TableCell className="sticky left-0 z-20 h-px border-r border-slate-200 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
            <PatientCell patient={row.patient} bed={row.bed} />
            </TableCell><TableCell className="px-4 text-center align-middle">{row.activity}</TableCell>
            <TableCell className="px-4 text-center align-middle">{row.nurse}</TableCell>
            <TableCell className="px-4 text-center align-middle">{row.dueTime}</TableCell>
            <TableCell className="px-4 text-center align-middle font-bold">{row.delayMinutes} min</TableCell>
            <TableCell className="px-4 text-center align-middle"><AuditPill severity={row.severity} /></TableCell>
            <TableCell className="px-4 text-center align-middle"><StatusPill tone={statusTone(row.status)}>{row.status}</StatusPill></TableCell>
            <TableCell><Button size="sm" variant="outline" onClick={() => setActive({ kind: "delay", record: row })}>Review</Button>
            </TableCell>
            </TableRow>)}</TableBody>
            </Table>
            <TablePaginationBar {...pagination} />
            <AuditActionModal active={active} onClose={() => setActive(null)} /></WorklistShell>;
}

function QualityWorklist({ records }: { records: QualityRecord[] }) {
  const [active, setActive] = React.useState<ActiveRecord | null>(null);
  const filtered = useFilteredRecords(records);
  const pagination = useTablePagination(filtered.rows);
  return <WorklistShell filters={filtered.filters} title="Quality Worklist"><Table><TableHeader><TableRow className="bg-slate-50 text-xs uppercase text-slate-500"><TableHead className="px-4 py-3">Patient / Bed</TableHead><TableHead>Audit Area</TableHead><TableHead>Quality Gap</TableHead><TableHead>Nurse</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader><TableBody>{pagination.pageRows.map((row) => <TableRow className="border-t border-slate-100" key={row.id}><TableCell className="px-4 py-2"><PatientCell patient={row.patient} bed={row.bed} /></TableCell><TableCell>{row.auditArea}</TableCell><TableCell>{row.qualityGap}</TableCell><TableCell>{row.nurse}</TableCell><TableCell><AuditPill severity={row.severity} /></TableCell><TableCell><StatusPill tone={statusTone(row.status)}>{row.status}</StatusPill></TableCell><TableCell><Button size="sm" variant="outline" onClick={() => setActive({ kind: "quality", record: row })}>Review</Button></TableCell></TableRow>)}</TableBody></Table><TablePaginationBar {...pagination} /><AuditActionModal active={active} onClose={() => setActive(null)} /></WorklistShell>;
}

function AuditReports({ delays, quality }: { delays: CriticalDelayRecord[]; quality: QualityRecord[] }) {
  const [report, setReport] = React.useState("Critical Delay Report");
  const rows = report === "Critical Delay Report" ? delays : quality;
  return <div className="space-y-3"><Card><CardContent className="flex flex-wrap items-center gap-2 p-4"><Select ariaLabel="Select report" className="w-56" options={["Critical Delay Report", "Quality Report"]} value={report} onValueChange={setReport} /><Button><FileText className="h-4 w-4" />Generate</Button><Button variant="outline" onClick={() => window.print()}>Export PDF</Button></CardContent></Card><Card><CardHeader><CardTitle>{report}</CardTitle></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow className="bg-slate-50 text-xs uppercase text-slate-500"><TableHead className="px-4 py-3">Patient</TableHead><TableHead>Location</TableHead><TableHead>Area / Activity</TableHead><TableHead>Nurse</TableHead><TableHead>Severity</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody>{rows.map((row) => <TableRow className="border-t" key={row.id}><TableCell className="px-4 py-2 font-bold">{row.patient}</TableCell><TableCell>{row.bed}</TableCell><TableCell>{"activity" in row ? row.activity : row.auditArea}</TableCell><TableCell>{row.nurse}</TableCell><TableCell><AuditPill severity={row.severity} /></TableCell><TableCell><StatusPill tone={statusTone(row.status)}>{row.status}</StatusPill></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div>;
}

function useFilteredRecords<T extends { patient: string; bed: string; nurse: string; severity: AuditSeverity; status: AuditStatus }>(records: T[]) {
  const [search, setSearch] = React.useState(""); const [severity, setSeverity] = React.useState("All severity"); const [status, setStatus] = React.useState("Open work");
  const rows = records.filter((row) => (!search || `${row.patient} ${row.bed} ${row.nurse}`.toLowerCase().includes(search.toLowerCase())) && (severity === "All severity" || row.severity === severity) && (status === "All work" || (status === "Open work" ? row.status !== "Closed" : row.status === status)));
  return { rows, filters: <><SearchInput className="min-w-56 flex-1" placeholder="Search patient, bed, nurse..." value={search} onChange={(event) => setSearch(event.target.value)} /><Select ariaLabel="Severity" className="w-44" options={["All severity", "Critical", "High", "Medium", "Low"]} value={severity} onValueChange={setSeverity} /><Select ariaLabel="Status" className="w-48" options={["Open work", "All work", "Pending Review", "Action Pending", "Escalated", "Closed"]} value={status} onValueChange={setStatus} /></> };
}

function WorklistShell({ children, filters, title }: { children: React.ReactNode; filters: React.ReactNode; title: string }) { return <div className="space-y-3">
  <Card className="overflow-hidden">
    <CardHeader>
      <div className="flex flex-wrap gap-2 py-2">{filters}</div>
    </CardHeader>
    <CardContent className="overflow-x-auto p-0">{children}</CardContent>
  </Card></div>; }
  
function PatientCell({ patient, bed }: { patient: string; bed: string }) { return <div className="relative h-full min-h-[24px] px-5 py-2 before:absolute before:inset-y-0 before:left-0 before:w-1 font-bold">{patient}<p className="text-slate-500 py-2">{bed}</p></div>; }

function Summary({ label, value }: { label: string; value: React.ReactNode }) { return <div className="flex items-center justify-between rounded-xl border border-slate-200 p-3"><p className="text-xs font-bold uppercase text-slate-500">{label}</p><p className="text-lg font-bold">{value}</p></div>; }
function AuditPill({ severity }: { severity: AuditSeverity }) { return <StatusPill tone={severity === "Critical" ? "critical" : severity === "High" ? "danger" : severity === "Medium" ? "warning" : "muted"}>{severity}</StatusPill>; }
function statusTone(status: AuditStatus): StatusTone { if (status === "Closed") return "success"; if (status === "Escalated") return "critical"; if (status === "Action Pending") return "warning"; return "info"; }

const TABLE_PAGE_SIZE = 10;

function useTablePagination<T>(rows: T[], pageSize = TABLE_PAGE_SIZE) {
  const [page, setPage] = React.useState(1);
  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = totalRows ? (safePage - 1) * pageSize : 0;
  const endIndex = totalRows ? Math.min(startIndex + pageSize, totalRows) : 0;
  const pageRows = React.useMemo(() => rows.slice(startIndex, endIndex), [endIndex, rows, startIndex]);

  React.useEffect(() => {
    setPage(1);
  }, [pageSize, totalRows]);

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return {
    endIndex,
    page: safePage,
    pageRows,
    setPage,
    startIndex,
    totalPages,
    totalRows,
  };
}

function TablePaginationBar({ endIndex, page, setPage, startIndex, totalPages, totalRows }: { endIndex: number; page: number; setPage: React.Dispatch<React.SetStateAction<number>>; startIndex: number; totalPages: number; totalRows: number }) {
  if (!totalRows) return null;

  return (
    <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-3 py-3 text-xs font-semibold text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {startIndex + 1}-{endIndex} of {totalRows}
      </span>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
          Previous
        </Button>
        <span className="min-w-20 text-center text-slate-700">
          Page {page} / {totalPages}
        </span>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
          Next
        </Button>
      </div>
    </div>
  );
}

function AuditActionModal({ active, onClose }: { active: ActiveRecord | null; onClose: () => void }) {
  const [remark, setRemark] = React.useState(""); if (!active) return null; const record = active.record;
  const update = (status: AuditStatus) => { const store = readStore(); store[record.id] = { status, remark, updatedAt: new Date().toISOString() }; localStorage.setItem(STORE_KEY, JSON.stringify(store)); window.dispatchEvent(new Event("head-nurse-audit-change")); onClose(); };
  return <CenterModal open title="Audit review" description={`${record.patient} | ${record.bed}`} onOpenChange={(open) => !open && onClose()}><div className="space-y-3"><div className="grid gap-3 sm:grid-cols-2"><Summary label="Issue" value={active.kind === "delay" ? active.record.activity : active.record.qualityGap} /><Summary label="Assigned nurse" value={record.nurse} /></div><textarea className={cn("min-h-24 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:ring-2 focus:ring-sky-200")} placeholder="Add remark..." value={remark} onChange={(event) => setRemark(event.target.value)} /><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => update("Action Pending")}>Return to Unit Nurse</Button><Button variant="danger" onClick={() => update("Escalated")}>Escalate</Button><Button onClick={() => update("Closed")}>Verify & Close</Button></div></div></CenterModal>;
}

function readStore(): AuditStore { if (typeof window === "undefined") return {}; try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}"); } catch { return {}; } }
