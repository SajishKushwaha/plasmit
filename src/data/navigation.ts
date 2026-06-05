import {
  Activity,
  Ambulance,
  Archive,
  Ban,
  BarChart3,
  BedDouble,
  Bell,
  Bot,
  BriefcaseMedical,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  DoorOpen,
  Droplets,
  FileText,
  FlaskConical,
  HeartPulse,
  Home,
  IdCard,
  Landmark,
  LayoutDashboard,
  ListPlus,
  LockKeyhole,
  MessageSquareText,
  Microscope,
  Pill,
  RadioTower,
  ScanSearch,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Store,
  Syringe,
  UserCog,
  UserRound,
  Users,
  Video,
  Workflow,
} from "lucide-react";

import type { NavigationItem, Role } from "@/types";

export const navigationItems: NavigationItem[] = [
  // =====================================================
  // NON-DOCTOR ROLES: Main Dashboard
  // =====================================================
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "/dashboard",
    group: "Command",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Lab Technician", "Radiologist", "Pharmacist", "Billing Executive", "HR Manager", "Management"],
    status: "ready",
  },

  // =====================================================
  // DOCTOR: MAIN
  // =====================================================
  { id: "doctor-dashboard",    label: "Dashboard",            icon: LayoutDashboard,   route: "/doctor-dashboard",     group: "Main",     allowedRoles: ["Doctor"], status: "ready" },

  // =====================================================
  // DOCTOR: CLINICAL
  // =====================================================
  { id: "doctor-appointments", label: "Appointments",         icon: CalendarClock,     route: "/appointments",         group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-opd-queue",    label: "OPD Queue",            icon: Stethoscope,       route: "/opd",                  group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-orders",       label: "Orders",               icon: ScanSearch,        route: "/doctor/orders",        group: "Doctor",   allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-prescription", label: "Prescription",         icon: Pill,              route: "/doctor/prescription",  group: "Doctor",   allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-consult",      label: "Consultations",        icon: UserRound,         route: "/rapid-review",         group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-patients",     label: "Patient Records",      icon: IdCard,            route: "/patients",             group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-rx",           label: "Prescriptions",        icon: Pill,              route: "/prescriptions",        group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-lab",          label: "Lab Reports",          icon: FlaskConical,      route: "/laboratory",           group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-radiology",    label: "Radiology",            icon: ScanSearch,        route: "/radiology",            group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-emergency",    label: "Emergency Alerts",     icon: ShieldAlert,       route: "/emergency",            group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-tele",         label: "Telemedicine",         icon: Video,             route: "/telemedicine",         group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-followups",    label: "Follow-ups",           icon: CalendarCheck,     route: "/follow-ups",           group: "Clinical", allowedRoles: ["Doctor"], status: "ready" },

  // =====================================================
  // DOCTOR: SCHEDULE
  // =====================================================
  { id: "doctor-availability", label: "Availability Mgmt",   icon: CalendarRange,     route: "/doctor-availability", group: "Schedule", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-calendar",     label: "Calendar & Schedule",  icon: Calendar,          route: "/appointments",         group: "Schedule", allowedRoles: ["Doctor"], status: "ready" },

  // =====================================================
  // DOCTOR: PLATFORM
  // =====================================================
  { id: "doctor-messages",     label: "Messages",             icon: MessageSquareText, route: "/messages",             group: "Platform", allowedRoles: ["Doctor"], status: "ready" },
  { id: "doctor-settings",     label: "Settings",             icon: Settings,          route: "/settings",             group: "Platform", allowedRoles: ["Doctor"], status: "ready" },

  // =====================================================
  // ADMIN / MANAGEMENT: Clinical Operations
  // =====================================================
  { id: "billing-desk",        label: "Billing Desk",   icon: CreditCard,    route: "/billing-desk", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Receptionist", "Billing Executive", "Management"], status: "ready" },
  { id: "appointments",        label: "Appointment",    icon: CalendarClock, route: "/appointments", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Receptionist", "Nurse", "Billing Executive", "Management"], status: "ready" },
  {
    id: "admission", label: "Admission", icon: DoorOpen, route: "/admission", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Billing Executive", "Management"],
    status: "ready",
  },
  { id: "opd",                 label: "OPD",            icon: Stethoscope,   route: "/opd",          group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Pharmacist", "Lab Technician", "Management"], status: "ready" },
  { id: "clinical-examination",label: "Clinical Exam",  icon: ClipboardList, route: "/clinical-examination", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Management"], status: "ready" },
  { id: "rapid-review",        label: "Rapid Review",   icon: Activity,      route: "/rapid-review", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Management"], status: "ready" },
  { id: "hospital-admin-ldt",   label: "LDT",            icon: FlaskConical,  route: "/hospital-admin/ldt", group: "Hospital Admin", allowedRoles: ["Hospital Admin"], status: "ready" },
  { id: "icu-nursing-station",  label: "Nurse Station",  icon: BedDouble,     route: "/icu-nursing", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-patients", label: "Assigned Patients", icon: Users,     route: "/icu-nursing/patients", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-medications", label: "Medication Administration", icon: Syringe, route: "/icu-nursing/medications", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-tasks",    label: "Clinical Tasks", icon: ClipboardList, route: "/icu-nursing/tasks", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-handover", label: "Shift Handover", icon: Workflow, route: "/icu-nursing/handover", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-family",   label: "Family Communication", icon: MessageSquareText, route: "/icu-nursing/family", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-journey",  label: "Patient Journey", icon: Activity, route: "/icu-nursing/journey", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-transfer", label: "Transfer & Discharge", icon: DoorOpen, route: "/icu-nursing/transfer-discharge", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-emergency", label: "Emergency Center", icon: ShieldAlert, route: "/icu-nursing/emergency", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "nurse-active-order",   label: "Active Order", icon: Archive, route: "/nurse/active-order", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "nurse-drug-administration", label: "Drug Administration", icon: Pill, route: "/nurse/drug-administration", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "nurse-completed-order", label: "Completed Orders", icon: ClipboardList, route: "/nurse/completed-order", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "nurse-discontinued-order", label: "Discontinued Orders", icon: Ban, route: "/nurse/discontinued-order", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "nurse-ldt-management", label: "LDT Management", icon: ListPlus, route: "/nurse/ldt-management", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "blood-bank-blood-request", label: "Blood Requests", icon: Droplets, route: "/blood-bank/blood-request", group: "Blood Bank", allowedRoles: ["Blood Bank"], status: "ready" },
  {
    id: "nursing",
    label: "Nurse",
    icon: ClipboardList,
    route: "/nurse",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Nurse", "Management"],
    status: "ready",
  },
  {
    id: "surgery",
    label: "Surgery",
    icon: BriefcaseMedical,
    route: "/surgery",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Nurse", "Receptionist", "Management"],
    status: "ready",
  },
  {
    id: "renal", label: "Renal", icon: Droplets, route: "/renal", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Lab Technician", "Billing Executive", "Management"],
    status: "ready",
  },
  {
    id: "intake-output", label: "Intake Output", icon: Droplets, route: "/intake-output", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Management"],
    status: "ready",
  },
  {
    id: "poct-add", label: "Add POCT", icon: FlaskConical, route: "/poct/add", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Lab Technician", "Management"],
    status: "ready",
  },
  {
    id: "poct-results", label: "View POCT Result", icon: Microscope, route: "/poct/results", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Lab Technician", "Management"],
    status: "ready",
  },
  {
    id: "ipd", label: "Monitoring", icon: BedDouble, route: "/ipd", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Billing Executive", "Pharmacist", "Management"],
    status: "ready",
  },
  {
    id: "discharge", label: "Discharge", icon: FileText, route: "/discharge", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Billing Executive", "Pharmacist", "Management"],
    status: "ready",
  },
  { id: "emergency",           label: "Emergency",      icon: Ambulance,     route: "/emergency",    group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Billing Executive", "Management"], status: "ready" },
  { id: "doctor-management",   label: "Doctor Management", icon: UserRound,  route: "/admin/doctors", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Management"], status: "ready" },
  { id: "department-management", label: "Department Management", icon: Building2, route: "/admin/departments", group: "Master Setup", allowedRoles: ["Super Admin", "Hospital Admin", "Management", "HR Manager"], status: "ready" },
];

export const dashboardQuickActions = [
  { id: "register",  label: "Register patient", icon: IdCard,          route: "/patients/register" },
  { id: "consult",   label: "Start OPD",        icon: Stethoscope,     route: "/opd" },
  { id: "admit",     label: "Admit patient",    icon: BedDouble,       route: "/ipd" },
  { id: "sample",    label: "Lab worklist",     icon: Microscope,      route: "/laboratory" },
  { id: "bill",      label: "Create bill",      icon: CreditCard,      route: "/billing" },
  { id: "incident",  label: "Security alert",   icon: LockKeyhole,     route: "/security-compliance" },
  { id: "monitor",   label: "Remote monitor",   icon: Activity,        route: "/remote-monitoring" },
  { id: "inventory", label: "Stock review",     icon: BriefcaseMedical,route: "/inventory" },
];
