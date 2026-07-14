"use client";

import * as React from "react";
import { ChevronDown, Search, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { orderedPatients } from "@/features/roles/doctor-ipd/dashboard/dashboard.data";
import { patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { rapidReviewPatients } from "@/features/clinical/rapid-review/rapid-review-data";
import { ResultsCenterView } from "@/features/diagnostics/results/components/ResultsCenterView";

export function DoctorPatientResultsWorkspace() {
  // const [selectedPatientId, setSelectedPatientId] = React.useState(String(orderedPatients[0]?.id ?? ""));
  const [selectedPatientId, setSelectedPatientId] = React.useState("");
  // const selectedPatient = orderedPatients.find((patient) => String(patient.id) === selectedPatientId) ?? orderedPatients[0];
  const selectedPatient =
    orderedPatients.find((patient) => String(patient.id) === selectedPatientId) ?? undefined;
  const rapidReviewPatient = selectedPatient
    ? rapidReviewPatients.find((item) => item.id === selectedPatient.rapidReviewPatientId)
    : undefined;
  const [patientSearchOpen, setPatientSearchOpen] = React.useState(false);
  // const [patientQuery, setPatientQuery] = React.useState(selectedPatient ? patientOptionLabel(selectedPatient) : "");
  const [patientQuery, setPatientQuery] = React.useState("");
  const [isPatientHeaderCompact, setIsPatientHeaderCompact] = React.useState(false);

  React.useEffect(() => {
    if (selectedPatient && !patientSearchOpen) {
      setPatientQuery(patientOptionLabel(selectedPatient));
    }
  }, [patientSearchOpen, selectedPatient]);

  React.useEffect(() => {
    const updatePatientHeader = () => {
      setIsPatientHeaderCompact(window.scrollY > 8);
    };

    updatePatientHeader();
    window.addEventListener("scroll", updatePatientHeader, { passive: true });

    return () => window.removeEventListener("scroll", updatePatientHeader);
  }, []);

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
    <div className="space-y-4 pb-4 pt-[76px]">
      <Card className="rounded-md border-slate-200 shadow-sm">
        <CardContent className="flex justify-end p-4">
          <div className="w-full max-w-xl">
            <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-500">
              Select Patient
            </span>
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
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${patientSearchOpen ? "rotate-180" : ""}`}
                />
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
                          <span className="block truncate text-sm font-bold text-slate-900">
                            {patient.name}
                          </span>
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
                    <div className="px-3 py-2 text-sm font-semibold text-slate-500">
                      No patient found
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* {selectedPatient ? (
        <section className="space-y-4">
          <SelectedPatientHeader isCompact={isPatientHeaderCompact} patient={selectedPatient} rapidReviewPatient={rapidReviewPatient} />
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
      )} */}
      {selectedPatient ? (
        <section className="space-y-4">
          <SelectedPatientHeader
            isCompact={isPatientHeaderCompact}
            patient={selectedPatient}
            rapidReviewPatient={rapidReviewPatient}
          />

          <ResultsCenterView
            key={selectedPatient.id}
            defaultDepartment="all"
            patientContext={{
              ageSex: rapidReviewPatient?.ageGender,
              allergy: "Meropenem",
              bed: rapidReviewPatient
                ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}`
                : selectedPatient.bed,
              bloodGroup: "AB +ve",
              consultantDoctor: rapidReviewPatient?.consultant,
              dob: "30-12-1995",
              mrn: getResultPatientMrn(selectedPatient.id),
              name: selectedPatient.name,
              uhid:
                rapidReviewPatient?.uhid ?? `DASH-${String(selectedPatient.id).padStart(4, "0")}`,
              wardBed: rapidReviewPatient
                ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}`
                : selectedPatient.bed,
            }}
            viewTitle="Results Center"
            viewDescription="Laboratory, radiology, POCT, and critical results for the selected patient."
          />
        </section>
      ) : null}
    </div>
  );
}

function SelectedPatientHeader({
  isCompact,
  patient,
  rapidReviewPatient,
}: {
  isCompact: boolean;
  patient: (typeof orderedPatients)[number];
  rapidReviewPatient?: (typeof rapidReviewPatients)[number];
}) {
  const tone = patientTone(patient);
  const statusLabel = tone === "red" ? "Urgent" : tone === "orange" ? "Warning" : "Stable";
  const statusClass =
    tone === "red"
      ? "bg-red-500 text-white"
      : tone === "orange"
        ? "bg-amber-400 text-slate-950"
        : "bg-emerald-500 text-white";
  const age = rapidReviewPatient?.ageGender?.split("/")[0]?.trim()
    ? `${rapidReviewPatient.ageGender.split("/")[0].trim()} year(s)`
    : "35 year(s)";
  const details = [
    { label: "MR", value: "94346597930" },
    { label: "DOB", value: "30-12-1995" },
    { label: "", value: age },
    { label: "", value: "75 kg" },
    {
      label: "Bed",
      value: rapidReviewPatient
        ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}`
        : patient.bed,
    },
    { label: "Blood Group", value: "AB" },
    { label: "Rh", value: "+ve" },
    { label: "Isolation Type", value: "Droplet", tone: "orange" },
    { label: "Allergies", value: "Meropenem", tone: "orange" },
  ];

  return (
    <div
      className={`fixed left-0 right-0 bg-background/95 px-4 py-2 backdrop-blur transition-[top,box-shadow] duration-200 md:px-6 lg:left-[var(--app-sidebar-offset)] ${
        isCompact ? "top-0 z-50 shadow-sm" : "top-16 z-30"
      }`}
    >
      <div className="flex min-h-12 items-center gap-4 overflow-x-auto rounded-md bg-gradient-to-r from-[#7367f0] to-[#5b8def] px-4 py-2 text-sm font-extrabold text-white shadow-sm">
        <div className="flex shrink-0 items-center gap-2">
          <span className="whitespace-nowrap text-base">{patient.name}</span>
          <span className={`rounded-full px-3 py-1 text-xs ${statusClass}`}>{statusLabel}</span>
        </div>
        <div className="flex min-w-max items-center gap-6">
          {details.map((detail, index) => (
            <span
              className={
                detail.tone === "orange"
                  ? "whitespace-nowrap text-orange-200"
                  : "whitespace-nowrap text-white"
              }
              key={`${detail.label}-${detail.value}-${index}`}
            >
              {detail.label ? `${detail.label}: ` : ""}
              {detail.value}
            </span>
          ))}
        </div>
      </div>
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
