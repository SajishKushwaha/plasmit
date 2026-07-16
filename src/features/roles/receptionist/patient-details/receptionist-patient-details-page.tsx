"use client";

import * as React from "react";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  Calculator,
  Camera,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  FolderOpen,
  HeartPulse,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  Smartphone,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { Input } from "@/components/ui/input";
import { NursingIcuModulePage } from "@/features/care-team/nursing-icu/nursing-icu-pages";
import { PatientHistoryPage, type HistoryTab } from "@/features/patient-history/patient-history-page";
import { calculatorDefinitions, initialCalculatorValues, validateCalculator, type CalculationResult } from "@/features/patient-details/medical-calculator-engine";
import {
  applyPatientSection,
  collectPatientSection,
  findPatientRecord,
  getPatientRecordValue,
  readPatientRecords,
  upsertPatientRecordSection,
  writePatientRecords,
  type PatientRecord,
  type PatientRecordSection,
} from "@/features/patient-list/patient-records";

const fieldClass = "space-y-1.5";
const labelClass = "text-xs font-medium text-foreground";
const radioLabelClass = "inline-flex min-h-7 items-center gap-2 rounded-md px-1 text-xs text-foreground";
const radioInputClass =
  "h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-muted-foreground bg-background shadow-sm transition checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";
const decimalPattern = "[0-9]*[.]?[0-9]*";
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Known"];
const showQuickUpload = false;
const showMedicalCalculator = true;
const patientDetailTabs = [
  { id: "basic", label: "1. Basic Demographics" },
  { id: "triage", label: "2. Triage" },
  { id: "nurse-entry", label: "3. Nurse Entry" },
  { id: "history", label: "4. Patient History" },
  { id: "orders", label: "5. Doctor Orders" },
  { id: "notes", label: "6. ED Notes" },
  { id: "calculator", label: "7. Medical Calculator" },
] as const;
const visiblePatientDetailTabs = patientDetailTabs.filter((tab) => tab.id !== "calculator" || showMedicalCalculator);

const patientHistoryTabOrder: HistoryTab[] = ["medical", "surgical", "medication", "allergy", "social"];

type PatientDetailTab = (typeof patientDetailTabs)[number]["id"];

const patientDocumentSchema = [
  { tabId: "basic", tabLabel: "1. Basic Demographics", fields: ["MRN / Patient ID", "UHID", "Patient Name", "Date of Birth", "Age", "Gender", "Blood Group", "Contact Number", "Email ID", "Address", "City", "State", "PIN Code", "Referred By (Dr. / Facility Name)", "Referred From", "Referral Type", "Referral Contact", "Referral Notes"] },
  { tabId: "triage", tabLabel: "2. Triage", fields: ["Triage Category", "Arrival Time", "Triage Time", "Provisional Diagnosis", "Reason for Transfer", "Referral Unit / Facility", "Accepting Doctor", "Consent Taken", "Checklist Done", "Escort", "Ambulance Type", "Departure Time", "Handover Ack", "Remarks"] },
  { tabId: "nurse-entry", tabLabel: "3. Nurse Entry", fields: ["Patient", "Date", "Time", "Shift", "Recorded by", "Respiratory rate", "O2 saturation", "Blood pressure", "Pulse rate", "Temperature", "GCS score", "Pain score", "Urine output", "Nurse notes"] },
  { tabId: "history", tabLabel: "4. Patient History", fields: ["Past Medical History", "Known Comorbidities", "Past Surgical History", "Current Medications", "Allergy Status", "Allergen and Reaction", "Smoking Status", "Alcohol Use", "Relevant Social History"] },
  { tabId: "orders", tabLabel: "5. Doctor Orders", fields: ["Order Name", "Category", "Priority", "Instructions", "Ordered By", "Ordered At", "Acknowledgement"] },
  { tabId: "notes", tabLabel: "6. ED Notes", fields: ["Note Type", "Doctor", "Department", "Created At", "Status", "Preview"] },
  { tabId: "calculator", tabLabel: "7. Medical Calculator", fields: ["Selected Calculator", "Input Summary", "Result", "Interpretation", "Note / Order Action", "FHIR Observation Reference"] },
] as const;

function getInitialEditingPatientRecord() {
  if (typeof window === "undefined") return null;
  const recordId = new URLSearchParams(window.location.search).get("edit");
  return recordId ? findPatientRecord(recordId) : null;
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return "";
  const birthDate = parseDateValue(dateOfBirth);
  if (!birthDate) return "";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "";
}

function parseDateValue(value: string) {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year || year.length !== 4) return null;
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
  const isValid =
    date.getFullYear() === parsedYear &&
    date.getMonth() === parsedMonth - 1 &&
    date.getDate() === parsedDay;
  return isValid ? date : null;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
}

function textDateToParts(value: string) {
  const parsedDate = parseDateValue(value);
  const fallbackDate = new Date();
  const date = parsedDate ?? fallbackDate;
  return {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  };
}

function datePartsToText(day: number, month: number, year: number) {
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`;
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function yearRangeStart(year: number) {
  return Math.floor(year / 5) * 5;
}

function yearRangeLabel(start: number) {
  return `${start}-${String(start + 5).slice(-2)}`;
}

function yearRangePageStart(year: number) {
  return Math.max(1900, yearRangeStart(year) - 110);
}

function YearRangePicker({
  visibleYear,
  onClose,
  onSelectYear,
  onToday,
}: {
  visibleYear: number;
  onClose: () => void;
  onSelectYear: (year: number) => void;
  onToday: () => void;
}) {
  const currentYear = new Date().getFullYear();
  const firstYear = 1900;
  const currentPageStart = yearRangePageStart(currentYear);
  const [pageStart, setPageStart] = React.useState(currentPageStart);
  const [selectedRangeStart, setSelectedRangeStart] = React.useState<number | null>(null);
  const ranges = React.useMemo(() => Array.from({ length: 25 }, (_, index) => pageStart + index * 5), [pageStart]);
  const exactYears = selectedRangeStart ? Array.from({ length: 6 }, (_, index) => selectedRangeStart + index) : [];

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-lg bg-surface">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <Button aria-label="Previous year ranges" disabled={Boolean(selectedRangeStart) || pageStart <= firstYear} onClick={() => setPageStart((year) => Math.max(firstYear, year - 125))} size="icon" type="button" variant="ghost">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {selectedRangeStart ? yearRangeLabel(selectedRangeStart) : `${pageStart}-${String(pageStart + 125).slice(-2)}`}
            </div>
            <Button aria-label="Next year ranges" disabled={Boolean(selectedRangeStart) || pageStart >= currentPageStart} onClick={() => setPageStart((year) => Math.min(currentPageStart, year + 125))} size="icon" type="button" variant="ghost">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground">{selectedRangeStart ? "Choose exact year" : "Choose a 5-year range"}</p>
        </div>
        <div className={selectedRangeStart ? "grid flex-1 grid-cols-3 gap-2 p-3" : "grid flex-1 grid-cols-5 grid-rows-5 gap-1.5 p-3"}>
          {(selectedRangeStart ? exactYears : ranges).map((value) => (
            <button
              className={`rounded-md border px-1 text-xs font-medium transition ${
                selectedRangeStart
                  ? visibleYear === value
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-surface-muted"
                  : visibleYear >= value && visibleYear <= value + 5
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-surface-muted"
              }`}
              key={value}
              onClick={() => {
                if (selectedRangeStart) {
                  onSelectYear(value);
                  onClose();
                } else {
                  setSelectedRangeStart(value);
                }
              }}
              type="button"
            >
              {selectedRangeStart ? value : yearRangeLabel(value)}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border p-3">
          <Button onClick={onToday} type="button" variant="outline">
            Today
          </Button>
          <div className="flex gap-2">
            {selectedRangeStart ? <Button onClick={() => setSelectedRangeStart(null)} type="button" variant="outline">Back</Button> : null}
            <Button onClick={onClose} type="button" variant="outline">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateBmi(height: string, weight: string) {
  const heightCm = Number(height);
  const weightKg = Number(weight);
  if (!heightCm || !weightKg) return "";
  const heightMeters = heightCm / 100;
  return (weightKg / (heightMeters * heightMeters)).toFixed(1);
}

function validateNumericInput(event: React.FormEvent<HTMLInputElement>, label: string, allowDecimal = false) {
  const input = event.currentTarget;
  const value = input.value.trim();
  const numberPattern = allowDecimal ? /^\d*(\.\d*)?$/ : /^\d*$/;
  input.setCustomValidity(value && !numberPattern.test(value) ? `${label} must contain numbers only.` : "");
}

function preventInvalidNumericInput(event: React.FormEvent<HTMLInputElement>, allowDecimal = false) {
  const nativeEvent = event.nativeEvent as InputEvent;
  const input = event.currentTarget;
  const data = nativeEvent.data ?? "";
  if (!data) return;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextValue = `${input.value.slice(0, start)}${data}${input.value.slice(end)}`;
  const numberPattern = allowDecimal ? /^\d*(\.\d*)?$/ : /^\d*$/;
  if (!numberPattern.test(nextValue)) {
    event.preventDefault();
  }
}

function preventInvalidNumericPaste(event: React.ClipboardEvent<HTMLInputElement>, allowDecimal = false) {
  const input = event.currentTarget;
  const paste = event.clipboardData.getData("text");
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const nextValue = `${input.value.slice(0, start)}${paste}${input.value.slice(end)}`;
  const numberPattern = allowDecimal ? /^\d*(\.\d*)?$/ : /^\d*$/;
  if (!numberPattern.test(nextValue)) {
    event.preventDefault();
  }
}

function DateTextInput({
  value,
  onChange,
  required,
}: {
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
}) {
  const [internalValue, setInternalValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() => textDateToParts(value ?? "").month);
  const [visibleYear, setVisibleYear] = React.useState(() => textDateToParts(value ?? "").year);
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const currentValue = value ?? internalValue;
  const selected = parseDateValue(currentValue);
  const monthNames = React.useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
  const totalDays = daysInMonth(visibleMonth, visibleYear);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = formatDateInput(event.target.value);
    setInternalValue(nextValue);
    onChange?.(nextValue);
    const nextDate = parseDateValue(nextValue);
    if (nextDate) {
      setVisibleMonth(nextDate.getMonth());
      setVisibleYear(nextDate.getFullYear());
    }
  }

  function updatePopoverPosition() {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(352, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= 360 ? rect.bottom + 8 : Math.max(16, rect.top - 360);
    setPopoverStyle({ left, top, width });
  }

  function openCalendar() {
    const today = new Date();
    updatePopoverPosition();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    setYearPickerOpen(false);
    setOpen(true);
  }

  function toggleCalendar() {
    if (open) {
      setOpen(false);
      setYearPickerOpen(false);
      return;
    }
    openCalendar();
  }

  function selectDate(day: number) {
    const nextValue = datePartsToText(day, visibleMonth, visibleYear);
    setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  }

  function moveMonth(direction: -1 | 1) {
    const nextDate = new Date(visibleYear, visibleMonth + direction, 1);
    setVisibleMonth(nextDate.getMonth());
    setVisibleYear(nextDate.getFullYear());
  }

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleViewportChange() {
      if (open) updatePopoverPosition();
    }

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  function selectToday() {
    const today = new Date();
    const nextValue = datePartsToText(today.getDate(), today.getMonth(), today.getFullYear());
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    setInternalValue(nextValue);
    onChange?.(nextValue);
    setOpen(false);
  }

  function selectTodayYear() {
    const today = new Date();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    setYearPickerOpen(false);
  }

  function clearDate() {
    setInternalValue("");
    onChange?.("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          aria-label="Select date"
          inputMode="numeric"
          maxLength={10}
          onBeforeInput={(event) => preventInvalidNumericInput(event)}
          onChange={handleChange}
          onFocus={openCalendar}
          onPaste={(event) => preventInvalidNumericPaste(event)}
          placeholder="DD / MM / YYYY"
          required={required}
          value={currentValue}
        />
        <button
          aria-label="Open date selector"
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground"
          onClick={toggleCalendar}
          type="button"
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="fixed z-[100] h-[356px] rounded-lg border border-border bg-surface p-3 shadow-soft" style={popoverStyle}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button aria-label="Previous month" onClick={() => moveMonth(-1)} size="icon" type="button" variant="ghost">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="grid flex-1 grid-cols-[1fr_6rem] gap-2">
              <select
                aria-label="Select month"
                className={selectClass}
                onChange={(event) => setVisibleMonth(Number(event.target.value))}
                value={visibleMonth}
              >
                {monthNames.map((monthName, index) => (
                  <option key={monthName} value={index}>
                    {monthName}
                  </option>
                ))}
              </select>
              <button aria-label="Select year" className={selectClass} onClick={() => setYearPickerOpen(true)} type="button">
                <span className="flex-1 text-left">{visibleYear}</span>
                <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </button>
            </div>
            <Button aria-label="Next month" onClick={() => moveMonth(1)} size="icon" type="button" variant="ghost">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
              <span key={dayName}>{dayName}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: new Date(visibleYear, visibleMonth, 1).getDay() }).map((_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {Array.from({ length: totalDays }).map((_, index) => {
              const day = index + 1;
              const active =
                selected?.getDate() === day &&
                selected.getMonth() === visibleMonth &&
                selected.getFullYear() === visibleYear;
              return (
                <button
                  className={`h-8 rounded-md text-xs font-medium transition ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-surface-muted"
                  }`}
                  key={day}
                  onClick={() => selectDate(day)}
                  type="button"
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <Button onClick={clearDate} size="sm" type="button" variant="ghost">
              Clear
            </Button>
            <Button onClick={selectToday} size="sm" type="button" variant="outline">
              Today
            </Button>
          </div>
          {yearPickerOpen ? <YearRangePicker onClose={() => setYearPickerOpen(false)} onSelectYear={setVisibleYear} onToday={selectTodayYear} visibleYear={visibleYear} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`${fieldClass} ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function RadioOption({ label, name }: { label: string; name: string }) {
  return (
    <label className={radioLabelClass}>
      <input className={radioInputClass} name={name} type="radio" />
      <span className="leading-5">{label}</span>
    </label>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  hideHeader,
  hideIcon,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
  hideHeader?: boolean;
  hideIcon?: boolean;
}) {
  return (
    <Card className="overflow-visible">
      {hideHeader ? null : (
        <CardHeader className="bg-surface-muted/60">
          <div className="flex items-center gap-2">
            {hideIcon ? null : (
              <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <CardTitle>{title}</CardTitle>
          </div>
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const patientDoctorOrders = [
  {
    id: "order-admission",
    name: "ICU admission preparation",
    category: "Admission",
    priority: "Critical",
    instructions: "Prepare ICU receiving bay, verify monitors, keep resuscitation support ready, and coordinate handoff with the admitting doctor.",
    orderedBy: "Dr. Nisha Kapoor",
    orderedAt: "Today, 12:42 PM",
    acknowledgement: "Pending receptionist acknowledgement",
  },
  {
    id: "order-diagnostics",
    name: "Initial labs and imaging",
    category: "Diagnostics",
    priority: "Urgent",
    instructions: "Coordinate CBC, electrolytes, ABG, ECG, chest imaging, and attach external reports to the admission record.",
    orderedBy: "Dr. Nisha Kapoor",
    orderedAt: "Today, 12:44 PM",
    acknowledgement: "Nursing team notified",
  },
  {
    id: "order-handoff",
    name: "Clinical handoff confirmation",
    category: "Handoff",
    priority: "Urgent",
    instructions: "Confirm referring hospital handoff, ambulance ETA, patient contact details, and receiving ICU readiness before transfer.",
    orderedBy: "Dr. Nisha Kapoor",
    orderedAt: "Today, 12:47 PM",
    acknowledgement: "Reception follow-up required",
  },
];

const triageCategories = [
  {
    code: "RED",
    priority: "P1 - Immediate",
    meaning: "Life-threatening; resuscitation needed",
    examples: "Cardiac arrest, major trauma, severe breathing difficulty, unresponsive, active seizure",
    target: "Immediate (0 min)",
    action: "Resuscitation bay; continuous monitoring; senior EM doctor",
    color: "border-red-200 bg-red-50 text-red-700",
  },
  {
    code: "YELLOW",
    priority: "P2 - Urgent",
    meaning: "Serious but stable; can deteriorate",
    examples: "Chest pain (stable), moderate trauma, high fever with red flags, fractures",
    target: "Within 15 min",
    action: "Acute care bay; monitoring; investigations initiated",
    color: "border-yellow-200 bg-yellow-50 text-yellow-700",
  },
  {
    code: "GREEN",
    priority: "P3 - Non-urgent",
    meaning: "Minor illness/injury",
    examples: "Minor wounds, sprains, mild fever, medication refill",
    target: "Within 30-60 min",
    action: "Ambulatory / fast-track area",
    color: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    code: "BLACK",
    priority: "P0 - Deceased",
    meaning: "Brought dead / no signs of life",
    examples: "Declared as per protocol",
    target: "Immediate declaration by doctor",
    action: "MLC & documentation as per policy",
    color: "border-slate-300 bg-slate-100 text-slate-700",
  },
];

type TriageDocumentCategory = "Referral Letter" | "Lab Reports" | "Radiology" | "Prescription" | "Consent" | "Insurance" | "Identity" | "Others";
type TriageUploadStatus = "Ready" | "Uploading" | "Uploaded" | "Failed";
type TriageOcrStatus = "Pending" | "Processing" | "Verification Ready" | "Failed";
type TriageModal = "camera" | "qr" | "mobile" | "bulk" | "print" | "notify-icu" | "notify-doctor" | "notify-nurse" | "reserve-bed" | null;

type TriageUploadedDocument = {
  id: string;
  name: string;
  originalName: string;
  category: TriageDocumentCategory;
  type: string;
  size: number;
  status: TriageUploadStatus;
  progress: number;
  ocrStatus: TriageOcrStatus;
  uploadedBy: string;
  uploadedAt: string;
  file?: File;
  objectUrl?: string;
  error?: string;
};

const triageDocumentCategories: TriageDocumentCategory[] = ["Referral Letter", "Lab Reports", "Radiology", "Prescription", "Consent", "Insurance", "Identity", "Others"];
const triageAcceptedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const triageMaxFileSize = 20 * 1024 * 1024;

function createTriageId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeTriageFileName(name: string) {
  return name.replace(/[^\w.\-() ]/g, "_").replace(/\s+/g, " ").trim();
}

function inferTriageMimeType(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "";
}

function validateTriageFile(file: File, safeName: string) {
  const mimeType = file.type || inferTriageMimeType(safeName);
  if (!triageAcceptedMimeTypes.has(mimeType)) return `${safeName}: unsupported format. Use PDF, JPG, PNG, DOC, or DOCX.`;
  if (file.size > triageMaxFileSize) return `${safeName}: file must be 20 MB or smaller.`;
  return "";
}

function detectTriageCategory(fileName: string): TriageDocumentCategory {
  const lower = fileName.toLowerCase();
  if (lower.includes("lab") || lower.includes("pathology") || lower.includes("cbc") || lower.includes("abg")) return "Lab Reports";
  if (lower.includes("xray") || lower.includes("x-ray") || lower.includes("ct") || lower.includes("mri") || lower.includes("radio")) return "Radiology";
  if (lower.includes("rx") || lower.includes("prescription") || lower.includes("medicine")) return "Prescription";
  if (lower.includes("consent")) return "Consent";
  if (lower.includes("insurance") || lower.includes("policy") || lower.includes("tpa")) return "Insurance";
  if (lower.includes("id") || lower.includes("aadhaar") || lower.includes("identity")) return "Identity";
  if (lower.includes("ref") || lower.includes("letter") || lower.includes("sbar")) return "Referral Letter";
  return "Others";
}

function formatTriageFileSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function parseTriageQr(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as Partial<{ referralId: string; patientId: string; uhid: string; hospitalName: string; reportUrl: string; token: string }>;
    if (parsed.referralId || parsed.uhid || parsed.token) return parsed;
  } catch {
    // Legacy pipe-delimited referral QR fallback.
  }
  const [referralId, patientId, uhid, hospitalName, token] = trimmed.split("|").map((part) => part.trim());
  if (!referralId && !uhid) return null;
  return { referralId, patientId, uhid, hospitalName, token };
}

function printTriagePacket(label: string, documents: TriageUploadedDocument[]) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    toast.error("Print window was blocked by the browser.");
    return;
  }
  const rows = documents.map((document) => `<tr><td>${document.name}</td><td>${document.category}</td><td>${document.status}</td><td>${document.ocrStatus}</td></tr>`).join("");
  printWindow.document.write(`
    <html>
      <head>
        <title>${label}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:24px;color:#111827}
          h1{font-size:22px;margin:0 0 8px}
          table{width:100%;border-collapse:collapse;margin-top:16px}
          th,td{border:1px solid #d1d5db;padding:8px;text-align:left;font-size:12px}
          .badge{display:inline-block;margin-top:8px;padding:4px 8px;border-radius:999px;background:#fee2e2;color:#991b1b;font-weight:700}
        </style>
      </head>
      <body>
        <h1>${label}</h1>
        <p>ICU Reception Triage Summary • Generated from Patient Details</p>
        <span class="badge">Triage / Transfer</span>
        <table>
          <thead><tr><th>Document</th><th>Category</th><th>Upload</th><th>OCR</th></tr></thead>
          <tbody>${rows || "<tr><td colspan='4'>No uploaded reports attached.</td></tr>"}</tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function triageApiDelay(ms = 180) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function requestTriageSignedUpload(document: TriageUploadedDocument) {
  await triageApiDelay();
  return {
    documentId: document.id,
    uploadUrl: `/api/v1/patient-details/triage/documents/${document.id}/upload-url`,
    expiresInSeconds: 900,
  };
}

async function uploadTriageDocumentToApi(document: TriageUploadedDocument) {
  await triageApiDelay();
  return {
    documentId: document.id,
    category: document.category,
    uploaded: true,
  };
}

async function startTriageOcrJob(documentId: string) {
  await triageApiDelay();
  return {
    jobId: `triage-ocr-${documentId}`,
    status: "queued",
  };
}

async function sendTriageEmergencyAction(action: string) {
  await triageApiDelay(220);
  return {
    id: createTriageId("triage-action"),
    action,
    recordedAt: new Date().toISOString(),
  };
}

async function reserveTriageEmergencyBed(bedNo: string) {
  await triageApiDelay(220);
  return {
    reservationId: createTriageId("bed-hold"),
    bedNo,
    expiresInMinutes: 20,
  };
}

function createTriageMobileUploadSession() {
  const token = createTriageId("mobile");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return {
    token,
    link: `${origin}/mobile/reception-upload?token=${token}`,
    expiresInSeconds: 300,
  };
}

function refreshTriageMobileUploadSession() {
  return createTriageMobileUploadSession();
}

function cancelTriageMobileUploadSession(token: string) {
  return { token, revoked: true };
}

function TriageTab() {
  const [documents, setDocuments] = React.useState<TriageUploadedDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<TriageDocumentCategory | "All">("All");
  const [dragActive, setDragActive] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [modal, setModal] = React.useState<TriageModal>(null);
  const [previewDocumentId, setPreviewDocumentId] = React.useState<string | null>(null);
  const [removeDocumentId, setRemoveDocumentId] = React.useState<string | null>(null);
  const browseInputRef = React.useRef<HTMLInputElement | null>(null);
  const bulkInputRef = React.useRef<HTMLInputElement | null>(null);
  const uploadCancelRef = React.useRef(false);
  const visibleDocuments = selectedCategory === "All" ? documents : documents.filter((document) => document.category === selectedCategory);
  const previewDocument = documents.find((document) => document.id === previewDocumentId) ?? null;
  const removeDocument = documents.find((document) => document.id === removeDocumentId) ?? null;
  const validUploadCount = documents.filter((document) => document.status !== "Failed").length;
  const uploadedCount = documents.filter((document) => document.status === "Uploaded").length;
  const overallProgress = documents.length ? Math.round(documents.reduce((sum, document) => sum + document.progress, 0) / documents.length) : 0;
  const saveStatus = uploading ? "Saving..." : "Saved";

  React.useEffect(() => () => {
    documents.forEach((document) => {
      if (document.objectUrl) URL.revokeObjectURL(document.objectUrl);
    });
  }, [documents]);

  function pushError(message: string) {
    setErrors((current) => [...current.slice(-3), message]);
    toast.error(message);
  }

  function addFiles(input: FileList | File[] | null, forcedCategory?: TriageDocumentCategory) {
    if (!input?.length) return;
    const duplicateKeys = new Set(documents.map((document) => `${document.originalName}:${document.size}`));
    const nextDocuments: TriageUploadedDocument[] = [];

    Array.from(input).forEach((file) => {
      const safeName = sanitizeTriageFileName(file.name);
      const validationError = validateTriageFile(file, safeName);
      const duplicateKey = `${safeName}:${file.size}`;
      if (validationError) {
        pushError(validationError);
        return;
      }
      if (duplicateKeys.has(duplicateKey)) {
        pushError(`${safeName}: duplicate file skipped.`);
        return;
      }
      duplicateKeys.add(duplicateKey);
      nextDocuments.push({
        id: createTriageId("triage-doc"),
        name: safeName,
        originalName: safeName,
        category: forcedCategory ?? (selectedCategory === "All" ? detectTriageCategory(safeName) : selectedCategory),
        type: file.type || inferTriageMimeType(safeName),
        size: file.size,
        status: "Ready",
        progress: 0,
        ocrStatus: "Pending",
        uploadedBy: "ICU Reception",
        uploadedAt: new Date().toLocaleString("en-IN"),
        file,
        objectUrl: URL.createObjectURL(file),
      });
    });

    if (!nextDocuments.length) return;
    setDocuments((current) => [...nextDocuments, ...current]);
    toast.success(`${nextDocuments.length} document(s) added.`);
  }

  function updateDocument(documentId: string, update: Partial<TriageUploadedDocument>) {
    setDocuments((current) => current.map((document) => (document.id === documentId ? { ...document, ...update } : document)));
  }

  async function uploadAll() {
    const uploadableDocuments = documents.filter((document) => document.status !== "Uploaded" && document.status !== "Failed");
    if (!uploadableDocuments.length) {
      toast.warning("Select at least one valid report before upload.");
      return;
    }
    setUploading(true);
    uploadCancelRef.current = false;
    for (const document of uploadableDocuments) {
      updateDocument(document.id, { status: "Uploading", progress: 8, error: undefined });
      for (const progress of [22, 44, 68, 86, 100]) {
        await new Promise((resolve) => window.setTimeout(resolve, 140));
        if (uploadCancelRef.current) {
          updateDocument(document.id, { status: "Ready", error: "Upload cancelled" });
          setUploading(false);
          return;
        }
        updateDocument(document.id, { progress });
      }
      await requestTriageSignedUpload(document);
      await uploadTriageDocumentToApi(document);
      updateDocument(document.id, { status: "Uploaded", ocrStatus: "Processing" });
      await startTriageOcrJob(document.id);
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      updateDocument(document.id, { ocrStatus: "Verification Ready" });
    }
    setUploading(false);
    toast.success("Reports uploaded and ready for verification.");
  }

  function removeConfirmed() {
    if (!removeDocumentId) return;
    const removed = documents.find((document) => document.id === removeDocumentId);
    if (removed?.objectUrl) URL.revokeObjectURL(removed.objectUrl);
    setDocuments((current) => current.filter((document) => document.id !== removeDocumentId));
    setRemoveDocumentId(null);
    setPreviewDocumentId(null);
    toast.success("Document removed.");
  }

  async function notifyEmergency(action: string) {
    await sendTriageEmergencyAction(action);
    toast.success(`${action} sent and audit timeline updated.`);
    setModal(null);
  }

  function onDrop(event: React.DragEvent<HTMLElement>, category?: TriageDocumentCategory) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files, category);
  }

  return (
    <div className="mt-2 space-y-3" data-patient-tab="triage">
      <SectionCard icon={HeartPulse} title="2. ED Triage & Transfer">
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <Field label="Date"><Input placeholder="DD / MM / YYYY" /></Field>
            <Field label="UHID"><Input /></Field>
            <Field className="xl:col-span-2" label="Patient Name"><Input /></Field>
            <Field label="Age / Sex"><Input placeholder="54/M" /></Field>
            <Field label="Arrival Time"><Input type="time" /></Field>
            <Field label="Triage Time"><Input type="time" /></Field>
            <Field label="Triage Category">
              <select className={selectClass} defaultValue="">
                <option value="">Select</option>
                {triageCategories.map((category) => <option key={category.code} value={category.code}>{category.code} - {category.priority}</option>)}
              </select>
            </Field>
            <Field className="xl:col-span-2" label="Provisional Diagnosis"><Input placeholder="Acute STEMI" /></Field>
            <Field className="xl:col-span-2" label="Reason for Transfer"><Input placeholder="Primary PCI required" /></Field>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Reports</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{documents.length}</p>
              <p className="text-xs text-muted-foreground">{uploadedCount} uploaded • OCR ready {documents.filter((document) => document.ocrStatus === "Verification Ready").length}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Upload Progress</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{overallProgress}% overall</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Auto Save</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{saveStatus}</p>
              <p className="text-xs text-muted-foreground">Draft metadata preserved in the workflow state.</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-muted p-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Emergency</p>
              <p className="mt-2 text-sm font-semibold text-foreground">ICU handoff ready</p>
              <p className="text-xs text-muted-foreground">Notify, reserve, and print actions below.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="border-b border-border bg-surface-muted px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Triage Matrix</h3>
              <p className="mt-1 text-xs text-muted-foreground">Color-coded ED priority categories and target doctor assessment times.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-xs">
                <thead className="bg-surface-muted text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Code</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Category Meaning</th>
                    <th className="px-3 py-2">Typical Presentations</th>
                    <th className="px-3 py-2">Doctor Assessment</th>
                    <th className="px-3 py-2">Area / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {triageCategories.map((category) => (
                    <tr className="border-t border-border align-top" key={category.code}>
                      <td className="px-3 py-2"><span className={`inline-flex rounded-full border px-2 py-1 font-bold ${category.color}`}>{category.code}</span></td>
                      <td className="px-3 py-2 font-semibold text-foreground">{category.priority}</td>
                      <td className="px-3 py-2 text-muted-foreground">{category.meaning}</td>
                      <td className="px-3 py-2 text-muted-foreground">{category.examples}</td>
                      <td className="px-3 py-2 font-semibold text-foreground">{category.target}</td>
                      <td className="px-3 py-2 text-muted-foreground">{category.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard hideIcon icon={Upload} title="Upload Reports">
        <input
          ref={browseInputRef}
          type="file"
          multiple
          className="hidden"
          accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            addFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <input
          ref={bulkInputRef}
          type="file"
          multiple
          className="hidden"
          accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(event) => {
            addFiles(event.target.files);
            event.currentTarget.value = "";
          }}
        />
        <div
          className={`rounded-lg border border-dashed p-5 text-center transition ${dragActive ? "border-primary bg-primary/5" : "border-border bg-surface-muted/50"}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDrop={(event) => onDrop(event)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              browseInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Upload className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-base font-semibold text-foreground">Drop triage and referral reports here</p>
          <p className="mt-1 text-sm text-muted-foreground">PDF, JPG, PNG, DOC, DOCX • Max 20 MB per file</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            <Button type="button" onClick={() => browseInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Browse
            </Button>
            <Button type="button" variant="outline" onClick={() => setModal("camera")}>
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button type="button" variant="outline" onClick={() => setModal("qr")}>
              <QrCode className="h-4 w-4" />
              QR
            </Button>
            <Button type="button" variant="outline" onClick={() => setModal("mobile")}>
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
            <Button type="button" variant="outline" onClick={() => setModal("bulk")}>
              <FolderOpen className="h-4 w-4" />
              Bulk
            </Button>
          </div>
          {errors.length ? (
            <div className="mx-auto mt-4 max-w-2xl space-y-1 text-left">
              {errors.map((error) => (
                <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger" key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <button
            className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${selectedCategory === "All" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-surface-muted"}`}
            onClick={() => setSelectedCategory("All")}
            type="button"
          >
            All ({documents.length})
          </button>
          {triageDocumentCategories.map((category) => (
            <button
              className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${selectedCategory === category ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-surface-muted"}`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDrop={(event) => onDrop(event, category)}
              type="button"
            >
              {category} ({documents.filter((document) => document.category === category).length})
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Uploaded File List</h3>
              <p className="text-xs text-muted-foreground">{selectedCategory === "All" ? "Showing all categories" : `Filtered by ${selectedCategory}`}</p>
            </div>
            <Button disabled={!validUploadCount || uploading} type="button" onClick={uploadAll}>
              <Upload className="h-4 w-4" />
              {validUploadCount ? `Upload ${validUploadCount} Reports` : "Upload Reports"}
            </Button>
          </div>
          {visibleDocuments.length ? (
            <div className="divide-y divide-border">
              {visibleDocuments.map((document) => (
                <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_160px_140px_140px_160px]" key={document.id}>
                  <button className="min-w-0 text-left" onClick={() => setPreviewDocumentId(document.id)} type="button">
                    <p className="truncate text-sm font-semibold text-foreground">{document.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{document.type || "Unknown type"} • {formatTriageFileSize(document.size)} • {document.uploadedBy}</p>
                    {document.error ? <p className="mt-1 text-xs font-semibold text-danger">{document.error}</p> : null}
                  </button>
                  <select className={selectClass} value={document.category} onChange={(event) => updateDocument(document.id, { category: event.target.value as TriageDocumentCategory })}>
                    {triageDocumentCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{document.status}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${document.progress}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{document.ocrStatus}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button aria-label="Preview document" size="icon" type="button" variant="outline" onClick={() => setPreviewDocumentId(document.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button aria-label="Download document" disabled={!document.objectUrl} size="icon" type="button" variant="outline" onClick={() => {
                      if (!document.objectUrl) return;
                      const link = window.document.createElement("a");
                      link.href = document.objectUrl;
                      link.download = document.name;
                      link.click();
                    }}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button aria-label="Remove document" size="icon" type="button" variant="outline" onClick={() => setRemoveDocumentId(document.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold text-foreground">{selectedCategory === "All" ? "No documents selected yet." : `No ${selectedCategory} documents yet.`}</p>
              <p className="mt-1 text-xs text-muted-foreground">Use Browse, Camera, QR, Mobile, Bulk, or drag files into this area.</p>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard hideIcon icon={ClipboardList} title="Transfer Register">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <Field label="Referral Unit / Facility"><Input placeholder="Cath Lab - Cardiology" /></Field>
          <Field label="Accepting Doctor"><Input placeholder="Dr. A. Sharma" /></Field>
          <Field label="Consent Taken">
            <select className={selectClass} defaultValue=""><option value="">Select</option><option>Y</option><option>N</option></select>
          </Field>
          <Field label="Checklist Done">
            <select className={selectClass} defaultValue=""><option value="">Select</option><option>Y</option><option>N</option></select>
          </Field>
          <Field label="Escort"><Input placeholder="Doctor + Nurse" /></Field>
          <Field label="Ambulance Type">
            <select className={selectClass} defaultValue=""><option value="">Select</option><option>ACLS</option><option>BLS</option><option>NA (Internal)</option></select>
          </Field>
          <Field label="Departure Time"><Input type="time" /></Field>
          <Field label="Handover Ack">
            <select className={selectClass} defaultValue=""><option value="">Select</option><option>Y</option><option>N</option></select>
          </Field>
          <Field className="md:col-span-2 xl:col-span-4" label="Remarks"><Input placeholder="Door-to-decision 22 min" /></Field>
        </div>
      </SectionCard>

      <SectionCard hideIcon icon={AlertTriangle} title="Emergency Actions">
        <div className="grid gap-2 md:grid-cols-5">
          <Button type="button" variant="outline" onClick={() => setModal("notify-icu")}>
            <AlertTriangle className="h-4 w-4" />
            Notify ICU
          </Button>
          <Button type="button" variant="outline" onClick={() => setModal("notify-doctor")}>Notify Doctor</Button>
          <Button type="button" variant="outline" onClick={() => setModal("notify-nurse")}>Notify Nurse</Button>
          <Button type="button" variant="outline" onClick={() => setModal("reserve-bed")}>
            <BedDouble className="h-4 w-4" />
            Reserve Bed
          </Button>
          <Button type="button" variant="outline" onClick={() => printTriagePacket("Emergency Referral Summary", documents)}>
            <Printer className="h-4 w-4" />
            Emergency Print
          </Button>
        </div>
      </SectionCard>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setModal("print")}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button type="button" variant="outline" onClick={() => toast.success("Current triage draft saved. Next patient queue is ready.")}>
          <RefreshCw className="h-4 w-4" />
          Open Next Patient
        </Button>
      </div>

      <CenterModal open={modal === "camera"} onOpenChange={(open) => !open && setModal(null)} title="Camera Capture" description="Capture a referral report photo and attach it to the triage document list.">
        <TriageCameraPanel onAddFile={(file, category) => addFiles([file], category)} onClose={() => setModal(null)} />
      </CenterModal>

      <CenterModal open={modal === "qr"} onOpenChange={(open) => !open && setModal(null)} title="Referral QR Scanner" description="Scan camera preview or enter referral QR data manually.">
        <TriageQrPanel onApply={(message) => {
          toast.success(message);
          setModal(null);
        }} />
      </CenterModal>

      <CenterModal open={modal === "mobile"} onOpenChange={(open) => !open && setModal(null)} title="Mobile Upload Session" description="Generate a short-lived QR/link for attendant phone uploads.">
        <TriageMobilePanel onAddDemoFile={() => {
          const demo = new File(["mobile referral image"], `mobile-referral-${Date.now()}.jpg`, { type: "image/jpeg" });
          addFiles([demo], "Referral Letter");
        }} />
      </CenterModal>

      <CenterModal open={modal === "bulk"} onOpenChange={(open) => !open && setModal(null)} title="Bulk Upload" description="Select many files, auto-categorize them, then preserve successful uploads if one fails.">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <p className="text-sm font-semibold text-foreground">Bulk queue controls</p>
            <p className="mt-1 text-sm text-muted-foreground">Files are categorized by filename and validated before entering the upload list.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => bulkInputRef.current?.click()}>
              <FolderOpen className="h-4 w-4" />
              Select Files
            </Button>
            <Button type="button" variant="outline" onClick={() => {
              const demo = new File(["bulk referral content"], `bulk-referral-${Date.now()}.pdf`, { type: "application/pdf" });
              addFiles([demo], "Referral Letter");
              toast.success("Demo bulk report added.");
            }}>Add Demo Bulk File</Button>
            <Button type="button" variant="outline" onClick={() => toast.info("Pause/Resume queue control is ready for backend upload workers.")}>Pause / Resume</Button>
            <Button type="button" variant="outline" onClick={() => toast.info("Retry failed files queued.")}>Retry Failed</Button>
          </div>
        </div>
      </CenterModal>

      <CenterModal open={modal === "print"} onOpenChange={(open) => !open && setModal(null)} title="Print Triage Packet">
        <div className="grid gap-2 sm:grid-cols-2">
          {["Uploaded Document List", "Referral Summary", "Patient Labels", "Temporary Admission Sheet", "Emergency Summary"].map((label) => (
            <Button key={label} type="button" variant="outline" onClick={() => printTriagePacket(label, documents)}>
              <Printer className="h-4 w-4" />
              Print {label}
            </Button>
          ))}
        </div>
      </CenterModal>

      <CenterModal open={Boolean(modal && ["notify-icu", "notify-doctor", "notify-nurse", "reserve-bed"].includes(modal))} onOpenChange={(open) => !open && setModal(null)} title="Confirm Emergency Action">
        <div className="space-y-4">
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
            <p className="text-sm font-semibold text-foreground">{modal === "reserve-bed" ? "Reserve ICU Bed" : "Send emergency notification"}</p>
            <p className="mt-1 text-sm text-muted-foreground">This action will be recorded in the triage audit timeline with timestamp and user context.</p>
          </div>
          {modal === "reserve-bed" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {["ICU-01", "ICU-04", "CCU-02"].map((bed) => (
                <button className="rounded-lg border border-border bg-background p-3 text-left hover:border-primary" key={bed} onClick={async () => {
                  await reserveTriageEmergencyBed(bed);
                  await notifyEmergency(`${bed} reserved for 20 minutes`);
                }} type="button">
                  <p className="text-sm font-semibold text-foreground">{bed}</p>
                  <p className="text-xs text-muted-foreground">Available • temporary hold</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModal(null)}>Cancel</Button>
              <Button type="button" onClick={() => notifyEmergency(modal === "notify-icu" ? "ICU notification" : modal === "notify-doctor" ? "Doctor notification" : "Nurse notification")}>Confirm</Button>
            </div>
          )}
        </div>
      </CenterModal>

      <CenterModal open={Boolean(previewDocument)} onOpenChange={(open) => !open && setPreviewDocumentId(null)} title="Report Preview" description="Preview, verification, category, download, and delete actions.">
        {previewDocument ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <p className="text-base font-semibold text-foreground">{previewDocument.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{previewDocument.category} • {formatTriageFileSize(previewDocument.size)} • {previewDocument.uploadedAt}</p>
            </div>
            {previewDocument.objectUrl && previewDocument.type.startsWith("image/") ? (
              <img alt={previewDocument.name} className="max-h-[56vh] w-full rounded-lg border border-border object-contain" src={previewDocument.objectUrl} />
            ) : previewDocument.objectUrl && previewDocument.type === "application/pdf" ? (
              <iframe className="h-[56vh] w-full rounded-lg border border-border" src={previewDocument.objectUrl} title={previewDocument.name} />
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Preview is not available for this file type. Use download instead.</div>
            )}
            <div className="grid gap-3 sm:grid-cols-4">
              <select className={selectClass} value={previewDocument.category} onChange={(event) => updateDocument(previewDocument.id, { category: event.target.value as TriageDocumentCategory })}>
                {triageDocumentCategories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <Button type="button" variant="outline" onClick={() => updateDocument(previewDocument.id, { ocrStatus: "Verification Ready" })}>
                <CheckCircle2 className="h-4 w-4" />
                Verify
              </Button>
              <Button disabled={!previewDocument.objectUrl} type="button" variant="outline" onClick={() => {
                if (!previewDocument.objectUrl) return;
                const link = window.document.createElement("a");
                link.href = previewDocument.objectUrl;
                link.download = previewDocument.name;
                link.click();
              }}>
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button type="button" variant="outline" onClick={() => setRemoveDocumentId(previewDocument.id)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </CenterModal>

      <CenterModal open={Boolean(removeDocument)} onOpenChange={(open) => !open && setRemoveDocumentId(null)} title="Delete Uploaded Report">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Delete <span className="font-semibold text-foreground">{removeDocument?.name}</span>? This confirmation prevents accidental removal from the triage packet.</p>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRemoveDocumentId(null)}>Cancel</Button>
            <Button type="button" onClick={removeConfirmed}>Delete</Button>
          </div>
        </div>
      </CenterModal>
    </div>
  );
}

function TriageCameraPanel({
  onAddFile,
  onClose,
}: {
  onAddFile: (file: File, category: TriageDocumentCategory) => void;
  onClose: () => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const capturedUrlRef = React.useRef("");
  const [error, setError] = React.useState("");
  const [capturedUrl, setCapturedUrl] = React.useState("");
  const [capturedFile, setCapturedFile] = React.useState<File | null>(null);
  const [category, setCategory] = React.useState<TriageDocumentCategory>("Referral Letter");

  React.useEffect(() => {
    let active = true;
    async function openCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setError("Camera is not available in this browser. Use Browse as fallback.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError("Camera permission denied or unavailable. Use Browse as fallback.");
      }
    }
    openCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (capturedUrlRef.current) URL.revokeObjectURL(capturedUrlRef.current);
    };
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = window.document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const context = canvas.getContext("2d");
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (capturedUrlRef.current) URL.revokeObjectURL(capturedUrlRef.current);
      const file = new File([blob], `camera-triage-${Date.now()}.jpg`, { type: "image/jpeg" });
      const objectUrl = URL.createObjectURL(blob);
      capturedUrlRef.current = objectUrl;
      setCapturedFile(file);
      setCapturedUrl(objectUrl);
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">{error}</p> : null}
      <div className="overflow-hidden rounded-lg border border-border bg-black">
        {capturedUrl ? <img alt="Captured report" className="max-h-[52vh] w-full object-contain" src={capturedUrl} /> : <video ref={videoRef} autoPlay muted playsInline className="max-h-[52vh] w-full object-contain" />}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <select className={selectClass} value={category} onChange={(event) => setCategory(event.target.value as TriageDocumentCategory)}>
          {triageDocumentCategories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <Button type="button" variant="outline" onClick={capturePhoto}>{capturedUrl ? "Retake" : "Capture"}</Button>
        <Button disabled={!capturedFile} type="button" onClick={() => {
          if (!capturedFile) return;
          onAddFile(capturedFile, category);
          onClose();
        }}>Use Photo</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  );
}

function TriageQrPanel({ onApply }: { onApply: (message: string) => void }) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [manualCode, setManualCode] = React.useState("");
  const [scanError, setScanError] = React.useState("");
  const [parsedResult, setParsedResult] = React.useState<ReturnType<typeof parseTriageQr>>(null);

  React.useEffect(() => {
    let active = true;
    async function openCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          setScanError("Camera scanner unavailable. Enter QR data manually.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setScanError("QR camera access unavailable. Enter the QR code manually.");
      }
    }
    openCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function parseManualCode() {
    const parsed = parseTriageQr(manualCode);
    if (!parsed) {
      setParsedResult(null);
      setScanError("Invalid, unsupported, or expired QR data.");
      return;
    }
    setScanError("");
    setParsedResult(parsed);
  }

  return (
    <div className="space-y-4">
      {scanError ? <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">{scanError}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <video ref={videoRef} autoPlay muted playsInline className="h-64 w-full object-cover" />
        </div>
        <div className="space-y-3">
          <Field label="Manual QR Code / Referral Token">
            <Input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder='{"referralId":"REF-1002","uhid":"UHID-2210","token":"secure"}' />
          </Field>
          <Button type="button" variant="outline" onClick={parseManualCode}>Validate QR</Button>
          {parsedResult ? (
            <div className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm">
              <p className="font-semibold text-foreground">Extracted QR result</p>
              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(parsedResult, null, 2)}</pre>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex justify-end">
        <Button disabled={!parsedResult} type="button" onClick={() => onApply(`QR applied: ${parsedResult?.referralId ?? parsedResult?.uhid ?? "Referral context"}`)}>Apply QR Result</Button>
      </div>
    </div>
  );
}

function TriageMobilePanel({ onAddDemoFile }: { onAddDemoFile: () => void }) {
  const [session, setSession] = React.useState(() => createTriageMobileUploadSession());
  const [remaining, setRemaining] = React.useState(300);
  const link = session.link;
  const state = remaining <= 0 ? "Expired" : remaining < 260 ? "Connected" : "Waiting for mobile";

  React.useEffect(() => {
    const interval = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [session.token]);

  function refreshSession() {
    const nextSession = refreshTriageMobileUploadSession();
    setSession(nextSession);
    setRemaining(nextSession.expiresInSeconds);
    toast.success("New mobile upload QR generated.");
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="rounded-lg border border-border bg-white p-4 text-center">
        <img className="mx-auto h-44 w-44 rounded-md border border-border bg-white p-2" src={`https://api.qrserver.com/v1/create-qr-code/?size=176x176&data=${encodeURIComponent(link)}`} alt="Mobile upload QR" />
        <p className="mt-3 text-xs font-semibold text-muted-foreground">Expires in {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>
      </div>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <p className="text-sm font-semibold text-foreground">Connection state: {state}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">{link}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={refreshSession}>New QR</Button>
          <Button type="button" variant="outline" onClick={() => {
            navigator.clipboard?.writeText(link);
            toast.success("Upload link copied.");
          }}>Copy Link</Button>
          <Button disabled={remaining <= 0} type="button" variant="outline" onClick={onAddDemoFile}>Simulate Arriving File</Button>
          <Button type="button" variant="outline" onClick={() => {
            cancelTriageMobileUploadSession(session.token);
            setRemaining(0);
            toast.success("Mobile upload session revoked.");
          }}>Revoke Session</Button>
        </div>
      </div>
    </div>
  );
}

function DoctorOrdersTab() {
  return (
    <div className="mt-2" data-patient-tab="orders">
      <SectionCard icon={ClipboardList} title="5. Doctor Orders">
        <div className="space-y-3">
          {patientDoctorOrders.map((order) => (
            <div className="rounded-md border border-border bg-background p-4" key={order.id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{order.name}</h3>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{order.category}</span>
                    <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-semibold text-warning">{order.priority}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{order.instructions}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{order.orderedBy} • {order.orderedAt} • {order.acknowledgement}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" type="button">Notify Doctor</Button>
                  <Button size="sm" variant="outline" type="button">Print Orders</Button>
                  <Button size="sm" variant="outline" type="button">Acknowledge</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function DoctorNotesTab() {
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);
  const [edNotes, setEdNotes] = React.useState<Array<{ id: string; type: string; specialty: string; provider: string; note: string; createdAt: string }>>([]);
  const [newNote, setNewNote] = React.useState({
    type: "ED Initial Note",
    specialty: "Emergency Medicine",
    provider: "",
    note: "",
  });

  const handleCreateNote = () => {
    if (!newNote.provider.trim() || !newNote.note.trim()) {
      toast.error("Provider name and note are required.");
      return;
    }

    setEdNotes((notes) => [
      {
        id: `ed-note-${Date.now()}`,
        type: newNote.type,
        specialty: newNote.specialty,
        provider: newNote.provider.trim(),
        note: newNote.note.trim(),
        createdAt: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          hour: "2-digit",
          hour12: true,
          minute: "2-digit",
          month: "short",
        }),
      },
      ...notes,
    ]);
    setNewNote({ type: "ED Initial Note", specialty: "Emergency Medicine", provider: "", note: "" });
    setIsNewNoteOpen(false);
    toast.success("ED note created successfully.");
  };

  return (
    <div className="mt-2" data-patient-tab="notes">
      <Card className="min-h-[420px] overflow-hidden">
        <CardHeader className="border-b border-border bg-background p-0">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <HeartPulse className="h-5 w-5" />
              </span>
              <CardTitle className="text-lg font-semibold">ED Notes</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full px-4" size="sm" type="button" variant="outline">
                All Notes
              </Button>
              <Button className="rounded-full px-4" size="sm" type="button" onClick={() => setIsNewNoteOpen(true)}>
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">All ED specialties</p>
            <p className="text-sm font-medium text-muted-foreground">{edNotes.length} {edNotes.length === 1 ? "note" : "notes"}</p>
          </div>
        </CardHeader>
        <CardContent className={edNotes.length ? "min-h-[330px] space-y-3 p-4" : "flex min-h-[330px] items-center justify-center p-6"}>
          {edNotes.length ? (
            edNotes.map((note) => (
              <div className="rounded-md border border-border bg-background p-4" key={note.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{note.type}</span>
                      <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">{note.specialty}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-foreground">{note.provider}</p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">{note.createdAt}</p>
                    <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{note.note}</p>
                  </div>
                  <Button size="sm" type="button" variant="outline">View Note</Button>
                </div>
              </div>
            ))
          ) : (
            <div className="max-w-sm text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/45" />
              <h3 className="mt-4 text-base font-semibold text-foreground">No notes in ED Notes</h3>
              <p className="mt-1 text-sm font-medium text-muted-foreground">Create the first note for this specialty.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <CenterModal
        bodyClassName="p-4 sm:p-5"
        className="w-[min(94vw,720px)]"
        description="Add a receptionist-visible ED note for the current patient."
        onOpenChange={setIsNewNoteOpen}
        open={isNewNoteOpen}
        title="New ED Note"
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Note Type">
              <select className={selectClass} value={newNote.type} onChange={(event) => setNewNote((note) => ({ ...note, type: event.target.value }))}>
                <option>ED Initial Note</option>
                <option>ED Progress Note</option>
                <option>ED Handoff Note</option>
                <option>Procedure Note</option>
              </select>
            </Field>
            <Field label="Specialty">
              <select className={selectClass} value={newNote.specialty} onChange={(event) => setNewNote((note) => ({ ...note, specialty: event.target.value }))}>
                <option>Emergency Medicine</option>
                <option>Critical Care</option>
                <option>Cardiology</option>
                <option>Trauma</option>
                <option>Neurology</option>
              </select>
            </Field>
            <Field className="md:col-span-2" label="Provider / Doctor">
              <Input placeholder="Enter provider name" value={newNote.provider} onChange={(event) => setNewNote((note) => ({ ...note, provider: event.target.value }))} />
            </Field>
            <div className="space-y-1.5 md:col-span-2" data-patient-field-group>
              <span className={labelClass} data-patient-field-label>ED Note</span>
              <textarea
                className="min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                onChange={(event) => setNewNote((note) => ({ ...note, note: event.target.value }))}
                placeholder="Write ED note details"
                value={newNote.note}
              />
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsNewNoteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateNote}>
              <Save className="h-4 w-4" />
              Save Note
            </Button>
          </div>
        </div>
      </CenterModal>
    </div>
  );
}

function SearchInput({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (value: string) => void }) {
  return (
    <div className="flex">
      <Input className="rounded-r-none" placeholder={placeholder} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} />
      <Button aria-label="Search" className="rounded-l-none border-l-0" size="icon" type="button" variant="outline">
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PatientDetailsPreview({
  record,
  onFieldChange,
}: {
  record: PatientRecord;
  onFieldChange: (tabId: string, fieldIndex: number, value: string) => void;
}) {
  const sections = visiblePatientDetailTabs.map((tab) => {
    const section = record.sections.find((item) => item.tabId === tab.id);
    return section ?? { tabId: tab.id, tabLabel: tab.label, fields: [] };
  });
  const patientName = getPatientRecordValue(record, "Patient Name") || "Patient details preview";

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3 sm:p-5">
      <div className="mx-auto w-full max-w-[210mm] overflow-hidden bg-white text-black shadow-soft">
        <div className="min-h-[297mm] p-6 sm:p-10">
          <div className="border-b-2 border-black pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-1 text-2xl font-bold text-black">Patient Details Preview</h2>
              </div>
              <div className="rounded border border-neutral-300 px-3 py-2 text-right text-xs text-neutral-600">
                <div className="font-semibold text-black">Draft</div>
                <div>{patientName}</div>
              </div>
            </div>
          </div>

          <div className="space-y-7 pt-6">
            {sections.map((section) => (
              <section className="break-inside-avoid" key={`preview-doc-${section.tabId}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-300" />
                  <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-black">{section.tabLabel}</h3>
                  <div className="h-px flex-1 bg-neutral-300" />
                </div>

                {section.fields.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.fields.map((field, index) => (
                      <label className="block rounded border border-neutral-300 p-2" key={`${section.tabId}-${field.label}-${index}`}>
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{field.label}</span>
                        <textarea
                          className="mt-1 min-h-9 w-full resize-y rounded border border-transparent bg-white p-1 text-sm font-medium text-black outline-none transition focus:border-neutral-400"
                          onChange={(event) => onFieldChange(section.tabId, index, event.target.value)}
                          value={field.value}
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-neutral-300 px-3 py-5 text-center text-sm text-neutral-500">
                    No details filled in this section yet.
                  </div>
                )}
              </section>
            ))}
          </div>

        </div>
      </div>

      <div className="mx-auto mt-4 flex w-full max-w-[210mm] justify-end">
        <Button
          onClick={() => {
            toast.success("Patient details submitted.");
          }}
          size="sm"
          type="button"
        >
          Submit
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

type CalculatorScreen = "home" | "input" | "result" | "history" | "favorites" | "settings";
type CalculatorId = "bmi" | "bsa" | "ideal-weight" | "creatinine" | "mdrd" | "gcs" | "apache" | "sofa" | "cha2ds2" | "wells" | "curb65";
type CalculatorCategory = "All" | "Cardiology" | "Critical Care" | "Endocrinology" | "Nephrology" | "Neurology" | "Respiratory" | "Pediatrics" | "Obstetrics";

const medicalCalculators: Array<{
  id: CalculatorId;
  name: string;
  subtitle: string;
  category: Exclude<CalculatorCategory, "All">;
  fhirTarget: string;
}> = [
  { id: "bmi", name: "BMI Calculator", subtitle: "Body Mass Index", category: "Endocrinology", fhirTarget: "Observation" },
  { id: "bsa", name: "BSA Calculator (Mosteller)", subtitle: "Body Surface Area", category: "Endocrinology", fhirTarget: "Observation" },
  { id: "ideal-weight", name: "Ideal Body Weight", subtitle: "Devine formula", category: "Endocrinology", fhirTarget: "Observation" },
  { id: "creatinine", name: "Creatinine Clearance", subtitle: "Cockcroft-Gault", category: "Nephrology", fhirTarget: "Observation + DiagnosticReport" },
  { id: "mdrd", name: "MDRD eGFR", subtitle: "Estimated GFR", category: "Nephrology", fhirTarget: "Observation + DiagnosticReport" },
  { id: "gcs", name: "GCS Score", subtitle: "Glasgow Coma Scale", category: "Neurology", fhirTarget: "Observation + RiskAssessment" },
  { id: "apache", name: "APACHE II Score", subtitle: "ICU mortality risk", category: "Critical Care", fhirTarget: "RiskAssessment" },
  { id: "sofa", name: "SOFA Score", subtitle: "Organ failure assessment", category: "Critical Care", fhirTarget: "RiskAssessment" },
  { id: "cha2ds2", name: "CHA2DS2-VASc Score", subtitle: "Atrial Fibrillation", category: "Cardiology", fhirTarget: "RiskAssessment" },
  { id: "wells", name: "Wells Score (DVT)", subtitle: "DVT Risk Assessment", category: "Critical Care", fhirTarget: "RiskAssessment" },
  { id: "curb65", name: "CURB-65 Score", subtitle: "Pneumonia severity", category: "Respiratory", fhirTarget: "RiskAssessment" },
];

type CalculationHistoryRow = { id: string; time: string; calculator: string; input: string; result: string };

function MedicalCalculatorWorkspace({
  age,
  gender,
  height,
  weight,
}: {
  age: string;
  gender: string;
  height: string;
  weight: string;
}) {
  const [screen, setScreen] = React.useState<CalculatorScreen>("home");
  const [selectedCalculator, setSelectedCalculator] = React.useState<CalculatorId>("creatinine");
  const [favorites, setFavorites] = React.useState<CalculatorId[]>(["creatinine", "bmi", "gcs", "cha2ds2", "wells"]);
  const patientContext = React.useMemo(() => ({ age: age || "63", gender: gender || "Male", weight: weight || "72", height: height || "170", serumCreatinine: "1.1" }), [age, gender, height, weight]);
  const [calculatorValues, setCalculatorValues] = React.useState<Record<string, string>>(() => initialCalculatorValues("creatinine", patientContext));
  const [calculation, setCalculation] = React.useState<CalculationResult | null>(null);
  const [historyRows, setHistoryRows] = React.useState<CalculationHistoryRow[]>([]);

  const selected = medicalCalculators.find((calculator) => calculator.id === selectedCalculator) ?? medicalCalculators[0];
  function updateCalculatorValue(key: string, value: string) {
    setCalculatorValues((current) => ({ ...current, [key]: value }));
    setCalculation(null);
  }

  function toggleFavorite(id: CalculatorId) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function chooseCalculator(id: CalculatorId) {
    setSelectedCalculator(id);
    setCalculatorValues(initialCalculatorValues(id, patientContext));
    setCalculation(null);
    setScreen("input");
  }

  function runCalculation() {
    const invalid = validateCalculator(selectedCalculator, calculatorValues);
    if (invalid) return toast.error(`Enter a valid ${invalid.label}.`);
    const result = calculatorDefinitions[selectedCalculator].calculate(calculatorValues);
    const input = calculatorDefinitions[selectedCalculator].fields.map(field => {
      const raw = calculatorValues[field.key];
      const display = field.type === "checkbox" ? (raw === "1" ? "Yes" : "No") : field.options?.find(option => option.value === raw)?.label ?? `${raw}${field.unit ? ` ${field.unit}` : ""}`;
      return `${field.label}: ${display}`;
    }).join(", ");
    setCalculation(result);
    setHistoryRows(current => [{ id: crypto.randomUUID(), time: new Date().toLocaleString("en-IN"), calculator: selected.name, input, result: `${result.value} ${result.unit}` }, ...current]);
    setScreen("result");
  }

  return (
    <div className="mt-2 space-y-4" data-patient-tab="calculator">
      <SectionCard hideHeader icon={Calculator} title="6. Medical Calculator">
        <div className="space-y-4">
          <div>
            <div className="min-w-0">
              {screen === "home" ? (
                <CalculatorHome selectedCalculator={selectedCalculator} favorites={favorites} onChoose={chooseCalculator} onToggleFavorite={toggleFavorite} />
              ) : null}

              {screen === "input" ? (
                <CalculatorInput values={calculatorValues} selected={selected} onValueChange={updateCalculatorValue} onReset={() => setCalculatorValues(initialCalculatorValues(selectedCalculator, patientContext))} onCalculate={runCalculation} />
              ) : null}

              {screen === "result" ? (
                <CalculatorResult calculation={calculation} selected={selected} onRecalculate={() => setScreen("input")} />
              ) : null}

              {screen === "history" ? <CalculationHistory rows={historyRows} /> : null}

              {screen === "favorites" ? (
                <ManageFavorites favorites={favorites} onChoose={chooseCalculator} onToggleFavorite={toggleFavorite} />
              ) : null}

              {screen === "settings" ? <CalculatorSettings /> : null}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ContextLine({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-border bg-surface p-2">
      <div className="text-[11px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function CalculatorHome({
  favorites,
  onChoose,
  onToggleFavorite,
  selectedCalculator,
}: {
  favorites: CalculatorId[];
  onChoose: (id: CalculatorId) => void;
  onToggleFavorite: (id: CalculatorId) => void;
  selectedCalculator: CalculatorId;
}) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CalculatorCategory>("All");
  const favoriteCalculators = medicalCalculators.filter((calculator) => favorites.includes(calculator.id));
  const categories: CalculatorCategory[] = ["All", "Cardiology", "Critical Care", "Endocrinology", "Nephrology", "Neurology", "Respiratory", "Pediatrics", "Obstetrics"];
  return (
    <div className="space-y-4">
      <div className="w-full max-w-md">
        <SearchInput placeholder="Search calculator..." value={query} onChange={setQuery} />
      </div>
      <div>
        <div className="mb-2 text-sm font-semibold text-foreground">Frequently Used</div>
        <div className="flex gap-2 overflow-x-auto pb-2">
        {favoriteCalculators.map((calculator) => (
          <CalculatorTile active={selectedCalculator === calculator.id} calculator={calculator} key={calculator.id} onChoose={onChoose} onRemove={onToggleFavorite} />
        ))}
        {!favoriteCalculators.length ? <div className="w-full rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">No frequently used calculators yet.</div> : null}
        </div>
      </div>
      <Card>
        <CardHeader className="pb-0"><CardTitle className="text-base">All Calculators</CardTitle></CardHeader>
        <CardContent className="pt-3">
          <div className="mb-3 flex gap-1 overflow-x-auto border-b border-border">
            {categories.map((item) => <button className={`shrink-0 border-b-2 px-3 py-2 text-xs font-medium ${category === item ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`} key={item} onClick={() => setCategory(item)} type="button">{item}</button>)}
          </div>
          <CalculatorList bare category={category} favorites={favorites} onChoose={onChoose} onToggleFavorite={onToggleFavorite} query={query} />
        </CardContent>
      </Card>
    </div>
  );
}

function CalculatorInput({
  onCalculate,
  onReset,
  onValueChange,
  selected,
  values,
}: {
  onCalculate: () => void;
  onReset: () => void;
  onValueChange: (key: string, value: string) => void;
  selected: (typeof medicalCalculators)[number];
  values: Record<string, string>;
}) {
  const definition = calculatorDefinitions[selected.id];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{selected.name} ({selected.subtitle})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {definition.fields.map((field) => field.type === "checkbox" ? (
            <label className="flex min-h-11 items-center gap-3 rounded-md border border-border p-3 text-sm" key={field.key}>
              <input checked={values[field.key] === "1"} type="checkbox" onChange={(event) => onValueChange(field.key, event.target.checked ? "1" : "0")} />
              <span>{field.label}</span>
            </label>
          ) : field.type === "select" ? (
            <Field label={field.label} key={field.key}><select className={selectClass} value={values[field.key]} onChange={(event) => onValueChange(field.key,event.target.value)}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></Field>
          ) : (
            <Field label={`${field.label}${field.unit ? ` (${field.unit})` : ""}`} key={field.key}><Input inputMode="decimal" max={field.max} min={field.min} step={field.step} type="number" value={values[field.key]} onChange={(event) => onValueChange(field.key,event.target.value)} /></Field>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onReset}>Reset</Button>
          <Button type="button" onClick={onCalculate}>Calculate</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CalculatorResult({
  calculation,
  onRecalculate,
  selected,
}: {
  calculation: CalculationResult | null;
  onRecalculate: () => void;
  selected: (typeof medicalCalculators)[number];
}) {
  if (!calculation) return <Card><CardContent className="p-6 text-sm text-muted-foreground">No current result. Return to Input and calculate again.</CardContent></Card>;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{selected.name} ({selected.subtitle})</CardTitle>
          <CardDescription>Calculated result with interpretation and formula trace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-success/25 bg-success/10 p-4">
            <div className="text-xs font-semibold text-success">Result</div>
            <div className="mt-3 text-sm font-semibold text-foreground">{selected.name}</div>
            <div className="mt-1 text-4xl font-bold text-success">{calculation.value} <span className="text-sm font-semibold">{calculation.unit}</span></div>
          </div>
          <ContextLine label="Interpretation" value={calculation.interpretation} />
          <ContextLine label="Formula / score trace" value={calculation.trace} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onRecalculate}>Recalculate</Button>
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><CardTitle className="text-base">Clinical safety</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Verify inputs, units, eligibility criteria, and local protocol. A calculated score supports—but does not replace—clinical judgment.</CardContent></Card>
    </div>
  );
}

function CalculationHistory({ rows }: { rows: CalculationHistoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-base">Calculation History</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="py-2">Date & Time</th>
              <th>Calculator</th>
              <th>Input Summary</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr className="border-b border-border last:border-0" key={row.id}>
                <td className="py-3 text-muted-foreground">{row.time}</td>
                <td className="font-medium text-foreground">{row.calculator}</td>
                <td className="text-muted-foreground">{row.input}</td>
                <td className="font-semibold text-success">{row.result}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td className="py-8 text-center text-muted-foreground" colSpan={4}>No calculations recorded in this session.</td></tr> : null}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function ManageFavorites({
  favorites,
  onChoose,
  onToggleFavorite,
}: {
  favorites: CalculatorId[];
  onChoose: (id: CalculatorId) => void;
  onToggleFavorite: (id: CalculatorId) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Favorites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {medicalCalculators.filter((calculator) => favorites.includes(calculator.id)).map((calculator) => (
            <FavoriteRow calculator={calculator} key={calculator.id} onChoose={onChoose} onToggleFavorite={onToggleFavorite} starred />
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add More</CardTitle>
          <CardDescription>Search and pin calculators for faster access.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchInput placeholder="Search calculator..." />
          {medicalCalculators.map((calculator) => (
            <FavoriteRow calculator={calculator} key={calculator.id} onChoose={onChoose} onToggleFavorite={onToggleFavorite} starred={favorites.includes(calculator.id)} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

type CalculatorPreferences = {
  autoPopulate: boolean;
  confirmOverwrite: boolean;
  showInterpretation: boolean;
  showFormulaTrace: boolean;
  strictValidation: boolean;
  auditLog: boolean;
  decimalPlaces: "1" | "2" | "3";
};

const defaultCalculatorPreferences: CalculatorPreferences = {
  autoPopulate: true,
  confirmOverwrite: true,
  showInterpretation: true,
  showFormulaTrace: true,
  strictValidation: true,
  auditLog: true,
  decimalPlaces: "1",
};

function CalculatorSettings() {
  const [section, setSection] = React.useState<"General" | "Display" | "Safety" | "Audit">("General");
  const [saved, setSaved] = React.useState<CalculatorPreferences>(defaultCalculatorPreferences);
  const [draft, setDraft] = React.useState<CalculatorPreferences>(defaultCalculatorPreferences);

  React.useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem("medical-calculator-preferences");
        if (!stored) return;
        const preferences = { ...defaultCalculatorPreferences, ...JSON.parse(stored) } as CalculatorPreferences;
        setSaved(preferences);
        setDraft(preferences);
      } catch {
        window.localStorage.removeItem("medical-calculator-preferences");
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function update<K extends keyof CalculatorPreferences>(key: K, value: CalculatorPreferences[K]) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  function save() {
    window.localStorage.setItem("medical-calculator-preferences", JSON.stringify(draft));
    setSaved(draft);
    toast.success("Calculator settings saved.");
  }

  function resetDefaults() {
    setDraft(defaultCalculatorPreferences);
    toast.info("Default settings restored. Save to apply.");
  }

  const dirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const toggle = (key: keyof CalculatorPreferences, title: string, description: string) => (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-md border border-border p-4">
      <span><span className="block text-sm font-semibold text-foreground">{title}</span><span className="mt-1 block text-xs text-muted-foreground">{description}</span></span>
      <input checked={Boolean(draft[key])} className="mt-1 h-4 w-4 shrink-0" type="checkbox" onChange={event => update(key, event.target.checked as never)} />
    </label>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Settings</CardTitle>
        <CardDescription>Configure calculator behavior for this browser.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="rounded-md border border-border bg-surface-muted p-2">
          {(["General", "Display", "Safety", "Audit"] as const).map(item => (
            <button className={`block w-full rounded px-3 py-2 text-left text-sm ${section === item ? "bg-surface font-semibold text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`} key={item} onClick={() => setSection(item)} type="button">{item}</button>
          ))}
        </div>
        <div className="space-y-4">
          {section === "General" ? <div className="space-y-3">{toggle("autoPopulate", "Auto-populate patient data", "Prefill age, sex, height and weight from the current patient record.")}{toggle("confirmOverwrite", "Confirm manual-value overwrite", "Warn before replacing values entered manually.")}</div> : null}
          {section === "Display" ? <div className="space-y-3">{toggle("showInterpretation", "Show result interpretation", "Display the clinical category alongside the numeric result.")}{toggle("showFormulaTrace", "Show formula trace", "Display the formula or component-score breakdown.")}<Field label="Decimal precision"><select className={selectClass} value={draft.decimalPlaces} onChange={event => update("decimalPlaces", event.target.value as CalculatorPreferences["decimalPlaces"])}><option value="1">1 decimal place</option><option value="2">2 decimal places</option><option value="3">3 decimal places</option></select></Field></div> : null}
          {section === "Safety" ? <div className="space-y-3">{toggle("strictValidation", "Strict input validation", "Block calculations when values are missing or outside supported ranges.")}<div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-muted-foreground">Medical calculators support clinical decisions; they do not replace clinician review or local protocols.</div></div> : null}
          {section === "Audit" ? <div className="space-y-3">{toggle("auditLog", "Enable calculation audit log", "Keep calculator, inputs, result and time in the patient-session history.")}</div> : null}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={resetDefaults}>Restore Defaults</Button>
            <div className="flex gap-2"><Button disabled={!dirty} type="button" variant="outline" onClick={() => setDraft(saved)}>Cancel</Button><Button disabled={!dirty} type="button" onClick={save}>Save Changes</Button></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CalculatorTile({
  active,
  calculator,
  onChoose,
  onRemove,
}: {
  active?: boolean;
  calculator: (typeof medicalCalculators)[number];
  onChoose: (id: CalculatorId) => void;
  onRemove: (id: CalculatorId) => void;
}) {
  return (
    <div className={`relative min-h-16 w-72 shrink-0 rounded-md border transition hover:border-primary/50 hover:bg-surface-muted ${active ? "border-primary bg-primary/5" : "border-border bg-surface"}`}>
      <button className="block w-full p-2.5 pr-9 text-left" onClick={() => onChoose(calculator.id)} type="button">
        <div>
          <div className="text-sm font-semibold text-foreground">{calculator.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{calculator.subtitle}</div>
        </div>
      </button>
      <button aria-label={`Remove ${calculator.name} from Frequently Used`} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded text-lg leading-none text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => onRemove(calculator.id)} title="Remove from Frequently Used" type="button">×</button>
    </div>
  );
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function fuzzyCalculatorMatch(calculator: (typeof medicalCalculators)[number], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  const searchable = `${calculator.name} ${calculator.subtitle} ${calculator.category}`.toLowerCase();
  if (searchable.includes(normalizedQuery)) return true;

  const searchWords = searchable.match(/[a-z0-9]+/g) ?? [];
  const queryWords = normalizedQuery.match(/[a-z0-9]+/g) ?? [];
  return queryWords.every((queryWord) => searchWords.some((searchWord) => {
    if (searchWord.includes(queryWord) || queryWord.includes(searchWord)) return true;
    const allowedErrors = queryWord.length >= 7 ? 2 : queryWord.length >= 4 ? 1 : 0;
    return editDistance(searchWord, queryWord) <= allowedErrors;
  }));
}

function CalculatorList({
  bare,
  category = "All",
  favorites,
  onChoose,
  onToggleFavorite,
  query = "",
  selectedCalculator,
}: {
  bare?: boolean;
  category?: CalculatorCategory;
  favorites: CalculatorId[];
  onChoose: (id: CalculatorId) => void;
  onToggleFavorite?: (id: CalculatorId) => void;
  query?: string;
  selectedCalculator?: CalculatorId;
}) {
  const calculators = medicalCalculators.filter((calculator) =>
    (category === "All" || calculator.category === category) &&
    fuzzyCalculatorMatch(calculator, query)
  );
  const list = (
      <div className="grid gap-2 md:grid-cols-2">
        {calculators.map((calculator) => (
          <div className={`flex items-center justify-between rounded-md border p-2 ${selectedCalculator === calculator.id ? "border-primary bg-primary/5" : "border-border"}`} key={calculator.id}>
            <button className="flex min-w-0 items-center gap-2 text-left" onClick={() => onChoose(calculator.id)} type="button">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-foreground">{calculator.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{calculator.subtitle}</span>
              </span>
            </button>
            {favorites.includes(calculator.id) ? (
              <span className="ml-2 shrink-0 rounded px-2 py-1 text-xs text-success">Added</span>
            ) : (
              <button aria-label={`Add ${calculator.name} to Frequently Used`} className="ml-2 shrink-0 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => onToggleFavorite?.(calculator.id)} type="button">Add</button>
            )}
          </div>
        ))}
        {!calculators.length ? <div className="col-span-full rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No calculators found.</div> : null}
      </div>
  );
  if (bare) return list;
  return <Card><CardHeader><CardTitle className="text-base">All Calculators</CardTitle></CardHeader><CardContent>{list}</CardContent></Card>;
}

function FavoriteRow({
  calculator,
  onChoose,
  onToggleFavorite,
  starred,
}: {
  calculator: (typeof medicalCalculators)[number];
  onChoose: (id: CalculatorId) => void;
  onToggleFavorite: (id: CalculatorId) => void;
  starred: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-2">
      <button className="min-w-0 text-left" onClick={() => onChoose(calculator.id)} type="button">
        <div className="truncate text-sm font-medium text-foreground">{calculator.name}</div>
        <div className="truncate text-xs text-muted-foreground">{calculator.subtitle}</div>
      </button>
      <button aria-label="Toggle favorite" className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-surface-muted hover:text-foreground" onClick={() => onToggleFavorite(calculator.id)} type="button">
        {starred ? "Remove" : "Add"}
      </button>
    </div>
  );
}

export function PatientDetailsPage({ embedded = false }: { embedded?: boolean }) {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const documentInputRef = React.useRef<HTMLInputElement | null>(null);
  const initialEditingRecord = React.useMemo(() => getInitialEditingPatientRecord(), []);
  const [activeTab, setActiveTab] = React.useState<PatientDetailTab>("basic");
  const [activeHistoryTab, setActiveHistoryTab] = React.useState<HistoryTab>("medical");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [age, setAge] = React.useState("");
  const [bloodGroup, setBloodGroup] = React.useState("");
  const [clinicalHeight, setClinicalHeight] = React.useState("");
  const [clinicalWeight, setClinicalWeight] = React.useState("");
  const [formKey, setFormKey] = React.useState(0);
  const [editingRecordId, setEditingRecordId] = React.useState<string | null>(initialEditingRecord?.id ?? null);
  const [editingRecord, setEditingRecord] = React.useState<PatientRecord | null>(initialEditingRecord);
  const [previewRecord, setPreviewRecord] = React.useState<PatientRecord | null>(null);
  const [isExtractingDocument, setIsExtractingDocument] = React.useState(false);
  const clinicalBmi = React.useMemo(() => calculateBmi(clinicalHeight, clinicalWeight), [clinicalHeight, clinicalWeight]);
  const activeTabIndex = visiblePatientDetailTabs.findIndex((tab) => tab.id === activeTab);
  const patientGender = editingRecord ? getPatientRecordValue(editingRecord, "Gender") : "";
  const calculatorAge = age || (editingRecord ? getPatientRecordValue(editingRecord, "Age") : "");
  const calculatorHeight = clinicalHeight || (editingRecord ? getPatientRecordValue(editingRecord, "Height") : "");
  const calculatorWeight = clinicalWeight || (editingRecord ? getPatientRecordValue(editingRecord, "Weight") : "");

  React.useEffect(() => {
    if (!editingRecord || !formRef.current) return;
    const section = editingRecord.sections.find((item) => item.tabId === activeTab);
    const legacySections = activeTab === "basic"
      ? editingRecord.sections.filter((item) => ["referral", "clinical", "additional"].includes(item.tabId))
      : [];
    if (!section && !legacySections.length) return;
    const mergedSection: PatientRecordSection = {
      tabId: activeTab,
      tabLabel: visiblePatientDetailTabs.find((tab) => tab.id === activeTab)?.label ?? activeTab,
      fields: [...(section?.fields ?? []), ...legacySections.flatMap((item) => item.fields)],
    };

    applyPatientSection(formRef.current, mergedSection);
    applyControlledPatientFields(mergedSection);
  }, [activeTab, editingRecord, formKey]);

  function handleDateOfBirthChange(nextDateOfBirth: string) {
    setDateOfBirth(nextDateOfBirth);
    setAge(calculateAge(nextDateOfBirth));
  }

  function applyControlledPatientFields(section: PatientRecordSection) {
    const valueFor = (label: string) => getPatientRecordValue({ id: "current", updatedAt: "", sections: [section] }, label);
    if (section.tabId === "basic") {
      const nextDateOfBirth = valueFor("Date of Birth");
      if (nextDateOfBirth) {
        setDateOfBirth(nextDateOfBirth);
        setAge(valueFor("Age") || calculateAge(nextDateOfBirth));
      } else {
        setAge(valueFor("Age"));
      }
      setBloodGroup(valueFor("Blood Group"));
      const confirmedBloodGroup = valueFor("Blood Group (Reconfirm)");
      if (confirmedBloodGroup) setBloodGroup(confirmedBloodGroup);
      setClinicalHeight(valueFor("Height"));
      setClinicalWeight(valueFor("Weight"));
    }
  }

  function saveCurrentPatientSection() {
    if (!formRef.current) return null;
    const currentTab = visiblePatientDetailTabs[activeTabIndex];
    const section = collectPatientSection(formRef.current, currentTab.id, currentTab.label);
    if (!section.fields.length) return null;
    const savedRecord = upsertPatientRecordSection(editingRecordId, section);
    setEditingRecordId(savedRecord.id);
    setEditingRecord(savedRecord);
    return savedRecord;
  }

  function goToNextTab() {
    if (!formRef.current?.reportValidity()) return;
    saveCurrentPatientSection();
    if (activeTab === "history") {
      const historyTabIndex = patientHistoryTabOrder.indexOf(activeHistoryTab);
      const nextHistoryTab = patientHistoryTabOrder[historyTabIndex + 1];
      if (nextHistoryTab) {
        setActiveHistoryTab(nextHistoryTab);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    }
    const nextTab = visiblePatientDetailTabs[activeTabIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    toast.success("Patient details are ready to continue.");
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    const target = event.target as HTMLElement;
    if (event.key !== "Enter" || target.tagName === "BUTTON" || target.tagName === "TEXTAREA") return;
    event.preventDefault();
    if (activeTabIndex === visiblePatientDetailTabs.length - 1) {
      handlePreview();
      return;
    }
    goToNextTab();
  }

  function handleCancel() {
    setActiveTab("basic");
    toast.info("Patient details entry cancelled.");
  }

  function handleSaveDraft() {
    saveCurrentPatientSection();
    toast.success("Patient details draft saved locally.");
  }

  function handlePreview() {
    const savedRecord = saveCurrentPatientSection() ?? editingRecord;
    if (!savedRecord || !savedRecord.sections.some((section) => section.fields.length)) {
      toast.warning("Fill patient details before preview.");
      return;
    }
    setPreviewRecord(savedRecord);
  }

  function handleSubmit() {
    const savedRecord = saveCurrentPatientSection() ?? editingRecord;
    if (!savedRecord || !savedRecord.sections.some((section) => section.fields.length)) {
      toast.warning("Fill patient details before submitting.");
      return;
    }
    toast.success("Patient details submitted.");
  }

  function handlePreviewFieldChange(tabId: string, fieldIndex: number, value: string) {
    setPreviewRecord((currentRecord) => {
      if (!currentRecord) return currentRecord;
      const nextRecord: PatientRecord = {
        ...currentRecord,
        updatedAt: new Date().toISOString(),
        sections: currentRecord.sections.map((section) =>
          section.tabId === tabId
            ? {
                ...section,
                fields: section.fields.map((field, index) => (index === fieldIndex ? { ...field, value } : field)),
              }
            : section,
        ),
      };
      setEditingRecord(nextRecord);
      writePatientRecords(readPatientRecords().map((record) => (record.id === nextRecord.id ? nextRecord : record)));
      return nextRecord;
    });
  }

  function handleClear() {
    setDateOfBirth("");
    setAge("");
    setBloodGroup("");
    setClinicalHeight("");
    setClinicalWeight("");
    setEditingRecordId(null);
    setEditingRecord(null);
    setPreviewRecord(null);
    setFormKey((current) => current + 1);
    setActiveTab("basic");
    toast.info("Patient details form cleared.");
  }

  async function handleDocumentFile(document: File | undefined) {
    if (!document) return;
    if (document.size > 15 * 1024 * 1024) {
      toast.error("Document must be 15 MB or smaller.");
      return;
    }

    setIsExtractingDocument(true);
    try {
      const body = new FormData();
      body.append("document", document);
      body.append("schema", JSON.stringify(patientDocumentSchema));
      const backendUrl = process.env.NEXT_PUBLIC_PATIENT_DOCUMENT_AI_URL || "http://localhost:4001";
      const response = await fetch(`${backendUrl}/api/patient-document/extract`, { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The document could not be processed.");
      const sections = Array.isArray(result.sections) ? result.sections as PatientRecordSection[] : [];
      if (!sections.length) {
        toast.warning("No matching patient details were found in this document.");
        return;
      }

      const id = editingRecordId || `patient-${Date.now()}`;
      const nextRecord: PatientRecord = { id, updatedAt: new Date().toISOString(), sections };
      const records = readPatientRecords();
      writePatientRecords([nextRecord, ...records.filter((record) => record.id !== id)]);
      setEditingRecordId(id);
      setEditingRecord(nextRecord);
      setActiveTab("basic");
      setFormKey((current) => current + 1);
      toast.success(`Document extracted. ${sections.reduce((count, section) => count + section.fields.length, 0)} fields are ready to review.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Document extraction failed.");
    } finally {
      setIsExtractingDocument(false);
    }
  }

  return (
    <form className="space-y-0" key={formKey} onKeyDown={handleFormKeyDown} ref={formRef}>
      {!embedded ? (
        <PageHeader
          actions={showQuickUpload ? (
            <>
              <input
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  void handleDocumentFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
                ref={documentInputRef}
                type="file"
              />
              <Button disabled={isExtractingDocument} onClick={() => documentInputRef.current?.click()} size="sm" type="button">
                <Upload className="h-4 w-4" />
                {isExtractingDocument ? "Uploading…" : "Quick Upload"}
              </Button>
            </>
          ) : undefined}
          title="Patient Details"
        />
      ) : null}

      <CenterModal
        onOpenChange={(open) => !open && setPreviewRecord(null)}
        open={Boolean(previewRecord)}
        title="Patient Details Preview"
      >
        {previewRecord ? <PatientDetailsPreview record={previewRecord} onFieldChange={handlePreviewFieldChange} /> : null}
      </CenterModal>

      <div className="pt-1">
        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1" role="tablist" aria-label="Patient detail sections">
          {visiblePatientDetailTabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={`h-8 shrink-0 rounded px-3 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring ${
                activeTab === tab.id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "basic" ? (
          <div className="mt-2 space-y-3" data-patient-tab="basic">
          <SectionCard icon={UserRound} title="1. Basic Demographics">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <Field label="MRN / Patient ID">
                <Input />
              </Field>
              <Field label="UHID">
                <Input />
              </Field>
              <Field className="xl:col-span-2" label="Patient Name">
                <Input required />
              </Field>
              <Field label="Date of Birth">
                <DateTextInput onChange={handleDateOfBirthChange} required value={dateOfBirth} />
              </Field>
              <Field label="Age">
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="numeric"
                    min="0"
                    onBeforeInput={(event) => preventInvalidNumericInput(event)}
                    onInput={(event) => validateNumericInput(event, "Age")}
                    onChange={(event) => setAge(event.target.value)}
                    onPaste={(event) => preventInvalidNumericPaste(event)}
                    pattern="[0-9]*"
                    required
                    title="Age must contain numbers only."
                    value={age}
                  />
                  <span className="text-xs text-muted-foreground">Years</span>
                </div>
              </Field>
              <div className="space-y-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Gender</span>
                <div className="flex flex-wrap gap-4 pt-2">
                  <RadioOption label="Male" name="gender" />
                  <RadioOption label="Female" name="gender" />
                  <RadioOption label="Other" name="gender" />
                </div>
              </div>
              <Field label="Blood Group">
                <select className={selectClass} value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}>
                  <option value="">Select</option>
                  {bloodGroupOptions.map((bloodGroup) => (
                    <option key={bloodGroup}>{bloodGroup}</option>
                  ))}
                </select>
              </Field>
              <Field label="Contact Number">
                <Input inputMode="numeric" maxLength={15} minLength={10} onBeforeInput={(event) => preventInvalidNumericInput(event)} onInput={(event) => validateNumericInput(event, "Contact number")} onPaste={(event) => preventInvalidNumericPaste(event)} pattern="[0-9]*" required title="Contact number must contain numbers only." />
              </Field>
              <Field label="Email ID">
                <Input type="email" />
              </Field>
              <Field className="md:col-span-2" label="Address">
                <Input />
              </Field>
              <Field label="City">
                <Input />
              </Field>
              <Field label="State">
                <Input />
              </Field>
              <Field label="PIN Code">
                <Input inputMode="numeric" maxLength={6} minLength={6} onBeforeInput={(event) => preventInvalidNumericInput(event)} onInput={(event) => validateNumericInput(event, "PIN code")} onPaste={(event) => preventInvalidNumericPaste(event)} pattern="[0-9]*" required title="PIN code must contain 6 digits only." />
              </Field>
              <Field label="Referred By (Dr. / Facility Name)"><Input /></Field>
              <Field label="Referred From"><Input /></Field>
              <Field label="Referral Contact"><Input /></Field>
              <div className="space-y-1.5 md:col-span-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Referral Type</span>
                <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1">
                  <RadioOption label="Self" name="referralType" />
                  <RadioOption label="Doctor" name="referralType" />
                  <RadioOption label="Hospital / Facility" name="referralType" />
                  <RadioOption label="Others" name="referralType" />
                </div>
              </div>
              <Field className="md:col-span-2 xl:col-span-4" label="Referral Notes"><Input placeholder="Enter referral notes (if any)" /></Field>
            </div>
          </SectionCard>
          <SectionCard icon={HeartPulse} title="Physical & Clinical Information">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Blood Group (Reconfirm)">
                <select className={selectClass} value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value)}>
                  <option value="">Select</option>
                  {bloodGroupOptions.map((bloodGroup) => (
                    <option key={bloodGroup}>{bloodGroup}</option>
                  ))}
                </select>
              </Field>
              <Field label="Height">
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="decimal"
                    min="0"
                    onBeforeInput={(event) => preventInvalidNumericInput(event, true)}
                    onInput={(event) => validateNumericInput(event, "Height", true)}
                    onChange={(event) => setClinicalHeight(event.target.value)}
                    onPaste={(event) => preventInvalidNumericPaste(event, true)}
                    pattern={decimalPattern}
                    title="Height must contain numbers only."
                    value={clinicalHeight}
                  />
                  <span className="text-xs text-muted-foreground">cm</span>
                </div>
              </Field>
              <Field label="Weight">
                <div className="flex items-center gap-2">
                  <Input
                    inputMode="decimal"
                    min="0"
                    onBeforeInput={(event) => preventInvalidNumericInput(event, true)}
                    onInput={(event) => validateNumericInput(event, "Weight", true)}
                    onChange={(event) => setClinicalWeight(event.target.value)}
                    onPaste={(event) => preventInvalidNumericPaste(event, true)}
                    pattern={decimalPattern}
                    title="Weight must contain numbers only."
                    value={clinicalWeight}
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </Field>
              <Field label="BMI (Auto)">
                <div className="flex items-center gap-2">
                  <Input readOnly value={clinicalBmi} />
                  <span className="text-xs text-muted-foreground">kg/m2</span>
                </div>
              </Field>
              <Field label="Allergies"><Input placeholder="Enter allergies" /></Field>
              <Field label="Comorbidities"><Input placeholder="Enter comorbidities" /></Field>
              <Field label="Smoking Status">
                <select className={selectClass}><option>Select</option><option>Never</option><option>Former</option><option>Current</option></select>
              </Field>
              <Field label="Alcohol Use">
                <select className={selectClass}><option>Select</option><option>No</option><option>Occasional</option><option>Regular</option></select>
              </Field>
              <div className="space-y-1.5" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Advance Directive</span>
                <div className="flex min-h-9 flex-wrap items-center gap-x-4 gap-y-1">
                  <RadioOption label="Yes" name="advanceDirective" />
                  <RadioOption label="No" name="advanceDirective" />
                  <RadioOption label="Not Known" name="advanceDirective" />
                </div>
              </div>
              <Field className="md:col-span-2 xl:col-span-5" label="Notes"><Input placeholder="Enter additional clinical notes" /></Field>
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "triage" ? <TriageTab /> : null}

        {activeTab === "nurse-entry" ? (
          <div className="mt-2" data-patient-tab="nurse-entry">
            <NursingIcuModulePage page="vitals" />
          </div>
        ) : null}

        {activeTab === "history" ? (
          <div className="mt-1" data-patient-tab="history">
            <PatientHistoryPage activeTab={activeHistoryTab} embedded onTabChange={setActiveHistoryTab} />
          </div>
        ) : null}

        {activeTab === "orders" ? <DoctorOrdersTab /> : null}

        {activeTab === "notes" ? <DoctorNotesTab /> : null}

        {showMedicalCalculator && activeTab === "calculator" ? (
          <MedicalCalculatorWorkspace
            age={calculatorAge}
            gender={patientGender}
            height={calculatorHeight}
            weight={calculatorWeight}
          />
        ) : null}

      </div>

      <div className={embedded ? "sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur" : "sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6"}>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button onClick={handleCancel} size="sm" type="button" variant="outline">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <div className="flex flex-wrap justify-end gap-2">
            <Button onClick={handleSaveDraft} size="sm" type="button" variant="outline">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handleClear} size="sm" type="button" variant="outline">
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            {activeTabIndex === visiblePatientDetailTabs.length - 1 ? (
              <>
                <Button onClick={handlePreview} size="sm" type="button" variant="outline">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                <Button onClick={handleSubmit} size="sm" type="button">
                  Submit
                  <Send className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button onClick={goToNextTab} size="sm" type="button">
                Save & Continue
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
