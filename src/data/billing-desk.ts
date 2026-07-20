import type { LucideIcon } from "lucide-react";
import { CalendarClock, CreditCard, FlaskConical, IdCard, PackageCheck, Radio, ReceiptText, Search, TestTube2, UserRound } from "lucide-react";
import { mockPatients } from "@/data/patients";
import type { PatientRecord } from "@/types";

export type BillingDeskStep = "patient" | "referral" | "appointments" | "pathology" | "radiology" | "packages" | "quick-tests" | "individual-tests" | "summary" | "payment";
export type BillingDeskPatient = {
  id: string;
  name: string;
  uhid: string;
  phone: string;
  ageGender: string;
  bloodGroup: string;
  registeredAt: string;
  payer: string;
  address: string;
  city: string;
  source: string;
  doctor: string;
  status: "Active" | "Due" | "Corporate" | "Insurance";
  referralSource: string;
  lastVisit: string;
  insuranceStatus: "Not required" | "Pre-auth required" | "Approved" | "Pending";
};
export type BillingDeskService = {
  id: string;
  name: string;
  category: "Pathology" | "Radiology" | "Package" | "Quick Test" | "Individual Test" | "Appointment";
  group: string;
  price: number;
  discount: number;
  tax: number;
  urgency?: "Routine" | "Urgent" | "Stat";
  meta: string;
  tat?: string;
  sample?: string;
  fasting?: boolean;
  contrast?: boolean;
  modality?: string;
  includedServiceIds?: string[];
  insuranceCovered?: boolean;
};
export type BillingReferral = {
  id: string;
  doctor: string;
  source: "Doctor" | "Corporate" | "TPA" | "Walk-in" | "Camp";
  organization: string;
  commission: string;
  status: "Mapped" | "Approval needed" | "No commission";
  notes: string;
};
export type BillingAppointment = {
  id: string;
  appointmentNo: string;
  patientId: string;
  department: string;
  doctor: string;
  slot: string;
  visitType: "New" | "Follow-up" | "Review" | "Teleconsult";
  status: "Checked-in" | "Scheduled" | "Waiting" | "Completed";
  fee: number;
  billingStatus: "Unbilled" | "Billed" | "Package covered";
  room: string;
};
export type BillingDoctorFee = {
  doctor: string;
  department: string;
  fee: number;
  room: string;
};

function fullPatientName(patient: PatientRecord) {
  return `${patient.firstName} ${patient.middleName ? `${patient.middleName} ` : ""}${patient.lastName}`;
}

function billingStatusForPatient(patient: PatientRecord): BillingDeskPatient["status"] {
  if (patient.alertFlags.some((flag) => flag.toLowerCase().includes("outstanding"))) return "Due";
  if (patient.abhaStatus === "Linked") return "Insurance";
  if (patient.status === "Active") return "Active";
  return "Due";
}

function payerForPatient(patient: PatientRecord) {
  if (patient.abhaStatus === "Linked") return "Insurance";
  if (patient.alertFlags.some((flag) => flag.toLowerCase().includes("outstanding"))) return "Self";
  return "Self";
}

function doctorForDepartment(department: string) {
  const mapping: Record<string, string> = {
    Cardiology: "Dr. Kavita Rao",
    Orthopedics: "Dr. Aman Verma",
    Pediatrics: "Dr. Sameer Khan",
    Emergency: "Emergency Desk",
    Oncology: "Dr. Neha Malik",
  };
  return mapping[department] ?? "Dr. Neha Malik";
}

function referralForPatient(patient: PatientRecord) {
  if (patient.abhaStatus === "Linked") return "Star Health TPA";
  if (patient.department === "Pediatrics") return "Community Health Camp";
  return "Walk-in";
}

function insuranceStatusForPatient(patient: PatientRecord): BillingDeskPatient["insuranceStatus"] {
  if (patient.abhaStatus === "Linked") return "Pre-auth required";
  if (patient.abhaStatus === "Consent required" || patient.abhaStatus === "Link pending") return "Pending";
  return "Not required";
}

export function patientRecordToBillingPatient(patient: PatientRecord): BillingDeskPatient {
  return {
    id: patient.id,
    name: fullPatientName(patient),
    uhid: patient.uhid,
    phone: patient.mobile,
    ageGender: `${patient.age}/${patient.gender.charAt(0)}`,
    bloodGroup: patient.bloodGroup,
    registeredAt: patient.lastVisitAt,
    payer: payerForPatient(patient),
    address: patient.address,
    city: patient.city,
    source: patient.department,
    doctor: doctorForDepartment(patient.department),
    status: billingStatusForPatient(patient),
    referralSource: referralForPatient(patient),
    lastVisit: patient.lastVisitAt,
    insuranceStatus: insuranceStatusForPatient(patient),
  };
}

export const billingDeskSteps: { id: BillingDeskStep; label: string; icon: LucideIcon }[] = [
  { id: "patient", label: "Patient", icon: IdCard },
  { id: "referral", label: "Referral", icon: UserRound },
  { id: "appointments", label: "Appointments", icon: CalendarClock },
  { id: "pathology", label: "Pathology", icon: FlaskConical },
  { id: "radiology", label: "Radiology", icon: Radio },
  { id: "packages", label: "Packages", icon: PackageCheck },
  { id: "quick-tests", label: "Quick Tests", icon: TestTube2 },
  { id: "individual-tests", label: "Individual Tests", icon: Search },
  { id: "summary", label: "Bill Summary", icon: ReceiptText },
  { id: "payment", label: "Payment", icon: CreditCard },
];

export const billingPatients: BillingDeskPatient[] = mockPatients.map(patientRecordToBillingPatient);

export const billingServices: BillingDeskService[] = [
  { id: "svc-001", name: "CBC with ESR", category: "Pathology", group: "Hematology", price: 650, discount: 0, tax: 5, urgency: "Routine", meta: "Sample: EDTA", tat: "4 hrs", sample: "EDTA", insuranceCovered: true },
  { id: "svc-002", name: "Liver Function Test", category: "Pathology", group: "Biochemistry", price: 1250, discount: 5, tax: 5, urgency: "Urgent", meta: "Fasting optional", tat: "6 hrs", sample: "Serum", fasting: false, insuranceCovered: true },
  { id: "svc-003", name: "Thyroid Profile", category: "Pathology", group: "Hormone", price: 1450, discount: 0, tax: 5, urgency: "Routine", meta: "T3/T4/TSH", tat: "Same day", sample: "Serum", insuranceCovered: true },
  { id: "svc-004", name: "Chest X-ray PA", category: "Radiology", group: "X-ray", price: 900, discount: 0, tax: 5, urgency: "Routine", meta: "No contrast", modality: "X-ray", contrast: false, insuranceCovered: true },
  { id: "svc-005", name: "USG Abdomen", category: "Radiology", group: "Ultrasound", price: 1800, discount: 0, tax: 5, urgency: "Urgent", meta: "Fasting preferred", modality: "USG", fasting: true, contrast: false, insuranceCovered: true },
  { id: "svc-006", name: "CT Brain Plain", category: "Radiology", group: "CT", price: 4500, discount: 5, tax: 5, urgency: "Stat", meta: "No contrast", modality: "CT", contrast: false, insuranceCovered: false },
  { id: "svc-007", name: "Executive Health Package", category: "Package", group: "Preventive", price: 6999, discount: 15, tax: 5, meta: "CBC, LFT, KFT, ECG, X-ray", includedServiceIds: ["svc-001", "svc-002", "svc-004", "svc-010"] },
  { id: "svc-008", name: "Cardiac Risk Package", category: "Package", group: "Cardiology", price: 5200, discount: 10, tax: 5, meta: "Lipid, ECG, Echo screening", includedServiceIds: ["svc-002", "svc-010"] },
  { id: "svc-009", name: "Blood Sugar Random", category: "Quick Test", group: "Favorites", price: 180, discount: 0, tax: 5, meta: "One-click add", tat: "30 min", sample: "Capillary" },
  { id: "svc-010", name: "ECG 12 Lead", category: "Quick Test", group: "Favorites", price: 600, discount: 0, tax: 5, meta: "Immediate handoff", tat: "15 min" },
  { id: "svc-011", name: "Vitamin D", category: "Individual Test", group: "Biochemistry", price: 1900, discount: 0, tax: 5, meta: "Serum sample", tat: "24 hrs", sample: "Serum", insuranceCovered: false },
  { id: "svc-012", name: "OPD Consultation Fee", category: "Appointment", group: "Cardiology", price: 1200, discount: 0, tax: 0, meta: "10:40 AM slot" },
];

export const billingReferrals: BillingReferral[] = [
  { id: "ref-001", doctor: "Dr. Kavita Rao", source: "Doctor", organization: "Plasmit Cardiology OPD", commission: "0%", status: "No commission", notes: "Internal consultant, no referral payout." },
  { id: "ref-002", doctor: "Dr. Harish Mehta", source: "Doctor", organization: "Mehta Clinic", commission: "8%", status: "Mapped", notes: "External OPD referral mapping active." },
  { id: "ref-003", doctor: "Wellcare Corporate Desk", source: "Corporate", organization: "Wellcare Industries", commission: "Package contract", status: "Mapped", notes: "Corporate rate card applies before discount." },
  { id: "ref-004", doctor: "Star Health TPA", source: "TPA", organization: "Star Health", commission: "Pre-auth", status: "Approval needed", notes: "Insurance requires pre-approval for high-value diagnostics." },
  { id: "ref-005", doctor: "Community Health Camp", source: "Camp", organization: "Mayur Vihar Camp", commission: "5%", status: "Mapped", notes: "Camp referral discount can be applied once." },
];

export const billingAppointments: BillingAppointment[] = [
  { id: "apt-001", appointmentNo: "APT-5261", patientId: "pat-001", department: "Cardiology", doctor: "Dr. Kavita Rao", slot: "Today 10:40 AM", visitType: "Follow-up", status: "Checked-in", fee: 1200, billingStatus: "Unbilled", room: "Consult Room 03" },
  { id: "apt-002", appointmentNo: "APT-5268", patientId: "pat-001", department: "Diagnostics Review", doctor: "Dr. Kavita Rao", slot: "Today 12:10 PM", visitType: "Review", status: "Scheduled", fee: 600, billingStatus: "Package covered", room: "Review Desk" },
  { id: "apt-003", appointmentNo: "APT-5274", patientId: "pat-002", department: "Orthopedics", doctor: "Dr. Aman Verma", slot: "Today 11:20 AM", visitType: "New", status: "Waiting", fee: 900, billingStatus: "Unbilled", room: "Consult Room 05" },
  { id: "apt-004", appointmentNo: "APT-5282", patientId: "pat-003", department: "General Medicine", doctor: "Dr. Neha Malik", slot: "Today 02:30 PM", visitType: "Teleconsult", status: "Scheduled", fee: 750, billingStatus: "Unbilled", room: "Virtual" },
];

export const billingDoctorFees: BillingDoctorFee[] = [
  { doctor: "Dr. Kavita Rao", department: "Cardiology", fee: 1200, room: "Consult Room 03" },
  { doctor: "Dr. Aman Verma", department: "Orthopedics", fee: 900, room: "Consult Room 05" },
  { doctor: "Dr. Neha Malik", department: "General Medicine", fee: 750, room: "Consult Room 02" },
  { doctor: "Dr. Sameer Khan", department: "Pediatrics", fee: 800, room: "Pediatric OPD 01" },
  { doctor: "Dr. Harish Mehta", department: "External Referral", fee: 650, room: "Referral Desk" },
];

export const billingHints = [
  "Patient has pending pathology bill.",
  "Insurance requires pre-approval.",
  "Duplicate test already added.",
  "High-value billing package detected.",
];

export const billingApiEndpoints = [
  "GET /api/v1/patients",
  "POST /api/v1/patients",
  "GET /api/v1/referrals",
  "POST /api/v1/referrals",
  "GET /api/v1/appointments",
  "POST /api/v1/appointments",
  "GET /api/v1/tests",
  "GET /api/v1/packages",
  "GET /api/v1/billing/patients",
  "GET /api/v1/billing/tests",
  "GET /api/v1/billing/packages",
  "POST /api/v1/billing/create",
  "GET /api/v1/billing/:id",
  "POST /api/v1/billing/payment",
  "POST /api/v1/payments",
  "POST /api/v1/refunds",
  "GET /api/v1/billing/history/:patientId",
];
