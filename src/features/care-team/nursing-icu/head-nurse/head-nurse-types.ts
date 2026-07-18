import type { LucideIcon } from "lucide-react";
import type { HeadNurseIcuPatient } from "./head-nurse-data";

export type HeadNurseModuleId =
  | "dashboard"
  | "new-admissions"
  | "unit-availability"
  | "staff-availability"
  | "patient-assignment"
  | "alerts-delays"
  | "escalations"
  | "shift-handover";

export type HeadNurseTone = "critical" | "danger" | "warning" | "success" | "info" | "muted";

export type HeadNurseModuleConfig = {
  id: HeadNurseModuleId;
  label: string;
  route: string;
  title: string;
  description: string;
  permission: string;
  icon: LucideIcon;
};

export type HeadNursePatientRow = {
  patient: HeadNurseIcuPatient;
  reviewStatus: string;
  unitStatus: string;
  staffStatus: string;
  assignmentStatus: string;
  alertStatus: string;
  handoverStatus: string;
  action: string;
  tone: HeadNurseTone;
};

export type HeadNurseUnitRow = {
  unit: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  isolationBeds: number;
  ventilatorBeds: number;
  criticalPatients: number;
  status: string;
  tone: HeadNurseTone;
};

export type HeadNurseIcuDashboardRow = {
  id: string;
  unit: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  ventilatorBeds: number;
  availableVentilatorBeds: number;
  isolationBeds: number;
  totalIcuNurses: number;
  availableIcuNurses: number;
  criticalPatients: number;
  openAlerts: number;
  status: string;
  tone: HeadNurseTone;
};

export type HeadNurseStaffRow = {
  nurse: string;
  role: "ICU Nurse";
  unit: string;
  assignedPatients: number;
  criticalPatients: number;
  maxCapacity: number;
  status: string;
  tone: HeadNurseTone;
};

export type HeadNursePageProps = {
  initialPatientId?: string;
};

export type HeadNursePatientContextValue = {
  patient: HeadNurseIcuPatient | undefined;
  patientId: string;
  setPatientId: (_value: string) => void;
};
