"use client";

import { PatientVitalsAllGraphOnly } from "@/features/clinical/rapid-review/rapid-review-graph";
import type { DoctorIpdPatientContext } from "@/features/roles/doctor-ipd/patient-details/patient-details.types";
import { PatientMetrics } from "@/features/roles/doctor-ipd/patient-details/components/patient-metrics";

export function PatientOverview({ patient, rapidReviewPatient }: DoctorIpdPatientContext) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(1,1fr)_320px]">
        <PatientMetrics patient={patient} />
      </div>

      {rapidReviewPatient ? (
        <PatientVitalsAllGraphOnly patient={rapidReviewPatient} />
      ) : (
        <div className="rounded-xl border border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
          Vitals graph data is not available for this patient.
        </div>
      )}
    </div>
  );
}
