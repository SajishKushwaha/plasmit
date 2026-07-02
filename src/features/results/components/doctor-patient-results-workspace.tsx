"use client";

import * as React from "react";
import { ChevronDown, Search, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PatientSummaryBanner } from "@/components/ui/patient-summary-banner";
import { orderedPatients } from "@/features/doctor-dashboard1/doctor-dashboard1-page";
import { rapidReviewPatients } from "@/features/rapid-review/rapid-review-data";
import { ResultsCenterView } from "@/features/results/components/ResultsCenterView";

export function DoctorPatientResultsWorkspace() {
  const [selectedPatientId, setSelectedPatientId] = React.useState(String(orderedPatients[0]?.id ?? ""));
  const selectedPatient = orderedPatients.find((patient) => String(patient.id) === selectedPatientId) ?? orderedPatients[0];
  const rapidReviewPatient = selectedPatient ? rapidReviewPatients.find((item) => item.id === selectedPatient.rapidReviewPatientId) : undefined;
  const [patientSearchOpen, setPatientSearchOpen] = React.useState(false);
  const [patientQuery, setPatientQuery] = React.useState(selectedPatient ? patientOptionLabel(selectedPatient) : "");

  React.useEffect(() => {
    if (selectedPatient && !patientSearchOpen) {
      setPatientQuery(patientOptionLabel(selectedPatient));
    }
  }, [patientSearchOpen, selectedPatient]);

  const filteredPatients = React.useMemo(() => {
    const normalizedQuery = patientQuery.trim().toLowerCase();
    const selectedLabel = selectedPatient ? patientOptionLabel(selectedPatient).toLowerCase() : "";

    if (!normalizedQuery || normalizedQuery === selectedLabel) return orderedPatients;

    return orderedPatients.filter((patient) =>
      patientOptionLabel(patient).toLowerCase().includes(normalizedQuery),
    );
  }, [patientQuery, selectedPatient]);

  const handlePatientSelect = (patientId: number) => {
    setSelectedPatientId(String(patientId));
    const patient = orderedPatients.find((item) => item.id === patientId);
    setPatientQuery(patient ? patientOptionLabel(patient) : "");
    setPatientSearchOpen(false);
  };

  return (
    <div className="space-y-4 py-4">
      <Card className="rounded-md border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="text-lg font-extrabold text-slate-950">Patient Results</div>
            <p className="mt-1 text-sm font-semibold text-slate-500">Select one patient to view only that patient's results.</p>
          </div>

          <div className="w-full max-w-xl">
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Select Patient</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-10 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
                value={patientQuery}
                placeholder="Search patient..."
                onBlur={() => window.setTimeout(() => setPatientSearchOpen(false), 140)}
                onChange={(event) => {
                  setPatientQuery(event.target.value);
                  setPatientSearchOpen(true);
                }}
                onFocus={(event) => {
                  setPatientSearchOpen(true);
                  event.currentTarget.select();
                }}
              />
              <button
                aria-label="Show patient options"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setPatientSearchOpen((open) => !open)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${patientSearchOpen ? "rotate-180" : ""}`} />
              </button>

              {patientSearchOpen ? (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-xl">
                  {filteredPatients.length ? (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        className="flex w-full items-start justify-between gap-3 rounded-md px-3 py-2 text-left transition hover:bg-slate-50"
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handlePatientSelect(patient.id)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-slate-900">{patient.name}</span>
                          <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
                            {patient.bed} | {patient.diagnosis}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-md border border-slate-200 px-2 py-0.5 text-xs font-bold text-slate-500">
                          DASH-{String(patient.id).padStart(4, "0")}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm font-semibold text-slate-500">No patient found</div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPatient ? (
        <section className="space-y-4">
          <PatientSummaryBanner
            title="Selected Patient Results"
            fields={[
              { label: "Name", value: selectedPatient.name },
              { label: "UHID", value: rapidReviewPatient?.uhid ?? `DASH-${String(selectedPatient.id).padStart(4, "0")}` },
              { label: "Age/Sex", value: rapidReviewPatient?.ageGender ?? "45/M" },
              { label: "Ward/Bed", value: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : selectedPatient.bed },
              { label: "Diagnosis", value: selectedPatient.diagnosis },
            ]}
          />
          <ResultsCenterView
            defaultDepartment="all"
            key={selectedPatient.id}
            patientContext={{
              ageSex: rapidReviewPatient?.ageGender,
              allergy: "Meropenem",
              bed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : selectedPatient.bed,
              bloodGroup: "AB +ve",
              consultantDoctor: rapidReviewPatient?.consultant,
              dob: "30-12-1995",
              mrn: getResultPatientMrn(selectedPatient.id),
              name: selectedPatient.name,
              uhid: rapidReviewPatient?.uhid ?? `DASH-${String(selectedPatient.id).padStart(4, "0")}`,
              wardBed: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : selectedPatient.bed,
            }}
            viewDescription="Laboratory, radiology, POCT, and critical results for the selected patient."
            viewTitle="Results Center"
          />
        </section>
      ) : (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm font-semibold text-slate-500">
            <UserRound className="h-5 w-5" />
            No patient available for results.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function patientOptionLabel(patient: (typeof orderedPatients)[number]) {
  return `${patient.name} | ${patient.bed} | ${patient.diagnosis}`;
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
