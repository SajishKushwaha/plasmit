/**
 * Permission Utilities
 * Helper functions for checking permissions and authorization
 */

import { useRole } from "@/components/providers/role-provider";
import {
  doctorAllowedModules,
  doctorBlockedModules,
  doctorIpdAllowedModules,
  doctorOpdAllowedModules,
  getDefaultRouteForRole,
  hasPermission,
  isAdminOnlyRoute,
  isRouteAccessibleByRole,
} from "@/config/roles";
import type { Role } from "@/types";

/**
 * Check if a specific route is accessible by the current role
 */
export function useCanAccessRoute(pathname: string): boolean {
  const { role } = useRole();
  return isRouteAccessibleByRole(role, pathname);
}

/**
 * Check if the current user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
  const { role } = useRole();
  return hasPermission(role, permission);
}

/**
 * Get the dashboard route for the current role
 */
export function useDefaultRoute(): string {
  const { role } = useRole();
  return getDefaultRouteForRole(role);
}

/**
 * Check if user is doctor role
 */
export function useIsDoctor(): boolean {
  const { role } = useRole();
  return role === "Doctor" || role === "Doctor OPD" || role === "Doctor IPD";
}

/**
 * Check if user is admin role
 */
export function useIsAdmin(): boolean {
  const { role } = useRole();
  return role === "Super Admin" || role === "Hospital Admin" || role === "Management";
}

/**
 * Check if a module/route is doctor-specific
 */
export function isDoctorModule(pathname: string): boolean {
  return doctorAllowedModules.some(module => pathname.startsWith(module));
}

/**
 * Check if a module/route is admin-only
 */
export function isAdminModule(pathname: string): boolean {
  return doctorBlockedModules.some(module => pathname.startsWith(module as string));
}

/**
 * Validate role change against current role
 */
export function canSwitchToRole(fromRole: Role, toRole: Role): boolean {
  // Allow admins to switch to any role
  if (fromRole === "Super Admin" || fromRole === "Hospital Admin") {
    return true;
  }
  
  // Regular users can only switch through role switcher (handled by UI)
  return false;
}

/**
 * Get list of accessible modules for a role
 */
export function getAccessibleModules(role: Role): string[] {
  if (role === "Doctor OPD") return doctorOpdAllowedModules;
  if (role === "Doctor IPD") return doctorIpdAllowedModules;
  return role === "Doctor" ? doctorAllowedModules : [];
}

/**
 * Get list of blocked modules for a role
 */
export function getBlockedModules(role: Role): string[] {
  return role === "Doctor" || role === "Doctor OPD" || role === "Doctor IPD" ? [...doctorBlockedModules] : [];
}

/**
 * Format route for display (convert /doctor-dashboard to "Doctor Dashboard")
 */
export function formatRouteName(route: string): string {
  return route
    .split("/")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "))
    .join(" > ");
}
