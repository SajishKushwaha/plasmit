"use client";

import { useRole } from "@/components/providers/role-provider";
import { ReceptionistBasicDemographicPage } from "@/features/roles/receptionist/patient-details/receptionist-basic-demographic-page";
import { PatientDetailsPage } from "@/features/roles/receptionist/patient-details/receptionist-patient-details-page";

export function PatientDetailsRolePage() {
  const { role } = useRole();
  return role === "Receptionist" ? <ReceptionistBasicDemographicPage /> : <PatientDetailsPage />;
}
