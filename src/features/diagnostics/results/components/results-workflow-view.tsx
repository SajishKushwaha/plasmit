"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Eye, FileText, FlaskConical, Image as ImageIcon, Plus, Printer, Search, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { Input } from "@/components/ui/input";
import { DoctorOrdersPage, type DoctorOrdersPatientContext } from "@/features/clinical/doctor-orders/doctor-orders";
import { cn } from "@/lib/utils";
import { resultRecords } from "@/features/diagnostics/results/data/mockResults";
import type { ResultDepartment, ResultRecord, ResultStatus, ResultValue } from "@/features/diagnostics/results/types";

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
  patientId?: string;
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
  | { type: "all"; department: ResultDepartment; records: ResultRecord[]; comparisonRecords?: ResultRecord[] }
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

function formatRecordDateScope(records: ResultRecord[]) {
  const dateKeys = Array.from(new Set(records.map((result) => getDateKey(result.orderedAt))));
  if (dateKeys.length !== 1) return "All selected dates";
  return dateFormatter.format(new Date(`${dateKeys[0]}T00:00:00`));
}

function getResultDateKey(result: ResultRecord) {
  return getDateKey(result.completedAt ?? result.orderedAt);
}

function latestDateRecords(records: ResultRecord[]) {
  const latestDateKey = [...records].map(getResultDateKey).sort((first, second) => second.localeCompare(first))[0];
  return latestDateKey ? records.filter((result) => getResultDateKey(result) === latestDateKey) : records;
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

function ResultStatusBadge({ status }: { status: ResultStatus }) {
  return <Badge tone={statusTone[status]}>{status}</Badge>;
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

function hashResultScope(value: string) {
  return value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function patientResultSeed(patientContext?: ResultsPatientContext) {
  return hashResultScope(patientContext?.patientId ?? patientContext?.mrn ?? patientContext?.uhid ?? patientContext?.name ?? "default");
}

function buildAdditionalPatientReports(records: ResultRecord[], seed = 0) {
  const anchor = records[0];
  if (!anchor) return [];

  const reportSuffix = (anchor.mrn || anchor.patientName || `patient-${seed}`).replace(/[^a-zA-Z0-9]/g, "").slice(-8) || String(seed);
  const hba1c = (5.8 + (seed % 8) / 10).toFixed(1);
  const estimatedAverageGlucose = String(118 + (seed % 36));
  const hemoglobinBaseline = (11.2 + (seed % 9) / 10).toFixed(1);
  const hemoglobinPrevious = (12.0 + (seed % 7) / 10).toFixed(1);
  const wbcBaseline = (13.8 + (seed % 8)).toFixed(1);
  const wbcPrevious = (10.8 + (seed % 7)).toFixed(1);
  const plateletBaseline = String(176 + (seed % 70));
  const plateletPrevious = String(204 + (seed % 62));
  const creatinineBaseline = (1.6 + (seed % 10) / 10).toFixed(1);
  const creatinineCurrent = (1.1 + (seed % 9) / 10).toFixed(1);
  const bunBaseline = String(28 + (seed % 18));
  const bunCurrent = String(20 + (seed % 16));
  const sgptBaseline = String(44 + (seed % 28));
  const sgotBaseline = String(34 + (seed % 18));
  const sgptCurrent = String(30 + (seed % 24));
  const sgotCurrent = String(24 + (seed % 16));
  const radiologyPair = [
    ["CT Brain Plain", "No acute intracranial hemorrhage. Mild age-related cortical atrophy.", "ACC-CT"],
    ["USG Abdomen", "Mild fatty liver changes. No free fluid detected.", "ACC-USG"],
    ["Portable Chest X-Ray", "Mild basal haziness, no pneumothorax.", "ACC-XR"],
    ["CT Abdomen Plain", "No obstructive uropathy. Bowel gas pattern non-specific.", "ACC-CTA"],
  ][seed % 4];

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
      id: `RES-2026-${reportSuffix}-HBA1C`,
      department: "laboratory" as const,
      testName: "HbA1c",
      orderedAt: "2026-05-23T13:10:00",
      collectedAt: "2026-05-23T13:22:00",
      completedAt: "2026-05-23T14:05:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: `HbA1c ${hba1c}%. Glycemic control requires routine follow-up.`,
      specimen: "EDTA whole blood",
      values: [
        { name: "HbA1c", value: hba1c, unit: "%", range: "< 5.7", flag: Number(hba1c) > 6.4 ? "Critical" as const : "High" as const },
        { name: "Estimated Average Glucose", value: estimatedAverageGlucose, unit: "mg/dL", range: "70 - 140", flag: Number(estimatedAverageGlucose) > 140 ? "High" as const : "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "13:10", by: "ICU Desk" },
        { label: "Sample collected", at: "13:22", by: "Lab Technician" },
        { label: "Report verified", at: "14:05", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: `RES-2026-${reportSuffix}-CBC-18`,
      department: "laboratory" as const,
      testName: "Complete Blood Count",
      orderedAt: "2026-05-18T08:10:00",
      collectedAt: "2026-05-18T08:24:00",
      completedAt: "2026-05-18T09:05:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "CBC baseline captured for longitudinal monitoring.",
      specimen: "EDTA whole blood",
      values: [
        { name: "Hemoglobin", value: hemoglobinBaseline, unit: "g/dL", range: "13.0 - 17.0", flag: Number(hemoglobinBaseline) < 13 ? "Low" as const : "Normal" as const },
        { name: "WBC Count", value: wbcBaseline, unit: "10^3/uL", range: "4.0 - 11.0", flag: Number(wbcBaseline) > 11 ? "High" as const : "Normal" as const },
        { name: "Platelets", value: plateletBaseline, unit: "10^3/uL", range: "150 - 450", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "08:10", by: "ICU Desk" },
        { label: "Sample collected", at: "08:24", by: "Lab Technician" },
        { label: "Report verified", at: "09:05", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: `RES-2026-${reportSuffix}-CBC-21`,
      department: "laboratory" as const,
      testName: "Complete Blood Count",
      orderedAt: "2026-05-21T07:50:00",
      collectedAt: "2026-05-21T08:02:00",
      completedAt: "2026-05-21T08:38:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "CBC repeated. WBC trending down, hemoglobin improving.",
      specimen: "EDTA whole blood",
      values: [
        { name: "Hemoglobin", value: hemoglobinPrevious, unit: "g/dL", range: "13.0 - 17.0", flag: Number(hemoglobinPrevious) < 13 ? "Low" as const : "Normal" as const },
        { name: "WBC Count", value: wbcPrevious, unit: "10^3/uL", range: "4.0 - 11.0", flag: Number(wbcPrevious) > 11 ? "High" as const : "Normal" as const },
        { name: "Platelets", value: plateletPrevious, unit: "10^3/uL", range: "150 - 450", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "07:50", by: "ICU Desk" },
        { label: "Sample collected", at: "08:02", by: "Lab Technician" },
        { label: "Report verified", at: "08:38", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: `RES-2026-${reportSuffix}-RENAL-18`,
      department: "laboratory" as const,
      testName: "Renal Function Panel",
      orderedAt: "2026-05-18T09:00:00",
      collectedAt: "2026-05-18T09:12:00",
      completedAt: "2026-05-18T09:52:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "Renal markers elevated; monitor hydration and nephrology plan.",
      specimen: "Serum",
      values: [
        { name: "Creatinine", value: creatinineBaseline, unit: "mg/dL", range: "0.7 - 1.3", flag: Number(creatinineBaseline) > 1.3 ? "High" as const : "Normal" as const },
        { name: "BUN", value: bunBaseline, unit: "mg/dL", range: "7 - 20", flag: Number(bunBaseline) > 20 ? "High" as const : "Normal" as const },
        { name: "Sodium", value: "136", unit: "mmol/L", range: "135 - 145", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "09:00", by: "ICU Desk" },
        { label: "Sample collected", at: "09:12", by: "Lab Technician" },
        { label: "Report verified", at: "09:52", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: `RES-2026-${reportSuffix}-RENAL-23`,
      department: "laboratory" as const,
      testName: "Renal Function Panel",
      orderedAt: "2026-05-23T07:40:00",
      collectedAt: "2026-05-23T07:53:00",
      completedAt: "2026-05-23T08:30:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "Renal function improving but still above reference range.",
      specimen: "Serum",
      values: [
        { name: "Creatinine", value: creatinineCurrent, unit: "mg/dL", range: "0.7 - 1.3", flag: Number(creatinineCurrent) > 1.3 ? "High" as const : "Normal" as const },
        { name: "BUN", value: bunCurrent, unit: "mg/dL", range: "7 - 20", flag: Number(bunCurrent) > 20 ? "High" as const : "Normal" as const },
        { name: "Sodium", value: "138", unit: "mmol/L", range: "135 - 145", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "07:40", by: "ICU Desk" },
        { label: "Sample collected", at: "07:53", by: "Lab Technician" },
        { label: "Report verified", at: "08:30", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: `RES-2026-${reportSuffix}-LFT-18`,
      department: "laboratory" as const,
      testName: "Liver Function Test",
      orderedAt: "2026-05-18T08:30:00",
      collectedAt: "2026-05-18T08:48:00",
      completedAt: "2026-05-18T09:40:00",
      status: "Completed" as const,
      priority: "Urgent" as const,
      imageAvailable: false,
      resultSummary: "Mildly elevated SGPT, bilirubin within reference range.",
      specimen: "Serum",
      values: [
        { name: "SGPT", value: sgptBaseline, unit: "U/L", range: "7 - 56", flag: Number(sgptBaseline) > 56 ? "High" as const : "Normal" as const },
        { name: "SGOT", value: sgotBaseline, unit: "U/L", range: "8 - 40", flag: Number(sgotBaseline) > 40 ? "High" as const : "Normal" as const },
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
      id: `RES-2026-${reportSuffix}-LFT-23`,
      department: "laboratory" as const,
      testName: "Liver Function Test",
      orderedAt: "2026-05-23T08:30:00",
      collectedAt: "2026-05-23T08:45:00",
      completedAt: "2026-05-23T09:25:00",
      status: "Completed" as const,
      imageAvailable: false,
      resultSummary: "Liver enzymes improving, bilirubin stable.",
      specimen: "Serum",
      values: [
        { name: "SGPT", value: sgptCurrent, unit: "U/L", range: "7 - 56", flag: Number(sgptCurrent) > 56 ? "High" as const : "Normal" as const },
        { name: "SGOT", value: sgotCurrent, unit: "U/L", range: "8 - 40", flag: Number(sgotCurrent) > 40 ? "High" as const : "Normal" as const },
        { name: "Bilirubin Total", value: "0.8", unit: "mg/dL", range: "0.1 - 1.2", flag: "Normal" as const },
      ],
      timeline: [
        { label: "Order created", at: "08:30", by: "ICU Nurse" },
        { label: "Sample collected", at: "08:45", by: "Phlebotomy" },
        { label: "Report verified", at: "09:25", by: "Dr. Meera Shah" },
      ],
    },
    {
      ...base,
      id: `RAD-2026-${reportSuffix}-PRIMARY`,
      department: "radiology" as const,
      testName: radiologyPair[0],
      orderedAt: "2026-05-22T12:15:00",
      completedAt: "2026-05-22T12:55:00",
      status: "Completed" as const,
      priority: "Urgent" as const,
      imageAvailable: true,
      accessionNo: `${radiologyPair[2]}-${reportSuffix}`,
      resultSummary: radiologyPair[1],
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
      id: `RAD-2026-${reportSuffix}-FOLLOWUP`,
      department: "radiology" as const,
      testName: seed % 2 === 0 ? "USG Abdomen" : "Portable Chest X-Ray",
      orderedAt: "2026-05-21T16:20:00",
      completedAt: "2026-05-21T16:58:00",
      status: "Completed" as const,
      imageAvailable: true,
      accessionNo: `ACC-FU-${reportSuffix}`,
      resultSummary: seed % 2 === 0 ? "Mild fatty liver changes. No free fluid detected." : "Follow-up portable chest film reviewed. Lines and tubes position satisfactory.",
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
      id: `POCT-2026-${reportSuffix}-ABG`,
      department: "poct" as const,
      testName: "Arterial Blood Gas",
      orderedAt: "2026-05-23T15:20:00",
      completedAt: "2026-05-23T15:24:00",
      status: "Completed" as const,
      priority: "Urgent" as const,
      imageAvailable: false,
      resultSummary: `pH 7.${35 + (seed % 8)}, lactate ${(1.2 + (seed % 12) / 10).toFixed(1)} mmol/L. No critical abnormality.`,
      specimen: "Arterial blood",
      values: [
        { name: "pH", value: `7.${35 + (seed % 8)}`, range: "7.35 - 7.45", flag: "Normal" as const },
        { name: "Lactate", value: (1.2 + (seed % 12) / 10).toFixed(1), unit: "mmol/L", range: "0.5 - 2.2", flag: seed % 12 > 9 ? "High" as const : "Normal" as const },
        { name: "Device QC", value: "Passed", flag: "Normal" as const },
      ],
      timeline: [
        { label: "POCT requested", at: "15:20", by: "ICU Nurse" },
        { label: "Result entered", at: "15:24", by: "ABG Analyzer" },
      ],
    },
    {
      ...base,
      id: `POCT-2026-${reportSuffix}-ECG`,
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

  const seed = patientResultSeed(patientContext);
  const normalizedName = patientContext.name?.trim().toLowerCase();
  const matches = resultRecords.filter((result) => {
    const matchesMrn = patientContext.mrn ? result.mrn === patientContext.mrn : false;
    const matchesName = normalizedName ? result.patientName.toLowerCase() === normalizedName : false;
    return matchesMrn || matchesName;
  });
  const fallbackStart = seed % resultRecords.length;
  const fallbackRecords = Array.from({ length: Math.min(6, resultRecords.length) }, (_, index) => resultRecords[(fallbackStart + index) % resultRecords.length]);

  const scopedRecords = (matches.length ? matches : fallbackRecords).map((result) => ({
    ...result,
    ageSex: patientContext.ageSex ?? result.ageSex,
    mrn: patientContext.uhid ?? patientContext.mrn ?? result.mrn,
    patientName: patientContext.name ?? result.patientName,
    location: patientContext.wardBed ?? result.location,
  }));

  return [...scopedRecords, ...buildAdditionalPatientReports(scopedRecords, seed)];
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
  autoOpenLatestDateOnly = false,
  defaultLatestDateOnly = false,
  initialDepartment = "all",
  defaultDepartment = initialDepartment,
  criticalOnly = false,
  patientContext,
  showPoctTab = true,
  viewTitle = "Results Center",
  viewDescription = "Laboratory, radiology, and POCT reports organized for IPD review.",
  onAddLaboratoryOrder,
}: {
  autoOpenAllDepartment?: ResultDepartment;
  autoOpenLatestDateOnly?: boolean;
  defaultLatestDateOnly?: boolean;
  initialDepartment?: DepartmentFilter;
  defaultDepartment?: DepartmentFilter;
  criticalOnly?: boolean;
  patientContext?: ResultsPatientContext;
  showPoctTab?: boolean;
  viewTitle?: string;
  viewDescription?: string;
  onAddLaboratoryOrder?: (patientContext?: DoctorOrdersPatientContext) => void;
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
  const visibleDepartments = useMemo(
    () => (showPoctTab ? departments : departments.filter((department) => department.id !== "poct")),
    [showPoctTab],
  );

  const records = useMemo(() => scopedPatientRecords(patientContext), [patientContext]);
  const availableDates = useMemo(() => {
    const dateKeys = Array.from(new Set(records
      .filter((result) => {
        const matchesDepartment = activeDepartment === "all"
          ? showPoctTab || result.department !== "poct"
          : result.department === activeDepartment;
        const matchesCritical = !criticalOnly || result.status === "Critical";
        return matchesDepartment && matchesCritical;
      })
      .map((result) => getDateKey(result.orderedAt)))).sort((first, second) => second.localeCompare(first));
    return dateKeys.map((dateKey) => ({
      dateKey,
      label: dateFormatter.format(new Date(`${dateKey}T00:00:00`)),
    }));
  }, [activeDepartment, criticalOnly, records, showPoctTab]);
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
    if (selectedDate === "all" || selectedDate === "custom") return;
    if (availableDates.some((date) => date.dateKey === selectedDate)) return;

    setSelectedDate("all");
  }, [availableDates, selectedDate]);

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
    const latestDateKey = departmentRecords
      .map((result) => getDateKey(result.orderedAt))
      .sort((first, second) => second.localeCompare(first))[0];
    const recordsToView = autoOpenLatestDateOnly && latestDateKey
      ? departmentRecords.filter((result) => getDateKey(result.orderedAt) === latestDateKey)
      : departmentRecords;
    const selectedReportNames = new Set(recordsToView.map((result) => result.testName));
    const comparisonRecords = autoOpenLatestDateOnly
      ? departmentRecords.filter((result) => selectedReportNames.has(result.testName))
      : undefined;

    setActiveDepartment(autoOpenAllDepartment);
    if (autoOpenLatestDateOnly && latestDateKey) {
      setSelectedDate(latestDateKey);
      setOpenGroups({ [latestDateKey]: true });
    }
    setReportModal({ type: "all", department: autoOpenAllDepartment, records: recordsToView, comparisonRecords });
    hasAutoOpenedAllDepartment.current = true;
  }, [autoOpenAllDepartment, autoOpenLatestDateOnly, criticalOnly, records]);

  useEffect(() => {
    if (!defaultLatestDateOnly || selectedDate !== "all") return;
    const latestDateKey = records
      .filter((result) => !criticalOnly || result.status === "Critical")
      .map((result) => getDateKey(result.orderedAt))
      .sort((first, second) => second.localeCompare(first))[0];

    if (!latestDateKey) return;
    setSelectedDate(latestDateKey);
    setOpenGroups((current) => ({ ...current, [latestDateKey]: true }));
  }, [criticalOnly, defaultLatestDateOnly, records, selectedDate]);

  function printReports(recordsToPrint: ResultRecord[], title: string) {
    if (recordsToPrint.length === 0) return;
    const printRecords = recordsToPrint[0]?.department === "laboratory" && recordsToPrint.length > 1
      ? latestDateRecords(recordsToPrint)
      : recordsToPrint;
    setPrintPayload({ records: printRecords, title });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-border bg-white shadow-sm">
       

        <div className="sticky top-[var(--app-header-offset,0px)] z-20 border-b border-border bg-white/95 p-3 backdrop-blur">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-wrap gap-2">
              {visibleDepartments.map((department) => {
                const Icon = department.icon;
                const active = activeDepartment === department.id;
                const count = counts[department.id];
                return (
                  <button
                    className={cn(
                      "inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-transparent px-3 text-sm font-bold transition-all duration-200",
                      active ? "bg-white text-primary shadow-sm" : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900",
                    )}
                    key={department.id}
                    onClick={() => setActiveDepartment(department.id)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {department.label}
                    <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted-foreground")}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex w-full shrink-0 sm:w-[260px]">
              <div className="relative w-full min-w-0" ref={dateFilterRef}>
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
            {query ? (
              <Button className="mt-4" variant="outline" onClick={() => setQuery("")}>
                Clear search
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group, index) => {
            const expanded = openGroups[group.dateKey] ?? index === 0;
            return (
              <section className="overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all duration-200" key={group.dateKey}>
                <div className="flex flex-col gap-3 border-b border-border bg-surface-muted/50 px-4 py-3 transition hover:bg-surface-muted sm:flex-row sm:items-center">
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setOpenGroups((current) => ({ ...current, [group.dateKey]: !expanded }))}
                    type="button"
                  >
                    <div className="text-base font-bold text-foreground">{group.label}</div>
                    <div className="text-xs text-muted-foreground">{group.records.length} report(s) in this date group</div>
                  </button>
                  <label className="relative w-full min-w-0 sm:w-[min(440px,46%)]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="h-10 bg-white pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search report name, report ID..." />
                  </label>
                  <button
                    aria-label={expanded ? `Collapse ${group.label}` : `Expand ${group.label}`}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white"
                    onClick={() => setOpenGroups((current) => ({ ...current, [group.dateKey]: !expanded }))}
                    type="button"
                  >
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", expanded && "rotate-180")} />
                  </button>
                </div>
                {expanded ? (
                  <div className="space-y-4 p-4 transition-all duration-200">
                    {(activeDepartment === "all" ? departmentCards : departmentCards.filter((card) => card.id === activeDepartment)).map((card) => {
                      const reports = group.records.filter((result) => result.department === card.id);
                      if (reports.length === 0) return null;

                      return (
                        <ResultCategorySection
                          allReports={reports}
                          icon={card.icon}
                          key={`${group.dateKey}-${card.id}`}
                          onAddLaboratoryOrder={onAddLaboratoryOrder}
                          onAllView={(department, recordsToView) => {
                            const selectedReportNames = new Set(recordsToView.map((result) => result.testName));
                            const comparisonRecords = records.filter((result) => {
                              const matchesDepartment = result.department === department;
                              const matchesSelectedReport = selectedReportNames.has(result.testName);
                              const matchesCritical = !criticalOnly || result.status === "Critical";
                              return matchesDepartment && matchesSelectedReport && matchesCritical && matchesSearch(result, query);
                            });
                            setReportModal({ type: "all", department, records: recordsToView, comparisonRecords });
                          }}
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

      <ReportViewModal
        patientContext={patientContext}
        payload={reportModal}
        onAddLaboratoryOrder={onAddLaboratoryOrder}
        onClose={() => setReportModal(null)}
        onPrint={(recordsToPrint, title) => printReports(recordsToPrint, title)}
      />
      <ReportPrintView patientContext={patientContext} payload={printPayload} />
    </div>
  );
}

function ResultCategorySection({
  allReports,
  icon: Icon,
  onAddLaboratoryOrder,
  onAllView,
  onPrint,
  onView,
  reports,
  title,
}: {
  allReports: ResultRecord[];
  icon: typeof FileText;
  onAddLaboratoryOrder?: (patientContext?: DoctorOrdersPatientContext) => void;
  onAllView: (department: ResultDepartment, records: ResultRecord[]) => void;
  onPrint: (result: ResultRecord) => void;
  onView: (result: ResultRecord) => void;
  reports: ResultRecord[];
  title: string;
}) {
  if (reports.length === 0) return null;

  const department = allReports[0]?.department ?? reports[0]?.department;
  const headerActions = (
    <>
      {department === "laboratory" && onAddLaboratoryOrder ? (
        <Button
          aria-label="Add laboratory order"
          className="h-9 w-9 rounded-full p-0"
          onClick={() => onAddLaboratoryOrder(toOrderPatientContext(reports[0] ?? allReports[0]))}
          title="Add Laboratory Order"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </Button>
      ) : null}
      <Button disabled={!department || allReports.length === 0} size="sm" variant="outline" onClick={() => department && onAllView(department, allReports)}>
        <Icon className="h-4 w-4" />
        All View
      </Button>
    </>
  );

  return (
    <Card className="overflow-hidden rounded-lg border-border shadow-none">
      <CardContent className="p-0">
        <ResultTable allViewAction={headerActions} reports={reports} onPrint={onPrint} onView={onView} />
      </CardContent>
    </Card>
  );
}

function ResultTable({
  allViewAction,
  onPrint,
  onView,
  reports,
}: {
  allViewAction?: React.ReactNode;
  onPrint: (result: ResultRecord) => void;
  onView: (result: ResultRecord) => void;
  reports: ResultRecord[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3">{getReportColumnLabel(reports)}</th>
            <th className="w-[150px] px-4 py-3">Status</th>
            <th className="w-[240px] px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                {allViewAction}
                <span>Actions</span>
              </div>
            </th>
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
                <ResultStatusBadge status={result.status} />
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
  onAddLaboratoryOrder,
  onClose,
  onPrint,
  patientContext,
  payload,
}: {
  onAddLaboratoryOrder?: (patientContext?: DoctorOrdersPatientContext) => void;
  onClose: () => void;
  onPrint: (records: ResultRecord[], title: string) => void;
  patientContext?: ResultsPatientContext;
  payload: ReportModalState;
}) {
  const title = payload?.type === "single" ? payload.result.testName : payload ? `All ${getDepartmentLabel(payload.department)} Reports` : "";
  const patientName = patientContext?.name ?? (payload?.type === "single" ? payload.result.patientName : payload?.records[0]?.patientName);
  const reportScope =
    payload?.type === "single"
      ? `${getDepartmentLabel(payload.result.department)} result details | ${formatDateTime(payload.result.completedAt ?? payload.result.orderedAt)}`
      : payload
        ? `${formatRecordDateScope(payload.records)} | ${payload.records.length} ${getDepartmentLabel(payload.department).toLowerCase()} report(s)`
        : "";
  const description =
    patientName && reportScope ? `${patientName} | ${reportScope}` : patientName || reportScope;
  const [laboratoryOrderOpen, setLaboratoryOrderOpen] = useState(false);
  const showLaboratoryOrderAction = payload?.type === "all" && payload.department === "laboratory";
  const orderPatientContext = showLaboratoryOrderAction ? toOrderPatientContext(payload.records[0]) : undefined;

  useEffect(() => {
    setLaboratoryOrderOpen(false);
  }, [payload]);

  return (
    <Dialog.Root open={Boolean(payload)} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88dvh] w-[min(1120px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-white shadow-soft outline-none">
          {payload ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border p-4">
                <div>
                  <Dialog.Title className="text-lg font-bold text-foreground">{title}</Dialog.Title>
                  <Dialog.Description className="text-sm font-semibold text-foreground">{description}</Dialog.Description>
                </div>
                <div className="flex gap-2">
                  {showLaboratoryOrderAction ? (
                    <div className="group relative">
                      <Button
                        aria-label="Add laboratory order"
                        className="h-9 w-9 rounded-full p-0"
                        onClick={() => {
                          if (onAddLaboratoryOrder) {
                            onAddLaboratoryOrder(orderPatientContext);
                            onClose();
                            return;
                          }
                          setLaboratoryOrderOpen(true);
                        }}
                        title="Add Laboratory Order"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {!laboratoryOrderOpen ? (
                        <div className="pointer-events-none absolute right-11 top-1/2 z-[80] -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                           Laboratory Order
                        </div>
                      ) : null}
                    </div>
                  ) : null}
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
                {payload.type === "single" ? <SingleReportView result={payload.result} /> : <AllCategoryView comparisonRecords={payload.comparisonRecords} department={payload.department} records={payload.records} />}
              </div>
              {showLaboratoryOrderAction ? (
                <CenterModal
                  className="h-[min(88dvh,900px)] w-[min(96vw,1560px)]"
                  description={payload.records[0] ? `${payload.records[0].patientName} | ${payload.records[0].location}` : undefined}
                  onOpenChange={setLaboratoryOrderOpen}
                  open={laboratoryOrderOpen}
                  title=" Laboratory Order"
                >
                  <DoctorOrdersPage defaultTab="lab" onlyTab="lab" patientContext={orderPatientContext} />
                </CenterModal>
              ) : null}
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function toOrderPatientContext(result?: ResultRecord): DoctorOrdersPatientContext | undefined {
  if (!result) return undefined;

  return {
    ageSex: result.ageSex,
    id: result.mrn,
    name: result.patientName,
    uhid: result.mrn,
    wardBed: result.location,
  };
}

function SingleReportView({ result }: { result: ResultRecord }) {
  if (result.department === "laboratory") return <LaboratoryReportView result={result} />;
  if (result.department === "radiology") return <RadiologyReportView result={result} />;
  return <PoctReportView result={result} />;
}

function AllCategoryView({ comparisonRecords, department, records }: { comparisonRecords?: ResultRecord[]; department: ResultDepartment; records: ResultRecord[] }) {
  const grouped = groupRecordsByTestName(records);
  const groupEntries = Object.entries(grouped);

  if (records.length === 0) {
    return <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No {getDepartmentLabel(department).toLowerCase()} reports available.</div>;
  }

  if (department === "laboratory") {
    return <LaboratoryAllViewTabs comparisonRecords={comparisonRecords ?? records} records={records} />;
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

type LaboratoryAllViewTab = "details" | "comparison";

function LaboratoryAllViewTabs({ comparisonRecords, records }: { comparisonRecords: ResultRecord[]; records: ResultRecord[] }) {
  const [activeTab, setActiveTab] = useState<LaboratoryAllViewTab>("details");
  const tabs: Array<{ id: LaboratoryAllViewTab; label: string }> = [
    { id: "details", label: "Latest Date Results" },
    { id: "comparison", label: "Comparison View" },
  ];
  const latestRecords = latestDateRecords(records);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-surface-muted/70 p-1">
          {tabs.map((tab) => (
            <button
              className={cn(
                "h-10 rounded-lg border border-transparent px-3 text-sm font-bold transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm"
                  : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900",
              )}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {activeTab === "details" ? `${latestRecords.length} latest report(s)` : `${Array.from(new Set(comparisonRecords.map((result) => getDateKey(result.completedAt ?? result.orderedAt)))).slice(-3).length} date comparison`}
        </div>
      </div>

      {activeTab === "details" ? <LaboratoryAllDetailsView records={latestRecords} /> : null}
      {activeTab === "comparison" ? <LaboratoryDateWiseComparison records={comparisonRecords} /> : null}
    </div>
  );
}

function LaboratoryAllDetailsView({ records }: { records: ResultRecord[] }) {
  const sortedRecords = [...records].sort((first, second) => new Date(second.completedAt ?? second.orderedAt).getTime() - new Date(first.completedAt ?? first.orderedAt).getTime());

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-white">
      <div className="flex flex-col gap-1 border-b border-border bg-surface-muted px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-bold text-foreground">Latest Date Results</div>
        <div className="text-xs font-semibold text-muted-foreground">
          {sortedRecords[0] ? `${formatDate(sortedRecords[0].completedAt ?? sortedRecords[0].orderedAt)} | ${records.length} report(s)` : "No reports"}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-xs">
          <thead className="bg-surface-muted/80 uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-[210px] border-b border-r border-border px-3 py-2">Report</th>
              <th className="w-[140px] border-b border-r border-border px-3 py-2">Status</th>
              <th className="border-b border-r border-border px-3 py-2">Test</th>
              <th className="w-[160px] border-b border-r border-border px-3 py-2">Value</th>
              <th className="w-[150px] border-b border-border px-3 py-2">Range</th>
            </tr>
          </thead>
          <tbody>
            {sortedRecords.map((result) =>
              result.values.map((value, index) => (
                <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/40" key={`${result.id}-${value.name}`}>
                  {index === 0 ? (
                    <>
                      <td className="border-r border-border px-3 py-2 align-top" rowSpan={result.values.length}>
                        <div className="font-extrabold text-foreground">{result.testName}</div>
                      </td>
                      <td className="border-r border-border px-3 py-2 align-top" rowSpan={result.values.length}>
                        <ResultStatusBadge status={result.status} />
                      </td>
                    </>
                  ) : null}
                  <td className="border-r border-border px-3 py-2 font-semibold text-foreground">{value.name}</td>
                  <td className={cn("border-r border-border px-3 py-2 font-bold", resultValueClass(value))}>
                    {value.value}
                    {value.unit ? <span className="ml-1 font-medium text-muted-foreground">{value.unit}</span> : null}
                  </td>
                  <td className="px-3 py-2 font-medium text-muted-foreground">{value.range ?? "-"}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LaboratoryDateWiseComparison({ records }: { records: ResultRecord[] }) {
  const chronologicalDateKeys = Array.from(new Set(records.map((result) => getDateKey(result.completedAt ?? result.orderedAt))))
    .sort()
    .slice(-3);
  const dateKeys = [...chronologicalDateKeys].reverse();
  const sections = buildLaboratoryComparisonSections(records, dateKeys, chronologicalDateKeys);
  const criticalCount = sections.reduce(
    (total, section) => total + section.rows.filter((row) => row.trend === "Elevated" || row.trend === "Critical" || row.trend === "Watch").length,
    0,
  );
  const improvingCount = sections.reduce((total, section) => total + section.rows.filter((row) => row.trend === "Recovering" || row.trend === "Stabilizing").length, 0);
  const lastUpdate = records
    .map((result) => result.completedAt ?? result.orderedAt)
    .sort((first, second) => second.localeCompare(first))[0];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-surface-muted/80 uppercase tracking-wide text-muted-foreground">
                <th className="w-[280px] border-b border-r border-border px-3 py-2 font-bold">Laboratory Parameter</th>
                <th className="w-[190px] border-b border-r border-border px-3 py-2 font-bold">Normal Range</th>
                {dateKeys.map((dateKey) => (
                  <th className="min-w-[150px] border-b border-r border-border px-3 py-2 text-center" key={dateKey}>
                    <span className="block text-xs font-extrabold text-foreground">{formatComparisonDate(dateKey)}</span>
                    <span className="mt-0.5 block text-[11px] font-semibold italic normal-case text-muted-foreground">{comparisonDateSubtitle(dateKey, dateKeys)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <RowsForLaboratoryComparisonSection dateKeys={dateKeys} key={section.name} section={section} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ComparisonSummaryCard label="Critical Flags" value={`${criticalCount} Active`} tone="danger" />
        <ComparisonSummaryCard label="Improvement Rate" value={`+${Math.max(0, improvingCount * 6)}% Overall`} tone="info" />
        <ComparisonSummaryCard label="Last Update" value={lastUpdate ? formatDateTime(lastUpdate) : "-"} tone="warning" />
      </div>
    </div>
  );
}

function RowsForLaboratoryComparisonSection({
  dateKeys,
  section,
}: {
  dateKeys: string[];
  section: {
    name: string;
    rows: Array<{
      key: string;
      parameter: string;
      range: string;
      trend: string;
      valuesByDate: Record<string, ResultValue | undefined>;
      arrowByDate: Record<string, "up" | "down" | "same" | undefined>;
    }>;
  };
}) {
  return (
    <>
      <tr className="bg-surface-muted/80">
        <td className="border-b border-border px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground" colSpan={dateKeys.length + 2}>
          {section.name}
        </td>
      </tr>
      {section.rows.map((row) => (
        <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/40" key={row.key}>
          <td className="whitespace-nowrap border-r border-border px-3 py-2 font-extrabold text-foreground">{row.parameter}</td>
          <td className="border-r border-border px-3 py-2 font-mono font-bold text-muted-foreground">{row.range}</td>
          {dateKeys.map((dateKey) => {
            const value = row.valuesByDate[dateKey];
            const arrow = row.arrowByDate[dateKey];
            return (
              <td className="border-r border-border px-3 py-2 text-center" key={`${row.key}-${dateKey}`}>
                {value ? (
                  <span className={cn("inline-flex items-center justify-center gap-1 text-xs font-extrabold", comparisonValueClass(value))}>
                    {value.value}
                    <span className={cn("text-sm", comparisonArrowClass(value, arrow))}>
                      {arrow === "up" ? "↑" : arrow === "down" ? "↓" : arrow === "same" ? "→" : ""}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

function comparisonValueClass(value: ResultValue) {
  return resultValueClass(value);
}

function comparisonArrowClass(value: ResultValue, arrow?: "up" | "down" | "same") {
  if (!arrow || arrow === "same") return "text-muted-foreground";
  if (value.flag === "Critical" || value.flag === "High") return "text-danger";
  if (value.flag === "Low") return "text-info";
  return "text-muted-foreground";
}

function buildLaboratoryComparisonSections(records: ResultRecord[], displayDateKeys: string[], chronologicalDateKeys: string[]) {
  return Object.entries(groupRecordsByTestName(records))
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([testName, items]) => {
      const valueNames = Array.from(new Set(items.flatMap((result) => result.values.map((value) => value.name))));
      const rows = valueNames.map((valueName) => {
        const valuesByDate = displayDateKeys.reduce<Record<string, ResultValue | undefined>>((values, dateKey) => {
          const resultForDate = items
            .filter((result) => getDateKey(result.completedAt ?? result.orderedAt) === dateKey)
            .sort((first, second) => new Date(second.completedAt ?? second.orderedAt).getTime() - new Date(first.completedAt ?? first.orderedAt).getTime())[0];
          values[dateKey] = resultForDate?.values.find((value) => value.name === valueName);
          return values;
        }, {});
        const orderedValues = chronologicalDateKeys.map((dateKey) => valuesByDate[dateKey]);
        const firstValue = items.flatMap((result) => result.values).find((value) => value.name === valueName);
        const arrowByDate = displayDateKeys.reduce<Record<string, "up" | "down" | "same" | undefined>>((arrows, dateKey, index) => {
          const current = numericResultValue(valuesByDate[dateKey]);
          const previous = numericResultValue(index < displayDateKeys.length - 1 ? valuesByDate[displayDateKeys[index + 1]] : undefined);
          arrows[dateKey] = current === null || previous === null ? undefined : current > previous ? "up" : current < previous ? "down" : "same";
          return arrows;
        }, {});

        return {
          key: `${testName}-${valueName}`,
          parameter: valueName,
          range: firstValue?.range ?? "-",
          trend: comparisonTrendLabel(orderedValues),
          valuesByDate,
          arrowByDate,
        };
      });

      return { name: testName, rows };
    });
}

function numericResultValue(value?: ResultValue) {
  if (!value) return null;
  const numeric = Number.parseFloat(value.value.replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function comparisonTrendLabel(values: Array<ResultValue | undefined>) {
  const available = values.filter(Boolean) as ResultValue[];
  const latest = available[available.length - 1];
  const first = available[0];
  const latestNumeric = numericResultValue(latest);
  const firstNumeric = numericResultValue(first);

  if (latest?.flag === "Critical") return "Critical";
  if (latest?.flag === "High") {
    return firstNumeric !== null && latestNumeric !== null && latestNumeric < firstNumeric ? "Recovering" : "Elevated";
  }
  if (latest?.flag === "Low") return "Watch";
  if (firstNumeric !== null && latestNumeric !== null && Math.abs(latestNumeric - firstNumeric) > 0.1) return "Stabilizing";
  return "Normal";
}

function formatComparisonDate(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase();
}

function comparisonDateSubtitle(dateKey: string, dateKeys: string[]) {
  const index = dateKeys.indexOf(dateKey);
  if (index === 0) return "Current";
  if (index === dateKeys.length - 1) return "Baseline";
  return `Previous ${index}`;
}

function ComparisonSummaryCard({ label, tone, value }: { label: string; tone: "danger" | "info" | "warning"; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl font-extrabold",
          tone === "danger" && "bg-danger/10 text-danger",
          tone === "info" && "bg-info/10 text-info",
          tone === "warning" && "bg-warning/10 text-warning",
        )}
      >
        {tone === "danger" ? "!" : tone === "info" ? "↗" : "↺"}
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={cn("mt-1 text-base font-extrabold", tone === "danger" ? "text-danger" : "text-foreground")}>{value}</div>
      </div>
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
  const allLaboratoryPrint = firstResult?.department === "laboratory" && (payload?.records.length ?? 0) > 1;
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
            padding: 14mm 12mm 46mm;
            position: absolute;
            top: 0;
            width: 100%;
          }

          .result-print-header {
            align-items: flex-start;
            border-bottom: 1px solid #d5dae7;
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
          }

          .result-print-title {
            color: #1e40af !important;
            font-size: 17px;
            font-weight: 800;
            letter-spacing: 0.02em;
          }

          .result-print-logo {
            height: 34px;
            object-fit: contain;
            width: 100px;
          }

          .result-print-patient-box {
            border: 1px solid #d5dae7;
            border-radius: 4px;
            margin-bottom: 22px;
            overflow: hidden;
          }

          .result-print-section-title {
            border-bottom: 1px solid #d5dae7;
            color: #111827 !important;
            font-size: 9px;
            font-weight: 800;
            padding: 7px 9px;
          }

          .result-print-patient-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 34px;
            padding: 8px 9px;
          }

          .result-print-field-line {
            display: grid;
            font-size: 8px;
            gap: 12px;
            grid-template-columns: 86px 1fr;
            line-height: 1.35;
            padding: 2px 0;
          }

          .result-print-field-line strong {
            color: #4b5563 !important;
          }

          .result-print-footer {
            background: #f7fbff !important;
            border: 1px solid #bfc7d5;
            border-radius: 4px;
            bottom: 12mm;
            color: #1f2937 !important;
            display: grid;
            grid-template-columns: 48px 1fr 118px;
            gap: 12px;
            left: 12mm;
            position: fixed;
            right: 12mm;
            padding: 8px;
          }

          .result-print-qr {
            background: #fff !important;
            border: 1px solid #111827;
            height: 42px;
            object-fit: contain;
            padding: 2px;
            width: 42px;
          }

          .result-print-footer-main {
            font-size: 8px;
            line-height: 1.35;
          }

          .result-print-footer-row {
            display: grid;
            gap: 10px;
            grid-template-columns: 78px 1fr;
            margin-bottom: 4px;
          }

          .result-print-footer-contact {
            color: #1e40af !important;
            display: flex;
            gap: 18px;
            margin-top: 5px;
          }

          .result-print-signatory {
            font-size: 7px;
            line-height: 1.35;
            text-align: center;
          }

          .result-print-sign-line {
            border-top: 1px solid #111827;
            margin: 17px 7px 4px;
          }

          .result-print-disclaimer {
            color: #475569 !important;
            font-size: 6.5px;
            margin-top: 5px;
          }

          .result-print-page {
            bottom: 3mm;
            color: #5b6675 !important;
            font-size: 7px;
            position: fixed;
            right: 12mm;
          }

          .result-print-root table {
            border-collapse: collapse;
            font-size: 10px;
            width: 100%;
          }

          .result-print-root th,
          .result-print-root td {
            border: 1px solid #d5dae7;
            padding: 5px 6px;
            text-align: left;
            vertical-align: top;
          }

          .result-print-root th {
            background: #eef3fb !important;
            color: #4b5563 !important;
            font-size: 9px;
            text-transform: uppercase;
          }

          @page {
            margin: 0;
          }
        }
      `}</style>

      {typeof document !== "undefined" && payload && firstResult ? createPortal(
        <div className="result-print-root">
          <div className="result-print-header">
            <div className="result-print-title">LABORATORY REPORT</div>
            <img alt="Plasmit Hospital" className="result-print-logo" src="/plasmit-sidebar-logo.webp" />
          </div>

          <section className="result-print-patient-box">
            <div className="result-print-section-title">Patient Information</div>
            <div className="result-print-patient-grid">
              <div>
                <PrintLineField label="Patient Name:" value={patientContext?.name ?? firstResult.patientName} />
                <PrintLineField label="MRN:" value={patientContext?.mrn ?? firstResult.mrn} />
                <PrintLineField label="Age / Gender:" value={`${ageGender.age} / ${ageGender.gender}`} />
                <PrintLineField label="Doctor Name:" value={patientContext?.consultantDoctor ?? firstResult.orderingDoctor} />
              </div>
              <div>
                <PrintLineField label="Sample Collection:" value={formatDateTime(firstResult.collectedAt)} />
                <PrintLineField label="Report Date:" value={formatDate(firstResult.completedAt ?? firstResult.orderedAt)} />
                <PrintLineField label="Report Status:" value="Final" />
                <PrintLineField label="Report ID:" value={payload.records.map((result) => result.id).join(", ")} />
              </div>
            </div>
          </section>

          <section className="mt-5">
            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-primary">
              {allLaboratoryPrint ? "Latest Date Results" : `${getDepartmentLabel(firstResult.department)} Details`}
            </div>
            {allLaboratoryPrint ? (
              <AllLaboratoryPrintTable records={payload.records} />
            ) : (
              payload.records.map((result) => (
                <div className="mb-4 break-inside-avoid" key={`print-${result.id}`}>
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
              ))
            )}
          </section>

          <div className="result-print-footer">
            <PrintQrCode />
            <div className="result-print-footer-main">
              <div className="result-print-footer-row">
                <strong>Booking Centre :-</strong>
                <span>PlasmIT Hospital</span>
              </div>
              <div className="result-print-footer-row">
                <strong>Processing Lab :-</strong>
                <span>PlasmIT Pty Ltd, Level 17, Tower 4, 727 Collins Street, Docklands, Victoria - 3008 Australia</span>
              </div>
              <div className="result-print-footer-contact">
                <span>+61 431 770 499</span>
                <span>info@plasmitvector.com</span>
                <span>www.plasmitvector.com</span>
              </div>
              <div className="result-print-disclaimer">
                All Lab results are subject to clinical interpretation by qualified medical professional and this report is not subject to use for any medico-legal purpose.
              </div>
            </div>
            <div className="result-print-signatory">
              <div className="font-bold">Authorized Signatory</div>
              <div className="result-print-sign-line" />
              <div>Dr. Kavita Rao</div>
              <div>MD Pathology</div>
              <div>Reg. No: MMC12345</div>
            </div>
          </div>
          <div className="result-print-page">Page 1 of 1</div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}

function AllLaboratoryPrintTable({ records }: { records: ResultRecord[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Report</th>
          <th>Sample Type</th>
          <th>Test Name</th>
          <th>Result Value</th>
          <th>Unit</th>
          <th>Reference Range</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {records.map((result) =>
          result.values.map((value, index) => (
            <tr key={`${result.id}-all-print-${value.name}`}>
              {index === 0 ? (
                <>
                  <td rowSpan={result.values.length}>
                    <strong>{result.testName}</strong>
                    <br />
                    {formatDateTime(result.completedAt ?? result.orderedAt)}
                  </td>
                  <td rowSpan={result.values.length}>{result.specimen ?? "-"}</td>
                </>
              ) : null}
              <td>{value.name}</td>
              <td>{value.value}</td>
              <td>{value.unit ?? "-"}</td>
              <td>{value.range ?? "-"}</td>
              <td>{value.flag ?? result.status}</td>
            </tr>
          )),
        )}
      </tbody>
    </table>
  );
}

function PrintQrCode() {
  return <img alt="QR verification code" className="result-print-qr" src="/laboratory-report-qr.png" />;
}

function PrintLineField({ label, value }: { label: string; value: string }) {
  return (
    <div className="result-print-field-line">
      <strong>{label}</strong>
      <span>{value || "-"}</span>
    </div>
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
