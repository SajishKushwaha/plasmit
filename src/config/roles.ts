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
  Nurse: "/icu-nursing",
  "Blood Bank": "/blood-bank/blood-request",
  Receptionist: "/dashboard",
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
  "/doctor",
  "/appointments",
  "/opd",
  "/clinical-examination",
  "/rapid-review",
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
      "CLINICAL_NOTES",
      "PRESCRIPTIONS",
      "TELEMEDICINE",
      "EMERGENCY_ALERTS",
    ],
  },
  Nurse: {
    allowed: ["/icu-nursing", "/dashboard", "/admission", "/ipd", "/intake-output", "/nurse", "/poct", "/opd", "/emergency", "/surgery"],
  },
  "Blood Bank": {
    allowed: ["/blood-bank"],
  },
  Receptionist: {
    allowed: ["/dashboard", "/appointments", "/front-office", "/billing-desk", "/surgery"],
  },
  "Lab Technician": {
    allowed: ["/dashboard", "/laboratory", "/poct"],
  },
  Radiologist: {
    allowed: ["/dashboard", "/radiology"],
  },
  Pharmacist: {
    allowed: ["/dashboard", "/pharmacy"],
  },
  "Billing Executive": {
    allowed: ["/dashboard", "/billing", "/billing-desk", "/insurance"],
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
  if (role === "Doctor") {
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
  if (role === "Doctor") {
    return doctorPermissions;
  }
  
  if (role === "Super Admin" || role === "Hospital Admin" || role === "Management") {
    return [...doctorPermissions, ...adminPermissions]; // All permissions
  }
  
  return [];
}
