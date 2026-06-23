"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Eye, FileText, FlaskConical, Image as ImageIcon, Printer, Search, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { resultRecords } from "@/features/results/data/mockResults";
import type { ResultDepartment, ResultRecord, ResultStatus, ResultValue } from "@/features/results/types";

type DepartmentFilter = ResultDepartment | "all";

export type ResultsPatientContext = {
  ageSex?: string;
  allergy?: string;
  bed?: string;
  bloodGroup?: string;
  dob?: string;
  gender?: string;
  name?: string;
  mrn?: string;
  consultantDoctor?: string;
  uhid?: string;
  wardBed?: string;
};

type ReportGroup = {
  dateKey: string;
  label: string;
  records: ResultRecord[];
};

type ReportModalState =
  | { type: "single"; result: ResultRecord }
  | { type: "all"; department: ResultDepartment; records: ResultRecord[] }
  | null;

type PrintPayload = {
  records: ResultRecord[];
  title: string;
};

const departments: Array<{ id: DepartmentFilter; label: string; icon: typeof FileText }> = [
  { id: "all", label: "All Results", icon: FileText },
  { id: "laboratory", label: "Laboratory", icon: FlaskConical },
  { id: "radiology", label: "Radiology", icon: ImageIcon },
  { id: "poct", label: "POCT", icon: Zap },
];

const departmentCards: Array<{ id: ResultDepartment; title: string; icon: typeof FileText }> = [
  { id: "laboratory", title: "Laboratory Reports", icon: FlaskConical },
  { id: "radiology", title: "Radiology Reports", icon: ImageIcon },
  { id: "poct", title: "POCT Reports", icon: Zap },
];

const statusTone: Record<ResultStatus, "success" | "warning" | "info" | "critical"> = {
  "Sample Collected": "info",
  Processing: "warning",
  "Verification Pending": "warning",
  Completed: "success",
  Critical: "critical",
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
});

function getDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value?: string) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

function dateValueParts(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const fallback = Number.isNaN(date.getTime()) ? new Date() : date;
  return { month: fallback.getMonth(), year: fallback.getFullYear() };
}

function matchesSearch(result: ResultRecord, query: string) {
  const search = query.trim().toLowerCase();
  if (!search) return true;

  return [result.testName, result.id, result.orderedAt, formatDate(result.orderedAt), formatDateTime(result.orderedAt), result.status]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(search));
}

function buildGroups(records: ResultRecord[]) {
  const grouped = records.reduce<Record<string, ResultRecord[]>>((items, result) => {
    const key = getDateKey(result.orderedAt);
    items[key] = [...(items[key] ?? []), result];
    return items;
  }, {});

  return Object.entries(grouped)
    .sort(([first], [second]) => second.localeCompare(first))
    .map(([dateKey, items]) => ({
      dateKey,
      label: dateFormatter.format(new Date(`${dateKey}T00:00:00`)),
      records: [...items].sort((first, second) => new Date(second.orderedAt).getTime() - new Date(first.orderedAt).getTime()),
    }));
}

function groupTotal(groups: ReportGroup[], department?: ResultDepartment) {
  return groups.reduce((total, group) => total + (department ? group.records.filter((result) => result.department === department).length : group.records.length), 0);
}

function getReportName(result: ResultRecord) {
  if (result.department === "laboratory") return "Laboratory Report";
  if (result.department === "radiology") return "Radiology Report";
  return "POCT Report";
}

function getReportColumnLabel(reports: ResultRecord[]) {
  const department = reports[0]?.department;
  if (department === "laboratory") return "Laboratory";
  if (department === "radiology") return "Radiology";
  if (department === "poct") return "POCT";
  return "Report Name";
}

function getDepartmentLabel(department: ResultDepartment) {
  if (department === "laboratory") return "Laboratory";
  if (department === "radiology") return "Radiology";
  return "POCT";
}

function resultValueClass(value: ResultValue) {
  if (value.flag === "Critical") return "font-bold text-danger";
  if (value.flag === "High") return "font-bold text-danger";
  if (value.flag === "Low") return "font-bold text-info";
  return "text-foreground";
}

function getPatientAgeGender(result: ResultRecord, patientContext?: ResultsPatientContext) {
  const ageSex = patientContext?.ageSex ?? result.ageSex;
  const [age, gender] = ageSex.split("/").map((part) => part.trim()).filter(Boolean);
  return {
    age: age?.replace(/y$/i, " years") ?? "-",
    gender: patientContext?.gender ?? gender ?? "-",
  };
}

function getSampleId(result: ResultRecord) {
  return `SMP-${result.id.replace(/[^0-9]/g, "").slice(-6)}`;
}

function groupRecordsByTestName(records: ResultRecord[]) {
  return records.reduce<Record<string, ResultRecord[]>>((groups, result) => {
    groups[result.testName] = [...(groups[result.testName] ?? []), result];
    return groups;
  }, {});
}

function matchesDateFilter(result: ResultRecord, selectedDate: string, rangeStart: string, rangeEnd: string) {
  const dateKey = getDateKey(result.orderedAt);
  if (selectedDate === "custom") {
    const afterStart = !rangeStart || dateKey >= rangeStart;
    const beforeEnd = !rangeEnd || dateKey <= rangeEnd;
    return afterStart && beforeEnd;
  }

  return selectedDate === "all" || dateKey === selectedDate;
}

function buildAdditionalPatientReports(records: ResultRecord[]) {
  const anchor = records[0];
  if (!anchor) return [];

  const base = {
    ageSex: anchor.ageSex,
    location: anchor.location,
    mrn: anchor.mrn,
    orderingDoctor: anchor.orderingDoctor,
    patientName: anchor.patientName,
    priority: "Routine" as const,
    reportAvailable: true,
    visitType: anchor.visitType,
  };

  return [
    {
      ...base,
      id: "RES-2026-1001-HBA1C",
      department: "laboratory" as const,
      testName: "HbA1c",
      orderedAt: "2026-05-23T13:10:00",
      collectedAt: "2026-05-23T13:22:00",
      completedAt: "2026-05-23T14:05:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "HbA1c 6.2%. Glycemic control requires routine follow-up.",
      specimen: "EDTA whole blood",
      values: [
        { name: "HbA1c", value: "6.2", unit: "%", range: "< 5.7", flag: "High" as const },
        { name: "Estimated Average Glucose", value: "131", unit: "mg/dL", range: "70 - 140", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "13:10", by: "ICU Desk" },
        { label: "Sample collected", at: "13:22", by: "Lab Technician" },
        { label: "Report verified", at: "14:05", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: "RES-2026-1001-LFT",
      department: "laboratory" as const,
      testName: "Liver Function Test",
      orderedAt: "2026-05-22T08:30:00",
      collectedAt: "2026-05-22T08:48:00",
      completedAt: "2026-05-22T09:40:00",
      status: "Completed" as const,
      priority: "Urgent" as const,
      imageAvailable: false,
      resultSummary: "Mildly elevated SGPT, bilirubin within reference range.",
      specimen: "Serum",
      values: [
        { name: "SGPT", value: "62", unit: "U/L", range: "7 - 56", flag: "High" as const },
        { name: "Bilirubin Total", value: "0.9", unit: "mg/dL", range: "0.1 - 1.2", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "08:30", by: "ICU Nurse" },
        { label: "Sample collected", at: "08:48", by: "Phlebotomy" },
        { label: "Report verified", at: "09:40", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: "RAD-2026-1001-CT",
      department: "radiology" as const,
      testName: "CT Brain Plain",
      orderedAt: "2026-05-22T12:15:00",
      completedAt: "2026-05-22T12:55:00",
      status: "Completed" as const,
      priority: "Urgent" as const,
      imageAvailable: true,
      accessionNo: "ACC-CT-240118",
      resultSummary: "No acute intracranial hemorrhage. Mild age-related cortical atrophy.",
      values: [
        { name: "Image status", value: "Available", flag: "Normal" as const },
        { name: "Finding flag", value: "Non-critical", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "12:15", by: "ICU Doctor" },
        { label: "Scan completed", at: "12:55", by: "CT Technician" },
        { label: "Report verified", at: "13:20", by: "Dr. Raghav Menon" },
      ],
    },
    {
      ...base,
      id: "RAD-2026-1001-USG",
      department: "radiology" as const,
      testName: "USG Abdomen",
      orderedAt: "2026-05-21T16:20:00",
      completedAt: "2026-05-21T16:58:00",
      status: "Completed" as const,
      imageAvailable: true,
      accessionNo: "ACC-USG-240118",
      resultSummary: "Mild fatty liver changes. No free fluid detected.",
      values: [
        { name: "Image status", value: "Available", flag: "Normal" as const },
        { name: "Report status", value: "Verified", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "16:20", by: "Ward Desk" },
        { label: "Scan completed", at: "16:58", by: "USG Technician" },
        { label: "Report verified", at: "17:22", by: "Dr. Raghav Menon" },
      ],
    },
    {
      ...base,
      id: "POCT-2026-1001-ABG",
      department: "poct" as const,
      testName: "Arterial Blood Gas",
      orderedAt: "2026-05-23T15:20:00",
      completedAt: "2026-05-23T15:24:00",
      status: "Completed" as const,
      priority: "Urgent" as const,
      imageAvailable: false,
      resultSummary: "pH 7.39, lactate 1.8 mmol/L. No critical abnormality.",
      specimen: "Arterial blood",
      values: [
        { name: "pH", value: "7.39", range: "7.35 - 7.45", flag: "Normal" as const },
        { name: "Lactate", value: "1.8", unit: "mmol/L", range: "0.5 - 2.2", flag: "Normal" as const },
        { name: "Device QC", value: "Passed", flag: "Normal" as const },
      ],
      timeline: [
        { label: "POCT requested", at: "15:20", by: "ICU Nurse" },
        { label: "Result entered", at: "15:24", by: "ABG Analyzer" },
      ],
    },
    {
      ...base,
      id: "POCT-2026-1001-ECG",
      department: "poct" as const,
      testName: "Bedside ECG",
      orderedAt: "2026-05-21T10:05:00",
      completedAt: "2026-05-21T10:12:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "Sinus rhythm. No acute ST-T changes.",
      values: [
        { name: "Rhythm", value: "Sinus rhythm", flag: "Normal" as const },
        { name: "Device QC", value: "Passed", flag: "Normal" as const },
      ],
      timeline: [
        { label: "POCT requested", at: "10:05", by: "ICU Nurse" },
        { label: "Result entered", at: "10:12", by: "Bedside ECG Device" },
      ],
    },
  ] satisfies ResultRecord[];
}

function scopedPatientRecords(patientContext?: ResultsPatientContext) {
  if (!patientContext?.mrn && !patientContext?.name) return resultRecords;

  const normalizedName = patientContext.name?.trim().toLowerCase();
  const matches = resultRecords.filter((result) => {
    const matchesMrn = patientContext.mrn ? result.mrn === patientContext.mrn : false;
    const matchesName = normalizedName ? result.patientName.toLowerCase() === normalizedName : false;
    return matchesMrn || matchesName;
  });

  const scopedRecords = (matches.length ? matches : resultRecords.slice(0, 6)).map((result) => ({
    ...result,
    ageSex: patientContext.ageSex ?? result.ageSex,
    mrn: patientContext.uhid ?? patientContext.mrn ?? result.mrn,
    patientName: patientContext.name ?? result.patientName,
    location: patientContext.wardBed ?? result.location,
  }));

  return [...scopedRecords, ...buildAdditionalPatientReports(scopedRecords)];
}

function DateRangeCalendar({
  endDate,
  maxDate,
  minDate,
  onChange,
  onOpenChange,
  open,
  startDate,
}: {
  endDate: string;
  maxDate?: string;
  minDate?: string;
  onChange: (startDate: string, endDate: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  startDate: string;
}) {
  const initialDate = endDate || startDate || maxDate || new Date().toISOString().slice(0, 10);
  const initialParts = dateValueParts(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(initialParts.month);
  const [visibleYear, setVisibleYear] = useState(initialParts.year);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const firstDayOffset = new Date(visibleYear, visibleMonth, 1).getDay();
  const totalDays = new Date(visibleYear, visibleMonth + 1, 0).getDate();

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) onOpenChange(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [onOpenChange, open]);

  useEffect(() => {
    const next = dateValueParts(endDate || startDate || maxDate || initialDate);
    setVisibleMonth(next.month);
    setVisibleYear(next.year);
  }, [endDate, initialDate, maxDate, startDate]);

  function moveMonth(direction: -1 | 1) {
    const next = new Date(visibleYear, visibleMonth + direction, 1);
    setVisibleMonth(next.getMonth());
    setVisibleYear(next.getFullYear());
  }

  function selectDate(value: string) {
    if (!startDate || endDate) {
      onChange(value, "");
      return;
    }

    if (value < startDate) {
      onChange(value, startDate);
    } else {
      onChange(startDate, value);
    }
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,360px)] rounded-lg border border-border bg-white p-3 shadow-soft" ref={wrapperRef}>
      <div className="flex items-center justify-between gap-2">
        <Button aria-label="Previous month" onClick={() => moveMonth(-1)} size="icon" type="button" variant="ghost">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-semibold text-foreground">{monthNames[visibleMonth]} {visibleYear}</div>
        <Button aria-label="Next month" onClick={() => moveMonth(1)} size="icon" type="button" variant="ghost">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOffset }).map((_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {Array.from({ length: totalDays }).map((_, index) => {
          const day = index + 1;
          const value = `${visibleYear}-${String(visibleMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const disabled = Boolean((minDate && value < minDate) || (maxDate && value > maxDate));
          const boundary = value === startDate || value === endDate;
          const inRange = Boolean(startDate && endDate && value > startDate && value < endDate);

          return (
            <button
              className={cn(
                "h-8 rounded-md text-xs font-medium transition",
                !disabled && !boundary && !inRange && "hover:bg-surface-muted",
                inRange && "bg-primary/10 text-primary",
                boundary && "bg-primary text-white",
                disabled && "cursor-not-allowed text-muted-foreground/35",
              )}
              disabled={disabled}
              key={value}
              onClick={() => selectDate(value)}
              type="button"
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{startDate && !endDate ? "Select end date" : "Select start date, then end date"}</span>
        <Button
          onClick={() => {
            onChange("", "");
            onOpenChange(true);
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

export function ResultsWorkflowView({
  autoOpenAllDepartment,
  initialDepartment = "all",
  defaultDepartment = initialDepartment,
  criticalOnly = false,
  patientContext,
  viewTitle = "Results Center",
  viewDescription = "Laboratory, radiology, and POCT reports organized for IPD review.",
}: {
  autoOpenAllDepartment?: ResultDepartment;
  initialDepartment?: DepartmentFilter;
  defaultDepartment?: DepartmentFilter;
  criticalOnly?: boolean;
  patientContext?: ResultsPatientContext;
  viewTitle?: string;
  viewDescription?: string;
}) {
  const [activeDepartment, setActiveDepartment] = useState<DepartmentFilter>(criticalOnly ? "all" : defaultDepartment);
  const [query, setQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("all");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeCalendarOpen, setRangeCalendarOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [reportModal, setReportModal] = useState<ReportModalState>(null);
  const [printPayload, setPrintPayload] = useState<PrintPayload | null>(null);
  const hasAutoOpenedAllDepartment = useRef(false);
  const dateFilterRef = useRef<HTMLDivElement | null>(null);

  const records = useMemo(() => scopedPatientRecords(patientContext), [patientContext]);
  const availableDates = useMemo(() => {
    const dateKeys = Array.from(new Set(records.filter((result) => !criticalOnly || result.status === "Critical").map((result) => getDateKey(result.orderedAt)))).sort((first, second) => second.localeCompare(first));
    return dateKeys.map((dateKey) => ({
      dateKey,
      label: dateFormatter.format(new Date(`${dateKey}T00:00:00`)),
    }));
  }, [criticalOnly, records]);
  const filteredRecords = useMemo(() => {
    return records.filter((result) => {
      const matchesDepartment = activeDepartment === "all" || result.department === activeDepartment;
      const matchesCritical = !criticalOnly || result.status === "Critical";
      const matchesDate = matchesDateFilter(result, selectedDate, rangeStart, rangeEnd);
      return matchesDepartment && matchesCritical && matchesDate && matchesSearch(result, query);
    });
  }, [activeDepartment, criticalOnly, query, rangeEnd, rangeStart, records, selectedDate]);
  const groups = useMemo(() => buildGroups(filteredRecords), [filteredRecords]);
  const counts = useMemo(
    () => ({
      all: records.filter((result) => (!criticalOnly || result.status === "Critical") && matchesDateFilter(result, selectedDate, rangeStart, rangeEnd)).length,
      laboratory: records.filter((result) => result.department === "laboratory" && (!criticalOnly || result.status === "Critical") && matchesDateFilter(result, selectedDate, rangeStart, rangeEnd)).length,
      radiology: records.filter((result) => result.department === "radiology" && (!criticalOnly || result.status === "Critical") && matchesDateFilter(result, selectedDate, rangeStart, rangeEnd)).length,
      poct: records.filter((result) => result.department === "poct" && (!criticalOnly || result.status === "Critical") && matchesDateFilter(result, selectedDate, rangeStart, rangeEnd)).length,
    }),
    [criticalOnly, rangeEnd, rangeStart, records, selectedDate],
  );
  const dateFilterLabel = useMemo(() => {
    if (selectedDate === "custom") {
      if (rangeStart && rangeEnd) return `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`;
      if (rangeStart) return `${formatDate(rangeStart)} - Select end`;
      return "Custom range";
    }

    if (selectedDate === "all") return "All dates";

    return availableDates.find((date) => date.dateKey === selectedDate)?.label ?? "All dates";
  }, [availableDates, rangeEnd, rangeStart, selectedDate]);

  useEffect(() => {
    if (!dateMenuOpen) return;

    function closeDateMenu(event: MouseEvent) {
      if (!dateFilterRef.current?.contains(event.target as Node)) setDateMenuOpen(false);
    }

    document.addEventListener("mousedown", closeDateMenu);
    return () => document.removeEventListener("mousedown", closeDateMenu);
  }, [dateMenuOpen]);

  useEffect(() => {
    if (!printPayload) return;

    const printTimer = window.setTimeout(() => window.print(), 120);
    const clearPrintPayload = () => setPrintPayload(null);
    window.addEventListener("afterprint", clearPrintPayload, { once: true });

    return () => {
      window.clearTimeout(printTimer);
      window.removeEventListener("afterprint", clearPrintPayload);
    };
  }, [printPayload]);

  useEffect(() => {
    if (!autoOpenAllDepartment || hasAutoOpenedAllDepartment.current) return;

    const departmentRecords = records.filter((result) => result.department === autoOpenAllDepartment && (!criticalOnly || result.status === "Critical"));
    setActiveDepartment(autoOpenAllDepartment);
    setReportModal({ type: "all", department: autoOpenAllDepartment, records: departmentRecords });
    hasAutoOpenedAllDepartment.current = true;
  }, [autoOpenAllDepartment, criticalOnly, records]);

  function printReports(recordsToPrint: ResultRecord[], title: string) {
    if (recordsToPrint.length === 0) return;
    setPrintPayload({ records: recordsToPrint, title });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-white shadow-sm">
       

        <div className="sticky top-[var(--app-header-offset,0px)] z-20 border-b border-border bg-white/95 p-3 backdrop-blur">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {departments.map((department) => {
                const Icon = department.icon;
                const active = activeDepartment === department.id;
                const count = counts[department.id];
                return (
                  <button
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-all duration-200",
                      active ? "border-primary bg-primary text-white shadow-sm" : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:bg-primary-soft hover:text-foreground",
                    )}
                    key={department.id}
                    onClick={() => setActiveDepartment(department.id)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {department.label}
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-surface-muted text-muted-foreground")}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[620px] xl:grid-cols-[minmax(260px,1fr)_260px]">
              <label className="relative min-w-0">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-10 pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search report name, report ID..." />
              </label>
              <div className="relative min-w-0" ref={dateFilterRef}>
                <button
                  className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm font-semibold text-foreground outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-ring/20"
                  onClick={() => {
                    setDateMenuOpen((current) => !current);
                    if (selectedDate === "custom") setRangeCalendarOpen(false);
                  }}
                  type="button"
                >
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{dateFilterLabel}</span>
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", dateMenuOpen && "rotate-180")} />
                </button>

                {dateMenuOpen ? (
                  <div className="absolute right-0 top-full z-40 mt-2 w-full min-w-[230px] overflow-hidden rounded-lg border border-border bg-white p-1 shadow-soft">
                    <button
                      className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-surface-muted", selectedDate === "all" && "bg-primary-soft text-primary")}
                      onClick={() => {
                        setSelectedDate("all");
                        setDateMenuOpen(false);
                        setRangeCalendarOpen(false);
                      }}
                      type="button"
                    >
                      All dates
                    </button>
                    <button
                      className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-surface-muted", selectedDate === "custom" && "bg-primary-soft text-primary")}
                      onClick={() => {
                        setSelectedDate("custom");
                        setDateMenuOpen(false);
                        setRangeCalendarOpen(true);
                      }}
                      type="button"
                    >
                      Custom range
                    </button>
                  {availableDates.map((date) => (
                      <button
                        className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-semibold transition hover:bg-surface-muted", selectedDate === date.dateKey && "bg-primary-soft text-primary")}
                        key={date.dateKey}
                        onClick={() => {
                          setSelectedDate(date.dateKey);
                          setDateMenuOpen(false);
                          setRangeCalendarOpen(false);
                        }}
                        type="button"
                      >
                        {date.label}
                      </button>
                  ))}
                  </div>
                ) : null}
                {selectedDate === "custom" ? (
                  <DateRangeCalendar
                    endDate={rangeEnd}
                    onChange={(start, end) => {
                      setRangeStart(start);
                      setRangeEnd(end);
                    }}
                    onOpenChange={setRangeCalendarOpen}
                    open={rangeCalendarOpen}
                    startDate={rangeStart}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-base font-semibold text-foreground">No reports found</div>
            <p className="mt-1 text-sm text-muted-foreground">Try a different report name, report ID, date, or tab.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group, index) => {
            const expanded = openGroups[group.dateKey] ?? index === 0;
            return (
              <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-200" key={group.dateKey}>
                <button
                  className="flex w-full items-center justify-between gap-3 border-b border-border bg-surface-muted/50 px-4 py-3 text-left transition hover:bg-surface-muted"
                  onClick={() => setOpenGroups((current) => ({ ...current, [group.dateKey]: !expanded }))}
                  type="button"
                >
                  <div>
                    <div className="text-base font-bold text-foreground">{group.label}</div>
                    <div className="text-xs text-muted-foreground">{group.records.length} report(s) in this date group</div>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} />
                </button>
                {expanded ? (
                  <div className="space-y-4 p-4 transition-all duration-200">
                    {(activeDepartment === "all" ? departmentCards : departmentCards.filter((card) => card.id === activeDepartment)).map((card) => {
                      const reports = group.records.filter((result) => result.department === card.id);
                      const allCategoryReports = filteredRecords.filter((result) => result.department === card.id);
                      return (
                        <ResultCategorySection
                          allReports={allCategoryReports}
                          icon={card.icon}
                          key={`${group.dateKey}-${card.id}`}
                          onAllView={(department, recordsToView) => setReportModal({ type: "all", department, records: recordsToView })}
                          onPrint={(result) => printReports([result], `${getDepartmentLabel(result.department)} Report`)}
                          onView={(result) => setReportModal({ type: "single", result })}
                          reports={reports}
                          title={card.title}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}

      <ReportViewModal payload={reportModal} onClose={() => setReportModal(null)} onPrint={(recordsToPrint, title) => printReports(recordsToPrint, title)} />
      <ReportPrintView patientContext={patientContext} payload={printPayload} />
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}

function ResultCategorySection({
  allReports,
  icon: Icon,
  onAllView,
  onPrint,
  onView,
  reports,
  title,
}: {
  allReports: ResultRecord[];
  icon: typeof FileText;
  onAllView: (department: ResultDepartment, records: ResultRecord[]) => void;
  onPrint: (result: ResultRecord) => void;
  onView: (result: ResultRecord) => void;
  reports: ResultRecord[];
  title: string;
}) {
  const department = allReports[0]?.department ?? reports[0]?.department;

  return (
    <Card className="overflow-hidden rounded-lg border-border shadow-none">
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
          <Button disabled={!department || allReports.length === 0} size="sm" variant="outline" onClick={() => department && onAllView(department, allReports)}>
            <Icon className="h-4 w-4" />
            All View
          </Button>
          <span className="text-xs font-semibold text-muted-foreground">{allReports.length} report(s)</span>
        </div>
        {reports.length === 0 ? (
          <div className="px-4 py-5 text-sm text-muted-foreground">No reports in this section.</div>
        ) : (
          <ResultTable reports={reports} onPrint={onPrint} onView={onView} />
        )}
      </CardContent>
    </Card>
  );
}

function ResultTable({ onPrint, onView, reports }: { onPrint: (result: ResultRecord) => void; onView: (result: ResultRecord) => void; reports: ResultRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{getReportColumnLabel(reports)}</th>
            <th className="w-[170px] px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((result) => (
            <tr className="border-t border-border transition-colors hover:bg-primary-soft/40" key={result.id}>
              <td className="px-4 py-3">
                <div className="font-semibold text-foreground">{result.testName}</div>
                <div className="text-xs text-muted-foreground">{result.priority} priority</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => onView(result)}>
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => onPrint(result)} aria-label={`Print ${result.testName}`}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportViewModal({
  onClose,
  onPrint,
  payload,
}: {
  onClose: () => void;
  onPrint: (records: ResultRecord[], title: string) => void;
  payload: ReportModalState;
}) {
  const title = payload?.type === "single" ? payload.result.testName : payload ? `All ${getDepartmentLabel(payload.department)} Reports` : "";
  const description =
    payload?.type === "single"
      ? `${getDepartmentLabel(payload.result.department)} result details | ${formatDateTime(payload.result.completedAt ?? payload.result.orderedAt)}`
      : payload
        ? `${payload.records.length} ${getDepartmentLabel(payload.department).toLowerCase()} report(s)`
        : "";

  return (
    <Dialog.Root open={Boolean(payload)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88dvh] w-[min(860px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-white shadow-soft outline-none">
          {payload ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div>
                  <Dialog.Title className="text-lg font-bold text-foreground">{title}</Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const recordsToPrint = payload.type === "single" ? [payload.result] : payload.records;
                      onPrint(recordsToPrint, payload.type === "single" ? `${getDepartmentLabel(payload.result.department)} Report` : title);
                    }}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Dialog.Close asChild>
                    <Button size="icon" variant="ghost" aria-label="Close report">
                      <X className="h-4 w-4" />
                    </Button>
                  </Dialog.Close>
                </div>
              </div>
              <div className="max-h-[calc(88dvh-82px)] overflow-y-auto p-4">
                {payload.type === "single" ? <SingleReportView result={payload.result} /> : <AllCategoryView department={payload.department} records={payload.records} />}
              </div>
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SingleReportView({ result }: { result: ResultRecord }) {
  if (result.department === "laboratory") return <LaboratoryReportView result={result} />;
  if (result.department === "radiology") return <RadiologyReportView result={result} />;
  return <PoctReportView result={result} />;
}

function AllCategoryView({ department, records }: { department: ResultDepartment; records: ResultRecord[] }) {
  const grouped = groupRecordsByTestName(records);
  const groupEntries = Object.entries(grouped);

  if (records.length === 0) {
    return <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No {getDepartmentLabel(department).toLowerCase()} reports available.</div>;
  }

  return (
    <div className="space-y-4">
      {groupEntries.map(([testName, items]) => (
        <section className="overflow-hidden rounded-lg border border-border" key={testName}>
          <div className="flex flex-col gap-1 border-b border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-bold text-foreground">{testName}</div>
            <div className="text-xs font-semibold text-muted-foreground">{items.length} report(s)</div>
          </div>
          <div className="space-y-4 p-4">
            {items.map((result) => (
              <div className="rounded-lg border border-border bg-white p-4" key={result.id}>
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm font-semibold text-foreground">{formatDateTime(result.completedAt ?? result.orderedAt)}</div>
                </div>
                <SingleReportView result={result} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LaboratoryReportView({ result }: { result: ResultRecord }) {
  return (
    <div className="space-y-4">
      
      <ResultValueTable result={result} title="Laboratory Result Details" />
    </div>
  );
}

function RadiologyReportView({ result }: { result: ResultRecord }) {
  return (
    <div className="space-y-4">
      {/* <InfoGrid
        rows={[
          ["Scan Type", result.testName],
          ["Study Date", formatDateTime(result.completedAt ?? result.orderedAt)],
          ["Findings", result.resultSummary],
          ["Impression", result.values.find((value) => value.name.toLowerCase().includes("finding"))?.value ?? result.resultSummary],
          ["Radiologist Notes", result.timeline.find((item) => item.label.toLowerCase().includes("verified") || item.label.toLowerCase().includes("released"))?.by ?? "Radiologist verification pending"],
          ["Attached Images", result.imageAvailable ? `${result.accessionNo ?? result.id} images available` : "No attached images"],
        ]}
      /> */}
      {result.imageAvailable ? (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary-soft p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ImageIcon className="h-4 w-4 text-primary" />
            Attached image set ready for PACS review
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PoctReportView({ result }: { result: ResultRecord }) {
  const primary = result.values[0];
  return (
    <InfoGrid
      rows={[
        ["Test Type", result.testName],
        ["Result", primary ? `${primary.value}${primary.unit ? ` ${primary.unit}` : ""}` : result.resultSummary],
        ["Unit", primary?.unit ?? "-"],
        ["Device Used", result.values.find((value) => value.name.toLowerCase().includes("device"))?.value ?? "POCT bedside device"],
        ["Performed By", result.timeline.find((item) => item.label.toLowerCase().includes("entered"))?.by ?? result.timeline[0]?.by ?? "Clinical staff"],
        ["Date & Time", formatDateTime(result.completedAt ?? result.orderedAt)],
      ]}
    />
  );
}

function InfoGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div className="rounded-lg border border-border bg-surface-muted p-3" key={label}>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{value || "-"}</div>
        </div>
      ))}
    </div>
  );
}

function ResultValueTable({ result, title }: { result: ResultRecord; title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-foreground">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Test Name</th>
            <th className="px-3 py-2">Result Value</th>
            <th className="px-3 py-2">Unit</th>
            <th className="px-3 py-2">Reference Range</th>
          </tr>
        </thead>
        <tbody>
          {result.values.map((value) => (
            <tr className="border-t border-border" key={`${result.id}-${value.name}`}>
              <td className="px-3 py-2 font-medium text-foreground">{value.name}</td>
              <td className={cn("px-3 py-2", resultValueClass(value))}>{value.value}</td>
              <td className="px-3 py-2">{value.unit ?? "-"}</td>
              <td className="px-3 py-2">{value.range ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportPrintView({ patientContext, payload }: { patientContext?: ResultsPatientContext; payload: PrintPayload | null }) {
  const firstResult = payload?.records[0];
  const ageGender = firstResult ? getPatientAgeGender(firstResult, patientContext) : { age: "-", gender: "-" };
  const printedAt = new Date().toLocaleString("en-IN");
  const signature =
    firstResult?.department === "radiology"
      ? "Radiologist Digital Signature"
      : firstResult?.department === "poct"
        ? "POCT Supervisor Digital Signature"
        : "Pathologist Digital Signature";

  return (
    <>
      <style jsx global>{`
        .result-print-root {
          display: none;
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .result-print-root,
          .result-print-root * {
            visibility: visible !important;
          }

          .result-print-root {
            background: #ffffff !important;
            color: #111827 !important;
            display: block !important;
            font-family: Arial, sans-serif !important;
            left: 0;
            line-height: 1.35;
            padding: 18px;
            position: absolute;
            top: 0;
            width: 100%;
          }

          .result-print-root table {
            border-collapse: collapse;
            font-size: 11px;
            width: 100%;
          }

          .result-print-root th,
          .result-print-root td {
            border: 1px solid #d5dae7;
            padding: 7px;
            text-align: left;
            vertical-align: top;
          }

          .result-print-root th {
            background: #eef3fb !important;
            color: #4b5563 !important;
            font-size: 10px;
            text-transform: uppercase;
          }

          @page {
            margin: 12mm;
          }
        }
      `}</style>

      {payload && firstResult ? (
        <div className="result-print-root">
          <div className="flex items-start justify-between gap-5 border-b-2 border-primary pb-4">
            <div>
              <img alt="Plasmit Hospital" className="mb-2 h-14 object-contain" src="/plasmit-sidebar-logo.webp" />
              <div className="text-xl font-bold">Plasmit Hospital</div>
              <div className="text-sm font-semibold text-slate-600">{payload.title}</div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold">Print Timestamp</div>
              <div>{printedAt}</div>
              <div className="mt-2 font-bold">Report ID</div>
              <div>{payload.records.map((result) => result.id).join(", ")}</div>
            </div>
          </div>

          <section className="mt-4">
            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">Patient Information</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <PrintField label="Patient Name" value={patientContext?.name ?? firstResult.patientName} />
              <PrintField label="MR Number" value={patientContext?.mrn ?? firstResult.mrn} />
              <PrintField label="DOB" value={patientContext?.dob ?? "-"} />
              <PrintField label="Age" value={ageGender.age} />
              <PrintField label="Gender" value={ageGender.gender} />
              <PrintField label="Blood Group" value={patientContext?.bloodGroup ?? "-"} />
              <PrintField label="Ward / Bed" value={patientContext?.bed ?? patientContext?.wardBed ?? firstResult.location} />
              <PrintField label="Allergy" value={patientContext?.allergy ?? "-"} />
              <PrintField label="Consultant Doctor" value={patientContext?.consultantDoctor ?? firstResult.orderingDoctor} />
              <PrintField label="Admission Details" value={`${firstResult.visitType} encounter, active clinical care`} />
              <PrintField label="Sample Collected Date" value={formatDateTime(firstResult.collectedAt)} />
              <PrintField label="Report Date" value={formatDateTime(firstResult.completedAt ?? firstResult.orderedAt)} />
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">{getDepartmentLabel(firstResult.department)} Details</div>
            {payload.records.map((result) => (
              <div className="mb-5 break-inside-avoid" key={`print-${result.id}`}>
                <div className="mb-2 grid grid-cols-4 gap-2 text-xs">
                  <PrintField label="Test Name" value={result.testName} />
                  <PrintField label="Sample Type" value={result.specimen ?? "-"} />
                  <PrintField label="Status" value={result.status} />
                  <PrintField label="Report Date" value={formatDateTime(result.completedAt ?? result.orderedAt)} />
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Test Name</th>
                      <th>Result Value</th>
                      <th>Unit</th>
                      <th>Reference Range</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.values.map((value) => (
                      <tr key={`${result.id}-print-${value.name}`}>
                        <td>{value.name}</td>
                        <td>{value.value}</td>
                        <td>{value.unit ?? "-"}</td>
                        <td>{value.range ?? "-"}</td>
                        <td>{value.flag ?? result.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {result.resultSummary ? (
                  <div className="mt-2 rounded border border-slate-300 p-2 text-xs">
                    <strong>Interpretation:</strong> {result.resultSummary}
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section className="mt-6 grid grid-cols-[1fr_120px] items-end gap-8">
            <div>
              <div className="mb-8 text-xs font-bold uppercase tracking-wide text-primary">Verification Details</div>
              <div className="border-t border-slate-500 pt-2 text-sm font-bold">{signature}</div>
              <div className="mt-1 text-xs">Electronically verified report</div>
            </div>
            <div className="grid h-[110px] w-[110px] place-items-center border-2 border-slate-900 text-center text-[10px] font-bold">
              QR Verification
              <br />
              {payload.records[0]?.id}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function PrintField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-300 p-2">
      <div className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 font-bold text-slate-900">{value || "-"}</div>
    </div>
  );
}
