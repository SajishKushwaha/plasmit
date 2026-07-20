"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileBadge,
  FileSearch,
  HeartPulse,
  IdCard,
  RotateCcw,
  Save,
  Search,
  Send,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { Input } from "@/components/ui/input";
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
} from "@/features/clinical/patient-list/patient-records";

const fieldClass = "space-y-1.5";
const labelClass = "text-xs font-medium text-foreground";
const radioLabelClass = "inline-flex min-h-7 items-center gap-2 rounded-md px-1 text-xs text-foreground";
const radioInputClass =
  "h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-muted-foreground bg-background shadow-sm transition checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";
const decimalPattern = "[0-9]*[.]?[0-9]*";
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const patientDetailTabs = [
  { id: "basic", label: "1. Basic Demographics" },
  { id: "clinical", label: "2. Physical & Clinical" },
  { id: "admission", label: "3. Admission" },
  { id: "referral", label: "4. Referral" },
  { id: "diagnosis", label: "5. Diagnosis" },
  { id: "additional", label: "6. Additional Clinical" },
  { id: "admin", label: "7. Administrative" },
] as const;

type PatientDetailTab = (typeof patientDetailTabs)[number]["id"];

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

function SignatureUpload({ label }: { label: string }) {
  const [fileName, setFileName] = React.useState("");

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>{label}</span>
      <label className="flex h-9 cursor-pointer items-center justify-between gap-3 rounded-md border border-input bg-background px-3 text-sm text-muted-foreground shadow-sm transition hover:bg-surface-muted">
        <span className="min-w-0 truncate">{fileName || "Upload signature"}</span>
        <Upload className="h-4 w-4 shrink-0 text-primary" />
        <input
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="sr-only"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")}
          type="file"
        />
      </label>
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
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-visible">
      <CardHeader className="bg-surface-muted/60">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SearchInput({ placeholder }: { placeholder: string }) {
  return (
    <div className="flex">
      <Input className="rounded-r-none" placeholder={placeholder} />
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
  const sections = patientDetailTabs.map((tab) => {
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
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Plasmit Hospital HMS</div>
                <h2 className="mt-1 text-2xl font-bold text-black">Patient Details Preview</h2>
                <p className="mt-1 text-sm text-neutral-600">Review and edit details before final submit.</p>
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

          <div className="mt-8 flex items-center justify-between border-t border-neutral-300 pt-4 text-xs text-neutral-500">
            <span>Editable preview before final submit</span>
            <span>Generated from Patient Details draft</span>
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

export function PatientDetailsPage() {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const initialEditingRecord = React.useMemo(() => getInitialEditingPatientRecord(), []);
  const [activeTab, setActiveTab] = React.useState<PatientDetailTab>("basic");
  const [dateOfBirth, setDateOfBirth] = React.useState("");
  const [age, setAge] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [clinicalHeight, setClinicalHeight] = React.useState("");
  const [clinicalWeight, setClinicalWeight] = React.useState("");
  const [formKey, setFormKey] = React.useState(0);
  const [editingRecordId, setEditingRecordId] = React.useState<string | null>(initialEditingRecord?.id ?? null);
  const [editingRecord, setEditingRecord] = React.useState<PatientRecord | null>(initialEditingRecord);
  const [previewRecord, setPreviewRecord] = React.useState<PatientRecord | null>(null);
  const bmi = React.useMemo(() => calculateBmi(height, weight), [height, weight]);
  const clinicalBmi = React.useMemo(() => calculateBmi(clinicalHeight, clinicalWeight), [clinicalHeight, clinicalWeight]);
  const activeTabIndex = patientDetailTabs.findIndex((tab) => tab.id === activeTab);

  React.useEffect(() => {
    if (!editingRecord || !formRef.current) return;
    const section = editingRecord.sections.find((item) => item.tabId === activeTab);
    if (!section) return;

    applyPatientSection(formRef.current, section);
    applyControlledPatientFields(section);
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
      setHeight(valueFor("Height"));
      setWeight(valueFor("Weight"));
    }

    if (section.tabId === "clinical") {
      setClinicalHeight(valueFor("Height"));
      setClinicalWeight(valueFor("Weight"));
    }
  }

  function saveCurrentPatientSection() {
    if (!formRef.current) return null;
    const currentTab = patientDetailTabs[activeTabIndex];
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
    const nextTab = patientDetailTabs[activeTabIndex + 1];
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
    if (activeTabIndex === patientDetailTabs.length - 1) {
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
    setHeight("");
    setWeight("");
    setClinicalHeight("");
    setClinicalWeight("");
    setEditingRecordId(null);
    setEditingRecord(null);
    setPreviewRecord(null);
    setFormKey((current) => current + 1);
    setActiveTab("basic");
    toast.info("Patient details form cleared.");
  }

  return (
    <form className="space-y-5" key={formKey} onKeyDown={handleFormKeyDown} ref={formRef}>
      <CenterModal
        description={previewRecord ? getPatientRecordValue(previewRecord, "Patient Name") || previewRecord.id : undefined}
        onOpenChange={(open) => !open && setPreviewRecord(null)}
        open={Boolean(previewRecord)}
        title="Patient Details Preview"
      >
        {previewRecord ? <PatientDetailsPreview record={previewRecord} onFieldChange={handlePreviewFieldChange} /> : null}
      </CenterModal>

      <div className="pt-4">
        <div className="flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1" role="tablist" aria-label="Patient detail sections">
          {patientDetailTabs.map((tab) => (
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
          <div className="mt-4" data-patient-tab="basic">
          <SectionCard icon={UserRound} title="1. Basic Demographics">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
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
                <select className={selectClass}>
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
                    onChange={(event) => setHeight(event.target.value)}
                    onPaste={(event) => preventInvalidNumericPaste(event, true)}
                    pattern={decimalPattern}
                    title="Height must contain numbers only."
                    value={height}
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
                    onChange={(event) => setWeight(event.target.value)}
                    onPaste={(event) => preventInvalidNumericPaste(event, true)}
                    pattern={decimalPattern}
                    title="Weight must contain numbers only."
                    value={weight}
                  />
                  <span className="text-xs text-muted-foreground">kg</span>
                </div>
              </Field>
              <Field label="BMI (Auto)">
                <div className="flex items-center gap-2">
                  <Input readOnly value={bmi} />
                  <span className="text-xs text-muted-foreground">kg/m2</span>
                </div>
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
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "clinical" ? (
          <div className="mt-4" data-patient-tab="clinical">
          <SectionCard icon={HeartPulse} title="2. Physical & Clinical Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Blood Group (Reconfirm)">
                <select className={selectClass}>
                  <option>Select</option>
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
              <div className="space-y-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Bed Sores at Time of Admission</span>
                <div className="grid gap-2 pt-1">
                  <RadioOption label="Present" name="bedSores" />
                  <RadioOption label="Not Present" name="bedSores" />
                </div>
              </div>
              <Field label="If Present Stage">
                <select className={selectClass}>
                  <option>Select</option>
                  <option>Stage 1</option>
                  <option>Stage 2</option>
                  <option>Stage 3</option>
                </select>
              </Field>
              <Field className="xl:col-span-2" label="Location">
                <Input placeholder="Enter location" />
              </Field>
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "admission" ? (
          <div className="mt-4" data-patient-tab="admission">
          <SectionCard icon={ClipboardList} title="3. Admission Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 md:col-span-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Admitted Through</span>
                <div className="flex flex-wrap gap-6 pt-1">
                  <RadioOption label="ER (Emergency)" name="admittedThrough" />
                  <RadioOption label="OPD (Outpatient Department)" name="admittedThrough" />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Source of Admission</span>
                <div className="flex flex-wrap gap-6 pt-1">
                  <RadioOption label="Fresh Admission" name="sourceAdmission" />
                  <RadioOption label="Transfer Case" name="sourceAdmission" />
                </div>
              </div>
              <Field label="Date of Admission">
                <DateTextInput required />
              </Field>
              <Field label="Time of Admission">
                <Input required type="time" />
              </Field>
              <Field className="md:col-span-2" label="Admitting Department">
                <select className={selectClass} required>
                  <option value="">Select Department</option>
                  <option>Emergency</option>
                  <option>Medicine</option>
                  <option>Surgery</option>
                  <option>Orthopedics</option>
                </select>
              </Field>
              <Field className="md:col-span-2" label="Bed / Unit / Room No.">
                <Input placeholder="Enter bed / unit / room no." required />
              </Field>
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "referral" ? (
          <div className="mt-4" data-patient-tab="referral">
          <SectionCard icon={FileBadge} title="4. Referral Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr_1fr]">
              <Field label="Referred By (Dr. / Facility Name)">
                <Input />
              </Field>
              <Field label="Referred From">
                <Input />
              </Field>
              <div className="space-y-2 rounded-md border border-border bg-surface-muted/40 p-3" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Referral Type</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  <RadioOption label="Self" name="referralType" />
                  <RadioOption label="Doctor" name="referralType" />
                  <RadioOption label="Hospital / Facility" name="referralType" />
                  <RadioOption label="Others" name="referralType" />
                </div>
              </div>
              <Field label="Referral Contact">
                <Input />
              </Field>
              <Field className="md:col-span-2 xl:col-span-4" label="Referral Notes">
                <Input placeholder="Enter referral notes (if any)" />
              </Field>
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "diagnosis" ? (
          <div className="mt-4" data-patient-tab="diagnosis">
          <SectionCard icon={FileSearch} title="5. Diagnosis Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Primary Diagnosis (ICD Code)">
                <SearchInput placeholder="Search ICD Code..." />
              </Field>
              <Field label="ICD Code Description">
                <Input />
              </Field>
              <div className="space-y-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Diagnosis Type</span>
                <div className="flex flex-wrap gap-4 pt-2">
                  <RadioOption label="Provisional" name="diagnosisType" />
                  <RadioOption label="Confirmed" name="diagnosisType" />
                  <RadioOption label="Differential" name="diagnosisType" />
                </div>
              </div>
              <Field label="Date of Diagnosis">
                <DateTextInput required />
              </Field>
              <Field label="Secondary Diagnosis (ICD Code)">
                <SearchInput placeholder="Search ICD Code..." />
              </Field>
              <Field label="ICD Code Description">
                <Input />
              </Field>
              <Field className="md:col-span-2" label="Additional Diagnosis Notes">
                <Input placeholder="Enter notes (if any)" />
              </Field>
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "additional" ? (
          <div className="mt-4" data-patient-tab="additional">
          <SectionCard icon={HeartPulse} title="6. Additional Clinical Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Allergies">
                <Input placeholder="Enter allergies" />
              </Field>
              <Field label="Comorbidities">
                <Input placeholder="Enter comorbidities" />
              </Field>
              <Field label="Smoking Status">
                <select className={selectClass}>
                  <option>Select</option>
                  <option>Never</option>
                  <option>Former</option>
                  <option>Current</option>
                </select>
              </Field>
              <Field label="Alcohol Use">
                <select className={selectClass}>
                  <option>Select</option>
                  <option>No</option>
                  <option>Occasional</option>
                  <option>Regular</option>
                </select>
              </Field>
              <div className="space-y-2" data-patient-field-group>
                <span className={labelClass} data-patient-field-label>Advance Directive</span>
                <div className="flex flex-wrap gap-4 pt-2">
                  <RadioOption label="Yes" name="advanceDirective" />
                  <RadioOption label="No" name="advanceDirective" />
                  <RadioOption label="Not Known" name="advanceDirective" />
                </div>
              </div>
              <Field className="md:col-span-2 xl:col-span-5" label="Notes">
                <Input placeholder="Enter additional clinical notes" />
              </Field>
            </div>
          </SectionCard>
          </div>
        ) : null}

        {activeTab === "admin" ? (
          <div className="mt-4" data-patient-tab="admin">
          <SectionCard icon={IdCard} title="7. Administrative Information">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Created By">
                <Input required />
              </Field>
              <Field label="Created Date & Time">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <DateTextInput required />
                  <Input required type="time" />
                </div>
              </Field>
              <Field label="Last Updated By">
                <Input />
              </Field>
              <Field label="Last Updated Date & Time">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <DateTextInput />
                  <Input type="time" />
                </div>
              </Field>
              <SignatureUpload label="Prepared By Signature" />
              <SignatureUpload label="Verified By Signature" />
            </div>
          </SectionCard>
          </div>
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
            {activeTabIndex === patientDetailTabs.length - 1 ? (
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
