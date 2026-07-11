import type { DoctorIpdPatient, PatientTone, VitalTone } from "./dashboard.types";

export function patientTone(patient: DoctorIpdPatient): PatientTone {
  const tones = [patient.hr.tone, patient.spo2.tone, patient.abps.tone, patient.abpd.tone, patient.temperature.tone];
  if (tones.includes("red")) return "red";
  if (tones.includes("orange")) return "orange";
  return "blue";
}

export function bpValue(patient: DoctorIpdPatient) {
  return `${patient.abps.value}/${patient.abpd.value}`;
}

export function bpTone(patient: DoctorIpdPatient): VitalTone {
  if (patient.abps.tone === "red" || patient.abpd.tone === "red") return "red";
  if (patient.abps.tone === "orange" || patient.abpd.tone === "orange") return "orange";
  return "green";
}

export function patientToneClass(tone: PatientTone) {
  if (tone === "red") return "text-red-700";
  if (tone === "orange") return "text-orange-600";
  return "text-blue-700";
}

export function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function patientToneRowClass(tone: PatientTone) {
  if (tone === "red") return "bg-red-50/70 hover:bg-red-50";
  if (tone === "orange") return "bg-orange-50/70 hover:bg-orange-50";
  return "bg-blue-50/60 hover:bg-blue-50";
}

export function patientToneCellClass(tone: PatientTone) {
  return "bg-white hover:bg-slate-50";
}

export function patientToneStripeClass(tone: PatientTone) {
  if (tone === "red") return "bg-red-500";
  if (tone === "orange") return "bg-orange-400";
  return "bg-blue-500";
}

export function mobilePatientNameClass(tone: PatientTone) {
  if (tone === "red") return "text-[#dc2626]";
  if (tone === "orange") return "text-[#f97316]";
  return "text-[#2563eb]";
}

export function mobilePatientStatus(tone: PatientTone) {
  if (tone === "red") return "Urgent";
  if (tone === "orange") return "Warning";
  return "Stable";
}

export function mobilePatientStatusClass(tone: PatientTone) {
  if (tone === "red") return "bg-[#fff1f2] text-[#fb7185]";
  if (tone === "orange") return "bg-[#fff7ed] text-[#f97316]";
  return "bg-[#f8fafc] text-[#64748b]";
}

export function mobilePatientUhid(patient: DoctorIpdPatient) {
  return `UHID-${String(45820 + patient.id).padStart(5, "0")}`;
}

export function mobilePatientBed(patient: DoctorIpdPatient) {
  const match = patient.bed.match(/ICU[-_\s]*([A-Za-z0-9]+)/i);
  if (match?.[1]) return `ICU-${match[1].replace(/[^A-Za-z0-9]/g, "")}`;
  return patient.bed;
}
