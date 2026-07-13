"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
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
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 text-left">ICU nurse</th>
                      <th className="px-4 py-3 text-center">Patients</th>
                      <th className="px-4 py-3 text-center">Critical</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {headNurseStaffRows.map((row) => {
                      const canAssign = unitReady && row.status === "Available";

                      return (
                        <tr className="border-t border-slate-100" key={`${row.role}-${row.nurse}`}>
                          <td className="px-4 py-3 font-black text-slate-950">{row.nurse}</td>
                          <td className="px-4 py-3 text-center">{row.assignedPatients}/{row.maxCapacity}</td>
                          <td className="px-4 py-3 text-center">{row.criticalPatients}</td>
                          <td className="px-4 py-3 text-center">
                            {canAssign ? (
                              <button
                                className="inline-flex min-w-[96px] items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-200"
                                onClick={() => {
                                  setSelectedUnitNurseForPatient(patient.id, row.nurse);
                                  router.push("/head-nurse");
                                }}
                                type="button"
                              >
                                Assign nurse
                              </button>
                            ) : (
                              <HeadNurseTonePill tone={row.tone}>{unitReady ? row.status : staffReadiness}</HeadNurseTonePill>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </HeadNursePatientContext>
  );
}