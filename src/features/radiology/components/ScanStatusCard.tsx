import { Activity, Clock, MonitorUp } from "lucide-react";

import type { Modality, Patient, RadiologyOrder, RadiologyTest } from "@/features/radiology/types";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";
import { PriorityBadge } from "@/features/radiology/components/PriorityBadge";
import { RadiologyStatusBadge } from "@/features/radiology/components/RadiologyStatusBadge";
import { getRadiologyProgress } from "@/features/radiology/utils/status";

interface ScanStatusCardProps {
  order: RadiologyOrder;
  patient: Patient;
  test: RadiologyTest;
  modality: Modality;
}

export function ScanStatusCard({ order, patient, test, modality }: ScanStatusCardProps) {
  const progress = getRadiologyProgress(order.status);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <ModalityBadge modalityId={order.modalityId} />
            <PriorityBadge priority={order.priority} />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-950">{patient.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {test.name} · {order.orderNo}
          </p>
        </div>
        <RadiologyStatusBadge status={order.status} />
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sky-700" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <MonitorUp className="h-4 w-4 text-slate-400" />
          {modality.room}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-400" />
          {test.durationMinutes} min
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-slate-400" />
          {modality.machine}
        </div>
      </div>
    </article>
  );
}
