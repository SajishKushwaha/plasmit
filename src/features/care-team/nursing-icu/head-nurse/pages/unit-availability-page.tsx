"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  HeadNurseEmptyPatientState,
  HeadNursePatientContext,
  InfoTile,
} from "../head-nurse-patient-context";
import {
  headNursePatientHref,
  headNurseUnitRows,
  isAdmissionReviewComplete,
  isUnitReadyForStaffCheck,
  unitReadinessForPatient,
} from "../head-nurse-mock-data";
import type { HeadNursePageProps, HeadNurseTone } from "../head-nurse-types";

export function UnitAvailabilityPage({ initialPatientId }: HeadNursePageProps) {
  return (
    <HeadNursePatientContext initialPatientId={initialPatientId} moduleId="unit-availability">
      {({ patient }) => {
        if (!patient) return <HeadNurseEmptyPatientState moduleLabel="unit availability" />;

        const selectedUnit = headNurseUnitRows.find((row) => row.unit === patient.unit);
        const _reviewComplete = isAdmissionReviewComplete();
        const unitReadiness = unitReadinessForPatient(patient);
        const unitReadyForStaff = isUnitReadyForStaffCheck(patient);
        const _unitTone = unitReadinessTone(unitReadiness);

        return (
          <div className="space-y-4">
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-4">
                {selectedUnit ? (
                  <div className="grid gap-3 md:grid-cols-4">
                    <InfoTile label="Total beds" value={selectedUnit.totalBeds} />
                    <InfoTile label="Available beds" value={selectedUnit.availableBeds} />
                    <InfoTile label="Isolation beds" value={selectedUnit.isolationBeds} />
                    <InfoTile label="Ventilator beds" value={selectedUnit.ventilatorBeds} />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-3">
                  {unitReadyForStaff ? (
                    <Button asChild className="w-full">
                      <Link
                        href={headNursePatientHref("/head-nurse/staff-availability", patient.id)}
                      >
                        Check staff availability
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full" disabled>
                        Check staff availability
                      </Button>
                      <Button className="w-full" variant="outline">
                        Hold for unit readiness
                      </Button>
                    </>
                  )}
                  <Button asChild className="w-full" variant="outline">
                    <Link href={headNursePatientHref("/head-nurse/new-admissions", patient.id)}>
                      Back to admission review
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }}
    </HeadNursePatientContext>
  );
}

function ReadinessCheck({
  complete,
  label,
  tone,
  value,
}: {
  complete: boolean;
  label: string;
  tone?: HeadNurseTone;
  value: string;
}) {
  const resolvedTone = tone ?? (complete ? "success" : "warning");

  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
      </div>
      <span
        className={cn(
          "mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-black text-white",
          readinessToneClass(resolvedTone),
        )}
      >
        {complete ? "Ready" : "Locked"}
      </span>
    </div>
  );
}

function unitReadinessTone(status: string): HeadNurseTone {
  if (status === "Ready") return "success";
  if (status === "Limited") return "warning";
  if (status === "No bed" || status === "Ventilator bed needed") return "danger";
  return "warning";
}

function readinessToneClass(tone: HeadNurseTone) {
  if (tone === "success") return "bg-green-700";
  if (tone === "danger" || tone === "critical") return "bg-red-600";
  if (tone === "info") return "bg-sky-600";
  return "bg-orange-500";
}

function _unitActionMessage(status: string) {
  if (status === "Review pending")
    return "Admission review must be verified before unit readiness can unlock staff check.";
  if (status === "No bed") return "Target unit has no available bed. Hold or find alternate unit.";
  if (status === "Ventilator bed needed")
    return "Ventilator-compatible bed or equipment setup is required.";
  if (status === "Unit setup pending")
    return "Unit mapping/setup must be completed before staff check.";
  return "Resolve unit readiness before staff availability check.";
}
