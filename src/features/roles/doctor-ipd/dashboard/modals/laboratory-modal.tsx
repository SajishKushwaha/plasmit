"use client";

import { ResultsCenterView } from "@/features/diagnostics/results/components/ResultsCenterView";
import { rapidReviewPatients } from "@/features/clinical/rapid-review/rapid-review-data";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";

export function DashboardLabResultsPopup({ onOpenLaboratoryOrder, patient }: { onOpenLaboratoryOrder: () => void; patient: DoctorIpdPatient }) {
  const rapidReviewPatient = rapidReviewPatients.find((item) => item.id === patient.rapidReviewPatientId);

  return (
    <div className="h-full min-h-0 overflow-y-auto p-3 sm:p-5">
      <ResultsCenterView
        defaultDepartment="laboratory"
        defaultLatestDateOnly
        showPoctTab={false}
        patientContext={{
          ageSex: rapidReviewPatient?.ageGender,
          allergy: "Meropenem",
          bed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
          bloodGroup: "AB +ve",
          consultantDoctor: rapidReviewPatient?.consultant,
          dob: "30-12-1995",
          mrn: getDashboardResultPatientMrn(patient.id),
          name: patient.name,
          patientId: String(patient.id),
          uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
          wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
        }}
        onAddLaboratoryOrder={onOpenLaboratoryOrder}
        showLaboratoryOrderTabs
        showPathologyOrderTabs
        showRadiologyOrderTabs
        viewDescription="Laboratory reports for the selected dashboard patient."
        viewTitle="Diagnosis Result"
      />
    </div>
  );
}

function getDashboardResultPatientMrn(patientId: number) {
  const resultMrns = ["MRN-240118", "MRN-240119", "MRN-240121", "MRN-240124", "MRN-240126", "MRN-240127", "MRN-240130", "MRN-240133", "MRN-240135", "MRN-240136"];
  return resultMrns[(patientId - 1) % resultMrns.length];
}
