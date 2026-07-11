"use client";

import { DoctorOrdersPage } from "@/features/clinical/doctor-orders/doctor-orders";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";

export function RadiologyResultReview({ patient }: { patient: DoctorIpdPatient }) {
  return (
    <DoctorOrdersPage
      defaultTab="radiology"
      onlyTab="radiology"
      patientContext={{
        ageSex: "45/M",
        diagnosis: patient.diagnosis,
        id: `doctor-ipd-${patient.id}`,
        name: patient.name,
        radiologyPatientId: `pat-${1000 + (((patient.id - 1) % 6) + 1)}`,
        uhid: `DASH-${String(patient.id).padStart(4, "0")}`,
        wardBed: patient.bed,
      }}
      radiologyDefaultTab="result-review"
    />
  );
}
