export type VitalTone = "green" | "orange" | "red";
export type PatientTone = "blue" | "orange" | "red";

export type DoctorIpdPatient = {
  id: number;
  name: string;
  bed: string;
  diagnosis: string;
  rapidReviewPatientId: string;
  hr: { value: number; tone: VitalTone };
  spo2: { value: number; tone: VitalTone };
  abps: { value: number; tone: VitalTone };
  abpd: { value: number; tone: VitalTone };
  temperature: { value: string; tone: VitalTone };
};

export type DashboardMedicationRow = {
  orderId?: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: string;
  prescribedBy: string;
};
