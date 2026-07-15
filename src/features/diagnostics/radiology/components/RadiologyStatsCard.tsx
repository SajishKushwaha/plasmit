import type { ReactNode } from "react";

interface RadiologyStatsCardProps {
  title: string;
  value: string | number;
  subtext: string;
  trend?: string;
  icon?: ReactNode;
}

export function RadiologyStatsCard({
  title,
  value,
  subtext,
  trend,
  icon,
}: RadiologyStatsCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{title}</p>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
        </div>
        {icon ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-600">
            {icon}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">{subtext}</span>
        {trend ? <span className="font-medium text-emerald-700">{trend}</span> : null}
      </div>
    </article>
  );
}
