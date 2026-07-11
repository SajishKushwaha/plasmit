import type { Patient, Radiologist, RadiologyOrder, RadiologyReport, RadiologyTest } from "@/features/diagnostics/radiology/types";
import { formatDateTime } from "@/features/diagnostics/radiology/utils/formatters";

interface ReportPreviewProps {
  report: RadiologyReport;
  order: RadiologyOrder;
  patient: Patient;
  test: RadiologyTest;
  radiologist: Radiologist;
}

export function ReportPreview({ report, order, patient, test, radiologist }: ReportPreviewProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">Plasmit Hospital Radiology</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{test.name}</h2>
          </div>
          <div className="text-right text-sm text-slate-600">
            <p className="font-medium text-slate-900">{order.orderNo}</p>
            <p>{formatDateTime(report.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Patient</p>
          <p className="mt-1 font-semibold text-slate-950">{patient.name}</p>
          <p className="text-slate-600">{patient.mrn}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Consultant</p>
          <p className="mt-1 font-semibold text-slate-950">{patient.consultant}</p>
          <p className="text-slate-600">{patient.department}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500">Radiologist</p>
          <p className="mt-1 font-semibold text-slate-950">{radiologist.name}</p>
          <p className="text-slate-600">{radiologist.specialization}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5 text-sm leading-6 text-slate-800">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Clinical Indication</h3>
          <p className="mt-2">{order.clinicalIndication}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Findings</h3>
          <p className="mt-2 whitespace-pre-line">{report.findings}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Impression</h3>
          <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4 font-medium text-slate-950">{report.impression}</p>
        </section>
      </div>
    </article>
  );
}
