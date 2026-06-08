"use client";

import Link from "next/link";
import {
  Activity,
  ClipboardList,
  FileText,
  FlaskConical,
  MessageCircle,
  Pill,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type VitalTone = "green" | "orange" | "red";
type PatientTone = "blue" | "orange" | "red";

type Dashboard1Patient = {
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

const orderedPatients = [...patients].sort((a, b) => {
  const toneRank = patientToneOrder[patientTone(a)] - patientToneOrder[patientTone(b)];
  return toneRank || a.id - b.id;
});

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

function patientTone(patient: Dashboard1Patient): PatientTone {
  const tones = [patient.hr.tone, patient.spo2.tone, patient.abps.tone, patient.abpd.tone, patient.temperature.tone];
  if (tones.includes("red")) return "red";
  if (tones.includes("orange")) return "orange";
  return "blue";
}

function patientToneClass(tone: PatientTone) {
  if (tone === "red") return "text-red-600";
  if (tone === "orange") return "text-orange-500";
  return "text-blue-700";
}

export function DoctorDashboard1Page() {
  return (
    <div className="space-y-4 py-4">
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
                  <HeaderCell>Shift Summary</HeaderCell>
                  <HeaderCell>Radiology</HeaderCell>
                  <HeaderCell>Events</HeaderCell>
                  <HeaderCell>Collaborate</HeaderCell>
                </tr>
              </thead>
              <tbody>
                {orderedPatients.map((patient) => {
                  const tone = patientTone(patient);

                  return (
                  <tr className="border-b border-slate-100 bg-white hover:bg-slate-50" key={patient.id}>
                    <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2">
                      <Link
                        className="block rounded-md px-1 py-0.5 transition hover:bg-slate-100"
                        href={`/rapid-review?tab=entry&patient=${patient.rapidReviewPatientId}`}
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
                    <td className="px-3 py-2 text-center"><RoundAction icon={Pill} tone="dark" href="/doctor/orders" label="Open medication and intervention" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={ClipboardList} tone="dark" href="/rapid-review" label="Open shift summary" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={FileText} tone="dark" href="/radiology" label="Open radiology" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={Activity} tone="red" href="/rapid-review" label="Open events" /></td>
                    <td className="px-3 py-2 text-center"><RoundAction icon={MessageCircle} tone="dark" href="/rapid-review" label="Open collaborate" /></td>
                  </tr>
                  );
                })}
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
      </div>
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
