/\*\*

- ROLE-BASED ACCESS CONTROL - IMPLEMENTATION GUIDE & UTILITIES
-
- This file documents all the components, hooks, and utilities available for role-based access control
  \*/

import type { Role } from "@/types";

/\*\*

- CORE CONFIGURATION FILES
- ========================
-
- 1.  src/config/roles.ts
- - Role routes mapping
- - Doctor permissions list
- - Admin permissions list
- - Allowed/blocked modules for each role
- - Helper functions for permission checks
-
- 2.  src/lib/permissions.ts
- - Hooks for permission checking (useHasPermission, useCanAccessRoute, useIsDoctor, etc.)
- - Utility functions for permission validation
- - Route accessibility checks
    \*/

/\*\*

- PROVIDERS & CONTEXT
- ====================
-
- 1.  RoleProvider (src/components/providers/role-provider.tsx)
- - Manages current user role in React Context
- - Persists role to localStorage (plasmit-role)
- - Provides useRole() hook
-
- 2.  DoctorProvider (src/features/auth/doctor-context.tsx)
- - Doctor-specific context and configuration
- - Provides useDoctorContext() hook
- - Component helpers (ShowForDoctor, HideFromDoctor, AdminOnly, DoctorOnly)
    \*/

/\*\*

- ROUTE PROTECTION & GUARDS
- ==========================
-
- File: src/features/auth/route-guard.tsx
-
- Components:
- - RouteGuard: Wraps pages to enforce access control
- - AccessDenied: Display when access is blocked
-
- Hooks:
- - useCanAccessCurrentRoute(): Check if current route is accessible
- - useBlockedRouteRedirect(): Get redirect target for blocked routes
- - isDoctorBlockedRoute(): Check if route is blocked for doctors
-
- HOC:
- - withRouteGuard(Component): Protect any component with route guard
    \*/

/\*\*

- HOOKS FOR PERMISSIONS & ROLES
- ==============================
  \*/

// ✓ useRole() - Get current role and role setter
// From: src/components/providers/role-provider.tsx
// Usage: const { role, setRole, roles } = useRole();

// ✓ useIsDoctor() - Check if current user is doctor
// From: src/lib/permissions.ts
// Usage: const isDoctor = useIsDoctor();

// ✓ useIsAdmin() - Check if current user is admin
// From: src/lib/permissions.ts
// Usage: const isAdmin = useIsAdmin();

// ✓ useHasPermission(permission) - Check specific permission
// From: src/lib/permissions.ts
// Usage: const can = useHasPermission("VIEW_DOCTOR_DASHBOARD");

// ✓ useCanAccessRoute(pathname) - Check route accessibility
// From: src/lib/permissions.ts
// Usage: const canAccess = useCanAccessRoute("/admin");

// ✓ useDefaultRoute() - Get dashboard route for current role
// From: src/lib/permissions.ts
// Usage: const dashboard = useDefaultRoute();

// ✓ useDoctorContext() - Get doctor-specific context
// From: src/features/auth/doctor-context.tsx
// Usage: const { isDoctor, canAccessModule } = useDoctorContext();

// ✓ useDoctorMode() - Check if in doctor mode
// From: src/features/auth/doctor-context.tsx
// Usage: const inDoctorMode = useDoctorMode();

// ✓ useDoctorModuleAccess(module) - Check module access for doctor
// From: src/features/auth/doctor-context.tsx
// Usage: const canAccess = useDoctorModuleAccess("/appointments");

// ✓ useDoctorActionPermission(action) - Check action permission for doctor
// From: src/features/auth/doctor-context.tsx
// Usage: const canWrite = useDoctorActionPermission("WRITE_PRESCRIPTION");

// ✓ useDoctorUIConfig() - Get doctor UI configuration
// From: src/features/auth/doctor-context.tsx
// Usage: const config = useDoctorUIConfig();

/\*\*

- CONDITIONAL RENDERING COMPONENTS
- ===================================
  \*/

// ✓ ShowForDoctor - Show content only for doctors
// Usage: <ShowForDoctor><AdminPanel /></ShowForDoctor>

// ✓ HideFromDoctor - Hide content from doctors
// Usage: <HideFromDoctor><AdminControls /></HideFromDoctor>

// ✓ AdminOnly - Admin-only content with fallback
// Usage: <AdminOnly><Analytics /></AdminOnly>

// ✓ DoctorOnly - Doctor-only content with fallback
// Usage: <DoctorOnly><DoctorTools /></DoctorOnly>

/\*\*

- UTILITY FUNCTIONS
- =================
  \*/

// ✓ isAdminModule(pathname) - Check if route is admin-only
// Usage: if (isAdminModule("/admin/users")) { ... }

// ✓ isDoctorModule(pathname) - Check if route is doctor-specific
// Usage: if (isDoctorModule("/doctor-dashboard")) { ... }

// ✓ getAccessibleModules(role) - Get list of accessible modules
// Usage: const modules = getAccessibleModules("Doctor");

// ✓ getBlockedModules(role) - Get list of blocked modules
// Usage: const blocked = getBlockedModules("Doctor");

// ✓ formatRouteName(route) - Convert route to display name
// Usage: const name = formatRouteName("/doctor-dashboard"); // "Doctor Dashboard"

// ✓ hasPermission(role, permission) - Check permission for role
// Usage: if (hasPermission("Doctor", "WRITE_PRESCRIPTION")) { ... }

// ✓ getPermissionsForRole(role) - Get all permissions for role
// Usage: const perms = getPermissionsForRole("Doctor");

// ✓ isRouteAccessibleByRole(role, route) - Check route access
// Usage: if (isRouteAccessibleByRole("Doctor", "/admin")) { ... }

// ✓ getDefaultRouteForRole(role) - Get default dashboard
// Usage: const dashboard = getDefaultRouteForRole("Doctor"); // "/doctor-dashboard"

/\*\*

- IMPLEMENTATION EXAMPLES
- =======================
  \*/

/\*\*

- Example 1: Conditional Button (Only for Doctors)
  \*/
  function DoctorActionButton() {
  const { canPerformAction } = useDoctorContext();

if (!canPerformAction("WRITE_PRESCRIPTION")) {
return null;
}

return <button>Write Prescription</button>;
}

/\*\*

- Example 2: Protected Module Access
  \*/
  function AppointmentModule() {
  const { canAccessModule } = useDoctorContext();

if (!canAccessModule("/appointments")) {
return <div>Access Denied</div>;
}

return <AppointmentContent />;
}

/\*\*

- Example 3: Admin-Only Dashboard Widget
  \*/
  function RevenueAnalyticsWidget() {
  return (
  <AdminOnly
  fallback={<div>Not available in your role</div>} >
  <RevenueChart />
  </AdminOnly>
  );
  }

/\*\*

- Example 4: Protecting a Page Component
  \*/
  function AdminSettingsPage() {
  return (
  <RouteGuard
  requiredPermissions={["ADMIN_SETTINGS"]}
  fallbackRoute="/dashboard" >
  <SettingsPanel />
  </RouteGuard>
  );
  }

/\*\*

- Example 5: Conditional Sidebar Item
  \*/
  function SidebarNavigation() {
  const { canAccessModule } = useDoctorContext();

return (
<nav>
<NavItem href="/dashboard">Dashboard</NavItem>
{canAccessModule("/appointments") && (
<NavItem href="/appointments">Appointments</NavItem>
)}
<HideFromDoctor>
<NavItem href="/admin">Admin Panel</NavItem>
</HideFromDoctor>
</nav>
);
}

/\*\*

- Example 6: Checking Multiple Permissions
  \*/
  function PatientRecord() {
  const isDoctor = useIsDoctor();
  const canWritePrescription = useHasPermission("WRITE_PRESCRIPTION");
  const canRequestLabTest = useHasPermission("REQUEST_LAB_TEST");

return (
<div>
{isDoctor && canWritePrescription && (
<button>Write Prescription</button>
)}
{isDoctor && canRequestLabTest && (
<button>Request Lab Test</button>
)}
</div>
);
}

/\*\*

- DOCTOR DASHBOARD FLOW
- ======================
-
- 1.  User clicks "Doctor" in role switcher
- 2.  RoleSwitcher updates role context and saves to localStorage
- 3.  User navigates to /doctor-dashboard
- 4.  AppShell detects isDoctor = true and renders without sidebar
- 5.  Doctor dashboard page loads with doctor-specific features
- 6.  Navigation items are filtered based on role (doctor permissions only)
- 7.  Admin-only components are hidden (via HideFromDoctor)
- 8.  If doctor tries to access /admin or /billing-desk, AppShell redirects to /doctor-dashboard
-
- BLOCKED MODULES FOR DOCTORS:
- - /admin
- - /admin-dashboard
- - /billing-desk
- - /finance
- - /billing
- - /inventory
- - /compliance
- - /settings
- - /insurance
    \*/

/\*\*

- TESTING CHECKLIST
- =================
-
- [ ] User can select "Doctor" role from role switcher
- [ ] User is redirected to /doctor-dashboard
- [ ] Doctor dashboard displays without sidebar
- [ ] Doctor dashboard shows only doctor-specific features
- [ ] Sidebar shows only doctor-accessible modules when viewing other roles
- [ ] Doctor cannot access /admin routes (redirected to /doctor-dashboard)
- [ ] Doctor cannot access /billing-desk (redirected)
- [ ] Admin-only buttons/cards are hidden in doctor view
- [ ] Role persists on page reload
- [ ] Switching from Doctor to other role shows full dashboard
- [ ] Role switcher shows all available roles
- [ ] Permissions are correctly enforced for each module
- [ ] AccessDenied page appears if permissions are missing
- [ ] useHasPermission hook works correctly
- [ ] useDoctorContext provides correct values
      \*/

export {};
