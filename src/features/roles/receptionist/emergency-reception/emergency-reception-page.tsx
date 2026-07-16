"use client";

import * as React from "react";
import {
  Activity,
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  FlaskConical,
  HeartPulse,
  PhoneCall,
  Pill,
  Printer,
  RefreshCcw,
  Save,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TriageLevel = "Red" | "Orange" | "Yellow" | "Green";

type TriageForm = {
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  arrivalDateTime: string;
  arrivalMode: string;
  chiefComplaint: string;
  temperature: string;
  pulse: string;
  heartRate: string;
  respiratoryRate: string;
  bloodPressure: string;
  spo2: string;
  painScore: string;
  bloodGlucose: string;
  height: string;
  weight: string;
  consciousness: string;
  allergies: string;
  medicalHistory: string;
  currentMedications: string;
  pregnancyStatus: string;
  traumaDetails: string;
  triageLevel: TriageLevel;
  triageScore: string;
  priorityReason: string;
  bedNumber: string;
  bedType: string;
  bedAssignmentTime: string;
  otherImmediateCare: string;
  triageNurseName: string;
  nurseSignature: string;
  nurseDate: string;
};

const inputClass = "h-10 rounded-md border-input bg-background text-sm shadow-sm";
const textareaClass =
  "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";
const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";

const initialForm: TriageForm = {
  patientId: "",
  patientName: "",
  age: "",
  gender: "",
  arrivalDateTime: "",
  arrivalMode: "Walk-in",
  chiefComplaint: "",
  temperature: "",
  pulse: "",
  heartRate: "",
  respiratoryRate: "",
  bloodPressure: "",
  spo2: "",
  painScore: "",
  bloodGlucose: "",
  height: "",
  weight: "",
  consciousness: "",
  allergies: "",
  medicalHistory: "",
  currentMedications: "",
  pregnancyStatus: "",
  traumaDetails: "",
  triageLevel: "Yellow",
  triageScore: "",
  priorityReason: "",
  bedNumber: "",
  bedType: "",
  bedAssignmentTime: "",
  otherImmediateCare: "",
  triageNurseName: "",
  nurseSignature: "",
  nurseDate: "",
};

const triageLevelStyles: Record<TriageLevel, string> = {
  Red: "border-red-200 bg-red-50 text-red-700",
  Orange: "border-orange-200 bg-orange-50 text-orange-700",
  Yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
  Green: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const emergencyPatients = [
  { id: "ER_40*ED-10***", name: "Aisha Khan", complaint: "Severe breathlessness", mode: "Ambulance", level: "Red", temp: "38.4", pulse: 126, hr: 128, respiratoryRate: 32, spo2: 84, bp: "88/54", glucose: 186, bed: "ER-01", nurse: "Nurse Kavita" },
  { id: "ER_03*ED-70***", name: "Liam Anderson", complaint: "Chest pain with sweating", mode: "Referral", level: "Orange", temp: "37.8", pulse: 110, hr: 112, respiratoryRate: 24, spo2: 93, bp: "150/96", glucose: 142, bed: "ER-03", nurse: "Nurse Arjun" },
  { id: "ER_53*ED-09***", name: "Meera Sharma", complaint: "High fever with confusion", mode: "Walk-in", level: "Orange", temp: "40.0", pulse: 116, hr: 118, respiratoryRate: 26, spo2: 95, bp: "110/70", glucose: 118, bed: "ER-05", nurse: "Nurse Neha" },
  { id: "ER_33*ED-10***", name: "Oliver Brown", complaint: "Road traffic trauma", mode: "Ambulance", level: "Red", temp: "36.5", pulse: 130, hr: 132, respiratoryRate: 30, spo2: 89, bp: "92/58", glucose: 102, bed: "Trauma-02", nurse: "Nurse Sana" },
  { id: "ER_01*OBS-06***", name: "Priya Nair", complaint: "Acute abdominal pain", mode: "Walk-in", level: "Yellow", temp: "37.0", pulse: 100, hr: 102, respiratoryRate: 20, spo2: 97, bp: "124/82", glucose: 96, bed: "OBS-06", nurse: "Nurse Kavita" },
  { id: "ER_40*ED-50***", name: "Noah Wilson", complaint: "Lower GI bleeding", mode: "Referral", level: "Yellow", temp: "36.8", pulse: 94, hr: 96, respiratoryRate: 18, spo2: 95, bp: "104/66", glucose: 108, bed: "ER-08", nurse: "Nurse Arjun" },
  { id: "ER_17*ISO-11***", name: "Arjun Patel", complaint: "Allergic reaction", mode: "Walk-in", level: "Green", temp: "36.9", pulse: 86, hr: 88, respiratoryRate: 18, spo2: 98, bp: "118/78", glucose: 92, bed: "ISO-01", nurse: "Nurse Neha" },
  { id: "ER_09*IND-06***", name: "Emily Clarke", complaint: "H1N1 influenza", mode: "Referral", level: "Yellow", temp: "38.2", pulse: 102, hr: 104, respiratoryRate: 22, spo2: 90, bp: "116/74", glucose: 126, bed: "ISO-03", nurse: "Nurse Sana" },
] as const satisfies Array<{
  id: string;
  name: string;
  complaint: string;
  mode: string;
  level: TriageLevel;
  temp: string;
  pulse: number;
  hr: number;
  respiratoryRate: number;
  spo2: number;
  bp: string;
  glucose: number;
  bed: string;
  nurse: string;
}>;

type EmergencyPatient = (typeof emergencyPatients)[number];
type VitalTone = "amber" | "green" | "red";

const interventions = ["Oxygen Therapy", "IV Access", "ECG", "Blood Sample Collection", "First Aid"];

export function EmergencyReceptionPage() {
  const [form, setForm] = React.useState<TriageForm>(initialForm);
  const [search, setSearch] = React.useState("");
  const [selectedInterventions, setSelectedInterventions] = React.useState<string[]>([]);

  const filteredEmergencyPatients = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return emergencyPatients;
    return emergencyPatients.filter((patient) =>
      `${patient.name} ${patient.id} ${patient.complaint} ${patient.bed} ${patient.mode} ${patient.level}`.toLowerCase().includes(query),
    );
  }, [search]);

  const updateField = (field: keyof TriageForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleIntervention = (intervention: string) => {
    setSelectedInterventions((current) =>
      current.includes(intervention)
        ? current.filter((item) => item !== intervention)
        : [...current, intervention],
    );
  };

  const handleSaveDraft = () => {
    toast.success("Emergency triage draft saved.");
  };

  const handleClear = () => {
    setForm(initialForm);
    setSelectedInterventions([]);
    toast.success("Emergency triage sheet cleared.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-[520px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-12 rounded-xl border-border bg-white pl-12 text-base shadow-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient, bed, or diagnosis..."
            value={search}
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className="text-sm font-semibold text-muted-foreground">{filteredEmergencyPatients.length} patients found</p>
          <Button type="button" variant="outline" onClick={() => toast.success("Emergency triage export prepared.")}>
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <EmergencyPatientTable patients={filteredEmergencyPatients} />

      <Card className="overflow-hidden">
          <CardHeader className="bg-surface-muted/60">
            <div>
              <CardTitle>Emergency Triage Sheet</CardTitle>
              <CardDescription>Receptionist triage format for emergency intake.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", triageLevelStyles[form.triageLevel])}>
                {form.triageLevel} Priority
              </span>
              <Button size="sm" type="button" variant="outline" onClick={handleClear}>
                <RefreshCcw className="h-4 w-4" />
                Clear
              </Button>
              <Button size="sm" type="button" onClick={handleSaveDraft}>
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <TriageSection icon={UserRound} title="1. Patient Information">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Patient ID / UHID"><Input className={inputClass} value={form.patientId} onChange={(event) => updateField("patientId", event.target.value)} /></Field>
                <Field label="Patient Name"><Input className={inputClass} value={form.patientName} onChange={(event) => updateField("patientName", event.target.value)} /></Field>
                <Field label="Age"><Input className={inputClass} inputMode="numeric" value={form.age} onChange={(event) => updateField("age", event.target.value)} /></Field>
                <Field label="Gender">
                  <select className={selectClass} value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Date & Time of Arrival"><Input className={inputClass} type="datetime-local" value={form.arrivalDateTime} onChange={(event) => updateField("arrivalDateTime", event.target.value)} /></Field>
                <Field label="Mode of Arrival">
                  <select className={selectClass} value={form.arrivalMode} onChange={(event) => updateField("arrivalMode", event.target.value)}>
                    <option>Walk-in</option>
                    <option>Ambulance</option>
                    <option>Referral</option>
                  </select>
                </Field>
              </div>
            </TriageSection>

            <TriageSection icon={ClipboardList} title="2. Chief Complaint">
              <textarea className={textareaClass} value={form.chiefComplaint} onChange={(event) => updateField("chiefComplaint", event.target.value)} placeholder="Primary reason for the emergency visit" />
            </TriageSection>

            <TriageSection icon={HeartPulse} title="3. Vital Signs">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
                <Field label="Temperature"><Input className={inputClass} value={form.temperature} onChange={(event) => updateField("temperature", event.target.value)} placeholder="deg C" /></Field>
                <Field label="Pulse Rate"><Input className={inputClass} value={form.pulse} onChange={(event) => updateField("pulse", event.target.value)} placeholder="/min" /></Field>
                <Field label="HR"><Input className={inputClass} value={form.heartRate} onChange={(event) => updateField("heartRate", event.target.value)} placeholder="bpm" /></Field>
                <Field label="Respiratory Rate"><Input className={inputClass} value={form.respiratoryRate} onChange={(event) => updateField("respiratoryRate", event.target.value)} placeholder="/min" /></Field>
                <Field label="SpO2"><Input className={inputClass} value={form.spo2} onChange={(event) => updateField("spo2", event.target.value)} placeholder="%" /></Field>
                <Field label="Blood Pressure"><Input className={inputClass} value={form.bloodPressure} onChange={(event) => updateField("bloodPressure", event.target.value)} placeholder="120/80" /></Field>
                <Field label="Blood Glucose"><Input className={inputClass} value={form.bloodGlucose} onChange={(event) => updateField("bloodGlucose", event.target.value)} placeholder="if indicated" /></Field>
                <Field label="Pain Score"><Input className={inputClass} value={form.painScore} onChange={(event) => updateField("painScore", event.target.value)} placeholder="0-10" /></Field>
                <Field label="Height / Weight">
                  <div className="grid grid-cols-2 gap-2">
                    <Input className={inputClass} value={form.height} onChange={(event) => updateField("height", event.target.value)} placeholder="Height" />
                    <Input className={inputClass} value={form.weight} onChange={(event) => updateField("weight", event.target.value)} placeholder="Weight" />
                  </div>
                </Field>
              </div>
            </TriageSection>

            <TriageSection icon={AlertTriangle} title="4. Clinical Assessment">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Level of Consciousness (AVPU / GCS)">
                  <Input className={inputClass} value={form.consciousness} onChange={(event) => updateField("consciousness", event.target.value)} />
                </Field>
                <Field label="Allergies"><Input className={inputClass} value={form.allergies} onChange={(event) => updateField("allergies", event.target.value)} /></Field>
                <Field label="Medical History"><Input className={inputClass} value={form.medicalHistory} onChange={(event) => updateField("medicalHistory", event.target.value)} /></Field>
                <Field label="Current Medications"><Input className={inputClass} value={form.currentMedications} onChange={(event) => updateField("currentMedications", event.target.value)} /></Field>
                <Field label="Pregnancy Status"><Input className={inputClass} value={form.pregnancyStatus} onChange={(event) => updateField("pregnancyStatus", event.target.value)} placeholder="if applicable" /></Field>
                <Field label="Trauma Details"><Input className={inputClass} value={form.traumaDetails} onChange={(event) => updateField("traumaDetails", event.target.value)} placeholder="if applicable" /></Field>
              </div>
            </TriageSection>

            <TriageSection icon={ShieldAlert} title="5. Triage Classification">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Triage Level">
                  <select className={selectClass} value={form.triageLevel} onChange={(event) => updateField("triageLevel", event.target.value as TriageLevel)}>
                    <option>Red</option>
                    <option>Orange</option>
                    <option>Yellow</option>
                    <option>Green</option>
                  </select>
                </Field>
                <Field label="Triage Score"><Input className={inputClass} value={form.triageScore} onChange={(event) => updateField("triageScore", event.target.value)} placeholder="ESI / CTAS" /></Field>
                <Field className="md:col-span-2" label="Priority Reason"><Input className={inputClass} value={form.priorityReason} onChange={(event) => updateField("priorityReason", event.target.value)} /></Field>
              </div>
            </TriageSection>

            <TriageSection icon={BedDouble} title="6. Bed Allocation">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Emergency Bed Number"><Input className={inputClass} value={form.bedNumber} onChange={(event) => updateField("bedNumber", event.target.value)} /></Field>
                <Field label="Bed Type">
                  <select className={selectClass} value={form.bedType} onChange={(event) => updateField("bedType", event.target.value)}>
                    <option value="">Select bed type</option>
                    <option>Resuscitation</option>
                    <option>Observation</option>
                    <option>Isolation</option>
                    <option>Procedure</option>
                  </select>
                </Field>
                <Field label="Time of Bed Assignment"><Input className={inputClass} type="time" value={form.bedAssignmentTime} onChange={(event) => updateField("bedAssignmentTime", event.target.value)} /></Field>
              </div>
            </TriageSection>

            <TriageSection icon={CheckCircle2} title="7. Initial Interventions">
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {interventions.map((intervention) => (
                  <label className="flex min-h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground" key={intervention}>
                    <input checked={selectedInterventions.includes(intervention)} className="h-4 w-4 accent-primary" onChange={() => toggleIntervention(intervention)} type="checkbox" />
                    {intervention}
                  </label>
                ))}
                <Field className="md:col-span-2 xl:col-span-3" label="Other Immediate Care">
                  <Input className={inputClass} value={form.otherImmediateCare} onChange={(event) => updateField("otherImmediateCare", event.target.value)} />
                </Field>
              </div>
            </TriageSection>

            <TriageSection icon={UserRound} title="8. Nurse Details">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Triage Nurse Name"><Input className={inputClass} value={form.triageNurseName} onChange={(event) => updateField("triageNurseName", event.target.value)} /></Field>
                <Field label="Signature"><Input className={inputClass} value={form.nurseSignature} onChange={(event) => updateField("nurseSignature", event.target.value)} /></Field>
                <Field label="Date"><Input className={inputClass} type="date" value={form.nurseDate} onChange={(event) => updateField("nurseDate", event.target.value)} /></Field>
              </div>
            </TriageSection>
          </CardContent>
      </Card>
    </div>
  );
}

function EmergencyPatientTable({ patients }: { patients: ReadonlyArray<EmergencyPatient> }) {
  return (
    <Card className="overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-white">
              <TableHead className="min-w-[220px]">Patient</TableHead>
              <TableHead className="min-w-[210px]">Chief Complaint</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Temp</TableHead>
              <TableHead>Pulse Rate</TableHead>
              <TableHead>HR (bpm)</TableHead>
              <TableHead>Respiratory Rate</TableHead>
              <TableHead>SpO2 (%)</TableHead>
              <TableHead>BP (mmHg)</TableHead>
              <TableHead>Glucose</TableHead>
              <TableHead>Triage</TableHead>
              <TableHead>Bed</TableHead>
              <TableHead>Lab</TableHead>
              <TableHead>Medication</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Call</TableHead>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr className="border-b border-border/70 bg-white even:bg-surface-muted/45" key={patient.id}>
                <td className="border-r border-border px-4 py-4">
                  <div className={cn("border-l-4 pl-4", triageStripeClass(patient.level))}>
                    <p className={cn("text-base font-bold", patient.level === "Red" ? "text-red-700" : patient.level === "Orange" ? "text-orange-600" : "text-foreground")}>{patient.name}</p>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">{patient.id}</p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">{patient.nurse}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-semibold text-foreground">{patient.complaint}</td>
                <td className="px-3 py-4 text-center">
                  <span className="inline-flex rounded-full border border-border bg-white px-3 py-1 text-xs font-bold text-muted-foreground">{patient.mode}</span>
                </td>
                <td className="px-3 py-4 text-center"><VitalPill tone={temperatureTone(Number(patient.temp))} value={patient.temp} /></td>
                <td className="px-3 py-4 text-center"><VitalPill tone={pulseRateTone(patient.pulse)} value={patient.pulse} /></td>
                <td className="px-3 py-4 text-center"><VitalPill tone={heartRateTone(patient.hr)} value={patient.hr} /></td>
                <td className="px-3 py-4 text-center"><VitalPill tone={respiratoryRateTone(patient.respiratoryRate)} value={patient.respiratoryRate} /></td>
                <td className="px-3 py-4 text-center"><VitalPill tone={spo2Tone(patient.spo2)} value={patient.spo2} /></td>
                <td className="px-3 py-4 text-center"><VitalPill tone={bloodPressureTone(patient.bp)} value={patient.bp} /></td>
                <td className="px-3 py-4 text-center"><VitalPill tone={glucoseTone(patient.glucose)} value={patient.glucose} /></td>
                <td className="px-3 py-4 text-center">
                  <span className={cn("inline-flex min-w-20 justify-center rounded-full border px-3 py-1 text-xs font-bold", triageLevelStyles[patient.level])}>{patient.level}</span>
                </td>
                <td className="px-3 py-4 text-center font-bold text-foreground">{patient.bed}</td>
                <td className="px-3 py-4 text-center"><RoundAction icon={FlaskConical} label="Open lab results" /></td>
                <td className="px-3 py-4 text-center"><RoundAction icon={Pill} label="Open medication" /></td>
                <td className="px-3 py-4 text-center"><RoundAction icon={FileText} label="Open triage notes" /></td>
                <td className="px-3 py-4 text-center"><RoundAction icon={Activity} label="Open emergency events" tone="danger" /></td>
                <td className="px-3 py-4 text-center"><RoundAction icon={PhoneCall} label="Call care team" tone="primary" /></td>
              </tr>
            ))}
            {patients.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-sm font-semibold text-muted-foreground" colSpan={17}>
                  No emergency patients found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-4 text-center text-sm font-bold text-foreground", className)}>{children}</th>;
}

function VitalPill({ tone, value }: { tone: VitalTone; value: React.ReactNode }) {
  const toneClass = {
    amber: "bg-amber-500 text-white shadow-[0_6px_14px_rgba(245,158,11,0.28)]",
    green: "bg-green-600 text-white shadow-[0_6px_14px_rgba(22,163,74,0.28)]",
    red: "bg-red-600 text-white shadow-[0_6px_14px_rgba(220,38,38,0.28)]",
  }[tone];

  return <span className={cn("inline-flex min-w-14 justify-center rounded-full px-3 py-2 text-sm font-bold", toneClass)}>{value}</span>;
}

function RoundAction({ icon: Icon, label, tone = "neutral" }: { icon: typeof HeartPulse; label: string; tone?: "danger" | "neutral" | "primary" }) {
  const toneClass = {
    danger: "bg-red-500 text-white shadow-[0_6px_14px_rgba(239,68,68,0.28)]",
    neutral: "bg-neutral-700 text-white shadow-[0_6px_14px_rgba(38,38,38,0.22)]",
    primary: "bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]",
  }[tone];

  return (
    <button aria-label={label} className={cn("inline-flex h-11 w-11 items-center justify-center rounded-full transition hover:scale-105", toneClass)} type="button">
      <Icon className="h-5 w-5" />
    </button>
  );
}

function triageStripeClass(level: TriageLevel) {
  if (level === "Red") return "border-red-500";
  if (level === "Orange") return "border-orange-500";
  if (level === "Yellow") return "border-yellow-500";
  return "border-emerald-500";
}

function heartRateTone(value: number): VitalTone {
  if (value >= 120 || value < 60) return "red";
  if (value >= 100) return "amber";
  return "green";
}

function pulseRateTone(value: number): VitalTone {
  if (value >= 120 || value < 60) return "red";
  if (value >= 100) return "amber";
  return "green";
}

function respiratoryRateTone(value: number): VitalTone {
  if (value >= 30 || value < 10) return "red";
  if (value >= 22) return "amber";
  return "green";
}

function spo2Tone(value: number): VitalTone {
  if (value < 90) return "red";
  if (value < 94) return "amber";
  return "green";
}

function bloodPressureTone(value: string): VitalTone {
  const [systolicText, diastolicText] = value.split("/");
  const systolic = Number(systolicText);
  const diastolic = Number(diastolicText);
  if (systolic < 90 || diastolic < 60 || systolic >= 160 || diastolic >= 110) return "red";
  if (systolic < 100 || systolic >= 140 || diastolic >= 90) return "amber";
  return "green";
}

function temperatureTone(value: number): VitalTone {
  if (value >= 39 || value < 35.5) return "red";
  if (value >= 37.8) return "amber";
  return "green";
}

function glucoseTone(value: number): VitalTone {
  if (value < 70 || value >= 180) return "red";
  if (value >= 140) return "amber";
  return "green";
}

function TriageSection({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: typeof HeartPulse;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-white">
      <div className="flex items-center gap-2 border-b border-border bg-surface-muted/50 px-3 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Field({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <label className={cn("space-y-1.5", className)}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}
