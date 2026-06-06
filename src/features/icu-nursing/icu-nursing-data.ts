export type IcuPatient = {
  id: string;
  patientId: string;
  bed: string;
  name: string;
  mrn: string;
  ageGender: string;
  diagnosis: string;
  allergy: string;
  isolation: string;
  fallRisk: "Low" | "Medium" | "High";
  braden: number;
  news2: number;
  mews: number;
  sepsis: "Low" | "Medium" | "High";
  hr: number;
  bp: string;
  spo2: number;
  rr: number;
  deviceStatus: string[];
  escalation: "Nurse" | "Doctor" | "None";
  lastReview: string;
  critical: boolean;
};

export type IcuTask = {
  id: string;
  title: string;
  patient: string;
  due: string;
  priority: "STAT" | "Critical" | "High" | "Routine";
  status: "Pending" | "Acknowledged" | "In Progress" | "Completed";
};

export const icuPatients: IcuPatient[] = [
  {
    id: "p-405",
    patientId: "pat-icu-405",
    bed: "405B",
    name: "Margaret Vance",
    mrn: "882-991-002",
    ageGender: "76F",
    diagnosis: "Sepsis protocol",
    allergy: "Penicillin",
    isolation: "Contact",
    fallRisk: "High",
    braden: 12,
    news2: 8,
    mews: 4,
    sepsis: "High",
    hr: 142,
    bp: "118/58",
    spo2: 84,
    rr: 32,
    deviceStatus: ["Vent A/C", "Central line", "Infusion pump"],
    escalation: "Doctor",
    lastReview: "07:45 AM",
    critical: true,
  },
  {
    id: "p-402",
    patientId: "pat-icu-402",
    bed: "402A",
    name: "Robert Wilson",
    mrn: "114-22-B",
    ageGender: "68M",
    diagnosis: "Post-op cardiac CABG",
    allergy: "None",
    isolation: "Droplet",
    fallRisk: "High",
    braden: 16,
    news2: 5,
    mews: 2,
    sepsis: "Medium",
    hr: 92,
    bp: "118/76",
    spo2: 96,
    rr: 18,
    deviceStatus: ["Cardiac monitor", "IV line"],
    escalation: "Nurse",
    lastReview: "08:15 AM",
    critical: false,
  },
  {
    id: "p-407",
    patientId: "pat-icu-407",
    bed: "407",
    name: "Maria Garcia",
    mrn: "98234-A",
    ageGender: "64F",
    diagnosis: "Post-op orthopedics",
    allergy: "Penicillin",
    isolation: "Contact",
    fallRisk: "High",
    braden: 12,
    news2: 8,
    mews: 4,
    sepsis: "High",
    hr: 110,
    bp: "88/54",
    spo2: 91,
    rr: 24,
    deviceStatus: ["Vent A/C", "Cardiac", "Infusion"],
    escalation: "Doctor",
    lastReview: "07:45 AM",
    critical: true,
  },
  {
    id: "p-404",
    patientId: "pat-icu-404",
    bed: "404",
    name: "James Doe",
    mrn: "114-22-B",
    ageGender: "72M",
    diagnosis: "Pneumonia",
    allergy: "NKA",
    isolation: "Droplet",
    fallRisk: "Medium",
    braden: 15,
    news2: 5,
    mews: 2,
    sepsis: "Medium",
    hr: 92,
    bp: "128/82",
    spo2: 94,
    rr: 18,
    deviceStatus: ["Cardiac", "Pump 1 SVC"],
    escalation: "Nurse",
    lastReview: "06:20 AM",
    critical: false,
  },
];

export const icuTasks: IcuTask[] = [
  { id: "t-1", title: "ABG sample and electrolytes", patient: "Bed 405B", due: "STAT", priority: "STAT", status: "Pending" },
  { id: "t-2", title: "Hourly I/O recording", patient: "Bed 407", due: "09:00 AM", priority: "High", status: "Acknowledged" },
  { id: "t-3", title: "Pain score reassessment", patient: "Bed 402A", due: "09:30 AM", priority: "Routine", status: "In Progress" },
  { id: "t-4", title: "Blood transfusion verification", patient: "Bed 405B", due: "Due now", priority: "Critical", status: "Pending" },
  { id: "t-5", title: "Dressing change", patient: "Bed 404", due: "11:30 AM", priority: "Routine", status: "Completed" },
];

export const icuMeds = [
  { id: "m-1", name: "Heparin infusion", patient: "Bed 407", status: "High-risk verification", time: "09:15 AM", nurseSignature: "Required" },
  { id: "m-2", name: "Meropenem 1g IV", patient: "Bed 405B", status: "Dispensed", time: "10:00 AM", nurseSignature: "Pending" },
  { id: "m-3", name: "Insulin regular", patient: "Bed 404", status: "Scheduled", time: "10:30 AM", nurseSignature: "Pending" },
];

export const icuAlerts = [
  { id: "a-1", label: "Potassium 2.8 mmol/L", patient: "Bed 405B", type: "Critical lab" },
  { id: "a-2", label: "qSOFA score 2", patient: "Bed 402A", type: "Sepsis alert" },
  { id: "a-3", label: "STAT order pending", patient: "Bed 407", type: "Doctor escalation" },
];

export const handoverSteps = ["Census review", "Risk analysis", "Clinical docs", "Medication safety", "Transfer"];

export const journeyEvents = [
  { time: "08:15", user: "RN Sarah Jenkins", department: "ICU", action: "Shift handover completed", remarks: "Incoming nurse accepted care." },
  { time: "08:45", user: "Lab Unit", department: "Laboratory", action: "ABG collected", remarks: "Results pending validation." },
  { time: "09:12", user: "Dr. Henderson", department: "ICU", action: "STAT order placed", remarks: "Meropenem 1g IV Q8h." },
  { time: "09:28", user: "Pharmacy", department: "Pharmacy", action: "Order acknowledged", remarks: "Dispensing from central vault." },
];
