"use client";

import * as React from "react";
import { CheckCircle2, ChevronRight, ClipboardCheck, Clock3, FilePenLine, ListChecks, Stethoscope, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ProgressNoteTone = "blue" | "orange" | "red";

type ProgressNotePatient = {
  id: number;
  name: string;
  bed: string;
  diagnosis: string;
  hr: { value: number };
  spo2: { value: number };
  abps: { value: number };
  abpd: { value: number };
  temperature: { value: string };
};

type ProgressNoteRapidReviewPatient = {
  ageGender?: string;
  bed?: string;
  consultant?: string;
  uhid?: string;
  ward?: string;
};

type ProgressNoteKind = "doctor" | "nurse" | "care-plan";

type ProgressNote = {
  id: string;
  kind: ProgressNoteKind;
  timestamp: string;
  author: string;
  designation: string;
  status: "Signed" | "Reviewed" | "Draft";
  priority: "Routine" | "Watch" | "Urgent";
  title: string;
  subjective?: string;
  objective: string;
  assessment: string;
  plan: string;
  acknowledgedBy?: string;
};

type ProgressNotesPanelProps = {
  patient: ProgressNotePatient;
  rapidReviewPatient?: ProgressNoteRapidReviewPatient;
  tone: ProgressNoteTone;
  compact?: boolean;
};

export function ProgressNotesPanel({ compact = false, patient, rapidReviewPatient, tone }: ProgressNotesPanelProps) {
  const [activeKind, setActiveKind] = React.useState<ProgressNoteKind>("doctor");
  const [draftKind, setDraftKind] = React.useState<ProgressNoteKind | null>(null);
  const [draftText, setDraftText] = React.useState("");
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);
  const baseNotes = React.useMemo(() => buildProgressNotes(patient, rapidReviewPatient, tone), [patient, rapidReviewPatient, tone]);
  const [savedNotes, setSavedNotes] = React.useState<ProgressNote[]>([]);
  const notes = React.useMemo(() => [...savedNotes, ...baseNotes], [baseNotes, savedNotes]);
  const visibleNotes = notes.filter((note) => note.kind === activeKind);
  const doctorCount = notes.filter((note) => note.kind === "doctor").length;
  const nurseCount = notes.filter((note) => note.kind === "nurse").length;
  const carePlanCount = notes.filter((note) => note.kind === "care-plan").length;
  const latestNote = visibleNotes[0];
  const uhid = rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`;
  const wardBed = rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed;
  const toneLabel = tone === "red" ? "Urgent review" : tone === "orange" ? "Watch" : "Stable";
  const selectedNote = visibleNotes.find((note) => note.id === selectedNoteId) ?? latestNote;

  function openDraft(kind: ProgressNoteKind) {
    setActiveKind(kind);
    setDraftKind(kind);
    setDraftText("");
  }

  function saveDraft() {
    if (!draftKind || !draftText.trim()) return;

    setSavedNotes((current) => [
      createSavedProgressNote({
        kind: draftKind,
        patient,
        rapidReviewPatient,
        text: draftText.trim(),
        tone,
      }),
      ...current,
    ]);
    setActiveKind(draftKind);
    setDraftKind(null);
    setDraftText("");
  }

  React.useEffect(() => {
    setSavedNotes([]);
    setDraftKind(null);
    setDraftText("");
    setSelectedNoteId(null);
  }, [patient.id]);

  React.useEffect(() => {
    if (!visibleNotes.length) {
      setSelectedNoteId(null);
      return;
    }

    if (!selectedNoteId || !visibleNotes.some((note) => note.id === selectedNoteId)) {
      setSelectedNoteId(visibleNotes[0].id);
    }
  }, [selectedNoteId, visibleNotes]);

  return (
    <Card className="overflow-hidden rounded-lg border-border bg-white shadow-sm">
      <div className="border-b border-border bg-gradient-to-b from-white to-slate-50 px-4 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-950">Clinical Progress Notes</h2>
              <Badge tone={tone === "red" ? "danger" : tone === "orange" ? "warning" : "success"}>{toneLabel}</Badge>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
              <span>{patient.name}</span>
              <span>{uhid}</span>
              <span>{wardBed}</span>
              <span>{patient.diagnosis}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ProgressMetric label="HR" value={`${patient.hr.value} bpm`} />
            <ProgressMetric label="SpO2" value={`${patient.spo2.value}%`} />
            <ProgressMetric label="BP" value={`${patient.abps.value}/${patient.abpd.value}`} />
            <ProgressMetric label="Temp" value={`${patient.temperature.value} C`} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex w-full rounded-md border border-slate-200 bg-slate-100 p-1 md:w-auto">
            <ProgressNoteTab active={activeKind === "doctor"} count={doctorCount} icon={Stethoscope} label="Doctor Note" onClick={() => setActiveKind("doctor")} />
            <ProgressNoteTab active={activeKind === "care-plan"} count={carePlanCount} icon={ListChecks} label="Care Plan" onClick={() => setActiveKind("care-plan")} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant={draftKind === "doctor" ? "default" : "outline"}
              onClick={() => openDraft("doctor")}
            >
              <FilePenLine className="h-4 w-4" />
              Add Doctor Note
            </Button>
            <Button
              size="sm"
              type="button"
              variant={draftKind === "care-plan" ? "default" : "outline"}
              onClick={() => openDraft("care-plan")}
            >
              <ListChecks className="h-4 w-4" />
              Add Care Plan
            </Button>
          </div>
        </div>

        {draftKind ? (
          <ProgressNoteDraft
            kind={draftKind}
            onCancel={() => {
              setDraftKind(null);
              setDraftText("");
            }}
            onSave={saveDraft}
            patientName={patient.name}
            text={draftText}
            onTextChange={setDraftText}
          />
        ) : null}
      </div>

      <CardContent className={cn("overflow-y-auto bg-slate-50 p-4", compact ? "max-h-[70dvh]" : "max-h-[68dvh]")}>
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {activeKind === "doctor" ? "Doctor Notes" : "Care Plans"}
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 shadow-sm">
                {visibleNotes.length} item{visibleNotes.length === 1 ? "" : "s"}
              </span>
            </div>
            {visibleNotes.map((note) => (
              <ProgressNoteCard
                active={selectedNote?.id === note.id}
                key={note.id}
                note={note}
                onClick={() => setSelectedNoteId(note.id)}
              />
            ))}
          </div>

          <div className="min-w-0">
            {selectedNote ? (
              <ProgressNoteDetail note={selectedNote} />
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-semibold text-slate-500">
                No notes available.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressNoteDraft({
  kind,
  onCancel,
  onSave,
  onTextChange,
  patientName,
  text,
}: {
  kind: ProgressNoteKind;
  onCancel: () => void;
  onSave: () => void;
  onTextChange: (value: string) => void;
  patientName: string;
  text: string;
}) {
  const label = kind === "doctor" ? "Doctor Note" : kind === "nurse" ? "Nurse Note" : "Care Plan";

  return (
    <div className="mt-3 rounded-lg border border-primary/25 bg-primary-soft/60 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-bold text-foreground">Add {label}</div>
          <div className="text-xs font-medium text-muted-foreground">Drafting {label.toLowerCase()} for {patientName}</div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!text.trim()} size="sm" type="button" onClick={onSave}>
            Save Draft
          </Button>
        </div>
      </div>
      <textarea
        className="mt-3 min-h-24 w-full resize-y rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/20"
        onChange={(event) => onTextChange(event.target.value)}
        placeholder={
          kind === "doctor"
            ? "Enter assessment, treatment plan, and review instructions..."
            : kind === "nurse"
              ? "Enter bedside observation, care provided, and handover plan..."
              : "Enter goals, interventions, monitoring schedule, and escalation plan..."
        }
        value={text}
      />
    </div>
  );
}

function ProgressMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="text-[10px] font-bold uppercase text-slate-500">{label}</div>
      <div className="mt-0.5 whitespace-nowrap text-sm font-extrabold text-slate-950">{value}</div>
    </div>
  );
}

function ProgressNoteTab({
  active,
  count,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon: typeof ClipboardCheck;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-bold transition md:flex-none",
        active ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:bg-white/80 hover:text-slate-950",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
      <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-primary-soft text-primary" : "bg-white text-slate-500")}>{count}</span>
    </button>
  );
}

function ProgressNoteCard({ active, note, onClick }: { active: boolean; note: ProgressNote; onClick: () => void }) {
  const excerpt = note.subjective ?? note.assessment;

  return (
    <button
      className={cn(
        "group w-full rounded-lg border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        active ? "border-primary ring-2 ring-primary/10" : "border-slate-200",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", priorityPillClass(note.priority))}>{note.priority}</span>
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", statusPillClass(note.status))}>
              <CheckCircle2 className="h-3 w-3" />
              {note.status}
            </span>
          </div>
          <div>
            <h3 className="truncate text-sm font-extrabold text-slate-950">{note.title}</h3>
            <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-500">{excerpt}</p>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <UserRound className="h-3.5 w-3.5" />
              {note.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {note.timestamp}
            </span>
          </div>
        </div>
        <ChevronRight className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-primary", active && "text-primary")} />
      </div>
    </button>
  );
}

function ProgressNoteDetail({ note }: { note: ProgressNote }) {
  return (
    <article className={cn("overflow-hidden rounded-lg border bg-white shadow-sm", priorityBorderClass(note.priority))}>
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-950">{note.title}</h3>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", priorityPillClass(note.priority))}>{note.priority}</span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold", statusPillClass(note.status))}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              {note.status}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {note.author}
            </span>
            <span>{note.designation}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1">
            <Clock3 className="h-3.5 w-3.5" />
            {note.timestamp}
          </span>
        </div>
      </div>

      <div className="grid gap-x-6 gap-y-4 p-5 md:grid-cols-2">
        {note.subjective ? <ProgressTextBlock label="Subjective" value={note.subjective} /> : null}
        <ProgressTextBlock label="Objective" value={note.objective} />
        <ProgressTextBlock label="Assessment" value={note.assessment} />
        <ProgressTextBlock label="Plan" value={note.plan} />
      </div>
      {note.acknowledgedBy ? (
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500">
          Acknowledged by: <span className="text-slate-950">{note.acknowledgedBy}</span>
        </div>
      ) : null}
    </article>
  );
}

function ProgressTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{value}</p>
    </div>
  );
}

function priorityBorderClass(priority: ProgressNote["priority"]) {
  if (priority === "Urgent") return "border-l-4 border-l-danger border-border";
  if (priority === "Watch") return "border-l-4 border-l-warning border-border";
  return "border-border";
}

function priorityPillClass(priority: ProgressNote["priority"]) {
  if (priority === "Urgent") return "bg-danger/10 text-danger";
  if (priority === "Watch") return "bg-warning/10 text-warning";
  return "bg-info/10 text-info";
}

function statusPillClass(status: ProgressNote["status"]) {
  if (status === "Signed") return "bg-success/10 text-success";
  if (status === "Reviewed") return "bg-info/10 text-info";
  return "bg-warning/10 text-warning";
}

function createSavedProgressNote({
  kind,
  patient,
  rapidReviewPatient,
  text,
  tone,
}: {
  kind: ProgressNoteKind;
  patient: ProgressNotePatient;
  rapidReviewPatient?: ProgressNoteRapidReviewPatient;
  text: string;
  tone: ProgressNoteTone;
}): ProgressNote {
  const now = new Date();
  const timestamp = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isDoctor = kind === "doctor";
  const isCarePlan = kind === "care-plan";
  const doctor = tone === "red" ? "Dr. Amandeep Singh" : tone === "orange" ? "Dr. Meera Rao" : "Dr. Super Admin";
  const nurse = tone === "red" ? "Nurse Jason Abbott" : tone === "orange" ? "Nurse Priya Menon" : "Nurse Super Admin";
  const author = isDoctor ? rapidReviewPatient?.consultant ?? doctor : isCarePlan ? "Care Team" : nurse;

  return {
    id: `${kind}-${patient.id}-${now.getTime()}`,
    kind,
    timestamp,
    author,
    designation: isDoctor ? "Consultant Doctor" : isCarePlan ? "Multidisciplinary Care Plan" : "Primary Nurse",
    status: "Draft",
    priority: tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Routine",
    title: isDoctor ? "Doctor Progress Note" : isCarePlan ? "Care Plan" : "Nurse Progress Note",
    objective: text,
    assessment: isDoctor
      ? "Doctor note saved for clinical review and treatment continuity."
      : isCarePlan
        ? "Care plan saved for team alignment and bedside execution."
        : "Nurse note saved for bedside care continuity and shift handover.",
    plan: isDoctor
      ? "Review, sign, and communicate updated orders to the care team."
      : isCarePlan
        ? "Track planned interventions, monitor outcomes, and update during rounds."
        : "Continue assigned care plan and escalate changes as per protocol.",
    acknowledgedBy: isDoctor || isCarePlan ? nurse : rapidReviewPatient?.consultant ?? doctor,
  };
}

function buildProgressNotes(patient: ProgressNotePatient, rapidReviewPatient: ProgressNoteRapidReviewPatient | undefined, tone: ProgressNoteTone): ProgressNote[] {
  const vitalsSummary = `HR ${patient.hr.value} bpm, SpO2 ${patient.spo2.value}%, BP ${patient.abps.value}/${patient.abpd.value}, Temp ${patient.temperature.value} C.`;
  const doctor = tone === "red" ? "Dr. Amandeep Singh" : tone === "orange" ? "Dr. Meera Rao" : "Dr. Super Admin";
  const nurse = tone === "red" ? "Nurse Jason Abbott" : tone === "orange" ? "Nurse Priya Menon" : "Nurse Super Admin";
  const consultant = rapidReviewPatient?.consultant ?? doctor;
  const urgentPlan = tone === "red" ? "Continue close monitoring, repeat vitals every 15 minutes, and escalate any deterioration immediately." : "Continue current care plan and repeat assessment in the next scheduled round.";

  return [
    {
      id: "doctor-1",
      kind: "doctor",
      timestamp: "17/06/2026 06:50 PM",
      author: consultant,
      designation: "Consultant Doctor",
      status: "Signed",
      priority: tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Routine",
      title: "Doctor Progress Note",
      subjective: `${patient.name} reviewed at bedside for ${patient.diagnosis}. Current complaints and nursing handover discussed with care team.`,
      objective: vitalsSummary,
      assessment: tone === "red" ? "Patient remains clinically high risk and requires active doctor-led monitoring." : "Patient is clinically stable with planned IPD observation.",
      plan: urgentPlan,
      acknowledgedBy: nurse,
    },
    {
      id: "doctor-2",
      kind: "doctor",
      timestamp: "17/06/2026 02:40 PM",
      author: "Dr. Kavita Rao",
      designation: "Duty Doctor",
      status: "Reviewed",
      priority: "Routine",
      title: "Treatment Review",
      subjective: "Medication response reviewed. No new drug intolerance documented by bedside nursing team.",
      objective: "Airway, breathing, circulation, pain score, and medication chart reviewed.",
      assessment: "Treatment plan remains appropriate for current diagnosis and observation status.",
      plan: "Continue medicines as ordered, review reports when available, and update progress note after next round.",
      acknowledgedBy: "Nurse Super Admin",
    },
    {
      id: "nurse-1",
      kind: "nurse",
      timestamp: "17/06/2026 06:45 PM",
      author: nurse,
      designation: "Primary Nurse",
      status: "Signed",
      priority: tone === "red" ? "Urgent" : "Watch",
      title: "Nurse Progress Note",
      objective: `Evening assessment completed. ${vitalsSummary}`,
      assessment: `${patient.diagnosis}. Patient safety, lines, medication, intake/output, and comfort needs reviewed.`,
      plan: "Maintain fall precautions, continue ordered monitoring, update doctor for abnormal vitals, and document next handover.",
      acknowledgedBy: consultant,
    },
    {
      id: "nurse-2",
      kind: "nurse",
      timestamp: "17/06/2026 02:15 PM",
      author: "Nurse Super Admin",
      designation: "Shift Nurse",
      status: "Reviewed",
      priority: "Routine",
      title: "Shift Care Update",
      objective: "Medication round completed. Bedside hygiene, diet tolerance, and comfort checked.",
      assessment: "Patient tolerated routine care during the shift. No new adverse event reported.",
      plan: "Repeat vitals as scheduled and complete handover before shift close.",
      acknowledgedBy: "Dr. Kavita Rao",
    },
    {
      id: "care-plan-1",
      kind: "care-plan",
      timestamp: "17/06/2026 07:00 PM",
      author: "Care Team",
      designation: "Multidisciplinary Care Plan",
      status: "Reviewed",
      priority: tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Routine",
      title: "Care Plan",
      objective: `Maintain coordinated care for ${patient.name}. ${vitalsSummary}`,
      assessment: `${patient.diagnosis}. Current care priorities include vitals monitoring, medication compliance, intake/output review, and timely escalation.`,
      plan: "Continue scheduled monitoring, complete nursing interventions, review pending reports, and update doctor during the next clinical round.",
      acknowledgedBy: consultant,
    },
  ];
}
