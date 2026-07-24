"use client";

import Link from "next/link";
import { Activity, ClipboardList, FileText, FlaskConical, PhoneCall, Pill } from "lucide-react";

import type { DoctorIpdPatient, VitalTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { bpTone, bpValue, patientTone, patientToneCellClass, patientToneClass, patientToneRowClass, patientToneStripeClass } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { cn } from "@/lib/utils";

type PatientAction = (patient: DoctorIpdPatient) => void;
type ActionTone = "dark" | "event" | "collaborate";

export function PatientIconDashboard({
  onOpenCollaborate,
  onOpenEvents,
  onOpenLabResults,
  onOpenMedication,
  onOpenProgressNote,
  onOpenRadiology,
  onOpenVitals,
  patients,
}: {
  onOpenCollaborate: PatientAction;
  onOpenEvents: PatientAction;
  onOpenLabResults: PatientAction;
  onOpenMedication: PatientAction;
  onOpenProgressNote: PatientAction;
  onOpenRadiology: PatientAction;
  onOpenVitals: PatientAction;
  patients: DoctorIpdPatient[];
}) {
  if (!patients.length) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-10 text-center text-sm font-semibold text-slate-500">
        No patient matched this search.
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1360px] border-collapse text-left text-xs">
        <thead>
          <tr className="h-14 border-b border-slate-200 bg-white text-slate-700">
            <HeaderCell className="sticky left-0 z-50 h-14 w-[190px] min-w-[190px] border-r border-slate-200 bg-white shadow-[8px_0_14px_rgba(15,23,42,0.04)]">Patient</HeaderCell>
            <HeaderCell className="h-14 w-[230px] min-w-[230px]">Diagnosis</HeaderCell>
            <HeaderCell className="h-14">HR (bpm)</HeaderCell>
            <HeaderCell className="h-14">SpO2 (%)</HeaderCell>
            <HeaderCell className="h-14 min-w-[112px]">BP (mmHg)</HeaderCell>
            <HeaderCell className="h-14">Temperature<br />(°C)</HeaderCell>
            <HeaderCell className="h-14">Lab Results</HeaderCell>
            <HeaderCell className="h-14">Medication &<br />Intervention</HeaderCell>
            <HeaderCell className="h-14">Add Progress<br />Note</HeaderCell>
            <HeaderCell className="h-14">Radiology</HeaderCell>
            <HeaderCell className="h-14">Events</HeaderCell>
            <HeaderCell className="h-14">Collaborate</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <PatientIconDashboardRow
              key={patient.id}
              patient={patient}
              onOpenCollaborate={() => onOpenCollaborate(patient)}
              onOpenEvents={() => onOpenEvents(patient)}
              onOpenLabResults={() => onOpenLabResults(patient)}
              onOpenMedication={() => onOpenMedication(patient)}
              onOpenProgressNote={() => onOpenProgressNote(patient)}
              onOpenRadiology={() => onOpenRadiology(patient)}
              onOpenVitals={() => onOpenVitals(patient)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PatientIconDashboardRow({
  patient,
  onOpenCollaborate,
  onOpenEvents,
  onOpenLabResults,
  onOpenMedication,
  onOpenProgressNote,
  onOpenRadiology,
  onOpenVitals,
}: {
  patient: DoctorIpdPatient;
  onOpenCollaborate: () => void;
  onOpenEvents: () => void;
  onOpenLabResults: () => void;
  onOpenMedication: () => void;
  onOpenProgressNote: () => void;
  onOpenRadiology: () => void;
  onOpenVitals: () => void;
}) {
  const tone = patientTone(patient);

  return (
    <tr className={cn("h-[74px] border-b border-slate-100 font-semibold", patientToneRowClass(tone))}>
      <td className={cn("sticky left-0 z-40 h-[74px] w-[190px] min-w-[190px] border-r border-slate-200 px-3 py-2 shadow-[8px_0_14px_rgba(15,23,42,0.04)]", patientToneCellClass(tone))}>
        <span aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-white" />
        <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 z-20 w-1", patientToneStripeClass(tone))} />
        <Link className="relative z-10 flex min-h-[58px] flex-col justify-center rounded-md px-1 py-1 pl-2 transition hover:bg-slate-50" href={`/doctor-ipd/patients/${patient.id}`}>
          <div className={cn("whitespace-nowrap text-sm font-extrabold leading-5", patientToneClass(tone))}>{patient.name}</div>
          <div className="mt-0.5 break-words font-semibold leading-4 text-slate-700">{patient.bed}</div>
        </Link>
      </td>
      <td className="h-[74px] w-[230px] min-w-[230px] px-3 py-2 text-center font-medium text-slate-800">
        <Link className="flex min-h-12 items-center justify-center rounded-md px-2 py-1 leading-4 transition hover:bg-slate-100" href={`/doctor-ipd/patients/${patient.id}?tab=clinical-examination`}>
          {patient.diagnosis}
        </Link>
      </td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2VitalCircle label="HR" onClick={onOpenVitals} tone={patient.hr.tone} value={patient.hr.value} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2VitalCircle label="SpO2" onClick={onOpenVitals} tone={patient.spo2.tone} value={patient.spo2.value} /></td>
      <td className="h-[74px] min-w-[112px] px-3 py-2 text-center"><Dashboard2VitalCircle wide label="BP" onClick={onOpenVitals} tone={bpTone(patient)} value={bpValue(patient)} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2VitalCircle label="Temperature" onClick={onOpenVitals} tone={patient.temperature.tone} value={patient.temperature.value} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2ActionCircle icon={FlaskConical} label={`Open laboratory results for ${patient.name}`} onClick={onOpenLabResults} tone="dark" /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2ActionCircle icon={Pill} label={`Open medication and intervention for ${patient.name}`} onClick={onOpenMedication} tone="dark" /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2ActionCircle icon={ClipboardList} label={`Open add progress note for ${patient.name}`} onClick={onOpenProgressNote} tone="dark" /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2ActionCircle icon={FileText} label={`Open radiology report for ${patient.name}`} onClick={onOpenRadiology} tone="dark" /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2ActionCircle icon={Activity} label={`Open events for ${patient.name}`} onClick={onOpenEvents} tone="event" /></td>
      <td className="h-[74px] px-3 py-2 text-center"><Dashboard2ActionCircle icon={PhoneCall} label={`Open collaborate for ${patient.name}`} onClick={onOpenCollaborate} tone="collaborate" /></td>
    </tr>
  );
}

function HeaderCell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={cn("px-3 py-3 text-center align-middle text-xs font-extrabold text-slate-900", className)}>{children}</th>;
}

function Dashboard2VitalCircle({
  label,
  onClick,
  tone,
  value,
  wide = false,
}: {
  label: string;
  onClick: () => void;
  tone: VitalTone;
  value: string | number;
  wide?: boolean;
}) {
  return (
    <button
      aria-label={`${label} ${value}`}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[4px] bg-white text-sm font-extrabold text-slate-950 shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40 active:scale-95 sm:text-base",
        wide ? "h-[56px] min-w-[76px] px-3 sm:h-[60px] sm:min-w-[84px]" : "h-[56px] w-[56px] sm:h-[60px] sm:w-[60px]",
        tone === "red" && "border-[#ff0808]",
        tone === "orange" && "border-[#ffa600]",
        tone === "green" && "border-[#e5e7eb]",
      )}
      onClick={onClick}
      type="button"
    >
      {value}
    </button>
  );
}

function Dashboard2ActionCircle({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone: ActionTone;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        "inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#1f1f1f] text-white shadow-[0_8px_16px_rgba(15,23,42,0.18)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40 active:scale-95 sm:h-[56px] sm:w-[56px]",
        tone === "event" && "border-[4px] border-[#ff0808]",
        tone === "collaborate" && "border-[4px] border-[#2563eb]",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
    </button>
  );
}
