"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BedDouble,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Copy,
  FileText,
  FileSignature,
  Filter,
  HeartPulse,
  ListChecks,
  MonitorDot,
  Pill,
  Search,
  Save,
  ShieldAlert,
  Syringe,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import { NativeSelect } from "@/features/admin/admin-shared";
import {
  icuAlerts,
  icuPatients,
  icuTasks,
  icuVitals,
  infusionRows,
  intakeOutputRows,
  medicationRows,
  reportRows,
  toneForPriority,
  toneForStatus,
  type IcuAlert,
  type IcuMedication,
  type IcuPatient,
  type IcuTask,
} from "../nursing-icu-data";

type WorkflowAlertStatus = "New" | "Acknowledged" | "Assigned" | "Resolved" | "Closed";
type WorkflowMedicationStatus = IcuMedication["status"] | "Missed" | "Upcoming" | "Refused" | "Running" | "Paused" | "Stopped";
type MedicationNurseAction = "Administered" | "Held" | "Skipped" | "Missed" | "Refused" | "Running" | "Paused" | "Stopped" | "Verify";
type DoctorOrderStatusAction = "Hold" | "Discontinue";
type DoctorOrderAmendPayload = {
  changeAreas: string[];
  reason: string;
  effectiveDate: string;
  effectiveTime: string;
  note: string;
};
type MedicationOrderType = "Scheduled" | "STAT" | "PRN" | "Continuous" | "One-time";
type PharmacyStatus = "Available" | "Pending dispense" | "Low stock" | "Out of stock" | "Restricted" | "Shortage" | "Substitution requested";
type MedicationOrderStatus = "Draft" | "Active" | "Held by doctor" | "Discontinued";
type MedicationDepartment = "ICU" | "Emergency" | "Cardiology" | "Neurology" | "Pediatrics" | "Surgery" | "Anesthesia";
type FormularyAvailability = "Available" | "Low stock" | "Out of stock" | "Restricted";

type WorkflowAlert = Omit<IcuAlert, "status"> & {
  status: WorkflowAlertStatus;
  assignedTo: string;
  timeline: string[];
};

type MedicationDoseRow = Omit<IcuMedication, "status" | "doubleVerification"> & {
  orderId: string;
  orderType: MedicationOrderType;
  status: WorkflowMedicationStatus;
  scheduledDate: string;
  shift: "Morning" | "Evening" | "Night";
  doctor: string;
  indication: string;
  instructions: string;
  highRisk: boolean;
  doubleVerification: "Not required" | "Pending" | "Verified";
  pharmacyStatus: PharmacyStatus;
  orderStatus: MedicationOrderStatus;
  auditTrail: string[];
};

type DoctorMedicationOrder = {
  id: string;
  patientId: string;
  bedNo: string;
  department?: MedicationDepartment;
  formularyId?: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  orderType: MedicationOrderType;
  scheduleTimes: string[];
  doctor: string;
  indication: string;
  instructions: string;
  priority: "Routine" | "High" | "STAT";
  highRisk: boolean;
  doubleVerificationRequired: boolean;
  pharmacyStatus: PharmacyStatus;
  pharmacyLocation?: string;
  stockStatus?: FormularyAvailability;
  scenarioNotes?: string[];
  alternativeMeds?: string[];
  startDate?: string;
  startTime?: string;
  duration?: string;
  maxDailyDose?: string;
  minInterval?: string;
  reviewDate?: string;
  titrationTarget?: string;
  minRate?: string;
  maxRate?: string;
  monitoringFrequency?: string;
  approvalReason?: string;
  signedAt?: string;
  version?: number;
  statusReason?: string;
  followUpPlan?: string;
  actionTimeline?: string[];
  status: MedicationOrderStatus;
};

type MedicationOrderDraft = {
  patientId: string;
  department: MedicationDepartment;
  formularyId: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  orderType: MedicationOrderType;
  scheduleTimes: string;
  doctor: string;
  indication: string;
  instructions: string;
  highRisk: boolean;
  doubleVerificationRequired: boolean;
  pharmacyStatus: PharmacyStatus;
  startDate: string;
  startTime: string;
  duration: string;
  maxDailyDose: string;
  minInterval: string;
  reviewDate: string;
  titrationTarget: string;
  minRate: string;
  maxRate: string;
  monitoringFrequency: string;
  approvalReason: string;
};

type FormularyMedicine = {
  id: string;
  name: string;
  genericName: string;
  departments: MedicationDepartment[];
  defaultDose: string;
  route: string;
  frequency: string;
  orderType: MedicationOrderType;
  scheduleTimes: string;
  indication: string;
  instructions: string;
  pharmacyLocation: string;
  stockQty: number;
  stockUnit: string;
  availability: FormularyAvailability;
  highRisk: boolean;
  doubleVerificationRequired: boolean;
  restricted: boolean;
  alternatives: string[];
  safetyFlags: string[];
  renalDoseNote?: string;
  pediatricDoseNote?: string;
  npoWarning?: string;
};

type PatientMedicationProfile = {
  patientId: string;
  weightKg: number;
  allergies: string[];
  renalStatus: "Normal" | "Dose adjustment" | "Watch";
  liverStatus: "Normal" | "Watch";
  feedingStatus: "Oral allowed" | "NPO" | "NG feeds";
  ageGroup: "Pediatric" | "Adult" | "Geriatric";
};

type MedicationScenario = {
  id: string;
  title: string;
  detail: string;
  tone: StatusTone;
  blocking?: boolean;
};

type AdmissionDraft = {
  patientId: string;
  patientName: string;
  mrn: string;
  icuAdmissionNo: string;
  ageGender: string;
  source: string;
  currentLocation: string;
  patientStatus: string;
  sourceDetail: string;
  handoverBy: string;
  diagnosis: string;
  condition: string;
  bedNo: string;
  unit: string;
  nurse: string;
  doctor: string;
  admittingTeam: string;
  acceptanceStatus: string;
  ventilator: string;
  devices: string;
  medication: string;
  risk: string;
  isolation: string;
  readiness: string;
  notes: string;
};

const admissionSteps = ["Patient", "Condition", "Bed & Device", "Medication", "Review"];
const admissionSourceOptions = ["Emergency", "Emergency direct ICU", "General ward", "Post-surgical unit", "HDU step-up", "External hospital transfer", "Direct ICU admission"];
const admittingTeamOptions = ["ER + ICU rapid admit team", "General ICU admitting team", "Medical ICU admitting team", "Cardiothoracic ICU admitting team", "Pediatric ICU admitting team", "Neuro ICU admitting team", "Surgical ICU admitting team", "External transfer receive team"];
const admissionRequiredFields: Array<keyof AdmissionDraft> = [
  "patientId",
  "patientName",
  "mrn",
  "icuAdmissionNo",
  "ageGender",
  "source",
  "currentLocation",
  "patientStatus",
  "sourceDetail",
  "handoverBy",
  "diagnosis",
  "condition",
  "bedNo",
  "unit",
  "nurse",
  "doctor",
  "admittingTeam",
  "acceptanceStatus",
  "ventilator",
  "devices",
  "medication",
  "risk",
  "isolation",
  "readiness",
];
const allNurses = Array.from(new Set(icuPatients.flatMap((patient) => [patient.assignedUnitNurse, patient.assignedWardNurse])));

type AdmissionPatientState = "ICU request pending" | "Already admitted" | "ER stabilization" | "Emergency direct ICU" | "Ward deterioration" | "Post-op recovery" | "External transfer accepted" | "Planned ICU";

type AdmissionPatientCandidate = {
  id: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  source: string;
  currentLocation: string;
  patientStatus: AdmissionPatientState;
  diagnosis: string;
  condition: string;
  unit: string;
  bedNo: string;
  nurse: string;
  doctor: string;
  admittingTeam: string;
  ventilator: string;
  devices: string;
  medication: string;
  risk: string;
  isolation: string;
  sourceDetail: string;
  handoverBy: string;
  acceptanceStatus: string;
  notes: string;
  duplicateBlock?: boolean;
};

type IcuAdmissionBedOption = {
  bedNo: string;
  unit: string;
  status: "Available" | "Cleaning" | "Occupied" | "Transfer pending" | "Isolation available" | "Reserved";
  capability: string;
  note: string;
};

type AdmissionSourceScenario = {
  title: string;
  detailLabel: string;
  handoverLabel: string;
  readinessFocus: string[];
  risks: string[];
};

const admissionPatientCandidates: AdmissionPatientCandidate[] = [
  ...icuPatients.map((patient) => ({
    id: patient.id,
    patientName: patient.patientName,
    mrn: patient.mrn,
    ageGender: patient.ageGender,
    source: patient.admissionSource,
    currentLocation: `${patient.bedNo} | ${patient.unit}`,
    patientStatus: "Already admitted" as const,
    diagnosis: patient.diagnosis,
    condition: patient.currentStatus,
    unit: patient.unit,
    bedNo: patient.bedNo,
    nurse: patient.assignedUnitNurse,
    doctor: patient.admittingDoctor,
    admittingTeam: "Existing ICU care team",
    ventilator: patient.ventilatorStatus,
    devices: "Monitor, oxygen, infusion pump mapped",
    medication: "Continue active ICU medication plan",
    risk: patient.criticalityScore >= 8 ? "Critical" : "High",
    isolation: patient.alerts.some((alert) => alert.toLowerCase().includes("infection")) ? "Contact precaution" : "No",
    sourceDetail: `Current ICU admission active since ${patient.admissionTime}`,
    handoverBy: patient.assignedWardNurse,
    acceptanceStatus: "Accepted",
    notes: "Duplicate ICU admission should be blocked; open current admission or transfer workflow.",
    duplicateBlock: true,
  })),
  {
    id: "admit-er-direct-001",
    patientName: "Samar Ali",
    mrn: "PLH-ER-260608-0098",
    ageGender: "34/M",
    source: "Emergency direct ICU",
    currentLocation: "Emergency triage red zone",
    patientStatus: "Emergency direct ICU",
    diagnosis: "Acute respiratory failure requiring immediate ICU bed",
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C05",
    nurse: "Unit Nurse Priya",
    doctor: "Dr. Sameer Mehta",
    admittingTeam: "ER + ICU rapid admit team",
    ventilator: "Invasive ventilation",
    devices: "Monitor, ventilator, suction, infusion pump, emergency trolley",
    medication: "Rapid sequence medication, vasopressor readiness, antibiotic stat dose",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "Emergency red-zone patient bypassing ward/admission queue for direct ICU receive.",
    handoverBy: "ER Duty Doctor + ER Nurse Ritu",
    acceptanceStatus: "Accepted",
    notes: "Direct ICU admit: bed, ventilator, suction, and rapid response team must be ready before physical transfer.",
  },
  {
    id: "admit-er-001",
    patientName: "Farhan Sheikh",
    mrn: "PLH-ER-260608-0012",
    ageGender: "47/M",
    source: "Emergency",
    currentLocation: "ER Bay 2",
    patientStatus: "ER stabilization",
    diagnosis: "Septic shock with escalating oxygen requirement",
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C05",
    nurse: "Unit Nurse Priya",
    doctor: "Dr. Sameer Mehta",
    admittingTeam: "ER + ICU rapid admit team",
    ventilator: "NIV support",
    devices: "Monitor, oxygen, suction, infusion pump",
    medication: "Antibiotics, IV fluids, vasopressor readiness",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "ER stabilization complete; MAP support and oxygen escalation documented.",
    handoverBy: "ER Nurse Ritu",
    acceptanceStatus: "Accepted",
    notes: "Receive in Medical ICU with sepsis bundle and hourly urine output.",
  },
  {
    id: "admit-ward-001",
    patientName: "Nisha Verma",
    mrn: "PLH-IPD-260608-0041",
    ageGender: "63/F",
    source: "General ward",
    currentLocation: "Medical Ward W-12",
    patientStatus: "Ward deterioration",
    diagnosis: "Pneumonia with SpO2 drop and hypotension",
    condition: "Critical",
    unit: "Medical ICU",
    bedNo: "ICU-C06",
    nurse: "Unit Nurse Sana",
    doctor: "Dr. Aman Verma",
    admittingTeam: "Medical ICU admitting team",
    ventilator: "Oxygen mask",
    devices: "Monitor, oxygen, suction",
    medication: "Antibiotic escalation, nebulization, fluids review",
    risk: "High",
    isolation: "Contact precaution",
    sourceDetail: "Ward escalation after persistent SpO2 below target despite oxygen support.",
    handoverBy: "Ward Nurse Kavita",
    acceptanceStatus: "Accepted",
    notes: "Ward-to-ICU step-up; review ABG and repeat vitals on arrival.",
  },
  {
    id: "admit-ot-001",
    patientName: "Dev Malhotra",
    mrn: "PLH-OT-260608-0029",
    ageGender: "58/M",
    source: "Post-surgical unit",
    currentLocation: "OT Recovery 1",
    patientStatus: "Post-op recovery",
    diagnosis: "Post laparotomy monitoring with vasopressor watch",
    condition: "Ventilated",
    unit: "Surgical ICU",
    bedNo: "ICU-S02",
    nurse: "Unit Nurse Meera",
    doctor: "Dr. Neha Malik",
    admittingTeam: "Surgical ICU admitting team",
    ventilator: "Invasive ventilation",
    devices: "Monitor, ventilator, infusion pump, drain chart",
    medication: "Analgesia, antibiotics, vasopressor infusion",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "Anesthesia handover pending: airway, blood loss, drain, and vasopressor plan.",
    handoverBy: "OT Nurse Sanjana",
    acceptanceStatus: "Pending ICU doctor acceptance",
    notes: "Keep ventilator and pump ready before transfer from OT recovery.",
  },
  {
    id: "admit-external-001",
    patientName: "Reema Joshi",
    mrn: "PLH-EXT-260608-0007",
    ageGender: "39/F",
    source: "External hospital transfer",
    currentLocation: "Ambulance ETA 25 min",
    patientStatus: "External transfer accepted",
    diagnosis: "Acute stroke observation with low GCS",
    condition: "Critical",
    unit: "Neuro ICU",
    bedNo: "ICU-N03",
    nurse: "Unit Nurse Sana",
    doctor: "Dr. Imran Shah",
    admittingTeam: "Neuro ICU admitting team",
    ventilator: "Oxygen mask",
    devices: "Monitor, oxygen, suction, neuro observation chart",
    medication: "Mannitol availability check, seizure precautions",
    risk: "Critical",
    isolation: "No",
    sourceDetail: "Referral accepted by neuro ICU; transfer note and imaging CD expected.",
    handoverBy: "Referring hospital coordinator",
    acceptanceStatus: "Accepted",
    notes: "Prepare neuro ICU receive and document external transfer handover.",
  },
];

const icuAdmissionBedOptions: IcuAdmissionBedOption[] = [
  { bedNo: "ICU-C05", unit: "Medical ICU", status: "Available", capability: "Monitor + oxygen + suction", note: "Ready for ER/ward ICU admission." },
  { bedNo: "ICU-C06", unit: "Medical ICU", status: "Cleaning", capability: "Monitor + oxygen", note: "Housekeeping clearance pending." },
  { bedNo: "ICU-A01", unit: "Pediatric ICU", status: "Occupied", capability: "NIV support", note: "Aisha Khan currently admitted." },
  { bedNo: "ICU-B04", unit: "General ICU", status: "Transfer pending", capability: "Monitor-only bed", note: "Transfer checklist not complete." },
  { bedNo: "ICU-G01", unit: "General ICU", status: "Available", capability: "Monitor + oxygen + suction", note: "Ready for general ICU admission." },
  { bedNo: "ICU-P07", unit: "Pediatric ICU", status: "Available", capability: "Pediatric monitor + oxygen + suction", note: "Ready for pediatric ICU admission." },
  { bedNo: "ICU-N03", unit: "Neuro ICU", status: "Available", capability: "Neuro monitor + oxygen", note: "Ready for stroke/neuro observation." },
  { bedNo: "ICU-S02", unit: "Surgical ICU", status: "Reserved", capability: "Ventilator + pump + drain chart", note: "Reserved until doctor acceptance is completed." },
  { bedNo: "ICU-ISO1", unit: "Isolation ICU", status: "Isolation available", capability: "Negative pressure + PPE station", note: "Use for contact/airborne isolation." },
];

const admissionReadinessItems = [
  "Patient ID band verified",
  "Allergy band / alert checked",
  "Bedside monitor ready",
  "Oxygen and suction ready",
  "Ventilator / NIV readiness checked",
  "Infusion pump and emergency drugs ready",
  "Initial vitals planned",
  "Handover note received",
];

const admissionSourceScenarios: Record<string, AdmissionSourceScenario> = {
  Emergency: {
    title: "ER to ICU",
    detailLabel: "ER stabilization summary",
    handoverLabel: "ER handover by",
    readinessFocus: ["oxygen/suction", "vasopressor readiness", "sepsis/shock bundle", "initial vitals"],
    risks: ["unstable vitals", "unknown allergy", "pending labs", "family consent in progress"],
  },
  "Emergency direct ICU": {
    title: "Emergency direct ICU admission",
    detailLabel: "Direct ICU emergency reason",
    handoverLabel: "ER rapid handover by",
    readinessFocus: ["ICU bed before paperwork", "ventilator/suction ready", "rapid response team", "stat medication and consent"],
    risks: ["unstable airway", "identity pending", "no ward handover", "family consent after stabilization"],
  },
  "General ward": {
    title: "Ward to ICU step-up",
    detailLabel: "Deterioration reason",
    handoverLabel: "Ward handover by",
    readinessFocus: ["transfer checklist", "ward medication reconciliation", "repeat vitals", "doctor escalation note"],
    risks: ["SpO2 drop", "BP low", "GCS change", "delayed transport"],
  },
  "Post-surgical unit": {
    title: "OT/Post-op to ICU",
    detailLabel: "Surgery/anesthesia handover",
    handoverLabel: "OT handover by",
    readinessFocus: ["ventilator", "drain chart", "blood loss note", "analgesia/vasopressor plan"],
    risks: ["airway risk", "bleeding", "post-op shock", "anesthesia note pending"],
  },
  "HDU step-up": {
    title: "HDU to ICU",
    detailLabel: "HDU escalation reason",
    handoverLabel: "HDU handover by",
    readinessFocus: ["oxygen escalation", "vasopressor need", "monitor continuity", "repeat ABG"],
    risks: ["increasing oxygen demand", "renal watch", "fluid overload", "line access issue"],
  },
  "External hospital transfer": {
    title: "External hospital transfer",
    detailLabel: "Referral / ambulance summary",
    handoverLabel: "Transfer handover by",
    readinessFocus: ["acceptance note", "ambulance ETA", "outside reports", "receive team alert"],
    risks: ["identity mismatch", "missing imaging", "ventilator during transfer", "bed hold time"],
  },
  "Direct ICU admission": {
    title: "Planned/direct ICU admission",
    detailLabel: "Planned ICU indication",
    handoverLabel: "Admission coordinator",
    readinessFocus: ["bed reservation", "insurance/consent", "doctor order", "nurse receive checklist"],
    risks: ["billing hold", "late arrival", "bed reservation expiry", "procedure timing"],
  },
};
const admissionHandoverOptions: Record<string, string[]> = {
  Emergency: ["ER Nurse Ritu", "ER Duty Doctor + ER Nurse Ritu", "ER Charge Nurse Pooja", "Emergency Desk Coordinator"],
  "Emergency direct ICU": ["ER Duty Doctor + ER Nurse Ritu", "ER Charge Nurse Pooja + ICU Doctor", "Code Blue Team Lead", "Emergency Desk Coordinator"],
  "General ward": ["Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Doctor + Ward Nurse", "Floor Coordinator"],
  "Post-surgical unit": ["OT Nurse Sanjana", "Anesthetist + OT Nurse", "Recovery Nurse Lead", "Surgical Team Coordinator"],
  "HDU step-up": ["HDU Nurse Lead", "HDU Duty Doctor + Nurse", "Step-up Coordinator", "Respiratory Therapist"],
  "External hospital transfer": ["Referring hospital coordinator", "Ambulance paramedic", "External hospital duty doctor", "Transfer desk coordinator"],
  "Direct ICU admission": ["Admission coordinator", "ICU duty doctor", "Billing + admission desk", "Consultant secretary"],
};
const alertStatusFlow: WorkflowAlertStatus[] = ["New", "Acknowledged", "Assigned", "Resolved", "Closed"];
const medicationStatuses: Array<"All status" | WorkflowMedicationStatus> = ["All status", "Due", "Late", "Upcoming", "Administered", "Held", "Skipped", "Missed", "Refused", "Running", "Paused", "Stopped"];
const medicationDepartments: MedicationDepartment[] = ["ICU", "Emergency", "Cardiology", "Neurology", "Pediatrics", "Surgery", "Anesthesia"];
const medicationShiftOptions = ["All shifts", "Morning", "Evening", "Night"] as const;
const medicationHourOptions = ["All hours", ...Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`)] as const;

type NurseTaskSource =
  | "Doctor order"
  | "Medication / eMAR"
  | "Vitals / monitoring"
  | "Intake / output"
  | "IV / infusion"
  | "Blood transfusion"
  | "Lab / radiology"
  | "Shift handover"
  | "Admission / transfer"
  | "Head nurse supervision"
  | "Manual nursing care";

type NurseTaskScenario = {
  id: string;
  source: NurseTaskSource;
  taskType: string;
  title: string;
  priority: IcuTask["priority"];
  dueTime: string;
  repeat: string;
  escalation: string;
  remarks: string;
  contextLabel: string;
  contextOptions: string[];
};

type NurseTaskDraft = {
  patientId: string;
  source: NurseTaskSource;
  scenarioId: string;
  taskType: string;
  title: string;
  priority: IcuTask["priority"];
  assignedBy: string;
  assignedByRole: string;
  assignedTo: string;
  assignedToRole: string;
  assignmentReason: string;
  dueDate: string;
  dueTime: string;
  repeat: string;
  escalation: string;
  escalationOwner: string;
  requiresAcknowledgement: boolean;
  context: string;
  notes: string;
};

const nurseTaskScenarios: NurseTaskScenario[] = [
  { id: "doctor-repeat-vitals", source: "Doctor order", taskType: "Vitals monitoring", title: "Repeat vitals as per doctor instruction", priority: "High", dueTime: "Next 15 min", repeat: "Every 15 min until stable", escalation: "Escalate to duty doctor if BP, SpO2, GCS, or pulse worsens", remarks: "Doctor instruction follow-up", contextLabel: "Doctor instruction", contextOptions: ["Repeat vitals every 15 minutes", "Hourly neuro checks", "Prepare transfer after review", "Keep NPO and inform surgeon"] },
  { id: "doctor-result-followup", source: "Doctor order", taskType: "Result review follow-up", title: "Follow up pending report and inform doctor", priority: "High", dueTime: "Next 30 min", repeat: "One time", escalation: "Escalate if result is delayed or critical", remarks: "Pending report follow-up", contextLabel: "Pending result", contextOptions: ["ABG report", "CBC report", "Electrolyte report", "Portable X-ray report"] },
  { id: "medication-due", source: "Medication / eMAR", taskType: "Medication administration", title: "Administer due medication", priority: "High", dueTime: "Now", repeat: "As per MAR schedule", escalation: "Escalate if medicine unavailable or patient condition changes", remarks: "Medication due from eMAR", contextLabel: "Medicine", contextOptions: ["Meropenem IV", "Noradrenaline infusion", "Mannitol IV", "Pantoprazole IV"] },
  { id: "medication-verify", source: "Medication / eMAR", taskType: "High-risk double verification", title: "Complete high-risk medicine double verification", priority: "Critical", dueTime: "Now", repeat: "Before administration", escalation: "Escalate to head nurse if second verifier unavailable", remarks: "High-risk medicine safety check", contextLabel: "Verification item", contextOptions: ["Vasopressor infusion", "Insulin infusion", "Pediatric antibiotic dose", "Blood product medication"] },
  { id: "vitals-abnormal", source: "Vitals / monitoring", taskType: "Abnormal vitals escalation", title: "Recheck abnormal vitals and escalate if persistent", priority: "Critical", dueTime: "Now", repeat: "Every 15 min until stable", escalation: "Escalate immediately if SpO2 < 92, MAP < 65, GCS drop, or pulse > 130", remarks: "Triggered from abnormal monitoring values", contextLabel: "Abnormal parameter", contextOptions: ["SpO2 low", "BP low", "Pulse high", "GCS drop", "Fever spike"] },
  { id: "vitals-routine", source: "Vitals / monitoring", taskType: "Routine vitals charting", title: "Record scheduled vitals", priority: "Medium", dueTime: "Next 1 hour", repeat: "Hourly", escalation: "Escalate if any parameter crosses threshold", remarks: "Scheduled ICU monitoring", contextLabel: "Vitals set", contextOptions: ["Full vitals", "GCS and neuro vitals", "Pain score", "Blood sugar"] },
  { id: "io-urine", source: "Intake / output", taskType: "Urine output review", title: "Check and document urine output", priority: "High", dueTime: "Next 1 hour", repeat: "Hourly", escalation: "Escalate if urine output < 0.5 ml/kg/hr or sudden drop", remarks: "Fluid balance and renal watch", contextLabel: "I/O item", contextOptions: ["Foley urine output", "External catheter output", "Urinal output", "Low urine review"] },
  { id: "io-drain", source: "Intake / output", taskType: "Drain monitoring", title: "Record drain output and character", priority: "Medium", dueTime: "Next 2 hours", repeat: "Every 2 hours", escalation: "Escalate if sudden increase, fresh blood, or blockage", remarks: "Drain output monitoring", contextLabel: "Drain", contextOptions: ["Chest drain", "Surgical drain", "NG aspirate", "Wound soakage"] },
  { id: "infusion-pump", source: "IV / infusion", taskType: "Infusion pump check", title: "Check infusion pump, line patency, and rate", priority: "High", dueTime: "Next 30 min", repeat: "Hourly", escalation: "Escalate if pump alarm, infiltration, wrong rate, or drug interruption", remarks: "Infusion safety check", contextLabel: "Infusion", contextOptions: ["Noradrenaline infusion", "Maintenance IV fluid", "Antibiotic infusion", "Insulin infusion"] },
  { id: "blood-15min", source: "Blood transfusion", taskType: "Blood transfusion monitoring", title: "Record transfusion vitals and reaction check", priority: "Critical", dueTime: "Next 15 min", repeat: "15 min, 30 min, hourly, completion", escalation: "Stop transfusion and inform doctor if reaction suspected", remarks: "Blood safety monitoring", contextLabel: "Blood component", contextOptions: ["PRBC unit", "FFP unit", "Platelet unit", "Transfusion completion vitals"] },
  { id: "lab-sample", source: "Lab / radiology", taskType: "Lab sample collection", title: "Collect sample and update dispatch status", priority: "Medium", dueTime: "Next 30 min", repeat: "One time", escalation: "Escalate if sample cannot be collected or transport delayed", remarks: "Lab coordination", contextLabel: "Investigation", contextOptions: ["ABG", "CBC", "Electrolytes", "Blood culture", "Troponin"] },
  { id: "radiology-portable", source: "Lab / radiology", taskType: "Radiology coordination", title: "Coordinate portable imaging and report follow-up", priority: "Medium", dueTime: "Next 1 hour", repeat: "One time", escalation: "Escalate if portable team delayed or report critical", remarks: "Radiology coordination", contextLabel: "Imaging", contextOptions: ["Portable chest X-ray", "CT brain", "Ultrasound abdomen", "Echo"] },
  { id: "handover-carry", source: "Shift handover", taskType: "Shift handover task", title: "Carry forward pending handover task", priority: "High", dueTime: "Start of shift", repeat: "Until completed", escalation: "Escalate to head nurse if pending beyond current shift", remarks: "Carried forward from previous nurse", contextLabel: "Handover item", contextOptions: ["Pending medication", "Pending ABG report", "Pending family update", "Pending transfer checklist"] },
  { id: "admission-check", source: "Admission / transfer", taskType: "Admission checklist", title: "Complete ICU admission checklist", priority: "High", dueTime: "Next 30 min", repeat: "One time", escalation: "Escalate if bed/device/doctor assignment incomplete", remarks: "Admission readiness", contextLabel: "Checklist", contextOptions: ["Bedside monitor ready", "Oxygen and suction ready", "Initial vitals", "Allergy and ID band"] },
  { id: "transfer-clearance", source: "Admission / transfer", taskType: "Transfer clearance", title: "Prepare transfer checklist and nursing handover", priority: "Routine", dueTime: "Today", repeat: "One time", escalation: "Escalate if ward bed, transport, pharmacy, or documents pending", remarks: "Transfer readiness", contextLabel: "Transfer item", contextOptions: ["Ward transfer", "Step-down transfer", "OT transfer", "Discharge lounge"] },
  { id: "head-docs", source: "Head nurse supervision", taskType: "Documentation completion", title: "Complete missing nursing documentation", priority: "Medium", dueTime: "Before shift end", repeat: "End of shift", escalation: "Escalate if documentation remains incomplete at handover", remarks: "Head nurse supervision", contextLabel: "Documentation", contextOptions: ["Vitals chart missing", "I/O chart missing", "Medication note missing", "Handover note pending"] },
  { id: "head-workload", source: "Head nurse supervision", taskType: "Workload reassignment", title: "Review workload and reassign unsafe task load", priority: "High", dueTime: "Now", repeat: "As needed", escalation: "Head nurse to reassign or add support nurse", remarks: "Workload safety", contextLabel: "Workload issue", contextOptions: ["Too many critical tasks", "Overdue medication queue", "Multiple ventilated patients", "Break coverage"] },
  { id: "manual-care", source: "Manual nursing care", taskType: "Nursing care", title: "Complete routine nursing care task", priority: "Routine", dueTime: "Next 2 hours", repeat: "Per care plan", escalation: "Escalate if patient refuses or condition prevents care", remarks: "Manual nursing task", contextLabel: "Care item", contextOptions: ["Oral care", "Repositioning", "Back care", "Hygiene care", "Family update"] },
  { id: "manual-device", source: "Manual nursing care", taskType: "Device / line care", title: "Check device, dressing, and line safety", priority: "Medium", dueTime: "Next 2 hours", repeat: "Per shift", escalation: "Escalate if redness, leak, dislodgement, blockage, or infection signs", remarks: "Device and line care", contextLabel: "Device", contextOptions: ["Central line dressing", "Foley catheter care", "ET tube tie check", "NG tube position"] },
];

const deviceRows = [
  { id: "dev-001", bedNo: "ICU-A01", patientName: "Aisha Khan", monitor: "Online", ventilator: "NIV connected", infusionPump: "Online", lastData: "1 min ago", signal: "Good" },
  { id: "dev-002", bedNo: "ICU-A02", patientName: "Rohan Das", monitor: "Online", ventilator: "Invasive connected", infusionPump: "Online", lastData: "40 sec ago", signal: "Good" },
  { id: "dev-003", bedNo: "ICU-B03", patientName: "Meera Sharma", monitor: "Delayed", ventilator: "Oxygen mask", infusionPump: "Offline", lastData: "12 min ago", signal: "Delayed" },
  { id: "dev-004", bedNo: "ICU-B04", patientName: "Kabir Ali", monitor: "Online", ventilator: "Room air", infusionPump: "Not mapped", lastData: "3 min ago", signal: "Review" },
];

function compactDateStamp(date = new Date()) {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function admissionSequence(date = new Date()) {
  return String(date.getTime()).slice(-4).padStart(4, "0");
}

function generateIcuMrn(source: string, date = new Date()) {
  const prefixMap: Record<string, string> = {
    Emergency: "PLH-ER",
    "Emergency direct ICU": "PLH-ERD",
    "General ward": "PLH-IPD",
    "Post-surgical unit": "PLH-OT",
    "HDU step-up": "PLH-HDU",
    "External hospital transfer": "PLH-EXT",
    "Direct ICU admission": "PLH-ICU",
    "Unknown emergency patient": "TEMP-ICU",
  };
  return `${prefixMap[source] ?? "PLH-ICU"}-${compactDateStamp(date)}-${admissionSequence(date)}`;
}

function generateIcuAdmissionNo(date = new Date()) {
  return `ICU-ADM-${compactDateStamp(date)}-${admissionSequence(date)}`;
}

function generatedAdmissionIdentity(source: string) {
  const date = new Date();
  return {
    mrn: generateIcuMrn(source, date),
    icuAdmissionNo: generateIcuAdmissionNo(date),
  };
}

function createEmptyAdmissionDraft(): AdmissionDraft {
  const candidate = admissionPatientCandidates.find((patient) => !patient.duplicateBlock) ?? admissionPatientCandidates[0];
  const source = candidate?.source ?? "Emergency";
  return {
    patientId: candidate?.id ?? "",
    patientName: candidate?.patientName ?? "",
    mrn: candidate?.mrn || generatedAdmissionIdentity(source).mrn,
    icuAdmissionNo: generatedAdmissionIdentity(source).icuAdmissionNo,
    ageGender: candidate?.ageGender ?? "",
    source,
    currentLocation: candidate?.currentLocation ?? "",
    patientStatus: candidate?.patientStatus ?? "ICU request pending",
    sourceDetail: candidate?.sourceDetail ?? "",
    handoverBy: candidate?.handoverBy ?? "",
    diagnosis: candidate?.diagnosis ?? "",
    condition: candidate?.condition ?? "Critical",
    bedNo: candidate?.bedNo ?? "ICU-C05",
    unit: candidate?.unit ?? "Medical ICU",
    nurse: candidate?.nurse ?? "Unit Nurse Priya",
    doctor: candidate?.doctor ?? "Dr. Sameer Mehta",
    admittingTeam: candidate?.admittingTeam ?? getAdmittingTeamDefault(source, candidate?.unit),
    acceptanceStatus: candidate?.acceptanceStatus ?? "Pending ICU doctor acceptance",
    ventilator: candidate?.ventilator ?? "NIV support",
    devices: candidate?.devices ?? "Monitor, infusion pump",
    medication: candidate?.medication ?? "Antibiotics, fluids, vasopressor review",
    risk: candidate?.risk ?? "High",
    isolation: candidate?.isolation ?? "No",
    readiness: admissionReadinessItems.slice(0, 4).join("|"),
    notes: candidate?.notes ?? "",
  };
}

function getAdmissionCandidate(patientId: string) {
  return admissionPatientCandidates.find((patient) => patient.id === patientId);
}

function applyAdmissionCandidate(candidate: AdmissionPatientCandidate): AdmissionDraft {
  return {
    patientId: candidate.id,
    patientName: candidate.patientName,
    mrn: candidate.mrn,
    icuAdmissionNo: generatedAdmissionIdentity(candidate.source).icuAdmissionNo,
    ageGender: candidate.ageGender,
    source: candidate.source,
    currentLocation: candidate.currentLocation,
    patientStatus: candidate.patientStatus,
    sourceDetail: candidate.sourceDetail,
    handoverBy: candidate.handoverBy,
    diagnosis: candidate.diagnosis,
    condition: candidate.condition,
    bedNo: candidate.bedNo,
    unit: candidate.unit,
    nurse: candidate.nurse,
    doctor: candidate.doctor,
    admittingTeam: candidate.admittingTeam,
    acceptanceStatus: candidate.acceptanceStatus,
    ventilator: candidate.ventilator,
    devices: candidate.devices,
    medication: candidate.medication,
    risk: candidate.risk,
    isolation: candidate.isolation,
    readiness: candidate.duplicateBlock ? "" : admissionReadinessItems.slice(0, 4).join("|"),
    notes: candidate.notes,
  };
}

function getAdmissionBed(bedNo: string) {
  return icuAdmissionBedOptions.find((bed) => bed.bedNo === bedNo);
}

function getAdmissionScenario(source: string) {
  return admissionSourceScenarios[source] ?? admissionSourceScenarios.Emergency;
}

function getAdmissionHandoverOptions(source: string, current?: string) {
  return Array.from(new Set([current, ...(admissionHandoverOptions[source] ?? admissionHandoverOptions.Emergency)].filter(Boolean) as string[]));
}

function getAdmittingTeamDefault(source: string, unit?: string) {
  if (source === "Emergency direct ICU" || source === "Emergency") return "ER + ICU rapid admit team";
  if (source === "External hospital transfer") return "External transfer receive team";
  if (unit === "General ICU") return "General ICU admitting team";
  if (unit === "Cardiothoracic ICU") return "Cardiothoracic ICU admitting team";
  if (unit === "Pediatric ICU") return "Pediatric ICU admitting team";
  if (unit === "Neuro ICU") return "Neuro ICU admitting team";
  if (unit === "Surgical ICU") return "Surgical ICU admitting team";
  return "Medical ICU admitting team";
}

function getReadinessValues(readiness: string) {
  return readiness.split("|").map((item) => item.trim()).filter(Boolean);
}

function readinessComplete(readiness: string) {
  const selected = getReadinessValues(readiness);
  return selected.length >= admissionReadinessItems.length;
}

function getAdmissionBlockReason(draft: AdmissionDraft, created: Array<AdmissionDraft & { id: string; status: string }>) {
  const candidate = getAdmissionCandidate(draft.patientId);
  const bed = getAdmissionBed(draft.bedNo);
  const missingRequired = admissionRequiredFields.some((key) => key !== "readiness" && !draft[key]);

  if (candidate?.duplicateBlock || draft.patientStatus === "Already admitted") return "Patient already has an active ICU admission. Use current admission or transfer workflow.";
  if (missingRequired) return "Complete all required ICU admission fields before admitting.";
  if (created.some((record) => record.mrn === draft.mrn)) return "This MRN already has an admission created in this session.";
  if (!bed) return "Select a valid ICU bed.";
  if (bed.status !== "Available" && bed.status !== "Isolation available") return `${bed.bedNo} is ${bed.status.toLowerCase()}. Select an available bed.`;
  if (draft.isolation !== "No" && bed.status !== "Isolation available") return "Isolation precaution selected. Use an isolation-capable bed or update isolation requirement.";
  if (draft.acceptanceStatus !== "Accepted") return "ICU doctor acceptance is pending.";
  if (!readinessComplete(draft.readiness)) return "Complete all ICU readiness checklist items before admitting.";
  return "";
}

function admissionCandidateLabel(patientId: string) {
  const patient = getAdmissionCandidate(patientId);
  if (!patient) return patientId;
  return `${patient.patientName} | ${patient.mrn} | ${patient.currentLocation}`;
}

function admissionBedLabel(bedNo: string) {
  const bed = getAdmissionBed(bedNo);
  if (!bed) return bedNo;
  return `${bed.bedNo} | ${bed.unit} | ${bed.status} | ${bed.capability}`;
}

function admissionBedTone(status?: IcuAdmissionBedOption["status"]): StatusTone {
  if (status === "Available" || status === "Isolation available") return "success";
  if (status === "Cleaning" || status === "Transfer pending" || status === "Reserved") return "warning";
  if (status === "Occupied") return "danger";
  return "muted";
}

function admissionPatientTone(status?: AdmissionPatientState): StatusTone {
  if (status === "Already admitted") return "danger";
  if (status === "Emergency direct ICU") return "critical";
  if (status === "External transfer accepted" || status === "ICU request pending") return "info";
  if (status === "ER stabilization" || status === "Ward deterioration" || status === "Post-op recovery") return "warning";
  return "success";
}

const patientMedicationProfiles: PatientMedicationProfile[] = [
  { patientId: "icu-001", weightKg: 32, allergies: ["Piperacillin/Tazobactam"], renalStatus: "Watch", liverStatus: "Normal", feedingStatus: "NG feeds", ageGroup: "Pediatric" },
  { patientId: "icu-002", weightKg: 76, allergies: ["Heparin"], renalStatus: "Normal", liverStatus: "Watch", feedingStatus: "NPO", ageGroup: "Adult" },
  { patientId: "icu-003", weightKg: 61, allergies: ["Mannitol"], renalStatus: "Dose adjustment", liverStatus: "Normal", feedingStatus: "NG feeds", ageGroup: "Geriatric" },
  { patientId: "icu-004", weightKg: 68, allergies: [], renalStatus: "Normal", liverStatus: "Normal", feedingStatus: "Oral allowed", ageGroup: "Adult" },
];

const pharmacyFormulary: FormularyMedicine[] = [
  {
    id: "med-meropenem",
    name: "Meropenem",
    genericName: "Meropenem",
    departments: ["ICU", "Emergency", "Surgery", "Pediatrics"],
    defaultDose: "1 g",
    route: "IV",
    frequency: "q8h",
    orderType: "Scheduled",
    scheduleTimes: "08:00, 16:00, 00:00",
    indication: "Severe sepsis / hospital-acquired infection",
    instructions: "Restricted antibiotic. Capture indication and review after culture report.",
    pharmacyLocation: "ICU Pharmacy",
    stockQty: 12,
    stockUnit: "vials",
    availability: "Restricted",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: true,
    alternatives: ["Ceftriaxone", "Piperacillin/Tazobactam"],
    safetyFlags: ["Restricted antibiotic", "Culture review required"],
    renalDoseNote: "Review dose if renal function worsens.",
    pediatricDoseNote: "Confirm pediatric weight-based dose.",
  },
  {
    id: "med-noradrenaline",
    name: "Noradrenaline",
    genericName: "Norepinephrine",
    departments: ["ICU", "Emergency", "Anesthesia"],
    defaultDose: "Titrate 0.05 mcg/kg/min",
    route: "Infusion",
    frequency: "Continuous",
    orderType: "Continuous",
    scheduleTimes: "Running",
    indication: "MAP support / shock",
    instructions: "Use infusion pump. Enter MAP target, max rate, and central/peripheral line plan.",
    pharmacyLocation: "ICU High-alert Bin",
    stockQty: 8,
    stockUnit: "ampoules",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Dobutamine", "Adrenaline"],
    safetyFlags: ["High-alert vasopressor", "Pump required", "Double verification"],
  },
  {
    id: "med-insulin-regular",
    name: "Insulin regular",
    genericName: "Human regular insulin",
    departments: ["ICU", "Emergency", "Pediatrics", "Surgery"],
    defaultDose: "Sliding scale",
    route: "SC",
    frequency: "Before meals",
    orderType: "Scheduled",
    scheduleTimes: "12:00, 18:00",
    indication: "Hyperglycemia protocol",
    instructions: "Check blood sugar before administration. Double verify dose.",
    pharmacyLocation: "ICU Refrigerator",
    stockQty: 22,
    stockUnit: "vials",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Insulin infusion protocol"],
    safetyFlags: ["High-alert insulin", "Blood sugar mandatory", "Double verification"],
    pediatricDoseNote: "Use pediatric sliding scale for weight under 40 kg.",
  },
  {
    id: "med-paracetamol",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    departments: ["ICU", "Emergency", "Pediatrics", "Surgery"],
    defaultDose: "650 mg",
    route: "Oral/NG",
    frequency: "SOS fever",
    orderType: "PRN",
    scheduleTimes: "PRN",
    indication: "Fever or pain",
    instructions: "Document temperature or pain score. Keep daily max dose in note.",
    pharmacyLocation: "Main Pharmacy",
    stockQty: 140,
    stockUnit: "tablets",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["IV Paracetamol"],
    safetyFlags: ["PRN indication mandatory"],
    npoWarning: "Patient is NPO; consider IV route.",
  },
  {
    id: "med-pantoprazole",
    name: "Pantoprazole",
    genericName: "Pantoprazole",
    departments: ["ICU", "Surgery", "Emergency"],
    defaultDose: "40 mg",
    route: "IV",
    frequency: "OD",
    orderType: "Scheduled",
    scheduleTimes: "09:00",
    indication: "Stress ulcer prophylaxis",
    instructions: "Administer once daily before feeds.",
    pharmacyLocation: "ICU Pharmacy",
    stockQty: 55,
    stockUnit: "vials",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Omeprazole"],
    safetyFlags: ["Routine prophylaxis"],
  },
  {
    id: "med-mannitol",
    name: "Mannitol",
    genericName: "Mannitol",
    departments: ["ICU", "Neurology", "Emergency"],
    defaultDose: "100 ml",
    route: "IV",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: "11:00, 23:00",
    indication: "Raised ICP watch",
    instructions: "Check urine output and serum osmolality before dose.",
    pharmacyLocation: "Neuro ICU Pharmacy",
    stockQty: 0,
    stockUnit: "bottles",
    availability: "Out of stock",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Hypertonic saline"],
    safetyFlags: ["Osmolality review", "Urine output check"],
    renalDoseNote: "Avoid or review urgently in renal impairment.",
  },
  {
    id: "med-heparin",
    name: "Heparin",
    genericName: "Unfractionated heparin",
    departments: ["ICU", "Cardiology", "Surgery"],
    defaultDose: "5000 units",
    route: "SC",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: "10:00, 22:00",
    indication: "DVT prophylaxis",
    instructions: "Check platelet count, bleeding risk, and allergy before first dose.",
    pharmacyLocation: "Cardiothoracic ICU Pharmacy",
    stockQty: 18,
    stockUnit: "vials",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Enoxaparin"],
    safetyFlags: ["High-alert anticoagulant", "Platelet count review"],
  },
  {
    id: "med-levetiracetam",
    name: "Levetiracetam",
    genericName: "Levetiracetam",
    departments: ["ICU", "Neurology", "Emergency", "Pediatrics"],
    defaultDose: "500 mg",
    route: "IV",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: "09:00, 21:00",
    indication: "Seizure prophylaxis",
    instructions: "Review renal dosing and seizure chart.",
    pharmacyLocation: "Neuro ICU Pharmacy",
    stockQty: 6,
    stockUnit: "vials",
    availability: "Low stock",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Phenytoin"],
    safetyFlags: ["Low stock", "Renal dose review"],
    renalDoseNote: "Dose adjustment required in renal impairment.",
  },
  {
    id: "med-potassium-chloride",
    name: "Potassium chloride concentrate",
    genericName: "Potassium chloride",
    departments: ["ICU", "Emergency", "Cardiology", "Anesthesia"],
    defaultDose: "20 mEq diluted",
    route: "Infusion",
    frequency: "As per potassium protocol",
    orderType: "Scheduled",
    scheduleTimes: "Now",
    indication: "Hypokalemia correction",
    instructions: "Never administer undiluted. Pump and double verification required.",
    pharmacyLocation: "High-alert Locked Cabinet",
    stockQty: 5,
    stockUnit: "ampoules",
    availability: "Restricted",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: true,
    alternatives: ["Oral potassium"],
    safetyFlags: ["High-alert electrolyte", "Dilution mandatory", "Pump required"],
    renalDoseNote: "Review dose if urine output is low or renal impairment exists.",
  },
  {
    id: "med-propofol",
    name: "Propofol",
    genericName: "Propofol",
    departments: ["ICU", "Anesthesia", "Surgery"],
    defaultDose: "Titrate 5-50 mcg/kg/min",
    route: "Infusion",
    frequency: "Continuous",
    orderType: "Continuous",
    scheduleTimes: "Running",
    indication: "Sedation",
    instructions: "Record sedation target, triglyceride monitoring, and airway plan.",
    pharmacyLocation: "Anesthesia Drug Trolley",
    stockQty: 7,
    stockUnit: "vials",
    availability: "Available",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: false,
    alternatives: ["Midazolam"],
    safetyFlags: ["Sedation infusion", "Airway monitoring"],
  },
  {
    id: "med-midazolam",
    name: "Midazolam",
    genericName: "Midazolam",
    departments: ["ICU", "Emergency", "Anesthesia", "Pediatrics"],
    defaultDose: "1 mg",
    route: "IV",
    frequency: "PRN agitation",
    orderType: "PRN",
    scheduleTimes: "PRN",
    indication: "Agitation / procedural sedation",
    instructions: "Document sedation score and respiratory monitoring.",
    pharmacyLocation: "Controlled Drug Cabinet",
    stockQty: 3,
    stockUnit: "ampoules",
    availability: "Low stock",
    highRisk: true,
    doubleVerificationRequired: true,
    restricted: true,
    alternatives: ["Dexmedetomidine"],
    safetyFlags: ["Controlled drug", "Respiratory monitoring", "Low stock"],
  },
  {
    id: "med-furosemide",
    name: "Furosemide",
    genericName: "Furosemide",
    departments: ["ICU", "Cardiology", "Emergency"],
    defaultDose: "20 mg",
    route: "IV",
    frequency: "OD",
    orderType: "Scheduled",
    scheduleTimes: "10:00",
    indication: "Fluid overload",
    instructions: "Review BP, potassium, and urine output before dose.",
    pharmacyLocation: "ICU Pharmacy",
    stockQty: 28,
    stockUnit: "ampoules",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Torsemide"],
    safetyFlags: ["Electrolyte review"],
    renalDoseNote: "Monitor response and electrolytes in renal dysfunction.",
  },
  {
    id: "med-ceftriaxone",
    name: "Ceftriaxone",
    genericName: "Ceftriaxone",
    departments: ["Emergency", "Surgery", "Pediatrics", "ICU"],
    defaultDose: "1 g",
    route: "IV",
    frequency: "BD",
    orderType: "Scheduled",
    scheduleTimes: "08:00, 20:00",
    indication: "Bacterial infection",
    instructions: "Review culture and allergy history before first dose.",
    pharmacyLocation: "Main Pharmacy",
    stockQty: 34,
    stockUnit: "vials",
    availability: "Available",
    highRisk: false,
    doubleVerificationRequired: false,
    restricted: false,
    alternatives: ["Meropenem"],
    safetyFlags: ["Antibiotic review"],
    pediatricDoseNote: "Use pediatric dose by weight.",
  },
];

const initialDoctorMedicationOrders: DoctorMedicationOrder[] = [
  {
    id: "ord-001",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Meropenem",
    dose: "1 g",
    route: "IV",
    frequency: "q8h",
    orderType: "Scheduled",
    scheduleTimes: ["08:00", "16:00", "00:00"],
    doctor: "Dr. Sameer Mehta",
    indication: "Septic shock",
    instructions: "Give after identity check. Escalate if dose is delayed beyond 30 minutes.",
    priority: "High",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Pending dispense",
    status: "Active",
  },
  {
    id: "ord-002",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Noradrenaline",
    dose: "Titrate 0.05 mcg/kg/min",
    route: "Infusion",
    frequency: "Continuous",
    orderType: "Continuous",
    scheduleTimes: ["Running"],
    doctor: "Dr. Sameer Mehta",
    indication: "MAP support",
    instructions: "Titrate as per MAP target. Pump and double verification required.",
    priority: "STAT",
    highRisk: true,
    doubleVerificationRequired: true,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-003",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Insulin regular",
    dose: "Sliding scale",
    route: "SC",
    frequency: "Before meals",
    orderType: "Scheduled",
    scheduleTimes: ["12:00", "18:00"],
    doctor: "Dr. Aman Verma",
    indication: "Hyperglycemia protocol",
    instructions: "Check blood sugar before administration. Double verify dose.",
    priority: "High",
    highRisk: true,
    doubleVerificationRequired: true,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-004",
    patientId: "icu-001",
    bedNo: "ICU-A01",
    medication: "Paracetamol",
    dose: "650 mg",
    route: "Oral/NG",
    frequency: "SOS fever",
    orderType: "PRN",
    scheduleTimes: ["PRN"],
    doctor: "Dr. Sameer Mehta",
    indication: "Fever or pain",
    instructions: "Give if temp > 38 C or pain score > 5. Capture reason.",
    priority: "Routine",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-005",
    patientId: "icu-002",
    bedNo: "ICU-A02",
    medication: "Pantoprazole",
    dose: "40 mg",
    route: "IV",
    frequency: "OD",
    orderType: "Scheduled",
    scheduleTimes: ["09:00"],
    doctor: "Dr. Neha Malik",
    indication: "Stress ulcer prophylaxis",
    instructions: "Administer once daily before feeds.",
    priority: "Routine",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Available",
    status: "Active",
  },
  {
    id: "ord-006",
    patientId: "icu-003",
    bedNo: "ICU-B03",
    medication: "Mannitol",
    dose: "100 ml",
    route: "IV",
    frequency: "q12h",
    orderType: "Scheduled",
    scheduleTimes: ["11:00", "23:00"],
    doctor: "Dr. Imran Shah",
    indication: "Raised ICP watch",
    instructions: "Check urine output and serum osmolality before dose.",
    priority: "High",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Shortage",
    status: "Active",
  },
];

const orderTypeOptions: Array<"All types" | MedicationOrderType> = ["All types", "Scheduled", "STAT", "PRN", "Continuous", "One-time"];
const pharmacyOptions: Array<"All pharmacy" | PharmacyStatus> = ["All pharmacy", "Available", "Pending dispense", "Low stock", "Out of stock", "Restricted", "Shortage", "Substitution requested"];

function deriveDoseStatus(order: DoctorMedicationOrder, scheduledTime: string, index: number): WorkflowMedicationStatus {
  if (order.status === "Held by doctor") return "Held";
  if (order.status === "Discontinued") return "Stopped";
  if (order.orderType === "Continuous") return "Running";
  if (order.orderType === "PRN") return "Upcoming";
  if (order.orderType === "STAT") return index === 0 ? "Due" : "Upcoming";
  if (scheduledTime === "08:00" || scheduledTime === "09:00") return index % 2 === 0 ? "Late" : "Administered";
  if (scheduledTime === "00:00" || scheduledTime === "23:00") return "Upcoming";
  return "Due";
}

function buildMedicationDoseRows(orders: DoctorMedicationOrder[]): MedicationDoseRow[] {
  return orders.flatMap((order) => {
    const times = order.scheduleTimes.length ? order.scheduleTimes : ["Now"];
    return times.map((time, index) => {
      const status = deriveDoseStatus(order, time, index);
      const scheduledDate = time === "00:00" ? "2026-06-09" : "2026-06-08";
      return {
        id: `${order.id}-dose-${index + 1}`,
        orderId: order.id,
        patientId: order.patientId,
        bedNo: order.bedNo,
        medication: order.medication,
        dose: order.dose,
        route: order.route,
        frequency: order.frequency,
        scheduledTime: time,
        scheduledDate,
        shift: medicationShiftForTime(time),
        actualTime: status === "Administered" ? time : "-",
        status,
        administeredBy: status === "Administered" ? "Ward Nurse Arjun" : "-",
        reason: order.indication,
        orderType: order.orderType,
        doctor: order.doctor,
        indication: order.indication,
        instructions: order.instructions,
        highRisk: order.highRisk,
        doubleVerification: order.doubleVerificationRequired ? "Pending" : "Not required",
        pharmacyStatus: order.pharmacyStatus,
        orderStatus: order.status,
        auditTrail: [`Order created by ${order.doctor}`, `${time}: ${status}`],
      };
    });
  });
}

function medicationShiftForTime(time: string): MedicationDoseRow["shift"] {
  const hour = Number.parseInt(time.slice(0, 2), 10);
  if (Number.isNaN(hour)) return "Morning";
  if (hour >= 6 && hour < 14) return "Morning";
  if (hour >= 14 && hour < 22) return "Evening";
  return "Night";
}

export function PatientBoardWorkspace(props: { patients: IcuPatient[]; compact?: boolean }) {
  return (
    <React.Suspense fallback={<PatientBoardLoading compact={props.compact} />}>
      <PatientBoardWorkspaceInner {...props} />
    </React.Suspense>
  );
}

function PatientBoardWorkspaceInner({ patients, compact }: { patients: IcuPatient[]; compact?: boolean }) {
  const searchParams = useSearchParams();
  const requestedPatientId = searchParams.get("patient");
  const requestedView = searchParams.get("view");
  const [query, setQuery] = React.useState("");
  const [risk, setRisk] = React.useState("All risk");
  const [nurse, setNurse] = React.useState("All nurses");
  const [view, setView] = React.useState<"Board" | "Smart Bed">(requestedView === "smart-bed" ? "Smart Bed" : "Board");
  const [selectedId, setSelectedId] = React.useState(requestedPatientId ?? patients[0]?.id ?? icuPatients[0]?.id ?? "");

  const visiblePatients = React.useMemo(() => {
    return patients.filter((patient) => {
      const searchable = `${patient.patientName} ${patient.mrn} ${patient.bedNo} ${patient.diagnosis} ${patient.assignedWardNurse}`.toLowerCase();
      const matchesRisk =
        risk === "All risk"
        || (risk === "Critical score" && patient.criticalityScore >= 8)
        || (risk === "Ventilator" && patient.ventilatorStatus !== "Room air")
        || (risk === "Pending tasks" && patient.pendingTasks > 0)
        || patient.currentStatus === risk;
      const matchesNurse = nurse === "All nurses" || patient.assignedWardNurse === nurse || patient.assignedUnitNurse === nurse;
      return searchable.includes(query.toLowerCase()) && matchesRisk && matchesNurse;
    });
  }, [nurse, patients, query, risk]);

  const selectedPatient = visiblePatients.find((patient) => patient.id === selectedId) ?? visiblePatients[0] ?? patients[0];

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>ICU Patient Board</CardTitle>
            <CardDescription>Bed-wise census with alert and task pressure.</CardDescription>
          </div>
          <Badge tone="info">{visiblePatients.length} active</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {visiblePatients.slice(0, 4).map((patient) => (
            <PatientMiniCard key={patient.id} patient={patient} active={patient.id === selectedPatient?.id} onSelect={() => setSelectedId(patient.id)} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 xl:grid-cols-[1fr_170px_180px_180px] xl:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Patient search</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Name, MRN, bed, diagnosis..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </label>
          <NativeSelect label="Risk filter" value={risk} onChange={setRisk} options={["All risk", "Critical score", "Ventilator", "Pending tasks", "Critical", "Ready for transfer"]} />
          <NativeSelect label="Nurse filter" value={nurse} onChange={setNurse} options={["All nurses", ...allNurses]} />
          <div className="grid grid-cols-2 gap-2">
            {(["Board", "Smart Bed"] as const).map((item) => (
              <Button key={item} variant={view === item ? "default" : "outline"} onClick={() => setView(item)}>
                {item === "Board" ? <BedDouble className="h-4 w-4" /> : <MonitorDot className="h-4 w-4" />}
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Bed Board</CardTitle>
              <CardDescription>Search, filter, select, and open patient cockpit.</CardDescription>
            </div>
            <Badge tone="info">{visiblePatients.length} beds</Badge>
          </CardHeader>
          <CardContent className="grid gap-3">
            {visiblePatients.map((patient) => (
              <PatientMiniCard key={patient.id} patient={patient} active={patient.id === selectedPatient?.id} onSelect={() => setSelectedId(patient.id)} />
            ))}
            {!visiblePatients.length ? <EmptyPanel title="No patient matched" detail="Change search or filters." /> : null}
          </CardContent>
        </Card>

        {view === "Board" ? <PatientActionWorkspace patient={selectedPatient} /> : <SmartBedView patient={selectedPatient} />}
      </div>
    </div>
  );
}

function PatientBoardLoading({ compact }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>ICU Patient Board</CardTitle>
          <CardDescription>Loading selected patient context...</CardDescription>
        </div>
      </CardHeader>
      <CardContent className={compact ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {[0, 1, 2].map((item) => (
          <div className="h-24 animate-pulse rounded-md border border-border bg-surface-muted" key={item} />
        ))}
      </CardContent>
    </Card>
  );
}

export function AdmissionWizardWorkspace() {
  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<AdmissionDraft>(() => createEmptyAdmissionDraft());
  const [created, setCreated] = React.useState<Array<AdmissionDraft & { id: string; status: string }>>([]);
  const [patientQuery, setPatientQuery] = React.useState("");

  const updateDraft = (key: keyof AdmissionDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const updateAdmissionPatient = (patientId: string) => {
    const candidate = getAdmissionCandidate(patientId);
    if (!candidate) return;
    setDraft(applyAdmissionCandidate(candidate));
  };
  const updateAdmissionSource = (source: string) => {
    setDraft((current) => ({
      ...current,
      source,
      icuAdmissionNo: current.icuAdmissionNo || generatedAdmissionIdentity(source).icuAdmissionNo,
      sourceDetail: current.source === source ? current.sourceDetail : "",
      handoverBy: current.source === source ? current.handoverBy : getAdmissionHandoverOptions(source)[0],
      admittingTeam: getAdmittingTeamDefault(source, current.unit),
    }));
  };
  const updateAdmissionUnit = (unit: string) => {
    setDraft((current) => ({
      ...current,
      unit,
      admittingTeam: getAdmittingTeamDefault(current.source, unit),
    }));
  };
  const resetDraft = () => {
    setDraft(createEmptyAdmissionDraft());
    setPatientQuery("");
  };
  const toggleReadiness = (item: string) => {
    setDraft((current) => {
      const selected = getReadinessValues(current.readiness);
      const next = selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item];
      return { ...current, readiness: next.join("|") };
    });
  };
  const filteredPatientCandidates = React.useMemo(() => {
    const query = patientQuery.trim().toLowerCase();
    const rows = admissionPatientCandidates.filter((patient) => {
      const text = `${patient.patientName} ${patient.mrn} ${patient.currentLocation} ${patient.patientStatus} ${patient.source} ${patient.diagnosis}`.toLowerCase();
      return !query || text.includes(query);
    });
    return rows.some((patient) => patient.id === draft.patientId)
      ? rows
      : [getAdmissionCandidate(draft.patientId), ...rows].filter(Boolean) as AdmissionPatientCandidate[];
  }, [draft.patientId, patientQuery]);
  const selectedCandidate = getAdmissionCandidate(draft.patientId);
  const selectedBed = getAdmissionBed(draft.bedNo);
  const selectedReadiness = getReadinessValues(draft.readiness);
  const admissionBlockReason = getAdmissionBlockReason(draft, created);
  const completenessBase = admissionRequiredFields.filter((key) => key !== "readiness").filter((key) => Boolean(draft[key])).length;
  const completeness = Math.round(((completenessBase + (readinessComplete(draft.readiness) ? 1 : 0)) / admissionRequiredFields.length) * 100);

  const saveAdmission = () => {
    if (admissionBlockReason) {
      toast.error(admissionBlockReason);
      return;
    }
    const record = { ...draft, id: `icu-adm-${created.length + 1}`, status: "Bed assigned" };
    setCreated((current) => [record, ...current]);
    toast.success(`${draft.patientName || "ICU patient"} admission wizard completed`);
    setStep(0);
    resetDraft();
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>ICU Admission Wizard</CardTitle>
            <CardDescription>Patient, condition, bed, device, medication, and risk capture.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {admissionSteps.map((item, index) => (
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-border p-3 text-left transition hover:bg-surface-muted",
                index === step ? "border-primary bg-primary/5" : "bg-background",
              )}
              key={item}
              type="button"
              onClick={() => setStep(index)}
            >
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold", index <= step ? "bg-primary text-primary-foreground" : "bg-surface-muted text-muted-foreground")}>
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold text-foreground">{item}</span>
                <span className="block text-xs text-muted-foreground">{index < step ? "Complete" : index === step ? "Active" : "Pending"}</span>
              </span>
            </button>
          ))}
          <MetricTile label="Completion" value={`${completeness}%`} tone={completeness > 80 ? "success" : "warning"} icon={ClipboardCheck} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{admissionSteps[step]}</CardTitle>
            <CardDescription>Step {step + 1} of {admissionSteps.length}</CardDescription>
          </div>
          <Badge tone={toneForStatus(step === admissionSteps.length - 1 ? "Ready" : "In progress")}>{step === admissionSteps.length - 1 ? "Review" : "In progress"}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <FormGrid>
              <TextField label="Search patient / MRN / location" value={patientQuery} onChange={setPatientQuery} placeholder="Search admitted, ER, ward, OT, external transfer..." wide />
              <SelectField label="Patient / MRN" value={draft.patientId} onChange={updateAdmissionPatient} options={filteredPatientCandidates.map((patient) => patient.id)} renderOption={admissionCandidateLabel} wide />
              <SelectField label="Admission source" value={draft.source} onChange={updateAdmissionSource} options={admissionSourceOptions} />
              <ReadOnlyField label="Patient name" value={draft.patientName} />
              <ReadOnlyField label="MRN / UHID" value={draft.mrn} />
              <ReadOnlyField label="ICU Admission No" value={draft.icuAdmissionNo} />
              <ReadOnlyField label="Age / gender" value={draft.ageGender} />
              <ReadOnlyField label="Current location" value={draft.currentLocation} />
              <ReadOnlyField label="Current status" value={draft.patientStatus} />
              <AdmissionCandidatePanel candidate={selectedCandidate} blockReason={admissionBlockReason} />
            </FormGrid>
          ) : null}

          {step === 1 ? (
            <FormGrid>
              <TextField label="Diagnosis" value={draft.diagnosis} onChange={(value) => updateDraft("diagnosis", value)} placeholder="Primary ICU diagnosis" />
              <SelectField label="Clinical condition" value={draft.condition} onChange={(value) => updateDraft("condition", value)} options={["Critical", "Ventilated", "Stable ICU care", "Ready for transfer"]} />
              <TextField label={getAdmissionScenario(draft.source).detailLabel} value={draft.sourceDetail} onChange={(value) => updateDraft("sourceDetail", value)} placeholder="Admission source context..." wide />
              <SelectField label={getAdmissionScenario(draft.source).handoverLabel} value={draft.handoverBy} onChange={(value) => updateDraft("handoverBy", value)} options={getAdmissionHandoverOptions(draft.source, draft.handoverBy)} />
              <SelectField label="Risk level" value={draft.risk} onChange={(value) => updateDraft("risk", value)} options={["Critical", "High", "Medium", "Routine"]} />
              <SelectField label="Isolation required" value={draft.isolation} onChange={(value) => updateDraft("isolation", value)} options={["No", "Yes", "Contact precaution", "Airborne precaution"]} />
              <AdmissionSourceScenarioPanel source={draft.source} />
            </FormGrid>
          ) : null}

          {step === 2 ? (
            <FormGrid>
              <SelectField label="ICU unit" value={draft.unit} onChange={updateAdmissionUnit} options={["General ICU", "Medical ICU", "Cardiothoracic ICU", "Pediatric ICU", "Neuro ICU", "Surgical ICU"]} />
              <SelectField label="Bed number" value={draft.bedNo} onChange={(value) => updateDraft("bedNo", value)} options={icuAdmissionBedOptions.map((bed) => bed.bedNo)} renderOption={admissionBedLabel} />
              <SelectField label="Ventilator / oxygen" value={draft.ventilator} onChange={(value) => updateDraft("ventilator", value)} options={["Room air", "Oxygen mask", "NIV support", "Invasive ventilation", "Weaning trial"]} />
              <TextField label="Devices" value={draft.devices} onChange={(value) => updateDraft("devices", value)} placeholder="Monitor, pump, ventilator..." />
              <SelectField label="Unit nurse" value={draft.nurse} onChange={(value) => updateDraft("nurse", value)} options={["Unit Nurse Priya", "Unit Nurse Meera", "Unit Nurse Sana"]} />
              <SelectField label="Admitting doctor" value={draft.doctor} onChange={(value) => updateDraft("doctor", value)} options={["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma"]} />
              <SelectField label="Admitting team" value={draft.admittingTeam} onChange={(value) => updateDraft("admittingTeam", value)} options={admittingTeamOptions} />
              <SelectField label="ICU doctor acceptance" value={draft.acceptanceStatus} onChange={(value) => updateDraft("acceptanceStatus", value)} options={["Accepted", "Pending ICU doctor acceptance", "Rejected - bed not appropriate", "Hold - billing/consent"]} />
              <AdmissionBedPanel bed={selectedBed} />
              <AdmissionReadinessChecklist selected={selectedReadiness} onToggle={toggleReadiness} />
            </FormGrid>
          ) : null}

          {step === 3 ? (
            <FormGrid>
              <TextField label="Current medications" value={draft.medication} onChange={(value) => updateDraft("medication", value)} placeholder="Antibiotic, infusion, emergency meds..." wide />
              <TextAreaField label="Initial nursing note" value={draft.notes} onChange={(value) => updateDraft("notes", value)} placeholder="Arrival condition, device status, immediate tasks..." />
            </FormGrid>
          ) : null}

          {step === 4 ? <AdmissionReview draft={draft} blockReason={admissionBlockReason} bed={selectedBed} /> : null}

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={resetDraft}>Reset</Button>
              {step < admissionSteps.length - 1 ? (
                <Button onClick={() => setStep((current) => Math.min(admissionSteps.length - 1, current + 1))}>Next <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <Button disabled={Boolean(admissionBlockReason)} onClick={saveAdmission}><Check className="h-4 w-4" />Admit patient</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {created.length ? (
        <Card className="xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Created Admissions</CardTitle>
              <CardDescription>Frontend workflow records created in this session.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {created.map((record) => (
              <div className="rounded-md border border-border bg-background p-3" key={record.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{record.patientName || "Unnamed patient"}</p>
                    <p className="text-xs text-muted-foreground">{record.mrn} | {record.icuAdmissionNo}</p>
                    <p className="text-xs text-muted-foreground">{record.bedNo} | {record.unit} | {record.source}</p>
                    <p className="text-xs text-muted-foreground">{record.admittingTeam}</p>
                  </div>
                  <StatusPill tone="success">{record.status}</StatusPill>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

const shiftHandoverPairs: Record<string, { outgoingNurse: string; incomingNurse: string }> = {
  "Morning to Evening": { outgoingNurse: "Ward Nurse Kavita", incomingNurse: "Ward Nurse Arjun" },
  "Evening to Night": { outgoingNurse: "Ward Nurse Arjun", incomingNurse: "Night Nurse Leena" },
  "Night to Morning": { outgoingNurse: "Night Nurse Leena", incomingNurse: "Ward Nurse Kavita" },
  "Emergency handover": { outgoingNurse: "Unit Nurse Priya", incomingNurse: "Ward Nurse Neha" },
};

type ShiftSummaryDraft = {
  shift: string;
  outgoingNurse: string;
  incomingNurse: string;
  issues: string;
  pendingTests: string;
  pendingMeds: string;
  risks: string;
  todos: string;
};

export function ShiftHandoverWorkspace() {
  const [patientId, setPatientId] = React.useState(icuPatients[0]?.id ?? "");
  const nurseOptions = ["Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Nurse Neha", "Night Nurse Leena", "Unit Nurse Priya", "Unit Nurse Meera", "Head Nurse Sana"];
  const defaultHandoverForm = {
    shift: "Morning to Evening",
    outgoingNurse: shiftHandoverPairs["Morning to Evening"].outgoingNurse,
    incomingNurse: shiftHandoverPairs["Morning to Evening"].incomingNurse,
    issues: "",
    pendingTests: "",
    pendingMeds: "",
    risks: "",
    todos: "",
  };
  const [handoverRows, setHandoverRows] = React.useState([
    { id: "ho-001", patientId: "icu-001", shift: "Morning to Evening", outgoingNurse: "Ward Nurse Kavita", incomingNurse: "Ward Nurse Arjun", issues: "Low BP improving, sepsis watch", pendingTests: "ABG repeat", pendingMeds: "Meropenem", risks: "MAP < 65", todos: "Vitals every 15 min", status: "Draft" },
    { id: "ho-002", patientId: "icu-002", shift: "Night to Morning", outgoingNurse: "Night Nurse Leena", incomingNurse: "Ward Nurse Kavita", issues: "Post CABG ventilator", pendingTests: "ABG result", pendingMeds: "Noradrenaline running", risks: "Transfusion reaction", todos: "15-min transfusion vitals", status: "Acknowledged" },
  ]);
  const [form, setForm] = React.useState(defaultHandoverForm);
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const [summaryDraft, setSummaryDraft] = React.useState<ShiftSummaryDraft>(defaultHandoverForm);

  const selectedPatient = icuPatients.find((patient) => patient.id === patientId) ?? icuPatients[0];
  const shiftSummary = React.useMemo(() => buildWholeShiftSummary(selectedPatient, form.outgoingNurse, form.shift), [form.outgoingNurse, form.shift, selectedPatient]);
  const completion = Math.round((Object.values(form).filter(Boolean).length / Object.keys(form).length) * 100);

  const updateShift = (shift: string) => {
    const pair = shiftHandoverPairs[shift] ?? shiftHandoverPairs["Morning to Evening"];
    setForm((current) => ({ ...current, shift, outgoingNurse: pair.outgoingNurse, incomingNurse: pair.incomingNurse }));
  };

  const openShiftSummary = () => {
    setSummaryDraft({
      shift: form.shift,
      outgoingNurse: form.outgoingNurse,
      incomingNurse: form.incomingNurse,
      issues: form.issues || shiftSummary.suggested.issues,
      pendingTests: form.pendingTests || shiftSummary.suggested.pendingTests,
      pendingMeds: form.pendingMeds || shiftSummary.suggested.pendingMeds,
      risks: form.risks || shiftSummary.suggested.risks,
      todos: form.todos || shiftSummary.suggested.todos,
    });
    setSummaryOpen(true);
  };

  const applyShiftSummary = () => {
    setForm((current) => ({
      ...current,
      issues: summaryDraft.issues,
      pendingTests: summaryDraft.pendingTests,
      pendingMeds: summaryDraft.pendingMeds,
      risks: summaryDraft.risks,
      todos: summaryDraft.todos,
    }));
    setSummaryOpen(false);
    toast.success("Whole shift summary added to handover");
  };

  const createHandover = () => {
    if (form.outgoingNurse === form.incomingNurse) {
      toast.error("Outgoing aur incoming nurse same nahi ho sakte");
      return;
    }
    setHandoverRows((rows) => [
      { id: `ho-${rows.length + 1}`, patientId, ...form, status: "Draft" },
      ...rows,
    ]);
    toast.success(`${form.outgoingNurse} to ${form.incomingNurse} handover drafted`);
    setForm(defaultHandoverForm);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Structured Shift Handover</CardTitle>
            <CardDescription>Active issues, pending tests, medication, escalation risks, and to-do list.</CardDescription>
          </div>
          <Badge tone={completion > 70 ? "success" : "warning"}>{completion}% complete</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormGrid>
            <SelectField label="Patient / bed" value={patientId} onChange={setPatientId} options={icuPatients.map((patient) => patient.id)} renderOption={(id) => {
              const patient = icuPatients.find((item) => item.id === id);
              return patient ? `${patient.bedNo} - ${patient.patientName}` : id;
            }} />
            <SelectField label="Shift" value={form.shift} onChange={updateShift} options={["Morning to Evening", "Evening to Night", "Night to Morning", "Emergency handover"]} />
            <div className="space-y-2">
              <SelectField label="Outgoing nurse" value={form.outgoingNurse} onChange={(value) => setForm((current) => ({ ...current, outgoingNurse: value }))} options={nurseOptions} />
              <Button className="mt-3 h-10 w-full justify-start border-sky-600 bg-sky-600 px-3 text-sm text-white hover:bg-sky-700 hover:text-white" variant="outline" onClick={openShiftSummary}>
                <FileText className="h-4 w-4" />Whole Shift Summary
              </Button>
            </div>
            <SelectField label="Incoming nurse" value={form.incomingNurse} onChange={(value) => setForm((current) => ({ ...current, incomingNurse: value }))} options={nurseOptions} />
            <TextAreaField label="Active issues" value={form.issues} onChange={(value) => setForm((current) => ({ ...current, issues: value }))} placeholder="Current clinical issues..." />
            <TextAreaField label="Pending tests" value={form.pendingTests} onChange={(value) => setForm((current) => ({ ...current, pendingTests: value }))} placeholder="Labs, radiology, reports..." />
            <TextAreaField label="Pending medication" value={form.pendingMeds} onChange={(value) => setForm((current) => ({ ...current, pendingMeds: value }))} placeholder="Due, late, held meds..." />
            <TextAreaField label="Escalation risks" value={form.risks} onChange={(value) => setForm((current) => ({ ...current, risks: value }))} placeholder="Vitals/lab/device risks..." />
            <TextAreaField label="To-do list" value={form.todos} onChange={(value) => setForm((current) => ({ ...current, todos: value }))} placeholder="Next shift actions..." />
          </FormGrid>
          <HandoverNurseRoute outgoingNurse={form.outgoingNurse} incomingNurse={form.incomingNurse} shift={form.shift} />
          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setForm(defaultHandoverForm)}>Reset</Button>
            <Button onClick={createHandover}><ClipboardCheck className="h-4 w-4" />Generate handover</Button>
          </div>
        </CardContent>
      </Card>

      <WholeShiftSummaryDialog
        draft={summaryDraft}
        open={summaryOpen}
        summary={shiftSummary}
        onApply={applyShiftSummary}
        onChange={setSummaryDraft}
        onOpenChange={setSummaryOpen}
      />

      <div className="space-y-4">
        <PatientSnapshot patient={selectedPatient} />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Open Handovers</CardTitle>
              <CardDescription>Outgoing and incoming acknowledgement queue.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {handoverRows.map((row) => {
              const patient = icuPatients.find((item) => item.id === row.patientId);
              return (
                <div className="rounded-md border border-border bg-background p-3" key={row.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{patient?.bedNo} - {patient?.patientName}</p>
                      <p className="text-xs text-muted-foreground">{row.shift}</p>
                    </div>
                    <StatusPill tone={toneForStatus(row.status)}>{row.status}</StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-xs">
                    <span className="font-semibold text-foreground">{row.outgoingNurse}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{row.incomingNurse}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{row.issues || row.todos}</p>
                  <Button className="mt-3 w-full" size="sm" variant={row.status === "Acknowledged" ? "outline" : "default"} onClick={() => {
                    setHandoverRows((rows) => rows.map((item) => item.id === row.id ? { ...item, status: "Acknowledged" } : item));
                    toast.success(`${row.incomingNurse} acknowledged handover from ${row.outgoingNurse}`);
                  }}>
                    <CheckCircle2 className="h-4 w-4" />Acknowledge
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HandoverNurseRoute({ outgoingNurse, incomingNurse, shift }: { outgoingNurse: string; incomingNurse: string; shift: string }) {
  return (
    <div className="rounded-md border border-info/30 bg-info/5 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">Nurse handover route</p>
          <p className="mt-1 text-sm text-muted-foreground">{shift} acknowledgement path</p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <span className="max-w-[190px] truncate text-sm font-semibold text-foreground">{outgoingNurse}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-info" />
          <span className="max-w-[190px] truncate text-sm font-semibold text-foreground">{incomingNurse}</span>
        </div>
      </div>
    </div>
  );
}

function WholeShiftSummaryDialog({
  draft,
  open,
  summary,
  onApply,
  onChange,
  onOpenChange,
}: {
  draft: ShiftSummaryDraft;
  open: boolean;
  summary: ReturnType<typeof buildWholeShiftSummary>;
  onApply: () => void;
  onChange: React.Dispatch<React.SetStateAction<ShiftSummaryDraft>>;
  onOpenChange: (open: boolean) => void;
}) {
  const updateDraft = (key: keyof ShiftSummaryDraft, value: string) => onChange((current) => ({ ...current, [key]: value }));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(980px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-md border border-border bg-surface shadow-soft outline-none">
          <div className="border-b border-border bg-sky-700 px-4 py-3 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="text-base font-semibold">Whole Shift Summary</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-sky-50">{summary.patientLabel} | {draft.outgoingNurse} to {draft.incomingNurse} | {draft.shift}</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button className="border-white/30 bg-white/10 text-white hover:bg-white/20" size="sm" variant="outline">Close</Button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summary.metrics.map((metric) => (
                <div className={cn("rounded-md border p-3", toneSurfaceClass(metric.tone))} key={metric.label}>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{metric.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <HandoverSummaryList title="Completed in shift" items={summary.completed} tone="success" />
              <HandoverSummaryList title="Pending for next nurse" items={summary.pending} tone="warning" />
              <HandoverSummaryList title="Critical watch" items={summary.critical} tone={summary.critical.length ? "danger" : "success"} />
            </div>

            <div className="mt-4 rounded-md border border-border bg-background p-3">
              <div className="mb-3">
                <p className="text-sm font-semibold text-foreground">Editable handover summary</p>
                <p className="mt-1 text-xs text-muted-foreground">Review and edit before applying to the main handover form.</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <EditableSummaryTextArea label="Active issues" value={draft.issues} onChange={(value) => updateDraft("issues", value)} />
                <EditableSummaryTextArea label="Pending tests" value={draft.pendingTests} onChange={(value) => updateDraft("pendingTests", value)} />
                <EditableSummaryTextArea label="Pending medication" value={draft.pendingMeds} onChange={(value) => updateDraft("pendingMeds", value)} />
                <EditableSummaryTextArea label="Escalation risks" value={draft.risks} onChange={(value) => updateDraft("risks", value)} />
                <EditableSummaryTextArea label="To-do list" value={draft.todos} onChange={(value) => updateDraft("todos", value)} wide />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border bg-surface-muted px-4 py-3">
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button onClick={onApply}>
              <ClipboardCheck className="h-4 w-4" />Apply to handover
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EditableSummaryTextArea({ label, value, onChange, wide }: { label: string; value: string; onChange: (value: string) => void; wide?: boolean }) {
  return (
    <label className={cn("space-y-1 text-sm", wide ? "md:col-span-2" : "")}>
      <span className="font-medium text-foreground">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-input bg-surface p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function HandoverSummaryList({ title, items, tone }: { title: string; items: string[]; tone: StatusTone }) {
  return (
    <div className={cn("rounded-md border bg-background p-3", toneBorderClass(tone))}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
        <Badge tone={tone}>{items.length}</Badge>
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div className="rounded-md border border-border bg-surface-muted px-3 py-2 text-xs text-foreground" key={item}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function buildWholeShiftSummary(patient: IcuPatient, nurse: string, shift: string) {
  const patientVitals = icuVitals.filter((row) => row.patientId === patient.id && row.nurse === nurse);
  const fallbackVitals = patientVitals.length ? patientVitals : icuVitals.filter((row) => row.patientId === patient.id);
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const nurseMeds = meds.filter((row) => row.administeredBy === nurse || row.status === "Due" || row.status === "Late");
  const ioRows = intakeOutputRows.filter((row) => row.patientId === patient.id && row.nurse === nurse);
  const fallbackIoRows = ioRows.length ? ioRows : intakeOutputRows.filter((row) => row.patientId === patient.id);
  const tasks = icuTasks.filter((row) => row.patientId === patient.id && row.assignedTo === nurse);
  const patientAlerts = icuAlerts.filter((row) => row.patientId === patient.id && row.status !== "Resolved");
  const infusions = infusionRows.filter((row) => row.patientId === patient.id && row.nurse === nurse);
  const intakeTotal = fallbackIoRows.reduce((sum, row) => sum + row.intakeMl, 0);
  const outputTotal = fallbackIoRows.reduce((sum, row) => sum + row.outputMl, 0);
  const balance = intakeTotal - outputTotal;
  const abnormalVitals = fallbackVitals.filter((row) => row.abnormal);
  const dueMeds = meds.filter((row) => row.status === "Due" || row.status === "Late" || row.status === "Held");
  const pendingTasks = tasks.filter((row) => row.status !== "Completed");
  const completedTasks = tasks.filter((row) => row.status === "Completed");
  const pendingIo = fallbackIoRows.filter((row) => row.status === "Pending review");
  const lowUrine = fallbackIoRows.filter((row) => row.kind === "Output" && row.category.toLowerCase().includes("urine") && row.quantityMl < 30);

  const completed = [
    `${fallbackVitals.length} vitals / monitoring entries reviewed`,
    `${nurseMeds.filter((row) => row.status === "Administered").length} medication administration row(s) completed`,
    `${fallbackIoRows.length} intake/output row(s) documented, net balance ${formatHandoverMl(balance)}`,
    `${infusions.filter((row) => row.status === "Running").length} running infusion(s) checked`,
    `${completedTasks.length} assigned task(s) completed`,
  ].filter((item) => !item.startsWith("0 medication") && !item.startsWith("0 running") && !item.startsWith("0 assigned"));

  const pending = [
    ...dueMeds.map((row) => `${row.medication} ${row.status.toLowerCase()} at ${row.scheduledTime}`),
    ...pendingTasks.map((row) => `${row.title} - ${row.dueTime}`),
    ...pendingIo.map((row) => `${row.category} entry at ${row.time} pending review`),
    ...patientAlerts.map((row) => `${row.type}: ${row.message}`),
  ];

  const critical = [
    ...abnormalVitals.map((row) => `${row.time} vitals: ${row.note}`),
    ...lowUrine.map((row) => `${row.time} low urine output ${row.quantityMl} ml`),
    ...(balance > 500 ? [`Positive fluid balance ${formatHandoverMl(balance)}`] : []),
    ...patientAlerts.filter((row) => row.severity === "Critical" || row.severity === "High").map((row) => `${row.severity} alert: ${row.message}`),
  ];

  return {
    patientLabel: `${patient.bedNo} - ${patient.patientName}`,
    nurse,
    shift,
    metrics: [
      { label: "Vitals", value: fallbackVitals.length, detail: abnormalVitals.length ? `${abnormalVitals.length} abnormal` : "No abnormal entry", tone: abnormalVitals.length ? "danger" as StatusTone : "success" as StatusTone },
      { label: "Medication", value: nurseMeds.length, detail: dueMeds.length ? `${dueMeds.length} pending/due` : "No pending medicine", tone: dueMeds.length ? "warning" as StatusTone : "success" as StatusTone },
      { label: "I/O balance", value: formatHandoverMl(balance), detail: `${intakeTotal} ml in / ${outputTotal} ml out`, tone: balance > 500 || lowUrine.length ? "warning" as StatusTone : "success" as StatusTone },
      { label: "Open items", value: pending.length, detail: `${patientAlerts.length} alert(s), ${pendingTasks.length} task(s)`, tone: pending.length ? "warning" as StatusTone : "success" as StatusTone },
    ],
    completed: completed.length ? completed : ["Routine shift care documented for selected patient"],
    pending: pending.length ? pending.slice(0, 6) : ["No pending item captured for next shift"],
    critical: critical.length ? Array.from(new Set(critical)).slice(0, 6) : ["No critical watch item captured"],
    suggested: {
      issues: critical.length ? Array.from(new Set(critical)).slice(0, 3).join(" | ") : `${patient.currentStatus}; continue routine ICU observation.`,
      pendingTests: patientAlerts.some((alert) => alert.type.toLowerCase().includes("lab")) ? "Critical/pending lab alert requires follow-up." : "No pending test captured in shift summary.",
      pendingMeds: dueMeds.length ? dueMeds.map((row) => `${row.medication} ${row.status.toLowerCase()} at ${row.scheduledTime}`).join(" | ") : "No pending medication captured.",
      risks: [abnormalVitals.length ? "Abnormal vitals watch" : "", lowUrine.length ? "Low urine output watch" : "", balance > 500 ? "Positive balance watch" : "", patientAlerts.length ? "Open alert follow-up" : ""].filter(Boolean).join(" | ") || "No active escalation risk captured.",
      todos: pending.length ? pending.slice(0, 5).join(" | ") : "Continue scheduled monitoring and routine ICU care.",
    },
  };
}

function formatHandoverMl(value: number) {
  return `${value > 0 ? "+" : ""}${value} ml`;
}

function toneSurfaceClass(tone: StatusTone) {
  if (tone === "danger" || tone === "critical") return "border-danger/30 bg-danger/10";
  if (tone === "warning") return "border-warning/30 bg-warning/10";
  if (tone === "success") return "border-success/30 bg-success/10";
  return "border-info/30 bg-info/10";
}

function toneBorderClass(tone: StatusTone) {
  if (tone === "danger" || tone === "critical") return "border-danger/30";
  if (tone === "warning") return "border-warning/30";
  if (tone === "success") return "border-success/30";
  return "border-info/30";
}

export function NursingTaskBoardWorkspace() {
  const [tasks, setTasks] = React.useState<IcuTask[]>(icuTasks);
  const [query, setQuery] = React.useState("");
  const [owner, setOwner] = React.useState("All nurses");
  const [source, setSource] = React.useState("All sources");
  const taskLanes: Array<{ label: string; statuses: IcuTask["status"][] }> = [
    { label: "To do", statuses: ["Assigned", "Accepted", "Pending"] },
    { label: "In progress", statuses: ["In progress"] },
    { label: "Attention", statuses: ["Overdue", "Escalated"] },
    { label: "Completed", statuses: ["Completed"] },
  ];
  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set([...tasks.map((task) => task.source ?? task.createdBy), ...nurseTaskScenarios.map((scenario) => scenario.source)]))], [tasks]);
  const taskOwnerOptions = React.useMemo(() => ["All nurses", ...Array.from(new Set([...allNurses, ...tasks.map((task) => task.assignedTo)]))], [tasks]);

  const visibleTasks = tasks.filter((task) => {
    const taskSource = task.source ?? task.createdBy;
    const searchable = `${task.patientName} ${task.bedNo} ${task.title} ${task.remarks} ${task.createdBy} ${task.assignedBy ?? ""} ${task.assignedTo} ${taskSource} ${task.taskType} ${task.assignmentReason ?? ""}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (owner === "All nurses" || task.assignedTo === owner)
      && (source === "All sources" || taskSource === source);
  });

  const changeStatus = (taskId: string, status: IcuTask["status"]) => {
    setTasks((rows) => rows.map((task) => task.id === taskId ? {
      ...task,
      status,
      acknowledgementStatus: status === "Accepted" ? "Accepted" : task.acknowledgementStatus,
    } : task));
    toast.success(`Task marked ${status}`);
  };

  const createTask = (draft: NurseTaskDraft) => {
    const patient = icuPatients.find((row) => row.id === draft.patientId);
    if (!patient || !draft.title.trim() || !draft.assignedTo.trim()) {
      toast.error("Patient, task title, and assigned nurse are required.");
      return;
    }
    const dueTime = formatNurseTaskDueTime(draft);
    const remarks = [
      draft.context ? `${getNurseTaskScenario(draft.scenarioId)?.contextLabel ?? "Context"}: ${draft.context}` : "",
      draft.repeat ? `Repeat: ${draft.repeat}` : "",
      draft.assignmentReason ? `Assigned reason: ${draft.assignmentReason}` : "",
      draft.escalation ? `Escalation: ${draft.escalation}` : "",
      draft.notes,
    ].filter(Boolean).join(" | ");

    const newTask: IcuTask = {
      id: `task-${Date.now()}`,
      patientId: patient.id,
      bedNo: patient.bedNo,
      patientName: patient.patientName,
      taskType: draft.taskType,
      title: draft.title.trim(),
      priority: draft.priority,
      dueTime,
      status: draft.requiresAcknowledgement ? "Assigned" : "Pending",
      createdBy: draft.assignedBy,
      assignedTo: draft.assignedTo,
      remarks: remarks || "Task created from nursing task center",
      source: draft.source,
      assignedBy: draft.assignedBy,
      assignedByRole: draft.assignedByRole,
      assignedToRole: draft.assignedToRole,
      assignmentReason: draft.assignmentReason,
      originalOwner: draft.assignedTo,
      escalationOwner: draft.escalationOwner,
      requiresAcknowledgement: draft.requiresAcknowledgement,
      acknowledgementStatus: draft.requiresAcknowledgement ? "Pending" : "Not required",
      assignedAt: "Now",
    };

    setTasks((current) => [newTask, ...current]);
    setOwner("All nurses");
    setSource("All sources");
    toast.success(`${newTask.title} created for ${newTask.bedNo}`);
  };

  return (
    <div className="space-y-4">
      <CreateNurseTaskPanel onCreateTask={createTask} />

      <Card>
        <CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(280px,1fr)_220px_220px_auto] lg:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Search tasks</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Patient, bed, task..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </label>
          <NativeSelect label="Source" value={source} onChange={setSource} options={sourceOptions} />
          <NativeSelect label="Assigned nurse" value={owner} onChange={setOwner} options={taskOwnerOptions} />
          <Button variant="outline" onClick={() => {
            setQuery("");
            setOwner("All nurses");
            setSource("All sources");
          }}><Filter className="h-4 w-4" />Reset</Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total tasks" value={visibleTasks.length} tone="info" icon={ListChecks} />
        <MetricTile label="Needs attention" value={visibleTasks.filter((task) => task.status === "Overdue" || task.status === "Escalated").length} tone="critical" icon={AlertTriangle} />
        <MetricTile label="In progress" value={visibleTasks.filter((task) => task.status === "In progress").length} tone="warning" icon={Clock} />
        <MetricTile label="Completed" value={visibleTasks.filter((task) => task.status === "Completed").length} tone="success" icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {taskLanes.map((lane) => {
          const laneTasks = visibleTasks.filter((task) => lane.statuses.includes(task.status));
          return (
            <Card key={lane.label}>
              <CardHeader>
                <div>
                  <CardTitle>{lane.label}</CardTitle>
                  <CardDescription>{laneTasks.length} tasks</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {laneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onChangeStatus={changeStatus} />
                ))}
                {laneTasks.length === 0 ? (
                  <EmptyPanel title="No tasks" detail={`No ${lane.label.toLowerCase()} tasks for current filters.`} />
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CreateNurseTaskPanel({ onCreateTask }: { onCreateTask: (draft: NurseTaskDraft) => void }) {
  const [draft, setDraft] = React.useState<NurseTaskDraft>(() => createDefaultNurseTaskDraft());
  const selectedPatient = icuPatients.find((patient) => patient.id === draft.patientId) ?? icuPatients[0];
  const selectedScenario = getNurseTaskScenario(draft.scenarioId) ?? nurseTaskScenarios[0];
  const sourceScenarios = nurseTaskScenarios.filter((scenario) => scenario.source === draft.source);
  const patientOptions = icuPatients.map((patient) => patient.id);
  const nurseOptions = Array.from(new Set([...allNurses, "Night Nurse Leena", "Ward Nurse Neha", "Head Nurse Sana"]));

  const applyScenario = (scenario: NurseTaskScenario) => {
    const assignment = getTaskAssignmentDefaults(scenario.source, selectedPatient, scenario);
    setDraft((current) => ({
      ...current,
      scenarioId: scenario.id,
      source: scenario.source,
      taskType: scenario.taskType,
      title: scenario.title,
      priority: scenario.priority,
      dueTime: scenario.dueTime,
      repeat: scenario.repeat,
      escalation: scenario.escalation,
      assignedBy: assignment.assignedBy,
      assignedByRole: assignment.assignedByRole,
      assignedToRole: assignment.assignedToRole,
      assignmentReason: assignment.assignmentReason,
      escalationOwner: assignment.escalationOwner,
      requiresAcknowledgement: assignment.requiresAcknowledgement,
      context: scenario.contextOptions[0] ?? "",
      notes: scenario.remarks,
    }));
  };

  const updateSource = (source: string) => {
    const nextScenario = nurseTaskScenarios.find((scenario) => scenario.source === source) ?? nurseTaskScenarios[0];
    applyScenario(nextScenario);
  };

  const updatePatient = (patientId: string) => {
    const patient = icuPatients.find((row) => row.id === patientId);
    const assignment = getTaskAssignmentDefaults(draft.source, patient, selectedScenario);
    setDraft((current) => ({
      ...current,
      patientId,
      assignedBy: assignment.assignedBy,
      assignedByRole: assignment.assignedByRole,
      assignedTo: patient?.assignedWardNurse ?? current.assignedTo,
      assignedToRole: assignment.assignedToRole,
      assignmentReason: assignment.assignmentReason,
      escalationOwner: assignment.escalationOwner,
      requiresAcknowledgement: assignment.requiresAcknowledgement,
    }));
  };

  const saveTask = () => {
    if (!draft.title.trim()) {
      toast.error("Task title is required.");
      return;
    }
    onCreateTask(draft);
    setDraft(createDefaultNurseTaskDraft());
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Create nurse task</CardTitle>
          <CardDescription>Generate a task from doctor orders, medication, vitals, I/O, transfusion, handover, supervision, or manual nursing care.</CardDescription>
        </div>
        <Badge tone={draft.priority === "Critical" ? "critical" : draft.priority === "High" ? "danger" : draft.priority === "Medium" ? "warning" : "info"}>
          {draft.priority} suggested
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <SelectField label="Patient / bed" value={draft.patientId} onChange={updatePatient} options={patientOptions} renderOption={(id) => {
            const patient = icuPatients.find((item) => item.id === id);
            return patient ? `${patient.bedNo} - ${patient.patientName}` : id;
          }} />
          <SelectField label="Task source" value={draft.source} onChange={updateSource} options={Array.from(new Set(nurseTaskScenarios.map((scenario) => scenario.source)))} />
          <SelectField label="Scenario" value={draft.scenarioId} onChange={(scenarioId) => {
            const scenario = getNurseTaskScenario(scenarioId);
            if (scenario) applyScenario(scenario);
          }} options={sourceScenarios.map((scenario) => scenario.id)} renderOption={(id) => getNurseTaskScenario(id)?.taskType ?? id} />
        </div>

        <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3 md:grid-cols-2">
          <InfoLine label="Selected patient" value={`${selectedPatient?.bedNo ?? "-"} - ${selectedPatient?.patientName ?? "-"}`} />
          <InfoLine label="Default nurse" value={selectedPatient?.assignedWardNurse ?? "-"} />
        </div>

        <FormGrid>
          <TextField label="Task title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder="Task title" wide />
          <SelectField label="Priority" value={draft.priority} onChange={(value) => setDraft((current) => ({ ...current, priority: value as IcuTask["priority"] }))} options={["Critical", "High", "Medium", "Routine"]} />
          <SelectField label="Assigned nurse" value={draft.assignedTo} onChange={(value) => setDraft((current) => ({ ...current, assignedTo: value }))} options={nurseOptions} />
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Due date</span>
            <Input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
          </label>
          <TextField label="Due time" value={draft.dueTime} onChange={(value) => setDraft((current) => ({ ...current, dueTime: value }))} placeholder="Now / Next 15 min / 14:30" />
          <SelectField label={selectedScenario.contextLabel} value={draft.context} onChange={(value) => setDraft((current) => ({ ...current, context: value }))} options={selectedScenario.contextOptions} />
          <SelectField label="Repeat" value={draft.repeat} onChange={(value) => setDraft((current) => ({ ...current, repeat: value }))} options={Array.from(new Set([draft.repeat, "One time", "Hourly", "Every 15 min until stable", "Every 2 hours", "Per shift", "Before shift end", "Until completed"]))} />
          <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
            <input
              checked={draft.requiresAcknowledgement}
              className="h-4 w-4 rounded border-border"
              type="checkbox"
              onChange={(event) => setDraft((current) => ({ ...current, requiresAcknowledgement: event.target.checked }))}
            />
            <span className="font-medium text-foreground">Requires nurse acknowledgement</span>
          </label>
          <TextAreaField label="Escalation rule" value={draft.escalation} onChange={(value) => setDraft((current) => ({ ...current, escalation: value }))} placeholder="Escalation rule..." />
          <TextAreaField label="Task notes" value={draft.notes} onChange={(value) => setDraft((current) => ({ ...current, notes: value }))} placeholder="Nursing notes, safety instruction, carry-forward detail..." />
        </FormGrid>

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">{draft.source}</Badge>
            <Badge tone="muted">{draft.assignedBy} {" -> "} {draft.assignedTo}</Badge>
            <Badge tone={toneForPriority(draft.priority)}>{draft.priority}</Badge>
            <Badge tone="muted">{formatNurseTaskDueTime(draft)}</Badge>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setDraft(createDefaultNurseTaskDraft())}>Reset</Button>
            <Button onClick={saveTask}><ClipboardCheck className="h-4 w-4" />Create task</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function createDefaultNurseTaskDraft(): NurseTaskDraft {
  const scenario = nurseTaskScenarios[0];
  const patient = icuPatients[0];
  const assignment = getTaskAssignmentDefaults(scenario.source, patient, scenario);
  return {
    patientId: patient?.id ?? "",
    source: scenario.source,
    scenarioId: scenario.id,
    taskType: scenario.taskType,
    title: scenario.title,
    priority: scenario.priority,
    assignedBy: assignment.assignedBy,
    assignedByRole: assignment.assignedByRole,
    assignedTo: patient?.assignedWardNurse ?? allNurses[0] ?? "",
    assignedToRole: assignment.assignedToRole,
    assignmentReason: assignment.assignmentReason,
    dueDate: "2026-06-06",
    dueTime: scenario.dueTime,
    repeat: scenario.repeat,
    escalation: scenario.escalation,
    escalationOwner: assignment.escalationOwner,
    requiresAcknowledgement: assignment.requiresAcknowledgement,
    context: scenario.contextOptions[0] ?? "",
    notes: scenario.remarks,
  };
}

function getNurseTaskScenario(scenarioId: string) {
  return nurseTaskScenarios.find((scenario) => scenario.id === scenarioId);
}

function formatNurseTaskDueTime(draft: NurseTaskDraft) {
  const cleanTime = draft.dueTime.trim();
  if (!cleanTime) return draft.dueDate || "Today";
  if (cleanTime.toLowerCase() === "now" || cleanTime.toLowerCase().startsWith("next") || cleanTime.toLowerCase().includes("shift")) return cleanTime;
  return draft.dueDate ? `${draft.dueDate} ${cleanTime}` : cleanTime;
}

function getTaskAssignmentDefaults(source: NurseTaskSource, patient?: IcuPatient, scenario?: NurseTaskScenario) {
  const assignedToRole = source === "Head nurse supervision" ? "Unit Nurse" : "Ward Nurse";
  const base = {
    assignedBy: patient?.assignedWardNurse ?? "Ward Nurse Current",
    assignedByRole: "Ward Nurse",
    assignedToRole,
    assignmentReason: scenario?.remarks ?? "Nursing task assignment",
    escalationOwner: source === "Head nurse supervision" ? "Head Nurse Sana" : "Duty Doctor",
    requiresAcknowledgement: source !== "Manual nursing care",
  };

  if (source === "Doctor order") {
    return { ...base, assignedBy: patient?.admittingDoctor ?? "Duty Doctor", assignedByRole: "Doctor", assignmentReason: "Doctor instruction assigned to nursing team", escalationOwner: patient?.dutyDoctor ?? "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "Medication / eMAR") {
    return { ...base, assignedBy: "System MAR", assignedByRole: "System", assignmentReason: "Medication schedule or medicine safety event", escalationOwner: "Duty Doctor + Head Nurse", requiresAcknowledgement: true };
  }
  if (source === "Vitals / monitoring") {
    return { ...base, assignedBy: "Monitoring System", assignedByRole: "System", assignmentReason: "Monitoring threshold or scheduled vitals requirement", escalationOwner: "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "Intake / output") {
    return { ...base, assignedBy: "Fluid Balance Chart", assignedByRole: "System", assignmentReason: "Fluid balance, urine, drain, or output follow-up", escalationOwner: "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "IV / infusion") {
    return { ...base, assignedBy: "Infusion Pump", assignedByRole: "System", assignmentReason: "Infusion pump, rate, line, or drug continuity check", escalationOwner: "Unit Nurse", requiresAcknowledgement: true };
  }
  if (source === "Blood transfusion") {
    return { ...base, assignedBy: "Blood Unit", assignedByRole: "Blood Unit", assignmentReason: "Blood product monitoring and reaction safety", escalationOwner: "Duty Doctor + Blood Unit", requiresAcknowledgement: true };
  }
  if (source === "Lab / radiology") {
    return { ...base, assignedBy: "Lab / Radiology Department", assignedByRole: "Lab", assignmentReason: "Sample, imaging, or report coordination", escalationOwner: "Duty Doctor", requiresAcknowledgement: true };
  }
  if (source === "Shift handover") {
    return { ...base, assignedBy: "Outgoing Nurse", assignedByRole: "Ward Nurse", assignmentReason: "Pending task carried forward from previous shift", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: true };
  }
  if (source === "Admission / transfer") {
    return { ...base, assignedBy: patient?.assignedUnitNurse ?? "Unit Nurse Priya", assignedByRole: "Unit Nurse", assignmentReason: "Admission, transfer, or clearance workflow", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: true };
  }
  if (source === "Head nurse supervision") {
    return { ...base, assignedBy: "Head Nurse Sana", assignedByRole: "Head Nurse", assignmentReason: "Supervision, workload, documentation, or audit follow-up", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: true };
  }
  return { ...base, assignmentReason: "Self-created nursing care task", escalationOwner: "Head Nurse Sana", requiresAcknowledgement: false };
}

export function MedicationTimelineWorkspace() {
  const [orders, setOrders] = React.useState<DoctorMedicationOrder[]>(initialDoctorMedicationOrders);
  const [doses, setDoses] = React.useState<MedicationDoseRow[]>(() => buildMedicationDoseRows(initialDoctorMedicationOrders));
  const [patientId, setPatientId] = React.useState("All patients");
  const [status, setStatus] = React.useState<(typeof medicationStatuses)[number]>("All status");
  const [orderType, setOrderType] = React.useState<(typeof orderTypeOptions)[number]>("All types");
  const [pharmacy, setPharmacy] = React.useState<(typeof pharmacyOptions)[number]>("All pharmacy");
  const [medicationDate, setMedicationDate] = React.useState("2026-06-08");
  const [shift, setShift] = React.useState<(typeof medicationShiftOptions)[number]>("All shifts");
  const [hour, setHour] = React.useState<(typeof medicationHourOptions)[number]>("All hours");
  const [query, setQuery] = React.useState("");
  const [medicationView, setMedicationView] = React.useState<"Nurse eMAR" | "Doctor Orders">("Nurse eMAR");
  const [selectedDoseId, setSelectedDoseId] = React.useState<string | null>(null);
  const [pendingDoseAction, setPendingDoseAction] = React.useState<{ doseId: string; action: MedicationNurseAction } | null>(null);
  const [pendingOrderAction, setPendingOrderAction] = React.useState<{ orderId: string; action: DoctorOrderStatusAction } | null>(null);
  const [pendingAmendOrderId, setPendingAmendOrderId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<MedicationOrderDraft>({
    patientId: icuPatients[0]?.id ?? "",
    department: "ICU",
    formularyId: "",
    medication: "",
    dose: "",
    route: "IV",
    frequency: "q8h",
    orderType: "Scheduled" as MedicationOrderType,
    scheduleTimes: "08:00, 16:00, 00:00",
    doctor: "Dr. Sameer Mehta",
    indication: "",
    instructions: "",
    highRisk: false,
    doubleVerificationRequired: false,
    pharmacyStatus: "Available" as PharmacyStatus,
    startDate: "2026-06-08",
    startTime: "12:00",
    duration: "5 days",
    maxDailyDose: "",
    minInterval: "",
    reviewDate: "2026-06-10",
    titrationTarget: "",
    minRate: "",
    maxRate: "",
    monitoringFrequency: "",
    approvalReason: "",
  });

  const visibleDoses = doses.filter((row) => {
    const patient = icuPatients.find((item) => item.id === row.patientId);
    const searchable = `${patient?.patientName ?? ""} ${row.bedNo} ${row.medication} ${row.reason} ${row.doctor} ${row.indication} ${row.scheduledDate} ${row.shift}`.toLowerCase();
    const rowHour = row.scheduledTime.match(/^\d{2}:/)?.[0]?.slice(0, 2);
    return searchable.includes(query.toLowerCase())
      && (patientId === "All patients" || row.patientId === patientId)
      && (status === "All status" || row.status === status)
      && (orderType === "All types" || row.orderType === orderType)
      && (pharmacy === "All pharmacy" || row.pharmacyStatus === pharmacy)
      && (!medicationDate || row.scheduledDate === medicationDate)
      && (shift === "All shifts" || row.shift === shift)
      && (hour === "All hours" || rowHour === hour.slice(0, 2));
  });

  const selectedDose = visibleDoses.find((dose) => dose.id === selectedDoseId) ?? visibleDoses[0];
  const activeDoseCount = visibleDoses.filter((dose) => dose.orderStatus === "Active").length;
  const dueCount = visibleDoses.filter((dose) => isMedicationDueStatus(dose.status)).length;
  const highRiskCount = visibleDoses.filter((dose) => dose.highRisk && dose.orderStatus === "Active").length;
  const pharmacyIssueCount = visibleDoses.filter((dose) => dose.pharmacyStatus !== "Available" && dose.orderStatus === "Active").length;
  const runningInfusionCount = visibleDoses.filter((dose) => dose.status === "Running").length;
  const complianceBase = visibleDoses.filter((dose) => dose.status !== "Upcoming" && dose.orderStatus === "Active").length;
  const compliance = complianceBase ? Math.round((visibleDoses.filter((dose) => dose.status === "Administered").length / complianceBase) * 100) : 0;
  const selectedFormularyMedicine = getSelectedFormularyMedicine(draft);
  const doctorOrderScenarios = getDoctorOrderScenarios(draft, orders);
  const hasBlockingDoctorScenario = doctorOrderScenarios.some((scenario) => scenario.blocking);

  const updateDoseStatus = (
    doseId: string,
    nextStatus: WorkflowMedicationStatus,
    note: string,
    details?: { actualTime?: string; administeredBy?: string },
  ) => {
    const targetDose = doses.find((dose) => dose.id === doseId);
    if (!targetDose) return;
    if (nextStatus === "Administered" && targetDose.pharmacyStatus !== "Available") {
      toast.error("Pharmacy clearance pending. Mark medicine received first.");
      setSelectedDoseId(doseId);
      return;
    }
    if (nextStatus === "Administered" && targetDose.doubleVerification === "Pending") {
      toast.error("High-risk medicine needs double verification before administration.");
      setSelectedDoseId(doseId);
      return;
    }

    setDoses((current) => current.map((dose) => {
      if (dose.id !== doseId) return dose;
      const prnReassessment = nextStatus === "Administered" && dose.orderType === "PRN"
        ? ["PRN reassessment due in 30 minutes"]
        : [];
      return {
        ...dose,
        status: nextStatus,
        actualTime: nextStatus === "Administered" || nextStatus === "Running" ? details?.actualTime || "Now" : dose.actualTime,
        administeredBy: nextStatus === "Administered" || nextStatus === "Running" ? details?.administeredBy || "Ward Nurse Current" : dose.administeredBy,
        reason: ["Held", "Skipped", "Missed", "Refused"].includes(nextStatus) ? note : dose.reason,
        auditTrail: [...prnReassessment, `Now: ${nextStatus} - ${note}`, ...dose.auditTrail],
      };
    }));
    setSelectedDoseId(doseId);
    toast.success(`${targetDose.medication} marked ${nextStatus}`);
    if (nextStatus === "Administered" && targetDose.orderType === "PRN") {
      toast.info("PRN effectiveness reassessment is due in 30 minutes.");
    }
    if (nextStatus === "Missed") {
      toast.warning("Missed dose added to the head nurse and doctor follow-up queue.");
    }
  };

  const verifyDose = (doseId: string, verifier: string, note: string) => {
    const targetDose = doses.find((dose) => dose.id === doseId);
    if (!targetDose) return;
    setDoses((current) => current.map((dose) => dose.id === doseId ? {
      ...dose,
      doubleVerification: "Verified",
      auditTrail: [`Now: Double verification completed by ${verifier} - ${note}`, ...dose.auditTrail],
    } : dose));
    setSelectedDoseId(doseId);
    toast.success(`${targetDose.medication} double verified`);
  };

  const requestDoseAction = (doseId: string, action: MedicationNurseAction) => {
    setSelectedDoseId(doseId);
    setPendingDoseAction({ doseId, action });
  };

  const markPharmacyAvailable = (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, pharmacyStatus: "Available" } : order));
    setDoses((current) => current.map((dose) => dose.orderId === orderId ? {
      ...dose,
      pharmacyStatus: "Available",
      auditTrail: ["Now: Pharmacy marked medicine available", ...dose.auditTrail],
    } : dose));
    toast.success(`${targetOrder.medication} received from pharmacy`);
  };

  const changeOrderStatus = (orderId: string, nextStatus: MedicationOrderStatus, details?: { reason: string; note: string; followUpPlan: string; effectiveTime: string }) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;
    const statusNote = details
      ? `${details.reason} | Effective: ${details.effectiveTime}${details.followUpPlan ? ` | Plan: ${details.followUpPlan}` : ""}${details.note ? ` | Note: ${details.note}` : ""}`
      : nextStatus === "Active" ? "Doctor resumed order" : `Doctor order ${nextStatus}`;
    setOrders((current) => current.map((order) => order.id === orderId ? {
      ...order,
      status: nextStatus,
      statusReason: nextStatus === "Active" ? undefined : details?.reason ?? order.statusReason,
      followUpPlan: nextStatus === "Active" ? undefined : details?.followUpPlan ?? order.followUpPlan,
      actionTimeline: [`Now: ${nextStatus} - ${statusNote}`, ...(order.actionTimeline ?? [])],
    } : order));
    setDoses((current) => current.map((dose) => {
      if (dose.orderId !== orderId) return dose;
      const resumedStatus = dose.orderType === "Continuous" ? "Running" : dose.status === "Held" || dose.status === "Stopped" ? "Due" : dose.status;
      return {
        ...dose,
        orderStatus: nextStatus,
        status: nextStatus === "Held by doctor" ? "Held" : nextStatus === "Discontinued" ? "Stopped" : resumedStatus,
        reason: nextStatus === "Held by doctor" || nextStatus === "Discontinued" ? statusNote : dose.reason,
        auditTrail: [`Now: Doctor order ${nextStatus} - ${statusNote}`, ...dose.auditTrail],
      };
    }));
    toast.success(`${targetOrder.medication} order moved to ${nextStatus}`);
  };

  const requestDoctorOrderAction = (orderId: string, action: DoctorOrderStatusAction) => {
    setPendingOrderAction({ orderId, action });
  };

  const addDoctorOrder = (targetStatus: "Draft" | "Active") => {
    const patient = icuPatients.find((item) => item.id === draft.patientId);
    if (!patient || !draft.medication.trim() || !draft.dose.trim()) {
      toast.error("Patient, medicine, and dose are required.");
      return;
    }
    const blockingScenario = getDoctorOrderScenarios(draft, orders).find((scenario) => scenario.blocking);
    if (targetStatus === "Active" && blockingScenario) {
      toast.error(blockingScenario.title);
      return;
    }

    const scheduleTimes = parseMedicationSchedule(draft.scheduleTimes, draft.orderType);
    const priority: DoctorMedicationOrder["priority"] = draft.orderType === "STAT" ? "STAT" : draft.highRisk ? "High" : "Routine";
    const newOrder: DoctorMedicationOrder = {
      id: `ord-new-${Date.now()}`,
      patientId: patient.id,
      bedNo: patient.bedNo,
      department: draft.department,
      formularyId: selectedFormularyMedicine?.id,
      medication: draft.medication.trim(),
      dose: draft.dose.trim(),
      route: draft.route,
      frequency: draft.frequency,
      orderType: draft.orderType,
      scheduleTimes,
      doctor: draft.doctor,
      indication: draft.indication.trim() || "Doctor medication order",
      instructions: draft.instructions.trim() || "Follow eMAR safety checks before administration.",
      priority,
      highRisk: draft.highRisk,
      doubleVerificationRequired: draft.doubleVerificationRequired || draft.highRisk,
      pharmacyStatus: draft.pharmacyStatus,
      pharmacyLocation: selectedFormularyMedicine?.pharmacyLocation,
      stockStatus: selectedFormularyMedicine?.availability,
      scenarioNotes: doctorOrderScenarios.map((scenario) => scenario.title),
      alternativeMeds: selectedFormularyMedicine?.alternatives,
      startDate: draft.startDate,
      startTime: draft.startTime,
      duration: draft.duration,
      maxDailyDose: draft.maxDailyDose,
      minInterval: draft.minInterval,
      reviewDate: draft.reviewDate,
      titrationTarget: draft.titrationTarget,
      minRate: draft.minRate,
      maxRate: draft.maxRate,
      monitoringFrequency: draft.monitoringFrequency,
      approvalReason: draft.approvalReason,
      signedAt: targetStatus === "Active" ? "Now" : undefined,
      version: 1,
      status: targetStatus,
    };
    setOrders((current) => [newOrder, ...current]);
    if (targetStatus === "Active") {
      const newDoses = buildMedicationDoseRows([newOrder]);
      setDoses((current) => [...newDoses, ...current]);
      setSelectedDoseId(newDoses[0]?.id ?? null);
    }
    setDraft((current) => ({
      ...current,
      medication: "",
      dose: "",
      formularyId: "",
      indication: "",
      instructions: "",
      highRisk: false,
      doubleVerificationRequired: false,
      pharmacyStatus: "Available",
      maxDailyDose: "",
      minInterval: "",
      titrationTarget: "",
      minRate: "",
      maxRate: "",
      monitoringFrequency: "",
      approvalReason: "",
    }));
    toast.success(targetStatus === "Draft"
      ? `${newOrder.medication} saved as draft`
      : `${newOrder.medication} signed and sent to Nurse eMAR`);
  };

  const signDraftOrder = (orderId: string) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder || targetOrder.status !== "Draft") return;
    const draftForReview: MedicationOrderDraft = {
      patientId: targetOrder.patientId,
      department: targetOrder.department ?? "ICU",
      formularyId: targetOrder.formularyId ?? "",
      medication: targetOrder.medication,
      dose: targetOrder.dose,
      route: targetOrder.route,
      frequency: targetOrder.frequency,
      orderType: targetOrder.orderType,
      scheduleTimes: targetOrder.scheduleTimes.join(", "),
      doctor: targetOrder.doctor,
      indication: targetOrder.indication,
      instructions: targetOrder.instructions,
      highRisk: targetOrder.highRisk,
      doubleVerificationRequired: targetOrder.doubleVerificationRequired,
      pharmacyStatus: targetOrder.pharmacyStatus,
      startDate: targetOrder.startDate ?? "2026-06-08",
      startTime: targetOrder.startTime ?? "12:00",
      duration: targetOrder.duration ?? "",
      maxDailyDose: targetOrder.maxDailyDose ?? "",
      minInterval: targetOrder.minInterval ?? "",
      reviewDate: targetOrder.reviewDate ?? "",
      titrationTarget: targetOrder.titrationTarget ?? "",
      minRate: targetOrder.minRate ?? "",
      maxRate: targetOrder.maxRate ?? "",
      monitoringFrequency: targetOrder.monitoringFrequency ?? "",
      approvalReason: targetOrder.approvalReason ?? "",
    };
    const blocker = getDoctorOrderScenarios(draftForReview, orders.filter((order) => order.id !== orderId)).find((scenario) => scenario.blocking);
    if (blocker) {
      setDraft(draftForReview);
      toast.error(`${blocker.title}. Draft loaded for correction.`);
      return;
    }
    const signedOrder = { ...targetOrder, status: "Active" as const, signedAt: "Now" };
    setOrders((current) => current.map((order) => order.id === orderId ? signedOrder : order));
    const newDoses = buildMedicationDoseRows([signedOrder]);
    setDoses((current) => [...newDoses, ...current]);
    setSelectedDoseId(newDoses[0]?.id ?? null);
    toast.success(`${targetOrder.medication} signed and sent to Nurse eMAR`);
  };

  const copyOrderToDraft = (orderId: string, amend: DoctorOrderAmendPayload) => {
    const order = orders.find((item) => item.id === orderId);
    if (!order) return;
    const amendmentNote = [
      `Amendment reason: ${amend.reason}`,
      amend.changeAreas.length ? `Planned change: ${amend.changeAreas.join(", ")}` : "",
      `Effective from ${amend.effectiveDate} ${amend.effectiveTime}`,
      amend.note ? `Doctor note: ${amend.note}` : "",
      `Based on original order ${order.id}${order.version ? ` v${order.version}` : ""}`,
    ].filter(Boolean).join("\n");
    setDraft({
      patientId: order.patientId,
      department: order.department ?? "ICU",
      formularyId: order.formularyId ?? "",
      medication: order.medication,
      dose: order.dose,
      route: order.route,
      frequency: order.frequency,
      orderType: order.orderType,
      scheduleTimes: order.scheduleTimes.join(", "),
      doctor: order.doctor,
      indication: order.indication,
      instructions: `${order.instructions}${order.instructions ? "\n\n" : ""}${amendmentNote}`,
      highRisk: order.highRisk,
      doubleVerificationRequired: order.doubleVerificationRequired,
      pharmacyStatus: order.pharmacyStatus,
      startDate: amend.effectiveDate,
      startTime: amend.effectiveTime,
      duration: order.duration ?? "",
      maxDailyDose: order.maxDailyDose ?? "",
      minInterval: order.minInterval ?? "",
      reviewDate: order.reviewDate ?? "",
      titrationTarget: order.titrationTarget ?? "",
      minRate: order.minRate ?? "",
      maxRate: order.maxRate ?? "",
      monitoringFrequency: order.monitoringFrequency ?? "",
      approvalReason: order.approvalReason ?? "",
    });
    toast.success(`${order.medication} amendment loaded as editable draft`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Due / late" value={dueCount} tone={dueCount ? "danger" : "success"} icon={Pill} />
        <MetricTile label="High risk" value={highRiskCount} tone={highRiskCount ? "critical" : "success"} icon={ShieldAlert} />
        <MetricTile label="Pharmacy issues" value={pharmacyIssueCount} tone={pharmacyIssueCount ? "warning" : "success"} icon={Syringe} />
        <MetricTile label="Compliance" value={`${compliance}%`} tone={compliance > 80 ? "success" : "warning"} icon={Activity} />
      </div>

      <div className="grid gap-2 rounded-md border border-border bg-surface p-1 sm:grid-cols-2">
        {(["Nurse eMAR", "Doctor Orders"] as const).map((item) => (
          <Button
            className="justify-center"
            key={item}
            variant={medicationView === item ? "default" : "ghost"}
            onClick={() => setMedicationView(item)}
          >
            {item === "Nurse eMAR" ? <Syringe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            {item}
          </Button>
        ))}
      </div>

      {medicationView === "Nurse eMAR" ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_minmax(240px,360px)]">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Search dose</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Medicine, patient, bed, doctor..." value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Patient</span>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  value={patientId}
                  onChange={(event) => setPatientId(event.target.value)}
                >
                  <option value="All patients">All patients</option>
                  {icuPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Medication date</span>
                <Input type="date" value={medicationDate} onChange={(event) => setMedicationDate(event.target.value)} />
              </label>
              <NativeSelect label="Shift" value={shift} onChange={(value) => setShift(value as (typeof medicationShiftOptions)[number])} options={[...medicationShiftOptions]} />
              <NativeSelect label="Hour" value={hour} onChange={(value) => setHour(value as (typeof medicationHourOptions)[number])} options={[...medicationHourOptions]} />
              <NativeSelect label="Dose status" value={status} onChange={(value) => setStatus(value as (typeof medicationStatuses)[number])} options={medicationStatuses} />
              <NativeSelect label="Order type" value={orderType} onChange={(value) => setOrderType(value as (typeof orderTypeOptions)[number])} options={orderTypeOptions} />
              <NativeSelect label="Pharmacy" value={pharmacy} onChange={(value) => setPharmacy(value as (typeof pharmacyOptions)[number])} options={pharmacyOptions} />
              <Button className="w-full" variant="outline" onClick={() => {
                setQuery("");
                setPatientId("All patients");
                setStatus("All status");
                setOrderType("All types");
                setPharmacy("All pharmacy");
                setMedicationDate("2026-06-08");
                setShift("All shifts");
                setHour("All hours");
              }}><Filter className="h-4 w-4" />Reset</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {medicationView === "Doctor Orders" ? (
        <MedicationOrderComposer
          draft={draft}
          hasBlockingScenario={hasBlockingDoctorScenario}
          onSaveDraft={() => addDoctorOrder("Draft")}
          onSignOrder={() => addDoctorOrder("Active")}
          onDraftChange={(nextDraft) => setDraft((current) => ({ ...current, ...nextDraft }))}
          onCopyOrder={setPendingAmendOrderId}
          onHoldOrder={(orderId) => requestDoctorOrderAction(orderId, "Hold")}
          onResumeOrder={(orderId) => changeOrderStatus(orderId, "Active")}
          onSignDraft={signDraftOrder}
          onStopOrder={(orderId) => requestDoctorOrderAction(orderId, "Discontinue")}
          orders={orders}
          scenarios={doctorOrderScenarios}
          selectedMedicine={selectedFormularyMedicine}
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Priority Dose Queue</CardTitle>
                  <CardDescription>Due, late, STAT, running infusion, and pharmacy-blocked medicines.</CardDescription>
                </div>
                <Badge tone={dueCount ? "danger" : "success"}>{dueCount} due</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {visibleDoses.filter((dose) => isPriorityMedicationDose(dose)).map((dose) => (
                  <MedicationDoseCard
                    dose={dose}
                    key={dose.id}
                    selected={selectedDose?.id === dose.id}
                    onSelect={() => setSelectedDoseId(dose.id)}
                    onMarkPharmacyAvailable={() => markPharmacyAvailable(dose.orderId)}
                    onRequestAction={(action) => requestDoseAction(dose.id, action)}
                  />
                ))}
                {!visibleDoses.filter((dose) => isPriorityMedicationDose(dose)).length ? (
                  <EmptyPanel title="No priority dose" detail="Current filters have no due, STAT, running, or blocked medicine." />
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle>eMAR Timeline</CardTitle>
                  <CardDescription>All doctor-prescribed doses with nursing action controls.</CardDescription>
                </div>
                <Badge tone="info">{visibleDoses.length} of {activeDoseCount} doses</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {visibleDoses.map((dose) => (
                  <MedicationDoseCard
                    dose={dose}
                    key={dose.id}
                    selected={selectedDose?.id === dose.id}
                    compact
                    onSelect={() => setSelectedDoseId(dose.id)}
                    onMarkPharmacyAvailable={() => markPharmacyAvailable(dose.orderId)}
                    onRequestAction={(action) => requestDoseAction(dose.id, action)}
                  />
                ))}
                {!visibleDoses.length ? <EmptyPanel title="No medication matched" detail="Change search, patient, status, type, or pharmacy filter." /> : null}
              </CardContent>
            </Card>
          </div>

          <MedicationSafetyPanel
            dose={selectedDose}
            runningInfusionCount={runningInfusionCount}
            onMarkPharmacyAvailable={() => selectedDose ? markPharmacyAvailable(selectedDose.orderId) : undefined}
            onRequestAction={(action) => selectedDose ? requestDoseAction(selectedDose.id, action) : undefined}
          />
        </div>
      )}
      <MedicationActionDialog
        key={pendingDoseAction ? `${pendingDoseAction.doseId}-${pendingDoseAction.action}` : "medication-action-closed"}
        action={pendingDoseAction?.action ?? null}
        dose={doses.find((dose) => dose.id === pendingDoseAction?.doseId)}
        open={Boolean(pendingDoseAction)}
        onOpenChange={(open) => {
          if (!open) setPendingDoseAction(null);
        }}
        onConfirm={(payload) => {
          if (!pendingDoseAction) return;
          if (pendingDoseAction.action === "Verify") {
            verifyDose(pendingDoseAction.doseId, payload.verifier, payload.note);
          } else {
            updateDoseStatus(
              pendingDoseAction.doseId,
              pendingDoseAction.action,
              payload.note,
              { actualTime: payload.actualTime, administeredBy: payload.administeredBy },
            );
          }
          setPendingDoseAction(null);
        }}
      />
      <DoctorOrderStatusActionDialog
        key={pendingOrderAction ? `${pendingOrderAction.orderId}-${pendingOrderAction.action}` : "doctor-order-action-closed"}
        action={pendingOrderAction?.action ?? null}
        open={Boolean(pendingOrderAction)}
        order={orders.find((order) => order.id === pendingOrderAction?.orderId)}
        onOpenChange={(open) => {
          if (!open) setPendingOrderAction(null);
        }}
        onConfirm={(payload) => {
          if (!pendingOrderAction) return;
          changeOrderStatus(
            pendingOrderAction.orderId,
            pendingOrderAction.action === "Hold" ? "Held by doctor" : "Discontinued",
            payload,
          );
          setPendingOrderAction(null);
        }}
      />
      <DoctorOrderAmendDialog
        key={pendingAmendOrderId ?? "doctor-order-amend-closed"}
        open={Boolean(pendingAmendOrderId)}
        order={orders.find((order) => order.id === pendingAmendOrderId)}
        onOpenChange={(open) => {
          if (!open) setPendingAmendOrderId(null);
        }}
        onConfirm={(payload) => {
          if (!pendingAmendOrderId) return;
          copyOrderToDraft(pendingAmendOrderId, payload);
          setPendingAmendOrderId(null);
        }}
      />
    </div>
  );
}

function MedicationOrderComposer({
  draft,
  hasBlockingScenario,
  onDraftChange,
  onSaveDraft,
  onSignOrder,
  onCopyOrder,
  onHoldOrder,
  onResumeOrder,
  onSignDraft,
  onStopOrder,
  orders,
  scenarios,
  selectedMedicine,
}: {
  draft: MedicationOrderDraft;
  hasBlockingScenario: boolean;
  onDraftChange: (draft: Partial<MedicationOrderDraft>) => void;
  onSaveDraft: () => void;
  onSignOrder: () => void;
  onCopyOrder: (orderId: string) => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onSignDraft: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
  orders: DoctorMedicationOrder[];
  scenarios: MedicationScenario[];
  selectedMedicine?: FormularyMedicine;
}) {
  const [formularyQuery, setFormularyQuery] = React.useState("");
  const [orderSearch, setOrderSearch] = React.useState("");
  const [orderStatusFilter, setOrderStatusFilter] = React.useState<"All" | MedicationOrderStatus>("All");
  const [ordersOpen, setOrdersOpen] = React.useState(false);
  const [availableOnly, setAvailableOnly] = React.useState(true);
  const selectedPatient = icuPatients.find((patient) => patient.id === draft.patientId);
  const patientProfile = getPatientMedicationProfile(draft.patientId);
  const patientOrdersForPatient = orders.filter((order) => order.patientId === draft.patientId);
  const activeOrdersForPatient = patientOrdersForPatient.filter((order) => order.status === "Active");
  const visiblePatientOrders = patientOrdersForPatient.filter((order) => {
    const searchable = `${order.medication} ${order.indication} ${order.doctor} ${order.orderType} ${order.pharmacyStatus}`.toLowerCase();
    return searchable.includes(orderSearch.toLowerCase())
      && (orderStatusFilter === "All" || order.status === orderStatusFilter);
  });
  const draftOrderCount = patientOrdersForPatient.filter((order) => order.status === "Draft").length;
  const heldOrderCount = patientOrdersForPatient.filter((order) => order.status === "Held by doctor").length;
  const formularyResults = getFormularySearchResults(draft.department, formularyQuery, availableOnly);

  const selectMedicine = (medicine: FormularyMedicine) => {
    onDraftChange({
      formularyId: medicine.id,
      medication: medicine.name,
      dose: medicine.defaultDose,
      route: medicine.route,
      frequency: medicine.frequency,
      orderType: medicine.orderType,
      scheduleTimes: medicine.scheduleTimes,
      indication: medicine.indication,
      instructions: medicine.instructions,
      highRisk: medicine.highRisk,
      doubleVerificationRequired: medicine.doubleVerificationRequired,
      pharmacyStatus: pharmacyStatusFromAvailability(medicine.availability),
      maxDailyDose: medicine.orderType === "PRN" ? "As per prescribed daily limit" : "",
      minInterval: medicine.orderType === "PRN" ? "6 hours" : "",
      titrationTarget: medicine.orderType === "Continuous" ? "Clinical target as ordered" : "",
      minRate: medicine.orderType === "Continuous" ? "Starting rate" : "",
      maxRate: medicine.orderType === "Continuous" ? "Maximum safe rate" : "",
      monitoringFrequency: medicine.orderType === "Continuous" ? "Every 15 minutes until stable" : "",
      approvalReason: medicine.restricted ? medicine.indication : "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-background p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(240px,0.85fr)_minmax(0,1.25fr)_230px] xl:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Patient / bed</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={draft.patientId}
              onChange={(event) => onDraftChange({ patientId: event.target.value })}
            >
              {icuPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.bedNo} - {patient.patientName}</option>
              ))}
            </select>
          </label>

          <div className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Department</span>
            <div className="grid gap-2 sm:grid-cols-4 xl:grid-cols-7">
              {medicationDepartments.map((department) => (
                <Button
                  className="h-10 justify-center px-2 text-xs"
                  key={department}
                  size="sm"
                  variant={draft.department === department ? "default" : "outline"}
                  onClick={() => onDraftChange({
                    department,
                    formularyId: "",
                    medication: "",
                    dose: "",
                    indication: "",
                    instructions: "",
                    highRisk: false,
                    doubleVerificationRequired: false,
                    pharmacyStatus: "Available",
                  })}
                >
                  {department}
                </Button>
              ))}
            </div>
          </div>

          <SelectField label="Doctor" value={draft.doctor} onChange={(value) => onDraftChange({ doctor: value })} options={["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma"]} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MedicationContextTile label="Diagnosis" value={selectedPatient?.diagnosis ?? "-"} />
          <MedicationContextTile label="Weight" value={`${patientProfile.weightKg} kg`} />
          <MedicationContextTile label="Allergy" value={patientProfile.allergies.length ? patientProfile.allergies.join(", ") : "None"} tone={patientProfile.allergies.length ? "warning" : "success"} />
          <MedicationContextTile label="Renal / feeding" value={`${patientProfile.renalStatus} / ${patientProfile.feedingStatus}`} tone={patientProfile.renalStatus === "Normal" && patientProfile.feedingStatus !== "NPO" ? "success" : "warning"} />
          <MedicationContextTile label="Active meds" value={`${activeOrdersForPatient.length}`} tone={activeOrdersForPatient.length ? "info" : "success"} />
          <button
            className="min-h-20 rounded-md border border-primary/30 bg-primary/5 p-3 text-left transition hover:border-primary hover:bg-primary/10"
            type="button"
            onClick={() => setOrdersOpen(true)}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-medium text-primary">Patient orders</span>
              <Badge tone="info">{patientOrdersForPatient.length}</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">
              Active {activeOrdersForPatient.length} | Draft {draftOrderCount} | Held {heldOrderCount}
            </p>
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Medicine catalog</p>
              <p className="mt-1 text-xs text-muted-foreground">{draft.department} formulary with live pharmacy status.</p>
            </div>
            <Badge tone="info">{formularyResults.length}</Badge>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search medicine, generic, flag..." value={formularyQuery} onChange={(event) => setFormularyQuery(event.target.value)} />
            </div>
            <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3 text-xs text-muted-foreground">
              <span>Show stocked medicines first</span>
              <input checked={availableOnly} className="h-4 w-4" type="checkbox" onChange={(event) => setAvailableOnly(event.target.checked)} />
            </label>
          </div>
          <div className="mt-4 max-h-[590px] space-y-2 overflow-y-auto pr-1">
            {formularyResults.map((medicine) => (
              <button
                className={cn(
                  "w-full rounded-md border border-border bg-surface p-3 text-left transition hover:border-primary hover:bg-primary/5",
                  draft.formularyId === medicine.id ? "border-primary bg-primary/5" : "",
                )}
                key={medicine.id}
                type="button"
                onClick={() => selectMedicine(medicine)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{medicine.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{medicine.genericName}</p>
                  </div>
                  <StatusPill tone={formularyAvailabilityTone(medicine.availability)}>{medicine.availability}</StatusPill>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>{medicine.defaultDose}</span>
                  <span>{medicine.route}</span>
                  <span>{medicine.stockQty} {medicine.stockUnit}</span>
                  <span>{medicine.pharmacyLocation}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {medicine.highRisk ? <Badge tone="critical">High risk</Badge> : null}
                  {medicine.restricted ? <Badge tone="warning">Restricted</Badge> : null}
                  {medicine.safetyFlags.slice(0, 2).map((flag) => <Badge key={flag} tone="info">{flag}</Badge>)}
                </div>
              </button>
            ))}
            {!formularyResults.length ? <EmptyPanel title="No medicine found" detail="Change department, search, or stocked filter." /> : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-base font-semibold text-foreground">{selectedMedicine ? selectedMedicine.name : "Select medicine from catalog"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedMedicine ? `${selectedMedicine.pharmacyLocation} | ${selectedMedicine.stockQty} ${selectedMedicine.stockUnit} | ${selectedMedicine.departments.join(", ")}` : "Choose a medicine to prefill prescription details and safety checks."}
                </p>
                {selectedMedicine?.alternatives.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">Alternatives: {selectedMedicine.alternatives.join(", ")}</p>
                ) : null}
              </div>
              {selectedMedicine ? <StatusPill tone={formularyAvailabilityTone(selectedMedicine.availability)}>{selectedMedicine.availability}</StatusPill> : <Badge tone="warning">No medicine</Badge>}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <SelectField
                label="Order type"
                value={draft.orderType}
                onChange={(value) => {
                  const nextType = value as MedicationOrderType;
                  onDraftChange({
                    orderType: nextType,
                    scheduleTimes: nextType === "Continuous" ? "Running" : nextType === "PRN" ? "PRN" : nextType === "STAT" || nextType === "One-time" ? "Now" : draft.scheduleTimes,
                  });
                }}
                options={["Scheduled", "STAT", "PRN", "Continuous", "One-time"]}
              />
              <SelectField label="Pharmacy" value={draft.pharmacyStatus} onChange={(value) => onDraftChange({ pharmacyStatus: value as PharmacyStatus })} options={["Available", "Pending dispense", "Low stock", "Out of stock", "Restricted", "Shortage", "Substitution requested"]} />
              <TextField label="Medicine" value={draft.medication} onChange={(value) => onDraftChange({ medication: value, formularyId: "" })} placeholder="Select from catalog" />
              <TextField label="Dose" value={draft.dose} onChange={(value) => onDraftChange({ dose: value })} placeholder="1 g / sliding scale..." />
              <SelectField label="Route" value={draft.route} onChange={(value) => onDraftChange({ route: value })} options={["IV", "Infusion", "Oral/NG", "SC", "IM", "Nebulization"]} />
              <TextField label="Frequency" value={draft.frequency} onChange={(value) => onDraftChange({ frequency: value })} placeholder="q8h / OD / continuous" />
              {draft.orderType === "Scheduled" ? <TextField label="Schedule times" value={draft.scheduleTimes} onChange={(value) => onDraftChange({ scheduleTimes: value })} placeholder="08:00, 16:00, 00:00" /> : null}
              {draft.orderType === "STAT" || draft.orderType === "One-time" ? <TextField label="Administration time" value={draft.startTime} onChange={(value) => onDraftChange({ startTime: value, scheduleTimes: value || "Now" })} placeholder="Now / 14:30" /> : null}
              <TextField label="Indication" value={draft.indication} onChange={(value) => onDraftChange({ indication: value })} placeholder="Sepsis / fever / MAP support" />
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Start date</span>
                <Input type="date" value={draft.startDate} onChange={(event) => onDraftChange({ startDate: event.target.value })} />
              </label>
              {draft.orderType === "Scheduled" ? <TextField label="Duration" value={draft.duration} onChange={(value) => onDraftChange({ duration: value })} placeholder="5 days / until review" /> : null}
              {draft.orderType === "PRN" ? (
                <>
                  <TextField label="Minimum interval" value={draft.minInterval} onChange={(value) => onDraftChange({ minInterval: value })} placeholder="6 hours" />
                  <TextField label="Maximum daily dose" value={draft.maxDailyDose} onChange={(value) => onDraftChange({ maxDailyDose: value })} placeholder="3 doses / 4 g per day" />
                </>
              ) : null}
              {draft.orderType === "Continuous" ? (
                <>
                  <TextField label="Titration target" value={draft.titrationTarget} onChange={(value) => onDraftChange({ titrationTarget: value })} placeholder="MAP 65-75 / RASS -2" />
                  <TextField label="Starting / minimum rate" value={draft.minRate} onChange={(value) => onDraftChange({ minRate: value })} placeholder="0.05 mcg/kg/min" />
                  <TextField label="Maximum rate" value={draft.maxRate} onChange={(value) => onDraftChange({ maxRate: value })} placeholder="0.5 mcg/kg/min" />
                  <TextField label="Monitoring frequency" value={draft.monitoringFrequency} onChange={(value) => onDraftChange({ monitoringFrequency: value })} placeholder="Every 15 min until stable" />
                </>
              ) : null}
              {selectedMedicine?.restricted ? (
                <>
                  <TextField label="Approval / stewardship reason" value={draft.approvalReason} onChange={(value) => onDraftChange({ approvalReason: value })} placeholder="Clinical justification / approval" />
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Review date</span>
                    <Input type="date" value={draft.reviewDate} min={draft.startDate || undefined} onChange={(event) => onDraftChange({ reviewDate: event.target.value })} />
                  </label>
                </>
              ) : null}
              <label className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm">
                <input
                  checked={draft.highRisk}
                  className="h-4 w-4 shrink-0"
                  type="checkbox"
                  onChange={(event) => onDraftChange({ highRisk: event.target.checked, doubleVerificationRequired: event.target.checked || draft.doubleVerificationRequired })}
                />
                <span className="font-medium text-foreground">High-risk medicine</span>
              </label>
              <label className="flex min-h-12 items-center gap-2 rounded-md border border-border bg-surface p-3 text-sm">
                <input
                  checked={draft.doubleVerificationRequired}
                  className="h-4 w-4 shrink-0"
                  type="checkbox"
                  onChange={(event) => onDraftChange({ doubleVerificationRequired: event.target.checked })}
                />
                <span className="font-medium text-foreground">Double verification</span>
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="font-medium text-foreground">Instructions</span>
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Safety checks, vitals/lab conditions, infusion instruction..."
                  value={draft.instructions}
                  onChange={(event) => onDraftChange({ instructions: event.target.value })}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">
                {hasBlockingScenario ? "Draft can be saved, but blocking checks must be resolved before signing." : "Safety review passed. Signed order will create Nurse eMAR doses."}
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={onSaveDraft}><Save className="h-4 w-4" />Save draft</Button>
                <Button className="sm:min-w-40" disabled={hasBlockingScenario} onClick={onSignOrder}><FileSignature className="h-4 w-4" />Sign & submit</Button>
              </div>
            </div>
          </div>
          <MedicationScenarioPanel scenarios={scenarios} />
        </div>
      </div>
      <MedicationPatientOrdersDialog
        open={ordersOpen}
        onOpenChange={setOrdersOpen}
        orders={visiblePatientOrders}
        orderSearch={orderSearch}
        onOrderSearch={setOrderSearch}
        orderStatusFilter={orderStatusFilter}
        onOrderStatusFilter={setOrderStatusFilter}
        patient={selectedPatient}
        totalOrders={patientOrdersForPatient.length}
        onCopyOrder={(orderId) => {
          onCopyOrder(orderId);
          setOrdersOpen(false);
        }}
        onHoldOrder={onHoldOrder}
        onResumeOrder={onResumeOrder}
        onSignDraft={onSignDraft}
        onStopOrder={onStopOrder}
      />
    </div>
  );
}

function MedicationContextTile({ label, value, tone = "info" }: { label: string; value: string; tone?: StatusTone }) {
  return (
    <div className="min-h-20 rounded-md border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("mt-0.5 h-2 w-2 shrink-0 rounded-full", toneDotClass(tone))} />
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MedicationScenarioPanel({ scenarios }: { scenarios: MedicationScenario[] }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-foreground">Scenario checks</p>
        <Badge tone={scenarios.some((scenario) => scenario.blocking) ? "danger" : "success"}>{scenarios.length} checks</Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {scenarios.map((scenario) => (
          <div className={cn("rounded-md border p-3", scenario.blocking ? "border-danger/30 bg-danger/5" : "border-border bg-surface")} key={scenario.id}>
            <div className="flex items-start gap-2">
              <span className={cn("mt-0.5 rounded-md p-1", toneClass(scenario.tone))}>
                {scenario.blocking ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{scenario.detail}</p>
              </div>
            </div>
          </div>
        ))}
        {!scenarios.length ? <EmptyPanel title="No scenario generated" detail="Select a patient and medicine from formulary." /> : null}
      </div>
    </div>
  );
}

function MedicationPatientOrdersDialog({
  open,
  onOpenChange,
  orders,
  orderSearch,
  onOrderSearch,
  orderStatusFilter,
  onOrderStatusFilter,
  patient,
  totalOrders,
  onCopyOrder,
  onHoldOrder,
  onResumeOrder,
  onSignDraft,
  onStopOrder,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: DoctorMedicationOrder[];
  orderSearch: string;
  onOrderSearch: (value: string) => void;
  orderStatusFilter: "All" | MedicationOrderStatus;
  onOrderStatusFilter: (value: "All" | MedicationOrderStatus) => void;
  patient?: IcuPatient;
  totalOrders: number;
  onCopyOrder: (orderId: string) => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onSignDraft: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(780px,90dvh)] w-[min(980px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Patient Orders</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {patient ? `${patient.bedNo} - ${patient.patientName}` : "Selected ICU patient"} | {totalOrders} medication order(s)
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close patient orders" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="border-b border-border p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-end">
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Search order</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Medicine, indication, doctor, type, pharmacy..." value={orderSearch} onChange={(event) => onOrderSearch(event.target.value)} />
                </div>
              </label>
              <Button className="w-full lg:w-auto" variant="outline" onClick={() => {
                onOrderSearch("");
                onOrderStatusFilter("All");
              }}>
                <Filter className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="mt-3 flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
              {(["All", "Active", "Draft", "Held by doctor", "Discontinued"] as const).map((item) => (
                <button
                  className={cn("h-8 shrink-0 rounded px-3 text-xs font-medium", orderStatusFilter === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  key={item}
                  type="button"
                  onClick={() => onOrderStatusFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-4">
            <MedicationDoctorOrdersPanel
              orders={orders}
              onCopyOrder={onCopyOrder}
              onHoldOrder={onHoldOrder}
              onResumeOrder={onResumeOrder}
              onSignDraft={onSignDraft}
              onStopOrder={onStopOrder}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DoctorOrderAmendDialog({
  open,
  order,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  order?: DoctorMedicationOrder;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: DoctorOrderAmendPayload) => void;
}) {
  const [reason, setReason] = React.useState("Select reason");
  const [effectiveDate, setEffectiveDate] = React.useState("2026-06-09");
  const [effectiveTime, setEffectiveTime] = React.useState("Now");
  const [note, setNote] = React.useState("");
  const [changeAreas, setChangeAreas] = React.useState<Record<string, boolean>>({});
  const areas = ["Dose", "Route", "Frequency", "Schedule", "Duration", "Instructions", "Pharmacy / substitute", "Safety checks"];
  const selectedAreas = areas.filter((area) => changeAreas[area]);
  const canConfirm = Boolean(order)
    && reason !== "Select reason"
    && selectedAreas.length > 0
    && Boolean(effectiveDate)
    && Boolean(effectiveTime)
    && (reason !== "Other" || Boolean(note.trim()));

  if (!order) return null;

  const submit = () => {
    if (!canConfirm) {
      toast.error("Select change area, reason and effective time before creating amended draft.");
      return;
    }
    onConfirm({
      changeAreas: selectedAreas,
      reason,
      effectiveDate,
      effectiveTime,
      note,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Copy / Amend Order</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Original order remains unchanged. A new editable draft will be created.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close copy amend" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MedicationContextItem label="Medicine" value={`${order.medication} ${order.dose}`} />
              <MedicationContextItem label="Route / frequency" value={`${order.route} | ${order.frequency}`} />
              <MedicationContextItem label="Schedule" value={order.scheduleTimes.join(", ")} />
              <MedicationContextItem label="Status" value={order.status} />
            </div>

            <div>
              <p className="text-sm font-semibold text-foreground">What needs amendment?</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {areas.map((area) => (
                  <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm" key={area}>
                    <input
                      checked={Boolean(changeAreas[area])}
                      className="h-4 w-4 rounded border-border"
                      type="checkbox"
                      onChange={(event) => setChangeAreas((current) => ({ ...current, [area]: event.target.checked }))}
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NativeSelect
                label="Amendment reason"
                value={reason}
                onChange={setReason}
                options={[
                  "Select reason",
                  "Dose adjustment after review",
                  "Route change",
                  "Frequency / timing change",
                  "Clinical condition changed",
                  "Renal / hepatic adjustment",
                  "Pharmacy substitution",
                  "Duplicate therapy correction",
                  "Stewardship / antibiotic review",
                  "Other",
                ]}
              />
              <NativeSelect label="Effective time" value={effectiveTime} onChange={setEffectiveTime} options={["Now", "Next dose", "Next shift", "After review", "Custom noted below"]} />
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Effective date</span>
                <Input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} />
              </label>
              <TextField label="Doctor note" value={note} onChange={setNote} placeholder="What exactly should be changed and why?" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">{selectedAreas.length ? `${selectedAreas.length} amendment area(s) selected` : "Select amendment area before continuing"}</p>
            <div className="flex gap-2">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!canConfirm} onClick={submit}>
                <Copy className="h-4 w-4" />
                Create amended draft
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DoctorOrderStatusActionDialog({
  action,
  open,
  order,
  onOpenChange,
  onConfirm,
}: {
  action: DoctorOrderStatusAction | null;
  open: boolean;
  order?: DoctorMedicationOrder;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { reason: string; note: string; followUpPlan: string; effectiveTime: string }) => void;
}) {
  const [reason, setReason] = React.useState("Select reason");
  const [effectiveTime, setEffectiveTime] = React.useState("Now");
  const [reviewDate, setReviewDate] = React.useState("2026-06-09");
  const [reviewTime, setReviewTime] = React.useState("18:00");
  const [followUpPlan, setFollowUpPlan] = React.useState("");
  const [note, setNote] = React.useState("");
  const [checks, setChecks] = React.useState<Record<string, boolean>>({});

  if (!action || !order) return null;

  const isHold = action === "Hold";
  const reasonOptions = doctorOrderActionReasons(action);
  const checkLabels = doctorOrderActionChecks(action);
  const allChecksComplete = checkLabels.every((label) => checks[label]);
  const reasonMissing = !reason || reason === "Select reason";
  const noteMissing = reason === "Other" && !note.trim();
  const reviewMissing = isHold && (!reviewDate || !reviewTime);
  const planMissing = !isHold && !followUpPlan.trim();
  const canConfirm = allChecksComplete && !reasonMissing && !noteMissing && !reviewMissing && !planMissing;

  const submit = () => {
    if (!canConfirm) {
      toast.error("Reason, plan and confirmation checks are required.");
      return;
    }
    onConfirm({
      reason,
      note,
      followUpPlan: isHold ? `Review on ${reviewDate} ${reviewTime}${followUpPlan ? `; ${followUpPlan}` : ""}` : followUpPlan,
      effectiveTime,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] flex max-h-[90dvh] w-[min(720px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Doctor {isHold ? "hold" : "discontinue"} reason</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {order.bedNo} | {order.medication} {order.dose} | {order.frequency}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close doctor order action" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MedicationContextItem label="Order type" value={order.orderType} />
              <MedicationContextItem label="Route" value={order.route} />
              <MedicationContextItem label="Doctor" value={order.doctor} />
              <MedicationContextItem label="Status" value={order.status} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NativeSelect label="Reason node" value={reason} onChange={setReason} options={["Select reason", ...reasonOptions]} />
              <NativeSelect label="Effective time" value={effectiveTime} onChange={setEffectiveTime} options={["Now", "Next dose", "After current dose", "End of shift", "Custom noted below"]} />
              {isHold ? (
                <>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Review date</span>
                    <Input type="date" value={reviewDate} onChange={(event) => setReviewDate(event.target.value)} />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="font-medium text-foreground">Review time</span>
                    <Input type="time" value={reviewTime} onChange={(event) => setReviewTime(event.target.value)} />
                  </label>
                </>
              ) : (
                <TextField label="Replacement / follow-up plan" value={followUpPlan} onChange={setFollowUpPlan} placeholder="Alternative medicine, stop all future doses, pharmacy return, nurse instruction..." wide />
              )}
              {isHold ? <TextField label="Additional plan" value={followUpPlan} onChange={setFollowUpPlan} placeholder="Recheck labs, wait for doctor review, restart criteria..." wide /> : null}
            </div>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Doctor note</span>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Clinical reason, nurse/pharmacy instruction, adverse effect, lab/vitals context..."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <div>
              <p className="text-sm font-semibold text-foreground">Confirmation checks</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {checkLabels.map((label) => (
                  <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm" key={label}>
                    <input
                      checked={Boolean(checks[label])}
                      className="h-4 w-4 rounded border-border"
                      type="checkbox"
                      onChange={(event) => setChecks((current) => ({ ...current, [label]: event.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">{allChecksComplete ? "Checks complete" : `${checkLabels.filter((label) => checks[label]).length}/${checkLabels.length} checks complete`}</p>
            <div className="flex gap-2">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!canConfirm} onClick={submit}>
                <Check className="h-4 w-4" />
                Confirm {isHold ? "hold" : "discontinue"}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicationDoseCard({
  dose,
  selected,
  compact,
  onSelect,
  onRequestAction,
  onMarkPharmacyAvailable,
}: {
  dose: MedicationDoseRow;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
  onRequestAction: (action: MedicationNurseAction) => void;
  onMarkPharmacyAvailable: () => void;
}) {
  const patient = icuPatients.find((item) => item.id === dose.patientId);
  const isContinuous = dose.orderType === "Continuous";
  const needsPharmacy = dose.pharmacyStatus !== "Available";
  const needsVerification = dose.doubleVerification === "Pending";
  const isClosed = ["Administered", "Skipped", "Missed", "Refused", "Stopped"].includes(dose.status);
  const canAct = dose.orderStatus === "Active" && !isClosed;

  return (
    <div className={cn("rounded-md border bg-background p-3 transition", selected ? "border-primary bg-primary/5" : "border-border")}>
      <button className="w-full text-left" type="button" onClick={onSelect}>
        <div className={cn("grid gap-3", compact ? "lg:grid-cols-[150px_1fr]" : "lg:grid-cols-[160px_1fr_auto] lg:items-start")}>
          <div>
            <p className="text-sm font-semibold text-foreground">{dose.scheduledTime} · {dose.shift}</p>
            <p className="text-xs text-muted-foreground">{dose.scheduledDate}</p>
            <p className="text-xs text-muted-foreground">{dose.bedNo} | {patient?.patientName}</p>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{dose.medication} {dose.dose}</p>
              <StatusPill tone={medicationStatusTone(dose.status)}>{dose.status}</StatusPill>
              <Badge tone={orderTypeTone(dose.orderType)}>{dose.orderType}</Badge>
              {dose.highRisk ? <Badge tone="critical">High risk</Badge> : null}
              {needsVerification ? <Badge tone="warning">Verify pending</Badge> : null}
              {needsPharmacy ? <Badge tone={pharmacyStatusTone(dose.pharmacyStatus)}>{dose.pharmacyStatus}</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{dose.route} | {dose.frequency} | {dose.indication}</p>
            {!compact ? <p className="mt-1 text-xs text-muted-foreground">{dose.instructions}</p> : null}
          </div>
          {!compact ? (
            <div className="hidden text-right text-xs text-muted-foreground lg:block">
              <p>{dose.doctor}</p>
              <p>Actual: {dose.actualTime}</p>
              {dose.administeredBy !== "-" ? <p>{dose.administeredBy}</p> : null}
            </div>
          ) : null}
        </div>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        {needsPharmacy && canAct ? (
          <Button size="sm" variant="outline" onClick={onMarkPharmacyAvailable}><Syringe className="h-4 w-4" />Mark received</Button>
        ) : null}
        {needsVerification && canAct ? (
          <Button size="sm" variant="outline" onClick={() => onRequestAction("Verify")}><ShieldAlert className="h-4 w-4" />Verify</Button>
        ) : null}
        {isContinuous && canAct ? (
          <>
            {dose.status !== "Running" ? <Button size="sm" onClick={() => onRequestAction("Running")}><Activity className="h-4 w-4" />Start</Button> : null}
            {dose.status === "Running" ? <Button size="sm" variant="outline" onClick={() => onRequestAction("Paused")}>Pause</Button> : null}
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Stopped")}>Stop</Button>
          </>
        ) : !isContinuous && canAct ? (
          <>
            <Button size="sm" onClick={() => onRequestAction("Administered")}><Check className="h-4 w-4" />Give</Button>
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Held")}>Hold</Button>
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Skipped")}>Skip</Button>
            {dose.status === "Late" ? <Button size="sm" variant="outline" onClick={() => onRequestAction("Missed")}>Mark missed</Button> : null}
            <Button size="sm" variant="outline" onClick={() => onRequestAction("Refused")}>Refuse</Button>
          </>
        ) : null}
        {!canAct ? <span className="self-center text-xs text-muted-foreground">No further nursing action required.</span> : null}
      </div>
    </div>
  );
}

function MedicationSafetyPanel({
  dose,
  runningInfusionCount,
  onRequestAction,
  onMarkPharmacyAvailable,
}: {
  dose?: MedicationDoseRow;
  runningInfusionCount: number;
  onRequestAction: (action: MedicationNurseAction) => void;
  onMarkPharmacyAvailable: () => void;
}) {
  if (!dose) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Dose Safety Panel</CardTitle>
            <CardDescription>Select a medicine dose to act.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyPanel title="No dose selected" detail="Select a dose from eMAR timeline." />
        </CardContent>
      </Card>
    );
  }

  const patient = icuPatients.find((item) => item.id === dose.patientId);
  const checklist: Array<[string, string]> = [
    ["Patient", `${dose.bedNo} - ${patient?.patientName ?? "Patient"}`],
    ["Medicine", `${dose.medication} ${dose.dose}`],
    ["Schedule", `${dose.scheduledDate} ${dose.scheduledTime} | ${dose.shift}`],
    ["Route/frequency", `${dose.route} | ${dose.frequency}`],
    ["Doctor", dose.doctor],
    ["Pharmacy", dose.pharmacyStatus],
    ["Double check", dose.doubleVerification],
    ["Running infusions", String(runningInfusionCount)],
  ];
  const isContinuous = dose.orderType === "Continuous";
  const isClosed = ["Administered", "Skipped", "Missed", "Refused", "Stopped"].includes(dose.status);
  const canAct = dose.orderStatus === "Active" && !isClosed;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Dose Safety Panel</CardTitle>
          <CardDescription>5-rights, pharmacy, verification, and action note.</CardDescription>
        </div>
        <StatusPill tone={medicationStatusTone(dose.status)}>{dose.status}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <InfoPanel title="Selected dose" rows={checklist} />
        <div className="rounded-md border border-border bg-background p-3">
          <p className="text-sm font-semibold text-foreground">Clinical instruction</p>
          <p className="mt-2 text-xs text-muted-foreground">{dose.instructions}</p>
          <p className="mt-2 text-xs text-muted-foreground">Indication: {dose.indication}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {dose.pharmacyStatus !== "Available" ? <Button variant="outline" onClick={onMarkPharmacyAvailable}><Syringe className="h-4 w-4" />Mark received</Button> : null}
          {dose.doubleVerification === "Pending" && canAct ? <Button variant="outline" onClick={() => onRequestAction("Verify")}><ShieldAlert className="h-4 w-4" />Double verify</Button> : null}
          {isContinuous && canAct ? (
            <>
              {dose.status !== "Running" ? <Button onClick={() => onRequestAction("Running")}><Activity className="h-4 w-4" />Start infusion</Button> : null}
              {dose.status === "Running" ? <Button variant="outline" onClick={() => onRequestAction("Paused")}>Pause</Button> : null}
              <Button variant="outline" onClick={() => onRequestAction("Stopped")}>Stop</Button>
            </>
          ) : !isContinuous && canAct ? (
            <>
              <Button onClick={() => onRequestAction("Administered")}><Check className="h-4 w-4" />Give dose</Button>
              <Button variant="outline" onClick={() => onRequestAction("Held")}>Hold</Button>
              <Button variant="outline" onClick={() => onRequestAction("Skipped")}>Skip</Button>
              {dose.status === "Late" ? <Button variant="outline" onClick={() => onRequestAction("Missed")}>Mark missed</Button> : null}
              <Button variant="outline" onClick={() => onRequestAction("Refused")}>Refuse</Button>
            </>
          ) : null}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Audit trail</p>
          {dose.auditTrail.slice(0, 5).map((item, index) => (
            <div className="flex gap-2 rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={`${item}-${index}`}>
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MedicationActionDialog({
  action,
  dose,
  open,
  onOpenChange,
  onConfirm,
}: {
  action: MedicationNurseAction | null;
  dose?: MedicationDoseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { note: string; actualTime: string; administeredBy: string; verifier: string }) => void;
}) {
  const patient = icuPatients.find((item) => item.id === dose?.patientId);
  const initialClock = dose?.scheduledTime.match(/^\d{2}:\d{2}$/)?.[0] ?? "12:00";
  const [actualTime, setActualTime] = React.useState(initialClock);
  const [administeredBy, setAdministeredBy] = React.useState("Ward Nurse Current");
  const [verifier, setVerifier] = React.useState(allNurses.find((nurse) => nurse !== dose?.administeredBy) ?? "Head Nurse Sana");
  const [reason, setReason] = React.useState("");
  const [reviewTime, setReviewTime] = React.useState("");
  const [clinicalDetail, setClinicalDetail] = React.useState("");
  const [checks, setChecks] = React.useState<Record<string, boolean>>({});

  if (!dose || !action) return null;

  const isVerification = action === "Verify";
  const isAdministration = action === "Administered" || action === "Running";
  const requiresReason = ["Held", "Skipped", "Missed", "Refused", "Paused", "Stopped"].includes(action);
  const reasonOptions = medicationActionReasons(action);
  const checkLabels = medicationActionChecks(action, dose);
  const allChecksComplete = checkLabels.every((label) => checks[label]);
  const pharmacyBlocked = isAdministration && dose.pharmacyStatus !== "Available";
  const verificationBlocked = isAdministration && dose.doubleVerification === "Pending";
  const inactiveOrder = dose.orderStatus !== "Active";
  const prnAssessmentMissing = action === "Administered" && dose.orderType === "PRN" && !clinicalDetail.trim();
  const infusionDetailMissing = action === "Running" && !clinicalDetail.trim();
  const reasonMissing = requiresReason && (!reason.trim() || reason === "Select reason");
  const otherReasonMissing = reason === "Other" && !clinicalDetail.trim();
  const reviewTimeMissing = (action === "Held" || action === "Paused") && !reviewTime;
  const actualTimeMissing = !isVerification && !actualTime;
  const verifierMissing = isVerification && !verifier.trim();
  const canConfirm = allChecksComplete
    && !pharmacyBlocked
    && !verificationBlocked
    && !inactiveOrder
    && !prnAssessmentMissing
    && !infusionDetailMissing
    && !reasonMissing
    && !otherReasonMissing
    && !reviewTimeMissing
    && !actualTimeMissing
    && !verifierMissing;

  const confirmAction = () => {
    if (!canConfirm) {
      toast.error("Complete all required medication safety fields.");
      return;
    }
    const noteParts = [
      isVerification ? `Independent verification by ${verifier}` : medicationActionDefaultNote(action),
      reason ? `Reason: ${reason}` : "",
      clinicalDetail ? `${dose.orderType === "PRN" ? "Assessment" : action === "Running" ? "Infusion setup" : "Clinical detail"}: ${clinicalDetail}` : "",
      reviewTime ? `Review at ${reviewTime}` : "",
      !isVerification ? `Action time: ${actualTime}` : "",
      `Safety checks: ${checkLabels.join(", ")}`,
    ].filter(Boolean);
    onConfirm({
      note: noteParts.join(" | "),
      actualTime,
      administeredBy,
      verifier,
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(760px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">{medicationActionLabel(action)}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                {dose.bedNo} - {patient?.patientName} | {dose.medication} {dose.dose} | {dose.route}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close medication action" size="sm" variant="ghost"><X className="h-4 w-4" /></Button>
            </Dialog.Close>
          </div>

          <div className="min-h-0 space-y-4 overflow-y-auto p-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <MedicationContextItem label="Schedule" value={`${dose.scheduledDate} ${dose.scheduledTime}`} />
              <MedicationContextItem label="Order" value={`${dose.orderType} | ${dose.frequency}`} />
              <MedicationContextItem label="Pharmacy" value={dose.pharmacyStatus} />
              <MedicationContextItem label="Verification" value={dose.doubleVerification} />
            </div>

            {pharmacyBlocked || verificationBlocked || inactiveOrder ? (
              <div className="rounded-md border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
                {inactiveOrder ? "Doctor order is not active. " : ""}
                {pharmacyBlocked ? "Medicine must be received from pharmacy. " : ""}
                {verificationBlocked ? "Complete independent double verification before administration." : ""}
              </div>
            ) : null}

            <div>
              <p className="text-sm font-semibold text-foreground">Required safety checks</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {checkLabels.map((label) => (
                  <label className="flex min-h-11 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm" key={label}>
                    <input
                      checked={Boolean(checks[label])}
                      className="h-4 w-4 rounded border-border"
                      type="checkbox"
                      onChange={(event) => setChecks((current) => ({ ...current, [label]: event.target.checked }))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {isVerification ? (
              <NativeSelect label="Independent verifier" value={verifier} onChange={setVerifier} options={Array.from(new Set([...allNurses, "Head Nurse Sana"]))} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <NativeSelect label="Administering nurse" value={administeredBy} onChange={setAdministeredBy} options={Array.from(new Set(["Ward Nurse Current", ...allNurses]))} />
                <label className="space-y-1 text-sm">
                  <span className="font-medium text-foreground">Actual time</span>
                  <Input type="time" value={actualTime} onChange={(event) => setActualTime(event.target.value)} />
                </label>
              </div>
            )}

            {requiresReason ? (
              <NativeSelect label={`${medicationActionLabel(action)} reason`} value={reason} onChange={setReason} options={["Select reason", ...reasonOptions]} />
            ) : null}

            {action === "Held" || action === "Paused" ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Review / reassessment time</span>
                <Input type="time" value={reviewTime} onChange={(event) => setReviewTime(event.target.value)} />
              </label>
            ) : null}

            {action === "Administered" && dose.orderType === "PRN" ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">PRN indication and pre-assessment</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Pain score, temperature, symptom, or clinical trigger..."
                  value={clinicalDetail}
                  onChange={(event) => setClinicalDetail(event.target.value)}
                />
              </label>
            ) : null}

            {action === "Running" ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Infusion setup</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Pump ID, concentration, rate, line and target..."
                  value={clinicalDetail}
                  onChange={(event) => setClinicalDetail(event.target.value)}
                />
              </label>
            ) : null}

            {!isVerification && action !== "Running" && !(action === "Administered" && dose.orderType === "PRN") ? (
              <label className="space-y-1 text-sm">
                <span className="font-medium text-foreground">Clinical note</span>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Vitals/lab review, patient response, doctor communication, or additional note..."
                  value={clinicalDetail}
                  onChange={(event) => setClinicalDetail(event.target.value)}
                />
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-muted px-4 py-3">
            <p className="text-xs text-muted-foreground">{allChecksComplete ? "Safety checklist complete" : `${checkLabels.filter((label) => checks[label]).length}/${checkLabels.length} safety checks complete`}</p>
            <div className="flex gap-2">
              <Dialog.Close asChild><Button variant="outline">Cancel</Button></Dialog.Close>
              <Button disabled={!canConfirm} onClick={confirmAction}>
                <Check className="h-4 w-4" />
                Confirm {medicationActionLabel(action).toLowerCase()}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function MedicationContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function medicationActionLabel(action: MedicationNurseAction) {
  if (action === "Administered") return "Give dose";
  if (action === "Running") return "Start infusion";
  if (action === "Paused") return "Pause infusion";
  if (action === "Stopped") return "Stop infusion";
  if (action === "Verify") return "Double verification";
  return action;
}

function medicationActionDefaultNote(action: MedicationNurseAction) {
  if (action === "Administered") return "Dose administered after medication safety verification";
  if (action === "Running") return "Infusion started as prescribed";
  if (action === "Paused") return "Infusion paused after clinical review";
  if (action === "Stopped") return "Infusion stopped with reason documented";
  if (action === "Held") return "Dose held with clinical reason documented";
  if (action === "Skipped") return "Dose skipped with reason documented";
  if (action === "Missed") return "Missed dose documented and escalated";
  if (action === "Refused") return "Patient or family refusal documented";
  return "Independent double verification completed";
}

function medicationActionReasons(action: MedicationNurseAction) {
  if (action === "Held") return ["Clinical condition changed", "Required vital or lab not met", "Doctor instructed hold", "Patient NPO", "Other"];
  if (action === "Skipped") return ["Medicine unavailable", "Procedure or transfer in progress", "Dose no longer applicable", "Documentation correction", "Other"];
  if (action === "Missed") return ["Dose identified after allowed window", "Medicine unavailable beyond due time", "Patient unavailable", "Clinical emergency delayed administration", "Other"];
  if (action === "Refused") return ["Patient refused", "Family refused on patient behalf", "Unable to administer safely", "Other"];
  if (action === "Paused") return ["Clinical reassessment", "Line or pump issue", "Procedure or transport", "Doctor instruction", "Other"];
  if (action === "Stopped") return ["Infusion completed", "Doctor discontinued", "Adverse reaction suspected", "Line complication", "Other"];
  return [];
}

function medicationActionChecks(action: MedicationNurseAction, dose: MedicationDoseRow) {
  if (action === "Verify") return ["Medicine and dose independently matched", "Dose calculation independently checked", "Route, concentration, and pump settings checked"];
  if (action === "Administered" || action === "Running") {
    return [
      "Right patient confirmed",
      "Right medicine confirmed",
      "Right dose confirmed",
      "Right route confirmed",
      "Right time confirmed",
      "Allergy status reviewed",
      dose.highRisk ? "High-risk precautions reviewed" : "Required vitals and labs reviewed",
    ];
  }
  return ["Patient condition reviewed", "Doctor order status reviewed", "Escalation or communication requirement reviewed"];
}

function doctorOrderActionReasons(action: DoctorOrderStatusAction) {
  if (action === "Hold") {
    return [
      "Clinical condition changed",
      "Vitals unstable for administration",
      "Required lab value pending",
      "Renal / hepatic dose review pending",
      "Possible adverse reaction",
      "Procedure / transfer in progress",
      "Duplicate order needs review",
      "Pharmacy substitution pending",
      "Other",
    ];
  }
  return [
    "Treatment completed",
    "Medicine no longer indicated",
    "Adverse reaction / allergy suspected",
    "Duplicate or overlapping therapy",
    "Changed to alternative medicine",
    "Renal / hepatic safety concern",
    "Patient transferred / discharged",
    "End-of-life / comfort care decision",
    "Other",
  ];
}

function doctorOrderActionChecks(action: DoctorOrderStatusAction) {
  if (action === "Hold") {
    return [
      "Patient condition and latest vitals reviewed",
      "Nurse to be notified before next scheduled dose",
      "Pharmacy impact reviewed",
      "Review time documented",
    ];
  }
  return [
    "All future doses will be stopped",
    "Nurse and pharmacy communication required",
    "Replacement or follow-up plan documented",
    "Medication reconciliation impact reviewed",
  ];
}

function MedicationDoctorOrdersPanel({
  orders,
  onCopyOrder,
  onHoldOrder,
  onResumeOrder,
  onSignDraft,
  onStopOrder,
}: {
  orders: DoctorMedicationOrder[];
  onCopyOrder: (orderId: string) => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onSignDraft: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
}) {
  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const patient = icuPatients.find((item) => item.id === order.patientId);
        const formularyMedicine = getFormularyMedicineForOrder(order);
        const stockStatus = order.stockStatus ?? formularyMedicine?.availability;
        const pharmacyLocation = order.pharmacyLocation ?? formularyMedicine?.pharmacyLocation ?? "Pharmacy";
        const alternatives = order.alternativeMeds ?? formularyMedicine?.alternatives ?? [];
        const scenarioNotes = order.scenarioNotes ?? formularyMedicine?.safetyFlags ?? [];
        return (
          <div className="rounded-md border border-border bg-surface p-3" key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{order.medication} {order.dose}</p>
                <p className="mt-1 text-xs text-muted-foreground">{order.bedNo} | {patient?.patientName} | {order.doctor}</p>
              </div>
              <StatusPill tone={medicationOrderStatusTone(order.status)}>{order.status}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {order.department ? <Badge tone="info">{order.department}</Badge> : null}
              <Badge tone={orderTypeTone(order.orderType)}>{order.orderType}</Badge>
              <Badge tone={pharmacyStatusTone(order.pharmacyStatus)}>{order.pharmacyStatus}</Badge>
              {stockStatus ? <Badge tone={formularyAvailabilityTone(stockStatus)}>{stockStatus}</Badge> : null}
              {order.highRisk ? <Badge tone="critical">High risk</Badge> : null}
              {order.doubleVerificationRequired ? <Badge tone="warning">Double verify</Badge> : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{order.frequency} | {order.scheduleTimes.join(", ")} | {order.indication}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start: {order.startDate ?? "Not set"} {order.startTime ?? ""}{order.duration ? ` | Duration: ${order.duration}` : ""}
              {order.reviewDate ? ` | Review: ${order.reviewDate}` : ""}
            </p>
            {order.orderType === "PRN" ? <p className="mt-1 text-xs text-muted-foreground">PRN: minimum {order.minInterval || "not set"} | maximum {order.maxDailyDose || "not set"}</p> : null}
            {order.orderType === "Continuous" ? <p className="mt-1 text-xs text-muted-foreground">Target: {order.titrationTarget || "not set"} | Range: {order.minRate || "-"} to {order.maxRate || "-"}</p> : null}
            <p className="mt-1 text-xs text-muted-foreground">Pharmacy: {pharmacyLocation}{alternatives.length ? ` | Alternatives: ${alternatives.join(", ")}` : ""}</p>
            {order.statusReason ? (
              <div className="mt-3 rounded-md border border-warning/30 bg-warning/5 p-2 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Latest doctor reason: {order.statusReason}</p>
                {order.followUpPlan ? <p className="mt-1">{order.followUpPlan}</p> : null}
              </div>
            ) : null}
            {order.actionTimeline?.length ? (
              <div className="mt-2 space-y-1">
                {order.actionTimeline.slice(0, 2).map((item) => (
                  <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={item}>{item}</div>
                ))}
              </div>
            ) : null}
            {scenarioNotes.length ? (
              <div className="mt-3 grid gap-2">
                {scenarioNotes.slice(0, 2).map((note) => (
                  <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={note}>{note}</div>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.status === "Draft" ? (
                <Button size="sm" onClick={() => onSignDraft(order.id)}><FileSignature className="h-4 w-4" />Review & sign</Button>
              ) : order.status === "Held by doctor" ? (
                <Button size="sm" variant="outline" onClick={() => onResumeOrder(order.id)}>Resume</Button>
              ) : order.status === "Active" ? (
                <Button size="sm" variant="outline" onClick={() => onHoldOrder(order.id)}>Doctor hold</Button>
              ) : null}
              <Button size="sm" variant="outline" onClick={() => onCopyOrder(order.id)}><Copy className="h-4 w-4" />Copy / amend</Button>
              {order.status !== "Draft" ? <Button size="sm" variant="outline" onClick={() => onStopOrder(order.id)} disabled={order.status === "Discontinued"}>Discontinue</Button> : null}
            </div>
          </div>
        );
      })}
      {!orders.length ? <EmptyPanel title="No doctor order" detail="Add or search a medication order." /> : null}
    </div>
  );
}

export function AlertsEscalationWorkspace() {
  const [rows, setRows] = React.useState<WorkflowAlert[]>(() => icuAlerts.map((alert) => ({
    ...alert,
    status: alert.status === "Open" ? "New" : alert.status,
    assignedTo: alert.owner,
    timeline: [`${alert.createdAt}: ${alert.message}`],
  })));
  const [status, setStatus] = React.useState<"All status" | WorkflowAlertStatus>("All status");
  const [severity, setSeverity] = React.useState("All severity");
  const [selectedId, setSelectedId] = React.useState(rows[0]?.id ?? "");

  const visibleRows = rows.filter((row) => {
    return (status === "All status" || row.status === status) && (severity === "All severity" || row.severity === severity);
  });
  const selectedAlert = rows.find((row) => row.id === selectedId) ?? visibleRows[0] ?? rows[0];

  const changeAlert = (alertId: string, nextStatus: WorkflowAlertStatus) => {
    setRows((current) => current.map((row) => {
      if (row.id !== alertId) return row;
      const assignedTo = nextStatus === "Assigned" ? "Duty Doctor" : row.assignedTo;
      return {
        ...row,
        status: nextStatus,
        assignedTo,
        timeline: [`Now: ${nextStatus}${nextStatus === "Assigned" ? ` to ${assignedTo}` : ""}`, ...row.timeline],
      };
    }));
    toast.success(`Alert moved to ${nextStatus}`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {alertStatusFlow.map((item) => (
          <MetricTile key={item} label={item} value={rows.filter((row) => row.status === item).length} tone={alertStatusTone(item)} icon={item === "Closed" ? CheckCircle2 : ShieldAlert} />
        ))}
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[220px_220px_auto] md:items-end">
          <NativeSelect label="Alert status" value={status} onChange={(value) => setStatus(value as "All status" | WorkflowAlertStatus)} options={["All status", ...alertStatusFlow]} />
          <NativeSelect label="Severity" value={severity} onChange={setSeverity} options={["All severity", "Critical", "High", "Medium", "Info"]} />
          <Button variant="outline" onClick={() => {
            setStatus("All status");
            setSeverity("All severity");
          }}><Filter className="h-4 w-4" />Reset</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Alert Queue</CardTitle>
              <CardDescription>New, acknowledged, assigned, resolved, and closed alerts.</CardDescription>
            </div>
            <Badge tone="danger">{visibleRows.filter((row) => row.severity === "Critical").length} critical</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleRows.map((row) => {
              const patient = icuPatients.find((item) => item.id === row.patientId);
              return (
                <button
                  className={cn(
                    "w-full rounded-md border border-border bg-background p-3 text-left transition hover:bg-surface-muted",
                    selectedAlert?.id === row.id ? "border-primary bg-primary/5" : "",
                  )}
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{row.bedNo} - {patient?.patientName}</p>
                      <p className="text-xs text-muted-foreground">{row.type} | {row.source}</p>
                    </div>
                    <Badge tone={toneForPriority(row.severity === "Info" ? "Routine" : row.severity)}>{row.severity}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{row.message}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <StatusPill tone={toneForStatus(row.status)}>{row.status}</StatusPill>
                    <span className="text-xs text-muted-foreground">{row.createdAt}</span>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Escalation Detail</CardTitle>
              <CardDescription>Action flow and status history.</CardDescription>
            </div>
            {selectedAlert ? <StatusPill tone={toneForStatus(selectedAlert.status)}>{selectedAlert.status}</StatusPill> : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAlert ? (
              <>
                <div className="rounded-md border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={toneForPriority(selectedAlert.severity === "Info" ? "Routine" : selectedAlert.severity)}>{selectedAlert.severity}</Badge>
                    <Badge tone="info">{selectedAlert.assignedTo}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">{selectedAlert.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{selectedAlert.source} | {selectedAlert.createdAt}</p>
                </div>

                <div className="grid gap-2 sm:grid-cols-4">
                  <Button size="sm" onClick={() => changeAlert(selectedAlert.id, "Acknowledged")} disabled={selectedAlert.status !== "New"}><Check className="h-4 w-4" />Ack</Button>
                  <Button size="sm" variant="outline" onClick={() => changeAlert(selectedAlert.id, "Assigned")} disabled={!["New", "Acknowledged"].includes(selectedAlert.status)}>Assign</Button>
                  <Button size="sm" variant="outline" onClick={() => changeAlert(selectedAlert.id, "Resolved")} disabled={["Resolved", "Closed"].includes(selectedAlert.status)}>Resolve</Button>
                  <Button size="sm" variant="outline" onClick={() => changeAlert(selectedAlert.id, "Closed")} disabled={selectedAlert.status !== "Resolved"}>Close</Button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Timeline</p>
                  {selectedAlert.timeline.map((item, index) => (
                    <div className="flex gap-2 rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={`${item}-${index}`}>
                      <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyPanel title="No alert selected" detail="Select an alert from queue." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function WorkflowReportsWorkspace() {
  const medicationCompliance = Math.round((medicationRows.filter((row) => row.status === "Administered").length / medicationRows.length) * 100);
  const taskCompletion = Math.round((icuTasks.filter((task) => task.status === "Completed").length / icuTasks.length) * 100);
  const alertClosure = Math.round((icuAlerts.filter((alert) => alert.status === "Resolved").length / icuAlerts.length) * 100);
  const chartRows = [
    { name: "Medication", value: medicationCompliance },
    { name: "Tasks", value: taskCompletion },
    { name: "Alerts", value: alertClosure },
    { name: "Handover", value: 72 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Med compliance" value={`${medicationCompliance}%`} tone={medicationCompliance > 80 ? "success" : "warning"} icon={Pill} />
        <MetricTile label="Task completion" value={`${taskCompletion}%`} tone={taskCompletion > 80 ? "success" : "warning"} icon={ListChecks} />
        <MetricTile label="Alert closure" value={`${alertClosure}%`} tone={alertClosure > 80 ? "success" : "danger"} icon={AlertCircle} />
        <MetricTile label="Signal issues" value={deviceRows.filter((row) => row.signal !== "Good").length} tone="warning" icon={MonitorDot} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Workflow Compliance</CardTitle>
              <CardDescription>Current ICU nursing workflow completion snapshot.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartRows.map((row) => (
              <div className="space-y-2" key={row.name}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{row.name}</span>
                  <span className="text-muted-foreground">{row.value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-surface-muted">
                  <div className={cn("h-full rounded-full", row.value >= 80 ? "bg-success" : row.value >= 60 ? "bg-warning" : "bg-danger")} style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Device Signal Health</CardTitle>
              <CardDescription>Bed-wise monitor, ventilator, and pump connectivity.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {deviceRows.map((device) => (
              <div className="rounded-md border border-border bg-background p-3" key={device.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{device.bedNo} - {device.patientName}</p>
                    <p className="text-xs text-muted-foreground">Last data: {device.lastData}</p>
                  </div>
                  <StatusPill tone={device.signal === "Good" ? "success" : "warning"}>{device.signal}</StatusPill>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <span>Monitor: {device.monitor}</span>
                  <span>Ventilator: {device.ventilator}</span>
                  <span>Infusion pump: {device.infusionPump}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Operational Reports</CardTitle>
            <CardDescription>Occupancy, compliance, transfusion, fluid balance, and follow-up reports.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map((row) => (
                <tr className="border-t border-border" key={row.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{row.report}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.scope}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.count}</td>
                  <td className="px-4 py-3"><StatusPill tone={toneForStatus(row.status)}>{row.status}</StatusPill></td>
                  <td className="px-4 py-3 text-muted-foreground">{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientMiniCard({ patient, active, onSelect }: { patient: IcuPatient; active: boolean; onSelect: () => void }) {
  return (
    <button
      className={cn(
        "w-full rounded-md border border-border bg-background p-3 text-left transition hover:bg-surface-muted",
        active ? "border-primary bg-primary/5" : "",
      )}
      type="button"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{patient.bedNo} - {patient.patientName}</p>
          <p className="text-xs text-muted-foreground">{patient.mrn} | {patient.ageGender}</p>
        </div>
        <Badge tone={patient.criticalityScore >= 8 ? "critical" : "warning"}>Score {patient.criticalityScore}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{patient.diagnosis}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        <StatusPill tone={toneForStatus(patient.currentStatus)}>{patient.currentStatus}</StatusPill>
        <Badge tone={patient.pendingTasks ? "warning" : "success"}>{patient.pendingTasks} tasks</Badge>
      </div>
    </button>
  );
}

function PatientActionWorkspace({ patient }: { patient?: IcuPatient }) {
  const [note, setNote] = React.useState("");

  if (!patient) return <EmptyPanel title="No patient selected" detail="Select a patient from the bed board." />;

  const vitals = icuVitals.filter((row) => row.patientId === patient.id);
  const tasks = icuTasks.filter((row) => row.patientId === patient.id);
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const alerts = icuAlerts.filter((row) => row.patientId === patient.id);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{patient.patientName}</CardTitle>
          <CardDescription>{patient.bedNo} | {patient.unit} | {patient.admissionSource}</CardDescription>
        </div>
        <StatusPill tone={toneForStatus(patient.currentStatus)}>{patient.currentStatus}</StatusPill>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Vitals rows" value={vitals.length} tone={vitals.some((row) => row.abnormal) ? "danger" : "success"} icon={HeartPulse} />
          <MetricTile label="Open tasks" value={tasks.filter((row) => row.status !== "Completed").length} tone="warning" icon={ListChecks} />
          <MetricTile label="Due meds" value={meds.filter((row) => ["Due", "Late"].includes(row.status)).length} tone="danger" icon={Pill} />
          <MetricTile label="Alerts" value={alerts.length} tone={alerts.some((row) => row.severity === "Critical") ? "critical" : "warning"} icon={AlertTriangle} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <InfoPanel title="Clinical Snapshot" rows={[
            ["Diagnosis", patient.diagnosis],
            ["Ventilator", patient.ventilatorStatus],
            ["Doctor", patient.admittingDoctor],
            ["Ward nurse", patient.assignedWardNurse],
          ]} />
          <InfoPanel title="Device Snapshot" rows={[
            ["Monitor", deviceRows.find((row) => row.bedNo === patient.bedNo)?.monitor ?? "Not mapped"],
            ["Ventilator", deviceRows.find((row) => row.bedNo === patient.bedNo)?.ventilator ?? patient.ventilatorStatus],
            ["Pump", deviceRows.find((row) => row.bedNo === patient.bedNo)?.infusionPump ?? "Not mapped"],
            ["Last data", deviceRows.find((row) => row.bedNo === patient.bedNo)?.lastData ?? "Pending"],
          ]} />
        </div>

        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Quick nursing note</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="Add observation, action, or handover note..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={() => toast.success("Monitoring action opened")}>Monitor</Button>
          <Button variant="outline" onClick={() => toast.success("Medication timeline opened")}>Medication</Button>
          <Button onClick={() => {
            toast.success("Nursing note saved");
            setNote("");
          }}><FileText className="h-4 w-4" />Save note</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SmartBedView({ patient }: { patient?: IcuPatient }) {
  const [section, setSection] = React.useState("Nurse Entry");

  if (!patient) return <EmptyPanel title="No patient selected" detail="Select a patient from the bed board." />;

  const vitals = icuVitals.filter((row) => row.patientId === patient.id);
  const trendRows = vitals.length ? vitals : icuVitals;
  const meds = medicationRows.filter((row) => row.patientId === patient.id);
  const tasks = icuTasks.filter((row) => row.patientId === patient.id);
  const alerts = icuAlerts.filter((row) => row.patientId === patient.id);
  const fluids = infusionRows.filter((row) => row.patientId === patient.id);
  const ioRows = intakeOutputRows.filter((row) => row.patientId === patient.id);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Smart Bed View</CardTitle>
          <CardDescription>{patient.bedNo} | {patient.patientName} | {patient.diagnosis}</CardDescription>
        </div>
        <Badge tone={patient.criticalityScore >= 8 ? "critical" : "warning"}>Risk {patient.criticalityScore}/10</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="SpO2" value={`${vitals[0]?.spo2 ?? 96}%`} tone={(vitals[0]?.spo2 ?? 96) < 92 ? "critical" : "success"} icon={HeartPulse} />
          <MetricTile label="BP" value={vitals[0]?.bp ?? "118/76"} tone={vitals.some((row) => row.abnormal) ? "danger" : "success"} icon={Activity} />
          <MetricTile label="Ventilator" value={patient.ventilatorStatus} tone={patient.ventilatorStatus === "Room air" ? "success" : "warning"} icon={MonitorDot} />
          <MetricTile label="Urine" value={`${vitals[0]?.urineOutput ?? 45} ml/hr`} tone={(vitals[0]?.urineOutput ?? 45) < 30 ? "danger" : "success"} icon={Syringe} />
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1">
          {["Nurse Entry", "Medication", "Alerts", "Tasks", "Timeline"].map((item) => (
            <button
              className={cn("h-8 shrink-0 rounded px-3 text-xs font-medium transition", section === item ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              key={item}
              type="button"
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {section === "Nurse Entry" ? (
          <div className="space-y-4 rounded-md border border-border bg-background p-3">
            {[
              { label: "Pulse", key: "pulse" as const, max: 150, color: "bg-danger" },
              { label: "SpO2", key: "spo2" as const, max: 100, color: "bg-info" },
            ].map((metric) => (
              <div className="space-y-2" key={metric.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{metric.label}</span>
                  <span className="text-muted-foreground">Latest {trendRows.at(-1)?.[metric.key]}</span>
                </div>
                <div className="grid grid-cols-4 items-end gap-2">
                  {trendRows.slice(0, 4).map((row) => (
                    <div className="flex h-24 flex-col items-center justify-end gap-1" key={`${metric.key}-${row.id}`}>
                      <span className="text-[11px] text-muted-foreground">{row[metric.key]}</span>
                      <div className={`w-full rounded-t ${metric.color}`} style={{ height: `${Math.max(10, Math.min(100, (row[metric.key] / metric.max) * 100))}%` }} />
                      <span className="text-[11px] text-muted-foreground">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {section === "Medication" ? <SimpleRows rows={meds.map((row) => [`${row.scheduledTime} ${row.medication}`, `${row.dose} | ${row.status}`])} empty="No medication rows." /> : null}
        {section === "Alerts" ? <SimpleRows rows={alerts.map((row) => [`${row.type} - ${row.severity}`, row.message])} empty="No alert rows." /> : null}
        {section === "Tasks" ? <SimpleRows rows={tasks.map((row) => [`${row.title}`, `${row.status} | ${row.dueTime}`])} empty="No task rows." /> : null}
        {section === "Timeline" ? (
          <SimpleRows
            rows={[
              [`Admission`, `${patient.admissionTime} from ${patient.admissionSource}`],
              ...vitals.map((row) => [`Vitals ${row.time}`, row.note]),
              ...fluids.map((row) => [`Infusion ${row.startTime}`, `${row.fluidName} ${row.status}`]),
              ...ioRows.map((row) => [`I/O ${row.time}`, `${row.intakeMl} ml in / ${row.outputMl} ml out`]),
            ]}
            empty="No timeline rows."
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function TaskCard({ task, onChangeStatus }: { task: IcuTask; onChangeStatus: (taskId: string, status: IcuTask["status"]) => void }) {
  const assignedBy = task.assignedBy ?? task.createdBy;
  const taskSource = task.source ?? task.createdBy;
  const ackStatus = task.acknowledgementStatus ?? (task.requiresAcknowledgement ? "Pending" : "Not required");

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{task.bedNo}</p>
          <p className="text-xs text-muted-foreground">{task.patientName}</p>
        </div>
        <Badge tone={toneForPriority(task.priority)}>{task.priority}</Badge>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{task.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge tone={task.status === "Overdue" || task.status === "Escalated" ? "danger" : task.status === "Completed" ? "success" : "info"}>{task.status}</Badge>
        <span>{taskSource}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{task.dueTime}</span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs font-medium text-foreground">
        <span className="truncate">{assignedBy}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="truncate">{task.assignedTo}</span>
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{task.remarks}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {task.requiresAcknowledgement && ackStatus !== "Accepted" ? (
          <Button size="sm" variant="outline" onClick={() => onChangeStatus(task.id, "Accepted")}>Accept</Button>
        ) : null}
        {task.status !== "In progress" && task.status !== "Completed" ? (
          <Button size="sm" variant="outline" onClick={() => onChangeStatus(task.id, "In progress")}>Start</Button>
        ) : null}
        {task.status !== "Completed" ? (
          <Button size="sm" onClick={() => onChangeStatus(task.id, "Completed")}>Done</Button>
        ) : null}
        {task.status !== "Completed" && task.status !== "Escalated" ? (
          <Button size="sm" variant="outline" onClick={() => onChangeStatus(task.id, "Escalated")}>Escalate</Button>
        ) : null}
      </div>
    </div>
  );
}

function PatientSnapshot({ patient }: { patient?: IcuPatient }) {
  if (!patient) return null;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{patient.bedNo} Snapshot</CardTitle>
          <CardDescription>{patient.patientName}</CardDescription>
        </div>
        <Badge tone={patient.criticalityScore >= 8 ? "critical" : "warning"}>Score {patient.criticalityScore}</Badge>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <InfoLine label="Status" value={patient.currentStatus} />
        <InfoLine label="Diagnosis" value={patient.diagnosis} />
        <InfoLine label="Nurse" value={patient.assignedWardNurse} />
        <InfoLine label="Tasks" value={`${patient.pendingTasks} pending`} />
      </CardContent>
    </Card>
  );
}

function AdmissionCandidatePanel({ candidate, blockReason }: { candidate?: AdmissionPatientCandidate; blockReason: string }) {
  if (!candidate) return <EmptyPanel title="No patient selected" detail="Search and select patient/MRN to load ICU admission context." />;

  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{candidate.patientName}</p>
          <p className="mt-1 text-xs text-muted-foreground">{candidate.mrn} | {candidate.ageGender} | {candidate.currentLocation}</p>
          <p className="mt-1 text-xs text-muted-foreground">{candidate.diagnosis}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={admissionPatientTone(candidate.patientStatus)}>{candidate.patientStatus}</Badge>
          <Badge tone={candidate.duplicateBlock ? "danger" : "success"}>{candidate.duplicateBlock ? "Duplicate blocked" : "Eligible"}</Badge>
        </div>
      </div>
      {blockReason ? (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 p-2 text-xs font-medium text-warning">{blockReason}</div>
      ) : (
        <div className="mt-3 rounded-md border border-success/30 bg-success/10 p-2 text-xs font-medium text-success">Patient can proceed after bed, doctor acceptance, and readiness checks.</div>
      )}
    </div>
  );
}

function AdmissionSourceScenarioPanel({ source }: { source: string }) {
  const scenario = getAdmissionScenario(source);

  return (
    <div className="grid gap-3 md:col-span-2 lg:grid-cols-2">
      <div className="rounded-md border border-border bg-background p-3">
        <p className="text-sm font-semibold text-foreground">{scenario.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">Readiness focus for this admission source.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {scenario.readinessFocus.map((item) => <Badge key={item} tone="info">{item}</Badge>)}
        </div>
      </div>
      <div className="rounded-md border border-border bg-background p-3">
        <p className="text-sm font-semibold text-foreground">Scenario risks</p>
        <div className="mt-3 space-y-2">
          {scenario.risks.map((risk) => (
            <div className="flex items-center gap-2 text-xs text-muted-foreground" key={risk}>
              <AlertCircle className="h-3.5 w-3.5 text-warning" />
              <span>{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdmissionBedPanel({ bed }: { bed?: IcuAdmissionBedOption }) {
  if (!bed) return <EmptyPanel title="No ICU bed selected" detail="Select bed to verify availability and capability." />;

  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{bed.bedNo} | {bed.unit}</p>
          <p className="mt-1 text-xs text-muted-foreground">{bed.capability}</p>
          <p className="mt-1 text-xs text-muted-foreground">{bed.note}</p>
        </div>
        <Badge tone={admissionBedTone(bed.status)}>{bed.status}</Badge>
      </div>
    </div>
  );
}

function AdmissionReadinessChecklist({ selected, onToggle }: { selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">ICU receive readiness checklist</p>
          <p className="mt-1 text-xs text-muted-foreground">All checks must be complete before final admission.</p>
        </div>
        <Badge tone={selected.length === admissionReadinessItems.length ? "success" : "warning"}>{selected.length}/{admissionReadinessItems.length}</Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {admissionReadinessItems.map((item) => {
          const checked = selected.includes(item);
          return (
            <label className={cn("flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm", checked ? "border-success/40 bg-success/10 text-success" : "border-border bg-surface-muted text-muted-foreground")} key={item}>
              <input checked={checked} className="h-4 w-4" type="checkbox" onChange={() => onToggle(item)} />
              <span>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function AdmissionReview({ draft, blockReason, bed }: { draft: AdmissionDraft; blockReason: string; bed?: IcuAdmissionBedOption }) {
  const readiness = getReadinessValues(draft.readiness);
  return (
    <div className="space-y-3">
      {blockReason ? (
        <div className="rounded-md border border-danger/30 bg-danger/10 p-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-danger" />
            <div>
              <p className="text-sm font-semibold text-danger">Admission blocked</p>
              <p className="mt-1 text-xs text-danger">{blockReason}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-md border border-success/30 bg-success/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
            <div>
              <p className="text-sm font-semibold text-success">Ready for ICU admission</p>
              <p className="mt-1 text-xs text-success">Patient, bed, acceptance, and receive checklist are complete.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <InfoPanel title="Patient" rows={[
          ["Patient", draft.patientName],
          ["MRN / UHID", draft.mrn],
          ["Age / gender", draft.ageGender],
          ["Current location", draft.currentLocation],
          ["Status", draft.patientStatus],
        ]} />
        <InfoPanel title="Admission" rows={[
          ["ICU admission no", draft.icuAdmissionNo],
          ["Source", draft.source],
          ["Source detail", draft.sourceDetail],
          ["Handover by", draft.handoverBy],
          ["Doctor acceptance", draft.acceptanceStatus],
        ]} />
        <InfoPanel title="Bed & device" rows={[
          ["Unit", draft.unit],
          ["Bed", draft.bedNo],
          ["Bed status", bed?.status ?? "-"],
          ["Admitting team", draft.admittingTeam],
          ["Ventilator / oxygen", draft.ventilator],
          ["Devices", draft.devices],
        ]} />
        <InfoPanel title="Clinical" rows={[
          ["Diagnosis", draft.diagnosis],
          ["Condition", draft.condition],
          ["Risk", draft.risk],
          ["Isolation", draft.isolation],
          ["Medication", draft.medication],
        ]} />
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-foreground">Receive checklist</p>
          <Badge tone={readiness.length === admissionReadinessItems.length ? "success" : "warning"}>{readiness.length}/{admissionReadinessItems.length}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {admissionReadinessItems.map((item) => <Badge key={item} tone={readiness.includes(item) ? "success" : "muted"}>{item}</Badge>)}
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, tone, icon: Icon }: { label: string; value: React.ReactNode; tone: StatusTone; icon: typeof Activity }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("rounded-md p-1.5", toneClass(tone))}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map(([label, value]) => <InfoLine key={label} label={label} value={value} />)}
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function SimpleRows({ rows, empty }: { rows: string[][]; empty: string }) {
  if (!rows.length) return <EmptyPanel title={empty} detail="No matching workflow data." />;
  return (
    <div className="space-y-2">
      {rows.map(([title, detail], index) => (
        <div className="rounded-md border border-border bg-background p-3" key={`${title}-${index}`}>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface-muted p-6 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  wide?: boolean;
}) {
  return (
    <label className={cn("space-y-1 text-sm", wide ? "md:col-span-2" : "")}>
      <span className="font-medium text-foreground">{label}</span>
      <Input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="flex h-10 w-full items-center rounded-md border border-input bg-surface-muted px-3 text-sm font-semibold text-foreground">
        {value || "-"}
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-1 text-sm md:col-span-2">
      <span className="font-medium text-foreground">{label}</span>
      <textarea
        className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  renderOption,
  wide,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  renderOption?: (value: string) => string;
  wide?: boolean;
}) {
  return (
    <label className={cn("min-w-0 space-y-1 text-sm", wide ? "md:col-span-2" : "")}>
      <span className="font-medium text-foreground">{label}</span>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{renderOption ? renderOption(option) : option}</option>
        ))}
      </select>
    </label>
  );
}

function toneClass(tone: StatusTone) {
  if (tone === "success") return "bg-success/10 text-success";
  if (tone === "warning") return "bg-warning/10 text-warning";
  if (tone === "danger") return "bg-danger/10 text-danger";
  if (tone === "critical") return "bg-critical/10 text-critical";
  if (tone === "info") return "bg-info/10 text-info";
  return "bg-muted text-muted-foreground";
}

function toneDotClass(tone: StatusTone) {
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  if (tone === "danger") return "bg-danger";
  if (tone === "critical") return "bg-critical";
  if (tone === "info") return "bg-info";
  return "bg-muted-foreground";
}

function getPatientMedicationProfile(patientId: string) {
  return patientMedicationProfiles.find((profile) => profile.patientId === patientId) ?? {
    patientId,
    weightKg: 70,
    allergies: [],
    renalStatus: "Normal",
    liverStatus: "Normal",
    feedingStatus: "Oral allowed",
    ageGroup: "Adult",
  } satisfies PatientMedicationProfile;
}

function getSelectedFormularyMedicine(draft: MedicationOrderDraft) {
  const normalizedMedicine = draft.medication.trim().toLowerCase();
  return pharmacyFormulary.find((medicine) => medicine.id === draft.formularyId)
    ?? pharmacyFormulary.find((medicine) => medicine.name.toLowerCase() === normalizedMedicine || medicine.genericName.toLowerCase() === normalizedMedicine);
}

function getFormularyMedicineForOrder(order: DoctorMedicationOrder) {
  const normalizedMedicine = order.medication.trim().toLowerCase();
  return pharmacyFormulary.find((medicine) => medicine.id === order.formularyId)
    ?? pharmacyFormulary.find((medicine) => medicine.name.toLowerCase() === normalizedMedicine || medicine.genericName.toLowerCase() === normalizedMedicine);
}

function getFormularySearchResults(department: MedicationDepartment, query: string, availableOnly: boolean) {
  const normalizedQuery = query.trim().toLowerCase();
  return pharmacyFormulary.filter((medicine) => {
    const searchable = `${medicine.name} ${medicine.genericName} ${medicine.indication} ${medicine.safetyFlags.join(" ")} ${medicine.alternatives.join(" ")}`.toLowerCase();
    const matchesDepartment = medicine.departments.includes(department);
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesAvailability = !availableOnly || medicine.availability !== "Out of stock";
    return matchesDepartment && matchesQuery && matchesAvailability;
  });
}

function pharmacyStatusFromAvailability(availability: FormularyAvailability): PharmacyStatus {
  if (availability === "Low stock") return "Low stock";
  if (availability === "Out of stock") return "Out of stock";
  if (availability === "Restricted") return "Restricted";
  return "Available";
}

function getDoctorOrderScenarios(draft: MedicationOrderDraft, orders: DoctorMedicationOrder[]): MedicationScenario[] {
  const scenarios: MedicationScenario[] = [];
  const selectedMedicine = getSelectedFormularyMedicine(draft);
  const patient = icuPatients.find((item) => item.id === draft.patientId);
  const profile = getPatientMedicationProfile(draft.patientId);
  const activeDuplicate = orders.find((order) => {
    return order.patientId === draft.patientId
      && order.status === "Active"
      && draft.medication.trim()
      && order.medication.toLowerCase() === draft.medication.trim().toLowerCase();
  });

  scenarios.push({
    id: "patient-context",
    title: patient ? `${patient.bedNo} patient context loaded` : "Patient context missing",
    detail: patient ? `${patient.patientName}, ${profile.weightKg} kg, ${profile.renalStatus} renal status, ${profile.feedingStatus}.` : "Select patient before prescribing.",
    tone: patient ? "info" : "danger",
    blocking: !patient,
  });

  if (!selectedMedicine) {
    scenarios.push({
      id: "formulary-required",
      title: "Select medicine from pharmacy formulary",
      detail: "Doctor order should come from department formulary so stock, restriction, and alternatives can be checked.",
      tone: "danger",
      blocking: true,
    });
    return scenarios;
  }

  scenarios.push({
    id: "pharmacy-stock",
    title: `${selectedMedicine.availability} in ${selectedMedicine.pharmacyLocation}`,
    detail: `${selectedMedicine.stockQty} ${selectedMedicine.stockUnit} available. Alternatives: ${selectedMedicine.alternatives.join(", ") || "Not listed"}.`,
    tone: formularyAvailabilityTone(selectedMedicine.availability),
    blocking: selectedMedicine.availability === "Out of stock",
  });

  if (selectedMedicine.departments.includes(draft.department)) {
    scenarios.push({
      id: "department-match",
      title: `${draft.department} formulary match`,
      detail: `${selectedMedicine.name} is mapped to ${selectedMedicine.departments.join(", ")}.`,
      tone: "success",
    });
  } else {
    scenarios.push({
      id: "department-mismatch",
      title: "Department mismatch",
      detail: `${selectedMedicine.name} is not mapped to ${draft.department}. Select another department or medicine.`,
      tone: "danger",
      blocking: true,
    });
  }

  const allergyMatch = profile.allergies.find((allergy) => {
    const allergyText = allergy.toLowerCase();
    return selectedMedicine.name.toLowerCase().includes(allergyText)
      || selectedMedicine.genericName.toLowerCase().includes(allergyText)
      || selectedMedicine.alternatives.some((alternative) => alternative.toLowerCase().includes(allergyText));
  });
  if (allergyMatch) {
    scenarios.push({
      id: "allergy-block",
      title: `Allergy conflict: ${allergyMatch}`,
      detail: "Order is blocked until allergy is reviewed and a safer alternative is selected.",
      tone: "critical",
      blocking: true,
    });
  } else {
    scenarios.push({
      id: "allergy-clear",
      title: "No recorded allergy conflict",
      detail: profile.allergies.length ? `Recorded allergies checked: ${profile.allergies.join(", ")}.` : "No allergy recorded for this patient.",
      tone: "success",
    });
  }

  if (activeDuplicate) {
    scenarios.push({
      id: "duplicate-order",
      title: "Duplicate active medication",
      detail: `${activeDuplicate.medication} is already active for this patient. Modify/hold existing order before adding another exact order.`,
      tone: "danger",
      blocking: true,
    });
  }

  if (selectedMedicine.highRisk || draft.highRisk) {
    scenarios.push({
      id: "high-alert",
      title: "High-alert medicine",
      detail: "Double verification and nursing safety check will be required before administration.",
      tone: "critical",
    });
  }

  if (selectedMedicine.restricted) {
    const restrictedReady = Boolean(draft.indication.trim() && draft.approvalReason.trim() && draft.reviewDate);
    scenarios.push({
      id: "restricted-med",
      title: "Restricted medicine",
      detail: restrictedReady
        ? `Approval reason and review date ${draft.reviewDate} captured.`
        : "Indication, approval reason, and review date are required for stewardship/audit.",
      tone: restrictedReady ? "success" : "danger",
      blocking: !restrictedReady,
    });
  }

  if (!draft.startDate) {
    scenarios.push({
      id: "start-date",
      title: "Start date required",
      detail: "Select when this prescription becomes clinically active.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "Scheduled" && (!draft.scheduleTimes.trim() || !draft.duration.trim())) {
    scenarios.push({
      id: "scheduled-plan",
      title: "Scheduled plan incomplete",
      detail: "Scheduled orders require administration times and planned duration or review point.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "PRN" && (!draft.indication.trim() || !draft.minInterval.trim() || !draft.maxDailyDose.trim())) {
    scenarios.push({
      id: "prn-indication",
      title: "PRN limits incomplete",
      detail: "PRN orders require a trigger/indication, minimum interval, and maximum daily dose.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "Continuous") {
    const infusionReady = Boolean(draft.titrationTarget.trim() && draft.minRate.trim() && draft.maxRate.trim() && draft.monitoringFrequency.trim());
    scenarios.push({
      id: "infusion-protocol",
      title: "Continuous infusion protocol",
      detail: infusionReady
        ? `${draft.titrationTarget}; range ${draft.minRate} to ${draft.maxRate}; monitor ${draft.monitoringFrequency}.`
        : "Capture titration target, starting/minimum rate, maximum rate, and monitoring frequency.",
      tone: infusionReady ? "success" : "danger",
      blocking: !infusionReady,
    });
  }

  if ((draft.orderType === "STAT" || draft.orderType === "One-time") && !draft.startTime.trim()) {
    scenarios.push({
      id: "single-dose-time",
      title: "Administration deadline required",
      detail: `${draft.orderType} orders require an exact administration time or Now instruction.`,
      tone: "danger",
      blocking: true,
    });
  }

  if ((selectedMedicine.highRisk || draft.highRisk) && !draft.doubleVerificationRequired) {
    scenarios.push({
      id: "double-verification",
      title: "Double verification required",
      detail: "High-risk medicine cannot be signed without independent nurse verification.",
      tone: "danger",
      blocking: true,
    });
  }

  if (profile.renalStatus !== "Normal" && selectedMedicine.renalDoseNote) {
    scenarios.push({
      id: "renal-dose",
      title: "Renal dose review",
      detail: selectedMedicine.renalDoseNote,
      tone: "warning",
    });
  }

  if (profile.ageGroup === "Pediatric" && selectedMedicine.pediatricDoseNote) {
    scenarios.push({
      id: "pediatric-dose",
      title: "Pediatric dose check",
      detail: selectedMedicine.pediatricDoseNote,
      tone: "warning",
    });
  }

  if (profile.feedingStatus === "NPO" && draft.route === "Oral/NG") {
    scenarios.push({
      id: "npo-route",
      title: "Route warning",
      detail: selectedMedicine.npoWarning ?? "Patient is NPO; consider IV route or document why oral/NG is acceptable.",
      tone: "warning",
    });
  }

  return scenarios;
}

function formularyAvailabilityTone(availability: FormularyAvailability): StatusTone {
  if (availability === "Available") return "success";
  if (availability === "Low stock" || availability === "Restricted") return "warning";
  return "danger";
}

function parseMedicationSchedule(value: string, orderType: MedicationOrderType) {
  const parsed = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (parsed.length) return parsed;
  if (orderType === "Continuous") return ["Running"];
  if (orderType === "PRN") return ["PRN"];
  if (orderType === "STAT") return ["Now"];
  return ["08:00"];
}

function isMedicationDueStatus(status: WorkflowMedicationStatus) {
  return ["Due", "Late", "Missed"].includes(status);
}

function isPriorityMedicationDose(dose: MedicationDoseRow) {
  return isMedicationDueStatus(dose.status)
    || dose.orderType === "STAT"
    || dose.status === "Running"
    || dose.highRisk
    || dose.pharmacyStatus !== "Available"
    || dose.doubleVerification === "Pending";
}

function medicationStatusTone(status: WorkflowMedicationStatus): StatusTone {
  if (status === "Missed") return "critical";
  if (status === "Late" || status === "Refused" || status === "Stopped") return "danger";
  if (status === "Due" || status === "Held" || status === "Skipped" || status === "Paused") return "warning";
  if (status === "Administered" || status === "Running") return "success";
  return "info";
}

function orderTypeTone(orderType: MedicationOrderType): StatusTone {
  if (orderType === "STAT") return "critical";
  if (orderType === "Continuous") return "warning";
  if (orderType === "PRN") return "info";
  return "success";
}

function pharmacyStatusTone(status: PharmacyStatus): StatusTone {
  if (status === "Available") return "success";
  if (status === "Shortage" || status === "Out of stock") return "danger";
  if (status === "Substitution requested" || status === "Low stock" || status === "Restricted") return "warning";
  return "info";
}

function medicationOrderStatusTone(status: MedicationOrderStatus): StatusTone {
  if (status === "Active") return "success";
  if (status === "Draft") return "info";
  if (status === "Held by doctor") return "warning";
  return "danger";
}

function alertStatusTone(status: WorkflowAlertStatus): StatusTone {
  if (status === "New") return "critical";
  if (status === "Acknowledged" || status === "Assigned") return "warning";
  if (status === "Resolved" || status === "Closed") return "success";
  return "info";
}
