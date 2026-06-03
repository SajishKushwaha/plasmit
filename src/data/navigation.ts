import {
  Activity,
  Ambulance,
  Archive,
  BarChart3,
  BedDouble,
  Bell,
  Bot,
  Brain,
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
  {
    id: "renal", label: "Renal", icon: Droplets, route: "/renal", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Lab Technician", "Billing Executive", "Management"],
    status: "ready",
  },
  {
    id: "neuro-icu", label: "Neuro ICU", icon: Brain, route: "/neuro-icu", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Management"],
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
