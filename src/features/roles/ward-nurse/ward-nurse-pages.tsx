import {
  NursingIcuModulePage,
  WardNursePatientEventUpdatePage as SharedWardNursePatientEventUpdatePage,
  type NursingIcuPageId,
} from "@/features/care-team/nursing-icu/nursing-icu-pages";

export { wardNurseCanonicalRoute } from "./ward-nurse-routes";

export type WardNursePageId = Extract<
  NursingIcuPageId,
  | "alerts"
  | "escalation-center"
  | "head-nurse-console"
  | "intake-output"
  | "medication-administration"
  | "medicine-receive-verify"
  | "notifications-tasks"
  | "nurse-review"
  | "nursing-notes"
  | "patient-medication"
  | "raise-issue"
  | "shift-handover"
  | "shift-pending-summary"
  | "smart-bed-view"
  | "tasks"
  | "vitals"
>;

export function WardNurseModulePage({ page }: { page: WardNursePageId }) {
  return <NursingIcuModulePage page={page} />;
}

export function WardNursePatientEventUpdatePage() {
  return <SharedWardNursePatientEventUpdatePage />;
}
