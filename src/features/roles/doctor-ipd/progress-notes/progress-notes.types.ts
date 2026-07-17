import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";

export type ProgressNoteTone = "blue" | "orange" | "red";

export type ProgressNotesPanelContext = {
  patient: DoctorIpdPatient;
  tone: ProgressNoteTone;
};
