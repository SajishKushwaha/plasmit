import Link from "next/link";

import { cn } from "@/lib/utils";
import { headNurseModules } from "./head-nurse-config";
import type { HeadNurseModuleId } from "./head-nurse-types";

export function HeadNurseMenu({ activeModuleId }: { activeModuleId: HeadNurseModuleId }) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-4">
      <div className="px-2 pb-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Head Nurse</p>
        <p className="mt-1 text-sm font-bold text-slate-950">Assignment and supervision</p>
      </div>
      <nav className="space-y-1">
        {headNurseModules.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeModuleId;
          return (
            <Link
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition",
                active
                  ? "rounded-2xl bg-[#6878E8] text-white shadow-[0_10px_24px_rgba(104,120,232,0.22)]"
                  : "text-slate-700 hover:bg-sky-50 hover:text-sky-700",
              )}
              href={item.route}
              key={item.id}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
