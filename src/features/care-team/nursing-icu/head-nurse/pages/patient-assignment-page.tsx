"use client";

import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { HeadNurseEmptyPatientState, HeadNursePatientContext, HeadNurseTonePill, InfoTile } from "../head-nurse-patient-context";
import { canAssignPatient, headNursePatientRows, headNurseStaffRows, selectedUnitNurseForPatient, staffReadinessForPatient, unitReadinessForPatient } from "../head-nurse-mock-data";
import type { HeadNursePageProps } from "../head-nurse-types";

export function PatientAssignmentPage({ initialPatientId }: HeadNursePageProps) {
  const searchParams = useSearchParams();
  const queryIcuNurse = searchParams.get("icuNurse") ?? "";
  const icuNurses = headNurseStaffRows.filter((row) => row.role === "ICU Nurse").map((row) => row.nurse);

  return (
    <HeadNursePatientContext initialPatientId={initialPatientId} moduleId="patient-assignment">
      {({ patient }) => {
        if (!patient) return <HeadNurseEmptyPatientState moduleLabel="patient assignment" />;

        const row = headNursePatientRows.find((item) => item.patient.id === patient.id);
        const selectedIcuNurse = queryIcuNurse || selectedUnitNurseForPatient(patient);
        const selectedIcuNurseRow = headNurseStaffRows.find((item) => item.role === "ICU Nurse" && item.nurse === selectedIcuNurse);
        const canAssign = canAssignPatient(patient) || selectedIcuNurseRow?.status === "Available";

        return (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Assign patient to ICU Nurse</CardTitle>
              <CardDescription>Head Nurse assignment keeps unit readiness and nurse workload visible before confirming.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <InfoTile label="Admission" value={row?.reviewStatus ?? "Review"} />
                <InfoTile label="Unit readiness" value={unitReadinessForPatient(patient)} />
                <InfoTile label="Staff readiness" value={staffReadinessForPatient(patient)} />
                <InfoTile label="Current assignment" value={<HeadNurseTonePill tone={row?.tone ?? "info"}>{row?.assignmentStatus ?? "Pending"}</HeadNurseTonePill>} />
              </div>
              <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)]">
                <Select ariaLabel="ICU Nurse" value={selectedIcuNurse || "Select ICU Nurse"} onValueChange={() => undefined} options={["Select ICU Nurse", ...icuNurses]} />
                <Select ariaLabel="Assignment priority" value={patient.criticalityScore >= 8 ? "Critical first" : "Routine assignment"} onValueChange={() => undefined} options={["Critical first", "Routine assignment"]} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button variant="outline">Hold assignment</Button>
                <Button disabled={!canAssign}>Assign ICU Nurse</Button>
              </div>
            </CardContent>
          </Card>
        );
      }}
    </HeadNursePatientContext>
  );
}