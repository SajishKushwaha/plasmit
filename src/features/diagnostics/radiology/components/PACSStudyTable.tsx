import type { Modality, PACSStudy, Patient } from "@/features/diagnostics/radiology/types";
import { ModalityBadge } from "@/features/diagnostics/radiology/components/ModalityBadge";
import { formatDateTime } from "@/features/diagnostics/radiology/utils/formatters";

interface PACSStudyTableProps {
  studies: PACSStudy[];
  patients: Patient[];
  modalities: Modality[];
}

export function PACSStudyTable({ studies, patients, modalities }: PACSStudyTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Accession</th>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Study</th>
            <th className="px-4 py-3">Images</th>
            <th className="px-4 py-3">PACS Status</th>
            <th className="px-4 py-3 text-right">Viewer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {studies.map((study) => {
            const patient = patients.find((item) => item.id === study.patientId);
            const modality = modalities.find((item) => item.id === study.modalityId);

            return (
              <tr className="hover:bg-slate-50" key={study.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{study.accessionNo}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(study.studyDateTime)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-950">{patient?.name ?? study.patientId}</p>
                  <p className="text-xs text-slate-500">{patient?.mrn ?? "MRN pending"}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{study.studyDescription}</p>
                  <p className="text-xs text-slate-500">{modality?.room ?? study.modalityId}</p>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{study.imageCount}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ModalityBadge modalityId={study.modalityId} />
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {study.pacsStatus}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <a className="font-medium text-sky-700 hover:text-sky-900" href={study.viewerUrl}>
                    Open study
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
