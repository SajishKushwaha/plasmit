"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeadNurseEmptyPatientState, HeadNursePatientContext } from "../head-nurse-patient-context";
import {
  headNursePatientHref,
  isAdmissionReviewComplete,
  setAdmissionReviewStatus,
} from "../head-nurse-mock-data";
import type { HeadNursePageProps } from "../head-nurse-types";

export function NewAdmissionsPage({ initialPatientId }: HeadNursePageProps) {
  return (
    <HeadNursePatientContext initialPatientId={initialPatientId} moduleId="new-admissions">
      {({ patient }) => {
        if (!patient) return <HeadNurseEmptyPatientState moduleLabel="new admission review" />;

        const reviewComplete = isAdmissionReviewComplete();

        return (
          <div className="space-y-4">

            <div className="grid gap-4 xl:grid-cols-2">


              <Card className="h-full min-h-[194px] border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-black text-slate-950">Admission Verification</h3>
                    </div>
                    
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Admission No.", patient.id],
                      ["Admission Time", patient.admissionTime],
                      ["Admission Type", patient.admissionSource],
                      // ["Last vitals", patient.lastVitalsTime],
                      // ["Pending tasks", `${patient.pendingTasks} item(s)`],
                      // ["Clinical score", patient.criticalityScore],
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[minmax(120px,1fr)_minmax(120px,1fr)] items-center gap-4" key={label}>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>{label}</span>
                        </div>
                        <p className="text-right text-sm font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>

                </CardContent>
              </Card>

              <Card className="h-full min-h-[194px] border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sky-50 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-black text-slate-950">Doctor ownership</h3>
                    </div>
                   
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Admitting doctor", patient.admittingDoctor],
                      ["Consulting doctor", patient.consultingDoctor],
                      ["Duty doctor", patient.dutyDoctor],
                      // ["Admission order", "Available in command workflow"],
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[minmax(120px,1fr)_minmax(120px,1fr)] items-center gap-4" key={label}>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>{label}</span>
                        </div>
                        <p className="text-right text-sm font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="min-h-[240px] border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-black text-slate-950">Clinical ICU reason</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Diagnosis", patient.diagnosis],
                      ["Current status", patient.currentStatus],
                      ["Ventilator / oxygen", patient.ventilatorStatus],
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[minmax(120px,1fr)_minmax(120px,1fr)] items-center gap-4" key={label}>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>{label}</span>
                        </div>
                        <p className="text-right text-sm font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>

                </CardContent>
              </Card>
              <Card className="min-h-[240px] border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <h3 className="text-base font-black text-slate-950">Required orders</h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      ["Admission note", "Ready for nurse review"],
                      ["Medication orders", patient.pendingTasks > 0 ? `${patient.pendingTasks} task to track` : "No pending tasks"],
                      ["Investigation orders", patient.alerts.length ? `${patient.alerts.length} alert linked` : "No alert-linked orders"],
                      ["Nursing instructions", "Review during assignment"],
                    ].map(([label, value]) => (
                      <div className="grid grid-cols-[minmax(120px,1fr)_minmax(120px,1fr)] items-center gap-4" key={label}>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>{label}</span>
                        </div>
                        <p className="text-right text-sm font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>

            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {/* <Button variant="outline">Mark in review</Button>
                  <Button variant="outline">Request missing details</Button> */}
                  {reviewComplete ? (
                    <Button asChild>
                      <Link href={headNursePatientHref("/head-nurse/unit-availability", patient.id)}>Verify admission</Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link
                        href={headNursePatientHref("/head-nurse/unit-availability", patient.id)}
                        onClick={() => setAdmissionReviewStatus(patient.id, "Verified")}
                      >
                        Verify admission
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </HeadNursePatientContext>
  );
}

