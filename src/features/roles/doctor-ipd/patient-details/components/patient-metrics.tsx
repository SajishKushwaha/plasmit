"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

export function dashboardBpValue(patient: DoctorIpdPatient) {
  return `${patient.abps.value}/${patient.abpd.value}`;
}

export function dashboardBpTone(patient: DoctorIpdPatient): DoctorIpdPatient["abps"]["tone"] {
  if (patient.abps.tone === "red" || patient.abpd.tone === "red") return "red";
  if (patient.abps.tone === "orange" || patient.abpd.tone === "orange") return "orange";
  return "green";
}

export function PatientMetrics({ patient }: { patient: DoctorIpdPatient }) {
  return (
    <Card className="overflow-hidden border-border/80">
      <CardContent className="grid grid-cols-2 gap-3 p-1 lg:grid-cols-4">
        <PatientMetric label="HR" value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
        <PatientMetric label="SpO2" value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
        <PatientMetric label="BP" value={`${dashboardBpValue(patient)} mmHg`} tone={dashboardBpTone(patient)} />
        <PatientMetric label="Temperature" value={`${patient.temperature.value} °C`} tone={patient.temperature.tone} />
      </CardContent>
    </Card>
  );
}

export function PatientMetric({ label, value, tone }: { label: string; value: string; tone: DoctorIpdPatient["hr"]["tone"] }) {
  const status = tone === "red" ? "Critical" : tone === "orange" ? "Watch" : "Normal";
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white p-3 shadow-sm",
        tone === "green" && "border-emerald-200/80",
        tone === "orange" && "border-orange-200/80",
        tone === "red" && "border-red-200/80",
      )}
    >
      <div className={cn("absolute inset-y-0 left-0 w-1", tone === "green" && "bg-emerald-500", tone === "orange" && "bg-orange-500", tone === "red" && "bg-red-500")} />
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <span className={cn("text-[10px] font-semibold", tone === "green" && "text-emerald-700", tone === "orange" && "text-orange-600", tone === "red" && "text-red-600")}>{status}</span>
      </div>
      <div
        className={cn(
          "mt-2 text-xl font-bold tracking-tight",
          tone === "green" && "text-emerald-700",
          tone === "orange" && "text-orange-600",
          tone === "red" && "text-red-600",
        )}
      >
        {value}
      </div>
    </div>
  );
}
