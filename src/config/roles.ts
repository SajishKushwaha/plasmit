/**
 * Role-Based Access Control Configuration
 * Defines roles, permissions, routes, and allowed modules for each role
 */

import type { Role } from "@/types";

/**
 * Role Routes: Maps roles to their default dashboard/landing route
 */
export const roleRoutes: Record<Role, string> = {
  "Super Admin": "/dashboard",
  "Hospital Admin": "/dashboard",
  Doctor: "/doctor-dashboard",
  "Doctor ICU": "/icu-command-center",
  "Doctor OPD": "/doctor-dashboard",
  "Doctor IPD": "/doctor-ipd",
  Nurse: "/icu-nursing",
  "Unit Nurse": "/icu-command-center/nursing/assigned-patients",
  "Head Nurse": "/nursing-icu/head-nurse?view=icu",
  "Ward Nurse": "/icu-command-center/clinical-workspace/patient-overview",
  ICU: "/icu-command-center/patients/search",
  "Nurse ICU": "/nursing-icu",
  "Nurse ICU 2": "/icu-command-center",
  "ICU Bed Coordinator": "/icu-command-center",
  "Diagnostics Team": "/icu-command-center",
  "Tele ICU Doctor": "/icu-command-center",
  "Biomedical Engineer": "/icu-command-center",
  "ICU Pharmacist": "/icu-command-center",
  "Quality Audit": "/icu-command-center",
  "Blood Bank": "/blood-bank/blood-request",
  "ER Nurse": "/receptionist/emergency-reception",
  Receptionlist: "/receptionist/patient-details",
  "Lab Technician": "/dashboard",
  Radiologist: "/dashboard",
  Pharmacist: "/dashboard",
  "Billing Executive": "/dashboard",
  "HR Manager": "/dashboard",
  Management: "/dashboard",
};

/**
 * Doctor-Specific Permissions
 * Defines what doctors are allowed to do in the system
 */
export const doctorPermissions = [
  // Dashboard & Profile
  "VIEW_DOCTOR_DASHBOARD",
  "VIEW_DOCTOR_PROFILE",
  "UPDATE_DOCTOR_AVAILABILITY",
  "VIEW_AVAILABILITY_STATUS",

  // Appointments & Scheduling
  "VIEW_APPOINTMENTS",
  "MANAGE_APPOINTMENTS",
  "VIEW_OPD_QUEUE",
  "START_CONSULTATION",

  // Patient Management
  "VIEW_PATIENT_RECORDS",
  "VIEW_PATIENT_HISTORY",
  "WRITE_PRESCRIPTION",
  "VIEW_DOCTOR_ORDERS",
  "MANAGE_DOCTOR_ORDERS",
  "REQUEST_LAB_TEST",
  "CLINICAL_NOTES",

  // Clinical Features
  "USE_TELEMEDICINE",
  "VIEW_EMERGENCY_ALERTS",
  "VIEW_LAB_REPORTS",
  "MANAGE_FOLLOW_UPS",

  // Read-Only Access
  "VIEW_BILLING_OVERVIEW",
  "VIEW_INSURANCE_INFO",
];

/**
 * Admin-Only Permissions
 * Defines what admins can do that doctors CANNOT
 */
export const adminPermissions = [
  "MANAGE_USERS",
  "MANAGE_DOCTORS",
  "MANAGE_ROLES",
  "MANAGE_PERMISSIONS",
  "VIEW_ANALYTICS",
  "MANAGE_BILLING",
  "MANAGE_REVENUE",
  "MANAGE_INVENTORY",
  "MANAGE_STAFF",
  "MANAGE_BRANCHES",
  "MANAGE_FINANCE",
  "MANAGE_COMPLIANCE",
  "ADMIN_SETTINGS",
  "SYSTEM_LOGS",
  "SECURITY_SETTINGS",
];

/**
 * Doctor Allowed Modules
 * Modules and routes that doctors can access
 */
export const doctorAllowedModules = [
  "/doctor-dashboard",
  "/doctor-ipd",
  "/doctor",
  "/admission",
  "/appointments",
  "/opd",
  "/patients",
  "/clinical-examination",
  "/rapid-review",
  "/results",
  "/renal",
  "/intake-output",
  "/ipd",
  "/laboratory",
  "/radiology",
  "/emergency",
  "/poct",
];

export const doctorOpdAllowedModules = [
  "/doctor-dashboard",
  "/doctor/orders",
  "/doctor",
  "/appointments",
  "/opd",
  "/patients",
  "/clinical-examination",
  "/rapid-review",
  "/results",
  "/laboratory",
  "/radiology",
  "/emergency",
  "/poct",
];

export const doctorIpdAllowedModules = [
  "/doctor-ipd",
  "/doctor/orders",
  "/doctor",
  "/admission",
  "/patients",
  "/clinical-examination",
  "/rapid-review",
  "/results",
  "/renal",
  "/intake-output",
  "/ipd",
  "/laboratory",
  "/radiology",
  "/emergency",
  "/poct",
];

/**
 * Doctor Blocked Modules
 * Modules and routes that doctors CANNOT access
 */
export const doctorBlockedModules = [
  "/admin",
  "/admin-dashboard",
  "/billing-desk",
  "/finance",
  "/billing",
  "/inventory",
  "/compliance",
  "/settings",
  "/insurance",
  "/live-monitoring"
] as const;

/**
 * Role-Based Module Access
 */
export const roleModuleAccess: Record<Role, {
  allowed: string[];
  blocked?: string[];
  features?: string[];
}> = {
  "Super Admin": {
    allowed: ["*"], // Access to all modules
  },
  "Hospital Admin": {
    allowed: ["*"],
  },
  Doctor: {
    allowed: doctorAllowedModules,
    blocked: [...doctorBlockedModules],
    features: [
      "VIEW_DOCTOR_DASHBOARD",
      "MANAGE_APPOINTMENTS",
      "MANAGE_DOCTOR_ORDERS",
      "CLINICAL_NOTES",
      "PRESCRIPTIONS",
      "TELEMEDICINE",
      "EMERGENCY_ALERTS",
    ],
  },
  "Doctor ICU": {
    allowed: ["/icu-command-center", "/nursing-icu", "/doctor-ipd", "/patients", "/results", "/radiology", "/laboratory"],
    blocked: [...doctorBlockedModules],
    features: [
      "VIEW_DOCTOR_DASHBOARD",
      "MANAGE_DOCTOR_ORDERS",
      "CLINICAL_NOTES",
      "EMERGENCY_ALERTS",
      "ICU_COMMAND_CENTER",
    ],
  },
  "Doctor OPD": {
    allowed: doctorOpdAllowedModules,
    blocked: [...doctorBlockedModules],
    features: [
      "VIEW_DOCTOR_DASHBOARD",
      "MANAGE_APPOINTMENTS",
      "MANAGE_DOCTOR_ORDERS",
      "CLINICAL_NOTES",
      "PRESCRIPTIONS",
      "TELEMEDICINE",
      "EMERGENCY_ALERTS",
    ],
  },
  "Doctor IPD": {
    allowed: doctorIpdAllowedModules,
    blocked: [...doctorBlockedModules],
    features: [
      "VIEW_DOCTOR_DASHBOARD",
      "MANAGE_DOCTOR_ORDERS",
      "CLINICAL_NOTES",
      "PRESCRIPTIONS",
      "EMERGENCY_ALERTS",
    ],
  },
  Nurse: {
    allowed: ["/icu-nursing", "/dashboard", "/admission", "/ipd", "/intake-output", "/nurse", "/poct", "/opd", "/emergency", "/radiology", "/results", "/surgery"],
  },
  "Unit Nurse": {
    allowed: [
      "/unit-nurse",
      "/icu-command-center/nursing/assigned-patients",
      "/icu-command-center/patients",
    ],
  },
  "Head Nurse": {
    allowed: [
      "/head-nurse",
      "/head-nurse/new-admissions",
      "/head-nurse/unit-availability",
      "/head-nurse/staff-availability",
      "/head-nurse/patient-assignment",
      "/head-nurse/alerts-delays",
      "/head-nurse/escalations",
      "/head-nurse/shift-handover",
      "/head-nurse/admission-queue",
      "/head-nurse/admission-review",
      "/head-nurse/unit-assignment",
      "/head-nurse/audit-control",
      "/head-nurse/escalation",
      "/head-nurse/handover-verification",
      "/unit-nurse",
      "/nursing-icu/head-nurse",
      "/nursing-icu/arrival-bed-allocation",
      "/nursing-icu/head-nurse-console",
      "/nursing-icu/nurse-review",
      "/nursing-icu/ward-nurse-activities",
      "/nursing-icu/notifications-tasks",
      "/nursing-icu/shift-handover",
      "/nursing-icu/tasks",
      "/nursing-icu/alerts",
      "/nursing-icu/escalation-center",
      "/nursing-icu/orders-care-plans",
      "/nursing-icu/nursing-notes",
      "/icu-command-center/nursing/station",
      "/icu-command-center/nursing/nurse-review",
      "/icu-command-center/nursing/shift-handover",
      "/icu-command-center/nursing/tasks-assessments",
      "/icu-command-center/critical-care/escalation-center",
    ],
  },
  "Ward Nurse": {
    allowed: [
      "/icu-command-center/clinical-workspace/patient-overview",
      "/icu-command-center/nursing/nurse-entry",
      "/icu-command-center/nursing/intake-output",
      "/icu-command-center/nursing/medicine-receive-verify",
      "/icu-command-center/nursing/order",
      "/icu-command-center/nursing/medication-administration",
      "/icu-command-center/nursing/early-warning-score",
      "/icu-command-center/nursing/patient-event-update",
      "/icu-command-center/nursing/shift-handover",
      "/icu-command-center/nursing/shift-pending-summary",
      "/icu-command-center/nursing/raise-issue",
      "/icu-command-center/nursing/tasks-assessments",
      "/icu-command-center/nursing/nursing-notes",
      "/icu-command-center/patients",
      "/ward-nurse",
    ],
  },
  ICU: {
    allowed: [
      // "/patient-details",
      "/icu-command-center/patients/search",
      "/icu-command-center/patients/admissions",
      "/icu-command-center/patients/discharges",
    ],
  },
  "Nurse ICU": {
    allowed: ["/nursing-icu"],
  },
  "Nurse ICU 2": {
    allowed: ["/icu-command-center", "/nursing-icu", "/worklist", "/nurse", "/radiology", "/results", "/surgery"],
  },
  "ICU Bed Coordinator": {
    allowed: ["/icu-command-center", "/nursing-icu"],
    features: ["ICU_COMMAND_CENTER"],
  },
  "Diagnostics Team": {
    allowed: ["/icu-command-center", "/nursing-icu", "/results", "/laboratory", "/radiology"],
    features: ["DIAGNOSTICS"],
  },
  "Tele ICU Doctor": {
    allowed: ["/icu-command-center", "/nursing-icu", "/patients", "/results"],
    features: ["TELE_ICU", "ICU_COMMAND_CENTER"],
  },
  "Biomedical Engineer": {
    allowed: ["/icu-command-center", "/nursing-icu"],
    features: ["DEVICE_OPERATIONS"],
  },
  "ICU Pharmacist": {
    allowed: ["/icu-command-center", "/nursing-icu", "/pharmacy"],
    features: ["PHARMACY"],
  },
  "Quality Audit": {
    allowed: ["/icu-command-center", "/nursing-icu", "/reports"],
    features: ["QUALITY_AUDIT"],
  },
  "Blood Bank": {
    allowed: ["/blood-bank"],
  },
  "ER Nurse": {
    allowed: ["/receptionist", "/patients"],
  },
  Receptionlist: {
    allowed: ["/receptionist/patient-details", "/patients"],
  },
  "Lab Technician": {
    allowed: ["/dashboard", "/laboratory", "/poct", "/results"],
  },
  Radiologist: {
    allowed: ["/dashboard", "/radiology", "/results"],
  },
  Pharmacist: {
    allowed: ["/dashboard", "/pharmacy"],
  },
  "Billing Executive": {
    allowed: ["/dashboard", "/billing", "/billing-desk", "/insurance", "/radiology"],
  },
  "HR Manager": {
    allowed: ["/dashboard", "/hrms"],
  },
  Management: {
    allowed: ["*"],
  },
};

/**
 * Check if a route is admin-only
 */
export function isAdminOnlyRoute(pathname: string): boolean {
  return doctorBlockedModules.some((route) => pathname.startsWith(route as string));
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutesForRole(role: Role): string[] {
  const moduleAccess = roleModuleAccess[role];
  
  if (moduleAccess.allowed.includes("*")) {
    return ["*"]; // Super Admin, Hospital Admin, Management
  }
  
  return moduleAccess.allowed || [];
}

/**
 * Check if a route is accessible by a role
 */
export function isRouteAccessibleByRole(role: Role, route: string): boolean {
  const moduleAccess = roleModuleAccess[role];
  
  // Super Admin/Admin/Management can access everything
  if (moduleAccess.allowed.includes("*")) {
    return true;
  }
  
  // Check if blocked for this role
  if (moduleAccess.blocked?.some(blocked => route.startsWith(blocked))) {
    return false;
  }
  
  // Check if explicitly allowed
  return moduleAccess.allowed.some(allowed => route.startsWith(allowed));
}

/**
 * Get redirect route when access is denied
 */
export function getDefaultRouteForRole(role: Role): string {
  return roleRoutes[role];
}

/**
 * Check if user has specific permission
 */
export function hasPermission(role: Role, permission: string): boolean {
  if (role === "Doctor" || role === "Doctor OPD" || role === "Doctor IPD") {
    return doctorPermissions.includes(permission);
  }
  
  if (role === "Super Admin" || role === "Hospital Admin" || role === "Management") {
    return true; // Admins have all permissions
  }
  
  return false;
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): string[] {
  if (role === "Doctor" || role === "Doctor OPD" || role === "Doctor IPD") {
    return doctorPermissions;
  }
  
  if (role === "Super Admin" || role === "Hospital Admin" || role === "Management") {
    return [...doctorPermissions, ...adminPermissions]; // All permissions
  }
  
  return [];
}
