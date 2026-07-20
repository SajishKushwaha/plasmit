"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const IcuCommandCenterPatientsSurfaceContext = React.createContext(false);

export function useIcuCommandCenterPatientsSurface() {
  return React.useContext(IcuCommandCenterPatientsSurfaceContext);
}

export function IcuCommandCenterPatientsLayout({ children }: { children: React.ReactNode }) {
  return (
    <IcuCommandCenterPatientsSurfaceContext.Provider value>
      <div className="min-w-0 max-w-full overflow-x-hidden px-3 pb-8 sm:px-4">{children}</div>
    </IcuCommandCenterPatientsSurfaceContext.Provider>
  );
}

export function MobileCommandCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-slate-200 bg-white p-3 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function MobileCommandCardRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 border-b border-slate-100 py-2 text-sm last:border-b-0 last:pb-0 first:pt-0",
        className,
      )}
    >
      <span className="shrink-0 font-medium text-slate-500">{label}</span>
      <span className="min-w-0 text-right font-semibold text-slate-900">{value}</span>
    </div>
  );
}
