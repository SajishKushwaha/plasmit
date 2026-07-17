"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  FlaskConical,
  Pill,
  ShieldAlert,
  Stethoscope,
  UserRound,
  CalendarOff,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDoctorContext, type AvailStatus } from "@/features/platform/auth/doctor-context";

// ─── Types ───────────────────────────────────────────────────────────────────
type RiskLevel = "Critical" | "High" | "Medium" | "Low";

// ─── Static Data ─────────────────────────────────────────────────────────────

const statIcons = [
  CalendarClock,
  Stethoscope,
  UserRound,
  Pill,
  FlaskConical,
  ShieldAlert,
  CalendarCheck,
  Clock,
];

const doctorStats = [
  {
    id: "appts",
    label: "Today Appointments",
    value: 31,
    change: "+4",
    context: "vs yesterday",
    tone: "info" as const,
  },
  {
    id: "queue",
    label: "OPD Queue",
    value: 8,
    change: "-2",
    context: "waiting now",
    tone: "warning" as const,
  },
  {
    id: "done",
    label: "Consultations Done",
    value: 14,
    change: "+6",
    context: "today",
    tone: "success" as const,
  },
  {
    id: "rx",
    label: "Pending Prescriptions",
    value: 5,
    change: "-1",
    context: "to complete",
    tone: "warning" as const,
  },
  {
    id: "lab",
    label: "Lab Reports Pending",
    value: 3,
    change: "0",
    context: "awaiting review",
    tone: "info" as const,
  },
  {
    id: "emerg",
    label: "Emergency Alerts",
    value: 1,
    change: "+1",
    context: "critical",
    tone: "critical" as const,
  },
  {
    id: "followup",
    label: "Follow-ups Today",
    value: 7,
    change: "+2",
    context: "scheduled",
    tone: "info" as const,
  },
  {
    id: "shift",
    label: "Shift Hours Left",
    value: 3,
    change: "5h",
    context: "9 AM – 2 PM",
    tone: "muted" as const,
  },
];

const riskTone: Record<RiskLevel, "critical" | "warning" | "info" | "success"> = {
  Critical: "critical",
  High: "warning",
  Medium: "info",
  Low: "success",
};

const availStatuses: {
  value: AvailStatus;
  label: string;
  dot: string;
  bg: string;
  ring: string;
  text: string;
}[] = [
  {
    value: "Available",
    label: "Available",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse",
    bg: "bg-emerald-50",
    ring: "border-emerald-300",
    text: "text-emerald-700",
  },
  {
    value: "Busy",
    label: "Busy",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    ring: "border-orange-300",
    text: "text-orange-700",
  },
  {
    value: "On Break",
    label: "On Break",
    dot: "bg-amber-400",
    bg: "bg-amber-50",
    ring: "border-amber-300",
    text: "text-amber-700",
  },
  {
    value: "Off Duty",
    label: "Off Duty",
    dot: "bg-slate-400",
    bg: "bg-slate-50",
    ring: "border-slate-300",
    text: "text-slate-700",
  },
  {
    value: "Emergency Call",
    label: "Emergency",
    dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-ping",
    bg: "bg-red-50",
    ring: "border-red-300",
    text: "text-red-700 font-bold",
  },
];

const opdQueue = [
  {
    token: "T-01",
    name: "Naseer Khan",
    stage: "In Consultation",
    risk: "Critical" as RiskLevel,
    wait: "Now",
  },
  {
    token: "T-02",
    name: "Priya Sharma",
    stage: "Vitals Done",
    risk: "Medium" as RiskLevel,
    wait: "5 min",
  },
  {
    token: "T-03",
    name: "Ahmed Al-Farsi",
    stage: "Waiting",
    risk: "Low" as RiskLevel,
    wait: "12 min",
  },
  {
    token: "T-04",
    name: "Rekha Nair",
    stage: "Emergency",
    risk: "High" as RiskLevel,
    wait: "Next",
  },
  {
    token: "T-05",
    name: "Suresh Pillai",
    stage: "Waiting",
    risk: "Low" as RiskLevel,
    wait: "22 min",
  },
];

const todayAppointments = [
  {
    id: "a1",
    time: "09:00",
    name: "Naseer Khan",
    uhid: "UHID-10421",
    type: "OPD",
    risk: "Critical" as RiskLevel,
    chief: "Chest pain, ECG changes",
  },
  {
    id: "a2",
    time: "09:30",
    name: "Priya Sharma",
    uhid: "UHID-20813",
    type: "Follow-up",
    risk: "Medium" as RiskLevel,
    chief: "Hypertension 3-month review",
  },
  {
    id: "a3",
    time: "10:00",
    name: "Ahmed Al-Farsi",
    uhid: "UHID-30557",
    type: "OPD",
    risk: "Low" as RiskLevel,
    chief: "Routine check-up",
  },
  {
    id: "a4",
    time: "10:30",
    name: "Rekha Nair",
    uhid: "UHID-40984",
    type: "Emergency",
    risk: "High" as RiskLevel,
    chief: "Breathlessness, SpO₂ 88%",
  },
];

const pendingAppts = [
  { name: "Kiran Patel", reason: "Missed — 08:30 slot", risk: "Low" as RiskLevel },
  { name: "Deepak Verma", reason: "Delayed — 15 min late", risk: "Medium" as RiskLevel },
  { name: "Amina Shaikh", reason: "Rescheduled for 3 PM", risk: "Low" as RiskLevel },
];

const emergencyAppts = [
  {
    name: "Naseer Khan",
    detail: "ICU Alert — Troponin T critical high",
    risk: "Critical" as RiskLevel,
  },
];

const consultationChart = [
  { time: "9am", count: 3 },
  { time: "10am", count: 5 },
  { time: "11am", count: 4 },
  { time: "12pm", count: 2 },
  { time: "1pm", count: 6 },
  { time: "2pm", count: 7 },
  { time: "3pm", count: 3 },
];

const labReports = [
  { patient: "Naseer Khan", test: "Troponin T", result: "0.84 ng/mL", status: "critical" as const },
  { patient: "Rekha Nair", test: "ABG", result: "pH 7.31", status: "warning" as const },
  { patient: "Priya Sharma", test: "HbA1c", result: "7.8%", status: "warning" as const },
  { patient: "Suresh Pillai", test: "CBC", result: "WBC 11.2 k", status: "success" as const },
];

const emergencyAlerts = [
  {
    patient: "Naseer Khan",
    type: "ICU Alert",
    detail: "Troponin T critical — immediate review needed",
    time: "09:42",
    severity: "critical" as const,
    id: "e1",
  },
  {
    patient: "Rekha Nair",
    type: "Critical Lab",
    detail: "SpO₂ 84% — emergency oxygen initiated",
    time: "10:05",
    severity: "warning" as const,
    id: "e2",
  },
  {
    patient: "Ward 3 — Bed 12",
    type: "Emergency OPD",
    detail: "Patient collapsed — crash cart requested",
    time: "10:18",
    severity: "critical" as const,
    id: "e3",
  },
];

const medicines = [
  { name: "Tab. Atorvastatin", dose: "20mg", freq: "Once daily", dur: "30 days" },
  { name: "Tab. Metoprolol", dose: "50mg", freq: "Twice daily", dur: "14 days" },
  { name: "Tab. Aspirin", dose: "75mg", freq: "Once daily", dur: "30 days" },
];

const labTests = [
  "CBC",
  "LFT",
  "KFT",
  "Troponin T",
  "ECG",
  "Chest X-Ray",
  "MRI Brain",
  "CT Chest",
  "Blood Sugar (F/PP)",
  "Lipid Profile",
];

// ─── Component ───────────────────────────────────────────────────────────────

export function DoctorDashboardPage() {
  const router = useRouter();
  const { availStatus, setAvailStatus, weeklySlots } = useDoctorContext();

  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [soap, setSoap] = useState({ s: "", o: "", a: "", p: "" });

  const currentAvail = availStatuses.find((s) => s.value === availStatus) || availStatuses[0];

  const getTodayDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "OPD":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Video":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Follow-up":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Emergency":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#availability") {
        router.replace("/doctor-availability");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [router]);

  const toggleTest = (t: string) =>
    setSelectedTests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const acknowledgeAlert = (id: string) => setAcknowledgedAlerts((prev) => [...prev, id]);

  return (
    <div className="space-y-5">
      {/* ══ 1. TODAY OVERVIEW — Stat Cards ══════════════════════════════════════ */}
      <section className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-4">
        {doctorStats.map((stat, i) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            context={stat.context}
            tone={stat.tone}
            icon={statIcons[i] ?? Activity}
          />
        ))}
      </section>

      {/* ══ 2. TODAY SUMMARY + AVAILABILITY ══════════════════════════════════════ */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Today Summary */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Today at a Glance</CardTitle>
              <CardDescription>Current patient status, shift, and active alerts.</CardDescription>
            </div>
            <StatusPill tone="info">Live</StatusPill>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              {[
                { label: "Current Patient", value: "T-02 — Priya Sharma", tone: "info" as const },
                {
                  label: "Next Patient",
                  value: "T-03 — Ahmed Al-Farsi (12 min)",
                  tone: "muted" as const,
                },
                {
                  label: "Emergency",
                  value: "1 Critical — Naseer Khan (ICU)",
                  tone: "critical" as const,
                },
                {
                  label: "Follow-ups Due",
                  value: "7 patients scheduled today",
                  tone: "warning" as const,
                },
                {
                  label: "Pending Rx",
                  value: "5 prescriptions to complete",
                  tone: "warning" as const,
                },
                {
                  label: "Lab Reports",
                  value: "3 reports awaiting your review",
                  tone: "info" as const,
                },
                {
                  label: "Shift Timing",
                  value: "9:00 AM – 2:00 PM · Apollo OPD",
                  tone: "success" as const,
                },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 text-sm last:border-0"
                >
                  <span className="font-semibold text-foreground w-36 shrink-0">{row.label}</span>
                  <span className="flex-1 text-muted-foreground">{row.value}</span>
                  <StatusPill tone={row.tone}>
                    {row.tone === "critical"
                      ? "Critical"
                      : row.tone === "warning"
                        ? "Pending"
                        : row.tone === "success"
                          ? "Active"
                          : "Info"}
                  </StatusPill>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Availability Management */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Availability</CardTitle>
              <CardDescription>Set status and today&apos;s active slots.</CardDescription>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${currentAvail.bg} ${currentAvail.ring} ${currentAvail.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${currentAvail.dot}`} />
              {currentAvail.label}
            </span>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status toggle buttons */}
            <div className="grid grid-cols-2 gap-2">
              {availStatuses.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setAvailStatus(s.value)}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold transition ${
                    availStatus === s.value
                      ? `${s.bg} ${s.ring} ${s.text} shadow-sm`
                      : "border-border bg-white text-muted-foreground hover:bg-surface-muted"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  <span className="truncate">
                    {s.label === "Emergency Call" ? "Emergency" : s.label}
                  </span>
                  {availStatus === s.value && <CheckCircle2 className="ml-auto h-3 w-3 shrink-0" />}
                </button>
              ))}
            </div>

            {/* Today's slots */}
            <div className="space-y-2 border-t border-border pt-3">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>Today&apos;s Sessions ({getTodayDay()})</span>
                <span className="text-[10px] text-slate-400 normal-case font-normal">Dynamic</span>
              </div>

              {weeklySlots.filter((slot) => slot.day === getTodayDay()).length > 0 ? (
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-0.5">
                  {weeklySlots
                    .filter((slot) => slot.day === getTodayDay())
                    .map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-50 last:border-0"
                      >
                        <span className="font-medium text-slate-700 tabular-nums">
                          {slot.time} - {slot.end}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400">{slot.branch}</span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getModeColor(slot.mode)}`}
                          >
                            {slot.mode}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center rounded-lg border border-dashed border-slate-200 bg-slate-50/50">
                  <CalendarOff className="h-6 w-6 text-slate-300 mb-1" />
                  <span className="text-xs text-slate-400">No active slots today</span>
                </div>
              )}
            </div>

            <Button
              onClick={() => router.push("/doctor-availability")}
              variant="outline"
              className="w-full text-xs font-semibold gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50 mt-1"
            >
              <Settings className="h-3.5 w-3.5 text-medical-blue-600" />
              Configure Schedule
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ══ 3. OPD QUEUE + APPOINTMENTS ═════════════════════════════════════════ */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        {/* OPD Queue + Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>OPD Queue</CardTitle>
              <CardDescription>Live patient queue with risk and wait time.</CardDescription>
            </div>
            <StatusPill tone="warning">8 Waiting</StatusPill>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[0.5fr_1.3fr_1.2fr_0.8fr_0.7fr] border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                <span>Token</span>
                <span>Patient</span>
                <span>Stage</span>
                <span>Risk</span>
                <span>Wait</span>
              </div>
              {opdQueue.map((p) => (
                <div
                  key={p.token}
                  className="grid grid-cols-[0.5fr_1.3fr_1.2fr_0.8fr_0.7fr] items-center border-b border-border px-3 py-3 text-sm last:border-0"
                >
                  <span className="font-bold text-foreground">{p.token}</span>
                  <span className="truncate font-medium text-foreground">{p.name}</span>
                  <span className="truncate text-muted-foreground text-xs">{p.stage}</span>
                  <StatusPill tone={riskTone[p.risk]}>{p.risk}</StatusPill>
                  <span className="text-xs text-muted-foreground">{p.wait}</span>
                </div>
              ))}
            </div>

            {/* Consultation chart */}
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 text-sm font-semibold text-foreground">
                Consultation Timeline — Today
              </div>
              <div className="flex h-40 items-end gap-2 border-b border-l border-border px-2 pt-3">
                {consultationChart.map((item) => {
                  const maxCount = Math.max(...consultationChart.map((point) => point.count));
                  const height = Math.max(12, Math.round((item.count / maxCount) * 118));
                  return (
                    <div
                      key={item.time}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1"
                    >
                      <div className="text-[10px] font-semibold text-muted-foreground">
                        {item.count}
                      </div>
                      <div
                        className="w-full max-w-10 rounded-t bg-primary transition hover:brightness-95"
                        style={{ height }}
                        title={`${item.time}: ${item.count} consultations`}
                      />
                      <div className="text-[10px] text-muted-foreground">{item.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Today&apos;s schedule, pending, and emergency.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today">
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="emergency">Emergency</TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-2">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="rounded-lg border border-border bg-surface-muted p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {apt.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {apt.uhid} · {apt.time} · {apt.type}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground truncate">
                          {apt.chief}
                        </div>
                      </div>
                      <StatusPill tone={riskTone[apt.risk]}>{apt.risk}</StatusPill>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-2">
                {pendingAppts.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface-muted p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{p.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{p.reason}</div>
                      </div>
                      <StatusPill tone={riskTone[p.risk]}>{p.risk}</StatusPill>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="emergency" className="space-y-2">
                {emergencyAppts.map((e, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface-muted p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-foreground">{e.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{e.detail}</div>
                      </div>
                      <StatusPill tone="critical">Critical</StatusPill>
                    </div>
                    <Button className="mt-3 h-8 w-full text-xs" size="sm" variant="outline">
                      Open Case
                    </Button>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* ══ 4. CONSULTATION WORKSPACE ═══════════════════════════════════════════ */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Consultation Workspace</CardTitle>
            <CardDescription>
              SOAP notes, prescription, lab requests, and follow-up planning.
            </CardDescription>
          </div>
          <StatusPill tone="info">T-02 — Priya Sharma</StatusPill>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="soap">
            <TabsList>
              <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              <TabsTrigger value="rx">Prescription</TabsTrigger>
              <TabsTrigger value="lab">Lab Request</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>

            {/* SOAP Notes */}
            <TabsContent value="soap">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["s", "o", "a", "p"] as const).map((key) => {
                  const labels = {
                    s: "Subjective (Patient's complaint)",
                    o: "Objective (Clinical findings)",
                    a: "Assessment (Diagnosis)",
                    p: "Plan (Treatment plan)",
                  };
                  return (
                    <div key={key}>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        {labels[key]}
                      </label>
                      <textarea
                        className="w-full resize-none rounded-lg border border-border bg-surface-muted p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                        rows={4}
                        placeholder={`Enter ${labels[key].split(" ")[0]}...`}
                        value={soap[key]}
                        onChange={(e) => setSoap((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  );
                })}
              </div>
              <Button className="mt-3" size="sm">
                Save SOAP Notes
              </Button>
            </TabsContent>

            {/* Prescription */}
            <TabsContent value="rx" className="space-y-3">
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[1.5fr_0.7fr_1fr_0.7fr] border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                  <span>Medicine</span>
                  <span>Dose</span>
                  <span>Frequency</span>
                  <span>Duration</span>
                </div>
                {medicines.map((m, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.5fr_0.7fr_1fr_0.7fr] items-center border-b border-border px-3 py-2.5 text-sm last:border-0"
                  >
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="text-muted-foreground">{m.dose}</span>
                    <span className="text-muted-foreground">{m.freq}</span>
                    <span className="text-muted-foreground">{m.dur}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <input
                  className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                  placeholder="Medicine name"
                />
                <input
                  className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                  placeholder="Dosage"
                />
                <input
                  className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                  placeholder="Frequency"
                />
                <input
                  className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                  placeholder="Duration"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm">Add Medicine</Button>
                <Button size="sm" variant="outline">
                  Print Prescription
                </Button>
              </div>
            </TabsContent>

            {/* Lab Request */}
            <TabsContent value="lab" className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Select Tests
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {labTests.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTest(t)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold text-left transition ${
                      selectedTests.includes(t)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white text-muted-foreground hover:bg-surface-muted"
                    }`}
                  >
                    {selectedTests.includes(t) && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" disabled={selectedTests.length === 0}>
                  Send Lab Request ({selectedTests.length})
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedTests([])}>
                  Clear
                </Button>
              </div>
            </TabsContent>

            {/* Follow-up */}
            <TabsContent value="followup" className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Urgency
                  </label>
                  <select className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/25">
                    <option>Routine (1–2 weeks)</option>
                    <option>Urgent (2–3 days)</option>
                    <option>Critical (24 hours)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Follow-up Notes
                  </label>
                  <textarea
                    className="w-full resize-none rounded-lg border border-border bg-surface-muted p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/25"
                    rows={3}
                    placeholder="Instructions for next visit..."
                  />
                </div>
              </div>
              <Button size="sm">Schedule Follow-up</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ══ 5. LAB REPORTS + EMERGENCY ALERTS ══════════════════════════════════ */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        {/* Lab Reports */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lab & Radiology Reports</CardTitle>
              <CardDescription>Recent reports awaiting your review.</CardDescription>
            </div>
            <StatusPill tone="warning">3 Pending</StatusPill>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-border">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                <span>Patient</span>
                <span>Test</span>
                <span>Result</span>
                <span>Status</span>
              </div>
              {labReports.map((r, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1.2fr_1fr_1fr_0.8fr] items-center border-b border-border px-3 py-3 text-sm last:border-0"
                >
                  <span className="font-medium text-foreground">{r.patient}</span>
                  <span className="text-muted-foreground">{r.test}</span>
                  <span className="font-medium text-foreground">{r.result}</span>
                  <StatusPill tone={r.status}>
                    {r.status === "critical"
                      ? "Critical"
                      : r.status === "warning"
                        ? "Abnormal"
                        : "Normal"}
                  </StatusPill>
                </div>
              ))}
            </div>
            <Button className="mt-3" size="sm" variant="outline">
              View All Reports
            </Button>
          </CardContent>
        </Card>

        {/* Emergency Alerts */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Emergency Alerts</CardTitle>
              <CardDescription>Critical cases requiring immediate attention.</CardDescription>
            </div>
            <StatusPill tone="critical">1 Active</StatusPill>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyAlerts.map((alert) => {
              const acked = acknowledgedAlerts.includes(alert.id);
              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 transition ${acked ? "border-border bg-surface-muted opacity-60" : "border-rose-200 bg-rose-50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusPill tone={alert.severity}>{alert.type}</StatusPill>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-foreground">
                        {alert.patient}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{alert.detail}</div>
                    </div>
                  </div>
                  <Button
                    className="mt-2 h-7 w-full text-xs"
                    size="sm"
                    variant={acked ? "ghost" : "outline"}
                    disabled={acked}
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    {acked ? "✓ Acknowledged" : "Acknowledge"}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
