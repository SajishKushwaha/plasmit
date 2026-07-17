import { DoctorIpdPatientDetailsPage } from "@/features/roles/doctor-ipd/patient-details/patient-details-page";

export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <DoctorIpdPatientDetailsPage patientId={patientId} />;
}
