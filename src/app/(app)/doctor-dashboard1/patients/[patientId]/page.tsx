import { DoctorDashboard1PatientPage } from "@/features/doctor-dashboard1/doctor-dashboard1-patient-page";

export default async function Page({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  return <DoctorDashboard1PatientPage patientId={patientId} />;
}
