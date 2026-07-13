import {
  AlertTriangle,
  BedDouble,
  ClipboardCheck,
  ListChecks,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";

import type { HeadNurseModuleConfig } from "./head-nurse-types";

export const headNurseModules: HeadNurseModuleConfig[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    route: "/head-nurse",
    title: "Head Nurse Dashboard",
    description: "Role-based control tower for new admissions, unit capacity, staffing, assignments, alerts, escalations, and handover.",
    permission: "head_nurse.dashboard.view",
    icon: ShieldAlert,
  },
  {
    id: "new-admissions",
    label: "New Admissions",
    route: "/head-nurse/new-admissions",
    title: "New Admission Review",
    description: "Review patient details, bed readiness, doctor ownership, and required ICU care before assignment.",
    permission: "head_nurse.admission.review",
    icon: UserCheck,
  },
  {
    id: "unit-availability",
    label: "Unit Availability",
    route: "/head-nurse/unit-availability",
    title: "Unit Availability",
    description: "Check ICU beds, isolation capacity, ventilator beds, occupancy, and critical load.",
    permission: "head_nurse.unit.view",
    icon: BedDouble,
  },
  {
    id: "staff-availability",
    label: "Staff Availability",
    route: "/head-nurse/staff-availability",
    title: "Staff Availability",
    description: "Review ICU Nurse workload, active coverage, critical assignments, and capacity warnings.",
    permission: "head_nurse.staff.view",
    icon: Users,
  },
  {
    id: "patient-assignment",
    label: "Patient Assignment",
    route: "/head-nurse/patient-assignment",
    title: "Patient Assignment",
    description: "Assign reviewed patients to ICU Nurse with unit and staff readiness visible in one place.",
    permission: "head_nurse.assignment.manage",
    icon: ClipboardCheck,
  },
  {
    id: "alerts-delays",
    label: "Alerts & Delays",
    route: "/head-nurse/alerts-delays",
    title: "Alerts & Delays",
    description: "Monitor critical delays across vitals, medicines, doctor orders, tasks, and documentation.",
    permission: "head_nurse.alerts.view",
    icon: AlertTriangle,
  },
  {
    id: "escalations",
    label: "Escalations",
    route: "/head-nurse/escalations",
    title: "Escalations",
    description: "Review escalated issues from ICU Nurse and Doctor, and command workflows.",
    permission: "head_nurse.escalation.review",
    icon: ShieldAlert,
  },
  {
    id: "shift-handover",
    label: "Shift Handover",
    route: "/head-nurse/shift-handover",
    title: "Shift Handover Verification",
    description: "Verify pending work, critical notes, open alerts, and next shift readiness before handover acceptance.",
    permission: "head_nurse.handover.verify",
    icon: ListChecks,
  },
];

export function getHeadNurseModule(id: HeadNurseModuleConfig["id"]) {
  return headNurseModules.find((module) => module.id === id) ?? headNurseModules[0];
}
