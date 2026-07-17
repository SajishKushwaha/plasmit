/**
 * Route Guard Component
 * Protects routes based on user role and permissions
 * Redirects unauthorized access to appropriate dashboard
 */

"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRole } from "@/components/providers/role-provider";
import {
  getDefaultRouteForRole,
  isRouteAccessibleByRole,
  doctorBlockedModules,
} from "@/config/roles";
import { getRoleDisplayName } from "@/lib/role-display";

export interface RouteGuardProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  allowedRoles?: string[];
  fallbackRoute?: string;
}

/**
 * Route Guard Component
 * Wraps protected routes and ensures user has access
 *
 * @example
 * <RouteGuard requiredPermissions={["VIEW_DOCTOR_DASHBOARD"]}>
 *   <DoctorDashboard />
 * </RouteGuard>
 */
export function RouteGuard({
  children,
  requiredPermissions = [],
  allowedRoles = [],
  fallbackRoute,
}: RouteGuardProps) {
  const { role } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = React.useState(true);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Check route accessibility
    const canAccess = isRouteAccessibleByRole(role, pathname);

    if (!canAccess) {
      // Redirect to appropriate dashboard
      const defaultRoute = fallbackRoute || getDefaultRouteForRole(role);
      router.replace(defaultRoute);
      setHasAccess(false);
    } else {
      setHasAccess(true);
    }

    setIsChecking(false);
  }, [role, pathname, router, fallbackRoute]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}

/**
 * High Order Component for protecting pages
 *
 * @example
 * export default withRouteGuard(DoctorDashboardPage);
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredPermissions?: string[];
    allowedRoles?: string[];
    fallbackRoute?: string;
  },
) {
  return function ProtectedComponent(props: P) {
    return (
      <RouteGuard
        requiredPermissions={options?.requiredPermissions}
        allowedRoles={options?.allowedRoles}
        fallbackRoute={options?.fallbackRoute}
      >
        <Component {...props} />
      </RouteGuard>
    );
  };
}

/**
 * Hook to check if current route is accessible
 */
export function useCanAccessCurrentRoute(): boolean {
  const { role } = useRole();
  const pathname = usePathname();
  return isRouteAccessibleByRole(role, pathname);
}

/**
 * Hook to get redirect target for blocked route
 */
export function useBlockedRouteRedirect(): string | null {
  const { role } = useRole();
  const pathname = usePathname();

  const isBlocked = !isRouteAccessibleByRole(role, pathname);

  if (!isBlocked) {
    return null;
  }

  return getDefaultRouteForRole(role);
}

/**
 * Highlight blocked routes for doctors
 */
export function isDoctorBlockedRoute(pathname: string): boolean {
  return doctorBlockedModules.some((module) => pathname.startsWith(module as string));
}

/**
 * Access Denied Component
 */
export function AccessDenied({ route }: { route: string }) {
  const { role } = useRole();
  const router = useRouter();
  const defaultRoute = getDefaultRouteForRole(role);
  const roleDisplayName = getRoleDisplayName(role);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {"You don't have permission to access"}{" "}
          <code className="rounded bg-muted px-2 py-1 text-sm">{route}</code>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your current role is: <span className="font-semibold">{roleDisplayName}</span>
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-border px-6 py-2 font-medium transition hover:bg-muted"
        >
          Go Back
        </button>
        <button
          onClick={() => router.push(defaultRoute)}
          className="rounded-lg bg-primary px-6 py-2 font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
