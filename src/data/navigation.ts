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

import { getNursingRoleNavigation } from "@/data/icu-nursing-role-permissions";
import type { NavigationItem, Role } from "@/types";

const wardNurseDefaultRoute = "/icu-command-center/clinical-workspace/patient-overview";

export const icuCommandSwitcherRoles: Role[] = [
  "Hospital Admin",
  "ICU",
  "Nurse ICU 2",
  "Unit Nurse",
  "Head Nurse",
  "Ward Nurse",
];

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
    allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Lab Technician", "Radiologist", "Pharmacist", "Billing Executive", "HR Manager", "Management"],
    status: "ready",
  },

  // =====================================================
  // DOCTOR: MAIN
  // =====================================================
  { id: "doctor-dashboard",    label: "Dashboard",            icon: LayoutDashboard,   route: "/doctor-dashboard",     group: "Main",     allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-ipd-dashboard", label: "Dashboard",            icon: Activity,          route: "/doctor-ipd",    group: "Main",     allowedRoles: ["Doctor", "Doctor IPD"], status: "ready" },
  {
    id: "receptionist-dashboard",
    label: "Receptionist",
    icon: IdCard,
    route: "/receptionist",
    group: "Main",
    allowedRoles: ["Receptionist"],
    status: "ready",
    children: [
      { id: "receptionist-home", label: "Dashboard", route: "/receptionist", status: "ready" },
      { id: "receptionist-billing", label: "Billing Dashboard", route: "/receptionist/billing", status: "ready" },
      { id: "receptionist-register", label: "Patient Registration", route: "/patients/register", status: "ready" },
      { id: "receptionist-appointments", label: "Appointments", route: "/appointments", status: "ready" },
      { id: "receptionist-admission", label: "Admission Reception", route: "/admission/reception", status: "ready" },
    ],
  },
  {
    id: "unit-nurse-dashboard",
    label: "Unit Nurse",
    icon: ClipboardList,
    route: "/icu-command-center/nursing/assigned-patients",
    group: "Main",
    allowedRoles: ["Unit Nurse"],
    status: "ready",
    children: [
      { id: "unit-nurse-assigned", label: "Assigned Patients", route: "/icu-command-center/nursing/assigned-patients", status: "ready" },
    ],
  },
  {
    id: "head-nurse-dashboard",
    label: "Head Nurse",
    icon: UserCog,
    route: "/head-nurse",
    group: "Main",
    allowedRoles: ["Head Nurse"],
    status: "ready",
    children: [
      { id: "head-nurse-dashboard", label: "Dashboard", route: "/head-nurse", status: "ready" },
      { id: "head-nurse-admissions", label: "New Admission Queue", route: "/head-nurse/admission-queue", status: "ready" },
      { id: "head-nurse-review", label: "Review New Admission", route: "/head-nurse/admission-review", status: "ready" },
      { id: "head-nurse-assignment", label: "Assign Patient to Unit Nurse", route: "/head-nurse/unit-assignment", status: "ready" },
      { id: "head-nurse-audit", label: "Audit and Control", route: "/head-nurse/audit-control", status: "ready" },
      { id: "head-nurse-handover", label: "Verify Handover", route: "/head-nurse/handover-verification", status: "ready" },
    ],
  },
  {
    id: "ward-nurse-dashboard",
    label: "Ward Nurse",
    icon: BedDouble,
    route: wardNurseDefaultRoute,
    group: "Main",
    allowedRoles: ["Ward Nurse"],
    status: "ready",
    children: getNursingRoleNavigation("Ward Nurse"),
  },
  // =====================================================
  // DOCTOR: CLINICAL
  // =====================================================
  { id: "doctor-appointments", label: "Appointments",         icon: CalendarClock,     route: "/appointments",         group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-opd-queue",    label: "OPD Queue",            icon: Stethoscope,       route: "/opd",                  group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-orders",       label: "Orders",               icon: ScanSearch,        route: "/doctor/orders",        group: "Doctor",   allowedRoles: ["Doctor", "Doctor OPD", "Doctor IPD"], status: "ready" },
  { id: "doctor-prescription", label: "Prescription",         icon: Pill,              route: "/doctor/prescription",  group: "Doctor",   allowedRoles: ["Doctor", "Doctor OPD", "Doctor IPD"], status: "ready" },
  { id: "doctor-consult",      label: "Consultations",        icon: UserRound,         route: "/rapid-review",         group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-patients",     label: "Patient Records",      icon: IdCard,            route: "/patients",             group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-rx",           label: "Prescriptions",        icon: Pill,              route: "/prescriptions",        group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  // { id: "doctor-live-monitoring", label: "Live Monitoring",   icon: RadioTower,        route: "/live-monitoring",       group: "Clinical", allowedRoles: ["Doctor IPD"], status: "ready" },
  { id: "doctor-ipd-results",  label: "Result",               icon: FileText,          route: "/results",              group: "Clinical", allowedRoles: [], status: "ready" },
  { id: "doctor-lab",          label: "Laboratory",           icon: FlaskConical,      route: "/laboratory",           group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD", "Doctor IPD"], status: "ready" },
  { id: "doctor-radiology",    label: "Radiology",            icon: ScanSearch,        route: "/radiology",            group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD", "Doctor IPD"], status: "ready" },
  { id: "doctor-emergency",    label: "Emergency Alerts",     icon: ShieldAlert,       route: "/emergency",            group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-tele",         label: "Telemedicine",         icon: Video,             route: "/telemedicine",         group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-followups",    label: "Follow-ups",           icon: CalendarCheck,     route: "/follow-ups",           group: "Clinical", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  {
    id: "results",
    label: "Result",
    icon: CheckCircle2,
    route: "/results",
    group: "Diagnostics",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Doctor OPD", "Doctor IPD", "Nurse", "Nurse ICU 2", "Receptionist", "Lab Technician", "Radiologist", "Management"],
    status: "ready",
    children: [
      { id: "results-center", label: "Results Center", route: "/results", status: "ready" },
      { id: "results-laboratory", label: "Laboratory Results", route: "/results/laboratory", status: "ready" },
      { id: "results-radiology", label: "Radiology Results", route: "/results/radiology", status: "ready" },
      { id: "results-poct", label: "POCT Results", route: "/results/poct", status: "ready" },
      { id: "results-critical", label: "Critical Results", route: "/results/critical", status: "ready" },
    ],
  },
  {
    id: "radiology-mnt",
    label: "Radiology",
    icon: ScanSearch,
    route: "/radiology/dashboard",
    group: "Radiology",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Doctor OPD", "Doctor IPD", "Nurse", "Nurse ICU 2", "Receptionist", "Radiologist", "Billing Executive", "Management"],
    status: "ready",
    children: [
      { id: "radiology-mnt-dashboard", label: "Dashboard", route: "/radiology/dashboard", status: "ready" },
      { id: "radiology-mnt-orders", label: "Orders", route: "/radiology/order-list", status: "ready" },
      { id: "radiology-mnt-front-office", label: "Front Office", route: "/radiology/front-office", status: "ready" },
      { id: "radiology-mnt-scan-room", label: "Scan Room", route: "/radiology/scan-room", status: "ready" },
      { id: "radiology-mnt-pacs", label: "PACS", route: "/radiology/pacs-studies", status: "ready" },
      { id: "radiology-mnt-reporting", label: "Reporting", route: "/radiology/reporting", status: "ready" },
      { id: "radiology-mnt-delivery", label: "Delivery & Alerts", route: "/radiology/delivery-alerts", status: "ready" },
      { id: "radiology-mnt-admin", label: "Admin & MIS", route: "/radiology/admin-mis", status: "ready" },
    ],
  },

  // =====================================================
  // DOCTOR: SCHEDULE
  // =====================================================
  { id: "doctor-availability", label: "Availability Mgmt",   icon: CalendarRange,     route: "/doctor-availability", group: "Schedule", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-calendar",     label: "Calendar & Schedule",  icon: Calendar,          route: "/appointments",         group: "Schedule", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },

  // =====================================================
  // DOCTOR: PLATFORM
  // =====================================================
  { id: "doctor-messages",     label: "Messages",             icon: MessageSquareText, route: "/messages",             group: "Platform", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },
  { id: "doctor-settings",     label: "Settings",             icon: Settings,          route: "/settings",             group: "Platform", allowedRoles: ["Doctor", "Doctor OPD"], status: "ready" },

  // =====================================================
  // ADMIN / MANAGEMENT: Clinical Operations
  // =====================================================
  { id: "billing-desk",        label: "Billing Desk",   icon: CreditCard,    route: "/billing-desk", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Receptionist", "Billing Executive", "Management"], status: "ready" },
  { id: "appointments",        label: "Appointment",    icon: CalendarClock, route: "/appointments", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Receptionist", "Nurse", "Billing Executive", "Management"], status: "ready" },
  {
    id: "admission", label: "Admission", icon: DoorOpen, route: "/admission", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Management"],
    status: "ready",
  },
  { id: "opd",                 label: "OPD",            icon: Stethoscope,   route: "/opd",          group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Nurse", "Receptionist", "Pharmacist", "Lab Technician", "Management"], status: "ready" },
  {
    id: "clinical-examination",
    label: "Clinical Exam",
    icon: ClipboardList,
    route: "/clinical-examination",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Doctor OPD", "Nurse", "Management"],
    status: "ready",
    children: [
      { id: "clinical-examination-overview", label: "Clinical Exam", route: "/clinical-examination", status: "ready" },
      { id: "clinical-examination-renal", label: "Renal", route: "/renal", status: "ready" },
    ],
  },
  { id: "rapid-review",        label: "Rapid Review",   icon: Activity,      route: "/rapid-review", group: "Clinical", allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Doctor OPD", "Doctor IPD", "Nurse", "Management"], status: "ready" },
  { id: "hospital-admin-ldt",   label: "LDT",            icon: FlaskConical,  route: "/hospital-admin/ldt", group: "Hospital Admin", allowedRoles: ["Hospital Admin"], status: "ready" },
  {
    id: "hospital-admin-patient-module",
    label: "Patient Module",
    icon: Users,
    route: "/patient-list",
    group: "Hospital Admin",
    allowedRoles: ["Hospital Admin"],
    status: "ready",
    children: [
      { id: "hospital-admin-patient-list", label: "Patient Details List", route: "/patient-list", status: "ready" },
      { id: "hospital-admin-patient-details", label: "Add Patient Details", route: "/patient-details", status: "ready" },
      { id: "hospital-admin-patient-history-list", label: "Patient History List", route: "/patient-history-list", status: "ready" },
      { id: "hospital-admin-patient-history", label: "Add Patient History", route: "/patient-history", status: "ready" },
    ],
  },
  { id: "hospital-admin-notes", label: "Notes", icon: FileText, route: "/notes", group: "Hospital Admin", allowedRoles: ["Hospital Admin"], status: "ready" },
  { id: "icu-nursing-station",  label: "Nurse Station",  icon: BedDouble,     route: "/icu-nursing", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-patients", label: "Assigned Patients", icon: Users,     route: "/icu-nursing/patients", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-medications", label: "Medication Administration", icon: Syringe, route: "/icu-nursing/medications", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-tasks",    label: "Clinical Tasks", icon: ClipboardList, route: "/icu-nursing/tasks", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-handover", label: "Shift Handover", icon: Workflow, route: "/icu-nursing/handover", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-family",   label: "Family Communication", icon: MessageSquareText, route: "/icu-nursing/family", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-journey",  label: "Patient Journey", icon: Activity, route: "/icu-nursing/journey", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-transfer", label: "Transfer & Discharge", icon: DoorOpen, route: "/icu-nursing/transfer-discharge", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  { id: "icu-nursing-emergency", label: "Emergency Center", icon: ShieldAlert, route: "/icu-nursing/emergency", group: "Clinical", allowedRoles: ["Nurse"], status: "ready" },
  {
    id: "icu-command-center",
    label: "ICU Command Center",
    icon: HeartPulse,
    route: "/icu-command-center",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "ICU", "Nurse ICU", "Nurse ICU 2", "Lab Technician", "Radiologist", "Pharmacist", "Billing Executive", "Management"],
    status: "ready",
    children: [
      {
        id: "icu-command-group-command",
        label: "Command",
        route: "/icu-command-center",
        status: "ready",
        children: [
          { id: "icu-command-home", label: "Command Center", route: "/icu-command-center", status: "ready" },
          { id: "icu-command-executive", label: "Executive Dashboard", route: "/icu-command-center/executive-dashboard", status: "ready" },
          { id: "icu-command-notifications", label: "Notifications & Tasks", route: "/icu-command-center/notifications-tasks", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-patients",
        label: "Patients",
        route: "/icu-command-center/patients/search",
        status: "ready",
        children: [
          { id: "icu-command-patient-search", label: "Patient Search", route: "/icu-command-center/patients/search", status: "ready" },
          { id: "icu-command-smart-bed", label: "Smart Bed View", route: "/icu-command-center/patients/smart-bed-view", status: "ready" },
          { id: "icu-command-admissions", label: "Admissions", route: "/icu-command-center/patients/admissions", status: "ready" },
          { id: "icu-command-discharges", label: "Discharges", route: "/icu-command-center/patients/discharges", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-critical-care",
        label: "Critical Care",
        route: "/icu-command-center/critical-care/operations",
        status: "ready",
        children: [
          { id: "icu-command-operations", label: "ICU Operations", route: "/icu-command-center/critical-care/operations", status: "ready" },
          { id: "icu-command-device-monitoring", label: "Device Monitoring", route: "/icu-command-center/critical-care/device-monitoring", status: "ready" },
          { id: "icu-command-alerts", label: "Clinical Alerts", route: "/icu-command-center/critical-care/clinical-alerts", status: "ready" },
          { id: "icu-command-rounds", label: "ICU Rounds", route: "/icu-command-center/critical-care/rounds", status: "ready" },
          { id: "icu-command-escalation", label: "Escalation Center", route: "/icu-command-center/critical-care/escalation-center", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-clinical-workspace",
        label: "Clinical Workspace",
        route: "/icu-command-center/clinical-workspace/patient-overview",
        status: "ready",
        children: [
          { id: "icu-command-patient-overview", label: "Patient Overview", route: "/icu-command-center/clinical-workspace/patient-overview", status: "ready" },
          { id: "icu-command-progress-notes", label: "Progress Notes", route: "/icu-command-center/clinical-workspace/progress-notes", status: "ready" },
          { id: "icu-command-orders-care", label: "Orders & Care Plans", route: "/icu-command-center/clinical-workspace/orders-care-plans", status: "ready" },
          { id: "icu-command-family-communication", label: "Family Communication", route: "/icu-command-center/clinical-workspace/family-communication", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-nursing",
        label: "Nursing",
        route: "/icu-command-center/nursing/station",
        status: "ready",
        children: [
          { id: "icu-command-nursing-station", label: "Nursing Station", route: "/icu-command-center/nursing/station", status: "ready" },
          { id: "icu-command-nurse-entry", label: "Nurse Entry", route: "/icu-command-center/nursing/nurse-entry", status: "ready" },
          { id: "icu-command-nurse-review", label: "Nurse Review", route: "/icu-command-center/nursing/nurse-review", status: "ready" },
          { id: "icu-command-medication", label: "Medication Administration", route: "/icu-command-center/nursing/medication-administration", status: "ready" },
          { id: "icu-command-patient-medication-chart", label: "Patient Medication Chart", route: "/icu-command-center/nursing/patient-medication", status: "ready" },
          { id: "icu-command-nursing-ews", label: "Early Warning Score", route: "/icu-command-center/nursing/early-warning-score", status: "ready" },
          { id: "icu-command-handover", label: "Shift Handover", route: "/icu-command-center/nursing/shift-handover", status: "ready" },
          { id: "icu-command-tasks", label: "Tasks & Assessments", route: "/icu-command-center/nursing/tasks-assessments", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-diagnostics",
        label: "Diagnostics",
        route: "/icu-command-center/diagnostics/hub",
        status: "ready",
        children: [
          { id: "icu-command-diagnostics", label: "Diagnostics Hub", route: "/icu-command-center/diagnostics/hub", status: "ready" },
          { id: "icu-command-investigation-entry", label: "Report Upload & Extract", route: "/icu-command-center/diagnostics/investigation-entry", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-tele-icu",
        label: "Tele ICU",
        route: "/icu-command-center/tele-icu/remote-command-center",
        status: "ready",
        children: [
          { id: "icu-command-remote-center", label: "Remote Command Center", route: "/icu-command-center/tele-icu/remote-command-center", status: "ready" },
          { id: "icu-command-remote-consults", label: "Remote Consultations", route: "/icu-command-center/tele-icu/remote-consultations", status: "ready" },
          { id: "icu-command-escalated-cases", label: "Escalated Cases", route: "/icu-command-center/tele-icu/escalated-cases", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-device-operations",
        label: "Device Operations",
        route: "/icu-command-center/device-operations/edge-device-management",
        status: "ready",
        children: [
          { id: "icu-command-edge-devices", label: "Edge Device Management", route: "/icu-command-center/device-operations/edge-device-management", status: "ready" },
          { id: "icu-command-device-mapping", label: "Device Mapping", route: "/icu-command-center/device-operations/device-mapping", status: "ready" },
          { id: "icu-command-connectivity", label: "Connectivity Dashboard", route: "/icu-command-center/device-operations/connectivity-dashboard", status: "ready" },
          { id: "icu-command-signal-health", label: "Signal Health", route: "/icu-command-center/device-operations/signal-health", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-clinical-intelligence",
        label: "Clinical Intelligence",
        route: "/icu-command-center/clinical-intelligence/patient-risk-center",
        status: "ready",
        children: [
          { id: "icu-command-patient-risk", label: "Patient Risk Center", route: "/icu-command-center/clinical-intelligence/patient-risk-center", status: "ready" },
          { id: "icu-command-ews", label: "Early Warning Scores", route: "/icu-command-center/clinical-intelligence/early-warning-scores", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-analytics",
        label: "Analytics",
        route: "/icu-command-center/analytics/operational",
        status: "ready",
        children: [
          { id: "icu-command-operational-analytics", label: "Operational Analytics", route: "/icu-command-center/analytics/operational", status: "ready" },
          { id: "icu-command-clinical-analytics", label: "Clinical Analytics", route: "/icu-command-center/analytics/clinical", status: "ready" },
          { id: "icu-command-device-analytics", label: "Device Analytics", route: "/icu-command-center/analytics/device", status: "ready" },
          { id: "icu-command-pilot-outcome", label: "Pilot Outcome Dashboard", route: "/icu-command-center/analytics/pilot-outcome", status: "ready" },
          { id: "icu-command-adoption", label: "Adoption Analytics", route: "/icu-command-center/analytics/adoption", status: "ready" },
        ],
      },
      {
        id: "icu-command-group-administration",
        label: "Administration",
        route: "/icu-command-center/administration/users-roles",
        status: "ready",
        children: [
          { id: "icu-command-users-roles", label: "Users & Roles", route: "/icu-command-center/administration/users-roles", status: "ready" },
          { id: "icu-command-configuration", label: "Configuration", route: "/icu-command-center/administration/configuration", status: "ready" },
          { id: "icu-command-audit", label: "Audit Logs", route: "/icu-command-center/administration/audit-logs", status: "ready" },
        ],
      },
    ],
  },
  {
    id: "nursing-icu",
    label: "Nursing ICU",
    icon: HeartPulse,
    route: "/nursing-icu",
    group: "Clinical",
    allowedRoles: ["Nurse ICU", "Nurse ICU 2"],
    status: "ready",
    children: [
      { id: "nursing-icu-patient-board", label: "ICU Patient Board", route: "/nursing-icu/patient-board", status: "ready" },
      { id: "nursing-icu-arrival", label: "Patient Arrival & Bed Allocation", route: "/nursing-icu/arrival-bed-allocation", status: "ready" },
      { id: "nursing-icu-handover", label: "Shift Handover", route: "/nursing-icu/shift-handover", status: "ready" },
      { id: "nursing-icu-tasks", label: "Nurse Task List", route: "/nursing-icu/tasks", status: "ready" },
      { id: "nursing-icu-monitoring", label: "ICU Monitoring Chart", route: "/nursing-icu/monitoring-chart", status: "ready" },
      { id: "nursing-icu-vitals", label: "Nurse Entry", route: "/nursing-icu/vitals", status: "ready" },
      { id: "nursing-icu-nurse-review", label: "Nurse Review", route: "/nursing-icu/nurse-review", status: "ready" },
      { id: "nursing-icu-intake-output", label: "Intake / Output Chart", route: "/nursing-icu/intake-output", status: "ready" },
      { id: "nursing-icu-medication", label: "Medication Administration", route: "/nursing-icu/medication-administration", status: "ready" },
      { id: "nursing-icu-iv-fluids", label: "IV Fluid & Infusion Management", route: "/nursing-icu/iv-fluids", status: "ready" },
      { id: "nursing-icu-blood", label: "Blood Transfusion", route: "/nursing-icu/blood-transfusion", status: "ready" },
      { id: "nursing-icu-rounds", label: "Doctor Rounds", route: "/nursing-icu/doctor-rounds", status: "ready" },
      { id: "nursing-icu-instructions", label: "Doctor Instructions", route: "/nursing-icu/doctor-instructions", status: "ready" },
      { id: "nursing-icu-lab", label: "Lab Orders & Results", route: "/nursing-icu/lab-results", status: "ready" },
      { id: "nursing-icu-radiology", label: "Radiology Orders & Reports", route: "/nursing-icu/radiology-reports", status: "ready" },
      { id: "nursing-icu-pharmacy", label: "Pharmacy Requests", route: "/nursing-icu/pharmacy-requests", status: "ready" },
      { id: "nursing-icu-head-nurse", label: "Head Nurse Console", route: "/nursing-icu/head-nurse-console", status: "ready" },
      { id: "nursing-icu-ward-nurse", label: "Ward Nurse Shift Activities", route: "/nursing-icu/ward-nurse-activities", status: "ready" },
      { id: "nursing-icu-duty-doctor", label: "Duty Doctor Monitoring", route: "/nursing-icu/duty-doctor-monitoring", status: "ready" },
      { id: "nursing-icu-alerts", label: "ICU Alerts", route: "/nursing-icu/alerts", status: "ready" },
      { id: "nursing-icu-transfer", label: "Transfer / Discharge / Death Workflow", route: "/nursing-icu/transfer-discharge", status: "ready" },
      { id: "nursing-icu-notes", label: "Nursing Notes", route: "/nursing-icu/nursing-notes", status: "ready" },
      { id: "nursing-icu-audit", label: "Audit & Activity Logs", route: "/nursing-icu/audit-logs", status: "ready" },
      { id: "nursing-icu-reports", label: "Reports", route: "/nursing-icu/reports", status: "ready" },
      { id: "nursing-icu-executive", label: "Executive Dashboard", route: "/nursing-icu/executive-dashboard", status: "ready" },
      { id: "nursing-icu-notifications", label: "Notifications & Tasks", route: "/nursing-icu/notifications-tasks", status: "ready" },
      { id: "nursing-icu-patient-search", label: "Patient Search", route: "/nursing-icu/patient-search", status: "ready" },
      { id: "nursing-icu-smart-bed", label: "Smart Bed View", route: "/nursing-icu/smart-bed-view", status: "ready" },
      { id: "nursing-icu-operations", label: "ICU Operations", route: "/nursing-icu/icu-operations", status: "ready" },
      { id: "nursing-icu-escalation", label: "Escalation Center", route: "/nursing-icu/escalation-center", status: "ready" },
      { id: "nursing-icu-overview", label: "Patient Overview", route: "/nursing-icu/patient-overview", status: "ready" },
      { id: "nursing-icu-progress-notes", label: "Progress Notes", route: "/nursing-icu/progress-notes", status: "ready" },
      { id: "nursing-icu-orders-care", label: "Orders & Care Plans", route: "/nursing-icu/orders-care-plans", status: "ready" },
      { id: "nursing-icu-family", label: "Family Communication", route: "/nursing-icu/family-communication", status: "ready" },
      { id: "nursing-icu-diagnostics", label: "Diagnostics Hub", route: "/nursing-icu/diagnostics-hub", status: "ready" },
      { id: "nursing-icu-remote-center", label: "Remote Command Center", route: "/nursing-icu/remote-command-center", status: "ready" },
      { id: "nursing-icu-remote-consults", label: "Remote Consultations", route: "/nursing-icu/remote-consultations", status: "ready" },
      { id: "nursing-icu-escalated-cases", label: "Escalated Cases", route: "/nursing-icu/escalated-cases", status: "ready" },
      { id: "nursing-icu-edge-devices", label: "Edge Device Management", route: "/nursing-icu/edge-device-management", status: "ready" },
      { id: "nursing-icu-device-mapping", label: "Device Mapping", route: "/nursing-icu/device-mapping", status: "ready" },
      { id: "nursing-icu-connectivity", label: "Connectivity Dashboard", route: "/nursing-icu/connectivity-dashboard", status: "ready" },
      { id: "nursing-icu-signal-health", label: "Signal Health", route: "/nursing-icu/signal-health", status: "ready" },
      { id: "nursing-icu-patient-risk", label: "Patient Risk Center", route: "/nursing-icu/patient-risk-center", status: "ready" },
      { id: "nursing-icu-ews", label: "Early Warning Scores", route: "/nursing-icu/early-warning-scores", status: "ready" },
      { id: "nursing-icu-operational-analytics", label: "Operational Analytics", route: "/nursing-icu/operational-analytics", status: "ready" },
      { id: "nursing-icu-clinical-analytics", label: "Clinical Analytics", route: "/nursing-icu/clinical-analytics", status: "ready" },
      { id: "nursing-icu-pilot-outcome", label: "Pilot Outcome Dashboard", route: "/nursing-icu/pilot-outcome", status: "ready" },
      { id: "nursing-icu-adoption", label: "Adoption Analytics", route: "/nursing-icu/adoption-analytics", status: "ready" },
      { id: "nursing-icu-device-analytics", label: "Device Analytics", route: "/nursing-icu/device-analytics", status: "ready" },
      { id: "nursing-icu-users-roles", label: "Users & Roles", route: "/nursing-icu/users-roles", status: "ready" },
      { id: "nursing-icu-configuration", label: "Configuration", route: "/nursing-icu/configuration", status: "ready" },
    ],
  },
  { id: "worklist", label: "Worklist", icon: ClipboardList, route: "/worklist", group: "Nursing", allowedRoles: ["Nurse ICU 2"], status: "ready" },
  { id: "blood-product", label: "Blood/Blood Product", icon: Archive, route: "/nurse/blood-product", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "blood-receipt-verification", label: "Blood Receipt & Verification", icon: CheckCircle2, route: "/nurse/blood-receipt-verification", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "blood-administration", label: "Blood Administration", icon: CheckCircle2, route: "/nurse/blood-administration", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  // { id: "active-order", label: "Active Order", icon: Archive, route: "/nurse/active-order", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "drug-administration", label: "Drug Administration", icon: Pill, route: "/nurse/drug-administration", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  // { id: "completed-order", label: "Completed Orders", icon: ClipboardCheck, route: "/nurse/completed-order", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  // { id: "discontinued-order", label: "Discontinued Orders", icon: Ban, route: "/nurse/discontinued-order", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "ldt-management", label: "LDT Management", icon: ListPlus, route: "/nurse/ldt-management", group: "Nurse", allowedRoles: ["Nurse"], status: "ready" },
  { id: "blood-bank-blood-request", label: "Blood Requests", icon: Droplets, route: "/blood-bank/blood-request", group: "Blood Bank", allowedRoles: ["Blood Bank"], status: "ready" },
  {
    id: "nursing",
    label: "Nurse",
    icon: ClipboardList,
    route: "/nurse",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Nurse", "Nurse ICU 2", "Management"],
    status: "ready",
  },
  {
    id: "surgery",
    label: "Surgery",
    icon: BriefcaseMedical,
    route: "/surgery",
    group: "Clinical",
    allowedRoles: ["Super Admin", "Nurse", "Nurse ICU 2", "Receptionist", "Management"],
    status: "ready",
  },
  {
    id: "renal", label: "Renal", icon: Droplets, route: "/renal", group: "Clinical",
    allowedRoles: ["Lab Technician", "Billing Executive"],
    status: "ready",
  },
  {
    id: "intake-output", label: "Intake Output", icon: Droplets, route: "/intake-output", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Management"],
    status: "ready",
  },
  {
    id: "poct-add", label: "Add POCT", icon: FlaskConical, route: "/doctor-ipd/patients/1?tab=Poct&poct=add", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Doctor OPD", "Nurse", "Lab Technician", "Management"],
    status: "ready",
  },
  {
    id: "poct-results", label: "View POCT Result", icon: Microscope, route: "/doctor-ipd/patients/1?tab=Poct&poct=results", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Doctor OPD", "Nurse", "Lab Technician", "Management"],
    status: "ready",
  },
  {
    id: "ipd", label: "Monitoring", icon: BedDouble, route: "/ipd", group: "Clinical",
    allowedRoles: ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Receptionist", "Billing Executive", "Pharmacist", "Management"],
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

export function getNavigationItemsForRole(role: Role): NavigationItem[] {
  const roleItems = navigationItems.filter((item) => item.allowedRoles.includes(role));

  if (role === "Head Nurse" || role === "Unit Nurse" || role === "Ward Nurse") {
    return (getNursingRoleNavigation(role) ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      icon: HeartPulse,
      route: item.route,
      group: "ICU",
      allowedRoles: [role],
      status: item.status,
      children: item.children,
    }));
  }

  if (role === "Super Admin") {
    return roleItems.filter((item) => ["nursing", "radiology-mnt", "results", "surgery"].includes(item.id));
  }

  if (role === "Nurse") {
    const nurseModules = new Set(["blood-product", "blood-receipt-verification", "blood-administration", "drug-administration", "ldt-management", "radiology-mnt", "results"]);
    return roleItems.filter((item) => item.id.startsWith("icu-nursing-") || nurseModules.has(item.id));
  }

  if (role === "Nurse ICU") {
    return roleItems.filter((item) => item.id === "nursing-icu");
  }

  if (role === "Nurse ICU 2") {
    const nurseIcu2Modules = new Set(["icu-command-center", "nursing-icu", "worklist", "nursing", "radiology-mnt", "results", "surgery"]);
    return roleItems.filter((item) => nurseIcu2Modules.has(item.id));
  }

  if (role === "ICU") {
    return [
      {
        id: "icu-admin-patient-details",
        label: "Patient Details",
        icon: Users,
        route: "/patient-details",
        group: "Patient Management",
        allowedRoles: ["ICU"],
        status: "ready",
      },
      {
        id: "icu-admin-patients",
        label: "Patients",
        icon: UserRound,
        route: "/icu-command-center/patients/search",
        group: "Patient Management",
        allowedRoles: ["ICU"],
        status: "ready",
        children: [
          { id: "icu-admin-patient-search", label: "Patient Search", route: "/icu-command-center/patients/search", status: "ready" },
          { id: "icu-admin-admissions", label: "Admissions", route: "/icu-command-center/patients/admissions", status: "ready" },
          { id: "icu-admin-discharges", label: "Discharges", route: "/icu-command-center/patients/discharges", status: "ready" },
        ],
      },
    ];
  }

  if (role === "Doctor IPD") {
    const visibleItemIds = new Set([
      "doctor-ipd-dashboard",
      "doctor-orders",
      "results",
    ]);
    const groupOrder = new Map([
      ["Main", 0],
      ["Doctor", 1],
      ["Diagnostics", 2],
    ]);
    const itemOrder = new Map([
      ["doctor-ipd-dashboard", 0],
      ["doctor-orders", 0],
      ["results", 0],
    ]);

    return roleItems
      .filter((item) => visibleItemIds.has(item.id))
      .map((item) => item.id === "results" ? { ...item, children: undefined } : item)
      .sort((a, b) => {
        const groupDifference = (groupOrder.get(a.group) ?? 100) - (groupOrder.get(b.group) ?? 100);
        if (groupDifference !== 0) return groupDifference;
        return (itemOrder.get(a.id) ?? 100) - (itemOrder.get(b.id) ?? 100);
      });
  }

  if (role === "Receptionist") {
    const visibleItemIds = new Set([
      "receptionist-dashboard",
      "billing-desk",
      "appointments",
      "admission",
      "opd",
      "results",
    ]);
    const groupOrder = new Map([
      ["Main", 0],
      ["Clinical", 1],
      ["Diagnostics", 2],
    ]);
    const itemOrder = new Map([
      ["receptionist-dashboard", 0],
      ["billing-desk", 0],
      ["appointments", 1],
      ["admission", 2],
      ["opd", 3],
      ["results", 0],
    ]);

    return roleItems
      .filter((item) => visibleItemIds.has(item.id))
      .map((item) => {
        if (item.id !== "results") return item;
        return {
          ...item,
          children: [
            { id: "receptionist-results-center", label: "Results Center", route: "/results", status: "ready" as const },
            { id: "receptionist-lab-results", label: "Laboratory Results", route: "/results/laboratory", status: "ready" as const },
            { id: "receptionist-radiology-results", label: "Radiology Results", route: "/results/radiology", status: "ready" as const },
          ],
        };
      })
      .sort((a, b) => {
        const groupDifference = (groupOrder.get(a.group) ?? 100) - (groupOrder.get(b.group) ?? 100);
        if (groupDifference !== 0) return groupDifference;
        return (itemOrder.get(a.id) ?? 100) - (itemOrder.get(b.id) ?? 100);
      });
  }

  return roleItems;
}
