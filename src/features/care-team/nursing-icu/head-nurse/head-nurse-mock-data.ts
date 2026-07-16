import {
  doctorInstructions,
  icuAlerts,
  icuTasks,
} from "../nursing-icu-data";
import { getMappedDevicesForPatient } from "../nursing-icu-device-mappings";
import {
  headNurseAdmissionReviewOverrides,
  headNurseAssignmentDrafts,
  headNurseIcuNurseRoster,
  headNurseIcuPatients,
  headNurseIcuUnitCapacity,
  type HeadNurseAdmissionReviewStatus,
  type HeadNurseAssignmentDraft,
  type HeadNurseIcuPatient,
  type HeadNurseStaffReadinessStatus,
  type HeadNurseUnitReadinessStatus,
} from "./head-nurse-data";
import type { HeadNurseIcuDashboardRow, HeadNurseOtherDeviceInventory, HeadNursePatientRow, HeadNurseStaffRow, HeadNurseTone, HeadNurseUnitRow } from "./head-nurse-types";

type HeadNurseWorkflowOptions = {
  includeStoredState?: boolean;
};

const ADMISSION_REVIEW_STATUS_STORAGE_KEY = "head-nurse-admission-review-status";
const UNIT_NURSE_ASSIGNMENT_STORAGE_KEY = "head-nurse-unit-nurse-assignment";

const otherDevicesByUnit: Record<string, HeadNurseOtherDeviceInventory[]> = {
  "Cardiothoracic ICU": [
    { deviceType: "Syringe Pump", total: 8, inUse: 5, maintenance: 1 },
    { deviceType: "NIV / BiPAP", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "General ICU": [
    { deviceType: "Syringe Pump", total: 10, inUse: 7, maintenance: 1 },
    { deviceType: "NIV / BiPAP", total: 3, inUse: 2, maintenance: 0 },
    { deviceType: "HFNC", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "CRRT / Dialysis", total: 1, inUse: 0, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "Medical ICU": [
    { deviceType: "Syringe Pump", total: 9, inUse: 6, maintenance: 0 },
    { deviceType: "NIV / BiPAP", total: 3, inUse: 1, maintenance: 1 },
    { deviceType: "HFNC", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "CRRT / Dialysis", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "Neuro ICU": [
    { deviceType: "Syringe Pump", total: 7, inUse: 4, maintenance: 0 },
    { deviceType: "NIV / BiPAP", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "Pediatric ICU": [
    { deviceType: "Syringe Pump", total: 8, inUse: 5, maintenance: 0 },
    { deviceType: "NIV / BiPAP", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "HFNC", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "Respiratory ICU": [
    { deviceType: "Syringe Pump", total: 7, inUse: 5, maintenance: 0 },
    { deviceType: "NIV / BiPAP", total: 4, inUse: 3, maintenance: 0 },
    { deviceType: "HFNC", total: 3, inUse: 2, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "Surgical ICU": [
    { deviceType: "Syringe Pump", total: 5, inUse: 3, maintenance: 0 },
    { deviceType: "NIV / BiPAP", total: 1, inUse: 0, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
  "Transplant ICU": [
    { deviceType: "Syringe Pump", total: 7, inUse: 5, maintenance: 0 },
    { deviceType: "NIV / BiPAP", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "CRRT / Dialysis", total: 2, inUse: 1, maintenance: 0 },
    { deviceType: "Defibrillator", total: 1, inUse: 0, maintenance: 0 },
  ],
};

export const headNursePatients = headNurseIcuPatients;

export function setAdmissionReviewStatus(patientId: string, status: HeadNurseAdmissionReviewStatus) {
  if (typeof window === "undefined") return;

  const overrides = readStoredAdmissionReviewOverrides();
  overrides[patientId] = status;
  window.localStorage.setItem(ADMISSION_REVIEW_STATUS_STORAGE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event("head-nurse-workflow-status-change"));
}

export function setSelectedUnitNurseForPatient(patientId: string, nurse: string) {
  if (typeof window === "undefined") return;

  const assignments = readStoredUnitNurseAssignments();
  assignments[patientId] = { selectedUnitNurse: nurse };
  window.localStorage.setItem(UNIT_NURSE_ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignments));
  window.dispatchEvent(new Event("head-nurse-workflow-status-change"));
}

export function headNursePatientHref(route: string, patientId: string) {
  return `${route}?patientId=${encodeURIComponent(patientId)}`;
}

export function headNursePatientTone(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}): HeadNurseTone {
  const workflow = patientWorkflowStatus(patient, options);

  if (workflow.unitStatus === "No bed" || workflow.unitStatus === "No ventilator" || workflow.unitStatus === "Ventilator bed needed" || workflow.staffStatus === "No nurse") return "danger";
  if (patient.criticalityScore >= 8 || patient.currentStatus === "Critical") return "critical";
  if (workflow.unitStatus === "Limited" || workflow.staffStatus === "Select nurse") return "warning";
  if (patient.pendingTasks >= 5 || patient.alerts.length >= 2) return "danger";
  if (patient.pendingTasks >= 3 || patient.currentStatus === "Ventilated") return "warning";
  if (patient.currentStatus === "Ready for transfer" || patient.currentStatus === "Discharge ordered") return "info";
  return "success";
}

export const headNurseStaffRows: HeadNurseStaffRow[] = headNurseIcuNurseRoster.map((nurse) => ({ ...nurse }));
export const headNurseUnitRows: HeadNurseUnitRow[] = buildHeadNurseUnitRows();
export const headNurseIcuDashboardRows: HeadNurseIcuDashboardRow[] = buildHeadNurseIcuDashboardRows();

export function getHeadNurseIcuDashboardRows() {
  return buildHeadNurseIcuDashboardRows();
}

export function getAvailableIcuNursesForPatient(patient: HeadNurseIcuPatient) {
  return headNurseStaffRows.filter((staff) => staff.unit === patient.unit && staff.status === "Available" && staff.assignedPatients < staff.maxCapacity);
}

export function reviewStatusForPatient(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}): HeadNurseAdmissionReviewStatus {
  return readStoredAdmissionReviewOverrides(options)[patient.id] ?? headNurseAdmissionReviewOverrides[patient.id] ?? "Verified";
}

export function isAdmissionReviewComplete() {
  return true;
}

export function unitReadinessForPatient(patient: HeadNurseIcuPatient): HeadNurseUnitReadinessStatus {
  const unit = getIcuDashboardRowForUnit(patient.unit);
  if (!unit) return "Unit setup pending";
  if (unit.availableBeds <= 0) return "No bed";
  if (patientNeedsVentilator(patient) && unit.availableVentilatorBeds <= 0) return "No ventilator";
  return unit.availableBeds <= 1 || unit.availableIcuNurses <= 1 ? "Limited" : "Ready";
}

export function isUnitReadyForStaffCheck(patient: HeadNurseIcuPatient) {
  const readiness = unitReadinessForPatient(patient);
  return readiness === "Ready" || readiness === "Limited";
}

export function selectedUnitNurseForPatient(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}) {
  return readStoredUnitNurseAssignments(options)[patient.id]?.selectedUnitNurse ?? headNurseAssignmentDrafts[patient.id]?.selectedUnitNurse ?? "";
}

export function selectedUnitNurseStaffForPatient(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}) {
  const selectedUnitNurse = selectedUnitNurseForPatient(patient, options);
  if (!selectedUnitNurse) return undefined;

  return headNurseStaffRows.find((row) => row.unit === patient.unit && row.role === "ICU Nurse" && row.nurse === selectedUnitNurse);
}

export function staffReadinessForPatient(patient: HeadNurseIcuPatient): HeadNurseStaffReadinessStatus {
  if (!isUnitReadyForStaffCheck(patient)) return "Unit pending";
  return getAvailableIcuNursesForPatient(patient).length ? "Ready" : "No nurse";
}

export function isStaffReadyForAssignment(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}) {
  if (staffReadinessForPatient(patient) !== "Ready") return false;

  const selectedStaff = selectedUnitNurseStaffForPatient(patient, options);
  return Boolean(selectedStaff && selectedStaff.status === "Available" && selectedStaff.assignedPatients < selectedStaff.maxCapacity);
}

export function assignmentStatusForPatient(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}) {
  if (!isUnitReadyForStaffCheck(patient) || staffReadinessForPatient(patient) !== "Ready") return "Locked";

  const selectedUnitNurse = selectedUnitNurseForPatient(patient, options);
  const selectedStaff = selectedUnitNurseStaffForPatient(patient, options);
  if (!selectedUnitNurse || !selectedStaff || selectedStaff.status !== "Available" || selectedStaff.assignedPatients >= selectedStaff.maxCapacity) return "Select ICU Nurse";
  return `ICU Nurse ${selectedUnitNurse}`;
}

export function canAssignPatient(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}) {
  return isUnitReadyForStaffCheck(patient) && staffReadinessForPatient(patient) === "Ready" && isStaffReadyForAssignment(patient, options);
}

export const headNursePatientRows: HeadNursePatientRow[] = buildHeadNursePatientRows({ includeStoredState: false });

export function getHeadNursePatientRows(options: HeadNurseWorkflowOptions = {}) {
  return buildHeadNursePatientRows(options);
}

function buildHeadNursePatientRows(options: HeadNurseWorkflowOptions = {}): HeadNursePatientRow[] {
  return headNursePatients
    .map((patient, index) => {
      const alerts = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.status !== "Resolved");
      const tasks = icuTasks.filter((task) => task.patientId === patient.id && task.status !== "Completed");
      const orders = doctorInstructions.filter((order) => order.patientId === patient.id && order.status !== "Completed");
      const workflow = patientWorkflowStatus(patient, options);
      const tone = headNursePatientTone(patient, options);
      const row: HeadNursePatientRow = {
        patient,
        reviewStatus: workflow.reviewStatus,
        unitStatus: workflow.unitStatus,
        staffStatus: workflow.staffStatus,
        assignmentStatus: workflow.assignmentStatus,
        alertStatus: alerts.length ? `${alerts.length} Alert` : "Clear",
        handoverStatus: tasks.length || orders.length ? `${tasks.length + orders.length} pending` : "Ready",
        action: workflow.action,
        tone,
      };

      return { row, index };
    })
    .sort((left, right) => patientSortScore(left.row) - patientSortScore(right.row) || left.index - right.index)
    .map(({ row }) => row);
}

function buildHeadNurseUnitRows(): HeadNurseUnitRow[] {
  return Object.entries(headNurseIcuUnitCapacity).map(([unit, capacity]) => {
    const patients = headNursePatients.filter((patient) => patient.unit === unit);
    const occupiedBeds = patients.length;
    const availableBeds = Math.max(0, capacity.totalBeds - occupiedBeds);
    const criticalPatients = patients.filter((patient) => patient.criticalityScore >= 8).length;
    const tone: HeadNurseTone = availableBeds <= 0 ? "danger" : availableBeds <= 1 || criticalPatients >= 2 ? "warning" : "success";

    return {
      unit,
      ...capacity,
      occupiedBeds,
      availableBeds,
      criticalPatients,
      status: tone === "danger" ? "No bed" : tone === "warning" ? "Limited" : "Ready",
      tone,
    };
  });
}

function buildHeadNurseIcuDashboardRows(): HeadNurseIcuDashboardRow[] {
  return headNurseUnitRows.map((unitRow) => {
    const patients = headNursePatients.filter((patient) => patient.unit === unitRow.unit);
    const nurses = headNurseStaffRows.filter((nurse) => nurse.unit === unitRow.unit);
    const availableNurses = nurses.filter((nurse) => nurse.status === "Available" && nurse.assignedPatients < nurse.maxCapacity);
    const mappedDevices = patients.flatMap((patient) => getMappedDevicesForPatient(patient));
    const mappedVentilators = mappedDevices.filter((device) => device.type === "Ventilator").length;
    const mappedMonitors = mappedDevices.filter((device) => device.type === "Monitor").length;
    const mappedInfusionPumps = mappedDevices.filter((device) => device.type === "Infusion Pump").length;
    const availableVentilatorBeds = Math.max(0, unitRow.ventilatorBeds - mappedVentilators);
    const availableMonitors = Math.max(0, unitRow.totalMonitors - mappedMonitors);
    const availableInfusionPumps = Math.max(0, unitRow.totalInfusionPumps - mappedInfusionPumps);
    const otherDevices = otherDevicesByUnit[unitRow.unit] ?? [];
    const otherDevicesTotal = otherDevices.reduce((total, device) => total + device.total, 0);
    const otherDevicesInUse = otherDevices.reduce((total, device) => total + device.inUse, 0);
    const otherDevicesAvailable = otherDevices.reduce((total, device) => total + Math.max(0, device.total - device.inUse - device.maintenance), 0);
    const openAlerts = icuAlerts.filter((alert) => patients.some((patient) => patient.id === alert.patientId) && alert.status !== "Resolved").length;
    const status = icuStatusForRow(unitRow.availableBeds, availableVentilatorBeds, availableNurses.length);
    const tone = icuToneForStatus(status);

    return {
      id: unitRow.unit.toLowerCase().replace(/\s+/g, "-"),
      unit: unitRow.unit,
      totalBeds: unitRow.totalBeds,
      occupiedBeds: unitRow.occupiedBeds,
      availableBeds: unitRow.availableBeds,
      ventilatorBeds: unitRow.ventilatorBeds,
      availableVentilatorBeds,
      totalMonitors: unitRow.totalMonitors,
      availableMonitors,
      totalInfusionPumps: unitRow.totalInfusionPumps,
      availableInfusionPumps,
      isolationBeds: unitRow.isolationBeds,
      totalIcuNurses: nurses.length,
      availableIcuNurses: availableNurses.length,
      mappedVentilators,
      mappedMonitors,
      mappedInfusionPumps,
      otherDevices,
      otherDevicesTotal,
      otherDevicesInUse,
      otherDevicesAvailable,
      criticalPatients: unitRow.criticalPatients,
      openAlerts,
      status,
      tone,
    };
  });
}

function getIcuDashboardRowForUnit(unitName: string) {
  return buildHeadNurseIcuDashboardRows().find((row) => row.unit === unitName);
}

function icuStatusForRow(availableBeds: number, availableVentilatorBeds: number, availableNurses: number) {
  if (availableBeds <= 0) return "No bed";
  if (availableNurses <= 0) return "No nurse";
  if (availableVentilatorBeds <= 0) return "No ventilator";
  if (availableBeds <= 1 || availableNurses <= 1) return "Limited";
  return "Ready";
}

function icuToneForStatus(status: string): HeadNurseTone {
  if (status === "Ready") return "success";
  if (status === "Limited") return "warning";
  return "danger";
}

function patientNeedsVentilator(patient: HeadNurseIcuPatient) {
  return patient.ventilatorStatus !== "Room air";
}

function patientSortScore(row: HeadNursePatientRow) {
  if (row.tone === "critical" || row.tone === "danger") return 0;
  if (row.assignmentStatus === "Assign") return 1;
  return 2;
}

function readStoredAdmissionReviewOverrides(options: HeadNurseWorkflowOptions = {}): Partial<Record<string, HeadNurseAdmissionReviewStatus>> {
  if (typeof window === "undefined" || options.includeStoredState === false) return {};

  try {
    const stored = window.localStorage.getItem(ADMISSION_REVIEW_STATUS_STORAGE_KEY);
    return stored ? JSON.parse(stored) as Partial<Record<string, HeadNurseAdmissionReviewStatus>> : {};
  } catch {
    return {};
  }
}

function readStoredUnitNurseAssignments(options: HeadNurseWorkflowOptions = {}): Partial<Record<string, HeadNurseAssignmentDraft>> {
  if (typeof window === "undefined" || options.includeStoredState === false) return {};

  try {
    const stored = window.localStorage.getItem(UNIT_NURSE_ASSIGNMENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) as Partial<Record<string, HeadNurseAssignmentDraft>> : {};
  } catch {
    return {};
  }
}

function patientWorkflowStatus(patient: HeadNurseIcuPatient, options: HeadNurseWorkflowOptions = {}) {
  const reviewStatus = reviewStatusForPatient(patient, options);
  const unitStatus = unitReadinessForPatient(patient);
  const staffStatus = staffReadinessForPatient(patient);
  const assignmentStatus = assignmentStatusForPatient(patient, options);
  const action = !isUnitReadyForStaffCheck(patient) ? "Check ICU" : staffStatus !== "Ready" ? "Check staff" : assignmentStatus === "Assign" ? "Assign" : "Open";

  return {
    reviewStatus,
    unitStatus,
    staffStatus,
    assignmentStatus,
    action,
  };
}
