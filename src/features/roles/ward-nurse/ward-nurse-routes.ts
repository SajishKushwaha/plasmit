import { redirect } from "next/navigation";

export const wardNurseCanonicalRoute = "/icu-command-center/clinical-workspace/patient-overview";

export const wardNurseRouteTargets = {
  root: wardNurseCanonicalRoute,
  "assigned-patients": "/icu-command-center/nursing/assigned-patients",
  "bed-ward-nurse-link": "/icu-command-center/nursing/bed-ward-nurse-link",
  "critical-alerts": "/icu-command-center/nursing/critical-alerts",
  "escalation-decision": "/icu-command-center/nursing/escalation-decision",
  "escalation-tracking": "/icu-command-center/nursing/escalation-tracking",
  "first-level-review": "/icu-command-center/nursing/first-level-review",
  "intake-output": "/icu-command-center/nursing/intake-output",
  "medication-administration": "/icu-command-center/nursing/medication-administration",
  "medicine-receive-verify": "/icu-command-center/nursing/medicine-receive-verify",
  "nurse-entry": "/icu-command-center/nursing/nurse-entry",
  "nurse-review": "/icu-command-center/nursing/nurse-review",
  "nursing-notes": "/icu-command-center/nursing/nursing-notes",
  "patient-event-update": "/icu-command-center/nursing/patient-event-update",
  "patient-medication": "/icu-command-center/nursing/patient-medication",
  "pending-doctor-orders": "/icu-command-center/nursing/pending-doctor-orders",
  "pending-medicines": "/icu-command-center/nursing/pending-medicines",
  "pending-nursing-tasks": "/icu-command-center/nursing/pending-nursing-tasks",
  "pending-vitals": "/icu-command-center/nursing/pending-vitals",
  "raise-issue": "/icu-command-center/nursing/raise-issue",
  "shift-handover": "/icu-command-center/nursing/shift-handover",
  "shift-pending-summary": "/icu-command-center/nursing/shift-pending-summary",
  station: "/icu-command-center/nursing/station",
  "tasks-assessments": "/icu-command-center/nursing/tasks-assessments",
} as const;

export type WardNurseRouteKey = keyof typeof wardNurseRouteTargets;

export function redirectToWardNurseRoute(route: WardNurseRouteKey): never {
  redirect(wardNurseRouteTargets[route]);
}
