"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NativeSelect } from "@/features/operations/admin/admin-shared";
import {
  MobileCommandCard,
  MobileCommandCardRow,
  useIcuCommandCenterPatientsSurface,
} from "@/features/care-team/icu-command-center/patients/icu-patients-surface";
import { cn } from "@/lib/utils";
import { icuPatients, icuTasks } from "@/features/care-team/nursing-icu/nursing-icu-data";

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone: "info" | "warning" | "danger" | "success" | "critical";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : tone === "warning"
        ? "border-orange-200 bg-orange-50 text-orange-800"
        : tone === "danger" || tone === "critical"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-sky-200 bg-sky-50 text-sky-800";

  return (
    <div className={cn("min-w-36 shrink-0 rounded-2xl border px-4 py-3 shadow-sm", toneClass)}>
      <div className="text-[11px] font-black uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function CollapsibleCommandPanel({
  children,
  summary,
  title,
}: {
  children: React.ReactNode;
  summary: string;
  title: string;
}) {
  const panelId = React.useId();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
      <input className="peer sr-only" defaultChecked id={panelId} type="checkbox" />
      <label
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition duration-150 hover:bg-sky-50 peer-checked:[&_svg]:rotate-180"
        htmlFor={panelId}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-950">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{summary}</span>
        </span>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-600 shadow-sm">
          <svg
            className="h-4 w-4 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </label>
      <div className="border-t border-slate-100 peer-checked:block">{children}</div>
    </div>
  );
}

function toneForStatus(status: string) {
  const lower = status.toLowerCase();
  if (
    lower.includes("available") ||
    lower.includes("healthy") ||
    lower.includes("ready") ||
    lower.includes("balanced")
  )
    return "success";
  if (lower.includes("busy") || lower.includes("limited") || lower.includes("low"))
    return "warning";
  if (lower.includes("critical") || lower.includes("over")) return "danger";
  return "info";
}

function statusPillTone(status: string) {
  const tone = toneForStatus(status);
  return tone === "success"
    ? "success"
    : tone === "warning"
      ? "warning"
      : tone === "danger"
        ? "critical"
        : "info";
}

function computeUnitRows() {
  const units = Array.from(new Set(icuPatients.map((patient) => patient.unit))).sort();
  return units.map((unit) => {
    const patients = icuPatients.filter((patient) => patient.unit === unit);
    const occupiedBeds = patients.length;
    const totalBeds = Math.max(
      occupiedBeds + (unit.includes("General") ? 4 : unit.includes("Medical") ? 3 : 2),
      occupiedBeds + 1,
    );
    const availableBeds = Math.max(totalBeds - occupiedBeds, 0);
    const isolationBeds = Math.max(1, Math.floor(totalBeds / 8));
    const ventilatorBeds = Math.max(1, Math.floor(totalBeds / 4));
    const occupancy = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const status =
      occupancy >= 90
        ? "Over Capacity"
        : occupancy >= 75
          ? "Critical"
          : occupancy >= 60
            ? "Busy"
            : "Healthy";
    return {
      unit,
      totalBeds,
      occupiedBeds,
      availableBeds,
      isolationBeds,
      ventilatorBeds,
      occupancy,
      status,
    };
  });
}

function computeNurseRows() {
  const nurseCounts = new Map<string, number>();
  icuPatients.forEach((patient) => {
    nurseCounts.set(
      patient.assignedWardNurse,
      (nurseCounts.get(patient.assignedWardNurse) ?? 0) + 1,
    );
  });

  const nurseNames = Array.from(nurseCounts.keys()).sort();
  return nurseNames.map((name, index) => {
    const assignedPatients = nurseCounts.get(name) ?? 0;
    const maxCapacity = index % 3 === 0 ? 3 : 4;
    const shift = index % 2 === 0 ? "Day" : "Night";
    const icuExperience =
      index % 4 === 0 ? "5+ years" : index % 3 === 0 ? "3-5 years" : "1-3 years";
    const availability =
      assignedPatients === 0
        ? "Available"
        : assignedPatients < maxCapacity
          ? "Balanced"
          : assignedPatients === maxCapacity
            ? "Busy"
            : "Overloaded";
    const workload = `${assignedPatients}/${maxCapacity}`;
    return {
      name,
      employeeId: `EMP-${2400 + index}`,
      shift,
      assignedPatients,
      maxCapacity,
      icuExperience,
      availability,
      workload,
    };
  });
}

function computeEquipmentRows() {
  const runningTasks = icuTasks.filter(
    (task) => task.status === "In progress" || task.status === "Assigned",
  ).length;
  return [
    { equipment: "Ventilator", totalUnits: 18, inUse: 14, available: 4 },
    { equipment: "Patient Monitor", totalUnits: 24, inUse: 19, available: 5 },
    { equipment: "Infusion Pump", totalUnits: 42, inUse: 31, available: 11 },
    { equipment: "Suction Unit", totalUnits: 16, inUse: 10, available: 6 },
    {
      equipment: "Oxygen Cylinder",
      totalUnits: 20,
      inUse: 13 + Math.min(2, runningTasks),
      available: 20 - (13 + Math.min(2, runningTasks)),
    },
  ].map((row) => {
    const status = row.available <= 2 ? "Critical" : row.available <= 5 ? "Low Stock" : "Ready";
    return { ...row, status };
  });
}

function FilterRow({
  search,
  setSearch,
  unit,
  setUnit,
  shift,
  setShift,
  status,
  setStatus,
  onReset,
  unitOptions,
}: {
  search: string;
  setSearch: (_value: string) => void;
  unit: string;
  setUnit: (_value: string) => void;
  shift: string;
  setShift: (_value: string) => void;
  status: string;
  setStatus: (_value: string) => void;
  onReset: () => void;
  unitOptions: string[];
}) {
  return (
    <div className="grid gap-3 bg-slate-50 px-3 py-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_180px_110px] lg:items-end">
      <label className="space-y-1 text-sm">
        <span className="block text-xs font-semibold text-slate-700">
          Search ICU unit / nurse / equipment
        </span>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-10 border-slate-300 bg-white pl-9 text-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search ICU unit / nurse / equipment"
          />
        </div>
      </label>
      <NativeSelect label="ICU Unit" value={unit} onChange={setUnit} options={unitOptions} />
      <NativeSelect
        label="Shift"
        value={shift}
        onChange={setShift}
        options={["All shifts", "Day", "Night"]}
      />
      <NativeSelect
        label="Status"
        value={status}
        onChange={setStatus}
        options={[
          "All status",
          "Available",
          "Healthy",
          "Busy",
          "Critical",
          "Limited",
          "Low Stock",
          "Over Capacity",
        ]}
      />
      <Button className="h-10" variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}

export function UnitStaffAvailabilityPage() {
  const patientsSurface = useIcuCommandCenterPatientsSurface();
  const [search, setSearch] = React.useState("");
  const [unit, setUnit] = React.useState("All units");
  const [shift, setShift] = React.useState("All shifts");
  const [status, setStatus] = React.useState("All status");
  const [tab, setTab] = React.useState("units");

  const unitRows = React.useMemo(() => computeUnitRows(), []);
  const nurseRows = React.useMemo(() => computeNurseRows(), []);
  const equipmentRows = React.useMemo(() => computeEquipmentRows(), []);
  const _unitOptions = React.useMemo(
    () => ["All units", ...unitRows.map((row) => row.unit)],
    [unitRows],
  );

  const _summary = React.useMemo(
    () => ({
      icuBedsAvailable: unitRows.reduce((sum, row) => sum + row.availableBeds, 0),
      occupiedBeds: unitRows.reduce((sum, row) => sum + row.occupiedBeds, 0),
      unitNursesAvailable: nurseRows.filter(
        (row) => row.availability === "Available" || row.availability === "Balanced",
      ).length,
      wardNursesAvailable:
        Math.max(
          icuPatients.length - nurseRows.reduce((sum, row) => sum + row.assignedPatients, 0),
          0,
        ) + 12,
      isolationBeds: unitRows.reduce((sum, row) => sum + row.isolationBeds, 0),
      nurseRatio: unitRows.length
        ? `1:${Math.max(2, Math.round(unitRows.reduce((sum, row) => sum + row.occupiedBeds, 0) / unitRows.length))}`
        : "1:2",
      workload: nurseRows.some((row) => row.availability === "Overloaded")
        ? "Heavy"
        : nurseRows.some((row) => row.availability === "Busy")
          ? "Moderate"
          : "Balanced",
    }),
    [nurseRows, unitRows],
  );

  const query = search.trim().toLowerCase();
  const filteredUnitRows = unitRows.filter(
    (row) =>
      (!query || row.unit.toLowerCase().includes(query)) &&
      (unit === "All units" || row.unit === unit) &&
      (status === "All status" ||
        row.status === status ||
        (status === "Available" && row.status === "Healthy")),
  );
  const filteredNurseRows = nurseRows.filter(
    (row) =>
      (!query ||
        `${row.name} ${row.employeeId} ${row.shift} ${row.availability} ${row.workload}`
          .toLowerCase()
          .includes(query)) &&
      (shift === "All shifts" || row.shift === shift) &&
      (status === "All status" ||
        row.availability === status ||
        (status === "Available" && row.availability === "Available")),
  );
  const filteredEquipmentRows = equipmentRows.filter(
    (row) =>
      (!query || `${row.equipment} ${row.status}`.toLowerCase().includes(query)) &&
      (status === "All status" ||
        row.status === status ||
        (status === "Available" && row.status === "Ready")),
  );

  const _reset = () => {
    setSearch("");
    setUnit("All units");
    setShift("All shifts");
    setStatus("All status");
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Tabs className="w-full" value={tab} onValueChange={setTab}>
            <TabsList className="flex h-auto w-full min-w-max gap-2 overflow-x-auto rounded-none border-b border-slate-200 bg-slate-50 p-2">
              <TabsTrigger
                className="rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700"
                value="units"
              >
                ICU Unit Availability
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700"
                value="nurses"
              >
                Unit Nurse Availability
              </TabsTrigger>
              <TabsTrigger
                className="rounded-lg px-4 py-2 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-sky-700"
                value="equipment"
              >
                Equipment Availability
              </TabsTrigger>
            </TabsList>

            <TabsContent className="m-0" value="units">
              {patientsSurface ? (
                <div className="space-y-3 p-3 md:hidden">
                  {filteredUnitRows.map((row) => (
                    <MobileCommandCard key={row.unit}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-950">{row.unit}</p>
                        <StatusPill tone={statusPillTone(row.status)}>{row.status}</StatusPill>
                      </div>
                      <div className="mt-2 space-y-0">
                        <MobileCommandCardRow label="Total beds" value={row.totalBeds} />
                        <MobileCommandCardRow label="Occupied" value={row.occupiedBeds} />
                        <MobileCommandCardRow label="Available" value={row.availableBeds} />
                        <MobileCommandCardRow label="Isolation" value={row.isolationBeds} />
                        <MobileCommandCardRow label="Ventilator" value={row.ventilatorBeds} />
                        <MobileCommandCardRow label="Occupancy" value={`${row.occupancy}%`} />
                      </div>
                    </MobileCommandCard>
                  ))}
                  {!filteredUnitRows.length ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No ICU unit matched the selected filters.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className={cn("overflow-x-auto", patientsSurface && "hidden md:block")}>
                <table className="w-full min-w-[1100px] border-collapse text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left">ICU Unit</th>
                      <th className="px-4 py-3 text-left">Total Beds</th>
                      <th className="px-4 py-3 text-left">Occupied Beds</th>
                      <th className="px-4 py-3 text-left">Available Beds</th>
                      <th className="px-4 py-3 text-left">Isolation Beds</th>
                      <th className="px-4 py-3 text-left">Ventilator Beds</th>
                      <th className="px-4 py-3 text-left">Bed Occupancy %</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUnitRows.map((row) => (
                      <tr className="align-middle hover:bg-sky-50/40" key={row.unit}>
                        <td className="px-4 py-4 font-semibold text-slate-950">{row.unit}</td>
                        <td className="px-4 py-4 text-slate-700">{row.totalBeds}</td>
                        <td className="px-4 py-4 text-slate-700">{row.occupiedBeds}</td>
                        <td className="px-4 py-4 text-slate-700">{row.availableBeds}</td>
                        <td className="px-4 py-4 text-slate-700">{row.isolationBeds}</td>
                        <td className="px-4 py-4 text-slate-700">{row.ventilatorBeds}</td>
                        <td className="px-4 py-4 text-slate-700">{row.occupancy}%</td>
                        <td className="px-4 py-4 text-center">
                          <StatusPill tone={statusPillTone(row.status)}>{row.status}</StatusPill>
                        </td>
                      </tr>
                    ))}
                    {!filteredUnitRows.length ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={8}>
                          No ICU unit matched the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent className="m-0" value="nurses">
              {patientsSurface ? (
                <div className="space-y-3 p-3 md:hidden">
                  {filteredNurseRows.map((row) => (
                    <MobileCommandCard key={row.employeeId}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-950">{row.name}</p>
                        <StatusPill tone={statusPillTone(row.availability)}>
                          {row.availability}
                        </StatusPill>
                      </div>
                      <div className="mt-2 space-y-0">
                        <MobileCommandCardRow label="Employee ID" value={row.employeeId} />
                        <MobileCommandCardRow label="Shift" value={row.shift} />
                        <MobileCommandCardRow
                          label="Assigned patients"
                          value={row.assignedPatients}
                        />
                        <MobileCommandCardRow label="Max capacity" value={row.maxCapacity} />
                        <MobileCommandCardRow label="ICU experience" value={row.icuExperience} />
                        <MobileCommandCardRow label="Workload" value={row.workload} />
                      </div>
                    </MobileCommandCard>
                  ))}
                  {!filteredNurseRows.length ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No nurse matched the selected filters.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className={cn("overflow-x-auto", patientsSurface && "hidden md:block")}>
                <table className="w-full min-w-[1150px] border-collapse text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left">Nurse Name</th>
                      <th className="px-4 py-3 text-left">Employee ID</th>
                      <th className="px-4 py-3 text-left">Shift</th>
                      <th className="px-4 py-3 text-left">Assigned Patients</th>
                      <th className="px-4 py-3 text-left">Maximum Capacity</th>
                      <th className="px-4 py-3 text-left">ICU Experience</th>
                      <th className="px-4 py-3 text-center">Availability</th>
                      <th className="px-4 py-3 text-left">Current Workload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredNurseRows.map((row) => (
                      <tr className="align-middle hover:bg-sky-50/40" key={row.employeeId}>
                        <td className="px-4 py-4 font-semibold text-slate-950">{row.name}</td>
                        <td className="px-4 py-4 text-slate-700">{row.employeeId}</td>
                        <td className="px-4 py-4 text-slate-700">{row.shift}</td>
                        <td className="px-4 py-4 text-slate-700">{row.assignedPatients}</td>
                        <td className="px-4 py-4 text-slate-700">{row.maxCapacity}</td>
                        <td className="px-4 py-4 text-slate-700">{row.icuExperience}</td>
                        <td className="px-4 py-4 text-center">
                          <StatusPill tone={statusPillTone(row.availability)}>
                            {row.availability}
                          </StatusPill>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{row.workload}</td>
                      </tr>
                    ))}
                    {!filteredNurseRows.length ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={8}>
                          No nurse matched the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent className="m-0" value="equipment">
              {patientsSurface ? (
                <div className="space-y-3 p-3 md:hidden">
                  {filteredEquipmentRows.map((row) => (
                    <MobileCommandCard key={row.equipment}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-950">{row.equipment}</p>
                        <StatusPill tone={statusPillTone(row.status)}>{row.status}</StatusPill>
                      </div>
                      <div className="mt-2 space-y-0">
                        <MobileCommandCardRow label="Total units" value={row.totalUnits} />
                        <MobileCommandCardRow label="In use" value={row.inUse} />
                        <MobileCommandCardRow label="Available" value={row.available} />
                      </div>
                    </MobileCommandCard>
                  ))}
                  {!filteredEquipmentRows.length ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No equipment matched the selected filters.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className={cn("overflow-x-auto", patientsSurface && "hidden md:block")}>
                <table className="w-full min-w-[800px] border-collapse text-sm">
                  <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left">Equipment</th>
                      <th className="px-4 py-3 text-left">Total Units</th>
                      <th className="px-4 py-3 text-left">In Use</th>
                      <th className="px-4 py-3 text-left">Available</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredEquipmentRows.map((row) => (
                      <tr className="align-middle hover:bg-sky-50/40" key={row.equipment}>
                        <td className="px-4 py-4 font-semibold text-slate-950">{row.equipment}</td>
                        <td className="px-4 py-4 text-slate-700">{row.totalUnits}</td>
                        <td className="px-4 py-4 text-slate-700">{row.inUse}</td>
                        <td className="px-4 py-4 text-slate-700">{row.available}</td>
                        <td className="px-4 py-4 text-center">
                          <StatusPill tone={statusPillTone(row.status)}>{row.status}</StatusPill>
                        </td>
                      </tr>
                    ))}
                    {!filteredEquipmentRows.length ? (
                      <tr>
                        <td className="px-4 py-12 text-center text-sm text-slate-500" colSpan={5}>
                          No equipment matched the selected filters.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
