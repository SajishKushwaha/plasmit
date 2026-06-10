"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  orderedPatients,
  patientTone,
  patientToneClass,
  type Dashboard1Patient,
} from "@/features/doctor-dashboard1/doctor-dashboard1-page";
import { IpdUnifiedModulePage } from "@/features/ipd/ipd-pages";
import { LiveMonitoringPage } from "@/features/live-monitoring/live-monitoring-page";
import { rapidReviewPatients } from "@/features/rapid-review/rapid-review-data";
import { PatientVitalsGraph } from "@/features/rapid-review/rapid-review-graph";
import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";
import { cn } from "@/lib/utils";

export function DoctorDashboard1PatientPage({ patientId }: { patientId: string }) {
  const [activeTab, setActiveTab] = React.useState("overview");
  const patient = orderedPatients.find((item) => String(item.id) === patientId);
  const rapidReviewPatient = patient ? rapidReviewPatients.find((item) => item.id === patient.rapidReviewPatientId) : undefined;

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

  return (
    <div className="space-y-4 py-4">
      <Card className="overflow-hidden rounded-md border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className={cn("text-lg font-bold", patientToneClass(patientTone(patient)))}>
                {patient.name}
              </div>
              <div className="mt-1 text-xs font-semibold text-muted-foreground">
                {patient.bed} | {patient.diagnosis}
              </div>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/doctor-dashboard1">Back to Dashboard1</Link>
            </Button>
          </div>

          <Tabs onValueChange={setActiveTab} value={activeTab}>
            <TabsList>
              <TabsTrigger value="overview">Patient Overview</TabsTrigger>
              <TabsTrigger value="live-monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="vitals-graph">Vitals Graph</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <PatientMetric label="HR" value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
                <PatientMetric label="SpO2" value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
                <PatientMetric label="ABPS" value={`${patient.abps.value} mmHg`} tone={patient.abps.tone} />
                <PatientMetric label="ABPD" value={`${patient.abpd.value} mmHg`} tone={patient.abpd.tone} />
                <PatientMetric label="Temperature" value={`${patient.temperature.value} °C`} tone={patient.temperature.tone} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/rapid-review?tab=entry&patient=${patient.rapidReviewPatientId}`}>Open Rapid Review</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href="/clinical-examination">Open Clinical Examination</Link>
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="live-monitoring">
              <LiveMonitoringPage />
            </TabsContent>
            <TabsContent value="results">
              <ResultsCenterView
                defaultDepartment="laboratory"
                viewDescription={`Laboratory, radiology, POCT, and critical results for ${patient.name}.`}
                viewTitle={`${patient.name} Results`}
              />
            </TabsContent>
            <TabsContent value="monitoring">
              <PatientMonitoring key={patient.id} patient={patient} />
            </TabsContent>
            <TabsContent value="vitals-graph">
              {rapidReviewPatient ? (
                <PatientVitalsGraph patient={rapidReviewPatient} />
              ) : (
                <div className="rounded-md border border-border bg-surface-muted p-6 text-center text-sm text-muted-foreground">
                  Vitals graph data is not available for this patient.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function PatientMonitoring({ patient }: { patient: Dashboard1Patient }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface-muted p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient Monitoring</div>
        <div className={cn("mt-1 text-xl font-bold", patientToneClass(patientTone(patient)))}>{patient.name}</div>
        <div className="mt-1 text-sm font-medium text-muted-foreground">
          {patient.bed} | {patient.diagnosis}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <PatientMetric label={`${patient.name} HR`} value={`${patient.hr.value} bpm`} tone={patient.hr.tone} />
        <PatientMetric label={`${patient.name} SpO2`} value={`${patient.spo2.value}%`} tone={patient.spo2.tone} />
        <PatientMetric label={`${patient.name} ABPS`} value={`${patient.abps.value} mmHg`} tone={patient.abps.tone} />
        <PatientMetric label={`${patient.name} ABPD`} value={`${patient.abpd.value} mmHg`} tone={patient.abpd.tone} />
        <PatientMetric label={`${patient.name} Temperature`} value={`${patient.temperature.value} °C`} tone={patient.temperature.tone} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm">
          <Link href="/ipd">Open Full Monitoring</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/live-monitoring">Open Live Monitoring</Link>
        </Button>
      </div>
      <div className="rounded-md border border-border bg-surface p-3">
        <div className="mb-3 text-sm font-semibold text-foreground">{patient.name} Monitoring Workspace</div>
        <React.Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading monitoring...</div>}>
          <IpdUnifiedModulePage />
        </React.Suspense>
      </div>
    </div>
  );
}

function PatientMetric({ label, value, tone }: { label: string; value: string; tone: Dashboard1Patient["hr"]["tone"] }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-1 text-lg font-bold",
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
