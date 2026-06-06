import type { StatusTone } from "@/types";

export type IcuAdmissionSource = "Emergency" | "General ward" | "Post-surgical unit" | "Direct ICU admission";
export type IcuPatientStatus = "Critical" | "Ventilated" | "Stable ICU care" | "Ready for transfer" | "Discharge ordered" | "Death workflow";
export type IcuTaskStatus = "Assigned" | "Accepted" | "Pending" | "In progress" | "Completed" | "Escalated" | "Overdue";
export type IcuPriority = "Critical" | "High" | "Medium" | "Routine";

export type IcuPatient = {
  id: string;
  bedNo: string;
  patientName: string;
  mrn: string;
  ageGender: string;
  diagnosis: string;
  admittingDoctor: string;
  consultingDoctor: string;
  dutyDoctor: string;
  assignedUnitNurse: string;
  assignedWardNurse: string;
  admissionSource: IcuAdmissionSource;
  currentStatus: IcuPatientStatus;
  criticalityScore: number;
  ventilatorStatus: string;
  lastVitalsTime: string;
  pendingTasks: number;
  alerts: string[];
  unit: string;
  admissionTime: string;
};

export type IcuTask = {
  id: string;
  patientId: string;
  bedNo: string;
  patientName: string;
  taskType: string;
  title: string;
  priority: IcuPriority;
  dueTime: string;
  status: IcuTaskStatus;
  createdBy: string;
  assignedTo: string;
  remarks: string;
  source?: string;
  assignedBy?: string;
  assignedByRole?: string;
  assignedToRole?: string;
  assignmentReason?: string;
  originalOwner?: string;
  escalationOwner?: string;
  requiresAcknowledgement?: boolean;
  acknowledgementStatus?: "Pending" | "Accepted" | "Not required";
  assignedAt?: string;
  reassignedBy?: string;
  reassignmentReason?: string;
};

export type IcuVital = {
  id: string;
  patientId: string;
  bedNo: string;
  time: string;
  temperature: string;
  pulse: number;
  bp: string;
  respiratoryRate: number;
  spo2: number;
  oxygenFlow: string;
  gcs: number;
  urineOutput: number;
  painScore: number;
  nurse: string;
  abnormal: boolean;
  note: string;
};

export type IcuIntakeOutput = {
  id: string;
  patientId: string;
  date: string;
  time: string;
  shift: "Day" | "Night";
  kind: "Intake" | "Output";
  category: string;
  component: string;
  quantityMl: number;
  route: string;
  source: "Manual entry" | "Medication administration" | "Blood administration" | "Urine assessment" | "Stool assessment" | "Emesis assessment" | "Drain assessment" | "Infusion pump";
  status: "Auto synced" | "Signed" | "Pending review" | "Corrected";
  intakeType: string;
  intakeMl: number;
  outputType: string;
  outputMl: number;
  balanceMl: number;
  nurse: string;
  capturedAt: string;
  verifiedBy?: string;
  note: string;
};

export type IcuMedication = {
  id: string;
  patientId: string;
  bedNo: string;
  medication: string;
  dose: string;
  route: string;
  frequency: string;
  scheduledTime: string;
  actualTime: string;
  status: "Due" | "Administered" | "Held" | "Skipped" | "Late";
  administeredBy: string;
  doubleVerification: string;
  reason: string;
};

export type IcuInfusion = {
  id: string;
  patientId: string;
  bedNo: string;
  fluidName: string;
  startTime: string;
  rate: string;
  totalVolumeMl: number;
  infusedVolumeMl: number;
  remainingVolumeMl: number;
  pumpNo: string;
  status: "Running" | "Paused" | "Completed" | "Stopped";
  nurse: string;
  alert: string;
};

export type IcuBloodTransfusion = {
  id: string;
  patientId: string;
  bedNo: string;
  bloodGroup: string;
  componentType: string;
  unitNumber: string;
  crossmatchStatus: string;
  startTime: string;
  status: "Requested" | "Issued" | "Running" | "Completed" | "Reaction";
  reactionObserved: string;
  nurse: string;
  doctor: string;
};

export type DoctorInstruction = {
  id: string;
  patientId: string;
  bedNo: string;
  doctor: string;
  instructionType: string;
  instruction: string;
  priority: IcuPriority;
  dueTime: string;
  status: "Pending" | "In progress" | "Completed" | "Escalated";
  assignedNurse: string;
  remarks: string;
};

export type IcuAlert = {
  id: string;
  patientId: string;
  bedNo: string;
  type: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  message: string;
  source: string;
  status: "Open" | "Acknowledged" | "Resolved";
  createdAt: string;
  owner: string;
};

export const icuPatients: IcuPatient[] = [
  {
    id: "icu-001",
    bedNo: "ICU-A01",
    patientName: "Aisha Khan",
    mrn: "PLH-240221",
    ageGender: "12/F",
    diagnosis: "Septic shock with respiratory distress",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Kavita Rao",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "Emergency",
    currentStatus: "Critical",
    criticalityScore: 9,
    ventilatorStatus: "NIV support",
    lastVitalsTime: "10 min ago",
    pendingTasks: 7,
    alerts: ["SpO2 low", "Medication overdue", "Critical lab pending"],
    unit: "Medical ICU",
    admissionTime: "Today 08:10",
  },
  {
    id: "icu-002",
    bedNo: "ICU-A02",
    patientName: "Rohan Das",
    mrn: "PLH-240338",
    ageGender: "54/M",
    diagnosis: "Post CABG monitoring",
    admittingDoctor: "Dr. Neha Malik",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Mohan Singh",
    assignedUnitNurse: "Unit Nurse Meera",
    assignedWardNurse: "Ward Nurse Arjun",
    admissionSource: "Post-surgical unit",
    currentStatus: "Ventilated",
    criticalityScore: 8,
    ventilatorStatus: "Invasive ventilation",
    lastVitalsTime: "5 min ago",
    pendingTasks: 5,
    alerts: ["Ventilator check due", "ABG result due"],
    unit: "Cardiac ICU",
    admissionTime: "Today 06:45",
  },
  {
    id: "icu-003",
    bedNo: "ICU-B03",
    patientName: "Meera Sharma",
    mrn: "PLH-240447",
    ageGender: "68/F",
    diagnosis: "Stroke observation with low GCS",
    admittingDoctor: "Dr. Imran Shah",
    consultingDoctor: "Dr. Ritu Anand",
    dutyDoctor: "Dr. Aman Verma",
    assignedUnitNurse: "Unit Nurse Priya",
    assignedWardNurse: "Ward Nurse Kavita",
    admissionSource: "General ward",
    currentStatus: "Stable ICU care",
    criticalityScore: 6,
    ventilatorStatus: "Oxygen mask",
    lastVitalsTime: "25 min ago",
    pendingTasks: 3,
    alerts: ["Neuro observation due"],
    unit: "Neuro ICU",
    admissionTime: "Yesterday 22:30",
  },
  {
    id: "icu-004",
    bedNo: "ICU-B04",
    patientName: "Kabir Ali",
    mrn: "PLH-240552",
    ageGender: "39/M",
    diagnosis: "DKA with electrolyte imbalance",
    admittingDoctor: "Dr. Sameer Mehta",
    consultingDoctor: "Dr. Mohan Singh",
    dutyDoctor: "Dr. Neha Malik",
    assignedUnitNurse: "Unit Nurse Meera",
    assignedWardNurse: "Ward Nurse Arjun",
    admissionSource: "Direct ICU admission",
    currentStatus: "Ready for transfer",
    criticalityScore: 3,
    ventilatorStatus: "Room air",
    lastVitalsTime: "40 min ago",
    pendingTasks: 2,
    alerts: ["Transfer clearance pending"],
    unit: "Medical ICU",
    admissionTime: "Yesterday 14:00",
  },
];

export const icuTasks: IcuTask[] = [
  { id: "task-001", patientId: "icu-001", bedNo: "ICU-A01", patientName: "Aisha Khan", taskType: "Medication administration", title: "Meropenem IV due", priority: "Critical", dueTime: "Now", status: "Overdue", createdBy: "System MAR", assignedTo: "Ward Nurse Kavita", remarks: "High-risk antibiotic timing" },
  { id: "task-002", patientId: "icu-001", bedNo: "ICU-A01", patientName: "Aisha Khan", taskType: "Vitals monitoring", title: "Repeat vitals after oxygen adjustment", priority: "High", dueTime: "10 min", status: "Pending", createdBy: "Duty Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Escalate if SpO2 < 92" },
  { id: "task-003", patientId: "icu-002", bedNo: "ICU-A02", patientName: "Rohan Das", taskType: "Blood transfusion monitoring", title: "Record 15-min transfusion vitals", priority: "High", dueTime: "15 min", status: "In progress", createdBy: "Blood Unit", assignedTo: "Ward Nurse Arjun", remarks: "Watch reaction" },
  { id: "task-004", patientId: "icu-003", bedNo: "ICU-B03", patientName: "Meera Sharma", taskType: "Doctor instruction follow-up", title: "Neuro checks every hour", priority: "Medium", dueTime: "30 min", status: "Pending", createdBy: "Consulting Doctor", assignedTo: "Ward Nurse Kavita", remarks: "Document GCS" },
  { id: "task-005", patientId: "icu-004", bedNo: "ICU-B04", patientName: "Kabir Ali", taskType: "Transfer clearance", title: "Nurse transfer checklist", priority: "Routine", dueTime: "Today", status: "Pending", createdBy: "Admitting Doctor", assignedTo: "Unit Nurse Meera", remarks: "Ward bed requested" },
];

export const icuVitals: IcuVital[] = [
  { id: "vit-001", patientId: "icu-001", bedNo: "ICU-A01", time: "08:00", temperature: "38.6", pulse: 132, bp: "86/54", respiratoryRate: 32, spo2: 90, oxygenFlow: "10 L/min NRBM", gcs: 12, urineOutput: 20, painScore: 6, nurse: "Ward Nurse Kavita", abnormal: true, note: "Sepsis alert criteria met" },
  { id: "vit-002", patientId: "icu-001", bedNo: "ICU-A01", time: "09:00", temperature: "38.4", pulse: 126, bp: "92/58", respiratoryRate: 30, spo2: 93, oxygenFlow: "NIV", gcs: 13, urineOutput: 25, painScore: 5, nurse: "Ward Nurse Kavita", abnormal: true, note: "Improving after fluids" },
  { id: "vit-003", patientId: "icu-002", bedNo: "ICU-A02", time: "09:00", temperature: "36.8", pulse: 98, bp: "118/72", respiratoryRate: 18, spo2: 98, oxygenFlow: "Ventilator FiO2 40%", gcs: 10, urineOutput: 60, painScore: 2, nurse: "Ward Nurse Arjun", abnormal: false, note: "Post-op stable" },
  { id: "vit-004", patientId: "icu-003", bedNo: "ICU-B03", time: "09:30", temperature: "37.1", pulse: 88, bp: "140/86", respiratoryRate: 20, spo2: 96, oxygenFlow: "Simple mask", gcs: 11, urineOutput: 45, painScore: 3, nurse: "Ward Nurse Kavita", abnormal: true, note: "Neuro watch" },
];

export const intakeOutputRows: IcuIntakeOutput[] = [
  { id: "io-001", patientId: "icu-001", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "IV", component: "Normal saline bolus", quantityMl: 250, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 250, outputType: "", outputMl: 0, balanceMl: 250, nurse: "Ward Nurse Kavita", capturedAt: "06:05", verifiedBy: "Unit Nurse Priya", note: "Pump PUMP-11 started during sepsis bundle" },
  { id: "io-002", patientId: "icu-001", date: "2026-06-06", time: "07:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 22, route: "Urinary catheter", source: "Urine assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 22, balanceMl: -22, nurse: "Ward Nurse Kavita", capturedAt: "07:05", note: "Low urine output; doctor informed" },
  { id: "io-003", patientId: "icu-001", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Intake", category: "Medicine", component: "Meropenem diluent", quantityMl: 100, route: "IV", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 100, outputType: "", outputMl: 0, balanceMl: 100, nurse: "Ward Nurse Kavita", capturedAt: "08:58", verifiedBy: "Ward Nurse Kavita", note: "Reflected from eMAR administration" },
  { id: "io-004", patientId: "icu-001", date: "2026-06-06", time: "09:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 28, route: "Urinary catheter", source: "Urine assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 28, balanceMl: -28, nurse: "Ward Nurse Kavita", capturedAt: "09:03", note: "Second low-output hour" },
  { id: "io-005", patientId: "icu-001", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Intake", category: "NG Tube", component: "Enteral feed", quantityMl: 120, route: "NG tube", source: "Manual entry", status: "Signed", intakeType: "NG Tube", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Kavita", capturedAt: "10:08", verifiedBy: "Unit Nurse Priya", note: "Feed tolerated" },
  { id: "io-006", patientId: "icu-001", date: "2026-06-06", time: "11:00", shift: "Day", kind: "Output", category: "Emesis output", component: "Vomitus", quantityMl: 60, route: "Oral", source: "Emesis assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Emesis", outputMl: 60, balanceMl: -60, nurse: "Ward Nurse Kavita", capturedAt: "11:15", note: "Small emesis after feed; aspiration watch" },
  { id: "io-007", patientId: "icu-001", date: "2026-06-05", time: "18:00", shift: "Night", kind: "Intake", category: "IV", component: "Maintenance fluid", quantityMl: 500, route: "IV", source: "Infusion pump", status: "Signed", intakeType: "IV fluids", intakeMl: 500, outputType: "", outputMl: 0, balanceMl: 500, nurse: "Night Nurse Leena", capturedAt: "18:10", verifiedBy: "Unit Nurse Priya", note: "Previous night maintenance" },
  { id: "io-008", patientId: "icu-001", date: "2026-06-05", time: "20:00", shift: "Night", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 110, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 110, balanceMl: -110, nurse: "Night Nurse Leena", capturedAt: "20:05", note: "Previous day output" },
  { id: "io-009", patientId: "icu-002", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "IV", component: "Balanced crystalloid", quantityMl: 200, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 200, outputType: "", outputMl: 0, balanceMl: 200, nurse: "Ward Nurse Arjun", capturedAt: "06:10", verifiedBy: "Unit Nurse Meera", note: "Post CABG maintenance" },
  { id: "io-010", patientId: "icu-002", date: "2026-06-06", time: "07:00", shift: "Day", kind: "Output", category: "Drain output", component: "Chest drain right", quantityMl: 90, route: "Chest drain", source: "Drain assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Drain output", outputMl: 90, balanceMl: -90, nurse: "Ward Nurse Arjun", capturedAt: "07:02", note: "Serosanguinous; surgeon review threshold 250 ml/shift" },
  { id: "io-011", patientId: "icu-002", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Intake", category: "Blood products", component: "Packed RBC", quantityMl: 250, route: "Blood transfusion", source: "Blood administration", status: "Auto synced", intakeType: "Blood products", intakeMl: 250, outputType: "", outputMl: 0, balanceMl: 250, nurse: "Ward Nurse Arjun", capturedAt: "08:45", verifiedBy: "Dr. Neha Malik", note: "Blood unit reflected from transfusion workflow" },
  { id: "io-012", patientId: "icu-002", date: "2026-06-06", time: "09:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 120, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 120, balanceMl: -120, nurse: "Ward Nurse Arjun", capturedAt: "09:05", note: "Adequate urine output" },
  { id: "io-013", patientId: "icu-002", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Output", category: "Drain output", component: "Chest drain right", quantityMl: 110, route: "Chest drain", source: "Drain assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "Drain output", outputMl: 110, balanceMl: -110, nurse: "Ward Nurse Arjun", capturedAt: "10:06", note: "Shift drain total rising" },
  { id: "io-014", patientId: "icu-003", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "P.O", component: "Water sips", quantityMl: 80, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "P.O", intakeMl: 80, outputType: "", outputMl: 0, balanceMl: 80, nurse: "Ward Nurse Kavita", capturedAt: "06:25", verifiedBy: "Unit Nurse Priya", note: "Swallow screen passed for sips" },
  { id: "io-015", patientId: "icu-003", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Output", category: "Urine output", component: "External catheter", quantityMl: 70, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 70, balanceMl: -70, nurse: "Ward Nurse Kavita", capturedAt: "08:02", note: "Stable output" },
  { id: "io-016", patientId: "icu-003", date: "2026-06-06", time: "10:00", shift: "Day", kind: "Output", category: "Stool output", component: "Loose stool", quantityMl: 150, route: "Stool chart", source: "Stool assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Stool", outputMl: 150, balanceMl: -150, nurse: "Ward Nurse Kavita", capturedAt: "10:20", note: "Documented from stool assessment" },
  { id: "io-017", patientId: "icu-004", date: "2026-06-06", time: "06:00", shift: "Day", kind: "Intake", category: "Oral supplements", component: "Protein supplement", quantityMl: 180, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "Oral supplements", intakeMl: 180, outputType: "", outputMl: 0, balanceMl: 180, nurse: "Ward Nurse Arjun", capturedAt: "06:40", verifiedBy: "Unit Nurse Meera", note: "Transfer-ready nutrition" },
  { id: "io-018", patientId: "icu-004", date: "2026-06-06", time: "08:00", shift: "Day", kind: "Output", category: "Urine output", component: "Urinal", quantityMl: 160, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 160, balanceMl: -160, nurse: "Ward Nurse Arjun", capturedAt: "08:10", note: "Good output" },
  { id: "io-019", patientId: "icu-001", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Intake", category: "Fluid", component: "Ringer lactate", quantityMl: 150, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 150, outputType: "", outputMl: 0, balanceMl: 150, nurse: "Ward Nurse Kavita", capturedAt: "12:02", verifiedBy: "Unit Nurse Priya", note: "Maintenance fluid after bolus review" },
  { id: "io-020", patientId: "icu-001", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 35, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 35, balanceMl: -35, nurse: "Ward Nurse Kavita", capturedAt: "12:04", note: "Urine improving after fluid review" },
  { id: "io-021", patientId: "icu-001", date: "2026-06-06", time: "13:00", shift: "Day", kind: "Intake", category: "Medicine", component: "Paracetamol IV diluent", quantityMl: 100, route: "IV", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 100, outputType: "", outputMl: 0, balanceMl: 100, nurse: "Ward Nurse Kavita", capturedAt: "13:12", verifiedBy: "Ward Nurse Kavita", note: "Auto-added from medication administration" },
  { id: "io-022", patientId: "icu-001", date: "2026-06-06", time: "13:00", shift: "Day", kind: "Output", category: "Drain output", component: "Central line site dressing loss", quantityMl: 15, route: "Dressing estimate", source: "Drain assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Drain output", outputMl: 15, balanceMl: -15, nurse: "Ward Nurse Kavita", capturedAt: "13:20", note: "Minimal serous soakage documented" },
  { id: "io-023", patientId: "icu-001", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Intake", category: "Oral", component: "Ice chips", quantityMl: 40, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "Oral", intakeMl: 40, outputType: "", outputMl: 0, balanceMl: 40, nurse: "Ward Nurse Kavita", capturedAt: "14:10", verifiedBy: "Unit Nurse Priya", note: "Allowed after aspiration risk review" },
  { id: "io-024", patientId: "icu-001", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 42, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 42, balanceMl: -42, nurse: "Ward Nurse Kavita", capturedAt: "14:04", note: "Meets hourly target" },
  { id: "io-025", patientId: "icu-001", date: "2026-06-06", time: "15:00", shift: "Day", kind: "Intake", category: "NG Tube", component: "Enteral feed", quantityMl: 120, route: "NG tube", source: "Manual entry", status: "Pending review", intakeType: "NG Tube", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Kavita", capturedAt: "15:05", note: "Feed restarted at lower rate" },
  { id: "io-026", patientId: "icu-001", date: "2026-06-06", time: "15:00", shift: "Day", kind: "Output", category: "Gastric wash", component: "NG aspirate", quantityMl: 55, route: "NG tube", source: "Drain assessment", status: "Pending review", intakeType: "", intakeMl: 0, outputType: "NG aspirate", outputMl: 55, balanceMl: -55, nurse: "Ward Nurse Kavita", capturedAt: "15:30", note: "Aspirate checked before feed escalation" },
  { id: "io-027", patientId: "icu-001", date: "2026-06-06", time: "16:00", shift: "Day", kind: "Intake", category: "Blood products", component: "FFP unit", quantityMl: 220, route: "Blood transfusion", source: "Blood administration", status: "Auto synced", intakeType: "Blood products", intakeMl: 220, outputType: "", outputMl: 0, balanceMl: 220, nurse: "Ward Nurse Kavita", capturedAt: "16:25", verifiedBy: "Dr. Sameer Mehta", note: "FFP reflected from blood administration workflow" },
  { id: "io-028", patientId: "icu-001", date: "2026-06-06", time: "16:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 48, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 48, balanceMl: -48, nurse: "Ward Nurse Kavita", capturedAt: "16:03", note: "Output maintained" },
  { id: "io-029", patientId: "icu-001", date: "2026-06-06", time: "17:00", shift: "Day", kind: "Output", category: "Est. Blood loss", component: "Line removal loss", quantityMl: 20, route: "Procedure estimate", source: "Manual entry", status: "Corrected", intakeType: "", intakeMl: 0, outputType: "Estimated blood loss", outputMl: 20, balanceMl: -20, nurse: "Ward Nurse Kavita", capturedAt: "17:15", verifiedBy: "Unit Nurse Priya", note: "Corrected after procedure note review" },
  { id: "io-030", patientId: "icu-001", date: "2026-06-06", time: "18:00", shift: "Night", kind: "Intake", category: "IV", component: "Dextrose saline", quantityMl: 250, route: "IV", source: "Infusion pump", status: "Auto synced", intakeType: "IV fluids", intakeMl: 250, outputType: "", outputMl: 0, balanceMl: 250, nurse: "Night Nurse Leena", capturedAt: "18:05", verifiedBy: "Unit Nurse Priya", note: "Night shift maintenance started" },
  { id: "io-031", patientId: "icu-001", date: "2026-06-06", time: "19:00", shift: "Night", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 52, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 52, balanceMl: -52, nurse: "Night Nurse Leena", capturedAt: "19:02", note: "Night urine output stable" },
  { id: "io-032", patientId: "icu-001", date: "2026-06-06", time: "21:00", shift: "Night", kind: "Intake", category: "Medicine", component: "Piperacillin/Tazobactam diluent", quantityMl: 100, route: "IV", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 100, outputType: "", outputMl: 0, balanceMl: 100, nurse: "Night Nurse Leena", capturedAt: "21:03", verifiedBy: "Night Nurse Leena", note: "Night antibiotic dose reflected from eMAR" },
  { id: "io-033", patientId: "icu-001", date: "2026-06-06", time: "23:00", shift: "Night", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 60, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 60, balanceMl: -60, nurse: "Night Nurse Leena", capturedAt: "23:02", note: "Stable overnight trend" },
  { id: "io-034", patientId: "icu-001", date: "2026-06-05", time: "06:00", shift: "Day", kind: "Intake", category: "P.O", component: "ORS sip plan", quantityMl: 180, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "P.O", intakeMl: 180, outputType: "", outputMl: 0, balanceMl: 180, nurse: "Ward Nurse Kavita", capturedAt: "06:30", verifiedBy: "Unit Nurse Priya", note: "Previous day oral intake baseline" },
  { id: "io-035", patientId: "icu-001", date: "2026-06-05", time: "12:00", shift: "Day", kind: "Output", category: "Stool output", component: "Liquid stool", quantityMl: 120, route: "Stool chart", source: "Stool assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Stool", outputMl: 120, balanceMl: -120, nurse: "Ward Nurse Kavita", capturedAt: "12:18", note: "Previous day stool output" },
  { id: "io-036", patientId: "icu-001", date: "2026-06-04", time: "08:00", shift: "Day", kind: "Intake", category: "IV", component: "Normal saline", quantityMl: 300, route: "IV", source: "Infusion pump", status: "Signed", intakeType: "IV fluids", intakeMl: 300, outputType: "", outputMl: 0, balanceMl: 300, nurse: "Ward Nurse Kavita", capturedAt: "08:12", verifiedBy: "Unit Nurse Priya", note: "Cumulative previous intake record" },
  { id: "io-037", patientId: "icu-001", date: "2026-06-04", time: "10:00", shift: "Day", kind: "Output", category: "Urine output", component: "Foley catheter", quantityMl: 95, route: "Urinary catheter", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 95, balanceMl: -95, nurse: "Ward Nurse Kavita", capturedAt: "10:05", note: "Cumulative previous output record" },
  { id: "io-038", patientId: "icu-002", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Intake", category: "Medicine", component: "Noradrenaline carrier", quantityMl: 30, route: "Infusion", source: "Medication administration", status: "Auto synced", intakeType: "Medication fluids", intakeMl: 30, outputType: "", outputMl: 0, balanceMl: 30, nurse: "Ward Nurse Arjun", capturedAt: "12:00", verifiedBy: "Dr. Neha Malik", note: "Vasopressor carrier volume" },
  { id: "io-039", patientId: "icu-002", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Output", category: "Drain output", component: "Chest drain right", quantityMl: 80, route: "Chest drain", source: "Drain assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Drain output", outputMl: 80, balanceMl: -80, nurse: "Ward Nurse Arjun", capturedAt: "14:04", note: "Drain trend slowing" },
  { id: "io-040", patientId: "icu-003", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Intake", category: "Oral supplements", component: "Thickened juice", quantityMl: 120, route: "Oral", source: "Manual entry", status: "Signed", intakeType: "Oral supplements", intakeMl: 120, outputType: "", outputMl: 0, balanceMl: 120, nurse: "Ward Nurse Kavita", capturedAt: "12:45", verifiedBy: "Unit Nurse Priya", note: "Neuro swallow-safe supplement" },
  { id: "io-041", patientId: "icu-003", date: "2026-06-06", time: "14:00", shift: "Day", kind: "Output", category: "Urine output", component: "External catheter", quantityMl: 85, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 85, balanceMl: -85, nurse: "Ward Nurse Kavita", capturedAt: "14:03", note: "Stable neuro ICU output" },
  { id: "io-042", patientId: "icu-004", date: "2026-06-06", time: "12:00", shift: "Day", kind: "Output", category: "Urine output", component: "Urinal", quantityMl: 180, route: "Urine collection", source: "Urine assessment", status: "Signed", intakeType: "", intakeMl: 0, outputType: "Urine", outputMl: 180, balanceMl: -180, nurse: "Ward Nurse Arjun", capturedAt: "12:12", note: "Transfer readiness output recorded" },
];

export const medicationRows: IcuMedication[] = [
  { id: "mar-001", patientId: "icu-001", bedNo: "ICU-A01", medication: "Meropenem", dose: "1 g", route: "IV", frequency: "8 hourly", scheduledTime: "09:00", actualTime: "-", status: "Late", administeredBy: "Ward Nurse Kavita", doubleVerification: "Required", reason: "Awaiting pharmacy dispense" },
  { id: "mar-002", patientId: "icu-002", bedNo: "ICU-A02", medication: "Noradrenaline", dose: "Titrate", route: "Infusion", frequency: "Continuous", scheduledTime: "Running", actualTime: "08:15", status: "Administered", administeredBy: "Ward Nurse Arjun", doubleVerification: "Dr. Neha Malik", reason: "Vasopressor support" },
  { id: "mar-003", patientId: "icu-003", bedNo: "ICU-B03", medication: "Mannitol", dose: "100 ml", route: "IV", frequency: "12 hourly", scheduledTime: "11:00", actualTime: "-", status: "Due", administeredBy: "-", doubleVerification: "Required", reason: "Neuro order" },
];

export const infusionRows: IcuInfusion[] = [
  { id: "iv-001", patientId: "icu-001", bedNo: "ICU-A01", fluidName: "Normal saline", startTime: "08:10", rate: "100 ml/hr", totalVolumeMl: 1000, infusedVolumeMl: 320, remainingVolumeMl: 680, pumpNo: "PUMP-11", status: "Running", nurse: "Ward Nurse Kavita", alert: "Balance positive" },
  { id: "iv-002", patientId: "icu-002", bedNo: "ICU-A02", fluidName: "Noradrenaline infusion", startTime: "07:45", rate: "6 ml/hr", totalVolumeMl: 50, infusedVolumeMl: 18, remainingVolumeMl: 32, pumpNo: "PUMP-07", status: "Running", nurse: "Ward Nurse Arjun", alert: "Double verified" },
];

export const transfusionRows: IcuBloodTransfusion[] = [
  { id: "bt-001", patientId: "icu-002", bedNo: "ICU-A02", bloodGroup: "B+", componentType: "PRBC", unitNumber: "BU-24056", crossmatchStatus: "Compatible", startTime: "09:05", status: "Running", reactionObserved: "No", nurse: "Ward Nurse Arjun", doctor: "Dr. Neha Malik" },
  { id: "bt-002", patientId: "icu-001", bedNo: "ICU-A01", bloodGroup: "O+", componentType: "FFP", unitNumber: "BU-24057", crossmatchStatus: "Issued", startTime: "Pending", status: "Issued", reactionObserved: "No", nurse: "Ward Nurse Kavita", doctor: "Dr. Sameer Mehta" },
];

export const doctorInstructions: DoctorInstruction[] = [
  { id: "ins-001", patientId: "icu-001", bedNo: "ICU-A01", doctor: "Dr. Sameer Mehta", instructionType: "Monitoring", instruction: "Repeat vitals every 15 minutes until BP stabilizes", priority: "Critical", dueTime: "Now", status: "Pending", assignedNurse: "Ward Nurse Kavita", remarks: "Escalate to duty doctor if MAP < 65" },
  { id: "ins-002", patientId: "icu-002", bedNo: "ICU-A02", doctor: "Dr. Neha Malik", instructionType: "Result review", instruction: "Review ABG and ventilator settings", priority: "High", dueTime: "20 min", status: "In progress", assignedNurse: "Ward Nurse Arjun", remarks: "ABG sent" },
  { id: "ins-003", patientId: "icu-004", bedNo: "ICU-B04", doctor: "Dr. Sameer Mehta", instructionType: "Transfer", instruction: "Prepare transfer to medical ward", priority: "Routine", dueTime: "Today", status: "Pending", assignedNurse: "Unit Nurse Meera", remarks: "Need pharmacy and billing clearance" },
];

export const icuAlerts: IcuAlert[] = [
  { id: "alert-001", patientId: "icu-001", bedNo: "ICU-A01", type: "Abnormal vitals", severity: "Critical", message: "SpO2 90%, BP 86/54, pulse 132", source: "Vitals Chart", status: "Open", createdAt: "10 min ago", owner: "Duty Doctor" },
  { id: "alert-002", patientId: "icu-001", bedNo: "ICU-A01", type: "Medication overdue", severity: "High", message: "Meropenem IV overdue by 25 minutes", source: "MAR", status: "Acknowledged", createdAt: "25 min ago", owner: "Ward Nurse" },
  { id: "alert-003", patientId: "icu-002", bedNo: "ICU-A02", type: "Blood transfusion", severity: "Medium", message: "15-minute transfusion vitals due", source: "Blood Unit", status: "Open", createdAt: "5 min ago", owner: "Ward Nurse" },
  { id: "alert-004", patientId: "icu-004", bedNo: "ICU-B04", type: "Transfer clearance", severity: "Info", message: "Nurse transfer checklist pending", source: "Transfer Order", status: "Open", createdAt: "1 hr ago", owner: "Unit Nurse" },
];

export const activityLogs = [
  { id: "log-001", event: "ICU_ADMISSION_CREATED", actor: "Unit Nurse Priya", patient: "Aisha Khan", detail: "Emergency arrival and ICU-A01 bed allocation started", time: "08:10", ip: "10.20.1.11" },
  { id: "log-002", event: "VITALS_RECORDED", actor: "Ward Nurse Kavita", patient: "Aisha Khan", detail: "Abnormal vitals generated critical alert", time: "09:00", ip: "10.20.1.18" },
  { id: "log-003", event: "BLOOD_TRANSFUSION_STARTED", actor: "Ward Nurse Arjun", patient: "Rohan Das", detail: "PRBC BU-24056 started after verification", time: "09:05", ip: "10.20.1.21" },
  { id: "log-004", event: "DOCTOR_INSTRUCTION_CREATED", actor: "Dr. Sameer Mehta", patient: "Aisha Khan", detail: "Repeat vitals every 15 minutes", time: "09:12", ip: "10.20.1.35" },
];

export const reportRows = [
  { id: "rep-001", report: "ICU occupancy report", scope: "Medical ICU", count: "4 active / 6 beds", status: "Ready", owner: "Head Nurse" },
  { id: "rep-002", report: "Medication administration compliance", scope: "Current shift", count: "86%", status: "Needs attention", owner: "Head Nurse" },
  { id: "rep-003", report: "Blood transfusion report", scope: "Today", count: "2 units issued", status: "Ready", owner: "Blood Unit" },
  { id: "rep-004", report: "Intake/output balance", scope: "Last 24 hours", count: "1 positive balance alert", status: "Review", owner: "Duty Doctor" },
];

export function toneForPriority(priority: IcuPriority): StatusTone {
  if (priority === "Critical") return "critical";
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  return "info";
}

export function toneForStatus(status: string): StatusTone {
  const lower = status.toLowerCase();
  if (lower.includes("critical") || lower.includes("overdue") || lower.includes("reaction") || lower.includes("death")) return "critical";
  if (lower.includes("ventilated") || lower.includes("late") || lower.includes("open") || lower.includes("escalated")) return "danger";
  if (lower.includes("pending") || lower.includes("running") || lower.includes("issued") || lower.includes("in progress")) return "warning";
  if (lower.includes("completed") || lower.includes("administered") || lower.includes("resolved") || lower.includes("ready")) return "success";
  return "info";
}
