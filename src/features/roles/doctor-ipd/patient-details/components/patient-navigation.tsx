"use client";

import {
  Activity,
  ChartNoAxesCombined,
  ClipboardCheck,
  FilePenLine,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Radio,
  Stethoscope,
} from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function PatientNavigation() {
  return (
    <div className="horizontal-scrollbar max-w-full overflow-x-auto rounded-xl border border-border bg-white/95 p-1 pb-2 shadow-sm">
      <TabsList className="inline-flex h-auto w-max min-w-max rounded-lg bg-surface-muted/70 p-1">
        <PatientTab icon={LayoutDashboard} label="Overview" value="overview" />
        <PatientTab icon={Radio} label="Live Monitoring" value="live-monitoring" />
        <PatientTab icon={Stethoscope} label="Clinical Exam" value="clinical-examination" />
        <PatientTab icon={FlaskConical} label="Results" value="results" />
        <PatientTab icon={HeartPulse} label="Vitals" value="vitals" />
        <PatientTab icon={ClipboardCheck} label="Assessment" value="assessment" />
        <PatientTab icon={FilePenLine} label="Add Progress" value="add-progress" />
        <PatientTab icon={ClipboardCheck} label="Progress Note" value="shift-summary" />
        <PatientTab icon={ChartNoAxesCombined} label="Orders" value="orders" />
        <PatientTab icon={ChartNoAxesCombined} label="Intake Output" value="Intake Output" />
      </TabsList>
    </div>
  );
}

function PatientTab({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <TabsTrigger
      className="h-10 min-w-[132px] shrink-0 rounded-lg bg-transparent px-3 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
      value={value}
    >
      <span className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    </TabsTrigger>
  );
}
