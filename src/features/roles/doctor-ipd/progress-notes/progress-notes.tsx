"use client";

import * as React from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  MoreVertical,
  Plus,
  Printer,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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

type NoteFormState = {
  noteType: string;
  visitTime: string;
  subjective: string;
  bp: string;
  hr: string;
  rr: string;
  temp: string;
  objectiveExam: string;
  assessment: string;
  plan: string;
};

type ProgressNotesPanelProps = {
  patient: ProgressNotePatient;
  rapidReviewPatient?: ProgressNoteRapidReviewPatient;
  tone: ProgressNoteTone;
  compact?: boolean;
};

export function ProgressNotesPanel({
  compact = false,
  patient,
  rapidReviewPatient,
  tone,
}: ProgressNotesPanelProps) {
  const [activeKind, setActiveKind] = React.useState<ProgressNoteKind>("doctor");
  const [drawerKind, setDrawerKind] = React.useState<ProgressNoteKind | null>(null);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [fullNote, setFullNote] = React.useState<ProgressNote | null>(null);
  const [selectedNoteId, setSelectedNoteId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<NoteFormState>(() => createInitialForm(patient));
  const baseNotes = React.useMemo(
    () => buildProgressNotes(patient, rapidReviewPatient, tone),
    [patient, rapidReviewPatient, tone],
  );
  const [savedNotes, setSavedNotes] = React.useState<ProgressNote[]>([]);
  const notes = React.useMemo(() => [...savedNotes, ...baseNotes], [baseNotes, savedNotes]);
  const visibleNotes = notes.filter((note) => note.kind === activeKind);
  const selectedNote = visibleNotes.find((note) => note.id === selectedNoteId) ?? visibleNotes[0];
  const uhid = rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`;
  const wardBed = rapidReviewPatient
    ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}`
    : patient.bed;

  function openDrawer(kind: ProgressNoteKind) {
    setActiveKind(kind);
    setDrawerKind(kind);
    setEditingNoteId(null);
    setForm(createInitialForm(patient, kind));
  }

  function openEdit(note: ProgressNote) {
    setActiveKind(note.kind);
    setDrawerKind(note.kind);
    setEditingNoteId(note.id);
    setForm(createFormFromNote(note, patient));
  }

  function updateForm(field: keyof NoteFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveDraft() {
    if (!drawerKind || !hasDraftContent(form)) return;

    const nextNote = createSavedProgressNote({
      form,
      kind: drawerKind,
      patient,
      rapidReviewPatient,
      tone,
      existingNote: editingNoteId ? notes.find((note) => note.id === editingNoteId) : undefined,
    });

    setSavedNotes((current) => {
      if (editingNoteId && current.some((note) => note.id === editingNoteId)) {
        return current.map((note) => (note.id === editingNoteId ? nextNote : note));
      }
      return [nextNote, ...current];
    });
    setActiveKind(drawerKind);
    setDrawerKind(null);
    setEditingNoteId(null);
  }

  React.useEffect(() => {
    setSavedNotes([]);
    setDrawerKind(null);
    setEditingNoteId(null);
    setFullNote(null);
    setSelectedNoteId(null);
    setForm(createInitialForm(patient));
  }, [patient.id, patient]);

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
    <div
      className={cn(
        "text-[#242735]",
        compact ? "min-h-0 rounded-lg bg-white" : "min-h-[680px] bg-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto",
          compact ? "max-w-none px-0 py-0" : "max-w-[1540px] px-5 py-4 sm:px-6",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-3 border border-border bg-white shadow-sm lg:flex-row lg:items-center lg:justify-between",
            compact ? "rounded-t-lg border-x-0 border-t-0 px-4 py-3" : "rounded-xl px-4 py-3",
          )}
        >
          <div className="overflow-x-auto">
            <div className="inline-flex min-w-max gap-1 rounded-lg bg-surface-muted/70 p-1">
              <ProgressListTab
                active={activeKind === "doctor"}
                compact={compact}
                label="Doctor Notes"
                onClick={() => setActiveKind("doctor")}
              />
              <ProgressListTab
                active={activeKind === "care-plan"}
                compact={compact}
                label="Care Plans"
                onClick={() => setActiveKind("care-plan")}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              className={cn(
                "rounded-md bg-primary font-extrabold text-primary-foreground shadow-sm hover:bg-primary/90",
                compact ? "h-10 px-4 text-sm" : "h-12 px-6 text-base",
              )}
              type="button"
              onClick={() => openDrawer("doctor")}
            >
              <Plus className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
              Doctor Note
            </Button>
            <Button
              className={cn(
                "rounded-md border-[#8e94a4] font-extrabold text-[#202533]",
                compact ? "h-10 px-4 text-sm" : "h-12 px-5 text-base",
              )}
              type="button"
              variant="outline"
              onClick={() => openDrawer("care-plan")}
            >
              <Plus className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
              Care Plan
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "mx-auto grid gap-3",
            compact ? "max-h-[56dvh] max-w-none overflow-y-auto px-4 py-4" : "mt-4 max-w-[1360px]",
          )}
        >
          {visibleNotes.map((note, index) => (
            <ProgressTimelineNote
              active={selectedNote?.id === note.id}
              compact={compact}
              key={note.id}
              note={note}
              onClick={() => setSelectedNoteId(note.id)}
              onEdit={() => openEdit(note)}
              onPrint={() => printProgressNote(note, patient, uhid, wardBed)}
              onView={() => setFullNote(note)}
              primary={index === 0}
            />
          ))}
        </div>
      </div>

      {drawerKind ? (
        <ProgressNoteDrawer
          form={form}
          isEditing={Boolean(editingNoteId)}
          kind={drawerKind}
          onChange={updateForm}
          onClose={() => setDrawerKind(null)}
          onSave={saveDraft}
          patient={patient}
          uhid={uhid}
          wardBed={wardBed}
        />
      ) : null}

      {fullNote ? (
        <ProgressNoteFullView
          note={fullNote}
          onClose={() => setFullNote(null)}
          onEdit={() => {
            setFullNote(null);
            openEdit(fullNote);
          }}
          onPrint={() => printProgressNote(fullNote, patient, uhid, wardBed)}
          patient={patient}
          uhid={uhid}
          wardBed={wardBed}
        />
      ) : null}
    </div>
  );
}

function PatientProgressHeader({
  compact,
  patient,
  uhid,
  wardBed,
}: {
  compact: boolean;
  patient: ProgressNotePatient;
  uhid: string;
  wardBed: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-[#b8becb] bg-white shadow-sm",
        compact ? "mx-4 mt-4 px-4 py-4" : "mt-4 px-5 py-5",
      )}
    >
      <div
        className={cn(
          "grid gap-4 lg:items-center",
          compact
            ? "xl:grid-cols-[minmax(210px,1fr)_minmax(150px,0.6fr)_minmax(190px,0.8fr)_minmax(270px,1fr)]"
            : "xl:grid-cols-[minmax(240px,1fr)_minmax(180px,0.7fr)_minmax(220px,0.9fr)_minmax(320px,1.25fr)]",
        )}
      >
        <div className={cn("flex min-w-0 items-center", compact ? "gap-3" : "gap-4")}>
          <div
            className={cn(
              "grid shrink-0 place-items-center rounded-full bg-[#d9e0f3] font-extrabold text-[#0f285a]",
              compact ? "h-12 w-12 text-lg" : "h-16 w-16 text-xl",
            )}
          >
            {initials(patient.name)}
          </div>
          <div className="min-w-0">
            <div
              className={cn(
                "truncate font-extrabold text-[#191d27]",
                compact ? "text-lg" : "text-xl",
              )}
            >
              {patient.name}
            </div>
            <div className={cn("mt-1 font-bold text-[#4e5362]", compact ? "text-sm" : "text-base")}>
              MRN: {uhid} - 45/M
            </div>
          </div>
        </div>

        <DividerBlock compact={compact} label="Ward / Bed" value={wardBed} />
        <DividerBlock compact={compact} label="Diagnosis" value={patient.diagnosis} strong />

        <div className="min-w-0">
          <div className="text-xs font-extrabold uppercase text-[#202533]">Current Vitals</div>
          <div className={cn("mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4", !compact && "lg:gap-3")}>
            <VitalsTile
              compact={compact}
              label="BP"
              value={`${patient.abps.value}/${patient.abpd.value}`}
            />
            <VitalsTile
              compact={compact}
              label="Pulse"
              value={String(patient.hr.value)}
              tone={patient.hr.value > 100 ? "danger" : "default"}
            />
            <VitalsTile compact={compact} label="SpO2" value={`${patient.spo2.value}%`} />
            <VitalsTile compact={compact} label="Temp" value={`${patient.temperature.value}C`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DividerBlock({
  compact,
  label,
  strong = false,
  value,
}: {
  compact: boolean;
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div className={cn("min-w-0 border-l border-[#aeb4c2]", compact ? "pl-4" : "pl-8")}>
      <div className="text-xs font-extrabold uppercase text-[#202533]">{label}</div>
      <div
        className={cn(
          "mt-1 truncate font-extrabold",
          compact ? "text-sm" : "text-base",
          strong ? "text-primary" : "text-[#191d27]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function VitalsTile({
  compact,
  label,
  tone = "default",
  value,
}: {
  compact: boolean;
  label: string;
  tone?: "default" | "danger";
  value: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-md bg-[#e6e8ef] text-center",
        compact ? "px-2 py-2" : "px-3 py-2",
      )}
    >
      <div className={cn("font-extrabold text-[#626879]", compact ? "text-[11px]" : "text-xs")}>
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 truncate font-extrabold text-[#1f2430]",
          compact ? "text-sm" : "text-base",
          tone === "danger" && "text-[#b51d2c]",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ProgressListTab({
  active,
  compact,
  label,
  onClick,
}: {
  active: boolean;
  compact: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-lg text-center font-extrabold transition hover:bg-white/70 hover:text-primary",
        compact ? "h-10 min-w-[170px] px-3 text-sm" : "h-11 min-w-[190px] px-4 text-sm",
        active ? "bg-white text-primary shadow-sm" : "bg-transparent text-[#373c49]",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ProgressTimelineNote({
  active,
  compact,
  note,
  onClick,
  onEdit,
  onPrint,
  onView,
  primary,
}: {
  active: boolean;
  compact: boolean;
  note: ProgressNote;
  onClick: () => void;
  onEdit: () => void;
  onPrint: () => void;
  onView: () => void;
  primary: boolean;
}) {
  return (
    <article
      className={cn(
        "relative cursor-pointer rounded-xl border bg-white shadow-sm transition hover:border-primary/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        compact ? "px-4 py-4" : "px-5 py-5",
        active ? "border-primary/35 shadow-md" : "border-border",
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          "grid gap-5",
          compact
            ? "xl:grid-cols-[1fr_minmax(300px,0.85fr)]"
            : "lg:grid-cols-[1fr_minmax(340px,0.9fr)]",
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 pr-0 lg:pr-36">
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-primary">
              {note.title}
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1c202b]">
              <UserRound className="h-6 w-6 rounded-full bg-primary/10 p-1 text-primary" />
              {note.author}
            </span>
            <span className="text-sm font-semibold text-[#656b78]">{note.timestamp}</span>
          </div>

          {note.subjective ? (
            <ProgressTextBlock className="mt-5" label="Subjective" value={note.subjective} />
          ) : null}
          <ProgressTextBlock className="mt-4" label="Objective" value={note.objective} />

          <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-3">
            <button
              className="text-sm font-extrabold text-primary"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onView();
              }}
            >
              View Full
            </button>
            <button
              className="text-sm font-extrabold text-[#565c69]"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
            <button
              className="inline-flex items-center gap-1 text-sm font-extrabold text-[#565c69]"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onPrint();
              }}
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        <div
          className={cn(
            "min-w-0 rounded-lg bg-surface-muted/50 p-4",
            !primary && "hidden lg:block",
          )}
        >
          <ProgressTextBlock label="Assessment" value={note.assessment} />
          <ProgressTextBlock className="mt-4" label="Plan" value={note.plan} />
        </div>

        <div className="absolute right-4 top-5 hidden items-center gap-3 lg:flex">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-extrabold uppercase",
              statusTextClass(note.status),
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            {note.status}
          </span>
          <MoreVertical className="h-5 w-5 text-[#545b69]" />
        </div>
      </div>
    </article>
  );
}

function ProgressTextBlock({
  className,
  label,
  value,
}: {
  className?: string;
  label: string;
  value: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-sm font-extrabold uppercase tracking-wide text-[#202533]">{label}</h3>
      <p className="mt-2 max-w-[720px] text-sm font-semibold leading-6 text-[#2f3440]">{value}</p>
    </div>
  );
}

function ProgressNoteDrawer({
  form,
  isEditing,
  kind,
  onChange,
  onClose,
  onSave,
  patient,
  uhid,
  wardBed,
}: {
  form: NoteFormState;
  isEditing: boolean;
  kind: ProgressNoteKind;
  onChange: (field: keyof NoteFormState, value: string) => void;
  onClose: () => void;
  onSave: () => void;
  patient: ProgressNotePatient;
  uhid: string;
  wardBed: string;
}) {
  const isCarePlan = kind === "care-plan";

  return (
    <div className="fixed inset-0 z-[80] bg-black/45" role="presentation">
      <section
        aria-label={isCarePlan ? "New care plan" : "New doctor note"}
        className="fixed inset-y-0 right-0 flex w-full max-w-[1120px] flex-col overflow-hidden bg-white shadow-[-24px_0_50px_rgba(15,23,42,0.22)]"
        role="dialog"
      >
        <div className="flex items-center justify-between px-7 py-6">
          <h2 className="text-2xl font-extrabold text-[#202331]">
            {isEditing ? "Edit" : "New"} {isCarePlan ? "Care Plan" : "Doctor Note"}
          </h2>
          <button
            aria-label="Close note drawer"
            className="grid h-10 w-10 place-items-center rounded-md text-[#1f2430] hover:bg-[#e7eaf4]"
            onClick={onClose}
            type="button"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pb-28">
          <div className="px-7">
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#7367f0]/40 px-4 py-3 text-white shadow-[0_8px_20px_rgba(115,103,240,0.18)]"
              style={{ background: "linear-gradient(90deg,#7367f0,#5b8def)" }}
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-base font-bold text-white/85">
                <span className="font-extrabold text-white">{patient.name}</span>
                <span>MRN: {uhid}</span>
                <span>{wardBed}</span>
              </div>
              <div className="max-w-full truncate text-base font-extrabold text-white">
                {patient.diagnosis}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 bg-slate-50 px-7 py-3 text-base font-extrabold text-slate-700">
            <span className="uppercase tracking-wide">Current Vitals</span>
            <div className="flex flex-wrap gap-x-8 gap-y-1">
              <span>
                BP: {patient.abps.value}/{patient.abpd.value}
              </span>
              <span>Pulse: {patient.hr.value}</span>
              <span>SpO2: {patient.spo2.value}%</span>
              <span>Temp: {patient.temperature.value}C</span>
            </div>
          </div>

          <div className="space-y-6 px-7 py-6">
            <DrawerSection title="Clinical Metadata">
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Note Type">
                  <div className="relative">
                    <select
                      className={fieldClass("appearance-none pr-10")}
                      value={form.noteType}
                      onChange={(event) => onChange("noteType", event.target.value)}
                    >
                      <option>
                        {isCarePlan ? "Interdisciplinary Care Plan" : "Daily Progress Note"}
                      </option>
                      <option>SOAP Progress Note</option>
                      <option>Consultant Review Note</option>
                      <option>Procedure Follow-up Note</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#747b8c]" />
                  </div>
                </Field>
                <Field label="Visit Time">
                  <div className="relative">
                    <input
                      className={fieldClass("pr-11")}
                      value={form.visitTime}
                      onChange={(event) => onChange("visitTime", event.target.value)}
                    />
                    <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#111827]" />
                  </div>
                </Field>
              </div>
            </DrawerSection>

            <DrawerSection title={isCarePlan ? "Care Goals" : "Subjective (S)"}>
              <textarea
                className={textAreaClass("min-h-[156px]")}
                placeholder={
                  isCarePlan
                    ? "Enter goals, patient needs, and care priorities..."
                    : "Enter patient's words and history..."
                }
                value={form.subjective}
                onChange={(event) => onChange("subjective", event.target.value)}
              />
            </DrawerSection>

            <DrawerSection title={isCarePlan ? "Interventions" : "Objective (O)"}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  className={fieldClass()}
                  placeholder="BP"
                  value={form.bp}
                  onChange={(event) => onChange("bp", event.target.value)}
                />
                <input
                  className={fieldClass()}
                  placeholder="HR"
                  value={form.hr}
                  onChange={(event) => onChange("hr", event.target.value)}
                />
                <input
                  className={fieldClass()}
                  placeholder="RR"
                  value={form.rr}
                  onChange={(event) => onChange("rr", event.target.value)}
                />
                <input
                  className={fieldClass()}
                  placeholder="Temp"
                  value={form.temp}
                  onChange={(event) => onChange("temp", event.target.value)}
                />
              </div>
              <textarea
                className={textAreaClass("mt-5 min-h-[132px]")}
                placeholder={
                  isCarePlan
                    ? "Planned interventions, monitoring schedule, and ownership..."
                    : "Physical Examination findings..."
                }
                value={form.objectiveExam}
                onChange={(event) => onChange("objectiveExam", event.target.value)}
              />
            </DrawerSection>

            <DrawerSection title={isCarePlan ? "Expected Outcomes" : "Assessment (A)"}>
              <textarea
                className={textAreaClass("min-h-[132px]")}
                placeholder={
                  isCarePlan
                    ? "Expected outcomes and review criteria..."
                    : "Clinical impression and differential diagnosis..."
                }
                value={form.assessment}
                onChange={(event) => onChange("assessment", event.target.value)}
              />
            </DrawerSection>

            <DrawerSection title={isCarePlan ? "Escalation Plan" : "Plan (P)"}>
              <textarea
                className={textAreaClass("min-h-[132px]")}
                placeholder={
                  isCarePlan
                    ? "Escalation triggers, handover items, and next review..."
                    : "Treatment plan, orders, follow-up, and counseling..."
                }
                value={form.plan}
                onChange={(event) => onChange("plan", event.target.value)}
              />
            </DrawerSection>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
          <button
            className="text-base font-extrabold text-[#7b8190]"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <div className="flex gap-4">
            <Button
              className="h-12 rounded-md border-slate-300 px-8 text-base font-extrabold text-slate-700 hover:bg-slate-50"
              type="button"
              variant="outline"
              onClick={onSave}
              disabled={!hasDraftContent(form)}
            >
              {isEditing ? "Save Changes" : "Save Draft"}
            </Button>
            <Button
              className="h-12 rounded-md bg-slate-800 px-9 text-base font-extrabold text-white shadow-sm hover:bg-slate-700"
              type="button"
              onClick={onSave}
              disabled={!hasDraftContent(form)}
            >
              Sign & Save Note
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProgressNoteFullView({
  note,
  onClose,
  onEdit,
  onPrint,
  patient,
  uhid,
  wardBed,
}: {
  note: ProgressNote;
  onClose: () => void;
  onEdit: () => void;
  onPrint: () => void;
  patient: ProgressNotePatient;
  uhid: string;
  wardBed: string;
}) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 px-4 py-6">
      <section
        className="flex max-h-[88dvh] w-full max-w-[920px] flex-col overflow-hidden rounded-lg border border-[#c8cedc] bg-white shadow-2xl"
        role="dialog"
        aria-label="Progress note full view"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#d8deea] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-[#202331]">{note.title}</h2>
            <p className="mt-1 text-sm font-bold text-[#5f6676]">
              {patient.name} | MRN: {uhid} | {wardBed}
            </p>
          </div>
          <button
            aria-label="Close full note"
            className="grid h-9 w-9 place-items-center rounded-md text-[#1f2430] hover:bg-[#eef2f7]"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#d8deea] pb-4">
            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[#1c202b]">
              <UserRound className="h-6 w-6 rounded-full bg-primary/10 p-1 text-primary" />
              {note.author}
            </span>
            <span className="text-sm font-semibold text-[#656b78]">{note.designation}</span>
            <span className="text-sm font-semibold text-[#656b78]">{note.timestamp}</span>
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 text-xs font-extrabold uppercase",
                statusTextClass(note.status),
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              {note.status}
            </span>
          </div>

          <div className="grid gap-5 py-5 md:grid-cols-2">
            {note.subjective ? (
              <ProgressTextBlock label="Subjective" value={note.subjective} />
            ) : null}
            <ProgressTextBlock label="Objective" value={note.objective} />
            <ProgressTextBlock label="Assessment" value={note.assessment} />
            <ProgressTextBlock label="Plan" value={note.plan} />
          </div>

          {note.acknowledgedBy ? (
            <div className="rounded-md border border-[#d8deea] bg-[#f8faff] px-4 py-3 text-sm font-bold text-[#5f6676]">
              Acknowledged by: <span className="text-[#202331]">{note.acknowledgedBy}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#d8deea] bg-[#f8faff] px-5 py-4">
          <Button
            className="h-10 rounded-md px-5 text-sm font-extrabold"
            type="button"
            variant="outline"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            className="h-10 rounded-md px-5 text-sm font-extrabold"
            type="button"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </section>
    </div>
  );
}

function DrawerSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h3 className="text-base font-extrabold uppercase text-[#202533]">{title}</h3>
        <ChevronDown className="h-6 w-6 text-[#111827]" />
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-extrabold text-[#4d5362]">{label}</span>
      {children}
    </label>
  );
}

function fieldClass(extra?: string) {
  return cn(
    "h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-base font-semibold text-[#242735] outline-none transition placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
    extra,
  );
}

function textAreaClass(extra?: string) {
  return cn(
    "w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-4 text-base font-semibold leading-7 text-[#242735] outline-none transition placeholder:text-slate-500 focus:border-slate-500 focus:ring-2 focus:ring-slate-200",
    extra,
  );
}

function statusTextClass(status: ProgressNote["status"]) {
  if (status === "Signed") return "text-[#137243]";
  if (status === "Reviewed") return "text-primary";
  return "text-[#9a5a00]";
}

function initials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] ?? "P"}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

function createInitialForm(
  patient: ProgressNotePatient,
  kind: ProgressNoteKind = "doctor",
): NoteFormState {
  return {
    noteType: kind === "care-plan" ? "Interdisciplinary Care Plan" : "Daily Progress Note",
    visitTime: "24/10/2023, 09:15 AM",
    subjective: "",
    bp: `${patient.abps.value}/${patient.abpd.value}`,
    hr: String(patient.hr.value),
    rr: "20",
    temp: `${patient.temperature.value}C`,
    objectiveExam: "",
    assessment: "",
    plan: "",
  };
}

function createFormFromNote(note: ProgressNote, patient: ProgressNotePatient): NoteFormState {
  return {
    noteType: note.title,
    visitTime: note.timestamp,
    subjective: note.subjective ?? "",
    bp: `${patient.abps.value}/${patient.abpd.value}`,
    hr: String(patient.hr.value),
    rr: "20",
    temp: `${patient.temperature.value}C`,
    objectiveExam: note.objective,
    assessment: note.assessment,
    plan: note.plan,
  };
}

function hasDraftContent(form: NoteFormState) {
  return [form.subjective, form.objectiveExam, form.assessment, form.plan].some(
    (value) => value.trim().length > 0,
  );
}

function createSavedProgressNote({
  existingNote,
  form,
  kind,
  patient,
  rapidReviewPatient,
  tone,
}: {
  existingNote?: ProgressNote;
  form: NoteFormState;
  kind: ProgressNoteKind;
  patient: ProgressNotePatient;
  rapidReviewPatient?: ProgressNoteRapidReviewPatient;
  tone: ProgressNoteTone;
}): ProgressNote {
  const now = new Date();
  const timestamp = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const isDoctor = kind === "doctor";
  const isCarePlan = kind === "care-plan";
  const doctor =
    tone === "red" ? "Dr. Amandeep Singh" : tone === "orange" ? "Dr. Meera Rao" : "Dr. Super Admin";
  const nurse =
    tone === "red"
      ? "Nurse Jason Abbott"
      : tone === "orange"
        ? "Nurse Priya Menon"
        : "Nurse Super Admin";
  const author = isDoctor
    ? (rapidReviewPatient?.consultant ?? doctor)
    : isCarePlan
      ? "Care Team"
      : nurse;

  return {
    id:
      existingNote && !isBaseProgressNoteId(existingNote.id)
        ? existingNote.id
        : `${kind}-${patient.id}-${now.getTime()}`,
    kind,
    timestamp,
    author,
    designation: isDoctor
      ? "Consultant Doctor"
      : isCarePlan
        ? "Multidisciplinary Care Plan"
        : "Primary Nurse",
    status: "Draft",
    priority: tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Routine",
    title: isDoctor ? form.noteType : isCarePlan ? "Care Plan" : "Nurse Progress Note",
    subjective: form.subjective || undefined,
    objective:
      `BP ${form.bp}, HR ${form.hr}, RR ${form.rr}, Temp ${form.temp}. ${form.objectiveExam}`.trim(),
    assessment: form.assessment || "Draft assessment pending.",
    plan: form.plan || "Draft plan pending.",
    acknowledgedBy: isDoctor || isCarePlan ? nurse : (rapidReviewPatient?.consultant ?? doctor),
  };
}

function printProgressNote(
  note: ProgressNote,
  patient: ProgressNotePatient,
  uhid: string,
  wardBed: string,
) {
  const printFrame = document.createElement("iframe");
  printFrame.setAttribute("aria-hidden", "true");
  printFrame.style.position = "fixed";
  printFrame.style.right = "0";
  printFrame.style.bottom = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";

  document.body.appendChild(printFrame);

  const printDocument = printFrame.contentWindow?.document;
  if (!printDocument) {
    printFrame.remove();
    window.print();
    return;
  }

  printDocument.open();
  printDocument.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(note.title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2430; margin: 32px; }
          header { border-bottom: 2px solid #d8deea; margin-bottom: 24px; padding-bottom: 16px; }
          h1 { font-size: 22px; margin: 0 0 8px; }
          .meta { color: #5f6676; font-size: 13px; font-weight: 700; line-height: 1.6; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
          h2 { font-size: 13px; letter-spacing: .08em; margin: 0 0 8px; text-transform: uppercase; }
          p { font-size: 14px; font-weight: 600; line-height: 1.6; margin: 0; white-space: pre-wrap; }
          .section { break-inside: avoid; margin-bottom: 22px; }
          @media print { body { margin: 20mm; } }
        </style>
      </head>
      <body>
        <header>
          <h1>${escapeHtml(note.title)}</h1>
          <div class="meta">${escapeHtml(patient.name)} | MRN: ${escapeHtml(uhid)} | ${escapeHtml(wardBed)}</div>
          <div class="meta">${escapeHtml(note.author)} | ${escapeHtml(note.designation)} | ${escapeHtml(note.timestamp)} | ${escapeHtml(note.status)}</div>
        </header>
        <main class="grid">
          ${note.subjective ? printSection("Subjective", note.subjective) : ""}
          ${printSection("Objective", note.objective)}
          ${printSection("Assessment", note.assessment)}
          ${printSection("Plan", note.plan)}
        </main>
      </body>
    </html>
  `);
  const cleanupPrintFrame = () => {
    window.setTimeout(() => printFrame.remove(), 250);
  };

  printDocument.close();

  window.setTimeout(() => {
    const frameWindow = printFrame.contentWindow;
    if (!frameWindow) {
      cleanupPrintFrame();
      return;
    }

    frameWindow.onafterprint = cleanupPrintFrame;
    frameWindow.focus();
    frameWindow.print();
    window.setTimeout(cleanupPrintFrame, 60000);
  }, 100);
}

function printSection(label: string, value: string) {
  return `<section class="section"><h2>${escapeHtml(label)}</h2><p>${escapeHtml(value)}</p></section>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isBaseProgressNoteId(id: string) {
  return ["doctor-1", "doctor-2", "nurse-1", "care-plan-1"].includes(id);
}

function buildProgressNotes(
  patient: ProgressNotePatient,
  rapidReviewPatient: ProgressNoteRapidReviewPatient | undefined,
  tone: ProgressNoteTone,
): ProgressNote[] {
  const vitalsSummary = `T: ${patient.temperature.value}C   HR: ${patient.hr.value}   RR: 20   BP: ${patient.abps.value}/${patient.abpd.value}   O2: ${patient.spo2.value}% on room air.`;
  const doctor =
    tone === "red"
      ? "Dr. Amandeep Singh"
      : tone === "orange"
        ? "Dr. Meera Rao"
        : "Dr. Sarah Miller, MD";
  const nurse =
    tone === "red"
      ? "Mark Benson, RN"
      : tone === "orange"
        ? "Priya Menon, RN"
        : "Nurse Super Admin";
  const consultant = rapidReviewPatient?.consultant ?? doctor;
  const urgentPlan =
    tone === "red"
      ? "Continue close monitoring, repeat vitals every 15 minutes, and escalate any deterioration immediately."
      : "Continue IV Ceftriaxone/Azithromycin. Incentive spirometry q2h. Repeat CXR tomorrow.";

  return [
    {
      id: "doctor-1",
      kind: "doctor",
      timestamp: "Oct 24, 2023 - 09:15 AM",
      author: consultant,
      designation: "Consultant Doctor",
      status: "Signed",
      priority: tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Routine",
      title: "SOAP Progress Note",
      subjective: `Patient reports mild improvement in shortness of breath. Cough persists but is becoming more productive with clear/yellow sputum.`,
      objective: `${vitalsSummary} Chest: Coarse crackles at right base. Heart: RRR, no murmurs.`,
      assessment: `1. ${patient.diagnosis}, improving. 2. Hyponatremia, mild - stable.`,
      plan: urgentPlan,
      acknowledgedBy: nurse,
    },
    {
      id: "doctor-2",
      kind: "doctor",
      timestamp: "Oct 24, 2023 - 02:40 PM",
      author: "Dr. Kavita Rao",
      designation: "Duty Doctor",
      status: "Reviewed",
      priority: "Routine",
      title: "Treatment Review",
      subjective:
        "Medication response reviewed. No new drug intolerance documented by bedside nursing team.",
      objective: "Airway, breathing, circulation, pain score, and medication chart reviewed.",
      assessment:
        "Treatment plan remains appropriate for current diagnosis and observation status.",
      plan: "Continue medicines as ordered, review reports when available, and update progress note after next round.",
      acknowledgedBy: "Nurse Super Admin",
    },
    {
      id: "nurse-1",
      kind: "nurse",
      timestamp: "Oct 23, 2023 - 07:30 PM",
      author: nurse,
      designation: "Primary Nurse",
      status: "Signed",
      priority: tone === "red" ? "Urgent" : "Watch",
      title: "Nursing Handover",
      objective:
        "Patient tolerated evening nebulizer treatment well. Output within normal range. Family at bedside.",
      assessment: `${patient.diagnosis}. Patient safety, lines, medication, intake/output, and comfort needs reviewed.`,
      plan: "Maintain fall precautions, continue ordered monitoring, update doctor for abnormal vitals, and document next handover.",
      acknowledgedBy: consultant,
    },
    {
      id: "care-plan-1",
      kind: "care-plan",
      timestamp: "Oct 24, 2023 - 10:00 AM",
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
