"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Patient } from "@/features/radiology/types";
import { formatPatientAgeGender } from "@/features/radiology/utils/formatters";

interface PatientSearchBoxProps {
  patients: Patient[];
}

export function PatientSearchBox({ patients }: PatientSearchBoxProps) {
  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id ?? "");

  const matches = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return patients.slice(0, 5);
    }

    return patients.filter((patient) =>
      [patient.name, patient.mrn, patient.phone, patient.consultant].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [patients, query]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-sm font-medium text-slate-900" htmlFor="radiology-patient-search">
        Patient search
      </label>
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
          id="radiology-patient-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by MRN, name, phone, or consultant"
          value={query}
        />
      </div>

      <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
        {matches.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No patient found. Try another MRN or phone number.</div>
        ) : (
          matches.map((patient) => (
            <button
              className={[
                "flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm hover:bg-slate-50",
                selectedPatientId === patient.id ? "bg-sky-50" : "bg-white",
              ].join(" ")}
              key={patient.id}
              onClick={() => setSelectedPatientId(patient.id)}
              type="button"
            >
              <span>
                <span className="block font-medium text-slate-950">{patient.name}</span>
                <span className="text-xs text-slate-500">
                  {patient.mrn} · {formatPatientAgeGender(patient.age, patient.gender)}
                </span>
              </span>
              <span className="text-xs font-medium text-slate-500">{patient.location}</span>
            </button>
          ))
        )}
      </div>

      {selectedPatient ? (
        <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          Selected: <span className="font-semibold">{selectedPatient.name}</span> for radiology order workflow.
        </div>
      ) : null}
    </section>
  );
}
