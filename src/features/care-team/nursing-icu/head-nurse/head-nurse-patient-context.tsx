"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect } from "@/features/operations/admin/admin-shared";
import { cn } from "@/lib/utils";
import { headNursePatients } from "./head-nurse-mock-data";
import type { HeadNurseModuleId, HeadNursePatientContextValue, HeadNurseTone } from "./head-nurse-types";

export function HeadNursePatientContext({
  children,
  initialPatientId,
  moduleId,
}: {
  children: (context: HeadNursePatientContextValue) => React.ReactNode;
  initialPatientId?: string;
  moduleId: HeadNurseModuleId;
}) {
  void moduleId;

  const searchParams = useSearchParams();
  const queryPatientId = searchParams.get("patientId") ?? "";
  const shouldShowPatientSelector = !initialPatientId && !queryPatientId;
  const [patientId, setPatientId] = React.useState(initialPatientId ?? queryPatientId);
  const patient = headNursePatients.find((item) => item.id === patientId);
  const patientPlaceholder = "Select patient";
  const patientOptions = [patientPlaceholder, ...headNursePatients.map((item) => `${item.id}|${item.bedNo} - ${item.patientName}`)];

  return (
    <div className="min-w-0 space-y-4">
      {patient ? <HeadNursePatientHeader patient={patient} /> : null}

      {shouldShowPatientSelector ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-3">
            <div className="w-full max-w-xl space-y-2">
              <p className="text-sm font-semibold text-slate-950">Patient</p>
              <NativeSelect
                label="Patient"
                value={patientId ? `${patientId}|${patient?.bedNo ?? ""} - ${patient?.patientName ?? ""}` : patientPlaceholder}
                onChange={(value) => setPatientId(value === patientPlaceholder ? "" : value.split("|")[0] ?? "")}
                options={patientOptions}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {children({ patient, patientId, setPatientId })}
    </div>
  );
}

function HeadNursePatientHeader({ patient }: { patient: (typeof headNursePatients)[number] }) {
  const nurseName = patient.assignedUnitNurse || "Not assigned";

  return (
    <div className="overflow-x-auto rounded-t-xl border border-indigo-400 bg-[#6571ea] px-4 py-4 shadow-md shadow-indigo-100">
      <div className="flex min-w-max items-center gap-5 whitespace-nowrap text-xs font-black text-white">
        <span className="text-base">{patient.patientName}</span>
        <HeadNurseHeaderChip>MR: {patient.mrn}</HeadNurseHeaderChip>
        <HeadNurseHeaderChip>Age/Sex: {patient.ageGender}</HeadNurseHeaderChip>
        <HeadNurseHeaderChip>Admission Time: {patient.admissionTime}</HeadNurseHeaderChip>
        <HeadNurseHeaderChip>Bed: {patient.bedNo}</HeadNurseHeaderChip>
        <HeadNurseHeaderChip>Unit: {patient.unit}</HeadNurseHeaderChip>
        <HeadNurseHeaderChip>Doctor: {patient.dutyDoctor}</HeadNurseHeaderChip>
        <HeadNurseHeaderChip>Nurse: {nurseName}</HeadNurseHeaderChip>
      </div>
    </div>
  );
}

function HeadNurseHeaderChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/15 px-4 py-1.5 shadow-sm shadow-indigo-500/10">{children}</span>;
}

export function HeadNurseEmptyPatientState({ moduleLabel }: { moduleLabel: string }) {
  return (
    <Card className="border-dashed border-slate-300 bg-white">
      <CardContent className="p-8 text-center">
        <p className="text-sm font-semibold text-slate-500">Select patient to view {moduleLabel}.</p>
      </CardContent>
    </Card>
  );
}

export function InfoTile({ label, value, inline = false }: { label: string; value: React.ReactNode; inline?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white px-3 py-2", inline && "flex items-center justify-between gap-3")}> 
      <p className={cn("text-xs font-bold uppercase tracking-wide text-slate-500", inline && "mt-0")}>{label}</p>
      <p className={cn("text-sm font-semibold text-slate-950", inline ? "mt-0" : "mt-1")}>{value}</p>
    </div>
  );
}

export function HeadNurseTonePill({ children, tone }: { children: React.ReactNode; tone: HeadNurseTone }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-black text-white", headNurseToneClass(tone))}>{children}</span>;
}

export function HeadNurseModuleLink({ children, href }: { children: React.ReactNode; href: string }) {
  return <Link className="font-bold text-sky-700 transition hover:text-sky-900" href={href}>{children}</Link>;
}

export function headNurseToneClass(tone: HeadNurseTone) {
  if (tone === "critical" || tone === "danger") return "bg-red-600";
  if (tone === "warning") return "bg-orange-500";
  if (tone === "success") return "bg-green-700";
  if (tone === "info") return "bg-sky-600";
  return "bg-slate-400";
}