import { icuPatients } from "../nursing-icu-data";
import type { IcuPatient } from "../nursing-icu-data";
import type { HeadNurseTone } from "./head-nurse-types";

export type HeadNurseAdmissionReviewStatus = "Pending Review" | "Verification pending" | "Verified";
export type HeadNurseUnitReadinessStatus = "Review pending" | "Ready" | "Limited" | "No bed" | "No ventilator" | "Ventilator bed needed" | "Unit setup pending";
export type HeadNurseStaffReadinessStatus = "Not checked" | "Unit pending" | "Ready" | "Select nurse" | "No nurse";
export type HeadNurseIcuPatient = Pick<
  IcuPatient,
  | "id"
  | "bedNo"
  | "patientName"
  | "mrn"
  | "ageGender"
  | "diagnosis"
  | "admittingDoctor"
  | "consultingDoctor"
  | "dutyDoctor"
  | "assignedUnitNurse"
  | "assignedWardNurse"
  | "admissionSource"
  | "currentStatus"
  | "criticalityScore"
  | "ventilatorStatus"
  | "lastVitalsTime"
  | "pendingTasks"
  | "alerts"
  | "unit"
  | "admissionTime"
> & {
  dischargeTime?: string;
};

export type HeadNurseIcuUnitCapacity = {
  totalBeds: number;
  isolationBeds: number;
  ventilatorBeds: number;
  totalMonitors: number;
  totalInfusionPumps: number;
};

export type HeadNurseIcuNurseStatus = "Available" | "Overloaded" | "Off duty";

export type HeadNurseIcuNurse = {
  id: string;
  nurse: string;
  bedNurse: string;
  role: "ICU Nurse";
  unit: string;
  assignedPatients: number;
  criticalPatients: number;
  maxCapacity: number;
  status: HeadNurseIcuNurseStatus;
  tone: HeadNurseTone;
};

export type HeadNurseAssignmentDraft = {
  selectedUnitNurse: string;
};

export const headNurseIcuUnitCapacity: Record<string, HeadNurseIcuUnitCapacity> = {
  "Cardiothoracic ICU": { totalBeds: 4, isolationBeds: 1, ventilatorBeds: 4, totalMonitors: 4, totalInfusionPumps: 4 },
  "General ICU": { totalBeds: 6, isolationBeds: 1, ventilatorBeds: 2, totalMonitors: 6, totalInfusionPumps: 6 },
  "Medical ICU": { totalBeds: 6, isolationBeds: 1, ventilatorBeds: 2, totalMonitors: 6, totalInfusionPumps: 6 },
  "Neuro ICU": { totalBeds: 4, isolationBeds: 1, ventilatorBeds: 2, totalMonitors: 4, totalInfusionPumps: 4 },
  "Pediatric ICU": { totalBeds: 4, isolationBeds: 1, ventilatorBeds: 2, totalMonitors: 4, totalInfusionPumps: 4 },
  "Respiratory ICU": { totalBeds: 4, isolationBeds: 1, ventilatorBeds: 3, totalMonitors: 4, totalInfusionPumps: 4 },
  "Surgical ICU": { totalBeds: 2, isolationBeds: 1, ventilatorBeds: 1, totalMonitors: 2, totalInfusionPumps: 2 },
  "Transplant ICU": { totalBeds: 3, isolationBeds: 2, ventilatorBeds: 2, totalMonitors: 3, totalInfusionPumps: 3 },
};

export const headNurseAdmissionReviewOverrides: Record<string, HeadNurseAdmissionReviewStatus> = {
  "icu-002": "Pending Review",
};

export const headNurseUnitReadinessOverrides: Record<string, HeadNurseUnitReadinessStatus> = {
  "icu-002": "Limited",
  "icu-004": "No bed",
  "icu-006": "Ventilator bed needed",
  "icu-010": "Unit setup pending",
};

export const headNurseAssignmentDrafts: Record<string, HeadNurseAssignmentDraft> = {
  "icu-001": { selectedUnitNurse: "Priya" },
  "icu-002": { selectedUnitNurse: "Meera" },
  "icu-004": { selectedUnitNurse: "Meera" },
  "icu-012": { selectedUnitNurse: "Priya" },
};

export const headNurseIcuNurseRoster: HeadNurseIcuNurse[] = [
  { id: "icu-nurse-priya", nurse: "Priya", bedNurse: "Kavita", role: "ICU Nurse", unit: "Pediatric ICU", assignedPatients: 4, criticalPatients: 1, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-meera", nurse: "Meera", bedNurse: "Arjun", role: "ICU Nurse", unit: "General ICU", assignedPatients: 5, criticalPatients: 1, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-kabir", nurse: "Kabir", bedNurse: "Neha", role: "ICU Nurse", unit: "General ICU", assignedPatients: 3, criticalPatients: 0, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-farhan", nurse: "Farhan", bedNurse: "Rina", role: "ICU Nurse", unit: "Respiratory ICU", assignedPatients: 6, criticalPatients: 2, maxCapacity: 6, status: "Overloaded", tone: "critical" },
  { id: "icu-nurse-zoya", nurse: "Zoya", bedNurse: "Ritu", role: "ICU Nurse", unit: "Respiratory ICU", assignedPatients: 2, criticalPatients: 0, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-ananya", nurse: "Ananya", bedNurse: "Lakshmi", role: "ICU Nurse", unit: "Surgical ICU", assignedPatients: 1, criticalPatients: 0, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-vikram", nurse: "Vikram", bedNurse: "Kavita", role: "ICU Nurse", unit: "Cardiothoracic ICU", assignedPatients: 2, criticalPatients: 1, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-sana", nurse: "Sana", bedNurse: "Pooja", role: "ICU Nurse", unit: "Medical ICU", assignedPatients: 2, criticalPatients: 0, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-rhea", nurse: "Rhea", bedNurse: "Deepa", role: "ICU Nurse", unit: "Neuro ICU", assignedPatients: 4, criticalPatients: 1, maxCapacity: 6, status: "Available", tone: "success" },
  { id: "icu-nurse-aman", nurse: "Aman", bedNurse: "Nisha", role: "ICU Nurse", unit: "Transplant ICU", assignedPatients: 5, criticalPatients: 1, maxCapacity: 6, status: "Available", tone: "success" },
];

export const headNurseIcuPatients: HeadNurseIcuPatient[] = icuPatients.map(toHeadNurseIcuPatient);

function toHeadNurseIcuPatient(patient: IcuPatient): HeadNurseIcuPatient {
  const selectedNurse = headNurseAssignmentDrafts[patient.id]?.selectedUnitNurse;

  return {
    id: patient.id,
    bedNo: patient.bedNo,
    patientName: patient.patientName,
    mrn: patient.mrn,
    ageGender: patient.ageGender,
    diagnosis: patient.diagnosis,
    admittingDoctor: patient.admittingDoctor,
    consultingDoctor: patient.consultingDoctor,
    dutyDoctor: patient.dutyDoctor,
    assignedUnitNurse: selectedNurse ? `ICU Nurse ${selectedNurse}` : "",
    assignedWardNurse: patient.assignedWardNurse,
    admissionSource: patient.admissionSource,
    currentStatus: patient.currentStatus,
    criticalityScore: patient.criticalityScore,
    ventilatorStatus: patient.ventilatorStatus,
    lastVitalsTime: patient.lastVitalsTime,
    pendingTasks: patient.pendingTasks,
    alerts: patient.alerts,
    unit: patient.unit,
    admissionTime: patient.admissionTime,
    dischargeTime: patient.currentStatus === "Discharge ordered" ? "15 Jul 2026, 10:30 AM" : undefined,
  };
}
