"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ClipboardList,
  Download,
  FileText,
  FileSpreadsheet,
  FlaskConical,
  ListTree,
  Pill,
  PhoneCall,
  Plus,
  Printer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { SearchInput } from "@/components/ui/search-input";
import { ProgressNotesPanel } from "@/features/doctor-dashboard1/progress-notes";
import { DoctorOrdersPage } from "@/features/doctor-orders/doctor-orders";
import { rapidReviewPatients } from "@/features/rapid-review/rapid-review-data";
import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";
import { cn } from "@/lib/utils";

type VitalTone = "green" | "orange" | "red";
type PatientTone = "blue" | "orange" | "red";

type DashboardMedicationRow = {
  orderId?: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: string;
  prescribedBy: string;
};

const RADIOLOGY_REPORT_URL = "/radiology-report.pdf";

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

const patientNames = [
  "Aisha Khan",
  "Liam Anderson",
  "Meera Sharma",
  "Oliver Brown",
  "Priya Nair",
  "Noah Wilson",
  "Arjun Patel",
  "Emily Clarke",
  "Ravi Menon",
  "Sophie Williams",
  "Ananya Roy",
  "Jack Thompson",
  "Kabir Ali",
  "Grace Mitchell",
  "Neha Iyer",
  "Ethan Harris",
  "Rohan Das",
  "Chloe Bennett",
];

const patients: Dashboard1Patient[] = [
  row(1, "HN_40*ICU-10***", "Upper Gastrointestinal bleeding", [120, "red"], [95, "green"], [120, "green"], [65, "green"], ["36.5", "green"]),
  row(2, "HN_3*ICU-70***", "Influenza", [85, "green"], [98, "green"], [120, "green"], [80, "green"], ["40", "red"]),
  row(3, "HN_53ICU--9***", "Myocardial Infarction (MI)", [115, "red"], [95, "green"], [110, "green"], [60, "green"], ["38", "green"]),
  row(4, "HN_33*ICU-10***", "Upper Gastrointestinal bleeding", [110, "red"], [65, "red"], [120, "green"], [52, "orange"], ["36.5", "green"]),
  row(5, "OR_0*Induction-6***", "Pneumonia", [102, "orange"], [95, "green"], [120, "green"], [85, "green"], ["37", "green"]),
  row(6, "HN_40*ICU-50-***", "Lower Gastrointestinal bleeding", [57, "orange"], [95, "green"], [120, "green"], [52, "orange"], ["36.5", "green"]),
  row(7, "HN_17* isolatio-11 ***", "Myocarditis", [70, "green"], [95, "green"], [70, "orange"], [132, "orange"], ["36.5", "green"]),
  row(8, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [89, "orange"], [150, "orange"], [140, "orange"], ["38", "green"]),
  row(9, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [130, "orange"], [90, "orange"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(10, "HN_17*isolatio-11 ***", "Pulmonary embolism", [125, "orange"], [68, "orange"], [80, "orange"], [90, "green"], ["39.5", "orange"]),
  row(11, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [79, "orange"], [150, "orange"], [90, "green"], ["38", "green"]),
  row(12, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [130, "orange"], [92, "green"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(13, "HN_17*isolatio-11***", "Pulmonary embolism", [125, "orange"], [88, "orange"], [80, "orange"], [90, "green"], ["39.5", "orange"]),
  row(14, "OR_0*Induction-6***", "H1N1 Influenza", [82, "green"], [79, "orange"], [150, "orange"], [90, "green"], ["38", "green"]),
  row(15, "HN_40 * ICU - 10 ***", "Upper Gastrointestinal bleeding", [90, "green"], [90, "orange"], [75, "orange"], [50, "orange"], ["37.5", "green"]),
  row(16, "HN_89*isolatio-001***", "Lower Gastrointestinal bleeding", [89, "green"], [96, "green"], [98, "green"], [78, "green"], ["37.5", "green"]),
  row(17, "HN_33*ICU-10***", "H1N1 Influenza", [89, "green"], [95, "green"], [110, "green"], [87, "green"], ["36.5", "green"]),
  row(18, "HN_17*isolatio-11***", "Pulmonary embolism", [69, "green"], [98, "green"], [97, "green"], [85, "green"], ["39.5", "green"]),
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
    name: patientNames[id - 1] ?? `Patient ${id}`,
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
  if (tone === "red") return "text-red-700";
  if (tone === "orange") return "text-orange-600";
  return "text-blue-700";
}

function patientToneRowClass(tone: PatientTone) {
  if (tone === "red") return "bg-red-50/70 hover:bg-red-50";
  if (tone === "orange") return "bg-orange-50/70 hover:bg-orange-50";
  return "bg-blue-50/60 hover:bg-blue-50";
}

function patientToneCellClass(tone: PatientTone) {
  return "bg-white hover:bg-slate-50";
}

function patientToneStripeClass(tone: PatientTone) {
  if (tone === "red") return "bg-red-500";
  if (tone === "orange") return "bg-orange-400";
  return "bg-blue-500";
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function DoctorDashboard1Page() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [shiftSummaryPatient, setShiftSummaryPatient] = React.useState<Dashboard1Patient | null>(null);
  const [collaboratePatient, setCollaboratePatient] = React.useState<Dashboard1Patient | null>(null);
  const [eventPatient, setEventPatient] = React.useState<Dashboard1Patient | null>(null);
  const [labResultsPatient, setLabResultsPatient] = React.useState<Dashboard1Patient | null>(null);
  const [medicationPatient, setMedicationPatient] = React.useState<Dashboard1Patient | null>(null);
  const [radiologyPatient, setRadiologyPatient] = React.useState<Dashboard1Patient | null>(null);
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
          <div className="flex max-w-full overflow-hidden">
            <div className="w-[190px] shrink-0 border-r border-slate-200 bg-white shadow-[8px_0_14px_rgba(15,23,42,0.04)]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="h-14 border-b border-slate-200 bg-white text-slate-700">
                    <HeaderCell className="h-14 w-[190px] min-w-[190px]">Patient</HeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {visiblePatients.map((patient) => {
                    const tone = patientTone(patient);

                    return (
                      <tr className="h-[74px] border-b border-slate-100 bg-white font-semibold" key={patient.id}>
                        <td className={cn("relative h-[74px] w-[190px] min-w-[190px] px-3 py-2", patientToneCellClass(tone))}>
                          <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 w-1", patientToneStripeClass(tone))} />
                          <Link
                            className="relative block min-h-12 rounded-md px-1 py-1 pl-2 transition hover:bg-white/70"
                            href={`/doctor-dashboard1/patients/${patient.id}`}
                          >
                            <div className={cn("whitespace-nowrap text-sm font-extrabold leading-5", patientToneClass(tone))}>
                              {patient.name}
                            </div>
                            <div className="mt-0.5 break-words font-semibold leading-4 text-slate-700">{patient.bed}</div>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="min-w-0 flex-1 overflow-x-auto">
              <table className="w-full min-w-[1270px] border-collapse text-left text-xs">
                <thead>
                  <tr className="h-14 border-b border-slate-200 bg-white text-slate-700">
                    <HeaderCell className="h-14 w-[230px] min-w-[230px]">Diagnosis</HeaderCell>
                    <HeaderCell className="h-14">HR (bpm)</HeaderCell>
                    <HeaderCell className="h-14">SpO2 (%)</HeaderCell>
                    <HeaderCell className="h-14">ABPS (mmHg)</HeaderCell>
                    <HeaderCell className="h-14">ABPD (mmHg)</HeaderCell>
                    <HeaderCell className="h-14">Temperature<br />(°C)</HeaderCell>
                    <HeaderCell className="h-14">Lab Results</HeaderCell>
                    <HeaderCell className="h-14">Medication &<br />Intervention</HeaderCell>
                    <HeaderCell className="h-14">Progress Note</HeaderCell>
                    <HeaderCell className="h-14">Radiology</HeaderCell>
                    <HeaderCell className="h-14">Events</HeaderCell>
                    <HeaderCell className="h-14">Collaborate</HeaderCell>
                  </tr>
                </thead>
                <tbody>
                  {visiblePatients.map((patient) => {
                    const tone = patientTone(patient);

                    return (
                      <tr className={cn("h-[74px] border-b border-slate-100 font-semibold", patientToneRowClass(tone))} key={patient.id}>
                        <td className="h-[74px] w-[230px] min-w-[230px] px-3 py-2 text-center font-medium text-slate-800">
                          <Link className="flex min-h-12 items-center justify-center rounded-md px-2 py-1 leading-4 transition hover:bg-slate-100" href={`/doctor-dashboard1/patients/${patient.id}?tab=clinical-examination`}>
                            {patient.diagnosis}
                          </Link>
                        </td>
                        <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.hr} href="" /></td>
                        <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.spo2} href="" /></td>
                        <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.abps} href="" /></td>
                        <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.abpd} href="" /></td>
                        <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.temperature} href="" /></td>
                        <td className="h-[74px] px-3 py-2 text-center">
                          <RoundActionButton
                            icon={FlaskConical}
                            tone="dark"
                            label={`Open laboratory results for ${patient.name}`}
                            onClick={() => setLabResultsPatient(patient)}
                          />
                        </td>
                        <td className="h-[74px] px-3 py-2 text-center">
                          <RoundActionButton
                            icon={Pill}
                            tone="dark"
                            label={`Open medication and intervention for ${patient.name}`}
                            onClick={() => setMedicationPatient(patient)}
                          />
                        </td>
                        <td className="h-[74px] px-3 py-2 text-center">
                          <RoundActionButton icon={ClipboardList} tone="dark" label={`Open progress note for ${patient.name}`} onClick={() => setShiftSummaryPatient(patient)} />
                        </td>
                        <td className="h-[74px] px-3 py-2 text-center">
                          <RoundActionButton
                            icon={FileText}
                            tone="dark"
                            label={`Open radiology report for ${patient.name}`}
                            onClick={() => setRadiologyPatient(patient)}
                          />
                        </td>
                        <td className="h-[74px] px-3 py-2 text-center">
                          <RoundActionButton dataTestId={`dashboard1-events-${patient.id}`} icon={Activity} tone="red" label={`Open events for ${patient.name}`} onClick={() => setEventPatient(patient)} />
                        </td>
                        <td className="h-[74px] px-3 py-2 text-center">
                          <RoundActionButton icon={PhoneCall} tone="dark" label={`Open collaborate for ${patient.name}`} onClick={() => setCollaboratePatient(patient)} />
                        </td>
                      </tr>
                    );
                  })}
                  {!visiblePatients.length ? (
                    <tr>
                      <td className="px-4 py-12 text-center text-sm font-medium text-muted-foreground" colSpan={12}>
                        No patient matched this search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
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
        className="w-[min(96vw,1180px)]"
        description={labResultsPatient ? `${labResultsPatient.name} | ${labResultsPatient.bed} | ${labResultsPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setLabResultsPatient(null)}
        open={Boolean(labResultsPatient)}
        title="Laboratory Results"
      >
        {labResultsPatient ? <DashboardLabResultsPopup patient={labResultsPatient} /> : null}
      </CenterModal>
      <CenterModal
        className="w-[min(94vw,920px)]"
        description={
          medicationPatient
            ? `${medicationPatient.name} | ${medicationPatient.bed} | ${medicationPatient.diagnosis}`
            : undefined
        }
        onOpenChange={(open) => !open && setMedicationPatient(null)}
        open={Boolean(medicationPatient)}
        title="Medication & Intervention"
      >
        {medicationPatient ? <MedicationInterventionPopup patient={medicationPatient} /> : null}
      </CenterModal>
      <CenterModal
        className="w-[min(94vw,1040px)]"
        description={shiftSummaryPatient ? `${shiftSummaryPatient.name} | ${shiftSummaryPatient.bed} | ${shiftSummaryPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setShiftSummaryPatient(null)}
        open={Boolean(shiftSummaryPatient)}
        title="Progress Note"
      >
        {shiftSummaryPatient ? <ProgressNotesPanel compact patient={shiftSummaryPatient} tone={patientTone(shiftSummaryPatient)} /> : null}
      </CenterModal>

      <CenterModal
        className="h-[min(92dvh,900px)] w-[min(96vw,1180px)]"
        description={radiologyPatient ? `${radiologyPatient.name} | ${radiologyPatient.bed} | ${radiologyPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setRadiologyPatient(null)}
        open={Boolean(radiologyPatient)}
        title="Radiology Report"
      >
        {radiologyPatient ? <DashboardRadiologyReportPopup patient={radiologyPatient} /> : null}
      </CenterModal>

      <CenterModal
        className="w-[min(94vw,1040px)]"
        description={collaboratePatient ? `${collaboratePatient.name} | ${collaboratePatient.bed} | ${collaboratePatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setCollaboratePatient(null)}
        open={Boolean(collaboratePatient)}
        title="Collaborate"
      >
        {collaboratePatient ? <DashboardCollaborateTimeline patient={collaboratePatient} /> : null}
      </CenterModal>

      <CenterModal
        className="w-[min(94vw,640px)]"
        description={eventPatient ? `${eventPatient.bed} | ${eventPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setEventPatient(null)}
        open={Boolean(eventPatient)}
        title="Events"
      >
        {eventPatient ? <DashboardEventsPopup patient={eventPatient} /> : null}
      </CenterModal>
    </div>
  );
}

function HeaderCell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={cn("px-3 py-3 text-center align-middle text-xs font-extrabold text-slate-900", className)}>{children}</th>;
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

function RoundAction({
  icon: Icon,
  tone,
  href,
  label,
  download,
}: {
  icon: React.ElementType;
  tone: "dark" | "red";
  href: string;
  label: string;
  download?: string;
}) {
  return (
    <Link
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full text-white shadow-[0_4px_9px_rgba(15,23,42,0.20)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
        tone === "dark" && "bg-[#4a4a4a]",
        tone === "red" && "bg-[#ff443e]",
      )}
      download={download}
      href={href}
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}

function RoundActionButton({
  icon: Icon,
  tone,
  label,
  onClick,
  dataTestId,
}: {
  icon: React.ElementType;
  tone: "dark" | "red";
  label: string;
  onClick: () => void;
  dataTestId?: string;
}) {
  return (
    <button
      aria-label={label}
      data-testid={dataTestId}
      className={cn(
        "relative z-20 inline-flex h-9 w-9 cursor-pointer select-none items-center justify-center rounded-full text-white shadow-[0_4px_9px_rgba(15,23,42,0.20)] transition hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
        tone === "dark" && "bg-[#4a4a4a]",
        tone === "red" && "bg-[#ff443e]",
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
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
              {/* <div className="font-semibold text-[#3ba3d8]">{patient.name} ({note.bedCode})</div> */}
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
            <ListTree className="h-3.5 w-3.5" />
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

function DashboardEventsPopup({ patient }: { patient: Dashboard1Patient }) {
  const events = buildPatientEvents(patient);
  const [selectedEventIndex, setSelectedEventIndex] = React.useState(0);
  const [topTab, setTopTab] = React.useState<"active" | "collaboration">("active");
  const [detailTab, setDetailTab] = React.useState<"repeat" | "details">("repeat");
  const [actionStatus, setActionStatus] = React.useState("Ready for event review");
  const selectedEvent = events[selectedEventIndex] ?? events[0];

  return (
    <div className="overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <div className="bg-[#2f66aa] px-4 py-3 text-base font-semibold text-white">{patient.name}</div>

      <div className="flex items-center border-b border-border bg-white text-sm font-semibold text-muted-foreground">
        <button
          className="flex h-12 w-12 cursor-pointer items-center justify-center border-r border-border text-xl text-muted-foreground transition hover:bg-slate-100 hover:text-foreground"
          type="button"
          aria-label="Previous patient"
          onClick={() => setActionStatus("Previous patient navigation selected")}
        >
          ‹
        </button>
        <button
          className={cn(
            "h-12 flex-1 cursor-pointer border-b-2 transition hover:bg-slate-50",
            topTab === "active" ? "border-[#446fd7] text-foreground" : "border-transparent text-muted-foreground",
          )}
          type="button"
          onClick={() => setTopTab("active")}
        >
          Active Patient
        </button>
        <button
          className={cn(
            "h-12 flex-1 cursor-pointer border-b-2 transition hover:bg-slate-50",
            topTab === "collaboration" ? "border-[#446fd7] text-foreground" : "border-transparent text-muted-foreground",
          )}
          type="button"
          onClick={() => setTopTab("collaboration")}
        >
          Collaboration
        </button>
        <button
          className="flex h-12 w-12 cursor-pointer items-center justify-center border-l border-border text-xl text-foreground transition hover:bg-slate-100"
          type="button"
          aria-label="Next patient"
          onClick={() => setActionStatus("Next patient navigation selected")}
        >
          ›
        </button>
      </div>

      <div className="max-h-[68dvh] overflow-y-auto p-4">
        <div className="overflow-hidden rounded-sm border border-[#d7e4fb]">
          <table className="w-full text-center text-sm">
            <thead>
              <tr className="bg-[#2f73cf] text-white">
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Event Name</th>
                <th className="px-3 py-3 font-semibold">Value</th>
                <th className="px-3 py-3 font-semibold">Event Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr
                  className="cursor-pointer border-t border-[#d7e4fb] transition"
                  key={event.name}
                  onClick={() => {
                    setSelectedEventIndex(index);
                    setActionStatus(`${event.name} selected`);
                  }}
                >
                  <td className={cn("px-3 py-3", selectedEventIndex === index && "bg-[#6aa3f4]")}>
                    <PriorityMeter level={event.priority} />
                  </td>
                  <td className={cn("px-3 py-3 font-medium", selectedEventIndex === index && "bg-[#6aa3f4] text-white")}>{event.name}</td>
                  <td className={cn("px-3 py-3 font-semibold", selectedEventIndex === index && "bg-[#6aa3f4] text-white")}>{event.value}</td>
                  <td className={cn("whitespace-nowrap px-3 py-3", selectedEventIndex === index && "bg-[#6aa3f4] text-white")}>{event.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 border-b border-border text-center text-sm font-semibold text-muted-foreground">
          <button
            className={cn(
              "cursor-pointer border-b-2 px-4 py-3 transition hover:bg-slate-50",
              detailTab === "repeat" ? "border-[#446fd7] text-foreground" : "border-transparent text-muted-foreground",
            )}
            type="button"
            onClick={() => setDetailTab("repeat")}
          >
            Repeat Bleed
          </button>
          <button
            className={cn(
              "cursor-pointer border-b-2 px-4 py-3 transition hover:bg-slate-50",
              detailTab === "details" ? "border-[#446fd7] text-foreground" : "border-transparent text-muted-foreground",
            )}
            type="button"
            onClick={() => setDetailTab("details")}
          >
            Details
          </button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="min-h-24 rounded-sm bg-[#f3f3f3] p-3 text-sm font-medium text-foreground">
            {topTab === "active" && detailTab === "repeat"
              ? `${selectedEvent.name}: Coffee ground colour amount about 100 ml. Blood in the vomiting.`
              : topTab === "active"
                ? `${selectedEvent.name} details: value ${selectedEvent.value}, priority ${selectedEvent.priority}, recorded at ${selectedEvent.time}.`
                : `Collaboration note: care team notified for ${selectedEvent.name}. Nurse and doctor acknowledgement pending.`}
          </div>
          <div className="min-h-20 rounded-sm bg-[#f3f3f3] p-3 text-sm font-medium text-foreground">
            Comments: Blood pressure going down. Current BP {patient.abps.value}/{patient.abpd.value}, HR {patient.hr.value}.
          </div>
          <div className="rounded-sm border border-[#d7e4fb] bg-[#f8fbff] p-2 text-xs font-semibold text-[#2f66aa]">
            {actionStatus}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-4">
          <Button className="min-w-24 bg-[#2f73cf] hover:bg-[#255ca8]" type="button" onClick={() => setActionStatus(`Actions opened for ${selectedEvent.name}`)}>Actions</Button>
          <Button className="min-w-24 bg-[#2f73cf] hover:bg-[#255ca8]" type="button" onClick={() => setActionStatus(`${selectedEvent.name} validated`)}>Validate</Button>
          <Button className="min-w-24 bg-[#2f73cf] hover:bg-[#255ca8]" type="button" onClick={() => setActionStatus(`${selectedEvent.name} saved`)}>Save</Button>
        </div>
      </div>
    </div>
  );
}

function PriorityMeter({ level }: { level: "high" | "medium" | "low" }) {
  return (
    <div className="mx-auto h-4 w-24 rounded-full bg-slate-200 shadow-inner">
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500",
          level === "high" && "w-20",
          level === "medium" && "w-14",
          level === "low" && "w-5",
        )}
      />
    </div>
  );
}

function buildPatientEvents(patient: Dashboard1Patient) {
  const highRisk = patientTone(patient) === "red";

  return [
    {
      name: patient.diagnosis.toLowerCase().includes("bleeding") ? "Bleeding" : "Clinical Alert",
      value: highRisk ? 1 : 0,
      time: "18/06/2026 20:03",
      priority: highRisk ? "high" : "medium",
    },
    {
      name: "Care Plan",
      value: 4,
      time: "18/06/2026 18:23",
      priority: "medium",
    },
    {
      name: "Microbiology",
      value: patient.temperature.tone === "red" ? 3 : 2,
      time: "18/06/2026 13:12",
      priority: patient.temperature.tone === "red" ? "high" : "low",
    },
  ] satisfies Array<{ name: string; value: number; time: string; priority: "high" | "medium" | "low" }>;
}

function DashboardLabResultsPopup({ patient }: { patient: Dashboard1Patient }) {
  const rapidReviewPatient = rapidReviewPatients.find((item) => item.id === patient.rapidReviewPatientId);

  return (
    <ResultsCenterView
      autoOpenAllDepartment="laboratory"
      autoOpenLatestDateOnly
      defaultDepartment="laboratory"
      patientContext={{
        ageSex: rapidReviewPatient?.ageGender,
        allergy: "Meropenem",
        bed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
        bloodGroup: "AB +ve",
        consultantDoctor: rapidReviewPatient?.consultant,
        dob: "30-12-1995",
        mrn: getDashboardResultPatientMrn(patient.id),
        name: patient.name,
        uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
        wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
      }}
      viewDescription="Laboratory reports for the selected dashboard patient."
      viewTitle="Laboratory Results"
    />
  );
}

function DashboardRadiologyReportPopup({ patient }: { patient: Dashboard1Patient }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900">Radiology report preview</p>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
            {patient.name} | {patient.bed}
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a download="radiology-report.pdf" href={RADIOLOGY_REPORT_URL}>
            <Download className="h-4 w-4" />
            Download
          </a>
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-md border border-slate-200 bg-slate-100 shadow-sm">
        <iframe
          className="h-[68dvh] w-full bg-white"
          src={`${RADIOLOGY_REPORT_URL}#toolbar=1&navpanes=0`}
          title={`Radiology report for ${patient.name}`}
        />
      </div>
    </div>
  );
}

function getDashboardResultPatientMrn(patientId: number) {
  const resultMrns = [
    "MRN-240118",
    "MRN-240119",
    "MRN-240121",
    "MRN-240124",
    "MRN-240126",
    "MRN-240127",
    "MRN-240130",
    "MRN-240133",
    "MRN-240135",
    "MRN-240136",
  ];

  return resultMrns[(patientId - 1) % resultMrns.length];
}

function MedicationInterventionPopup({ patient }: { patient: Dashboard1Patient }) {
  const [tab, setTab] = React.useState<"current" | "past" | "intervention">("current");
  const [addMedicineOpen, setAddMedicineOpen] = React.useState(false);

  const currentMedication: DashboardMedicationRow[] = [
    {
      name: "Inj. Pantoprazole",
      dose: "40 mg",
      route: "IV",
      frequency: "BD",
      startDate: "18/06/2026",
      status: "Active",
      prescribedBy: "Dr. Amandeep Singh",
    },
    {
      name: "Tab. Paracetamol",
      dose: "500 mg",
      route: "Oral",
      frequency: "SOS",
      startDate: "18/06/2026",
      status: "Active",
      prescribedBy: "Dr. Meera Rao",
    },
    {
      name: "Normal Saline",
      dose: "100 ml/hr",
      route: "IV",
      frequency: "Continuous",
      startDate: "18/06/2026",
      status: "Running",
      prescribedBy: "Dr. Super Admin",
    },
  ];

  const pastMedication: DashboardMedicationRow[] = [
    {
      name: "Tab. Azithromycin",
      dose: "500 mg",
      route: "Oral",
      frequency: "OD",
      startDate: "14/06/2026",
      endDate: "17/06/2026",
      status: "Completed",
      prescribedBy: "Dr. Meera Rao",
    },
    {
      name: "Inj. Ceftriaxone",
      dose: "1 g",
      route: "IV",
      frequency: "BD",
      startDate: "12/06/2026",
      endDate: "16/06/2026",
      status: "Stopped",
      prescribedBy: "Dr. Amandeep Singh",
    },
  ];

  const interventions = [
    {
      title: "Oxygen Support",
      detail: "Nasal cannula 2 L/min. Maintain SpO2 above 94%.",
      time: "18/06/2026 08:30 PM",
      status: "Active",
    },
    {
      title: "Fluid Monitoring",
      detail: "Strict input/output charting every 4 hours.",
      time: "18/06/2026 06:15 PM",
      status: "Ongoing",
    },
    {
      title: "Nursing Instruction",
      detail: "Monitor vitals every 30 minutes and inform doctor if BP drops.",
      time: "18/06/2026 05:45 PM",
      status: "Assigned",
    },
  ];

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center border-b bg-white text-sm font-semibold">
          <div className="flex min-w-0 flex-1">
            <MedicationTabButton active={tab === "current"} onClick={() => setTab("current")}>
              Current Medication
            </MedicationTabButton>
            <MedicationTabButton active={tab === "past"} onClick={() => setTab("past")}>
              Past Medication
            </MedicationTabButton>
            <MedicationTabButton active={tab === "intervention"} onClick={() => setTab("intervention")}>
              Intervention
            </MedicationTabButton>
          </div>
          <div className="group relative flex h-full shrink-0 items-center border-l border-slate-200 px-3">
            <Button
              aria-label="Add medicine from drug orders"
              className="h-9 w-9 shrink-0 rounded-full p-0"
              onClick={() => setAddMedicineOpen(true)}
              title="Add Medicine"
              type="button"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {!addMedicineOpen ? (
              <div className="pointer-events-none absolute right-14 top-1/2 z-[80] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                Add Medicine
              </div>
            ) : null}
          </div>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto p-5">
          {tab === "current" ? (
            <div className="space-y-4">
              <MedicationTable type="current" rows={currentMedication} />
            </div>
          ) : null}

          {tab === "past" ? (
            <MedicationTable type="past" rows={pastMedication} />
          ) : null}

          {tab === "intervention" ? (
            <div className="space-y-3">
              {interventions.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <p className="mt-1 text-sm font-medium text-slate-600">{item.detail}</p>
                      <div className="mt-2 text-xs font-semibold text-slate-400">{item.time}</div>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <CenterModal
        className="h-[min(88dvh,900px)] w-[min(96vw,1560px)]"
        description={`${patient.name} | ${patient.bed} | ${patient.diagnosis}`}
        onOpenChange={(open) => setAddMedicineOpen(open)}
        open={addMedicineOpen}
        title="Add Medicine"
      >
        <DoctorOrdersPage defaultTab="drugs" drugsOnly />
      </CenterModal>
    </>
  );
}

function MedicationTabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 border-b-2 px-4 py-3 text-center transition hover:bg-slate-50",
        active
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-slate-500",
      )}
    >
      {children}
    </button>
  );
}

function MedicationTable({
  rows,
  type,
}: {
  rows: DashboardMedicationRow[];
  type: "current" | "past";
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600">
          <tr>
            <th className="px-4 py-3">Medicine</th>
            <th className="px-4 py-3">Dose</th>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Frequency</th>
            <th className="px-4 py-3">Start Date</th>
            {type === "past" ? <th className="px-4 py-3">End Date</th> : null}
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Prescribed By</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={`${row.orderId ?? row.name}-${row.startDate}`} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-bold text-slate-900">{row.name}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.dose}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.route}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.frequency}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.startDate}</td>
              {type === "past" ? (
                <td className="px-4 py-3 font-medium text-slate-700">{row.endDate}</td>
              ) : null}
              <td className="px-4 py-3">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">{row.prescribedBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
