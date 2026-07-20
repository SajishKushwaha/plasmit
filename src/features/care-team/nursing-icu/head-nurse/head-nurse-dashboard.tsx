"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertTriangle, Archive, ArrowLeftRight, BedDouble, CheckCircle2, ChevronLeft, ChevronRight, Eye, Monitor, RotateCcw, Stethoscope, Syringe, Users, Wind, X } from "lucide-react";

import { CenterModal } from "@/components/ui/center-modal";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";
import { StatusPill as UiStatusPill } from "@/components/ui/status-pill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getAvailableIcuNursesForPatient,
  getHeadNurseIcuDashboardRows,
  headNursePatients,
  headNurseStaffRows,
  getHeadNursePatientRows,
  selectedUnitNurseForPatient,
  setSelectedUnitNurseForPatient,
} from "./head-nurse-mock-data";
import { doctorInstructions, icuAlerts, icuPatients, icuTasks } from "../nursing-icu-data";
import type { HeadNurseIcuDashboardRow, HeadNursePatientRow, HeadNurseTone } from "./head-nurse-types";
import { getMappedDevicesForPatient, type IcuMappedDeviceType } from "../nursing-icu-device-mappings";
import { getHospitalDateKey, isPatientArchived } from "./head-nurse-archive";

const PAGE_SIZE = 8;
const ICU_PAGE_SIZE = 8;
const ESCALATION_STORE_KEY = "head-nurse-escalation-history";

type DashboardView = "icu" | "patients";

type AssignmentDialogState = {
  row: HeadNursePatientRow;
};

type WorkflowDialogState = {
  row: HeadNursePatientRow;
  status: string;
  source: "unit-staff" | "assignment-lock";
};

type QuickAssignState = {
  rowId: string;
  nurse: string;
};

type BedsDialogState = {
  row: HeadNurseIcuDashboardRow;
};

type VentilatorDialogState = {
  row: HeadNurseIcuDashboardRow;
};

type MonitorDialogState = {
  row: HeadNurseIcuDashboardRow;
};

type InfusionPumpDialogState = {
  row: HeadNurseIcuDashboardRow;
};

type OtherDevicesDialogState = {
  row: HeadNurseIcuDashboardRow;
};

type NurseDialogState = {
  row: HeadNurseIcuDashboardRow;
};

type DashboardEscalationStatus = "Open" | "Awaiting Review" | "Forwarded" | "Resolved";
type DashboardEscalationDisplayStatus = "Pending" | "Escalated" | "Resolved";
type DashboardEscalationSeverity = "Critical" | "Medium" | "Info";

type DashboardEscalationRow = {
  recordKey: string;
  patientId: string;
  raisedBy: string;
  escalation: string;
  escalationDetail: string;
  severity: DashboardEscalationSeverity;
  status: DashboardEscalationStatus;
  unitAction: string;
  unitActionNote: string;
  sourceLabel: string;
  createdAt: string;
};

type DashboardEscalationStore = Record<string, { status: DashboardEscalationStatus; unitAction: string; unitActionNote: string; updatedAt: string }>;

type EscalationDialogState = {
  row: HeadNursePatientRow;
  escalations: DashboardEscalationRow[];
};

type DashboardHandoverStatus = "Verified" | "Pending" | "Carry Forward" | "Escalated";

type DashboardHandoverRow = {
  handoverFrom: string;
  handoverTo: string;
  condition: string;
  conditionDetail: string;
  status: DashboardHandoverStatus;
  handoverAt: string;
  openAlerts: number;
  pendingTasks: number;
  pendingOrders: number;
  diagnosis: string;
};

type HandoverDialogState = {
  row: HeadNursePatientRow;
  handover: DashboardHandoverRow;
};

function subscribeHydrationStore() {
  return () => undefined;
}

function getHydratedClientSnapshot() {
  return true;
}

function getHydratedServerSnapshot() {
  return false;
}

function subscribeHospitalDateStore(onStoreChange: () => void) {
  const intervalId = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(intervalId);
}

function getHospitalDateSnapshot() {
  return getHospitalDateKey();
}

function unitNurseNameForDashboardRow(row: HeadNursePatientRow, includeStoredState: boolean) {
  const assignmentLabel = row.assignmentStatus.startsWith("ICU Nurse ") ? row.assignmentStatus.slice("ICU Nurse ".length) : row.assignmentStatus;
  const assignedNurse = selectedUnitNurseForPatient(row.patient, { includeStoredState }) || (assignmentLabel === "Locked" ? "" : assignmentLabel.trim());
  return assignedNurse === "Select ICU Nurse" || assignedNurse === "Assign" ? "" : assignedNurse;
}

export function HeadNurseDashboard({ archivedOnly = false }: { archivedOnly?: boolean } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultView: DashboardView = "icu";
  const viewParam = searchParams.get("view");
  const view: DashboardView = archivedOnly || viewParam === "patients" ? "patients" : defaultView;
  const hospitalDateKey = React.useSyncExternalStore(subscribeHospitalDateStore, getHospitalDateSnapshot, getHospitalDateSnapshot);
  const [page, setPage] = React.useState(1);
  const [statusVersion, setStatusVersion] = React.useState(0);
  const [activeAssignment, setActiveAssignment] = React.useState<AssignmentDialogState | null>(null);
  const [activeWorkflow, setActiveWorkflow] = React.useState<WorkflowDialogState | null>(null);
  const [activeBeds, setActiveBeds] = React.useState<BedsDialogState | null>(null);
  const [activeVentilator, setActiveVentilator] = React.useState<VentilatorDialogState | null>(null);
  const [activeMonitor, setActiveMonitor] = React.useState<MonitorDialogState | null>(null);
  const [activeInfusionPump, setActiveInfusionPump] = React.useState<InfusionPumpDialogState | null>(null);
  const [activeOtherDevices, setActiveOtherDevices] = React.useState<OtherDevicesDialogState | null>(null);
  const [activeNurse, setActiveNurse] = React.useState<NurseDialogState | null>(null);
  const [activeEscalation, setActiveEscalation] = React.useState<EscalationDialogState | null>(null);
  const [activeHandover, setActiveHandover] = React.useState<HandoverDialogState | null>(null);

  const [icuSearch, setIcuSearch] = React.useState("");
  const [patientSearch, setPatientSearch] = React.useState("");
  const [patientIcuTypeFilter, setPatientIcuTypeFilter] = React.useState("all");
  const [patientDoctorFilter, setPatientDoctorFilter] = React.useState("all");
  const [patientUnitNurseFilter, setPatientUnitNurseFilter] = React.useState("all");
  const [isHydrated, setIsHydrated] = React.useState(false);
  const includeStoredState = isHydrated;
  const icuRows = getHeadNurseIcuDashboardRows();
  const filteredIcuRows = React.useMemo(() => {
    const query = icuSearch.trim().toLowerCase();
    if (!query) return icuRows;
    return icuRows.filter((row) => row.unit.toLowerCase().includes(query));
  }, [icuRows, icuSearch]);
  const patientRows = getHeadNursePatientRows({ includeStoredState }).filter((row) => isPatientArchived(row.patient, hospitalDateKey) === archivedOnly);
  const patientIcuTypes = Array.from(new Set(patientRows.map((row) => row.patient.unit))).sort();
  const patientDoctors = Array.from(new Set(patientRows.map((row) => row.patient.dutyDoctor))).sort();
  const patientUnitNurses = Array.from(new Set(patientRows.map((row) => unitNurseNameForDashboardRow(row, includeStoredState)).filter(Boolean))).sort();
  const patientQuery = patientSearch.trim().toLowerCase();
  const filteredPatientRows = patientRows.filter((row) => {
    if (patientIcuTypeFilter !== "all" && row.patient.unit !== patientIcuTypeFilter) return false;
    if (patientDoctorFilter !== "all" && row.patient.dutyDoctor !== patientDoctorFilter) return false;
    if (patientUnitNurseFilter !== "all" && unitNurseNameForDashboardRow(row, includeStoredState) !== patientUnitNurseFilter) return false;
    if (!patientQuery) return true;
    const values = [row.patient.patientName, row.patient.bedNo, row.patient.mrn, row.patient.unit].join(" ").toLowerCase();
    return values.includes(patientQuery);
  });

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleViewChange = React.useCallback((nextView: DashboardView) => {
    setPage(1);
    router.push(`/nursing-icu/head-nurse?view=${nextView}`);
  }, [router]);

  React.useEffect(() => {
    if (!archivedOnly && !viewParam) {
      router.replace(`/nursing-icu/head-nurse?view=${defaultView}`);
    }
  }, [archivedOnly, defaultView, router, viewParam]);

  React.useEffect(() => {
    const refreshRows = () => setStatusVersion((version) => version + 1);
    window.addEventListener("head-nurse-workflow-status-change", refreshRows);
    window.addEventListener("head-nurse-escalation-store-change", refreshRows);
    window.addEventListener("storage", refreshRows);

    return () => {
      window.removeEventListener("head-nurse-workflow-status-change", refreshRows);
      window.removeEventListener("head-nurse-escalation-store-change", refreshRows);
      window.removeEventListener("storage", refreshRows);
    };
  }, []);

  void statusVersion;
  return (
    <div className="min-w-0 space-y-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
          {archivedOnly ? (
            <div className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-800">
              <Archive className="h-4 w-4 text-slate-500" /> Archived Records
            </div>
          ) : (
            <div className="grid w-[250px] shrink-0 grid-cols-[100px_1fr] gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <ViewButton active={view === "icu"} label="ICU Dashboard" onClick={() => handleViewChange("icu")} />
              <ViewButton active={view === "patients"} label="Patient Dashboard" onClick={() => handleViewChange("patients")} />
            </div>
          )}
          {view === "icu" ? (
            <div className="relative w-full max-w-[360px] lg:max-w-[420px]">
              <SearchInput
                aria-label="Search ICU unit"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                placeholder="Search ICU unit..."
                onChange={(event) => { setIcuSearch(event.target.value); setPage(1); }}
                value={icuSearch}
                type="search"
              />
            </div>
          ) : (
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-2">
              <div className="relative min-w-[150px] max-w-[220px] flex-1">
                <SearchInput
                  aria-label="Search patient, bed, MRN"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                  placeholder="Search patient, bed, MRN..."
                  onChange={(event) => { setPatientSearch(event.target.value); setPage(1); }}
                  value={patientSearch}
                  type="search"
                />
              </div>
              <Select ariaLabel="Filter by ICU type" className="w-[110px] shrink-0 px-2 text-xs" onValueChange={(value) => { setPatientIcuTypeFilter(value); setPage(1); }} options={[{ value: "all", label: "All ICU Types" }, ...patientIcuTypes.map((unit) => ({ value: unit, label: unit }))]} value={patientIcuTypeFilter} />
              <Select ariaLabel="Filter by doctor" className="w-[110px] shrink-0 px-2 text-xs" onValueChange={(value) => { setPatientDoctorFilter(value); setPage(1); }} options={[{ value: "all", label: "All Doctors" }, ...patientDoctors.map((doctor) => ({ value: doctor, label: doctor }))]} value={patientDoctorFilter} />
              <Select ariaLabel="Filter by unit nurse" className="w-[125px] shrink-0 px-2 text-xs" onValueChange={(value) => { setPatientUnitNurseFilter(value); setPage(1); }} options={[{ value: "all", label: "All Unit Nurses" }, ...patientUnitNurses.map((nurse) => ({ value: nurse, label: nurse }))]} value={patientUnitNurseFilter} />
              <HeaderIconButton
                ariaLabel="Reset filters"
                onClick={() => {
                  setPatientSearch("");
                  setPatientIcuTypeFilter("all");
                  setPatientDoctorFilter("all");
                  setPatientUnitNurseFilter("all");
                  setPage(1);
                }}
                tone="muted"
              >
                <RotateCcw className="h-4 w-4" />
              </HeaderIconButton>
              {!archivedOnly ? <div className="flex shrink-0 items-center gap-2">
                <HeaderIconButton
                  ariaLabel="Escalations"
                  onClick={() => router.push("/nursing-icu/head-nurse/alerts-delays")}
                  tone="danger"
                >
                  <AlertTriangle className="h-4 w-4" />
                </HeaderIconButton>
                <HeaderIconButton
                  ariaLabel="Handover"
                  onClick={() => router.push("/nursing-icu/head-nurse/shift-handover")}
                  tone="info"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </HeaderIconButton>
              </div> : null}
            </div>
          )}
        </div>
        {view === "icu" ? <IcuDashboardView onOpenBeds={(row) => setActiveBeds({ row })} onOpenInfusionPump={(row) => setActiveInfusionPump({ row })} onOpenMonitor={(row) => setActiveMonitor({ row })} onOpenOtherDevices={(row) => setActiveOtherDevices({ row })} onOpenVentilator={(row) => setActiveVentilator({ row })} onOpenNurse={(row) => setActiveNurse({ row })} page={page} rows={filteredIcuRows} setPage={setPage} /> : <PatientDashboardView onOpenAssignment={setActiveAssignment} onOpenEscalation={setActiveEscalation} onOpenHandover={setActiveHandover} onOpenWorkflow={setActiveWorkflow} page={page} patientRows={filteredPatientRows} readOnly={archivedOnly} setPage={setPage} />}
      </section>

      {activeBeds ? <BedsDialog onClose={() => setActiveBeds(null)} state={activeBeds} /> : null}
      {activeVentilator ? <VentilatorDialog onClose={() => setActiveVentilator(null)} state={activeVentilator} /> : null}
      {activeMonitor ? <MonitorDialog onClose={() => setActiveMonitor(null)} state={activeMonitor} /> : null}
      {activeInfusionPump ? <InfusionPumpDialog onClose={() => setActiveInfusionPump(null)} state={activeInfusionPump} /> : null}
      {activeOtherDevices ? <OtherDevicesDialog onClose={() => setActiveOtherDevices(null)} state={activeOtherDevices} /> : null}
      {activeNurse ? <NurseDialog onClose={() => setActiveNurse(null)} state={activeNurse} /> : null}
      {activeEscalation ? <EscalationDialog onClose={() => setActiveEscalation(null)} state={activeEscalation} /> : null}
      {activeHandover ? <HandoverDialog onClose={() => setActiveHandover(null)} state={activeHandover} /> : null}
      {activeAssignment ? <AssignmentDialog onClose={() => setActiveAssignment(null)} row={activeAssignment.row} /> : null}
      {activeWorkflow ? <WorkflowDialog onClose={() => setActiveWorkflow(null)} onOpenAssignment={(row) => { setActiveAssignment({ row }); setActiveWorkflow(null); }} state={activeWorkflow} /> : null}

    </div>
  );
}

function PatientDashboardView({ onOpenAssignment, onOpenEscalation, onOpenHandover, onOpenWorkflow, page, patientRows, readOnly = false, setPage }: { onOpenAssignment: (state: AssignmentDialogState) => void; onOpenEscalation: (state: EscalationDialogState) => void; onOpenHandover: (state: HandoverDialogState) => void; onOpenWorkflow: (state: WorkflowDialogState) => void; page: number; patientRows: HeadNursePatientRow[]; readOnly?: boolean; setPage: React.Dispatch<React.SetStateAction<number>> }) {
  const router = useRouter();
  const [activeQuickAssign, setActiveQuickAssign] = React.useState<QuickAssignState | null>(null);
  const isHydrated = React.useSyncExternalStore(subscribeHydrationStore, getHydratedClientSnapshot, getHydratedServerSnapshot);
  const sortedPatientRows = patientRows
    .map((row, index) => {
      const assignmentLabel = row.assignmentStatus.startsWith("ICU Nurse ") ? row.assignmentStatus.slice("ICU Nurse ".length) : row.assignmentStatus;
      const assignedNurse = (isHydrated ? selectedUnitNurseForPatient(row.patient) : "") || (assignmentLabel === "Locked" ? "" : assignmentLabel.trim());
      const isAssigned = Boolean(assignedNurse) && assignedNurse !== "Select ICU Nurse" && assignedNurse !== "Assign";
      const isRedPatient = row.tone === "critical" || row.tone === "danger";
      const priority = isRedPatient ? 0 : !isAssigned ? 1 : 2;

      return { index, priority, row };
    })
    .sort((left, right) => left.priority - right.priority || left.index - right.index)
    .map(({ row }) => row);
  const totalPages = Math.max(1, Math.ceil(patientRows.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleRows = sortedPatientRows.slice(startIndex, startIndex + PAGE_SIZE);
  const firstVisible = patientRows.length ? startIndex + 1 : 0;
  const lastVisible = Math.min(startIndex + PAGE_SIZE, patientRows.length);

  return (
    <div>
      <div className="overflow-x-auto">
        <Table className={cn("w-full table-fixed border-collapse text-sm", readOnly ? "min-w-[1080px]" : "min-w-[1860px]")}>
          <colgroup>
            <col className="w-[230px]" />
            <col className="w-[210px]" />
            <col className="w-[170px]" />
            <col className="w-[150px]" />
            <col className="w-[150px]" />
            {!readOnly ? <col className="w-[145px]" /> : null}
            <col className="w-[250px]" />
            {!readOnly ? <col className="w-[170px]" /> : null}
            {!readOnly ? <col className="w-[155px]" /> : null}
            {!readOnly ? <col className="w-[155px]" /> : null}
            {!readOnly ? <col className="w-[155px]" /> : null}
            <col className="w-[120px]" />
          </colgroup>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-950">
              <TableHead className="sticky left-0 z-30 w-[230px] bg-slate-50 px-5 py-3 text-left shadow-[1px_0_0_0_#e2e8f0]">Patient / BED</TableHead>
              <TableHead className="px-4 py-3 text-left">Diagnosis</TableHead>
              <TableHead className="px-4 py-3 text-left">Doctor</TableHead>
              <TableHead className="px-4 py-3 text-center">Date of Admission</TableHead>
              <TableHead className="px-4 py-3 text-center">Date of Discharge</TableHead>
              {!readOnly ? <TableHead className="px-4 py-3 text-center">Device Mapped</TableHead> : null}
              {/* <TableHead className="px-4 py-3 text-center">Unit & Staff Check</TableHead> */}
              <TableHead className="px-4 py-3 text-center">Shift In Charge</TableHead>
              {!readOnly ? <TableHead className="px-4 py-3 text-center">Assigned Nurse</TableHead> : null}
              {!readOnly ? <TableHead className="px-4 py-3 text-center">Alerts</TableHead> : null}
              {!readOnly ? <TableHead className="px-4 py-3 text-center">Escalation</TableHead> : null}
              {!readOnly ? <TableHead className="px-4 py-3 text-center">Handover</TableHead> : null}
              <TableHead className="px-4 py-3 text-center">Patient Record</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row) => {
              const unitStaffStatus = getUnitStaffStatus(row);
              const unitStaffTone = statusTone(unitStaffStatus, row.tone);
              const defaultAssignedUnitNurse = row.assignmentStatus === "Locked" ? "" : row.assignmentStatus.replace(/^ICU Nurse\s+/i, "").trim();
              const assignedUnitNurse = selectedUnitNurseForPatient(row.patient) || defaultAssignedUnitNurse;
              const hasAssignment = Boolean(assignedUnitNurse) && assignedUnitNurse !== "Select ICU Nurse" && assignedUnitNurse !== "Assign";
              const existingAssignedUnitNurse = selectedUnitNurseForPatient(row.patient, { includeStoredState: false });
              const hasExistingCareMapping = hasAssignment && assignedUnitNurse === existingAssignedUnitNurse;
              const dependentWorkflowUnlocked = hasAssignment;
              const assignedBedNurse = hasExistingCareMapping ? headNurseStaffRows.find((staff) => staff.nurse === assignedUnitNurse)?.bedNurse ?? "" : "";
              const archivedAssignedNurse = row.patient.assignedWardNurse.replace(/^Ward Nurse\s+/i, "").trim();
              const assignmentActionLabel = hasAssignment ? "Reassign Nurse" : "Assign Nurse";
              const mappedDevices = hasExistingCareMapping ? getMappedDevicesForPatient(row.patient) : [];
              const escalationRows = dashboardEscalationsForPatient(row.patient, isHydrated);
              const primaryEscalation = escalationRows[0];
              const escalationStatus = dashboardEscalationSummaryStatus(escalationRows);
              const handover = dashboardHandoverForPatient(row.patient, isHydrated);

              return (
                <TableRow className="border-b border-slate-200 last:border-b-0" key={row.patient.id}>
                  <TableCell className="sticky left-0 z-20 h-px border-r border-slate-200 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
                    <div className={cn("relative h-full min-h-[64px] px-5 py-2 before:absolute before:inset-y-0 before:left-0 before:w-1", rowAccentClass(row.tone))}>
                      <p className={cn("text-base font-black", patientNameClass(row.tone))}>{row.patient.patientName}</p>
                      <p className="mt-2 text-sm font-black text-slate-950">{row.patient.bedNo} | {row.patient.unit}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3  text-left align-middle font-semibold text-slate-700">{row.patient.diagnosis}</TableCell>
                  <TableCell className="px-4 py-3 text-left align-middle font-semibold text-slate-700">{row.patient.dutyDoctor}</TableCell>
                  <TableCell className="px-4 py-3 text-center align-middle font-semibold text-slate-700">{row.patient.admissionTime.split(",")[0] || "--"}</TableCell>
                  <TableCell className="px-4 py-3 text-center align-middle font-semibold text-slate-700">{row.patient.dischargeTime?.split(",")[0] || "--"}</TableCell>
                  {!readOnly ? <TableCell className="px-4 py-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      {mappedDevices.length ? mappedDevices.map((device) => (
                        <DeviceMappedIcon
                          icon={mappedDeviceIcon(device.type)}
                          key={`${device.type}:${device.deviceId}`}
                          label={`${device.type}: ${device.deviceId}`}
                        />
                      )) : <span className="font-black text-slate-500">--</span>}
                    </div>
                  </TableCell> : null}
                  {/* <TableCell className="px-4 py-3 text-center align-middle">
                    <Button className={pillClass(unitStaffTone, true)} onClick={() => onOpenWorkflow({ row, status: unitStaffStatus, source: "unit-staff" })} type="button">
                      {unitStaffStatus}
                    </Button>
                  </TableCell> */}
                  <TableCell className="px-4 py-3 text-center align-middle">
                    {readOnly ? (
                      <span className={patientTablePillClass(hasAssignment ? "success" : "muted")}>{hasAssignment ? assignedUnitNurse : "--"}</span>
                    ) : activeQuickAssign?.rowId === row.patient.id ? (
                        <div className="inline-flex items-center gap-2 bg-white p-2 shadow-sm">
                          <Select
                            ariaLabel="Select ICU nurse"
                            className="min-w-[140px] bg-slate-50 font-black text-slate-900"
                            onValueChange={(value) => setActiveQuickAssign({ rowId: row.patient.id, nurse: value })}
                            options={getAvailableIcuNursesForPatient(row.patient).map((nurse) => {
                              const patientCount = headNursePatients.filter((patient) => patient.unit === row.patient.unit && selectedUnitNurseForPatient(patient) === nurse.nurse).length;
                              return { value: nurse.nurse, label: `${nurse.nurse} — (${patientCount}/${nurse.maxCapacity})` };
                            })}
                            value={activeQuickAssign.nurse}
                          />
                          <AssignmentControlButton
                            ariaLabel={assignmentActionLabel}
                            className="bg-green-700 text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!activeQuickAssign.nurse}
                            onClick={() => {
                              if (!activeQuickAssign.nurse) return;
                              setSelectedUnitNurseForPatient(row.patient.id, activeQuickAssign.nurse);
                              setActiveQuickAssign(null);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </AssignmentControlButton>
                          <AssignmentControlButton
                            ariaLabel="Cancel"
                            className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                            onClick={() => setActiveQuickAssign(null)}
                          >
                            <X className="h-4 w-4" />
                          </AssignmentControlButton>
                        </div>
                      ) : (
                        <div className="inline-flex items-center justify-center gap-2">
                          <Button suppressHydrationWarning className={patientTablePillClass(hasAssignment ? "success" : "warning", true)} type="button">
                            {hasAssignment ? assignedUnitNurse : "Assign"}
                          </Button>
                          <AssignmentControlButton
                              ariaLabel={assignmentActionLabel}
                              className="border border-slate-200 bg-white text-emerald-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                              onClick={() => setActiveQuickAssign({
                                rowId: row.patient.id,
                                nurse: selectedUnitNurseForPatient(row.patient) || getAvailableIcuNursesForPatient(row.patient)[0]?.nurse || "",
                              })}
                            >
                              <ArrowLeftRight className="h-4 w-4" />
                            </AssignmentControlButton>
                        </div>
                      )}
                  </TableCell>
                  {!readOnly ? <TableCell className="px-4 py-3 text-center align-middle font-semibold text-slate-700">
                    {readOnly ? (
                      <span className={patientTablePillClass(archivedAssignedNurse ? "success" : "muted")}>{archivedAssignedNurse || "--"}</span>
                    ) : dependentWorkflowUnlocked ? (
                      <span className={patientTablePillClass(assignedBedNurse ? "success" : "muted")}>{assignedBedNurse || "--"}</span>
                    ) : (
                      <span className={patientTablePillClass("muted")}>Locked</span>
                    )}
                  </TableCell> : null}
                  {!readOnly ? <TableCell className="px-4 py-3 text-center align-middle">
                    {readOnly ? (
                      <span className={patientTablePillClass(statusTone(row.alertStatus, row.tone))}>{row.alertStatus}</span>
                    ) : !dependentWorkflowUnlocked ? (
                      <span className={patientTablePillClass("muted")}>Locked</span>
                    ) : row.alertStatus === "Clear" ? (
                      <span className={patientTablePillClass(statusTone(row.alertStatus, row.tone))}>{row.alertStatus}</span>
                    ) : (
                      <Button className={patientTablePillClass(statusTone(row.alertStatus, row.tone), true)} onClick={() => router.push(`/icu-command-center/patients/${row.patient.id}?tab=events&eventFocus=open-alerts`)} type="button">
                        {row.alertStatus}
                      </Button>
                    )}
                  </TableCell> : null}
                  {!readOnly ? <TableCell className="px-4 py-3 text-center align-middle">
                    {readOnly ? (
                      primaryEscalation ? <span className={patientTablePillClass(escalationDisplayTone(escalationStatus))}>{escalationStatus}</span> : <span className="font-semibold text-slate-500">-</span>
                    ) : !dependentWorkflowUnlocked ? (
                      <span className={patientTablePillClass("muted")}>Locked</span>
                    ) : primaryEscalation ? (
                      <Button
                        aria-label={`${escalationRows.length} escalation${escalationRows.length === 1 ? "" : "s"}, ${escalationStatus}`}
                        className={patientTablePillClass(escalationDisplayTone(escalationStatus), true)}
                        onClick={() => onOpenEscalation({ row, escalations: escalationRows })}
                        type="button"
                      >
                        {escalationStatus}
                      </Button>
                    ) : (
                      <span className="font-semibold text-slate-500">-</span>
                    )}
                  </TableCell> : null}
                  {!readOnly ? <TableCell className="px-4 py-3 text-center align-middle">
                    {readOnly ? (
                      <span className={patientTablePillClass(handoverStatusTone(handover.status))}>{handover.status === "Carry Forward" ? "Carry forward" : handover.status}</span>
                    ) : dependentWorkflowUnlocked ? (
                      <Button className={patientTablePillClass(handoverStatusTone(handover.status), true)} onClick={() => onOpenHandover({ row, handover })} type="button">
                        {handover.status === "Carry Forward" ? "Carry forward" : handover.status}
                      </Button>
                    ) : (
                      <span className={patientTablePillClass("muted")}>Locked</span>
                    )}
                  </TableCell> : null}
                  <TableCell className="px-4 py-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      {activeQuickAssign?.rowId !== row.patient.id ? (
                        <IconActionButton ariaLabel="View patient overview" tone="info" onClick={() => router.push(`/icu-command-center/patients/${row.patient.id}?tab=overview`)}>
                          <Eye className="h-4 w-4 shrink-0" />
                        </IconActionButton>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Showing <span className="text-slate-950">{firstVisible}-{lastVisible}</span> of <span className="text-slate-950">{patientRows.length}</span> patients
        </p>
        <div className="flex items-center gap-2">
          <Button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={page === 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} type="button">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="inline-flex h-8 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">Page {page} / {totalPages}</span>
          <Button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={page === totalPages} onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))} type="button">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeviceMappedIcon({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span
      aria-label={label}
      className="group relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
      role="img"
      tabIndex={0}
    >
      <Icon className="h-4 w-4" />
      <span
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus:opacity-100"
        role="tooltip"
      >
        {label}
      </span>
    </span>
  );
}

function mappedDeviceIcon(type: IcuMappedDeviceType) {
  if (type === "Ventilator") return Wind;
  if (type === "Infusion Pump") return Syringe;
  return Monitor;
}

function IcuDashboardView({ onOpenBeds, onOpenInfusionPump, onOpenMonitor, onOpenOtherDevices, onOpenVentilator, onOpenNurse, page, rows, setPage }: { onOpenBeds: (row: HeadNurseIcuDashboardRow) => void; onOpenInfusionPump: (row: HeadNurseIcuDashboardRow) => void; onOpenMonitor: (row: HeadNurseIcuDashboardRow) => void; onOpenOtherDevices: (row: HeadNurseIcuDashboardRow) => void; onOpenVentilator: (row: HeadNurseIcuDashboardRow) => void; onOpenNurse: (row: HeadNurseIcuDashboardRow) => void; page: number; rows: HeadNurseIcuDashboardRow[]; setPage: React.Dispatch<React.SetStateAction<number>> }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / ICU_PAGE_SIZE));
  const startIndex = (page - 1) * ICU_PAGE_SIZE;
  const visibleRows = rows.slice(startIndex, startIndex + ICU_PAGE_SIZE);
  const firstVisible = rows.length ? startIndex + 1 : 0;
  const lastVisible = Math.min(startIndex + ICU_PAGE_SIZE, rows.length);
  return (
    <div>
      <div className="overflow-x-auto">
      <Table className="w-full min-w-[820px] border-collapse text-sm">
        <colgroup>
            <col className="w-[220px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
            <col className="w-[100px]" />
          </colgroup>
        <TableHeader>
          <TableRow className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-950">
            <TableHead className="sticky left-0 z-30 bg-slate-50 px-5 py-3 text-left shadow-[1px_0_0_0_#e2e8f0]">ICU Unit</TableHead>
            <TableHead className="px-4 py-3 text-center">Occupied Beds</TableHead>
            <TableHead className="px-4 py-3 text-center">Shift-In-Charge</TableHead>
            <TableHead className="px-4 py-3 text-center">Monitors</TableHead>
            <TableHead className="px-4 py-3 text-center">Occupied Ventilator</TableHead>
            <TableHead className="px-4 py-3 text-center">Infusion Pumps</TableHead>
            <TableHead className="px-4 py-3 text-center">Other Devices</TableHead>
            {/* <TableHead className="px-4 py-3 text-center">Alerts</TableHead> */}
            {/* <TableHead className="px-4 py-3 text-center">Status</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleRows.map((row) => (
            <TableRow className="border-b border-slate-200 last:border-b-0" key={row.id}>
              <TableCell className="sticky left-0 z-20 h-px border-r border-slate-200 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
                <DashboardUnitCell row={row} />
              </TableCell>
              <TableCell className="px-4 text-center align-middle">
                <Button
                  aria-label={`View occupied beds for ${row.unit}`}
                  className="w-full rounded-md bg-transparent p-0 shadow-none hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  variant="ghost"
                  onClick={() => onOpenBeds(row)}
                  type="button"
                >
                  <DashboardMatrixCell icon={BedDouble} title={`${row.occupiedBeds}/${row.totalBeds}`} detail={`${row.availableBeds} available`} tone={occupancyTone(row.occupiedBeds, row.totalBeds)} />
                </Button>
              </TableCell>
              
              <TableCell className="px-4 text-center align-middle">
                <Button
                  aria-label={`View nurses for ${row.unit}`}
                  className="w-full rounded-md bg-transparent p-0 shadow-none hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  variant="ghost"
                  onClick={() => onOpenNurse(row)}
                  type="button"
                >
                  <DashboardMatrixCell icon={Users} title={`${row.availableIcuNurses}/${row.totalIcuNurses}`} detail={`${row.totalIcuNurses - row.availableIcuNurses} assigned`} tone={availabilityTone(row.availableIcuNurses) ?? row.tone} />
                </Button>
              </TableCell>
              <TableCell className="px-4 text-center align-middle">
                <Button
                  aria-label={`View monitors in use for ${row.unit}`}
                  className="w-full rounded-md bg-transparent p-0 shadow-none hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  variant="ghost"
                  onClick={() => onOpenMonitor(row)}
                  type="button"
                >
                  <DashboardMatrixCell icon={Monitor} title={`${row.mappedMonitors}/${row.totalMonitors}`} detail={`${row.availableMonitors} available`} tone={availabilityTone(row.availableMonitors) ?? row.tone} />
                </Button>
              </TableCell>
              <TableCell className="px-4 text-center align-middle">
                <Button
                  aria-label={`View occupied ventilator beds for ${row.unit}`}
                  className="w-full rounded-md bg-transparent p-0 shadow-none hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  variant="ghost"
                  onClick={() => onOpenVentilator(row)}
                  type="button"
                >
                  <DashboardMatrixCell icon={ArrowLeftRight} title={`${row.mappedVentilators}/${row.ventilatorBeds}`} detail={`${row.availableVentilatorBeds} available`} tone={occupancyTone(row.mappedVentilators, row.ventilatorBeds)} />
                </Button>
              </TableCell>
              <TableCell className="px-4 text-center align-middle">
                <Button
                  aria-label={`View infusion pumps in use for ${row.unit}`}
                  className="w-full rounded-md bg-transparent p-0 shadow-none hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  variant="ghost"
                  onClick={() => onOpenInfusionPump(row)}
                  type="button"
                >
                  <DashboardMatrixCell icon={Syringe} title={`${row.mappedInfusionPumps}/${row.totalInfusionPumps}`} detail={`${row.availableInfusionPumps} available`} tone={availabilityTone(row.availableInfusionPumps) ?? row.tone} />
                </Button>
              </TableCell>
              <TableCell className="px-4 text-center align-middle">
                <Button
                  aria-label={`View other devices for ${row.unit}`}
                  className="w-full rounded-md bg-transparent p-0 shadow-none hover:bg-slate-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  variant="ghost"
                  onClick={() => onOpenOtherDevices(row)}
                  type="button"
                >
                  <DashboardMatrixCell icon={Activity} title={`${row.otherDevicesInUse}/${row.otherDevicesTotal}`} detail={`${row.otherDevicesAvailable} available`} tone={availabilityTone(row.otherDevicesAvailable) ?? row.tone} />
                </Button>
              </TableCell>
              {/* <TableCell className="px-4 py-4 text-center align-middle">
                <DashboardMatrixCell icon={ShieldAlert} title={`${row.openAlerts}`} tone={metricAvailabilityTone(row.openAlerts)} />
              </TableCell> */}
              {/* <TableCell className="px-4 py-4 text-center align-middle">
                <StatusPill label={row.status} tone={row.tone} />
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Showing <span className="text-slate-950">{firstVisible}-{lastVisible}</span> of <span className="text-slate-950">{rows.length}</span> ICU units
        </p>
        <div className="flex items-center gap-2">
          <Button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={page === 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))} type="button">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="inline-flex h-8 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">Page {page} / {totalPages}</span>
          <Button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={page === totalPages} onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))} type="button">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function NurseDialog({ onClose, state }: { onClose: () => void; state: NurseDialogState }) {
  const unitNurses = React.useMemo(
    () => headNurseStaffRows.filter((staff) => staff.unit === state.row.unit),
    [state.row.unit],
  );
  const nurseAssignments = React.useMemo(
    () =>
      unitNurses.map((nurse) => ({
        nurse,
        patients: headNursePatients.filter(
          (patient) => patient.unit === state.row.unit && selectedUnitNurseForPatient(patient) === nurse.nurse,
        ),
      })),
    [state.row.unit, unitNurses],
  );

  return (
    <CenterModal
      className="w-[min(94vw,768px)]"
      description={`${state.row.unit} | ${unitNurses.length} Unit nurses available`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="Unit Nurse Assignment"
    >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table className="w-full border-collapse text-sm">
              <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">Assigned Bed</TableHead>
                  <TableHead className="px-4 py-3 text-left">Nurse</TableHead>
                  <TableHead className="px-4 py-3 text-center">Patient Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nurseAssignments.length ? (
                  nurseAssignments.map(({ nurse, patients }) => (
                    <TableRow className="border-t border-slate-100" key={`${nurse.unit}-${nurse.nurse}`}>
                      <TableCell className="px-4 py-3 font-bold text-slate-950">{patients.length ? patients.map((patient) => patient.bedNo).join(", ") : "-"}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-slate-700">{nurse.nurse}</TableCell>
                      <TableCell className="px-4 py-3 text-center font-bold text-slate-950">{patients.length}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-center text-sm font-bold text-slate-500" colSpan={3}>
                      No ICU nurse found for this unit.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <Button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100" onClick={onClose} type="button">
            Close
          </Button>
        </div> */}
    </CenterModal>
  );
}
function VentilatorDialog({ onClose, state }: { onClose: () => void; state: VentilatorDialogState }) {
  const ventilatedBeds = React.useMemo(
    () =>
      headNursePatients
        .filter((patient) => patient.unit === state.row.unit && getMappedDevicesForPatient(patient).some((device) => device.type === "Ventilator"))
        .sort((left, right) => left.bedNo.localeCompare(right.bedNo)),
    [state.row.unit],
  );

  return (
    <CenterModal
      className="w-[min(94vw,768px)]"
      description={`${state.row.unit} | ${ventilatedBeds.length} occupied | ${state.row.ventilatorBeds} ventilator beds`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="Ventilator assignment"
    >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table className="w-full border-collapse text-sm">
              <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">Assign Ventilator Bed</TableHead>
                  <TableHead className="px-4 py-3 text-left">Patient Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventilatedBeds.length ? (
                  ventilatedBeds.map((patient) => (
                    <TableRow className="border-t border-slate-100" key={patient.id}>
                      <TableCell className="px-4 py-3 font-bold text-slate-950">{patient.bedNo}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-slate-700">{patient.patientName}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-center text-sm font-bold text-slate-500" colSpan={2}>
                      No ventilated patients found for this unit.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <Button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100" onClick={onClose} type="button">
            Close
          </Button>
        </div> */}
    </CenterModal>
  );
}
function MonitorDialog({ onClose, state }: { onClose: () => void; state: MonitorDialogState }) {
  const monitoredPatients = React.useMemo(
    () =>
      headNursePatients
        .filter((patient) => patient.unit === state.row.unit)
        .flatMap((patient) =>
          getMappedDevicesForPatient(patient)
            .filter((device) => device.type === "Monitor")
            .map((device) => ({ device, patient })),
        )
        .sort((left, right) => left.patient.bedNo.localeCompare(right.patient.bedNo)),
    [state.row.unit],
  );

  return (
    <CenterModal
      className="w-[min(94vw,768px)]"
      description={`${state.row.unit} | ${monitoredPatients.length} in use | ${state.row.totalMonitors} monitors`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="Monitor assignment"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table className="w-full border-collapse text-sm">
            <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
              <TableRow>
                <TableHead className="px-4 py-3 text-left">Assigned Bed</TableHead>
                <TableHead className="px-4 py-3 text-left">Patient Name</TableHead>
                <TableHead className="px-4 py-3 text-left">Monitor ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monitoredPatients.length ? (
                monitoredPatients.map(({ device, patient }) => (
                  <TableRow className="border-t border-slate-100" key={`${patient.id}-${device.deviceId}`}>
                    <TableCell className="px-4 py-3 font-bold text-slate-950">{patient.bedNo}</TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-700">{patient.patientName}</TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-700">{device.deviceId}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-4 text-center text-sm font-bold text-slate-500" colSpan={3}>
                    No monitors in use for this unit.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </CenterModal>
  );
}
function InfusionPumpDialog({ onClose, state }: { onClose: () => void; state: InfusionPumpDialogState }) {
  const infusionPumpPatients = React.useMemo(
    () =>
      headNursePatients
        .filter((patient) => patient.unit === state.row.unit)
        .flatMap((patient) =>
          getMappedDevicesForPatient(patient)
            .filter((device) => device.type === "Infusion Pump")
            .map((device) => ({ device, patient })),
        )
        .sort((left, right) => left.patient.bedNo.localeCompare(right.patient.bedNo)),
    [state.row.unit],
  );

  return (
    <CenterModal
      className="w-[min(94vw,768px)]"
      description={`${state.row.unit} | ${infusionPumpPatients.length} in use | ${state.row.totalInfusionPumps} infusion pumps`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="Infusion pump assignment"
    >
      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table className="w-full border-collapse text-sm">
            <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
              <TableRow>
                <TableHead className="px-4 py-3 text-left">Assigned Bed</TableHead>
                <TableHead className="px-4 py-3 text-left">Patient Name</TableHead>
                <TableHead className="px-4 py-3 text-left">Infusion Pump ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {infusionPumpPatients.length ? (
                infusionPumpPatients.map(({ device, patient }) => (
                  <TableRow className="border-t border-slate-100" key={`${patient.id}-${device.deviceId}`}>
                    <TableCell className="px-4 py-3 font-bold text-slate-950">{patient.bedNo}</TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-700">{patient.patientName}</TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-700">{device.deviceId}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="px-4 py-4 text-center text-sm font-bold text-slate-500" colSpan={3}>
                    No infusion pumps in use for this unit.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </CenterModal>
  );
}
function OtherDevicesDialog({ onClose, state }: { onClose: () => void; state: OtherDevicesDialogState }) {
  const [selectedDevice, setSelectedDevice] = React.useState<string | null>(null);
  const unitPatients = React.useMemo(
    () => headNursePatients.filter((patient) => patient.unit === state.row.unit).sort((left, right) => left.bedNo.localeCompare(right.bedNo)),
    [state.row.unit],
  );
  const assignments = React.useMemo(
    () =>
      state.row.otherDevices.flatMap((device) =>
        Array.from({ length: device.inUse }, (_, index) => {
          const patient = unitPatients[index % unitPatients.length];
          const prefix = device.deviceType === "Syringe Pump" ? "SP" : device.deviceType === "NIV / BiPAP" ? "NIV" : device.deviceType === "HFNC" ? "HFNC" : device.deviceType === "CRRT / Dialysis" ? "CRRT" : "DEF";
          return {
            bedNo: patient?.bedNo ?? "--",
            deviceId: `${prefix}-${state.row.id.toUpperCase()}-${String(index + 1).padStart(2, "0")}`,
            deviceType: device.deviceType,
            patientId: patient?.id ?? "",
            patientName: patient?.patientName ?? "Unassigned",
          };
        }),
      ),
    [state.row.id, state.row.otherDevices, unitPatients],
  );
  const assignedPatientCount = new Set(assignments.map((assignment) => assignment.patientId).filter(Boolean)).size;
  const selectedAssignments = selectedDevice ? assignments.filter((assignment) => assignment.deviceType === selectedDevice) : [];
  const selectedPatientCount = new Set(selectedAssignments.map((assignment) => assignment.patientId).filter(Boolean)).size;

  return (
    <CenterModal
      className="w-[min(94vw,900px)]"
      description={selectedDevice ? `${state.row.unit} | ${selectedAssignments.length} in use | ${selectedPatientCount} patients` : `${state.row.unit} | ${state.row.otherDevicesInUse} devices in use | ${assignedPatientCount} patients`}
      onOpenChange={(open) => !open && onClose()}
      open
      title={selectedDevice ? `${selectedDevice} assignments` : "Other device inventory"}
    >
      {selectedDevice ? (
        <div className="space-y-4">
          <Button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100" onClick={() => setSelectedDevice(null)} type="button">
            <ChevronLeft className="h-4 w-4" /> Back to inventory
          </Button>
          <div className="max-h-[55vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table className="w-full border-collapse text-sm">
              <TableHeader className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">Assigned Bed</TableHead>
                  <TableHead className="px-4 py-3 text-left">Patient Name</TableHead>
                  <TableHead className="px-4 py-3 text-left">Device ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAssignments.map((assignment) => (
                  <TableRow className="border-t border-slate-100" key={assignment.deviceId}>
                    <TableCell className="px-4 py-3 font-bold text-slate-950">{assignment.bedNo}</TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-700">{assignment.patientName}</TableCell>
                    <TableCell className="px-4 py-3 font-semibold text-slate-700">{assignment.deviceId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table className="w-full border-collapse text-sm">
            <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
              <TableRow>
                <TableHead className="px-4 py-3 text-left">Device</TableHead>
                <TableHead className="px-4 py-3 text-center">In Use</TableHead>
                <TableHead className="px-4 py-3 text-center">Patients</TableHead>
                <TableHead className="px-4 py-3 text-center">Available</TableHead>
                <TableHead className="px-4 py-3 text-center">Total</TableHead>
                <TableHead className="px-4 py-3 text-center">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.row.otherDevices.map((device) => {
                const available = Math.max(0, device.total - device.inUse - device.maintenance);
                const patientCount = new Set(assignments.filter((assignment) => assignment.deviceType === device.deviceType).map((assignment) => assignment.patientId).filter(Boolean)).size;
                return (
                  <TableRow className="border-t border-slate-100" key={device.deviceType}>
                    <TableCell className="px-4 py-3 font-bold text-slate-950">{device.deviceType}</TableCell>
                    <TableCell className="px-4 py-3 text-center font-semibold text-slate-700">{device.inUse}</TableCell>
                    <TableCell className="px-4 py-3 text-center font-semibold text-sky-700">{patientCount}</TableCell>
                    <TableCell className="px-4 py-3 text-center font-semibold text-emerald-700">{available}</TableCell>
                    <TableCell className="px-4 py-3 text-center font-bold text-slate-950">{device.total}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Button
                        aria-label={`View ${device.deviceType} assignments`}
                        size="icon"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={device.inUse === 0}
                        onClick={() => setSelectedDevice(device.deviceType)}
                        type="button"
                      >
                        <Eye className="h-4 w-4 shrink-0" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </CenterModal>
  );
}

function BedsDialog({ onClose, state }: { onClose: () => void; state: BedsDialogState }) {
  const occupiedBeds = React.useMemo(
    () =>
      headNursePatients
        .filter((patient) => patient.unit === state.row.unit)
        .sort((left, right) => left.bedNo.localeCompare(right.bedNo)),
    [state.row.unit],
  );

  return (
    <CenterModal
      className="w-[min(94vw,768px)]"
      description={`${state.row.unit} | ${occupiedBeds.length} occupied | ${state.row.totalBeds} total beds`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="Beds assignment"
    >
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table className="w-full border-collapse text-sm">
              <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">Assigned Bed</TableHead>
                  <TableHead className="px-4 py-3 text-left">Patient Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {occupiedBeds.length ? (
                  occupiedBeds.map((patient) => (
                    <TableRow className="border-t border-slate-100" key={patient.id}>
                      <TableCell className="px-4 py-3 font-bold text-slate-950">{patient.bedNo}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-slate-700">{patient.patientName}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-center text-sm font-bold text-slate-500" colSpan={2}>
                      No occupied beds found for this unit.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
          <Button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100" onClick={onClose} type="button">
            Close
          </Button>
        </div> */}
    </CenterModal>
  );
}

function EscalationDialog({ onClose, state }: { onClose: () => void; state: EscalationDialogState }) {
  const [escalations, setEscalations] = React.useState(state.escalations);

  const handleEscalationAction = (recordKey: string, status: "Forwarded" | "Resolved") => {
    const unitAction = status === "Resolved" ? "Resolved" : "Escalated";
    const unitActionNote = dashboardEscalationActionNote(status);
    updateDashboardEscalationStore(recordKey, { status, unitAction, unitActionNote });
    setEscalations((rows) => rows.map((row) => (
      row.recordKey === recordKey ? { ...row, status, unitAction, unitActionNote } : row
    )));
  };

  return (
    <CenterModal
      className="w-[min(96vw,1024px)]"
      description={`${state.row.patient.patientName} | ${state.row.patient.bedNo} | ${state.row.patient.unit}`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="Escalation details"
    >
      <div className="space-y-4">
        <div className="max-h-[68vh] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table className="w-full min-w-[900px] border-collapse text-sm">
            <TableHeader className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
              <TableRow>
                <TableHead className="px-4 py-3 text-left">Escalation</TableHead>
                <TableHead className="px-4 py-3 text-center">Severity</TableHead>
                <TableHead className="px-4 py-3 text-center">Status</TableHead>
                <TableHead className="px-4 py-3 text-left">Raised By</TableHead>
                <TableHead className="px-4 py-3 text-center">Unit Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {escalations.map((escalation) => (
                <TableRow className="border-t border-slate-100 align-top" key={escalation.recordKey}>
                  <TableCell className="px-4 py-4">
                    <p className="font-bold text-slate-950">{escalation.escalation}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{escalation.escalationDetail}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{escalation.sourceLabel} | {escalation.createdAt}</p>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <StatusPill label={escalation.severity} tone={escalationSeverityTone(escalation.severity)} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <StatusPill label={dashboardEscalationDisplayStatus(escalation.status)} tone={escalationDisplayTone(dashboardEscalationDisplayStatus(escalation.status))} />
                  </TableCell>
                  <TableCell className="px-4 py-4 font-semibold text-slate-700">{escalation.raisedBy}</TableCell>
                  <TableCell className="px-4 py-4">
                    {dashboardEscalationDisplayStatus(escalation.status) === "Pending" ? (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700"
                          onClick={() => handleEscalationAction(escalation.recordKey, "Resolved")}
                          type="button"
                        >
                          Resolve
                        </Button>
                        <Button
                          className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-black text-white transition hover:bg-sky-700"
                          onClick={() => handleEscalationAction(escalation.recordKey, "Forwarded")}
                          type="button"
                        >
                          Escalate to Doctor
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* <p className="font-black text-slate-950">{escalation.unitAction}</p> */}
                        <p className="mt-1 px-4 py-4 font-semibold text-slate-700">{escalation.unitActionNote}</p>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100" onClick={onClose} type="button">
            Close
          </Button>
        </div> */}
      </div>
    </CenterModal>
  );
}

function HandoverDialog({ onClose, state }: { onClose: () => void; state: HandoverDialogState }) {
  const { handover } = state;

  return (
    <CenterModal
      className="w-[min(94vw,896px)]"
      description={`${state.row.patient.patientName} | ${state.row.patient.bedNo} | ${state.row.patient.unit}`}
      onOpenChange={(open) => !open && onClose()}
      open
      title="View handover details"
    >
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-500">Status</span>
            <StatusPill label={handover.status === "Carry Forward" ? "Carry forward" : handover.status} tone={handoverStatusTone(handover.status)} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            <PopupInfo label="Outgoing nurse" value={handover.handoverFrom} />
            <PopupInfo label="Receiving nurse" value={handover.handoverTo} />
            <PopupInfo label="Patient condition" value={handover.condition} />
            <PopupInfo label="Diagnosis" value={handover.diagnosis} />
            <div className="sm:col-span-2">
              <PopupInfo label="Condition detail" value={handover.conditionDetail} />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Handover tracking</p>
            <PopupInfo label="Date & Time" value={handover.handoverAt} />
            <div className="grid grid-cols-3 gap-2">
              <PopupInfo label="Tasks" value={String(handover.pendingTasks)} />
              <PopupInfo label="Orders" value={String(handover.pendingOrders)} />
              <PopupInfo label="Alerts" value={String(handover.openAlerts)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-4">
          <Button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100" onClick={onClose} type="button">
            Close
          </Button>
        </div>
      </div>
    </CenterModal>
  );
}

function AssignmentDialog({ onClose, row }: { onClose: () => void; row: HeadNursePatientRow }) {
  const availableNurses = getAvailableIcuNursesForPatient(row.patient);

  return (
    <CenterModal
      className="w-[min(94vw,896px)]"
      description={`${row.patient.bedNo} | ${row.patient.unit} | ${row.patient.mrn}`}
      onOpenChange={(open) => !open && onClose()}
      open
      title={row.patient.patientName}
    >
        <div className="bg-slate-50/60 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <PopupInfo label="Patient ICU" value={row.patient.unit} />
            <PopupInfo label="Unit & staff" value={row.staffStatus} />
            <PopupInfo label="Current assignment" value={row.assignmentStatus} />
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Table className="w-full min-w-[720px] border-collapse text-sm">
              <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
                <TableRow>
                  <TableHead className="px-4 py-3 text-left">ICU nurse</TableHead>
                  <TableHead className="px-4 py-3 text-center">Patients</TableHead>
                  <TableHead className="px-4 py-3 text-center">Critical</TableHead>
                  <TableHead className="px-4 py-3 text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableNurses.map((staff) => (
                  <TableRow className="border-t border-slate-100" key={`${staff.unit}-${staff.nurse}`}>
                    <TableCell className="px-4 py-3 font-black text-slate-950">{staff.nurse}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{staff.assignedPatients}/{staff.maxCapacity}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{staff.criticalPatients}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Button className={pillClass("success", true)} onClick={() => setSelectedUnitNurseForPatient(row.patient.id, staff.nurse)} type="button">Assign</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!availableNurses.length ? (
                  <TableRow>
                    <TableCell className="px-4 py-4 text-center text-sm font-bold text-slate-500" colSpan={4}>No available ICU nurse found for {row.patient.unit}.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter><DialogButton variant="outline" onClick={onClose}>Close</DialogButton></DialogFooter>
    </CenterModal>
  );
}
function WorkflowDialog({ onClose, onOpenAssignment, state }: { onClose: () => void; onOpenAssignment: (row: HeadNursePatientRow) => void; state: WorkflowDialogState }) {
  const statusToneValue = statusTone(state.status, state.row.tone);
  const canOpenAssignment = state.status === "Ready";
  const notifyTarget = workflowNotifyTarget(state.status);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  return (
    <CenterModal
      className="w-[min(94vw,768px)]"
      description={`${state.row.patient.bedNo} | ${state.row.patient.unit} | ${state.row.patient.mrn}`}
      onOpenChange={(open) => !open && onClose()}
      open
      title={state.row.patient.patientName}
    >
        <div className="space-y-4 bg-slate-50/60 p-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="mt-3 text-sm font-semibold text-slate-500">{actionMessage || workflowStatusMessage(state.status)}</p>
              <StatusPill label={state.status} tone={statusToneValue} />
            </div>
          </div>
          {/* <div className="grid gap-3 md:grid-cols-3">
            <PopupInfo label="ICU" value={state.row.patient.unit} />
            <PopupInfo label="Unit & staff" value={state.row.staffStatus} />
            <PopupInfo label="Assignment" value={state.row.assignmentStatus} />
          </div> */}
          {/* <div className="grid gap-3 md:grid-cols-2">
            <PopupInfo label="Notify" value={notifyTarget} />
            <PopupInfo label="Next step" value={canOpenAssignment ? "Open assignment" : "Keep on hold"} />
          </div> */}
        </div>
        <DialogFooter>
          <DialogButton variant="outline" onClick={onClose}>Close</DialogButton>
          {notifyTarget !== "No escalation needed" ? (
            <DialogButton className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-red-700" onClick={() => setActionMessage(`Notified to ${notifyTarget} successfully.`)}>
              {`Notify to ${notifyTarget}`}
            </DialogButton>
          ) : null}
          {canOpenAssignment ? <DialogButton onClick={() => onOpenAssignment(state.row)}>Open assignment</DialogButton> : null}
        </DialogFooter>
    </CenterModal>
  );
}

function IcuMetric({ icon: Icon, label, tone, value }: { icon: React.ComponentType<{ className?: string }>; label: string; tone: HeadNurseTone; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white", statusPillClass(tone))}><Icon className="h-5 w-5" /></span>
      </div>
    </div>
  );
}

function StackedValue({ main, mainTone, sub }: { main: string; mainTone?: HeadNurseTone; sub: string }) {
  return (
    <div>
      <p className={cn("text-base font-black", mainTone ? toneTextClass(mainTone) : "text-slate-950")}>{main}</p>
      <p className={cn("mt-1 text-xs font-bold", mainTone ? toneTextSoftClass(mainTone) : "text-slate-500")}>{sub}</p>
    </div>
  );
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">{children}</div>;
}

function DialogButton({ children, className, disabled = false, onClick, variant = "solid" }: { children: React.ReactNode; className?: string; disabled?: boolean; onClick?: () => void; variant?: "outline" | "solid" }) {
  return (
    <Button className={cn("rounded-xl px-4 py-2 text-sm font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-55", variant === "outline" ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100" : "bg-[#6571ea] text-white hover:bg-[#5662d8]", className)} disabled={disabled} onClick={onClick} type="button">
      {children}
    </Button>
  );
}

function PopupInfo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: HeadNurseTone }) {
  return <UiStatusPill tone={tone}>{label}</UiStatusPill>;
}

function AssignmentControlButton({ ariaLabel, children, className, disabled = false, onClick }: { ariaLabel: string; children: React.ReactNode; className: string; disabled?: boolean; onClick: () => void }) {
  return (
    <Button
      aria-label={ariaLabel}
      size="icon"
      className={cn(
        "group relative inline-flex h-8 w-8 items-center justify-center rounded-xl shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
      <span
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        role="tooltip"
      >
        {ariaLabel}
      </span>
    </Button>
  );
}

function IconActionButton({ ariaLabel, children, onClick, tone }: { ariaLabel: string; children: React.ReactNode; onClick: () => void; tone: HeadNurseTone }) {
  return (
    <Button
      aria-label={ariaLabel}
      size="icon"
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
        tone === "success" ? "text-emerald-700" : tone === "warning" ? "text-orange-600" : tone === "danger" || tone === "critical" ? "text-red-700" : tone === "info" ? "text-sky-700" : "text-slate-700",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </Button>
  );
}

function HeaderIconButton({ ariaLabel, children, onClick, tone }: { ariaLabel: string; children: React.ReactNode; onClick: () => void; tone: "danger" | "info" | "muted" }) {
  return (
    <div className="group relative">
      <Button
        aria-label={ariaLabel}
        size="icon"
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          tone === "danger"
            ? "border-red-200 text-red-700 hover:bg-red-50 focus-visible:ring-red-300"
            : tone === "info"
              ? "border-sky-200 text-sky-700 hover:bg-sky-50 focus-visible:ring-sky-300"
              : "border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300",
        )}
        onClick={onClick}
        type="button"
      >
        {children}
      </Button>
      <span
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 whitespace-nowrap rounded-lg bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        role="tooltip"
      >
        {ariaLabel}
      </span>
    </div>
  );
}

function ViewButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      className={cn(
        "inline-flex h-10 min-w-0 w-full items-center justify-center whitespace-nowrap rounded-xl px-2 text-[11px] font-black transition",
        active ? "bg-[#6571ea] text-white shadow-sm" : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </Button>
  );
}

function getUnitStaffStatus(row: HeadNursePatientRow) {
  if (row.unitStatus === "No bed" || row.unitStatus === "No ventilator" || row.unitStatus === "Ventilator bed needed" || row.unitStatus === "Unit setup pending") return row.unitStatus;
  if (row.staffStatus !== "Ready") return row.staffStatus;
  if (row.unitStatus === "Limited") return row.unitStatus;
  return "Ready";
}

function workflowStatusMessage(status: string) {
  if (status === "No bed") return "No ICU bed is available in the mapped unit. Keep the patient on hold until capacity opens.";
  if (status === "No ventilator" || status === "Ventilator bed needed") return "Ventilator support is not available in the mapped unit.";
  if (status === "No nurse") return "No ICU nurse is available for this unit right now. Escalate to the staffing team.";
  if (status === "Unit setup pending") return "Unit setup is incomplete. Finish the setup before staff allocation.";
  if (status === "Limited") return "Capacity is limited. Review staffing and unit load before moving ahead.";
  if (status === "Ready") return "Unit and staff checks are clear. You can move to ICU nurse assignment.";
  if (status === "Locked") return "Assignment is locked until the unit and staff checks are cleared.";
  return "Review the current status before proceeding.";
}

function workflowNotifyTarget(status: string) {
  if (status === "No bed") return "Bed control ";
  if (status === "No ventilator" || status === "Ventilator bed needed") return "charge nurse";
  if (status === "No nurse") return "Staffing coordinator";
  if (status === "Unit setup pending") return "Unit setup team ";
  if (status === "Limited") return "Charge nurse";
  if (status === "Ready") return "No escalation needed";
  return "Head nurse";
}

function dashboardEscalationsForPatient(patient: HeadNursePatientRow["patient"], includeStoredState: boolean): DashboardEscalationRow[] {
  const store = includeStoredState ? readDashboardEscalationStore() : {};
  const raisedBy = selectedUnitNurseForPatient(patient) || patient.assignedUnitNurse || "Unit Nurse";

  const alertRows: DashboardEscalationRow[] = icuAlerts
    .filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved")
    .map((alert) => {
      const recordKey = `alert:${alert.id}`;
      const status: DashboardEscalationStatus = alert.status === "Acknowledged" ? "Awaiting Review" : "Open";
      return applyDashboardEscalationStore({
        recordKey,
        patientId: patient.id,
        raisedBy,
        escalation: alert.type,
        escalationDetail: `${alert.message} | ${alert.source}`,
        severity: alert.severity === "High" ? "Critical" : alert.severity,
        status,
        unitAction: status === "Awaiting Review" ? "Awaiting Review" : "Pending",
        unitActionNote: dashboardEscalationActionNote(status),
        sourceLabel: `Alert | ${alert.owner}`,
        createdAt: alert.createdAt,
      }, store[recordKey]);
    });

  const taskRows: DashboardEscalationRow[] = icuTasks
    .filter((task) => task.patientId === patient.id && ["Pending", "Overdue", "Escalated", "In progress"].includes(task.status))
    .map((task) => {
      const recordKey = `task:${task.id}`;
      const severity: DashboardEscalationSeverity = task.priority === "Critical" || task.priority === "High" ? "Critical" : task.priority === "Medium" ? "Medium" : "Info";
      const status: DashboardEscalationStatus = task.status === "Escalated" || task.status === "Overdue" ? "Open" : "Awaiting Review";
      return applyDashboardEscalationStore({
        recordKey,
        patientId: patient.id,
        raisedBy,
        escalation: task.title,
        escalationDetail: `${task.taskType} | ${task.remarks}`,
        severity,
        status,
        unitAction: status === "Open" ? "Pending" : "Awaiting Review",
        unitActionNote: dashboardEscalationActionNote(status),
        sourceLabel: `Task | ${task.createdBy}`,
        createdAt: task.dueTime,
      }, store[recordKey]);
    });

  return [...alertRows, ...taskRows].sort(
    (left, right) => escalationSeverityRank(left.severity) - escalationSeverityRank(right.severity)
      || escalationStatusRank(left.status) - escalationStatusRank(right.status),
  );
}

function readDashboardEscalationStore(): DashboardEscalationStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ESCALATION_STORE_KEY);
    return raw ? (JSON.parse(raw) as DashboardEscalationStore) : {};
  } catch {
    return {};
  }
}

function updateDashboardEscalationStore(
  recordKey: string,
  update: Omit<DashboardEscalationStore[string], "updatedAt">,
) {
  if (typeof window === "undefined") return;
  const store = readDashboardEscalationStore();
  store[recordKey] = { ...update, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(ESCALATION_STORE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("head-nurse-escalation-store-change"));
}

function applyDashboardEscalationStore(row: DashboardEscalationRow, stored?: DashboardEscalationStore[string]): DashboardEscalationRow {
  if (!stored) return row;
  return {
    ...row,
    status: stored.status,
    unitAction: stored.unitAction,
    unitActionNote: stored.unitActionNote,
  };
}

function dashboardEscalationActionNote(status: DashboardEscalationStatus) {
  if (status === "Resolved") return "Closed";
  if (status === "Forwarded") return "Forward To: Duty Doctor";
  if (status === "Awaiting Review") return "Under review by head nurse";
  return "Forward to duty doctor";
}

function escalationSeverityRank(severity: DashboardEscalationSeverity) {
  if (severity === "Critical") return 0;
  if (severity === "Medium") return 1;
  return 2;
}

function escalationStatusRank(status: DashboardEscalationStatus) {
  if (status === "Open") return 0;
  if (status === "Awaiting Review") return 1;
  if (status === "Forwarded") return 2;
  return 3;
}

function escalationSeverityTone(severity: DashboardEscalationSeverity): HeadNurseTone {
  if (severity === "Critical") return "critical";
  if (severity === "Medium") return "warning";
  return "info";
}

function dashboardEscalationDisplayStatus(status: DashboardEscalationStatus): DashboardEscalationDisplayStatus {
  if (status === "Resolved") return "Resolved";
  if (status === "Forwarded") return "Escalated";
  return "Pending";
}

function dashboardEscalationSummaryStatus(escalations: DashboardEscalationRow[]): DashboardEscalationDisplayStatus {
  if (escalations.some((escalation) => dashboardEscalationDisplayStatus(escalation.status) === "Pending")) return "Pending";
  if (escalations.some((escalation) => dashboardEscalationDisplayStatus(escalation.status) === "Escalated")) return "Escalated";
  return "Resolved";
}

function escalationDisplayTone(status: DashboardEscalationDisplayStatus): HeadNurseTone {
  if (status === "Resolved") return "success";
  if (status === "Escalated") return "critical";
  return "warning";
}

function dashboardHandoverForPatient(patient: HeadNursePatientRow["patient"], includeStoredState: boolean): DashboardHandoverRow {
  const openAlerts = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved");
  const pendingTasks = icuTasks.filter((task) => task.patientId === patient.id && task.status !== "Completed");
  const pendingOrders = doctorInstructions.filter((order) => order.patientId === patient.id && order.status !== "Completed");
  const openItems = openAlerts.length + pendingTasks.length + pendingOrders.length;
  const handoverTo = selectedUnitNurseForPatient(patient, { includeStoredState }) || patient.assignedUnitNurse || "Unit Nurse pending";
  const sourcePatient = icuPatients.find((item) => item.id === patient.id);
  const handoverFrom = sourcePatient?.assignedWardNurse || "Ward Nurse pending";
  const isCritical = patient.currentStatus === "Critical" || patient.currentStatus === "Death workflow" || patient.criticalityScore >= 8;
  const isComplex = patient.currentStatus === "Ventilated" || patient.ventilatorStatus.toLowerCase().includes("vent");

  let status: DashboardHandoverStatus = openItems ? "Pending" : "Verified";
  if (isCritical && openItems) status = "Escalated";
  else if ((patient.currentStatus === "Ready for transfer" || patient.currentStatus === "Discharge ordered") && openItems) status = "Carry Forward";
  else if (isComplex && openItems >= 2) status = "Carry Forward";

  return {
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
}

function handoverStatusTone(status: DashboardHandoverStatus): HeadNurseTone {
  if (status === "Escalated") return "critical";
  if (status === "Pending") return "warning";
  if (status === "Carry Forward") return "info";
  return "success";
}

function patientTablePillClass(tone: HeadNurseTone, interactive = false) {
  return cn(
    "inline-flex h-8 min-w-24 items-center justify-center gap-1 rounded-full px-3 text-xs font-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.28)] transition",
    interactive && "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
    statusPillClass(tone),
  );
}

function pillClass(tone: HeadNurseTone, interactive = false) {
  return cn(
    "inline-flex min-w-[88px] items-center justify-center rounded-lg px-4 py-2 text-xs font-black text-white shadow-sm transition",
    interactive && "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
    statusPillClass(tone),
  );
}

function statusTone(label: string, fallbackTone: HeadNurseTone): HeadNurseTone {
  const value = label.toLowerCase();
  if (value.includes("clear") || value === "ready" || value.includes("available") || value.includes("icu nurse")) return "success";
  if (value.includes("alert") || value.includes("no bed") || value.includes("no nurse") || value.includes("no ventilator") || value.includes("ventilator bed needed")) return "danger";
  if (value.includes("pending") || value.includes("locked") || value.includes("assign") || value.includes("select") || value.includes("limited")) return "warning";
  return fallbackTone;
}

function statusPillClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "bg-red-600 hover:bg-red-700";
  if (tone === "warning") return "bg-orange-500 hover:bg-orange-600";
  if (tone === "success") return "bg-green-700 hover:bg-green-800";
  if (tone === "info") return "bg-sky-600 hover:bg-sky-700";
  return "bg-slate-400 hover:bg-slate-500";
}

function rowAccentClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "before:bg-red-500";
  if (tone === "warning") return "before:bg-orange-500";
  if (tone === "success") return "before:bg-emerald-500";
  if (tone === "info") return "before:bg-sky-500";
  return "before:bg-slate-300";
}


function patientNameClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "text-red-700";
  if (tone === "warning") return "text-orange-600";
  if (tone === "success") return "text-emerald-700";
  if (tone === "info") return "text-sky-700";
  return "text-slate-700";
}

function DashboardUnitCell({ row }: { row: HeadNurseIcuDashboardRow }) {
  return (
    <div className={cn("relative h-full min-h-[64px] px-5 py-2 before:absolute before:inset-y-0 before:left-0 before:w-1", rowAccentClass(row.tone))}>
      <p className={cn("text-base font-black py-2", patientNameClass(row.tone))}>{row.unit}</p>
      {/* <p className="mt-1 text-sm font-bold text-slate-500">{row.occupiedBeds}/{row.totalBeds} occupied</p> */}
    </div>
  );
}

function DashboardMatrixCell({ icon: Icon, title, detail, tone }: { icon: typeof Activity; title: string; detail?: string; tone: HeadNurseTone }) {
  return (
    <div className="flex min-h-[64px] flex-col items-center justify-center rounded-md px-2 transition hover:bg-slate-50/60">
      <span className={cn("inline-flex h-8 min-w-24 items-center justify-center gap-1 rounded-full px-3 text-xs font-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.28)]", statusPillClass(tone))}>
        <Icon className="h-4 w-4" />
        <span className="max-w-24 truncate whitespace-nowrap">{title}</span>
      </span>
      <span className={cn("mt-1 block max-w-32 truncate whitespace-nowrap text-center text-[11px] font-semibold leading-tight", toneTextSoftClass(tone))}>
        {detail || "-"}
      </span>
    </div>
  );
}

function metricAvailabilityTone(value: number): HeadNurseTone {
  if (value <= 0) return "danger";
  if (value <= 1) return "warning";
  return "success";
}

function occupancyTone(occupied: number, total: number): HeadNurseTone {
  if (total <= 0) return "muted";
  const occupiedPercentage = (occupied / total) * 100;
  if (occupiedPercentage <= 50) return "success";
  if (occupiedPercentage <= 80) return "warning";
  return "danger";
}

function availabilityTone(value: number): HeadNurseTone | undefined {
  if (value <= 0) return "danger";
  if (value <= 1) return "warning";
  return undefined;
}

function toneTextClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "text-red-700";
  if (tone === "warning") return "text-orange-600";
  if (tone === "success") return "text-emerald-700";
  if (tone === "info") return "text-sky-700";
  return "text-slate-700";
}

function toneTextSoftClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "text-red-500";
  if (tone === "warning") return "text-orange-500";
  if (tone === "success") return "text-emerald-500";
  if (tone === "info") return "text-sky-500";
  return "text-slate-500";
}
