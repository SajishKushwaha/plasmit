"use client";

import * as React from "react";
import { ArrowRight, BedDouble, Check, ChevronDown, Plus, RotateCcw, Save, Send, Trash2, UserPlus, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdmissionPath = "new" | "transfer";
type StepKey = "Patient" | "Patient Status" | "Medication" | "Review";
type PatientHistoryTab = "Past Medical History" | "Past Surgical History" | "Medication History" | "Allergy History" | "Social History";
type IdentityDocumentType = "Aadhaar Card" | "PAN" | "Passport" | "Voter ID" | "Driving Licence";
type IdentityRow = {
  id: string;
  type: string;
  value: string;
};

type IcuAdmissionDraft = {
  uhid: string;
  patientName: string;
  registrationDate: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  preferredLanguage: string;
  identityDocumentType: string;
  identityDocumentValue: string;
  permanentAddress: string;
  permanentCity: string;
  permanentState: string;
  permanentPinCode: string;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentPinCode: string;
  sameAsPermanent: string;
  mobileCountryCode: string;
  mobileNumber: string;
  alternateCountryCode: string;
  alternateNumber: string;
  whatsappCountryCode: string;
  whatsappNumber: string;
  contactNumber: string;
  email: string;
  address: string;
  state: string;
  city: string;
  pinCode: string;
  emergencyContactName: string;
  emergencyRelationship: string;
  emergencyCountryCode: string;
  emergencyContactNumber: string;
  emergencyWhatsappNumber: string;
  emergencyEmail: string;
  emergencyIdentityDocumentType: string;
  emergencyIdentityDocumentNumber: string;
  referredBy: string;
  referredFrom: string;
  referralContact: string;
  referralType: string;
  pastMedicalHistory: string;
  pastSurgicalHistoryStatus: string;
  pastSurgicalHistory: string;
  medicationHistory: string;
  allergyHistory: string;
  socialHistory: string;
  otherComorbidities: string;
  bloodGroupReconfirm: string;
  height: string;
  weight: string;
  allergies: string;
  comorbiditiesText: string;
  smokingStatus: string;
  alcoholUse: string;
  advanceDirective: string;
  clinicalNotes: string;
  comorbidities: string[];
  diagnosis: string;
  condition: string;
  recoveryStatus: string;
  risk: string;
  isolation: string;
  handoverBy: string;
  pendingInvestigations: string;
  plannedCareTreatment: string;
  unit: string;
  bedNo: string;
  ventilator: string;
  devices: string;
  doctor: string;
  nurse: string;
  medication: string;
  pastMedication: string;
  currentMedication: string;
  allergy: string;
  highAlertMedications: string;
  otherRelevantInformation: string;
  procedures: string;
  nursingNotes: string;
  handedOver: string;
  takenOverBy: string;
  signatureConfirmation: string;
  readiness: string;
};

type ExistingAdmissionPatient = {
  id: string;
  patientName: string;
  uhid: string;
  ageGender: string;
  currentLocation: string;
  source: string;
  patientStatus: string;
  diagnosis: string;
  condition: string;
  risk: string;
  unit: string;
  bedNo: string;
  doctor: string;
  nurse: string;
};

type IcuAdmissionBedOption = {
  bedNo: string;
  unit: string;
  status: "Available" | "Cleaning" | "Occupied" | "Transfer pending" | "Isolation available" | "Reserved";
  capability: string;
  note: string;
};

const admissionSteps: StepKey[] = ["Patient", "Patient Status", "Medication", "Review"];
const patientHistoryTabs: PatientHistoryTab[] = ["Past Medical History", "Past Surgical History", "Medication History", "Allergy History", "Social History"];
const identityDocumentTypes: IdentityDocumentType[] = ["Aadhaar Card", "PAN", "Passport", "Voter ID", "Driving Licence"];
const countryCodeOptions = ["India (+91)", "United States (+1)", "United Kingdom (+44)", "United Arab Emirates (+971)", "Singapore (+65)"];
const identityDocumentConfigs: Record<IdentityDocumentType, { fieldLabel: string; inputMode: "numeric" | "text"; maxLength: number; minLength?: number; pattern?: string; title?: string }> = {
  "Aadhaar Card": { fieldLabel: "Aadhaar Card Number", inputMode: "numeric", maxLength: 12, minLength: 12, pattern: "[0-9]*", title: "Aadhaar number must contain 12 digits only." },
  "PAN": { fieldLabel: "PAN", inputMode: "text", maxLength: 10 },
  "Passport": { fieldLabel: "Passport Number", inputMode: "text", maxLength: 20 },
  "Voter ID": { fieldLabel: "Voter ID Number", inputMode: "text", maxLength: 20 },
  "Driving Licence": { fieldLabel: "Driving License Number", inputMode: "text", maxLength: 20 },
};
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Known"];
const comorbidityOptions = ["Hypertension", "Diabetes Mellitus", "Ischemic Heart Disease", "COPD / Asthma", "CKD", "Hypothyroidism", "Malignancy", "Others"];
const patientStatusOptions = ["ER Stabilization", "Ward Deterioration", "Post-op Recovery", "Critical Observation", "Ventilator Support", "NIV Support", "Transfer Pending", "Other"];
const medicationHistoryRows = [
  { color: "Red", dose: "500 mg", duration: "5 days", frequency: "BD", indication: "Fever / infection", medicationName: "Paracetamol", reason: "Course completed", route: "Oral", stoppedOn: "12 / 07 / 2026" },
  { color: "Green", dose: "40 mg", duration: "Ongoing", frequency: "OD", indication: "Gastric protection", medicationName: "Pantoprazole", reason: "Active medicine", route: "Oral", stoppedOn: "-" },
  { color: "Blue", dose: "1 g", duration: "3 days", frequency: "BD", indication: "Antibiotic cover", medicationName: "Ceftriaxone", reason: "Changed after review", route: "IV", stoppedOn: "15 / 07 / 2026" },
];
const medicationColorClasses: Record<string, string> = {
  Blue: "bg-blue-500",
  Green: "bg-green-500",
  Red: "bg-red-500",
};
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
const icuUnits = ["General ICU", "Medical ICU", "Cardiothoracic ICU", "Pediatric ICU", "Neuro ICU", "Transplant ICU", "Respiratory ICU", "Surgical ICU", "Isolation ICU"];
const inputClass = "h-10 rounded-md";
const labelClass = "block text-xs font-semibold text-foreground";
const selectClass =
  "h-10 w-full rounded-md border border-input bg-white px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15";

const emptyDraft: IcuAdmissionDraft = {
  uhid: "",
  patientName: "",
  registrationDate: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  age: "",
  gender: "",
  maritalStatus: "",
  nationality: "Indian",
  preferredLanguage: "",
  identityDocumentType: "",
  identityDocumentValue: "",
  permanentAddress: "",
  permanentCity: "",
  permanentState: "",
  permanentPinCode: "",
  currentAddress: "",
  currentCity: "",
  currentState: "",
  currentPinCode: "",
  sameAsPermanent: "",
  mobileCountryCode: "India (+91)",
  mobileNumber: "",
  alternateCountryCode: "India (+91)",
  alternateNumber: "",
  whatsappCountryCode: "India (+91)",
  whatsappNumber: "",
  contactNumber: "",
  email: "",
  address: "",
  state: "",
  city: "",
  pinCode: "",
  emergencyContactName: "",
  emergencyRelationship: "",
  emergencyCountryCode: "India (+91)",
  emergencyContactNumber: "",
  emergencyWhatsappNumber: "",
  emergencyEmail: "",
  emergencyIdentityDocumentType: "",
  emergencyIdentityDocumentNumber: "",
  referredBy: "",
  referredFrom: "",
  referralContact: "",
  referralType: "",
  pastMedicalHistory: "",
  pastSurgicalHistoryStatus: "",
  pastSurgicalHistory: "",
  medicationHistory: "",
  allergyHistory: "",
  socialHistory: "",
  otherComorbidities: "",
  bloodGroupReconfirm: "",
  height: "",
  weight: "",
  allergies: "",
  comorbiditiesText: "",
  smokingStatus: "",
  alcoholUse: "",
  advanceDirective: "",
  clinicalNotes: "",
  comorbidities: [],
  diagnosis: "",
  condition: "Critical",
  recoveryStatus: "ER Stabilization",
  risk: "High",
  isolation: "No",
  handoverBy: "ER nurse / source unit team",
  pendingInvestigations: "",
  plannedCareTreatment: "",
  unit: "Medical ICU",
  bedNo: "ICU-C05",
  ventilator: "NIV support",
  devices: "Monitor, infusion pump",
  doctor: "Dr. Sameer Mehta",
  nurse: "Unit Nurse Priya",
  medication: "",
  pastMedication: "",
  currentMedication: "",
  allergy: "",
  highAlertMedications: "",
  otherRelevantInformation: "",
  procedures: "",
  nursingNotes: "",
  handedOver: "ER nurse / source unit team",
  takenOverBy: "Unit Nurse Priya",
  signatureConfirmation: "Pending bedside confirmation",
  readiness: admissionReadinessItems.slice(0, 4).join("|"),
};

const icuAdmissionBedOptions: IcuAdmissionBedOption[] = [
  { bedNo: "ICU-C05", unit: "Medical ICU", status: "Available", capability: "Monitor + oxygen + suction", note: "Ready for ER/ward ICU admission." },
  { bedNo: "ICU-C06", unit: "Medical ICU", status: "Cleaning", capability: "Monitor + oxygen", note: "Housekeeping clearance pending." },
  { bedNo: "ICU-G01", unit: "General ICU", status: "Available", capability: "Monitor + oxygen + suction", note: "Ready for general ICU admission." },
  { bedNo: "ICU-P07", unit: "Pediatric ICU", status: "Available", capability: "Pediatric monitor + oxygen + suction", note: "Ready for pediatric ICU admission." },
  { bedNo: "ICU-N03", unit: "Neuro ICU", status: "Available", capability: "Neuro monitor + oxygen", note: "Ready for stroke/neuro observation." },
  { bedNo: "CTICU-04", unit: "Cardiothoracic ICU", status: "Available", capability: "Cardiac monitor + ventilator readiness + infusion pump", note: "Ready for post-cardiac surgery monitoring." },
  { bedNo: "ICU-T07", unit: "Transplant ICU", status: "Available", capability: "Renal output chart + infusion pump + isolation-ready", note: "Ready for post-transplant observation." },
  { bedNo: "RICU-02", unit: "Respiratory ICU", status: "Available", capability: "NIV/oxygen + suction + respiratory monitor", note: "Ready for respiratory ICU receive." },
  { bedNo: "ICU-R08", unit: "Respiratory ICU", status: "Available", capability: "NIV/oxygen + suction + respiratory monitor", note: "Ready for COPD/asthma/respiratory failure admission." },
  { bedNo: "ICU-S02", unit: "Surgical ICU", status: "Reserved", capability: "Ventilator + pump + drain chart", note: "Reserved until doctor acceptance is completed." },
  { bedNo: "ICU-ISO1", unit: "Isolation ICU", status: "Isolation available", capability: "Negative pressure + PPE station", note: "Use for contact/airborne isolation." },
];

const existingAdmissionPatients: ExistingAdmissionPatient[] = [
  {
    id: "icu-existing-001",
    patientName: "Samar Ali",
    uhid: "MRN-240918",
    ageGender: "54/M",
    currentLocation: "Emergency triage red zone",
    source: "Emergency",
    patientStatus: "ER Stabilization",
    diagnosis: "Septic shock with respiratory distress",
    condition: "Critical",
    risk: "High",
    unit: "Medical ICU",
    bedNo: "ICU-C05",
    doctor: "Dr. Sameer Mehta",
    nurse: "Unit Nurse Priya",
  },
  {
    id: "icu-existing-002",
    patientName: "Farhan Sheikh",
    uhid: "MRN-240922",
    ageGender: "61/M",
    currentLocation: "Ward 4A",
    source: "General ward",
    patientStatus: "Ward Deterioration",
    diagnosis: "COPD exacerbation requiring NIV",
    condition: "Guarded",
    risk: "High",
    unit: "Respiratory ICU",
    bedNo: "RICU-02",
    doctor: "Dr. Imran Shah",
    nurse: "Unit Nurse Meera",
  },
  {
    id: "icu-existing-003",
    patientName: "Nisha Verma",
    uhid: "MRN-240930",
    ageGender: "45/F",
    currentLocation: "OT recovery",
    source: "Post-surgical unit",
    patientStatus: "Post-op Recovery",
    diagnosis: "Post CABG monitoring",
    condition: "Stable",
    risk: "Medium",
    unit: "Cardiothoracic ICU",
    bedNo: "CTICU-04",
    doctor: "Dr. Aman Verma",
    nurse: "Unit Nurse Sana",
  },
];

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
}

function parseDateValue(value: string) {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year || year.length !== 4) return null;
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
  return date.getFullYear() === parsedYear && date.getMonth() === parsedMonth - 1 && date.getDate() === parsedDay ? date : null;
}

function calculateAge(dateOfBirth: string) {
  const birthDate = parseDateValue(dateOfBirth);
  if (!birthDate) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? String(age) : "";
}

function calculateBmi(height: string, weight: string) {
  const heightValue = Number(height);
  const weightValue = Number(weight);
  if (!heightValue || !weightValue) return "";
  return (weightValue / (heightValue / 100) ** 2).toFixed(1);
}

function getAddressForIdentityDocument(documentType: string, documentValue: string) {
  if (!documentType || documentValue.trim().length < 4) return null;
  if (documentType === "Aadhaar Card") {
    return { address: "42, Green Park Extension, New Delhi", city: "New Delhi", pinCode: "110016", state: "Delhi" };
  }
  if (documentType === "Driving Licence") {
    return { address: "18, MG Road, Bengaluru", city: "Bengaluru", pinCode: "560001", state: "Karnataka" };
  }
  if (documentType === "Passport") {
    return { address: "7, Marine Drive, Mumbai", city: "Mumbai", pinCode: "400020", state: "Maharashtra" };
  }
  return null;
}

function preventInvalidNumericInput(event: React.FormEvent<HTMLInputElement>) {
  const nativeEvent = event.nativeEvent as InputEvent;
  const input = event.currentTarget;
  const data = nativeEvent.data ?? "";
  if (!data) return;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextValue = `${input.value.slice(0, start)}${data}${input.value.slice(end)}`;
  if (!/^\d*$/.test(nextValue)) event.preventDefault();
}

function preventInvalidNumericPaste(event: React.ClipboardEvent<HTMLInputElement>) {
  if (!/^\d*$/.test(event.clipboardData.getData("text"))) event.preventDefault();
}

function Field({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  return (
    <label className={cn("min-w-0 space-y-1.5", className)}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function CountryCodeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select className={selectClass} onChange={(event) => onChange(event.target.value)} value={value}>
      {countryCodeOptions.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function DateTextInput({ onChange, required = false, value }: { onChange: (value: string) => void; required?: boolean; value: string }) {
  return (
    <Input
      className={inputClass}
      inputMode="numeric"
      maxLength={10}
      onBeforeInput={(event) => {
        const data = (event.nativeEvent as InputEvent).data ?? "";
        if (data && !/^\d+$/.test(data)) event.preventDefault();
      }}
      onChange={(event) => onChange(formatDateInput(event.target.value))}
      onPaste={preventInvalidNumericPaste}
      placeholder="DD / MM / YYYY"
      required={required}
      value={value}
    />
  );
}

function SegmentedGender({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid h-10 grid-cols-3 overflow-hidden rounded-md border border-input bg-white shadow-sm">
      {["Male", "Female", "Other"].map((gender) => (
        <button
          className={cn(
            "border-r border-input px-2 text-xs font-semibold last:border-r-0",
            value === gender ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
          )}
          key={gender}
          type="button"
          onClick={() => onChange(gender)}
        >
          {gender}
        </button>
      ))}
    </div>
  );
}

function StepPlaceholder({ icon: Icon, title, children }: { icon: typeof BedDouble; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="bg-surface-muted/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AdmissionFormSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <Field label={label}>
      <select className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}

function TextAreaField({
  className,
  label,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className={cn("min-w-0 space-y-1.5", className)}>
      <span className={labelClass}>{label}</span>
      <textarea
        className="min-h-24 w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/75 focus:border-ring focus:ring-2 focus:ring-ring/15"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function isAdmissionBedAssignable(bed: IcuAdmissionBedOption) {
  return bed.status === "Available" || bed.status === "Isolation available";
}

function getAssignableAdmissionBedsForUnit(unit: string) {
  return icuAdmissionBedOptions.filter((bed) => bed.unit === unit && isAdmissionBedAssignable(bed));
}

function getAdmissionBed(bedNo: string) {
  return icuAdmissionBedOptions.find((bed) => bed.bedNo === bedNo);
}

function admissionBedLabel(bedNo: string) {
  const bed = getAdmissionBed(bedNo);
  if (!bed) return bedNo;
  return `${bed.bedNo} | ${bed.unit} | ${bed.status} | ${bed.capability}`;
}

function getReadinessValues(readiness: string) {
  return readiness.split("|").map((item) => item.trim()).filter(Boolean);
}

function AdmissionReadinessChecklist({ selected, onToggle }: { selected: string[]; onToggle: (item: string) => void }) {
  return (
    <div className="rounded-md border border-border bg-background p-3 md:col-span-2 xl:col-span-3">
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

export function IcuAdmissionPage() {
  const [step, setStep] = React.useState(0);
  const [admissionPath, setAdmissionPath] = React.useState<AdmissionPath | null>(null);
  const [patientHistoryTab, setPatientHistoryTab] = React.useState<PatientHistoryTab>("Past Medical History");
  const [patientHistoryOpen, setPatientHistoryOpen] = React.useState(false);
  const [physicalClinicalOpen, setPhysicalClinicalOpen] = React.useState(false);
  const [medicationHistoryStatus, setMedicationHistoryStatus] = React.useState<"ongoing" | "stopped">("ongoing");
  const [allergyStatus, setAllergyStatus] = React.useState("");
  const [allergyType, setAllergyType] = React.useState("");
  const [otherAllergyType, setOtherAllergyType] = React.useState("");
  const [draft, setDraft] = React.useState<IcuAdmissionDraft>(emptyDraft);
  const [identificationRows, setIdentificationRows] = React.useState<IdentityRow[]>([{ id: "icu-identification-1", type: "", value: "" }]);
  const [emergencyIdentificationRows, setEmergencyIdentificationRows] = React.useState<IdentityRow[]>([{ id: "icu-emergency-identification-1", type: "", value: "" }]);
  const [patientQuery, setPatientQuery] = React.useState("");
  const activeStep = admissionSteps[step];
  const completeness = Math.max(10, Math.round(((step + (admissionPath ? 1 : 0) + (draft.patientName ? 1 : 0)) / (admissionSteps.length + 2)) * 100));
  const patientChip = draft.patientName ? `${draft.patientName} | ${draft.uhid || "MRN pending"}` : "No patient selected";
  const bmi = React.useMemo(() => calculateBmi(draft.height, draft.weight), [draft.height, draft.weight]);
  const availableAdmissionBedOptions = React.useMemo(() => getAssignableAdmissionBedsForUnit(draft.unit).map((bed) => bed.bedNo), [draft.unit]);
  const selectedReadiness = React.useMemo(() => getReadinessValues(draft.readiness), [draft.readiness]);
  const canContinue =
    step === 0
      ? admissionPath === "new"
        ? Boolean(draft.patientName.trim() && draft.dateOfBirth.trim() && draft.gender.trim() && draft.contactNumber.trim())
        : Boolean(admissionPath && draft.patientName.trim())
      : true;
  const filteredPatients = React.useMemo(() => {
    const query = patientQuery.trim().toLowerCase();
    if (!query) return [];
    return existingAdmissionPatients.filter((patient) => {
      const text = `${patient.patientName} ${patient.uhid} ${patient.currentLocation} ${patient.patientStatus} ${patient.source} ${patient.diagnosis}`.toLowerCase();
      return text.includes(query);
    });
  }, [patientQuery]);

  function updateField(field: keyof IcuAdmissionDraft, value: string | string[]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function availableIdentityDocumentTypes(rows: IdentityRow[], rowId: string) {
    const selectedTypes = new Set(rows.filter((row) => row.id !== rowId).map((row) => row.type).filter(Boolean));
    return identityDocumentTypes.filter((documentType) => !selectedTypes.has(documentType));
  }

  function updateIdentificationRow(rowId: string, update: Partial<IdentityRow>) {
    setIdentificationRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...update } : row)));
  }

  function updateEmergencyIdentificationRow(rowId: string, update: Partial<IdentityRow>) {
    setEmergencyIdentificationRows((current) => current.map((row) => (row.id === rowId ? { ...row, ...update } : row)));
  }

  function addIdentificationRow() {
    setIdentificationRows((current) =>
      current.length >= identityDocumentTypes.length ? current : [...current, { id: `icu-identification-${Date.now()}`, type: "", value: "" }],
    );
  }

  function addEmergencyIdentificationRow() {
    setEmergencyIdentificationRows((current) =>
      current.length >= identityDocumentTypes.length ? current : [...current, { id: `icu-emergency-identification-${Date.now()}`, type: "", value: "" }],
    );
  }

  function removeIdentificationRow(rowId: string) {
    setIdentificationRows((current) => (current.length === 1 ? current.map((row) => ({ ...row, type: "", value: "" })) : current.filter((row) => row.id !== rowId)));
  }

  function removeEmergencyIdentificationRow(rowId: string) {
    setEmergencyIdentificationRows((current) => (current.length === 1 ? current.map((row) => ({ ...row, type: "", value: "" })) : current.filter((row) => row.id !== rowId)));
  }

  function updatePatientNamePart(field: "firstName" | "middleName" | "lastName", value: string) {
    setDraft((current) => {
      const nextDraft = { ...current, [field]: value };
      const patientName = [nextDraft.firstName, nextDraft.middleName, nextDraft.lastName].filter(Boolean).join(" ");
      return { ...nextDraft, patientName };
    });
  }

  function updatePermanentAddressField(field: "permanentAddress" | "permanentCity" | "permanentState" | "permanentPinCode", value: string) {
    setDraft((current) => {
      const legacyFieldMap = {
        permanentAddress: "address",
        permanentCity: "city",
        permanentPinCode: "pinCode",
        permanentState: "state",
      } as const;
      const nextDraft = { ...current, [field]: value, [legacyFieldMap[field]]: value };
      if (current.sameAsPermanent !== "Yes") return nextDraft;
      const matchingCurrentField = field.replace("permanent", "current") as "currentAddress" | "currentCity" | "currentState" | "currentPinCode";
      return { ...nextDraft, [matchingCurrentField]: value };
    });
  }

  function updateSameAsPermanent(checked: boolean) {
    setDraft((current) => ({
      ...current,
      sameAsPermanent: checked ? "Yes" : "",
      ...(checked
        ? {
            currentAddress: current.permanentAddress,
            currentCity: current.permanentCity,
            currentState: current.permanentState,
            currentPinCode: current.permanentPinCode,
          }
        : {}),
    }));
  }

  function updateIdentityDocumentType(value: string) {
    setDraft((current) => ({ ...current, identityDocumentType: value, identityDocumentValue: "" }));
  }

  function updateIdentityDocumentValue(value: string) {
    setDraft((current) => {
      const fetchedAddress = getAddressForIdentityDocument(current.identityDocumentType, value);
      return {
        ...current,
        identityDocumentValue: value,
        ...(fetchedAddress
          ? {
              address: fetchedAddress.address,
              city: fetchedAddress.city,
              currentAddress: current.sameAsPermanent === "Yes" ? fetchedAddress.address : current.currentAddress,
              currentCity: current.sameAsPermanent === "Yes" ? fetchedAddress.city : current.currentCity,
              currentPinCode: current.sameAsPermanent === "Yes" ? fetchedAddress.pinCode : current.currentPinCode,
              currentState: current.sameAsPermanent === "Yes" ? fetchedAddress.state : current.currentState,
              permanentAddress: fetchedAddress.address,
              permanentCity: fetchedAddress.city,
              permanentPinCode: fetchedAddress.pinCode,
              permanentState: fetchedAddress.state,
              pinCode: fetchedAddress.pinCode,
              state: fetchedAddress.state,
            }
          : {}),
      };
    });
  }

  function fillAddressFromAadhaar() {
    if (draft.identityDocumentType !== "Aadhaar Card") {
      toast.error("Select Aadhaar Card first.");
      return;
    }
    const fetchedAddress = getAddressForIdentityDocument(draft.identityDocumentType, draft.identityDocumentValue);
    if (!fetchedAddress) {
      toast.error("Enter Aadhaar number first.");
      return;
    }
    setDraft((current) => ({
      ...current,
      address: fetchedAddress.address,
      city: fetchedAddress.city,
      currentAddress: current.sameAsPermanent === "Yes" ? fetchedAddress.address : current.currentAddress,
      currentCity: current.sameAsPermanent === "Yes" ? fetchedAddress.city : current.currentCity,
      currentPinCode: current.sameAsPermanent === "Yes" ? fetchedAddress.pinCode : current.currentPinCode,
      currentState: current.sameAsPermanent === "Yes" ? fetchedAddress.state : current.currentState,
      permanentAddress: fetchedAddress.address,
      permanentCity: fetchedAddress.city,
      permanentPinCode: fetchedAddress.pinCode,
      permanentState: fetchedAddress.state,
      pinCode: fetchedAddress.pinCode,
      state: fetchedAddress.state,
    }));
    toast.success("Address fetched from Aadhaar.");
  }

  function updateAdmissionUnit(unit: string) {
    const nextBed = getAssignableAdmissionBedsForUnit(unit)[0];
    setDraft((current) => ({ ...current, unit, bedNo: nextBed?.bedNo ?? "" }));
  }

  function toggleReadiness(item: string) {
    setDraft((current) => {
      const currentItems = getReadinessValues(current.readiness);
      const nextItems = currentItems.includes(item) ? currentItems.filter((value) => value !== item) : [...currentItems, item];
      return { ...current, readiness: nextItems.join("|") };
    });
  }

  function updateDateOfBirth(value: string) {
    const formattedDate = formatDateInput(value);
    setDraft((current) => ({ ...current, dateOfBirth: formattedDate, age: calculateAge(formattedDate) }));
  }

  function changePath(path: AdmissionPath) {
    setAdmissionPath(path);
    toast.info(path === "new" ? "New patient path selected." : "Transfer / existing patient path selected.");
  }

  function selectExistingPatient(patient: ExistingAdmissionPatient) {
    const [age = "", gender = ""] = patient.ageGender.split("/");
    setDraft((current) => ({
      ...current,
      uhid: patient.uhid,
      patientName: patient.patientName,
      age,
      gender,
      diagnosis: patient.diagnosis,
      condition: patient.condition,
      recoveryStatus: patient.patientStatus,
      risk: patient.risk,
      unit: patient.unit,
      bedNo: patient.bedNo,
      doctor: patient.doctor,
      nurse: patient.nurse,
      handoverBy: `${patient.source} team`,
      pendingInvestigations: "Pending investigation list to be updated after admission review",
      plannedCareTreatment: "ICU monitoring, nursing care plan, medication reconciliation, and consultant review",
    }));
    setPatientQuery(patient.patientName);
    toast.success(`${patient.patientName} selected for ICU admission.`);
  }

  function resetDraft() {
    setDraft(emptyDraft);
    setIdentificationRows([{ id: "icu-identification-1", type: "", value: "" }]);
    setEmergencyIdentificationRows([{ id: "icu-emergency-identification-1", type: "", value: "" }]);
    setAdmissionPath(null);
    setPatientQuery("");
    setStep(0);
    toast.info("ICU admission form cleared.");
  }

  function saveDraft() {
    toast.success("ICU admission draft saved.");
  }

  function continueFlow() {
    if (step === 0 && !admissionPath) {
      toast.error("Choose New Patient or Transfer / Existing Patient first.");
      return;
    }
    if (step === 0 && admissionPath === "transfer" && !draft.patientName.trim()) {
      toast.error("Select an existing patient or transfer request first.");
      return;
    }
    if (step === 0 && admissionPath === "new" && (!draft.patientName.trim() || !draft.dateOfBirth.trim() || !draft.gender.trim() || !draft.contactNumber.trim())) {
      toast.error("Patient name, date of birth, gender, and contact number are required.");
      return;
    }
    if (step < admissionSteps.length - 1) {
      setStep((current) => current + 1);
      toast.success(`${activeStep} saved.`);
      return;
    }
    toast.success("ICU admission wizard completed.");
  }

  return (
    <form className="py-3">
      <div className="min-h-[calc(100dvh-112px)] overflow-visible rounded-md border border-border bg-surface shadow-sm">
        <div className="grid min-h-[calc(100dvh-112px)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="sticky top-0 flex max-h-dvh flex-col justify-between overflow-y-auto border-r border-border bg-background p-4">
            <div>
              <p className="text-base font-semibold text-foreground">ICU Admission Wizard</p>
              <p className="mt-1 text-xs text-muted-foreground">Unified - New Patient or Transfer</p>
              <div className="mt-5 space-y-1">
                {admissionSteps.map((item, index) => (
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left transition hover:bg-surface-muted",
                      index === step ? "bg-primary/10 text-primary" : "text-muted-foreground",
                    )}
                    key={item}
                    type="button"
                    onClick={() => setStep(index)}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        index < step ? "border-success bg-success text-white" : index === step ? "border-primary bg-surface text-primary" : "border-border bg-surface text-muted-foreground",
                      )}
                    >
                      {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item}</span>
                      <span className="block text-[11px]">{index < step ? "Complete" : index === step ? "In progress" : "Pending"}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completeness}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{completeness}% complete</p>
            </div>
          </aside>

          <section className="flex min-w-0 flex-col bg-surface-muted/40">
            <div className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-surface px-5 py-3">
              <h2 className="text-lg font-semibold text-foreground">{activeStep}</h2>
              <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">{patientChip}</span>
                {admissionPath ? (
                  <Button className="ml-2" size="sm" type="button" variant="outline" onClick={() => setAdmissionPath(null)}>
                    Change path
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[1120px] flex-1 space-y-4 p-5 pb-24">
              {step === 0 ? (
                <div className="space-y-4">
                  {!admissionPath ? (
                    <div className="rounded-md border border-border bg-surface p-5">
                      <h3 className="text-base font-semibold text-foreground">How is this patient being admitted?</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Choose a path. Both continue into the same clinical admission steps below.</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <button
                          className="rounded-md border border-border bg-surface p-5 text-left transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring/20"
                          type="button"
                          onClick={() => changePath("new")}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <UserPlus className="h-5 w-5" />
                          </span>
                          <span className="mt-3 block text-sm font-semibold text-foreground">New Patient</span>
                          <span className="mt-1 block text-xs text-muted-foreground">Patient has no existing record. Capture identity now; full history can be completed after admission.</span>
                        </button>
                        <button
                          className="rounded-md border border-border bg-surface p-5 text-left transition hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-ring/20"
                          type="button"
                          onClick={() => changePath("transfer")}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success">
                            <ArrowRight className="h-5 w-5" />
                          </span>
                          <span className="mt-3 block text-sm font-semibold text-foreground">Transfer / Existing Patient</span>
                          <span className="mt-1 block text-xs text-muted-foreground">From ED, Ward, OT, or an external facility. Search by name, MRN, or location.</span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {admissionPath ? (
                    <div className="flex items-center">
                      <Badge tone={admissionPath === "new" ? "info" : "success"}>{admissionPath === "new" ? "New Patient" : "Transfer / Existing Patient"}</Badge>
                    </div>
                  ) : null}

                  {admissionPath === "transfer" ? (
                    <div className="space-y-3">
                      <Card>
                        <CardContent>
                          <h3 className="text-base font-semibold text-foreground">Find Patient</h3>
                          <div className="mt-3">
                            <Field label="Search patient / MRN / location">
                              <Input
                                className={inputClass}
                                placeholder="Search patient name, MRN, ER, ward, OT, external transfer..."
                                value={patientQuery}
                                onChange={(event) => setPatientQuery(event.target.value)}
                              />
                            </Field>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">Search across all active locations and recent registrations.</p>
                          <div className="mt-3">
                            {patientQuery.trim() ? (
                              <div className="overflow-hidden rounded-md border border-border">
                                <div className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2">
                                  <p className="text-xs font-semibold text-muted-foreground">{filteredPatients.length} match(es)</p>
                                  <Button type="button" variant="outline" onClick={() => changePath("new")}>Add New Patient</Button>
                                </div>
                                <div className="grid grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(160px,0.8fr)_120px] gap-3 border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                                  <span>Patient</span>
                                  <span>Location</span>
                                  <span>Status</span>
                                  <span className="text-right">Select</span>
                                </div>
                                <div className="max-h-72 overflow-auto">
                                  {filteredPatients.map((patient) => {
                                    const selected = draft.uhid === patient.uhid;
                                    return (
                                      <button
                                        className={cn(
                                          "grid w-full grid-cols-[minmax(180px,1.2fr)_minmax(180px,1fr)_minmax(160px,0.8fr)_120px] gap-3 border-b border-border px-3 py-3 text-left text-sm last:border-b-0 hover:bg-primary/5",
                                          selected ? "bg-primary/5" : "bg-background",
                                        )}
                                        key={patient.id}
                                        type="button"
                                        onClick={() => selectExistingPatient(patient)}
                                      >
                                        <span className="min-w-0">
                                          <span className="block truncate font-semibold text-foreground">{patient.patientName}</span>
                                          <span className="block truncate text-xs text-muted-foreground">{patient.uhid} | {patient.ageGender}</span>
                                        </span>
                                        <span className="min-w-0">
                                          <span className="block truncate font-medium text-foreground">{patient.currentLocation}</span>
                                          <span className="block truncate text-xs text-muted-foreground">{patient.source}</span>
                                        </span>
                                        <span className="flex items-center">
                                          <Badge tone={patient.patientStatus.toLowerCase().includes("stabilization") || patient.patientStatus.toLowerCase().includes("deterioration") ? "warning" : "success"}>{patient.patientStatus}</Badge>
                                        </span>
                                        <span className="flex justify-end">
                                          <span className={cn("rounded-md border px-3 py-1 text-xs font-semibold", selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground")}>
                                            {selected ? "Selected" : "Select"}
                                          </span>
                                        </span>
                                      </button>
                                    );
                                  })}
                                  {!filteredPatients.length ? (
                                    <div className="bg-background px-3 py-8 text-center text-sm text-muted-foreground">No matching patient found.</div>
                                  ) : null}
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-md border border-dashed border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
                                Start typing to find existing patient or transfer request.
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {draft.patientName ? (
                        <div className="rounded-md border border-success/40 bg-success/10 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-sm font-bold text-white">{draft.patientName.charAt(0)}</div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">{draft.patientName}</p>
                                <p className="text-xs text-muted-foreground">{draft.uhid} | {[draft.age, draft.gender].filter(Boolean).join("/")} | {draft.unit || "Location pending"}</p>
                              </div>
                            </div>
                            <Button size="sm" type="button" variant="outline" onClick={() => setStep(1)}>Continue</Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {admissionPath === "new" ? (
                  <Card className="overflow-visible">
                    <CardHeader className="bg-surface-muted/60">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <CardTitle>1. Basic Demographics</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Personal Details</div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                          <Field label="Patient ID / UHID">
                            <Input className={inputClass} placeholder="Auto-assign" value={draft.uhid} onChange={(event) => updateField("uhid", event.target.value)} />
                          </Field>
                          <Field className="xl:col-span-2" label="Registration Date">
                            <DateTextInput required value={draft.registrationDate} onChange={(value) => updateField("registrationDate", value)} />
                          </Field>
                          <Field label="First Name">
                            <Input className={inputClass} required value={draft.firstName} onChange={(event) => updatePatientNamePart("firstName", event.target.value)} />
                          </Field>
                          <Field label="Middle Name">
                            <Input className={inputClass} value={draft.middleName} onChange={(event) => updatePatientNamePart("middleName", event.target.value)} />
                          </Field>
                          <Field label="Last Name">
                            <Input className={inputClass} required value={draft.lastName} onChange={(event) => updatePatientNamePart("lastName", event.target.value)} />
                          </Field>
                          <Field label="Date of Birth">
                            <DateTextInput required value={draft.dateOfBirth} onChange={updateDateOfBirth} />
                          </Field>
                          <Field label="Age">
                            <div className="flex items-center gap-2">
                              <Input className={inputClass} inputMode="numeric" onBeforeInput={preventInvalidNumericInput} onChange={(event) => updateField("age", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" value={draft.age} />
                              <span className="text-xs font-medium text-muted-foreground">Years</span>
                            </div>
                          </Field>
                          <Field label="Gender">
                            <select className={selectClass} required value={draft.gender} onChange={(event) => updateField("gender", event.target.value)}>
                              <option value="">Select</option>
                              <option>Male</option>
                              <option>Female</option>
                              <option>Transgender / Other</option>
                            </select>
                          </Field>
                          <Field label="Marital Status">
                            <select className={selectClass} value={draft.maritalStatus} onChange={(event) => updateField("maritalStatus", event.target.value)}>
                              <option value="">Select</option>
                              <option>Single</option>
                              <option>Married</option>
                              <option>Divorced</option>
                              <option>Widowed</option>
                            </select>
                          </Field>
                          <Field label="Nationality">
                            <Input className={inputClass} value={draft.nationality} onChange={(event) => updateField("nationality", event.target.value)} />
                          </Field>
                          <Field label="Preferred Language">
                            <Input className={inputClass} value={draft.preferredLanguage} onChange={(event) => updateField("preferredLanguage", event.target.value)} />
                          </Field>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Contact Information</div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                          <Field className="md:col-span-2 xl:col-span-6" label="Permanent Address">
                            <textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" placeholder="Flat / House No., Street, Area" value={draft.permanentAddress} onChange={(event) => updatePermanentAddressField("permanentAddress", event.target.value)} />
                          </Field>
                          <Field label="City">
                            <Input className={inputClass} value={draft.permanentCity} onChange={(event) => updatePermanentAddressField("permanentCity", event.target.value)} />
                          </Field>
                          <Field label="State">
                            <Input className={inputClass} value={draft.permanentState} onChange={(event) => updatePermanentAddressField("permanentState", event.target.value)} />
                          </Field>
                          <Field label="PIN Code">
                            <Input className={inputClass} inputMode="numeric" maxLength={6} onBeforeInput={preventInvalidNumericInput} onChange={(event) => updatePermanentAddressField("permanentPinCode", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" value={draft.permanentPinCode} />
                          </Field>
                          <div className="space-y-1.5 md:col-span-2 xl:col-span-6">
                            <div className="flex min-h-5 flex-wrap items-center gap-3">
                              <span className={labelClass}>Current Address</span>
                              <label className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <input checked={draft.sameAsPermanent === "Yes"} className="h-4 w-4 rounded border-border" onChange={(event) => updateSameAsPermanent(event.target.checked)} type="checkbox" />
                                <span>Same as permanent</span>
                              </label>
                            </div>
                            <textarea className={cn("min-h-20 w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20", draft.sameAsPermanent === "Yes" ? "bg-muted/50" : "bg-background")} placeholder="Flat / House No., Street, Area" readOnly={draft.sameAsPermanent === "Yes"} value={draft.currentAddress} onChange={(event) => updateField("currentAddress", event.target.value)} />
                          </div>
                          <Field label="City">
                            <Input className={inputClass} readOnly={draft.sameAsPermanent === "Yes"} value={draft.currentCity} onChange={(event) => updateField("currentCity", event.target.value)} />
                          </Field>
                          <Field label="State">
                            <Input className={inputClass} readOnly={draft.sameAsPermanent === "Yes"} value={draft.currentState} onChange={(event) => updateField("currentState", event.target.value)} />
                          </Field>
                          <Field label="PIN Code">
                            <Input className={inputClass} inputMode="numeric" maxLength={6} onBeforeInput={preventInvalidNumericInput} onChange={(event) => updateField("currentPinCode", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" readOnly={draft.sameAsPermanent === "Yes"} value={draft.currentPinCode} />
                          </Field>
                          <Field label="Mobile Country Code">
                            <CountryCodeSelect value={draft.mobileCountryCode} onChange={(value) => updateField("mobileCountryCode", value)} />
                          </Field>
                          <Field label="Mobile Number">
                            <Input className={inputClass} inputMode="numeric" maxLength={10} onBeforeInput={preventInvalidNumericInput} onChange={(event) => { updateField("mobileNumber", event.target.value); updateField("contactNumber", event.target.value); }} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" required value={draft.mobileNumber} />
                          </Field>
                          <Field label="Alternate Contact Country Code">
                            <CountryCodeSelect value={draft.alternateCountryCode} onChange={(value) => updateField("alternateCountryCode", value)} />
                          </Field>
                          <Field label="Alternate Contact Number">
                            <Input className={inputClass} inputMode="numeric" maxLength={10} onBeforeInput={preventInvalidNumericInput} onChange={(event) => updateField("alternateNumber", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" value={draft.alternateNumber} />
                          </Field>
                          <Field label="Whatsapp Country Code">
                            <CountryCodeSelect value={draft.whatsappCountryCode} onChange={(value) => updateField("whatsappCountryCode", value)} />
                          </Field>
                          <Field label="Whatsapp Number">
                            <Input className={inputClass} inputMode="numeric" maxLength={15} onBeforeInput={preventInvalidNumericInput} onChange={(event) => updateField("whatsappNumber", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" value={draft.whatsappNumber} />
                          </Field>
                          <Field className="md:col-span-2" label="Email Address">
                            <Input className={inputClass} type="email" value={draft.email} onChange={(event) => updateField("email", event.target.value)} />
                          </Field>
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Identification & Documentation</div>
                        <div className="space-y-3">
                          {identificationRows.map((row, index) => {
                            const selectedIdentification = identityDocumentConfigs[row.type as IdentityDocumentType];
                            return (
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" key={row.id}>
                                <Field label="Identification Type">
                                  <select
                                    className={selectClass}
                                    onChange={(event) => {
                                      updateIdentificationRow(row.id, { type: event.target.value, value: "" });
                                      if (index === 0) updateIdentityDocumentType(event.target.value);
                                    }}
                                    required={index === 0}
                                    value={row.type}
                                  >
                                    <option value="">Select</option>
                                    {availableIdentityDocumentTypes(identificationRows, row.id).map((documentType) => <option key={documentType}>{documentType}</option>)}
                                  </select>
                                </Field>
                                {selectedIdentification ? (
                                  <Field className="xl:col-span-2" label={selectedIdentification.fieldLabel}>
                                    <Input
                                      className={inputClass}
                                      inputMode={selectedIdentification.inputMode}
                                      maxLength={selectedIdentification.maxLength}
                                      minLength={selectedIdentification.minLength}
                                      onBeforeInput={selectedIdentification.inputMode === "numeric" ? preventInvalidNumericInput : undefined}
                                      onChange={(event) => {
                                        updateIdentificationRow(row.id, { value: event.target.value });
                                        if (index === 0) updateIdentityDocumentValue(event.target.value);
                                      }}
                                      onPaste={selectedIdentification.inputMode === "numeric" ? preventInvalidNumericPaste : undefined}
                                      pattern={selectedIdentification.pattern}
                                      required={index === 0}
                                      title={selectedIdentification.title}
                                      value={row.value}
                                    />
                                  </Field>
                                ) : null}
                                <div className="flex items-end gap-2">
                                  {index === identificationRows.length - 1 ? (
                                    <Button aria-label="Add identification row" disabled={identificationRows.length >= identityDocumentTypes.length} onClick={addIdentificationRow} size="icon" type="button" variant="outline">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  ) : null}
                                  <Button aria-label="Delete identification row" className="text-danger" onClick={() => removeIdentificationRow(row.id)} size="icon" type="button" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-border pt-4">
                        <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Emergency</div>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                          <Field className="xl:col-span-2" label="Contact Name">
                            <Input className={inputClass} value={draft.emergencyContactName} onChange={(event) => updateField("emergencyContactName", event.target.value)} />
                          </Field>
                          <Field label="Relationship to Patient">
                            <Input className={inputClass} value={draft.emergencyRelationship} onChange={(event) => updateField("emergencyRelationship", event.target.value)} />
                          </Field>
                          <Field label="Contact Country Code">
                            <CountryCodeSelect value={draft.emergencyCountryCode} onChange={(value) => updateField("emergencyCountryCode", value)} />
                          </Field>
                          <Field label="Contact Number">
                            <Input className={inputClass} inputMode="numeric" maxLength={10} onBeforeInput={preventInvalidNumericInput} onChange={(event) => updateField("emergencyContactNumber", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" value={draft.emergencyContactNumber} />
                          </Field>
                          <Field label="Whatsapp Number">
                            <Input className={inputClass} inputMode="numeric" maxLength={15} onBeforeInput={preventInvalidNumericInput} onChange={(event) => updateField("emergencyWhatsappNumber", event.target.value)} onPaste={preventInvalidNumericPaste} pattern="[0-9]*" value={draft.emergencyWhatsappNumber} />
                          </Field>
                          <Field className="xl:col-span-2" label="Contact Email">
                            <Input className={inputClass} type="email" value={draft.emergencyEmail} onChange={(event) => updateField("emergencyEmail", event.target.value)} />
                          </Field>
                        </div>
                        <div className="mt-3 space-y-3">
                          {emergencyIdentificationRows.map((row, index) => {
                            const selectedIdentification = identityDocumentConfigs[row.type as IdentityDocumentType];
                            return (
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6" key={row.id}>
                                <Field label="Identification Type">
                                  <select
                                    className={selectClass}
                                    onChange={(event) => {
                                      updateEmergencyIdentificationRow(row.id, { type: event.target.value, value: "" });
                                      if (index === 0) updateField("emergencyIdentityDocumentType", event.target.value);
                                    }}
                                    value={row.type}
                                  >
                                    <option value="">Select</option>
                                    {availableIdentityDocumentTypes(emergencyIdentificationRows, row.id).map((documentType) => <option key={documentType}>{documentType}</option>)}
                                  </select>
                                </Field>
                                {selectedIdentification ? (
                                  <Field className="xl:col-span-2" label={index === 0 ? "Identity Document Number" : selectedIdentification.fieldLabel}>
                                    <Input
                                      className={inputClass}
                                      inputMode={selectedIdentification.inputMode}
                                      maxLength={selectedIdentification.maxLength}
                                      minLength={selectedIdentification.minLength}
                                      onBeforeInput={selectedIdentification.inputMode === "numeric" ? preventInvalidNumericInput : undefined}
                                      onChange={(event) => {
                                        updateEmergencyIdentificationRow(row.id, { value: event.target.value });
                                        if (index === 0) updateField("emergencyIdentityDocumentNumber", event.target.value);
                                      }}
                                      onPaste={selectedIdentification.inputMode === "numeric" ? preventInvalidNumericPaste : undefined}
                                      pattern={selectedIdentification.pattern}
                                      title={selectedIdentification.title}
                                      value={row.value}
                                    />
                                  </Field>
                                ) : null}
                                <div className="flex items-end gap-2">
                                  {index === emergencyIdentificationRows.length - 1 ? (
                                    <Button aria-label="Add emergency identification row" disabled={emergencyIdentificationRows.length >= identityDocumentTypes.length} onClick={addEmergencyIdentificationRow} size="icon" type="button" variant="outline">
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  ) : null}
                                  <Button aria-label="Delete emergency identification row" className="text-danger" onClick={() => removeEmergencyIdentificationRow(row.id)} size="icon" type="button" variant="outline">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ) : null}

                  {admissionPath === "new" ? (
                    <Card>
                      <CardHeader className="bg-surface-muted/60">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
                            <BedDouble className="h-4 w-4" />
                          </span>
                          <CardTitle>Bed & Device</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          <SelectField label="ICU unit" value={draft.unit} onChange={updateAdmissionUnit} options={icuUnits} />
                          <Field label="Available bed">
                            <select className={selectClass} value={draft.bedNo} onChange={(event) => updateField("bedNo", event.target.value)}>
                              {availableAdmissionBedOptions.length ? (
                                availableAdmissionBedOptions.map((bedNo) => (
                                  <option key={bedNo} value={bedNo}>{admissionBedLabel(bedNo)}</option>
                                ))
                              ) : (
                                <option value="">No available bed in {draft.unit}</option>
                              )}
                            </select>
                          </Field>
                          <SelectField label="Ventilator / Oxygen" value={draft.ventilator} onChange={(value) => updateField("ventilator", value)} options={["Room air", "Oxygen mask", "NIV support", "Invasive ventilation", "Weaning trial"]} />
                          <Field label="Devices">
                            <Input className={inputClass} placeholder="Monitor, pump, ventilator..." value={draft.devices} onChange={(event) => updateField("devices", event.target.value)} />
                          </Field>
                          <SelectField label="Unit Nurse" value={draft.nurse} onChange={(value) => updateField("nurse", value)} options={["Priya", "Unit Nurse Priya", "Unit Nurse Meera", "Unit Nurse Sana", "Ward Nurse Kavita", "Ward Nurse Arjun", "Ward Nurse Neha"]} />
                          <SelectField label="Admitting Doctor" value={draft.doctor} onChange={(value) => updateField("doctor", value)} options={["Dr. Sameer Mehta", "Dr. Neha Malik", "Dr. Imran Shah", "Dr. Aman Verma"]} />
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}


                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-3">
                  <Card>
                    <CardContent className="p-4">
                      <AdmissionReadinessChecklist selected={selectedReadiness} onToggle={toggleReadiness} />
                    </CardContent>
                  </Card>

                  <AdmissionFormSection title="Clinical Status" description="Current admission condition, recovery direction, risk, and isolation requirement.">
                    <Field label="Primary ICU Diagnosis">
                      <Input className={inputClass} placeholder="Diagnosis" value={draft.diagnosis} onChange={(event) => updateField("diagnosis", event.target.value)} />
                    </Field>
                    <SelectField label="Clinical Status" value={draft.condition} onChange={(value) => updateField("condition", value)} options={["Critical", "Stable", "Guarded"]} />
                    <SelectField label="Current Patient Status" value={draft.recoveryStatus} onChange={(value) => updateField("recoveryStatus", value)} options={patientStatusOptions} />
                    <SelectField label="Risk Level" value={draft.risk} onChange={(value) => updateField("risk", value)} options={["High", "Medium", "Low"]} />
                    <SelectField label="Isolation Required" value={draft.isolation} onChange={(value) => updateField("isolation", value)} options={["No", "Yes"]} />
                    <Field label="ER Handover By">
                      <Input className={inputClass} placeholder="Nurse name" value={draft.handoverBy} onChange={(event) => updateField("handoverBy", event.target.value)} />
                    </Field>
                  </AdmissionFormSection>

                  {admissionPath === "new" ? (
                  <Card>
                    <CardHeader className="bg-surface-muted/60">
                      <button className="flex w-full flex-wrap items-center justify-between gap-3 text-left" type="button" onClick={() => setPatientHistoryOpen((current) => !current)}>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
                            <UserRound className="h-4 w-4" />
                          </span>
                          <CardTitle>Patient History</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone="warning">Optional - complete after admission</Badge>
                          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", patientHistoryOpen ? "rotate-180" : "")} />
                        </div>
                      </button>
                    </CardHeader>
                    {patientHistoryOpen ? (
                      <CardContent className="space-y-3">
                        <div className="overflow-x-auto border-b border-border">
                          <div className="flex min-w-max gap-0">
                            {patientHistoryTabs.map((tab, index) => (
                              <button
                                className={cn(
                                  "border-b-2 px-3 py-2 text-sm font-semibold transition",
                                  patientHistoryTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                                key={tab}
                                type="button"
                                onClick={() => setPatientHistoryTab(tab)}
                              >
                                {index + 1}. {tab}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-md border border-border bg-surface">
                          <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/60 px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
                              <UserRound className="h-4 w-4" />
                            </span>
                            <CardTitle>{patientHistoryTabs.indexOf(patientHistoryTab) + 1}. {patientHistoryTab}</CardTitle>
                          </div>
                          {patientHistoryTab === "Past Medical History" ? (
                            <Button size="sm" type="button" variant="outline" onClick={() => toast.info("Diagnosis row can be added here.")}>
                              <Plus className="h-4 w-4" />
                              Add Diagnosis
                            </Button>
                          ) : null}
                          {patientHistoryTab === "Past Surgical History" ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="h-8 w-36 rounded-md border border-input bg-white px-3 text-xs font-semibold text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
                                value={draft.pastSurgicalHistoryStatus}
                                onChange={(event) => updateField("pastSurgicalHistoryStatus", event.target.value)}
                              >
                                <option value="">Select</option>
                                <option>Yes</option>
                                <option>No</option>
                              </select>
                              {draft.pastSurgicalHistoryStatus === "Yes" ? (
                                <Button size="sm" type="button" variant="outline" onClick={() => toast.info("Surgery row can be added here.")}>
                                  <Plus className="h-4 w-4" />
                                  Add Surgery
                                </Button>
                              ) : null}
                            </div>
                          ) : null}
                          {patientHistoryTab === "Medication History" ? (
                            <Button size="sm" type="button" variant="outline" onClick={() => toast.info("Medication row can be added here.")}>
                              <Plus className="h-4 w-4" />
                              Add Medication
                            </Button>
                          ) : null}
                        </div>
                        <div className="space-y-4 p-4">
                        {patientHistoryTab === "Past Medical History" ? (
                          <>
                            <TextAreaField
                              label="Medical History Notes"
                              placeholder="Enter past medical history"
                              value={draft.pastMedicalHistory}
                              onChange={(value) => updateField("pastMedicalHistory", value)}
                            />
                            <div>
                              <p className="text-sm font-semibold text-foreground">Known Comorbidities</p>
                              <div className="mt-2 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                                {comorbidityOptions.map((item) => (
                                  <label className="flex items-center gap-2 text-sm text-foreground" key={item}>
                                    <input
                                      checked={draft.comorbidities.includes(item)}
                                      className="h-4 w-4 rounded border-input"
                                      type="checkbox"
                                      onChange={() =>
                                        updateField(
                                          "comorbidities",
                                          draft.comorbidities.includes(item)
                                            ? draft.comorbidities.filter((value) => value !== item)
                                            : [...draft.comorbidities, item],
                                        )
                                      }
                                    />
                                    <span>{item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <Field label="Other Comorbidities">
                              <Input className={inputClass} placeholder="Specify other comorbidities" value={draft.otherComorbidities} onChange={(event) => updateField("otherComorbidities", event.target.value)} />
                            </Field>
                          </>
                        ) : null}

                        {patientHistoryTab === "Past Surgical History" ? (
                          <div className="space-y-4">
                            {draft.pastSurgicalHistoryStatus === "Yes" ? (
                            <div className="rounded-md border border-border p-4">
                              <div className="mb-3 text-sm font-semibold text-foreground">Surgery 1</div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <Field label="Surgery / Procedure">
                                  <Input className={inputClass} placeholder="Enter surgery / procedure" value={draft.pastSurgicalHistory} onChange={(event) => updateField("pastSurgicalHistory", event.target.value)} />
                                </Field>
                                <Field label="Year">
                                  <Input className={inputClass} placeholder="DD / MM / YYYY" />
                                </Field>
                                <Field label="Hospital / Center">
                                  <Input className={inputClass} placeholder="Enter hospital / center" />
                                </Field>
                                <Field label="Surgeon">
                                  <Input className={inputClass} placeholder="Enter surgeon" />
                                </Field>
                                <Field label="Type of Surgery">
                                  <select className={selectClass}>
                                    <option value="">Select</option>
                                    <option>Elective</option>
                                    <option>Emergency</option>
                                    <option>Referred</option>
                                  </select>
                                </Field>
                                <Field label="Notes">
                                  <Input className={inputClass} placeholder="Enter notes" />
                                </Field>
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Biopsy (If Any)</span>
                                  <div className="flex min-h-10 flex-wrap items-center gap-4">
                                    {["No Biopsy", "Biopsy Done"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 shrink-0" name="icuBiopsyStatus" type="radio" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Field label="Site / Organ">
                                  <Input className={inputClass} placeholder="Enter site / organ" />
                                </Field>
                                <Field label="Date">
                                  <Input className={inputClass} placeholder="DD / MM / YYYY" />
                                </Field>
                                <Field label="Result / Findings">
                                  <Input className={inputClass} placeholder="Enter result / findings" />
                                </Field>
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Biopsy Result</span>
                                  <div className="grid min-h-10 gap-2">
                                    {["Malignant", "Non-Malignant"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 shrink-0" name="icuBiopsyResult" type="radio" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Field label="Remarks">
                                  <Input className={inputClass} placeholder="Enter remarks" />
                                </Field>
                              </div>

                              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Implant Placed (If Any)</span>
                                  <div className="grid min-h-10 gap-2">
                                    {["No Implant", "Implant Placed"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 shrink-0" name="icuImplantStatus" type="radio" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Field label="Implant Name / Type">
                                  <Input className={inputClass} placeholder="Enter implant name / type" />
                                </Field>
                                <Field label="Material">
                                  <Input className={inputClass} placeholder="Enter material" />
                                </Field>
                                <Field label="Site / Location">
                                  <Input className={inputClass} placeholder="Enter site / location" />
                                </Field>
                                <Field label="Date Placed">
                                  <Input className={inputClass} placeholder="DD / MM / YYYY" />
                                </Field>
                                <Field label="Manufacturer / Brand">
                                  <Input className={inputClass} placeholder="Enter manufacturer / brand" />
                                </Field>
                                <Field label="Implant Identification / Serial No.">
                                  <Input className={inputClass} placeholder="Enter implant ID / serial no." />
                                </Field>
                                <Field label="Purpose / Indication">
                                  <Input className={inputClass} placeholder="Enter purpose / indication" />
                                </Field>
                                <Field className="md:col-span-2 xl:col-span-4" label="Notes">
                                  <Input className={inputClass} placeholder="Enter notes" />
                                </Field>
                              </div>

                              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Past Surgical Complications</span>
                                  <div className="grid min-h-10 gap-2">
                                    {["No Complications", "Complications Present"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 shrink-0" name="icuSurgicalComplications" type="radio" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Field label="Details">
                                  <Input className={inputClass} placeholder="Enter details" />
                                </Field>
                              </div>
                            </div>
                            ) : null}
                          </div>
                        ) : null}

                        {patientHistoryTab === "Medication History" ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-5">
                              {[
                                ["ongoing", "Ongoing Medications"],
                                ["stopped", "Stopped Medications"],
                              ].map(([value, label]) => (
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={value}>
                                  <input checked={medicationHistoryStatus === value} className="h-4 w-4 shrink-0" name="icuMedicationHistoryStatus" type="radio" onChange={() => setMedicationHistoryStatus(value as "ongoing" | "stopped")} />
                                  <span>{label}</span>
                                </label>
                              ))}
                            </div>
                            <div className="overflow-x-auto rounded-md border border-border">
                              <table className="w-full min-w-[860px] text-left text-sm">
                                <thead className="bg-surface-muted text-xs font-semibold uppercase text-muted-foreground">
                                  <tr>
                                    {(medicationHistoryStatus === "ongoing"
                                      ? ["S. NO.", "INDICATOR", "MEDICATION NAME", "DOSE", "FREQUENCY", "ROUTE", "DURATION"]
                                      : ["S. NO.", "INDICATOR", "MEDICATION NAME", "DOSE", "FREQUENCY", "ROUTE", "DURATION", "INDICATION", "STOPPED ON", "REASON"]
                                    ).map((heading) => (
                                      <th className="border-b border-border px-3 py-2" key={heading}>{heading}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {medicationHistoryRows.map((row, index) => (
                                    <tr className="border-b border-border last:border-b-0" key={row.medicationName}>
                                      <td className="px-3 py-2 text-center text-xs text-muted-foreground">{index + 1}</td>
                                      <td className="px-3 py-2">
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground">
                                          <span className={`h-2.5 w-2.5 rounded-full ${medicationColorClasses[row.color]}`} />
                                          {row.color}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 font-medium text-foreground">{row.medicationName}</td>
                                      <td className="px-3 py-2">{row.dose}</td>
                                      <td className="px-3 py-2">{row.frequency}</td>
                                      <td className="px-3 py-2">{row.route}</td>
                                      <td className="px-3 py-2">{row.duration}</td>
                                      {medicationHistoryStatus === "stopped" ? (
                                        <>
                                          <td className="px-3 py-2">{row.indication}</td>
                                          <td className="px-3 py-2">{row.stoppedOn}</td>
                                          <td className="px-3 py-2">{row.reason}</td>
                                        </>
                                      ) : null}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : null}

                        {patientHistoryTab === "Allergy History" ? (
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-8">
                              <Field label="Allergy">
                                <select
                                  className={selectClass}
                                  value={allergyStatus}
                                  onChange={(event) => {
                                    setAllergyStatus(event.target.value);
                                    if (event.target.value !== "Yes") {
                                      setAllergyType("");
                                      setOtherAllergyType("");
                                    }
                                  }}
                                >
                                  <option value="">Select Allergy</option>
                                  <option value="Yes">Yes</option>
                                  <option value="No">No</option>
                                </select>
                              </Field>
                              {allergyStatus === "Yes" ? (
                                <>
                                  <Field label="Type">
                                    <select className={selectClass} value={allergyType} onChange={(event) => setAllergyType(event.target.value)}>
                                      <option value="">Select Type</option>
                                      <option value="Food">Food</option>
                                      <option value="Drug">Drug</option>
                                      <option value="Chemical">Chemical</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </Field>
                                  {allergyType === "Other" ? (
                                    <Field label="Other Allergy Type">
                                      <Input className={inputClass} placeholder="Enter other allergy type" value={otherAllergyType} onChange={(event) => setOtherAllergyType(event.target.value)} />
                                    </Field>
                                  ) : null}
                                  <Field label="Date">
                                    <Input className={inputClass} placeholder="DD / MM / YYYY" />
                                  </Field>
                                  <Field label="Remark">
                                    <Input className={inputClass} placeholder="Enter remark" />
                                  </Field>
                                </>
                              ) : null}
                              {allergyStatus === "No" ? (
                                <Field label="Remark">
                                  <Input className={inputClass} placeholder="Enter remark" />
                                </Field>
                              ) : null}
                            </div>
                            <div className="rounded-md border border-border p-4">
                              <div className="mb-4 text-sm font-semibold text-foreground">Allergy Override</div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                <Field label="Countersigned By (Doctor)">
                                  <select className={selectClass}>
                                    <option value="">Select Doctor</option>
                                    <option>Dr. Sameer Mehta</option>
                                    <option>Dr. Neha Malik</option>
                                    <option>Dr. Imran Shah</option>
                                  </select>
                                </Field>
                                <Field label="Doctor Signature">
                                  <Input className={inputClass} placeholder="Upload signature" />
                                </Field>
                                <Field label="Countersigned By (Nurse)">
                                  <select className={selectClass}>
                                    <option value="">Select Nurse</option>
                                    <option>Unit Nurse Priya</option>
                                    <option>Unit Nurse Meera</option>
                                    <option>Unit Nurse Sana</option>
                                  </select>
                                </Field>
                                <Field label="Nurse Signature">
                                  <Input className={inputClass} placeholder="Upload signature" />
                                </Field>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {patientHistoryTab === "Social History" ? (
                          <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                              <Field label="Clinical Frailty Scale (1 - 8)">
                                <select className={selectClass}>
                                  <option value="">Select Score</option>
                                  <option>1 - Very Fit</option>
                                  <option>2 - Fit</option>
                                  <option>3 - Managing Well</option>
                                  <option>4 - Vulnerable</option>
                                  <option>5 - Mildly Frail</option>
                                  <option>6 - Moderately Frail</option>
                                  <option>7 - Severely Frail</option>
                                  <option>8 - Very Severely Frail</option>
                                </select>
                              </Field>
                              <Field label="Living Situation">
                                <select className={selectClass}>
                                  <option value="">Select</option>
                                  <option>Alone</option>
                                  <option>With family</option>
                                  <option>Assisted care</option>
                                </select>
                              </Field>
                              <Field label="Occupation">
                                <Input className={inputClass} placeholder="Enter occupation" />
                              </Field>
                              <Field label="Marital Status">
                                <select className={selectClass}>
                                  <option value="">Select</option>
                                  <option>Single</option>
                                  <option>Married</option>
                                  <option>Widowed</option>
                                  <option>Separated</option>
                                </select>
                              </Field>
                            </div>
                            <div className="rounded-md border border-border p-4">
                              <div className="mb-3 text-sm font-semibold text-foreground">5A. Smoking History</div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Smoking Status</span>
                                  <div className="grid gap-2">
                                    {["Never Smoker", "Past Smoker", "Current Smoker"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 shrink-0" name="icuSmokingStatus" type="radio" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Type</span>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Cigarette", "Bidi", "Cigar", "Others"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 rounded border-input" type="checkbox" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <Input className={inputClass} placeholder="Specify other type" />
                                </div>
                                <Field label="Amount / Pack Years">
                                  <Input className={inputClass} inputMode="decimal" placeholder="Enter pack years" />
                                </Field>
                                <Field label="Years Consumed">
                                  <Input className={inputClass} inputMode="decimal" placeholder="Enter years" />
                                </Field>
                                <Field label="Years Back Quit Since">
                                  <Input className={inputClass} inputMode="decimal" placeholder="Enter years" />
                                </Field>
                                <Field label="Chewable Tobacco">
                                  <select className={selectClass}>
                                    <option value="">Select status</option>
                                    <option>No</option>
                                    <option>Past</option>
                                    <option>Current</option>
                                  </select>
                                </Field>
                              </div>
                            </div>

                            <div className="rounded-md border border-border p-4">
                              <div className="mb-3 text-sm font-semibold text-foreground">5B. Alcohol History</div>
                              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Alcohol Use</span>
                                  <div className="grid gap-2">
                                    {["Never", "Past", "Current"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 shrink-0" name="icuAlcoholUse" type="radio" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  <span className={labelClass}>Type</span>
                                  <div className="grid grid-cols-2 gap-2">
                                    {["Beer", "Wine", "Whisky", "Rum", "Others"].map((item) => (
                                      <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={item}>
                                        <input className="h-4 w-4 rounded border-input" type="checkbox" />
                                        <span>{item}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                                <Field label="Quantity">
                                  <Input className={inputClass} inputMode="decimal" placeholder="Enter amount" />
                                </Field>
                                <Field label="Unit">
                                  <select className={selectClass}>
                                    <option value="">Select</option>
                                    <option>ml</option>
                                    <option>peg</option>
                                    <option>bottle</option>
                                  </select>
                                </Field>
                                <Field label="Frequency">
                                  <select className={selectClass}>
                                    <option value="">Select</option>
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Occasional</option>
                                  </select>
                                </Field>
                                <Field label="Remarks">
                                  <Input className={inputClass} placeholder="Enter remarks" value={draft.socialHistory} onChange={(event) => updateField("socialHistory", event.target.value)} />
                                </Field>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        </div>
                        </div>
                      </CardContent>
                    ) : null}
                  </Card>
                  ) : null}

                  {admissionPath === "new" ? (
                  <Card>
                    <CardHeader>
                      <button className="flex w-full items-center justify-between gap-3 text-left" type="button" onClick={() => setPhysicalClinicalOpen((current) => !current)}>
                        <CardTitle>Clinical History and Physical Examination</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge tone="warning">Optional - complete after admission</Badge>
                          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", physicalClinicalOpen ? "rotate-180" : "")} />
                        </div>
                      </button>
                    </CardHeader>
                    {physicalClinicalOpen ? (
                    <CardContent className="space-y-4">
                      <p className="text-sm text-foreground">Clinical history and physical examination baseline. None of this blocks admission.</p>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <Field label="Blood Group (Reconfirm)">
                          <select className={selectClass} value={draft.bloodGroupReconfirm} onChange={(event) => updateField("bloodGroupReconfirm", event.target.value)}>
                            <option value="">Select</option>
                            {bloodGroups.map((bloodGroup) => <option key={bloodGroup}>{bloodGroup}</option>)}
                          </select>
                        </Field>
                        <Field label="Height">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                            <Input className={inputClass} inputMode="decimal" value={draft.height} onChange={(event) => updateField("height", event.target.value)} />
                            <span className="text-xs font-medium text-muted-foreground">cm</span>
                          </div>
                        </Field>
                        <Field label="Weight">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                            <Input className={inputClass} inputMode="decimal" value={draft.weight} onChange={(event) => updateField("weight", event.target.value)} />
                            <span className="text-xs font-medium text-muted-foreground">kg</span>
                          </div>
                        </Field>
                        <Field label="BMI (Auto)">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                            <Input className={inputClass} readOnly value={bmi} />
                            <span className="text-xs font-medium text-muted-foreground">kg/m2</span>
                          </div>
                        </Field>
                        <Field label="Allergies">
                          <Input className={inputClass} placeholder="Enter allergies" value={draft.allergies} onChange={(event) => updateField("allergies", event.target.value)} />
                        </Field>
                        <Field label="Comorbidities">
                          <Input className={inputClass} placeholder="Enter comorbidities" value={draft.comorbiditiesText} onChange={(event) => updateField("comorbiditiesText", event.target.value)} />
                        </Field>
                        <Field label="Smoking Status">
                          <select className={selectClass} value={draft.smokingStatus} onChange={(event) => updateField("smokingStatus", event.target.value)}>
                            <option value="">Select</option>
                            <option>Never</option>
                            <option>Former</option>
                            <option>Current</option>
                          </select>
                        </Field>
                        <Field label="Alcohol Use">
                          <select className={selectClass} value={draft.alcoholUse} onChange={(event) => updateField("alcoholUse", event.target.value)}>
                            <option value="">Select</option>
                            <option>No</option>
                            <option>Occasional</option>
                            <option>Regular</option>
                          </select>
                        </Field>
                        <div className="min-w-0 space-y-1.5 md:col-span-2">
                          <span className={labelClass}>Advance Directive</span>
                          <div className="flex min-h-10 flex-wrap items-center gap-x-4 gap-y-2">
                            {["Yes", "No", "Not Known"].map((directive) => (
                              <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground" key={directive}>
                                <input
                                  checked={draft.advanceDirective === directive}
                                  className="h-4 w-4 shrink-0"
                                  name="icuAdvanceDirective"
                                  type="radio"
                                  onChange={() => updateField("advanceDirective", directive)}
                                />
                                <span>{directive}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <Field className="md:col-span-2 xl:col-span-5" label="Notes">
                          <Input className={inputClass} placeholder="Enter additional clinical notes" value={draft.clinicalNotes} onChange={(event) => updateField("clinicalNotes", event.target.value)} />
                        </Field>
                      </div>
                    </CardContent>
                    ) : null}
                  </Card>
                  ) : null}

                  <AdmissionFormSection title="Investigations & Plan" description="Pending reports and immediate ICU care plan.">
                    <TextAreaField className="xl:col-span-1" label="Pending Investigations" value={draft.pendingInvestigations} onChange={(value) => updateField("pendingInvestigations", value)} placeholder="Lab, radiology, cultures, ABG, pending reports..." />
                    <TextAreaField className="xl:col-span-1" label="Planned Care / Treatment" value={draft.plannedCareTreatment} onChange={(value) => updateField("plannedCareTreatment", value)} placeholder="ICU plan, treatment goal, monitoring plan, escalation plan..." />
                  </AdmissionFormSection>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  <AdmissionFormSection title="Medication Reconciliation" description="Past, current, and high-alert medicines captured before ICU receive.">
                    <TextAreaField label="Past Medication" value={draft.pastMedication} onChange={(value) => updateField("pastMedication", value)} placeholder="Home medicines, previous hospital medicines, stopped medicines..." />
                    <TextAreaField label="Current Medication" value={draft.currentMedication} onChange={(value) => {
                      updateField("currentMedication", value);
                      updateField("medication", value);
                    }} placeholder="Antibiotics, infusions, emergency medicines, active ICU medicines..." />
                    <TextAreaField label="Allergy" value={draft.allergy} onChange={(value) => updateField("allergy", value)} placeholder="Drug, food, latex, contrast, or no known allergy..." />
                    <TextAreaField label="High-Alert Medications" value={draft.highAlertMedications} onChange={(value) => updateField("highAlertMedications", value)} placeholder="Insulin, vasopressor, anticoagulant, concentrated electrolytes, narcotics..." />
                    <TextAreaField label="Other Relevant Information" value={draft.otherRelevantInformation} onChange={(value) => updateField("otherRelevantInformation", value)} placeholder="Allergy, implants, NPO, infection risk, family instruction, consent context..." />
                  </AdmissionFormSection>

                  <AdmissionFormSection title="Procedures & Handover" description="Procedure context, nurse handover route, confirmation, and bedside nursing note.">
                    <TextAreaField label="Procedures" value={draft.procedures} onChange={(value) => updateField("procedures", value)} placeholder="Lines, intubation, catheter, drain, surgery/procedure context..." />
                    <TextAreaField label="Nursing Notes" value={draft.nursingNotes} onChange={(value) => updateField("nursingNotes", value)} placeholder="Arrival condition, device status, safety checks, pending task, immediate nursing plan..." />
                    <SelectField label="Handed Over" value={draft.handedOver} onChange={(value) => updateField("handedOver", value)} options={["ER nurse / source unit team", "Ward nurse", "OT team", "External facility team"]} />
                    <SelectField label="Taken Over By" value={draft.takenOverBy} onChange={(value) => updateField("takenOverBy", value)} options={["Unit Nurse Priya", "Unit Nurse Meera", "Unit Nurse Sana", "Ward Nurse Kavita"]} />
                    <SelectField label="Signature / Confirmation" value={draft.signatureConfirmation} onChange={(value) => updateField("signatureConfirmation", value)} options={["Pending bedside confirmation", "Verbal handover accepted", "Digital signature captured", "Paper signature pending", "Received with exceptions"]} />
                  </AdmissionFormSection>
                </div>
              ) : null}

              {step === 3 ? (
                <StepPlaceholder icon={Check} title="4. Review">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ["Patient", [["Patient", draft.patientName || "-"], ["UHID / MRN", draft.uhid || "Auto assign"], ["Age / gender", [draft.age, draft.gender].filter(Boolean).join(" / ") || "-"], ["Contact", draft.contactNumber || "-"]]],
                      ["Bed & device", [["Unit", draft.unit], ["Bed", draft.bedNo], ["Ventilator / oxygen", draft.ventilator], ["Devices", draft.devices]]],
                      ["Clinical", [["Diagnosis", draft.diagnosis || "-"], ["Clinical status", draft.condition], ["Current patient status", draft.recoveryStatus], ["Risk", draft.risk], ["Isolation", draft.isolation]]],
                      ["Medication & handover", [["Current medication", draft.currentMedication || "-"], ["Allergy", draft.allergy || "-"], ["Handed over", draft.handedOver], ["Taken over by", draft.takenOverBy]]],
                    ].map(([title, rows]) => (
                      <div className="rounded-md border border-border bg-surface p-3" key={title as string}>
                        <div className="text-sm font-semibold text-foreground">{title as string}</div>
                        <div className="mt-3 space-y-2">
                          {(rows as string[][]).map(([label, value]) => (
                            <div className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 text-xs" key={label}>
                              <span className="font-medium text-muted-foreground">{label}</span>
                              <span className="font-semibold text-foreground">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </StepPlaceholder>
              ) : null}
            </div>

            <div className="sticky bottom-0 z-20 shrink-0 border-t border-border bg-background/95 px-5 py-3 backdrop-blur">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Button onClick={() => toast.info("ICU admission cancelled.")} size="sm" type="button" variant="outline">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))} size="sm" type="button" variant="outline">
                    Back
                  </Button>
                  <Button onClick={saveDraft} size="sm" type="button" variant="outline">
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={resetDraft} size="sm" type="button" variant="outline">
                    <RotateCcw className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button disabled={!canContinue} onClick={continueFlow} size="sm" type="button">
                    {step === admissionSteps.length - 1 ? "Complete Admission" : "Save & Continue"}
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
