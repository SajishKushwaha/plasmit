/**
 * QUICK START GUIDE - Role-Based Access Control
 * ===============================================
 * 
 * This guide shows the most common patterns to implement role-based access in your components.
 */

// Mock components to satisfy TypeScript compilation in documentation examples
const DoctorView = () => null;
const AdminView = () => null;
const DoctorDashboard = () => null;
const AdminPanel = () => null;
const AnalyticsChart = () => null;
const SettingsForm = () => null;
const AccessDenied = () => null;
const AppointmentContent = () => null;

/**
 * MOST COMMON PATTERNS
 * ====================
 */

// 1. CHECK IF USER IS DOCTOR
// ===========================
import { useIsDoctor } from "@/lib/permissions";

function MyComponent() {
  const isDoctor = useIsDoctor();

  if (isDoctor) {
    return <DoctorView />;
  }

  return <AdminView />;
}

// 2. CHECK IF USER HAS PERMISSION
// ================================
import { useHasPermission } from "@/lib/permissions";

function PrescritionButton() {
  const canWrite = useHasPermission("WRITE_PRESCRIPTION");

  return canWrite ? <button>Write Prescription</button> : null;
}

// 3. SHOW/HIDE BASED ON ROLE
// ============================
import { ShowForDoctor, HideFromDoctor } from "@/features/platform/auth/doctor-context";

function Dashboard() {
  return (
    <>
      {/* Only visible to doctors */}
      <ShowForDoctor>
        <DoctorDashboard />
      </ShowForDoctor>

      {/* Hidden from doctors, visible to admins */}
      <HideFromDoctor>
        <AdminPanel />
      </HideFromDoctor>
    </>
  );
}

// 4. ADMIN-ONLY COMPONENT
// =======================
import { AdminOnly } from "@/features/platform/auth/doctor-context";

function RevenueReport() {
  return (
    <AdminOnly fallback={<p>Not available</p>}>
      <AnalyticsChart />
    </AdminOnly>
  );
}

// 5. PROTECT ENTIRE PAGE
// ======================
import { RouteGuard } from "@/features/platform/auth/route-guard";

function AdminSettingsPage() {
  return (
    <RouteGuard fallbackRoute="/doctor-dashboard">
      <SettingsForm />
    </RouteGuard>
  );
}

// 6. CONDITIONAL NAVIGATION
// ==========================
function Navigation() {
  const isDoctor = useIsDoctor();

  return (
    <nav>
      <a href="/dashboard">Dashboard</a>

      {isDoctor && (
        <>
          <a href="/appointments">Appointments</a>
          <a href="/opd">OPD Queue</a>
        </>
      )}

      {!isDoctor && (
        <>
          <a href="/admin">Admin</a>
          <a href="/billing">Billing</a>
        </>
      )}
    </nav>
  );
}

// 7. CHECK MODULE ACCESS FOR DOCTOR
// ==================================
import { useDoctorContext } from "@/features/platform/auth/doctor-context";

function AppointmentModule() {
  const { canAccessModule } = useDoctorContext();

  if (!canAccessModule("/appointments")) {
    return <AccessDenied />;
  }

  return <AppointmentContent />;
}

// 8. CHECK ACTION PERMISSION FOR DOCTOR
// =====================================
function PatientActions() {
  const { canPerformAction } = useDoctorContext();

  return (
    <div>
      {canPerformAction("WRITE_PRESCRIPTION") && (
        <button>Write Prescription</button>
      )}

      {canPerformAction("REQUEST_LAB_TEST") && (
        <button>Request Lab</button>
      )}
    </div>
  );
}

// 9. CONDITIONAL STYLING
// =======================
function Card() {
  const isDoctor = useIsDoctor();

  return (
    <div className={isDoctor ? "bg-blue-50" : "bg-gray-50"}>
      Content
    </div>
  );
}

// 10. MULTIPLE CONDITION CHECK
// ===========================
function PatientForm() {
  const isDoctor = useIsDoctor();
  const canPrescribe = useHasPermission("WRITE_PRESCRIPTION");
  const canBill = useHasPermission("MANAGE_BILLING");

  return (
    <form>
      {/* Show prescription field for doctors who can write */}
      {isDoctor && canPrescribe && (
        <textarea placeholder="Prescription" />
      )}

      {/* Show billing codes for admins who can bill */}
      {!isDoctor && canBill && (
        <input placeholder="Billing Code" />
      )}
    </form>
  );
}

/**
 * REAL-WORLD EXAMPLE: Sidebar Navigation
 * =====================================
 */

import { navigationItems } from "@/data/navigation";
import { useRole } from "@/components/providers/role-provider";

export function AppSidebar() {
  const { role } = useRole();

  // Filter items based on role
  const visibleItems = navigationItems.filter((item) =>
    item.allowedRoles.includes(role)
  );

  return (
    <aside className="w-64 bg-gray-50 p-4">
      <nav className="space-y-2">
        {visibleItems.map((item) => (
          <a
            key={item.id}
            href={item.route}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}

/**
 * REAL-WORLD EXAMPLE: Doctor Dashboard Toolbar
 * ============================================
 */

export function DoctorToolbar() {
  const isDoctor = useIsDoctor();
  const canConsult = useHasPermission("START_CONSULTATION");
  const canManageSlots = useHasPermission("UPDATE_DOCTOR_AVAILABILITY");

  if (!isDoctor) {
    return null;
  }

  return (
    <div className="flex gap-3 border-b p-4">
      {canConsult && (
        <button className="rounded bg-green-500 px-4 py-2 text-white">
          Start Consultation
        </button>
      )}

      {canManageSlots && (
        <button className="rounded bg-blue-500 px-4 py-2 text-white">
          Manage Availability
        </button>
      )}

      <button className="rounded border px-4 py-2">
        View Messages
      </button>
    </div>
  );
}

/**
 * REAL-WORLD EXAMPLE: Hide Admin Features
 * ======================================
 */

export function DashboardActions() {
  return (
    <div className="flex gap-2">
      {/* Available to all */}
      <button className="rounded bg-gray-100 px-4 py-2">Refresh</button>

      {/* Admin-only */}
      <AdminOnly>
        <button className="rounded bg-red-100 px-4 py-2">
          System Settings
        </button>
      </AdminOnly>

      {/* Doctor-only */}
      <ShowForDoctor>
        <button className="rounded bg-blue-100 px-4 py-2">
          Availability
        </button>
      </ShowForDoctor>
    </div>
  );
}

/**
 * CHEAT SHEET
 * ==========
 */

export const cheatSheet = `
┌─────────────────────────────────────────────────────────────┐
│  ROLE-BASED ACCESS CONTROL - QUICK REFERENCE              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  CHECK ROLE:                                                │
│  • useIsDoctor() - true if doctor                          │
│  • useIsAdmin() - true if admin                            │
│  • useRole() - get current role object                     │
│                                                               │
│  CHECK PERMISSION:                                          │
│  • useHasPermission(permission) - check specific action    │
│  • useDoctorModuleAccess(module) - check module access     │
│  • useCanAccessRoute(path) - check route access            │
│                                                               │
│  RENDER CONDITIONALLY:                                      │
│  • <ShowForDoctor> - show only for doctors                 │
│  • <HideFromDoctor> - hide from doctors                    │
│  • <AdminOnly> - admin-only content                        │
│  • <DoctorOnly> - doctor-only content                      │
│                                                               │
│  PROTECT PAGES:                                            │
│  • <RouteGuard> - full page protection                     │
│  • withRouteGuard() - HOC for components                   │
│                                                               │
│  DOCTOR DASHBOARD:                                          │
│  • /doctor-dashboard - doctor's default route             │
│  • No sidebar for doctors                                   │
│  • Blocks admin modules automatically                       │
│                                                               │
│  ALLOWED DOCTOR MODULES:                                    │
│  • /doctor-dashboard (primary)                             │
│  • /appointments                                            │
│  • /opd                                                     │
│  • /clinical-examination                                    │
│  • /rapid-review                                           │
│  • /emergency                                              │
│                                                               │
│  BLOCKED DOCTOR MODULES:                                    │
│  • /admin, /admin-dashboard                                │
│  • /billing, /billing-desk, /finance                       │
│  • /insurance, /inventory, /compliance, /settings          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
`;
