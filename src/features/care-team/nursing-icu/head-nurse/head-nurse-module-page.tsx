"use client";

import { HeadNurseDashboard } from "./head-nurse-dashboard";
import type { HeadNurseModuleId, HeadNursePageProps } from "./head-nurse-types";
import { AlertsDelaysPage } from "./pages/alerts-delays-page";
import { AuditControlPage } from "./pages/audit-control-page";
import { EscalationsPage } from "./pages/escalations-page";
import { NewAdmissionsPage } from "./pages/new-admissions-page";
import { PatientAssignmentPage } from "./pages/patient-assignment-page";
import { ShiftHandoverPage } from "./pages/shift-handover-page";
import { StaffAvailabilityPage } from "./pages/staff-availability-page";
import { UnitAvailabilityPage } from "./pages/unit-availability-page";

export function HeadNurseModulePage({ initialPatientId, moduleId }: HeadNursePageProps & { moduleId: HeadNurseModuleId }) {
  if (moduleId === "dashboard") return <HeadNurseDashboard />;
  if (moduleId === "archived-records") return <HeadNurseDashboard archivedOnly />;
  if (moduleId === "new-admissions") return <NewAdmissionsPage initialPatientId={initialPatientId} />;
  if (moduleId === "unit-availability") return <UnitAvailabilityPage initialPatientId={initialPatientId} />;
  if (moduleId === "staff-availability") return <StaffAvailabilityPage initialPatientId={initialPatientId} />;
  if (moduleId === "patient-assignment") return <PatientAssignmentPage initialPatientId={initialPatientId} />;
  if (moduleId === "alerts-delays") return <AlertsDelaysPage initialPatientId={initialPatientId} />;
  if (moduleId === "escalations") return <EscalationsPage initialPatientId={initialPatientId} />;
  if (moduleId === "audit-control") return <AuditControlPage mode="overview" />;
  if (moduleId === "audit-critical-delays") return <AuditControlPage mode="critical-delays" />;
  if (moduleId === "audit-quality") return <AuditControlPage mode="quality" />;
  if (moduleId === "audit-reports") return <AuditControlPage mode="reports" />;
  return <ShiftHandoverPage initialPatientId={initialPatientId} />;
}
