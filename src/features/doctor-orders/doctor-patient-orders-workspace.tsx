"use client";

import * as React from "react";
import { Search, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { DoctorOrdersPage, type DoctorOrdersPatientContext } from "@/features/doctor-orders/doctor-orders";
import { orderedPatients } from "@/features/doctor-dashboard1/doctor-dashboard1-page";

export function DoctorPatientOrdersWorkspace() {
  const [selectedPatientId, setSelectedPatientId] = React.useState(String(orderedPatients[0]?.id ?? ""));
  const selectedPatient = orderedPatients.find((patient) => String(patient.id) === selectedPatientId) ?? orderedPatients[0];
  const patientContext = selectedPatient ? toPatientContext(selectedPatient) : undefined;

  return (
    <div className="space-y-4 py-4">
      <Card className="rounded-md border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-slate-950">Patient Orders</div>
            <p className="mt-1 text-sm font-semibold text-slate-500">Select one patient to view and place orders for that patient.</p>
          </div>

          <label className="w-full max-w-xl">
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Select Patient</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="h-11 w-full appearance-none rounded-md border border-slate-300 bg-white pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                value={selectedPatientId}
                onChange={(event) => setSelectedPatientId(event.target.value)}
              >
                {orderedPatients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} | {patient.bed} | {patient.diagnosis}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </CardContent>
      </Card>

      {selectedPatient && patientContext ? (
        <section className="min-w-0 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <DoctorOrdersPage key={selectedPatient.id} patientContext={patientContext} showPatientBanner />
        </section>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm font-semibold text-slate-500">
            <UserRound className="h-5 w-5" />
            No patient available for orders.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function toPatientContext(patient: (typeof orderedPatients)[number]): DoctorOrdersPatientContext {
  return {
    id: `doctor-ipd-${patient.id}`,
    name: patient.name,
    uhid: `DASH-${String(patient.id).padStart(4, "0")}`,
    ageSex: "45/M",
    wardBed: patient.bed,
    diagnosis: patient.diagnosis,
    radiologyPatientId: `pat-${1000 + (((patient.id - 1) % 6) + 1)}`,
  };
}
