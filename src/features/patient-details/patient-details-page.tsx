"use client";

import * as React from "react";
import {
  CalendarDays,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Eye,
  HeartPulse,
  RotateCcw,
  Save,
  Search,
  Send,
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
import { PatientHistoryPage, type HistoryTab } from "@/features/patient-history/patient-history-page";
import { calculatorDefinitions, initialCalculatorValues, validateCalculator, type CalculationResult } from "./medical-calculator-engine";
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
// Temporarily hidden; keep these flags and the implementation for future use.
const showQuickUpload = false;
const showMedicalCalculator = false;
const patientDetailTabs = [
  { id: "basic", label: "1. Basic Demographics" },
  { id: "clinical", label: "2. Physical & Clinical" },
  { id: "history", label: "3. Patient History" },
  { id: "calculator", label: "4. Medical Calculator" },
] as const;
const visiblePatientDetailTabs = patientDetailTabs.filter((tab) => tab.id !== "calculator" || showMedicalCalculator);

const patientHistoryTabOrder: HistoryTab[] = ["medical", "surgical", "medication", "allergy", "social"];

type PatientDetailTab = (typeof patientDetailTabs)[number]["id"];

const patientDocumentSchema = [
  { tabId: "basic", tabLabel: "1. Basic Demographics", fields: ["UHID / MRN", "Patient Name", "Date of Birth", "Age", "Gender", "Blood Group", "Contact Number", "Email ID", "Address", "State", "City", "PIN Code", "Referred By (Dr. / Facility Name)", "Referred From", "Referral Type", "Referral Contact"] },
  { tabId: "clinical", tabLabel: "2. Physical & Clinical", fields: ["Blood Group (Reconfirm)", "Height", "Weight", "BMI (Auto)", "Allergies", "Comorbidities", "Smoking Status", "Alcohol Use", "Advance Directive", "Notes"] },
  { tabId: "history", tabLabel: "3. Patient History", fields: ["Past Medical History", "Known Comorbidities", "Past Surgical History", "Current Medications", "Allergy Status", "Allergen and Reaction", "Smoking Status", "Alcohol Use", "Relevant Social History"] },
  { tabId: "calculator", tabLabel: "4. Medical Calculator", fields: ["Selected Calculator", "Input Summary", "Result", "Interpretation", "Note / Order Action", "FHIR Observation Reference"] },
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
      <SectionCard hideHeader icon={Calculator} title="4. Medical Calculator">
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

export function PatientDetailsPage() {
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
    const legacySection = activeTab === "basic"
      ? editingRecord.sections.find((item) => item.tabId === "referral")
      : activeTab === "clinical"
        ? editingRecord.sections.find((item) => item.tabId === "additional")
        : undefined;
    if (!section && !legacySection) return;
    const mergedSection: PatientRecordSection = {
      tabId: activeTab,
      tabLabel: visiblePatientDetailTabs.find((tab) => tab.id === activeTab)?.label ?? activeTab,
      fields: [...(section?.fields ?? []), ...(legacySection?.fields ?? [])],
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
    }

    if (section.tabId === "clinical") {
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
          <div className="mt-2" data-patient-tab="basic">
          <SectionCard icon={UserRound} title="1. Basic Demographics">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <Field label="UHID / MRN">
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
              <Field label="Gender">
                <select className={selectClass} required>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Field>
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
              <Field label="State">
                <Input />
              </Field>
              <Field label="City">
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
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "clinical" ? (
          <div className="mt-2" data-patient-tab="clinical">
          <SectionCard icon={HeartPulse} title="2. Physical & Clinical Information">
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

        {activeTab === "history" ? (
          <div className="mt-1" data-patient-tab="history">
            <PatientHistoryPage activeTab={activeHistoryTab} embedded onTabChange={setActiveHistoryTab} />
          </div>
        ) : null}

        {showMedicalCalculator && activeTab === "calculator" ? (
          <MedicalCalculatorWorkspace
            age={calculatorAge}
            gender={patientGender}
            height={calculatorHeight}
            weight={calculatorWeight}
          />
        ) : null}

      </div>

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
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
