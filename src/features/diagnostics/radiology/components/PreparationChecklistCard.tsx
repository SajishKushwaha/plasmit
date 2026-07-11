import { CheckCircle2, Circle, ShieldAlert } from "lucide-react";

import type { Patient, RadiologyOrder, RadiologyTest } from "@/features/diagnostics/radiology/types";

interface PreparationChecklistCardProps {
  order: RadiologyOrder;
  patient: Patient;
  test: RadiologyTest;
}

export function PreparationChecklistCard({ order, patient, test }: PreparationChecklistCardProps) {
  const checklist = [
    { label: "Patient identity verified with MRN and phone", done: true },
    { label: test.contrast ? "Creatinine and contrast consent checked" : "No contrast consent required", done: !test.contrast || order.status !== "PREPARATION_PENDING" },
    { label: test.preparation, done: order.status !== "PREPARATION_PENDING" },
    { label: "Metallic objects, implants, and safety risks screened", done: order.modalityId !== "mod-mri" || order.status !== "PREPARATION_PENDING" },
  ];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{patient.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {order.orderNo} · {test.name}
          </p>
        </div>
        {patient.allergies ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
            <ShieldAlert className="h-3.5 w-3.5" />
            Allergy note
          </span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        {checklist.map((item) => (
          <div className="flex gap-2 text-sm" key={item.label}>
            {item.done ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" /> : <Circle className="mt-0.5 h-4 w-4 text-slate-400" />}
            <span className={item.done ? "text-slate-700" : "font-medium text-slate-950"}>{item.label}</span>
          </div>
        ))}
      </div>

      {patient.allergies ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{patient.allergies}</p> : null}
    </article>
  );
}
