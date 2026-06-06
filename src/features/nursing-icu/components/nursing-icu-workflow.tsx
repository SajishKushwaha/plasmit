"use client";

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
  FileText,
  Filter,
  HeartPulse,
  ListChecks,
  MonitorDot,
  Pill,
  Search,
  ShieldAlert,
  Syringe,
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
type MedicationOrderType = "Scheduled" | "STAT" | "PRN" | "Continuous";
type PharmacyStatus = "Available" | "Pending dispense" | "Low stock" | "Out of stock" | "Restricted" | "Shortage" | "Substitution requested";
type MedicationOrderStatus = "Active" | "Held by doctor" | "Discontinued";
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
  patientName: string;
  mrn: string;
  ageGender: string;
  source: string;
  diagnosis: string;
  condition: string;
  bedNo: string;
  unit: string;
  nurse: string;
  doctor: string;
  ventilator: string;
  devices: string;
  medication: string;
  risk: string;
  isolation: string;
  notes: string;
};

const admissionSteps = ["Patient", "Condition", "Bed & Device", "Medication", "Review"];
const allNurses = Array.from(new Set(icuPatients.flatMap((patient) => [patient.assignedUnitNurse, patient.assignedWardNurse])));
const alertStatusFlow: WorkflowAlertStatus[] = ["New", "Acknowledged", "Assigned", "Resolved", "Closed"];
const medicationStatuses: Array<"All status" | WorkflowMedicationStatus> = ["All status", "Due", "Late", "Upcoming", "Administered", "Held", "Skipped", "Missed", "Refused", "Running", "Paused", "Stopped"];
const medicationDepartments: MedicationDepartment[] = ["ICU", "Emergency", "Cardiology", "Neurology", "Pediatrics", "Surgery", "Anesthesia"];

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

const emptyAdmissionDraft: AdmissionDraft = {
  patientName: "",
  mrn: "",
  ageGender: "",
  source: "Emergency",
  diagnosis: "",
  condition: "Critical",
  bedNo: "ICU-C05",
  unit: "Medical ICU",
  nurse: "Unit Nurse Priya",
  doctor: "Dr. Sameer Mehta",
  ventilator: "NIV support",
  devices: "Monitor, infusion pump",
  medication: "Antibiotics, fluids, vasopressor review",
  risk: "High",
  isolation: "No",
  notes: "",
};

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
    pharmacyLocation: "Cardiac ICU Pharmacy",
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

const orderTypeOptions: Array<"All types" | MedicationOrderType> = ["All types", "Scheduled", "STAT", "PRN", "Continuous"];
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
  const [draft, setDraft] = React.useState<AdmissionDraft>(emptyAdmissionDraft);
  const [created, setCreated] = React.useState<Array<AdmissionDraft & { id: string; status: string }>>([]);

  const updateDraft = (key: keyof AdmissionDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const completeness = Math.round((Object.values(draft).filter(Boolean).length / Object.keys(draft).length) * 100);

  const saveAdmission = () => {
    const record = { ...draft, id: `icu-adm-${created.length + 1}`, status: "Bed assigned" };
    setCreated((current) => [record, ...current]);
    toast.success(`${draft.patientName || "ICU patient"} admission wizard completed`);
    setStep(0);
    setDraft(emptyAdmissionDraft);
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
              <TextField label="Patient name" value={draft.patientName} onChange={(value) => updateDraft("patientName", value)} placeholder="Enter patient name" />
              <TextField label="MRN / UHID" value={draft.mrn} onChange={(value) => updateDraft("mrn", value)} placeholder="PLH-..." />
              <TextField label="Age / gender" value={draft.ageGender} onChange={(value) => updateDraft("ageGender", value)} placeholder="52/M" />
              <SelectField label="Admission source" value={draft.source} onChange={(value) => updateDraft("source", value)} options={["Emergency", "General ward", "Post-surgical unit", "Direct ICU admission"]} />
            </FormGrid>
          ) : null}

          {step === 1 ? (
            <FormGrid>
              <TextField label="Diagnosis" value={draft.diagnosis} onChange={(value) => updateDraft("diagnosis", value)} placeholder="Primary ICU diagnosis" />
              <SelectField label="Clinical condition" value={draft.condition} onChange={(value) => updateDraft("condition", value)} options={["Critical", "Ventilated", "Stable ICU care", "Ready for transfer"]} />
              <SelectField label="Risk level" value={draft.risk} onChange={(value) => updateDraft("risk", value)} options={["Critical", "High", "Medium", "Routine"]} />
              <SelectField label="Isolation required" value={draft.isolation} onChange={(value) => updateDraft("isolation", value)} options={["No", "Yes", "Contact precaution", "Airborne precaution"]} />
            </FormGrid>
          ) : null}

          {step === 2 ? (
            <FormGrid>
              <SelectField label="ICU unit" value={draft.unit} onChange={(value) => updateDraft("unit", value)} options={["Medical ICU", "Cardiac ICU", "Neuro ICU", "Isolation ICU"]} />
              <SelectField label="Bed number" value={draft.bedNo} onChange={(value) => updateDraft("bedNo", value)} options={["ICU-C05", "ICU-C06", "ICU-A01 review", "ICU-B04 transfer-ready"]} />
              <SelectField label="Ventilator / oxygen" value={draft.ventilator} onChange={(value) => updateDraft("ventilator", value)} options={["Room air", "Oxygen mask", "NIV support", "Invasive ventilation", "Weaning trial"]} />
              <TextField label="Devices" value={draft.devices} onChange={(value) => updateDraft("devices", value)} placeholder="Monitor, pump, ventilator..." />
              <SelectField label="Unit nurse" value={draft.nurse} onChange={(value) => updateDraft("nurse", value)} options={["Unit Nurse Priya", "Unit Nurse Meera", "Unit Nurse Sana"]} />
              <SelectField label="Admitting doctor" value={draft.doctor} onChange={(value) => updateDraft("doctor", value)} options={["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma"]} />
            </FormGrid>
          ) : null}

          {step === 3 ? (
            <FormGrid>
              <TextField label="Current medications" value={draft.medication} onChange={(value) => updateDraft("medication", value)} placeholder="Antibiotic, infusion, emergency meds..." wide />
              <TextAreaField label="Initial nursing note" value={draft.notes} onChange={(value) => updateDraft("notes", value)} placeholder="Arrival condition, device status, immediate tasks..." />
            </FormGrid>
          ) : null}

          {step === 4 ? <AdmissionReview draft={draft} /> : null}

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDraft(emptyAdmissionDraft)}>Reset</Button>
              {step < admissionSteps.length - 1 ? (
                <Button onClick={() => setStep((current) => Math.min(admissionSteps.length - 1, current + 1))}>Next <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <Button onClick={saveAdmission}><Check className="h-4 w-4" />Admit patient</Button>
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
                    <p className="text-xs text-muted-foreground">{record.bedNo} | {record.unit} | {record.source}</p>
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

  const selectedPatient = icuPatients.find((patient) => patient.id === patientId) ?? icuPatients[0];
  const completion = Math.round((Object.values(form).filter(Boolean).length / Object.keys(form).length) * 100);

  const updateShift = (shift: string) => {
    const pair = shiftHandoverPairs[shift] ?? shiftHandoverPairs["Morning to Evening"];
    setForm((current) => ({ ...current, shift, outgoingNurse: pair.outgoingNurse, incomingNurse: pair.incomingNurse }));
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
            <SelectField label="Outgoing nurse" value={form.outgoingNurse} onChange={(value) => setForm((current) => ({ ...current, outgoingNurse: value }))} options={nurseOptions} />
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

export function NursingTaskBoardWorkspace() {
  const [tasks, setTasks] = React.useState<IcuTask[]>(icuTasks);
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("All task types");
  const [owner, setOwner] = React.useState("All nurses");
  const [source, setSource] = React.useState("All sources");
  const statuses: IcuTask["status"][] = ["Overdue", "Assigned", "Accepted", "Pending", "In progress", "Escalated", "Completed"];
  const taskTypeOptions = React.useMemo(() => ["All task types", ...Array.from(new Set(tasks.map((task) => task.taskType)))], [tasks]);
  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set([...tasks.map((task) => task.source ?? task.createdBy), ...nurseTaskScenarios.map((scenario) => scenario.source)]))], [tasks]);
  const taskOwnerOptions = React.useMemo(() => ["All nurses", ...Array.from(new Set([...allNurses, ...tasks.map((task) => task.assignedTo)]))], [tasks]);

  const visibleTasks = tasks.filter((task) => {
    const taskSource = task.source ?? task.createdBy;
    const searchable = `${task.patientName} ${task.bedNo} ${task.title} ${task.remarks} ${task.createdBy} ${task.assignedBy ?? ""} ${task.assignedTo} ${taskSource} ${task.taskType} ${task.assignmentReason ?? ""}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (type === "All task types" || task.taskType === type)
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
    setType("All task types");
    setOwner("All nurses");
    setSource("All sources");
    toast.success(`${newTask.title} created for ${newTask.bedNo}`);
  };

  return (
    <div className="space-y-4">
      <CreateNurseTaskPanel onCreateTask={createTask} />

      <Card>
        <CardContent className="grid gap-3 p-4 xl:grid-cols-[1fr_220px_220px_200px_auto] xl:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Search tasks</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Patient, bed, task..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </label>
          <NativeSelect label="Source" value={source} onChange={setSource} options={sourceOptions} />
          <NativeSelect label="Task type" value={type} onChange={setType} options={taskTypeOptions} />
          <NativeSelect label="Assigned nurse" value={owner} onChange={setOwner} options={taskOwnerOptions} />
          <Button variant="outline" onClick={() => {
            setQuery("");
            setType("All task types");
            setOwner("All nurses");
            setSource("All sources");
          }}><Filter className="h-4 w-4" />Reset</Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Total tasks" value={visibleTasks.length} tone="info" icon={ListChecks} />
        <MetricTile label="Overdue" value={visibleTasks.filter((task) => task.status === "Overdue").length} tone="critical" icon={AlertTriangle} />
        <MetricTile label="In progress" value={visibleTasks.filter((task) => task.status === "In progress").length} tone="warning" icon={Clock} />
        <MetricTile label="Escalated" value={visibleTasks.filter((task) => task.status === "Escalated").length} tone="danger" icon={ShieldAlert} />
        <MetricTile label="Completed" value={visibleTasks.filter((task) => task.status === "Completed").length} tone="success" icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 xl:grid-cols-4 2xl:grid-cols-7">
        {statuses.map((status) => (
          <Card key={status}>
            <CardHeader>
              <div>
                <CardTitle>{status}</CardTitle>
                <CardDescription>{visibleTasks.filter((task) => task.status === status).length} tasks</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleTasks.filter((task) => task.status === status).map((task) => (
                <TaskCard key={task.id} task={task} onChangeStatus={changeStatus} />
              ))}
              {!visibleTasks.some((task) => task.status === status) ? (
                <EmptyPanel title="No tasks" detail={`No ${status.toLowerCase()} tasks for current filters.`} />
              ) : null}
            </CardContent>
          </Card>
        ))}
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
  const assignerOptions = getTaskAssignerOptions(selectedPatient);
  const roleOptions = ["Doctor", "System", "Head Nurse", "Unit Nurse", "Ward Nurse", "Pharmacy", "Lab", "Radiology", "Blood Unit", "Self"];

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

        <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3 md:grid-cols-2 xl:grid-cols-4">
          <InfoLine label="Selected patient" value={`${selectedPatient?.bedNo ?? "-"} - ${selectedPatient?.patientName ?? "-"}`} />
          <InfoLine label="Default nurse" value={selectedPatient?.assignedWardNurse ?? "-"} />
          <InfoLine label="Scenario source" value={selectedScenario.source} />
          <InfoLine label="Assigned by" value={`${draft.assignedBy} (${draft.assignedByRole})`} />
          <InfoLine label="Acknowledgement" value={draft.requiresAcknowledgement ? "Required before start" : "Not required"} />
        </div>

        <FormGrid>
          <TextField label="Task title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder="Task title" wide />
          <TextField label="Task type" value={draft.taskType} onChange={(value) => setDraft((current) => ({ ...current, taskType: value }))} placeholder="Task type" />
          <SelectField label="Assigned by" value={draft.assignedBy} onChange={(value) => setDraft((current) => ({ ...current, assignedBy: value }))} options={assignerOptions} />
          <SelectField label="Assigned by role" value={draft.assignedByRole} onChange={(value) => setDraft((current) => ({ ...current, assignedByRole: value }))} options={roleOptions} />
          <SelectField label="Priority" value={draft.priority} onChange={(value) => setDraft((current) => ({ ...current, priority: value as IcuTask["priority"] }))} options={["Critical", "High", "Medium", "Routine"]} />
          <SelectField label="Assigned nurse" value={draft.assignedTo} onChange={(value) => setDraft((current) => ({ ...current, assignedTo: value }))} options={nurseOptions} />
          <SelectField label="Assigned to role" value={draft.assignedToRole} onChange={(value) => setDraft((current) => ({ ...current, assignedToRole: value }))} options={["Ward Nurse", "Unit Nurse", "Head Nurse"]} />
          <TextField label="Assignment reason" value={draft.assignmentReason} onChange={(value) => setDraft((current) => ({ ...current, assignmentReason: value }))} placeholder="Why is this task being assigned?" />
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Due date</span>
            <Input type="date" value={draft.dueDate} onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))} />
          </label>
          <TextField label="Due time" value={draft.dueTime} onChange={(value) => setDraft((current) => ({ ...current, dueTime: value }))} placeholder="Now / Next 15 min / 14:30" />
          <SelectField label={selectedScenario.contextLabel} value={draft.context} onChange={(value) => setDraft((current) => ({ ...current, context: value }))} options={selectedScenario.contextOptions} />
          <SelectField label="Repeat" value={draft.repeat} onChange={(value) => setDraft((current) => ({ ...current, repeat: value }))} options={Array.from(new Set([draft.repeat, "One time", "Hourly", "Every 15 min until stable", "Every 2 hours", "Per shift", "Before shift end", "Until completed"]))} />
          <TextField label="Escalation owner" value={draft.escalationOwner} onChange={(value) => setDraft((current) => ({ ...current, escalationOwner: value }))} placeholder="Duty doctor / head nurse / department" />
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

function getTaskAssignerOptions(patient?: IcuPatient) {
  return Array.from(new Set([
    patient?.admittingDoctor,
    patient?.dutyDoctor,
    patient?.assignedUnitNurse,
    patient?.assignedWardNurse,
    "Head Nurse Sana",
    "System MAR",
    "Monitoring System",
    "Fluid Balance Chart",
    "Infusion Pump",
    "Blood Unit",
    "Lab / Radiology Department",
    "Pharmacy",
    "Outgoing Nurse",
    "Ward Nurse Current",
  ].filter(Boolean) as string[]));
}

export function MedicationTimelineWorkspace() {
  const [orders, setOrders] = React.useState<DoctorMedicationOrder[]>(initialDoctorMedicationOrders);
  const [doses, setDoses] = React.useState<MedicationDoseRow[]>(() => buildMedicationDoseRows(initialDoctorMedicationOrders));
  const [patientId, setPatientId] = React.useState("All patients");
  const [status, setStatus] = React.useState<(typeof medicationStatuses)[number]>("All status");
  const [orderType, setOrderType] = React.useState<(typeof orderTypeOptions)[number]>("All types");
  const [pharmacy, setPharmacy] = React.useState<(typeof pharmacyOptions)[number]>("All pharmacy");
  const [query, setQuery] = React.useState("");
  const [medicationView, setMedicationView] = React.useState<"Nurse eMAR" | "Doctor Orders">("Nurse eMAR");
  const [selectedDoseId, setSelectedDoseId] = React.useState<string | null>(null);
  const [actionNote, setActionNote] = React.useState("");
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
  });

  const visibleDoses = doses.filter((row) => {
    const patient = icuPatients.find((item) => item.id === row.patientId);
    const searchable = `${patient?.patientName ?? ""} ${row.bedNo} ${row.medication} ${row.reason} ${row.doctor} ${row.indication}`.toLowerCase();
    return searchable.includes(query.toLowerCase())
      && (patientId === "All patients" || row.patientId === patientId)
      && (status === "All status" || row.status === status)
      && (orderType === "All types" || row.orderType === orderType)
      && (pharmacy === "All pharmacy" || row.pharmacyStatus === pharmacy);
  });

  const selectedDose = doses.find((dose) => dose.id === selectedDoseId) ?? visibleDoses[0] ?? doses[0];
  const activeDoseCount = doses.filter((dose) => dose.orderStatus === "Active").length;
  const dueCount = doses.filter((dose) => isMedicationDueStatus(dose.status)).length;
  const highRiskCount = doses.filter((dose) => dose.highRisk && dose.orderStatus === "Active").length;
  const pharmacyIssueCount = doses.filter((dose) => dose.pharmacyStatus !== "Available" && dose.orderStatus === "Active").length;
  const runningInfusionCount = doses.filter((dose) => dose.status === "Running").length;
  const complianceBase = doses.filter((dose) => dose.status !== "Upcoming" && dose.orderStatus === "Active").length;
  const compliance = complianceBase ? Math.round((doses.filter((dose) => dose.status === "Administered").length / complianceBase) * 100) : 0;
  const selectedFormularyMedicine = getSelectedFormularyMedicine(draft);
  const doctorOrderScenarios = getDoctorOrderScenarios(draft, orders);
  const hasBlockingDoctorScenario = doctorOrderScenarios.some((scenario) => scenario.blocking);

  const updateDoseStatus = (doseId: string, nextStatus: WorkflowMedicationStatus, defaultNote: string) => {
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

    const note = actionNote.trim() || defaultNote;
    setDoses((current) => current.map((dose) => dose.id === doseId ? {
      ...dose,
      status: nextStatus,
      actualTime: nextStatus === "Administered" ? "Now" : dose.actualTime,
      administeredBy: nextStatus === "Administered" ? "Ward Nurse Current" : dose.administeredBy,
      reason: ["Held", "Skipped", "Missed", "Refused"].includes(nextStatus) ? note : dose.reason,
      auditTrail: [`Now: ${nextStatus} - ${note}`, ...dose.auditTrail],
    } : dose));
    setSelectedDoseId(doseId);
    setActionNote("");
    toast.success(`${targetDose.medication} marked ${nextStatus}`);
  };

  const verifyDose = (doseId: string) => {
    const targetDose = doses.find((dose) => dose.id === doseId);
    if (!targetDose) return;
    setDoses((current) => current.map((dose) => dose.id === doseId ? {
      ...dose,
      doubleVerification: "Verified",
      auditTrail: ["Now: Double verification completed by second nurse", ...dose.auditTrail],
    } : dose));
    setSelectedDoseId(doseId);
    toast.success(`${targetDose.medication} double verified`);
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

  const changeOrderStatus = (orderId: string, nextStatus: MedicationOrderStatus) => {
    const targetOrder = orders.find((order) => order.id === orderId);
    if (!targetOrder) return;
    setOrders((current) => current.map((order) => order.id === orderId ? { ...order, status: nextStatus } : order));
    setDoses((current) => current.map((dose) => {
      if (dose.orderId !== orderId) return dose;
      const resumedStatus = dose.orderType === "Continuous" ? "Running" : dose.status === "Held" || dose.status === "Stopped" ? "Due" : dose.status;
      return {
        ...dose,
        orderStatus: nextStatus,
        status: nextStatus === "Held by doctor" ? "Held" : nextStatus === "Discontinued" ? "Stopped" : resumedStatus,
        auditTrail: [`Now: Doctor order ${nextStatus}`, ...dose.auditTrail],
      };
    }));
    toast.success(`${targetOrder.medication} order moved to ${nextStatus}`);
  };

  const addDoctorOrder = () => {
    const patient = icuPatients.find((item) => item.id === draft.patientId);
    if (!patient || !draft.medication.trim() || !draft.dose.trim()) {
      toast.error("Patient, medicine, and dose are required.");
      return;
    }
    const blockingScenario = getDoctorOrderScenarios(draft, orders).find((scenario) => scenario.blocking);
    if (blockingScenario) {
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
      status: "Active",
    };
    const newDoses = buildMedicationDoseRows([newOrder]);
    setOrders((current) => [newOrder, ...current]);
    setDoses((current) => [...newDoses, ...current]);
    setSelectedDoseId(newDoses[0]?.id ?? null);
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
    }));
    toast.success(`${newOrder.medication} order added for ${patient.patientName}`);
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
          <CardContent className="grid gap-3 p-4 xl:grid-cols-[minmax(220px,1fr)_190px_170px_170px_190px_auto] xl:items-end">
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
            <NativeSelect label="Dose status" value={status} onChange={(value) => setStatus(value as (typeof medicationStatuses)[number])} options={medicationStatuses} />
            <NativeSelect label="Order type" value={orderType} onChange={(value) => setOrderType(value as (typeof orderTypeOptions)[number])} options={orderTypeOptions} />
            <NativeSelect label="Pharmacy" value={pharmacy} onChange={(value) => setPharmacy(value as (typeof pharmacyOptions)[number])} options={pharmacyOptions} />
            <Button variant="outline" onClick={() => {
              setQuery("");
              setPatientId("All patients");
              setStatus("All status");
              setOrderType("All types");
              setPharmacy("All pharmacy");
            }}><Filter className="h-4 w-4" />Reset</Button>
          </CardContent>
        </Card>
      ) : null}

      {medicationView === "Doctor Orders" ? (
        <MedicationOrderComposer
          draft={draft}
          hasBlockingScenario={hasBlockingDoctorScenario}
          onAddOrder={addDoctorOrder}
          onDraftChange={(nextDraft) => setDraft((current) => ({ ...current, ...nextDraft }))}
          onHoldOrder={(orderId) => changeOrderStatus(orderId, "Held by doctor")}
          onResumeOrder={(orderId) => changeOrderStatus(orderId, "Active")}
          onStopOrder={(orderId) => changeOrderStatus(orderId, "Discontinued")}
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
                    onUpdateStatus={(nextStatus, note) => updateDoseStatus(dose.id, nextStatus, note)}
                    onVerify={() => verifyDose(dose.id)}
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
                    onUpdateStatus={(nextStatus, note) => updateDoseStatus(dose.id, nextStatus, note)}
                    onVerify={() => verifyDose(dose.id)}
                  />
                ))}
                {!visibleDoses.length ? <EmptyPanel title="No medication matched" detail="Change search, patient, status, type, or pharmacy filter." /> : null}
              </CardContent>
            </Card>
          </div>

          <MedicationSafetyPanel
            dose={selectedDose}
            actionNote={actionNote}
            runningInfusionCount={runningInfusionCount}
            onActionNoteChange={setActionNote}
            onMarkPharmacyAvailable={() => selectedDose ? markPharmacyAvailable(selectedDose.orderId) : undefined}
            onUpdateStatus={(nextStatus, note) => selectedDose ? updateDoseStatus(selectedDose.id, nextStatus, note) : undefined}
            onVerify={() => selectedDose ? verifyDose(selectedDose.id) : undefined}
          />
        </div>
      )}
    </div>
  );
}

function MedicationOrderComposer({
  draft,
  hasBlockingScenario,
  onDraftChange,
  onAddOrder,
  onHoldOrder,
  onResumeOrder,
  onStopOrder,
  orders,
  scenarios,
  selectedMedicine,
}: {
  draft: MedicationOrderDraft;
  hasBlockingScenario: boolean;
  onDraftChange: (draft: Partial<MedicationOrderDraft>) => void;
  onAddOrder: () => void;
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
  onStopOrder: (orderId: string) => void;
  orders: DoctorMedicationOrder[];
  scenarios: MedicationScenario[];
  selectedMedicine?: FormularyMedicine;
}) {
  const [formularyQuery, setFormularyQuery] = React.useState("");
  const [orderSearch, setOrderSearch] = React.useState("");
  const [availableOnly, setAvailableOnly] = React.useState(true);
  const selectedPatient = icuPatients.find((patient) => patient.id === draft.patientId);
  const patientProfile = getPatientMedicationProfile(draft.patientId);
  const activeOrdersForPatient = orders.filter((order) => order.patientId === draft.patientId && order.status === "Active");
  const visiblePatientOrders = orders.filter((order) => {
    const searchable = `${order.medication} ${order.indication} ${order.doctor} ${order.orderType} ${order.pharmacyStatus}`.toLowerCase();
    return order.patientId === draft.patientId && searchable.includes(orderSearch.toLowerCase());
  });
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MedicationContextTile label="Diagnosis" value={selectedPatient?.diagnosis ?? "-"} />
          <MedicationContextTile label="Weight" value={`${patientProfile.weightKg} kg`} />
          <MedicationContextTile label="Allergy" value={patientProfile.allergies.length ? patientProfile.allergies.join(", ") : "None"} tone={patientProfile.allergies.length ? "warning" : "success"} />
          <MedicationContextTile label="Renal / feeding" value={`${patientProfile.renalStatus} / ${patientProfile.feedingStatus}`} tone={patientProfile.renalStatus === "Normal" && patientProfile.feedingStatus !== "NPO" ? "success" : "warning"} />
          <MedicationContextTile label="Active meds" value={`${activeOrdersForPatient.length}`} tone={activeOrdersForPatient.length ? "info" : "success"} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)_380px]">
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
              <SelectField label="Order type" value={draft.orderType} onChange={(value) => onDraftChange({ orderType: value as MedicationOrderType })} options={["Scheduled", "STAT", "PRN", "Continuous"]} />
              <SelectField label="Pharmacy" value={draft.pharmacyStatus} onChange={(value) => onDraftChange({ pharmacyStatus: value as PharmacyStatus })} options={["Available", "Pending dispense", "Low stock", "Out of stock", "Restricted", "Shortage", "Substitution requested"]} />
              <TextField label="Medicine" value={draft.medication} onChange={(value) => onDraftChange({ medication: value, formularyId: "" })} placeholder="Select from catalog" />
              <TextField label="Dose" value={draft.dose} onChange={(value) => onDraftChange({ dose: value })} placeholder="1 g / sliding scale..." />
              <SelectField label="Route" value={draft.route} onChange={(value) => onDraftChange({ route: value })} options={["IV", "Infusion", "Oral/NG", "SC", "IM", "Nebulization"]} />
              <TextField label="Frequency" value={draft.frequency} onChange={(value) => onDraftChange({ frequency: value })} placeholder="q8h / OD / continuous" />
              <TextField label="Schedule times" value={draft.scheduleTimes} onChange={(value) => onDraftChange({ scheduleTimes: value })} placeholder="08:00, 16:00, 00:00" />
              <TextField label="Indication" value={draft.indication} onChange={(value) => onDraftChange({ indication: value })} placeholder="Sepsis / fever / MAP support" />
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
                {hasBlockingScenario ? "Resolve blocking checks before adding this order." : "Order can be added to the eMAR queue."}
              </div>
              <Button className="sm:min-w-40" disabled={hasBlockingScenario} onClick={onAddOrder}><Pill className="h-4 w-4" />Add order</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-2 2xl:col-span-1">
          <MedicationScenarioPanel scenarios={scenarios} />
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Patient orders</p>
                <p className="mt-1 text-xs text-muted-foreground">{selectedPatient?.bedNo} active and recent medication orders.</p>
              </div>
              <Badge tone="info">{visiblePatientOrders.length}</Badge>
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search active orders..." value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} />
            </div>
            <div className="mt-3">
              <MedicationDoctorOrdersPanel
                orders={visiblePatientOrders}
                onHoldOrder={onHoldOrder}
                onResumeOrder={onResumeOrder}
                onStopOrder={onStopOrder}
              />
            </div>
          </div>
        </div>
      </div>
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

function MedicationDoseCard({
  dose,
  selected,
  compact,
  onSelect,
  onUpdateStatus,
  onVerify,
  onMarkPharmacyAvailable,
}: {
  dose: MedicationDoseRow;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
  onUpdateStatus: (nextStatus: WorkflowMedicationStatus, note: string) => void;
  onVerify: () => void;
  onMarkPharmacyAvailable: () => void;
}) {
  const patient = icuPatients.find((item) => item.id === dose.patientId);
  const isContinuous = dose.orderType === "Continuous";
  const needsPharmacy = dose.pharmacyStatus !== "Available";
  const needsVerification = dose.doubleVerification === "Pending";

  return (
    <div className={cn("rounded-md border bg-background p-3 transition", selected ? "border-primary bg-primary/5" : "border-border")}>
      <button className="w-full text-left" type="button" onClick={onSelect}>
        <div className={cn("grid gap-3", compact ? "lg:grid-cols-[150px_1fr]" : "lg:grid-cols-[160px_1fr_auto] lg:items-start")}>
          <div>
            <p className="text-sm font-semibold text-foreground">{dose.scheduledTime}</p>
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
            </div>
          ) : null}
        </div>
      </button>

      <div className="mt-3 flex flex-wrap gap-2">
        {needsPharmacy ? (
          <Button size="sm" variant="outline" onClick={onMarkPharmacyAvailable}><Syringe className="h-4 w-4" />Mark received</Button>
        ) : null}
        {needsVerification ? (
          <Button size="sm" variant="outline" onClick={onVerify}><ShieldAlert className="h-4 w-4" />Verify</Button>
        ) : null}
        {isContinuous ? (
          <>
            <Button size="sm" onClick={() => onUpdateStatus("Running", "Infusion running as prescribed")}><Activity className="h-4 w-4" />Start</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus("Paused", "Infusion paused with nurse note")}>Pause</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus("Stopped", "Infusion stopped as ordered")}>Stop</Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => onUpdateStatus("Administered", "Dose administered after 5-rights check")}><Check className="h-4 w-4" />Give</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus("Held", "Held with reason captured")}>Hold</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus("Skipped", "Skipped with nurse note")}>Skip</Button>
            <Button size="sm" variant="outline" onClick={() => onUpdateStatus("Refused", "Patient/family refused dose")}>Refuse</Button>
          </>
        )}
      </div>
    </div>
  );
}

function MedicationSafetyPanel({
  dose,
  actionNote,
  runningInfusionCount,
  onActionNoteChange,
  onUpdateStatus,
  onVerify,
  onMarkPharmacyAvailable,
}: {
  dose?: MedicationDoseRow;
  actionNote: string;
  runningInfusionCount: number;
  onActionNoteChange: (value: string) => void;
  onUpdateStatus: (nextStatus: WorkflowMedicationStatus, note: string) => void;
  onVerify: () => void;
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
    ["Route/frequency", `${dose.route} | ${dose.frequency}`],
    ["Doctor", dose.doctor],
    ["Pharmacy", dose.pharmacyStatus],
    ["Double check", dose.doubleVerification],
    ["Running infusions", String(runningInfusionCount)],
  ];

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
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">Nursing action note</span>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            placeholder="Reason for hold/skip/refusal, vitals/lab check, second nurse name..."
            value={actionNote}
            onChange={(event) => onActionNoteChange(event.target.value)}
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {dose.pharmacyStatus !== "Available" ? <Button variant="outline" onClick={onMarkPharmacyAvailable}><Syringe className="h-4 w-4" />Mark received</Button> : null}
          {dose.doubleVerification === "Pending" ? <Button variant="outline" onClick={onVerify}><ShieldAlert className="h-4 w-4" />Double verify</Button> : null}
          {dose.orderType === "Continuous" ? (
            <>
              <Button onClick={() => onUpdateStatus("Running", "Infusion running as prescribed")}><Activity className="h-4 w-4" />Start infusion</Button>
              <Button variant="outline" onClick={() => onUpdateStatus("Paused", "Infusion paused with nurse note")}>Pause</Button>
              <Button variant="outline" onClick={() => onUpdateStatus("Stopped", "Infusion stopped as ordered")}>Stop</Button>
            </>
          ) : (
            <>
              <Button onClick={() => onUpdateStatus("Administered", "Dose administered after 5-rights check")}><Check className="h-4 w-4" />Give dose</Button>
              <Button variant="outline" onClick={() => onUpdateStatus("Held", "Held with reason captured")}>Hold</Button>
              <Button variant="outline" onClick={() => onUpdateStatus("Skipped", "Skipped with nurse note")}>Skip</Button>
              <Button variant="outline" onClick={() => onUpdateStatus("Refused", "Patient/family refused dose")}>Refuse</Button>
            </>
          )}
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

function MedicationDoctorOrdersPanel({
  orders,
  onHoldOrder,
  onResumeOrder,
  onStopOrder,
}: {
  orders: DoctorMedicationOrder[];
  onHoldOrder: (orderId: string) => void;
  onResumeOrder: (orderId: string) => void;
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
            <p className="mt-1 text-xs text-muted-foreground">Pharmacy: {pharmacyLocation}{alternatives.length ? ` | Alternatives: ${alternatives.join(", ")}` : ""}</p>
            {scenarioNotes.length ? (
              <div className="mt-3 grid gap-2">
                {scenarioNotes.slice(0, 2).map((note) => (
                  <div className="rounded-md border border-border bg-background p-2 text-xs text-muted-foreground" key={note}>{note}</div>
                ))}
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {order.status === "Held by doctor" ? (
                <Button size="sm" variant="outline" onClick={() => onResumeOrder(order.id)}>Resume</Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => onHoldOrder(order.id)} disabled={order.status === "Discontinued"}>Doctor hold</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onStopOrder(order.id)} disabled={order.status === "Discontinued"}>Discontinue</Button>
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
  const [section, setSection] = React.useState("Vitals");

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
          {["Vitals", "Medication", "Alerts", "Tasks", "Timeline"].map((item) => (
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

        {section === "Vitals" ? (
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
      <div className="mt-2 flex flex-wrap gap-1">
        <Badge tone="info">{taskSource}</Badge>
        <Badge tone={ackStatus === "Pending" ? "warning" : ackStatus === "Accepted" ? "success" : "muted"}>Ack: {ackStatus}</Badge>
      </div>
      <p className="mt-2 text-sm text-foreground">{task.title}</p>
      <div className="mt-2 rounded-md border border-border bg-surface-muted p-2 text-xs">
        <p className="font-semibold text-foreground">{assignedBy} <ArrowRight className="mx-1 inline h-3 w-3 text-muted-foreground" /> {task.assignedTo}</p>
        <p className="mt-1 text-muted-foreground">{task.assignedByRole ?? "Source"} to {task.assignedToRole ?? "Ward Nurse"} | {task.dueTime}</p>
        {task.assignmentReason ? <p className="mt-1 text-muted-foreground">{task.assignmentReason}</p> : null}
        {task.escalationOwner ? <p className="mt-1 text-muted-foreground">Escalation: {task.escalationOwner}</p> : null}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{task.remarks}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {task.requiresAcknowledgement && ackStatus !== "Accepted" ? (
          <Button size="sm" variant="outline" onClick={() => onChangeStatus(task.id, "Accepted")}>Accept</Button>
        ) : null}
        <Button size="sm" variant="outline" onClick={() => onChangeStatus(task.id, "In progress")}>Start</Button>
        <Button size="sm" onClick={() => onChangeStatus(task.id, "Completed")}>Done</Button>
        <Button size="sm" variant="outline" onClick={() => onChangeStatus(task.id, "Escalated")}>Escalate</Button>
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

function AdmissionReview({ draft }: { draft: AdmissionDraft }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Object.entries(draft).map(([key, value]) => (
        <div className="rounded-md border border-border bg-background p-3" key={key}>
          <p className="text-xs font-medium uppercase text-muted-foreground">{labelize(key)}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{value || "-"}</p>
        </div>
      ))}
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  renderOption?: (value: string) => string;
}) {
  return (
    <label className="space-y-1 text-sm">
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
    scenarios.push({
      id: "restricted-med",
      title: "Restricted medicine",
      detail: "Indication, approval reason, and review date should be captured for stewardship/audit.",
      tone: draft.indication.trim() ? "warning" : "danger",
      blocking: !draft.indication.trim(),
    });
  }

  if (draft.orderType === "PRN" && !draft.indication.trim()) {
    scenarios.push({
      id: "prn-indication",
      title: "PRN indication required",
      detail: "SOS/PRN orders need trigger condition, max dose/day, and reason.",
      tone: "danger",
      blocking: true,
    });
  }

  if (draft.orderType === "Continuous") {
    scenarios.push({
      id: "infusion-protocol",
      title: "Continuous infusion protocol",
      detail: "Capture pump requirement, titration target, min/max rate, and monitoring frequency.",
      tone: "warning",
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
  if (status === "Held by doctor") return "warning";
  return "danger";
}

function alertStatusTone(status: WorkflowAlertStatus): StatusTone {
  if (status === "New") return "critical";
  if (status === "Acknowledged" || status === "Assigned") return "warning";
  if (status === "Resolved" || status === "Closed") return "success";
  return "info";
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
