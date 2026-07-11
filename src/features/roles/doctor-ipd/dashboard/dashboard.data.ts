import type { DoctorIpdPatient, PatientTone, VitalTone } from "./dashboard.types";
import { patientTone } from "./dashboard.utils";

const rapidReviewPatientIds = ["rr-002", "rr-003", "rr-001", "rr-004"];

const patientNames = [
  "Aisha Khan",
  "Liam Anderson",
  "Meera Sharma",
  "Oliver Brown",
  "Priya Nair",
  "Noah Wilson",
  "Arjun Patel",
  "Emily Clarke",
  "Ravi Menon",
  "Sophie Williams",
  "Ananya Roy",
  "Jack Thompson",
  "Kabir Ali",
  "Grace Mitchell",
  "Neha Iyer",
  "Ethan Harris",
  "Rohan Das",
  "Chloe Bennett",
];

const patients: DoctorIpdPatient[] = [
  row(1, "HN_40*ICU-10***", "Upper Gastrointestinal bleeding", [120, "red"], [95, "green"], [120, "green"], [65, "green"], ["36.5", "green"]),
  row(2, "HN_3*ICU-70***", "Influenza", [85, "green"], [98, "green"], [120, "green"], [80, "green"], ["40", "red"]),
  row(3, "HN_53ICU--9***", "Myocardial Infarction (MI)", [115, "red"], [95, "green"], [110, "green"], [60, "green"], ["38", "green"]),
  row(4, "HN_33*ICU-10***", "Upper Gastrointestinal bleeding", [110, "red"], [65, "red"], [120, "green"], [52, "orange"], ["36.5", "green"]),
  row(5, "OR_0*Induction-6***", "Pneumonia", [102, "orange"], [95, "green"], [120, "green"], [85, "green"], ["37", "green"]),
  row(6, "HN_40*ICU-50-***", "Lower Gastrointestinal bleeding", [57, "orange"], [95, "green"], [120, "green"], [52, "orange"], ["36.5", "green"]),
  row(7, "HN_17* isolatio-11 ***", "Myocarditis", [70, "green"], [95, "green"], [70, "orange"], [132, "orange"], ["36.5", "green"]),
  row(8, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [89, "orange"], [150, "orange"], [140, "orange"], ["38", "green"]),
  row(9, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [130, "orange"], [90, "orange"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(10, "HN_17*isolatio-11 ***", "Pulmonary embolism", [125, "orange"], [68, "orange"], [80, "orange"], [90, "green"], ["39.5", "orange"]),
  row(11, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [79, "orange"], [150, "orange"], [90, "green"], ["38", "green"]),
  row(12, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [130, "orange"], [92, "green"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(13, "HN_17*isolatio-11***", "Pulmonary embolism", [125, "orange"], [88, "orange"], [80, "orange"], [90, "green"], ["39.5", "orange"]),
  row(14, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [79, "orange"], [150, "orange"], [90, "green"], ["38", "green"]),
  row(15, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [90, "green"], [90, "orange"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(16, "HN_89*isolatio-001***", "Lower Gastrointestinal bleeding", [89, "green"], [96, "green"], [98, "green"], [78, "green"], ["37.5", "green"]),
  row(17, "HN_33*ICU-10***", "H1N1 Influenza", [89, "green"], [95, "green"], [110, "green"], [87, "green"], ["36.5", "green"]),
  row(18, "HN_17*isolatio-11***", "Pulmonary embolism", [69, "green"], [98, "green"], [97, "green"], [85, "green"], ["39.5", "green"]),
];

const patientToneOrder: Record<PatientTone, number> = {
  red: 0,
  orange: 1,
  blue: 2,
};

export const orderedPatients = [...patients].sort((a, b) => {
  const toneRank = patientToneOrder[patientTone(a)] - patientToneOrder[patientTone(b)];
  return toneRank || a.id - b.id;
});

function row(
  id: number,
  bed: string,
  diagnosis: string,
  hr: [number, VitalTone],
  spo2: [number, VitalTone],
  abps: [number, VitalTone],
  abpd: [number, VitalTone],
  temperature: [string, VitalTone],
): DoctorIpdPatient {
  return {
    id,
    name: patientNames[id - 1] ?? `Patient ${id}`,
    bed,
    diagnosis,
    rapidReviewPatientId: rapidReviewPatientIds[(id - 1) % rapidReviewPatientIds.length],
    hr: { value: hr[0], tone: hr[1] },
    spo2: { value: spo2[0], tone: spo2[1] },
    abps: { value: abps[0], tone: abps[1] },
    abpd: { value: abpd[0], tone: abpd[1] },
    temperature: { value: temperature[0], tone: temperature[1] },
  };
}
