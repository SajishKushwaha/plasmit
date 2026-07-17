import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import type { RapidReviewPatient } from "@/features/clinical/rapid-review/rapid-review-data";

export type PatientTabValue =
  | "overview"
  | "live-monitoring"
  | "clinical-examination"
  | "results"
  | "vitals"
  | "assessment"
  | "add-progress"
  | "shift-summary"
  | "orders"
  | "Intake Output";

export type DashboardPoctMode = "add" | "results";
export type ResultsAutoView = "laboratory-all";
export type RequestedOrderTab =
  | "blood"
  | "drugs"
  | "pathology"
  | "lab"
  | "radiology"
  | "poct"
  | "procedures"
  | "referral"
  | "ordersets"
  | "ldt";

export type DoctorIpdPatientContext = {
  patient: DoctorIpdPatient;
  rapidReviewPatient?: RapidReviewPatient;
};
