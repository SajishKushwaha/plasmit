"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, AlertTriangle, ArrowLeft, Bell, CalendarClock, CheckCircle2, ClipboardList, Clock3, Filter, Menu, MoreHorizontal, Pencil, Plus, Printer, RefreshCcw, Save, Search, Trash2, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StickyActionBar } from "@/features/admin/admin-shared";
import {
  abdominalChartConfigs,
  abdominalComparisonRecords,
  abdominalHourlyRecords,
  abdominalInsights,
  abdominalMetrics,
  abdominalTrendData,
  drainAlertTriggers,
  drainAlerts,
  drainEntries,
  drainInsights,
  drainRecords,
  drainTypes,
  lineDeviceAlertTriggers,
  lineDeviceAlerts,
  lineDeviceCommonFields,
  lineDeviceEntries,
  lineDeviceInsights,
  lineDeviceRecords,
  lineDeviceTrendData,
  lineDeviceTypes,
  lumenStatusRecords,
  cvsInsights,
  cvsMetrics,
  cvsParameterCards,
  cvsRecords,
  cvsTrendData,
  trendOptions,
  type AbdominalHourlyRecord,
  type AbdominalMetric,
  type AbdominalParameterId,
  type CvsMetric,
  type CvsParameterId,
  type CvsRecord,
  type CvsStatus,
  type DrainAlert,
  type DrainRecord,
  type DrainSeverity,
  type DrainStatus,
  type LineDeviceAlert,
  type LineDeviceRecord,
  type LineDeviceSeverity,
  type LineDeviceStatus,
} from "@/data/icu-monitoring";
import { mockPatients, mockPatientVisits } from "@/data/patients";
import { cn } from "@/lib/utils";

const conditionOptions = ["Clean", "Redness", "Swelling", "Infection"];

type IcuPatientContext = {
  id: string;
  uhid: string;
  name: string;
  ageGender: string;
  encounter: string;
  department: string;
  bed: string;
  consultant: string;
  allergies: string;
  alerts: string[];
};

function patientName(patient: (typeof mockPatients)[number]) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

function patientSearchText(patient: (typeof mockPatients)[number]) {
  return [
    patient.id,
    patient.uhid,
    patient.firstName,
    patient.lastName,
    patient.mobile,
    patient.department,
    patient.city,
    patient.status,
  ].join(" ").toLowerCase();
}

function consultantForDepartment(department: string) {
  const consultants: Record<string, string> = {
    Cardiology: "Dr. Kavita Rao",
    Emergency: "Emergency desk",
    Oncology: "Dr. Rakesh Menon",
    Orthopedics: "Dr. Aman Verma",
    Pediatrics: "Dr. Neha Malik",
  };
  return consultants[department] ?? "Duty consultant";
}

function icuPatientFromRecord(patient: (typeof mockPatients)[number]): IcuPatientContext {
  const visits = mockPatientVisits.filter((visit) => visit.patientId === patient.id);
  const activeVisit = visits.find((visit) => visit.status === "Active") ?? visits[0];
  const encounter = visits.length ? visits.map((visit) => visit.referenceNumber).join(" / ") : "No active encounter";
  const bed = activeVisit?.visitType === "IPD" ? `${patient.department} Ward / ICU bed pending` : `${patient.department} ${activeVisit?.visitType ?? "OPD"}`;
  const allergyFlags = patient.alertFlags.filter((flag) => flag.toLowerCase().includes("allergy"));
  const nonAllergyFlags = patient.alertFlags.filter((flag) => !flag.toLowerCase().includes("allergy"));

  return {
    id: patient.id,
    uhid: patient.uhid,
    name: patientName(patient),
    ageGender: `${patient.age}/${patient.gender.charAt(0)}`,
    encounter,
    department: activeVisit?.department ?? patient.department,
    bed,
    consultant: activeVisit?.provider ?? consultantForDepartment(patient.department),
    allergies: allergyFlags.length ? allergyFlags.map((flag) => flag.replace(/^Allergy:\s*/i, "")).join(", ") : "No known allergy",
    alerts: nonAllergyFlags.length ? nonAllergyFlags : ["No active risk flag"],
  };
}

function useIcuPatientContext() {
  const searchParams = useSearchParams();
  const requestedPatientId = searchParams.get("patientId") ?? mockPatients[0].id;
  const selectedRecord = mockPatients.find((patient) => patient.id === requestedPatientId) ?? mockPatients[0];
  const patient = icuPatientFromRecord(selectedRecord);
  const withPatient = React.useCallback((href: string) => {
    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}patientId=${selectedRecord.id}`;
  }, [selectedRecord.id]);

  return { patient, selectedPatientId: selectedRecord.id, withPatient };
}

function PageMotion({ children }: { children: React.ReactNode }) {
  return <motion.div animate={{ opacity: 1, y: 0 }} className="space-y-4" initial={{ opacity: 0, y: 8 }} transition={{ duration: 0.22, ease: "easeOut" }}>{children}</motion.div>;
}

function BackButton({ href = "/icu-monitoring/cvs", withPatient }: { href?: string; withPatient?: (href: string) => string }) {
  return (
    <Button asChild className="px-2 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground" size="sm" variant="ghost">
      <Link aria-label="Go back" href={withPatient ? withPatient(href) : href} title="Back">
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
    </Button>
  );
}

function statusTone(status: CvsStatus) {
  return status === "Stable" ? "success" : status === "Watch" ? "warning" : "critical";
}

function drainStatusTone(status: DrainStatus) {
  return status === "Normal" ? "success" : status === "Monitor" ? "warning" : status === "High Output" ? "danger" : "critical";
}

function severityTone(severity: DrainSeverity) {
  return severity === "Stable" ? "success" : severity === "Monitor" ? "warning" : "critical";
}

function lineDeviceStatusTone(status: LineDeviceStatus) {
  return status === "Active" ? "success" : status === "Watch" ? "warning" : status === "Critical" ? "critical" : "muted";
}

function lineSeverityTone(severity: LineDeviceSeverity) {
  return severity === "Stable" ? "success" : severity === "Monitor" ? "warning" : "critical";
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 96;
    const y = 34 - ((value - min) / Math.max(max - min, 1)) * 28;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg aria-hidden className="h-10 w-28" viewBox="0 0 96 38">
      <polyline fill="none" points={points} stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

function ClientChart({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);
  if (!mounted) {
    return (
      <div className="space-y-3 p-2">
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => <Skeleton className="h-3" key={index} />)}
        </div>
      </div>
    );
  }
  return children;
}

function MetricCard({ metric, withPatient }: { metric: CvsMetric; withPatient?: (href: string) => string }) {
  const Icon = metric.icon;
  const href = `/icu-monitoring/cvs/${metric.id}`;
  return (
    <Link href={withPatient ? withPatient(href) : href} className="group block">
      <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(39,37,54,0.10)]">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{metric.label}</div>
                <div className="text-xs text-muted-foreground">Updated {metric.updatedAt}</div>
              </div>
            </div>
            <Badge tone={statusTone(metric.status)}>{metric.status}</Badge>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                <span className="text-sm font-medium text-muted-foreground">{metric.unit}</span>
              </div>
              {metric.detail ? <div className="mt-1 text-xs font-semibold text-muted-foreground">{metric.detail}</div> : null}
            </div>
            <Sparkline color={metric.color} values={metric.sparkline} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function IcuPatientHeader({
  patient,
  actions,
}: {
  patient: IcuPatientContext;
  actions?: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [patientSearch, setPatientSearch] = React.useState("");
  const filteredPatients = React.useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return mockPatients;
    return mockPatients.filter((record) => patientSearchText(record).includes(query));
  }, [patientSearch]);
  const fields = [
    ["UHID", patient.uhid],
    ["Age/Gender", patient.ageGender],
    ["IPD/OPD No.", patient.encounter],
    ["Ward/Bed", patient.bed],
    ["Consultant", patient.consultant],
    ["Allergy", patient.allergies],
  ];
  const visibleAlerts = patient.alerts.filter((alert) => alert !== "No active risk flag");
  const selectPatient = React.useCallback((patientId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("patientId", patientId);
    router.push(`${pathname}?${params.toString()}`);
    setPatientSearch("");
  }, [pathname, router, searchParams]);

  return (
    <Card className="overflow-visible border-border bg-white shadow-soft" data-patient-workspace-header>
      <CardContent className="relative space-y-3 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-foreground">{patient.name}</h1>
              <Badge tone="muted">{patient.id}</Badge>
              {visibleAlerts.map((alert) => <Badge key={alert} tone="warning">{alert}</Badge>)}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              <span>{patient.uhid}</span>
              <span>{patient.ageGender}</span>
              <span>{patient.bed}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap justify-start gap-2 xl:justify-end">
            <div className="relative min-w-64 flex-1 xl:max-w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search monitoring patient"
                className="h-9 bg-white pl-9 text-sm font-semibold"
                onChange={(event) => setPatientSearch(event.target.value)}
                placeholder="Search patient / UHID"
                value={patientSearch}
              />
              {patientSearch ? (
                <div className="absolute left-0 top-10 z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-white p-1 shadow-soft">
                  {filteredPatients.length ? filteredPatients.map((record) => (
                    <button
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-primary-soft",
                        record.id === patient.id && "bg-primary-soft text-primary"
                      )}
                      key={record.id}
                      onClick={() => selectPatient(record.id)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{patientName(record)}</span>
                        <span className="block truncate text-xs text-muted-foreground">{record.uhid} • {record.mobile} • {record.department}</span>
                      </span>
                      <Badge tone={record.id === patient.id ? "info" : "muted"}>{record.status}</Badge>
                    </button>
                  )) : (
                    <div className="px-3 py-4 text-sm font-medium text-muted-foreground">No matching patient found</div>
                  )}
                </div>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            <div className="flex rounded-lg border border-border bg-white p-0.5 shadow-sm">
              <Button aria-label="Print" className="h-8 w-8 shadow-none" size="icon" title="Print" variant="ghost" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
              <Button aria-label="Restore draft" className="h-8 w-8 shadow-none" size="icon" title="Restore draft" variant="ghost" onClick={() => toast.info("Last monitoring draft restored")}><RefreshCcw className="h-4 w-4" /></Button>
            </div>
            <Button size="sm" onClick={() => toast.success("Monitoring draft autosaved")}><Save className="h-4 w-4" />Save</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
          {fields.slice(2).map(([label, value]) => (
            <div className="rounded-md bg-surface-muted px-2.5 py-1.5" key={label}>
              <span className="font-semibold text-muted-foreground">{label}: </span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          ))}
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge tone="info">Autosave 20 sec</Badge>
            <Badge tone="muted">Shortcuts ready</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeaderBand({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  void title;
  void subtitle;

  return <IcuPatientSearchHeader actions={actions} />;
}

export function IcuPatientSearchHeader({ actions }: { actions?: React.ReactNode }) {
  const { patient } = useIcuPatientContext();

  return <IcuPatientHeader actions={actions} patient={patient} />;
}

export function IcuMonitoringPage() {
  const { withPatient } = useIcuPatientContext();
  return (
    <PageMotion>
      <HeaderBand title="ICU Monitoring" subtitle="Select CVS, Abdominal, Drains & Tubes, or Lines & Devices directly from the left sidebar." actions={<Button asChild size="sm"><Link href={withPatient("/icu-monitoring/cvs")}>Open CVS</Link></Button>} />
      <Card>
        <CardContent className="p-4">
          <EmptyState icon={Activity} title="ICU modules moved to sidebar" description="The ICU module shortcuts are now available in the left sidebar for faster bedside navigation." />
        </CardContent>
      </Card>
    </PageMotion>
  );
}

export function CvsDashboardPage() {
  const { withPatient } = useIcuPatientContext();
  return (
    <PageMotion>
      <HeaderBand
        title="CVS Monitoring"
        subtitle="Cardiovascular bedside readings, trends, and records for the selected patient."
        actions={<><Button asChild size="sm"><Link href={withPatient("/icu-monitoring/cvs/add")}><Plus className="h-4 w-4" />Add CVS Entry</Link></Button><Button asChild size="sm" variant="outline"><Link href={withPatient("/icu-monitoring/cvs/trends")}>View Trends</Link></Button><Button asChild size="sm" variant="outline"><Link href={withPatient("/icu-monitoring/cvs/records")}>View All Records</Link></Button></>}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{cvsMetrics.map((metric) => <MetricCard key={metric.id} metric={metric} withPatient={withPatient} />)}</div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><div><CardTitle>Bedside trend preview</CardTitle><CardDescription>Last seven cardiovascular readings</CardDescription></div><Button asChild size="sm" variant="outline"><Link href={withPatient("/icu-monitoring/cvs/trends")}><TrendingUp className="h-4 w-4" />Open trends</Link></Button></CardHeader>
          <CardContent className="h-64">
            <ClientChart>
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={cvsTrendData}><CartesianGrid stroke="#eceaf2" /><XAxis dataKey="time" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line dataKey="hr" dot={false} stroke="#7367f0" strokeWidth={3} /><Line dataKey="nibpMap" dot={false} stroke="#22a06b" strokeWidth={3} /><Line dataKey="arterialMap" dot={false} stroke="#5b8def" strokeWidth={3} /></LineChart>
              </ResponsiveContainer>
            </ClientChart>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f5f7ff]">
          <CardHeader><div><CardTitle>Clinical Insight</CardTitle><CardDescription>Static decision-support preview</CardDescription></div></CardHeader>
          <CardContent className="space-y-3">
            {cvsInsights.map((insight) => <div className="rounded-xl border border-border bg-white p-3 text-sm font-medium text-foreground shadow-sm" key={insight}>{insight}</div>)}
          </CardContent>
        </Card>
      </div>
    </PageMotion>
  );
}

export function CvsAddPage() {
  const { withPatient } = useIcuPatientContext();
  return (
    <PageMotion>
      <HeaderBand title="Add CVS Entry" subtitle="Choose the cardiovascular parameter to document for this ICU bedside record." actions={<BackButton withPatient={withPatient} />} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cvsParameterCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link href={withPatient(item.route)} key={item.id} className="group block">
              <Card className="transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(39,37,54,0.10)]">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="font-bold text-foreground">{item.label}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageMotion>
  );
}

const formFields: Record<CvsParameterId, { title: string; fields: string[] }> = {
  "heart-rate": { title: "Heart Rate", fields: ["Date & Time", "Heart Rate bpm", "Rhythm", "Source", "Notes"] },
  temperature: { title: "Temperature", fields: ["Date & Time", "Temperature C", "Source", "Site", "Notes"] },
  "bp-nibp": { title: "Blood Pressure - NIBP", fields: ["Date & Time", "SBP", "DBP", "MAP", "Position", "Arm", "Cuff Size", "Source", "Notes"] },
  "bp-arterial": { title: "Blood Pressure - Arterial Line", fields: ["Date & Time", "SBP", "DBP", "MAP", "Arterial Line Site", "Waveform", "Source", "Transducer Zeroed", "Notes"] },
  cvp: { title: "CVP", fields: ["Date & Time", "CVP mmHg", "Patient Position", "Transducer Zeroed", "Waveform", "Notes"] },
  pcwp: { title: "PCWP", fields: ["Date & Time", "PCWP mmHg", "Patient Position", "Waveform", "Notes"] },
};

export function CvsParameterFormPage({ parameter }: { parameter: CvsParameterId }) {
  const router = useRouter();
  const { withPatient } = useIcuPatientContext();
  const config = formFields[parameter];
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);
  const required = config.fields.filter((field) => !field.includes("Notes"));
  const missing = required.filter((field) => !values[field]?.trim());
  return (
    <PageMotion>
      <HeaderBand title={config.title} subtitle="Structured ICU bedside entry with validation, draft state, and audit-friendly save action." actions={<BackButton href="/icu-monitoring/cvs/add" withPatient={withPatient} />} />
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardContent className="grid gap-3 p-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <label className={cn("space-y-1 text-sm", field === "Notes" && "md:col-span-2")} key={field}>
                <span className="font-medium text-foreground">{field}</span>
                <Input
                  className={submitted && !field.includes("Notes") && !values[field]?.trim() ? "border-danger" : undefined}
                  onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
                  placeholder={field === "Date & Time" ? "Today 18:00" : field}
                  value={values[field] ?? ""}
                />
              </label>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>Autosave draft</CardTitle><CardDescription>Static preview</CardDescription></div></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-xl border border-info/20 bg-info/10 p-3 text-info">Draft prepared locally. Final save writes to mock workflow only.</div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            {submitted && missing.length ? <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-danger">{missing.length} required fields need values.</div> : null}
          </CardContent>
        </Card>
      </div>
      <StickyActionBar
        onReset={() => setValues({})}
        onSave={() => {
          setSubmitted(true);
          if (missing.length) {
            toast.error("Complete required CVS fields before saving");
            return;
          }
          toast.success(`${config.title} saved to CVS monitoring`);
          router.push(withPatient("/icu-monitoring/cvs/records"));
        }}
        saveLabel="Save CVS entry"
      />
    </PageMotion>
  );
}

export function CvsTrendsPage() {
  const { withPatient } = useIcuPatientContext();
  const [selected, setSelected] = React.useState<(typeof trendOptions)[number]>(trendOptions[0]);
  const columns = React.useMemo<ColumnDef<(typeof cvsTrendData)[number]>[]>(() => [
    { header: "Time", accessorKey: "time" },
    { header: selected.label, cell: ({ row }) => `${row.original[selected.key]} ${selected.unit}` },
  ], [selected]);
  return (
    <PageMotion>
      <HeaderBand title="CVS Trends" subtitle="Parameter-specific line charts with bedside data table for ICU review." actions={<BackButton withPatient={withPatient} />} />
      <Tabs value={selected.id} onValueChange={(value) => setSelected(trendOptions.find((item) => item.id === value) ?? trendOptions[0])}>
        <TabsList>{trendOptions.map((item) => <TabsTrigger key={item.id} value={item.id}>{item.label}</TabsTrigger>)}</TabsList>
        <TabsContent value={selected.id}>
          <Card>
            <CardContent className="h-72 p-4">
              <ClientChart>
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={cvsTrendData}><CartesianGrid stroke="#eceaf2" /><XAxis dataKey="time" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line dataKey={selected.key} dot={{ r: 3 }} stroke={selected.color} strokeWidth={3} /></LineChart>
                </ResponsiveContainer>
              </ClientChart>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <DataTable data={cvsTrendData} columns={columns} />
    </PageMotion>
  );
}

export function CvsRecordsPage() {
  const { withPatient } = useIcuPatientContext();
  const columns = React.useMemo<ColumnDef<CvsRecord>[]>(() => [
    { header: "Date & Time", accessorKey: "dateTime" },
    { header: "HR", cell: ({ row }) => `${row.original.hr} bpm` },
    { header: "Temperature", cell: ({ row }) => `${row.original.temperature} C` },
    { header: "BP NIBP SBP/DBP/MAP", accessorKey: "nibp" },
    { header: "BP Arterial SBP/DBP/MAP", accessorKey: "arterial" },
    { header: "CVP", cell: ({ row }) => `${row.original.cvp} mmHg` },
    { header: "PCWP", cell: ({ row }) => `${row.original.pcwp} mmHg` },
    { header: "Notes", accessorKey: "notes" },
  ], []);
  return (
    <PageMotion>
      <HeaderBand title="CVS Records" subtitle="Complete mock cardiovascular monitoring table for ICU bedside review." actions={<><BackButton withPatient={withPatient} /><Button asChild size="sm"><Link href={withPatient("/icu-monitoring/cvs/add")}><Plus className="h-4 w-4" />Add Entry</Link></Button></>} />
      <DataTable data={cvsRecords} columns={columns} />
    </PageMotion>
  );
}

function AbdominalMetricCard({ metric }: { metric: AbdominalMetric }) {
  const Icon = metric.icon;
  return (
    <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(39,37,54,0.10)]">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
            <div>
              <div className="text-sm font-semibold text-foreground">{metric.label}</div>
              <div className="text-xs text-muted-foreground">Updated {metric.updatedAt}</div>
            </div>
          </div>
          <Badge tone={statusTone(metric.status)}>{metric.status}</Badge>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{metric.value}</span>
              <span className="text-sm font-medium text-muted-foreground">{metric.unit}</span>
            </div>
          </div>
          <Sparkline color={metric.color} values={metric.sparkline} />
        </div>
      </CardContent>
    </Card>
  );
}

function TimeRangePanel() {
  const [range, setRange] = React.useState("24 Hours");
  const [startDateTime, setStartDateTime] = React.useState("");
  const [endDateTime, setEndDateTime] = React.useState("");
  const [dateRangeOpen, setDateRangeOpen] = React.useState(false);
  const rangeRef = React.useRef<HTMLDivElement | null>(null);
  const dateTimeSummary = startDateTime || endDateTime
    ? `${formatDateTimeRangeValue(startDateTime, "Start")} - ${formatDateTimeRangeValue(endDateTime, "End")}`
    : "Select start and end date-time";

  React.useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rangeRef.current?.contains(event.target as Node)) setDateRangeOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function applyRange() {
    if (startDateTime && endDateTime && startDateTime > endDateTime) {
      toast.error("End date-time must be after start date-time.");
      return;
    }
    const appliedRange = startDateTime || endDateTime ? dateTimeSummary : range;
    toast.success(`${appliedRange} abdominal filter applied`);
    setDateRangeOpen(false);
  }

  return (
    <Card className="sticky top-20 z-20">
      <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-[220px_auto_minmax(280px,1fr)_auto] xl:items-center">
        <label className="space-y-1 text-sm">
          <span className="sr-only">Select Parameter</span>
          <select className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20">
            <option>Select Parameter</option>
            <option>Intra-abdominal Pressure</option>
            <option>NG Output</option>
            <option>Gastrostomy Output</option>
            <option>Abdominal Drains Output</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {["12 Hours", "24 Hours"].map((item) => (
            <Button key={item} onClick={() => setRange(item)} size="sm" variant={range === item ? "default" : "outline"}>{item}</Button>
          ))}
        </div>
        <div className="relative min-w-0" ref={rangeRef}>
          <button
            className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-input bg-white px-3 text-left text-sm outline-none transition hover:border-primary/40 focus:ring-2 focus:ring-ring/20"
            onClick={() => setDateRangeOpen((current) => !current)}
            type="button"
          >
            <span className={cn("truncate", !startDateTime && !endDateTime ? "text-muted-foreground" : "font-medium text-foreground")}>{dateTimeSummary}</span>
            <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
          </button>
          {dateRangeOpen ? (
            <div className="absolute right-0 top-full z-50 mt-2 w-full min-w-[300px] rounded-xl border border-border bg-white p-4 shadow-soft sm:min-w-[440px]">
              <div className="mb-3">
                <div className="text-sm font-semibold text-foreground">Date-time range</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Select the start and end for the graph response.</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                  <span>Start date-time</span>
                  <Input onChange={(event) => setStartDateTime(event.target.value)} type="datetime-local" value={startDateTime} />
                </label>
                <label className="space-y-1 text-xs font-semibold text-muted-foreground">
                  <span>End date-time</span>
                  <Input min={startDateTime || undefined} onChange={(event) => setEndDateTime(event.target.value)} type="datetime-local" value={endDateTime} />
                </label>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                <Button onClick={() => {
                  setStartDateTime("");
                  setEndDateTime("");
                }} size="sm" type="button" variant="ghost">
                  Clear
                </Button>
                <Button onClick={applyRange} size="sm" type="button">Use range</Button>
              </div>
            </div>
          ) : null}
        </div>
        <Button className="w-full xl:w-auto" onClick={applyRange}>Apply</Button>
      </CardContent>
    </Card>
  );
}

function formatDateTimeRangeValue(value: string, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AbdominalTrendCard({ config }: { config: (typeof abdominalChartConfigs)[number] }) {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]">
      <CardHeader>
        <div>
          <CardTitle>{config.label}</CardTitle>
          <CardDescription>Latest {config.latest} • Total {config.total}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-64 p-4">
        <ClientChart>
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={abdominalTrendData}>
              <CartesianGrid stroke="#eceaf2" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line dataKey={config.dataKey} dot={{ r: 3 }} stroke={config.color} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ClientChart>
      </CardContent>
    </Card>
  );
}

function ClinicalNotesCard() {
  const [notes, setNotes] = React.useState("Abdomen soft, drain site clean. Continue hourly output monitoring and repeat IAP if distension increases.");
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Clinical Notes</CardTitle>
          <CardDescription>Last saved Today 18:05</CardDescription>
        </div>
        <Clock3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          className="min-h-28 w-full rounded-xl border border-input bg-white p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Abdominal monitoring notes saved")}><Save className="h-4 w-4" />Save notes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ClinicalInsightCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f5f7ff]">
      <CardHeader>
        <div>
          <CardTitle>Clinical Insight</CardTitle>
          <CardDescription>Static abdominal safety preview</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {abdominalInsights.map((insight) => <div className="rounded-xl border border-border bg-white p-3 text-sm font-medium text-foreground shadow-sm" key={insight}>{insight}</div>)}
      </CardContent>
    </Card>
  );
}

export function AbdominalDashboardPage() {
  const { withPatient } = useIcuPatientContext();
  return (
    <PageMotion>
      <HeaderBand
        title="Abdominal Monitoring"
        subtitle="Abdominal pressure, output trends, hourly records, and notes for the selected patient."
        actions={<><Button asChild size="sm" variant="outline"><Link href={withPatient("/icu-monitoring/abdominal/trends")}>View Trends</Link></Button><Button asChild size="sm" variant="outline"><Link href={withPatient("/icu-monitoring/abdominal/records")}>View Records</Link></Button></>}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{abdominalMetrics.map((metric) => <AbdominalMetricCard key={metric.id} metric={metric} />)}</div>
      <TimeRangePanel />
      <div className="grid gap-4 xl:grid-cols-2">{abdominalChartConfigs.map((config) => <AbdominalTrendCard config={config} key={config.id} />)}</div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ClinicalNotesCard />
        <ClinicalInsightCard />
      </div>
    </PageMotion>
  );
}

function HourlyRecordTable({ parameter, title, unit }: { parameter: AbdominalParameterId; title: string; unit: string }) {
  const columns = React.useMemo<ColumnDef<AbdominalHourlyRecord>[]>(() => [
    { header: "Time", accessorKey: "time" },
    { header: "Per hour value", cell: ({ row }) => `${row.original.value} ${unit}` },
    { header: "12 hours total", cell: ({ row }) => `${row.original.total12h} ${unit === "mmHg" ? "avg" : "ml"}` },
    { header: "24 hours total", cell: ({ row }) => `${row.original.total24h} ${unit === "mmHg" ? "avg" : "ml"}` },
  ], [unit]);
  return (
    <div className="space-y-2">
      <div className="px-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">Per-hour abdominal monitoring record</div>
      </div>
      <DataTable data={abdominalHourlyRecords[parameter]} columns={columns} />
    </div>
  );
}

function ComparisonTable() {
  const hours = ["06", "08", "10", "12", "14", "16", "17", "18"];
  return (
    <Card>
      <CardHeader><div><CardTitle>24 Hour Detailed Records</CardTitle><CardDescription>Wide comparison table with hourly columns and totals</CardDescription></div></CardHeader>
      <CardContent className="p-0">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-[#f7f7fb] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="border-b border-border px-3 py-2">Parameter</th>
                {hours.map((hour) => <th className="border-b border-border px-3 py-2" key={hour}>{hour}:00</th>)}
                <th className="border-b border-border px-3 py-2">12 hour total</th>
                <th className="border-b border-border px-3 py-2">24 hour total</th>
              </tr>
            </thead>
            <tbody>
              {abdominalComparisonRecords.map((record) => (
                <tr className="border-b border-border/70 last:border-0 hover:bg-surface-muted/80" key={record.parameter}>
                  <td className="px-3 py-2 font-semibold text-foreground">{record.parameter}</td>
                  {record.hourly.map((value, index) => <td className="px-3 py-2 text-foreground" key={`${record.parameter}-${index}`}>{value}</td>)}
                  <td className="px-3 py-2 font-semibold text-foreground">{record.total12h}</td>
                  <td className="px-3 py-2 font-semibold text-foreground">{record.total24h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AbdominalTrendsPage() {
  const { withPatient } = useIcuPatientContext();
  return (
    <PageMotion>
      <HeaderBand title="Abdominal Trends" subtitle="Responsive trend cards for abdominal pressure and output monitoring." actions={<BackButton href="/icu-monitoring/abdominal" withPatient={withPatient} />} />
      <TimeRangePanel />
      <div className="grid gap-4 xl:grid-cols-2">{abdominalChartConfigs.map((config) => <AbdominalTrendCard config={config} key={config.id} />)}</div>
      <EmptyState icon={ClipboardList} title="No device feed connected" description="Mock data is displayed now. API endpoints can be connected when bedside device integration is ready." />
    </PageMotion>
  );
}

export function AbdominalRecordsPage() {
  const { withPatient } = useIcuPatientContext();
  return (
    <PageMotion>
      <HeaderBand title="Abdominal Records" subtitle="Hourly abdominal monitoring records with 12-hour and 24-hour totals." actions={<BackButton href="/icu-monitoring/abdominal" withPatient={withPatient} />} />
      <ComparisonTable />
      <div className="grid gap-4 xl:grid-cols-2">
        <HourlyRecordTable parameter="iap" title="Intra-abdominal Pressure" unit="mmHg" />
        <HourlyRecordTable parameter="ng-output" title="NG Output" unit="ml" />
        <HourlyRecordTable parameter="gastrostomy-output" title="Gastrostomy Output" unit="ml" />
        <HourlyRecordTable parameter="abdominal-drains" title="Abdominal Drains Output" unit="ml" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ClinicalNotesCard />
        <ClinicalInsightCard />
      </div>
    </PageMotion>
  );
}

function MobileIcuBottomNav({ dashboardHref = "/icu-monitoring/drains", alertsHref = "/icu-monitoring/drains/alerts" }: { dashboardHref?: string; alertsHref?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 py-2 shadow-[0_-8px_24px_rgba(39,37,54,0.08)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5 gap-1 text-[11px] font-semibold text-muted-foreground">
        {["Dashboard", "Patients", "Orders", "Alerts", "More"].map((item) => (
          <Link className={cn("rounded-lg px-1 py-2 text-center", item === "Alerts" && "bg-primary-soft text-primary")} href={item === "Alerts" ? alertsHref : dashboardHref} key={item}>{item}</Link>
        ))}
      </div>
    </div>
  );
}

function DrainLegendCard() {
  return (
    <Card>
      <CardHeader><div><CardTitle>Legend</CardTitle><CardDescription>ICU alert state</CardDescription></div></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {[["bg-critical", "Red dot = High Risk / Critical"], ["bg-warning", "Amber dot = Monitor Closely"], ["bg-success", "Green dot = Normal"]].map(([color, label]) => (
          <div className="flex items-center gap-2" key={label}><span className={cn("h-2.5 w-2.5 rounded-full", color)} /><span className="text-muted-foreground">{label}</span></div>
        ))}
      </CardContent>
    </Card>
  );
}

function DrainTriggersCard() {
  return (
    <Card>
      <CardHeader><div><CardTitle>Alert Triggers</CardTitle><CardDescription>Reference rules for static preview</CardDescription></div></CardHeader>
      <CardContent className="space-y-2">
        {drainAlertTriggers.map((trigger) => <div className="rounded-lg border border-border bg-[#f8f9fc] px-3 py-2 text-sm text-foreground" key={trigger}>{trigger}</div>)}
      </CardContent>
    </Card>
  );
}

function DrainIconLegend() {
  return (
    <Card>
      <CardHeader><div><CardTitle>Drain Icon Reference</CardTitle><CardDescription>Bedside drain and tube types</CardDescription></div></CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {drainTypes.map((item) => {
          const Icon = item.icon;
          return <div className="flex items-center gap-2 rounded-xl border border-border bg-white p-3 text-sm font-semibold text-foreground" key={item.id}><Icon className="h-4 w-4 text-primary" />{item.label}</div>;
        })}
      </CardContent>
    </Card>
  );
}

function DrainInsightCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f5f7ff]">
      <CardHeader><div><CardTitle>Clinical Insight Engine</CardTitle><CardDescription>Static ICU monitoring intelligence</CardDescription></div></CardHeader>
      <CardContent className="space-y-3">{drainInsights.map((insight) => <div className="rounded-xl border border-border bg-white p-3 text-sm font-medium text-foreground shadow-sm" key={insight}>{insight}</div>)}</CardContent>
    </Card>
  );
}

function QuickActionsPanel({ drainId }: { drainId?: string }) {
  const base = drainId ? `/icu-monitoring/drains/${drainId}` : "/icu-monitoring/drains/drain-peri-01";
  return (
    <Card>
      <CardHeader><div><CardTitle>Quick Actions</CardTitle><CardDescription>Bedside workflow shortcuts</CardDescription></div></CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild><Link href="/icu-monitoring/drains/add"><Plus className="h-4 w-4" />Add New Entry</Link></Button>
        <Button asChild variant="outline"><Link href={base}><TrendingUp className="h-4 w-4" />View Trend</Link></Button>
        <Button variant="outline" onClick={() => toast.info("Drain detail editing placeholder")}><Pencil className="h-4 w-4" />Edit Drain Details</Button>
        <Button variant="danger" onClick={() => toast.warning("Discontinue drain workflow staged")}><Trash2 className="h-4 w-4" />Discontinue Drain</Button>
      </CardContent>
    </Card>
  );
}

function DrainListCard({ drain }: { drain: DrainRecord }) {
  const Icon = drain.icon;
  return (
    <Link className="group block" href={`/icu-monitoring/drains/${drain.id}`}>
      <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(39,37,54,0.10)]">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-bold text-foreground">{drain.name}</div>
              <Badge tone={drainStatusTone(drain.status)}>{drain.status}</Badge>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{drain.outputColor} • {drain.metadata}</div>
            <div className="mt-1 text-xs text-muted-foreground">Updated {drain.updatedAt}</div>
          </div>
          <div className="flex items-end justify-between gap-3 md:justify-end">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{drain.outputAmount}</div>
              <div className="text-xs font-semibold text-muted-foreground">{drain.outputUnit}</div>
            </div>
            <Sparkline color={drain.color} values={drain.sparkline} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DrainsOverviewPage() {
  const [search, setSearch] = React.useState("");
  const rows = drainRecords.filter((drain) => `${drain.name} ${drain.type} ${drain.outputColor} ${drain.metadata}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <PageMotion>
      <HeaderBand title="Drains & Tubes" subtitle="ICU bedside drain and tube monitoring with output state, site condition, trends, and alerts." actions={<><BackButton href="/icu-monitoring" /><Button asChild size="sm"><Link href="/icu-monitoring/drains/add"><Plus className="h-4 w-4" />Add New Drain / Tube</Link></Button></>} />
      <Card className="sticky top-20 z-20">
        <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
          <Filter className="hidden h-4 w-4 text-muted-foreground md:block" />
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" onChange={(event) => setSearch(event.target.value)} placeholder="Search drain, tube, output color, site..." value={search} />
          </div>
          <Button asChild variant="outline"><Link href="/icu-monitoring/drains/alerts"><AlertTriangle className="h-4 w-4" />Alerts</Link></Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          {rows.length ? rows.map((drain) => <DrainListCard drain={drain} key={drain.id} />) : <EmptyState icon={Search} title="No drain records found" description="Try another output color, drain type, or site keyword." />}
        </div>
        <div className="space-y-4">
          <QuickActionsPanel />
          <DrainLegendCard />
          <DrainTriggersCard />
        </div>
      </div>
      <DrainIconLegend />
      <MobileIcuBottomNav />
    </PageMotion>
  );
}

const typeSpecificFields: Record<string, string[]> = {
  "abdominal-drain": ["Drain Type", "Suction Yes/No", "Comments"],
  "ng-tube": ["Purpose", "Residual Volume", "Tube Position Check", "Verified indicator"],
  "flexi-seal": ["Stool Consistency", "Leakage Yes/No", "Skin Condition"],
  ileostomy: ["Stoma Color", "Output Type", "Peristomal Skin"],
  "peg-tube": ["Feeding Given Yes/No", "Residual Volume", "Blockage Yes/No"],
  "icc-chest-drain": ["Air Leak Yes/No", "Fluid Type", "Bubbling Yes/No"],
  "pericardial-drain": ["Output Volume", "Fluid Type", "Sudden Increase Yes/No"],
  "vac-dressing": ["Pressure Setting", "Dressing Integrity", "Leak Present Yes/No", "Last Changed Date"],
};

export function DrainAddPage() {
  const router = useRouter();
  const [selected, setSelected] = React.useState(drainTypes[0].id);
  const [condition, setCondition] = React.useState("Clean");
  const selectedType = drainTypes.find((item) => item.id === selected) ?? drainTypes[0];
  const fields = ["Site / Location", "Output Volume (ml)", "Output Color", "Odor", "Consistency", "Condition of Site", "Date & Time", "Notes", ...(typeSpecificFields[selected] ?? [])];
  return (
    <PageMotion>
      <HeaderBand title="Add Drain / Tube" subtitle="Select drain type, document output and site condition, then save into the ICU mock workflow." actions={<BackButton href="/icu-monitoring/drains" />} />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><div><CardTitle>Step 1: Drain type</CardTitle><CardDescription>Touch-friendly selection cards</CardDescription></div></CardHeader>
          <CardContent className="grid gap-2">
            {drainTypes.map((type) => {
              const Icon = type.icon;
              const active = selected === type.id;
              return (
                <button className={cn("flex items-start gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5", active ? "border-primary bg-primary-soft text-primary" : "border-border bg-white text-foreground")} key={type.id} onClick={() => setSelected(type.id)} type="button">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span><span className="block text-sm font-bold">{type.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{type.description}</span></span>
                </button>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>{selectedType.label} Entry</CardTitle><CardDescription>Generic drain form with type-specific ICU fields</CardDescription></div><Badge tone="info">Step 2</Badge></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              field === "Condition of Site" ? (
                <div className="space-y-2 md:col-span-2" key={field}>
                  <div className="text-sm font-medium text-foreground">{field}</div>
                  <div className="flex flex-wrap gap-2">{conditionOptions.map((item) => <Button key={item} onClick={() => setCondition(item)} size="sm" variant={condition === item ? "default" : "outline"}>{item}</Button>)}</div>
                </div>
              ) : (
                <label className={cn("space-y-1 text-sm", field === "Notes" || field === "Comments" ? "md:col-span-2" : undefined)} key={field}>
                  <span className="font-medium text-foreground">{field}</span>
                  <Input placeholder={field === "Date & Time" ? "Today 18:00" : field} />
                </label>
              )
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-border bg-background/92 px-3 py-2 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex justify-end gap-2">
          <Button asChild variant="outline"><Link href="/icu-monitoring/drains">Cancel</Link></Button>
          <Button onClick={() => { toast.success(`${selectedType.label} entry saved`); router.push("/icu-monitoring/drains"); }}><Save className="h-4 w-4" />Save</Button>
        </div>
      </div>
      <MobileIcuBottomNav />
    </PageMotion>
  );
}

function getDrain(id: string) {
  return drainRecords.find((drain) => drain.id === id) ?? drainRecords[0];
}

export function DrainDetailPage({ id }: { id: string }) {
  const drain = getDrain(id);
  const columns = React.useMemo<ColumnDef<(typeof drainEntries)[number]>[]>(() => [
    { header: "Time", accessorKey: "time" },
    { header: "Output amount", cell: ({ row }) => `${row.original.volume} ml` },
    { header: "Output color", accessorKey: "color" },
    { header: "Consistency", accessorKey: "consistency" },
    { header: "Site condition", accessorKey: "siteCondition" },
  ], []);
  return (
    <PageMotion>
      <HeaderBand title={drain.name} subtitle={`${drain.metadata} • Last updated ${drain.updatedAt}`} actions={<><BackButton href="/icu-monitoring/drains" /><Button asChild size="sm"><Link href={`/icu-monitoring/drains/${drain.id}/history`}>View All Entries</Link></Button></>} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Total Output Today</div><div className="mt-2 text-3xl font-bold text-foreground">{drain.outputAmount * 3} ml</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Average per hour</div><div className="mt-2 text-3xl font-bold text-foreground">{Math.round(drain.outputAmount / 4)} ml</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Status</div><div className="mt-2"><Badge tone={drainStatusTone(drain.status)}>{drain.status}</Badge></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Output color</div><div className="mt-2 text-xl font-bold text-foreground">{drain.outputColor}</div></CardContent></Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader><div><CardTitle>Hourly Output Trend</CardTitle><CardDescription>Output progression with ICU analytics visualization</CardDescription></div></CardHeader>
          <CardContent className="h-72 p-4">
            <ClientChart><ResponsiveContainer height="100%" width="100%"><LineChart data={drainEntries.slice().reverse()}><CartesianGrid stroke="#eceaf2" /><XAxis dataKey="time" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line dataKey="volume" dot={{ r: 3 }} stroke={drain.color} strokeWidth={3} /></LineChart></ResponsiveContainer></ClientChart>
          </CardContent>
        </Card>
        <div className="space-y-4"><QuickActionsPanel drainId={drain.id} /><DrainInsightCard /></div>
      </div>
      <DataTable data={drainEntries} columns={columns} />
      <MobileIcuBottomNav />
    </PageMotion>
  );
}

export function DrainHistoryPage({ id }: { id: string }) {
  const drain = getDrain(id);
  return (
    <PageMotion>
      <HeaderBand title={`${drain.name} History`} subtitle="Detailed historical timeline and summary of drain entries." actions={<BackButton href={`/icu-monitoring/drains/${drain.id}`} />} />
      <Tabs defaultValue="entries">
        <TabsList><TabsTrigger value="entries">Entries</TabsTrigger><TabsTrigger value="summary">Summary</TabsTrigger></TabsList>
        <TabsContent value="entries" className="space-y-3">
          {drainEntries.map((entry) => (
            <Card className="transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]" key={entry.id}>
              <CardContent className="grid gap-3 p-4 md:grid-cols-5">
                <div><div className="text-xs text-muted-foreground">Time</div><div className="font-semibold text-foreground">{entry.time}</div></div>
                <div><div className="text-xs text-muted-foreground">Volume</div><div className="font-semibold text-foreground">{entry.volume} ml</div></div>
                <div><div className="text-xs text-muted-foreground">Color</div><div className="font-semibold text-foreground">{entry.color}</div></div>
                <div><div className="text-xs text-muted-foreground">Consistency</div><div className="font-semibold text-foreground">{entry.consistency}</div></div>
                <div><div className="text-xs text-muted-foreground">Site condition</div><div className="font-semibold text-foreground">{entry.siteCondition}</div></div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-center"><Button variant="outline" onClick={() => toast.info("More static entries will load when API is connected")}>Load More</Button></div>
        </TabsContent>
        <TabsContent value="summary"><DrainInsightCard /></TabsContent>
      </Tabs>
      <MobileIcuBottomNav />
    </PageMotion>
  );
}

function AlertCard({ alert }: { alert: DrainAlert }) {
  const Icon = alert.severity === "Critical" ? AlertTriangle : alert.severity === "Monitor" ? MoreHorizontal : CheckCircle2;
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]">
      <CardContent className="flex items-start gap-3 p-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", alert.severity === "Critical" ? "bg-critical/10 text-critical" : alert.severity === "Monitor" ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><div className="font-bold text-foreground">{alert.title}</div><Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge></div>
          <div className="mt-1 text-sm text-muted-foreground">{alert.description}</div>
          <div className="mt-2 text-xs text-muted-foreground">{alert.timestamp}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DrainAlertsPage() {
  const groups = [
    { id: "all", label: "All", rows: drainAlerts },
    { id: "high", label: "High Priority", rows: drainAlerts.filter((alert) => alert.severity === "Critical") },
    { id: "info", label: "Informational", rows: drainAlerts.filter((alert) => alert.severity !== "Critical") },
  ];
  return (
    <PageMotion>
      <HeaderBand title="Drain Alerts" subtitle="ICU drain and tube alert center with high-priority clinical events." actions={<BackButton href="/icu-monitoring/drains" />} />
      <Tabs defaultValue="all">
        <TabsList>{groups.map((group) => <TabsTrigger key={group.id} value={group.id}>{group.label}</TabsTrigger>)}</TabsList>
        {groups.map((group) => <TabsContent className="space-y-3" key={group.id} value={group.id}>{group.rows.map((alert) => <AlertCard alert={alert} key={alert.id} />)}</TabsContent>)}
      </Tabs>
      <div className="grid gap-4 xl:grid-cols-2"><DrainLegendCard /><DrainTriggersCard /></div>
      <MobileIcuBottomNav />
    </PageMotion>
  );
}

function LineDeviceInsightCard() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-white to-[#f5f7ff]">
      <CardHeader><div><CardTitle>Clinical Insight Engine</CardTitle><CardDescription>Line and device safety intelligence</CardDescription></div></CardHeader>
      <CardContent className="space-y-3">{lineDeviceInsights.map((insight) => <div className="rounded-xl border border-border bg-white p-3 text-sm font-medium text-foreground shadow-sm" key={insight}>{insight}</div>)}</CardContent>
    </Card>
  );
}

function LineDeviceQuickActions({ id }: { id?: string }) {
  const base = id ? `/icu-monitoring/lines-devices/${id}` : "/icu-monitoring/lines-devices/line-cvc-01";
  return (
    <Card>
      <CardHeader><div><CardTitle>Quick Actions</CardTitle><CardDescription>Line and device workflow shortcuts</CardDescription></div></CardHeader>
      <CardContent className="grid gap-2">
        <Button asChild><Link href="/icu-monitoring/lines-devices/add"><Plus className="h-4 w-4" />Add New Entry</Link></Button>
        <Button asChild variant="outline"><Link href={base}><TrendingUp className="h-4 w-4" />View Trend</Link></Button>
        <Button variant="outline" onClick={() => toast.info("Line/device detail editing placeholder")}><Pencil className="h-4 w-4" />Edit Details</Button>
        <Button variant="danger" onClick={() => toast.warning("Discontinue line/device workflow staged")}><Trash2 className="h-4 w-4" />Discontinue Line / Device</Button>
      </CardContent>
    </Card>
  );
}

function LineDeviceReferenceCards() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader><div><CardTitle>Device Icon Reference</CardTitle><CardDescription>Clinical line/device legend</CardDescription></div></CardHeader>
        <CardContent className="space-y-2">
          {lineDeviceTypes.map((type) => {
            const Icon = type.icon;
            return <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-sm" key={type.id}><span className="font-semibold text-foreground">{type.fullName}</span><Icon className="h-4 w-4 text-primary" /></div>;
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>Common Fields</CardTitle><CardDescription>Shared entry fields</CardDescription></div></CardHeader>
        <CardContent className="space-y-2">{lineDeviceCommonFields.map((field) => <div className="rounded-lg border border-border bg-[#f8f9fc] px-3 py-2 text-sm text-foreground" key={field}>{field}</div>)}</CardContent>
      </Card>
      <Card>
        <CardHeader><div><CardTitle>Alert Triggers</CardTitle><CardDescription>Example safety rules</CardDescription></div></CardHeader>
        <CardContent className="space-y-2">{lineDeviceAlertTriggers.map((trigger) => <div className="rounded-lg border border-border bg-[#f8f9fc] px-3 py-2 text-sm text-foreground" key={trigger}>{trigger}</div>)}</CardContent>
      </Card>
    </div>
  );
}

function LineDeviceCard({ device }: { device: LineDeviceRecord }) {
  const Icon = device.icon;
  return (
    <Link className="group block" href={`/icu-monitoring/lines-devices/${device.id}`}>
      <Card className="transition duration-200 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(39,37,54,0.10)]">
        <CardContent className="grid gap-3 p-4 md:grid-cols-[auto_1fr_auto] md:items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><div className="font-bold text-foreground">{device.name}</div><Badge tone={lineDeviceStatusTone(device.status)}>{device.status}</Badge></div>
            <div className="mt-1 text-sm text-muted-foreground">{device.insertionDetails} • {device.site}</div>
            <div className="mt-1 text-xs text-muted-foreground">{device.metadata}</div>
          </div>
          <Sparkline color={device.color} values={device.sparkline} />
        </CardContent>
      </Card>
    </Link>
  );
}

export function LinesDevicesOverviewPage() {
  const [search, setSearch] = React.useState("");
  const rows = lineDeviceRecords.filter((device) => `${device.name} ${device.type} ${device.site} ${device.metadata}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <PageMotion>
      <HeaderBand title="Lines & Devices" subtitle="ICU access line, catheter, lumen, dressing, waveform, and device safety monitoring." actions={<><Button size="sm" variant="outline"><Menu className="h-4 w-4" />Menu</Button><Button asChild size="sm" variant="outline"><Link href="/icu-monitoring/lines-devices/alerts"><Bell className="h-4 w-4" />Alerts</Link></Button><Button asChild size="sm"><Link href="/icu-monitoring/lines-devices/add"><Plus className="h-4 w-4" />Add New Line / Device</Link></Button></>} />
      <Card className="sticky top-20 z-20">
        <CardContent className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3 shadow-sm">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input className="border-0 bg-transparent shadow-none focus-visible:ring-0" onChange={(event) => setSearch(event.target.value)} placeholder="Search device, site, lumen, dressing..." value={search} />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-3">{rows.length ? rows.map((device) => <LineDeviceCard device={device} key={device.id} />) : <EmptyState icon={Search} title="No line/device records found" description="Try another device, site, or dressing keyword." />}</div>
        <div className="space-y-4"><LineDeviceQuickActions /><LineDeviceInsightCard /></div>
      </div>
      <LineDeviceReferenceCards />
      <MobileIcuBottomNav dashboardHref="/icu-monitoring/lines-devices" alertsHref="/icu-monitoring/lines-devices/alerts" />
    </PageMotion>
  );
}

const lineDeviceFields: Record<string, string[]> = {
  cvc: ["Lumen Type", "Lumen Patency", "Blood Return Yes/No", "Blue", "Brown", "White", "Flushed", "Patent", "Blocked"],
  "arterial-line": ["Site", "Waveform", "Dampened Yes/No", "Zeroed Yes/No", "Dressing Clean & Dry Yes/No"],
  "dialysis-line": ["Catheter Type", "Lumen Type", "Arterial Lumen Status", "Venous Lumen Status", "Heparin Locked Yes/No"],
  "foley-catheter": ["Catheter Size", "Balloon Volume", "Urine Output", "Urine Color", "Drainage Status"],
  "ecmo-catheter": ["ECMO Type", "Cannulation Site", "Cannula Size", "Flow", "Dressing Intact Yes/No", "Anticoagulation Status"],
};

export function LineDeviceAddPage() {
  const router = useRouter();
  const [selected, setSelected] = React.useState(lineDeviceTypes[0].id);
  const [condition, setCondition] = React.useState("Clean");
  const [securement, setSecurement] = React.useState("Secure");
  const selectedType = lineDeviceTypes.find((item) => item.id === selected) ?? lineDeviceTypes[0];
  const fields = ["Insertion Date & Time", "Site", "Side", "Dressing Type", "Dressing Date", "Condition of Site", "Securement", "Notes", ...(lineDeviceFields[selected] ?? [])];
  return (
    <PageMotion>
      <HeaderBand title="Add Line / Device" subtitle="Select device type and document line insertion, dressing, condition, securement, and device-specific safety fields." actions={<BackButton href="/icu-monitoring/lines-devices" />} />
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><div><CardTitle>Step 1: Device type</CardTitle><CardDescription>Touch-friendly ICU line selection</CardDescription></div></CardHeader>
          <CardContent className="grid gap-2">
            {lineDeviceTypes.map((type) => {
              const Icon = type.icon;
              const active = selected === type.id;
              return (
                <button className={cn("flex items-start gap-3 rounded-xl border p-3 text-left transition hover:-translate-y-0.5", active ? "border-primary bg-primary-soft text-primary" : "border-border bg-white text-foreground")} key={type.id} onClick={() => setSelected(type.id)} type="button">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                  <span><span className="block text-sm font-bold">{type.fullName}</span><span className="mt-0.5 block text-xs text-muted-foreground">{type.description}</span></span>
                </button>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><div><CardTitle>{selectedType.fullName} Entry</CardTitle><CardDescription>Common form plus type-specific monitoring fields</CardDescription></div><Badge tone="info">Step 2</Badge></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {fields.map((field) => (
              field === "Condition of Site" ? (
                <div className="space-y-2 md:col-span-2" key={field}><div className="text-sm font-medium text-foreground">{field}</div><div className="flex flex-wrap gap-2">{["Clean", "Redness", "Swelling", "Bleeding"].map((item) => <Button key={item} onClick={() => setCondition(item)} size="sm" variant={condition === item ? "default" : "outline"}>{item}</Button>)}</div></div>
              ) : field === "Securement" ? (
                <div className="space-y-2 md:col-span-2" key={field}><div className="text-sm font-medium text-foreground">{field}</div><div className="flex flex-wrap gap-2">{["Secure", "Not Secure"].map((item) => <Button key={item} onClick={() => setSecurement(item)} size="sm" variant={securement === item ? "default" : "outline"}>{item}</Button>)}</div></div>
              ) : (
                <label className={cn("space-y-1 text-sm", field === "Notes" ? "md:col-span-2" : undefined)} key={field}><span className="font-medium text-foreground">{field}</span><Input placeholder={field === "Insertion Date & Time" ? "Today 18:00" : field} /></label>
              )
            ))}
          </CardContent>
        </Card>
      </div>
      <div className="sticky bottom-0 z-20 -mx-4 mt-4 border-t border-border bg-background/92 px-3 py-2 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex justify-end gap-2"><Button asChild variant="outline"><Link href="/icu-monitoring/lines-devices">Cancel</Link></Button><Button onClick={() => { toast.success(`${selectedType.fullName} entry saved`); router.push("/icu-monitoring/lines-devices"); }}><Save className="h-4 w-4" />Save</Button></div>
      </div>
      <MobileIcuBottomNav dashboardHref="/icu-monitoring/lines-devices" alertsHref="/icu-monitoring/lines-devices/alerts" />
    </PageMotion>
  );
}

function getLineDevice(id: string) {
  return lineDeviceRecords.find((device) => device.id === id) ?? lineDeviceRecords[0];
}

export function LineDeviceDetailPage({ id }: { id: string }) {
  const device = getLineDevice(id);
  const lumenColumns = React.useMemo<ColumnDef<(typeof lumenStatusRecords)[number]>[]>(() => [
    { header: "Lumen color", accessorKey: "color" },
    { header: "Patency", accessorKey: "patency" },
    { header: "Blood return", accessorKey: "bloodReturn" },
    { header: "Last flushed time", accessorKey: "lastFlushed" },
  ], []);
  return (
    <PageMotion>
      <HeaderBand title={device.name} subtitle={`${device.insertionDetails} • ${device.site} • ${device.metadata}`} actions={<><BackButton href="/icu-monitoring/lines-devices" /><Button asChild size="sm"><Link href={`/icu-monitoring/lines-devices/${device.id}/history`}>View All Entries</Link></Button></>} />
      <Tabs defaultValue="overview">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="lumen">Lumen Status</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[["Inserted on", device.insertionDetails], ["Site", device.site], ["Lumen type", device.type === "CVC" ? "Triple lumen" : "Standard"], ["Dressing type", device.metadata]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div><div className="mt-2 text-sm font-semibold text-foreground">{value}</div></CardContent></Card>)}</div>
          <Card><CardHeader><div><CardTitle>Output / Usage Trend</CardTitle><CardDescription>Total intake, output, and hourly fluctuations</CardDescription></div></CardHeader><CardContent className="h-72 p-4"><ClientChart><ResponsiveContainer height="100%" width="100%"><LineChart data={lineDeviceTrendData}><CartesianGrid stroke="#eceaf2" /><XAxis dataKey="time" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip /><Line dataKey="usage" dot={false} stroke="#7367f0" strokeWidth={3} /><Line dataKey="intake" dot={false} stroke="#22a06b" strokeWidth={3} /><Line dataKey="output" dot={false} stroke="#5b8def" strokeWidth={3} /></LineChart></ResponsiveContainer></ClientChart></CardContent></Card>
        </TabsContent>
        <TabsContent value="lumen"><DataTable data={lumenStatusRecords} columns={lumenColumns} /></TabsContent>
        <TabsContent value="history"><LineDeviceHistorySummary id={device.id} /></TabsContent>
      </Tabs>
      <div className="grid gap-4 xl:grid-cols-[1fr_340px]"><LineDeviceInsightCard /><LineDeviceQuickActions id={device.id} /></div>
      <MobileIcuBottomNav dashboardHref="/icu-monitoring/lines-devices" alertsHref="/icu-monitoring/lines-devices/alerts" />
    </PageMotion>
  );
}

function LineDeviceHistorySummary({ id }: { id: string }) {
  return <Button asChild variant="outline"><Link href={`/icu-monitoring/lines-devices/${id}/history`}>Open detailed timeline</Link></Button>;
}

export function LineDeviceHistoryPage({ id }: { id: string }) {
  const device = getLineDevice(id);
  return (
    <PageMotion>
      <HeaderBand title={`${device.name} History`} subtitle="Detailed line/device entry timeline and summary." actions={<BackButton href={`/icu-monitoring/lines-devices/${device.id}`} />} />
      <Tabs defaultValue="entries">
        <TabsList><TabsTrigger value="entries">Entries</TabsTrigger><TabsTrigger value="summary">Summary</TabsTrigger></TabsList>
        <TabsContent value="entries" className="space-y-3">
          {lineDeviceEntries.map((entry) => <Card className="transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]" key={entry.id}><CardContent className="grid gap-3 p-4 md:grid-cols-5"><div><div className="text-xs text-muted-foreground">Timestamp</div><div className="font-semibold text-foreground">{entry.timestamp}</div></div><div><div className="text-xs text-muted-foreground">MAP</div><div className="font-semibold text-foreground">{entry.map}</div></div><div><div className="text-xs text-muted-foreground">Waveform</div><div className="font-semibold text-foreground">{entry.waveform}</div></div><div><div className="text-xs text-muted-foreground">Zeroed status</div><div className="font-semibold text-foreground">{entry.zeroedStatus}</div></div><div><div className="text-xs text-muted-foreground">Site condition</div><div className="font-semibold text-foreground">{entry.siteCondition}</div></div></CardContent></Card>)}
          <div className="flex justify-center"><Button variant="outline" onClick={() => toast.info("More line/device entries will load when API is connected")}>View All Entries</Button></div>
        </TabsContent>
        <TabsContent value="summary"><LineDeviceInsightCard /></TabsContent>
      </Tabs>
      <MobileIcuBottomNav dashboardHref="/icu-monitoring/lines-devices" alertsHref="/icu-monitoring/lines-devices/alerts" />
    </PageMotion>
  );
}

function LineAlertCard({ alert }: { alert: LineDeviceAlert }) {
  const Icon = alert.severity === "Critical" ? AlertTriangle : alert.severity === "Monitor" ? MoreHorizontal : CheckCircle2;
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]"><CardContent className="flex items-start gap-3 p-4"><div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", alert.severity === "Critical" ? "bg-critical/10 text-critical" : alert.severity === "Monitor" ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><div className="font-bold text-foreground">{alert.title}</div><Badge tone={lineSeverityTone(alert.severity)}>{alert.severity}</Badge></div><div className="mt-1 text-sm text-muted-foreground">{alert.description}</div><div className="mt-2 text-xs text-muted-foreground">{alert.timestamp}</div></div></CardContent></Card>
  );
}

export function LineDeviceAlertsPage() {
  const groups = [
    { id: "all", label: "All", rows: lineDeviceAlerts },
    { id: "high", label: "High Priority", rows: lineDeviceAlerts.filter((alert) => alert.severity === "Critical") },
    { id: "info", label: "Info", rows: lineDeviceAlerts.filter((alert) => alert.severity !== "Critical") },
  ];
  return (
    <PageMotion>
      <HeaderBand title="Lines & Devices Alerts" subtitle="Critical-care alert center for access lines, catheters, dressing integrity, and flow issues." actions={<BackButton href="/icu-monitoring/lines-devices" />} />
      <Tabs defaultValue="all">
        <TabsList>{groups.map((group) => <TabsTrigger key={group.id} value={group.id}>{group.label}</TabsTrigger>)}</TabsList>
        {groups.map((group) => <TabsContent className="space-y-3" key={group.id} value={group.id}>{group.rows.map((alert) => <LineAlertCard alert={alert} key={alert.id} />)}</TabsContent>)}
      </Tabs>
      <LineDeviceReferenceCards />
      <MobileIcuBottomNav dashboardHref="/icu-monitoring/lines-devices" alertsHref="/icu-monitoring/lines-devices/alerts" />
    </PageMotion>
  );
}

export function CvsPlaceholderPage({ title }: { title: string }) {
  return (
    <PageMotion>
      <HeaderBand title={title} subtitle="This ICU module is reserved for the next monitoring workflow." actions={<BackButton href="/icu-monitoring" />} />
      <EmptyState icon={ClipboardList} title={`${title} placeholder`} description="CVS and Abdominal are implemented first. This card keeps the ICU navigation ready for future clinical documentation." />
    </PageMotion>
  );
}
