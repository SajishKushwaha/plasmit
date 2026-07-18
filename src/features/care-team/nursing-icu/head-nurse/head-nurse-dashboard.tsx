"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeftRight,
  BedDouble,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getAvailableIcuNursesForPatient,
  getHeadNurseIcuDashboardRows,
  getHeadNursePatientRows,
  selectedUnitNurseForPatient,
  setSelectedUnitNurseForPatient,
} from "./head-nurse-mock-data";
import { icuAlerts } from "../nursing-icu-data";
import type {
  HeadNurseIcuDashboardRow,
  HeadNursePatientRow,
  HeadNurseTone,
} from "./head-nurse-types";

const PAGE_SIZE = 8;

type DashboardView = "icu" | "patients";

type AssignmentDialogState = {
  row: HeadNursePatientRow;
};

type WorkflowDialogState = {
  row: HeadNursePatientRow;
  status: string;
  source: "unit-staff" | "assignment-lock";
};

type AlertDialogState = {
  row: HeadNursePatientRow;
};
type QuickAssignState = {
  rowId: string;
  nurse: string;
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

export function HeadNurseDashboard() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view: DashboardView = searchParams.get("view") === "icu" ? "icu" : "patients";
  const baseRoute = pathname.startsWith("/nursing-icu/head-nurse")
    ? "/nursing-icu/head-nurse"
    : "/head-nurse";
  const [page, setPage] = React.useState(1);
  const [statusVersion, setStatusVersion] = React.useState(0);
  const [activeAssignment, setActiveAssignment] = React.useState<AssignmentDialogState | null>(
    null,
  );
  const [activeAlert, setActiveAlert] = React.useState<AlertDialogState | null>(null);
  const [activeWorkflow, setActiveWorkflow] = React.useState<WorkflowDialogState | null>(null);

  const [icuSearch, setIcuSearch] = React.useState("");
  const [patientSearch, setPatientSearch] = React.useState("");
  const isHydrated = React.useSyncExternalStore(
    subscribeHydrationStore,
    getHydratedClientSnapshot,
    getHydratedServerSnapshot,
  );
  const includeStoredState = isHydrated;
  const icuRows = getHeadNurseIcuDashboardRows();
  const filteredIcuRows = React.useMemo(() => {
    const query = icuSearch.trim().toLowerCase();
    if (!query) return icuRows;
    return icuRows.filter((row) => row.unit.toLowerCase().includes(query));
  }, [icuRows, icuSearch]);
  const patientRows = getHeadNursePatientRows({ includeStoredState });
  const filteredPatientRows = React.useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return patientRows;
    return patientRows.filter((row) => {
      const values = [row.patient.patientName, row.patient.bedNo, row.patient.mrn, row.patient.unit]
        .join(" ")
        .toLowerCase();
      return values.includes(query);
    });
  }, [patientRows, patientSearch]);

  React.useEffect(() => {
    const refreshRows = () => setStatusVersion((version) => version + 1);
    window.addEventListener("head-nurse-workflow-status-change", refreshRows);
    window.addEventListener("storage", refreshRows);

    return () => {
      window.removeEventListener("head-nurse-workflow-status-change", refreshRows);
      window.removeEventListener("storage", refreshRows);
    };
  }, []);

  void statusVersion;
  return (
    <div className="min-w-0 space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <ViewButton
              active={view === "patients"}
              label="Patient Dashboard"
              onClick={() => {
                setPage(1);
                router.push(`${baseRoute}?view=patients`);
              }}
            />
            <ViewButton
              active={view === "icu"}
              label="ICU Dashboard"
              onClick={() => {
                setPage(1);
                router.push(`${baseRoute}?view=icu`);
              }}
            />
          </div>
          {view === "icu" ? (
            <div className="relative w-full max-w-[360px] lg:max-w-[420px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search ICU unit"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                placeholder="Search ICU unit..."
                onChange={(event) => setIcuSearch(event.target.value)}
                value={icuSearch}
                type="search"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
              {/* <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-end"> */}
              <div className="relative w-full max-w-[360px] lg:max-w-[420px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  aria-label="Search patient, bed, MRN"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                  placeholder="Search patient, bed, MRN..."
                  onChange={(event) => setPatientSearch(event.target.value)}
                  value={patientSearch}
                  type="search"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                  onClick={() => router.push(`${baseRoute}/alerts-delays`)}
                  type="button"
                >
                  Escalations
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                  onClick={() => router.push(`${baseRoute}/shift-handover`)}
                  type="button"
                >
                  Handover
                </button>
              </div>
            </div>
          )}
        </div>
        {view === "icu" ? (
          <IcuDashboardView rows={filteredIcuRows} />
        ) : (
          <PatientDashboardView
            onOpenAlert={setActiveAlert}
            onOpenAssignment={setActiveAssignment}
            onOpenWorkflow={setActiveWorkflow}
            page={page}
            patientRows={filteredPatientRows}
            setPage={setPage}
          />
        )}
      </section>

      {activeAssignment ? (
        <AssignmentDialog onClose={() => setActiveAssignment(null)} row={activeAssignment.row} />
      ) : null}
      {activeAlert ? (
        <AlertDialog onClose={() => setActiveAlert(null)} row={activeAlert.row} />
      ) : null}
      {activeWorkflow ? (
        <WorkflowDialog
          onClose={() => setActiveWorkflow(null)}
          onOpenAssignment={(row) => {
            setActiveAssignment({ row });
            setActiveWorkflow(null);
          }}
          state={activeWorkflow}
        />
      ) : null}
    </div>
  );
}

function PatientDashboardView({
  onOpenAlert,
  onOpenAssignment: _onOpenAssignment,
  onOpenWorkflow,
  page,
  patientRows,
  setPage,
}: {
  onOpenAlert: (_state: AlertDialogState) => void;
  onOpenAssignment: (_state: AssignmentDialogState) => void;
  onOpenWorkflow: (_state: WorkflowDialogState) => void;
  page: number;
  patientRows: HeadNursePatientRow[];
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  const router = useRouter();
  const [activeQuickAssign, setActiveQuickAssign] = React.useState<QuickAssignState | null>(null);
  const totalPages = Math.max(1, Math.ceil(patientRows.length / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const visibleRows = patientRows.slice(startIndex, startIndex + PAGE_SIZE);
  const firstVisible = patientRows.length ? startIndex + 1 : 0;
  const lastVisible = Math.min(startIndex + PAGE_SIZE, patientRows.length);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-950">
              <th className="sticky left-0 z-30 w-[230px] bg-slate-50 px-5 py-4 text-left shadow-[1px_0_0_0_#e2e8f0]">
                Patient / ICU
              </th>
              <th className="px-4 py-4 text-center">Unit & Staff Check</th>
              <th className="px-4 py-4 text-center">Unit Nurse Assignment</th>
              <th className="px-4 py-4 text-center">Alerts</th>
              <th className="px-4 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const unitStaffStatus = getUnitStaffStatus(row);
              const unitStaffTone = statusTone(unitStaffStatus, row.tone);
              const assignmentUnlocked = row.assignmentStatus !== "Locked";
              const canUseActions = unitStaffStatus === "Ready" || unitStaffStatus === "Limited";
              const assignedUnitNurse =
                selectedUnitNurseForPatient(row.patient) ||
                row.assignmentStatus.replace(/^ICU Nurse\s+/i, "").trim();
              const hasAssignment =
                Boolean(assignedUnitNurse) &&
                assignedUnitNurse !== "Select ICU Nurse" &&
                assignedUnitNurse !== "Assign";

              return (
                <tr className="border-b border-slate-200 last:border-b-0" key={row.patient.id}>
                  <td className="sticky left-0 z-20 border-r border-slate-200 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
                    <div
                      className={cn(
                        "relative min-h-[116px] px-7 py-6 before:absolute before:inset-y-0 before:left-0 before:w-1",
                        rowAccentClass(row.tone),
                      )}
                    >
                      <p className={cn("text-base font-black", patientNameClass(row.tone))}>
                        {row.patient.patientName}
                      </p>
                      <p className="mt-2 text-sm font-black text-slate-950">
                        {row.patient.bedNo} | {row.patient.unit}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-center align-middle">
                    <button
                      className={pillClass(unitStaffTone, true)}
                      onClick={() =>
                        onOpenWorkflow({ row, status: unitStaffStatus, source: "unit-staff" })
                      }
                      type="button"
                    >
                      {unitStaffStatus}
                    </button>
                  </td>
                  <td className="px-4 py-6 text-center align-middle">
                    {assignmentUnlocked ? (
                      <button
                        suppressHydrationWarning
                        className={pillClass(hasAssignment ? "success" : "warning", true)}
                        type="button"
                      >
                        {hasAssignment ? assignedUnitNurse : "Assign"}
                      </button>
                    ) : (
                      <span className={pillClass("muted", true)}>Locked</span>
                    )}
                  </td>
                  <td className="px-4 py-6 text-center align-middle">
                    {row.alertStatus === "Clear" ? (
                      <StatusPill
                        label={row.alertStatus}
                        tone={statusTone(row.alertStatus, row.tone)}
                      />
                    ) : (
                      <button
                        className={pillClass(statusTone(row.alertStatus, row.tone), true)}
                        onClick={() => onOpenAlert({ row })}
                        type="button"
                      >
                        {row.alertStatus}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-6 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      {canUseActions ? (
                        activeQuickAssign?.rowId === row.patient.id ? (
                          <div className="inline-flex items-center gap-2 bg-white p-2 shadow-sm">
                            <select
                              aria-label="Select ICU nrse"
                              className="h-10 min-w-[100px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-black text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
                              onChange={(event) =>
                                setActiveQuickAssign({
                                  rowId: row.patient.id,
                                  nurse: event.target.value,
                                })
                              }
                              value={activeQuickAssign.nurse}
                            >
                              {getAvailableIcuNursesForPatient(row.patient).map((nurse) => (
                                <option key={`${nurse.unit}-${nurse.nurse}`} value={nurse.nurse}>
                                  {nurse.nurse}
                                </option>
                              ))}
                            </select>
                            <button
                              aria-label="Assign nurse"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={!activeQuickAssign.nurse}
                              onClick={() => {
                                if (!activeQuickAssign.nurse) return;
                                setSelectedUnitNurseForPatient(
                                  row.patient.id,
                                  activeQuickAssign.nurse,
                                );
                                setActiveQuickAssign(null);
                              }}
                              type="button"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button
                              aria-label="Close quick assign"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
                              onClick={() => setActiveQuickAssign(null)}
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <IconActionButton
                            ariaLabel="Open quick assign"
                            tone="success"
                            onClick={() =>
                              setActiveQuickAssign({
                                rowId: row.patient.id,
                                nurse:
                                  selectedUnitNurseForPatient(row.patient) ||
                                  getAvailableIcuNursesForPatient(row.patient)[0]?.nurse ||
                                  "",
                              })
                            }
                          >
                            <ArrowLeftRight className="h-4 w-4" />
                          </IconActionButton>
                        )
                      ) : null}
                      {activeQuickAssign?.rowId !== row.patient.id ? (
                        <IconActionButton
                          ariaLabel="View workflow status"
                          tone="info"
                          onClick={() =>
                            router.push("/icu-command-center/patients/icu-001?tab=overview")
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </IconActionButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-slate-500">
          Showing{" "}
          <span className="text-slate-950">
            {firstVisible}-{lastVisible}
          </span>{" "}
          of <span className="text-slate-950">{patientRows.length}</span> patients
        </p>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          <span className="inline-flex h-9 min-w-24 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm">
            Page {page} / {totalPages}
          </span>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
            type="button"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
function IcuDashboardView({ rows }: { rows: HeadNurseIcuDashboardRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1180px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-950">
            <th className="sticky left-0 z-30 w-[230px] bg-slate-50 px-5 py-4 text-left shadow-[1px_0_0_0_#e2e8f0]">
              ICU Unit
            </th>
            <th className="px-4 py-4 text-center">Beds</th>
            <th className="px-4 py-4 text-center">Ventilator</th>
            <th className="px-4 py-4 text-center">Nurses</th>
            {/* <th className="px-4 py-4 text-center">Alerts</th> */}
            {/* <th className="px-4 py-4 text-center">Status</th> */}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr className="border-b border-slate-200 last:border-b-0" key={row.id}>
              <td className="sticky left-0 z-20 border-r border-slate-200 bg-white p-0 align-middle shadow-[1px_0_0_0_#e2e8f0]">
                <DashboardUnitCell row={row} />
              </td>
              <td className="px-4 py-4 text-center align-middle">
                <DashboardMatrixCell
                  icon={BedDouble}
                  title={`${row.availableBeds}/${row.totalBeds}`}
                  detail={`${row.occupiedBeds} occupied`}
                  tone={availabilityTone(row.availableBeds) ?? row.tone}
                />
              </td>
              <td className="px-4 py-4 text-center align-middle">
                <DashboardMatrixCell
                  icon={ArrowLeftRight}
                  title={`${row.availableVentilatorBeds}/${row.ventilatorBeds}`}
                  tone={availabilityTone(row.availableVentilatorBeds) ?? row.tone}
                />
              </td>
              <td className="px-4 py-4 text-center align-middle">
                <DashboardMatrixCell
                  icon={Users}
                  title={`${row.availableIcuNurses}/${row.totalIcuNurses}`}
                  tone={availabilityTone(row.availableIcuNurses) ?? row.tone}
                />
              </td>
              {/* <td className="px-4 py-4 text-center align-middle">
                <DashboardMatrixCell icon={ShieldAlert} title={`${row.openAlerts}`} tone={metricAvailabilityTone(row.openAlerts)} />
              </td> */}
              {/* <td className="px-4 py-4 text-center align-middle">
                <StatusPill label={row.status} tone={row.tone} />
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentDialog({ onClose, row }: { onClose: () => void; row: HeadNursePatientRow }) {
  const availableNurses = getAvailableIcuNursesForPatient(row.patient);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <DialogHeader onClose={onClose} patientRow={row} title="Assign ICU nurse" />
        <div className="max-h-[70vh] overflow-y-auto bg-slate-50/60 p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <PopupInfo label="Patient ICU" value={row.patient.unit} />
            <PopupInfo label="Unit & staff" value={row.staffStatus} />
            <PopupInfo label="Current assignment" value={row.assignmentStatus} />
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">ICU nurse</th>
                  <th className="px-4 py-3 text-center">Patients</th>
                  <th className="px-4 py-3 text-center">Critical</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {availableNurses.map((staff) => (
                  <tr className="border-t border-slate-100" key={`${staff.unit}-${staff.nurse}`}>
                    <td className="px-4 py-3 font-black text-slate-950">{staff.nurse}</td>
                    <td className="px-4 py-3 text-center">
                      {staff.assignedPatients}/{staff.maxCapacity}
                    </td>
                    <td className="px-4 py-3 text-center">{staff.criticalPatients}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        className={pillClass("success", true)}
                        onClick={() => setSelectedUnitNurseForPatient(row.patient.id, staff.nurse)}
                        type="button"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
                {!availableNurses.length ? (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-sm font-bold text-slate-500"
                      colSpan={4}
                    >
                      No available ICU nurse found for {row.patient.unit}.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <DialogButton variant="outline" onClick={onClose}>
            Close
          </DialogButton>
        </DialogFooter>
      </div>
    </div>
  );
}
function WorkflowDialog({
  onClose,
  onOpenAssignment,
  state,
}: {
  onClose: () => void;
  onOpenAssignment: (_row: HeadNursePatientRow) => void;
  state: WorkflowDialogState;
}) {
  const statusToneValue = statusTone(state.status, state.row.tone);
  const canOpenAssignment = state.status === "Ready";
  const notifyTarget = workflowNotifyTarget(state.status);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <DialogHeader onClose={onClose} patientRow={state.row} title="Unit & staff check" />
        <div className="space-y-4 bg-slate-50/60 p-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {actionMessage || workflowStatusMessage(state.status)}
              </p>
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
          <DialogButton variant="outline" onClick={onClose}>
            Close
          </DialogButton>
          {notifyTarget !== "No escalation needed" ? (
            <DialogButton
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-red-700"
              onClick={() => setActionMessage(`Notified to ${notifyTarget} successfully.`)}
            >
              {`Notify to ${notifyTarget}`}
            </DialogButton>
          ) : null}
          {canOpenAssignment ? (
            <DialogButton onClick={() => onOpenAssignment(state.row)}>Open assignment</DialogButton>
          ) : null}
        </DialogFooter>
      </div>
    </div>
  );
}

function AlertDialog({ onClose, row }: { onClose: () => void; row: HeadNursePatientRow }) {
  const openAlerts = icuAlerts.filter(
    (alert) => alert.patientId === row.patient.id && alert.status !== "Resolved",
  );
  const [_actionMessage, setActionMessage] = React.useState<string | null>(null);

  function handleAction(action: "Review" | "Acknowledge" | "Notify") {
    if (action === "Review") {
      setActionMessage("Review completed successfully.");
    } else if (action === "Acknowledge") {
      setActionMessage("Alert acknowledged successfully.");
    } else {
      setActionMessage(`Notification sent successfully to ${alertNotifyTarget(openAlerts)}.`);
    }

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <DialogHeader onClose={onClose} patientRow={row} title="Alerts" />
        <div className="space-y-4 bg-slate-50/60 p-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Alert</th>
                  <th className="px-4 py-3 text-center">Severity</th>
                  <th className="px-4 py-3 text-left">Message</th>
                  <th className="px-4 py-3 text-center">Source</th>
                  <th className="px-4 py-3 text-center">Owner</th>
                </tr>
              </thead>
              <tbody>
                {openAlerts.length ? (
                  openAlerts.map((alert) => (
                    <tr className="border-t border-slate-100" key={alert.id}>
                      <td className="px-4 py-3 font-black text-slate-950">{alert.type}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusPill
                          label={alert.severity}
                          tone={alertSeverityTone(alert.severity)}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{alert.message}</td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-600">
                        {alert.source}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-slate-600">
                        {alert.owner}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-sm font-bold text-slate-500"
                      colSpan={5}
                    >
                      Clear status. No popup action required.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <DialogButton variant="outline" onClick={onClose}>
            Close
          </DialogButton>
          {/* <DialogButton variant="outline" onClick={() => handleAction("Review")}>Review</DialogButton> */}
          <DialogButton variant="outline" onClick={() => handleAction("Acknowledge")}>
            Acknowledge
          </DialogButton>
          <button
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-red-700"
            onClick={() => handleAction("Notify")}
            type="button"
          >
            Notify
          </button>
        </DialogFooter>
      </div>
    </div>
  );
}
function DialogHeader({
  onClose,
  patientRow,
  title: _title,
}: {
  onClose: () => void;
  patientRow: HeadNursePatientRow;
  title: string;
}) {
  return (
    <div className="border-b border-slate-200 px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {/* <p className="text-xs font-black uppercase tracking-wide text-slate-500">{title}</p> */}
          <h3 className="mt-1 text-xl font-black text-slate-950">
            {patientRow.patient.patientName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {patientRow.patient.bedNo} | {patientRow.patient.unit} | {patientRow.patient.mrn}
          </p>
        </div>
        <button
          aria-label="Close dialog"
          className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function IcuMetric({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone: HeadNurseTone;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white",
            statusPillClass(tone),
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}

function StackedValue({
  main,
  mainTone,
  sub,
}: {
  main: string;
  mainTone?: HeadNurseTone;
  sub: string;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-base font-black",
          mainTone ? toneTextClass(mainTone) : "text-slate-950",
        )}
      >
        {main}
      </p>
      <p
        className={cn(
          "mt-1 text-xs font-bold",
          mainTone ? toneTextSoftClass(mainTone) : "text-slate-500",
        )}
      >
        {sub}
      </p>
    </div>
  );
}

function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
      {children}
    </div>
  );
}

function DialogButton({
  children,
  className,
  disabled = false,
  onClick,
  variant = "solid",
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "outline" | "solid";
}) {
  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-black shadow-sm transition disabled:cursor-not-allowed disabled:opacity-55",
        variant === "outline"
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
          : "bg-[#6571ea] text-white hover:bg-[#5662d8]",
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PopupInfo({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function StatusPill({ label, tone }: { label: string; tone: HeadNurseTone }) {
  return <span className={pillClass(tone)}>{label}</span>;
}

function IconActionButton({
  ariaLabel,
  children,
  onClick,
  tone,
}: {
  ariaLabel: string;
  children: React.ReactNode;
  onClick: () => void;
  tone: HeadNurseTone;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
        tone === "success"
          ? "text-emerald-700"
          : tone === "warning"
            ? "text-orange-600"
            : tone === "danger" || tone === "critical"
              ? "text-red-700"
              : tone === "info"
                ? "text-sky-700"
                : "text-slate-700",
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ViewButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-black transition",
        active
          ? "bg-[#6571ea] text-white shadow-sm"
          : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function getUnitStaffStatus(row: HeadNursePatientRow) {
  if (
    row.unitStatus === "No bed" ||
    row.unitStatus === "No ventilator" ||
    row.unitStatus === "Ventilator bed needed" ||
    row.unitStatus === "Unit setup pending"
  )
    return row.unitStatus;
  if (row.staffStatus !== "Ready") return row.staffStatus;
  if (row.unitStatus === "Limited") return row.unitStatus;
  return "Ready";
}

function workflowStatusMessage(status: string) {
  if (status === "No bed")
    return "No ICU bed is available in the mapped unit. Keep the patient on hold until capacity opens.";
  if (status === "No ventilator" || status === "Ventilator bed needed")
    return "Ventilator support is not available in the mapped unit.";
  if (status === "No nurse")
    return "No ICU nurse is available for this unit right now. Escalate to the staffing team.";
  if (status === "Unit setup pending")
    return "Unit setup is incomplete. Finish the setup before staff allocation.";
  if (status === "Limited")
    return "Capacity is limited. Review staffing and unit load before moving ahead.";
  if (status === "Ready")
    return "Unit and staff checks are clear. You can move to ICU nurse assignment.";
  if (status === "Locked")
    return "Assignment is locked until the unit and staff checks are cleared.";
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

function alertSeverityTone(severity: string): HeadNurseTone {
  const value = severity.toLowerCase();
  if (value.includes("critical")) return "critical";
  if (value.includes("high")) return "danger";
  if (value.includes("medium")) return "warning";
  if (value.includes("info")) return "info";
  return "info";
}

function _alertSummaryText(alerts: typeof icuAlerts) {
  if (!alerts.length) return "No open alerts for this patient.";
  const primary = alerts[0];
  const extraCount = alerts.length - 1;
  return extraCount > 0
    ? `${primary.type}: ${primary.message}. ${extraCount} more alert${extraCount > 1 ? "s" : ""} open.`
    : `${primary.type}: ${primary.message}. Review and acknowledge before closing this case.`;
}

function alertNotifyTarget(alerts: typeof icuAlerts) {
  if (!alerts.length) return "No escalation needed";
  const owners = Array.from(new Set(alerts.map((alert) => alert.owner)));
  return owners.slice(0, 2).join(" / ");
}
function pillClass(tone: HeadNurseTone, interactive = false) {
  return cn(
    "inline-flex min-w-[88px] items-center justify-center rounded-lg px-4 py-2 text-xs font-black text-white shadow-sm transition",
    interactive &&
      "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200",
    statusPillClass(tone),
  );
}

function statusTone(label: string, fallbackTone: HeadNurseTone): HeadNurseTone {
  const value = label.toLowerCase();
  if (
    value.includes("clear") ||
    value === "ready" ||
    value.includes("available") ||
    value.includes("icu nurse")
  )
    return "success";
  if (
    value.includes("alert") ||
    value.includes("no bed") ||
    value.includes("no nurse") ||
    value.includes("no ventilator") ||
    value.includes("ventilator bed needed")
  )
    return "danger";
  if (
    value.includes("pending") ||
    value.includes("locked") ||
    value.includes("assign") ||
    value.includes("select") ||
    value.includes("limited")
  )
    return "warning";
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
    <div
      className={cn(
        "relative min-h-[87px] px-5 py-4 before:absolute before:inset-y-0 before:left-0 before:w-1",
        rowAccentClass(row.tone),
      )}
    >
      <p className={cn("text-base font-black", patientNameClass(row.tone))}>{row.unit}</p>
      <p className="mt-1 text-sm font-bold text-slate-500">
        {row.occupiedBeds}/{row.totalBeds} occupied
      </p>
    </div>
  );
}

function DashboardMatrixCell({
  icon: Icon,
  title,
  detail,
  tone,
}: {
  icon: typeof Activity;
  title: string;
  detail?: string;
  tone: HeadNurseTone;
}) {
  return (
    <div className="flex min-h-[84px] flex-col items-center justify-center rounded-md px-2  transition hover:bg-slate-50/60">
      <span
        className={cn(
          "inline-flex h-9 min-w-24 items-center justify-center gap-1 rounded-full px-3 text-xs font-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.28)]",
          statusPillClass(tone),
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="max-w-24 truncate whitespace-nowrap">{title}</span>
      </span>
      <span
        className={cn(
          "mt-1 block max-w-32 truncate whitespace-nowrap text-center text-[11px] font-semibold leading-tight",
          toneTextSoftClass(tone),
        )}
      >
        {detail || "-"}
      </span>
    </div>
  );
}

function _metricAvailabilityTone(value: number): HeadNurseTone {
  if (value <= 0) return "danger";
  if (value <= 1) return "warning";
  return "success";
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
