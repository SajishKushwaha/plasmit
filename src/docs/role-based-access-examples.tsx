/**
 * ROLE-BASED ACCESS CONTROL - COMPONENT EXAMPLES & PATTERNS
 *
 * This file shows practical examples of how to use the role-based access control
 * system to conditionally render components, hide admin features, and show doctor-specific features.
 */

"use client";

import React from "react";
import { useIsAdmin, useIsDoctor, useHasPermission, useCanAccessRoute } from "@/lib/permissions";
import {
  useDoctorContext,
  useDoctorModuleAccess,
  AdminOnly,
  DoctorOnly,
  ShowForDoctor,
  HideFromDoctor,
} from "@/features/platform/auth/doctor-context";
import { RouteGuard } from "@/features/platform/auth/route-guard";

/**
 * PATTERN 1: Conditional Button - Show Action Only for Doctors
 */
export function WritePrescriptionButton() {
  const canWrite = useHasPermission("WRITE_PRESCRIPTION");

  if (!canWrite) {
    return null; // Hidden from non-doctors
  }

  return <button className="rounded bg-blue-500 px-4 py-2 text-white">Write Prescription</button>;
}

/**
 * PATTERN 2: Admin-Only Widget with Fallback
 */
export function RevenueAnalyticsWidget() {
  return (
    <AdminOnly
      fallback={
        <div className="p-4 text-center text-muted-foreground">
          This feature is only available to administrators.
        </div>
      }
    >
      <div className="rounded border p-4">
        <h3 className="font-bold">Revenue Analytics</h3>
        <p className="text-sm text-muted-foreground">Total revenue this month: $50,000</p>
      </div>
    </AdminOnly>
  );
}

/**
 * PATTERN 3: Doctor-Only Feature with Admin Fallback
 */
export function ConsultationStartButton() {
  return (
    <DoctorOnly
      fallback={
        <div className="text-sm text-muted-foreground">Only doctors can start consultations.</div>
      }
    >
      <button className="rounded bg-green-500 px-4 py-2 text-white">Start Consultation</button>
    </DoctorOnly>
  );
}

/**
 * PATTERN 4: Conditional Sidebar Navigation
 */
export function DynamicNavigation() {
  const isDoctor = useIsDoctor();
  const canBill = useHasPermission("MANAGE_BILLING");
  const canManageUsers = useHasPermission("MANAGE_USERS");

  return (
    <nav className="space-y-2">
      <NavItem href="/dashboard" label="Dashboard" />

      {isDoctor ? (
        <>
          {/* Doctor-specific navigation */}
          <NavItem href="/appointments" label="Appointments" />
          <NavItem href="/opd" label="OPD Queue" />
          <NavItem href="/doctor-dashboard" label="My Dashboard" />
          <NavItem href="/emergency" label="Emergency" />
        </>
      ) : (
        <>
          {/* Admin navigation */}
          <NavItem href="/admin" label="Administration" />
          <NavItem href="/admin/users" label="User Management" />
          {canBill && <NavItem href="/billing" label="Billing" />}
          {canManageUsers && <NavItem href="/admin/roles" label="Roles" />}
        </>
      )}
    </nav>
  );
}

/**
 * PATTERN 5: Conditional Card/Panel
 */
export function DashboardWidgets() {
  const { canAccessModule } = useDoctorContext();
  const isDoctor = useIsDoctor();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Always visible */}
      <Card title="Profile" />

      {/* Doctor-only widgets */}
      {isDoctor && (
        <>
          <Card title="Today's Appointments" />
          <Card title="Available Slots" />
          <Card title="Patient Alerts" />
        </>
      )}

      {/* Admin-only widgets */}
      {!isDoctor && (
        <>
          <Card title="System Health" />
          <Card title="Revenue" />
          <Card title="Staff Overview" />
        </>
      )}

      {/* Module-specific widgets */}
      {canAccessModule("/appointments") && <Card title="Recent Appointments" />}
    </div>
  );
}

/**
 * PATTERN 6: Conditional Form Fields
 */
export function PatientForm() {
  const isAdmin = useIsAdmin();
  const canWrite = useHasPermission("WRITE_PRESCRIPTION");

  return (
    <form className="space-y-4">
      <input type="text" placeholder="Patient Name" className="w-full rounded border px-3 py-2" />

      {/* Visible to all */}
      <textarea placeholder="Clinical Notes" className="w-full rounded border px-3 py-2" />

      {/* Only for doctors with permission */}
      {canWrite && (
        <textarea
          placeholder="Prescription"
          className="w-full rounded border border-green-200 bg-green-50 px-3 py-2"
        />
      )}

      {/* Only for admins */}
      {isAdmin && (
        <input type="text" placeholder="Billing Code" className="w-full rounded border px-3 py-2" />
      )}

      <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white">
        Save
      </button>
    </form>
  );
}

/**
 * PATTERN 7: Protected Page Component
 */
export function ProtectedAdminPage() {
  return (
    <RouteGuard fallbackRoute="/dashboard">
      <div className="space-y-4 p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p>This page is protected. Only admins can see it.</p>
        {/* Admin content */}
      </div>
    </RouteGuard>
  );
}

/**
 * PATTERN 8: Toolbar with Conditional Actions
 */
export function PatientRecordToolbar() {
  const canWrite = useHasPermission("WRITE_PRESCRIPTION");
  const canRequest = useHasPermission("REQUEST_LAB_TEST");
  const canManage = useHasPermission("MANAGE_AVAILABLE_SLOTS");

  return (
    <div className="flex gap-2 border-b p-4">
      {canWrite && (
        <button className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          💊 Prescription
        </button>
      )}

      {canRequest && (
        <button className="rounded bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700">
          🧪 Lab Test
        </button>
      )}

      {canManage && (
        <button className="rounded bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
          📅 Schedule
        </button>
      )}

      <HideFromDoctor>
        <button className="rounded bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          ⚙️ Admin
        </button>
      </HideFromDoctor>
    </div>
  );
}

/**
 * PATTERN 9: Module-Specific Access
 */
export function ModuleGatedComponent({ moduleRoute }: { moduleRoute: string }) {
  const { canAccessModule } = useDoctorContext();

  if (!canAccessModule(moduleRoute)) {
    return (
      <div className="rounded border-l-4 border-red-500 bg-red-50 p-4">
        <p className="font-medium text-red-900">Access Denied</p>
        <p className="text-sm text-red-700">{"You don't have access to this module."}</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p>Access granted. Module content here.</p>
    </div>
  );
}

/**
 * PATTERN 10: Multi-Role Component
 */
export function SmartDashboard() {
  const isAdmin = useIsAdmin();
  const isDoctor = useIsDoctor();

  return (
    <div className="space-y-4">
      {isAdmin && (
        <section>
          <h2 className="font-bold">Admin Overview</h2>
          <AdminOverviewWidget />
        </section>
      )}

      {isDoctor && (
        <section>
          <h2 className="font-bold">Your Schedule</h2>
          <DoctorScheduleWidget />
        </section>
      )}

      <section>
        <h2 className="font-bold">System Status</h2>
        <SystemStatusWidget />
      </section>
    </div>
  );
}

/**
 * PATTERN 11: Routes with Conditional Rendering
 */
export function Page() {
  const _canAccessRoute = useCanAccessRoute("/admin");

  return (
    <ShowForDoctor fallback={<AdminPageContent />}>
      <DoctorPageContent />
    </ShowForDoctor>
  );
}

/**
 * PATTERN 12: Feature Flag Based on Permission
 */
export function FeatureFlagComponent() {
  const canUseTelemedicine = useHasPermission("USE_TELEMEDICINE");
  const isDoctorModule = useDoctorModuleAccess("/appointments");

  return (
    <div>
      {canUseTelemedicine ? (
        <VideoConsultationButton />
      ) : (
        <div>Telemedicine not available for your role.</div>
      )}

      {isDoctorModule && <AppointmentComponent />}
    </div>
  );
}

/**
 * HELPER COMPONENTS
 */

interface NavItemProps {
  href: string;
  label: string;
}

function NavItem({ href, label }: NavItemProps) {
  return (
    <a href={href} className="block rounded px-3 py-2 text-sm hover:bg-gray-100">
      {label}
    </a>
  );
}

interface CardProps {
  title: string;
}

function Card({ title }: CardProps) {
  return (
    <div className="rounded border border-gray-200 p-4 shadow-sm">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">Content goes here</p>
    </div>
  );
}

function AdminOverviewWidget() {
  return <div className="text-sm">Admin overview widget content</div>;
}

function DoctorScheduleWidget() {
  return <div className="text-sm">Doctor schedule widget content</div>;
}

function SystemStatusWidget() {
  return <div className="text-sm">System status widget content</div>;
}

function AdminPageContent() {
  return <div>Admin page content</div>;
}

function DoctorPageContent() {
  return <div>Doctor page content</div>;
}

function VideoConsultationButton() {
  return <button className="rounded bg-blue-500 px-4 py-2 text-white">Start Video Call</button>;
}

function AppointmentComponent() {
  return <div>Appointment management UI</div>;
}
