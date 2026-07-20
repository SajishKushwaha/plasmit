import type { LucideIcon } from "lucide-react";
import { Activity, Bone, Brain, Ear, Eye, HeartPulse, ShieldAlert, Smile, Stethoscope, Users, Workflow } from "lucide-react";

export type ClinicalSeverity = "Normal" | "Mild" | "Moderate" | "Severe" | "Critical";
export type SpecialtyId = "cvs" | "cns" | "respiratory" | "gastro" | "orthopedic" | "ent" | "ophthalmology" | "gynecology" | "pediatrics" | "dermatology" | "psychiatry" | "general";

export type ClinicalSpecialty = {
  id: SpecialtyId;
  label: string;
  department: string;
  recentlyUsed?: boolean;
  favorite?: boolean;
  icon: LucideIcon;
};

export type ExamFinding = {
  label: string;
  value: string;
  severity: ClinicalSeverity;
  score?: number;
};

export type ClinicalTimelineItem = {
  id: string;
  time: string;
  specialty: string;
  doctor: string;
  summary: string;
  status: string;
};

export type ClinicalTrendPoint = {
  day: string;
  vitals: number;
  risk: number;
  recovery: number;
  score: number;
};

export const clinicalPatient = {
  uhid: "PLH-240118",
  name: "Meera Joshi",
  ageGender: "42/F",
  encounter: "IPD-1188 / OPD-5261",
  wardBed: "ICU-2 / Bed 07",
  consultant: "Dr. Kavita Rao",
  allergies: "Penicillin allergy",
  flags: ["Fall risk", "High BP watch", "Anticoagulant review"],
};

export const quickClinicalActions = ["Clinical Examination", "Progress Notes", "Orders", "Prescription", "Vitals", "Reports", "Nursing Notes", "Discharge Summary"];

export const clinicalSpecialties: ClinicalSpecialty[] = [
  { id: "cvs", label: "CVS", department: "Medicine", favorite: true, recentlyUsed: true, icon: HeartPulse },
  { id: "cns", label: "CNS", department: "Neurology", recentlyUsed: true, icon: Brain },
  { id: "respiratory", label: "Respiratory", department: "Pulmonology", favorite: true, icon: Stethoscope },
  { id: "gastro", label: "Gastroenterology", department: "Medicine", icon: Activity },
  { id: "orthopedic", label: "Orthopedic", department: "Orthopedics", icon: Bone },
  { id: "ent", label: "ENT", department: "ENT", icon: Ear },
  { id: "ophthalmology", label: "Ophthalmology", department: "Ophthalmology", icon: Eye },
  { id: "gynecology", label: "Gynecology", department: "OBG", icon: Users },
  { id: "pediatrics", label: "Pediatrics", department: "Pediatrics", icon: Smile },
  { id: "dermatology", label: "Dermatology", department: "Dermatology", icon: ShieldAlert },
  { id: "psychiatry", label: "Psychiatry", department: "Psychiatry", icon: Brain },
  { id: "general", label: "General Medicine", department: "Medicine", recentlyUsed: true, icon: Workflow },
];

export const examinationSections = {
  cvs: ["Heart sounds", "Murmur", "Pulse", "BP", "Peripheral edema", "JVP", "Cyanosis", "Capillary refill", "Chest pain", "Rhythm"],
  cns: ["Consciousness", "Orientation", "Speech", "Motor power", "Sensory exam", "Reflexes", "Cranial nerves", "GCS", "Tremors", "Coordination", "Gait"],
  respiratory: ["Breath sounds", "Wheezing", "Crepitations", "SpO2", "Distress", "Cough", "Chest expansion", "Trachea position"],
  gastro: ["Tenderness", "Distension", "Bowel sounds", "Liver/Spleen", "Vomiting", "Stool history", "Appetite"],
  orthopedic: ["Joint movement", "Pain scale", "Swelling", "Tenderness", "Deformity", "Mobility"],
  ent: ["Ear canal", "Tympanic membrane", "Nasal airway", "Throat", "Tonsils", "Hearing screen", "Neck nodes"],
  ophthalmology: ["Visual acuity", "Conjunctiva", "Cornea", "Pupil reaction", "Fundus", "Eye movement", "IOP"],
  gynecology: ["Menstrual history", "Pelvic pain", "Discharge", "Bleeding", "Obstetric risk", "Breast exam"],
  pediatrics: ["Growth", "Feeding", "Activity", "Hydration", "Immunization", "Development", "Parent concern"],
  dermatology: ["Lesion type", "Distribution", "Itching", "Erythema", "Scaling", "Infection signs", "Photos"],
  psychiatry: ["Appearance", "Mood", "Thought", "Perception", "Cognition", "Insight", "Risk assessment"],
  general: ["General appearance", "Hydration", "Pallor", "Icterus", "Clubbing", "Lymph nodes", "System review"],
};

export const examinationFindings: Record<SpecialtyId, ExamFinding[]> = {
  cvs: [
    { label: "Heart sounds", value: "S1/S2 audible", severity: "Normal", score: 0 },
    { label: "Murmur", value: "Absent", severity: "Normal", score: 0 },
    { label: "Pulse", value: "Regular, 86 bpm", severity: "Mild", score: 1 },
    { label: "BP", value: "148/92 mmHg", severity: "Moderate", score: 2 },
    { label: "Peripheral edema", value: "Absent", severity: "Normal", score: 0 },
    { label: "JVP", value: "Not raised", severity: "Normal", score: 0 },
    { label: "Capillary refill", value: "2 sec", severity: "Normal", score: 0 },
    { label: "Rhythm abnormality", value: "No acute rhythm change", severity: "Normal", score: 0 },
  ],
  cns: [
    { label: "Consciousness", value: "Alert and responsive", severity: "Normal", score: 0 },
    { label: "Orientation", value: "Oriented to time, place, person", severity: "Normal", score: 0 },
    { label: "Speech", value: "Clear, no dysarthria", severity: "Normal", score: 0 },
    { label: "Motor power", value: "5/5 all limbs", severity: "Normal", score: 0 },
    { label: "Reflexes", value: "Brisk right knee jerk", severity: "Mild", score: 1 },
    { label: "GCS", value: "15/15", severity: "Normal", score: 0 },
    { label: "Coordination", value: "Finger-nose intact", severity: "Normal", score: 0 },
    { label: "Gait", value: "Assisted gait advised", severity: "Mild", score: 1 },
  ],
  respiratory: [
    { label: "Breath sounds", value: "Bilateral air entry present", severity: "Normal", score: 0 },
    { label: "Wheezing", value: "Mild expiratory wheeze", severity: "Mild", score: 1 },
    { label: "Crepitations", value: "Absent", severity: "Normal", score: 0 },
    { label: "SpO2", value: "97% on room air", severity: "Normal", score: 0 },
    { label: "Respiratory distress", value: "No accessory muscle use", severity: "Normal", score: 0 },
    { label: "Cough", value: "Dry cough improving", severity: "Mild", score: 1 },
    { label: "Chest expansion", value: "Symmetric", severity: "Normal", score: 0 },
    { label: "Trachea position", value: "Central", severity: "Normal", score: 0 },
  ],
  gastro: [
    { label: "Tenderness", value: "Mild epigastric tenderness", severity: "Mild", score: 1 },
    { label: "Distension", value: "Absent", severity: "Normal", score: 0 },
    { label: "Bowel sounds", value: "Present", severity: "Normal", score: 0 },
    { label: "Liver/Spleen", value: "Not palpable", severity: "Normal", score: 0 },
    { label: "Vomiting", value: "No active vomiting", severity: "Normal", score: 0 },
    { label: "Stool history", value: "Regular", severity: "Normal", score: 0 },
    { label: "Appetite", value: "Reduced today", severity: "Mild", score: 1 },
  ],
  orthopedic: [
    { label: "Joint movement", value: "Right knee ROM mildly restricted", severity: "Mild", score: 1 },
    { label: "Pain scale", value: "3/10", severity: "Mild", score: 1 },
    { label: "Swelling", value: "Minimal periarticular swelling", severity: "Mild", score: 1 },
    { label: "Tenderness", value: "Localized medial joint line", severity: "Mild", score: 1 },
    { label: "Deformity", value: "Absent", severity: "Normal", score: 0 },
    { label: "Mobility", value: "Walking with support", severity: "Moderate", score: 2 },
  ],
  ent: [
    { label: "Ear canal", value: "Clear bilaterally", severity: "Normal", score: 0 },
    { label: "Tympanic membrane", value: "Intact, no bulge", severity: "Normal", score: 0 },
    { label: "Nasal airway", value: "Mild congestion", severity: "Mild", score: 1 },
    { label: "Throat", value: "Mild erythema", severity: "Mild", score: 1 },
    { label: "Tonsils", value: "Not enlarged", severity: "Normal", score: 0 },
    { label: "Neck nodes", value: "No significant nodes", severity: "Normal", score: 0 },
  ],
  ophthalmology: [
    { label: "Visual acuity", value: "6/9 right, 6/9 left", severity: "Mild", score: 1 },
    { label: "Conjunctiva", value: "No congestion", severity: "Normal", score: 0 },
    { label: "Cornea", value: "Clear", severity: "Normal", score: 0 },
    { label: "Pupil reaction", value: "Equal and reactive", severity: "Normal", score: 0 },
    { label: "Fundus", value: "No acute finding", severity: "Normal", score: 0 },
    { label: "Eye movement", value: "Full range", severity: "Normal", score: 0 },
  ],
  gynecology: [
    { label: "Menstrual history", value: "Cycle history reviewed", severity: "Normal", score: 0 },
    { label: "Pelvic pain", value: "Mild intermittent pain", severity: "Mild", score: 1 },
    { label: "Discharge", value: "No foul discharge", severity: "Normal", score: 0 },
    { label: "Bleeding", value: "No active bleeding", severity: "Normal", score: 0 },
    { label: "Obstetric risk", value: "No acute red flag", severity: "Normal", score: 0 },
    { label: "Breast exam", value: "No focal lump reported", severity: "Normal", score: 0 },
  ],
  pediatrics: [
    { label: "Growth", value: "Appropriate for age", severity: "Normal", score: 0 },
    { label: "Feeding", value: "Feeding reduced since morning", severity: "Mild", score: 1 },
    { label: "Activity", value: "Active and playful", severity: "Normal", score: 0 },
    { label: "Hydration", value: "Mucosa moist", severity: "Normal", score: 0 },
    { label: "Immunization", value: "Due vaccine flagged", severity: "Mild", score: 1 },
    { label: "Development", value: "Age appropriate milestones", severity: "Normal", score: 0 },
  ],
  dermatology: [
    { label: "Lesion type", value: "Maculopapular rash", severity: "Mild", score: 1 },
    { label: "Distribution", value: "Localized forearm", severity: "Mild", score: 1 },
    { label: "Itching", value: "Present, intermittent", severity: "Mild", score: 1 },
    { label: "Erythema", value: "Mild", severity: "Mild", score: 1 },
    { label: "Scaling", value: "Absent", severity: "Normal", score: 0 },
    { label: "Infection signs", value: "No discharge or warmth", severity: "Normal", score: 0 },
  ],
  psychiatry: [
    { label: "Appearance", value: "Well groomed", severity: "Normal", score: 0 },
    { label: "Mood", value: "Anxious affect", severity: "Mild", score: 1 },
    { label: "Thought", value: "Coherent, goal directed", severity: "Normal", score: 0 },
    { label: "Perception", value: "No hallucination reported", severity: "Normal", score: 0 },
    { label: "Cognition", value: "Attention intact", severity: "Normal", score: 0 },
    { label: "Risk assessment", value: "No self-harm intent stated", severity: "Normal", score: 0 },
  ],
  general: [
    { label: "General appearance", value: "Comfortable at rest", severity: "Normal", score: 0 },
    { label: "Hydration", value: "Adequate", severity: "Normal", score: 0 },
    { label: "Pallor", value: "Absent", severity: "Normal", score: 0 },
    { label: "Icterus", value: "Absent", severity: "Normal", score: 0 },
    { label: "Clubbing", value: "Absent", severity: "Normal", score: 0 },
    { label: "Lymph nodes", value: "Not enlarged", severity: "Normal", score: 0 },
  ],
};

export const examinationDefaultNotes: Record<SpecialtyId, string> = {
  cvs: "CVS: S1/S2 heard. No murmur. Pulse regular. BP elevated, continue monitoring and review trend before discharge planning.",
  cns: "CNS: Patient alert and oriented. GCS 15/15. Motor power preserved with mild reflex variation; compare with previous neuro exam.",
  respiratory: "Respiratory: Bilateral air entry present. Mild wheeze noted, SpO2 stable on room air. Continue oxygen trend review.",
  gastro: "Gastrointestinal: Abdomen soft, bowel sounds present, mild epigastric tenderness. No guarding or acute abdominal red flag.",
  orthopedic: "Orthopedic: Mild right knee restriction with localized tenderness. Mobility support advised and pain score monitored.",
  ent: "ENT: Mild nasal congestion and throat erythema. Ear canal clear, no acute otitis finding.",
  ophthalmology: "Ophthalmology: Pupils equal and reactive, cornea clear, mild visual acuity variation. No acute ocular red flag.",
  gynecology: "Gynecology: Pelvic pain mild and intermittent. No active bleeding or foul discharge. Obstetric risk screen reviewed.",
  pediatrics: "Pediatrics: Child active, hydration adequate, feeding mildly reduced. Immunization due flag reviewed with guardian.",
  dermatology: "Dermatology: Localized mild maculopapular rash with itching. No discharge, warmth, or secondary infection signs.",
  psychiatry: "Psychiatry: Cooperative, coherent thought process, anxious affect. No self-harm intent reported during screening.",
  general: "General medicine: Comfortable at rest, hydration adequate, no pallor/icterus/clubbing. Continue system-wise review.",
};

export const clinicalTimeline: ClinicalTimelineItem[] = [
  { id: "ce-001", time: "Today 10:45", specialty: "CVS", doctor: "Dr. Kavita Rao", summary: "BP elevated, perfusion warm, no murmur.", status: "Draft autosaved" },
  { id: "ce-002", time: "Yesterday 18:20", specialty: "Respiratory", doctor: "Dr. Aman Verma", summary: "SpO2 stable on room air, no distress.", status: "Final submitted" },
  { id: "ce-003", time: "Yesterday 10:10", specialty: "CNS", doctor: "Dr. Neha Malik", summary: "GCS 15, motor power symmetric.", status: "Consultant verified" },
];

export const clinicalTrendData: ClinicalTrendPoint[] = [
  { day: "Mon", vitals: 84, risk: 32, recovery: 62, score: 5 },
  { day: "Tue", vitals: 82, risk: 30, recovery: 66, score: 4 },
  { day: "Wed", vitals: 88, risk: 36, recovery: 64, score: 6 },
  { day: "Thu", vitals: 86, risk: 34, recovery: 68, score: 5 },
  { day: "Fri", vitals: 90, risk: 42, recovery: 70, score: 7 },
  { day: "Sat", vitals: 86, risk: 31, recovery: 74, score: 4 },
];

export const clinicalScores = [
  { label: "GCS", value: "15/15", severity: "Normal" as ClinicalSeverity, note: "Eye 4, Verbal 5, Motor 6" },
  { label: "Pain score", value: "3/10", severity: "Mild" as ClinicalSeverity, note: "Controlled with current plan" },
  { label: "NEWS score", value: "4", severity: "Moderate" as ClinicalSeverity, note: "BP and pulse watch" },
  { label: "Fall risk", value: "High", severity: "Severe" as ClinicalSeverity, note: "Bed rail and assisted ambulation" },
];

export const reportLinks = [
  { type: "ECG", name: "12 lead ECG", time: "Today 09:30", status: "Reviewed" },
  { type: "Echo", name: "2D Echo", time: "Yesterday 16:10", status: "Pending comparison" },
  { type: "Lab", name: "CBC, Electrolytes", time: "Today 08:00", status: "Critical value flagged" },
  { type: "X-ray", name: "Chest PA", time: "Yesterday 11:20", status: "Attached" },
];

export const builderFields = ["Radio", "Checkbox", "Numeric", "Text", "Dropdown", "Severity selector", "Image upload"];
export const backendApis = ["GET /api/v1/patients/:id", "GET /api/v1/clinical/templates", "POST /api/v1/clinical/examinations", "GET /api/v1/clinical/graphs/:patientId", "POST /api/v1/clinical/scores/calculate", "GET /api/v1/clinical/history/:patientId", "POST /api/v1/clinical/approvals", "GET /api/v1/clinical/examinations/:id/pdf"];
export const databaseTables = ["patients", "clinical_examinations", "examination_templates", "examination_sections", "examination_fields", "examination_results", "clinical_scores", "clinical_graph_data", "doctor_notes", "approvals", "attachments"];
