"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  Eye,
  HeartPulse,
  Link2,
  ListChecks,
  Pill,
  ShieldAlert,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/features/operations/admin/admin-shared";
import { cn } from "@/lib/utils";
import {
  icuAlerts,
  icuPatients,
  icuTasks,
  icuVitals,
  intakeOutputRows,
  medicationRows,
  toneForStatus,
  type IcuPatient,
} from "../nursing-icu-data";
import {
  buildClinicalAlertRows,
  buildSupervisionItems,
  ClinicalAlertActionDialog,
  dashboardToneSolidClass,
  dashboardToneTextClass,
  IcuCommandPaginationControls,
  IcuOpsMatrixCell,
  icuPatientDetailHref,
  isClosedSupervisionStatus,
  nursingStationActionRowFromItem,
  nursingStationTopAlert,
  PendingUnitMonitoringQueueDialog,
  useIcuCommandPagination,
  type ClinicalAlertCellAction,
  type DashboardCellTone,
} from "../nursing-icu-pages";

export function UnitAssignedPatients() {
  const [query, setQuery] = React.useState("");
  const [nurse, setNurse] = React.useState("All bedside nurses");
  const wardNurses = React.useMemo(
    () =>
      Array.from(
        new Set([
          ...icuPatients.map((patient) => patient.assignedWardNurse),
          "Bedside Nurse Rina",
          "Bedside Nurse Anjali",
          "Bedside Nurse Arjun",
          "Bedside Nurse Neha",
        ]),
      ),
    [],
  );
  const initialAssignments = React.useMemo(
    () => Object.fromEntries(icuPatients.map((patient) => [patient.id, patient.assignedWardNurse])),
    [],
  );
  const [assignments, setAssignments] = React.useState<Record<string, string>>(initialAssignments);
  const [committedAssignments, setCommittedAssignments] =
    React.useState<Record<string, string>>(initialAssignments);
  const [editingPatientId, setEditingPatientId] = React.useState<string | null>(null);
  const [activePendingTaskPatient, setActivePendingTaskPatient] = React.useState<IcuPatient | null>(
    null,
  );
  const [activeClinicalAlert, setActiveClinicalAlert] =
    React.useState<ClinicalAlertCellAction | null>(null);
  const [resolvedAlertRows, setResolvedAlertRows] = React.useState<Set<string>>(() => new Set());
  const [acknowledgedAlertRows, setAcknowledgedAlertRows] = React.useState<Set<string>>(
    () => new Set(),
  );
  const supervisionItems = React.useMemo(() => buildSupervisionItems(), []);
  const clinicalAlerts = React.useMemo(
    () => buildClinicalAlertRows(resolvedAlertRows, acknowledgedAlertRows),
    [acknowledgedAlertRows, resolvedAlertRows],
  );
  const workload = React.useMemo(
    () =>
      wardNurses.reduce<Record<string, number>>((result, wardNurse) => {
        result[wardNurse] = Object.values(committedAssignments).filter(
          (assigned) => assigned === wardNurse,
        ).length;
        return result;
      }, {}),
    [committedAssignments, wardNurses],
  );
  const nurseFilterOptions = React.useMemo(
    () => ["All bedside nurses", ...wardNurses],
    [wardNurses],
  );
  const nurseAssignmentLabel = React.useCallback(
    (wardNurse: string) => `${wardNurse} (${workload[wardNurse] || "Available"})`,
    [workload],
  );
  const nurseAssignmentOptions = React.useMemo(
    () => ["Unassign Nurse", ...wardNurses.map(nurseAssignmentLabel)],
    [nurseAssignmentLabel, wardNurses],
  );

  function updateAssignment(patient: IcuPatient, selectedNurse: string) {
    setAssignments((current) => ({
      ...current,
      [patient.id]:
        selectedNurse === "Unassign Nurse" ? "" : selectedNurse.replace(/\s+\([^)]*\)$/, ""),
    }));
  }

  function saveAssignment(patient: IcuPatient) {
    const assignedNurse = assignments[patient.id] ?? "";
    setCommittedAssignments((current) => ({ ...current, [patient.id]: assignedNurse }));
    setEditingPatientId(null);
    toast.success(
      assignedNurse
        ? `${patient.bedNo} assigned to ${assignedNurse}`
        : `${patient.bedNo} nurse assignment removed`,
    );
  }

  function openLinkEditor(patient: IcuPatient) {
    setAssignments((current) => ({
      ...current,
      [patient.id]: committedAssignments[patient.id] ?? "",
    }));
    setEditingPatientId(patient.id);
  }

  const rows = icuPatients
    .map((patient) => ({
      patient,
      assignedNurse: assignments[patient.id] ?? "",
      committedNurse: committedAssignments[patient.id] ?? "",
    }))
    .filter(({ patient, committedNurse }) => {
      const searchMatch =
        `${patient.patientName} ${patient.mrn} ${patient.bedNo} ${patient.unit} ${committedNurse}`
          .toLowerCase()
          .includes(query.toLowerCase());
      const nurseMatch = nurse === "All bedside nurses" || committedNurse === nurse;
      return searchMatch && nurseMatch;
    })
    .sort((a, b) => unitPatientPriorityScore(b.patient) - unitPatientPriorityScore(a.patient));
  const pagination = useIcuCommandPagination(rows);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:p-4 xl:grid-cols-[minmax(220px,360px)_240px_auto_auto_auto] xl:items-end">
        <Input
          className="col-span-2 md:col-span-1"
          aria-label="Search assigned patients"
          placeholder="Search patient, bed, nurse..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="min-w-0">
          <NativeSelect
            label="Assigned Bedside Nurse"
            value={nurse}
            onChange={setNurse}
            options={nurseFilterOptions}
          />
        </div>
        <Button
          className="h-10 self-end"
          variant="outline"
          onClick={() => {
            setQuery("");
            setNurse("All bedside nurses");
          }}
        >
          Reset
        </Button>
        <Button asChild className="h-10 self-end whitespace-nowrap" variant="outline">
          <Link href="/icu-command-center/nursing/ward-escalations">
            <ShieldAlert className="h-4 w-4" />
            Escalations
          </Link>
        </Button>
        <Button asChild className="h-10 self-end whitespace-nowrap">
          <Link href="/icu-command-center/nursing/unit-shift-handover">
            <ClipboardCheck className="h-4 w-4" />
            Shift Handover
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed border-collapse text-sm md:min-w-[1480px]">
            <colgroup>
              <col className="w-[185px] md:w-[240px]" />
              <col className="w-[104px] md:w-[155px]" />
              <col className="w-[112px] md:w-[165px]" />
              <col className="w-[104px] md:w-[155px]" />
              <col className="w-[145px] md:w-[175px]" />
              <col className="w-[122px] md:w-[155px]" />
              <col className="w-[180px] md:w-[230px]" />
              <col className="w-[128px] md:w-[205px]" />
            </colgroup>
            <thead className="border-b border-border text-[11px] uppercase text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-40 bg-white px-3 py-4 text-left shadow-[8px_0_14px_-14px_rgba(15,23,42,0.75)] md:px-4">
                  Patient
                </th>
                <th className="px-2 py-4 text-center md:px-4">Vitals</th>
                <th className="px-2 py-4 text-center md:px-4">Medication</th>
                <th className="px-2 py-4 text-center md:px-4">I/O</th>
                <th className="px-2 py-4 text-center md:px-4">Pending Task</th>
                <th className="px-2 py-4 text-center md:px-4">Alerts</th>
                <th className="px-2 py-4 text-left md:px-4">Assigned Bedside Nurse</th>
                <th className="px-2 py-4 text-center md:px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {pagination.pageRows.map(({ patient, assignedNurse, committedNurse }) => {
                const selectValue = assignedNurse
                  ? nurseAssignmentLabel(assignedNurse)
                  : "Unassign Nurse";
                const latestVital = [...icuVitals]
                  .reverse()
                  .find((vital) => vital.patientId === patient.id);
                const patientMeds = medicationRows.filter((row) => row.patientId === patient.id);
                const lateMeds = patientMeds.filter((row) => row.status === "Late").length;
                const dueMeds = patientMeds.filter((row) => row.status === "Due").length;
                const ioRows = intakeOutputRows.filter((row) => row.patientId === patient.id);
                const netBalance = ioRows.reduce((total, row) => total + row.balanceMl, 0);
                const openTasks = icuTasks.filter(
                  (task) => task.patientId === patient.id && task.status !== "Completed",
                );
                const overdueTasks = openTasks.filter((task) => task.status === "Overdue").length;
                const patientAlerts = icuAlerts.filter(
                  (alert) => alert.patientId === patient.id && alert.status !== "Resolved",
                );
                const criticalAlerts = patientAlerts.filter(
                  (alert) => alert.severity === "Critical" || alert.severity === "High",
                ).length;
                const patientSupervisionItems = supervisionItems.filter(
                  (item) =>
                    item.patientId === patient.id && !isClosedSupervisionStatus(item.status),
                );
                const patientClinicalAlert = nursingStationTopAlert(clinicalAlerts, patient.id);
                const actionRow =
                  patientClinicalAlert ??
                  (patientSupervisionItems[0]
                    ? nursingStationActionRowFromItem(patientSupervisionItems[0])
                    : null);
                const actionTitle = criticalAlerts
                  ? "Escalate"
                  : overdueTasks
                    ? "Follow up"
                    : openTasks.length
                      ? "Review"
                      : patientAlerts.length
                        ? "Acknowledge"
                        : "Open action";
                const actionTone: DashboardCellTone = criticalAlerts
                  ? "danger"
                  : overdueTasks
                    ? "critical"
                    : openTasks.length || patientAlerts.length
                      ? "warning"
                      : "info";
                const ActionIcon = criticalAlerts
                  ? ShieldAlert
                  : overdueTasks || openTasks.length
                    ? ListChecks
                    : patientAlerts.length
                      ? AlertTriangle
                      : Eye;
                return (
                  <tr className="group hover:bg-slate-50" key={patient.id}>
                    <td className="sticky left-0 z-30 bg-white px-3 py-4 align-middle shadow-[8px_0_14px_-14px_rgba(15,23,42,0.75)] group-hover:bg-slate-50 md:px-4">
                      <Link
                        className={cn(
                          "block truncate font-bold hover:underline",
                          dashboardToneTextClass(toneForStatus(patient.currentStatus)),
                        )}
                        href={icuPatientDetailHref(patient.id, "overview")}
                      >
                        {patient.patientName}
                      </Link>
                      <p className="mt-1 truncate text-xs font-bold text-slate-950">
                        {patient.bedNo} | {patient.unit}
                      </p>
                    </td>
                    <td className="px-2 py-4 text-center align-middle md:px-4">
                      <IcuOpsMatrixCell
                        icon={HeartPulse}
                        title={
                          latestVital?.abnormal ? "Review" : latestVital ? "Current" : "Pending"
                        }
                        detail={
                          latestVital
                            ? `${latestVital.time} | SpO2 ${latestVital.spo2}%`
                            : "No vitals"
                        }
                        tone={
                          latestVital?.abnormal ? "warning" : latestVital ? "success" : "danger"
                        }
                        href={icuPatientDetailHref(patient.id, "monitoring", "24h-chart")}
                        showDetail={false}
                      />
                    </td>
                    <td className="px-2 py-4 text-center align-middle md:px-4">
                      <IcuOpsMatrixCell
                        icon={Pill}
                        title={
                          lateMeds
                            ? `${lateMeds} late`
                            : dueMeds
                              ? `${dueMeds} due`
                              : patientMeds.length
                                ? "Chart"
                                : "Clear"
                        }
                        detail={
                          patientMeds[0]
                            ? `${patientMeds[0].medication} | ${patientMeds[0].scheduledTime}`
                            : "No active dose"
                        }
                        tone={lateMeds ? "danger" : dueMeds ? "warning" : "success"}
                        href={icuPatientDetailHref(
                          patient.id,
                          "orders",
                          undefined,
                          "ordersTab=medicine-chart",
                        )}
                        showDetail={false}
                      />
                    </td>
                    <td className="px-2 py-4 text-center align-middle md:px-4">
                      <IcuOpsMatrixCell
                        icon={Droplets}
                        title={
                          ioRows.length
                            ? `${netBalance >= 0 ? "+" : ""}${netBalance} ml`
                            : "Pending"
                        }
                        detail={
                          ioRows[0] ? `${ioRows[0].time} | ${ioRows[0].component}` : "No I/O entry"
                        }
                        tone={
                          !ioRows.length
                            ? "warning"
                            : Math.abs(netBalance) > 1000
                              ? "danger"
                              : "info"
                        }
                        href={icuPatientDetailHref(patient.id, "monitoring", "intake-output")}
                        showDetail={false}
                      />
                    </td>
                    <td className="px-2 py-4 text-center align-middle md:px-4">
                      <IcuOpsMatrixCell
                        icon={ListChecks}
                        title={openTasks.length ? `${openTasks.length} pending` : "Clear"}
                        detail={
                          overdueTasks
                            ? `${overdueTasks} overdue`
                            : (openTasks[0]?.title ?? "No pending task")
                        }
                        tone={overdueTasks ? "critical" : openTasks.length ? "warning" : "success"}
                        showDetail={false}
                        onClick={() => setActivePendingTaskPatient(patient)}
                      />
                    </td>
                    <td className="px-2 py-4 text-center align-middle md:px-4">
                      <IcuOpsMatrixCell
                        icon={AlertTriangle}
                        title={patientAlerts.length ? `${patientAlerts.length} open` : "Clear"}
                        detail={patientAlerts[0]?.message ?? "No alert"}
                        tone={
                          criticalAlerts ? "danger" : patientAlerts.length ? "warning" : "success"
                        }
                        href={icuPatientDetailHref(
                          patient.id,
                          "events",
                          undefined,
                          "eventFocus=open-alerts",
                        )}
                        showDetail={false}
                      />
                    </td>
                    <td className="px-2 py-4 text-center align-middle md:px-4">
                      {committedNurse ? (
                        <span className="inline-flex h-9 min-w-44 max-w-[210px] items-center justify-center rounded-full bg-primary px-4 text-xs font-black text-primary-foreground shadow-[0_2px_5px_rgba(15,23,42,0.16)]">
                          <span className="truncate">{committedNurse}</span>
                        </span>
                      ) : null}
                    </td>
                    <td className="px-2 py-4 align-middle md:px-4">
                      <div className="flex min-w-[172px] flex-nowrap items-center justify-center gap-3">
                        {editingPatientId === patient.id ? (
                          <div className="grid w-full grid-cols-[minmax(0,1fr)_38px_38px] items-center gap-2">
                            <div className="min-w-0 [&_select]:truncate [&_select]:pr-8">
                              <NativeSelect
                                label="Assigned Bedside Nurse"
                                value={selectValue}
                                onChange={(value) => updateAssignment(patient, value)}
                                options={nurseAssignmentOptions}
                              />
                            </div>
                            <Button
                              aria-label="Assign Nurse"
                              className="h-9 w-9 p-0"
                              size="sm"
                              title="Assign Nurse"
                              onClick={() => saveAssignment(patient)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                              aria-label="Cancel"
                              className="h-9 w-9 p-0"
                              size="sm"
                              title="Cancel"
                              variant="outline"
                              onClick={() => {
                                setAssignments((current) => ({
                                  ...current,
                                  [patient.id]: committedNurse,
                                }));
                                setEditingPatientId(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Button
                              aria-label={actionTitle}
                              className={cn(
                                "h-9 w-9 border-0 p-0 text-white shadow-[0_2px_5px_rgba(15,23,42,0.16)] hover:brightness-95",
                                dashboardToneSolidClass(actionTone),
                              )}
                              size="sm"
                              title={actionTitle}
                              onClick={() =>
                                actionRow
                                  ? setActiveClinicalAlert({ row: actionRow, kind: "action" })
                                  : setActivePendingTaskPatient(patient)
                              }
                            >
                              <ActionIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              aria-label="Assign Nurse"
                              className="h-9 w-9 p-0"
                              size="sm"
                              title="Assign Nurse"
                              variant={committedNurse ? "outline" : "default"}
                              onClick={() => openLinkEditor(patient)}
                            >
                              {committedNurse ? (
                                <ArrowRightLeft className="h-4 w-4" />
                              ) : (
                                <Link2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td className="px-3 py-10 text-center text-slate-500" colSpan={8}>
                    No assigned patient matched.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <IcuCommandPaginationControls {...pagination} />
      </div>
      <ClinicalAlertActionDialog
        action={activeClinicalAlert}
        onOpenChange={(open) => !open && setActiveClinicalAlert(null)}
        onComplete={(row, actionLabel) => {
          if (actionLabel === "Resolve / Close")
            setResolvedAlertRows((current) => new Set([...current, row.id]));
          if (actionLabel === "Acknowledge")
            setAcknowledgedAlertRows((current) => new Set([...current, row.id]));
          toast.success(`${row.bedNo}: ${actionLabel.toLowerCase()} saved`);
          setActiveClinicalAlert(null);
        }}
      />
      <PendingUnitMonitoringQueueDialog
        patient={activePendingTaskPatient}
        onOpenChange={(open) => !open && setActivePendingTaskPatient(null)}
      />
    </div>
  );
}

function unitPatientPriorityScore(patient: IcuPatient) {
  return (
    (patient.currentStatus === "Critical" ? 100 : 0) +
    (patient.ventilatorStatus !== "Room air" ? 50 : 0) +
    patient.pendingTasks
  );
}
