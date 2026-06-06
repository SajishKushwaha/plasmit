"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  BedDouble,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Droplets,
  FileText,
  HeartPulse,
  ListChecks,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  TestTube2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import {
  AdmissionWizardWorkspace,
  AlertsEscalationWorkspace,
  MedicationTimelineWorkspace,
  NursingTaskBoardWorkspace,
  PatientBoardWorkspace,
  ShiftHandoverWorkspace,
  WorkflowReportsWorkspace,
} from "@/features/nursing-icu/components/nursing-icu-workflow";
import { IntakeOutputWorkspace } from "@/features/nursing-icu/components/intake-output-workspace";
import {
  activityLogs,
  doctorInstructions,
  icuAlerts,
  icuPatients,
  icuTasks,
  icuVitals,
  infusionRows,
  intakeOutputRows,
  medicationRows,
  toneForPriority,
  toneForStatus,
  transfusionRows,
  type IcuPatient,
  type IcuPriority,
} from "./nursing-icu-data";

type NursingIcuPageId =
  | "dashboard"
  | "patient-board"
  | "arrival-bed-allocation"
  | "shift-handover"
  | "tasks"
  | "monitoring-chart"
  | "vitals"
  | "nurse-review"
  | "intake-output"
  | "medication-administration"
  | "iv-fluids"
  | "blood-transfusion"
  | "doctor-rounds"
  | "doctor-instructions"
  | "lab-results"
  | "radiology-reports"
  | "pharmacy-requests"
  | "head-nurse-console"
  | "ward-nurse-activities"
  | "duty-doctor-monitoring"
  | "alerts"
  | "transfer-discharge"
  | "nursing-notes"
  | "audit-logs"
  | "reports";

type PatientAction = "View" | "Monitor" | "Medication" | "Notes" | "Transfer" | "Discharge";

const pageMeta: Record<NursingIcuPageId, { title: string; description: string; icon: typeof HeartPulse }> = {
  dashboard: { title: "ICU Dashboard", description: "ICU census, alerts, bed occupancy, workload, pending activities, and shift summary.", icon: HeartPulse },
  "patient-board": { title: "ICU Patient Board", description: "Bed-wise patient board for monitoring, medication, notes, transfer, and discharge actions.", icon: BedDouble },
  "arrival-bed-allocation": { title: "Patient Arrival & Bed Allocation", description: "Unit nurse workflow for ICU arrival, bed allocation, nurse assignment, doctor assignment, and initial condition capture.", icon: Plus },
  "shift-handover": { title: "Shift Handover", description: "Outgoing and incoming nurse handover with checklist, pending tasks, IV fluids, transfusion, alerts, and acknowledgement.", icon: ClipboardCheck },
  tasks: { title: "Nurse Task List", description: "Task board for medication, vitals, IV checks, transfusion monitoring, sample collection, hygiene, and documentation.", icon: ListChecks },
  "monitoring-chart": { title: "ICU Monitoring Chart", description: "24-hour ICU chart with vitals, GCS, oxygen support, ventilator status, urine output, medications, notes, and audit cues.", icon: Activity },
  vitals: { title: "Vitals Charting", description: "Capture vitals, oxygen support, GCS, pain score, blood sugar, weight, notes, trends, and abnormal highlights.", icon: HeartPulse },
  "nurse-review": { title: "Nurse Review", description: "Review nurse-entered ICU vitals, apply date/time filters, and view, edit, or delete observation records.", icon: ClipboardCheck },
  "intake-output": { title: "Intake / Output Chart", description: "Shift-wise and 24-hour fluid balance across oral, IV, blood products, tube feeds, urine, drain, vomit, and losses.", icon: Droplets },
  "medication-administration": { title: "Medication Administration", description: "eMAR for due, administered, held, skipped, late, and high-risk double verification medication workflows.", icon: Pill },
  "iv-fluids": { title: "IV Fluid & Infusion Management", description: "Infusion pump, fluid rate, volume, remaining balance, pause/resume/stop, and completion alerts.", icon: Syringe },
  "blood-transfusion": { title: "Blood Transfusion", description: "Blood unit issue, crossmatch, start/end, pre/during/post vitals, reaction monitoring, and acknowledgements.", icon: Droplets },
  "doctor-rounds": { title: "Doctor Rounds", description: "Admitting doctor rounds, result review, care plan, discharge, transfer, surgery, and continue-ICU decisions.", icon: Stethoscope },
  "doctor-instructions": { title: "Doctor Instructions", description: "Instructions from admitting, consulting, and duty doctors assigned to nurses with due time and completion tracking.", icon: FileText },
  "lab-results": { title: "Lab Orders & Results", description: "ICU lab order status, sample status, result availability, critical result alerts, doctor review, and nurse follow-up.", icon: TestTube2 },
  "radiology-reports": { title: "Radiology Orders & Reports", description: "ICU radiology order status, modality, report availability, doctor review, and nursing follow-up.", icon: Activity },
  "pharmacy-requests": { title: "Pharmacy Requests", description: "Medicine requests, dispense status, pending medicines, stock shortage, receive, and return workflow.", icon: Pill },
  "head-nurse-console": { title: "Head Nurse Console", description: "Head nurse supervision for all ICU patients, ward nurse activities, workload, reassignment, escalation, and documentation completeness.", icon: UserRound },
  "ward-nurse-activities": { title: "Ward Nurse Shift Activities", description: "Assigned patient checklist, vitals, medication, intake/output, IV, blood, notes, and handover activities.", icon: ClipboardCheck },
  "duty-doctor-monitoring": { title: "Duty Doctor Monitoring", description: "Duty doctor view for critical alerts, latest vitals, nurse escalation response, urgent orders, and abnormal lab review.", icon: Stethoscope },
  alerts: { title: "ICU Alerts", description: "Critical vitals, lab, medication, IV, blood transfusion, ventilator, urine output, review, task, transfer, and documentation alerts.", icon: AlertTriangle },
  "transfer-discharge": { title: "Transfer / Discharge / Death Workflow", description: "Transfer to ward/surgery, ICU discharge, death declaration, clearances, destination, and summary generation.", icon: ShieldAlert },
  "nursing-notes": { title: "Nursing Notes", description: "Structured notes for shift, critical events, medication, transfusion, intake/output, doctor instruction follow-up, and observations.", icon: FileText },
  "audit-logs": { title: "Audit & Activity Logs", description: "Audit trail for vitals, medication, handover, task completion, instruction acknowledgement, transfer, IP, and old/new values.", icon: ShieldAlert },
  reports: { title: "Reports", description: "ICU occupancy, nurse workload, medication compliance, missed/late medication, abnormal vitals, transfusion, I/O, handover, and discharge reports.", icon: BarChart3 },
};

const nursingIcuTabGroups: Array<{
  title: string;
  tabs: Array<{ id: NursingIcuPageId; label: string; route: string }>;
}> = [
  {
    title: "Command",
    tabs: [
      { id: "dashboard", label: "Dashboard", route: "/nursing-icu" },
      { id: "patient-board", label: "Patient Board", route: "/nursing-icu/patient-board" },
      { id: "alerts", label: "Alerts", route: "/nursing-icu/alerts" },
    ],
  },
  {
    title: "Admission",
    tabs: [
      { id: "arrival-bed-allocation", label: "Arrival & Bed", route: "/nursing-icu/arrival-bed-allocation" },
      { id: "shift-handover", label: "Shift Handover", route: "/nursing-icu/shift-handover" },
      { id: "tasks", label: "Tasks", route: "/nursing-icu/tasks" },
    ],
  },
  {
    title: "Monitoring",
    tabs: [
      { id: "monitoring-chart", label: "24h Chart", route: "/nursing-icu/monitoring-chart" },
      { id: "vitals", label: "Vitals", route: "/nursing-icu/vitals" },
      { id: "nurse-review", label: "Nurse Review", route: "/nursing-icu/nurse-review" },
      { id: "intake-output", label: "Intake / Output", route: "/nursing-icu/intake-output" },
    ],
  },
  {
    title: "Medication",
    tabs: [
      { id: "medication-administration", label: "Medication", route: "/nursing-icu/medication-administration" },
      { id: "iv-fluids", label: "IV / Infusion", route: "/nursing-icu/iv-fluids" },
      { id: "blood-transfusion", label: "Blood", route: "/nursing-icu/blood-transfusion" },
    ],
  },
  {
    title: "Doctor",
    tabs: [
      { id: "doctor-rounds", label: "Rounds", route: "/nursing-icu/doctor-rounds" },
      { id: "doctor-instructions", label: "Instructions", route: "/nursing-icu/doctor-instructions" },
      { id: "duty-doctor-monitoring", label: "Duty Doctor", route: "/nursing-icu/duty-doctor-monitoring" },
    ],
  },
  {
    title: "Coordination",
    tabs: [
      { id: "lab-results", label: "Lab", route: "/nursing-icu/lab-results" },
      { id: "radiology-reports", label: "Radiology", route: "/nursing-icu/radiology-reports" },
      { id: "pharmacy-requests", label: "Pharmacy", route: "/nursing-icu/pharmacy-requests" },
    ],
  },
  {
    title: "Supervision",
    tabs: [
      { id: "head-nurse-console", label: "Head Nurse", route: "/nursing-icu/head-nurse-console" },
      { id: "ward-nurse-activities", label: "Ward Nurse", route: "/nursing-icu/ward-nurse-activities" },
    ],
  },
  {
    title: "Outcome",
    tabs: [
      { id: "transfer-discharge", label: "Transfer / Discharge", route: "/nursing-icu/transfer-discharge" },
      { id: "nursing-notes", label: "Notes", route: "/nursing-icu/nursing-notes" },
    ],
  },
  {
    title: "Audit",
    tabs: [
      { id: "audit-logs", label: "Audit", route: "/nursing-icu/audit-logs" },
      { id: "reports", label: "Reports", route: "/nursing-icu/reports" },
    ],
  },
];

export function NursingIcuModulePage({ page }: { page: NursingIcuPageId }) {
  const streamlinedPage = page === "dashboard" || page === "doctor-rounds" || page === "intake-output" || page === "head-nurse-console" || page === "ward-nurse-activities";
  const [unit, setUnit] = React.useState("All ICU units");
  const [status, setStatus] = React.useState("All status");
  const [search, setSearch] = React.useState("");
  const [quickAddOpen, setQuickAddOpen] = React.useState(false);

  function recordAction(message: string) {
    toast.success(message);
  }

  const filteredPatients = React.useMemo(() => {
    return icuPatients.filter((patient) => {
      const text = `${patient.patientName} ${patient.mrn} ${patient.bedNo} ${patient.unit} ${patient.currentStatus} ${patient.admissionSource}`;
      return text.toLowerCase().includes(search.toLowerCase())
        && (unit === "All ICU units" || patient.unit === unit)
        && (status === "All status" || patient.currentStatus === status);
    });
  }, [search, status, unit]);

  return (
    <div className="space-y-4 pb-8">
      <NursingIcuTabs activePage={page} />

      {!streamlinedPage ? <FilterPanel search={search} setSearch={setSearch} status={status} setStatus={setStatus} unit={unit} setUnit={setUnit} /> : null}

      {page === "dashboard" ? <Dashboard patients={filteredPatients} /> : null}
      {page === "patient-board" ? <PatientBoardWorkspace patients={filteredPatients} /> : null}
      {page === "arrival-bed-allocation" ? <AdmissionWizardWorkspace /> : null}
      {page === "shift-handover" ? <ShiftHandoverWorkspace /> : null}
      {page === "tasks" ? <NursingTaskBoardWorkspace /> : null}
      {page === "monitoring-chart" ? <MonitoringChart /> : null}
      {page === "vitals" ? <VitalsCharting /> : null}
      {page === "nurse-review" ? <NurseReview /> : null}
      {page === "intake-output" ? <IntakeOutput /> : null}
      {page === "medication-administration" ? <MedicationTimelineWorkspace /> : null}
      {page === "iv-fluids" ? <IvFluids /> : null}
      {page === "blood-transfusion" ? <BloodTransfusion /> : null}
      {page === "doctor-rounds" ? <DoctorRounds /> : null}
      {page === "doctor-instructions" ? <DoctorInstructions /> : null}
      {page === "lab-results" ? <CoordinationPage type="lab" /> : null}
      {page === "radiology-reports" ? <CoordinationPage type="radiology" /> : null}
      {page === "pharmacy-requests" ? <CoordinationPage type="pharmacy" /> : null}
      {page === "head-nurse-console" ? <HeadNurseConsole /> : null}
      {page === "ward-nurse-activities" ? <WardNurseActivities /> : null}
      {page === "duty-doctor-monitoring" ? <DutyDoctorMonitoring /> : null}
      {page === "alerts" ? <AlertsEscalationWorkspace /> : null}
      {page === "transfer-discharge" ? <TransferDischarge /> : null}
      {page === "nursing-notes" ? <NursingNotes /> : null}
      {page === "audit-logs" ? <AuditLogs /> : null}
      {page === "reports" ? <WorkflowReportsWorkspace /> : null}

      <QuickAddDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} pageTitle={pageMeta[page].title} onSaved={(message) => recordAction(message)} />
    </div>
  );
}

function NursingIcuTabs({ activePage }: { activePage: NursingIcuPageId }) {
  const activeGroup = nursingIcuTabGroups.find((group) => group.tabs.some((tab) => tab.id === activePage)) ?? nursingIcuTabGroups[0];

  return (
    <Card>
      <CardContent className="space-y-4 p-3">
        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
          {nursingIcuTabGroups.map((group) => {
            const active = group.title === activeGroup.title;
            return (
              <Link
                className={cn(
                  "h-8 shrink-0 rounded px-3 py-2 text-xs font-medium transition hover:text-foreground",
                  active ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
                )}
                href={group.tabs[0].route}
                key={group.title}
              >
                {group.title}
              </Link>
            );
          })}
        </div>

        <div className="rounded-md border border-border bg-surface p-3">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{activeGroup.title} Workflow</p>
              <p className="text-xs text-muted-foreground">Select a screen inside this workflow group.</p>
            </div>
            <Badge tone="info">{activeGroup.tabs.length} screens</Badge>
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
            {activeGroup.tabs.map((tab) => {
              const active = tab.id === activePage;
              return (
                <Link
                  className={cn(
                    "h-8 shrink-0 rounded px-3 py-2 text-xs font-medium transition hover:text-foreground",
                    active ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                  href={tab.route}
                  key={tab.id}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterPanel({
  search,
  setSearch,
  unit,
  setUnit,
  status,
  setStatus,
}: {
  search: string;
  setSearch: (value: string) => void;
  unit: string;
  setUnit: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1.4fr)_220px_220px_auto] md:items-end">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Search patient / bed / source</span>
          <Input placeholder="Search ICU patient, MRN, bed..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <NativeSelect label="ICU unit" value={unit} onChange={setUnit} options={["All ICU units", "Medical ICU", "Cardiac ICU", "Neuro ICU"]} />
        <NativeSelect label="Patient status" value={status} onChange={setStatus} options={["All status", "Critical", "Ventilated", "Stable ICU care", "Ready for transfer", "Discharge ordered", "Death workflow"]} />
        <Button variant="outline" onClick={() => {
          setSearch("");
          setUnit("All ICU units");
          setStatus("All status");
        }}>Reset</Button>
      </CardContent>
    </Card>
  );
}

function Dashboard({ patients }: { patients: IcuPatient[] }) {
  const [query, setQuery] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState("All risk");
  const [unitFilter, setUnitFilter] = React.useState("All units");
  const [density, setDensity] = React.useState<"Compact" | "Comfortable">("Compact");
  const occupiedBeds = icuPatients.length;
  const visiblePatients = patients.filter((patient) => {
    const text = `${patient.patientName} ${patient.bedNo} ${patient.mrn} ${patient.diagnosis} ${patient.unit} ${patient.currentStatus}`.toLowerCase();
    const matchesQuery = text.includes(query.toLowerCase());
    const matchesUnit = unitFilter === "All units" || patient.unit === unitFilter;
    const matchesRisk =
      riskFilter === "All risk"
      || (riskFilter === "Critical" && (patient.currentStatus === "Critical" || patient.criticalityScore >= 8))
      || (riskFilter === "Ventilator" && patient.ventilatorStatus !== "Room air")
      || (riskFilter === "Medication due" && medicationRows.some((row) => row.patientId === patient.id && ["Due", "Late"].includes(row.status)))
      || (riskFilter === "Alerts" && icuAlerts.some((alert) => alert.patientId === patient.id && alert.status !== "Resolved"))
      || patient.currentStatus === riskFilter;
    return matchesQuery && matchesUnit && matchesRisk;
  });
  const critical = icuPatients.filter((patient) => patient.currentStatus === "Critical" || patient.criticalityScore >= 8).length;
  const ventilated = icuPatients.filter((patient) => patient.ventilatorStatus !== "Room air").length;
  const transferReady = icuPatients.filter((patient) => patient.currentStatus === "Ready for transfer").length;
  const dueMedication = medicationRows.filter((row) => ["Due", "Late"].includes(row.status)).length;
  const openAlerts = icuAlerts.filter((alert) => alert.status !== "Resolved").length;
  const pendingTasks = icuTasks.filter((task) => task.status !== "Completed").length;
  const commandItems = [
    { label: "Bed board", route: "/nursing-icu/patient-board", icon: BedDouble, tone: "info" as DashboardCellTone },
    { label: "ICU monitor", route: "/nursing-icu/monitoring-chart", icon: HeartPulse, tone: "success" as DashboardCellTone },
    { label: "Vitals", route: "/nursing-icu/vitals", icon: Activity, tone: "info" as DashboardCellTone },
    { label: "Medication", route: "/nursing-icu/medication-administration", icon: Pill, tone: dueMedication ? "danger" as DashboardCellTone : "success" as DashboardCellTone },
    { label: "Lab", route: "/nursing-icu/lab-results", icon: TestTube2, tone: "purple" as DashboardCellTone },
    { label: "I/O", route: "/nursing-icu/intake-output", icon: Droplets, tone: "warning" as DashboardCellTone },
    { label: "Rounds", route: "/nursing-icu/doctor-rounds", icon: Stethoscope, tone: "info" as DashboardCellTone },
    { label: "Tasks", route: "/nursing-icu/tasks", icon: ListChecks, tone: pendingTasks ? "warning" as DashboardCellTone : "success" as DashboardCellTone },
  ];
  const dashboardTabs = [
    { label: "Dashboard", route: "/nursing-icu" },
    { label: "Bed Board", route: "/nursing-icu/patient-board" },
    { label: "ICU Monitor", route: "/nursing-icu/monitoring-chart" },
    { label: "Clinical History", route: "/nursing-icu/patient-board?view=clinical-history" },
    { label: "Patient Overview", route: "/nursing-icu/patient-board?view=overview" },
    { label: "Vital Signs", route: "/nursing-icu/vitals" },
    { label: "Ventilation", route: "/nursing-icu/monitoring-chart?view=ventilation" },
    { label: "Input / Output", route: "/nursing-icu/intake-output" },
    { label: "Medication", route: "/nursing-icu/medication-administration" },
    { label: "Radiology", route: "/nursing-icu/radiology-reports" },
    { label: "Events", route: "/nursing-icu/alerts" },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-sky-200 bg-white shadow-sm">
        <div className="border-b border-sky-200 bg-sky-600 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {commandItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="flex h-11 min-w-24 shrink-0 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/20"
                  href={item.route}
                  key={item.label}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  <span className={cn("h-2 w-2 rounded-full", dashboardToneDotClass(item.tone))} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-6">
          <DashboardCommandMetric label="ICU census" value={`${occupiedBeds}/6`} tone="info" />
          <DashboardCommandMetric label="Critical" value={critical} tone={critical ? "critical" : "success"} />
          <DashboardCommandMetric label="Ventilator" value={ventilated} tone={ventilated ? "purple" : "success"} />
          <DashboardCommandMetric label="Medication due" value={dueMedication} tone={dueMedication ? "danger" : "success"} />
          <DashboardCommandMetric label="Open alerts" value={openAlerts} tone={openAlerts ? "warning" : "success"} />
          <DashboardCommandMetric label="Transfer ready" value={transferReady} tone={transferReady ? "success" : "info"} />
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2">
          {dashboardTabs.map((tab, index) => (
            <Link
              className={cn(
                "inline-flex h-9 shrink-0 items-center rounded-md px-3 text-xs font-bold transition",
                index === 0 ? "bg-sky-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
              )}
              href={tab.route}
              key={tab.label}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto] lg:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-semibold text-slate-800">Search patient / bed / diagnosis</span>
            <Input className="border-slate-300 bg-white" placeholder="Search ICU patient, MRN, bed..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <NativeSelect label="Risk filter" value={riskFilter} onChange={setRiskFilter} options={["All risk", "Critical", "Ventilator", "Medication due", "Alerts", "Ready for transfer", "Stable ICU care"]} />
          <NativeSelect label="ICU unit" value={unitFilter} onChange={setUnitFilter} options={["All units", "Medical ICU", "Cardiac ICU", "Neuro ICU"]} />
          <div className="grid grid-cols-2 gap-2">
            {(["Compact", "Comfortable"] as const).map((mode) => (
              <Button key={mode} variant={density === mode ? "default" : "outline"} onClick={() => setDensity(mode)}>{mode}</Button>
            ))}
          </div>
        </div>
      </div>

      <DashboardMatrix patients={visiblePatients} density={density} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DashboardFocusStrip patients={visiblePatients} />
        <DashboardShiftPanel />
      </div>
    </div>
  );
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

type DashboardCellTone = "critical" | "danger" | "warning" | "success" | "info" | "purple" | "muted";

type DashboardCell = {
  title: string;
  detail: string;
  tone: DashboardCellTone;
  icon: typeof Activity;
  route?: string;
};

function DashboardCommandMetric({ label, value, tone }: { label: string; value: React.ReactNode; tone: DashboardCellTone }) {
  return (
    <div className={cn("rounded-md border px-3 py-2", dashboardToneSurfaceClass(tone))}>
      <div className="text-[11px] font-bold uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function DashboardMatrix({ patients, density }: { patients: IcuPatient[]; density: "Compact" | "Comfortable" }) {
  const columns = [
    "Risk",
    "Vitals",
    "Ventilation",
    "Input / Output",
    "Medication",
    "Lab",
    "Radiology",
    "Shift",
    "Events",
    "Collaborate",
  ];

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-bold text-slate-950">ICU command matrix</p>
          <p className="mt-1 text-xs text-slate-500">Patient-wise dashboard with hospital traffic-light colours and clickable workflow cells.</p>
        </div>
        <DashboardLegend />
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[1380px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
              <th className="sticky left-0 z-30 min-w-[230px] border-r border-slate-200 bg-slate-100 px-4 py-3 text-left">Patient</th>
              <th className="min-w-[240px] border-r border-slate-200 px-4 py-3 text-left">Diagnosis</th>
              {columns.map((column) => (
                <th className="min-w-[118px] border-r border-slate-200 px-3 py-3 text-center last:border-r-0" key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => {
              const rowCells = buildDashboardCells(patient);
              return (
                <tr className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50" key={patient.id}>
                  <td className="sticky left-0 z-20 border-r border-slate-200 bg-white px-4 py-3 align-top shadow-[8px_0_16px_-16px_rgba(15,23,42,0.5)]">
                    <div className={cn("rounded-md border p-3", dashboardPatientSurfaceClass(patient))}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-950">{patient.bedNo}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">{patient.patientName}</p>
                          <p className="mt-1 text-xs text-slate-500">{patient.mrn} | {patient.ageGender}</p>
                        </div>
                        <span className={cn("h-3 w-3 shrink-0 rounded-full", dashboardToneDotClass(patientDashboardTone(patient)))} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold", dashboardTonePillClass(patientDashboardTone(patient)))}>Score {patient.criticalityScore}</span>
                        <Link className="rounded-full border border-sky-300 bg-white px-2 py-0.5 text-[11px] font-bold text-sky-700" href={`/nursing-icu/patient-board?patient=${patient.id}&view=smart-bed`}>Open</Link>
                      </div>
                    </div>
                  </td>
                  <td className="border-r border-slate-200 px-4 py-3 align-top">
                    <div className="min-h-20">
                      <p className="text-sm font-semibold text-slate-900">{patient.diagnosis}</p>
                      <p className="mt-2 text-xs text-slate-500">{patient.unit} | {patient.assignedWardNurse}</p>
                      <span className={cn("mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold", dashboardTonePillClass(patientDashboardTone(patient)))}>{patient.currentStatus}</span>
                    </div>
                  </td>
                  {columns.map((column) => {
                    const cell = rowCells[column];
                    return (
                      <td className={cn("border-r border-slate-200 px-2 align-middle text-center last:border-r-0", density === "Compact" ? "py-2" : "py-4")} key={`${patient.id}-${column}`}>
                        <DashboardMatrixCell cell={cell} patient={patient} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {!patients.length ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={12}>No ICU patient matched the selected dashboard filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardMatrixCell({ cell, patient }: { cell: DashboardCell; patient: IcuPatient }) {
  const Icon = cell.icon;
  const content = (
    <>
      <span className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm", dashboardToneSolidClass(cell.tone))}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="mt-2 block text-xs font-bold leading-tight">{cell.title}</span>
      <span className="mt-1 block text-[11px] leading-tight opacity-80">{cell.detail}</span>
    </>
  );

  if (cell.route) {
    return (
      <Link className={cn("block min-h-24 rounded-md border p-2 text-center transition hover:-translate-y-0.5 hover:shadow-sm", dashboardToneSurfaceClass(cell.tone))} href={cell.route}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={cn("block min-h-24 w-full rounded-md border p-2 text-center transition hover:-translate-y-0.5 hover:shadow-sm", dashboardToneSurfaceClass(cell.tone))}
      type="button"
      onClick={() => toast.info(`${cell.title} opened for ${patient.bedNo}`)}
    >
      {content}
    </button>
  );
}

function DashboardFocusStrip({ patients }: { patients: IcuPatient[] }) {
  const rows = patients
    .flatMap((patient) => {
      const alerts = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved");
      const meds = medicationRows.filter((row) => row.patientId === patient.id && ["Due", "Late"].includes(row.status));
      const tasks = icuTasks.filter((task) => task.patientId === patient.id && task.status !== "Completed");
      return [
        alerts[0] ? { id: `alert-${alerts[0].id}`, patient, label: alerts[0].type, detail: alerts[0].message, tone: alerts[0].severity === "Critical" ? "critical" as DashboardCellTone : "warning" as DashboardCellTone } : null,
        meds[0] ? { id: `med-${meds[0].id}`, patient, label: "Medication", detail: `${meds[0].medication} ${meds[0].status}`, tone: meds[0].status === "Late" ? "danger" as DashboardCellTone : "warning" as DashboardCellTone } : null,
        tasks[0] ? { id: `task-${tasks[0].id}`, patient, label: "Task", detail: tasks[0].title, tone: tasks[0].status === "Overdue" ? "danger" as DashboardCellTone : "info" as DashboardCellTone } : null,
      ];
    })
    .filter(Boolean)
    .slice(0, 6) as Array<{ id: string; patient: IcuPatient; label: string; detail: string; tone: DashboardCellTone }>;

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-950">Live focus queue</p>
          <p className="mt-1 text-xs text-slate-500">The matrix items that need action first.</p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", dashboardTonePillClass(rows.length ? "warning" : "success"))}>{rows.length}</span>
      </div>
      <div className="mt-4 grid gap-2 lg:grid-cols-2">
        {rows.map((row) => (
          <Link className={cn("rounded-md border p-3 transition hover:-translate-y-0.5 hover:shadow-sm", dashboardToneSurfaceClass(row.tone))} href={`/nursing-icu/patient-board?patient=${row.patient.id}&view=smart-bed`} key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{row.patient.bedNo} - {row.label}</p>
                <p className="mt-1 text-xs">{row.detail}</p>
              </div>
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dashboardToneDotClass(row.tone))} />
            </div>
          </Link>
        ))}
        {!rows.length ? <div className="rounded-md border border-dashed border-emerald-300 bg-emerald-50 p-5 text-center text-sm font-semibold text-emerald-800">No urgent action in selected view.</div> : null}
      </div>
    </div>
  );
}

function DashboardShiftPanel() {
  const rows = [
    { label: "Ward Nurse Kavita", detail: "2 patients | 5 open tasks", tone: "warning" as DashboardCellTone },
    { label: "Ward Nurse Arjun", detail: "2 patients | 3 open tasks", tone: "success" as DashboardCellTone },
    { label: "Unit Nurse Priya", detail: "Bed allocation and escalation supervision", tone: "info" as DashboardCellTone },
  ];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-bold text-slate-950">Shift control</p>
        <p className="mt-1 text-xs text-slate-500">Nurse load, activity, and command handover.</p>
      </div>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div className={cn("rounded-md border p-3", dashboardToneSurfaceClass(row.tone))} key={row.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{row.label}</p>
              <span className={cn("h-2.5 w-2.5 rounded-full", dashboardToneDotClass(row.tone))} />
            </div>
            <p className="mt-1 text-xs">{row.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardLegend() {
  const items: Array<[string, DashboardCellTone]> = [["Critical", "critical"], ["Warning", "warning"], ["Normal", "success"], ["Action", "info"], ["Ventilator", "purple"]];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([label, tone]) => (
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-bold", dashboardTonePillClass(tone))} key={label}>
          <span className={cn("h-2 w-2 rounded-full", dashboardToneDotClass(tone))} />
          {label}
        </span>
      ))}
    </div>
  );
}

function buildDashboardCells(patient: IcuPatient): Record<string, DashboardCell> {
  const latestVital = [...icuVitals].reverse().find((row) => row.patientId === patient.id);
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const dueMeds = meds.filter((row) => ["Due", "Late"].includes(row.status));
  const alerts = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved");
  const tasks = icuTasks.filter((task) => task.patientId === patient.id && task.status !== "Completed");
  const balance = intakeOutputRows.filter((row) => row.patientId === patient.id).reduce((sum, row) => sum + row.balanceMl, 0);
  const runningInfusion = infusionRows.find((row) => row.patientId === patient.id && row.status === "Running");
  const vitalTone = latestVital?.abnormal || (latestVital?.spo2 ?? 100) < 94 || (latestVital?.pulse ?? 0) > 120 ? "danger" : "success";
  const balanceTone: DashboardCellTone = balance > 400 ? "warning" : balance < 0 ? "info" : "success";

  return {
    Risk: {
      title: `Score ${patient.criticalityScore}`,
      detail: patient.currentStatus,
      tone: patientDashboardTone(patient),
      icon: ShieldAlert,
      route: `/nursing-icu/patient-board?patient=${patient.id}&view=smart-bed`,
    },
    Vitals: {
      title: latestVital ? `SpO2 ${latestVital.spo2}%` : "No vitals",
      detail: latestVital ? `${latestVital.bp} | P ${latestVital.pulse}` : "Chart pending",
      tone: vitalTone,
      icon: HeartPulse,
      route: "/nursing-icu/vitals",
    },
    Ventilation: {
      title: patient.ventilatorStatus === "Room air" ? "Room air" : patient.ventilatorStatus,
      detail: runningInfusion ? runningInfusion.alert : patient.lastVitalsTime,
      tone: patient.ventilatorStatus === "Room air" ? "success" : "purple",
      icon: Activity,
      route: "/nursing-icu/monitoring-chart",
    },
    "Input / Output": {
      title: `${balance} ml`,
      detail: balance > 0 ? "Positive balance" : "Balanced",
      tone: balanceTone,
      icon: Droplets,
      route: "/nursing-icu/intake-output",
    },
    Medication: {
      title: dueMeds.length ? `${dueMeds.length} due` : "On time",
      detail: dueMeds[0]?.medication ?? `${meds.length} active`,
      tone: dueMeds.some((row) => row.status === "Late") ? "danger" : dueMeds.length ? "warning" : "success",
      icon: Pill,
      route: "/nursing-icu/medication-administration",
    },
    Lab: {
      title: alerts.some((alert) => alert.type.toLowerCase().includes("lab")) ? "Critical" : patient.pendingTasks > 4 ? "Pending" : "Ready",
      detail: alerts.find((alert) => alert.type.toLowerCase().includes("lab"))?.message ?? "Review queue",
      tone: alerts.some((alert) => alert.type.toLowerCase().includes("lab")) ? "critical" : patient.pendingTasks > 4 ? "warning" : "success",
      icon: TestTube2,
      route: "/nursing-icu/lab-results",
    },
    Radiology: {
      title: patient.id === "icu-003" ? "CT review" : "Portable",
      detail: patient.id === "icu-003" ? "Report pending" : "No critical",
      tone: patient.id === "icu-003" ? "warning" : "muted",
      icon: BarChart3,
      route: "/nursing-icu/radiology-reports",
    },
    Shift: {
      title: `${tasks.length} tasks`,
      detail: patient.assignedWardNurse,
      tone: tasks.some((task) => task.status === "Overdue") ? "danger" : tasks.length ? "warning" : "success",
      icon: ClipboardCheck,
      route: "/nursing-icu/shift-handover",
    },
    Events: {
      title: alerts.length ? `${alerts.length} open` : "Clear",
      detail: alerts[0]?.type ?? "No active event",
      tone: alerts.some((alert) => alert.severity === "Critical") ? "critical" : alerts.length ? "warning" : "success",
      icon: AlertTriangle,
      route: "/nursing-icu/alerts",
    },
    Collaborate: {
      title: patient.dutyDoctor,
      detail: "Call / note",
      tone: "info",
      icon: Stethoscope,
      route: "/nursing-icu/doctor-rounds",
    },
  };
}

function patientDashboardTone(patient: IcuPatient): DashboardCellTone {
  if (patient.currentStatus === "Critical" || patient.criticalityScore >= 8) return "critical";
  if (patient.ventilatorStatus !== "Room air") return "purple";
  if (patient.currentStatus === "Ready for transfer") return "success";
  return "info";
}

function dashboardPatientSurfaceClass(patient: IcuPatient) {
  return dashboardToneSurfaceClass(patientDashboardTone(patient));
}

function dashboardToneSurfaceClass(tone: DashboardCellTone) {
  if (tone === "critical") return "border-red-300 bg-red-50 text-red-950";
  if (tone === "danger") return "border-rose-300 bg-rose-50 text-rose-950";
  if (tone === "warning") return "border-amber-300 bg-amber-50 text-amber-950";
  if (tone === "success") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (tone === "purple") return "border-violet-300 bg-violet-50 text-violet-950";
  if (tone === "muted") return "border-slate-300 bg-slate-50 text-slate-700";
  return "border-sky-300 bg-sky-50 text-sky-950";
}

function dashboardTonePillClass(tone: DashboardCellTone) {
  if (tone === "critical") return "border-red-300 bg-red-50 text-red-700";
  if (tone === "danger") return "border-rose-300 bg-rose-50 text-rose-700";
  if (tone === "warning") return "border-amber-300 bg-amber-50 text-amber-700";
  if (tone === "success") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (tone === "purple") return "border-violet-300 bg-violet-50 text-violet-700";
  if (tone === "muted") return "border-slate-300 bg-slate-50 text-slate-600";
  return "border-sky-300 bg-sky-50 text-sky-700";
}

function dashboardToneSolidClass(tone: DashboardCellTone) {
  if (tone === "critical") return "bg-red-600";
  if (tone === "danger") return "bg-rose-600";
  if (tone === "warning") return "bg-amber-500";
  if (tone === "success") return "bg-emerald-600";
  if (tone === "purple") return "bg-violet-600";
  if (tone === "muted") return "bg-slate-500";
  return "bg-sky-600";
}

function dashboardToneDotClass(tone: DashboardCellTone) {
  if (tone === "critical") return "bg-red-600";
  if (tone === "danger") return "bg-rose-600";
  if (tone === "warning") return "bg-amber-500";
  if (tone === "success") return "bg-emerald-600";
  if (tone === "purple") return "bg-violet-600";
  if (tone === "muted") return "bg-slate-500";
  return "bg-sky-600";
}

type IcuHourlyVital = {
  date: string;
  hour: string;
  temperature: number;
  pulse: number;
  bp: string;
  respiratoryRate: number;
  spo2: number;
  oxygenFlow: string;
  gcs: number;
  urineOutput: number;
  painScore: number;
  nurse: string;
  note: string;
  risk: "Critical" | "High" | "Watch" | "Stable";
};

type ObservationRisk = "Critical" | "High Risk" | "Warning" | "Normal";

type NurseReviewRecord = {
  id: string;
  patientId: string;
  patient: string;
  bedNo: string;
  date: string;
  time: string;
  shift: string;
  by: string;
  respiratoryRate: number;
  spo2: number;
  o2FlowRate: string;
  fio2: number;
  bloodPressure: string;
  pulseRhythm: string;
  pulseRate: number;
  monitorHeartRate: number;
  temperature: string;
  gcsScore: number;
  painScore: number;
  urineOutput: number;
  status: ObservationRisk;
  note: string;
};

const icuMonitoringHours = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, "0")}:00`);

const monitoringParameters = [
  { key: "temperature", label: "Temperature", unit: "C" },
  { key: "pulse", label: "Pulse", unit: "/min" },
  { key: "bp", label: "BP", unit: "mmHg" },
  { key: "respiratoryRate", label: "Resp. rate", unit: "/min" },
  { key: "spo2", label: "SpO2", unit: "%" },
  { key: "oxygenFlow", label: "Oxygen flow", unit: "" },
  { key: "gcs", label: "GCS", unit: "score" },
  { key: "urineOutput", label: "Urine output", unit: "ml/hr" },
  { key: "painScore", label: "Pain", unit: "/10" },
  { key: "nurse", label: "Nurse", unit: "" },
  { key: "note", label: "Nurse note", unit: "" },
] as const;

const TODAY_DATE = "2026-06-05";
const YESTERDAY_DATE = "2026-06-04";
const dateFilterOptions = ["All dates", "Latest record date", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Single date", "Custom range"] as const;
const timeFilterOptions = ["All times", "Morning 06-13", "Afternoon 14-17", "Evening 18-21", "Night 22-05", "Business hours", "Custom time range"] as const;

type DateFilterOption = (typeof dateFilterOptions)[number];
type TimeFilterOption = (typeof timeFilterOptions)[number];
type DateTimeFilterState = {
  dateFilter: DateFilterOption;
  timeFilter: TimeFilterOption;
  fromDate: string;
  toDate: string;
  customTimeStart: string;
  customTimeEnd: string;
};

const defaultDateTimeFilter: DateTimeFilterState = {
  dateFilter: "Latest record date",
  timeFilter: "All times",
  fromDate: TODAY_DATE,
  toDate: TODAY_DATE,
  customTimeStart: "06:00",
  customTimeEnd: "22:00",
};

function parseHourValue(value: string) {
  const match = value.match(/(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  if (Number.isNaN(hour) || hour < 0 || hour > 23) return null;
  return hour + minute / 60;
}

function isTimeInWindow(hourText: string, filter: DateTimeFilterState) {
  const hour = parseHourValue(hourText);
  if (hour === null || filter.timeFilter === "All times") return true;
  const windows: Record<Exclude<TimeFilterOption, "All times" | "Custom time range">, [number, number]> = {
    "Morning 06-13": [6, 13.99],
    "Afternoon 14-17": [14, 17.99],
    "Evening 18-21": [18, 21.99],
    "Night 22-05": [22, 5.99],
    "Business hours": [9, 17.99],
  };
  const [start, end] = filter.timeFilter === "Custom time range"
    ? [parseHourValue(filter.customTimeStart) ?? 0, parseHourValue(filter.customTimeEnd) ?? 23.99]
    : windows[filter.timeFilter];
  return start <= end ? hour >= start && hour <= end : hour >= start || hour <= end;
}

function isDateInWindow(date: string, allDates: string[], filter: DateTimeFilterState) {
  if (filter.dateFilter === "All dates") return true;
  const latestDate = [...allDates].sort().at(-1) ?? TODAY_DATE;
  if (filter.dateFilter === "Latest record date") return date === latestDate;
  if (filter.dateFilter === "Today") return date === TODAY_DATE;
  if (filter.dateFilter === "Yesterday") return date === YESTERDAY_DATE;
  if (filter.dateFilter === "Last 7 days" || filter.dateFilter === "Last 30 days") {
    const days = filter.dateFilter === "Last 7 days" ? 7 : 30;
    const start = new Date(TODAY_DATE);
    start.setDate(start.getDate() - (days - 1));
    const current = new Date(date);
    return current >= start && current <= new Date(TODAY_DATE);
  }
  if (filter.dateFilter === "Single date") return date === filter.fromDate;
  return date >= filter.fromDate && date <= filter.toDate;
}

function applyDateTimeFilter<T extends { date?: string; time?: string; hour?: string }>(rows: T[], filter: DateTimeFilterState) {
  const allDates = rows.map((row) => row.date ?? TODAY_DATE);
  return rows.filter((row) => {
    const rowDate = row.date ?? TODAY_DATE;
    const rowTime = row.time ?? row.hour ?? "";
    return isDateInWindow(rowDate, allDates, filter) && isTimeInWindow(rowTime, filter);
  });
}

function DateTimeFilterPanel({
  title = "Date & Time Filter",
  compact,
  value,
  onChange,
  resultCount,
}: {
  title?: string;
  compact?: boolean;
  value?: DateTimeFilterState;
  onChange?: (value: DateTimeFilterState) => void;
  resultCount?: number;
}) {
  const [localValue, setLocalValue] = React.useState<DateTimeFilterState>(defaultDateTimeFilter);
  const current = value ?? localValue;
  const setCurrent = (next: DateTimeFilterState) => {
    if (onChange) onChange(next);
    else setLocalValue(next);
  };

  return (
    <Card>
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Filter records by observation date and nursing shift time window.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="info">{current.dateFilter} / {current.timeFilter}</StatusPill>
          {typeof resultCount === "number" ? <Badge tone={resultCount ? "success" : "warning"}>{resultCount} records</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-3 lg:grid-cols-[180px_1fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
            <div className="text-sm text-foreground">{current.dateFilter === "Latest record date" ? "05 Jun 2026" : current.dateFilter}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <Button
                className="h-8 rounded-md px-3 text-xs"
                key={option}
                variant={current.dateFilter === option ? "default" : "outline"}
                onClick={() => setCurrent({ ...current, dateFilter: option })}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 border-t border-border pt-3 lg:grid-cols-[180px_1fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Time filter</div>
            <div className="text-sm text-foreground">{current.timeFilter}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeFilterOptions.map((option) => (
              <Button
                className="h-8 rounded-md px-3 text-xs"
                key={option}
                variant={current.timeFilter === option ? "default" : "outline"}
                onClick={() => setCurrent({ ...current, timeFilter: option })}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
        {current.dateFilter === "Single date" || current.dateFilter === "Custom range" || current.timeFilter === "Custom time range" ? (
          <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3 md:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">From date</span>
              <Input value={current.fromDate} type="date" onChange={(event) => setCurrent({ ...current, fromDate: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">To date</span>
              <Input value={current.toDate} type="date" onChange={(event) => setCurrent({ ...current, toDate: event.target.value })} />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Time range</span>
              <div className="grid grid-cols-2 gap-2">
                <Input value={current.customTimeStart} type="time" onChange={(event) => setCurrent({ ...current, customTimeStart: event.target.value })} />
                <Input value={current.customTimeEnd} type="time" onChange={(event) => setCurrent({ ...current, customTimeEnd: event.target.value })} />
              </div>
            </label>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RiskLegend() {
  const items = [
    { label: "Critical", className: "border-purple-300 bg-purple-100 text-purple-800" },
    { label: "High Risk", className: "border-rose-300 bg-rose-100 text-rose-800" },
    { label: "Warning", className: "border-yellow-300 bg-yellow-100 text-yellow-800" },
    { label: "Normal", className: "border-slate-300 bg-white text-slate-700" },
    { label: "Not Recorded", className: "border-slate-300 bg-slate-100 text-slate-500" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${item.className}`} key={item.label}>
          <span className="h-2 w-2 rounded-full border border-current bg-current/20" />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function getObservationRisk(values: { respiratoryRate: number; spo2: number; pulse: number; temperature: number; urineOutput: number; painScore: number; gcs: number }): ObservationRisk {
  if (values.spo2 < 90 || values.pulse > 130 || values.respiratoryRate > 32 || values.gcs <= 8 || values.urineOutput < 20) return "Critical";
  if (values.spo2 < 92 || values.pulse > 120 || values.respiratoryRate > 28 || values.gcs < 12 || values.temperature >= 38.5 || values.urineOutput < 30) return "High Risk";
  if (values.spo2 < 95 || values.pulse > 105 || values.respiratoryRate > 24 || values.painScore >= 6 || values.urineOutput < 40) return "Warning";
  return "Normal";
}

function riskBadgeClass(risk: ObservationRisk) {
  if (risk === "Critical") return "border-purple-300 bg-purple-100 text-purple-800";
  if (risk === "High Risk") return "border-rose-300 bg-rose-100 text-rose-800";
  if (risk === "Warning") return "border-yellow-300 bg-yellow-100 text-yellow-800";
  return "border-emerald-300 bg-emerald-50 text-emerald-700";
}

function buildNurseReviewRecords(): NurseReviewRecord[] {
  return icuVitals.map((row, index) => {
    const patient = icuPatients.find((item) => item.id === row.patientId);
    const risk = getObservationRisk({
      respiratoryRate: row.respiratoryRate,
      spo2: row.spo2,
      pulse: row.pulse,
      temperature: Number(row.temperature),
      urineOutput: row.urineOutput,
      painScore: row.painScore,
      gcs: row.gcs,
    });
    return {
      id: row.id,
      patientId: row.patientId,
      patient: patient?.patientName ?? row.patientId,
      bedNo: row.bedNo,
      date: index < 2 ? "2026-06-05" : "2026-06-04",
      time: row.time,
      shift: index % 2 === 0 ? "Morning" : "Evening",
      by: row.nurse,
      respiratoryRate: row.respiratoryRate,
      spo2: row.spo2,
      o2FlowRate: row.oxygenFlow,
      fio2: row.oxygenFlow.includes("Ventilator") ? 40 : row.oxygenFlow.includes("10") ? 60 : 28,
      bloodPressure: row.bp,
      pulseRhythm: row.pulse > 120 ? "Tachycardia" : "Regular",
      pulseRate: row.pulse,
      monitorHeartRate: row.pulse,
      temperature: row.temperature,
      gcsScore: row.gcs,
      painScore: row.painScore,
      urineOutput: row.urineOutput,
      status: risk,
      note: row.note,
    };
  });
}

function MonitoringChart() {
  const [patientId, setPatientId] = React.useState(icuPatients[0]?.id ?? "");
  const [shift, setShift] = React.useState("Full 24 hours");
  const [viewMode, setViewMode] = React.useState("Graph + table");
  const [observationDate, setObservationDate] = React.useState(TODAY_DATE);
  const [dateTimeFilter, setDateTimeFilter] = React.useState<DateTimeFilterState>(defaultDateTimeFilter);
  const selectedPatient = icuPatients.find((patient) => patient.id === patientId) ?? icuPatients[0];
  const hourlyVitals = React.useMemo(() => buildIcuHourlyVitals(selectedPatient, observationDate), [observationDate, selectedPatient]);
  const filteredHourlyVitals = React.useMemo(() => applyDateTimeFilter(hourlyVitals, dateTimeFilter), [dateTimeFilter, hourlyVitals]);
  const criticalHours = filteredHourlyVitals.filter((entry) => entry.risk === "Critical").length;
  const latest = filteredHourlyVitals[filteredHourlyVitals.length - 1];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Adult ICU Observation Chart - 24 Hours</CardTitle>
            <CardDescription>Rapid-review style hourly vitals monitoring for nurse charting and doctor review.</CardDescription>
          </div>
          <StatusPill tone={criticalHours > 0 ? "critical" : "success"}>{criticalHours > 0 ? `${criticalHours} critical hours` : "Stable 24h"}</StatusPill>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_180px_auto] xl:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Patient / bed</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
                {icuPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Observation date</span>
              <Input value={observationDate} type="date" onChange={(event) => {
                const nextDate = event.target.value;
                setObservationDate(nextDate);
                setDateTimeFilter((current) => ({ ...current, fromDate: nextDate, toDate: nextDate }));
              }} />
            </label>
            <NativeSelect label="Shift" value={shift} onChange={setShift} options={["Full 24 hours", "Morning", "Evening", "Night"]} />
            <NativeSelect label="View" value={viewMode} onChange={setViewMode} options={["Graph + table", "Graph only", "Table only"]} />
            <Button onClick={() => toast.success(`24-hour chart saved for ${selectedPatient.patientName}`)}>Save chart</Button>
          </div>

          <SummaryGrid>
            <StatCard label="Latest SpO2" value={latest?.spo2 ?? 0} change={latest?.spo2 && latest.spo2 < 92 ? "Low" : "OK"} context="Percent" tone={latest?.spo2 && latest.spo2 < 92 ? "danger" : "success"} icon={HeartPulse} />
            <StatCard label="Latest pulse" value={latest?.pulse ?? 0} change={latest?.pulse && latest.pulse > 120 ? "High" : "OK"} context="Per minute" tone={latest?.pulse && latest.pulse > 120 ? "danger" : "info"} icon={Activity} />
            <StatCard label="Urine output" value={latest?.urineOutput ?? 0} change={latest?.urineOutput && latest.urineOutput < 30 ? "Low" : "OK"} context="ml/hr" tone={latest?.urineOutput && latest.urineOutput < 30 ? "warning" : "success"} icon={Droplets} />
            <StatCard label="GCS" value={latest?.gcs ?? 0} change={latest?.gcs && latest.gcs < 9 ? "Critical" : "Observe"} context="Score" tone={latest?.gcs && latest.gcs < 9 ? "critical" : "info"} icon={ShieldAlert} />
          </SummaryGrid>
        </CardContent>
      </Card>

      <DateTimeFilterPanel title="Observation Date & Time Filter" compact value={dateTimeFilter} onChange={setDateTimeFilter} resultCount={filteredHourlyVitals.length} />
      {viewMode !== "Table only" ? <IcuVitals24HourGraph data={filteredHourlyVitals} patientName={selectedPatient.patientName} /> : null}
      {viewMode !== "Graph only" ? <IcuVitals24HourTable data={filteredHourlyVitals} /> : null}
    </div>
  );
}

function VitalsCharting() {
  return (
    <div className="space-y-4">
      <NurseVitalsEntryForm />
      <DateTimeFilterPanel title="Vitals Entry Log Filter" compact />
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <GenericTable title="Vitals Entries" rows={icuVitals} />
        <VitalsTrend />
      </div>
    </div>
  );
}

function NurseReview() {
  const [records, setRecords] = React.useState<NurseReviewRecord[]>(() => buildNurseReviewRecords());
  const [patientId, setPatientId] = React.useState("All patients");
  const [worklist, setWorklist] = React.useState("All review status");
  const [assignedNurse, setAssignedNurse] = React.useState("All nurses");
  const [dateTimeFilter, setDateTimeFilter] = React.useState<DateTimeFilterState>(defaultDateTimeFilter);
  const [activeAction, setActiveAction] = React.useState<{ mode: "View" | "Edit" | "Delete"; record: NurseReviewRecord } | null>(null);
  const selectedPatient = patientId === "All patients" ? icuPatients[0] : icuPatients.find((patient) => patient.id === patientId) ?? icuPatients[0];
  const hourlyVitals = React.useMemo(() => applyDateTimeFilter(buildIcuHourlyVitals(selectedPatient), dateTimeFilter), [dateTimeFilter, selectedPatient]);
  const filteredRecords = records.filter((record) => {
    const patientMatches = patientId === "All patients" || record.patientId === patientId;
    const statusMatches = worklist === "All review status"
      || (worklist === "Needs doctor review" && ["Critical", "High Risk"].includes(record.status))
      || (worklist === "Normal observations" && record.status === "Normal")
      || (worklist === record.status);
    const nurseMatches = assignedNurse === "All nurses" || record.by === assignedNurse;
    return patientMatches && statusMatches && nurseMatches;
  });
  const dateTimeFilteredRecords = applyDateTimeFilter(filteredRecords, dateTimeFilter);

  function updateRecord(nextRecord: NurseReviewRecord) {
    const nextStatus = getObservationRisk({
      respiratoryRate: nextRecord.respiratoryRate,
      spo2: nextRecord.spo2,
      pulse: nextRecord.pulseRate,
      temperature: Number(nextRecord.temperature),
      urineOutput: nextRecord.urineOutput,
      painScore: nextRecord.painScore,
      gcs: nextRecord.gcsScore,
    });
    setRecords((current) => current.map((record) => record.id === nextRecord.id ? { ...nextRecord, status: nextStatus } : record));
    toast.success(`Nurse review updated for ${nextRecord.patient}`);
    setActiveAction(null);
  }

  function deleteRecord(recordId: string) {
    const record = records.find((item) => item.id === recordId);
    setRecords((current) => current.filter((item) => item.id !== recordId));
    toast.success(`${record?.patient ?? "Observation"} deleted from review list`);
    setActiveAction(null);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nurse Review Worklist</CardTitle>
            <CardDescription>Review ICU observation entries with patient, status, date, and time filters before doctor review.</CardDescription>
          </div>
          <Button onClick={() => toast.success("Latest nurse observations loaded")}>Review latest</Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Chart patient</span>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
              <option>All patients</option>
              {icuPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>)}
            </select>
          </label>
          <NativeSelect label="Worklist status" value={worklist} onChange={setWorklist} options={["All review status", "Needs doctor review", "Normal observations", "Critical", "High Risk", "Warning", "Normal"]} />
          <NativeSelect label="Assigned nurse" value={assignedNurse} onChange={setAssignedNurse} options={["All nurses", "Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Nurse Neha", "Head Nurse Sana"]} />
        </CardContent>
      </Card>

      <DateTimeFilterPanel title="Nurse Review Date & Time Filter" compact value={dateTimeFilter} onChange={setDateTimeFilter} resultCount={dateTimeFilteredRecords.length} />

      <SummaryGrid>
        <StatCard label="Review entries" value={dateTimeFilteredRecords.length} change="Filtered" context="Nurse observations" tone="info" icon={ClipboardCheck} />
        <StatCard label="Critical / high" value={dateTimeFilteredRecords.filter((row) => ["Critical", "High Risk"].includes(row.status)).length} change="Doctor review" context="Escalation required" tone="danger" icon={ShieldAlert} />
        <StatCard label="Warnings" value={dateTimeFilteredRecords.filter((row) => row.status === "Warning").length} change="Repeat" context="Observe closely" tone="warning" icon={AlertTriangle} />
        <StatCard label="Normal" value={dateTimeFilteredRecords.filter((row) => row.status === "Normal").length} change="Routine" context="Safe records" tone="success" icon={HeartPulse} />
      </SummaryGrid>

      <IcuVitals24HourTable data={hourlyVitals} />
      <NurseReviewTable records={dateTimeFilteredRecords} onAction={setActiveAction} />
      <NurseReviewDialog
        activeAction={activeAction}
        onOpenChange={(open) => !open && setActiveAction(null)}
        onDelete={deleteRecord}
        onUpdate={updateRecord}
      />
    </div>
  );
}

function NurseVitalsEntryForm() {
  const [patientId, setPatientId] = React.useState(icuPatients[0]?.id ?? "");
  const [respiratoryRate, setRespiratoryRate] = React.useState("20");
  const [o2Saturation, setO2Saturation] = React.useState("97");
  const [o2FlowRate, setO2FlowRate] = React.useState("0");
  const [fio2, setFio2] = React.useState("21");
  const [bpSystolic, setBpSystolic] = React.useState("120");
  const [bpDiastolic, setBpDiastolic] = React.useState("80");
  const [pulseRate, setPulseRate] = React.useState("86");
  const [monitorHeartRate, setMonitorHeartRate] = React.useState("86");
  const [temperature, setTemperature] = React.useState("37.0");
  const [gcsScore, setGcsScore] = React.useState("15/Awake and alert");
  const [painScore, setPainScore] = React.useState("2");
  const [urineOutput, setUrineOutput] = React.useState("60");
  const [recordedBy, setRecordedBy] = React.useState("Ward Nurse Kavita");
  const [shift, setShift] = React.useState("Evening");
  const [deliveryMethod, setDeliveryMethod] = React.useState("Room air");
  const [pulseRhythm, setPulseRhythm] = React.useState("Regular");
  const [pulseSource, setPulseSource] = React.useState("Manual radial pulse");
  const [pulseSite, setPulseSite] = React.useState("Radial");
  const [pulseQuality, setPulseQuality] = React.useState("Normal");
  const [pulseAction, setPulseAction] = React.useState("No immediate action");
  const selectedPatient = icuPatients.find((patient) => patient.id === patientId) ?? icuPatients[0];
  const pulseDeficit = Math.max(0, Number(monitorHeartRate || 0) - Number(pulseRate || 0));
  const riskLevel = getObservationRisk({
    respiratoryRate: Number(respiratoryRate || 0),
    spo2: Number(o2Saturation || 0),
    pulse: Number(pulseRate || 0),
    temperature: Number(temperature || 0),
    urineOutput: Number(urineOutput || 0),
    painScore: Number(painScore || 0),
    gcs: Number(gcsScore.split("/")[0] || 15),
  });

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Nurse Observation Entry</CardTitle>
            <CardDescription>Respiratory rate, saturation, oxygen flow, blood pressure, pulse rhythm, temperature, GCS score, pain, and urine output are entered here.</CardDescription>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeClass(riskLevel)}`}>{riskLevel}</span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Patient</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={patientId} onChange={(event) => setPatientId(event.target.value)}>
                {icuPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.patientName} - {patient.bedNo}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Date</span>
              <Input defaultValue="2026-06-05" type="date" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Time</span>
              <Input defaultValue="15:30" type="time" />
            </label>
            <NativeSelect label="Shift" value={shift} onChange={setShift} options={["Morning", "Afternoon", "Evening", "Night"]} />
            <NativeSelect label="Recorded by" value={recordedBy} onChange={setRecordedBy} options={["Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Nurse Neha", "Unit Nurse Priya", "Head Nurse Sana"]} />
            <VitalNumberInput label="Respiratory rate" value={respiratoryRate} onChange={setRespiratoryRate} suffix="/min" />
            <VitalNumberInput label="O2 saturation" value={o2Saturation} onChange={setO2Saturation} suffix="%" />
            <VitalNumberInput label="O2 flow rate" value={o2FlowRate} onChange={setO2FlowRate} suffix="L/min" />
            <VitalNumberInput label="FiO2" value={fio2} onChange={setFio2} suffix="%" />
            <BloodPressureInput dia={bpDiastolic} setDia={setBpDiastolic} setSys={setBpSystolic} sys={bpSystolic} />
            <NativeSelect label="Delivery method" value={deliveryMethod} onChange={setDeliveryMethod} options={["Room air", "Nasal cannula", "Simple mask", "NRBM", "NIV support", "Ventilator support"]} />
            <NativeSelect label="Pulse rhythm" value={pulseRhythm} onChange={setPulseRhythm} options={["Regular", "Irregular", "Tachycardia", "Bradycardia", "Weak pulse"]} />
            <VitalNumberInput label="Pulse rate" value={pulseRate} onChange={setPulseRate} suffix="/min" />
            <VitalNumberInput label="Monitor heart rate" value={monitorHeartRate} onChange={setMonitorHeartRate} suffix="bpm" />
            <NativeSelect label="Pulse source" value={pulseSource} onChange={setPulseSource} options={["Manual radial pulse", "Monitor", "Apex beat", "Doppler"]} />
            <NativeSelect label="Pulse site" value={pulseSite} onChange={setPulseSite} options={["Radial", "Brachial", "Carotid", "Femoral", "Pedal"]} />
            <NativeSelect label="Pulse quality" value={pulseQuality} onChange={setPulseQuality} options={["Normal", "Weak", "Bounding", "Thready", "Not palpable"]} />
            <NativeSelect label="Pulse action taken" value={pulseAction} onChange={setPulseAction} options={["No immediate action", "Repeat reading", "Inform duty doctor", "Start escalation", "Document and observe"]} />
            <VitalNumberInput label="Temperature" value={temperature} onChange={setTemperature} suffix="deg C" />
            <NativeSelect label="GCS score" value={gcsScore} onChange={setGcsScore} options={["15/Awake and alert", "14/Confused", "13/Drowsy", "12/Responds to voice", "9-11/Serious", "3-8/Critical"]} />
            <VitalNumberInput label="Pain score" value={painScore} onChange={setPainScore} suffix="/10" />
            <VitalNumberInput label="Urine output" value={urineOutput} onChange={setUrineOutput} suffix="ml/hr" />
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <div className="text-[11px] font-medium uppercase text-muted-foreground">Pulse deficit</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{pulseDeficit} bpm</div>
              <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${pulseDeficit > 0 ? riskBadgeClass("Warning") : riskBadgeClass("Normal")}`}>
                {pulseDeficit > 0 ? "Check rhythm" : "Normal"}
              </span>
            </div>
            <ObservationStatusPreview riskLevel={riskLevel} />
            <label className="space-y-1 text-sm md:col-span-2 xl:col-span-4">
              <span className="font-medium text-foreground">Nurse notes</span>
              <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue="Patient monitored. Duty doctor to be informed if SpO2, BP, GCS, or urine output worsens." />
            </label>
          </div>
          <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-muted p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{selectedPatient?.patientName}</div>
              <div className="text-xs text-muted-foreground">{selectedPatient?.bedNo} - saved entry will appear in Nurse Review for view, edit, or delete actions.</div>
            </div>
            <Button onClick={() => toast.success(`Nurse observation saved for ${selectedPatient?.patientName}`)}>Save observation</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <SelectedPatientObservationCard patient={selectedPatient} />
        <LatestPatientEntriesCard patientId={patientId} />
      </div>
    </div>
  );
}

function VitalNumberInput({ label, value, onChange, suffix }: { label: string; value: string; onChange: (value: string) => void; suffix: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/20">
        <input className="h-10 min-w-0 flex-1 rounded-l-md bg-transparent px-3 text-sm outline-none" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} />
        <span className="flex h-10 shrink-0 items-center rounded-r-md border-l border-border bg-surface-muted px-2 text-xs text-muted-foreground">{suffix}</span>
      </div>
    </label>
  );
}

function BloodPressureInput({ sys, dia, setSys, setDia }: { sys: string; dia: string; setSys: (value: string) => void; setDia: (value: string) => void }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">Blood pressure</span>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/20">
        <input className="h-10 min-w-0 rounded-l-md bg-transparent px-3 text-sm outline-none" inputMode="numeric" value={sys} onChange={(event) => setSys(event.target.value)} />
        <span className="text-xs font-semibold text-muted-foreground">/</span>
        <input className="h-10 min-w-0 rounded-r-md bg-transparent px-3 text-sm outline-none" inputMode="numeric" value={dia} onChange={(event) => setDia(event.target.value)} />
      </div>
      <span className="text-[11px] text-muted-foreground">sys / dia mmHg</span>
    </label>
  );
}

function ObservationStatusPreview({ riskLevel }: { riskLevel: ObservationRisk }) {
  const preview = riskLevel === "Critical"
    ? ["Critical", "MER Call"]
    : riskLevel === "High Risk"
      ? ["High risk", "Doctor review"]
      : riskLevel === "Warning"
        ? ["Warning", "Repeat vitals"]
        : ["Safe", "Routine"];

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">System status</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {preview.map((item) => <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeClass(riskLevel)}`} key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function PatientInfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-border bg-surface-muted px-3 py-2">
      <div className="text-[11px] font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium leading-snug text-foreground">{value}</div>
    </div>
  );
}

function SelectedPatientObservationCard({ patient }: { patient?: IcuPatient }) {
  if (!patient) return null;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Selected Patient</CardTitle>
          <CardDescription>Add entry goes into this patient date-wise observation log.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <PatientInfoTile label="Patient" value={patient.patientName} />
        <PatientInfoTile label="UHID" value={patient.mrn} />
        <PatientInfoTile label="Location" value={`${patient.bedNo}, ${patient.unit}`} />
        <PatientInfoTile label="Consultant" value={patient.admittingDoctor} />
      </CardContent>
    </Card>
  );
}

function LatestPatientEntriesCard({ patientId }: { patientId: string }) {
  const entries = icuVitals.filter((row) => row.patientId === patientId).slice(0, 4);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Latest Patient Entries</CardTitle>
          <CardDescription>Saved readings for this patient.</CardDescription>
        </div>
        <StatusPill tone="info">{entries.length} readings</StatusPill>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[520px] border-collapse text-xs">
            <thead className="bg-surface-muted text-muted-foreground">
              <tr>
                <th className="border-b border-r border-border px-3 py-2 text-left">Time</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">By</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">RR</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">SpO2</th>
                <th className="border-b border-border px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(entries.length ? entries : icuVitals.slice(0, 2)).map((row) => {
                const risk = getObservationRisk({ respiratoryRate: row.respiratoryRate, spo2: row.spo2, pulse: row.pulse, temperature: Number(row.temperature), urineOutput: row.urineOutput, painScore: row.painScore, gcs: row.gcs });
                return (
                  <tr className="border-b border-border last:border-0" key={row.id}>
                    <td className="border-r border-border px-3 py-2">{row.time}</td>
                    <td className="border-r border-border px-3 py-2">{row.nurse}</td>
                    <td className="border-r border-border px-3 py-2">{row.respiratoryRate}</td>
                    <td className="border-r border-border px-3 py-2">{row.spo2}%</td>
                    <td className="px-3 py-2"><span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(risk)}`}>{risk}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function NurseReviewTable({
  records,
  onAction,
}: {
  records: NurseReviewRecord[];
  onAction: (action: { mode: "View" | "Edit" | "Delete"; record: NurseReviewRecord }) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Nurse Review Records</CardTitle>
          <CardDescription>View, edit, or delete nurse-entered observation rows.</CardDescription>
        </div>
        <StatusPill tone="info">{records.length} records</StatusPill>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1200px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                {["Date", "Time", "Patient", "Bed", "By", "RR", "SpO2", "BP", "Pulse", "Temp", "GCS", "Urine", "Status", "Actions"].map((header) => (
                  <th className="border-b border-r border-border px-3 py-2 text-left last:border-r-0" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length ? records.map((record) => (
                <tr className="border-b border-border last:border-0" key={record.id}>
                  <td className="border-r border-border px-3 py-2">{record.date}</td>
                  <td className="border-r border-border px-3 py-2">{record.time}</td>
                  <td className="border-r border-border px-3 py-2 font-medium text-foreground">{record.patient}</td>
                  <td className="border-r border-border px-3 py-2">{record.bedNo}</td>
                  <td className="border-r border-border px-3 py-2">{record.by}</td>
                  <td className={`border-r border-border px-3 py-2 ${record.respiratoryRate > 28 ? "bg-rose-100 font-semibold text-rose-900" : ""}`}>{record.respiratoryRate}</td>
                  <td className={`border-r border-border px-3 py-2 ${record.spo2 < 92 ? "bg-rose-100 font-semibold text-rose-900" : record.spo2 < 95 ? "bg-yellow-100 font-semibold text-yellow-900" : ""}`}>{record.spo2}%</td>
                  <td className="border-r border-border px-3 py-2">{record.bloodPressure}</td>
                  <td className={`border-r border-border px-3 py-2 ${record.pulseRate > 120 ? "bg-rose-100 font-semibold text-rose-900" : ""}`}>{record.pulseRate}</td>
                  <td className="border-r border-border px-3 py-2">{record.temperature} C</td>
                  <td className={`border-r border-border px-3 py-2 ${record.gcsScore < 12 ? "bg-rose-100 font-semibold text-rose-900" : ""}`}>{record.gcsScore}</td>
                  <td className={`border-r border-border px-3 py-2 ${record.urineOutput < 30 ? "bg-rose-100 font-semibold text-rose-900" : ""}`}>{record.urineOutput}</td>
                  <td className="border-r border-border px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(record.status)}`}>{record.status}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => onAction({ mode: "View", record })}>View</Button>
                      <Button size="sm" variant="outline" onClick={() => onAction({ mode: "Edit", record })}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => onAction({ mode: "Delete", record })}>Delete</Button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={14}>No nurse review records match the selected filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function NurseReviewDialog({
  activeAction,
  onOpenChange,
  onUpdate,
  onDelete,
}: {
  activeAction: { mode: "View" | "Edit" | "Delete"; record: NurseReviewRecord } | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (record: NurseReviewRecord) => void;
  onDelete: (recordId: string) => void;
}) {
  const mode = activeAction?.mode;
  const record = activeAction?.record;
  const activeKey = record ? `${mode}-${record.id}` : "closed";
  const [draftState, setDraftState] = React.useState<{ key: string; draft: NurseReviewRecord | null }>(() => ({
    key: activeKey,
    draft: record ?? null,
  }));
  const draft = draftState.key === activeKey ? draftState.draft : record ?? null;
  const readOnly = mode === "View";

  function updateDraft<K extends keyof NurseReviewRecord>(key: K, value: NurseReviewRecord[K]) {
    setDraftState((current) => {
      const nextDraft = current.key === activeKey ? current.draft : record ?? null;
      return {
        key: activeKey,
        draft: nextDraft ? { ...nextDraft, [key]: value } : nextDraft,
      };
    });
  }

  const previewRisk = draft ? getObservationRisk({
    respiratoryRate: draft.respiratoryRate,
    spo2: draft.spo2,
    pulse: draft.pulseRate,
    temperature: Number(draft.temperature),
    urineOutput: draft.urineOutput,
    painScore: draft.painScore,
    gcs: draft.gcsScore,
  }) : "Normal";

  return (
    <Dialog.Root open={Boolean(activeAction)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(840px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          {mode && record && draft ? (
            <>
              <DialogHeader
                title={`${mode} Nurse Observation`}
                description={`${record.patient} | ${record.bedNo} | ${record.date} ${record.time}`}
              />
              {mode === "Delete" ? (
                <div className="space-y-3 overflow-y-auto p-4">
                  <AlertBanner icon={AlertTriangle} tone="danger" title="Delete observation">
                    This removes the row from the current review list. Deletion should remain role-protected and audit logged.
                  </AlertBanner>
                  <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm">
                    <div className="font-semibold text-foreground">{record.patient}</div>
                    <div className="mt-1 text-muted-foreground">RR {record.respiratoryRate}, SpO2 {record.spo2}%, BP {record.bloodPressure}, Pulse {record.pulseRate}</div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 overflow-y-auto p-4 sm:grid-cols-2 xl:grid-cols-3">
                  <ReviewTextField label="Patient" readOnly value={draft.patient} />
                  <ReviewTextField label="Bed" readOnly value={draft.bedNo} />
                  <ReviewTextField label="Date" readOnly={readOnly} type="date" value={draft.date} onChange={(value) => updateDraft("date", value)} />
                  <ReviewTextField label="Time" readOnly={readOnly} type="time" value={draft.time} onChange={(value) => updateDraft("time", value)} />
                  <ReviewSelectField label="Shift" readOnly={readOnly} value={draft.shift} options={["Morning", "Afternoon", "Evening", "Night"]} onChange={(value) => updateDraft("shift", value)} />
                  <ReviewSelectField label="Recorded by" readOnly={readOnly} value={draft.by} options={["Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Nurse Neha", "Unit Nurse Priya", "Head Nurse Sana"]} onChange={(value) => updateDraft("by", value)} />
                  <ReviewNumberField label="Respiratory rate" readOnly={readOnly} suffix="/min" value={draft.respiratoryRate} onChange={(value) => updateDraft("respiratoryRate", value)} />
                  <ReviewNumberField label="O2 saturation" readOnly={readOnly} suffix="%" value={draft.spo2} onChange={(value) => updateDraft("spo2", value)} />
                  <ReviewTextField label="O2 flow rate" readOnly={readOnly} value={draft.o2FlowRate} onChange={(value) => updateDraft("o2FlowRate", value)} />
                  <ReviewNumberField label="FiO2" readOnly={readOnly} suffix="%" value={draft.fio2} onChange={(value) => updateDraft("fio2", value)} />
                  <ReviewTextField label="Blood pressure" readOnly={readOnly} value={draft.bloodPressure} onChange={(value) => updateDraft("bloodPressure", value)} />
                  <ReviewSelectField label="Pulse rhythm" readOnly={readOnly} value={draft.pulseRhythm} options={["Regular", "Irregular", "Tachycardia", "Bradycardia", "Weak pulse"]} onChange={(value) => updateDraft("pulseRhythm", value)} />
                  <ReviewNumberField label="Pulse rate" readOnly={readOnly} suffix="/min" value={draft.pulseRate} onChange={(value) => updateDraft("pulseRate", value)} />
                  <ReviewNumberField label="Monitor heart rate" readOnly={readOnly} suffix="bpm" value={draft.monitorHeartRate} onChange={(value) => updateDraft("monitorHeartRate", value)} />
                  <ReviewTextField label="Temperature" readOnly={readOnly} value={draft.temperature} onChange={(value) => updateDraft("temperature", value)} />
                  <ReviewNumberField label="GCS score" readOnly={readOnly} suffix="" value={draft.gcsScore} onChange={(value) => updateDraft("gcsScore", value)} />
                  <ReviewNumberField label="Pain score" readOnly={readOnly} suffix="/10" value={draft.painScore} onChange={(value) => updateDraft("painScore", value)} />
                  <ReviewNumberField label="Urine output" readOnly={readOnly} suffix="ml/hr" value={draft.urineOutput} onChange={(value) => updateDraft("urineOutput", value)} />
                  <div className="rounded-md border border-border bg-surface-muted p-3">
                    <div className="text-[11px] font-medium uppercase text-muted-foreground">System status</div>
                    <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${riskBadgeClass(previewRisk)}`}>{previewRisk}</span>
                  </div>
                  <label className="space-y-1 text-sm sm:col-span-2 xl:col-span-3">
                    <span className="font-medium text-foreground">Review note</span>
                    <textarea
                      className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                      readOnly={readOnly}
                      value={draft.note}
                      onChange={(event) => updateDraft("note", event.target.value)}
                    />
                  </label>
                </div>
              )}
              <DialogFooter
                onCancel={() => onOpenChange(false)}
                primaryLabel={mode === "View" ? "Close" : mode === "Delete" ? "Delete record" : "Save review"}
                primaryVariant={mode === "Delete" ? "danger" : "default"}
                onPrimary={() => {
                  if (mode === "View") onOpenChange(false);
                  if (mode === "Edit") onUpdate(draft);
                  if (mode === "Delete") onDelete(record.id);
                }}
              />
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ReviewTextField({ label, value, onChange, readOnly, type = "text" }: { label: string; value: string; onChange?: (value: string) => void; readOnly?: boolean; type?: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <Input readOnly={readOnly} type={type} value={value} onChange={(event) => onChange?.(event.target.value)} />
    </label>
  );
}

function ReviewNumberField({ label, value, onChange, readOnly, suffix }: { label: string; value: number; onChange: (value: number) => void; readOnly?: boolean; suffix: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="flex rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/20">
        <input className="h-10 min-w-0 flex-1 rounded-l-md bg-transparent px-3 text-sm outline-none" inputMode="decimal" readOnly={readOnly} value={value} onChange={(event) => onChange(Number(event.target.value || 0))} />
        {suffix ? <span className="flex h-10 shrink-0 items-center rounded-r-md border-l border-border bg-surface-muted px-2 text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </label>
  );
}

function ReviewSelectField({ label, value, options, onChange, readOnly }: { label: string; value: string; options: string[]; onChange: (value: string) => void; readOnly?: boolean }) {
  if (readOnly) return <ReviewTextField label={label} readOnly value={value} />;
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

type VitalGraphMetric = {
  key: "pulse" | "spo2" | "respiratoryRate" | "gcs" | "urineOutput";
  label: string;
  unit: string;
  min: number;
  max: number;
  normalLow: number;
  normalHigh: number;
  stroke: string;
};

const vitalGraphMetrics: VitalGraphMetric[] = [
  { key: "pulse", label: "Pulse", unit: "/min", min: 50, max: 150, normalLow: 60, normalHigh: 100, stroke: "#dc2626" },
  { key: "spo2", label: "SpO2", unit: "%", min: 85, max: 100, normalLow: 95, normalHigh: 100, stroke: "#2563eb" },
  { key: "respiratoryRate", label: "Resp. rate", unit: "/min", min: 8, max: 40, normalLow: 12, normalHigh: 20, stroke: "#f59e0b" },
  { key: "gcs", label: "GCS", unit: "score", min: 3, max: 15, normalLow: 14, normalHigh: 15, stroke: "#7c3aed" },
  { key: "urineOutput", label: "Urine output", unit: "ml/hr", min: 0, max: 90, normalLow: 30, normalHigh: 90, stroke: "#16a34a" },
];

function IcuVitals24HourGraph({ data, patientName }: { data: IcuHourlyVital[]; patientName: string }) {
  const [activeMetric, setActiveMetric] = React.useState<"all" | VitalGraphMetric["key"]>("all");
  const visibleMetrics = activeMetric === "all" ? vitalGraphMetrics : vitalGraphMetrics.filter((metric) => metric.key === activeMetric);
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>24-hour Vital Line Graph</CardTitle>
            <CardDescription>{patientName} - no observations match selected date/time filter.</CardDescription>
          </div>
          <StatusPill tone="warning">No data</StatusPill>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
            Change date/time filter to view graph data.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>24-hour Vital Line Graph</CardTitle>
          <CardDescription>{patientName} - clinical trend with normal bands, hourly points, and shared time axis.</CardDescription>
        </div>
        <StatusPill tone="info">Proper graph</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
          <button
            className={cn("h-8 shrink-0 rounded px-3 text-xs font-medium transition", activeMetric === "all" ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            type="button"
            onClick={() => setActiveMetric("all")}
          >
            All trends
          </button>
          {vitalGraphMetrics.map((metric) => (
            <button
              className={cn("h-8 shrink-0 rounded px-3 text-xs font-medium transition", activeMetric === metric.key ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              key={metric.key}
              type="button"
              onClick={() => setActiveMetric(metric.key)}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {visibleMetrics.map((metric) => (
            <VitalLineChart key={metric.key} data={data} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VitalLineChart({ data, metric }: { data: IcuHourlyVital[]; metric: VitalGraphMetric }) {
  const width = 980;
  const height = 190;
  const left = 62;
  const right = 28;
  const top = 20;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const yFor = (value: number) => {
    const clamped = Math.max(metric.min, Math.min(metric.max, value));
    return top + (1 - (clamped - metric.min) / (metric.max - metric.min)) * plotHeight;
  };
  const xFor = (index: number) => left + (index / Math.max(1, data.length - 1)) * plotWidth;
  const points = data.map((entry, index) => ({ entry, x: xFor(index), y: yFor(entry[metric.key]) }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const normalTop = yFor(metric.normalHigh);
  const normalBottom = yFor(metric.normalLow);
  const latest = data.at(-1);
  const latestValue = latest?.[metric.key] ?? 0;
  const alertCount = data.filter((entry) => entry.risk === "Critical" || entry.risk === "High").length;
  const yTicks = [metric.max, Math.round((metric.max + metric.min) / 2), metric.min];
  const xTicks = data.filter((_, index) => index % 3 === 0 || index === data.length - 1);

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: metric.stroke }} />
          <div>
            <p className="text-sm font-semibold text-foreground">{metric.label}</p>
            <p className="text-xs text-muted-foreground">Normal {metric.normalLow}-{metric.normalHigh} {metric.unit}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={alertCount ? "danger" : "success"}>{alertCount} risk points</Badge>
          <StatusPill tone={latestValue < metric.normalLow || latestValue > metric.normalHigh ? "warning" : "success"}>Latest {latestValue} {metric.unit}</StatusPill>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg className="min-w-[920px]" role="img" viewBox={`0 0 ${width} ${height}`}>
          <title>{metric.label} 24-hour line graph</title>
          <rect fill="hsl(var(--surface-muted))" height={Math.max(1, normalBottom - normalTop)} rx="8" width={plotWidth} x={left} y={normalTop} />
          {yTicks.map((tick) => (
            <g key={tick}>
              <line stroke="hsl(var(--border))" strokeDasharray="4 4" x1={left} x2={width - right} y1={yFor(tick)} y2={yFor(tick)} />
              <text fill="hsl(var(--muted-foreground))" fontSize="11" textAnchor="end" x={left - 10} y={yFor(tick) + 4}>{tick}</text>
            </g>
          ))}
          {xTicks.map((entry, index) => (
            <g key={`${entry.hour}-${index}`}>
              <line stroke="hsl(var(--border))" strokeDasharray="2 6" x1={xFor(data.indexOf(entry))} x2={xFor(data.indexOf(entry))} y1={top} y2={height - bottom} />
              <text fill="hsl(var(--muted-foreground))" fontSize="10" textAnchor="middle" x={xFor(data.indexOf(entry))} y={height - 10}>{entry.hour}</text>
            </g>
          ))}
          <line stroke="hsl(var(--border))" x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} />
          <line stroke="hsl(var(--border))" x1={left} x2={left} y1={top} y2={height - bottom} />
          <path d={path} fill="none" stroke={metric.stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
          {points.map((point) => {
            const value = point.entry[metric.key];
            const outOfRange = value < metric.normalLow || value > metric.normalHigh;
            return (
              <g key={`${metric.key}-${point.entry.hour}`}>
                <circle cx={point.x} cy={point.y} fill={outOfRange ? "#dc2626" : "#ffffff"} r={outOfRange ? 5 : 4} stroke={metric.stroke} strokeWidth="2">
                  <title>{point.entry.hour}: {value} {metric.unit} | {point.entry.risk}</title>
                </circle>
                {outOfRange ? <text fill="#dc2626" fontSize="10" fontWeight="700" textAnchor="middle" x={point.x} y={point.y - 9}>!</text> : null}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded bg-surface-muted px-2 py-1">Shaded band = normal range</span>
        <span className="rounded bg-surface-muted px-2 py-1">Red points = outside normal range</span>
        <span className="rounded bg-surface-muted px-2 py-1">Hover point to see value</span>
      </div>
    </div>
  );
}

function IcuVitals24HourTable({ data }: { data: IcuHourlyVital[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>24-hour ICU Vitals Table</CardTitle>
          <CardDescription>Hourly nurse charting cells with abnormal values highlighted for quick review.</CardDescription>
        </div>
        <Button variant="outline" onClick={() => toast.success("24-hour ICU vitals table export queued")}>Export</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <RiskLegend />
        {!data.length ? (
          <div className="rounded-md border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
            No observation rows match selected date/time filter.
          </div>
        ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1680px] border-collapse text-xs">
            <thead className="bg-surface-muted uppercase text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-20 w-[180px] border-b border-r border-border bg-surface-muted px-3 py-2 text-left">Parameter</th>
                {data.map((entry) => (
                  <th className="border-b border-r border-border px-2 py-2 text-center" key={entry.hour}>
                    <div className="font-semibold">{entry.hour}</div>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${riskBadgeClass(riskToObservationRisk(entry.risk))}`}>
                      {entry.risk === "High" ? "High Risk" : entry.risk === "Watch" ? "Warning" : entry.risk === "Stable" ? "Normal" : entry.risk}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monitoringParameters.map((parameter) => (
                <tr className="border-b border-border last:border-0" key={parameter.key}>
                  <td className="sticky left-0 z-10 border-r border-border bg-background px-3 py-2">
                    <div className="font-medium text-foreground">{parameter.label}</div>
                    {parameter.unit ? <div className="text-[11px] text-muted-foreground">{parameter.unit}</div> : null}
                  </td>
                  {data.map((entry) => {
                    const value = String(entry[parameter.key] ?? "-");
                    return (
                      <td className={`border-r border-border px-2 py-2 text-center ${icuVitalCellClass(parameter.key, entry)}`} key={`${parameter.key}-${entry.hour}`}>
                        <button className="min-h-8 w-full rounded px-1 outline-none hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring" onClick={() => toast.info(`${parameter.label} ${entry.hour}: ${value}`)}>
                          {value}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

function buildIcuHourlyVitals(patient?: IcuPatient, observationDate = TODAY_DATE): IcuHourlyVital[] {
  const criticalBase = (patient?.criticalityScore ?? 7) >= 8;
  return icuMonitoringHours.map((hour, index) => {
    const earlyRisk = index <= 5 || (criticalBase && index >= 18);
    const improving = index > 9 && index < 18;
    const pulse = earlyRisk ? 126 - Math.min(index, 5) : improving ? 104 - (index % 3) : 112 + (index % 5);
    const spo2 = earlyRisk ? 90 + (index % 3) : improving ? 96 + (index % 2) : 94 + (index % 3);
    const respiratoryRate = earlyRisk ? 30 - (index % 2) : improving ? 22 : 24 + (index % 3);
    const gcs = earlyRisk ? 11 + (index % 2) : improving ? 14 : 13;
    const urineOutput = earlyRisk ? 22 + index : improving ? 45 + (index % 6) : 32 + (index % 5);
    const risk = spo2 < 92 || pulse > 120 || respiratoryRate > 28 || gcs < 12 || urineOutput < 30
      ? "Critical"
      : spo2 < 95 || pulse > 110 || respiratoryRate > 24 || urineOutput < 35
        ? "High"
        : spo2 < 97 || pulse > 100
          ? "Watch"
          : "Stable";
    return {
      date: observationDate,
      hour,
      temperature: Number((earlyRisk ? 38.4 - index * 0.03 : improving ? 37.2 : 37.6).toFixed(1)),
      pulse,
      bp: earlyRisk ? "90/58" : improving ? "112/72" : "104/68",
      respiratoryRate,
      spo2,
      oxygenFlow: earlyRisk ? "NIV 8 L" : improving ? "Mask 4 L" : "NC 2 L",
      gcs,
      urineOutput,
      painScore: earlyRisk ? 7 : improving ? 3 : 5,
      nurse: index % 2 === 0 ? "Kavita" : "Arjun",
      note: risk === "Critical" ? "Escalated" : risk === "High" ? "Repeat" : "Observed",
      risk,
    };
  });
}

function riskToObservationRisk(risk: IcuHourlyVital["risk"]): ObservationRisk {
  if (risk === "Critical") return "Critical";
  if (risk === "High") return "High Risk";
  if (risk === "Watch") return "Warning";
  return "Normal";
}

function icuVitalCellClass(key: keyof IcuHourlyVital, entry: IcuHourlyVital) {
  const critical = "bg-purple-100 font-semibold text-purple-900";
  const high = "bg-rose-100 font-semibold text-rose-900";
  const warning = "bg-yellow-100 font-semibold text-yellow-900";
  if (key === "spo2") return entry.spo2 < 90 ? critical : entry.spo2 < 92 ? high : entry.spo2 < 95 ? warning : "";
  if (key === "pulse") return entry.pulse > 130 ? critical : entry.pulse > 120 ? high : entry.pulse > 110 ? warning : "";
  if (key === "respiratoryRate") return entry.respiratoryRate > 32 ? critical : entry.respiratoryRate > 28 ? high : entry.respiratoryRate > 24 ? warning : "";
  if (key === "gcs") return entry.gcs <= 8 ? critical : entry.gcs < 12 ? high : entry.gcs < 14 ? warning : "";
  if (key === "urineOutput") return entry.urineOutput < 20 ? critical : entry.urineOutput < 30 ? high : entry.urineOutput < 35 ? warning : "";
  if (key === "risk") return entry.risk === "Critical" ? critical : entry.risk === "High" ? high : entry.risk === "Watch" ? warning : "";
  return "";
}

function VitalsTrend() {
  const data = icuVitals.map((row) => ({ id: row.id, time: row.time, pulse: row.pulse, spo2: row.spo2, rr: row.respiratoryRate }));
  const metrics = [
    { label: "Pulse", key: "pulse" as const, max: 150, color: "bg-danger" },
    { label: "SpO2", key: "spo2" as const, max: 100, color: "bg-info" },
    { label: "RR", key: "rr" as const, max: 40, color: "bg-warning" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitals Trend</CardTitle>
        <CardDescription>Pulse, SpO2, and respiratory rate.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div className="space-y-2" key={metric.key}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{metric.label}</span>
              <span className="text-muted-foreground">Latest {data.at(-1)?.[metric.key]}</span>
            </div>
            <div className="grid grid-cols-4 items-end gap-2 rounded-md border border-border bg-background p-3">
              {data.map((entry) => (
                <div className="flex h-28 flex-col items-center justify-end gap-1" key={`${metric.key}-${entry.id}-${entry.time}`}>
                  <span className="text-[11px] text-muted-foreground">{entry[metric.key]}</span>
                  <div
                    className={`w-full rounded-t ${metric.color}`}
                    style={{ height: `${Math.max(10, Math.min(100, (entry[metric.key] / metric.max) * 100))}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground">{entry.time}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function IntakeOutput() {
  return <IntakeOutputWorkspace />;
}

function IvFluids() {
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Infusion Date & Time Filter" compact />
      <GenericTable title="IV Fluid & Infusion Pumps" rows={infusionRows} />
    </div>
  );
}

function BloodTransfusion() {
  return (
    <div className="space-y-4">
      <AlertBanner icon={Droplets} tone="danger" title="Blood safety">Unit number, crossmatch, nurse verification, doctor acknowledgement, and reaction monitoring stay visible before completion.</AlertBanner>
      <DateTimeFilterPanel title="Transfusion Date & Time Filter" compact />
      <GenericTable title="Blood Transfusion Records" rows={transfusionRows} />
    </div>
  );
}

type DoctorRoundMode = "Admitting Doctor" | "Daily Round";
type DoctorRoundDecision = "Continue ICU care" | "Transfer to ward" | "Surgery review" | "Discharge planning" | "Goals-of-care discussion";

type DoctorRoundDraft = {
  doctor: string;
  roundType: string;
  provisionalDiagnosis: string;
  admissionAssessment: string;
  medicationReconciliation: string;
  devicePlan: string;
  initialOrders: string;
  consultPlan: string;
  codeStatus: string;
  problemList: string;
  respiratoryPlan: string;
  infectionPlan: string;
  hemodynamicPlan: string;
  renalFluidPlan: string;
  nutritionPlan: string;
  neuroPainPlan: string;
  medicationPlan: string;
  linesDevicePlan: string;
  nursingInstructions: string;
  pendingFollowUp: string;
  familyUpdate: string;
  decision: DoctorRoundDecision;
};

type DoctorRoundScenario = {
  id: string;
  title: string;
  detail: string;
  tone: StatusTone;
  blocking?: boolean;
};

type ClinicalTone = StatusTone | "purple";

const doctorRoundAdviceOptions: Partial<Record<keyof DoctorRoundDraft, string[]>> = {
  provisionalDiagnosis: [
    "Sepsis with acute respiratory distress under ICU observation.",
    "Post-operative ICU monitoring with hemodynamic and drain output review.",
    "Stroke observation with low GCS and aspiration risk.",
    "Shock state under evaluation with vasopressor/fluid response review.",
  ],
  admissionAssessment: [
    "Airway, breathing, circulation, disability, exposure, allergy, medication history, and initial stabilization reviewed.",
    "Patient received from ward with clinical deterioration; vitals, oxygen support, and escalation triggers reviewed.",
    "Post-procedure handover reviewed with pain, bleeding, drain, urine output, and hemodynamic status.",
    "Neurological status, GCS, pupils, seizure risk, airway protection, and imaging status reviewed.",
  ],
  medicationReconciliation: [
    "Home/current medicines reconciled; allergy, anticoagulant, insulin, sedative, and high-risk medicine status reviewed.",
    "Antibiotic history, allergy, duplicate antimicrobials, renal dose, and pharmacy availability reviewed.",
    "Continue essential medicines; hold non-essential or unsafe medicines until senior review.",
    "High-risk medicines require double verification and renal/hepatic dose review.",
  ],
  devicePlan: [
    "Monitor, oxygen device, IV access, Foley, infusion pump, lines, drains, and pressure-area care reviewed.",
    "Ventilator/NIV setup, suction, oral care, head elevation, and VAP prevention bundle to continue.",
    "Remove unnecessary lines/devices when stable; document daily device need.",
    "Foley/central line/drains to be reviewed each round with removal target.",
  ],
  initialOrders: [
    "Vitals as per ICU risk, strict I/O, ABG/labs, cultures if febrile, medication review, and escalation triggers.",
    "Sepsis bundle: cultures, antibiotics, lactate/ABG, fluid responsiveness, MAP target, strict I/O.",
    "Neuro observation, BP/glucose/temperature control, imaging follow-up, aspiration and seizure precautions.",
    "Post-op vitals, pain score, wound/drain/urine output, antibiotics, DVT prophylaxis, and surgical review.",
  ],
  consultPlan: [
    "Admitting consultant, duty doctor, and concerned specialty informed; review plan documented.",
    "Family counselled regarding current condition, ICU need, risks, and next review time.",
    "Consent status, prognosis discussion, and escalation plan to be documented.",
    "Specialty review requested based on source control, surgical, neuro, respiratory, or renal need.",
  ],
  problemList: [
    "Active ICU problems reviewed with diagnosis, organ support, current risk, and daily goals.",
    "Patient remains critically ill; continue ICU monitoring and reassess response to treatment.",
    "Patient clinically improving; review de-escalation and transfer readiness.",
    "New deterioration noted; review vitals, labs, medications, fluid balance, and escalation plan.",
  ],
  respiratoryPlan: [
    "Maintain oxygen target, review respiratory rate/SpO2 trend, ABG need, and de-escalate support if stable.",
    "Review ventilator settings, ABG, sedation target, suction, weaning readiness, and VAP bundle.",
    "Continue NIV/oxygen support with escalation trigger for increasing work of breathing or desaturation.",
    "Chest physiotherapy, nebulization/suction need, aspiration precautions, and imaging follow-up reviewed.",
  ],
  infectionPlan: [
    "Review fever trend, cultures, antibiotic day count, source control, renal dose, and de-escalation date.",
    "Continue antibiotics as per clinical status; reassess after culture/report availability.",
    "Escalate infection workup if fever, shock, WBC/CRP, or source-control concern persists.",
    "Infection prevention bundle, line/device care, and isolation need reviewed.",
  ],
  hemodynamicPlan: [
    "Maintain MAP/BP target, review rhythm, perfusion, fluid responsiveness, lactate, and vasopressor need.",
    "Continue vasopressor support with titration target and central/peripheral line safety review.",
    "Assess shock cause and response to fluids, antibiotics, transfusion, or inotrope/vasopressor support.",
    "Escalate if MAP below target, rising lactate, poor perfusion, or worsening urine output.",
  ],
  renalFluidPlan: [
    "Strict intake/output, urine output target, creatinine/electrolyte review, fluid balance goal, and renal dose adjustment.",
    "Low urine output: review perfusion, fluid responsiveness, diuretic need, nephrotoxic medicines, and nephrology trigger.",
    "Positive balance: review fluid restriction, diuretic plan, oxygenation, renal function, and daily weight if feasible.",
    "Continue hourly urine charting and escalate if urine output remains below target.",
  ],
  nutritionPlan: [
    "Review NPO/oral/NG status, feed tolerance, aspiration risk, glucose control, and dietician input.",
    "Continue enteral feeding as tolerated; monitor gastric residual/aspiration risk and bowel status.",
    "Hold or modify feeds if vomiting, aspiration concern, high residual, shock, or procedure requirement.",
    "Protein/calorie target, swallow status, and nutrition escalation plan reviewed.",
  ],
  neuroPainPlan: [
    "Review GCS, pupils, pain score, sedation goal, delirium risk, seizure precautions, and sleep/mobilization plan.",
    "Set sedation target and daily awakening/weaning readiness if ventilated.",
    "Escalate for GCS drop, new focal deficit, seizure, uncontrolled pain, or agitation.",
    "Continue neuro observation frequency and imaging/report follow-up.",
  ],
  medicationPlan: [
    "Continue/hold/stop medicines after duplicate, allergy, renal dose, high-risk, and pharmacy availability review.",
    "Switch IV to oral where stable and clinically appropriate.",
    "Review antibiotics, anticoagulation, insulin, sedatives, analgesics, vasopressors, and prophylaxis need.",
    "High-risk medicines require double verification and clear hold/escalation criteria.",
  ],
  linesDevicePlan: [
    "Review central line, peripheral IV, Foley, drains, oxygen device, ventilator circuit, and remove unnecessary devices.",
    "Line/device site checked for infection, blockage, leakage, dressing status, and documentation.",
    "Continue device only if clinically indicated; document removal target.",
    "Pressure area care, restraint need, pump labels, and device safety reviewed.",
  ],
  nursingInstructions: [
    "Vitals as per risk, strict I/O, medication timing, oxygen target, pressure care, and escalation triggers.",
    "Escalate immediately for SpO2 drop, MAP/BP below target, GCS fall, low urine output, fever, or new bleeding.",
    "Document hourly urine, drain output, infusions, medication administration, and pending report follow-up.",
    "Prepare handover with active problems, pending tasks, safety checks, and doctor instructions.",
  ],
  pendingFollowUp: [
    "Review pending labs, ABG, culture reports, radiology, medication changes, and consultant notes.",
    "Follow up pharmacy availability, high-risk medicine verification, transfusion/drain/line review, and I/O trend.",
    "Reassess transfer/discharge/surgery readiness after vitals, labs, and nursing checklist completion.",
    "Family update and consent documentation pending after senior review.",
  ],
  familyUpdate: [
    "Family updated regarding current condition, risk, treatment plan, and next review time.",
    "Family counselled about ICU need, organ support, prognosis, warning signs, and escalation plan.",
    "Consent status reviewed; questions addressed and counselling documented.",
    "Goals-of-care discussion required if clinical deterioration or poor prognosis persists.",
  ],
};

const doctorRoundDispositionAdviceOptions: Record<DoctorRoundDecision, Partial<Record<keyof DoctorRoundDraft, string[]>>> = {
  "Continue ICU care": {
    problemList: [
      "Active ICU problems reviewed; patient requires continued ICU monitoring and organ-support reassessment.",
      "Continue ICU care due to ongoing risk, pending stabilization, and need for close nursing/doctor review.",
      "Daily goals include stabilization, complication prevention, medication review, and readiness reassessment.",
    ],
    respiratoryPlan: [
      "Continue current oxygen/ventilator support with SpO2 target, ABG review, suction need, and escalation trigger.",
      "Maintain respiratory support and reassess weaning readiness during next round.",
      "Continue respiratory monitoring with chest physiotherapy, aspiration precautions, and imaging follow-up if needed.",
    ],
    infectionPlan: [
      "Continue infection monitoring with fever chart, cultures, antibiotic day count, source control, and de-escalation review.",
      "Maintain current antibiotic plan until culture/report and clinical response are reviewed.",
      "Escalate infection workup if fever, shock markers, WBC/CRP, or source-control concern persists.",
    ],
    hemodynamicPlan: [
      "Continue ICU hemodynamic monitoring with MAP/BP target, perfusion review, rhythm watch, and vasopressor/fluid reassessment.",
      "Maintain current BP support and reassess lactate, urine output, and fluid responsiveness.",
      "Escalate for MAP below target, worsening perfusion, rising lactate, or increasing vasopressor need.",
    ],
    renalFluidPlan: [
      "Continue strict intake/output, urine target, daily balance goal, creatinine/electrolyte review, and renal dose adjustment.",
      "Maintain hourly urine charting and reassess fluid restriction/replacement during next review.",
      "Review nephrotoxic medicines, diuretic need, and renal escalation trigger.",
    ],
    nutritionPlan: [
      "Continue ICU nutrition plan with feed tolerance, aspiration risk, glucose control, and dietician review.",
      "Maintain oral/NG/NPO plan and reassess tolerance each shift.",
      "Escalate nutrition plan if vomiting, high residual, aspiration risk, or poor intake persists.",
    ],
    neuroPainPlan: [
      "Continue GCS, pupils, pain, sedation, delirium, seizure, and mobilization review.",
      "Maintain sedation/pain target and reassess delirium prevention and sleep plan.",
      "Escalate for GCS fall, new deficit, seizure, agitation, or uncontrolled pain.",
    ],
    medicationPlan: [
      "Continue essential ICU medicines after allergy, duplicate, high-risk, renal dose, and pharmacy availability review.",
      "Review antibiotics, anticoagulation, insulin, sedatives, analgesics, prophylaxis, and vasopressors daily.",
      "Hold or stop non-essential medicines if risk exceeds benefit.",
    ],
    linesDevicePlan: [
      "Continue clinically required lines/devices and document daily need, site status, and removal target.",
      "Review Foley, central line, drains, oxygen device, ventilator circuit, and pressure-area care.",
      "Remove unnecessary devices once stable and document reason if continuing.",
    ],
    nursingInstructions: [
      "Continue ICU vitals, strict I/O, medication timing, oxygen target, pressure care, and escalation triggers.",
      "Report immediately for SpO2 drop, MAP/BP below target, GCS fall, low urine, fever, or new bleeding.",
      "Document pending reports, infusions, drains, medication administration, and handover risks.",
    ],
    pendingFollowUp: [
      "Follow pending labs, ABG, culture reports, radiology, medication changes, and consultant reviews.",
      "Reassess ICU need after vitals, labs, I/O trend, and nursing checklist completion.",
      "Review pharmacy, transfusion, drain, line, and high-risk medicine follow-up.",
    ],
    familyUpdate: [
      "Family updated that patient requires continued ICU care and close monitoring.",
      "Family counselled about current risks, treatment response, next review time, and escalation triggers.",
      "Consent and counselling documentation to be updated if condition changes.",
    ],
  },
  "Transfer to ward": {
    problemList: [
      "Patient reviewed for ICU-to-ward transfer readiness with active problems and handover needs.",
      "Clinical status stable enough for ward-level monitoring if transfer checklist is complete.",
      "Transfer plan requires ward bed, medication reconciliation, pending reports, and nursing handover.",
    ],
    respiratoryPlan: [
      "Oxygen requirement stable or weaned; ward oxygen target and escalation criteria documented.",
      "No immediate respiratory escalation need; continue ward respiratory monitoring.",
      "Chest physiotherapy/nebulization/oxygen plan to continue on ward if required.",
    ],
    infectionPlan: [
      "Antibiotic plan, day count, culture follow-up, and de-escalation date documented for ward team.",
      "Fever/culture monitoring to continue on ward with escalation criteria.",
      "Infection prevention and isolation requirements handed over.",
    ],
    hemodynamicPlan: [
      "Hemodynamically stable without ICU-only support; ward BP/rhythm monitoring plan documented.",
      "No vasopressor or ICU-level hemodynamic intervention required before transfer.",
      "Escalate from ward if BP, perfusion, rhythm, or urine output worsens.",
    ],
    renalFluidPlan: [
      "Fluid balance acceptable for ward transfer; I/O plan and urine escalation threshold documented.",
      "Renal function/electrolyte follow-up and fluid restriction/replacement plan handed over.",
      "Foley/urine monitoring need reviewed before transfer.",
    ],
    nutritionPlan: [
      "Diet/feed plan documented for ward with aspiration precautions if applicable.",
      "Oral/NG/NPO status and dietician follow-up handed over.",
      "Feed tolerance, glucose control, and bowel plan documented.",
    ],
    neuroPainPlan: [
      "Neuro/pain status stable for ward; observation frequency and escalation criteria documented.",
      "Pain control plan and delirium/fall precautions handed over.",
      "Escalate if GCS, pain, seizure risk, or agitation worsens.",
    ],
    medicationPlan: [
      "Ward medication plan reconciled; stop ICU-only infusions and convert IV to oral where appropriate.",
      "Antibiotics, anticoagulation, insulin, analgesia, and high-risk medicines handed over clearly.",
      "Pending pharmacy availability and next dose timings documented.",
    ],
    linesDevicePlan: [
      "Remove unnecessary ICU devices before transfer; document continuing Foley/drains/lines with care plan.",
      "Line/drain site status and removal target handed over to ward nurse.",
      "Transfer checklist to confirm device labels, dressings, and safety status.",
    ],
    nursingInstructions: [
      "Prepare ward handover with active problems, medication timing, I/O plan, pending reports, and escalation triggers.",
      "Complete transfer checklist, family update, belongings, and transport safety.",
      "Ensure ward nurse receives device, medication, diet, and warning-sign instructions.",
    ],
    pendingFollowUp: [
      "Ward bed, transfer checklist, pending reports, medication reconciliation, and family update to be completed.",
      "Consultant/ward team handover and follow-up review time documented.",
      "Billing/pharmacy/transport readiness and nursing handover pending if not completed.",
    ],
    familyUpdate: [
      "Family updated about transfer readiness, ward plan, monitoring needs, and warning signs.",
      "Family informed about ward location, expected care plan, and when to call staff urgently.",
      "Transfer decision and pending checklist explained to family.",
    ],
  },
  "Surgery review": {
    problemList: [
      "Surgical review required for current ICU issue, source control, bleeding, drain, wound, abdomen, or procedure decision.",
      "Patient remains under ICU care pending surgeon assessment and operative/non-operative plan.",
      "Surgery team to review indication, risk, timing, consent, and optimization requirements.",
    ],
    respiratoryPlan: [
      "Optimize oxygenation/ventilation before surgical review; document anesthesia/airway risk if procedure likely.",
      "ABG/chest status and ventilator/oxygen support to be shared with surgery/anesthesia team.",
      "Escalate respiratory support if clinical status worsens before surgical decision.",
    ],
    infectionPlan: [
      "Review source control need, cultures, antibiotics, fever trend, and surgical site/wound status.",
      "Continue antibiotics while awaiting surgical opinion and de-escalate after source-control plan.",
      "Escalate if sepsis markers, wound infection, drain output, or abdominal signs worsen.",
    ],
    hemodynamicPlan: [
      "Optimize hemodynamics for possible procedure; review MAP target, transfusion need, vasopressor support, and bleeding risk.",
      "Monitor perfusion, lactate, rhythm, and fluid responsiveness pending surgery decision.",
      "Escalate for shock, active bleeding, or increasing vasopressor requirement.",
    ],
    renalFluidPlan: [
      "Maintain strict I/O and renal optimization before surgery; review creatinine, electrolytes, and fluid balance.",
      "Document urine target, fluid plan, and renal dose adjustment for perioperative safety.",
      "Correct electrolyte/fluid concerns before procedure if clinically feasible.",
    ],
    nutritionPlan: [
      "Keep NPO if surgery/procedure likely; document feed hold time and aspiration precautions.",
      "Review nutrition plan after surgery team decision.",
      "Maintain glucose control and bowel/NG status as per surgical plan.",
    ],
    neuroPainPlan: [
      "Review pain score, sedation need, consent capacity, delirium risk, and perioperative analgesia plan.",
      "Escalate uncontrolled pain, altered sensorium, or neurological deterioration.",
      "Document neuro baseline before procedure if relevant.",
    ],
    medicationPlan: [
      "Review antibiotics, anticoagulants, antiplatelets, insulin, sedatives, analgesics, and perioperative holds.",
      "Hold/continue medicines as per surgery/anesthesia risk after consultant decision.",
      "Ensure high-risk medicines and blood products are reviewed before procedure.",
    ],
    linesDevicePlan: [
      "Review IV/central access, Foley, drains, wound, NG tube, and blood availability for surgical readiness.",
      "Document drain/wound output and device status for surgeon.",
      "Ensure line labels, pump safety, and transport readiness if procedure planned.",
    ],
    nursingInstructions: [
      "Keep patient prepared for surgical review: NPO status, consent, vitals, labs, imaging, blood availability, and transport readiness.",
      "Monitor pain, bleeding, drain output, urine, vitals, and sepsis/shock markers closely.",
      "Inform doctor urgently for worsening pain, bleeding, shock, fever, or drain change.",
    ],
    pendingFollowUp: [
      "Surgical opinion, anesthesia review, consent, imaging, labs, blood availability, and procedure timing pending.",
      "Follow source control decision, operative risk, and post-review orders.",
      "Family counselling required after surgery team plan.",
    ],
    familyUpdate: [
      "Family informed that surgery/procedure review is required and decision is pending.",
      "Counselling to include indication, risk, alternatives, consent, and expected ICU course.",
      "Family update to be repeated after surgeon/anesthesia review.",
    ],
  },
  "Discharge planning": {
    problemList: [
      "Patient reviewed for discharge planning from ICU/hospital with active issues and clearance requirements.",
      "Clinical status improving; discharge checklist, medication reconciliation, and follow-up planning to start.",
      "Discharge readiness depends on stable vitals, completed investigations, education, and clear follow-up plan.",
    ],
    respiratoryPlan: [
      "Respiratory status stable; document oxygen/inhaler/nebulization plan and warning signs for discharge.",
      "No ICU respiratory support required; continue home/ward respiratory advice if needed.",
      "Explain breathing difficulty, low SpO2, fever, or chest pain warning signs.",
    ],
    infectionPlan: [
      "Antibiotic duration, culture follow-up, fever warning signs, and infection prevention advice documented.",
      "Switch IV antibiotics to oral where appropriate and document stop/review date.",
      "Advise return if fever, worsening wound, breathlessness, or sepsis warning signs occur.",
    ],
    hemodynamicPlan: [
      "Hemodynamics stable; document BP/heart rate medicines, monitoring advice, and warning signs.",
      "No ICU vasopressor/hemodynamic support required before discharge planning.",
      "Follow-up BP/rhythm review and emergency signs documented.",
    ],
    renalFluidPlan: [
      "Fluid intake advice, urine warning signs, renal function follow-up, and medicine dose instructions documented.",
      "Review creatinine/electrolytes before discharge if renal concern persists.",
      "Advise return for low urine, swelling, breathlessness, vomiting, or poor intake.",
    ],
    nutritionPlan: [
      "Diet advice, feed plan, aspiration precautions, glucose control, and nutrition follow-up documented.",
      "Oral/NG/diet plan explained to patient/family.",
      "Return if vomiting, poor intake, aspiration symptoms, or dehydration signs occur.",
    ],
    neuroPainPlan: [
      "Pain control, neuro warning signs, seizure/fall precautions, and activity advice documented.",
      "Explain emergency return signs: confusion, weakness, seizure, severe headache, uncontrolled pain.",
      "Follow-up neuro/pain review planned if required.",
    ],
    medicationPlan: [
      "Discharge medication reconciliation started; continue/stop list, dose timing, side effects, and follow-up documented.",
      "Convert IV to oral where appropriate and stop ICU-only medicines.",
      "Patient/family education for high-risk medicines and warning signs documented.",
    ],
    linesDevicePlan: [
      "Remove unnecessary lines/devices before discharge; document wound/drain/Foley care if continuing.",
      "Device care instructions and removal/follow-up date documented.",
      "Pressure area/wound/drain status reviewed before discharge.",
    ],
    nursingInstructions: [
      "Start discharge checklist: education, medicines, follow-up, warning signs, diet/activity advice, and documentation.",
      "Ensure family understands medication timing, device/wound care, follow-up date, and emergency return signs.",
      "Complete discharge summary inputs and pending clearances.",
    ],
    pendingFollowUp: [
      "Discharge summary, pharmacy, billing, reports, follow-up appointment, patient education, and final consultant clearance pending.",
      "Pending labs/radiology and medication reconciliation to be completed before discharge.",
      "Family counselling and printed advice required before final discharge.",
    ],
    familyUpdate: [
      "Family counselled about discharge plan, medicines, diet/activity advice, follow-up, and warning signs.",
      "Family informed discharge is planned after checklist and clearances.",
      "Questions answered and discharge education documented.",
    ],
  },
  "Goals-of-care discussion": {
    problemList: [
      "Goals-of-care discussion required due to prognosis, deterioration, treatment burden, or family decision need.",
      "Clinical status and prognosis reviewed; senior doctor/family meeting to guide treatment direction.",
      "Continue ICU care while goals, escalation limits, and shared decision plan are clarified.",
    ],
    respiratoryPlan: [
      "Explain oxygen/ventilator status, likelihood of recovery, escalation options, and comfort-focused alternatives if applicable.",
      "Respiratory support plan to align with documented goals of care.",
      "Clarify escalation limits for NIV/intubation/ventilation if clinically relevant.",
    ],
    infectionPlan: [
      "Explain infection severity, antibiotic/source-control options, expected benefit, and treatment burden.",
      "Antibiotic plan to align with agreed goals and prognosis.",
      "Document infection-related risks and expected course for family discussion.",
    ],
    hemodynamicPlan: [
      "Explain BP/vasopressor support, shock severity, expected response, and escalation limits.",
      "Hemodynamic support plan to align with family discussion and senior decision.",
      "Clarify CPR/vasopressor/intensive support preferences if appropriate.",
    ],
    renalFluidPlan: [
      "Explain kidney/fluid status, urine output, dialysis possibility, benefits, risks, and treatment burden.",
      "Renal/fluid plan to align with goals-of-care decision.",
      "Document dialysis/escalation discussion if clinically relevant.",
    ],
    nutritionPlan: [
      "Discuss nutrition/feeding route, aspiration risk, comfort, and expected benefit.",
      "Nutrition plan to align with clinical goals and patient/family preference.",
      "Review NG/oral/comfort feeding decision if prognosis is poor.",
    ],
    neuroPainPlan: [
      "Explain consciousness, pain, sedation, delirium, prognosis, comfort, and symptom-control priorities.",
      "Pain/sedation plan to prioritize comfort and documented care goals.",
      "Clarify neuro prognosis and expected recovery uncertainty with family.",
    ],
    medicationPlan: [
      "Review medicines for goal-concordant care: continue beneficial medicines, stop burdensome non-essential medicines.",
      "High-risk/escalation medicines to align with agreed plan.",
      "Document comfort medicines and symptom-control plan if needed.",
    ],
    linesDevicePlan: [
      "Review lines/devices for benefit versus burden and remove non-beneficial devices where appropriate.",
      "Device plan to align with comfort, monitoring needs, and agreed escalation limits.",
      "Document device continuation/removal rationale.",
    ],
    nursingInstructions: [
      "Arrange family meeting, document attendees, questions, decisions, escalation limits, and next review time.",
      "Continue comfort, dignity, pain control, communication, and agreed monitoring plan.",
      "Escalate to senior doctor for family questions, deterioration, or change in agreed goals.",
    ],
    pendingFollowUp: [
      "Senior consultant review, family meeting, consent/goals documentation, and code-status clarification pending.",
      "Follow palliative/ethics/social support referral if required.",
      "Document final agreed treatment limits and next communication plan.",
    ],
    familyUpdate: [
      "Family counselled regarding prognosis, current treatment, options, risks, benefits, and goals of care.",
      "Goals-of-care discussion documented with attendees, questions, agreed plan, and next review time.",
      "Code status/escalation limits to be clarified and documented after senior discussion.",
    ],
  },
};

function DoctorRounds() {
  const [mode, setMode] = React.useState<DoctorRoundMode>("Daily Round");
  const [patientId, setPatientId] = React.useState(icuPatients[0]?.id ?? "");
  const selectedPatient = icuPatients.find((patient) => patient.id === patientId) ?? icuPatients[0];
  const [draft, setDraft] = React.useState<DoctorRoundDraft>(() => createDefaultDoctorRoundDraft(selectedPatient));
  const [savedRounds, setSavedRounds] = React.useState<Array<{ id: string; mode: DoctorRoundMode; patient: string; decision: string; summary: string; time: string }>>([]);

  const latestVital = [...icuVitals].reverse().find((vital) => vital.patientId === selectedPatient?.id);
  const patientAlerts = icuAlerts.filter((alert) => alert.patientId === selectedPatient?.id);
  const patientMeds = medicationRows.filter((row) => row.patientId === selectedPatient?.id);
  const patientInfusions = infusionRows.filter((row) => row.patientId === selectedPatient?.id);
  const patientTasks = icuTasks.filter((task) => task.patientId === selectedPatient?.id);
  const fluidBalance = intakeOutputRows.filter((row) => row.patientId === selectedPatient?.id).reduce((sum, row) => sum + row.balanceMl, 0);
  const roundScenarios = buildDoctorRoundScenarios({ mode, patient: selectedPatient, draft, latestVital, alerts: patientAlerts, meds: patientMeds, infusions: patientInfusions, tasks: patientTasks, fluidBalance });
  const blockingCount = roundScenarios.filter((scenario) => scenario.blocking).length;
  const generatedGoals = buildDoctorRoundGoals(draft, selectedPatient);

  const updateDraft = (key: keyof DoctorRoundDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const selectPatient = (nextPatientId: string) => {
    const nextPatient = icuPatients.find((patient) => patient.id === nextPatientId) ?? selectedPatient;
    setPatientId(nextPatientId);
    setDraft(createDefaultDoctorRoundDraft(nextPatient));
  };

  const saveRound = () => {
    if (!selectedPatient) return;
    if (blockingCount) {
      toast.error("Resolve mandatory round checks before signing.");
      return;
    }
    const summary = mode === "Admitting Doctor"
      ? `${draft.provisionalDiagnosis}. ${draft.initialOrders}`
      : `${draft.problemList}. Decision: ${draft.decision}`;
    setSavedRounds((rows) => [
      { id: `round-${Date.now()}`, mode, patient: `${selectedPatient.bedNo} - ${selectedPatient.patientName}`, decision: draft.decision, summary, time: "Now" },
      ...rows,
    ]);
    toast.success(`${mode} signed for ${selectedPatient.patientName}`);
  };

  const createNurseInstruction = () => {
    toast.success(`Nurse instruction generated for ${selectedPatient?.bedNo}`);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-sky-200 bg-white shadow-sm">
        <div className="border-l-4 border-sky-600 bg-sky-50 px-4 py-3">
          <div className="grid gap-4 2xl:grid-cols-[minmax(250px,0.75fr)_minmax(0,1.4fr)_250px] 2xl:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-800">ICU patient</span>
              <select className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-sky-200" value={patientId} onChange={(event) => selectPatient(event.target.value)}>
                {icuPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>)}
              </select>
            </label>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-800">Round mode</span>
                <HospitalColourLegend />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["Admitting Doctor", "Daily Round"] as const).map((item) => (
                  <button
                    className={cn(
                      "flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition",
                      mode === item ? "border-sky-600 bg-sky-600 text-white shadow-sm" : "border-slate-300 bg-white text-slate-700 hover:border-sky-400 hover:bg-sky-50",
                    )}
                    key={item}
                    type="button"
                    onClick={() => setMode(item)}
                  >
                    {item === "Admitting Doctor" ? <Stethoscope className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <label className="space-y-1 text-sm">
              <span className="font-semibold text-slate-800">Doctor</span>
              <select className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-sky-200" value={draft.doctor} onChange={(event) => updateDraft("doctor", event.target.value)}>
                {["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma", selectedPatient?.admittingDoctor ?? "Admitting doctor"].map((doctor) => <option key={doctor}>{doctor}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <RoundContextTile label="Clinical status" value={selectedPatient?.currentStatus ?? "-"} tone={toneForStatus(selectedPatient?.currentStatus ?? "Info")} />
          <RoundContextTile label="Respiratory support" value={selectedPatient?.ventilatorStatus ?? "-"} tone={selectedPatient?.ventilatorStatus === "Room air" ? "success" : "warning"} />
          <RoundContextTile label="Latest vitals" value={latestVital ? `SpO2 ${latestVital.spo2}% | BP ${latestVital.bp}` : "No chart"} tone={latestVital?.abnormal ? "danger" : "success"} />
          <RoundContextTile label="Open alerts" value={`${patientAlerts.filter((alert) => alert.status !== "Resolved").length}`} tone={patientAlerts.some((alert) => alert.severity === "Critical" && alert.status !== "Resolved") ? "critical" : "info"} />
        </div>
      </div>

      <DoctorRoundQueuePanel activePatientId={patientId} mode={mode} onSelectPatient={selectPatient} />

      <section className="space-y-4">
          {mode === "Admitting Doctor" ? (
            <AdmittingDoctorWorkspace draft={draft} selectedPatient={selectedPatient} updateDraft={updateDraft} />
          ) : (
            <DailyRoundWorkspace draft={draft} selectedPatient={selectedPatient} updateDraft={updateDraft} />
          )}

          <div className="rounded-md border border-sky-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Round outputs</p>
                <p className="mt-1 text-xs text-slate-500">Goals, orders, nursing instructions, medication changes, and disposition.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={createNurseInstruction}><FileText className="h-4 w-4" />Create instruction</Button>
                <Button disabled={Boolean(blockingCount)} onClick={saveRound}><ClipboardCheck className="h-4 w-4" />Sign round</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {generatedGoals.map((goal) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={goal.title}>
                  <p className="text-xs font-bold uppercase text-slate-500">{goal.title}</p>
                  <p className="mt-1 text-sm text-slate-900">{goal.detail}</p>
                </div>
              ))}
            </div>
          </div>
      </section>

      <section className="space-y-4">
          <DoctorRoundScenarioPanel scenarios={roundScenarios} />
          <DoctorRoundClinicalPanel latestVital={latestVital} meds={patientMeds} infusions={patientInfusions} fluidBalance={fluidBalance} tasks={patientTasks} />
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Signed rounds</p>
                <p className="mt-1 text-xs text-slate-500">Session notes created from this screen.</p>
              </div>
              <Badge tone="info">{savedRounds.length}</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {savedRounds.map((round) => (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3" key={round.id}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-emerald-950">{round.patient}</p>
                    <span className="rounded-full border border-emerald-300 bg-white px-2 py-0.5 text-xs font-bold text-emerald-700">{round.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">{round.mode} | {round.decision}</p>
                  <p className="mt-2 text-xs text-emerald-900">{round.summary}</p>
                </div>
              ))}
              {!savedRounds.length ? <EmptyWorkflowState title="No signed round yet" detail="Complete mandatory checks and sign the round." /> : null}
            </div>
          </div>
      </section>
    </div>
  );
}

function AdmittingDoctorWorkspace({ draft, selectedPatient, updateDraft }: { draft: DoctorRoundDraft; selectedPatient?: IcuPatient; updateDraft: (key: keyof DoctorRoundDraft, value: string) => void }) {
  return (
    <div className="rounded-md border border-sky-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sky-100 pb-4">
        <div>
          <p className="text-base font-bold text-slate-950">Admitting doctor assessment</p>
          <p className="mt-1 text-sm text-slate-500">{selectedPatient?.admissionSource} admission | {selectedPatient?.admissionTime}</p>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", clinicalTonePillClass(toneForStatus(selectedPatient?.currentStatus ?? "Info")))}>{selectedPatient?.currentStatus ?? "Review"}</span>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <RoundTextField label="Round type" value={draft.roundType} onChange={(value) => updateDraft("roundType", value)} tone="info" />
        <RoundTextField label="Code status" value={draft.codeStatus} onChange={(value) => updateDraft("codeStatus", value)} tone="critical" />
        <RoundTextArea label="Provisional diagnosis" value={draft.provisionalDiagnosis} suggestions={getDoctorRoundAdviceOptions("provisionalDiagnosis")} onChange={(value) => updateDraft("provisionalDiagnosis", value)} tone="info" />
        <RoundTextArea label="Initial condition / assessment" value={draft.admissionAssessment} suggestions={getDoctorRoundAdviceOptions("admissionAssessment")} onChange={(value) => updateDraft("admissionAssessment", value)} tone="warning" />
        <RoundTextArea label="Medication reconciliation" value={draft.medicationReconciliation} suggestions={getDoctorRoundAdviceOptions("medicationReconciliation")} onChange={(value) => updateDraft("medicationReconciliation", value)} tone="danger" />
        <RoundTextArea label="Device / bed plan" value={draft.devicePlan} suggestions={getDoctorRoundAdviceOptions("devicePlan")} onChange={(value) => updateDraft("devicePlan", value)} tone="purple" />
        <RoundTextArea label="Initial orders" value={draft.initialOrders} suggestions={getDoctorRoundAdviceOptions("initialOrders")} onChange={(value) => updateDraft("initialOrders", value)} tone="info" />
        <RoundTextArea label="Consults / family counselling" value={draft.consultPlan} suggestions={getDoctorRoundAdviceOptions("consultPlan")} onChange={(value) => updateDraft("consultPlan", value)} tone="success" />
      </div>
    </div>
  );
}

function DailyRoundWorkspace({ draft, selectedPatient, updateDraft }: { draft: DoctorRoundDraft; selectedPatient?: IcuPatient; updateDraft: (key: keyof DoctorRoundDraft, value: string) => void }) {
  return (
    <div className="rounded-md border border-sky-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-sky-100 pb-4">
        <div>
          <p className="text-base font-bold text-slate-950">Daily ICU round workspace</p>
          <p className="mt-1 text-sm text-slate-500">{selectedPatient?.bedNo} | ICU day review, system-wise plan, and decision.</p>
        </div>
        <label className="min-w-[230px] space-y-1 text-sm">
          <span className="font-semibold text-slate-800">Disposition decision</span>
          <select className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-sky-200" value={draft.decision} onChange={(event) => updateDraft("decision", event.target.value)}>
            {["Continue ICU care", "Transfer to ward", "Surgery review", "Discharge planning", "Goals-of-care discussion"].map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <RoundTextArea label="Problem list / assessment" value={draft.problemList} suggestions={getDoctorRoundAdviceOptions("problemList", draft.decision)} onChange={(value) => updateDraft("problemList", value)} tone="info" />
        <RoundTextArea label="Respiratory / ventilator plan" value={draft.respiratoryPlan} suggestions={getDoctorRoundAdviceOptions("respiratoryPlan", draft.decision)} onChange={(value) => updateDraft("respiratoryPlan", value)} tone="purple" />
        <RoundTextArea label="Infection / antibiotic plan" value={draft.infectionPlan} suggestions={getDoctorRoundAdviceOptions("infectionPlan", draft.decision)} onChange={(value) => updateDraft("infectionPlan", value)} tone="warning" />
        <RoundTextArea label="Hemodynamic plan" value={draft.hemodynamicPlan} suggestions={getDoctorRoundAdviceOptions("hemodynamicPlan", draft.decision)} onChange={(value) => updateDraft("hemodynamicPlan", value)} tone="critical" />
        <RoundTextArea label="Renal / fluid plan" value={draft.renalFluidPlan} suggestions={getDoctorRoundAdviceOptions("renalFluidPlan", draft.decision)} onChange={(value) => updateDraft("renalFluidPlan", value)} tone="info" />
        <RoundTextArea label="Nutrition plan" value={draft.nutritionPlan} suggestions={getDoctorRoundAdviceOptions("nutritionPlan", draft.decision)} onChange={(value) => updateDraft("nutritionPlan", value)} tone="success" />
        <RoundTextArea label="Neuro / pain / sedation" value={draft.neuroPainPlan} suggestions={getDoctorRoundAdviceOptions("neuroPainPlan", draft.decision)} onChange={(value) => updateDraft("neuroPainPlan", value)} tone="purple" />
        <RoundTextArea label="Medication review" value={draft.medicationPlan} suggestions={getDoctorRoundAdviceOptions("medicationPlan", draft.decision)} onChange={(value) => updateDraft("medicationPlan", value)} tone="danger" />
        <RoundTextArea label="Lines / devices" value={draft.linesDevicePlan} suggestions={getDoctorRoundAdviceOptions("linesDevicePlan", draft.decision)} onChange={(value) => updateDraft("linesDevicePlan", value)} tone="warning" />
        <RoundTextArea label="Nursing instructions" value={draft.nursingInstructions} suggestions={getDoctorRoundAdviceOptions("nursingInstructions", draft.decision)} onChange={(value) => updateDraft("nursingInstructions", value)} tone="info" />
        <RoundTextArea label="Pending follow-up" value={draft.pendingFollowUp} suggestions={getDoctorRoundAdviceOptions("pendingFollowUp", draft.decision)} onChange={(value) => updateDraft("pendingFollowUp", value)} tone="warning" />
        <RoundTextArea label="Family update" value={draft.familyUpdate} suggestions={getDoctorRoundAdviceOptions("familyUpdate", draft.decision)} onChange={(value) => updateDraft("familyUpdate", value)} tone="success" />
      </div>
    </div>
  );
}

function createDefaultDoctorRoundDraft(patient?: IcuPatient): DoctorRoundDraft {
  const ventilated = patient?.ventilatorStatus !== "Room air";
  const critical = (patient?.criticalityScore ?? 0) >= 8;
  return {
    doctor: patient?.admittingDoctor ?? "Dr. Sameer Mehta",
    roundType: "Daily ICU consultant round",
    provisionalDiagnosis: patient?.diagnosis ?? "ICU diagnosis under review",
    admissionAssessment: `${patient?.currentStatus ?? "ICU"} patient admitted from ${patient?.admissionSource ?? "source"}. Confirm airway, breathing, circulation, disability, exposure, allergy, and medication history.`,
    medicationReconciliation: "Home/current medicines reviewed. Allergy and high-risk medicine checks pending final confirmation.",
    devicePlan: ventilated ? `Continue ${patient?.ventilatorStatus}. Verify monitor, oxygen/ventilator, infusion pump, Foley/lines, and removal need.` : "Monitor mapped. Oxygen/line/device need to be reviewed and de-escalated if possible.",
    initialOrders: critical ? "Vitals 15 min until stable, ABG/labs review, sepsis/critical care bundle, strict I/O, medication reconciliation." : "Vitals as per ICU protocol, labs review, medication reconciliation, nursing observation, discharge/transfer readiness review.",
    consultPlan: "Consulting doctor and duty doctor informed. Family counselling and consent status to be documented.",
    codeStatus: "Full code",
    problemList: patient?.diagnosis ?? "Active ICU problems",
    respiratoryPlan: ventilated ? `Review ${patient?.ventilatorStatus}, ABG, weaning readiness, sedation target, suction, and VAP bundle.` : "Maintain oxygen target, review respiratory rate/SpO2 trend, and de-escalate oxygen if stable.",
    infectionPlan: patient?.diagnosis.toLowerCase().includes("septic") ? "Review culture status, antibiotic day count, fever trend, source control, and de-escalation plan." : "Review fever trend, culture/lab status, antibiotic need, and infection prevention.",
    hemodynamicPlan: critical ? "MAP target > 65, fluid responsiveness, vasopressor need, lactate/urine output follow-up." : "Maintain BP target, review rhythm, perfusion, and escalation triggers.",
    renalFluidPlan: "Strict intake/output, urine output target, electrolyte/creatinine review, renal dose adjustment if needed.",
    nutritionPlan: "Review NPO/NG/oral status, feed tolerance, aspiration risk, and dietician input.",
    neuroPainPlan: "GCS/pupil trend, pain score, sedation goal, delirium prevention, and seizure precautions if indicated.",
    medicationPlan: "Continue/hold/stop medicines, check duplicate/high-risk medicines, renal dose, allergy, and pharmacy availability.",
    linesDevicePlan: "Review central line/Foley/ventilator/drains daily and remove unnecessary devices.",
    nursingInstructions: "Vitals as per risk, strict I/O, medication timing, escalation for SpO2/BP/GCS/urine output worsening.",
    pendingFollowUp: "Pending labs/radiology, consultant review, medication changes, family update, and transfer/discharge readiness.",
    familyUpdate: "Family updated about current condition, risks, and plan. Consent/review pending if condition changes.",
    decision: patient?.currentStatus === "Ready for transfer" ? "Transfer to ward" : "Continue ICU care",
  };
}

function buildDoctorRoundScenarios({
  mode,
  patient,
  draft,
  latestVital,
  alerts,
  meds,
  infusions,
  tasks,
  fluidBalance,
}: {
  mode: DoctorRoundMode;
  patient?: IcuPatient;
  draft: DoctorRoundDraft;
  latestVital?: (typeof icuVitals)[number];
  alerts: typeof icuAlerts;
  meds: typeof medicationRows;
  infusions: typeof infusionRows;
  tasks: typeof icuTasks;
  fluidBalance: number;
}): DoctorRoundScenario[] {
  const scenarios: DoctorRoundScenario[] = [];
  const openCriticalAlerts = alerts.filter((alert) => alert.status !== "Resolved" && alert.severity === "Critical");
  const dueMeds = meds.filter((med) => med.status === "Due" || med.status === "Late");
  const overdueTasks = tasks.filter((task) => task.status === "Overdue");
  const ventilated = patient?.ventilatorStatus !== "Room air";

  scenarios.push({
    id: "identity-context",
    title: patient ? `${patient.bedNo} patient selected` : "Patient missing",
    detail: patient ? `${patient.patientName}, ${patient.ageGender}, ${patient.diagnosis}.` : "Select a patient before signing a round.",
    tone: patient ? "info" : "danger",
    blocking: !patient,
  });

  if (mode === "Admitting Doctor") {
    scenarios.push({
      id: "admission-checklist",
      title: "Admission checklist",
      detail: "Diagnosis, allergy, medication reconciliation, initial orders, device mapping, code status, and family counselling must be captured.",
      tone: draft.medicationReconciliation && draft.initialOrders && draft.familyUpdate ? "success" : "warning",
      blocking: !draft.medicationReconciliation || !draft.initialOrders,
    });
  }

  if ((patient?.criticalityScore ?? 0) >= 8 || openCriticalAlerts.length) {
    scenarios.push({
      id: "critical-deterioration",
      title: "Critical deterioration watch",
      detail: `${openCriticalAlerts.length} critical alerts. Review vitals trend, sepsis/shock plan, escalation trigger, and duty doctor communication.`,
      tone: "critical",
    });
  }

  if (latestVital?.abnormal || (latestVital?.spo2 ?? 100) < 94 || (latestVital?.pulse ?? 0) > 120 || (latestVital?.urineOutput ?? 99) < 30) {
    scenarios.push({
      id: "vitals-risk",
      title: "Abnormal latest vitals",
      detail: latestVital ? `SpO2 ${latestVital.spo2}%, pulse ${latestVital.pulse}, BP ${latestVital.bp}, urine ${latestVital.urineOutput} ml/hr.` : "No latest vitals available.",
      tone: "danger",
    });
  }

  if (ventilated) {
    scenarios.push({
      id: "ventilator-bundle",
      title: "Ventilator / oxygen bundle",
      detail: "Review ABG, sedation goal, weaning readiness, suction, oral care, head elevation, and VAP prevention.",
      tone: "warning",
    });
  }

  if (patient?.diagnosis.toLowerCase().includes("septic") || draft.infectionPlan.toLowerCase().includes("antibiotic")) {
    scenarios.push({
      id: "infection-sepsis",
      title: "Sepsis / infection review",
      detail: "Capture culture status, antibiotic day count, fever trend, source control, and de-escalation date.",
      tone: "warning",
    });
  }

  if (dueMeds.length) {
    scenarios.push({
      id: "medication-review",
      title: "Medication action pending",
      detail: `${dueMeds.length} due/late medication rows. Review continue, hold, stop, duplicate, high-risk, renal dose, and pharmacy availability.`,
      tone: "danger",
    });
  }

  if (infusions.some((infusion) => infusion.status === "Running")) {
    scenarios.push({
      id: "infusion-review",
      title: "Running infusion review",
      detail: `${infusions.filter((infusion) => infusion.status === "Running").length} infusion(s) running. Confirm pump, rate, balance, and stop/titration target.`,
      tone: "warning",
    });
  }

  if (fluidBalance > 400 || (latestVital?.urineOutput ?? 99) < 30) {
    scenarios.push({
      id: "renal-fluid",
      title: "Renal / fluid balance risk",
      detail: `Current visible balance ${fluidBalance} ml. Review urine target, creatinine, diuretic/fluids, and renal dose adjustment.`,
      tone: "warning",
    });
  }

  if (overdueTasks.length) {
    scenarios.push({
      id: "nursing-followup",
      title: "Nursing follow-up overdue",
      detail: `${overdueTasks.length} overdue task(s). Generate clear nursing instructions before sign-off.`,
      tone: "danger",
    });
  }

  if (patient?.currentStatus === "Ready for transfer" && draft.decision !== "Transfer to ward") {
    scenarios.push({
      id: "transfer-readiness",
      title: "Transfer readiness mismatch",
      detail: "Patient is marked ready for transfer. Confirm ICU need or place transfer-to-ward decision.",
      tone: "warning",
    });
  }

  if (!draft.familyUpdate.trim()) {
    scenarios.push({
      id: "family-update",
      title: "Family update pending",
      detail: "Daily round should record family counselling, consent status, and goals-of-care discussion if needed.",
      tone: "warning",
    });
  }

  return scenarios;
}

function buildDoctorRoundGoals(draft: DoctorRoundDraft, patient?: IcuPatient) {
  return [
    { title: "Today's goals", detail: draft.problemList },
    { title: "Doctor orders", detail: draft.initialOrders || draft.medicationPlan },
    { title: "Nursing instructions", detail: draft.nursingInstructions },
    { title: "Medication changes", detail: draft.medicationPlan },
    { title: "Pending follow-up", detail: draft.pendingFollowUp },
    { title: "Disposition", detail: `${draft.decision}${patient ? ` for ${patient.bedNo}` : ""}` },
  ];
}

function HospitalColourLegend() {
  const items = [
    ["Critical", "bg-red-600"],
    ["Warning", "bg-amber-500"],
    ["Orders", "bg-sky-600"],
    ["Stable", "bg-emerald-600"],
    ["Ventilator", "bg-violet-600"],
  ];
  return (
    <div className="hidden flex-wrap gap-2 lg:flex">
      {items.map(([label, color]) => (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600" key={label}>
          <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
          {label}
        </span>
      ))}
    </div>
  );
}

function ClinicalMiniBadge({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <span className={cn("rounded-md border px-2 py-1 text-center text-[11px] font-bold", clinicalTonePillClass(tone))}>
      <span className="block text-[10px] opacity-80">{label}</span>
      {value}
    </span>
  );
}

function DoctorRoundQueuePanel({ activePatientId, mode, onSelectPatient }: { activePatientId: string; mode: DoctorRoundMode; onSelectPatient: (patientId: string) => void }) {
  const roster = Array.from(new Set(icuPatients.map((patient) => mode === "Admitting Doctor" ? patient.admittingDoctor : patient.dutyDoctor))).map((doctor) => {
    const patients = icuPatients.filter((patient) => (mode === "Admitting Doctor" ? patient.admittingDoctor : patient.dutyDoctor) === doctor);
    const alertCount = patients.reduce((sum, patient) => sum + icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved").length, 0);
    return { doctor, patients, alertCount };
  });
  const criticalCount = icuPatients.filter((patient) => patient.criticalityScore >= 8 || patient.currentStatus === "Critical").length;
  const pendingTasks = icuPatients.reduce((sum, patient) => sum + patient.pendingTasks, 0);
  const title = mode === "Admitting Doctor" ? "Admission queue" : "Daily round queue";

  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3 px-1 py-1">
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">Risk, alerts, doctor load, and pending work.</p>
        </div>
        <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-xs font-bold text-sky-700">{icuPatients.length}</span>
      </div>

      <div className="mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-4">
          {icuPatients.map((patient) => {
            const openAlertCount = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved").length;
            return (
              <button
                className={cn(
                  "relative w-full overflow-hidden rounded-md border bg-white p-3 pt-4 text-left shadow-sm transition hover:-translate-y-0.5",
                  doctorPatientCardClass(patient, openAlertCount),
                  patient.id === activePatientId ? "ring-2 ring-sky-500 ring-offset-1" : "",
                )}
                key={patient.id}
                type="button"
                onClick={() => onSelectPatient(patient.id)}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1.5", doctorPatientRailClass(patient, openAlertCount))} />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">{patient.bedNo} - {patient.patientName}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-600">{patient.diagnosis}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold", doctorPatientStatusClass(patient, openAlertCount))}>{patient.currentStatus}</span>
                </div>
                <p className="mt-2 truncate text-[11px] font-semibold text-slate-500">
                  {mode === "Admitting Doctor" ? patient.admittingDoctor : patient.dutyDoctor}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <ClinicalMiniBadge label="Score" value={`${patient.criticalityScore}`} tone={patient.criticalityScore >= 8 ? "critical" : patient.criticalityScore >= 6 ? "warning" : "success"} />
                  <ClinicalMiniBadge label="Alerts" value={`${openAlertCount}`} tone={openAlertCount ? "danger" : "success"} />
                  <ClinicalMiniBadge label="Tasks" value={`${patient.pendingTasks}`} tone={patient.pendingTasks ? "warning" : "success"} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase text-slate-500">Doctor coverage</p>
              <Badge tone="info">{roster.length}</Badge>
            </div>
            <div className="mt-3 space-y-2">
              {roster.map((item) => (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2" key={item.doctor}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-bold text-slate-900">{item.doctor}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold", clinicalTonePillClass(item.alertCount ? "warning" : "success"))}>{item.patients.length} pt</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div className={cn("h-full rounded-full", item.alertCount ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${Math.max(18, Math.min(100, item.patients.length * 28))}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <ClinicalMiniBadge label="Queue" value={`${icuPatients.length}`} tone="info" />
            <ClinicalMiniBadge label="Critical" value={`${criticalCount}`} tone={criticalCount ? "danger" : "success"} />
            <ClinicalMiniBadge label="Tasks" value={`${pendingTasks}`} tone={pendingTasks ? "warning" : "success"} />
          </div>
        </div>
      </div>
    </section>
  );
}

function doctorPatientCardClass(patient: IcuPatient, openAlertCount: number) {
  if (patient.criticalityScore >= 8 || openAlertCount > 1 || patient.currentStatus === "Critical") return "border-red-200 hover:bg-red-50";
  if (patient.ventilatorStatus !== "Room air" || patient.currentStatus === "Ventilated") return "border-violet-200 hover:bg-violet-50";
  if (patient.currentStatus === "Ready for transfer") return "border-emerald-200 hover:bg-emerald-50";
  return "border-sky-200 hover:bg-sky-50";
}

function doctorPatientRailClass(patient: IcuPatient, openAlertCount: number) {
  if (patient.criticalityScore >= 8 || openAlertCount > 1 || patient.currentStatus === "Critical") return "bg-red-600";
  if (patient.ventilatorStatus !== "Room air" || patient.currentStatus === "Ventilated") return "bg-violet-600";
  if (patient.currentStatus === "Ready for transfer") return "bg-emerald-600";
  return "bg-sky-600";
}

function doctorPatientStatusClass(patient: IcuPatient, openAlertCount: number) {
  if (patient.criticalityScore >= 8 || openAlertCount > 1 || patient.currentStatus === "Critical") return "border-red-300 bg-red-50 text-red-700";
  if (patient.ventilatorStatus !== "Room air" || patient.currentStatus === "Ventilated") return "border-violet-300 bg-violet-50 text-violet-700";
  if (patient.currentStatus === "Ready for transfer") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  return "border-sky-300 bg-sky-50 text-sky-700";
}

function RoundContextTile({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className={cn("rounded-md border p-3", clinicalToneSurfaceClass(tone))}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
        <span className={cn("h-2.5 w-2.5 rounded-full", clinicalToneDotClass(tone))} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-bold">{value}</p>
    </div>
  );
}

function DoctorRoundScenarioPanel({ scenarios }: { scenarios: DoctorRoundScenario[] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Scenario safety checks</p>
          <p className="mt-1 text-xs text-slate-500">Daily goals, ICU bundle, medication, lines, nutrition, family update, and disposition.</p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", scenarios.some((scenario) => scenario.blocking) ? clinicalTonePillClass("danger") : clinicalTonePillClass("success"))}>{scenarios.length}</span>
      </div>
      <div className="mt-4 space-y-2">
        {scenarios.map((scenario) => (
          <div className={cn("rounded-md border p-3", scenario.blocking ? "border-red-300 bg-red-50" : clinicalToneSurfaceClass(scenario.tone))} key={scenario.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{scenario.title}</p>
                <p className="mt-1 text-xs leading-relaxed">{scenario.detail}</p>
              </div>
              <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold", clinicalTonePillClass(scenario.blocking ? "danger" : scenario.tone))}>{scenario.blocking ? "Required" : "Check"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DoctorRoundClinicalPanel({ latestVital, meds, infusions, fluidBalance, tasks }: { latestVital?: (typeof icuVitals)[number]; meds: typeof medicationRows; infusions: typeof infusionRows; fluidBalance: number; tasks: typeof icuTasks }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-bold text-slate-900">Clinical snapshot</p>
        <p className="mt-1 text-xs text-slate-500">Current chart context for round decision.</p>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <InfoPair label="Latest vitals" value={latestVital ? `T ${latestVital.temperature}, P ${latestVital.pulse}, BP ${latestVital.bp}, SpO2 ${latestVital.spo2}%` : "No vitals"} tone={latestVital?.abnormal ? "danger" : "success"} />
        <InfoPair label="Medication due/late" value={`${meds.filter((med) => med.status === "Due" || med.status === "Late").length}`} tone={meds.some((med) => med.status === "Late") ? "danger" : "warning"} />
        <InfoPair label="Running infusions" value={`${infusions.filter((infusion) => infusion.status === "Running").length}`} tone="info" />
        <InfoPair label="Fluid balance" value={`${fluidBalance} ml`} tone={fluidBalance > 400 ? "warning" : "success"} />
        <InfoPair label="Pending/overdue tasks" value={`${tasks.filter((task) => task.status !== "Completed").length}`} tone={tasks.some((task) => task.status === "Overdue") ? "danger" : "warning"} />
      </div>
    </div>
  );
}

function InfoPair({ label, value, tone }: { label: string; value: string; tone: StatusTone }) {
  return (
    <div className={cn("flex items-start justify-between gap-3 rounded-md border p-2 text-xs", clinicalToneSurfaceClass(tone))}>
      <span className="font-medium">{label}</span>
      <span className="text-right font-bold">{value}</span>
    </div>
  );
}

function RoundTextField({ label, value, onChange, tone }: { label: string; value: string; onChange: (value: string) => void; tone: ClinicalTone }) {
  return (
    <label className={cn("block rounded-md border p-3 text-sm", clinicalToneSurfaceClass(tone))}>
      <span className="font-bold">{label}</span>
      <Input className="mt-2 border-white/70 bg-white text-slate-900" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function RoundTextArea({
  label,
  value,
  onChange,
  tone,
  suggestions = [],
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tone: ClinicalTone;
  suggestions?: string[];
}) {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState("");
  const activeSuggestion = suggestions.includes(selectedSuggestion) ? selectedSuggestion : suggestions[0] ?? "";

  return (
    <div className={cn("block rounded-md border p-3 text-sm", clinicalToneSurfaceClass(tone))}>
      <div className="font-bold">{label}</div>
      {suggestions.length ? (
        <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          <select
            aria-label={`${label} round advice`}
            className="h-10 min-w-0 truncate rounded-md border border-white/70 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-200"
            value={activeSuggestion}
            onChange={(event) => setSelectedSuggestion(event.target.value)}
          >
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion}>{suggestion}</option>
            ))}
          </select>
          <Button
            className="shrink-0"
            size="sm"
            type="button"
            variant="outline"
            disabled={!activeSuggestion}
            onClick={() => onChange(appendDoctorRoundAdvice(value, activeSuggestion))}
          >
            Add advice
          </Button>
        </div>
      ) : null}
      <textarea className="mt-2 min-h-28 w-full rounded-md border border-white/70 bg-white p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-200" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function getDoctorRoundAdviceOptions(field: keyof DoctorRoundDraft, decision?: DoctorRoundDecision) {
  return decision ? doctorRoundDispositionAdviceOptions[decision]?.[field] ?? doctorRoundAdviceOptions[field] ?? [] : doctorRoundAdviceOptions[field] ?? [];
}

function appendDoctorRoundAdvice(current: string, advice: string) {
  const cleanAdvice = advice.trim();
  const cleanCurrent = current.trim();
  if (!cleanAdvice) return current;
  if (!cleanCurrent) return cleanAdvice;
  if (cleanCurrent.includes(cleanAdvice)) return cleanCurrent;
  return `${cleanCurrent}\n${cleanAdvice}`;
}

function EmptyWorkflowState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function clinicalToneSurfaceClass(tone: ClinicalTone) {
  if (tone === "critical") return "border-red-300 bg-red-50 text-red-950";
  if (tone === "danger") return "border-rose-300 bg-rose-50 text-rose-950";
  if (tone === "warning") return "border-amber-300 bg-amber-50 text-amber-950";
  if (tone === "success") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (tone === "purple") return "border-violet-300 bg-violet-50 text-violet-950";
  return "border-sky-300 bg-sky-50 text-sky-950";
}

function clinicalTonePillClass(tone: ClinicalTone) {
  if (tone === "critical") return "border-red-300 bg-red-50 text-red-700";
  if (tone === "danger") return "border-rose-300 bg-rose-50 text-rose-700";
  if (tone === "warning") return "border-amber-300 bg-amber-50 text-amber-700";
  if (tone === "success") return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (tone === "purple") return "border-violet-300 bg-violet-50 text-violet-700";
  return "border-sky-300 bg-sky-50 text-sky-700";
}

function clinicalToneDotClass(tone: ClinicalTone) {
  if (tone === "critical") return "bg-red-600";
  if (tone === "danger") return "bg-rose-600";
  if (tone === "warning") return "bg-amber-500";
  if (tone === "success") return "bg-emerald-600";
  if (tone === "purple") return "bg-violet-600";
  return "bg-sky-600";
}

function DoctorInstructions() {
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Instruction Due Date & Time Filter" compact />
      <GenericTable title="Doctor Instructions" rows={doctorInstructions} />
    </div>
  );
}

function CoordinationPage({ type }: { type: "lab" | "radiology" | "pharmacy" }) {
  const title = type === "lab" ? "Lab Orders & Results" : type === "radiology" ? "Radiology Orders & Reports" : "Pharmacy Requests";
  const rows = type === "lab"
    ? [
      { id: "lab-001", bedNo: "ICU-A01", investigation: "ABG", sampleStatus: "Collected", resultStatus: "Pending", critical: "Possible", doctorReview: "Pending", nurseFollowUp: "Call lab" },
      { id: "lab-002", bedNo: "ICU-A02", investigation: "CBC", sampleStatus: "Received", resultStatus: "Completed", critical: "No", doctorReview: "Reviewed", nurseFollowUp: "Done" },
    ]
    : type === "radiology"
      ? [
        { id: "rad-001", bedNo: "ICU-A01", modality: "Chest X-ray", status: "Ordered", report: "Pending", doctorReview: "Pending", nurseFollowUp: "Coordinate portable X-ray" },
        { id: "rad-002", bedNo: "ICU-B03", modality: "CT Brain", status: "Reported", report: "Available", doctorReview: "Pending", nurseFollowUp: "Notify consultant" },
      ]
      : [
        { id: "ph-001", bedNo: "ICU-A01", medicine: "Meropenem", requestStatus: "Pending dispense", receivedByNurse: "-", shortage: "No", returnStatus: "-" },
        { id: "ph-002", bedNo: "ICU-A02", medicine: "Noradrenaline", requestStatus: "Dispensed", receivedByNurse: "Ward Nurse Arjun", shortage: "No", returnStatus: "-" },
      ];
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title={`${title} Date & Time Filter`} compact />
      <GenericTable title={title} rows={rows} />
    </div>
  );
}

type SupervisionMode = "head" | "ward";
type SupervisionRole = "Head Nurse" | "Unit Nurse" | "Ward Nurse" | "Duty Doctor";
type SupervisionPriority = IcuPriority | "Info";
type SupervisionShift = "Current" | "Day" | "Night";

type SupervisionItem = {
  id: string;
  patientId: string;
  patientName: string;
  bedNo: string;
  unit: string;
  nurse: string;
  role: SupervisionRole;
  source: string;
  sourceDetail: string;
  title: string;
  detail: string;
  priority: SupervisionPriority;
  status: string;
  due: string;
  shift: SupervisionShift;
  scenario: string;
  createdBy: string;
};

type SupervisionNote = {
  id: string;
  type: string;
  patientName: string;
  bedNo: string;
  nurse: string;
  source: string;
  note: string;
  time: string;
};

const supervisionNoteTypes = [
  "Shift supervision note",
  "Critical event note",
  "Medication follow-up",
  "Doctor instruction follow-up",
  "Transfusion note",
  "Intake/output review",
  "Checklist variance",
  "Handover note",
];

const supervisionChecklistGroups = [
  {
    title: "Start shift safety",
    items: [
      { id: "identity", label: "Patient identity, allergy, diagnosis, and code status checked", source: "Patient Board", owner: "Ward Nurse", critical: false },
      { id: "bed-equipment", label: "Bedside monitor, oxygen, suction, emergency tray, and pump status checked", source: "Bed Board", owner: "Ward Nurse", critical: true },
      { id: "lines-devices", label: "Lines, drains, catheter, ventilator circuit, and device labels verified", source: "Monitoring Chart", owner: "Ward Nurse", critical: true },
    ],
  },
  {
    title: "During shift execution",
    items: [
      { id: "vitals", label: "Vitals and GCS documented within ordered frequency", source: "Vitals Chart", owner: "Ward Nurse", critical: true },
      { id: "medication", label: "Due, late, held, and high-risk medicines reviewed with double verification", source: "Medication Administration", owner: "Ward Nurse", critical: true },
      { id: "intake-output", label: "Hourly intake/output, urine, drain, stool, emesis, and fluid balance reviewed", source: "Intake / Output", owner: "Ward Nurse", critical: false },
      { id: "doctor-instruction", label: "Doctor instructions acknowledged, assigned, and followed up", source: "Doctor Instructions", owner: "Unit Nurse", critical: true },
    ],
  },
  {
    title: "Escalation and closure",
    items: [
      { id: "critical-alerts", label: "Critical alerts escalated to duty doctor and documented", source: "Alerts", owner: "Head Nurse", critical: true },
      { id: "workload", label: "Nurse workload reviewed and reassignment completed if unsafe", source: "Head Nurse Console", owner: "Head Nurse", critical: false },
      { id: "handover", label: "Pending tasks, notes, lab/radiology/pharmacy follow-up, and handover prepared", source: "Shift Handover", owner: "Ward Nurse", critical: false },
    ],
  },
];

function HeadNurseConsole() {
  return <SupervisionWorkspace mode="head" />;
}

function WardNurseActivities() {
  return <SupervisionWorkspace mode="ward" />;
}

function SupervisionWorkspace({ mode }: { mode: SupervisionMode }) {
  const defaultNurseOption = mode === "ward" ? "All ward nurses" : "All nurses";
  const items = React.useMemo(() => buildSupervisionItems(), []);
  const nurses = React.useMemo(() => getSupervisionNurses(items, mode), [items, mode]);
  const sources = React.useMemo(() => ["All sources", ...Array.from(new Set(items.map((item) => item.source)))], [items]);
  const [search, setSearch] = React.useState("");
  const [nurse, setNurse] = React.useState(() => mode === "ward" ? "Ward Nurse Kavita" : defaultNurseOption);
  const [source, setSource] = React.useState("All sources");
  const [priority, setPriority] = React.useState("All priority");
  const [shift, setShift] = React.useState("Current shift");
  const [status, setStatus] = React.useState("Open work");
  const [itemStatuses, setItemStatuses] = React.useState<Record<string, string>>({});
  const [itemNurses, setItemNurses] = React.useState<Record<string, string>>({});
  const [checkedChecklist, setCheckedChecklist] = React.useState<Record<string, boolean>>({});
  const [notes, setNotes] = React.useState<SupervisionNote[]>(() => buildInitialSupervisionNotes());
  const [noteDraft, setNoteDraft] = React.useState({
    type: supervisionNoteTypes[0],
    patientId: icuPatients[0]?.id ?? "",
    nurse: mode === "ward" ? "Ward Nurse Kavita" : "Head Nurse Anita",
    source: mode === "ward" ? "Ward Nurse Activities" : "Head Nurse Console",
    note: "Reviewed pending ICU supervision items and documented shift follow-up.",
  });

  const liveItems = React.useMemo(() => {
    return items.map((item) => ({
      ...item,
      status: itemStatuses[item.id] ?? item.status,
      nurse: itemNurses[item.id] ?? item.nurse,
      role: getSupervisionRole(itemNurses[item.id] ?? item.nurse, item.role),
    }));
  }, [itemNurses, itemStatuses, items]);

  const filteredItems = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return liveItems.filter((item) => {
      const text = `${item.patientName} ${item.bedNo} ${item.unit} ${item.nurse} ${item.source} ${item.title} ${item.detail} ${item.scenario} ${item.status}`.toLowerCase();
      const modeMatch = mode === "head" || item.role === "Ward Nurse" || item.role === "Unit Nurse";
      const nurseMatch = nurse === defaultNurseOption || item.nurse === nurse;
      const sourceMatch = source === "All sources" || item.source === source;
      const priorityMatch = priority === "All priority" || item.priority === priority;
      const statusMatch = status === "All status"
        || (status === "Open work" && !isClosedSupervisionStatus(item.status))
        || (status === "Overdue / critical" && (item.status === "Overdue" || item.status === "Late" || item.priority === "Critical"))
        || item.status === status;
      const shiftMatch = shift === "Current shift" || item.shift === "Current" || `${item.shift} shift` === shift;
      return modeMatch && nurseMatch && sourceMatch && priorityMatch && statusMatch && shiftMatch && (!term || text.includes(term));
    });
  }, [defaultNurseOption, liveItems, mode, nurse, priority, search, shift, source, status]);

  const nurseSummaries = React.useMemo(() => buildNurseSummaries(liveItems), [liveItems]);
  const selectedPatient = icuPatients.find((patient) => patient.id === noteDraft.patientId) ?? icuPatients[0];
  const completedChecklist = Object.values(checkedChecklist).filter(Boolean).length;
  const totalChecklist = supervisionChecklistGroups.reduce((total, group) => total + group.items.length, 0);

  function updateItem(item: SupervisionItem, nextStatus: string, message: string) {
    setItemStatuses((current) => ({ ...current, [item.id]: nextStatus }));
    toast.success(`${message}: ${item.bedNo} ${item.patientName}`);
  }

  function reassignItem(item: SupervisionItem) {
    const currentIndex = nurses.indexOf(item.nurse);
    const nextNurse = nurses[(currentIndex + 1) % nurses.length] ?? item.nurse;
    setItemNurses((current) => ({ ...current, [item.id]: nextNurse }));
    toast.success(`${item.title} reassigned to ${nextNurse}`);
  }

  function saveNote() {
    if (!selectedPatient) return;
    const newNote: SupervisionNote = {
      id: `sup-note-${Date.now()}`,
      type: noteDraft.type,
      patientName: selectedPatient.patientName,
      bedNo: selectedPatient.bedNo,
      nurse: noteDraft.nurse,
      source: noteDraft.source,
      note: noteDraft.note,
      time: "Just now",
    };
    setNotes((current) => [newNote, ...current]);
    setNoteDraft((current) => ({ ...current, note: "Follow-up reviewed and documented for next shift." }));
    toast.success("Supervision note saved");
  }

  if (mode === "head") {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <PatientBoard patients={icuPatients} compact />
          <HeadNurseWorkload summaries={nurseSummaries} selectedNurse={nurse} onSelectNurse={setNurse} allOption={defaultNurseOption} />
        </div>
        <Tabs defaultValue="queue" className="space-y-4">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="queue">Source Queue</TabsTrigger>
            <TabsTrigger value="filter">Search & Filter</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="queue">
            <div className="space-y-4">
              <SupervisionKpiStrip
                mode={mode}
                items={filteredItems}
                checklistCompleted={completedChecklist}
                checklistTotal={totalChecklist}
                nurseCount={nurses.length}
              />
              <SupervisionCompactQueue
                items={filteredItems}
                onAcknowledge={(item) => updateItem(item, "Acknowledged", "Acknowledged")}
                onComplete={(item) => updateItem(item, "Completed", "Completed")}
                onEscalate={(item) => updateItem(item, "Escalated", "Escalated")}
                onReassign={reassignItem}
              />
            </div>
          </TabsContent>
          <TabsContent value="filter">
            <SupervisionFilterBar
              search={search}
              onSearch={setSearch}
              nurse={nurse}
              onNurse={setNurse}
              nurseOptions={[defaultNurseOption, ...nurses]}
              source={source}
              onSource={setSource}
              sourceOptions={sources}
              priority={priority}
              onPriority={setPriority}
              shift={shift}
              onShift={setShift}
              status={status}
              onStatus={setStatus}
            />
          </TabsContent>
          <TabsContent value="notes">
            <SupervisionNotePanel
              noteDraft={noteDraft}
              onChange={setNoteDraft}
              notes={notes}
              nurses={["Head Nurse Anita", ...nurses]}
              selectedPatient={selectedPatient}
              onSave={saveNote}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="checklist">Shift Checklist</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="queue">Source Queue</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
        </TabsList>
        <TabsContent value="checklist">
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <Checklist title="Ward nurse shift checklist" items={["Patient identity check", "Vitals recorded", "Medication administered", "Intake/output updated", "IV fluids checked", "Blood transfusion monitored", "Doctor instructions followed", "Handover note prepared"]} />
            <SupervisionChecklist
              checkedItems={checkedChecklist}
              onToggle={(id) => setCheckedChecklist((current) => ({ ...current, [id]: !current[id] }))}
              onMarkReady={() => toast.success("Shift supervision checklist marked ready")}
            />
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <TaskList />
        </TabsContent>
        <TabsContent value="notes">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <NursingNotes />
            <SupervisionNotePanel
              noteDraft={noteDraft}
              onChange={setNoteDraft}
              notes={notes}
              nurses={["Head Nurse Anita", ...nurses]}
              selectedPatient={selectedPatient}
              onSave={saveNote}
            />
          </div>
        </TabsContent>
        <TabsContent value="queue">
          <div className="space-y-4">
            <SupervisionKpiStrip
              mode={mode}
              items={filteredItems}
              checklistCompleted={completedChecklist}
              checklistTotal={totalChecklist}
              nurseCount={nurses.length}
            />
            <SupervisionFilterBar
              search={search}
              onSearch={setSearch}
              nurse={nurse}
              onNurse={setNurse}
              nurseOptions={[defaultNurseOption, ...nurses]}
              source={source}
              onSource={setSource}
              sourceOptions={sources}
              priority={priority}
              onPriority={setPriority}
              shift={shift}
              onShift={setShift}
              status={status}
              onStatus={setStatus}
            />
            <SupervisionWorkQueue
              items={filteredItems}
              onAcknowledge={(item) => updateItem(item, "Acknowledged", "Acknowledged")}
              onComplete={(item) => updateItem(item, "Completed", "Completed")}
              onEscalate={(item) => updateItem(item, "Escalated", "Escalated")}
              onReassign={reassignItem}
            />
          </div>
        </TabsContent>
        <TabsContent value="workload">
          <NurseWorkloadPanel summaries={nurseSummaries} selectedNurse={nurse} onSelectNurse={setNurse} allOption={defaultNurseOption} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PatientBoard({ patients, compact }: { patients: IcuPatient[]; compact?: boolean }) {
  const [activeAction, setActiveAction] = React.useState<{ action: PatientAction; patient: IcuPatient } | null>(null);
  const [lastActionByPatient, setLastActionByPatient] = React.useState<Record<string, string>>({});

  function completePatientAction(action: PatientAction, patient: IcuPatient) {
    setLastActionByPatient((current) => ({ ...current, [patient.id]: `${action} saved just now` }));
    toast.success(`${action} workflow saved for ${patient.patientName}`);
    setActiveAction(null);
  }

  return (
    <>
      <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {patients.map((patient) => (
          <Card className="overflow-hidden" key={patient.id}>
            <CardHeader className="flex-col gap-2 border-b border-border bg-surface-muted sm:flex-row sm:items-start">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BedDouble className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{patient.bedNo}</span>
                </CardTitle>
                <CardDescription className="break-words">{patient.unit} - {patient.admissionSource}</CardDescription>
              </div>
              <StatusPill tone={toneForStatus(patient.currentStatus)}>{patient.currentStatus}</StatusPill>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="min-w-0">
                <div className="break-words text-lg font-semibold text-foreground">{patient.patientName}</div>
                <div className="text-xs text-muted-foreground">{patient.mrn} - {patient.ageGender}</div>
              </div>
              <div className="min-h-[46px] rounded-md border border-border bg-background p-3 text-sm text-muted-foreground">{patient.diagnosis}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                <PatientInfoTile label="Doctor" value={patient.admittingDoctor} />
                <PatientInfoTile label="Ward nurse" value={patient.assignedWardNurse} />
                <PatientInfoTile label="Ventilator" value={patient.ventilatorStatus} />
                <PatientInfoTile label="Last vitals" value={patient.lastVitalsTime} />
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge tone={patient.criticalityScore >= 8 ? "critical" : patient.criticalityScore >= 6 ? "warning" : "success"}>Score {patient.criticalityScore}</Badge>
                <Badge tone="info">{patient.pendingTasks} tasks</Badge>
                {patient.alerts.map((alert) => <Badge key={alert} tone="danger">{alert}</Badge>)}
              </div>
              {lastActionByPatient[patient.id] ? (
                <div className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-medium text-success">
                  {lastActionByPatient[patient.id]}
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(["View", "Monitor", "Medication", "Notes", "Transfer", "Discharge"] as PatientAction[]).map((action) => (
                  <Button className="justify-center px-2" key={action} size="sm" variant="outline" onClick={() => setActiveAction({ action, patient })}>
                    {action}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <PatientActionDialog
        activeAction={activeAction}
        onOpenChange={(open) => !open && setActiveAction(null)}
        onComplete={completePatientAction}
      />
    </>
  );
}

function HeadNurseWorkload({
  summaries,
  selectedNurse,
  onSelectNurse,
  allOption,
}: {
  summaries: Array<{ nurse: string; patients: number; active: number; overdue: number; critical: number; documentation: number; status: string }>;
  selectedNurse: string;
  onSelectNurse: (value: string) => void;
  allOption: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Nurse Workload</CardTitle>
          <CardDescription>Previous side view restored with added workload risk and quick filter.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => onSelectNurse(allOption)}>All nurses</Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {summaries.map((row) => (
          <button
            className={cn(
              "w-full rounded-md border p-3 text-left transition hover:bg-surface-muted",
              selectedNurse === row.nurse ? "border-primary bg-primary/5" : "border-border bg-background",
            )}
            key={row.nurse}
            onClick={() => onSelectNurse(row.nurse)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{row.nurse}</p>
                <p className="text-xs text-muted-foreground">{row.patients} patients - {row.active} pending</p>
              </div>
              <StatusPill tone={row.critical || row.overdue ? "danger" : row.documentation < 85 ? "warning" : "success"}>{row.status}</StatusPill>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <PatientInfoTile label="Overdue" value={`${row.overdue}`} />
              <PatientInfoTile label="Critical" value={`${row.critical}`} />
              <PatientInfoTile label="Docs" value={`${row.documentation}%`} />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function SupervisionCompactQueue({
  items,
  onAcknowledge,
  onComplete,
  onEscalate,
  onReassign,
}: {
  items: SupervisionItem[];
  onAcknowledge: (item: SupervisionItem) => void;
  onComplete: (item: SupervisionItem) => void;
  onEscalate: (item: SupervisionItem) => void;
  onReassign: (item: SupervisionItem) => void;
}) {
  const visibleItems = items.slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Source wise supervision queue</CardTitle>
          <CardDescription>Added feature: source, owner, priority, and quick actions without changing the old patient board.</CardDescription>
        </div>
        <Badge tone={items.length ? "info" : "warning"}>{items.length} records</Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleItems.length ? visibleItems.map((item) => (
          <div className="rounded-md border border-border bg-background p-3" key={item.id}>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={supervisionPriorityTone(item.priority)}>{item.priority}</StatusPill>
              <Badge tone={toneForStatus(item.status)}>{item.status}</Badge>
              <Badge tone="info">{item.source}</Badge>
              <Badge tone="muted">{item.nurse}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">{item.bedNo} - {item.patientName}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.title}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onAcknowledge(item)}><CheckCircle2 className="h-3.5 w-3.5" />Ack</Button>
              <Button size="sm" variant="outline" onClick={() => onComplete(item)}><ClipboardCheck className="h-3.5 w-3.5" />Done</Button>
              <Button size="sm" variant="outline" onClick={() => onReassign(item)}><ArrowRightLeft className="h-3.5 w-3.5" />Assign</Button>
              <Button size="sm" variant="danger" onClick={() => onEscalate(item)}><AlertTriangle className="h-3.5 w-3.5" />Escalate</Button>
            </div>
          </div>
        )) : <EmptyWorkflowState title="No source records found" detail="Change filters to review another supervision queue." />}
      </CardContent>
    </Card>
  );
}

function TaskList() {
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Task Due Date & Time Filter" compact />
      <GenericTable title="Nurse Task Board" rows={icuTasks} />
    </div>
  );
}

function Checklist({ title, items }: { title: string; items: string[] }) {
  const [checkedItems, setCheckedItems] = React.useState<string[]>([]);

  function toggleItem(item: string) {
    setCheckedItems((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{checkedItems.length} of {items.length} completed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <label className="flex items-center gap-2 rounded-md border border-border p-2 text-sm" key={item}>
            <input className="h-4 w-4 rounded border-border" checked={checkedItems.includes(item)} type="checkbox" onChange={() => toggleItem(item)} />
            {item}
          </label>
        ))}
        <Button
          className="w-full"
          disabled={checkedItems.length !== items.length}
          onClick={() => toast.success(`${title} acknowledged`)}
        >
          Acknowledge checklist
        </Button>
      </CardContent>
    </Card>
  );
}

function SupervisionFilterBar({
  search,
  onSearch,
  nurse,
  onNurse,
  nurseOptions,
  source,
  onSource,
  sourceOptions,
  priority,
  onPriority,
  shift,
  onShift,
  status,
  onStatus,
}: {
  search: string;
  onSearch: (value: string) => void;
  nurse: string;
  onNurse: (value: string) => void;
  nurseOptions: string[];
  source: string;
  onSource: (value: string) => void;
  sourceOptions: string[];
  priority: string;
  onPriority: (value: string) => void;
  shift: string;
  onShift: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(280px,1.4fr)_repeat(3,minmax(150px,0.7fr))]">
          <label className="flex min-w-0 items-center gap-2 rounded-md border border-input bg-background px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              className="border-0 px-0 shadow-none focus-visible:ring-0"
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search patient, bed, nurse, source, alert, task, note..."
            />
          </label>
          <NativeSelect label="Nurse" value={nurse} onChange={onNurse} options={nurseOptions} />
          <NativeSelect label="Source" value={source} onChange={onSource} options={sourceOptions} />
          <NativeSelect label="Priority" value={priority} onChange={onPriority} options={["All priority", "Critical", "High", "Medium", "Routine", "Info"]} />
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(180px,260px)_minmax(180px,260px)_1fr] md:items-center">
          <NativeSelect label="Shift" value={shift} onChange={onShift} options={["Current shift", "Day shift", "Night shift"]} />
          <NativeSelect label="Status" value={status} onChange={onStatus} options={["Open work", "Overdue / critical", "All status", "Pending", "In progress", "Acknowledged", "Escalated", "Completed"]} />
          <div className="flex flex-wrap gap-2">
            <Badge tone="critical">Critical</Badge>
            <Badge tone="warning">Due soon</Badge>
            <Badge tone="info">Source tracked</Badge>
            <Badge tone="success">Checklist ready</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SupervisionKpiStrip({
  mode,
  items,
  checklistCompleted,
  checklistTotal,
  nurseCount,
}: {
  mode: SupervisionMode;
  items: SupervisionItem[];
  checklistCompleted: number;
  checklistTotal: number;
  nurseCount: number;
}) {
  const critical = items.filter((item) => item.priority === "Critical").length;
  const overdue = items.filter((item) => item.status === "Overdue" || item.status === "Late").length;
  const escalated = items.filter((item) => item.status === "Escalated").length;
  const completion = checklistTotal ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <SupervisionMetric title={mode === "head" ? "Supervision queue" : "My shift queue"} value={items.length} detail="Filtered active records" tone={items.length ? "info" : "muted"} icon={ListChecks} />
      <SupervisionMetric title="Critical risk" value={critical} detail="Needs immediate review" tone={critical ? "critical" : "success"} icon={ShieldAlert} />
      <SupervisionMetric title="Overdue" value={overdue} detail="Late meds, tasks, vitals" tone={overdue ? "danger" : "success"} icon={Clock3} />
      <SupervisionMetric title="Escalated" value={escalated} detail="Doctor or head nurse queue" tone={escalated ? "warning" : "success"} icon={AlertTriangle} />
      <SupervisionMetric title="Checklist" value={`${completion}%`} detail={`${checklistCompleted}/${checklistTotal} complete - ${nurseCount} nurses`} tone={completion >= 80 ? "success" : "warning"} icon={ClipboardCheck} />
    </div>
  );
}

function SupervisionMetric({
  title,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  detail: string;
  tone: StatusTone;
  icon: typeof HeartPulse;
}) {
  return (
    <Card className={cn("overflow-hidden border-l-4", supervisionMetricClass(tone))}>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="rounded-md border border-border bg-background p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
      </CardContent>
    </Card>
  );
}

function SupervisionWorkQueue({
  items,
  onAcknowledge,
  onComplete,
  onEscalate,
  onReassign,
}: {
  items: SupervisionItem[];
  onAcknowledge: (item: SupervisionItem) => void;
  onComplete: (item: SupervisionItem) => void;
  onEscalate: (item: SupervisionItem) => void;
  onReassign: (item: SupervisionItem) => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border bg-surface-muted">
        <div>
          <CardTitle>Supervision work queue</CardTitle>
          <CardDescription>Every row keeps patient, source module, nurse ownership, due time, and action status visible.</CardDescription>
        </div>
        <Badge tone={items.length ? "info" : "warning"}>{items.length} items</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {items.length ? (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center" key={item.id}>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={supervisionPriorityTone(item.priority)}>{item.priority}</StatusPill>
                    <Badge tone={toneForStatus(item.status)}>{item.status}</Badge>
                    <Badge tone="info">{item.source}</Badge>
                    <Badge tone="muted">{item.sourceDetail}</Badge>
                  </div>
                  <div>
                    <p className="break-words text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 break-words text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                    <span><strong className="text-foreground">{item.bedNo}</strong> - {item.patientName}</span>
                    <span>{item.unit}</span>
                    <span>{item.nurse}</span>
                    <span>{item.due} - {item.createdBy}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => onAcknowledge(item)}><CheckCircle2 className="h-3.5 w-3.5" />Ack</Button>
                  <Button size="sm" variant="outline" onClick={() => onComplete(item)}><ClipboardCheck className="h-3.5 w-3.5" />Done</Button>
                  <Button size="sm" variant="outline" onClick={() => onReassign(item)}><ArrowRightLeft className="h-3.5 w-3.5" />Assign</Button>
                  <Button size="sm" variant="danger" onClick={() => onEscalate(item)}><AlertTriangle className="h-3.5 w-3.5" />Escalate</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyWorkflowState title="No supervision records found" detail="Adjust search, source, shift, status, or nurse filters to review another queue." />
        )}
      </CardContent>
    </Card>
  );
}

function NurseWorkloadPanel({
  summaries,
  selectedNurse,
  onSelectNurse,
  allOption,
}: {
  summaries: Array<{ nurse: string; patients: number; active: number; overdue: number; critical: number; documentation: number; status: string }>;
  selectedNurse: string;
  onSelectNurse: (value: string) => void;
  allOption: string;
}) {
  return (
    <Card>
      <CardHeader className="border-b border-border bg-surface-muted">
        <div>
          <CardTitle>Nurse workload and supervision</CardTitle>
          <CardDescription>Click a nurse to filter queue and review unsafe workload quickly.</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => onSelectNurse(allOption)}>All</Button>
      </CardHeader>
      <CardContent className="space-y-3 p-3">
        {summaries.map((row) => (
          <button
            className={cn(
              "w-full rounded-md border p-3 text-left transition hover:bg-surface-muted",
              selectedNurse === row.nurse ? "border-primary bg-primary/5" : "border-border bg-background",
            )}
            key={row.nurse}
            onClick={() => onSelectNurse(row.nurse)}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{row.nurse}</p>
                <p className="text-xs text-muted-foreground">{row.patients} patients - {row.active} active items</p>
              </div>
              <StatusPill tone={row.critical || row.overdue ? "danger" : row.documentation < 85 ? "warning" : "success"}>{row.status}</StatusPill>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <SupervisionMiniStat label="Overdue" value={row.overdue} tone={row.overdue ? "danger" : "success"} />
              <SupervisionMiniStat label="Critical" value={row.critical} tone={row.critical ? "critical" : "success"} />
              <SupervisionMiniStat label="Docs" value={`${row.documentation}%`} tone={row.documentation < 85 ? "warning" : "success"} />
              <SupervisionMiniStat label="Load" value={row.active} tone={row.active > 6 ? "warning" : "info"} />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function SupervisionMiniStat({ label, value, tone }: { label: string; value: React.ReactNode; tone: StatusTone }) {
  return (
    <div className={cn("rounded-md border px-2 py-2", supervisionMiniStatClass(tone))}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold text-foreground">{value}</p>
    </div>
  );
}

function SupervisionChecklist({
  checkedItems,
  onToggle,
  onMarkReady,
}: {
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
  onMarkReady: () => void;
}) {
  const total = supervisionChecklistGroups.reduce((sum, group) => sum + group.items.length, 0);
  const completed = Object.values(checkedItems).filter(Boolean).length;

  return (
    <Card>
      <CardHeader className="border-b border-border bg-surface-muted">
        <div>
          <CardTitle>Shift checklist and source control</CardTitle>
          <CardDescription>Checklist explains where every supervision item is coming from and who owns it.</CardDescription>
        </div>
        <StatusPill tone={completed === total ? "success" : "warning"}>{completed}/{total} complete</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {supervisionChecklistGroups.map((group) => (
          <div className="space-y-2" key={group.title}>
            <p className="text-xs font-bold uppercase text-muted-foreground">{group.title}</p>
            <div className="grid gap-2 lg:grid-cols-2">
              {group.items.map((item) => (
                <label className="flex min-h-[82px] gap-3 rounded-md border border-border bg-background p-3 text-sm" key={item.id}>
                  <input className="mt-1 h-4 w-4 rounded border-border" checked={Boolean(checkedItems[item.id])} type="checkbox" onChange={() => onToggle(item.id)} />
                  <span className="min-w-0">
                    <span className="block break-words font-medium text-foreground">{item.label}</span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      <Badge tone={item.critical ? "critical" : "info"}>{item.source}</Badge>
                      <Badge tone="muted">{item.owner}</Badge>
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button className="w-full" disabled={completed !== total} onClick={onMarkReady}>
          <ClipboardCheck className="h-4 w-4" />
          Mark shift supervision ready
        </Button>
      </CardContent>
    </Card>
  );
}

function SupervisionNotePanel({
  noteDraft,
  onChange,
  notes,
  nurses,
  selectedPatient,
  onSave,
}: {
  noteDraft: { type: string; patientId: string; nurse: string; source: string; note: string };
  onChange: React.Dispatch<React.SetStateAction<{ type: string; patientId: string; nurse: string; source: string; note: string }>>;
  notes: SupervisionNote[];
  nurses: string[];
  selectedPatient?: IcuPatient;
  onSave: () => void;
}) {
  const patientOptions = icuPatients.map((patient) => `${patient.id}|${patient.bedNo} - ${patient.patientName}`);
  const patientValue = selectedPatient ? `${selectedPatient.id}|${selectedPatient.bedNo} - ${selectedPatient.patientName}` : patientOptions[0] ?? "";

  return (
    <Card>
      <CardHeader className="border-b border-border bg-surface-muted">
        <div>
          <CardTitle>Task notes and follow-up</CardTitle>
          <CardDescription>Structured note for head nurse review, ward nurse activity, handover, and audit trail.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <NativeSelect label="Note type" value={noteDraft.type} onChange={(value) => onChange((current) => ({ ...current, type: value }))} options={supervisionNoteTypes} />
          <NativeSelect label="Patient" value={patientValue} onChange={(value) => onChange((current) => ({ ...current, patientId: value.split("|")[0] ?? current.patientId }))} options={patientOptions} />
          <NativeSelect label="Nurse" value={noteDraft.nurse} onChange={(value) => onChange((current) => ({ ...current, nurse: value }))} options={Array.from(new Set(nurses))} />
          <NativeSelect label="Source" value={noteDraft.source} onChange={(value) => onChange((current) => ({ ...current, source: value }))} options={["Head Nurse Console", "Ward Nurse Activities", "Tasks", "Medication Administration", "Vitals Chart", "Intake / Output", "Doctor Instructions", "Shift Handover"]} />
        </div>
        <textarea
          className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
          value={noteDraft.note}
          onChange={(event) => onChange((current) => ({ ...current, note: event.target.value }))}
        />
        <Button className="w-full" onClick={onSave}><FileText className="h-4 w-4" />Save supervision note</Button>
        <div className="space-y-2">
          {notes.slice(0, 5).map((note) => (
            <div className="rounded-md border border-border bg-background p-3" key={note.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{note.type}</Badge>
                <Badge tone="muted">{note.source}</Badge>
                <span className="text-xs text-muted-foreground">{note.time}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{note.bedNo} - {note.patientName}</p>
              <p className="mt-1 text-xs text-muted-foreground">{note.nurse}</p>
              <p className="mt-2 break-words text-sm text-foreground">{note.note}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function buildSupervisionItems(): SupervisionItem[] {
  const taskItems: SupervisionItem[] = icuTasks.map((task) => {
    const patient = getPatientForSupervision(task.patientId, task.bedNo);
    return {
      id: `task-${task.id}`,
      patientId: task.patientId,
      patientName: task.patientName,
      bedNo: task.bedNo,
      unit: patient.unit,
      nurse: task.assignedTo,
      role: getSupervisionRole(task.assignedTo),
      source: "Tasks",
      sourceDetail: task.createdBy,
      title: task.title,
      detail: task.remarks,
      priority: task.priority,
      status: task.status,
      due: task.dueTime,
      shift: "Current",
      scenario: task.taskType,
      createdBy: task.createdBy,
    };
  });

  const instructionItems: SupervisionItem[] = doctorInstructions.map((instruction) => {
    const patient = getPatientForSupervision(instruction.patientId, instruction.bedNo);
    return {
      id: `instruction-${instruction.id}`,
      patientId: instruction.patientId,
      patientName: patient.patientName,
      bedNo: instruction.bedNo,
      unit: patient.unit,
      nurse: instruction.assignedNurse,
      role: getSupervisionRole(instruction.assignedNurse),
      source: "Doctor Instructions",
      sourceDetail: instruction.instructionType,
      title: instruction.instruction,
      detail: instruction.remarks,
      priority: instruction.priority,
      status: instruction.status,
      due: instruction.dueTime,
      shift: "Current",
      scenario: instruction.instructionType,
      createdBy: instruction.doctor,
    };
  });

  const medicationItems: SupervisionItem[] = medicationRows
    .filter((medication) => medication.status !== "Administered")
    .map((medication) => {
      const patient = getPatientForSupervision(medication.patientId, medication.bedNo);
      const nurse = medication.administeredBy === "-" ? patient.assignedWardNurse : medication.administeredBy;
      return {
        id: `medication-${medication.id}`,
        patientId: medication.patientId,
        patientName: patient.patientName,
        bedNo: medication.bedNo,
        unit: patient.unit,
        nurse,
        role: getSupervisionRole(nurse),
        source: "Medication Administration",
        sourceDetail: medication.doubleVerification,
        title: `${medication.medication} ${medication.dose} ${medication.route}`,
        detail: `${medication.frequency} - ${medication.reason}`,
        priority: medication.status === "Late" ? "Critical" : medication.doubleVerification === "Required" ? "High" : "Medium",
        status: medication.status,
        due: medication.scheduledTime,
        shift: "Current",
        scenario: "Due / held / late medication",
        createdBy: "System MAR",
      };
    });

  const vitalItems: SupervisionItem[] = icuVitals
    .filter((vital) => vital.abnormal)
    .map((vital) => {
      const patient = getPatientForSupervision(vital.patientId, vital.bedNo);
      return {
        id: `vital-${vital.id}`,
        patientId: vital.patientId,
        patientName: patient.patientName,
        bedNo: vital.bedNo,
        unit: patient.unit,
        nurse: vital.nurse,
        role: getSupervisionRole(vital.nurse),
        source: "Vitals Chart",
        sourceDetail: "Abnormal vitals",
        title: `SpO2 ${vital.spo2}%, BP ${vital.bp}, GCS ${vital.gcs}`,
        detail: vital.note,
        priority: vital.spo2 < 92 || vital.pulse > 120 || vital.urineOutput < 30 ? "Critical" : "High",
        status: "Open",
        due: vital.time,
        shift: "Current",
        scenario: "Abnormal vitals escalation",
        createdBy: "Vitals Chart",
      };
    });

  const intakeOutputItems: SupervisionItem[] = intakeOutputRows
    .filter((row) => row.status !== "Signed" || (row.outputType.toLowerCase().includes("urine") && row.outputMl > 0 && row.outputMl < 40) || row.category.toLowerCase().includes("drain") || row.category.toLowerCase().includes("blood"))
    .slice(0, 14)
    .map((row) => {
      const patient = getPatientForSupervision(row.patientId);
      const lowUrine = row.outputType.toLowerCase().includes("urine") && row.outputMl > 0 && row.outputMl < 40;
      return {
        id: `io-${row.id}`,
        patientId: row.patientId,
        patientName: patient.patientName,
        bedNo: patient.bedNo,
        unit: patient.unit,
        nurse: row.nurse,
        role: getSupervisionRole(row.nurse),
        source: "Intake / Output",
        sourceDetail: row.source,
        title: `${row.kind}: ${row.component} ${row.quantityMl} ml`,
        detail: row.note,
        priority: lowUrine ? "High" : row.status === "Pending review" ? "Medium" : "Routine",
        status: row.status,
        due: `${row.date} ${row.time}`,
        shift: row.shift,
        scenario: `${row.category} fluid balance`,
        createdBy: row.source,
      };
    });

  const transfusionItems: SupervisionItem[] = transfusionRows
    .filter((row) => row.status !== "Completed")
    .map((row) => {
      const patient = getPatientForSupervision(row.patientId, row.bedNo);
      return {
        id: `blood-${row.id}`,
        patientId: row.patientId,
        patientName: patient.patientName,
        bedNo: row.bedNo,
        unit: patient.unit,
        nurse: row.nurse,
        role: getSupervisionRole(row.nurse),
        source: "Blood Transfusion",
        sourceDetail: row.componentType,
        title: `${row.componentType} ${row.unitNumber} - ${row.crossmatchStatus}`,
        detail: `Reaction observed: ${row.reactionObserved}. Doctor: ${row.doctor}`,
        priority: row.status === "Reaction" ? "Critical" : row.status === "Running" ? "High" : "Medium",
        status: row.status,
        due: row.startTime,
        shift: "Current",
        scenario: "Blood transfusion monitoring",
        createdBy: "Blood Unit",
      };
    });

  const infusionItems: SupervisionItem[] = infusionRows.map((row) => {
    const patient = getPatientForSupervision(row.patientId, row.bedNo);
    return {
      id: `infusion-${row.id}`,
      patientId: row.patientId,
      patientName: patient.patientName,
      bedNo: row.bedNo,
      unit: patient.unit,
      nurse: row.nurse,
      role: getSupervisionRole(row.nurse),
      source: "IV Fluids",
      sourceDetail: row.pumpNo,
      title: `${row.fluidName} at ${row.rate}`,
      detail: `${row.infusedVolumeMl}/${row.totalVolumeMl} ml infused. ${row.alert}`,
      priority: row.status === "Paused" || row.alert.toLowerCase().includes("balance") ? "High" : "Medium",
      status: row.status,
      due: row.startTime,
      shift: "Current",
      scenario: "Infusion pump and fluid balance",
      createdBy: "Infusion Pump",
    };
  });

  const alertItems: SupervisionItem[] = icuAlerts.map((alert) => {
    const patient = getPatientForSupervision(alert.patientId, alert.bedNo);
    const nurse = alert.owner === "Ward Nurse" ? patient.assignedWardNurse : alert.owner === "Duty Doctor" ? patient.assignedUnitNurse : patient.assignedUnitNurse;
    return {
      id: `alert-${alert.id}`,
      patientId: alert.patientId,
      patientName: patient.patientName,
      bedNo: alert.bedNo,
      unit: patient.unit,
      nurse,
      role: getSupervisionRole(nurse),
      source: "Alerts",
      sourceDetail: alert.source,
      title: alert.message,
      detail: `${alert.type} - owner ${alert.owner}`,
      priority: alert.severity === "Critical" ? "Critical" : alert.severity === "High" ? "High" : alert.severity === "Medium" ? "Medium" : "Info",
      status: alert.status,
      due: alert.createdAt,
      shift: "Current",
      scenario: alert.type,
      createdBy: alert.source,
    };
  });

  return [
    ...taskItems,
    ...instructionItems,
    ...medicationItems,
    ...vitalItems,
    ...intakeOutputItems,
    ...transfusionItems,
    ...infusionItems,
    ...alertItems,
  ];
}

function buildInitialSupervisionNotes(): SupervisionNote[] {
  return [
    { id: "sup-note-001", type: "Critical event note", patientName: "Aisha Khan", bedNo: "ICU-A01", nurse: "Ward Nurse Kavita", source: "Vitals Chart", note: "Low SpO2 and hypotension reviewed with duty doctor; repeat vitals and oxygen response pending.", time: "09:20" },
    { id: "sup-note-002", type: "Medication follow-up", patientName: "Aisha Khan", bedNo: "ICU-A01", nurse: "Unit Nurse Priya", source: "Medication Administration", note: "Meropenem delay escalated to pharmacy; head nurse to verify next administration time.", time: "09:30" },
    { id: "sup-note-003", type: "Handover note", patientName: "Rohan Das", bedNo: "ICU-A02", nurse: "Ward Nurse Arjun", source: "Shift Handover", note: "Transfusion vitals and ABG review to be handed over to evening nurse.", time: "10:00" },
  ];
}

function getPatientForSupervision(patientId: string, bedNo?: string) {
  return icuPatients.find((patient) => patient.id === patientId || patient.bedNo === bedNo) ?? icuPatients[0];
}

function getSupervisionRole(nurse: string, fallback: SupervisionRole = "Ward Nurse"): SupervisionRole {
  const lower = nurse.toLowerCase();
  if (lower.includes("head")) return "Head Nurse";
  if (lower.includes("unit")) return "Unit Nurse";
  if (lower.includes("doctor")) return "Duty Doctor";
  if (lower.includes("ward") || lower.includes("night")) return "Ward Nurse";
  return fallback;
}

function getSupervisionNurses(items: SupervisionItem[], mode: SupervisionMode) {
  const base = new Set<string>();
  icuPatients.forEach((patient) => {
    base.add(patient.assignedWardNurse);
    base.add(patient.assignedUnitNurse);
  });
  items.forEach((item) => base.add(item.nurse));
  const nurses = Array.from(base).filter((nurse) => mode === "head" || getSupervisionRole(nurse) !== "Head Nurse");
  return nurses.sort((first, second) => first.localeCompare(second));
}

function buildNurseSummaries(items: SupervisionItem[]) {
  const nurseNames = Array.from(new Set([
    ...icuPatients.flatMap((patient) => [patient.assignedWardNurse, patient.assignedUnitNurse]),
    ...items.map((item) => item.nurse),
  ])).sort((first, second) => first.localeCompare(second));

  return nurseNames.map((nurse) => {
    const assignedPatients = new Set(icuPatients.filter((patient) => patient.assignedWardNurse === nurse || patient.assignedUnitNurse === nurse).map((patient) => patient.id));
    const activeItems = items.filter((item) => item.nurse === nurse && !isClosedSupervisionStatus(item.status));
    const overdue = activeItems.filter((item) => item.status === "Overdue" || item.status === "Late").length;
    const critical = activeItems.filter((item) => item.priority === "Critical").length;
    const documentation = Math.max(62, Math.min(98, 96 - activeItems.length * 2 - overdue * 5 - critical * 4));
    const status = critical || overdue ? "Needs supervision" : activeItems.length > 6 ? "Heavy workload" : documentation < 85 ? "Docs pending" : "On track";
    return {
      nurse,
      patients: assignedPatients.size,
      active: activeItems.length,
      overdue,
      critical,
      documentation,
      status,
    };
  });
}

function isClosedSupervisionStatus(status: string) {
  const lower = status.toLowerCase();
  return lower.includes("completed") || lower.includes("administered") || lower.includes("resolved") || lower.includes("signed");
}

function supervisionPriorityTone(priority: SupervisionPriority): StatusTone {
  if (priority === "Critical") return "critical";
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  if (priority === "Routine") return "info";
  return "muted";
}

function supervisionMetricClass(tone: StatusTone) {
  if (tone === "critical") return "border-l-critical";
  if (tone === "danger") return "border-l-danger";
  if (tone === "warning") return "border-l-warning";
  if (tone === "success") return "border-l-success";
  if (tone === "muted") return "border-l-muted";
  return "border-l-info";
}

function supervisionMiniStatClass(tone: StatusTone) {
  if (tone === "critical") return "border-critical/30 bg-critical/10";
  if (tone === "danger") return "border-danger/30 bg-danger/10";
  if (tone === "warning") return "border-warning/30 bg-warning/10";
  if (tone === "success") return "border-success/30 bg-success/10";
  if (tone === "muted") return "border-border bg-muted";
  return "border-info/30 bg-info/10";
}

function DutyDoctorMonitoring() {
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Duty Doctor Review Date & Time Filter" compact />
      <IcuAlerts />
      <GenericTable title="Latest Vitals For Duty Doctor" rows={icuVitals} />
      <DoctorInstructions />
    </div>
  );
}

function IcuAlerts() {
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Alert Date & Time Filter" compact />
      <GenericTable title="ICU Alerts" rows={icuAlerts} />
    </div>
  );
}

function TransferDischarge() {
  const rows = [
    { id: "td-001", bedNo: "ICU-B04", orderType: "Transfer to ward", doctor: "Dr. Sameer Mehta", destination: "Medical ward", nurseClearance: "Pending", pharmacy: "Pending", lab: "Clear", billing: "Pending", status: "Ordered" },
    { id: "td-002", bedNo: "ICU-A01", orderType: "Continue ICU care", doctor: "Dr. Sameer Mehta", destination: "-", nurseClearance: "-", pharmacy: "-", lab: "Pending", billing: "-", status: "Hold" },
    { id: "td-003", bedNo: "ICU-X01", orderType: "Death declaration", doctor: "Duty Doctor", destination: "Mortuary workflow", nurseClearance: "Documentation required", pharmacy: "Return medicines", lab: "Stop pending", billing: "Final bill", status: "Workflow template" },
  ];
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Order Date & Time Filter" compact />
      <GenericTable title="Transfer / Discharge / Death Orders" rows={rows} />
    </div>
  );
}

function NursingNotes() {
  const rows = [
    { id: "note-001", type: "Critical event note", patient: "Aisha Khan", author: "Ward Nurse Kavita", time: "09:00", note: "Hypotension and low oxygen escalated to duty doctor.", attachment: "No" },
    { id: "note-002", type: "Transfusion note", patient: "Rohan Das", author: "Ward Nurse Arjun", time: "09:20", note: "PRBC running, no reaction observed.", attachment: "No" },
    { id: "note-003", type: "Instruction follow-up", patient: "Meera Sharma", author: "Ward Nurse Kavita", time: "10:00", note: "Hourly neuro checks continued.", attachment: "No" },
  ];
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Nursing Notes Date & Time Filter" compact />
      <GenericTable title="Structured Nursing Notes" rows={rows} />
    </div>
  );
}

function AuditLogs() {
  return (
    <div className="space-y-4">
      <DateTimeFilterPanel title="Audit Date & Time Filter" compact />
      <GenericTable title="Nursing Audit Logs" rows={activityLogs} />
    </div>
  );
}

function SmartWorkflowField({ label, value, readOnly, wide }: { label: string; value?: string; readOnly?: boolean; wide?: boolean }) {
  const options = fieldOptions(label, value);
  const lower = label.toLowerCase();
  const isLongText = lower.includes("condition")
    || lower.includes("diagnosis")
    || lower.includes("summary")
    || (lower.includes("instruction") && !lower.includes("type"))
    || lower.includes("remarks")
    || lower.includes("notes")
    || lower.includes("reason")
    || lower.includes("plan");

  if (isLongText && !readOnly) {
    return (
      <label className={`space-y-1 text-sm ${wide ? "sm:col-span-2" : ""}`}>
        <span className="font-medium text-foreground">{label}</span>
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
          defaultValue={value}
          placeholder={label}
        />
      </label>
    );
  }

  if (options && !readOnly) {
    return (
      <label className={`space-y-1 text-sm ${wide ? "sm:col-span-2" : ""}`}>
        <span className="font-medium text-foreground">{label}</span>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/20"
          defaultValue={options.includes(value ?? "") ? value : options[0]}
        >
          {options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className={`space-y-1 text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="font-medium text-foreground">{label}</span>
      <Input readOnly={readOnly} defaultValue={value} placeholder={label} />
    </label>
  );
}

function GenericTable({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  const [activeRow, setActiveRow] = React.useState<{ mode: "View" | "Update"; row: Record<string, unknown> } | null>(null);
  const columns = Object.keys(rows[0] ?? {}).filter((key) => key !== "id");
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{rows.length} workflow records.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                <tr>
                  {columns.map((key) => <th className="border-b border-r border-border px-3 py-2 text-left" key={key}>{labelize(key)}</th>)}
                  <th className="border-b border-border px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr className="border-b border-border last:border-0" key={String(row.id)}>
                    {columns.map((key) => <td className="border-r border-border px-3 py-2" key={key}>{renderValue(key, row[key])}</td>)}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="outline" onClick={() => setActiveRow({ mode: "View", row })}>View</Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveRow({ mode: "Update", row })}>Update</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <TableActionDialog
        title={title}
        activeRow={activeRow}
        onOpenChange={(open) => !open && setActiveRow(null)}
        onComplete={(mode, row) => {
          toast.success(`${mode} saved for ${String(row.patientName ?? row.patient ?? row.bedNo ?? row.id ?? title)}`);
          setActiveRow(null);
        }}
      />
    </>
  );
}

function QuickAddDialog({
  open,
  onOpenChange,
  pageTitle,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageTitle: string;
  onSaved: (message: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(620px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          <DialogHeader title={`Add ${pageTitle} Record`} description="Create a nursing workflow record." />
          <div className="grid gap-3 overflow-y-auto p-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Record type</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue="Nurse task">
                {["Nurse task", "Vitals entry", "Medication note", "Doctor instruction", "Transfer clearance", "Nursing note"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Patient / bed</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20">
                {icuPatients.map((patient) => <option key={patient.id}>{patient.bedNo} - {patient.patientName}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Priority</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue="High">
                {["Critical", "High", "Medium", "Routine"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="font-medium text-foreground">Remarks</span>
              <textarea className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue="Record created during ICU nursing workflow." />
            </label>
          </div>
          <DialogFooter
            onCancel={() => onOpenChange(false)}
            primaryLabel="Save record"
            onPrimary={() => {
              onSaved(`${pageTitle} record added`);
              onOpenChange(false);
            }}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PatientActionDialog({
  activeAction,
  onOpenChange,
  onComplete,
}: {
  activeAction: { action: PatientAction; patient: IcuPatient } | null;
  onOpenChange: (open: boolean) => void;
  onComplete: (action: PatientAction, patient: IcuPatient) => void;
}) {
  const action = activeAction?.action;
  const patient = activeAction?.patient;

  return (
    <Dialog.Root open={Boolean(activeAction)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[92dvh] w-[min(780px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          {action && patient ? (
            <>
              <DialogHeader title={`${action} - ${patient.patientName}`} description={`${patient.bedNo} | ${patient.mrn} | ${patient.unit}`} />
              <div className="grid gap-4 overflow-y-auto p-4 lg:grid-cols-[260px_1fr]">
                <div className="space-y-3 rounded-lg border border-border bg-surface-muted p-3">
                  <div>
                    <div className="text-lg font-semibold text-foreground">{patient.patientName}</div>
                    <div className="text-xs text-muted-foreground">{patient.ageGender} | {patient.admissionSource}</div>
                  </div>
                  <PatientInfoTile label="Diagnosis" value={patient.diagnosis} />
                  <PatientInfoTile label="Admitting doctor" value={patient.admittingDoctor} />
                  <PatientInfoTile label="Ward nurse" value={patient.assignedWardNurse} />
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={patient.criticalityScore >= 8 ? "critical" : "warning"}>Score {patient.criticalityScore}</Badge>
                    <Badge tone={toneForStatus(patient.currentStatus)}>{patient.currentStatus}</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <PatientActionBody action={action} patient={patient} />
                </div>
              </div>
              <DialogFooter
                onCancel={() => onOpenChange(false)}
                primaryLabel={patientPrimaryLabel(action)}
                primaryVariant={action === "Discharge" ? "danger" : "default"}
                onPrimary={() => onComplete(action, patient)}
              />
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PatientActionBody({ action, patient }: { action: PatientAction; patient: IcuPatient }) {
  if (action === "View") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <PatientInfoTile label="Admission time" value={patient.admissionTime} />
        <PatientInfoTile label="Consulting doctor" value={patient.consultingDoctor} />
        <PatientInfoTile label="Duty doctor" value={patient.dutyDoctor} />
        <PatientInfoTile label="Unit nurse" value={patient.assignedUnitNurse} />
        <PatientInfoTile label="Pending tasks" value={`${patient.pendingTasks} open tasks`} />
        <PatientInfoTile label="Last vitals" value={patient.lastVitalsTime} />
      </div>
    );
  }

  if (action === "Monitor") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <WorkflowField label="Temperature" value="38.4 C" />
        <WorkflowField label="Pulse" value="126 /min" />
        <WorkflowField label="BP" value="92/58 mmHg" />
        <WorkflowField label="SpO2" value="93%" />
        <WorkflowField label="GCS" value="13" />
        <WorkflowField label="Nurse remarks" value="Vitals reviewed, duty doctor informed." wide />
      </div>
    );
  }

  if (action === "Medication") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <WorkflowField label="Medication" value="Meropenem" />
        <WorkflowField label="Dose" value="1g" />
        <WorkflowField label="Route" value="IV" />
        <WorkflowField label="Scheduled time" value="Now due" />
        <WorkflowField label="Double verification" value="Required for high-risk meds" />
        <WorkflowField label="Administration note" value="Administered after patient identity verification." wide />
      </div>
    );
  }

  if (action === "Notes") {
    return (
      <div className="space-y-3">
        <WorkflowField label="Note type" value="Shift nursing note" />
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Nursing note</span>
          <textarea className="min-h-32 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" defaultValue={`Patient ${patient.patientName} monitored. Alerts reviewed and handover note prepared.`} />
        </label>
      </div>
    );
  }

  if (action === "Transfer") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <WorkflowField label="Destination" value="Medical ward" />
        <WorkflowField label="Doctor order" value="Transfer after stabilization" />
        <WorkflowField label="Nurse clearance" value="Pending checklist" />
        <WorkflowField label="Pharmacy / lab / billing" value="Clearance in progress" />
        <WorkflowField label="Transfer remarks" value="Oxygen support and latest vitals to be handed over." wide />
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <WorkflowField label="Discharge type" value="ICU discharge" />
      <WorkflowField label="Doctor order" value="Discharge from ICU after review" />
      <WorkflowField label="Nurse clearance" value="Pending documentation" />
      <WorkflowField label="Summary" value="Transfer/discharge summary generated for approval." wide />
    </div>
  );
}

function patientPrimaryLabel(action: PatientAction) {
  if (action === "View") return "Close after review";
  if (action === "Monitor") return "Save monitoring";
  if (action === "Medication") return "Administer medication";
  if (action === "Notes") return "Save note";
  if (action === "Transfer") return "Create transfer order";
  return "Confirm discharge workflow";
}

function TableActionDialog({
  title,
  activeRow,
  onOpenChange,
  onComplete,
}: {
  title: string;
  activeRow: { mode: "View" | "Update"; row: Record<string, unknown> } | null;
  onOpenChange: (open: boolean) => void;
  onComplete: (mode: "View" | "Update", row: Record<string, unknown>) => void;
}) {
  const mode = activeRow?.mode;
  const row = activeRow?.row;
  const fields = Object.entries(row ?? {}).filter(([key]) => key !== "id");

  return (
    <Dialog.Root open={Boolean(activeRow)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
          {mode && row ? (
            <>
              <DialogHeader title={`${mode} ${title}`} description="Review and update workflow fields." />
              <div className="grid gap-3 overflow-y-auto p-4 sm:grid-cols-2">
                {fields.map(([key, value]) => (
                  <WorkflowField key={key} label={labelize(key)} value={String(value ?? "-")} readOnly={mode === "View"} />
                ))}
                {mode === "Update" ? <WorkflowField label="Action remarks" value="Updated during nursing workflow review." wide /> : null}
              </div>
              <DialogFooter
                onCancel={() => onOpenChange(false)}
                primaryLabel={mode === "View" ? "Close detail" : "Save update"}
                onPrimary={() => onComplete(mode, row)}
              />
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DialogHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-b border-border bg-surface-muted px-4 py-3">
      <Dialog.Title className="text-base font-semibold text-foreground">{title}</Dialog.Title>
      <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description>
    </div>
  );
}

function DialogFooter({
  onCancel,
  onPrimary,
  primaryLabel,
  primaryVariant = "default",
}: {
  onCancel: () => void;
  onPrimary: () => void;
  primaryLabel: string;
  primaryVariant?: "default" | "danger";
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-border bg-surface-muted p-3 sm:flex-row sm:justify-end">
      <Dialog.Close asChild>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </Dialog.Close>
      <Button variant={primaryVariant} onClick={onPrimary}>{primaryLabel}</Button>
    </div>
  );
}

function WorkflowField({ label, value, wide, readOnly }: { label: string; value: string; wide?: boolean; readOnly?: boolean }) {
  return <SmartWorkflowField label={label} value={value} wide={wide} readOnly={readOnly} />;
}

function fieldOptions(label: string, currentValue?: string) {
  const lower = label.toLowerCase();
  const patientOptions = icuPatients.map((patient) => `${patient.bedNo} - ${patient.patientName}`);
  const bedOptions = ["ICU-A01", "ICU-A02", "ICU-B03", "ICU-B04", "ICU-C05", "ICU-C06"];
  const unitOptions = ["Medical ICU", "Cardiac ICU", "Neuro ICU", "Isolation ICU", "Post-op ICU"];
  const unitNurses = ["Unit Nurse Priya", "Unit Nurse Meera", "Unit Nurse Sana"];
  const wardNurses = ["Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Nurse Neha"];
  const nurses = Array.from(new Set([...unitNurses, ...wardNurses]));
  const doctors = ["Dr. Sameer Mehta", "Dr. Kavita Rao", "Dr. Aman Verma", "Dr. Neha Malik", "Dr. Imran Shah", "Duty Doctor"];
  const medications = Array.from(new Set(medicationRows.map((row) => row.medication)));
  const baseOptions: Array<[boolean, string[]]> = [
    [lower.includes("select patient") || lower === "patient" || lower.includes("patient / bed") || lower.includes("icu patient"), patientOptions],
    [lower.includes("admission source") || lower.includes("source"), ["Emergency", "General ward", "Post-surgical unit", "Direct ICU admission"]],
    [lower.includes("icu unit") || lower === "unit", unitOptions],
    [lower.includes("bed"), bedOptions],
    [lower.includes("doctor order"), ["Transfer after stabilization", "Discharge after review", "Continue ICU care", "Urgent surgery review", "Death declaration workflow"]],
    [lower.includes("unit nurse"), unitNurses],
    [lower.includes("ward nurse") || lower.includes("incoming nurse") || lower.includes("outgoing nurse") || lower.includes("assigned nurse"), wardNurses],
    [lower.includes("recorded by") || (lower.includes("nurse") && !lower.includes("clearance")), nurses],
    [lower.includes("doctor"), doctors],
    [lower.includes("shift type"), ["Morning shift", "Evening shift", "Night shift", "Emergency handover"]],
    [lower.includes("priority") || lower.includes("severity"), ["Critical", "High", "Medium", "Routine", "Info"]],
    [lower.includes("status") || lower.includes("decision"), ["Pending", "In progress", "Completed", "Escalated", "Acknowledged", "Resolved", "Ordered", "Hold", "Approved"]],
    [lower.includes("current status"), ["Critical", "Ventilated", "Stable ICU care", "Ready for transfer", "Discharge ordered", "Death workflow"]],
    [lower.includes("record type"), ["Nurse task", "Vitals entry", "Medication note", "Doctor instruction", "Transfer clearance", "Nursing note"]],
    [lower.includes("note type"), ["Shift nursing note", "Critical event note", "Medication note", "Transfusion note", "Intake/output note", "Doctor instruction follow-up", "General nursing observation"]],
    [lower.includes("medication") || lower.includes("medicine"), medications.length ? medications : ["Meropenem", "Noradrenaline", "Pantoprazole", "Insulin"]],
    [lower.includes("oxygen flow"), ["Room air", "Nasal cannula 2 L/min", "Simple mask 4 L/min", "NRBM 10 L/min", "NIV support", "Ventilator support"]],
    [lower.includes("delivery method"), ["Room air", "Nasal cannula", "Simple mask", "NRBM", "NIV support", "Ventilator support"]],
    [lower.includes("pulse rhythm"), ["Regular", "Irregular", "Tachycardia", "Bradycardia", "Weak pulse"]],
    [lower.includes("pulse source"), ["Manual radial pulse", "Monitor", "Apex beat", "Doppler"]],
    [lower.includes("pulse site"), ["Radial", "Brachial", "Carotid", "Femoral", "Pedal"]],
    [lower.includes("pulse quality"), ["Normal", "Weak", "Bounding", "Thready", "Not palpable"]],
    [lower.includes("pulse action"), ["No immediate action", "Repeat reading", "Inform duty doctor", "Start escalation", "Document and observe"]],
    [lower.includes("route"), ["IV", "Oral", "Nebulization", "Subcutaneous", "Intramuscular", "NG tube"]],
    [lower.includes("frequency"), ["STAT", "Once daily", "BD", "TDS", "QID", "Hourly", "SOS"]],
    [lower.includes("pain score"), ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Unable"]],
    [lower.includes("gcs"), ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"]],
    [lower.includes("scheduled time") || lower.includes("due time") || lower.includes("arrival time") || lower.includes("handover time"), ["Now", "Next 15 min", "Next 30 min", "Next 1 hour", "Morning round", "Evening shift", "Night shift"]],
    [lower.includes("destination"), ["Medical ward", "Surgery / OT", "Step-down ICU", "Discharge lounge", "Mortuary workflow"]],
    [lower.includes("discharge type"), ["ICU discharge", "Transfer to ward", "Transfer to surgery", "Death declaration", "Continue ICU care"]],
    [lower.includes("order type"), ["Transfer to ward", "Transfer to surgery", "ICU discharge", "Death declaration", "Continue ICU care"]],
    [lower.includes("clearance"), ["Pending", "Cleared", "Documentation required", "Return medicines", "Final bill pending", "Not required"]],
    [lower.includes("blood group"), ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
    [lower.includes("component"), ["PRBC", "Platelets", "FFP", "Cryoprecipitate", "Whole blood"]],
    [lower.includes("crossmatch"), ["Compatible", "Pending", "Incompatible", "Emergency issue"]],
    [lower.includes("modality"), ["Portable X-ray", "CT", "MRI", "Ultrasound", "Echo"]],
    [lower.includes("investigation"), ["ABG", "CBC", "Electrolytes", "LFT", "RFT", "Blood culture", "Troponin"]],
    [lower.includes("ventilator"), ["Room air", "Oxygen mask", "NIV support", "Invasive ventilation", "Weaning trial"]],
    [lower.includes("double verification"), ["Required for high-risk meds", "Verified by head nurse", "Not required", "Pending verification"]],
    [lower.includes("attachment"), ["No", "Yes", "Pending upload"]],
  ];
  const match = baseOptions.find(([condition]) => condition)?.[1] ?? null;
  if (!match || !currentValue || match.includes(currentValue) || currentValue === "-") return match;
  return [currentValue, ...match];
}

function renderValue(key: string, value: unknown) {
  const text = String(value ?? "-");
  if (key.toLowerCase().includes("status") || key === "currentStatus") return <StatusPill tone={toneForStatus(text)}>{text}</StatusPill>;
  if (key.toLowerCase().includes("priority") || key.toLowerCase().includes("severity")) return <Badge tone={toneForPriority(text as never)}>{text}</Badge>;
  if (key.toLowerCase().includes("alert") || key.toLowerCase().includes("abnormal")) return <Badge tone={text === "true" || text !== "No" ? "danger" : "success"}>{text}</Badge>;
  return text;
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
