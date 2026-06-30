"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  ChartNoAxesCombined,
  ClipboardCheck,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Radio,
  Stethoscope,
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
import { PatientVitalsAllGraphOnly, PatientVitalsGraph } from "@/features/rapid-review/rapid-review-graph";
import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";
import { DoctorOrdersPage } from "@/features/doctor-orders/doctor-orders";
import { ClinicalExaminationPage } from "@/features/clinical-examination/clinical-examination-page";
import { AssessmentPage } from "@/features/assessment/assessment-page";
import { ViewPoctResultPage } from "@/features/poct/poct-pages";
import { IntakeOutputPage } from "@/features/intake-output/intake-output-page";
import { ProgressNotesPanel } from "@/features/doctor-dashboard1/progress-notes";
import { cn } from "@/lib/utils";

type PatientTabValue = "overview" | "live-monitoring" | "clinical-examination" | "results" | "vitals" | "assessment" | "shift-summary" | "orders" | "Intake Output";
type DashboardPoctMode = "add" | "results";
type ResultsAutoView = "laboratory-all";
type RequestedOrderTab = "blood" | "drugs" | "pathology" | "lab" | "radiology" | "poct" | "procedures" | "referral" | "ordersets" | "ldt";

function getRequestedPatientTab(tab: string | null): PatientTabValue | null {
  switch (tab) {
    case "overview":
    case "live-monitoring":
    case "clinical-examination":
    case "results":
    case "vitals":
    case "assessment":
    case "shift-summary":
    case "orders":
    case "Intake Output":
      return tab;
    case "poct":
    case "POCT":
    case "Poct":
      return "orders";
    case "intake-output":
      return "Intake Output";
    default:
      return null;
  }
}

function getRequestedPoctMode(mode: string | null): DashboardPoctMode | null {
  if (mode === "add" || mode === "results") return mode;
  return null;
}

function getRequestedResultsAutoView(view: string | null): ResultsAutoView | null {
  if (view === "laboratory-all") return view;
  return null;
}

function getRequestedOrderTab(tab: string | null): RequestedOrderTab | null {
  if (
    tab === "blood" ||
    tab === "drugs" ||
    tab === "pathology" ||
    tab === "lab" ||
    tab === "radiology" ||
    tab === "poct" ||
    tab === "procedures" ||
    tab === "referral" ||
    tab === "ordersets" ||
    tab === "ldt"
  ) {
    return tab;
  }
  return null;
}

export function DoctorDashboard1PatientPage({ patientId }: { patientId: string }) {
  const searchParams = useSearchParams();
  const requestedTab = getRequestedPatientTab(searchParams.get("tab"));
  const requestedPoctMode = getRequestedPoctMode(searchParams.get("poct"));
  const requestedResultsAutoView = getRequestedResultsAutoView(searchParams.get("resultsView"));
  const requestedOrderTab = getRequestedOrderTab(searchParams.get("orderTab"));
  const [activeTab, setActiveTab] = React.useState<PatientTabValue>(requestedTab ?? "overview");
  const [poctMode, setPoctMode] = React.useState<DashboardPoctMode>(requestedPoctMode ?? "add");
  const [ordersDefaultTab, setOrdersDefaultTab] = React.useState(requestedOrderTab ?? (requestedPoctMode === "add" ? "poct" : "radiology"));
  const [isPatientHeaderCompact, setIsPatientHeaderCompact] = React.useState(false);
  const patient = orderedPatients.find((item) => String(item.id) === patientId);
  const rapidReviewPatient = patient ? rapidReviewPatients.find((item) => item.id === patient.rapidReviewPatientId) : undefined;

  React.useEffect(() => {
    const updatePatientHeader = () => {
      setIsPatientHeaderCompact(window.scrollY > 8);
    };

    updatePatientHeader();
    window.addEventListener("scroll", updatePatientHeader, { passive: true });

    return () => window.removeEventListener("scroll", updatePatientHeader);
  }, []);

  React.useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  React.useEffect(() => {
    if (requestedPoctMode) {
      setActiveTab(requestedPoctMode === "results" ? "results" : "orders");
      setPoctMode(requestedPoctMode);
      if (requestedPoctMode === "add") setOrdersDefaultTab("poct");
    }
  }, [requestedPoctMode]);

  React.useEffect(() => {
    if (!requestedOrderTab) return;
    setActiveTab("orders");
    setOrdersDefaultTab(requestedOrderTab);
  }, [requestedOrderTab]);

  React.useEffect(() => {
    const openPoctInPlace = (event: Event) => {
      const mode = getRequestedPoctMode((event as CustomEvent<{ mode?: string }>).detail?.mode ?? null);
      if (!mode) return;
      setActiveTab(mode === "results" ? "results" : "orders");
      setPoctMode(mode);
      if (mode === "add") setOrdersDefaultTab("poct");
    };

    window.addEventListener("plasmit-dashboard1-poct-mode", openPoctInPlace);
    return () => window.removeEventListener("plasmit-dashboard1-poct-mode", openPoctInPlace);
  }, []);

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
  return (
    <div className="space-y-4 py-4">
      <Tabs
        className="space-y-3 pt-[118px]"
        onValueChange={(value) => setActiveTab(getRequestedPatientTab(value) ?? "overview")}
        value={activeTab}
      >
        <div
          className={cn(
            "fixed left-0 right-0 space-y-1.5 bg-background/95 px-4 pb-1.5 pt-1.5 backdrop-blur transition-[top,box-shadow] duration-200 md:px-6 lg:left-[var(--app-sidebar-offset)]",
            isPatientHeaderCompact ? "top-0 z-50 shadow-sm" : "top-16 z-30"
          )}
        >
          <PatientDetailTopStrip
            isCompact={isPatientHeaderCompact}
            patient={patient}
            rapidReviewPatient={rapidReviewPatient}
            tone={tone}
          />

          <div className="overflow-x-auto rounded-xl border border-border bg-white/95 p-1 shadow-sm">
            <TabsList className="inline-flex h-auto w-max min-w-max rounded-lg bg-surface-muted/70 p-1">
              <PatientTab icon={LayoutDashboard} label="Overview" value="overview" />
              <PatientTab icon={Radio} label="Live Monitoring" value="live-monitoring" />
              <PatientTab icon={Stethoscope} label="Clinical Exam" value="clinical-examination" />
              <PatientTab icon={FlaskConical} label="Results" value="results" />
              <PatientTab icon={HeartPulse} label="Vitals" value="vitals" />
              <PatientTab icon={ClipboardCheck} label="Assessment" value="assessment" />
              <PatientTab icon={ClipboardCheck} label="Progress Note" value="shift-summary" />
              <PatientTab icon={ChartNoAxesCombined} label="Orders" value="orders" />
              <PatientTab icon={ChartNoAxesCombined} label="Intake Output" value="Intake Output" />
            </TabsList>
          </div>
        </div>
        <div className="pb-6">
          <TabsContent className="mt-0" value="overview">
            <PatientOverview patient={patient} rapidReviewPatient={rapidReviewPatient} />
          </TabsContent>
          <TabsContent className="mt-0" value="live-monitoring">
            <LiveMonitoringPage />
          </TabsContent>
          <TabsContent className="mt-0" value="clinical-examination">
            {/* <ClinicalExaminationPage embedded initialPatientId={getClinicalPatientId(patient.id)} /> */}
            <h1>under development</h1>
          </TabsContent>
          <TabsContent className="mt-0" value="results">
            {poctMode === "results" ? (
              <ViewPoctResultPage embedded key={`poct-results-${patient.id}`} mode="results" showModeActions={false} />
            ) : (
              <ResultsCenterView
                autoOpenAllDepartment={requestedResultsAutoView === "laboratory-all" ? "laboratory" : undefined}
                defaultDepartment="all"
                patientContext={{
                  ageSex: rapidReviewPatient?.ageGender,
                  allergy: "Meropenem",
                  bed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
                  bloodGroup: "AB +ve",
                  consultantDoctor: rapidReviewPatient?.consultant,
                  dob: "30-12-1995",
                  mrn: getResultPatientMrn(patient.id),
                  name: patient.name,
                  uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
                  wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
                }}
                viewDescription="Laboratory, radiology, POCT, and critical results for the selected patient."
                viewTitle="Results Center"
              />
            )}
          </TabsContent>
          <TabsContent className="mt-0" value="vitals">
            <PatientVitalsTabs patient={patient} rapidReviewPatient={rapidReviewPatient} />
          </TabsContent>
          <TabsContent className="mt-0" value="assessment">
            {/* <AssessmentPage
              isolationType="Droplet"
              patient={{
                ageGender: rapidReviewPatient?.ageGender,
                bed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
                consultant: rapidReviewPatient?.consultant,
                diagnosis: patient.diagnosis,
                name: patient.name,
                uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
              }}
            /> */}
            <h1>under development</h1>
          </TabsContent>
          <TabsContent className="mt-0" value="shift-summary">
            <NurseShiftSummaryTimeline patient={patient} rapidReviewPatient={rapidReviewPatient} />
            <h1>under development</h1>
          </TabsContent>
          <TabsContent className="mt-0" value="orders">
            <DoctorOrdersPage
              defaultTab={ordersDefaultTab}
              key={`${patient.id}-${ordersDefaultTab}`}
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
            <IntakeOutputPage key={patient.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function getClinicalPatientId(patientId: number) {
  return `pat-${String(((patientId - 1) % 6) + 1).padStart(3, "0")}`;
}

function PatientTab({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) {
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

function PatientDetailTopStrip({
  isCompact,
  patient,
  rapidReviewPatient,
  tone,
}: {
  isCompact: boolean;
  patient: Dashboard1Patient;
  rapidReviewPatient?: RapidReviewPatient;
  tone: ReturnType<typeof patientTone>;
}) {
  const age = rapidReviewPatient?.ageGender?.split("/")[0]?.trim() ? `${rapidReviewPatient.ageGender.split("/")[0].trim()} year(s)` : "25 year(s)";
  const details = [
    { label: "MR", value: "94346597930" },
    { label: "DOB", value: "30-12-1995" },
    { label: "", value: age },
    { label: "", value: "75 kg" },
    { label: "Bed", value: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed },
    { label: "Blood Group", value: "AB" },
    { label: "Rh", value: "+ve" },
    { label: "Isolation Type", value: "Droplet" },
  ];

  return (
    <div
      className={cn(
        "overflow-x-auto overflow-y-hidden rounded-xl border border-[#7367f0]/40 text-white shadow-[0_8px_20px_rgba(115,103,240,0.24)] transition-all duration-200",
        isCompact && "rounded-lg shadow-[0_6px_16px_rgba(115,103,240,0.2)]"
      )}
      style={{ background: "linear-gradient(90deg,#7367f0,#5b8def)" }}
    >
      <div className={cn("flex min-w-max items-center justify-between gap-8 px-3 transition-all duration-200", isCompact ? "min-h-9 py-1" : "min-h-11 py-2")}>
        <div className={cn("flex min-w-max flex-1 items-center transition-all duration-200", isCompact ? "gap-4" : "gap-7")}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-bold">{patient.name}</span>
            <Badge
              className={cn(
                "border-white/30 px-2.5 font-bold shadow-sm",
                tone === "red" && "bg-red-500 text-white",
                tone === "orange" && "bg-orange-400 text-white",
                tone === "blue" && "bg-blue-500 text-white",
              )}
              tone={tone === "red" ? "critical" : tone === "orange" ? "warning" : "success"}
            >
              {tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Stable"}
            </Badge>
          </div>
          {details.map((item) => (
            <div className="whitespace-nowrap text-sm font-semibold" key={`${item.label}-${item.value}`}>
              {item.label ? <span className={item.label === "Isolation Type" ? "font-extrabold text-red-300" : "text-white/80"}>{item.label}: </span> : null}
              <span className={item.label === "Isolation Type" ? "font-extrabold text-red-300" : undefined}>{item.value}</span>
            </div>
          ))}
          <div className={cn("whitespace-nowrap text-sm font-bold text-orange-300", !isCompact && "ml-0")}>Allergies: Meropenem</div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild className="h-8 border-white/25 bg-[#1d4ed8] px-3 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af]" size="sm" variant="outline">
            <Link href="/doctor-dashboard1"><ArrowLeft className="h-4 w-4" />Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
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

function PatientOverview({ patient, rapidReviewPatient }: { patient: Dashboard1Patient; rapidReviewPatient?: RapidReviewPatient }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(1,1fr)_320px]">
        <Card className="overflow-hidden border-border/80">
          <CardContent className="grid gap-3 p-1 sm:grid-cols-5 xl:grid-cols-5">
            <PatientMetric label="HR" value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
            <PatientMetric label="SpO2" value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
            <PatientMetric label="ABPS" value={`${patient.abps.value} mmHg`} tone={patient.abps.tone} />
            <PatientMetric label="ABPD" value={`${patient.abpd.value} mmHg`} tone={patient.abpd.tone} />
            <PatientMetric label="Temperature" value={`${patient.temperature.value} °C`} tone={patient.temperature.tone} />
          </CardContent>
        </Card>
      </div>

      {rapidReviewPatient ? (
        <PatientVitalsAllGraphOnly patient={rapidReviewPatient} />
      ) : (
        <div className="rounded-xl border border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
          Vitals graph data is not available for this patient.
        </div>
      )}
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
  return <ProgressNotesPanel patient={patient} rapidReviewPatient={rapidReviewPatient} tone={patientTone(patient)} />;
}

function PatientVitalsTabs({ patient, rapidReviewPatient }: { patient: Dashboard1Patient; rapidReviewPatient?: RapidReviewPatient }) {
  return (
    <Tabs className="space-y-4" defaultValue="chart">
      <div className="flex justify-start rounded-xl border border-border bg-white p-1.5 shadow-sm">
        <TabsList className="no-tab-scroll-hint grid w-full max-w-[420px] grid-cols-2 rounded-lg bg-surface-muted/70 p-1">
          <TabsTrigger className="h-10 justify-center gap-2 rounded-lg bg-transparent text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="chart">
            <ClipboardCheck className="h-4 w-4" />
            Chart
          </TabsTrigger>
          <TabsTrigger className="h-10 justify-center gap-2 rounded-lg bg-transparent text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="graph">
            <ChartNoAxesCombined className="h-4 w-4" />
            Graph
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent className="mt-0" value="chart">
        <PatientMonitoring key={`monitoring-${patient.id}`} patient={patient} rapidReviewPatient={rapidReviewPatient} />
      </TabsContent>

      <TabsContent className="mt-0 " value="graph">
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
