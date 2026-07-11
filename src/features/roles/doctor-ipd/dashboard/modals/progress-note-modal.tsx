"use client";

import { ProgressNotesPanel } from "@/features/roles/doctor-ipd/progress-notes";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";

export function ProgressNoteModalContent({ patient }: { patient: DoctorIpdPatient }) {
  return <ProgressNotesPanel compact patient={patient} tone={patientTone(patient)} />;
}
