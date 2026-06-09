import type { Patient, RadiologyOrder, RadiologyTest, Schedule, Technician } from "@/features/radiology/types";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";
import { RadiologyStatusBadge } from "@/features/radiology/components/RadiologyStatusBadge";

interface TechnicianWorklistTableProps {
  schedules: Schedule[];
  orders: RadiologyOrder[];
  patients: Patient[];
  tests: RadiologyTest[];
  technicians: Technician[];
}

export function TechnicianWorklistTable({ schedules, orders, patients, tests, technicians }: TechnicianWorklistTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Slot</th>
            <th className="px-4 py-3">Patient</th>
            <th className="px-4 py-3">Study</th>
            <th className="px-4 py-3">Technician</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedules.map((schedule) => {
            const order = orders.find((item) => item.id === schedule.orderId);
            const patient = patients.find((item) => item.id === schedule.patientId);
            const test = tests.find((item) => item.id === schedule.testId);
            const technician = technicians.find((item) => item.id === schedule.technicianId);

            return (
              <tr className="hover:bg-slate-50" key={schedule.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{schedule.startTime}</p>
                  <p className="text-xs text-slate-500">{schedule.room}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-950">{patient?.name ?? schedule.patientId}</p>
                  <p className="text-xs text-slate-500">{order?.orderNo ?? schedule.orderId}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{test?.name ?? schedule.testId}</p>
                  <div className="mt-1">
                    <ModalityBadge modalityId={schedule.modalityId} />
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{technician?.name ?? "Unassigned"}</td>
                <td className="px-4 py-3">
                  <RadiologyStatusBadge status={schedule.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
