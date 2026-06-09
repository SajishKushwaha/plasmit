"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  FilePenLine,
  FileText,
  HeartPulse,
  MoreVertical,
  Pill,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Trash2,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NoteCategory = "Nurse Notes" | "Medical Notes" | "Pharmacy Notes" | "Allied Health Notes" | "Additional Progress Notes";
type NoteStatus = "Signed" | "Draft" | "Pending Review";
type MedicalNoteType = "Progress Note" | "Consult Note" | "Discharge Summary" | "Admission History and Physical" | "Procedure Note";
type PharmacyNoteType = "Medication Review" | "Medication Reconciliation" | "Drug Interaction" | "Dose Adjustment" | "Adverse Drug Reaction" | "Medication Counseling" | "Anticoagulation Review" | "Renal Dose Review";
type AlliedNoteType = "Initial Assessment" | "Treatment Session" | "Progress Review" | "Discharge Summary";
type AdditionalNoteType = "General Progress Note" | "Follow-up Note" | "Care Coordination Note" | "Patient Education Note" | "Phone Call Note" | "Family Communication Note" | "Handover Note" | "Case Management Note";

type PharmacyDocumentation = {
  noteType: PharmacyNoteType;
  medicationName: string;
  medicationCode: string;
  dose: string;
  doseUnit: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate: string;
  medicationStatus: string;
  reviewReason: string;
  clinicalIndication: string;
  medicationProblem: string;
  interactionSeverity: string;
  relevantAllergy: string;
  relevantLabs: string;
  recommendation: string;
  prescriberResponse: string;
  recommendationOutcome: string;
  followUp: string;
};

type AlliedHealthDocumentation = {
  noteType: AlliedNoteType;
  referralReason: string;
  initialAssessment: string;
  functionalStatus: string;
  identifiedProblems: string;
  intervention: string;
  patientResponse: string;
  goals: string;
  goalProgress: string;
  educationProvided: string;
  followUpPlan: string;
  sessionDateTime: string;
  sessionDuration: string;
  mobilityStatus: string;
  rangeOfMotion: string;
  muscleStrength: string;
  balance: string;
  gait: string;
  transferAbility: string;
  walkingDistance: string;
  assistiveDevice: string;
  painScore: string;
  fallRisk: string;
  exerciseIntervention: string;
  patientTolerance: string;
  nextSessionPlan: string;
  currentWeight: string;
  height: string;
  bmi: string;
  weightChange: string;
  dietaryIntake: string;
  appetite: string;
  nutritionDiagnosis: string;
  calorieRequirement: string;
  proteinRequirement: string;
  nutritionIntervention: string;
  dietRecommendation: string;
  supplementPlan: string;
  monitoringPlan: string;
  supportSystem: string;
  livingArrangement: string;
  financialConcerns: string;
  safeguardingRisk: string;
  psychosocialConcerns: string;
  dischargeBarriers: string;
  communityResources: string;
  referralsMade: string;
  consent: string;
  adlStatus: string;
  cognition: string;
  homeSafety: string;
  equipmentNeeds: string;
  speechStatus: string;
  languageStatus: string;
  swallowingStatus: string;
  aspirationRisk: string;
  mentalStatus: string;
  psychologicalRisk: string;
  psychologyIntervention: string;
  psychologyResponse: string;
  functionalBaseline: string;
  multidisciplinaryGoals: string;
  rehabilitationProgress: string;
};

type AdditionalProgressDocumentation = {
  noteType: AdditionalNoteType;
  reasonForNote: string;
  currentCondition: string;
  changesOrFindings: string;
  actionTaken: string;
  patientResponse: string;
  peopleInformed: string;
  followUpRequired: string;
  followUpDate: string;
  previousPlan: string;
  currentSymptoms: string;
  changeSinceReview: string;
  treatmentCompliance: string;
  relevantResults: string;
  currentAssessment: string;
  nextAction: string;
  escalationRequired: string;
  coordinationReason: string;
  currentCareNeeds: string;
  teamsInvolved: string;
  patientFamilyInvolvement: string;
  discussionSummary: string;
  decisionsMade: string;
  assignedActions: string;
  responsiblePerson: string;
  targetDate: string;
  referralRequired: string;
  dischargeBarriers: string;
  followUpStatus: string;
  educationTopic: string;
  educationProvidedTo: string;
  teachingMethod: string;
  materialLanguage: string;
  informationExplained: string;
  patientUnderstanding: string;
  teachBackResult: string;
  learningBarriers: string;
  interpreterRequired: string;
  questionsRaised: string;
  additionalEducation: string;
  callDirection: string;
  callerRecipient: string;
  relationshipToPatient: string;
  contactNumber: string;
  callDateTime: string;
  identityVerified: string;
  callReason: string;
  clinicalAdvice: string;
  actionAgreed: string;
  urgency: string;
  callOutcome: string;
  patientConsent: string;
  informationShared: string;
  familyConcerns: string;
  handoverFrom: string;
  handoverTo: string;
  handoverDateTime: string;
  situation: string;
  background: string;
  handoverAssessment: string;
  recommendation: string;
  pendingTasks: string;
  safetyConcerns: string;
  escalationCriteria: string;
  acknowledgementReceived: string;
  caseNeeds: string;
  servicesInvolved: string;
  caseBarriers: string;
  resourcePlan: string;
  caseOutcome: string;
  amendmentReason: string;
};

type Note = {
  id: number;
  title: string;
  category: NoteCategory;
  specialty: string;
  author: string;
  date: string;
  status: NoteStatus;
  priority: "High" | "Medium" | "Low";
  content?: string;
  assessment?: string;
  intervention?: string;
  patientResponse?: string;
  safetyRisk?: string;
  communication?: string;
  followUpPlan?: string;
  bloodPressureSystolic?: string;
  bloodPressureDiastolic?: string;
  pulse?: string;
  painScore?: string;
  signedBy?: string;
  signedAt?: string;
  signatureAttested?: boolean;
  medicalNoteType?: MedicalNoteType;
  subjective?: string;
  objective?: string;
  medicalAssessment?: string;
  plan?: string;
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string;
  practitionerId?: string;
  patientId?: string;
  encounterId?: string;
  serviceDateTime?: string;
  authenticatedSigner?: string;
  amendmentReason?: string;
  pharmacy?: PharmacyDocumentation;
  alliedHealth?: AlliedHealthDocumentation;
  additionalProgress?: AdditionalProgressDocumentation;
};

type CategoryConfig = {
  id: string;
  label: NoteCategory;
  shortLabel: string;
  description: string;
  count: number;
  icon: typeof Stethoscope;
  accent: string;
  soft: string;
  specialties: string[];
};

type NoteTableActions = {
  onDelete: (note: Note) => void;
  onEdit: (note: Note) => void;
  onStatusChange: (note: Note, status: NoteStatus) => void;
  onView: (note: Note) => void;
};

const categories: CategoryConfig[] = [
  {
    id: "nurse",
    label: "Nurse Notes",
    shortLabel: "Nurse",
    description: "Nursing assessment, care notes and shift notes",
    count: 32,
    icon: HeartPulse,
    accent: "text-blue-600",
    soft: "bg-blue-50 dark:bg-blue-950/35",
    specialties: ["ICU", "Cardiology", "Cardiac Assessment", "Cardiac Rehab", "Burns", "Breast Care", "Aged Care"],
  },
  {
    id: "medical",
    label: "Medical Notes",
    shortLabel: "Medical",
    description: "Physician notes, consults and evaluations",
    count: 28,
    icon: Stethoscope,
    accent: "text-emerald-600",
    soft: "bg-emerald-50 dark:bg-emerald-950/35",
    specialties: ["Cardiology", "ICU", "Neurology", "Oncology", "Orthopedics", "General Medicine", "Emergency Medicine"],
  },
  {
    id: "pharmacy",
    label: "Pharmacy Notes",
    shortLabel: "Pharmacy",
    description: "Pharmacy care, medication reviews and interventions",
    count: 14,
    icon: Pill,
    accent: "text-violet-600",
    soft: "bg-violet-50 dark:bg-violet-950/35",
    specialties: ["General", "ICU", "Cardiology", "Oncology", "Renal", "Anticoagulation", "Nutrition Support"],
  },
  {
    id: "allied",
    label: "Allied Health Notes",
    shortLabel: "Allied Health",
    description: "Therapy, nutrition, social work and allied health",
    count: 18,
    icon: UsersRound,
    accent: "text-orange-600",
    soft: "bg-orange-50 dark:bg-orange-950/35",
    specialties: ["Physiotherapy", "Nutrition", "Social Work", "Occupational Therapy", "Speech Therapy", "Psychology", "Rehabilitation"],
  },
  {
    id: "additional",
    label: "Additional Progress Notes",
    shortLabel: "Additional",
    description: "Additional progress and follow-up notes",
    count: 11,
    icon: ClipboardList,
    accent: "text-cyan-600",
    soft: "bg-cyan-50 dark:bg-cyan-950/35",
    specialties: ["General", "Follow Up", "Care Coordination", "Patient Education", "Phone Call Note", "Family Communication", "Handover", "Case Management"],
  },
];

const initialNotes: Note[] = [
  { id: 1, title: "Pain Management Note", category: "Nurse Notes", specialty: "ICU", author: "Nurse Mary", date: "26 May 2026, 09:30 AM", status: "Signed", priority: "High" },
  { id: 2, title: "Shift Assessment", category: "Nurse Notes", specialty: "ICU", author: "Nurse Mary", date: "26 May 2026, 06:30 AM", status: "Signed", priority: "Medium" },
  { id: 3, title: "Care Plan Note", category: "Nurse Notes", specialty: "Cardiology", author: "Nurse Anna", date: "25 May 2026, 10:15 PM", status: "Draft", priority: "Low" },
  { id: 4, title: "Progress Note", category: "Medical Notes", specialty: "Cardiology", author: "Dr. Smith", date: "26 May 2026, 08:15 AM", status: "Signed", priority: "Medium" },
  { id: 5, title: "Consult Note", category: "Medical Notes", specialty: "Neurology", author: "Dr. William", date: "25 May 2026, 03:20 PM", status: "Signed", priority: "Low" },
  { id: 6, title: "Discharge Summary", category: "Medical Notes", specialty: "Cardiology", author: "Dr. Smith", date: "25 May 2026, 11:00 AM", status: "Draft", priority: "High" },
  { id: 7, title: "Medication Review", category: "Pharmacy Notes", specialty: "General", author: "Pharmacist John", date: "25 May 2026, 04:45 PM", status: "Signed", priority: "Medium" },
  { id: 8, title: "Drug Interaction Note", category: "Pharmacy Notes", specialty: "ICU", author: "Pharmacist John", date: "25 May 2026, 01:20 PM", status: "Pending Review", priority: "High" },
  { id: 9, title: "Medication Counseling", category: "Pharmacy Notes", specialty: "General", author: "Pharmacist Anna", date: "24 May 2026, 10:30 AM", status: "Draft", priority: "Low" },
  { id: 10, title: "Physiotherapy Session", category: "Allied Health Notes", specialty: "Physiotherapy", author: "John PT", date: "25 May 2026, 02:20 PM", status: "Draft", priority: "Low" },
  { id: 11, title: "Nutrition Assessment", category: "Allied Health Notes", specialty: "Nutrition", author: "Dietitian Mary", date: "25 May 2026, 11:40 AM", status: "Signed", priority: "Medium" },
  { id: 12, title: "Social Work Assessment", category: "Allied Health Notes", specialty: "Social Work", author: "Social Worker", date: "24 May 2026, 03:30 PM", status: "Signed", priority: "Low" },
  { id: 13, title: "Follow Up Note", category: "Additional Progress Notes", specialty: "Follow Up", author: "Nurse Mary", date: "24 May 2026, 11:10 AM", status: "Draft", priority: "Low" },
  { id: 14, title: "Care Coordination Note", category: "Additional Progress Notes", specialty: "Care Coordination", author: "Nurse Anna", date: "24 May 2026, 09:40 AM", status: "Signed", priority: "Medium" },
  { id: 15, title: "Patient Education Note", category: "Additional Progress Notes", specialty: "Patient Education", author: "Nurse Mary", date: "23 May 2026, 04:20 PM", status: "Signed", priority: "Low" },
  { id: 101, title: "Cardiac Assessment Note", category: "Nurse Notes", specialty: "Cardiac Assessment", author: "Nurse Priya", date: "23 May 2026, 02:15 PM", status: "Signed", priority: "High", content: "Cardiac assessment completed. Rhythm stable, peripheral perfusion adequate and chest discomfort absent at rest." },
  { id: 102, title: "Cardiac Rehabilitation Note", category: "Nurse Notes", specialty: "Cardiac Rehab", author: "Nurse Priya", date: "23 May 2026, 12:30 PM", status: "Draft", priority: "Medium", content: "Patient completed supervised mobilisation and tolerated the planned cardiac rehabilitation activity without distress." },
  { id: 103, title: "Burn Wound Care Note", category: "Nurse Notes", specialty: "Burns", author: "Nurse Mary", date: "22 May 2026, 05:10 PM", status: "Signed", priority: "High", content: "Burn dressing changed using aseptic technique. Wound bed clean with no new signs of infection." },
  { id: 104, title: "Breast Care Nursing Note", category: "Nurse Notes", specialty: "Breast Care", author: "Nurse Anna", date: "22 May 2026, 03:45 PM", status: "Pending Review", priority: "Medium", content: "Post-procedure breast care reviewed. Patient advised on wound observation, support garment use and warning signs." },
  { id: 105, title: "Aged Care Review", category: "Nurse Notes", specialty: "Aged Care", author: "Nurse Mary", date: "22 May 2026, 10:20 AM", status: "Signed", priority: "Medium", content: "Falls risk, skin integrity, hydration and orientation reviewed. Assistance required for transfers and personal care." },
  { id: 106, title: "ICU Medical Progress Note", category: "Medical Notes", specialty: "ICU", author: "Dr. Smith", date: "23 May 2026, 01:40 PM", status: "Signed", priority: "High", content: "Hemodynamically stable in ICU. Continue close respiratory monitoring and current supportive management.", medicalNoteType: "Progress Note" },
  { id: 107, title: "Oncology Consult Note", category: "Medical Notes", specialty: "Oncology", author: "Dr. Mehta", date: "22 May 2026, 04:35 PM", status: "Pending Review", priority: "High", content: "Oncology review completed. Treatment response and current blood results discussed with the patient.", medicalNoteType: "Consult Note" },
  { id: 108, title: "Orthopedic Progress Note", category: "Medical Notes", specialty: "Orthopedics", author: "Dr. William", date: "22 May 2026, 02:25 PM", status: "Signed", priority: "Medium", content: "Pain and limb function improving. Continue protected mobilisation and repeat imaging as planned.", medicalNoteType: "Progress Note" },
  { id: 109, title: "General Medicine Review", category: "Medical Notes", specialty: "General Medicine", author: "Dr. Smith", date: "22 May 2026, 11:50 AM", status: "Draft", priority: "Medium", content: "General medical review completed. Chronic conditions remain stable and medication plan was reconciled.", medicalNoteType: "Progress Note" },
  { id: 110, title: "Emergency Medicine Note", category: "Medical Notes", specialty: "Emergency Medicine", author: "Dr. Rao", date: "21 May 2026, 08:15 PM", status: "Signed", priority: "High", content: "Emergency assessment completed. Immediate causes of deterioration addressed and patient transferred for ongoing monitoring.", medicalNoteType: "Procedure Note" },
  { id: 111, title: "Cardiology Medication Review", category: "Pharmacy Notes", specialty: "Cardiology", author: "Pharmacist John", date: "23 May 2026, 10:35 AM", status: "Signed", priority: "Medium", content: "Cardiac medicines reviewed for dose, duplication and blood pressure effect. No immediate medication safety issue identified." },
  { id: 112, title: "Oncology Medication Safety Note", category: "Pharmacy Notes", specialty: "Oncology", author: "Pharmacist Anna", date: "22 May 2026, 05:25 PM", status: "Pending Review", priority: "High", content: "Anticancer supportive medicines reviewed against current laboratory results and interaction risks." },
  { id: 113, title: "Renal Dose Review", category: "Pharmacy Notes", specialty: "Renal", author: "Pharmacist John", date: "22 May 2026, 01:15 PM", status: "Signed", priority: "High", content: "Renal function reviewed. Dose adjustment recommended for medicines cleared primarily by the kidneys." },
  { id: 114, title: "Anticoagulation Review", category: "Pharmacy Notes", specialty: "Anticoagulation", author: "Pharmacist Anna", date: "21 May 2026, 04:40 PM", status: "Draft", priority: "High", content: "Anticoagulation indication, bleeding risk and recent monitoring results reviewed. Follow-up level requested." },
  { id: 115, title: "Nutrition Support Pharmacy Note", category: "Pharmacy Notes", specialty: "Nutrition Support", author: "Pharmacist John", date: "21 May 2026, 12:05 PM", status: "Signed", priority: "Medium", content: "Parenteral nutrition ingredients, electrolyte content and infusion compatibility reviewed with the nutrition team." },
  { id: 116, title: "Occupational Therapy Assessment", category: "Allied Health Notes", specialty: "Occupational Therapy", author: "Therapist Neha", date: "23 May 2026, 09:20 AM", status: "Signed", priority: "Medium", content: "Daily living activities and home safety needs assessed. Adaptive equipment recommendations discussed." },
  { id: 117, title: "Speech Therapy Review", category: "Allied Health Notes", specialty: "Speech Therapy", author: "Therapist Riya", date: "22 May 2026, 03:10 PM", status: "Pending Review", priority: "High", content: "Speech clarity and swallow safety reviewed. Modified texture and supervised intake remain recommended." },
  { id: 118, title: "Psychology Session Note", category: "Allied Health Notes", specialty: "Psychology", author: "Dr. Kapoor", date: "22 May 2026, 11:30 AM", status: "Draft", priority: "Medium", content: "Patient discussed treatment-related anxiety. Grounding strategies and short-term coping plan were introduced." },
  { id: 119, title: "Rehabilitation Progress Review", category: "Allied Health Notes", specialty: "Rehabilitation", author: "Rehab Clinician", date: "21 May 2026, 02:50 PM", status: "Signed", priority: "Medium", content: "Multidisciplinary rehabilitation goals reviewed. Mobility and self-care tolerance continue to improve." },
  { id: 120, title: "General Progress Update", category: "Additional Progress Notes", specialty: "General", author: "Nurse Anna", date: "23 May 2026, 08:45 AM", status: "Signed", priority: "Medium", content: "General condition remains stable. Current care plan continues with routine observations and symptom review." },
  { id: 121, title: "Phone Call Note", category: "Additional Progress Notes", specialty: "Phone Call Note", author: "Nurse Mary", date: "22 May 2026, 06:05 PM", status: "Signed", priority: "Medium", content: "Family member contacted by phone and updated on the current care plan, visiting guidance and next review." },
  { id: 122, title: "Family Communication Note", category: "Additional Progress Notes", specialty: "Family Communication", author: "Nurse Anna", date: "22 May 2026, 02:40 PM", status: "Pending Review", priority: "Medium", content: "Patient consent confirmed and progress discussed with family. Questions about discharge support were addressed." },
  { id: 123, title: "Clinical Handover Note", category: "Additional Progress Notes", specialty: "Handover", author: "Nurse Mary", date: "21 May 2026, 07:00 PM", status: "Signed", priority: "High", content: "Shift handover completed using SBAR. Pending investigations, mobility assistance and escalation criteria communicated." },
  { id: 124, title: "Case Management Note", category: "Additional Progress Notes", specialty: "Case Management", author: "Case Manager", date: "21 May 2026, 01:25 PM", status: "Draft", priority: "Medium", content: "Discharge needs, family support and community service referrals reviewed. Follow-up actions assigned to the care team." },
];

const medicalNoteTypes: MedicalNoteType[] = [
  "Progress Note",
  "Consult Note",
  "Discharge Summary",
  "Admission History and Physical",
  "Procedure Note",
];

const pharmacyNoteTypes: PharmacyNoteType[] = [
  "Medication Review",
  "Medication Reconciliation",
  "Drug Interaction",
  "Dose Adjustment",
  "Adverse Drug Reaction",
  "Medication Counseling",
  "Anticoagulation Review",
  "Renal Dose Review",
];

const alliedNoteTypes: AlliedNoteType[] = ["Initial Assessment", "Treatment Session", "Progress Review", "Discharge Summary"];

const additionalNoteTypes: AdditionalNoteType[] = [
  "General Progress Note",
  "Follow-up Note",
  "Care Coordination Note",
  "Patient Education Note",
  "Phone Call Note",
  "Family Communication Note",
  "Handover Note",
  "Case Management Note",
];

const emptyPharmacyDocumentation: PharmacyDocumentation = {
  noteType: "Medication Review",
  medicationName: "",
  medicationCode: "",
  dose: "",
  doseUnit: "",
  route: "",
  frequency: "",
  startDate: "",
  endDate: "",
  medicationStatus: "Active",
  reviewReason: "",
  clinicalIndication: "",
  medicationProblem: "",
  interactionSeverity: "None identified",
  relevantAllergy: "",
  relevantLabs: "",
  recommendation: "",
  prescriberResponse: "",
  recommendationOutcome: "Pending",
  followUp: "",
};

const emptyAlliedHealthDocumentation: AlliedHealthDocumentation = {
  noteType: "Initial Assessment",
  referralReason: "",
  initialAssessment: "",
  functionalStatus: "",
  identifiedProblems: "",
  intervention: "",
  patientResponse: "",
  goals: "",
  goalProgress: "",
  educationProvided: "",
  followUpPlan: "",
  sessionDateTime: "",
  sessionDuration: "",
  mobilityStatus: "",
  rangeOfMotion: "",
  muscleStrength: "",
  balance: "",
  gait: "",
  transferAbility: "",
  walkingDistance: "",
  assistiveDevice: "",
  painScore: "",
  fallRisk: "",
  exerciseIntervention: "",
  patientTolerance: "",
  nextSessionPlan: "",
  currentWeight: "",
  height: "",
  bmi: "",
  weightChange: "",
  dietaryIntake: "",
  appetite: "",
  nutritionDiagnosis: "",
  calorieRequirement: "",
  proteinRequirement: "",
  nutritionIntervention: "",
  dietRecommendation: "",
  supplementPlan: "",
  monitoringPlan: "",
  supportSystem: "",
  livingArrangement: "",
  financialConcerns: "",
  safeguardingRisk: "",
  psychosocialConcerns: "",
  dischargeBarriers: "",
  communityResources: "",
  referralsMade: "",
  consent: "",
  adlStatus: "",
  cognition: "",
  homeSafety: "",
  equipmentNeeds: "",
  speechStatus: "",
  languageStatus: "",
  swallowingStatus: "",
  aspirationRisk: "",
  mentalStatus: "",
  psychologicalRisk: "",
  psychologyIntervention: "",
  psychologyResponse: "",
  functionalBaseline: "",
  multidisciplinaryGoals: "",
  rehabilitationProgress: "",
};

const emptyAdditionalProgressDocumentation: AdditionalProgressDocumentation = {
  noteType: "General Progress Note",
  reasonForNote: "",
  currentCondition: "",
  changesOrFindings: "",
  actionTaken: "",
  patientResponse: "",
  peopleInformed: "",
  followUpRequired: "No",
  followUpDate: "",
  previousPlan: "",
  currentSymptoms: "",
  changeSinceReview: "",
  treatmentCompliance: "",
  relevantResults: "",
  currentAssessment: "",
  nextAction: "",
  escalationRequired: "No",
  coordinationReason: "",
  currentCareNeeds: "",
  teamsInvolved: "",
  patientFamilyInvolvement: "",
  discussionSummary: "",
  decisionsMade: "",
  assignedActions: "",
  responsiblePerson: "",
  targetDate: "",
  referralRequired: "",
  dischargeBarriers: "",
  followUpStatus: "Pending",
  educationTopic: "",
  educationProvidedTo: "",
  teachingMethod: "Verbal explanation",
  materialLanguage: "",
  informationExplained: "",
  patientUnderstanding: "",
  teachBackResult: "",
  learningBarriers: "",
  interpreterRequired: "No",
  questionsRaised: "",
  additionalEducation: "",
  callDirection: "Outgoing",
  callerRecipient: "",
  relationshipToPatient: "",
  contactNumber: "",
  callDateTime: "",
  identityVerified: "No",
  callReason: "",
  clinicalAdvice: "",
  actionAgreed: "",
  urgency: "Routine",
  callOutcome: "Completed",
  patientConsent: "Not recorded",
  informationShared: "",
  familyConcerns: "",
  handoverFrom: "",
  handoverTo: "",
  handoverDateTime: "",
  situation: "",
  background: "",
  handoverAssessment: "",
  recommendation: "",
  pendingTasks: "",
  safetyConcerns: "",
  escalationCriteria: "",
  acknowledgementReceived: "No",
  caseNeeds: "",
  servicesInvolved: "",
  caseBarriers: "",
  resourcePlan: "",
  caseOutcome: "",
  amendmentReason: "",
};

function toDateTimeLocalValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}

function inferMedicalNoteType(title?: string): MedicalNoteType {
  return medicalNoteTypes.find((type) => title?.toLowerCase().includes(type.toLowerCase())) ?? "Progress Note";
}

function inferAdditionalNoteType(specialty?: string, title?: string): AdditionalNoteType {
  const source = `${specialty ?? ""} ${title ?? ""}`.toLowerCase();
  if (source.includes("care coordination")) return "Care Coordination Note";
  if (source.includes("patient education")) return "Patient Education Note";
  if (source.includes("phone call")) return "Phone Call Note";
  if (source.includes("family")) return "Family Communication Note";
  if (source.includes("handover")) return "Handover Note";
  if (source.includes("case management")) return "Case Management Note";
  if (source.includes("follow up") || source.includes("follow-up")) return "Follow-up Note";
  return "General Progress Note";
}

function buildNoteTitle({
  additionalProgress,
  alliedHealth,
  category,
  medicalNoteType,
  pharmacy,
  specialty,
}: {
  additionalProgress: AdditionalProgressDocumentation;
  alliedHealth: AlliedHealthDocumentation;
  category: NoteCategory;
  medicalNoteType: MedicalNoteType;
  pharmacy: PharmacyDocumentation;
  specialty: string;
}) {
  if (category === "Medical Notes") return `${medicalNoteType} - ${specialty}`;
  if (category === "Pharmacy Notes") return `${pharmacy.noteType} - ${pharmacy.medicationName.trim() || specialty}`;
  if (category === "Allied Health Notes") return `${specialty} ${alliedHealth.noteType}`;
  if (category === "Additional Progress Notes") return additionalProgress.noteType;
  return `${specialty} Nursing Note`;
}

function getNoteType(note: Note) {
  if (note.medicalNoteType) return note.medicalNoteType;
  if (note.pharmacy?.noteType) return note.pharmacy.noteType;
  if (note.alliedHealth?.noteType) return note.alliedHealth.noteType;
  if (note.additionalProgress?.noteType) return note.additionalProgress.noteType;
  return note.title;
}

function parseNoteDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getFilterDate(note: Note, dateType: string) {
  if (dateType === "Service Date") {
    return parseNoteDate(
      note.serviceDateTime ??
        note.alliedHealth?.sessionDateTime ??
        note.additionalProgress?.callDateTime ??
        note.additionalProgress?.handoverDateTime,
    );
  }
  return parseNoteDate(note.date);
}

function startOfDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function endOfDate(value: string) {
  return new Date(`${value}T23:59:59.999`);
}

function compareNoteDates(left: Note, right: Note) {
  const leftDate = parseNoteDate(left.serviceDateTime) ?? parseNoteDate(left.date);
  const rightDate = parseNoteDate(right.serviceDateTime) ?? parseNoteDate(right.date);
  return (leftDate?.getTime() ?? 0) - (rightDate?.getTime() ?? 0);
}

function priorityRank(priority: Note["priority"]) {
  return priority === "High" ? 0 : priority === "Medium" ? 1 : 2;
}

export function NotesPage() {
  const searchParams = useSearchParams();
  const [notes, setNotes] = React.useState<Note[]>(initialNotes);
  const [notesLoaded, setNotesLoaded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");
  const [specialty, setSpecialty] = React.useState("All Specialties");
  const [category, setCategory] = React.useState("All Categories");
  const [author, setAuthor] = React.useState("All Authors");
  const [status, setStatus] = React.useState("All Status");
  const [priority, setPriority] = React.useState("All Priorities");
  const [query, setQuery] = React.useState("");
  const [noteType, setNoteType] = React.useState("All Note Types");
  const [signer, setSigner] = React.useState("All Signers");
  const [visitScope, setVisitScope] = React.useState("All Patient Visits");
  const [visitId, setVisitId] = React.useState("");
  const [dateType, setDateType] = React.useState("Created Date");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [followUpFilter, setFollowUpFilter] = React.useState("All Follow-up");
  const [escalationFilter, setEscalationFilter] = React.useState("All Escalation");
  const [noteId, setNoteId] = React.useState("");
  const [notice, setNotice] = React.useState("");
  const [newNoteOpen, setNewNoteOpen] = React.useState(false);
  const [newNoteCategory, setNewNoteCategory] = React.useState<NoteCategory>("Nurse Notes");
  const [filterLockedCategory, setFilterLockedCategory] = React.useState<NoteCategory | null>(null);
  const [editingNote, setEditingNote] = React.useState<Note | null>(null);
  const [viewingNote, setViewingNote] = React.useState<Note | null>(null);
  const activeCategory = categories.find((item) => item.id === activeTab);
  const requestedCategory = searchParams.get("category");
  const requestedSpecialty = searchParams.get("specialty");
  const filtersRequested = searchParams.get("filters") === "open";

  React.useEffect(() => {
    const nextCategory = categories.find((item) => item.id === requestedCategory);
    if (nextCategory) {
      setActiveTab(nextCategory.id);
      setCategory(nextCategory.label);
      setFilterLockedCategory(nextCategory.label);
      setSpecialty(nextCategory.specialties.includes(requestedSpecialty ?? "") ? requestedSpecialty ?? "All Specialties" : "All Specialties");
      return;
    }

    setActiveTab("all");
    setCategory("All Categories");
    setFilterLockedCategory(null);
    setSpecialty("All Specialties");
  }, [requestedCategory, requestedSpecialty]);

  React.useEffect(() => {
    const storageKey = "notes-data";
    const legacyStorageKey = ["notes", 1, "notes"].join("-");
    const savedNotes = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey);
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes) as Note[];
        const specialtySeeds = initialNotes.filter((note) => note.id >= 101);
        const mergedNotes = [
          ...parsedNotes,
          ...specialtySeeds.filter(
            (seed) =>
              !parsedNotes.some(
                (note) => note.category === seed.category && note.specialty === seed.specialty,
              ),
          ),
        ];
        setNotes(mergedNotes);
        window.localStorage.setItem(storageKey, JSON.stringify(mergedNotes));
        window.localStorage.removeItem(legacyStorageKey);
      } catch {
        window.localStorage.removeItem(storageKey);
        window.localStorage.removeItem(legacyStorageKey);
      }
    }
    setNotesLoaded(true);
  }, []);

  React.useEffect(() => {
    if (notesLoaded) window.localStorage.setItem("notes-data", JSON.stringify(notes));
  }, [notes, notesLoaded]);

  const filteredNotes = React.useMemo(
    () =>
      notes.filter((note) => {
        const searchableText = JSON.stringify(note).toLowerCase();
        const noteDate = getFilterDate(note, dateType);
        const matchesFromDate = !fromDate || (noteDate !== null && noteDate >= startOfDate(fromDate));
        const matchesToDate = !toDate || (noteDate !== null && noteDate <= endOfDate(toDate));
        const matchesVisit =
          visitScope === "All Patient Visits" ||
          (visitScope === "Current Visit" && (!note.encounterId || note.encounterId === "ENC123456789")) ||
          (visitScope === "Specific Visit" && note.encounterId === visitId.trim());
        const followUpRequired = note.additionalProgress?.followUpRequired === "Yes";
        const followUpOverdue = followUpRequired && Boolean(note.additionalProgress?.followUpDate) && endOfDate(note.additionalProgress?.followUpDate ?? "") < new Date();
        const escalationRequired = note.additionalProgress?.escalationRequired === "Yes";
        return (
          searchableText.includes(query.toLowerCase()) &&
          (!noteId.trim() || String(note.id) === noteId.trim()) &&
          (category === "All Categories" || note.category === category) &&
          (specialty === "All Specialties" || note.specialty === specialty) &&
          (author === "All Authors" || note.author === author) &&
          (status === "All Status" || note.status === status) &&
          (priority === "All Priorities" || note.priority === priority) &&
          (noteType === "All Note Types" || getNoteType(note) === noteType) &&
          (signer === "All Signers" || note.signedBy === signer) &&
          matchesVisit &&
          matchesFromDate &&
          matchesToDate &&
          (followUpFilter === "All Follow-up" ||
            (followUpFilter === "Required" && followUpRequired) ||
            (followUpFilter === "Not Required" && !followUpRequired) ||
            (followUpFilter === "Overdue" && followUpOverdue)) &&
          (escalationFilter === "All Escalation" ||
            (escalationFilter === "Required" && escalationRequired) ||
            (escalationFilter === "Not Required" && !escalationRequired))
        );
      }),
    [author, category, dateType, escalationFilter, followUpFilter, fromDate, noteId, noteType, notes, priority, query, signer, specialty, status, toDate, visitId, visitScope],
  );

  function resetFilters() {
    setCategory(filterLockedCategory ?? activeCategory?.label ?? "All Categories");
    setSpecialty("All Specialties");
    setAuthor("All Authors");
    setStatus("All Status");
    setPriority("All Priorities");
    setQuery("");
    setNoteType("All Note Types");
    setSigner("All Signers");
    setVisitScope("All Patient Visits");
    setVisitId("");
    setDateType("Created Date");
    setFromDate("");
    setToDate("");
    setFollowUpFilter("All Follow-up");
    setEscalationFilter("All Escalation");
    setNoteId("");
  }

  function changeTab(tabId: string) {
    setActiveTab(tabId);
    const nextCategory = categories.find((item) => item.id === tabId);
    if (nextCategory) {
      setCategory(nextCategory.label);
      setFilterLockedCategory(nextCategory.label);
      setSpecialty("All Specialties");
    } else if (tabId === "all") {
      setCategory("All Categories");
      setFilterLockedCategory(null);
      setSpecialty("All Specialties");
    }
  }

  function openNewNote(category?: NoteCategory) {
    setEditingNote(null);
    setNewNoteCategory(category ?? "Nurse Notes");
    setNewNoteOpen(true);
  }

  function addNote(note: Omit<Note, "id" | "date">) {
    if (editingNote) {
      setNotes((current) => current.map((item) => (item.id === editingNote.id ? { ...item, ...note } : item)));
      setNewNoteOpen(false);
      setNotice(`${note.title} updated successfully.`);
      setEditingNote(null);
      return;
    }
    const createdNote: Note = {
      ...note,
      id: Math.max(0, ...notes.map((item) => item.id)) + 1,
      date: new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    };
    setNotes((current) => [createdNote, ...current]);
    setNewNoteOpen(false);
    setNotice(`${createdNote.title} added successfully.`);
    setActiveTab("all");
  }

  function editNote(note: Note) {
    setEditingNote(note);
    setNewNoteCategory(note.category);
    setNewNoteOpen(true);
  }

  function changeNoteStatus(note: Note, nextStatus: NoteStatus) {
    if (nextStatus === "Signed" && !note.signatureAttested) {
      editNote(note);
      setNotice("Complete the electronic signature attestation before signing this note.");
      return;
    }
    setNotes((current) =>
      current.map((item) =>
        item.id === note.id
          ? {
              ...item,
              status: nextStatus,
              ...(nextStatus === "Signed" ? {} : { signatureAttested: false, signedAt: undefined, signedBy: undefined }),
            }
          : item,
      ),
    );
    setNotice(`${note.title} marked as ${nextStatus}.`);
  }

  function deleteNote(note: Note) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setNotes((current) => current.filter((item) => item.id !== note.id));
    setViewingNote(null);
    setNotice(`${note.title} deleted.`);
  }

  const tableActions = {
    onDelete: deleteNote,
    onEdit: editNote,
    onStatusChange: changeNoteStatus,
    onView: setViewingNote,
  };

  return (
    <div className="space-y-4 py-4">
      <section className="flex flex-col gap-3 border-b border-border pb-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary">JD</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-lg font-semibold">John Doe</h1>
              <Badge tone="info">Inpatient</Badge>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">MRN: 10000098 &nbsp; | &nbsp; Male &nbsp; | &nbsp; 65 Y &nbsp; | &nbsp; DOB: 12/05/1959</p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-1 divide-y rounded-md border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <PatientFact label="Allergies" value="Penicillin, Peanuts" tone="text-danger" />
          <PatientFact label="Location" value="ICU - 01, Bed 5" tone="text-blue-600" />
          <PatientFact label="Encounter" value="ENC123456789" tone="text-emerald-600" />
        </div>
      </section>

      <div>
        <h2 className="text-base font-semibold">Notes Center</h2>
        <p className="text-xs text-muted-foreground">Create, view and manage all types of clinical notes</p>
      </div>

      {notice ? (
        <div className="flex items-center justify-between rounded-md border border-success/25 bg-success/10 px-3 py-2 text-xs text-success">
          <span>{notice}</span>
          <button aria-label="Dismiss message" className="font-semibold" onClick={() => setNotice("")} type="button">Close</button>
        </div>
      ) : null}

      {activeTab === "all" ? (
        <AllNotesOverview
          actions={tableActions}
          allNotes={notes}
          author={author}
          category={category}
          dateType={dateType}
          escalationFilter={escalationFilter}
          filtersInitiallyExpanded={filtersRequested}
          followUpFilter={followUpFilter}
          fromDate={fromDate}
          notes={filteredNotes}
          noteId={noteId}
          noteType={noteType}
          priority={priority}
          query={query}
          signer={signer}
          specialty={specialty}
          status={status}
          toDate={toDate}
          visitId={visitId}
          visitScope={visitScope}
          onAuthorChange={setAuthor}
          onCategoryChange={setCategory}
          onDateTypeChange={setDateType}
          onEscalationFilterChange={setEscalationFilter}
          onFollowUpFilterChange={setFollowUpFilter}
          onFromDateChange={setFromDate}
          onNoteIdChange={setNoteId}
          onNoteTypeChange={setNoteType}
          onPriorityChange={setPriority}
          onQueryChange={setQuery}
          onReset={resetFilters}
          onSignerChange={setSigner}
          onSpecialtyChange={setSpecialty}
          onStatusChange={setStatus}
          onToDateChange={setToDate}
          onVisitIdChange={setVisitId}
          onVisitScopeChange={setVisitScope}
          onNewNote={() => openNewNote()}
          onOpenCategory={changeTab}
        />
      ) : (
        <CategoryView
          category={categories.find((item) => item.id === activeTab) ?? categories[0]}
          notes={notes}
          onNewNote={openNewNote}
          onShowAll={() => changeTab("all")}
          specialty={specialty}
          actions={tableActions}
        />
      )}

      <NewNoteModal
        editingNote={editingNote}
        initialCategory={newNoteCategory}
        onOpenChange={(nextOpen) => {
          setNewNoteOpen(nextOpen);
          if (!nextOpen) setEditingNote(null);
        }}
        onSave={addNote}
        open={newNoteOpen}
      />
      <NoteDetailsModal
        note={viewingNote}
        onDelete={deleteNote}
        onEdit={(note) => {
          setViewingNote(null);
          editNote(note);
        }}
        onOpenChange={(open) => {
          if (!open) setViewingNote(null);
        }}
      />
    </div>
  );
}

function AllNotesOverview({
  actions,
  allNotes,
  author,
  category,
  dateType,
  escalationFilter,
  filtersInitiallyExpanded,
  followUpFilter,
  fromDate,
  notes,
  noteId,
  noteType,
  priority,
  query,
  signer,
  specialty,
  status,
  toDate,
  visitId,
  visitScope,
  onAuthorChange,
  onCategoryChange,
  onDateTypeChange,
  onEscalationFilterChange,
  onFollowUpFilterChange,
  onFromDateChange,
  onNoteIdChange,
  onNoteTypeChange,
  onPriorityChange,
  onQueryChange,
  onReset,
  onSignerChange,
  onSpecialtyChange,
  onStatusChange,
  onToDateChange,
  onVisitIdChange,
  onVisitScopeChange,
  onNewNote,
  onOpenCategory,
}: {
  actions: NoteTableActions;
  allNotes: Note[];
  author: string;
  category: string;
  dateType: string;
  escalationFilter: string;
  filtersInitiallyExpanded: boolean;
  followUpFilter: string;
  fromDate: string;
  notes: Note[];
  noteId: string;
  noteType: string;
  priority: string;
  query: string;
  signer: string;
  specialty: string;
  status: string;
  toDate: string;
  visitId: string;
  visitScope: string;
  onAuthorChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateTypeChange: (value: string) => void;
  onEscalationFilterChange: (value: string) => void;
  onFollowUpFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onNoteIdChange: (value: string) => void;
  onNoteTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSignerChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onVisitIdChange: (value: string) => void;
  onVisitScopeChange: (value: string) => void;
  onNewNote: () => void;
  onOpenCategory: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              className="group min-h-44 rounded-lg border border-border bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              key={category.id}
              onClick={() => onOpenCategory(category.id)}
              type="button"
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", category.soft, category.accent)}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 block text-sm font-semibold">{category.label}</span>
              <span className="mt-1 block min-h-8 text-xs leading-4 text-muted-foreground">{category.description}</span>
              <span className={cn("mt-4 flex items-center gap-1 text-xs font-semibold", category.accent)}>
                {allNotes.filter((note) => note.category === category.label).length} Notes <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
      </div>

      <NotesFilterPanel
        key={filtersInitiallyExpanded ? "filters-open" : "filters-closed"}
        allNotes={allNotes}
        author={author}
        category={category}
        dateType={dateType}
        escalationFilter={escalationFilter}
        followUpFilter={followUpFilter}
        fromDate={fromDate}
        noteId={noteId}
        noteType={noteType}
        priority={priority}
        query={query}
        signer={signer}
        specialty={specialty}
        status={status}
        toDate={toDate}
        visitId={visitId}
        visitScope={visitScope}
        initiallyExpanded={filtersInitiallyExpanded}
        onAuthorChange={onAuthorChange}
        onCategoryChange={onCategoryChange}
        onDateTypeChange={onDateTypeChange}
        onEscalationFilterChange={onEscalationFilterChange}
        onFollowUpFilterChange={onFollowUpFilterChange}
        onFromDateChange={onFromDateChange}
        onNoteIdChange={onNoteIdChange}
        onNoteTypeChange={onNoteTypeChange}
        onPriorityChange={onPriorityChange}
        onQueryChange={onQueryChange}
        onReset={onReset}
        onSignerChange={onSignerChange}
        onSpecialtyChange={onSpecialtyChange}
        onStatusChange={onStatusChange}
        onToDateChange={onToDateChange}
        onVisitIdChange={onVisitIdChange}
        onVisitScopeChange={onVisitScopeChange}
      />

      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold">Recent Notes</h3>
            <p className="text-xs text-muted-foreground">{notes.length} matching clinical notes</p>
          </div>
          <Button size="sm" onClick={onNewNote}>
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
        <CardContent className="p-0">
          <NotesTable actions={actions} notes={notes.slice(0, 6)} />
        </CardContent>
      </Card>
    </div>
  );
}

function NotesFilterPanel(props: {
  allNotes: Note[];
  author: string;
  category: string;
  dateType: string;
  escalationFilter: string;
  followUpFilter: string;
  fromDate: string;
  noteId: string;
  noteType: string;
  priority: string;
  query: string;
  signer: string;
  specialty: string;
  status: string;
  toDate: string;
  visitId: string;
  visitScope: string;
  initiallyExpanded: boolean;
  onAuthorChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateTypeChange: (value: string) => void;
  onEscalationFilterChange: (value: string) => void;
  onFollowUpFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onNoteIdChange: (value: string) => void;
  onNoteTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSignerChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onVisitIdChange: (value: string) => void;
  onVisitScopeChange: (value: string) => void;
}) {
  const [searchDraft, setSearchDraft] = React.useState(props.query);
  const [filtersExpanded, setFiltersExpanded] = React.useState(props.initiallyExpanded);
  const allSpecialties = Array.from(new Set(props.allNotes.map((note) => note.specialty)));
  const allAuthors = Array.from(new Set(props.allNotes.map((note) => note.author)));
  const allSigners = Array.from(new Set(props.allNotes.map((note) => note.signedBy).filter((value): value is string => Boolean(value))));
  const allNoteTypes = Array.from(new Set(props.allNotes.map(getNoteType)));

  React.useEffect(() => setSearchDraft(props.query), [props.query]);

  function applySearch(event?: React.FormEvent) {
    event?.preventDefault();
    props.onQueryChange(searchDraft.trim());
  }

  function resetAll() {
    props.onReset();
    setSearchDraft("");
  }

  return (
    <Card>
      <button
        aria-controls="progress-notes-overview-filters"
        aria-expanded={filtersExpanded}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-t-lg px-4 py-3 text-left outline-none transition-colors hover:bg-surface-muted",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
          filtersExpanded && "border-b border-border",
        )}
        onClick={() => setFiltersExpanded((current) => !current)}
        type="button"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Filter Notes</h3>
            <p className="text-xs text-muted-foreground">{filtersExpanded ? "Hide filters" : "Click to show all filters"}</p>
          </div>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", filtersExpanded && "rotate-180")} />
      </button>
      {filtersExpanded ? <CardContent className="space-y-4" id="progress-notes-overview-filters">
        <form className="grid gap-3 lg:grid-cols-[minmax(180px,1.4fr)_120px_repeat(3,minmax(140px,1fr))] xl:grid-cols-[minmax(220px,1.5fr)_120px_repeat(4,minmax(140px,1fr))]" onSubmit={applySearch}>
          <FormField label="Search">
            <Input onChange={(event) => setSearchDraft(event.target.value)} placeholder="Title, diagnosis, medicine..." value={searchDraft} />
          </FormField>
          <FormField label="Note ID">
            <Input onChange={(event) => props.onNoteIdChange(event.target.value)} placeholder="ID" type="number" value={props.noteId} />
          </FormField>
          <FilterSelect label="Category" value={props.category} options={["All Categories", ...categories.map((item) => item.label)]} onChange={props.onCategoryChange} />
          <FilterSelect label="Note type" value={props.noteType} options={["All Note Types", ...allNoteTypes]} onChange={props.onNoteTypeChange} />
          <FilterSelect label="Specialty" value={props.specialty} options={["All Specialties", ...allSpecialties]} onChange={props.onSpecialtyChange} />
          <FilterSelect label="Status" value={props.status} options={["All Status", "Signed", "Draft", "Pending Review"]} onChange={props.onStatusChange} />
        </form>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[minmax(280px,1.35fr)_repeat(5,minmax(130px,1fr))]">
          <FilterRadioGroup label="Priority" name="notes-overview-priority" value={props.priority} options={["All Priorities", "High", "Medium", "Low"]} onChange={props.onPriorityChange} />
          <FilterSelect label="Author" value={props.author} options={["All Authors", ...allAuthors]} onChange={props.onAuthorChange} />
          <FilterSelect label="Signed by" value={props.signer} options={["All Signers", ...allSigners]} onChange={props.onSignerChange} />
          <FilterSelect label="Visit scope" value={props.visitScope} options={["All Patient Visits", "Current Visit", "Specific Visit"]} onChange={props.onVisitScopeChange} />
          <FilterSelect label="Follow-up" value={props.followUpFilter} options={["All Follow-up", "Required", "Not Required", "Overdue"]} onChange={props.onFollowUpFilterChange} />
          <FilterSelect label="Escalation" value={props.escalationFilter} options={["All Escalation", "Required", "Not Required"]} onChange={props.onEscalationFilterChange} />
        </div>

        <div className="grid gap-3 md:grid-cols-[repeat(3,minmax(140px,1fr))_auto_auto]">
          {props.visitScope === "Specific Visit" ? (
            <FormField label="Visit ID">
              <Input onChange={(event) => props.onVisitIdChange(event.target.value)} placeholder="Enter visit ID" value={props.visitId} />
            </FormField>
          ) : null}
          <FilterSelect label="Date type" value={props.dateType} options={["Created Date", "Service Date"]} onChange={props.onDateTypeChange} />
          <FormField label="From">
            <Input onChange={(event) => props.onFromDateChange(event.target.value)} type="date" value={props.fromDate} />
          </FormField>
          <FormField label="To">
            <Input onChange={(event) => props.onToDateChange(event.target.value)} type="date" value={props.toDate} />
          </FormField>
          <Button className="self-end" variant="outline" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button className="self-end" onClick={() => applySearch()}>
            <Search className="h-4 w-4" /> Search
          </Button>
        </div>
      </CardContent> : null}
    </Card>
  );
}

function CategoryView({
  actions,
  category,
  notes,
  onNewNote,
  onShowAll,
  specialty,
}: {
  actions: NoteTableActions;
  category: CategoryConfig;
  notes: Note[];
  onNewNote: (category: NoteCategory) => void;
  onShowAll: () => void;
  specialty: string;
}) {
  const categoryNotes = notes.filter((note) => note.category === category.label);
  const visibleNotes = specialty === "All Specialties" ? categoryNotes : categoryNotes.filter((note) => note.specialty === specialty);
  const Icon = category.icon;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", category.soft, category.accent)}>
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{category.label}</h3>
            <p className="text-xs text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button size="sm" variant="outline" onClick={onShowAll}>
            All Notes
          </Button>
          <Button size="sm" onClick={() => onNewNote(category.label)}>
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>
      </div>
      <div className="min-h-[420px] min-w-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-xs font-semibold">{specialty === "All Specialties" ? `All ${category.shortLabel} specialties` : specialty}</span>
          <span className="text-xs text-muted-foreground">{visibleNotes.length} notes</span>
        </div>
        {visibleNotes.length ? (
          <NotesTable actions={actions} notes={visibleNotes} compact />
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
            <FilePenLine className="h-9 w-9 text-muted-foreground/45" />
            <p className="mt-3 text-sm font-semibold">No notes in {specialty === "All Specialties" ? category.label : specialty}</p>
            <p className="mt-1 text-xs text-muted-foreground">Create the first note for this specialty.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function FilterView(props: {
  actions: NoteTableActions;
  allNotes: Note[];
  author: string;
  category: string;
  dateType: string;
  escalationFilter: string;
  followUpFilter: string;
  fromDate: string;
  lockedCategory?: string;
  notes: Note[];
  noteId: string;
  noteType: string;
  priority: string;
  query: string;
  signer: string;
  specialty: string;
  status: string;
  toDate: string;
  visitId: string;
  visitScope: string;
  onAuthorChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onDateTypeChange: (value: string) => void;
  onEscalationFilterChange: (value: string) => void;
  onFollowUpFilterChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onNoteIdChange: (value: string) => void;
  onNoteTypeChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onQueryChange: (value: string) => void;
  onReset: () => void;
  onSignerChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onVisitIdChange: (value: string) => void;
  onVisitScopeChange: (value: string) => void;
}) {
  const [searchDraft, setSearchDraft] = React.useState(props.query);
  const [filtersExpanded, setFiltersExpanded] = React.useState(false);
  const [sortOrder, setSortOrder] = React.useState("Newest first");
  const [pageSize, setPageSize] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const allSpecialties = Array.from(new Set(props.allNotes.map((note) => note.specialty)));
  const allAuthors = Array.from(new Set(props.allNotes.map((note) => note.author)));
  const allSigners = Array.from(new Set(props.allNotes.map((note) => note.signedBy).filter((value): value is string => Boolean(value))));
  const allNoteTypes = Array.from(new Set(props.allNotes.map(getNoteType)));
  const sortedNotes = React.useMemo(
    () =>
      [...props.notes].sort((left, right) => {
        if (sortOrder === "Oldest first") return compareNoteDates(left, right);
        if (sortOrder === "Priority") return priorityRank(left.priority) - priorityRank(right.priority);
        if (sortOrder === "Author") return left.author.localeCompare(right.author);
        if (sortOrder === "Note title") return left.title.localeCompare(right.title);
        return compareNoteDates(right, left);
      }),
    [props.notes, sortOrder],
  );
  const totalPages = Math.max(1, Math.ceil(sortedNotes.length / pageSize));
  const visibleNotes = sortedNotes.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => setSearchDraft(props.query), [props.query]);
  React.useEffect(() => setPage(1), [props.notes, pageSize, sortOrder]);
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function applySearch(event?: React.FormEvent) {
    event?.preventDefault();
    props.onQueryChange(searchDraft.trim());
    setPage(1);
  }

  function resetAll() {
    props.onReset();
    setSearchDraft("");
    setSortOrder("Newest first");
    setPageSize(10);
    setPage(1);
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="h-fit">
        <button
          aria-controls="progress-notes-list-filters"
          aria-expanded={filtersExpanded}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-t-lg px-4 py-3 text-left outline-none transition-colors hover:bg-surface-muted",
            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            filtersExpanded && "border-b border-border",
          )}
          onClick={() => setFiltersExpanded((current) => !current)}
          type="button"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
            <div>
              <h3 className="text-sm font-semibold">Filter Notes</h3>
              <p className="mt-1 text-xs text-muted-foreground">{filtersExpanded ? "Hide filters" : "Click to show all filters"}</p>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", filtersExpanded && "rotate-180")} />
        </button>
        {filtersExpanded ? <CardContent className="space-y-4" id="progress-notes-list-filters">
          <form className="space-y-2" onSubmit={applySearch}>
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Search</div>
            <Input onChange={(event) => setSearchDraft(event.target.value)} placeholder="Title, diagnosis, medicine, content..." value={searchDraft} />
            <Input onChange={(event) => props.onNoteIdChange(event.target.value)} placeholder="Specific note ID" type="number" value={props.noteId} />
          </form>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Document</div>
            {props.lockedCategory ? (
              <ReadOnlyFilterValue label="Category" value={props.lockedCategory} />
            ) : (
              <FilterSelect label="Category" value={props.category} options={["All Categories", ...categories.map((item) => item.label)]} onChange={props.onCategoryChange} />
            )}
            <FilterSelect label="Note type" value={props.noteType} options={["All Note Types", ...allNoteTypes]} onChange={props.onNoteTypeChange} />
            <FilterSelect label="Specialty" value={props.specialty} options={["All Specialties", ...allSpecialties]} onChange={props.onSpecialtyChange} />
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Visit</div>
            <FilterSelect label="Visit scope" value={props.visitScope} options={["All Patient Visits", "Current Visit", "Specific Visit"]} onChange={props.onVisitScopeChange} />
            {props.visitScope === "Specific Visit" ? (
              <FormField label="Visit ID">
                <Input onChange={(event) => props.onVisitIdChange(event.target.value)} placeholder="Enter visit ID" value={props.visitId} />
              </FormField>
            ) : null}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Workflow</div>
            <FilterSelect label="Author" value={props.author} options={["All Authors", ...allAuthors]} onChange={props.onAuthorChange} />
            <FilterSelect label="Signed by" value={props.signer} options={["All Signers", ...allSigners]} onChange={props.onSignerChange} />
            <div className="grid grid-cols-2 gap-3">
              <FilterSelect label="Status" value={props.status} options={["All Status", "Signed", "Draft", "Pending Review"]} onChange={props.onStatusChange} />
              <FilterRadioGroup label="Priority" name="notes-filter-priority" value={props.priority} options={["All Priorities", "High", "Medium", "Low"]} onChange={props.onPriorityChange} />
              <FilterSelect label="Follow-up" value={props.followUpFilter} options={["All Follow-up", "Required", "Not Required", "Overdue"]} onChange={props.onFollowUpFilterChange} />
              <FilterSelect label="Escalation" value={props.escalationFilter} options={["All Escalation", "Required", "Not Required"]} onChange={props.onEscalationFilterChange} />
            </div>
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="text-[11px] font-semibold uppercase text-muted-foreground">Date</div>
            <FilterSelect label="Date type" value={props.dateType} options={["Created Date", "Service Date"]} onChange={props.onDateTypeChange} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="From">
                <Input onChange={(event) => props.onFromDateChange(event.target.value)} type="date" value={props.fromDate} />
              </FormField>
              <FormField label="To">
                <Input onChange={(event) => props.onToDateChange(event.target.value)} type="date" value={props.toDate} />
              </FormField>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button className="flex-1" variant="outline" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button className="flex-1" onClick={() => applySearch()}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent> : null}
      </Card>

      <Card className="min-w-0">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Filtered Notes</h3>
            <p className="text-xs text-muted-foreground">{props.notes.length} matching clinical notes</p>
          </div>
          <div className="grid w-full grid-cols-[minmax(150px,1fr)_92px] gap-3 lg:w-auto">
            <FilterSelect className="min-w-0" label="Sort" value={sortOrder} options={["Newest first", "Oldest first", "Priority", "Author", "Note title"]} onChange={setSortOrder} />
            <FilterSelect className="min-w-0" label="Per page" value={String(pageSize)} options={["10", "25", "50", "100"]} onChange={(value) => setPageSize(Number(value))} />
          </div>
        </div>
        {props.notes.length ? (
          <>
            <NotesTable actions={props.actions} notes={visibleNotes} compact />
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
              <span className="text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sortedNotes.length)} of {sortedNotes.length}
              </span>
              <div className="flex items-center gap-2">
                <Button disabled={page === 1} onClick={() => setPage((current) => current - 1)} size="sm" variant="outline">Previous</Button>
                <span>Page {page} of {totalPages}</span>
                <Button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} size="sm" variant="outline">Next</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Search className="h-8 w-8" />
            </span>
            <p className="mt-4 text-sm font-semibold">No matching notes found</p>
            <p className="mt-1 text-xs text-muted-foreground">Adjust or reset the filters to see more results.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function NewNoteModal({
  editingNote,
  initialCategory,
  onOpenChange,
  onSave,
  open,
}: {
  editingNote: Note | null;
  initialCategory: NoteCategory;
  onOpenChange: (open: boolean) => void;
  onSave: (note: Omit<Note, "id" | "date">) => void;
  open: boolean;
}) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<NoteCategory>(initialCategory);
  const [specialty, setSpecialty] = React.useState(categories[0].specialties[0]);
  const [author, setAuthor] = React.useState("Nurse Mary");
  const [priority, setPriority] = React.useState<Note["priority"]>("Medium");
  const [content, setContent] = React.useState("");
  const [formError, setFormError] = React.useState("");
  const [showSigning, setShowSigning] = React.useState(false);
  const [assessment, setAssessment] = React.useState("");
  const [intervention, setIntervention] = React.useState("");
  const [patientResponse, setPatientResponse] = React.useState("");
  const [safetyRisk, setSafetyRisk] = React.useState("");
  const [communication, setCommunication] = React.useState("");
  const [followUpPlan, setFollowUpPlan] = React.useState("");
  const [bloodPressureSystolic, setBloodPressureSystolic] = React.useState("");
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = React.useState("");
  const [pulse, setPulse] = React.useState("");
  const [painScore, setPainScore] = React.useState("");
  const [signedBy, setSignedBy] = React.useState("");
  const [signatureAttested, setSignatureAttested] = React.useState(false);
  const [medicalNoteType, setMedicalNoteType] = React.useState<MedicalNoteType>("Progress Note");
  const [subjective, setSubjective] = React.useState("");
  const [objective, setObjective] = React.useState("");
  const [medicalAssessment, setMedicalAssessment] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [primaryDiagnosis, setPrimaryDiagnosis] = React.useState("");
  const [secondaryDiagnoses, setSecondaryDiagnoses] = React.useState("");
  const [practitionerId, setPractitionerId] = React.useState("");
  const [patientId, setPatientId] = React.useState("10000098");
  const [encounterId, setEncounterId] = React.useState("ENC123456789");
  const [serviceDateTime, setServiceDateTime] = React.useState(toDateTimeLocalValue());
  const [authenticatedSigner, setAuthenticatedSigner] = React.useState("");
  const [amendmentReason, setAmendmentReason] = React.useState("");
  const [pharmacy, setPharmacy] = React.useState<PharmacyDocumentation>(emptyPharmacyDocumentation);
  const [alliedHealth, setAlliedHealth] = React.useState<AlliedHealthDocumentation>(emptyAlliedHealthDocumentation);
  const [additionalProgress, setAdditionalProgress] = React.useState<AdditionalProgressDocumentation>(emptyAdditionalProgressDocumentation);
  const selectedCategory = categories.find((item) => item.label === category) ?? categories[0];
  const isNurseNote = category === "Nurse Notes";
  const isMedicalNote = category === "Medical Notes";
  const isPharmacyNote = category === "Pharmacy Notes";
  const isAlliedHealthNote = category === "Allied Health Notes";
  const isAdditionalProgressNote = category === "Additional Progress Notes";
  const hasPatientVisitContext = isMedicalNote || isPharmacyNote || isAlliedHealthNote || isAdditionalProgressNote;
  const isAmendment = isMedicalNote && editingNote?.status === "Signed";

  React.useEffect(() => {
    if (!open) return;
    const nextCategory = categories.find((item) => item.label === initialCategory) ?? categories[0];
    const defaultAuthor =
      nextCategory.label === "Medical Notes"
        ? "Dr. Smith"
        : nextCategory.label === "Pharmacy Notes"
          ? "Pharmacist John"
          : nextCategory.label === "Allied Health Notes"
            ? "Allied Health Clinician"
            : nextCategory.label === "Additional Progress Notes"
              ? "Care Team Clinician"
              : "Nurse Mary";
    setTitle(editingNote?.title ?? "");
    setCategory(nextCategory.label);
    setSpecialty(editingNote?.specialty ?? nextCategory.specialties[0]);
    setAuthor(editingNote?.author ?? defaultAuthor);
    setPriority(editingNote?.priority ?? "Medium");
    setContent(editingNote?.content ?? "");
    setFormError("");
    setShowSigning(false);
    setAssessment(editingNote?.assessment ?? "");
    setIntervention(editingNote?.intervention ?? "");
    setPatientResponse(editingNote?.patientResponse ?? "");
    setSafetyRisk(editingNote?.safetyRisk ?? "");
    setCommunication(editingNote?.communication ?? "");
    setFollowUpPlan(editingNote?.followUpPlan ?? "");
    setBloodPressureSystolic(editingNote?.bloodPressureSystolic ?? "");
    setBloodPressureDiastolic(editingNote?.bloodPressureDiastolic ?? "");
    setPulse(editingNote?.pulse ?? "");
    setPainScore(editingNote?.painScore ?? "");
    setSignedBy(editingNote?.signedBy ?? editingNote?.author ?? defaultAuthor);
    setSignatureAttested(false);
    setMedicalNoteType(editingNote?.medicalNoteType ?? inferMedicalNoteType(editingNote?.title));
    setSubjective(editingNote?.subjective ?? "");
    setObjective(editingNote?.objective ?? "");
    setMedicalAssessment(editingNote?.medicalAssessment ?? "");
    setPlan(editingNote?.plan ?? "");
    setPrimaryDiagnosis(editingNote?.primaryDiagnosis ?? "");
    setSecondaryDiagnoses(editingNote?.secondaryDiagnoses ?? "");
    setPractitionerId(editingNote?.practitionerId ?? "");
    setPatientId(editingNote?.patientId ?? "10000098");
    setEncounterId(editingNote?.encounterId ?? "ENC123456789");
    setServiceDateTime(editingNote?.serviceDateTime ?? toDateTimeLocalValue());
    setAuthenticatedSigner(editingNote?.authenticatedSigner ?? editingNote?.signedBy ?? editingNote?.author ?? defaultAuthor);
    setAmendmentReason("");
    setPharmacy({ ...emptyPharmacyDocumentation, ...editingNote?.pharmacy });
    setAlliedHealth({
      ...emptyAlliedHealthDocumentation,
      sessionDateTime: editingNote?.alliedHealth?.sessionDateTime ?? toDateTimeLocalValue(),
      ...editingNote?.alliedHealth,
    });
    setAdditionalProgress({
      ...emptyAdditionalProgressDocumentation,
      noteType: editingNote?.additionalProgress?.noteType ?? inferAdditionalNoteType(editingNote?.specialty, editingNote?.title),
      callDateTime: editingNote?.additionalProgress?.callDateTime ?? toDateTimeLocalValue(),
      handoverDateTime: editingNote?.additionalProgress?.handoverDateTime ?? toDateTimeLocalValue(),
      ...editingNote?.additionalProgress,
      amendmentReason: "",
    });
  }, [editingNote, initialCategory, open]);

  function changeSpecialty(value: string) {
    setSpecialty(value);
    if (category === "Additional Progress Notes") {
      setAdditionalProgress((current) => ({ ...current, noteType: inferAdditionalNoteType(value) }));
    }
  }

  function updatePharmacy<K extends keyof PharmacyDocumentation>(field: K, value: PharmacyDocumentation[K]) {
    setPharmacy((current) => ({ ...current, [field]: value }));
  }

  function updateAlliedHealth<K extends keyof AlliedHealthDocumentation>(field: K, value: AlliedHealthDocumentation[K]) {
    setAlliedHealth((current) => ({ ...current, [field]: value }));
  }

  function updateAdditionalProgress<K extends keyof AdditionalProgressDocumentation>(field: K, value: AdditionalProgressDocumentation[K]) {
    setAdditionalProgress((current) => ({ ...current, [field]: value }));
    if (field === "noteType") {
      const specialtyByType: Record<AdditionalNoteType, string> = {
        "General Progress Note": "General",
        "Follow-up Note": "Follow Up",
        "Care Coordination Note": "Care Coordination",
        "Patient Education Note": "Patient Education",
        "Phone Call Note": "Phone Call Note",
        "Family Communication Note": "Family Communication",
        "Handover Note": "Handover",
        "Case Management Note": "Case Management",
      };
      setSpecialty(specialtyByType[value as AdditionalNoteType]);
    }
  }

  function submitNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      setFormError("Clinical note is required.");
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const isSigned = submitter?.value === "sign";
    if (isSigned && !signatureAttested) return;

    const nextStatus: NoteStatus = isSigned ? "Signed" : "Draft";
    const generatedTitle = buildNoteTitle({
      additionalProgress,
      alliedHealth,
      category,
      medicalNoteType,
      pharmacy,
      specialty,
    });

    onSave({
      author: author.trim(),
      assessment: isNurseNote ? assessment.trim() : undefined,
      bloodPressureDiastolic: isNurseNote ? bloodPressureDiastolic : undefined,
      bloodPressureSystolic: isNurseNote ? bloodPressureSystolic : undefined,
      category,
      content: content.trim(),
      communication: isNurseNote ? communication.trim() : undefined,
      followUpPlan: isNurseNote ? followUpPlan.trim() : undefined,
      intervention: isNurseNote ? intervention.trim() : undefined,
      painScore: isNurseNote ? painScore : undefined,
      patientResponse: isNurseNote ? patientResponse.trim() : undefined,
      amendmentReason: isMedicalNote && isAmendment ? amendmentReason.trim() : undefined,
      additionalProgress: isAdditionalProgressNote ? additionalProgress : undefined,
      alliedHealth: isAlliedHealthNote ? { ...alliedHealth, sessionDateTime: serviceDateTime } : undefined,
      authenticatedSigner: hasPatientVisitContext ? authenticatedSigner.trim() : undefined,
      encounterId: hasPatientVisitContext ? encounterId.trim() : undefined,
      medicalAssessment: isMedicalNote ? medicalAssessment.trim() : undefined,
      medicalNoteType: isMedicalNote ? medicalNoteType : undefined,
      objective: isMedicalNote ? objective.trim() : undefined,
      patientId: hasPatientVisitContext ? patientId.trim() : undefined,
      plan: isMedicalNote ? plan.trim() : undefined,
      practitionerId: hasPatientVisitContext ? practitionerId.trim() : undefined,
      primaryDiagnosis: isMedicalNote ? primaryDiagnosis.trim() : undefined,
      priority,
      pharmacy: isPharmacyNote ? pharmacy : undefined,
      pulse: isNurseNote ? pulse : undefined,
      safetyRisk: isNurseNote ? safetyRisk.trim() : undefined,
      secondaryDiagnoses: isMedicalNote ? secondaryDiagnoses.trim() : undefined,
      serviceDateTime: serviceDateTime || undefined,
      signatureAttested: isSigned ? signatureAttested : false,
      signedAt: isSigned && signatureAttested ? new Date().toISOString() : undefined,
      signedBy: isSigned && signatureAttested ? (hasPatientVisitContext ? authenticatedSigner.trim() : signedBy.trim()) : undefined,
      specialty,
      status: nextStatus,
      subjective: isMedicalNote ? subjective.trim() : undefined,
      title: title.trim() || generatedTitle,
    });
  }

  return (
    <CenterModal
      className="w-[min(94vw,860px)]"
      onOpenChange={onOpenChange}
      open={open}
      title={`${editingNote ? "Edit" : "New"} ${category.replace(/ Notes$/, " Note")}`}
    >
      <form className="space-y-3" noValidate onSubmit={submitNote}>
        {hasPatientVisitContext ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-border bg-surface-muted/30 px-3 py-2">
            <div className="text-xs">
              <span className="text-muted-foreground">Patient</span>
              <span className="ml-2 font-semibold">John Doe</span>
              <span className="ml-2 text-muted-foreground">#{patientId}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Visit</span>
              <span className="ml-2 font-semibold">{encounterId}</span>
            </div>
            <label className="ml-auto flex items-center gap-2 text-xs font-semibold">
              <span className="whitespace-nowrap">Clinician ID</span>
              <Input className="h-8 w-40" onChange={(event) => setPractitionerId(event.target.value)} placeholder="Enter ID" value={practitionerId} />
            </label>
          </div>
        ) : null}

        <div className={cn("grid gap-3 sm:grid-cols-2", isAdditionalProgressNote ? "lg:grid-cols-3" : "lg:grid-cols-4")}>
          <FormField label="Author">
            <Input onChange={(event) => setAuthor(event.target.value)} placeholder="Enter author name" value={author} />
          </FormField>
          <FormField label="Priority">
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              onChange={(event) => setPriority(event.target.value as Note["priority"])}
              value={priority}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </FormField>
          {!isAdditionalProgressNote ? (
            <FormField label="Specialty">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => changeSpecialty(event.target.value)}
                value={specialty}
              >
                {selectedCategory.specialties.map((item) => <option key={item}>{item}</option>)}
              </select>
            </FormField>
          ) : null}
          <FormField label="Service date and time">
            <Input onChange={(event) => setServiceDateTime(event.target.value)} type="datetime-local" value={serviceDateTime} />
          </FormField>
        </div>

        {isNurseNote ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="BP systolic">
                <Input min="40" max="300" onChange={(event) => setBloodPressureSystolic(event.target.value)} placeholder="120" type="number" value={bloodPressureSystolic} />
              </FormField>
              <FormField label="BP diastolic">
                <Input min="20" max="200" onChange={(event) => setBloodPressureDiastolic(event.target.value)} placeholder="80" type="number" value={bloodPressureDiastolic} />
              </FormField>
              <FormField label="Pulse">
                <Input min="20" max="250" onChange={(event) => setPulse(event.target.value)} placeholder="72" type="number" value={pulse} />
              </FormField>
              <FormField label="Pain score">
                <Input min="0" max="10" onChange={(event) => setPainScore(event.target.value)} placeholder="0" type="number" value={painScore} />
              </FormField>
            </div>
        ) : null}

        {isMedicalNote ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Note type">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => setMedicalNoteType(event.target.value as MedicalNoteType)}
                  value={medicalNoteType}
                >
                  {medicalNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Primary diagnosis">
                <Input onChange={(event) => setPrimaryDiagnosis(event.target.value)} placeholder="e.g. Essential hypertension" value={primaryDiagnosis} />
              </FormField>
              <FormField label="Secondary diagnoses">
                <Input onChange={(event) => setSecondaryDiagnoses(event.target.value)} placeholder="Additional diagnoses" value={secondaryDiagnoses} />
              </FormField>
            </div>
        ) : null}

        {isPharmacyNote ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Medication">
                <Input onChange={(event) => updatePharmacy("medicationName", event.target.value)} placeholder="Medication name" value={pharmacy.medicationName} />
              </FormField>
              <FormField label="Note type">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updatePharmacy("noteType", event.target.value as PharmacyNoteType)}
                  value={pharmacy.noteType}
                >
                  {pharmacyNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
            </div>
        ) : null}

        {isAlliedHealthNote ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Note type">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updateAlliedHealth("noteType", event.target.value as AlliedNoteType)}
                  value={alliedHealth.noteType}
                >
                  {alliedNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Duration (minutes)">
                <Input min="1" onChange={(event) => updateAlliedHealth("sessionDuration", event.target.value)} type="number" value={alliedHealth.sessionDuration} />
              </FormField>
            </div>
        ) : null}

        {isAdditionalProgressNote ? (
            <div className={cn("grid gap-3 sm:grid-cols-2", additionalProgress.followUpRequired === "Yes" && "lg:grid-cols-3")}>
              <FormField label="Note type">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updateAdditionalProgress("noteType", event.target.value as AdditionalNoteType)}
                  value={additionalProgress.noteType}
                >
                  {additionalNoteTypes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </FormField>
              <FormField label="Follow-up">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => updateAdditionalProgress("followUpRequired", event.target.value)}
                  value={additionalProgress.followUpRequired}
                >
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </FormField>
              {additionalProgress.followUpRequired === "Yes" ? (
                <FormField label="Follow-up date">
                  <Input onChange={(event) => updateAdditionalProgress("followUpDate", event.target.value)} type="date" value={additionalProgress.followUpDate} />
                </FormField>
              ) : null}
            </div>
        ) : null}

        <FormField label="Clinical note">
          <textarea
            autoFocus
            className={cn(
              "min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20",
              formError ? "border-destructive focus:border-destructive" : "border-input focus:border-ring",
            )}
            onChange={(event) => {
              setContent(event.target.value);
              if (formError) setFormError("");
            }}
            placeholder="Assessment, action taken, patient response and next plan..."
            value={content}
          />
          {formError ? <span className="mt-1.5 block text-xs font-medium text-destructive">{formError}</span> : null}
        </FormField>

        {showSigning ? (
          <div className="grid gap-3 rounded-md border border-warning/35 bg-warning/5 p-3 sm:grid-cols-2">
            <div>
              <FormField label="Signed by">
                <Input
                  onChange={(event) => hasPatientVisitContext ? setAuthenticatedSigner(event.target.value) : setSignedBy(event.target.value)}
                  placeholder="Authenticated clinician name"
                  value={hasPatientVisitContext ? authenticatedSigner : signedBy}
                />
              </FormField>
            </div>
            <label className="flex items-center gap-2 rounded-md border border-warning/30 bg-background px-3 py-2 text-xs">
              <input
                checked={signatureAttested}
                className="h-4 w-4 rounded border-input"
                onChange={(event) => setSignatureAttested(event.target.checked)}
                type="checkbox"
              />
              <span>I reviewed this note and confirm it is accurate.</span>
            </label>
          </div>
        ) : null}

        <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t border-border bg-surface px-1 pt-3">
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">Cancel</Button>
          <Button name="saveAction" type="submit" value="draft" variant="outline">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          {showSigning ? (
            <Button disabled={!signatureAttested} name="saveAction" type="submit" value="sign">
              <CheckCheck className="h-4 w-4" />
              Sign & Save
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (!content.trim()) {
                  setFormError("Clinical note is required.");
                  return;
                }
                setShowSigning(true);
              }}
              type="button"
            >
              <CheckCheck className="h-4 w-4" />
              Sign & Save
            </Button>
          )}
        </div>
      </form>
    </CenterModal>
  );
}

function FormField({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function FormSection({
  children,
  description,
  title,
  tone = "default",
}: {
  children: React.ReactNode;
  description: string;
  title: string;
  tone?: "default" | "warning";
}) {
  return (
    <section className={cn("rounded-lg border p-4", tone === "warning" ? "border-warning/35 bg-warning/5" : "border-border bg-surface-muted/25")}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ClinicalTextArea({
  label,
  onChange,
  placeholder,
  required,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  value: string;
}) {
  return (
    <FormField label={label}>
      <textarea
        className="min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </FormField>
  );
}

function AlliedSpecialtyFields({
  data,
  specialty,
  onChange,
}: {
  data: AlliedHealthDocumentation;
  specialty: string;
  onChange: <K extends keyof AlliedHealthDocumentation>(field: K, value: AlliedHealthDocumentation[K]) => void;
}) {
  if (specialty === "Physiotherapy") {
    return (
      <FormSection description="Record mobility, safety and treatment response for the physiotherapy session." title="Physiotherapy assessment">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ClinicalTextArea label="Mobility status" onChange={(value) => onChange("mobilityStatus", value)} placeholder="Bed mobility, standing and walking..." required value={data.mobilityStatus} />
          <ClinicalTextArea label="Range of motion" onChange={(value) => onChange("rangeOfMotion", value)} placeholder="Joint movement findings..." required value={data.rangeOfMotion} />
          <ClinicalTextArea label="Muscle strength" onChange={(value) => onChange("muscleStrength", value)} placeholder="Strength grading and limitations..." required value={data.muscleStrength} />
          <ClinicalTextArea label="Balance" onChange={(value) => onChange("balance", value)} placeholder="Sitting and standing balance..." required value={data.balance} />
          <ClinicalTextArea label="Gait" onChange={(value) => onChange("gait", value)} placeholder="Gait pattern and assistance..." required value={data.gait} />
          <ClinicalTextArea label="Transfer ability" onChange={(value) => onChange("transferAbility", value)} placeholder="Bed, chair and toilet transfers..." required value={data.transferAbility} />
          <FormField label="Walking distance">
            <Input onChange={(event) => onChange("walkingDistance", event.target.value)} placeholder="e.g. 20 metres" value={data.walkingDistance} />
          </FormField>
          <FormField label="Assistive device">
            <Input onChange={(event) => onChange("assistiveDevice", event.target.value)} placeholder="Walker, cane, wheelchair..." value={data.assistiveDevice} />
          </FormField>
          <FormField label="Pain score (0-10)">
            <Input max="10" min="0" onChange={(event) => onChange("painScore", event.target.value)} type="number" value={data.painScore} />
          </FormField>
          <ClinicalTextArea label="Fall risk" onChange={(value) => onChange("fallRisk", value)} placeholder="Risk factors and precautions..." required value={data.fallRisk} />
          <ClinicalTextArea label="Exercise / intervention" onChange={(value) => onChange("exerciseIntervention", value)} placeholder="Exercises and therapy delivered..." required value={data.exerciseIntervention} />
          <ClinicalTextArea label="Patient tolerance" onChange={(value) => onChange("patientTolerance", value)} placeholder="Tolerance and response to treatment..." required value={data.patientTolerance} />
          <ClinicalTextArea label="Next-session plan" onChange={(value) => onChange("nextSessionPlan", value)} placeholder="Planned progression and frequency..." required value={data.nextSessionPlan} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Nutrition") {
    return (
      <FormSection description="Record nutrition measurements, diagnosis, requirements and nutrition plan." title="Nutrition assessment">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Current weight (kg)">
            <Input min="0" onChange={(event) => onChange("currentWeight", event.target.value)} step="0.1" type="number" value={data.currentWeight} />
          </FormField>
          <FormField label="Height (cm)">
            <Input min="0" onChange={(event) => onChange("height", event.target.value)} step="0.1" type="number" value={data.height} />
          </FormField>
          <FormField label="BMI">
            <Input min="0" onChange={(event) => onChange("bmi", event.target.value)} step="0.1" type="number" value={data.bmi} />
          </FormField>
          <ClinicalTextArea label="Weight change" onChange={(value) => onChange("weightChange", value)} placeholder="Recent gain/loss and timeframe..." required value={data.weightChange} />
          <ClinicalTextArea label="Dietary intake" onChange={(value) => onChange("dietaryIntake", value)} placeholder="Usual and current intake..." required value={data.dietaryIntake} />
          <ClinicalTextArea label="Appetite" onChange={(value) => onChange("appetite", value)} placeholder="Appetite and factors affecting intake..." required value={data.appetite} />
          <ClinicalTextArea label="Nutrition diagnosis" onChange={(value) => onChange("nutritionDiagnosis", value)} placeholder="Nutrition problem and contributing factors..." required value={data.nutritionDiagnosis} />
          <FormField label="Calorie requirement">
            <Input onChange={(event) => onChange("calorieRequirement", event.target.value)} placeholder="kcal/day" value={data.calorieRequirement} />
          </FormField>
          <FormField label="Protein requirement">
            <Input onChange={(event) => onChange("proteinRequirement", event.target.value)} placeholder="g/day" value={data.proteinRequirement} />
          </FormField>
          <ClinicalTextArea label="Nutrition intervention" onChange={(value) => onChange("nutritionIntervention", value)} placeholder="Nutrition support and intervention..." required value={data.nutritionIntervention} />
          <ClinicalTextArea label="Diet recommendation" onChange={(value) => onChange("dietRecommendation", value)} placeholder="Diet type and modifications..." required value={data.dietRecommendation} />
          <ClinicalTextArea label="Supplement / feed plan" onChange={(value) => onChange("supplementPlan", value)} placeholder="Supplements, enteral or parenteral plan..." value={data.supplementPlan} />
          <ClinicalTextArea label="Monitoring plan" onChange={(value) => onChange("monitoringPlan", value)} placeholder="Weight, intake, labs and reassessment..." required value={data.monitoringPlan} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Social Work") {
    return (
      <FormSection description="Record psychosocial needs, discharge barriers, consent and community support." title="Social work assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Family / support system" onChange={(value) => onChange("supportSystem", value)} placeholder="Family, caregivers and available support..." required value={data.supportSystem} />
          <ClinicalTextArea label="Living arrangement" onChange={(value) => onChange("livingArrangement", value)} placeholder="Current accommodation and safety..." required value={data.livingArrangement} />
          <ClinicalTextArea label="Financial concerns" onChange={(value) => onChange("financialConcerns", value)} placeholder="Financial, insurance or employment concerns..." value={data.financialConcerns} />
          <ClinicalTextArea label="Safeguarding risk" onChange={(value) => onChange("safeguardingRisk", value)} placeholder="Abuse, neglect, exploitation or immediate risk..." required value={data.safeguardingRisk} />
          <ClinicalTextArea label="Psychosocial concerns" onChange={(value) => onChange("psychosocialConcerns", value)} placeholder="Emotional, social and coping concerns..." required value={data.psychosocialConcerns} />
          <ClinicalTextArea label="Discharge barriers" onChange={(value) => onChange("dischargeBarriers", value)} placeholder="Barriers to safe discharge..." required value={data.dischargeBarriers} />
          <ClinicalTextArea label="Community resources" onChange={(value) => onChange("communityResources", value)} placeholder="Services and resources discussed..." value={data.communityResources} />
          <ClinicalTextArea label="Referrals made" onChange={(value) => onChange("referralsMade", value)} placeholder="Agencies, services or professionals referred to..." value={data.referralsMade} />
          <ClinicalTextArea label="Patient / family consent" onChange={(value) => onChange("consent", value)} placeholder="Consent and preferences documented..." required value={data.consent} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Occupational Therapy") {
    return (
      <FormSection description="Record daily living function, cognition, home safety and equipment needs." title="Occupational therapy assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Activities of daily living" onChange={(value) => onChange("adlStatus", value)} placeholder="Dressing, bathing, feeding and toileting..." required value={data.adlStatus} />
          <ClinicalTextArea label="Cognition" onChange={(value) => onChange("cognition", value)} placeholder="Attention, memory, planning and safety awareness..." required value={data.cognition} />
          <ClinicalTextArea label="Home safety" onChange={(value) => onChange("homeSafety", value)} placeholder="Environmental risks and recommended changes..." required value={data.homeSafety} />
          <ClinicalTextArea label="Equipment needs" onChange={(value) => onChange("equipmentNeeds", value)} placeholder="Adaptive equipment and training required..." required value={data.equipmentNeeds} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Speech Therapy") {
    return (
      <FormSection description="Record speech, language, swallowing and aspiration findings." title="Speech therapy assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Speech status" onChange={(value) => onChange("speechStatus", value)} placeholder="Articulation, voice and fluency..." required value={data.speechStatus} />
          <ClinicalTextArea label="Language status" onChange={(value) => onChange("languageStatus", value)} placeholder="Comprehension and expression..." required value={data.languageStatus} />
          <ClinicalTextArea label="Swallowing status" onChange={(value) => onChange("swallowingStatus", value)} placeholder="Swallow assessment and diet texture..." required value={data.swallowingStatus} />
          <ClinicalTextArea label="Aspiration risk" onChange={(value) => onChange("aspirationRisk", value)} placeholder="Risk level, signs and precautions..." required value={data.aspirationRisk} />
        </div>
      </FormSection>
    );
  }

  if (specialty === "Psychology") {
    return (
      <FormSection description="Record mental status, risk, intervention and response." title="Psychology assessment">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Mental status" onChange={(value) => onChange("mentalStatus", value)} placeholder="Appearance, mood, thought, cognition and insight..." required value={data.mentalStatus} />
          <ClinicalTextArea label="Risk assessment" onChange={(value) => onChange("psychologicalRisk", value)} placeholder="Self-harm, suicide, violence or vulnerability risk..." required value={data.psychologicalRisk} />
          <ClinicalTextArea label="Psychological intervention" onChange={(value) => onChange("psychologyIntervention", value)} placeholder="Therapeutic intervention delivered..." required value={data.psychologyIntervention} />
          <ClinicalTextArea label="Response to intervention" onChange={(value) => onChange("psychologyResponse", value)} placeholder="Engagement and clinical response..." required value={data.psychologyResponse} />
        </div>
      </FormSection>
    );
  }

  return (
    <FormSection description="Record baseline function, multidisciplinary goals and rehabilitation progress." title="Rehabilitation assessment">
      <div className="grid gap-4 sm:grid-cols-2">
        <ClinicalTextArea label="Functional baseline" onChange={(value) => onChange("functionalBaseline", value)} placeholder="Pre-morbid and current functional baseline..." required value={data.functionalBaseline} />
        <ClinicalTextArea label="Multidisciplinary goals" onChange={(value) => onChange("multidisciplinaryGoals", value)} placeholder="Shared rehabilitation goals..." required value={data.multidisciplinaryGoals} />
        <ClinicalTextArea label="Rehabilitation progress" onChange={(value) => onChange("rehabilitationProgress", value)} placeholder="Progress, barriers and readiness for discharge..." required value={data.rehabilitationProgress} />
      </div>
    </FormSection>
  );
}

function AdditionalProgressFields({
  data,
  isAmendment,
  onChange,
}: {
  data: AdditionalProgressDocumentation;
  isAmendment: boolean;
  onChange: <K extends keyof AdditionalProgressDocumentation>(field: K, value: AdditionalProgressDocumentation[K]) => void;
}) {
  return (
    <>
      <FormSection description="Add structured context only when the main clinical note needs more detail." title="Progress note details">
        <div className="grid gap-4 sm:grid-cols-2">
          <ClinicalTextArea label="Reason for note" onChange={(value) => onChange("reasonForNote", value)} placeholder="Why this update is being documented..." value={data.reasonForNote} />
          <ClinicalTextArea label="Current patient condition" onChange={(value) => onChange("currentCondition", value)} placeholder="Current clinical or care status..." value={data.currentCondition} />
          <ClinicalTextArea label="Action taken" onChange={(value) => onChange("actionTaken", value)} placeholder="Action, support or communication completed..." value={data.actionTaken} />
          <ClinicalTextArea label="People informed / involved" onChange={(value) => onChange("peopleInformed", value)} placeholder="Patient, family and care team members involved..." value={data.peopleInformed} />
        </div>
      </FormSection>

      {data.noteType === "General Progress Note" ? (
        <FormSection description="Record a general patient update that does not fit another specific note type." title="General progress update">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="New findings or changes" onChange={(value) => onChange("changesOrFindings", value)} placeholder="Changes since the previous update..." required value={data.changesOrFindings} />
            <ClinicalTextArea label="Patient response" onChange={(value) => onChange("patientResponse", value)} placeholder="Response after the action or intervention..." required value={data.patientResponse} />
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Follow-up Note" ? (
        <FormSection description="Compare the patient's current status with the previous assessment or plan." title="Follow-up review">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="Previous plan / reference" onChange={(value) => onChange("previousPlan", value)} placeholder="Previous treatment or review plan..." required value={data.previousPlan} />
            <ClinicalTextArea label="Current symptoms" onChange={(value) => onChange("currentSymptoms", value)} placeholder="Symptoms reported at follow-up..." required value={data.currentSymptoms} />
            <ClinicalTextArea label="Change since last review" onChange={(value) => onChange("changeSinceReview", value)} placeholder="Improved, unchanged or worsened..." required value={data.changeSinceReview} />
            <ClinicalTextArea label="Treatment compliance" onChange={(value) => onChange("treatmentCompliance", value)} placeholder="Medicine, therapy or advice adherence..." required value={data.treatmentCompliance} />
            <ClinicalTextArea label="Relevant results" onChange={(value) => onChange("relevantResults", value)} placeholder="Relevant observations, tests or measurements..." value={data.relevantResults} />
            <ClinicalTextArea label="Current assessment" onChange={(value) => onChange("currentAssessment", value)} placeholder="Assessment based on this follow-up..." required value={data.currentAssessment} />
            <ClinicalTextArea label="Next action" onChange={(value) => onChange("nextAction", value)} placeholder="Treatment, monitoring or appointment plan..." required value={data.nextAction} />
            <FormField label="Escalation required">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("escalationRequired", event.target.value)}
                value={data.escalationRequired}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </FormField>
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Care Coordination Note" ? (
        <FormSection description="Document decisions, ownership and services needed across the care team." title="Care coordination">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="Coordination reason" onChange={(value) => onChange("coordinationReason", value)} placeholder="Why coordination is required..." required value={data.coordinationReason} />
            <ClinicalTextArea label="Current care needs" onChange={(value) => onChange("currentCareNeeds", value)} placeholder="Clinical, functional and social care needs..." required value={data.currentCareNeeds} />
            <ClinicalTextArea label="Teams / professionals involved" onChange={(value) => onChange("teamsInvolved", value)} placeholder="Teams and named professionals involved..." required value={data.teamsInvolved} />
            <ClinicalTextArea label="Patient / family involvement" onChange={(value) => onChange("patientFamilyInvolvement", value)} placeholder="Preferences, participation and agreement..." required value={data.patientFamilyInvolvement} />
            <ClinicalTextArea label="Discussion summary" onChange={(value) => onChange("discussionSummary", value)} placeholder="Key points discussed..." required value={data.discussionSummary} />
            <ClinicalTextArea label="Decisions made" onChange={(value) => onChange("decisionsMade", value)} placeholder="Agreed care decisions..." required value={data.decisionsMade} />
            <ClinicalTextArea label="Actions assigned" onChange={(value) => onChange("assignedActions", value)} placeholder="Tasks and actions assigned..." required value={data.assignedActions} />
            <FormField label="Responsible person">
              <Input onChange={(event) => onChange("responsiblePerson", event.target.value)} placeholder="Person or team responsible" required value={data.responsiblePerson} />
            </FormField>
            <FormField label="Target date">
              <Input onChange={(event) => onChange("targetDate", event.target.value)} required type="date" value={data.targetDate} />
            </FormField>
            <ClinicalTextArea label="Referral / service required" onChange={(value) => onChange("referralRequired", value)} placeholder="Referral, equipment or external service needed..." value={data.referralRequired} />
            <ClinicalTextArea label="Discharge barriers" onChange={(value) => onChange("dischargeBarriers", value)} placeholder="Barriers affecting safe discharge..." value={data.dischargeBarriers} />
            <FormField label="Follow-up status">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("followUpStatus", event.target.value)}
                value={data.followUpStatus}
              >
                <option>Pending</option>
                <option>In progress</option>
                <option>Completed</option>
                <option>Blocked</option>
              </select>
            </FormField>
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Patient Education Note" ? (
        <FormSection description="Record what was taught and confirm the patient or caregiver understood it." title="Patient education">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Education topic">
              <Input onChange={(event) => onChange("educationTopic", event.target.value)} placeholder="Medicine, wound care, diet..." required value={data.educationTopic} />
            </FormField>
            <FormField label="Education provided to">
              <Input onChange={(event) => onChange("educationProvidedTo", event.target.value)} placeholder="Patient, caregiver or family member" required value={data.educationProvidedTo} />
            </FormField>
            <FormField label="Teaching method">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("teachingMethod", event.target.value)}
                value={data.teachingMethod}
              >
                <option>Verbal explanation</option>
                <option>Demonstration</option>
                <option>Written material</option>
                <option>Video</option>
                <option>Interpreter-assisted</option>
                <option>Teach-back</option>
              </select>
            </FormField>
            <FormField label="Material / language used">
              <Input onChange={(event) => onChange("materialLanguage", event.target.value)} placeholder="Material and preferred language" value={data.materialLanguage} />
            </FormField>
            <ClinicalTextArea label="Information explained" onChange={(value) => onChange("informationExplained", value)} placeholder="Key instructions and safety information..." required value={data.informationExplained} />
            <ClinicalTextArea label="Patient understanding" onChange={(value) => onChange("patientUnderstanding", value)} placeholder="Level of understanding demonstrated..." required value={data.patientUnderstanding} />
            <ClinicalTextArea label="Teach-back result" onChange={(value) => onChange("teachBackResult", value)} placeholder="What the patient repeated or demonstrated..." required value={data.teachBackResult} />
            <ClinicalTextArea label="Barriers to learning" onChange={(value) => onChange("learningBarriers", value)} placeholder="Language, hearing, cognition, distress..." value={data.learningBarriers} />
            <FormField label="Interpreter required">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("interpreterRequired", event.target.value)}
                value={data.interpreterRequired}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </FormField>
            <ClinicalTextArea label="Questions raised" onChange={(value) => onChange("questionsRaised", value)} placeholder="Patient or caregiver questions..." value={data.questionsRaised} />
            <ClinicalTextArea label="Additional education required" onChange={(value) => onChange("additionalEducation", value)} placeholder="Further teaching or reinforcement required..." value={data.additionalEducation} />
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Phone Call Note" ? (
        <CommunicationFields data={data} onChange={onChange} />
      ) : null}

      {data.noteType === "Family Communication Note" ? (
        <>
          <CommunicationFields data={data} onChange={onChange} />
          <FormSection description="Confirm consent and record the information shared with the family member." title="Family communication">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Patient consent to share information">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                  onChange={(event) => onChange("patientConsent", event.target.value)}
                  value={data.patientConsent}
                >
                  <option>Not recorded</option>
                  <option>Confirmed</option>
                  <option>Not required</option>
                  <option>Declined</option>
                </select>
              </FormField>
              <ClinicalTextArea label="Information shared" onChange={(value) => onChange("informationShared", value)} placeholder="Clinical or care information shared..." required value={data.informationShared} />
              <ClinicalTextArea label="Family questions / concerns" onChange={(value) => onChange("familyConcerns", value)} placeholder="Questions, concerns and decisions..." required value={data.familyConcerns} />
            </div>
          </FormSection>
        </>
      ) : null}

      {data.noteType === "Handover Note" ? (
        <FormSection description="Use SBAR to transfer important information safely to the next clinician or team." title="Clinical handover">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Handover from">
              <Input onChange={(event) => onChange("handoverFrom", event.target.value)} required value={data.handoverFrom} />
            </FormField>
            <FormField label="Handover to">
              <Input onChange={(event) => onChange("handoverTo", event.target.value)} required value={data.handoverTo} />
            </FormField>
            <FormField label="Handover date and time">
              <Input onChange={(event) => onChange("handoverDateTime", event.target.value)} required type="datetime-local" value={data.handoverDateTime} />
            </FormField>
            <FormField label="Acknowledgement received">
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange("acknowledgementReceived", event.target.value)}
                value={data.acknowledgementReceived}
              >
                <option>No</option>
                <option>Yes</option>
              </select>
            </FormField>
            <ClinicalTextArea label="Situation" onChange={(value) => onChange("situation", value)} placeholder="Immediate issue and current situation..." required value={data.situation} />
            <ClinicalTextArea label="Background" onChange={(value) => onChange("background", value)} placeholder="Relevant history and treatment..." required value={data.background} />
            <ClinicalTextArea label="Assessment" onChange={(value) => onChange("handoverAssessment", value)} placeholder="Current assessment and risks..." required value={data.handoverAssessment} />
            <ClinicalTextArea label="Recommendation" onChange={(value) => onChange("recommendation", value)} placeholder="Required monitoring and next actions..." required value={data.recommendation} />
            <ClinicalTextArea label="Pending tasks" onChange={(value) => onChange("pendingTasks", value)} placeholder="Outstanding tests, referrals or treatment..." required value={data.pendingTasks} />
            <ClinicalTextArea label="Safety concerns" onChange={(value) => onChange("safetyConcerns", value)} placeholder="Immediate safety concerns and precautions..." required value={data.safetyConcerns} />
            <ClinicalTextArea label="Escalation criteria" onChange={(value) => onChange("escalationCriteria", value)} placeholder="When and whom to contact..." required value={data.escalationCriteria} />
          </div>
        </FormSection>
      ) : null}

      {data.noteType === "Case Management Note" ? (
        <FormSection description="Document case needs, services, barriers, resources and agreed outcomes." title="Case management">
          <div className="grid gap-4 sm:grid-cols-2">
            <ClinicalTextArea label="Case needs" onChange={(value) => onChange("caseNeeds", value)} placeholder="Clinical, social and discharge needs..." required value={data.caseNeeds} />
            <ClinicalTextArea label="Services involved" onChange={(value) => onChange("servicesInvolved", value)} placeholder="Hospital and community services involved..." required value={data.servicesInvolved} />
            <ClinicalTextArea label="Barriers" onChange={(value) => onChange("caseBarriers", value)} placeholder="Barriers affecting the care plan..." required value={data.caseBarriers} />
            <ClinicalTextArea label="Resource plan" onChange={(value) => onChange("resourcePlan", value)} placeholder="Resources, referrals and funding plan..." required value={data.resourcePlan} />
            <ClinicalTextArea label="Case outcome / next step" onChange={(value) => onChange("caseOutcome", value)} placeholder="Agreed outcome and next case-management step..." required value={data.caseOutcome} />
          </div>
        </FormSection>
      ) : null}

      {isAmendment ? (
        <FormSection description="Explain why this previously signed note is being corrected or updated." title="Amendment" tone="warning">
          <ClinicalTextArea label="Amendment reason" onChange={(value) => onChange("amendmentReason", value)} placeholder="Reason for correcting or adding information..." required value={data.amendmentReason} />
        </FormSection>
      ) : null}
    </>
  );
}

function CommunicationFields({
  data,
  onChange,
}: {
  data: AdditionalProgressDocumentation;
  onChange: <K extends keyof AdditionalProgressDocumentation>(field: K, value: AdditionalProgressDocumentation[K]) => void;
}) {
  return (
    <FormSection description="Record who was contacted, identity checks, advice given and the outcome." title="Telephone communication">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Call direction">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("callDirection", event.target.value)}
            value={data.callDirection}
          >
            <option>Incoming</option>
            <option>Outgoing</option>
          </select>
        </FormField>
        <FormField label="Call date and time">
          <Input onChange={(event) => onChange("callDateTime", event.target.value)} required type="datetime-local" value={data.callDateTime} />
        </FormField>
        <FormField label="Caller / recipient">
          <Input onChange={(event) => onChange("callerRecipient", event.target.value)} placeholder="Name of person contacted" required value={data.callerRecipient} />
        </FormField>
        <FormField label="Relationship to patient">
          <Input onChange={(event) => onChange("relationshipToPatient", event.target.value)} placeholder="Patient, spouse, caregiver..." required value={data.relationshipToPatient} />
        </FormField>
        <FormField label="Contact number">
          <Input onChange={(event) => onChange("contactNumber", event.target.value)} placeholder="Prefer masked number" value={data.contactNumber} />
        </FormField>
        <FormField label="Identity verified">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("identityVerified", event.target.value)}
            value={data.identityVerified}
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </FormField>
        <ClinicalTextArea label="Reason for call" onChange={(value) => onChange("callReason", value)} placeholder="Reason for the communication..." required value={data.callReason} />
        <ClinicalTextArea label="Discussion summary" onChange={(value) => onChange("discussionSummary", value)} placeholder="Important details discussed..." required value={data.discussionSummary} />
        <ClinicalTextArea label="Clinical advice provided" onChange={(value) => onChange("clinicalAdvice", value)} placeholder="Advice, warning signs and instructions..." required value={data.clinicalAdvice} />
        <ClinicalTextArea label="Action agreed" onChange={(value) => onChange("actionAgreed", value)} placeholder="Agreed action and responsibility..." required value={data.actionAgreed} />
        <FormField label="Urgency">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("urgency", event.target.value)}
            value={data.urgency}
          >
            <option>Routine</option>
            <option>Urgent</option>
            <option>Immediate</option>
          </select>
        </FormField>
        <FormField label="Call outcome">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("callOutcome", event.target.value)}
            value={data.callOutcome}
          >
            <option>Completed</option>
            <option>No answer</option>
            <option>Voicemail left</option>
            <option>Call disconnected</option>
            <option>Follow-up required</option>
            <option>Escalated</option>
          </select>
        </FormField>
        <FormField label="Escalation required">
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            onChange={(event) => onChange("escalationRequired", event.target.value)}
            value={data.escalationRequired}
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </FormField>
      </div>
    </FormSection>
  );
}

function NoteDetailsModal({
  note,
  onDelete,
  onEdit,
  onOpenChange,
}: {
  note: Note | null;
  onDelete: (note: Note) => void;
  onEdit: (note: Note) => void;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <CenterModal
      className="w-[min(94vw,880px)]"
      description={note ? `${note.category} / ${note.specialty}` : undefined}
      onOpenChange={onOpenChange}
      open={Boolean(note)}
      title={note?.title ?? "Note Details"}
    >
      {note ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-md border border-border bg-surface-muted/45 p-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailField label="Author" value={note.author} />
            <DetailField label="Date & Time" value={note.date} />
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Status</div>
              <div className="mt-1"><StatusLabel status={note.status} /></div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-muted-foreground">Priority</div>
              <div className="mt-1 text-xs"><PriorityLabel priority={note.priority} /></div>
            </div>
          </div>
          {note.category === "Medical Notes" ? (
            <>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground">Medical Document Context</h4>
                <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailField label="Medical Note Type" value={note.medicalNoteType ?? inferMedicalNoteType(note.title)} />
                  <DetailField label="Service Date & Time" value={formatServiceDateTime(note.serviceDateTime)} />
                  <DetailField label="Patient ID" value={note.patientId || "Not linked"} />
                  <DetailField label="Encounter ID" value={note.encounterId || "Not linked"} />
                  <DetailField label="Practitioner ID" value={note.practitionerId || "Not linked"} />
                  <DetailField label="Authenticated Signer" value={note.authenticatedSigner || note.signedBy || "Not authenticated"} />
                  <DetailField label="FHIR Document Target" value="DocumentReference" />
                  <DetailField label="Diagnosis Target" value="Condition" />
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground">Diagnoses</h4>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <NarrativeField label="Primary Diagnosis" value={note.primaryDiagnosis} />
                  <NarrativeField label="Secondary Diagnoses" value={note.secondaryDiagnoses} />
                </div>
              </div>
              {hasStructuredMedicalNote(note) ? (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground">Structured Medical Documentation</h4>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <NarrativeField label="Subjective" value={note.subjective} />
                    <NarrativeField label="Objective" value={note.objective} />
                    <NarrativeField label="Assessment" value={note.medicalAssessment} />
                    <NarrativeField label="Plan" value={note.plan} />
                  </div>
                </div>
              ) : null}
              {note.amendmentReason ? (
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
                  <div className="text-[11px] font-semibold text-warning">Amendment Reason</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm leading-5">{note.amendmentReason}</div>
                </div>
              ) : null}
            </>
          ) : null}
          {note.category === "Pharmacy Notes" && note.pharmacy ? <PharmacyNoteDetails note={note} /> : null}
          {note.category === "Allied Health Notes" && note.alliedHealth ? <AlliedHealthNoteDetails note={note} /> : null}
          {note.category === "Additional Progress Notes" && note.additionalProgress ? <AdditionalProgressNoteDetails note={note} /> : null}
          {hasStructuredObservations(note) ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">Structured Observations</h4>
              <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
                <DetailField label="Blood Pressure" value={formatBloodPressure(note)} />
                <DetailField label="Pulse" value={note.pulse ? `${note.pulse} beats/min` : "Not recorded"} />
                <DetailField label="Pain Score" value={note.painScore ? `${note.painScore}/10` : "Not recorded"} />
                <DetailField label="FHIR target" value="Observation" />
              </div>
            </div>
          ) : null}
          {hasStructuredNursingNote(note) ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">Structured Nursing Documentation</h4>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <NarrativeField label="Assessment" value={note.assessment} />
                <NarrativeField label="Intervention" value={note.intervention} />
                <NarrativeField label="Patient Response" value={note.patientResponse} />
                <NarrativeField label="Safety / Risk" value={note.safetyRisk} />
                <NarrativeField label="Communication" value={note.communication} />
                <NarrativeField label="Follow-up Plan" value={note.followUpPlan} />
              </div>
            </div>
          ) : null}
          {note.content || (!hasStructuredNursingNote(note) && !hasStructuredObservations(note) && !hasStructuredMedicalNote(note) && !note.pharmacy && !note.alliedHealth && !note.additionalProgress) ? (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground">
                {hasStructuredNursingNote(note) || hasStructuredMedicalNote(note) || note.pharmacy || note.alliedHealth || note.additionalProgress ? "Additional Narrative" : "Clinical Note"}
              </h4>
              <div className="mt-2 min-h-28 whitespace-pre-wrap rounded-md border border-border bg-background p-4 text-sm leading-6">
                {note.content || "No clinical narrative was added to this demo note."}
              </div>
            </div>
          ) : null}
          <SignatureSummary note={note} />
          <div className="flex justify-between gap-2 border-t border-border pt-4">
            <Button onClick={() => onDelete(note)} type="button" variant="danger">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
            <Button onClick={() => onEdit(note)} type="button">
              <FilePenLine className="h-4 w-4" /> Edit Note
            </Button>
          </div>
        </div>
      ) : null}
    </CenterModal>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 truncate text-xs font-medium">{value}</div>
    </div>
  );
}

function NarrativeField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm leading-5">{value || "Not recorded"}</div>
    </div>
  );
}

function PatientVisitDetails({ note }: { note: Note }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground">Patient and Visit Details</h4>
      <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
        <DetailField label="Patient ID" value={note.patientId || "Not linked"} />
        <DetailField label="Visit ID" value={note.encounterId || "Not linked"} />
        <DetailField label="Clinician ID" value={note.practitionerId || "Not linked"} />
        <DetailField label="Signing Clinician" value={note.authenticatedSigner || note.signedBy || "Not authenticated"} />
      </div>
    </div>
  );
}

function PharmacyNoteDetails({ note }: { note: Note }) {
  const pharmacy = note.pharmacy;
  if (!pharmacy) return null;
  return (
    <>
      <PatientVisitDetails note={note} />
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Medication Details</h4>
        <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Note Type" value={pharmacy.noteType} />
          <DetailField label="Medication" value={pharmacy.medicationName || "Not recorded"} />
          <DetailField label="Medication Code" value={pharmacy.medicationCode || "Not recorded"} />
          <DetailField label="Status" value={pharmacy.medicationStatus} />
          <DetailField label="Dose" value={[pharmacy.dose, pharmacy.doseUnit].filter(Boolean).join(" ") || "Not recorded"} />
          <DetailField label="Route" value={pharmacy.route || "Not recorded"} />
          <DetailField label="Frequency" value={pharmacy.frequency || "Not recorded"} />
          <DetailField label="Treatment Period" value={`${pharmacy.startDate || "Not set"} to ${pharmacy.endDate || "Ongoing"}`} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Medication Review and Intervention</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Review Reason" value={pharmacy.reviewReason} />
          <NarrativeField label="Clinical Indication" value={pharmacy.clinicalIndication} />
          <NarrativeField label="Medication Problem" value={pharmacy.medicationProblem} />
          <NarrativeField label="Interaction / Issue Severity" value={pharmacy.interactionSeverity} />
          <NarrativeField label="Relevant Allergies" value={pharmacy.relevantAllergy} />
          <NarrativeField label="Relevant Labs / Observations" value={pharmacy.relevantLabs} />
          <NarrativeField label="Pharmacist Recommendation" value={pharmacy.recommendation} />
          <NarrativeField label="Prescriber Response" value={pharmacy.prescriberResponse} />
          <NarrativeField label="Recommendation Outcome" value={pharmacy.recommendationOutcome} />
          <NarrativeField label="Outcome / Follow-up" value={pharmacy.followUp} />
        </div>
      </div>
    </>
  );
}

function AlliedHealthNoteDetails({ note }: { note: Note }) {
  const allied = note.alliedHealth;
  if (!allied) return null;
  const specialtyDetails = getAlliedSpecialtyDetails(note.specialty, allied);
  return (
    <>
      <PatientVisitDetails note={note} />
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Session Details</h4>
        <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Note Type" value={allied.noteType} />
          <DetailField label="Specialty" value={note.specialty} />
          <DetailField label="Session Date & Time" value={formatServiceDateTime(allied.sessionDateTime)} />
          <DetailField label="Duration" value={allied.sessionDuration ? `${allied.sessionDuration} minutes` : "Not recorded"} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Allied Health Documentation</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Referral / Reason for Review" value={allied.referralReason} />
          <NarrativeField label="Initial Assessment" value={allied.initialAssessment} />
          <NarrativeField label="Functional Status" value={allied.functionalStatus} />
          <NarrativeField label="Identified Problems" value={allied.identifiedProblems} />
          <NarrativeField label="Intervention Delivered" value={allied.intervention} />
          <NarrativeField label="Patient Response" value={allied.patientResponse} />
          <NarrativeField label="Goals" value={allied.goals} />
          <NarrativeField label="Progress Toward Goals" value={allied.goalProgress} />
          <NarrativeField label="Education Provided" value={allied.educationProvided} />
          <NarrativeField label="Follow-up Plan" value={allied.followUpPlan} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">{note.specialty} Assessment</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {specialtyDetails.map((item) => <NarrativeField key={item.label} label={item.label} value={item.value} />)}
        </div>
      </div>
    </>
  );
}

function AdditionalProgressNoteDetails({ note }: { note: Note }) {
  const data = note.additionalProgress;
  if (!data) return null;
  const typeDetails = getAdditionalProgressDetails(data);
  return (
    <>
      <PatientVisitDetails note={note} />
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Progress Note Details</h4>
        <div className="mt-2 grid gap-3 rounded-md border border-border bg-background p-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailField label="Note Type" value={data.noteType} />
          <DetailField label="Service Date & Time" value={formatServiceDateTime(note.serviceDateTime)} />
          <DetailField label="Follow-up Required" value={data.followUpRequired} />
          <DetailField label="Follow-up Date" value={data.followUpDate || "Not scheduled"} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">Current Update</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <NarrativeField label="Reason for Note" value={data.reasonForNote} />
          <NarrativeField label="Current Patient Condition" value={data.currentCondition} />
          <NarrativeField label="Action Taken" value={data.actionTaken} />
          <NarrativeField label="People Informed / Involved" value={data.peopleInformed} />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground">{data.noteType}</h4>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {typeDetails.map((item) => <NarrativeField key={item.label} label={item.label} value={item.value} />)}
        </div>
      </div>
      {data.amendmentReason ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 p-3">
          <div className="text-[11px] font-semibold text-warning">Amendment Reason</div>
          <div className="mt-1 whitespace-pre-wrap text-sm leading-5">{data.amendmentReason}</div>
        </div>
      ) : null}
    </>
  );
}

function getAdditionalProgressDetails(data: AdditionalProgressDocumentation) {
  if (data.noteType === "General Progress Note") {
    return [
      { label: "New Findings or Changes", value: data.changesOrFindings },
      { label: "Patient Response", value: data.patientResponse },
    ];
  }
  if (data.noteType === "Follow-up Note") {
    return [
      { label: "Previous Plan / Reference", value: data.previousPlan },
      { label: "Current Symptoms", value: data.currentSymptoms },
      { label: "Change Since Last Review", value: data.changeSinceReview },
      { label: "Treatment Compliance", value: data.treatmentCompliance },
      { label: "Relevant Results", value: data.relevantResults },
      { label: "Current Assessment", value: data.currentAssessment },
      { label: "Next Action", value: data.nextAction },
      { label: "Escalation Required", value: data.escalationRequired },
    ];
  }
  if (data.noteType === "Care Coordination Note") {
    return [
      { label: "Coordination Reason", value: data.coordinationReason },
      { label: "Current Care Needs", value: data.currentCareNeeds },
      { label: "Teams / Professionals Involved", value: data.teamsInvolved },
      { label: "Patient / Family Involvement", value: data.patientFamilyInvolvement },
      { label: "Discussion Summary", value: data.discussionSummary },
      { label: "Decisions Made", value: data.decisionsMade },
      { label: "Actions Assigned", value: data.assignedActions },
      { label: "Responsible Person", value: data.responsiblePerson },
      { label: "Target Date", value: data.targetDate },
      { label: "Referral / Service Required", value: data.referralRequired },
      { label: "Discharge Barriers", value: data.dischargeBarriers },
      { label: "Follow-up Status", value: data.followUpStatus },
    ];
  }
  if (data.noteType === "Patient Education Note") {
    return [
      { label: "Education Topic", value: data.educationTopic },
      { label: "Education Provided To", value: data.educationProvidedTo },
      { label: "Teaching Method", value: data.teachingMethod },
      { label: "Material / Language Used", value: data.materialLanguage },
      { label: "Information Explained", value: data.informationExplained },
      { label: "Patient Understanding", value: data.patientUnderstanding },
      { label: "Teach-back Result", value: data.teachBackResult },
      { label: "Barriers to Learning", value: data.learningBarriers },
      { label: "Interpreter Required", value: data.interpreterRequired },
      { label: "Questions Raised", value: data.questionsRaised },
      { label: "Additional Education Required", value: data.additionalEducation },
    ];
  }
  if (data.noteType === "Phone Call Note" || data.noteType === "Family Communication Note") {
    const communicationDetails = [
      { label: "Call Direction", value: data.callDirection },
      { label: "Call Date & Time", value: formatServiceDateTime(data.callDateTime) },
      { label: "Caller / Recipient", value: data.callerRecipient },
      { label: "Relationship to Patient", value: data.relationshipToPatient },
      { label: "Contact Number", value: data.contactNumber },
      { label: "Identity Verified", value: data.identityVerified },
      { label: "Reason for Call", value: data.callReason },
      { label: "Discussion Summary", value: data.discussionSummary },
      { label: "Clinical Advice Provided", value: data.clinicalAdvice },
      { label: "Action Agreed", value: data.actionAgreed },
      { label: "Urgency", value: data.urgency },
      { label: "Call Outcome", value: data.callOutcome },
      { label: "Escalation Required", value: data.escalationRequired },
    ];
    if (data.noteType === "Family Communication Note") {
      communicationDetails.push(
        { label: "Patient Consent", value: data.patientConsent },
        { label: "Information Shared", value: data.informationShared },
        { label: "Family Questions / Concerns", value: data.familyConcerns },
      );
    }
    return communicationDetails;
  }
  if (data.noteType === "Handover Note") {
    return [
      { label: "Handover From", value: data.handoverFrom },
      { label: "Handover To", value: data.handoverTo },
      { label: "Handover Date & Time", value: formatServiceDateTime(data.handoverDateTime) },
      { label: "Situation", value: data.situation },
      { label: "Background", value: data.background },
      { label: "Assessment", value: data.handoverAssessment },
      { label: "Recommendation", value: data.recommendation },
      { label: "Pending Tasks", value: data.pendingTasks },
      { label: "Safety Concerns", value: data.safetyConcerns },
      { label: "Escalation Criteria", value: data.escalationCriteria },
      { label: "Acknowledgement Received", value: data.acknowledgementReceived },
    ];
  }
  return [
    { label: "Case Needs", value: data.caseNeeds },
    { label: "Services Involved", value: data.servicesInvolved },
    { label: "Barriers", value: data.caseBarriers },
    { label: "Resource Plan", value: data.resourcePlan },
    { label: "Case Outcome / Next Step", value: data.caseOutcome },
  ];
}

function getAlliedSpecialtyDetails(specialty: string, data: AlliedHealthDocumentation) {
  if (specialty === "Physiotherapy") {
    return [
      { label: "Mobility Status", value: data.mobilityStatus },
      { label: "Range of Motion", value: data.rangeOfMotion },
      { label: "Muscle Strength", value: data.muscleStrength },
      { label: "Balance", value: data.balance },
      { label: "Gait", value: data.gait },
      { label: "Transfer Ability", value: data.transferAbility },
      { label: "Walking Distance", value: data.walkingDistance },
      { label: "Assistive Device", value: data.assistiveDevice },
      { label: "Pain Score", value: data.painScore ? `${data.painScore}/10` : "" },
      { label: "Fall Risk", value: data.fallRisk },
      { label: "Exercise / Intervention", value: data.exerciseIntervention },
      { label: "Patient Tolerance", value: data.patientTolerance },
      { label: "Next-session Plan", value: data.nextSessionPlan },
    ];
  }
  if (specialty === "Nutrition") {
    return [
      { label: "Current Weight", value: data.currentWeight ? `${data.currentWeight} kg` : "" },
      { label: "Height", value: data.height ? `${data.height} cm` : "" },
      { label: "BMI", value: data.bmi },
      { label: "Weight Change", value: data.weightChange },
      { label: "Dietary Intake", value: data.dietaryIntake },
      { label: "Appetite", value: data.appetite },
      { label: "Nutrition Diagnosis", value: data.nutritionDiagnosis },
      { label: "Calorie Requirement", value: data.calorieRequirement },
      { label: "Protein Requirement", value: data.proteinRequirement },
      { label: "Nutrition Intervention", value: data.nutritionIntervention },
      { label: "Diet Recommendation", value: data.dietRecommendation },
      { label: "Supplement / Feed Plan", value: data.supplementPlan },
      { label: "Monitoring Plan", value: data.monitoringPlan },
    ];
  }
  if (specialty === "Social Work") {
    return [
      { label: "Family / Support System", value: data.supportSystem },
      { label: "Living Arrangement", value: data.livingArrangement },
      { label: "Financial Concerns", value: data.financialConcerns },
      { label: "Safeguarding Risk", value: data.safeguardingRisk },
      { label: "Psychosocial Concerns", value: data.psychosocialConcerns },
      { label: "Discharge Barriers", value: data.dischargeBarriers },
      { label: "Community Resources", value: data.communityResources },
      { label: "Referrals Made", value: data.referralsMade },
      { label: "Patient / Family Consent", value: data.consent },
    ];
  }
  if (specialty === "Occupational Therapy") {
    return [
      { label: "Activities of Daily Living", value: data.adlStatus },
      { label: "Cognition", value: data.cognition },
      { label: "Home Safety", value: data.homeSafety },
      { label: "Equipment Needs", value: data.equipmentNeeds },
    ];
  }
  if (specialty === "Speech Therapy") {
    return [
      { label: "Speech Status", value: data.speechStatus },
      { label: "Language Status", value: data.languageStatus },
      { label: "Swallowing Status", value: data.swallowingStatus },
      { label: "Aspiration Risk", value: data.aspirationRisk },
    ];
  }
  if (specialty === "Psychology") {
    return [
      { label: "Mental Status", value: data.mentalStatus },
      { label: "Risk Assessment", value: data.psychologicalRisk },
      { label: "Psychological Intervention", value: data.psychologyIntervention },
      { label: "Response to Intervention", value: data.psychologyResponse },
    ];
  }
  return [
    { label: "Functional Baseline", value: data.functionalBaseline },
    { label: "Multidisciplinary Goals", value: data.multidisciplinaryGoals },
    { label: "Rehabilitation Progress", value: data.rehabilitationProgress },
  ];
}

function SignatureSummary({ note }: { note: Note }) {
  if (note.status !== "Signed") return null;
  const signedAt = note.signedAt ? new Date(note.signedAt).toLocaleString("en-GB") : "";
  return (
    <div className={cn("rounded-md border p-3", note.signatureAttested ? "border-success/30 bg-success/10" : "border-warning/30 bg-warning/10")}>
      <div className="flex items-center gap-2 text-xs font-semibold">
        <ShieldCheck className="h-4 w-4" />
        {note.signatureAttested ? "Electronically signed" : "Signature attestation missing"}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {note.signatureAttested
          ? `Signed by ${note.signedBy} on ${signedAt}.`
          : "This legacy/demo note is marked Signed but has no verified signer attestation."}
      </p>
    </div>
  );
}

function hasStructuredNursingNote(note: Note) {
  return Boolean(note.assessment || note.intervention || note.patientResponse || note.safetyRisk || note.communication || note.followUpPlan);
}

function hasStructuredMedicalNote(note: Note) {
  return Boolean(note.subjective || note.objective || note.medicalAssessment || note.plan);
}

function hasStructuredObservations(note: Note) {
  return Boolean(note.bloodPressureSystolic || note.bloodPressureDiastolic || note.pulse || note.painScore);
}

function formatBloodPressure(note: Note) {
  if (!note.bloodPressureSystolic && !note.bloodPressureDiastolic) return "Not recorded";
  return `${note.bloodPressureSystolic || "--"}/${note.bloodPressureDiastolic || "--"} mmHg`;
}

function formatServiceDateTime(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
}

function NotesTable({ actions, notes: rows, compact = false }: { actions: NoteTableActions; notes: Note[]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-xs">
        <thead className="bg-surface-muted/70 text-muted-foreground">
          <tr>
            {["Note Title", "Category", "Specialty", "Author", "Date & Time", "Status", "Priority", "Actions"].map((heading) => (
              <th className="border-b border-border px-3 py-2 text-left text-[11px] font-semibold" key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((note) => (
            <tr className="transition hover:bg-surface-muted/50" key={note.id}>
              <td className="border-b border-border px-3 py-2.5 font-medium">{note.title}</td>
              <td className="border-b border-border px-3 py-2.5 text-muted-foreground">{note.category}</td>
              <td className="border-b border-border px-3 py-2.5">{note.specialty}</td>
              <td className="border-b border-border px-3 py-2.5">{note.author}</td>
              <td className="whitespace-nowrap border-b border-border px-3 py-2.5 text-muted-foreground">{note.date}</td>
              <td className="border-b border-border px-3 py-2.5"><StatusLabel status={note.status} /></td>
              <td className="border-b border-border px-3 py-2.5"><PriorityLabel priority={note.priority} /></td>
              <td className="border-b border-border px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <button
                    aria-label={`View ${note.title}`}
                    className="rounded p-1.5 text-muted-foreground hover:bg-primary-soft hover:text-primary"
                    onClick={() => actions.onView(note)}
                    type="button"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <NoteActionsMenu actions={actions} note={note} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!compact && rows.length > 5 ? (
        <div className="flex justify-end border-t border-border px-4 py-2">
          <button className="flex items-center gap-1 text-xs font-semibold text-primary" type="button">View All Notes <ChevronRight className="h-3.5 w-3.5" /></button>
        </div>
      ) : null}
    </div>
  );
}

function NoteActionsMenu({ actions, note }: { actions: NoteTableActions; note: Note }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label={`More actions for ${note.title}`}
          className="rounded p-1.5 text-muted-foreground outline-none hover:bg-surface-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          type="button"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-[80] min-w-44 rounded-md border border-border bg-surface p-1 text-xs shadow-soft"
          sideOffset={4}
        >
          <ActionMenuItem icon={Eye} label="View details" onSelect={() => actions.onView(note)} />
          <ActionMenuItem icon={FilePenLine} label="Edit note" onSelect={() => actions.onEdit(note)} />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <ActionMenuItem icon={CheckCheck} label="Mark signed" onSelect={() => actions.onStatusChange(note, "Signed")} />
          <ActionMenuItem icon={Clock3} label="Send for review" onSelect={() => actions.onStatusChange(note, "Pending Review")} />
          <ActionMenuItem icon={FileText} label="Save as draft" onSelect={() => actions.onStatusChange(note, "Draft")} />
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <ActionMenuItem danger icon={Trash2} label="Delete note" onSelect={() => actions.onDelete(note)} />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ActionMenuItem({
  danger = false,
  icon: Icon,
  label,
  onSelect,
}: {
  danger?: boolean;
  icon: typeof Eye;
  label: string;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded px-2 py-2 outline-none data-[highlighted]:bg-surface-muted",
        danger ? "text-danger" : "text-foreground",
      )}
      onSelect={onSelect}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </DropdownMenu.Item>
  );
}

function PatientFact({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="min-w-44 px-4 py-2">
      <div className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 truncate text-xs font-semibold", tone)}>{value}</div>
    </div>
  );
}

function FilterSelect({
  className,
  label,
  value,
  options,
  onChange,
}: {
  className?: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <select
        className="h-9 w-full min-w-0 rounded-md border border-input bg-background pl-2 pr-7 text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ReadOnlyFilterValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="flex h-9 w-full min-w-0 items-center rounded-md border border-input bg-surface-muted px-3 text-xs font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function FilterRadioGroup({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</legend>
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5">
        {options.map((option) => (
          <label
            className={cn(
              "flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs transition",
              value === option ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-surface-muted",
            )}
            key={option}
          >
            <input
              checked={value === option}
              className="h-3.5 w-3.5 accent-primary"
              name={name}
              onChange={() => onChange(option)}
              type="radio"
              value={option}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function StatusLabel({ status }: { status: NoteStatus }) {
  const styles = {
    Signed: "text-success",
    Draft: "text-blue-600",
    "Pending Review": "text-warning",
  };
  const Icon = status === "Signed" ? CheckCircle2 : status === "Draft" ? FilePenLine : Clock3;
  return <span className={cn("inline-flex items-center gap-1 font-semibold", styles[status])}><Icon className="h-3.5 w-3.5" />{status}</span>;
}

function PriorityLabel({ priority }: { priority: Note["priority"] }) {
  return <span className={cn("font-semibold", priority === "High" ? "text-danger" : priority === "Medium" ? "text-warning" : "text-success")}>{priority}</span>;
}
