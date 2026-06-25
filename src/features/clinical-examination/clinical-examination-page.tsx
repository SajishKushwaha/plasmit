"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, Bed, CheckCircle2, ClipboardCheck, ClipboardList, FileText, FlaskConical, HeartPulse, Mic, Pill, Plus, Printer, RefreshCcw, Save, Search, ShieldCheck, Star, Stethoscope } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyActionBar } from "@/features/admin/admin-shared";
import {
  backendApis,
  builderFields,
  clinicalScores,
  clinicalSpecialties,
  clinicalTimeline,
  clinicalTrendData,
  databaseTables,
  examinationDefaultNotes,
  examinationFindings,
  quickClinicalActions,
  reportLinks,
  type ClinicalSeverity,
  type SpecialtyId,
} from "@/data/clinical-examination";
import { mockPatients, mockPatientVisits } from "@/data/patients";
import { cn } from "@/lib/utils";

const severityTone: Record<ClinicalSeverity, "success" | "warning" | "danger" | "critical"> = {
  Normal: "success",
  Mild: "warning",
  Moderate: "warning",
  Severe: "danger",
  Critical: "critical",
};

const toggleOptions = ["Normal", "Mild", "Moderate", "Severe", "Absent", "Present", "Positive", "Negative"];

type ClinicalPatientContext = {
  id: string;
  uhid: string;
  name: string;
  ageGender: string;
  encounter: string;
  wardBed: string;
  consultant: string;
  allergies: string;
  flags: string[];
};

function patientName(patient: (typeof mockPatients)[number]) {
  return `${patient.firstName} ${patient.middleName ? `${patient.middleName} ` : ""}${patient.lastName}`;
}

function consultantForDepartment(department: string) {
  const mapping: Record<string, string> = {
    Cardiology: "Dr. Kavita Rao",
    Orthopedics: "Dr. Aman Verma",
    Pediatrics: "Dr. Neha Malik",
    Emergency: "Emergency Desk",
    Oncology: "Dr. Neha Malik",
  };
  return mapping[department] ?? "Dr. Kavita Rao";
}

function clinicalPatientFromRecord(patient: (typeof mockPatients)[number]): ClinicalPatientContext {
  const visits = mockPatientVisits.filter((visit) => visit.patientId === patient.id);
  const encounter = visits.length ? visits.map((visit) => visit.referenceNumber).join(" / ") : "No active encounter";
  const activeVisit = visits.find((visit) => visit.status === "Active") ?? visits[0];
  const allergyFlags = patient.alertFlags.filter((flag) => flag.toLowerCase().includes("allergy"));
  const nonAllergyFlags = patient.alertFlags.filter((flag) => !flag.toLowerCase().includes("allergy"));

  return {
    id: patient.id,
    uhid: patient.uhid,
    name: patientName(patient),
    ageGender: `${patient.age}/${patient.gender.charAt(0)}`,
    encounter,
    wardBed: activeVisit?.visitType === "IPD" ? `${patient.department} Ward / Bed pending` : `${patient.department} ${activeVisit?.visitType ?? "OPD"}`,
    consultant: activeVisit?.provider ?? consultantForDepartment(patient.department),
    allergies: allergyFlags.length ? allergyFlags.map((flag) => flag.replace(/^Allergy:\s*/i, "")).join(", ") : "No known allergy",
    flags: nonAllergyFlags.length ? nonAllergyFlags : ["No active risk flag"],
  };
}

function PageMotion({ children }: { children: React.ReactNode }) {
  return <motion.div animate={{ opacity: 1, y: 0 }} className="space-y-4" initial={{ opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: "easeOut" }}>{children}</motion.div>;
}

function PatientHeaderStrip({ patient, selectedPatientId, onPatientChange }: { patient: ClinicalPatientContext; selectedPatientId: string; onPatientChange: (patientId: string) => void }) {
  const [patientSearch, setPatientSearch] = React.useState("");
  const patientResults = React.useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return [];
    return mockPatients
      .filter((item) => `${patientName(item)} ${item.uhid} ${item.mobile} ${item.department}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [patientSearch]);

  return (
    <Card className="overflow-hidden">
      {/* <CardContent className="space-y-3 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Clinical examination workspace</div>
            <h1 className="mt-1 text-2xl font-bold text-foreground">{patient.name}</h1>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">Selected from patient registry by patientId: {selectedPatientId}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search clinical examination patient"
                className="h-10 bg-white pl-9 font-semibold"
                placeholder="Search patient / UHID"
                value={patientSearch}
                onChange={(event) => setPatientSearch(event.target.value)}
              />
              {patientSearch ? (
                <div className="absolute right-0 top-11 z-50 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-white p-1 shadow-soft">
                  {patientResults.length ? patientResults.map((item) => (
                    <button
                      className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
                      key={item.id}
                      onClick={() => {
                        onPatientChange(item.id);
                        setPatientSearch("");
                      }}
                      type="button"
                    >
                      <span className="font-semibold text-foreground">{patientName(item)}</span>
                      <span className="text-xs text-muted-foreground">{item.uhid} | {item.age}/{item.gender} | {item.department}</span>
                    </button>
                  )) : (
                    <div className="px-3 py-3 text-sm text-muted-foreground">No patient found.</div>
                  )}
                </div>
              ) : null}
            </div>
            <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
            <Button variant="outline" onClick={() => toast.info("Last clinical draft restored")}><RefreshCcw className="h-4 w-4" />Restore draft</Button>
            <Button onClick={() => toast.success("Clinical draft autosaved")}><Save className="h-4 w-4" />Save draft</Button>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-6">
          {[
            ["UHID", patient.uhid],
            ["Age/Gender", patient.ageGender],
            ["IPD/OPD No.", patient.encounter],
            ["Ward/Bed", patient.wardBed],
            ["Consultant", patient.consultant],
            ["Allergy", patient.allergies],
          ].map(([label, value]) => (
            <div className="rounded-lg border border-border bg-surface-muted px-3 py-2" key={label}>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
              <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {patient.flags.map((flag) => <Badge key={flag} tone={flag.includes("BP") || flag.includes("Outstanding") || flag.includes("Minor") ? "warning" : "danger"}>{flag}</Badge>)}
          <Badge tone="info">Autosave every 20 sec</Badge>
          <Badge tone="muted">Keyboard shortcuts ready</Badge>
        </div>
      </CardContent> */}
    </Card>
  );
}

function SummaryCards() {
  const cards = [
    ["Vitals", "BP 148/92, Pulse 86", "Moderate", "Review BP trend before final submit"],
    ["Diagnosis", "Hypertension follow-up", "Mild", "Linked with OPD/IPD encounter"],
    ["Risk Score", "NEWS 4", "Moderate", "Auto score from vitals and findings"],
    ["Complaints", "Chest tightness improved", "Mild", "Current complaint summary"],
    ["Critical observations", "No acute red flag", "Normal", "Allergy remains active"],
  ] as const;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {cards.map(([label, value, severity, note]) => (
        <Card className="transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]" key={label}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-semibold text-muted-foreground">{label}</div>
              <Badge tone={severityTone[severity]}>{severity}</Badge>
            </div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <p className="text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuickActions({ active, onSelect }: { active: string; onSelect: (action: string) => void }) {
  const actionIcons = {
    "Clinical Examination": Stethoscope,
    "Progress Notes": FileText,
    Orders: ClipboardList,
    Prescription: Pill,
    Vitals: HeartPulse,
    Reports: FlaskConical,
    "Nursing Notes": Bed,
    "Discharge Summary": Activity,
  } as Record<string, typeof Stethoscope>;
  return (
    <Card>
      <CardContent className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickClinicalActions.map((action) => {
          const Icon = actionIcons[action] ?? ClipboardCheck;
          return (
          <Button key={action} variant={active === action ? "default" : "outline"} onClick={() => onSelect(action)}>
            <Icon className="h-4 w-4" />
            {action}
          </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SpecialtyPicker({ selected, onSelect }: { selected: SpecialtyId; onSelect: (id: SpecialtyId) => void }) {
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("All departments");
  const departments = ["All departments", ...Array.from(new Set(clinicalSpecialties.map((item) => item.department)))];
  const specialties = clinicalSpecialties.filter((item) => {
    const matchesSearch = `${item.label} ${item.department}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (department === "All departments" || item.department === department);
  });
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-3 shadow-soft md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search specialty or department..." />
        </div>
        <select className="h-10 rounded-lg border border-input bg-white px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/15" value={department} onChange={(event) => setDepartment(event.target.value)}>
          {departments.map((item) => <option key={item}>{item}</option>)}
        </select>
        <Button variant="outline" onClick={() => toast.success("Custom template builder opened")}><Plus className="h-4 w-4" />Custom template</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {specialties.map((item) => {
          const Icon = item.icon;
          const active = selected === item.id;
          return (
            <button className={cn("rounded-xl border bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]", active ? "border-primary ring-2 ring-primary/15" : "border-border")} key={item.id} onClick={() => onSelect(item.id)}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
                <div className="flex gap-1">{item.favorite ? <Star className="h-4 w-4 fill-warning text-warning" /> : null}{item.recentlyUsed ? <Badge tone="info">Recent</Badge> : null}</div>
              </div>
              <div className="mt-3 text-base font-bold text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.department} template</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleMatrix({ findings, specialtyLabel }: { findings: typeof examinationFindings[SpecialtyId]; specialtyLabel: string }) {
  const isCvs = specialtyLabel === "CVS";
  const [selected, setSelected] = React.useState<Record<string, string>>(() => {
    if (isCvs) {
      return {
        "Heart sounds": "Present",
        Murmur: "Absent",
        Pulse: "Present",
        BP: "Present",
        "Peripheral edema": "Absent",
        JVP: "Absent",
      };
    }
    return {
      [findings[0]?.label ?? "Primary finding"]: findings[0]?.severity ?? "Normal",
      [findings[1]?.label ?? "Secondary finding"]: findings[1]?.severity ?? "Normal",
    };
  });
  const [heartSoundDetails, setHeartSoundDetails] = React.useState({
    s1: "Normal",
    s2: "Normal",
    addedSounds: "None",
    rhythm: "Regular",
  });
  const [heartSoundEditing, setHeartSoundEditing] = React.useState(false);
  const [murmurDetails, setMurmurDetails] = React.useState({
    timing: "Systolic",
    grade: "Grade 2",
    site: "Apex",
    radiation: "None",
  });
  const [murmurEditing, setMurmurEditing] = React.useState(false);
  const [cvsDetails, setCvsDetails] = React.useState<Record<string, Record<string, string>>>({
    Pulse: { rate: "86 bpm", rhythm: "Regular", volume: "Normal", equality: "Equal" },
    BP: { reading: "148/92 mmHg", arm: "Right arm", position: "Sitting", method: "Manual" },
    "Peripheral edema": { grade: "Grade 1", site: "Ankle", type: "Pitting", side: "Bilateral" },
    JVP: { level: "Raised", height: "4 cm", position: "45 degrees", waveform: "Normal" },
  });
  const [cvsEditing, setCvsEditing] = React.useState<Record<string, boolean>>({});
  const [genericDetails, setGenericDetails] = React.useState<Record<string, { severity: ClinicalSeverity; note: string }>>(() => Object.fromEntries(findings.slice(0, 6).map((finding) => [finding.label, { severity: finding.severity, note: finding.value }])));
  const [genericEditing, setGenericEditing] = React.useState<Record<string, boolean>>({});
  const cvsStructuredLabels = ["Heart sounds", "Murmur", "Pulse", "BP", "Peripheral edema", "JVP"];

  function selectOption(label: string, option: string) {
    setSelected((current) => ({ ...current, [label]: option }));
    if (label === "Heart sounds") setHeartSoundEditing(false);
    if (label === "Murmur") setMurmurEditing(false);
    if (cvsStructuredLabels.includes(label)) setCvsEditing((current) => ({ ...current, [label]: false }));
  }
  function updateHeartSoundDetail(key: keyof typeof heartSoundDetails, value: string) {
    setHeartSoundDetails((current) => ({ ...current, [key]: value }));
  }
  function updateMurmurDetail(key: keyof typeof murmurDetails, value: string) {
    setMurmurDetails((current) => ({ ...current, [key]: value }));
  }
  function updateCvsDetail(label: string, key: string, value: string) {
    setCvsDetails((current) => ({ ...current, [label]: { ...current[label], [key]: value } }));
  }
  function getCvsFields(label: string) {
    if (label === "Heart sounds") return [
      { label: "S1", key: "s1", value: heartSoundDetails.s1, options: ["Normal", "Loud", "Soft"] },
      { label: "S2", key: "s2", value: heartSoundDetails.s2, options: ["Normal", "Loud", "Soft"] },
      { label: "Added", key: "addedSounds", value: heartSoundDetails.addedSounds, options: ["None", "S3", "S4", "Click", "Rub"] },
      { label: "Rhythm", key: "rhythm", value: heartSoundDetails.rhythm, options: ["Regular", "Irregular"] },
    ];
    if (label === "Murmur") return [
      { label: "Timing", key: "timing", value: murmurDetails.timing, options: ["Systolic", "Diastolic", "Continuous"] },
      { label: "Grade", key: "grade", value: murmurDetails.grade, options: ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"] },
      { label: "Site", key: "site", value: murmurDetails.site, options: ["Apex", "Aortic", "Pulmonary", "Tricuspid"] },
      { label: "Radiation", key: "radiation", value: murmurDetails.radiation, options: ["None", "Axilla", "Carotid", "Back"] },
    ];
    const detail = cvsDetails[label] ?? {};
    const configs: Record<string, Array<{ label: string; key: string; options: string[] }>> = {
      Pulse: [
        { label: "Rate", key: "rate", options: ["60 bpm", "72 bpm", "86 bpm", "100 bpm", "120 bpm"] },
        { label: "Rhythm", key: "rhythm", options: ["Regular", "Irregular"] },
        { label: "Volume", key: "volume", options: ["Normal", "Low", "Bounding"] },
        { label: "Equality", key: "equality", options: ["Equal", "Unequal"] },
      ],
      BP: [
        { label: "Reading", key: "reading", options: ["120/80 mmHg", "140/90 mmHg", "148/92 mmHg", "160/100 mmHg"] },
        { label: "Arm", key: "arm", options: ["Right arm", "Left arm", "Both arms"] },
        { label: "Position", key: "position", options: ["Sitting", "Lying", "Standing"] },
        { label: "Method", key: "method", options: ["Manual", "Automatic"] },
      ],
      "Peripheral edema": [
        { label: "Grade", key: "grade", options: ["Grade 1", "Grade 2", "Grade 3", "Grade 4"] },
        { label: "Site", key: "site", options: ["Ankle", "Pedal", "Pretibial", "Generalized"] },
        { label: "Type", key: "type", options: ["Pitting", "Non-pitting"] },
        { label: "Side", key: "side", options: ["Right", "Left", "Bilateral"] },
      ],
      JVP: [
        { label: "Level", key: "level", options: ["Normal", "Raised"] },
        { label: "Height", key: "height", options: ["Not raised", "3 cm", "4 cm", "5 cm"] },
        { label: "Position", key: "position", options: ["45 degrees", "30 degrees", "Supine"] },
        { label: "Waveform", key: "waveform", options: ["Normal", "Abnormal"] },
      ],
    };
    return (configs[label] ?? []).map((field) => ({ ...field, value: detail[field.key] ?? field.options[0] }));
  }
  function getCvsHelper(label: string) {
    if (label === "Heart sounds") return "S1/S2 and rhythm documented.";
    if (label === "Murmur") return "Timing, grade, site, and radiation documented.";
    if (label === "Pulse") return "Rate, rhythm, volume, and equality documented.";
    if (label === "BP") return "Reading, arm, position, and method documented.";
    if (label === "Peripheral edema") return "Grade, site, type, and side documented.";
    return "Level, height, position, and waveform documented.";
  }
  function isCvsEditing(label: string) {
    if (label === "Heart sounds") return heartSoundEditing;
    if (label === "Murmur") return murmurEditing;
    return Boolean(cvsEditing[label]);
  }
  function toggleCvsEditing(label: string) {
    if (label === "Heart sounds") return setHeartSoundEditing((value) => !value);
    if (label === "Murmur") return setMurmurEditing((value) => !value);
    return setCvsEditing((current) => ({ ...current, [label]: !current[label] }));
  }
  function updateCvsField(label: string, key: string, value: string) {
    if (label === "Heart sounds") return updateHeartSoundDetail(key as keyof typeof heartSoundDetails, value);
    if (label === "Murmur") return updateMurmurDetail(key as keyof typeof murmurDetails, value);
    return updateCvsDetail(label, key, value);
  }
  function updateGenericDetail(label: string, patch: Partial<{ severity: ClinicalSeverity; note: string }>) {
    setGenericDetails((current) => ({ ...current, [label]: { ...current[label], ...patch } }));
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{specialtyLabel} toggle-based clinical matrix</CardTitle>
          <CardDescription>Single-click selection with auto score generation and keyboard-friendly focus states.</CardDescription>
        </div>
        <Badge tone="info">Score auto-updates</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {findings.slice(0, 6).map((finding) => (
          <div className="rounded-lg border border-border bg-surface-muted p-2" key={finding.label}>
            {isCvs && cvsStructuredLabels.includes(finding.label) ? (
              <>
                <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-border bg-surface-muted/70 p-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold text-foreground">{finding.label}</div>
                        <Badge tone={selected[finding.label] === "Present" ? "success" : "danger"}>{selected[finding.label]}</Badge>
                      </div>
                      {selected[finding.label] === "Present" ? <div className="mt-1 text-xs font-medium text-muted-foreground">{getCvsHelper(finding.label)}</div> : null}
                    </div>
                    <div className="grid grid-cols-2 rounded-md border border-border bg-white p-1 sm:w-[240px]">
                      {["Present", "Absent"].map((option) => (
                        <button
                          className={cn(
                            "h-8 rounded px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-ring/20",
                            selected[finding.label] === option && option === "Present" && "bg-success text-white shadow-sm",
                            selected[finding.label] === option && option === "Absent" && "bg-danger text-white shadow-sm",
                            selected[finding.label] !== option && "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                          )}
                          key={option}
                          onClick={() => selectOption(finding.label, option)}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selected[finding.label] === "Present" ? (
                    <div className="p-3">
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {getCvsFields(finding.label).map((field) => (
                          <div className="rounded-lg border border-border bg-surface-muted p-2" key={field.key}>
                            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{field.label}</div>
                            {isCvsEditing(finding.label) ? (
                              <select
                                className="mt-2 h-9 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                                value={field.value}
                                onChange={(event) => updateCvsField(finding.label, field.key, event.target.value)}
                              >
                                {field.options.map((item) => <option key={item}>{item}</option>)}
                              </select>
                            ) : (
                              <div className="mt-1 truncate text-sm font-bold text-foreground">{field.value}</div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" type="button" variant="outline" onClick={() => toggleCvsEditing(finding.label)}>
                          {isCvsEditing(finding.label) ? "Done" : "Edit"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
                        {finding.label} absent.
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-border bg-surface-muted/70 p-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-bold text-foreground">{finding.label}</div>
                        <Badge tone={selected[finding.label] === "Absent" ? "danger" : "success"}>{selected[finding.label] === "Absent" ? "Absent" : "Present"}</Badge>
                      </div>
                      {selected[finding.label] !== "Absent" ? <div className="mt-1 text-xs font-medium text-muted-foreground">Severity and note documented.</div> : null}
                    </div>
                    <div className="grid grid-cols-2 rounded-md border border-border bg-white p-1 sm:w-[240px]">
                      {["Present", "Absent"].map((option) => (
                        <button
                          className={cn(
                            "h-8 rounded px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-ring/20",
                            (selected[finding.label] ?? "Present") !== "Absent" && option === "Present" && "bg-success text-white shadow-sm",
                            selected[finding.label] === "Absent" && option === "Absent" && "bg-danger text-white shadow-sm",
                            !(((selected[finding.label] ?? "Present") !== "Absent" && option === "Present") || (selected[finding.label] === "Absent" && option === "Absent")) && "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                          )}
                          key={option}
                          onClick={() => selectOption(finding.label, option)}
                          type="button"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selected[finding.label] === "Absent" ? (
                    <div className="p-3">
                      <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">{finding.label} absent.</div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <div className="grid gap-2 md:grid-cols-[180px_minmax(0,1fr)]">
                        <div className="rounded-lg border border-border bg-surface-muted p-2">
                          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Severity</div>
                          {genericEditing[finding.label] ? (
                            <select className="mt-2 h-9 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" value={genericDetails[finding.label]?.severity ?? finding.severity} onChange={(event) => updateGenericDetail(finding.label, { severity: event.target.value as ClinicalSeverity })}>
                              {(["Normal", "Mild", "Moderate", "Severe", "Critical"] as ClinicalSeverity[]).map((item) => <option key={item}>{item}</option>)}
                            </select>
                          ) : (
                            <div className="mt-1 text-sm font-bold text-foreground">{genericDetails[finding.label]?.severity ?? finding.severity}</div>
                          )}
                        </div>
                        <div className="rounded-lg border border-border bg-surface-muted p-2">
                          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Finding note</div>
                          {genericEditing[finding.label] ? (
                            <Input className="mt-2 h-9 bg-white font-semibold" value={genericDetails[finding.label]?.note ?? finding.value} onChange={(event) => updateGenericDetail(finding.label, { note: event.target.value })} />
                          ) : (
                            <div className="mt-1 truncate text-sm font-bold text-foreground">{genericDetails[finding.label]?.note ?? finding.value}</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" type="button" variant="outline" onClick={() => setGenericEditing((current) => ({ ...current, [finding.label]: !current[finding.label] }))}>
                          {genericEditing[finding.label] ? "Done" : "Edit"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ExaminationWorkspace({ specialty }: { specialty: SpecialtyId }) {
  const activeSpecialty = clinicalSpecialties.find((item) => item.id === specialty) ?? clinicalSpecialties[0];
  const findings = examinationFindings[specialty] ?? examinationFindings.cvs;
  const defaultNote = examinationDefaultNotes[specialty] ?? examinationDefaultNotes.cvs;
  const visibleFindings = specialty === "cvs" ? findings.filter((item) => item.label !== "Heart sounds") : findings;
  return (
    <div className="space-y-4">
    <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        <ToggleMatrix key={specialty} findings={findings} specialtyLabel={activeSpecialty.label} />
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{activeSpecialty.label} findings and notes</CardTitle>
              <CardDescription>Structured {activeSpecialty.department.toLowerCase()} entries, severity, numeric score fields, and doctor impression in one compact working screen.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {visibleFindings.map((item) => (
                <div className="rounded-lg border border-border bg-white p-3" key={item.label}>
                  <div className="flex items-start justify-between gap-2"><div className="text-sm font-semibold">{item.label}</div><Badge tone={severityTone[item.severity]}>{item.severity}</Badge></div>
                  <div className="mt-1 text-sm text-muted-foreground">{item.value}</div>
                </div>
              ))}
            </div>
            <textarea key={specialty} className="min-h-28 w-full rounded-lg border border-input bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-ring/15" defaultValue={defaultNote} />
            <div className="flex flex-wrap gap-2"><Button variant="outline"><Mic className="h-4 w-4" />Voice typing</Button><Button variant="outline">Insert shortcut</Button><Button>Apply template</Button></div>
          </CardContent>
        </Card>
      </div>
      <div className="min-w-0 space-y-4">
        <ClinicalScorePanel />
        <TrendCard compact />
        <AlertBanner icon={AlertTriangle} tone="warning" title="Risk indicator">NEWS score moderate. Consultant verification recommended before final submit.</AlertBanner>
      </div>
    </div>
    </div>
  );
}

function ClinicalScorePanel() {
  return (
    <Card>
      <CardHeader><CardTitle>Clinical scoring</CardTitle><CardDescription>Auto-calculated risk and red flag state.</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {clinicalScores.map((score) => (
          <div className="rounded-lg border border-border bg-surface-muted p-3" key={score.label}>
            <div className="flex items-center justify-between gap-2"><div className="text-sm font-bold">{score.label}</div><Badge tone={severityTone[score.severity]}>{score.value}</Badge></div>
            <div className="mt-1 text-xs text-muted-foreground">{score.note}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TrendCard({ compact }: { compact?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div><CardTitle>Graph & trend analysis</CardTitle><CardDescription>Vitals, score, recovery, and risk progression.</CardDescription></div>
        {!compact ? <Button size="sm" variant="outline" onClick={() => toast.info("PDF export queued")}><Printer className="h-4 w-4" />PDF</Button> : null}
      </CardHeader>
      <CardContent className={compact ? "h-52 p-3" : "h-80 p-4"}>
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={clinicalTrendData}>
            <CartesianGrid stroke="#e8e5ef" strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fill: "#6f6b80", fontSize: 12 }} />
            <YAxis tick={{ fill: "#6f6b80", fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e3ec" }} />
            <Line dataKey="vitals" dot={false} stroke="#7367f0" strokeWidth={3} />
            <Line dataKey="risk" dot={false} stroke="#f59e0b" strokeWidth={3} />
            <Line dataKey="recovery" dot={false} stroke="#22a06b" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TimelinePanel() {
  return (
    <Card>
      <CardHeader><CardTitle>Clinical history timeline</CardTitle><CardDescription>Date/time-wise entries, previous comparison, and doctor ownership.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {clinicalTimeline.map((item) => (
          <div className="rounded-xl border border-border bg-white p-3 shadow-sm" key={item.id}>
            <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-bold text-foreground">{item.specialty} examination</div><Badge tone={item.status.includes("verified") ? "success" : "info"}>{item.status}</Badge></div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{item.time} • {item.doctor}</div>
            <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
          </div>
        ))}
        <Button className="w-full" variant="outline">Compare visits</Button>
      </CardContent>
    </Card>
  );
}

function BuilderAndReports() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Dynamic assessment builder</CardTitle><CardDescription>Configurable sections, scoring, mandatory rules, and conditional logic.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">{builderFields.map((field) => <button className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-left text-sm font-semibold transition hover:bg-white hover:shadow-sm" key={field}><Plus className="mr-2 inline h-4 w-4 text-primary" />{field}</button>)}</div>
          <AlertBanner icon={ShieldCheck} tone="info" title="Template governance">Reusable templates support specialty, department, doctor, mandatory field, score, and audit-ready edit tracking.</AlertBanner>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Investigation & report linking</CardTitle><CardDescription>Inline preview-ready links for labs, ECG, imaging, and uploaded documents.</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {reportLinks.map((report) => <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted p-3" key={report.name}><div><div className="text-sm font-bold">{report.type} • {report.name}</div><div className="text-xs text-muted-foreground">{report.time}</div></div><Badge tone={report.status.includes("Critical") ? "danger" : "info"}>{report.status}</Badge></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function NotesApprovalArchitecture() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader><CardTitle>Notes & impression</CardTitle><CardDescription>Smart-template ready doctor note surface.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <textarea className="min-h-40 w-full rounded-lg border border-input bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-ring/15" defaultValue="Clinical impression: BP elevation with stable perfusion. Differential diagnosis and follow-up plan to be reviewed with consultant." />
          <div className="flex flex-wrap gap-2"><Button variant="outline"><Mic className="h-4 w-4" />Voice</Button><Button>Save notes</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Approval workflow</CardTitle><CardDescription>Junior doctor entry, consultant verification, audit logs, and digital signature state.</CardDescription></CardHeader>
        <CardContent className="space-y-2">
          {["Junior doctor draft captured", "Consultant verification pending", "Digital signature ready", "Edit history retained"].map((item, index) => <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-muted p-3 text-sm font-semibold" key={item}><CheckCircle2 className={cn("h-4 w-4", index === 1 ? "text-warning" : "text-success")} />{item}</div>)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Backend/API ready</CardTitle><CardDescription>Phase-wise contracts and database structure.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">{backendApis.slice(0, 5).map((api) => <div className="rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold text-muted-foreground" key={api}>{api}</div>)}</div>
          <div className="flex flex-wrap gap-1">{databaseTables.map((table) => <Badge tone="muted" key={table}>{table}</Badge>)}</div>
        </CardContent>
      </Card>
    </div>
  );
}

function MobileTabletOptimization() {
  return (
    <Card>
      <CardHeader><CardTitle>Doctor workflow and mobile/tablet optimization</CardTitle><CardDescription>Low-scroll OPD/IPD rounds flow with touch-friendly actions.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {["Select patient", "Open examination", "Select specialty", "Fill findings", "Auto scoring", "Add notes", "Save draft", "Final submit", "Consultant verification"].map((step, index) => <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm font-semibold" key={step}><span className="mr-2 text-primary">{index + 1}.</span>{step}</div>)}
        <div className="rounded-lg border border-primary/20 bg-primary-soft p-3 text-sm font-semibold text-primary xl:col-span-4">Tablet: collapsible left menu, large touch buttons, sticky patient header, floating save. Mobile: step tabs, swipe navigation, bottom action bar, voice input support.</div>
      </CardContent>
    </Card>
  );
}

type ClinicalActionRow = { time: string; type: string; owner: string; status: string; tone: "success" | "warning" | "danger" | "info" | "muted" };

function ClinicalActionWorkspace({ action, specialty, patient, rows, onAddRow, onOpenExamination }: { action: string; specialty: SpecialtyId; patient: ClinicalPatientContext; rows: ClinicalActionRow[]; onAddRow: (row: ClinicalActionRow) => void; onOpenExamination: () => void }) {
  if (action === "Clinical Examination") return <ExaminationWorkspace specialty={specialty} />;
  return <ClinicalActionForm key={action} action={action} patient={patient} rows={rows} onAddRow={onAddRow} onOpenExamination={onOpenExamination} />;
}

function ClinicalActionForm({ action, patient, rows, onAddRow, onOpenExamination }: { action: string; patient: ClinicalPatientContext; rows: ClinicalActionRow[]; onAddRow: (row: ClinicalActionRow) => void; onOpenExamination: () => void }) {
  const config = clinicalActionConfigs[action] ?? clinicalActionConfigs["Progress Notes"];
  const [fieldValues, setFieldValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(config.fields.map((field) => [field.label, field.value ?? field.options?.[0] ?? ""])),
  );
  const [note, setNote] = React.useState(config.textarea?.value ?? "");
  const addDynamicEntry = (buttonLabel: string) => {
    const primaryField = config.fields[0];
    const type = fieldValues[primaryField.label] || primaryField.value || primaryField.options?.[0] || config.title;
    const status = dynamicStatusForAction(action, buttonLabel, fieldValues);
    onAddRow({
      time: currentClinicalTime(),
      type,
      owner: action === "Nursing Notes" ? "Nursing team" : action === "Reports" ? "Diagnostics" : "Dr. Kavita Rao",
      status: status.status,
      tone: status.tone,
    });
    toast.success(`${buttonLabel} added to ${action}`);
  };
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{config.title}</CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
            <Badge tone={config.badgeTone}>{config.badge}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              {config.fields.map((field) => <ClinicalField key={field.label} field={field} value={fieldValues[field.label] ?? field.value ?? field.options?.[0] ?? ""} onChange={(value) => setFieldValues((current) => ({ ...current, [field.label]: value }))} />)}
            </div>
            {config.textarea ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">{config.textarea.label}</span>
                <textarea className="min-h-32 w-full rounded-xl border border-input bg-white p-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" value={note} onChange={(event) => setNote(event.target.value)} />
              </label>
            ) : null}
            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface-muted p-3">
              {config.actions.map((item, index) => <Button key={item} variant={index === 0 ? "default" : "outline"} onClick={() => addDynamicEntry(item)}>{item}</Button>)}
            </div>
          </CardContent>
        </Card>
        <ActionDataTable rows={rows} />
      </div>
      <div className="space-y-4">
        <ActionPatientContext patient={patient} />
        <Card>
          <CardHeader><CardTitle>Clinical handoff</CardTitle><CardDescription>Connected status for current encounter.</CardDescription></CardHeader>
          <CardContent className="space-y-2">
            {config.handoff.map((item) => <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm"><span className="font-semibold">{item.label}</span><Badge tone={item.tone}>{item.status}</Badge></div>)}
          </CardContent>
        </Card>
        <AlertBanner icon={ShieldCheck} tone="info" title="Production workflow">Autosave, audit log, consultant verification, print, and EMR handoff states are modeled for this workspace.</AlertBanner>
        <Button className="w-full" variant="outline" onClick={onOpenExamination}>Back to examination</Button>
      </div>
    </div>
  );
}

function currentClinicalTime() {
  return `Today ${new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date())}`;
}

function dynamicStatusForAction(action: string, buttonLabel: string, values: Record<string, string>): Pick<ClinicalActionRow, "status" | "tone"> {
  if (buttonLabel.toLowerCase().includes("print") || buttonLabel.toLowerCase().includes("export")) return { status: "Printed", tone: "success" };
  if (buttonLabel.toLowerCase().includes("verification") || buttonLabel.toLowerCase().includes("sign-off")) return { status: "Pending review", tone: "warning" };
  if (action === "Prescription" && values["Pharmacy status"] === "Send to pharmacy") return { status: "Pharmacy queue", tone: "info" };
  if (action === "Vitals" && values["Pain score"] && !["0", "1", "2"].includes(values["Pain score"])) return { status: "Watch", tone: "warning" };
  if (action === "Reports" && values.Status === "Critical") return { status: "Critical", tone: "danger" };
  if (action === "Discharge Summary") return { status: "Draft saved", tone: "info" };
  return { status: "Saved", tone: "success" };
}

type ClinicalFieldConfig = { label: string; value?: string; options?: string[] };

const clinicalActionConfigs: Record<string, {
  title: string;
  description: string;
  badge: string;
  badgeTone: "success" | "warning" | "danger" | "info" | "muted";
  fields: ClinicalFieldConfig[];
  textarea?: { label: string; value: string };
  actions: string[];
  handoff: { label: string; status: string; tone: "success" | "warning" | "danger" | "info" | "muted" }[];
}> = {
  "Progress Notes": {
    title: "Progress Notes",
    description: "Doctor-facing SOAP notes with autosave, review status, and consultant handoff.",
    badge: "Draft active",
    badgeTone: "info",
    fields: [{ label: "Note type", options: ["SOAP note", "Round note", "Procedure note", "Follow-up note"] }, { label: "Priority", options: ["Routine", "Monitor", "Urgent"] }, { label: "Author", value: "Dr. Kavita Rao" }, { label: "Next review", value: "Today 18:00" }],
    textarea: { label: "Clinical note", value: "Subjective: Chest tightness improved. Objective: BP elevated but perfusion stable. Assessment: Continue BP monitoring. Plan: Review labs and adjust medication if trend persists." },
    actions: ["Save progress note", "Send for verification", "Print note"],
    handoff: [{ label: "Autosave", status: "Ready", tone: "success" }, { label: "Consultant review", status: "Pending", tone: "warning" }, { label: "EMR sync", status: "Queued", tone: "info" }],
  },
  Orders: {
    title: "Clinical Orders",
    description: "Medication, lab, radiology, diet, nursing, and procedure orders for the active encounter.",
    badge: "6 order sets",
    badgeTone: "info",
    fields: [{ label: "Order type", options: ["Lab", "Radiology", "Medication", "Nursing", "Diet", "Procedure"] }, { label: "Priority", options: ["Routine", "Urgent", "STAT"] }, { label: "Department", options: ["Laboratory", "Radiology", "Pharmacy", "Nursing"] }, { label: "Start time", value: "Now" }],
    textarea: { label: "Order instructions", value: "Repeat BP charting 4 hourly. CBC, LFT, KFT and ECG before consultant review." },
    actions: ["Place order", "Save order set", "Print requisition"],
    handoff: [{ label: "Lab handoff", status: "Ready", tone: "success" }, { label: "Pharmacy", status: "Pending", tone: "warning" }, { label: "Billing", status: "Connected", tone: "info" }],
  },
  Prescription: {
    title: "Prescription",
    description: "Medication prescription with allergy warnings, dose checks, frequency, duration, and pharmacy handoff.",
    badge: "Allergy alert",
    badgeTone: "warning",
    fields: [{ label: "Drug", value: "Amlodipine" }, { label: "Dose", options: ["2.5 mg", "5 mg", "10 mg"] }, { label: "Frequency", options: ["OD", "BD", "TDS", "SOS"] }, { label: "Duration", value: "7 days" }, { label: "Route", options: ["Oral", "IV", "IM", "Topical"] }, { label: "Pharmacy status", options: ["Draft", "Send to pharmacy", "Hold"] }],
    textarea: { label: "Prescription notes", value: "Avoid Penicillin. Continue antihypertensive therapy and review BP trend." },
    actions: ["Add medicine", "Send to pharmacy", "Print prescription"],
    handoff: [{ label: "Allergy check", status: "Active", tone: "warning" }, { label: "Drug interaction", status: "Clear", tone: "success" }, { label: "Pharmacy queue", status: "Ready", tone: "info" }],
  },
  Vitals: {
    title: "Vitals",
    description: "High-speed vitals entry with trend context and NEWS scoring readiness.",
    badge: "NEWS 4",
    badgeTone: "warning",
    fields: [{ label: "BP", value: "148/92" }, { label: "Pulse", value: "86 bpm" }, { label: "SpO2", value: "97%" }, { label: "Temperature", value: "37.2 C" }, { label: "Respiratory rate", value: "18/min" }, { label: "Pain score", options: ["0", "1", "2", "3", "4", "5", "6+"] }],
    textarea: { label: "Vitals note", value: "BP remains above baseline. No respiratory distress. Continue monitoring." },
    actions: ["Save vitals", "Add to trend", "Notify nurse"],
    handoff: [{ label: "NEWS score", status: "Moderate", tone: "warning" }, { label: "Nursing chart", status: "Updated", tone: "success" }, { label: "Doctor alert", status: "Notified", tone: "info" }],
  },
  Reports: {
    title: "Reports",
    description: "Lab, radiology, ECG, imaging, and document linking with critical value visibility.",
    badge: "3 linked",
    badgeTone: "info",
    fields: [{ label: "Report type", options: ["Lab", "Radiology", "ECG", "Echo", "Uploaded document"] }, { label: "Status", options: ["Available", "Pending", "Critical", "Reviewed"] }, { label: "Date range", value: "Last 7 days" }, { label: "Compare with", options: ["Previous visit", "Previous admission", "None"] }],
    textarea: { label: "Report interpretation", value: "ECG reviewed. Lab values pending final consultant interpretation." },
    actions: ["Link report", "Mark reviewed", "Export PDF"],
    handoff: [{ label: "Critical values", status: "None", tone: "success" }, { label: "Radiology", status: "Pending", tone: "warning" }, { label: "EMR filing", status: "Ready", tone: "info" }],
  },
  "Nursing Notes": {
    title: "Nursing Notes",
    description: "Nursing observation, care tasks, intake-output note, safety checks, and escalation workflow.",
    badge: "Bedside",
    badgeTone: "info",
    fields: [{ label: "Shift", options: ["Morning", "Evening", "Night"] }, { label: "Care level", options: ["Routine", "Close watch", "Critical"] }, { label: "Fall risk", options: ["Low", "Moderate", "High"] }, { label: "Intake/output", value: "Balanced" }],
    textarea: { label: "Nursing observation", value: "Patient comfortable, oriented, BP monitored. No acute distress. Medication administered as per chart." },
    actions: ["Save nursing note", "Escalate", "Print shift note"],
    handoff: [{ label: "Care plan", status: "Active", tone: "success" }, { label: "Escalation", status: "None", tone: "success" }, { label: "Shift handover", status: "Pending", tone: "warning" }],
  },
  "Discharge Summary": {
    title: "Discharge Summary",
    description: "Discharge-ready diagnosis, course, medication, follow-up, advice, and consultant sign-off.",
    badge: "Not finalized",
    badgeTone: "warning",
    fields: [{ label: "Discharge type", options: ["Routine", "DAMA", "Transfer", "Death summary"] }, { label: "Primary diagnosis", value: "Hypertension follow-up" }, { label: "Follow-up", value: "7 days" }, { label: "Consultant sign-off", options: ["Pending", "Approved"] }],
    textarea: { label: "Summary", value: "Patient clinically stable. BP monitoring advised. Follow up with cardiology OPD with reports." },
    actions: ["Save summary", "Request sign-off", "Print discharge"],
    handoff: [{ label: "Pharmacy clearance", status: "Pending", tone: "warning" }, { label: "Billing clearance", status: "Pending", tone: "warning" }, { label: "Consultant", status: "Review", tone: "info" }],
  },
};

function ClinicalField({ field, value, onChange }: { field: ClinicalFieldConfig; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1.5 rounded-xl border border-border bg-white p-3 shadow-soft">
      <span className="text-xs font-bold text-muted-foreground">{field.label}</span>
      {field.options ? (
        <select className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" value={value} onChange={(event) => onChange(event.target.value)}>
          {field.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      ) : <Input className="h-10 font-semibold" value={value} placeholder={field.label} onChange={(event) => onChange(event.target.value)} />}
    </label>
  );
}

function ActionDataTable({ rows }: { rows: ClinicalActionRow[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>Recent activity</CardTitle><CardDescription>Audit-ready entries for this clinical workflow.</CardDescription></CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-surface-muted text-xs text-muted-foreground"><tr>{["Time", "Type", "Owner", "Status", "Action"].map((head) => <th className="px-3 py-3 text-left font-semibold" key={head}>{head}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr className="border-t border-border" key={`${row.time}-${row.type}`}><td className="px-3 py-3 font-semibold">{row.time}</td><td className="px-3 py-3">{row.type}</td><td className="px-3 py-3">{row.owner}</td><td className="px-3 py-3"><Badge tone={row.tone}>{row.status}</Badge></td><td className="px-3 py-3"><Button size="sm" variant="outline">Open</Button></td></tr>)}</tbody>
        </table>
      </CardContent>
    </Card>
  );
}

const actionRows: Record<string, ClinicalActionRow[]> = {
  "Progress Notes": [{ time: "Today 10:22", type: "SOAP note", owner: "Dr. Kavita Rao", status: "Draft", tone: "info" }, { time: "Yesterday 18:10", type: "Round note", owner: "Dr. Aman Verma", status: "Verified", tone: "success" }],
  Orders: [{ time: "Today 10:30", type: "CBC, LFT, ECG", owner: "Dr. Kavita Rao", status: "Ordered", tone: "info" }, { time: "Today 09:55", type: "BP charting", owner: "Nursing", status: "Active", tone: "success" }],
  Prescription: [{ time: "Today 10:35", type: "Amlodipine", owner: "Dr. Kavita Rao", status: "Draft", tone: "warning" }, { time: "Yesterday 19:00", type: "Pantoprazole", owner: "Dr. Aman Verma", status: "Dispensed", tone: "success" }],
  Vitals: [{ time: "Today 10:40", type: "BP/Pulse/SpO2", owner: "Nurse Anika", status: "Moderate", tone: "warning" }, { time: "Today 06:00", type: "Morning vitals", owner: "Nurse Dev", status: "Stable", tone: "success" }],
  Reports: [{ time: "Today 09:50", type: "ECG", owner: "Diagnostics", status: "Reviewed", tone: "success" }, { time: "Today 10:05", type: "CBC", owner: "Laboratory", status: "Pending", tone: "warning" }],
  "Nursing Notes": [{ time: "Today 11:00", type: "Shift note", owner: "Nurse Anika", status: "Saved", tone: "success" }, { time: "Today 08:00", type: "Medication note", owner: "Nurse Dev", status: "Completed", tone: "success" }],
  "Discharge Summary": [{ time: "Today 11:15", type: "Draft summary", owner: "Dr. Kavita Rao", status: "Pending", tone: "warning" }, { time: "Yesterday 17:00", type: "Follow-up advice", owner: "Dr. Aman Verma", status: "Ready", tone: "info" }],
};

function ActionPatientContext({ patient }: { patient: ClinicalPatientContext }) {
  return (
    <Card>
      <CardHeader><CardTitle>Patient context</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {[["Patient", patient.name], ["UHID", patient.uhid], ["Encounter", patient.encounter], ["Ward/Bed", patient.wardBed], ["Consultant", patient.consultant]].map(([label, value]) => <div className="flex justify-between gap-3 border-b border-border py-1.5 last:border-0" key={label}><span className="text-xs font-semibold text-muted-foreground">{label}</span><span className="text-right font-semibold">{value}</span></div>)}
      </CardContent>
    </Card>
  );
}

type ClinicalExaminationPageProps = {
  embedded?: boolean;
  initialPatientId?: string;
};

export function ClinicalExaminationPage({ embedded = false, initialPatientId }: ClinicalExaminationPageProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [embeddedPatientId, setEmbeddedPatientId] = React.useState(initialPatientId);
  React.useEffect(() => {
    setEmbeddedPatientId(initialPatientId);
  }, [initialPatientId]);

  const requestedPatientId = embedded ? (embeddedPatientId ?? mockPatients[0]?.id) : (searchParams.get("patientId") ?? initialPatientId ?? mockPatients[0]?.id);
  const selectedPatientRecord = mockPatients.find((patient) => patient.id === requestedPatientId) ?? mockPatients[0];
  const selectedPatient = clinicalPatientFromRecord(selectedPatientRecord);
  const [specialty, setSpecialty] = React.useState<SpecialtyId>("cvs");
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [activeAction, setActiveAction] = React.useState("Clinical Examination");
  const [inlineSpecialty, setInlineSpecialty] = React.useState<SpecialtyId | null>(null);
  const [actionActivity, setActionActivity] = React.useState<Record<string, ClinicalActionRow[]>>(actionRows);
  const inlineExamRef = React.useRef<HTMLDivElement | null>(null);
  const selectPatient = React.useCallback(
    (patientId: string) => {
      if (embedded) {
        setEmbeddedPatientId(patientId);
        return;
      }
      router.push(`/clinical-examination?patientId=${patientId}`);
    },
    [embedded, router],
  );
  const openSpecialty = (id: SpecialtyId) => {
    setSpecialty(id);
    setInlineSpecialty(id);
    setActiveAction("Clinical Examination");
    window.setTimeout(() => inlineExamRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    toast.success(`${clinicalSpecialties.find((item) => item.id === id)?.label ?? "Specialty"} examination opened`);
  };
  const openAction = (action: string) => {
    setActiveAction(action);
    if (action === "Clinical Examination") {
      setActiveTab("dashboard");
      setInlineSpecialty(null);
      toast.success(`${action} dashboard opened`);
      return;
    }
    setActiveTab("action");
    toast.success(`${action} opened`);
  };
  const addActionRow = (action: string, row: ClinicalActionRow) => {
    setActionActivity((current) => ({ ...current, [action]: [row, ...(current[action] ?? [])] }));
  };
  return (
    <PageMotion>
      <PatientHeaderStrip patient={selectedPatient} selectedPatientId={selectedPatientRecord.id} onPatientChange={selectPatient} />
      <QuickActions active={activeAction} onSelect={openAction} />
      <SummaryCards />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white shadow-sm">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="specialty">Specialty</TabsTrigger>
          <TabsTrigger value="graphs">Graphs</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className={cn("gap-4", inlineSpecialty ? "space-y-4" : "grid xl:grid-cols-[minmax(0,1fr)_360px]")}>
          <div className="space-y-4">
            <SpecialtyPicker selected={specialty} onSelect={openSpecialty} />
            {inlineSpecialty ? <div ref={inlineExamRef} className="scroll-mt-24"><ExaminationWorkspace specialty={inlineSpecialty} /></div> : null}
          </div>
          {!inlineSpecialty ? <TimelinePanel /> : null}
        </TabsContent>
        <TabsContent value="specialty" className="space-y-4">
          <SpecialtyPicker selected={specialty} onSelect={openSpecialty} />
          {inlineSpecialty ? <div ref={inlineExamRef} className="scroll-mt-24"><ExaminationWorkspace specialty={inlineSpecialty} /></div> : null}
        </TabsContent>
        <TabsContent value="graphs" className="space-y-4"><TrendCard /><ClinicalScorePanel /></TabsContent>
        <TabsContent value="action"><ClinicalActionWorkspace action={activeAction} specialty={specialty} patient={selectedPatient} rows={actionActivity[activeAction] ?? []} onAddRow={(row) => addActionRow(activeAction, row)} onOpenExamination={() => openAction("Clinical Examination")} /></TabsContent>
      </Tabs>
      <div className="fixed inset-x-3 bottom-3 z-30 flex gap-2 rounded-xl border border-border bg-white/95 p-2 shadow-[0_16px_40px_rgba(39,37,54,0.18)] backdrop-blur md:hidden">
        {["Exam", "Scores", "Notes", "Save"].map((item, index) => <Button className="flex-1" key={item} size="sm" variant={index === 3 ? "default" : "outline"}>{item}</Button>)}
      </div>
      {embedded ? (
        <div className="sticky bottom-3 z-20 flex justify-end rounded-xl border border-border bg-white/95 p-2 shadow-sm backdrop-blur">
          <Button onClick={() => toast.success("Clinical examination saved as draft")}>
            <Save className="h-4 w-4" />
            Final submit
          </Button>
        </div>
      ) : (
        <StickyActionBar onSave={() => toast.success("Clinical examination saved as draft")} saveLabel="Final submit" />
      )}
    </PageMotion>
  );
}
