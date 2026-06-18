"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ClipboardList,
  FileText,
  FileSpreadsheet,
  FlaskConical,
  MessageCircle,
  Pill,
  Printer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

type VitalTone = "green" | "orange" | "red";
type PatientTone = "blue" | "orange" | "red";

export type Dashboard1Patient = {
  id: number;
  name: string;
  bed: string;
  diagnosis: string;
  rapidReviewPatientId: string;
  hr: { value: number; tone: VitalTone };
  spo2: { value: number; tone: VitalTone };
  abps: { value: number; tone: VitalTone };
  abpd: { value: number; tone: VitalTone };
  temperature: { value: string; tone: VitalTone };
};

const rapidReviewPatientIds = ["rr-002", "rr-003", "rr-001", "rr-004"];

const patients: Dashboard1Patient[] = [
  row(1, "HN_40*ICU-10***", "Upper Gastrointestinal bleeding", [120, "red"], [95, "green"], [120, "green"], [65, "green"], ["36.5", "green"]),
  row(2, "HN_3*ICU-70***", "Influenza", [85, "green"], [98, "green"], [120, "green"], [80, "green"], ["40", "red"]),
  row(3, "HN_53ICU--9***", "Myocardial Infarction (MI)", [115, "red"], [95, "green"], [110, "green"], [60, "green"], ["38", "green"]),
  row(4, "HN_33*ICU-10***", "Upper Gastrointestinal bleeding", [110, "red"], [65, "red"], [120, "green"], [52, "orange"], ["36.5", "green"]),
  row(5, "OR_0*Induction-6***", "Pneumonia", [102, "red"], [95, "green"], [120, "green"], [85, "green"], ["37", "green"]),
  row(6, "HN_40*ICU-50-***", "Lower Gastrointestinal bleeding", [57, "orange"], [95, "green"], [120, "green"], [52, "orange"], ["36.5", "green"]),
  row(7, "HN_17* isolatio-11 ***", "Myocarditis", [70, "green"], [95, "green"], [70, "orange"], [132, "red"], ["36.5", "green"]),
  row(8, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [89, "orange"], [150, "red"], [140, "red"], ["38", "green"]),
  row(9, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [130, "red"], [90, "orange"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(10, "HN_17*isolatio-11 ***", "Pulmonary embolism", [125, "red"], [68, "red"], [80, "orange"], [90, "green"], ["39.5", "red"]),
  row(11, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [79, "red"], [150, "red"], [90, "green"], ["38", "green"]),
  row(12, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [130, "red"], [92, "green"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(13, "HN_17*isolatio-11***", "Pulmonary embolism", [125, "red"], [88, "orange"], [80, "orange"], [90, "green"], ["39.5", "red"]),
  row(14, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [79, "red"], [150, "red"], [90, "green"], ["38", "green"]),
  row(15, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [90, "green"], [90, "orange"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(16, "HN_89*isolatio-001***", "Lower Gastrointestinal bleeding", [89, "green"], [96, "green"], [98, "green"], [78, "green"], ["37.5", "green"]),
  row(17, "HN_33*ICU-10***", "H1N1 Influenza", [89, "green"], [95, "green"], [110, "green"], [87, "green"], ["36.5", "green"]),
  row(18, "HN_17*isolatio-11***", "Pulmonary embolism", [69, "green"], [98, "green"], [97, "green"], [85, "green"], ["39.5", "red"]),
];

const patientToneOrder: Record<PatientTone, number> = {
  red: 0,
  orange: 1,
  blue: 2,
};

export const orderedPatients = [...patients].sort((a, b) => {
  const toneRank = patientToneOrder[patientTone(a)] - patientToneOrder[patientTone(b)];
  return toneRank || a.id - b.id;
});

const patientsPerPage = 10;

function row(
  id: number,
  bed: string,
  diagnosis: string,
  hr: [number, VitalTone],
  spo2: [number, VitalTone],
  abps: [number, VitalTone],
  abpd: [number, VitalTone],
  temperature: [string, VitalTone],
): Dashboard1Patient {
  return {
    id,
    name: `Patient ${id}`,
    bed,
    diagnosis,
    rapidReviewPatientId: rapidReviewPatientIds[(id - 1) % rapidReviewPatientIds.length],
    hr: { value: hr[0], tone: hr[1] },
    spo2: { value: spo2[0], tone: spo2[1] },
    abps: { value: abps[0], tone: abps[1] },
    abpd: { value: abpd[0], tone: abpd[1] },
    temperature: { value: temperature[0], tone: temperature[1] },
  };
}

export function patientTone(patient: Dashboard1Patient): PatientTone {
  const tones = [patient.hr.tone, patient.spo2.tone, patient.abps.tone, patient.abpd.tone, patient.temperature.tone];
  if (tones.includes("red")) return "red";
  if (tones.includes("orange")) return "orange";
  return "blue";
}

export function patientToneClass(tone: PatientTone) {
  if (tone === "red") return "text-red-600";
  if (tone === "orange") return "text-orange-500";
  return "text-blue-700";
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function DoctorDashboard1Page() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [shiftSummaryPatient, setShiftSummaryPatient] = React.useState<Dashboard1Patient | null>(null);
  const [collaboratePatient, setCollaboratePatient] = React.useState<Dashboard1Patient | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredPatients = orderedPatients.filter((patient) =>
    `${patient.name} ${patient.bed} ${patient.diagnosis}`.toLowerCase().includes(normalizedSearch),
  );
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / patientsPerPage));
  const visiblePatients = filteredPatients.slice((page - 1) * patientsPerPage, page * patientsPerPage);
  const firstVisiblePatient = filteredPatients.length ? (page - 1) * patientsPerPage + 1 : 0;
  const lastVisiblePatient = Math.min(page * patientsPerPage, filteredPatients.length);

  function exportExcel() {
    const headers = ["Patient", "Bed", "Diagnosis", "Priority", "HR (bpm)", "SpO2 (%)", "ABPS (mmHg)", "ABPD (mmHg)", "Temperature (C)"];
    const rows = filteredPatients.map((patient) => [
      patient.name,
      patient.bed,
      patient.diagnosis,
      patientTone(patient),
      patient.hr.value,
      patient.spo2.value,
      patient.abps.value,
      patient.abpd.value,
      patient.temperature.value,
    ]);
    const csv = [headers, ...rows].map((rowValues) => rowValues.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "doctor-ipd-dashboard-patients.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          aria-label="Search patients"
          className="w-full sm:max-w-md"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search patient, bed, or diagnosis..."
          value={search}
        />
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-1 text-xs font-semibold text-muted-foreground">
            {filteredPatients.length} patient{filteredPatients.length === 1 ? "" : "s"} found
          </div>
          <Button disabled={!filteredPatients.length} onClick={exportExcel} size="sm" variant="outline">
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => window.print()} size="sm" variant="outline">
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-md border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="max-w-full overflow-auto">
            <table className="w-full min-w-[1320px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-slate-700">
                  <HeaderCell className="sticky left-0 z-20 bg-white">Patient</HeaderCell>
                  <HeaderCell>Diagnosis</HeaderCell>
                  <HeaderCell>HR (bpm)</HeaderCell>
                  <HeaderCell>SpO2 (%)</HeaderCell>
                  <HeaderCell>ABPS (mmHg)</HeaderCell>
                  <HeaderCell>ABPD (mmHg)</HeaderCell>
                  <HeaderCell>Temperature<br />(°C)</HeaderCell>
                  <HeaderCell>Lab Results</HeaderCell>
                  <HeaderCell>Medication &<br />Intervention</HeaderCell>
                  <HeaderCell>Nurse Timeline</HeaderCell>
                  <HeaderCell>Radiology</HeaderCell>
                  <HeaderCell>Events</HeaderCell>
                  <HeaderCell>Collaborate</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {visiblePatients.map((patient) => {
                  const tone = patientTone(patient);

                  return (
                  <tr className="border-b border-slate-100 bg-white hover:bg-slate-50" key={patient.id}>
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2">
                      <Link
                        className="block rounded-md px-1 py-0.5 transition hover:bg-slate-100"
                        href={`/doctor-dashboard1/patients/${patient.id}`}
                      >
                        <div className={cn("font-bold", patientToneClass(tone))}>
                          {patient.name}
                        </div>
                        <div className="mt-0.5 font-semibold text-slate-700">{patient.bed}</div>
                      </Link>
                    </td>
                    <td className="max-w-44 px-3 py-2 text-center font-medium text-slate-800">
                      <Link className="block rounded-md px-2 py-1 transition hover:bg-slate-100" href="/clinical-examination">
                        {patient.diagnosis}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center"><VitalPill {...patient.hr} href="/ipd" /></td>
                    <td className="px-3 py-2 text-center"><VitalPill {...patient.spo2} href="/ipd" /></td>
                    <td className="px-3 py-2 text-center"><VitalPill {...patient.abps} href="/ipd" /></td>
                    <td className="px-3 py-2 text-center"><VitalPill {...patient.abpd} href="/ipd" /></td>
                    <td className="px-3 py-2 text-center"><VitalPill {...patient.temperature} href="/ipd" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={FlaskConical} tone="dark" href="/results" label="Open results" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={Pill} tone="dark" href="/doctor/orders?tab=drugs" label="Open medication and intervention" /></td>
                    <td className="px-3 py-2 text-center">
                      <RoundActionButton icon={ClipboardList} tone="dark" label="Open nurse timeline" onClick={() => setShiftSummaryPatient(patient)} />
                    </td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={FileText} tone="dark" href="/radiology" label="Open radiology" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={Activity} tone="red" href="/rapid-review" label="Open events" /></td>
                    <td className="px-3 py-2 text-center">
                      <RoundActionButton icon={MessageCircle} tone="dark" label="Open timeline" onClick={() => setCollaboratePatient(patient)} />
                    </td>
                  </tr>
                  );
                })}
                {!visiblePatients.length ? (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm font-medium text-muted-foreground" colSpan={13}>
                      No patient matched this search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge tone="danger">Patient order: red first</Badge>
          <Badge tone="warning">Orange next</Badge>
          <Badge tone="info">Blue stable</Badge>
          <Badge tone="success">Green: stable</Badge>
          <Badge tone="warning">Orange: warning</Badge>
          <Badge tone="danger">Red: urgent</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Showing {firstVisiblePatient}-{lastVisiblePatient} of {filteredPatients.length} | Page {page} of {totalPages}
          </span>
          <Button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} size="sm" variant="outline">
            Previous
          </Button>
          <Button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} size="sm" variant="outline">
            Next
          </Button>
        </div>
      </div>

      <CenterModal
        className="w-[min(94vw,1040px)]"
        description={shiftSummaryPatient ? `${shiftSummaryPatient.name} | ${shiftSummaryPatient.bed} | ${shiftSummaryPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setShiftSummaryPatient(null)}
        open={Boolean(shiftSummaryPatient)}
        title="Nurse Timeline"
      >
        {shiftSummaryPatient ? <DashboardShiftSummaryTimeline patient={shiftSummaryPatient} /> : null}
      </CenterModal>

      <CenterModal
        className="w-[min(94vw,1040px)]"
        description={collaboratePatient ? `${collaboratePatient.name} | ${collaboratePatient.bed} | ${collaboratePatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setCollaboratePatient(null)}
        open={Boolean(collaboratePatient)}
        title="Timeline"
      >
        {collaboratePatient ? <DashboardCollaborateTimeline patient={collaboratePatient} /> : null}
      </CenterModal>
    </div>
  );
}

function HeaderCell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={cn("px-3 py-3 text-center align-middle text-[11px] font-bold", className)}>{children}</th>;
}

function VitalPill({ value, tone, href }: { value: string | number; tone: VitalTone; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-8 min-w-12 items-center justify-center rounded-full px-3 text-sm font-bold text-white shadow-[0_4px_9px_rgba(15,23,42,0.22)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
        tone === "green" && "bg-[#008d0c]",
        tone === "orange" && "bg-[#ffa600]",
        tone === "red" && "bg-[#ff0808]",
      )}
    >
      {value}
    </Link>
  );
}

function RoundAction({ icon: Icon, tone, href, label }: { icon: React.ElementType; tone: "dark" | "red"; href: string; label: string }) {
  return (
    <Link
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-[0_4px_9px_rgba(15,23,42,0.20)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
        tone === "dark" && "bg-[#4a4a4a]",
        tone === "red" && "bg-[#ff443e]",
      )}
      href={href}
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}

function RoundActionButton({ icon: Icon, tone, label, onClick }: { icon: React.ElementType; tone: "dark" | "red"; label: string; onClick: () => void }) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-[0_4px_9px_rgba(15,23,42,0.20)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
        tone === "dark" && "bg-[#4a4a4a]",
        tone === "red" && "bg-[#ff443e]",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function DashboardShiftSummaryTimeline({ patient }: { patient: Dashboard1Patient }) {
  const notes = buildDashboardShiftNotes(patient);

  return (
    <div className="relative max-h-[70dvh] space-y-6 overflow-y-auto pl-7 pr-2">
      <div className="absolute bottom-3 left-[18px] top-3 w-px bg-border" />
      {notes.map((note) => (
        <div className="relative" key={note.id}>
          <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2d8ac8] text-white shadow-sm">
            <ClipboardList className="h-3.5 w-3.5" />
          </div>
          <div className="mb-2 inline-flex rounded bg-[#2d8ac8] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {note.timestamp}
          </div>
          <div className="rounded-md border border-border bg-[#f7f7f7] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
              <div className="font-semibold text-[#3ba3d8]">{patient.name} ({note.bedCode})</div>
              <div className="text-xs text-muted-foreground">Created By: {note.createdBy}</div>
            </div>
            <div className="space-y-3 px-3 py-3 text-sm">
              <div>
                <div className="text-xs font-bold text-foreground">Note</div>
                <p className="mt-1 text-muted-foreground">{note.note}</p>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Comment</div>
                <p className="mt-1 text-muted-foreground">{note.comment}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildDashboardShiftNotes(patient: Dashboard1Patient) {
  const nurse = patientTone(patient) === "red" ? "Nurse Jason Abbott" : patientTone(patient) === "orange" ? "Nurse Priya Menon" : "Nurse Super Admin";
  const bedCode = String(9000 + patient.id);
  const vitalsSummary = `HR ${patient.hr.value} bpm, SpO2 ${patient.spo2.value}%, BP ${patient.abps.value}/${patient.abpd.value}, Temp ${patient.temperature.value} C.`;

  return [
    {
      id: "shift-1",
      timestamp: "17/06/2026 06:45 PM",
      bedCode,
      createdBy: nurse,
      note: `Evening nurse note recorded. ${patient.diagnosis}. ${vitalsSummary}`,
      comment: "Continue monitoring and follow doctor instruction. Escalate if vitals cross warning range.",
    },
    {
      id: "shift-2",
      timestamp: "17/06/2026 02:15 PM",
      bedCode,
      createdBy: "Nurse Super Admin",
      note: "Medication round completed. Patient tolerated care and routine nursing activities.",
      comment: "Repeat vitals in next round and update handover before shift close.",
    },
    {
      id: "shift-3",
      timestamp: "17/06/2026 09:30 AM",
      bedCode,
      createdBy: "Nurse Priya Menon",
      note: "Morning assessment completed. Bedside safety, intake, comfort, and lines checked.",
      comment: "No new adverse event reported. Continue planned nursing care.",
    },
  ];
}

function DashboardCollaborateTimeline({ patient }: { patient: Dashboard1Patient }) {
  const timeline = buildCollaborateTimeline(patient);

  return (
    <div className="relative max-h-[70dvh] space-y-6 overflow-y-auto pl-7 pr-2">
      <div className="absolute bottom-3 left-[18px] top-3 w-px bg-border" />
      {timeline.map((item) => (
        <div className="relative" key={item.id}>
          <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2d8ac8] text-white shadow-sm">
            <MessageCircle className="h-3.5 w-3.5" />
          </div>
          <div className="mb-2 inline-flex rounded bg-[#2d8ac8] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {item.timestamp}
          </div>
          <div className="rounded-md border border-border bg-[#f7f7f7] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
              <div className="font-semibold text-[#3ba3d8]">{item.title}</div>
              <div className="text-xs text-muted-foreground">Created By: {item.createdBy}</div>
            </div>
            <p className="px-3 py-3 text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildCollaborateTimeline(patient: Dashboard1Patient) {
  const doctor = patientTone(patient) === "red" ? "Dr. Amandeep Singh" : patientTone(patient) === "orange" ? "Dr. Meera Rao" : "Dr. Super Admin";

  return [
    {
      id: "timeline-1",
      timestamp: "17/06/2026 06:43 PM",
      title: "Take medicine after meal everyday",
      description: `${patient.name}: medicine and clinical instruction shared with nursing team for ${patient.diagnosis}.`,
      createdBy: doctor,
    },
    {
      id: "timeline-2",
      timestamp: "17/06/2026 02:36 PM",
      title: "Documentation",
      description: "Clinical notes, bedside status, and communication update added for doctor IPD review.",
      createdBy: "Nurse Priya Menon",
    },
    {
      id: "timeline-3",
      timestamp: "17/06/2026 12:51 PM",
      title: "Follow Doctor Instruction",
      description: "Care team acknowledged the latest instruction and will update the next response in timeline.",
      createdBy: "Nurse Super Admin",
    },
    {
      id: "timeline-4",
      timestamp: "17/06/2026 09:20 AM",
      title: "Follow diet as planned for you.",
      description: "Diet plan and routine monitoring message shared with the ward team.",
      createdBy: "Dietician Admin",
    },
  ];
}
