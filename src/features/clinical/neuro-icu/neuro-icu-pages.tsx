"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronUp,
  ClipboardList,
  Droplets,
  Eye,
  FileDown,
  FileText,
  Gauge,
  Pill,
  Printer,
  RadioTower,
  RefreshCcw,
  Save,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Wifi,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPatients } from "@/data/patients";
import { cn } from "@/lib/utils";

type NeuroTab =
  "overview" | "gcs" | "sedation" | "evd" | "delirium" | "pupil" | "analytics" | "reports";
type Severity = "stable" | "watch" | "critical" | "emergency";

type TrendPoint = {
  time: string;
  gcs: number;
  icp: number;
  sedation: number;
  evd: number;
  delirium: number;
  pupil: number;
  seizure: number;
};

type GcsScore = {
  eye: number;
  verbal: number;
  motor: number;
};

type SedationState = {
  status: string;
  drug: string;
  dosage: string;
  route: string;
  rass: string;
  goal: string;
};

type EvdState = {
  output: string;
  height: string;
  icp: string;
  waveform: string;
  colour: string;
};

type DeliriumState = {
  camPositive: boolean;
  attentionScore: string;
};

type PupilState = {
  rightSize: string;
  leftSize: string;
  rightNpi: string;
  leftNpi: string;
  reactivity: string;
};

const patient = mockPatients[1] ?? mockPatients[0];

const tabItems: Array<{ value: NeuroTab; label: string; icon: typeof Brain }> = [
  { value: "overview", label: "Overview", icon: Brain },
  { value: "gcs", label: "GCS", icon: ClipboardList },
  { value: "sedation", label: "Sedation", icon: Pill },
  { value: "evd", label: "EVD", icon: Droplets },
  { value: "delirium", label: "Delirium", icon: ShieldAlert },
  { value: "pupil", label: "Pupil", icon: Eye },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "reports", label: "Reports", icon: FileText },
];

const baseTrend: TrendPoint[] = [
  { time: "00:00", gcs: 14, icp: 15, sedation: -1, evd: 7, delirium: 0, pupil: 4, seizure: 1 },
  { time: "02:00", gcs: 14, icp: 16, sedation: -1, evd: 8, delirium: 0, pupil: 4, seizure: 1 },
  { time: "04:00", gcs: 13, icp: 18, sedation: -2, evd: 9, delirium: 1, pupil: 4, seizure: 2 },
  { time: "06:00", gcs: 13, icp: 20, sedation: -2, evd: 11, delirium: 1, pupil: 3.8, seizure: 2 },
  { time: "08:00", gcs: 12, icp: 22, sedation: -2, evd: 15, delirium: 1, pupil: 3.7, seizure: 3 },
  { time: "10:00", gcs: 12, icp: 23, sedation: -2, evd: 18, delirium: 0, pupil: 3.8, seizure: 3 },
  { time: "12:00", gcs: 12, icp: 21, sedation: -1, evd: 16, delirium: 0, pupil: 3.9, seizure: 2 },
];

const gcsRows = [
  ["10:30", "4", "5", "3", "12", "Watch", "Dr. Neha"],
  ["09:30", "4", "4", "4", "12", "Watch", "Nurse Asha"],
  ["08:30", "3", "4", "4", "11", "Moderate", "Dr. Neha"],
  ["07:30", "3", "4", "4", "11", "Moderate", "Resident"],
  ["06:30", "2", "3", "4", "9", "Severe", "Night nurse"],
];

const evdRows = [
  ["10:30", "18 ml/hr", "Xanthochromic", "23 mmHg", "Critical"],
  ["09:30", "16 ml/hr", "Xanthochromic", "22 mmHg", "Critical"],
  ["08:30", "12 ml/hr", "Pink", "20 mmHg", "Watch"],
  ["07:30", "9 ml/hr", "Clear", "18 mmHg", "Stable"],
  ["06:30", "11 ml/hr", "Pink", "19 mmHg", "Watch"],
];

const sedationRows = [
  ["10:30", "Propofol", "40 mcg/kg/min", "IV", "-2", "Goal"],
  ["09:30", "Propofol", "40 mcg/kg/min", "IV", "-2", "Goal"],
  ["08:30", "Propofol", "35 mcg/kg/min", "IV", "-1", "Light"],
  ["07:30", "Midazolam", "2 mg/hr", "IV", "-3", "Deep"],
  ["06:30", "Midazolam", "2 mg/hr", "IV", "-3", "Deep"],
];

const deliriumRows = [
  ["10:30", "CAM Negative", "No", "Stable attention", "Low"],
  ["08:30", "CAM Negative", "No", "Follows command", "Low"],
  ["06:30", "CAM Positive", "Yes", "Agitated, pulling lines", "High"],
  ["04:30", "CAM Positive", "Yes", "Restless", "High"],
];

function patientName() {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function severityTone(severity: Severity): BadgeProps["tone"] {
  if (severity === "stable") return "success";
  if (severity === "watch") return "warning";
  if (severity === "critical") return "danger";
  return "critical";
}

function numericValue(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function useLiveNeuroStream() {
  const [trend, setTrend] = React.useState(baseTrend);
  const [updatedAt, setUpdatedAt] = React.useState("10:30:24");
  const [syncing, setSyncing] = React.useState(true);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setSyncing((value) => !value);
      setUpdatedAt(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
      setTrend((current) => {
        const last = current[current.length - 1];
        const next: TrendPoint = {
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          gcs: Math.max(8, Math.min(15, last.gcs + (Math.random() > 0.72 ? 1 : 0))),
          icp: Math.max(12, Math.min(28, last.icp + (Math.random() > 0.55 ? 1 : -1))),
          sedation: Math.max(-4, Math.min(0, last.sedation + (Math.random() > 0.7 ? 1 : 0))),
          evd: Math.max(4, Math.min(24, last.evd + (Math.random() > 0.6 ? 1 : -1))),
          delirium: Math.random() > 0.82 ? 1 : 0,
          pupil: Math.max(2.8, Math.min(4.2, last.pupil + (Math.random() > 0.6 ? 0.1 : -0.1))),
          seizure: Math.max(0, Math.min(5, last.seizure + (Math.random() > 0.8 ? 1 : 0))),
        };
        return [...current.slice(-10), next];
      });
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  return { trend, updatedAt, syncing };
}

export function NeuroDoctorWorkspace({ initialTab = "overview" }: { initialTab?: NeuroTab }) {
  const [activeTab, setActiveTab] = React.useState<NeuroTab>(initialTab);
  const [timeRange, setTimeRange] = React.useState("24 Hours");
  const [search, setSearch] = React.useState("");
  const [gcsScore, setGcsScore] = React.useState<GcsScore>({ eye: 4, verbal: 5, motor: 3 });
  const [sedation, setSedation] = React.useState<SedationState>({
    status: "Sedated",
    drug: "Propofol",
    dosage: "40 mcg/kg/min",
    route: "IV infusion",
    rass: "-2",
    goal: "-1 to -2",
  });
  const [evd, setEvd] = React.useState<EvdState>({
    output: "18",
    height: "10 cmH2O",
    icp: "23",
    waveform: "Present",
    colour: "Xanthochromic",
  });
  const [delirium, setDelirium] = React.useState<DeliriumState>({
    camPositive: false,
    attentionScore: "4/5",
  });
  const [pupil, setPupil] = React.useState<PupilState>({
    rightSize: "3.2",
    leftSize: "3.1",
    rightNpi: "3.8",
    leftNpi: "3.9",
    reactivity: "Brisk",
  });
  const { trend, updatedAt, syncing } = useLiveNeuroStream();
  const gcsTotal = gcsScore.eye + gcsScore.verbal + gcsScore.motor;
  const rassValue = numericValue(sedation.rass, -2);
  const evdOutputValue = numericValue(evd.output, 0);
  const icpValue = numericValue(evd.icp, 0);
  const pupilNpi = Math.min(numericValue(pupil.rightNpi, 0), numericValue(pupil.leftNpi, 0));
  const displayTrend = React.useMemo(() => {
    const latestIndex = trend.length - 1;
    return trend.map((point, index) =>
      index === latestIndex
        ? {
            ...point,
            gcs: gcsTotal,
            sedation: rassValue,
            evd: evdOutputValue,
            icp: icpValue,
            delirium: delirium.camPositive ? 1 : 0,
            pupil: pupilNpi,
          }
        : point,
    );
  }, [delirium.camPositive, evdOutputValue, gcsTotal, icpValue, pupilNpi, rassValue, trend]);
  const latest = displayTrend[displayTrend.length - 1];

  const kpis = [
    {
      label: "GCS Score",
      value: `${latest.gcs}/15`,
      previous: "-1 from baseline",
      severity: latest.gcs < 9 ? "critical" : latest.gcs < 13 ? "watch" : "stable",
      icon: Brain,
      dataKey: "gcs",
      threshold: "Notify if < 9",
    },
    {
      label: "Sedation Status",
      value: sedation.drug,
      previous: `RASS ${sedation.rass || "-"} goal`,
      severity: rassValue <= -4 ? "critical" : rassValue <= -3 ? "watch" : "stable",
      icon: Pill,
      dataKey: "sedation",
      threshold: `Goal ${sedation.goal}`,
    },
    {
      label: "EVD Output",
      value: `${latest.evd} ml/hr`,
      previous: "+4 ml/hr",
      severity: latest.evd > 16 ? "critical" : latest.evd > 10 ? "watch" : "stable",
      icon: Droplets,
      dataKey: "evd",
      threshold: "Alert > 15",
    },
    {
      label: "EVD Color",
      value: evd.colour,
      previous: "latest drain colour",
      severity:
        evd.colour === "Bloody" ? "critical" : evd.colour === "Xanthochromic" ? "watch" : "stable",
      icon: Eye,
      dataKey: "evd",
      threshold: "Review CSF",
    },
    {
      label: "Delirium Status",
      value: latest.delirium ? "CAM+" : "CAM-",
      previous: latest.delirium ? "new risk" : "stable",
      severity: latest.delirium ? "critical" : "stable",
      icon: ShieldAlert,
      dataKey: "delirium",
      threshold: "CAM+",
    },
    {
      label: "ICP Trend",
      value: `${latest.icp} mmHg`,
      previous: "+2 mmHg",
      severity: latest.icp > 22 ? "critical" : latest.icp > 18 ? "watch" : "stable",
      icon: Gauge,
      dataKey: "icp",
      threshold: "Alert > 20",
    },
    {
      label: "Pupil Reactivity",
      value: `${latest.pupil.toFixed(1)} NPi`,
      previous: pupil.reactivity,
      severity: latest.pupil < 3 ? "critical" : latest.pupil < 3.5 ? "watch" : "stable",
      icon: Eye,
      dataKey: "pupil",
      threshold: "Alert < 3",
    },
    {
      label: "Seizure Risk",
      value: `${latest.seizure}/5`,
      previous: "EEG ready",
      severity: latest.seizure > 3 ? "emergency" : latest.seizure > 2 ? "watch" : "stable",
      icon: RadioTower,
      dataKey: "seizure",
      threshold: "Risk >= 4",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#111827]">
      <main className="min-w-0 space-y-4">
        <NeuroHeader
          alertCount={3}
          lastUpdated={updatedAt}
          syncing={syncing}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} trend={displayTrend} />
          ))}
        </section>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as NeuroTab)}
          className="space-y-4"
        >
          <Card className="sticky top-0 z-20 overflow-hidden border-[#dbe4f0]">
            <CardContent className="p-2">
              <TabsList className="w-full rounded-lg bg-[#eef3f9] p-1">
                {tabItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="h-10 flex-1 gap-2 rounded-md text-sm data-[state=active]:bg-white data-[state=active]:text-[#155eef]"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </CardContent>
          </Card>

          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-4">
              <TabsContent value="overview">
                <OverviewSection
                  delirium={delirium}
                  evd={evd}
                  gcsScore={gcsScore}
                  pupil={pupil}
                  sedation={sedation}
                  trend={displayTrend}
                />
              </TabsContent>
              <TabsContent value="gcs">
                <GcsPanel expanded value={gcsScore} onChange={setGcsScore} />
              </TabsContent>
              <TabsContent value="sedation">
                <SedationPanel expanded value={sedation} onChange={setSedation} />
              </TabsContent>
              <TabsContent value="evd">
                <EvdPanel expanded value={evd} onChange={setEvd} />
              </TabsContent>
              <TabsContent value="delirium">
                <DeliriumPanel expanded value={delirium} onChange={setDelirium} />
              </TabsContent>
              <TabsContent value="pupil">
                <PupilPanel expanded value={pupil} onChange={setPupil} />
              </TabsContent>
              <TabsContent value="analytics">
                <AnalyticsSection trend={displayTrend} search={search} onSearch={setSearch} />
              </TabsContent>
              <TabsContent value="reports">
                <ReportsSection />
              </TabsContent>
            </div>
            <QuickActionsPanel />
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function NeuroHeader({
  alertCount,
  lastUpdated,
  syncing,
  timeRange,
  onTimeRangeChange,
}: {
  alertCount: number;
  lastUpdated: string;
  syncing: boolean;
  timeRange: string;
  onTimeRangeChange: (_value: string) => void;
}) {
  return (
    <Card className="overflow-hidden border-[#dbe4f0]" data-patient-workspace-header>
      <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#155eef] text-lg font-bold text-white">
            {patient.firstName[0]}
            {patient.lastName[0]}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-bold text-[#101828]">{patientName()}</h1>
              <Badge tone="info">MRN {patient.uhid}</Badge>
              <Badge tone="warning">ICU Bed N-07</Badge>
              <Badge tone="success">Admitted</Badge>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#12b76a]/30 bg-[#ecfdf3] px-2 py-0.5 text-xs font-semibold text-[#027a48]">
                <Wifi className="h-3 w-3" />
                Live
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-[#667085]">
              <span>Consultant: Dr. Aman Verma</span>
              <span>Diagnosis: Post traumatic brain injury</span>
              <span>Last updated {lastUpdated}</span>
              <span className="inline-flex items-center gap-1">
                <RefreshCcw className={cn("h-3 w-3", syncing && "animate-spin text-[#155eef]")} />
                Auto refresh
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
          <Badge tone={alertCount > 0 ? "critical" : "success"}>{alertCount} critical alerts</Badge>
          {["12 Hours", "24 Hours", "48 Hours", "Custom"].map((item) => (
            <button
              className={cn(
                "h-8 rounded-md border px-3 text-xs font-semibold transition",
                timeRange === item
                  ? "border-[#155eef] bg-[#155eef] text-white"
                  : "border-[#d0d5dd] bg-white text-[#475467] hover:border-[#155eef]/50",
              )}
              key={item}
              onClick={() => onTimeRangeChange(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function KpiCard({
  kpi,
  trend,
}: {
  kpi: {
    label: string;
    value: string;
    previous: string;
    severity: string;
    icon: typeof Brain;
    dataKey: keyof TrendPoint;
    threshold: string;
  };
  trend: TrendPoint[];
}) {
  const Icon = kpi.icon;
  const color =
    kpi.severity === "emergency"
      ? "#7c3aed"
      : kpi.severity === "critical"
        ? "#d92d20"
        : kpi.severity === "watch"
          ? "#f79009"
          : "#12b76a";
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.16 }}>
      <Card
        className={cn(
          "h-full overflow-hidden border-[#dbe4f0] transition",
          kpi.severity === "critical" && "border-[#f04438]/40",
          kpi.severity === "emergency" && "border-[#7c3aed]/40",
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-wide text-[#667085]">
                {kpi.label}
              </div>
              <div className="mt-2 truncate text-2xl font-bold text-[#101828]">{kpi.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#667085]">
                <ChevronUp className="h-3 w-3" />
                {kpi.previous}
              </div>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}14`, color }}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 h-12">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={trend}>
                <Area
                  dataKey={kpi.dataKey}
                  fill={color}
                  fillOpacity={0.12}
                  stroke={color}
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <Badge tone={severityTone(kpi.severity as Severity)}>{kpi.severity}</Badge>
            <span className="truncate text-xs font-medium text-[#667085]">{kpi.threshold}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OverviewSection({
  trend,
  gcsScore,
  sedation,
  evd,
  delirium,
  pupil,
}: {
  trend: TrendPoint[];
  gcsScore: GcsScore;
  sedation: SedationState;
  evd: EvdState;
  delirium: DeliriumState;
  pupil: PupilState;
}) {
  const latest = trend[trend.length - 1];
  const gcsSeverity = latest.gcs <= 8 ? "Severe" : latest.gcs <= 12 ? "Moderate" : "Mild";
  const priorities = [
    {
      title: "Neurologist review",
      detail: "ICP remains above threshold with rising EVD output.",
      tone: "critical" as BadgeProps["tone"],
      icon: Stethoscope,
    },
    {
      title: "Repeat neuro obs",
      detail: "GCS, pupils and CAM reassessment due in 30 minutes.",
      tone: "warning" as BadgeProps["tone"],
      icon: CalendarClock,
    },
    {
      title: "Device safety",
      detail: "EVD waveform present. Lines secured and drain height documented.",
      tone: "success" as BadgeProps["tone"],
      icon: Syringe,
    },
  ];
  const recentEvents = [
    [
      "10:30",
      "GCS",
      `${latest.gcs}/15`,
      `${gcsSeverity} - E${gcsScore.eye} V${gcsScore.verbal} M${gcsScore.motor}`,
    ],
    ["10:30", "ICP", `${latest.icp} mmHg`, "Above threshold"],
    ["10:20", "Sedation", `${sedation.drug} / RASS ${sedation.rass}`, sedation.status],
    ["10:18", "EVD", `${evd.output || "-"} ml/hr`, `${evd.colour}, ${evd.waveform}`],
    [
      "10:16",
      "Pupil",
      `R ${pupil.rightNpi || "-"} / L ${pupil.leftNpi || "-"} NPi`,
      `${pupil.reactivity}, ${pupil.rightSize || "-"}/${pupil.leftSize || "-"} mm`,
    ],
    [
      "10:15",
      "CAM",
      delirium.camPositive ? "Positive" : "Negative",
      delirium.camPositive ? "Review needed" : "Stable",
    ],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="overflow-hidden border-[#dbe4f0]">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Neuro Command Overview</CardTitle>
              <p className="mt-1 text-sm font-medium text-[#667085]">
                Read-only clinical summary for rapid ICU handover and consultant review.
              </p>
            </div>
            <Badge tone="info">
              <Activity className="h-3 w-3" />
              Live trend
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={trend}>
                  <CartesianGrid stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #dbe4f0" }} />
                  <ReferenceLine label="ICP alert" stroke="#d92d20" y={20} />
                  <Line
                    dataKey="gcs"
                    name="GCS"
                    dot={false}
                    stroke="#155eef"
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Line
                    dataKey="icp"
                    name="ICP"
                    dot={false}
                    stroke="#d92d20"
                    strokeWidth={3}
                    type="monotone"
                  />
                  <Line
                    dataKey="evd"
                    name="EVD"
                    dot={false}
                    stroke="#06aed4"
                    strokeWidth={3}
                    type="monotone"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#dbe4f0]">
          <CardHeader>
            <CardTitle>Clinical Priorities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {priorities.map((item) => {
              const Icon = item.icon;
              return (
                <div className="rounded-lg border border-[#dbe4f0] bg-white p-3" key={item.title}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8f1ff] text-[#155eef]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-[#101828]">{item.title}</div>
                        <Badge tone={item.tone}>{item.tone}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium text-[#667085]">{item.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="border-[#dbe4f0] xl:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent Neuro Events</CardTitle>
            <Badge tone="success">
              <CheckCircle2 className="h-3 w-3" />
              Audit synced
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f2f6fb] text-[#667085]">
                <tr>
                  {["Time", "Type", "Value", "Clinical note"].map((header) => (
                    <th className="px-3 py-2 font-bold" key={header}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((row) => (
                  <tr className="border-t border-[#eef2f7]" key={`${row[0]}-${row[1]}`}>
                    {row.map((cell) => (
                      <td
                        className={cn(
                          "px-3 py-2 font-semibold text-[#344054]",
                          /above|review|moderate/i.test(cell) && "text-[#b42318]",
                        )}
                        key={cell}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-[#dbe4f0]">
          <CardHeader>
            <CardTitle>Shift Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              ["Active orders", "7", "Neuro obs hourly"],
              ["Drafts saved", "3", "Ready for signature"],
              ["Alerts cleared", "11", "Last 24 hours"],
            ].map(([label, value, note]) => (
              <div className="rounded-lg bg-[#f8fafc] p-3" key={label}>
                <div className="text-xs font-bold uppercase text-[#667085]">{label}</div>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <span className="text-2xl font-bold text-[#101828]">{value}</span>
                  <span className="text-right text-xs font-semibold text-[#667085]">{note}</span>
                </div>
              </div>
            ))}
            <Button onClick={() => toast.success("Overview draft saved")}>
              <Save className="h-4 w-4" />
              Save Handover Draft
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GcsPanel({
  expanded,
  value,
  onChange,
}: {
  expanded?: boolean;
  value?: GcsScore;
  onChange?: (_value: GcsScore) => void;
}) {
  const [localScore, setLocalScore] = React.useState<GcsScore>(
    value ?? { eye: 4, verbal: 5, motor: 3 },
  );
  const score = value ?? localScore;
  const setScore = React.useCallback(
    (next: GcsScore) => {
      setLocalScore(next);
      onChange?.(next);
    },
    [onChange],
  );
  const setEye = React.useCallback((eye: number) => setScore({ ...score, eye }), [score, setScore]);
  const setVerbal = React.useCallback(
    (verbal: number) => setScore({ ...score, verbal }),
    [score, setScore],
  );
  const setMotor = React.useCallback(
    (motor: number) => setScore({ ...score, motor }),
    [score, setScore],
  );
  const { eye, verbal, motor } = score;
  const total = eye + verbal + motor;
  const severity = total <= 8 ? "Severe" : total <= 12 ? "Moderate" : "Mild";
  return (
    <ClinicalPanel
      title="GCS Assessment"
      subtitle="Glasgow Coma Scale with auto score and deterioration warning"
      icon={ClipboardList}
    >
      <div className={cn("grid gap-4", expanded ? "xl:grid-cols-[1fr_260px]" : "")}>
        <div className="grid gap-3 md:grid-cols-3">
          <RadioCards
            label="Eye Response"
            value={eye}
            onChange={setEye}
            options={[
              [4, "Spontaneous"],
              [3, "To speech"],
              [2, "To pain"],
              [1, "None"],
            ]}
          />
          <RadioCards
            label="Verbal Response"
            value={verbal}
            onChange={setVerbal}
            options={[
              [5, "Oriented"],
              [4, "Confused"],
              [3, "Words"],
              [2, "Sounds"],
              [1, "None"],
            ]}
          />
          <RadioCards
            label="Motor Response"
            value={motor}
            onChange={setMotor}
            options={[
              [6, "Obeys"],
              [5, "Localizes"],
              [4, "Withdraws"],
              [3, "Flexion"],
              [2, "Extension"],
              [1, "None"],
            ]}
          />
        </div>
        <div className="rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-4">
          <div className="text-xs font-bold uppercase text-[#667085]">Instant total score</div>
          <div className="mt-2 text-4xl font-bold text-[#101828]">{total}/15</div>
          <Badge
            className="mt-2"
            tone={
              severity === "Severe" ? "critical" : severity === "Moderate" ? "warning" : "success"
            }
          >
            {severity}
          </Badge>
          <p className="mt-3 text-sm font-medium text-[#667085]">
            AI warning: GCS below baseline. Repeat pupils and review ICP correlation.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input defaultValue="Dr. Neha Malik" />
            <Input defaultValue="10:30 AM" />
          </div>
          <Button
            className="mt-3 w-full"
            onClick={() => toast.success(`GCS updated to ${total}/15`)}
          >
            <Save className="h-4 w-4" />
            Save GCS
          </Button>
        </div>
      </div>
    </ClinicalPanel>
  );
}

function SedationPanel({
  expanded,
  value,
  onChange,
}: {
  expanded?: boolean;
  value?: SedationState;
  onChange?: (_value: SedationState) => void;
}) {
  const [localValue, setLocalValue] = React.useState<SedationState>(
    value ?? {
      status: "Sedated",
      drug: "Propofol",
      dosage: "40 mcg/kg/min",
      route: "IV infusion",
      rass: "-2",
      goal: "-1 to -2",
    },
  );
  const sedation = value ?? localValue;
  const rassValue = numericValue(sedation.rass, -2);
  const update = React.useCallback(
    (patch: Partial<SedationState>) => {
      const next = { ...sedation, ...patch };
      setLocalValue(next);
      onChange?.(next);
    },
    [onChange, sedation],
  );

  return (
    <ClinicalPanel
      title="Sedation Management"
      subtitle="Drug, infusion and RASS goal validation"
      icon={Pill}
    >
      <div
        className={cn("grid gap-3", expanded ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2")}
      >
        <ClinicalField
          label="Sedation status"
          onChange={(status) => update({ status })}
          value={sedation.status}
        />
        <ClinicalField label="Drug" onChange={(drug) => update({ drug })} value={sedation.drug} />
        <ClinicalField
          label="Dosage"
          onChange={(dosage) => update({ dosage })}
          value={sedation.dosage}
        />
        <ClinicalField
          label="Route"
          onChange={(route) => update({ route })}
          value={sedation.route}
        />
        <ClinicalField
          label="RASS score"
          onChange={(rass) => update({ rass })}
          value={sedation.rass}
        />
        <ClinicalField
          label="Sedation goal"
          onChange={(goal) => update({ goal })}
          value={sedation.goal}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={rassValue <= -4 ? "danger" : "success"}>
          {rassValue <= -4 ? "Deep sedation alert" : "Dose within range"}
        </Badge>
        <Badge tone="warning">Respiratory depression watch</Badge>
        <Badge tone="info">Trend prediction {rassValue <= -3 ? "watch" : "stable"}</Badge>
      </div>
      <ClinicalTextarea defaultValue="Maintain current infusion. Reassess after CT review and next neurological observation." />
      <Button
        className="mt-3"
        onClick={() =>
          toast.success(`Sedation updated: ${sedation.drug}, RASS ${sedation.rass || "-"}`)
        }
      >
        <Save className="h-4 w-4" />
        Save Sedation
      </Button>
    </ClinicalPanel>
  );
}

function EvdPanel({
  expanded,
  value,
  onChange,
}: {
  expanded?: boolean;
  value?: EvdState;
  onChange?: (_value: EvdState) => void;
}) {
  const [localValue, setLocalValue] = React.useState<EvdState>(
    value ?? {
      output: "18",
      height: "10 cmH2O",
      icp: "23",
      waveform: "Present",
      colour: "Xanthochromic",
    },
  );
  const evd = value ?? localValue;
  const evdOutputValue = numericValue(evd.output, 0);
  const icpValue = numericValue(evd.icp, 0);
  const update = React.useCallback(
    (patch: Partial<EvdState>) => {
      const next = { ...evd, ...patch };
      setLocalValue(next);
      onChange?.(next);
    },
    [evd, onChange],
  );

  return (
    <ClinicalPanel
      title="EVD Monitoring"
      subtitle="Drain output, colour, height, waveform and ICP integration"
      icon={Droplets}
    >
      <div
        className={cn("grid gap-3", expanded ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2")}
      >
        <ClinicalField
          label="EVD output"
          onChange={(output) => update({ output })}
          value={evd.output}
        />
        <ClinicalField
          label="Drain height"
          onChange={(height) => update({ height })}
          value={evd.height}
        />
        <ClinicalField label="ICP" onChange={(icp) => update({ icp })} value={evd.icp} />
        <ClinicalField
          label="Waveform"
          onChange={(waveform) => update({ waveform })}
          value={evd.waveform}
        />
      </div>
      <div className="mt-3">
        <div className="mb-2 text-xs font-bold uppercase text-[#667085]">Fluid colour</div>
        <div className="flex flex-wrap gap-2">
          {["Clear", "Pink", "Xanthochromic", "Bloody"].map((item) => (
            <button
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-semibold",
                item === evd.colour
                  ? "border-[#f79009] bg-[#fffaeb] text-[#b54708]"
                  : "border-[#d0d5dd] bg-white text-[#475467]",
              )}
              key={item}
              onClick={() => update({ colour: item })}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div
        className={cn(
          "mt-3 rounded-lg border p-3 text-sm font-semibold",
          icpValue > 20 || evdOutputValue > 15
            ? "border-[#fedf89] bg-[#fffaeb] text-[#b54708]"
            : "border-[#abefc6] bg-[#ecfdf3] text-[#027a48]",
        )}
      >
        {icpValue > 20 || evdOutputValue > 15
          ? "Critical threshold: ICP/output above target. Notify neurologist if sustained."
          : "EVD parameters currently within target range."}
      </div>
      <Button
        className="mt-3"
        onClick={() =>
          toast.success(`EVD updated: ${evd.output || "-"} ml/hr, ICP ${evd.icp || "-"}`)
        }
      >
        <Save className="h-4 w-4" />
        Save EVD
      </Button>
    </ClinicalPanel>
  );
}

function DeliriumPanel({
  expanded,
  value,
  onChange,
}: {
  expanded?: boolean;
  value?: DeliriumState;
  onChange?: (_value: DeliriumState) => void;
}) {
  const [localValue, setLocalValue] = React.useState<DeliriumState>(
    value ?? { camPositive: false, attentionScore: "4/5" },
  );
  const delirium = value ?? localValue;
  const update = React.useCallback(
    (patch: Partial<DeliriumState>) => {
      const next = { ...delirium, ...patch };
      setLocalValue(next);
      onChange?.(next);
    },
    [delirium, onChange],
  );

  return (
    <ClinicalPanel
      title="Delirium / CAM Assessment"
      subtitle="Binary CAM assessment with cognitive status and risk classification"
      icon={ShieldAlert}
    >
      <div className={cn("grid gap-3", expanded ? "md:grid-cols-[260px_1fr]" : "")}>
        <div className="grid grid-cols-2 gap-2">
          <Button
            className={cn(
              "h-16",
              delirium.camPositive
                ? "bg-[#d92d20] hover:bg-[#b42318]"
                : "border-[#f04438]/30 text-[#b42318]",
            )}
            onClick={() => update({ camPositive: true })}
            variant={delirium.camPositive ? "default" : "outline"}
          >
            YES
          </Button>
          <Button
            className={cn("h-16", !delirium.camPositive && "bg-[#12b76a] hover:bg-[#039855]")}
            onClick={() => update({ camPositive: false })}
            variant={delirium.camPositive ? "outline" : "default"}
          >
            NO
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <ClinicalField
            label="CAM result"
            value={delirium.camPositive ? "CAM Positive" : "CAM Negative"}
          />
          <ClinicalField
            label="Attention score"
            onChange={(attentionScore) => update({ attentionScore })}
            value={delirium.attentionScore}
          />
          <ClinicalField label="Risk class" value={delirium.camPositive ? "High" : "Low"} />
        </div>
      </div>
      <ClinicalTextarea
        defaultValue={
          delirium.camPositive
            ? "Delirium present. Review reversible causes, lines safety, sleep cycle and medication burden."
            : "No delirium currently. Continue sleep hygiene and line safety precautions."
        }
      />
      <Button
        className="mt-3"
        onClick={() =>
          toast.success(
            `Delirium updated: ${delirium.camPositive ? "CAM Positive" : "CAM Negative"}`,
          )
        }
      >
        <Save className="h-4 w-4" />
        Save CAM
      </Button>
    </ClinicalPanel>
  );
}

function PupilPanel({
  expanded,
  value,
  onChange,
}: {
  expanded?: boolean;
  value?: PupilState;
  onChange?: (_value: PupilState) => void;
}) {
  const [localValue, setLocalValue] = React.useState<PupilState>(
    value ?? {
      rightSize: "3.2",
      leftSize: "3.1",
      rightNpi: "3.8",
      leftNpi: "3.9",
      reactivity: "Brisk",
    },
  );
  const pupil = value ?? localValue;
  const lowestNpi = Math.min(numericValue(pupil.rightNpi, 0), numericValue(pupil.leftNpi, 0));
  const asymmetry = Math.abs(numericValue(pupil.rightSize, 0) - numericValue(pupil.leftSize, 0));
  const update = React.useCallback(
    (patch: Partial<PupilState>) => {
      const next = { ...pupil, ...patch };
      setLocalValue(next);
      onChange?.(next);
    },
    [onChange, pupil],
  );

  return (
    <ClinicalPanel
      title="Pupil Reactivity"
      subtitle="Pupil size, NPi, laterality and neurological reactivity tracking"
      icon={Eye}
    >
      <div
        className={cn("grid gap-3", expanded ? "md:grid-cols-2 xl:grid-cols-5" : "md:grid-cols-2")}
      >
        <ClinicalField
          label="Right size mm"
          onChange={(rightSize) => update({ rightSize })}
          value={pupil.rightSize}
        />
        <ClinicalField
          label="Left size mm"
          onChange={(leftSize) => update({ leftSize })}
          value={pupil.leftSize}
        />
        <ClinicalField
          label="Right NPi"
          onChange={(rightNpi) => update({ rightNpi })}
          value={pupil.rightNpi}
        />
        <ClinicalField
          label="Left NPi"
          onChange={(leftNpi) => update({ leftNpi })}
          value={pupil.leftNpi}
        />
        <ClinicalField
          label="Reactivity"
          onChange={(reactivity) => update({ reactivity })}
          value={pupil.reactivity}
        />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-3">
          <div className="text-xs font-bold uppercase text-[#667085]">Lowest NPi</div>
          <div className="mt-1 text-2xl font-bold text-[#101828]">{lowestNpi.toFixed(1)}</div>
          <Badge tone={lowestNpi < 3 ? "critical" : lowestNpi < 3.5 ? "warning" : "success"}>
            {lowestNpi < 3 ? "Critical" : lowestNpi < 3.5 ? "Watch" : "Reactive"}
          </Badge>
        </div>
        <div className="rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-3">
          <div className="text-xs font-bold uppercase text-[#667085]">Asymmetry</div>
          <div className="mt-1 text-2xl font-bold text-[#101828]">{asymmetry.toFixed(1)} mm</div>
          <Badge tone={asymmetry >= 1 ? "warning" : "success"}>
            {asymmetry >= 1 ? "Review" : "Symmetric"}
          </Badge>
        </div>
        <div className="rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-3">
          <div className="text-xs font-bold uppercase text-[#667085]">Clinical action</div>
          <p className="mt-2 text-sm font-semibold text-[#475467]">
            {lowestNpi < 3
              ? "Escalate neurological review and correlate with ICP."
              : "Continue scheduled pupil checks."}
          </p>
        </div>
      </div>
      <Button
        className="mt-3"
        onClick={() => toast.success(`Pupil updated: lowest NPi ${lowestNpi.toFixed(1)}`)}
      >
        <Save className="h-4 w-4" />
        Save Pupil
      </Button>
    </ClinicalPanel>
  );
}

function AnalyticsSection({
  trend,
  search,
  onSearch,
}: {
  trend: TrendPoint[];
  search: string;
  onSearch: (_value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Real-time Neuro Graph Engine</CardTitle>
          <Button size="sm" variant="outline">
            Fullscreen
          </Button>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis orientation="right" yAxisId="right" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #dbe4f0" }} />
              <ReferenceLine label="ICP threshold" stroke="#d92d20" y={20} yAxisId="left" />
              <Line
                dataKey="gcs"
                dot={false}
                stroke="#155eef"
                strokeWidth={3}
                type="monotone"
                yAxisId="left"
              />
              <Line
                dataKey="icp"
                dot={false}
                stroke="#d92d20"
                strokeWidth={3}
                type="monotone"
                yAxisId="left"
              />
              <Line
                dataKey="evd"
                dot={false}
                stroke="#06aed4"
                strokeWidth={3}
                type="monotone"
                yAxisId="right"
              />
              <Line
                dataKey="sedation"
                dot={false}
                stroke="#7c3aed"
                strokeWidth={3}
                type="monotone"
                yAxisId="right"
              />
              <Line
                dataKey="pupil"
                dot={false}
                stroke="#0f766e"
                strokeWidth={3}
                type="monotone"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-2">
        <LogTable
          title="GCS Trend Log"
          headers={["Time", "Eye", "Verbal", "Motor", "Total", "Severity", "By"]}
          rows={gcsRows}
          search={search}
          onSearch={onSearch}
        />
        <LogTable
          title="EVD Output Log"
          headers={["Time", "Output", "Colour", "ICP", "Severity"]}
          rows={evdRows}
          search={search}
          onSearch={onSearch}
        />
        <LogTable
          title="Sedation Log"
          headers={["Time", "Drug", "Dose", "Route", "RASS", "Status"]}
          rows={sedationRows}
          search={search}
          onSearch={onSearch}
        />
        <LogTable
          title="Delirium Log"
          headers={["Time", "CAM", "Present", "Notes", "Risk"]}
          rows={deliriumRows}
          search={search}
          onSearch={onSearch}
        />
      </div>
    </div>
  );
}

function ReportsSection() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Clinical Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            [
              "Predictive neurological decline",
              "GCS and ICP pattern suggests closer review in 30 minutes.",
              "warning",
            ],
            [
              "Duplicate entry prevention",
              "No duplicate GCS entry detected for current observation window.",
              "success",
            ],
            [
              "Offline recovery sync",
              "Drafts are autosaved locally until network returns.",
              "info",
            ],
            ["Audit logging", "All clinical edits require doctor/nurse signature.", "info"],
          ].map(([title, body, tone]) => (
            <InsightCard body={body} key={title} title={title} tone={tone as BadgeProps["tone"]} />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {[
            "Neuro ICU summary",
            "GCS trend PDF",
            "EVD output CSV",
            "Shift handover",
            "Audit history",
          ].map((item) => (
            <Button key={item} variant="outline">
              <FileDown className="h-4 w-4" />
              {item}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionsPanel() {
  return (
    <aside className="sticky top-20 hidden self-start 2xl:block">
      <Card className="border-[#dbe4f0]">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button variant="outline" onClick={() => toast.success("GCS entry opened")}>
            <ClipboardList className="h-4 w-4" />
            Add GCS Entry
          </Button>
          <Button variant="outline" onClick={() => toast.success("Sedation entry opened")}>
            <Pill className="h-4 w-4" />
            Add Sedation
          </Button>
          <Button variant="outline" onClick={() => toast.success("EVD entry opened")}>
            <Droplets className="h-4 w-4" />
            Add EVD
          </Button>
          <Button variant="outline" onClick={() => toast.success("CAM assessment opened")}>
            <ShieldAlert className="h-4 w-4" />
            Add Delirium
          </Button>
          <Button
            className="bg-[#d92d20] hover:bg-[#b42318]"
            onClick={() => toast.error("Emergency Neuro Alert triggered")}
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency Alert
          </Button>
          <Button onClick={() => toast.success("Doctor notified")}>
            <Bell className="h-4 w-4" />
            Notify Doctor
          </Button>
          <div className="rounded-lg border border-[#dbe4f0] bg-[#f8fafc] p-3 text-xs font-medium text-[#667085]">
            Shortcuts: G for GCS, S for Sedation, E for EVD, D for Delirium.
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function ClinicalPanel({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Brain;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-[#dbe4f0]">
      <CardHeader className="bg-white">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f1ff] text-[#155eef]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-xs font-medium text-[#667085]">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function RadioCards({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<[number, string]>;
  value: number;
  onChange: (_value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase text-[#667085]">{label}</div>
      <div className="grid gap-2">
        {options.map(([score, text]) => (
          <button
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs font-semibold transition",
              value === score
                ? "border-[#155eef] bg-[#e8f1ff] text-[#155eef]"
                : "border-[#d0d5dd] bg-white text-[#475467] hover:border-[#155eef]/50",
            )}
            key={score}
            onClick={() => onChange(score)}
            type="button"
          >
            <span>{text}</span>
            <span>{score}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ClinicalField({
  label,
  value = "",
  onChange,
}: {
  label: string;
  value?: string;
  onChange?: (_value: string) => void;
}) {
  return (
    <label className="space-y-1 text-xs font-bold uppercase text-[#667085]">
      <span>{label}</span>
      <Input
        className="h-9 bg-white normal-case"
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={!onChange}
        value={value ?? ""}
      />
    </label>
  );
}

function ClinicalTextarea({ defaultValue }: { defaultValue: string }) {
  return (
    <textarea
      className="mt-3 min-h-16 w-full resize-none rounded-lg border border-[#d0d5dd] bg-white px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-[#155eef]/20"
      defaultValue={defaultValue}
    />
  );
}

function LogTable({
  title,
  headers,
  rows,
  search,
  onSearch,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  search: string;
  onSearch: (_value: string) => void;
}) {
  const filteredRows = rows.filter((row) =>
    row.join(" ").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <Card className="overflow-hidden border-[#dbe4f0]">
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
          <Input
            className="h-8 pl-8 text-xs"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search logs"
            value={search ?? ""}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[#f2f6fb] text-[#667085]">
              <tr>
                {headers.map((header) => (
                  <th className="px-3 py-2 font-bold" key={header}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, rowIndex) => (
                <tr
                  className="border-t border-[#eef2f7] hover:bg-[#f8fafc]"
                  key={`${title}-${rowIndex}`}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      className={cn(
                        "px-3 py-2 font-medium text-[#344054]",
                        /critical|severe|high|cam positive/i.test(cell) && "text-[#b42318]",
                      )}
                      key={`${title}-${rowIndex}-${cellIndex}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#eef2f7] p-3">
          <Button size="sm" variant="outline">
            <FileDown className="h-4 w-4" />
            CSV
          </Button>
          <Button size="sm" variant="outline">
            <Printer className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({
  title,
  body,
  tone,
}: {
  title: string;
  body: string;
  tone: BadgeProps["tone"];
}) {
  return (
    <div className="rounded-lg border border-[#dbe4f0] bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold text-[#101828]">{title}</div>
        <Badge tone={tone}>{tone}</Badge>
      </div>
      <p className="mt-2 text-sm font-medium text-[#667085]">{body}</p>
    </div>
  );
}

export function NeuroOverviewPage() {
  return <NeuroDoctorWorkspace initialTab="overview" />;
}
export function NeuroGcsPage() {
  return <NeuroDoctorWorkspace initialTab="gcs" />;
}
export function NeuroSedationPage() {
  return <NeuroDoctorWorkspace initialTab="sedation" />;
}
export function NeuroEvdPage() {
  return <NeuroDoctorWorkspace initialTab="evd" />;
}
export function NeuroDeliriumPage() {
  return <NeuroDoctorWorkspace initialTab="delirium" />;
}
export function NeuroPupilPage() {
  return <NeuroDoctorWorkspace initialTab="pupil" />;
}
export function NeuroMotorSensoryPage() {
  return <NeuroDoctorWorkspace initialTab="gcs" />;
}
export function NeuroTimelinePage() {
  return <NeuroDoctorWorkspace initialTab="analytics" />;
}
export function NeuroSeizurePage() {
  return <NeuroDoctorWorkspace initialTab="overview" />;
}
export function NeuroVentilationPage() {
  return <NeuroDoctorWorkspace initialTab="overview" />;
}
export function NeuroReportsPage() {
  return <NeuroDoctorWorkspace initialTab="reports" />;
}
export function NeuroAnalyticsPage() {
  return <NeuroDoctorWorkspace initialTab="analytics" />;
}
