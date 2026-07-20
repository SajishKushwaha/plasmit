"use client";

import { cn } from "@/lib/utils";
import type { VitalTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";

export function VitalPill({ value, tone, onClick }: { value: string | number; tone: VitalTone; onClick: () => void }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 min-w-12 items-center justify-center rounded-full px-3 text-sm font-bold text-white shadow-[0_4px_9px_rgba(15,23,42,0.22)] transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400/40",
        tone === "green" && "bg-[#008d0c]",
        tone === "orange" && "bg-[#ffa600]",
        tone === "red" && "bg-[#ff0808]",
      )}
      onClick={onClick}
      type="button"
    >
      {value}
    </button>
  );
}

export function MobileVitalBadge({ label, onClick, value, tone }: { label: string; onClick: () => void; value: string | number; tone: VitalTone }) {
  return (
    <button className="flex min-w-0 flex-col items-center gap-1.5 rounded-md outline-none transition active:scale-95 focus-visible:ring-2 focus-visible:ring-blue-300" onClick={onClick} type="button">
      <span className="truncate text-[10px] font-bold text-[#64748b]">{label}</span>
      <span
        className={cn(
          "inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[10px] font-extrabold",
          tone === "green" && "bg-[#008d0c] text-white shadow-[0_4px_9px_rgba(15,23,42,0.22)]",
          tone === "orange" && "bg-[#ffa600] text-white shadow-[0_4px_9px_rgba(15,23,42,0.22)]",
          tone === "red" && "bg-[#ff0808] text-white shadow-[0_4px_9px_rgba(15,23,42,0.22)]",
        )}
      >
        {value}
      </span>
    </button>
  );
}
