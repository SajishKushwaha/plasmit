"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getPatientRecordValue,
  readPatientRecords,
  type PatientRecord,
} from "@/features/roles/receptionist/patient-details/receptionist-patient-records";

type ErDashboardRow = {
  id: string;
  patientName: string;
  erBed: string;
  uhid: string;
  arrivalDate: string;
  arrivalTime: string;
  source: string;
  department: string;
  erPhysician: string;
  nurse: string;
  shiftDue: string;
  status: "Critical" | "Urgent" | "Stable";
};

const fallbackRows: ErDashboardRow[] = [
  {
    id: "er-demo-aisha",
    patientName: "Aisha Khan",
    erBed: "ER-01",
    uhid: "UHID-94346597930",
    arrivalDate: "22/07/2026",
    arrivalTime: "08:30 AM",
    source: "From OPD",
    department: "Emergency Medicine",
    erPhysician: "Dr. Mehta",
    nurse: "Nurse Priya",
    shiftDue: "Initial assessment due",
    status: "Critical",
  },
  {
    id: "er-demo-ravi",
    patientName: "Ravi Menon",
    erBed: "ER-02",
    uhid: "UHID-82944",
    arrivalDate: "22/07/2026",
    arrivalTime: "09:10 AM",
    source: "Referral",
    department: "Medicine",
    erPhysician: "Dr. Rao",
    nurse: "Nurse Kavita",
    shiftDue: "Vitals review due",
    status: "Urgent",
  },
  {
    id: "er-demo-meera",
    patientName: "Meera Sharma",
    erBed: "ER-03",
    uhid: "UHID-53109",
    arrivalDate: "22/07/2026",
    arrivalTime: "09:25 AM",
    source: "Other",
    department: "Emergency Medicine",
    erPhysician: "Dr. Kapoor",
    nurse: "Nurse Priya",
    shiftDue: "Triage completed",
    status: "Stable",
  },
];

function field(record: PatientRecord, labels: string[]) {
  for (const label of labels) {
    const value = getPatientRecordValue(record, label);
    if (value) return value;
  }
  return "";
}

function buildRows(records: PatientRecord[]) {
  const namedRecords = records.filter((record) => {
    const firstName = field(record, ["First Name"]);
    const lastName = field(record, ["Last Name"]);
    const patientName = field(record, ["Patient Name"]) || [firstName, lastName].filter(Boolean).join(" ");
    return patientName.trim().length > 0;
  });

  const rows = namedRecords.map((record, index): ErDashboardRow => {
    const firstName = field(record, ["First Name"]);
    const lastName = field(record, ["Last Name"]);
    const patientName = field(record, ["Patient Name"]) || [firstName, lastName].filter(Boolean).join(" ") || "Unnamed Patient";
    const uhid = field(record, ["UHID", "Patient ID / UHID"]) || `UHID-${record.id.slice(-5)}`;
    const updatedAt = new Date(record.updatedAt);
    const validUpdatedAt = Number.isNaN(updatedAt.getTime()) ? null : updatedAt;
    const sourceOptions = ["From OPD", "IPD", "Referral", "Other"];
    const statusOptions: ErDashboardRow["status"][] = ["Critical", "Urgent", "Stable"];

    return {
      id: record.id,
      patientName,
      erBed: `ER-${String(index + 1).padStart(2, "0")}`,
      uhid,
      arrivalDate: field(record, ["Date & Time of Arrival", "Registration Date"]) || "Not recorded",
      arrivalTime: validUpdatedAt
        ? validUpdatedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : "--:--",
      source: field(record, ["OPD / ER Routing Decision"]) || sourceOptions[index % sourceOptions.length],
      department: index % 3 === 1 ? "Medicine" : "Emergency Medicine",
      erPhysician: field(record, ["Duty Doctor"]) || "Duty doctor not assigned",
      nurse: field(record, ["ER Nurse Assigned"]) || "ER nurse not assigned",
      shiftDue: index % 2 === 0 ? "Triage due" : "Shift follow-up due",
      status: statusOptions[index % statusOptions.length],
    };
  });

  return rows.length > 0 ? rows : fallbackRows;
}

const statusClasses: Record<ErDashboardRow["status"], string> = {
  Critical: "border-red-500 bg-red-50 text-red-700",
  Urgent: "border-orange-500 bg-orange-50 text-orange-700",
  Stable: "border-emerald-500 bg-emerald-50 text-emerald-700",
};

const patientNameClasses: Record<ErDashboardRow["status"], string> = {
  Critical: "text-red-700",
  Urgent: "text-orange-600",
  Stable: "text-emerald-700",
};

const statusBorderClasses: Record<ErDashboardRow["status"], string> = {
  Critical: "border-l-red-500",
  Urgent: "border-l-orange-500",
  Stable: "border-l-emerald-500",
};

export function ErDashboardPage() {
  const router = useRouter();
  const [rows, setRows] = React.useState<ErDashboardRow[]>(fallbackRows);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setRows(buildRows(readPatientRecords()));
  }, []);

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return rows;
    return rows.filter((row) =>
      [
        row.patientName,
        row.erBed,
        row.uhid,
        row.arrivalDate,
        row.arrivalTime,
        row.source,
        row.department,
        row.erPhysician,
        row.nurse,
        row.status,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, rows]);

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-[520px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search patient, UHID, bed, source..."
            className="h-11 rounded-xl bg-white pl-10 text-base font-semibold shadow-sm"
            />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-slate-600">{filteredRows.length} patients found</div>
          <Button onClick={() => router.push("/receptionist/patient-details")} className="h-10 rounded-xl">
            New Patient
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse text-left text-xs">
            <thead>
              <tr className="h-14 border-b border-slate-200 bg-white text-slate-900">
                <HeaderCell className="sticky left-0 z-30 w-[190px] min-w-[190px] border-r border-slate-200 bg-white text-left shadow-[8px_0_14px_rgba(15,23,42,0.04)]">
                  Patient / ER Bed
                </HeaderCell>
                <HeaderCell>UHID</HeaderCell>
                <HeaderCell>Arrival<br />Date & Time</HeaderCell>
                <HeaderCell>From</HeaderCell>
                <HeaderCell>Dept / Emergency<br />Medicine</HeaderCell>
                <HeaderCell>ER Physician</HeaderCell>
                <HeaderCell>Nurse</HeaderCell>
                <HeaderCell>Shift Due</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Action</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="h-[72px] border-b border-slate-100 bg-white transition hover:bg-slate-50">
                  <td
                    className={cn(
                      "sticky left-0 z-20 border-l-4 border-r border-slate-200 bg-white px-4 py-3 align-middle shadow-[8px_0_14px_rgba(15,23,42,0.04)]",
                      statusBorderClasses[row.status],
                    )}
                  >
                    <div className={cn("text-sm font-extrabold leading-tight", patientNameClasses[row.status])}>{row.patientName}</div>
                    <div className="mt-1 text-xs font-extrabold text-slate-700">{row.erBed}</div>
                  </td>
                  <td className="px-3 py-3 text-center align-middle text-sm font-extrabold text-slate-700">
                    {row.uhid}
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <div className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-700">
                      <CalendarClock className="h-4 w-4 text-slate-400" />
                      {row.arrivalDate}
                    </div>
                    <div className="text-xs font-bold text-slate-500">{row.arrivalTime}</div>
                  </td>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.department}</TableCell>
                  <TableCell>{row.erPhysician}</TableCell>
                  <TableCell>{row.nurse}</TableCell>
                  <td className="px-3 py-3 text-center align-middle">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
                      {row.shiftDue}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-bold", statusClasses[row.status])}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center align-middle">
                    <Button
                      variant="outline"
                      className="h-8 rounded-full px-4 text-xs font-extrabold"
                      onClick={() => router.push(`/receptionist/patient-details?record=${encodeURIComponent(row.id)}`)}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
              {!filteredRows.length ? (
                <tr>
                  <td className="px-4 py-12 text-center text-sm font-semibold text-slate-500" colSpan={10}>
                    No ER patient matched this search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function HeaderCell({ className, children }: { className?: string; children: React.ReactNode }) {
  return <th className={cn("px-3 py-3 text-center align-middle text-xs font-extrabold text-slate-900", className)}>{children}</th>;
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-3 py-3 text-center align-middle text-sm font-bold text-slate-700">{children}</td>;
}
