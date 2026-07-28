"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { getPatientRecordValue, type PatientRecord } from "@/features/roles/receptionist/patient-details/receptionist-patient-records";

type ErNurseUhidLookupInputProps = {
  onSelectRecord: (record: PatientRecord) => void;
  records: PatientRecord[];
  selectedRecordId: string | null;
  selectedUhid: string;
};

type PatientLookupOption = {
  doctor: string;
  id: string;
  name: string;
  phone: string;
  record: PatientRecord;
  uhid: string;
};

function normalizeSearchValue(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function patientIdentifier(record: PatientRecord) {
  return (
    getPatientRecordValue(record, "UHID") ||
    getPatientRecordValue(record, "Patient ID / UHID") ||
    getPatientRecordValue(record, "MRN / Patient ID") ||
    record.id
  );
}

function patientName(record: PatientRecord) {
  const firstName = getPatientRecordValue(record, "First Name");
  const middleName = getPatientRecordValue(record, "Middle Name");
  const lastName = getPatientRecordValue(record, "Last Name");
  return [firstName, middleName, lastName].filter(Boolean).join(" ") || getPatientRecordValue(record, "Patient Name") || "Unnamed Patient";
}

function patientLookupOptions(records: PatientRecord[]): PatientLookupOption[] {
  return records.map((record) => ({
    doctor: getPatientRecordValue(record, "Duty Doctor") || "Duty doctor not assigned",
    id: record.id,
    name: patientName(record),
    phone: getPatientRecordValue(record, "Mobile Number") || getPatientRecordValue(record, "Contact Number") || "Phone not recorded",
    record,
    uhid: patientIdentifier(record),
  }));
}

function filterLookupOptions(options: PatientLookupOption[], query: string) {
  const searchText = query.trim().toLowerCase();
  const searchId = normalizeSearchValue(query);
  const searchDigits = query.replace(/\D/g, "");
  if (!searchText && !searchId) return [];

  return options.filter((option) => {
    const normalizedUhid = normalizeSearchValue(option.uhid);
    const phoneDigits = option.phone.replace(/\D/g, "");
    return (
      normalizedUhid.includes(searchId) ||
      normalizedUhid.endsWith(searchId) ||
      option.name.toLowerCase().includes(searchText) ||
      Boolean(searchDigits && phoneDigits.includes(searchDigits))
    );
  }).slice(0, 6);
}

export function ErNurseUhidLookupInput({ onSelectRecord, records, selectedRecordId, selectedUhid }: ErNurseUhidLookupInputProps) {
  const [query, setQuery] = React.useState(selectedUhid);
  const [open, setOpen] = React.useState(false);
  const options = React.useMemo(() => patientLookupOptions(records), [records]);
  const filteredOptions = React.useMemo(() => filterLookupOptions(options, query), [options, query]);

  React.useEffect(() => {
    setQuery(selectedUhid);
  }, [selectedUhid]);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setOpen(document.activeElement === event.currentTarget && nextQuery.trim().length > 0);
  }

  function selectRecord(option: PatientLookupOption) {
    setQuery(option.uhid);
    setOpen(false);
    onSelectRecord(option.record);
  }

  return (
    <div className="relative">
      <Input
        autoComplete="off"
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={handleInputChange}
        onFocus={() => setOpen(query.trim().length > 0)}
        placeholder="Search UHID"
        value={query}
      />
      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-border bg-surface shadow-lg">
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                className={`flex w-full items-start gap-2 border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-surface-muted ${selectedRecordId === option.id ? "bg-primary/5" : ""}`}
                key={option.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectRecord(option)}
                type="button"
              >
                <Search className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{option.uhid}</span>
                  <span className="block truncate text-xs text-muted-foreground">{option.name} | {option.phone} | {option.doctor}</span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground">No patient found for this UHID.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
