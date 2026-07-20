"use client";

import * as React from "react";
import { AlertTriangle, Brain, CheckCircle2, ClipboardCheck, HeartPulse, Save, ShieldAlert, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AssessmentTone = "success" | "warning" | "danger" | "info";

type AssessmentPatientContext = {
  name: string;
  bed: string;
  diagnosis: string;
  ageGender?: string;
  consultant?: string;
  uhid?: string;
};

type AssessmentPageProps = {
  patient: AssessmentPatientContext;
  isolationType?: string;
};

const assessmentTypes = ["Initial assessment", "Shift reassessment", "Doctor review", "Deterioration review"];

const scoreCards: Array<{ label: string; value: string; tone: AssessmentTone; note: string }> = [
  { label: "NEWS2", value: "5", tone: "warning", note: "Repeat vitals and doctor review advised." },
  { label: "Pain", value: "3/10", tone: "info", note: "Controlled with current plan." },
  { label: "Fall risk", value: "Moderate", tone: "warning", note: "Assisted mobility required." },
  { label: "Skin risk", value: "Low", tone: "success", note: "Pressure area care ongoing." },
];

const systemRows = [
  { system: "Airway / Breathing", status: "Stable", finding: "SpO2 stable on current support", action: "Continue monitoring", tone: "success" as AssessmentTone },
  { system: "Circulation", status: "Watch", finding: "HR trend elevated during last round", action: "Repeat vitals in 30 min", tone: "warning" as AssessmentTone },
  { system: "Neurology", status: "Stable", finding: "Alert, oriented, no new deficit", action: "Routine neuro checks", tone: "success" as AssessmentTone },
  { system: "Infection", status: "Isolation", finding: "Droplet isolation active", action: "PPE compliance and visitor control", tone: "info" as AssessmentTone },
  { system: "Lines / Devices", status: "Review", finding: "IV line site clean, dressing due today", action: "Nurse dressing check", tone: "warning" as AssessmentTone },
];

const quickChecks = ["Airway patent", "Pain reviewed", "Medication chart checked", "Lines secured", "I/O reviewed", "Family update required"];

function toneClasses(tone: AssessmentTone) {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  if (tone === "danger") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export function AssessmentPage({ isolationType = "Droplet", patient }: AssessmentPageProps) {
  const [assessmentType, setAssessmentType] = React.useState(assessmentTypes[1]);
  const [checks, setChecks] = React.useState<Record<string, boolean>>(() => Object.fromEntries(quickChecks.map((check, index) => [check, index < 4])));
  const [doctorAssessment, setDoctorAssessment] = React.useState(`${patient.diagnosis}. Patient requires continued IPD monitoring with repeat vitals and escalation if any deterioration is noted.`);
  const [plan, setPlan] = React.useState("Continue current treatment plan. Repeat assessment next round. Maintain isolation precautions and document response to interventions.");

  const completedChecks = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-4">


      <div className="grid gap-4 xl:grid-cols-[minmax(1,1fr)_340px]">
        <div className="space-y-4">
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Assessment type</span>
                <select
                  className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm font-semibold outline-none transition focus:ring-2 focus:ring-ring/20"
                  value={assessmentType}
                  onChange={(event) => setAssessmentType(event.target.value)}
                >
                  {assessmentTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Primary diagnosis</span>
                <Input readOnly className="h-10 bg-surface-muted font-semibold" value={patient.diagnosis} />
              </label>
            </CardContent>
          </Card>

          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {scoreCards.map((score) => (
              <Card key={score.label}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-bold text-muted-foreground">{score.label}</div>
                    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-bold", toneClasses(score.tone))}>{score.value}</span>
                  </div>
                  <p className="text-xs font-medium leading-5 text-muted-foreground">{score.note}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>System assessment</CardTitle>
                <CardDescription>Review findings, immediate action, and escalation state.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">System</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Finding</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {systemRows.map((row) => (
                    <tr className="border-t border-border" key={row.system}>
                      <td className="px-4 py-3 font-bold text-foreground">{row.system}</td>
                      <td className="px-4 py-3"><span className={cn("rounded-full border px-2 py-1 text-xs font-bold", toneClasses(row.tone))}>{row.status}</span></td>
                      <td className="px-4 py-3 font-medium text-muted-foreground">{row.finding}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Doctor assessment and plan</CardTitle>
                <CardDescription>Document impression, action plan, and next review target.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 lg:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Assessment note</span>
                <textarea className="min-h-36 w-full rounded-lg border border-input bg-white p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring/20" value={doctorAssessment} onChange={(event) => setDoctorAssessment(event.target.value)} />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground">Plan</span>
                <textarea className="min-h-36 w-full rounded-lg border border-input bg-white p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring/20" value={plan} onChange={(event) => setPlan(event.target.value)} />
              </label>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
       

        

          
        </aside>
      </div>
    </div>
  );
}
