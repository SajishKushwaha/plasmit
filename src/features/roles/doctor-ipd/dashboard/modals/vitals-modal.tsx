"use client";

import * as React from "react";

import { LiveMonitoringPage } from "@/features/clinical/live-monitoring/live-monitoring-page";
import { rapidReviewPatients } from "@/features/clinical/rapid-review/rapid-review-data";
import { PatientVitalsAllGraphOnly } from "@/features/clinical/rapid-review/rapid-review-graph";
import type { DoctorIpdPatient, VitalTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { bpTone, bpValue } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { cn } from "@/lib/utils";

export function DashboardVitalsPopup({ patient }: { patient: DoctorIpdPatient }) {
  const [tab, setTab] = React.useState<"overview" | "live">("overview");
  const vitals = dashboardVitalsForPatient(patient);
  const rapidReviewPatient = rapidReviewPatients.find((item) => item.id === patient.rapidReviewPatientId);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f8fafc]">
      <div className="shrink-0 border-b border-slate-200 bg-white p-3">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="grid min-w-[360px] grid-cols-2 gap-1 rounded-lg bg-slate-100/80 p-1 text-sm font-bold sm:max-w-[420px]">
            <button className={cn("rounded-lg px-3 py-2 transition", tab === "overview" ? "bg-white text-[#7367f0] shadow-sm" : "text-slate-600 hover:bg-white/70")} onClick={() => setTab("overview")} type="button">
              Overview
            </button>
            <button className={cn("rounded-lg px-3 py-2 transition", tab === "live" ? "bg-white text-[#7367f0] shadow-sm" : "text-slate-600 hover:bg-white/70")} onClick={() => setTab("live")} type="button">
              Live Monitoring
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="space-y-4">
          {tab === "overview" ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {vitals.map((vital) => (
                  <DashboardSinglePatientMetric key={vital.label} {...vital} />
                ))}
              </div>
              {rapidReviewPatient ? <PatientVitalsAllGraphOnly patient={rapidReviewPatient} /> : <DashboardVitalsUnavailable />}
            </div>
          ) : (
            <div className="space-y-4">
              <LiveMonitoringPage />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardSinglePatientMetric({ label, value, tone, unit }: { label: string; value: string | number; tone: VitalTone; unit: string }) {
  const status = tone === "red" ? "Critical" : tone === "orange" ? "Watch" : "Normal";
  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-white p-3 shadow-sm", tone === "green" && "border-emerald-200/80", tone === "orange" && "border-orange-200/80", tone === "red" && "border-red-200/80")}>
      <div className={cn("absolute inset-y-0 left-0 w-1", tone === "green" && "bg-emerald-500", tone === "orange" && "bg-orange-500", tone === "red" && "bg-red-500")} />
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <span className={cn("text-[10px] font-semibold", tone === "green" && "text-emerald-700", tone === "orange" && "text-orange-600", tone === "red" && "text-red-600")}>{status}</span>
      </div>
      <div className={cn("mt-2 text-xl font-bold tracking-tight", tone === "green" && "text-emerald-700", tone === "orange" && "text-orange-600", tone === "red" && "text-red-600")}>
        {value} {unit}
      </div>
    </div>
  );
}

function DashboardVitalsUnavailable() {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
      Vitals graph data is not available for this patient.
    </div>
  );
}

function dashboardVitalsForPatient(patient: DoctorIpdPatient) {
  return [
    { label: "HR", value: patient.hr.value, tone: patient.hr.tone, unit: "bpm" },
    { label: "SpO2", value: patient.spo2.value, tone: patient.spo2.tone, unit: "%" },
    { label: "BP", value: bpValue(patient), tone: bpTone(patient), unit: "mmHg" },
    { label: "Temperature", value: patient.temperature.value, tone: patient.temperature.tone, unit: "°C" },
  ];
}
