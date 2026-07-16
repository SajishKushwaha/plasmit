"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HeadNurseEmptyPatientState, HeadNursePatientContext, HeadNurseTonePill } from "../head-nurse-patient-context";
import { headNurseStaffRows, isUnitReadyForStaffCheck, setSelectedUnitNurseForPatient, staffReadinessForPatient } from "../head-nurse-mock-data";
import type { HeadNursePageProps } from "../head-nurse-types";

export function StaffAvailabilityPage({ initialPatientId }: HeadNursePageProps) {
  const router = useRouter();

  return (
    <HeadNursePatientContext initialPatientId={initialPatientId} moduleId="staff-availability">
      {({ patient }) => {
        if (!patient) return <HeadNurseEmptyPatientState moduleLabel="staff availability" />;

        const unitReady = isUnitReadyForStaffCheck(patient);
        const staffReadiness = staffReadinessForPatient(patient);

        return (
          <div className="space-y-4">
            <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
              <CardContent className="p-0">
                <Table className="w-full min-w-[800px] border-collapse text-sm">
                  <TableHeader className="bg-slate-50 text-xs uppercase text-slate-500">
                    <TableRow>
                      <TableHead className="px-4 py-3 text-left">ICU nurse</TableHead>
                      <TableHead className="px-4 py-3 text-center">Patients</TableHead>
                      <TableHead className="px-4 py-3 text-center">Critical</TableHead>
                      <TableHead className="px-4 py-3 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {headNurseStaffRows.map((row) => {
                      const canAssign = unitReady && row.status === "Available";

                      return (
                        <TableRow className="border-t border-slate-100" key={`${row.role}-${row.nurse}`}>
                          <TableCell className="px-4 py-3 font-black text-slate-950">{row.nurse}</TableCell>
                          <TableCell className="px-4 py-3 text-center">{row.assignedPatients}/{row.maxCapacity}</TableCell>
                          <TableCell className="px-4 py-3 text-center">{row.criticalPatients}</TableCell>
                          <TableCell className="px-4 py-3 text-center">
                            {canAssign ? (
                              <Button
                                className="inline-flex min-w-[96px] items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200"
                                onClick={() => {
                                  setSelectedUnitNurseForPatient(patient.id, row.nurse);
                                  router.push("/nursing-icu/head-nurse");
                                }}
                                type="button"
                              >
                                Assign nurse
                              </Button>
                            ) : (
                              <HeadNurseTonePill tone={row.tone}>{unitReady ? row.status : staffReadiness}</HeadNurseTonePill>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </HeadNursePatientContext>
  );
}