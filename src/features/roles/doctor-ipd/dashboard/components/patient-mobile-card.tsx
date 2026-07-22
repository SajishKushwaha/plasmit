"use client";

import type * as React from "react";
import Link from "next/link";
import { Activity, ClipboardList, FileText, FlaskConical, PhoneCall, Pill } from "lucide-react";

import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { bpTone, bpValue, mobilePatientBed, mobilePatientNameClass, mobilePatientStatus, mobilePatientStatusClass, mobilePatientUhid, patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { MobileVitalBadge } from "@/features/roles/doctor-ipd/dashboard/components/vital-pill";
import { cn } from "@/lib/utils";

type ActionTone = "dark" | "red" | "blue";

function MobileDashboardAction({
  badge,
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  badge?: number;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  tone: ActionTone;
}) {
  return (
    <button aria-label={label} className={mobileDashboardActionClassName(tone)} onClick={onClick} type="button">
      <Icon className="h-4 w-4" />
      {badge ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-extrabold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function mobileDashboardActionClassName(tone: ActionTone) {
  return cn(
    "relative mx-auto inline-flex h-9 w-9 min-w-0 items-center justify-center rounded-full text-white shadow-[0_4px_9px_rgba(15,23,42,0.20)] transition active:scale-95",
    tone === "dark" && "bg-[#4a4a4a]",
    tone === "red" && "bg-[#ff443e]",
    tone === "blue" && "bg-[#2563eb]",
  );
}

export function PatientMobileCard({
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
  const vitalItems = [
    { label: "HR", value: patient.hr.value, tone: patient.hr.tone },
    { label: "SpO2", value: patient.spo2.value, tone: patient.spo2.tone },
    { label: "BP", value: bpValue(patient), tone: bpTone(patient) },
    { label: "Temp", value: patient.temperature.value, tone: patient.temperature.tone },
  ];
  const labBadge = patient.hr.tone === "red" || patient.spo2.tone === "red" ? 2 : patient.hr.tone === "orange" ? 1 : undefined;
  const medicationBadge = patient.abps.tone !== "green" ? 1 : undefined;

  return (
    <article className="overflow-hidden rounded-lg border border-[#e5e7eb] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0">
          <Link className={cn("block truncate text-base font-extrabold leading-6", mobilePatientNameClass(tone))} href={`/doctor-ipd/patients/${patient.id}`}>
            {patient.name}
          </Link>
          <div className="mt-0.5 truncate text-xs font-semibold text-[#64748b]">
            {mobilePatientUhid(patient)} · Bed {mobilePatientBed(patient)}
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold", mobilePatientStatusClass(tone))}>
          {mobilePatientStatus(tone)}
        </span>
      </div>

      <div className="border-t border-[#e5e7eb] px-3 py-3">
        <div className="grid grid-cols-4 gap-2">
          {vitalItems.map((item) => (
            <MobileVitalBadge key={item.label} {...item} onClick={onOpenVitals} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 border-t border-[#f1f5f9] px-3 py-3">
        <MobileDashboardAction badge={labBadge} icon={FlaskConical} label={`Open laboratory results for ${patient.name}`} onClick={onOpenLabResults} tone="dark" />
        <MobileDashboardAction badge={medicationBadge} icon={Pill} label={`Open medication and intervention for ${patient.name}`} onClick={onOpenMedication} tone="dark" />
        <MobileDashboardAction icon={ClipboardList} label={`Open add progress for ${patient.name}`} onClick={onOpenProgressNote} tone="dark" />
        <MobileDashboardAction icon={FileText} label={`Open radiology report for ${patient.name}`} onClick={onOpenRadiology} tone="dark" />
        <MobileDashboardAction icon={Activity} label={`Open events for ${patient.name}`} onClick={onOpenEvents} tone="red" />
        <MobileDashboardAction icon={PhoneCall} label={`Open collaborate for ${patient.name}`} onClick={onOpenCollaborate} tone="blue" />
      </div>
    </article>
  );
}
