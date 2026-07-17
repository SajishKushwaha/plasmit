import { Phone, Stethoscope, UserRound } from "lucide-react";

import type { Patient, RadiologyOrder } from "@/features/diagnostics/radiology/types";
import {
  formatPatientAgeGender,
  getInitials,
} from "@/features/diagnostics/radiology/utils/formatters";

interface PatientSummaryCardProps {
  patient: Patient;
  order?: RadiologyOrder;
}

export function PatientSummaryCard({ patient, order }: PatientSummaryCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sm font-semibold text-sky-800">
          {getInitials(patient.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-950">{patient.name}</h3>
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-600">
              {patient.mrn}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatPatientAgeGender(patient.age, patient.gender)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-start gap-2">
          <Stethoscope className="mt-0.5 h-4 w-4 text-slate-400" />
          <span>{patient.consultant}</span>
        </div>
        <div className="flex items-start gap-2">
          <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />
          <span>{patient.department}</span>
        </div>
        <div className="text-slate-500">{patient.location}</div>
      </div>

      {order ? (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-900">{order.orderNo}</p>
          <p className="mt-1 text-slate-600">{order.clinicalIndication}</p>
        </div>
      ) : null}
    </article>
  );
}
