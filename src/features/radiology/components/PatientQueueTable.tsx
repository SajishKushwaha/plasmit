import Link from "next/link";

import type { Patient, RadiologyOrder, RadiologyTest } from "@/features/radiology/types";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";
import { PriorityBadge } from "@/features/radiology/components/PriorityBadge";
import { RadiologyStatusBadge } from "@/features/radiology/components/RadiologyStatusBadge";

interface PatientQueueTableProps {
  orders: RadiologyOrder[];
  patients: Patient[];
  tests: RadiologyTest[];
}

export function PatientQueueTable({ orders, patients, tests }: PatientQueueTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No patients are currently waiting in radiology.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Queue</th>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Test</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order, index) => {
            const patient = patients.find((item) => item.id === order.patientId);
            const test = tests.find((item) => item.id === order.testIds[0]);

            return (
              <tr className="hover:bg-slate-50" key={order.id}>
                <td className="px-4 py-3 font-semibold text-slate-900">Q-{String(index + 1).padStart(2, "0")}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-950">{patient?.name ?? "Unknown patient"}</p>
                  <p className="text-xs text-slate-500">{patient?.mrn ?? order.patientId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{test?.name ?? order.testIds.join(", ")}</p>
                  <div className="mt-1">
                    <ModalityBadge modalityId={order.modalityId} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={order.priority} />
                </td>
                <td className="px-4 py-3">
                  <RadiologyStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link className="font-medium text-sky-700 hover:text-sky-900" href={`/radiology/orders/${order.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
