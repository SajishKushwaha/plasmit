"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  BedDouble,
  ChartNoAxesCombined,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Radio,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  orderedPatients,
  patientTone,
  type Dashboard1Patient,
} from "@/features/doctor-dashboard1/doctor-dashboard1-page";
import { IpdUnifiedModulePage } from "@/features/ipd/ipd-pages";
import { LiveMonitoringPage } from "@/features/live-monitoring/live-monitoring-page";
import { rapidReviewPatients, type RapidReviewPatient } from "@/features/rapid-review/rapid-review-data";
import { PatientVitalsGraph } from "@/features/rapid-review/rapid-review-graph";
import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";
import { DoctorOrdersPage } from "@/features/doctor-orders/doctor-orders";
import { AddPoctPage } from "@/features/poct/poct-pages";
import { IntakeOutputPage } from "@/features/intake-output/intake-output-page";

import { cn } from "@/lib/utils";

export function DoctorDashboard1PatientPage({ patientId }: { patientId: string }) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = React.useState(requestedTab === "shift-summary" ? "shift-summary" : "overview");
  const patient = orderedPatients.find((item) => String(item.id) === patientId);
  const rapidReviewPatient = patient ? rapidReviewPatients.find((item) => item.id === patient.rapidReviewPatientId) : undefined;

  React.useEffect(() => {
    if (requestedTab === "shift-summary") {
      setActiveTab("shift-summary");
    }
  }, [requestedTab]);

  if (!patient) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <div className="text-base font-semibold">Patient not found</div>
          <Button asChild>
            <Link href="/doctor-dashboard1">Back to Dashboard1</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const tone = patientTone(patient);
  const initials = patient.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4 py-4">
      <Card className="overflow-hidden rounded-2xl border-primary/15 shadow-[0_18px_50px_rgba(43,54,116,0.10)]">
        <CardContent className="p-0">
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-[#f8f9ff] to-[#edf3ff] p-5 md:p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-40 w-80 rounded-full bg-info/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#5b8def] text-xl font-bold text-white shadow-lg shadow-primary/20">
                  {initials || <UserRound className="h-6 w-6" />}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-bold tracking-tight text-foreground md:text-3xl">{patient.name}</h1>
                    <Badge tone={tone === "red" ? "critical" : tone === "orange" ? "warning" : "info"}>
                      {tone === "red" ? "Urgent monitoring" : tone === "orange" ? "Clinical watch" : "Stable"}
                    </Badge>
                    <Badge tone="success"><Activity className="mr-1 h-3 w-3" />Live</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <PatientContextChip label="UHID" value={rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`} />
                    <PatientContextChip label="Age/Sex" value={rapidReviewPatient?.ageGender ?? "Not available"} />
                    <PatientContextChip icon={BedDouble} label="Ward/Bed" value={rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed} />
                    <PatientContextChip icon={Stethoscope} label="Consultant" value={rapidReviewPatient?.consultant ?? "Duty consultant"} />
                  </div>
                  <div className="mt-3 text-sm font-medium text-muted-foreground">
                    <span className="font-semibold text-foreground">Diagnosis:</span> {patient.diagnosis}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/rapid-review?tab=entry&patient=${patient.rapidReviewPatientId}`}><Activity className="h-4 w-4" />Rapid Review</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/doctor-dashboard1"><ArrowLeft className="h-4 w-4" />Dashboard1</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs className="space-y-4" onValueChange={setActiveTab} value={activeTab}>
        <div className="sticky top-16 z-30 rounded-xl border border-border bg-white/95 p-1.5 shadow-sm backdrop-blur">
          <TabsList className="grid w-full grid-cols-2 rounded-lg bg-surface-muted/70 p-1 pb-1 sm:grid-cols-4 xl:grid-cols-8">
            <PatientTab icon={LayoutDashboard} label="Overview" value="overview" />
            <PatientTab icon={Radio} label="Live Monitoring" value="live-monitoring" />
            <PatientTab icon={FlaskConical} label="Results" value="results" />
            <PatientTab icon={HeartPulse} label="Vitals" value="vitals" />
            <PatientTab icon={ClipboardCheck} label="Nurse Timeline" value="shift-summary" />
            <PatientTab icon={ChartNoAxesCombined} label="Orders" value="orders" />
            <PatientTab icon={ChartNoAxesCombined} label="Add POCT" value="AddPoct" />
            <PatientTab icon={ChartNoAxesCombined} label="Intake Output" value="Intake Output" />
          </TabsList>
        </div>
        <TabsContent className="mt-0" value="overview">
          <PatientOverview patient={patient} rapidReviewPatient={rapidReviewPatient} />
        </TabsContent>
        <TabsContent className="mt-0" value="live-monitoring">
          <LiveMonitoringPage />
        </TabsContent>
        <TabsContent className="mt-0" value="results">
          <ResultsCenterView
            defaultDepartment="all"
            patientContext={{
              ageSex: rapidReviewPatient?.ageGender,
              mrn: getResultPatientMrn(patient.id),
              name: patient.name,
              uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
              wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
            }}
            viewDescription="Laboratory, radiology, POCT, and critical results for the selected patient."
            viewTitle="Results Center"
          />
        </TabsContent>
        <TabsContent className="mt-0" value="vitals">
          <PatientVitalsTabs patient={patient} rapidReviewPatient={rapidReviewPatient} />
        </TabsContent>
        <TabsContent className="mt-0" value="shift-summary">
          <NurseShiftSummaryTimeline patient={patient} rapidReviewPatient={rapidReviewPatient} />
        </TabsContent>
         <TabsContent className="mt-0" value="AddPoct">
          <AddPoctPage key={patient.id}  />
        </TabsContent> 
        <TabsContent className="mt-0" value="orders">
          <DoctorOrdersPage
            defaultTab="radiology"
            key={patient.id}
            patientContext={{
              ageSex: rapidReviewPatient?.ageGender,
              diagnosis: patient.diagnosis,
              id: `doctor-ipd-${patient.id}`,
              name: patient.name,
              radiologyPatientId: getRadiologyPatientId(patient.id),
              uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
              wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
            }}
          />
        </TabsContent>
        <TabsContent className="mt-0" value="Intake Output">
          <IntakeOutputPage key={patient.id}  />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PatientTab({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
  return (
    <TabsTrigger className="h-10 min-w-0 rounded-lg px-2 text-sm data-[state=active]:text-primary" value={value}>
      <span className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    </TabsTrigger>
  );
}

function getRadiologyPatientId(patientId: number) {
  const mappedId = 1000 + (((patientId - 1) % 6) + 1);
  return `pat-${mappedId}`;
}

function getResultPatientMrn(patientId: number) {
  const resultMrns = [
    "MRN-240118",
    "MRN-240119",
    "MRN-240121",
    "MRN-240124",
    "MRN-240126",
    "MRN-240127",
    "MRN-240130",
    "MRN-240133",
    "MRN-240135",
    "MRN-240136",
  ];

  return resultMrns[(patientId - 1) % resultMrns.length];
}

function PatientContextChip({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof BedDouble;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-white/80 bg-white/80 px-2.5 py-1.5 font-medium text-muted-foreground shadow-sm backdrop-blur">
      {Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
      <span>{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function PatientOverview({ patient, rapidReviewPatient }: { patient: Dashboard1Patient; rapidReviewPatient?: RapidReviewPatient }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="overflow-hidden border-border/80">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Clinical Snapshot</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Latest recorded bedside observations</div>
          </div>
          <Badge tone="info">Updated now</Badge>
        </div>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <PatientMetric label="HR" value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
          <PatientMetric label="SpO2" value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
          <PatientMetric label="ABPS" value={`${patient.abps.value} mmHg`} tone={patient.abps.tone} />
          <PatientMetric label="ABPD" value={`${patient.abpd.value} mmHg`} tone={patient.abpd.tone} />
          <PatientMetric label="Temperature" value={`${patient.temperature.value} °C`} tone={patient.temperature.tone} />
        </CardContent>
      </Card>

      <Card className="border-primary/15 bg-gradient-to-br from-white to-[#f6f8ff]">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary"><ClipboardCheck className="h-4 w-4" /></div>
            <div>
              <div className="text-sm font-semibold text-foreground">Care Summary</div>
              <div className="text-xs text-muted-foreground">Current clinical context</div>
            </div>
          </div>
          <CareRow label="Response" value={rapidReviewPatient?.responseLevel ?? "Routine"} />
          <CareRow label="Consultant" value={rapidReviewPatient?.consultant ?? "Duty consultant"} />
          <CareRow label="Review due" value={rapidReviewPatient?.reviewDue ?? "As scheduled"} />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button asChild size="sm">
              <Link href={`/rapid-review?tab=entry&patient=${patient.rapidReviewPatientId}`}>Rapid Review</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/clinical-examination">Clinical Exam</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CareRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-white px-3 py-2 text-xs">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="truncate text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

function NurseShiftSummaryTimeline({ patient, rapidReviewPatient }: { patient: Dashboard1Patient; rapidReviewPatient?: RapidReviewPatient }) {
  const notes = buildNurseShiftNotes(patient, rapidReviewPatient);

  return (
    <Card className="overflow-hidden border-border/80">
      <div className="flex flex-col gap-3 border-b border-border bg-white px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-base font-semibold text-foreground">Nurse Timeline</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Shift timeline for {patient.name} | {rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`} | {rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed}
          </div>
        </div>
        <Button size="sm" type="button">
          <ClipboardCheck className="h-4 w-4" />
          Add Nurse Note
        </Button>
      </div>

      <CardContent className="max-h-[68dvh] overflow-y-auto p-4 pr-3">
        <div className="relative space-y-6 pl-7 pr-2">
          <div className="absolute bottom-3 left-[18px] top-3 w-px bg-border" />
          {notes.map((note) => (
            <div className="relative" key={note.id}>
              <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2d8ac8] text-white shadow-sm">
                <ClipboardCheck className="h-3.5 w-3.5" />
              </div>
              <div className="mb-2 inline-flex rounded bg-[#2d8ac8] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                {note.timestamp}
              </div>
              <div className="rounded-md border border-border bg-[#f7f7f7] shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
                  <div className="font-semibold text-[#3ba3d8]">{patient.name} ({note.bedCode})</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{note.status}</span>
                    <span>Created By: {note.createdBy}</span>
                  </div>
                </div>
                <div className="space-y-3 px-3 py-3 text-sm">
                  <div>
                    <div className="text-xs font-bold text-foreground">Note</div>
                    <p className="mt-1 text-muted-foreground">{note.note}</p>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">Comment</div>
                    <p className="mt-1 text-muted-foreground">{note.comment}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function buildNurseShiftNotes(patient: Dashboard1Patient, rapidReviewPatient?: RapidReviewPatient) {
  const nurse = patientTone(patient) === "red" ? "Nurse Jason Abbott" : patientTone(patient) === "orange" ? "Nurse Priya Menon" : "Nurse Super Admin";
  const vitalsSummary = `HR ${patient.hr.value} bpm, SpO2 ${patient.spo2.value}%, BP ${patient.abps.value}/${patient.abpd.value}, Temp ${patient.temperature.value} C.`;
  const bedCode = rapidReviewPatient?.uhid?.replace("UHID-", "") ?? String(9000 + patient.id);

  return [
    {
      id: "note-1",
      timestamp: "17/06/2026 06:45 PM",
      bedCode,
      status: "Signed",
      note: `Evening shift received. ${patient.diagnosis}. ${vitalsSummary}`,
      comment: "Continue ordered monitoring, maintain aspiration precautions, and inform doctor if vitals worsen.",
      createdBy: nurse,
    },
    {
      id: "note-2",
      timestamp: "17/06/2026 02:15 PM",
      bedCode,
      status: "Reviewed",
      note: "Medication round completed. Patient tolerated oral intake and routine care.",
      comment: "Follow diet plan and repeat vitals as scheduled for the next nursing round.",
      createdBy: "Nurse Super Admin",
    },
    {
      id: "note-3",
      timestamp: "17/06/2026 09:30 AM",
      bedCode,
      status: "Signed",
      note: "Morning assessment documented. Bedside safety checks completed.",
      comment: "Doctor instruction acknowledged. Keep patient under observation and update shift handover.",
      createdBy: "Nurse Priya Menon",
    },
    {
      id: "note-4",
      timestamp: "16/06/2026 08:10 PM",
      bedCode,
      status: "Signed",
      note: "Previous nurse timeline added with intake, comfort, medication, and family update.",
      comment: "No new adverse event reported during the previous shift.",
      createdBy: "Nurse Super Admin",
    },
  ];
}

function PatientVitalsTabs({ patient, rapidReviewPatient }: { patient: Dashboard1Patient; rapidReviewPatient?: RapidReviewPatient }) {
  return (
    <Tabs className="space-y-4" defaultValue="chart">
      <div className="rounded-xl border border-border bg-white p-1.5 shadow-sm">
        <TabsList className="grid w-full grid-cols-2 rounded-lg bg-surface-muted/70 p-1 md:w-[360px]">
          <TabsTrigger className="h-10 gap-2 rounded-lg text-sm data-[state=active]:text-primary" value="chart">
            <ClipboardCheck className="h-4 w-4" />
            Chart
          </TabsTrigger>
          <TabsTrigger className="h-10 gap-2 rounded-lg text-sm data-[state=active]:text-primary" value="graph">
            <ChartNoAxesCombined className="h-4 w-4" />
            Graph
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="mt-0" value="chart">
        <PatientMonitoring key={`monitoring-${patient.id}`} patient={patient} rapidReviewPatient={rapidReviewPatient} />
      </TabsContent>

      <TabsContent className="mt-0" value="graph">
        {rapidReviewPatient ? (
          <PatientVitalsGraph patient={rapidReviewPatient} />
        ) : (
          <div className="rounded-xl border border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
            Vitals graph data is not available for this patient.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

function PatientMonitoring({ patient, rapidReviewPatient }: { patient: Dashboard1Patient; rapidReviewPatient?: RapidReviewPatient }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-gradient-to-br from-white to-surface-muted/70 p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Current Vitals</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Latest bedside monitoring snapshot</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/live-monitoring">Open Live Monitoring</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <PatientMetric label="HR" value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
          <PatientMetric label="SpO2" value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
          <PatientMetric label="ABPS" value={`${patient.abps.value} mmHg`} tone={patient.abps.tone} />
          <PatientMetric label="ABPD" value={`${patient.abpd.value} mmHg`} tone={patient.abpd.tone} />
          <PatientMetric label="Temperature" value={`${patient.temperature.value} °C`} tone={patient.temperature.tone} />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-3 shadow-sm">
        <React.Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading monitoring...</div>}>
          <IpdUnifiedModulePage
            embedded
            hideIpdTab
            patientContext={{
              ageSex: rapidReviewPatient?.ageGender ?? "Age / sex not available",
              consultant: rapidReviewPatient?.consultant ?? "Duty consultant",
              diagnosis: patient.diagnosis,
              id: `patient-${patient.id}`,
              name: patient.name,
              uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
              wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
            }}
          />
        </React.Suspense>
      </div>
    </div>
  );
}

function PatientMetric({ label, value, tone }: { label: string; value: string; tone: Dashboard1Patient["hr"]["tone"] }) {
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
