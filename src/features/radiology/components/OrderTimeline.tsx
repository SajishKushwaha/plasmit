import type { RadiologyOrder, RadiologyStatus } from "@/features/radiology/types";
import { formatDateTime } from "@/features/radiology/utils/formatters";
import { radiologyStatusLabels, radiologyStatusOrder } from "@/features/radiology/utils/status";

interface OrderTimelineProps {
  order: RadiologyOrder;
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  const currentIndex = radiologyStatusOrder.indexOf(order.status);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Order Timeline</h2>
          <p className="text-sm text-slate-500">Every clinical, billing, scan, PACS, and reporting milestone.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {order.timeline.length} events
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {radiologyStatusOrder.map((status: RadiologyStatus, index) => {
          const event = order.timeline.find((item) => item.status === status);
          const isDone = event !== undefined || index <= currentIndex;
          const isCurrent = status === order.status;

          return (
            <div className="grid grid-cols-[24px_1fr] gap-3" key={status}>
              <div className="flex flex-col items-center">
                <span
                  className={[
                    "mt-1 h-3 w-3 rounded-full border",
                    isCurrent
                      ? "border-sky-700 bg-sky-700"
                      : isDone
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-slate-300 bg-white",
                  ].join(" ")}
                />
                {index < radiologyStatusOrder.length - 1 ? <span className="mt-1 h-full min-h-6 w-px bg-slate-200" /> : null}
              </div>
              <div className={["rounded-lg border p-3", isCurrent ? "border-sky-200 bg-sky-50" : "border-slate-200 bg-white"].join(" ")}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-950">{event?.label ?? radiologyStatusLabels[status]}</p>
                  <span className="text-xs text-slate-500">{event ? formatDateTime(event.timestamp) : "Pending"}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{event?.note ?? event?.actor ?? (isDone ? "Completed" : "Waiting for action")}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
