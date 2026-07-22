"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, FilePlus2, FileSpreadsheet, Printer, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  getPatientRecordValue,
  readPatientRecords,
  type PatientRecord,
} from "@/features/roles/receptionist/patient-details/receptionist-patient-records";

type ReceptionistDashboardRow = {
  contactNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  gender: string;
  id: string;
  name: string;
  patientId: string;
  registrationDate: string;
  registrationTimestamp: number | null;
};

function parseRegistrationDate(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const slashMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(trimmedValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toStartOfDayTimestamp(value: string) {
  const date = parseRegistrationDate(value);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function toIsoDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string) {
  const date = parseRegistrationDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function combinePhone(countryCode: string, number: string) {
  if (!number) return "Not recorded";
  return [countryCode, number].filter(Boolean).join(" ").trim();
}

function getRecordValue(record: PatientRecord, label: string) {
  return getPatientRecordValue(record, label).trim();
}

function getRegistrationDate(record: PatientRecord) {
  return getRecordValue(record, "Registration Date") || getRecordValue(record, "Date on which Patient arrives");
}

function getPatientName(record: PatientRecord) {
  const fullName = getRecordValue(record, "Patient Name");
  const splitName = [
    getRecordValue(record, "First Name"),
    getRecordValue(record, "Middle Name"),
    getRecordValue(record, "Last Name"),
  ]
    .filter(Boolean)
    .join(" ");
  return fullName || splitName || "Unnamed Patient";
}

function hasMeaningfulPatientData(row: ReceptionistDashboardRow) {
  return Boolean(
    row.patientId !== row.id ||
      row.name !== "Unnamed Patient" ||
      row.gender !== "Not recorded" ||
      row.contactNumber !== "Not recorded" ||
      row.emergencyContactName !== "Not recorded" ||
      row.emergencyContactNumber !== "Not recorded",
  );
}

function mapRecordToRow(record: PatientRecord): ReceptionistDashboardRow {
  const registrationDate = getRegistrationDate(record);
  const emergencyContactNumber = combinePhone(
    getRecordValue(record, "Contact Country Code"),
    getRecordValue(record, "Contact Number"),
  );

  return {
    contactNumber: combinePhone(getRecordValue(record, "Mobile Country Code"), getRecordValue(record, "Mobile Number")),
    emergencyContactName: getRecordValue(record, "Contact Name") || "Not recorded",
    emergencyContactNumber,
    gender: getRecordValue(record, "Gender") || "Not recorded",
    id: record.id,
    name: getPatientName(record),
    patientId: getRecordValue(record, "Patient ID / UHID") || record.id,
    registrationDate: registrationDate || "Not recorded",
    registrationTimestamp: registrationDate ? toStartOfDayTimestamp(registrationDate) : null,
  };
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export function ReceptionistDashboardPage() {
  const router = useRouter();
  const [records, setRecords] = React.useState<PatientRecord[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const hasDateFilter = Boolean(dateFrom || dateTo);

  React.useEffect(() => {
    setRecords(readPatientRecords());
  }, []);

  const patientRows = React.useMemo(
    () => records.map(mapRecordToRow).filter(hasMeaningfulPatientData),
    [records],
  );

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const fromTimestamp = dateFrom ? toStartOfDayTimestamp(dateFrom) : null;
    const toTimestamp = dateTo ? toStartOfDayTimestamp(dateTo) : null;

    return patientRows.filter((row) => {
      const matchesSearch =
        !normalizedQuery ||
        row.patientId.toLowerCase().includes(normalizedQuery) ||
        row.name.toLowerCase().includes(normalizedQuery);
      const matchesFrom = fromTimestamp === null || (row.registrationTimestamp !== null && row.registrationTimestamp >= fromTimestamp);
      const matchesTo = toTimestamp === null || (row.registrationTimestamp !== null && row.registrationTimestamp <= toTimestamp);
      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [dateFrom, dateTo, patientRows, searchQuery]);

  function clearFilters() {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  }

  function exportExcel() {
    const headers = [
      "Patient ID / UHID",
      "Registration Date",
      "Name",
      "Gender",
      "Contact Number",
      "Emergency Contact Name",
      "Emergency Contact Number",
    ];
    const rows = filteredRows.map((row) => [
      row.patientId,
      row.registrationDate,
      row.name,
      row.gender,
      row.contactNumber,
      row.emergencyContactName,
      row.emergencyContactNumber,
    ]);
    const csv = [headers, ...rows].map((rowValues) => rowValues.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "receptionist-patient-registry.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3 py-4">
      <Card className="rounded-md border-slate-200 shadow-sm">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="grid min-w-0 flex-1 gap-3 xl:grid-cols-[minmax(18rem,520px)_minmax(22rem,420px)_auto]">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600">Search Patient ID / Name</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    aria-label="Search patient"
                    className="h-10 rounded-md border-slate-200 bg-white pl-9 text-sm font-medium shadow-none"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search patient ID or name..."
                    value={searchQuery}
                  />
                </div>
              </label>
              <RegistrationDateRangePicker
                fromDate={dateFrom}
                onChange={(nextFrom, nextTo) => {
                  setDateFrom(nextFrom);
                  setDateTo(nextTo);
                }}
                toDate={dateTo}
              />
              <div className="flex items-end">
                <Button className="h-10 w-full border-slate-200 px-3" onClick={clearFilters} size="sm" type="button" variant="outline">
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 whitespace-nowrap text-xs font-semibold text-slate-600">
                {filteredRows.length} patient{filteredRows.length === 1 ? "" : "s"} found
              </div>
              <Button className="h-9 border-slate-200 shadow-none" disabled={!filteredRows.length} onClick={exportExcel} size="sm" type="button" variant="outline">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button className="h-9 border-slate-200 shadow-none" onClick={() => window.print()} size="sm" type="button" variant="outline">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button className="h-9 shadow-none" onClick={() => router.push("/receptionist/patient-details")} size="sm" type="button">
                <FilePlus2 className="h-4 w-4" />
                New Patient
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-md border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-base font-extrabold text-slate-900">Receptionist Dashboard</h1>
                <p className="mt-0.5 text-xs font-medium text-slate-500">Patient registration worklist</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <CalendarDays className="h-4 w-4 text-primary" />
                {hasDateFilter ? "Registration Date Filter Active" : "All Registration Dates"}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border-b border-r border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Patient ID / UHID</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Registration Date</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Name</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Gender</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Contact Number</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Emergency Contact Name</th>
                  <th className="border-b border-slate-200 px-4 py-3 text-xs font-extrabold uppercase text-slate-600">Emergency Contact Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.length ? (
                  filteredRows.map((row) => (
                    <tr className="transition hover:bg-slate-50" key={row.id}>
                      <td className="border-r border-slate-200 px-4 py-4">
                        <button
                          className="text-left text-sm font-extrabold text-primary transition hover:text-primary/80"
                          onClick={() => router.push(`/receptionist/patient-details?edit=${row.id}`)}
                          type="button"
                        >
                          {row.patientId}
                        </button>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{row.registrationDate}</td>
                      <td className="px-4 py-4 font-extrabold text-slate-900">{row.name}</td>
                      <td className="px-4 py-4 font-medium text-slate-600">{row.gender}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{row.contactNumber}</td>
                      <td className="px-4 py-4 font-medium text-slate-600">{row.emergencyContactName}</td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{row.emergencyContactNumber}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-12 text-center text-sm font-semibold text-slate-500" colSpan={7}>
                      No patient records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RegistrationDateRangePicker({
  fromDate,
  onChange,
  toDate,
}: {
  fromDate: string;
  onChange: (fromDate: string, toDate: string) => void;
  toDate: string;
}) {
  const selectedStart = fromDate ? parseRegistrationDate(fromDate) : null;
  const selectedEnd = toDate ? parseRegistrationDate(toDate) : null;
  const initialMonth = selectedStart ?? selectedEnd ?? new Date();
  const [visibleMonth, setVisibleMonth] = React.useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [selectingEnd, setSelectingEnd] = React.useState(Boolean(fromDate && !toDate));
  const label = fromDate || toDate
    ? `${fromDate ? formatDisplayDate(fromDate) : "Start Date"} - ${toDate ? formatDisplayDate(toDate) : "End Date"}`
    : "Select start and end date";

  React.useEffect(() => {
    const nextMonth = parseRegistrationDate(fromDate) ?? parseRegistrationDate(toDate);
    if (!nextMonth) return;
    setVisibleMonth((current) => {
      if (current.getFullYear() === nextMonth.getFullYear() && current.getMonth() === nextMonth.getMonth()) {
        return current;
      }
      return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1);
    });
  }, [fromDate, toDate]);

  function selectDate(date: Date) {
    const nextDate = toIsoDateValue(date);

    if (!fromDate || (fromDate && toDate) || !selectingEnd) {
      onChange(nextDate, "");
      setSelectingEnd(true);
      return;
    }

    const startTimestamp = toStartOfDayTimestamp(fromDate);
    const nextTimestamp = toStartOfDayTimestamp(nextDate);
    if (startTimestamp !== null && nextTimestamp !== null && nextTimestamp < startTimestamp) {
      onChange(nextDate, fromDate);
    } else {
      onChange(fromDate, nextDate);
    }
    setSelectingEnd(false);
  }

  function clearDateRange() {
    onChange("", "");
    setSelectingEnd(false);
  }

  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - calendarStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
  const monthLabel = visibleMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const fromTimestamp = fromDate ? toStartOfDayTimestamp(fromDate) : null;
  const toTimestamp = toDate ? toStartOfDayTimestamp(toDate) : null;

  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">Registration Date</span>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-none transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            type="button"
          >
            <span className="min-w-0 truncate">{label}</span>
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start" className="z-[80] w-[min(92vw,360px)] rounded-md border border-slate-200 bg-white p-3 shadow-xl" sideOffset={6}>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-extrabold uppercase text-slate-500">From</div>
                <div className="mt-0.5 min-h-5 text-sm font-bold text-slate-900">{fromDate ? formatDisplayDate(fromDate) : "Start Date"}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[10px] font-extrabold uppercase text-slate-500">To</div>
                <div className="mt-0.5 min-h-5 text-sm font-bold text-slate-900">{toDate ? formatDisplayDate(toDate) : "End Date"}</div>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <Button className="h-8 w-8 rounded-md p-0" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} type="button" variant="ghost">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-extrabold text-slate-900">{monthLabel}</div>
              <Button className="h-8 w-8 rounded-md p-0" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} type="button" variant="ghost">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold uppercase text-slate-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <div key={day}>{day}</div>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.map((date) => {
                const key = toIsoDateValue(date);
                const timestamp = toStartOfDayTimestamp(key);
                const currentMonth = date.getMonth() === visibleMonth.getMonth();
                const selected = key === fromDate || key === toDate;
                const inRange =
                  timestamp !== null &&
                  fromTimestamp !== null &&
                  toTimestamp !== null &&
                  timestamp > fromTimestamp &&
                  timestamp < toTimestamp;
                return (
                  <button
                    className={[
                      "h-8 rounded-md text-xs font-bold transition",
                      currentMonth ? "text-slate-700" : "text-slate-300",
                      inRange ? "bg-primary-soft text-primary" : "",
                      selected ? "bg-primary text-white shadow-sm hover:bg-primary/90" : "hover:bg-slate-100",
                    ].join(" ")}
                    key={key}
                    onClick={() => selectDate(date)}
                    type="button"
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <Button className="h-9" onClick={clearDateRange} type="button" variant="outline">
                Clear
              </Button>
              <Popover.Close asChild>
                <Button className="h-9" type="button">Done</Button>
              </Popover.Close>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </label>
  );
}
