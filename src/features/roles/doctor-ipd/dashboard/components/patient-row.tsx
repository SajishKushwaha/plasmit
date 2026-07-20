"use client";

import type * as React from "react";
import Link from "next/link";
import { Activity, ClipboardList, FileText, FlaskConical, PhoneCall, Pill } from "lucide-react";

import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { bpTone, bpValue, patientTone, patientToneCellClass, patientToneClass, patientToneRowClass, patientToneStripeClass } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { VitalPill } from "@/features/roles/doctor-ipd/dashboard/components/vital-pill";
import { cn } from "@/lib/utils";

type ActionTone = "dark" | "red" | "blue";

function RoundActionButton({
  icon: Icon,
  tone,
  label,
  onClick,
  dataTestId,
}: {
  icon: React.ElementType;
  tone: ActionTone;
  label: string;
  onClick?: () => void;
  dataTestId?: string;
}) {
  const actionClassName = cn(
    "relative z-20 inline-flex h-9 w-9 select-none items-center justify-center rounded-full text-white shadow-[0_4px_9px_rgba(15,23,42,0.20)] transition focus:outline-none focus:ring-2 focus:ring-slate-400/40",
    "cursor-pointer hover:scale-105 active:scale-95",
    tone === "dark" && "bg-[#4a4a4a]",
    tone === "red" && "bg-[#ff443e]",
    tone === "blue" && "bg-[#2563eb]",
  );

  return (
    <button
      aria-label={label}
      className={actionClassName}
      data-testid={dataTestId}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick?.();
      }}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function PatientRow({
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
      <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.hr} onClick={onOpenVitals} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.spo2} onClick={onOpenVitals} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><VitalPill value={bpValue(patient)} tone={bpTone(patient)} onClick={onOpenVitals} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><VitalPill {...patient.temperature} onClick={onOpenVitals} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><RoundActionButton icon={FlaskConical} tone="dark" label={`Open laboratory results for ${patient.name}`} onClick={onOpenLabResults} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><RoundActionButton icon={Pill} tone="dark" label={`Open medication and intervention for ${patient.name}`} onClick={onOpenMedication} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><RoundActionButton icon={ClipboardList} tone="dark" label={`Open progress note for ${patient.name}`} onClick={onOpenProgressNote} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><RoundActionButton icon={FileText} tone="dark" label={`Open radiology report for ${patient.name}`} onClick={onOpenRadiology} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><RoundActionButton dataTestId={`doctor-ipd-events-${patient.id}`} icon={Activity} tone="red" label={`Open events for ${patient.name}`} onClick={onOpenEvents} /></td>
      <td className="h-[74px] px-3 py-2 text-center"><RoundActionButton icon={PhoneCall} tone="blue" label={`Open collaborate for ${patient.name}`} onClick={onOpenCollaborate} /></td>
    </tr>
  );
}
