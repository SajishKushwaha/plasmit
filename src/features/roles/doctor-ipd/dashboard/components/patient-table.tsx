"use client";

import * as React from "react";

import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { PatientMobileCard } from "@/features/roles/doctor-ipd/dashboard/components/patient-mobile-card";
import { PatientRow } from "@/features/roles/doctor-ipd/dashboard/components/patient-row";
import { cn } from "@/lib/utils";

type PatientAction = (patient: DoctorIpdPatient) => void;

export function PatientTable({
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
  return (
    <>
      <div className="space-y-3 p-3 md:hidden">
        {patients.map((patient) => (
          <PatientMobileCard
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
        {!patients.length ? (
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-8 text-center text-sm font-semibold text-slate-500">
            No patient matched this search.
          </div>
        ) : null}
      </div>
      <div className="hidden max-w-full overflow-x-auto md:block">
        <table className="w-full min-w-[1360px] border-collapse text-left text-xs">
          <thead>
            <tr className="h-14 border-b border-slate-200 bg-white text-slate-700">
              <HeaderCell className="sticky left-0 z-50 h-14 w-[190px] min-w-[190px] border-r border-slate-200 bg-white shadow-[8px_0_14px_rgba(15,23,42,0.04)]">Patient</HeaderCell>
              <HeaderCell className="h-14 w-[230px] min-w-[230px]">Diagnosis</HeaderCell>
              <HeaderCell className="h-14">HR (bpm)</HeaderCell>
              <HeaderCell className="h-14">SpO2 (%)</HeaderCell>
              <HeaderCell className="h-14">BP (mmHg)</HeaderCell>
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
            {patients.map((patient) => (
              <PatientRow
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
            {!patients.length ? (
              <tr>
                <td className="px-4 py-12 text-center text-sm font-medium text-muted-foreground" colSpan={13}>
                  No patient matched this search.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HeaderCell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={cn("px-3 py-3 text-center align-middle text-xs font-extrabold text-slate-900", className)}>{children}</th>;
}
