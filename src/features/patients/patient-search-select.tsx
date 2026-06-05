"use client";

import * as React from "react";
import { ChevronDown, UserRound } from "lucide-react";

import { SearchInput } from "@/components/ui/search-input";
import { mockPatients } from "@/data/patients";
import type { PatientRecord } from "@/types";

function patientName(patient: PatientRecord) {
  return `${patient.firstName} ${patient.lastName}`;
}

export function PatientSearchSelect({
  patientId,
  onPatientChange,
  label = "Patient Name",
}: {
  patientId: string;
  onPatientChange: (patientId: string) => void;
  label?: string;
}) {
  const selectedPatient =
    mockPatients.find((patient) => patient.id === patientId) ?? mockPatients[0];

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(patientName(selectedPatient));

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery(patientName(selectedPatient));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [selectedPatient]);

  const filteredPatients = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return mockPatients;

    return mockPatients.filter((patient) =>
      `${patientName(patient)} ${patient.uhid} ${patient.mobile}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  const selectPatient = (patient: PatientRecord) => {
    onPatientChange(patient.id);
    setQuery(patientName(patient));
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 shadow-sm">
        {/* <UserRound className="h-4 w-4 shrink-0 text-primary" /> */}

        <span className="shrink-0 text-sm font-medium text-muted-foreground">
          {label}
        </span>

        <div className="h-5 w-px bg-border" />

        <div className="flex-1">
          <SearchInput
            value={query}
            placeholder="Search patient..."
            className="border-0 shadow-none"
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
          />
        </div>

        {/* <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="shrink-0"
        >
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button> */}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border bg-background p-1 shadow-xl">
          {filteredPatients.length ? (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectPatient(patient)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {patientName(patient)}
                  </div>

                  <div className="truncate text-xs text-muted-foreground">
                    {patient.uhid} • {patient.mobile}
                  </div>
                </div>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {patient.age}/{patient.gender}
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No patient found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function patientDisplayName(patient: PatientRecord) {
  return patientName(patient);
}
