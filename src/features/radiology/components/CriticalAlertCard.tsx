import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { CriticalAlert, Patient, RadiologyOrder } from "@/features/radiology/types";
import { formatDateTime } from "@/features/radiology/utils/formatters";

interface CriticalAlertCardProps {
  alert: CriticalAlert;
  patient: Patient;
  order: RadiologyOrder;
}

export function CriticalAlertCard({ alert, patient, order }: CriticalAlertCardProps) {
  const isCritical = alert.severity === "Critical";

  return (
    <article
      className={[
        "rounded-lg border p-4 shadow-sm",
        isCritical ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className={["rounded-lg p-2", isCritical ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"].join(" ")}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-950">{patient.name}</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{alert.severity}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700">{alert.finding}</p>
          <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <span>{order.orderNo}</span>
            <span>Notified: {alert.notifiedTo}</span>
            <span>{formatDateTime(alert.notifiedAt)}</span>
            <span className="inline-flex items-center gap-1 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {alert.status}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
