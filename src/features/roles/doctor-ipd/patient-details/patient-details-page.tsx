"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChartNoAxesCombined, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orderedPatients } from "@/features/roles/doctor-ipd/dashboard/dashboard.data";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { PatientBanner } from "@/features/roles/doctor-ipd/patient-details/components/patient-banner";
import { PatientMetric, dashboardBpTone, dashboardBpValue } from "@/features/roles/doctor-ipd/patient-details/components/patient-metrics";
import { PatientNavigation } from "@/features/roles/doctor-ipd/patient-details/components/patient-navigation";
import { PatientOverview } from "@/features/roles/doctor-ipd/patient-details/components/patient-overview";
import type { DashboardPoctMode, PatientTabValue, RequestedOrderTab, ResultsAutoView } from "@/features/roles/doctor-ipd/patient-details/patient-details.types";
import { IpdUnifiedModulePage } from "@/features/clinical/ipd/ipd-pages";
import { LiveMonitoringPage } from "@/features/clinical/live-monitoring/live-monitoring-page";
import { rapidReviewPatients, type RapidReviewPatient } from "@/features/clinical/rapid-review/rapid-review-data";
import { PatientVitalsGraph } from "@/features/clinical/rapid-review/rapid-review-graph";
import { ResultsCenterView } from "@/features/diagnostics/results/components/ResultsCenterView";
import { DoctorOrdersPage } from "@/features/clinical/doctor-orders/doctor-orders";
import { ViewPoctResultPage } from "@/features/clinical/poct/poct-pages";
import { IntakeOutputPage } from "@/features/clinical/intake-output/intake-output-page";
import { NotesPage } from "@/features/clinical/notes/notes-page";
import { ProgressNotesPanel } from "@/features/roles/doctor-ipd/progress-notes";
import { cn } from "@/lib/utils";

function getRequestedPatientTab(tab: string | null): PatientTabValue | null {
  switch (tab) {
    case "overview":
    case "live-monitoring":
    case "clinical-examination":
    case "results":
    case "vitals":
    case "assessment":
    case "add-progress":
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

export function DoctorIpdPatientDetailsPage({ patientId }: { patientId: string }) {
  const searchParams = useSearchParams();
  const requestedTab = getRequestedPatientTab(searchParams.get("tab"));
  const requestedPoctMode = getRequestedPoctMode(searchParams.get("poct"));
  const requestedResultsAutoView = getRequestedResultsAutoView(searchParams.get("resultsView"));
  const requestedOrderTab = getRequestedOrderTab(searchParams.get("orderTab"));
  const [activeTab, setActiveTab] = React.useState<PatientTabValue>(requestedTab ?? "overview");
  const [poctMode, setPoctMode] = React.useState<DashboardPoctMode>(requestedPoctMode ?? "add");
  const [ordersDefaultTab, setOrdersDefaultTab] = React.useState(requestedOrderTab ?? (requestedPoctMode === "add" ? "poct" : "blood"));
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

    window.addEventListener("plasmit-doctor-ipd-poct-mode", openPoctInPlace);
    return () => window.removeEventListener("plasmit-doctor-ipd-poct-mode", openPoctInPlace);
  }, []);

  if (!patient) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <div className="text-base font-semibold">Patient not found</div>
          <Button asChild>
            <Link href="/doctor-ipd">Back to Dashboard</Link>
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
          <PatientBanner
            isCompact={isPatientHeaderCompact}
            patient={patient}
            rapidReviewPatient={rapidReviewPatient}
            tone={tone}
          />

          <PatientNavigation />
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
                key={`results-${patient.id}`}
                patientContext={{
                  ageSex: rapidReviewPatient?.ageGender,
                  allergy: "Meropenem",
                  bed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
                  bloodGroup: "AB +ve",
                  consultantDoctor: rapidReviewPatient?.consultant,
                  dob: "30-12-1995",
                  mrn: getResultPatientMrn(patient.id),
                  name: patient.name,
                  patientId: String(patient.id),
                  uhid: rapidReviewPatient?.uhid ?? `DASH-${String(patient.id).padStart(4, "0")}`,
                  wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed,
                }}
                onAddLaboratoryOrder={() => {
                  setActiveTab("orders");
                  setOrdersDefaultTab("lab");
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
          <TabsContent className="mt-0" value="add-progress">
            <React.Suspense fallback={<div className="rounded-md border border-border bg-white p-4 text-sm font-semibold text-muted-foreground">Loading notes...</div>}>
              <NotesPage
                initialMedicalNoteSection="Physician Notes"
                initialNewNoteCategory="Medical Notes"
                readOnlyCategories={["ED Notes", "Admission Notes", "Nurse Notes", "Surgery Notes", "Operative Notes"]}
                readOnlyMedicalNoteSections={["ED Notes"]}
              />
            </React.Suspense>
          </TabsContent>
          <TabsContent className="mt-0" value="shift-summary">
            <NurseShiftSummaryTimeline patient={patient} rapidReviewPatient={rapidReviewPatient} />
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
            <IntakeOutputPage hidePatientStrip key={patient.id} />
          </TabsContent>
        </div>
      </Tabs>
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

function NurseShiftSummaryTimeline({ patient, rapidReviewPatient }: { patient: DoctorIpdPatient; rapidReviewPatient?: RapidReviewPatient }) {
  return <ProgressNotesPanel patient={patient} rapidReviewPatient={rapidReviewPatient} tone={patientTone(patient)} />;
}

function PatientVitalsTabs({ patient, rapidReviewPatient }: { patient: DoctorIpdPatient; rapidReviewPatient?: RapidReviewPatient }) {
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

function PatientMonitoring({ patient, rapidReviewPatient }: { patient: DoctorIpdPatient; rapidReviewPatient?: RapidReviewPatient }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-gradient-to-br from-white to-surface-muted/70 p-4 shadow-sm">
        
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <PatientMetric label="HR" value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
          <PatientMetric label="SpO2" value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
          <PatientMetric label="BP" value={`${dashboardBpValue(patient)} mmHg`} tone={dashboardBpTone(patient)} />
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
