"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileClock,
  HeartPulse,
  Plus,
  RotateCcw,
  Save,
  Send,
  ShieldAlert,
  Stethoscope,
  Upload,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { Input } from "@/components/ui/input";
import {
  applyPatientHistorySection,
  collectPatientHistorySection,
  findPatientHistoryRecord,
  readPatientHistoryRecords,
  upsertPatientHistoryRecordSection,
  writePatientHistoryRecords,
  type PatientHistoryRecord,
} from "@/features/patient-history/patient-history-records";

const labelClass = "text-xs font-medium text-foreground";
const radioInputClass =
  "h-4 w-4 shrink-0 appearance-none rounded-full border-2 border-muted-foreground bg-background shadow-sm transition checked:border-primary checked:bg-primary focus:outline-none focus:ring-2 focus:ring-ring/20";
const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";
const tabs = [
  { id: "medical", label: "1. Past Medical History" },
  { id: "surgical", label: "2. Past Surgical History" },
  { id: "medication", label: "3. Medication History" },
  { id: "allergy", label: "4. Allergy History" },
  { id: "social", label: "5. Social History" },
] as const;

export type HistoryTab = (typeof tabs)[number]["id"];

function getInitialEditingHistoryRecord() {
  if (typeof window === "undefined") return null;
  const recordId = new URLSearchParams(window.location.search).get("edit");
  return recordId ? findPatientHistoryRecord(recordId) : null;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
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
  const ranges = React.useMemo(
    () => Array.from({ length: 25 }, (_, index) => pageStart + index * 5),
    [pageStart],
  );
  const exactYears = selectedRangeStart
    ? Array.from({ length: 6 }, (_, index) => selectedRangeStart + index)
    : [];

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-lg bg-surface">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="border-b border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              aria-label="Previous year ranges"
              disabled={Boolean(selectedRangeStart) || pageStart <= firstYear}
              onClick={() => setPageStart((year) => Math.max(firstYear, year - 125))}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarDays className="h-4 w-4 text-primary" />
              {selectedRangeStart
                ? yearRangeLabel(selectedRangeStart)
                : `${pageStart}-${String(pageStart + 125).slice(-2)}`}
            </div>
            <Button
              aria-label="Next year ranges"
              disabled={Boolean(selectedRangeStart) || pageStart >= currentPageStart}
              onClick={() => setPageStart((year) => Math.min(currentPageStart, year + 125))}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {selectedRangeStart ? "Choose exact year" : "Choose a 5-year range"}
          </p>
        </div>
        <div
          className={
            selectedRangeStart
              ? "grid flex-1 grid-cols-3 gap-2 p-3"
              : "grid flex-1 grid-cols-5 grid-rows-5 gap-1.5 p-3"
          }
        >
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
            {selectedRangeStart ? (
              <Button onClick={() => setSelectedRangeStart(null)} type="button" variant="outline">
                Back
              </Button>
            ) : null}
            <Button onClick={onClose} type="button" variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function validateNumericInput(
  event: React.FormEvent<HTMLInputElement>,
  label: string,
  allowDecimal = false,
) {
  const input = event.currentTarget;
  const value = input.value.trim();
  const numberPattern = allowDecimal ? /^\d*(\.\d*)?$/ : /^\d*$/;
  input.setCustomValidity(
    value && !numberPattern.test(value) ? `${label} must contain numbers only.` : "",
  );
}

function preventInvalidNumericInput(
  event: React.FormEvent<HTMLInputElement>,
  allowDecimal = false,
) {
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

function preventInvalidNumericPaste(
  event: React.ClipboardEvent<HTMLInputElement>,
  allowDecimal = false,
) {
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

function DateField({ required }: { required?: boolean }) {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() => textDateToParts("").month);
  const [visibleYear, setVisibleYear] = React.useState(() => textDateToParts("").year);
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const selected = parseDateValue(value);
  const monthNames = React.useMemo(
    () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    [],
  );
  const totalDays = daysInMonth(visibleMonth, visibleYear);

  function updatePopoverPosition() {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(352, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= 360 ? rect.bottom + 8 : Math.max(16, rect.top - 360);
    setPopoverStyle({ left, top, width });
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity(
      /[^\d/]/.test(event.target.value) ? "Year must contain numbers only." : "",
    );
    const nextValue = formatDateInput(event.target.value);
    setValue(nextValue);
    const nextDate = parseDateValue(nextValue);
    if (nextDate) {
      setVisibleMonth(nextDate.getMonth());
      setVisibleYear(nextDate.getFullYear());
    }
  }

  function selectDate(day: number) {
    setValue(datePartsToText(day, visibleMonth, visibleYear));
    setOpen(false);
  }

  function moveMonth(direction: -1 | 1) {
    const nextDate = new Date(visibleYear, visibleMonth + direction, 1);
    setVisibleMonth(nextDate.getMonth());
    setVisibleYear(nextDate.getFullYear());
  }

  function selectToday() {
    const today = new Date();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    setValue(datePartsToText(today.getDate(), today.getMonth(), today.getFullYear()));
    setOpen(false);
  }

  function selectTodayYear() {
    const today = new Date();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    setYearPickerOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          inputMode="numeric"
          maxLength={10}
          onBeforeInput={(event) => preventInvalidNumericInput(event)}
          onChange={handleChange}
          onFocus={openCalendar}
          onPaste={(event) => preventInvalidNumericPaste(event)}
          placeholder="DD / MM / YYYY"
          required={required}
          value={value}
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
        <div
          className="fixed z-[100] h-[356px] rounded-lg border border-border bg-surface p-3 shadow-soft"
          style={popoverStyle}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              aria-label="Previous month"
              onClick={() => moveMonth(-1)}
              size="icon"
              type="button"
              variant="ghost"
            >
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
              <button
                aria-label="Select year"
                className={selectClass}
                onClick={() => setYearPickerOpen(true)}
                type="button"
              >
                <span className="flex-1 text-left">{visibleYear}</span>
                <ChevronRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </button>
            </div>
            <Button
              aria-label="Next month"
              onClick={() => moveMonth(1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
              <span key={dayName}>{dayName}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: new Date(visibleYear, visibleMonth, 1).getDay() }).map(
              (_, index) => (
                <span key={`blank-${index}`} />
              ),
            )}
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
            <Button
              onClick={() => {
                setValue("");
                setOpen(false);
              }}
              size="sm"
              type="button"
              variant="ghost"
            >
              Clear
            </Button>
            <Button onClick={selectToday} size="sm" type="button" variant="outline">
              Today
            </Button>
          </div>
          {yearPickerOpen ? (
            <YearRangePicker
              onClose={() => setYearPickerOpen(false)}
              onSelectYear={setVisibleYear}
              onToday={selectTodayYear}
              visibleYear={visibleYear}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SignatureUpload({ label, required }: { label: string; required?: boolean }) {
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
          required={required}
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
    <label className={`space-y-1.5 ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function Checkbox({ label }: { label: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-foreground">
      <input
        className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring"
        type="checkbox"
      />
      {label}
    </label>
  );
}

function Radio({ label, name }: { label: string; name: string }) {
  return (
    <label className="inline-flex min-h-7 items-center gap-2 rounded-md px-1 text-xs text-foreground">
      <input className={radioInputClass} name={name} type="radio" />
      <span className="leading-5">{label}</span>
    </label>
  );
}

function Section({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof ClipboardList;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-visible">
      <CardHeader className="bg-surface-muted/60">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <CardTitle>{title}</CardTitle>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function TextArea({ placeholder }: { placeholder?: string }) {
  return (
    <textarea
      className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      placeholder={placeholder}
    />
  );
}

function PatientHistoryPreview({
  record,
  onFieldChange,
}: {
  record: PatientHistoryRecord;
  onFieldChange: (tabId: string, fieldIndex: number, value: string) => void;
}) {
  const sections = tabs.map((tab) => {
    const section = record.sections.find((item) => item.tabId === tab.id);
    return section ?? { tabId: tab.id, tabLabel: tab.label, fields: [] };
  });

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3 sm:p-5">
      <div className="mx-auto w-full max-w-[210mm] overflow-hidden bg-white text-black shadow-soft">
        <div className="min-h-[297mm] p-6 sm:p-10">
          <div className="border-b-2 border-black pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="mt-1 text-2xl font-bold text-black">Patient History Preview</h2>
              </div>
              <div className="rounded border border-neutral-300 px-3 py-2 text-right text-xs text-neutral-600">
                <div className="font-semibold text-black">Draft</div>
                <div>{record.id}</div>
              </div>
            </div>
          </div>

          <div className="space-y-7 pt-6">
            {sections.map((section) => (
              <section className="break-inside-avoid" key={`history-preview-${section.tabId}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-300" />
                  <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-black">
                    {section.tabLabel}
                  </h3>
                  <div className="h-px flex-1 bg-neutral-300" />
                </div>

                {section.fields.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {section.fields.map((field, index) => (
                      <label
                        className="block rounded border border-neutral-300 p-2"
                        key={`${section.tabId}-${field.label}-${index}`}
                      >
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          {field.label}
                        </span>
                        <textarea
                          className="mt-1 min-h-9 w-full resize-y rounded border border-transparent bg-white p-1 text-sm font-medium text-black outline-none transition focus:border-neutral-400"
                          onChange={(event) =>
                            onFieldChange(section.tabId, index, event.target.value)
                          }
                          value={field.value}
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-neutral-300 px-3 py-5 text-center text-sm text-neutral-500">
                    No history filled in this section yet.
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
            toast.success("Patient history submitted.");
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

export function PatientHistoryPage({
  embedded = false,
  activeTab: controlledActiveTab,
  onTabChange,
}: {
  embedded?: boolean;
  activeTab?: HistoryTab;
  onTabChange?: (tab: HistoryTab) => void;
}) {
  const formRef = React.useRef<HTMLDivElement | null>(null);
  const initialEditingRecord = React.useMemo(() => getInitialEditingHistoryRecord(), []);
  const [internalActiveTab, setInternalActiveTab] = React.useState<HistoryTab>("medical");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  function setActiveTab(tab: HistoryTab) {
    setInternalActiveTab(tab);
    onTabChange?.(tab);
  }
  const [formKey, setFormKey] = React.useState(0);
  const [editingRecordId, setEditingRecordId] = React.useState<string | null>(
    initialEditingRecord?.id ?? null,
  );
  const [editingRecord, setEditingRecord] = React.useState<PatientHistoryRecord | null>(
    initialEditingRecord,
  );
  const [previewRecord, setPreviewRecord] = React.useState<PatientHistoryRecord | null>(null);
  const [diagnosisRows, setDiagnosisRows] = React.useState<number[]>([]);
  const [surgeryRows, setSurgeryRows] = React.useState<number[]>([1]);
  const [medicationRows, setMedicationRows] = React.useState<number[]>([]);
  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  React.useEffect(() => {
    if (!editingRecord || !formRef.current) return;
    const section = editingRecord.sections.find((item) => item.tabId === activeTab);
    if (!section) return;
    applyPatientHistorySection(formRef.current, section);
  }, [activeTab, editingRecord, formKey]);

  function saveCurrentHistorySection() {
    if (!formRef.current) return null;
    const currentTab = tabs[activeTabIndex];
    const section = collectPatientHistorySection(formRef.current, currentTab.id, currentTab.label);
    if (!section.fields.length) return null;
    const savedRecord = upsertPatientHistoryRecordSection(editingRecordId, section);
    setEditingRecordId(savedRecord.id);
    setEditingRecord(savedRecord);
    return savedRecord;
  }

  function nextTab() {
    const invalidField = formRef.current?.querySelector<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >(":invalid");
    if (invalidField) {
      invalidField.reportValidity();
      return;
    }
    saveCurrentHistorySection();
    const next = tabs[activeTabIndex + 1];
    if (next) {
      setActiveTab(next.id);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    toast.success("Patient history is ready to save.");
  }

  function handleCancel() {
    setActiveTab("medical");
    toast.info("Patient history entry cancelled.");
  }

  function handleSaveDraft() {
    saveCurrentHistorySection();
    toast.success("Patient history draft saved locally.");
  }

  function handleClear() {
    setActiveTab("medical");
    setEditingRecordId(null);
    setEditingRecord(null);
    setPreviewRecord(null);
    setDiagnosisRows([]);
    setSurgeryRows([1]);
    setMedicationRows([]);
    setFormKey((key) => key + 1);
    toast.info("Patient history form cleared.");
  }

  function handlePreview() {
    const savedRecord = saveCurrentHistorySection() ?? editingRecord;
    if (!savedRecord || !savedRecord.sections.some((section) => section.fields.length)) {
      toast.warning("Fill patient history before preview.");
      return;
    }
    setPreviewRecord(savedRecord);
  }

  function handleSubmit() {
    const savedRecord = saveCurrentHistorySection() ?? editingRecord;
    if (!savedRecord || !savedRecord.sections.some((section) => section.fields.length)) {
      toast.warning("Fill patient history before submitting.");
      return;
    }
    toast.success("Patient history submitted.");
  }

  function handlePreviewFieldChange(tabId: string, fieldIndex: number, value: string) {
    setPreviewRecord((currentRecord) => {
      if (!currentRecord) return currentRecord;
      const nextRecord: PatientHistoryRecord = {
        ...currentRecord,
        updatedAt: new Date().toISOString(),
        sections: currentRecord.sections.map((section) =>
          section.tabId === tabId
            ? {
                ...section,
                fields: section.fields.map((field, index) =>
                  index === fieldIndex ? { ...field, value } : field,
                ),
              }
            : section,
        ),
      };
      setEditingRecord(nextRecord);
      writePatientHistoryRecords(
        readPatientHistoryRecords().map((record) =>
          record.id === nextRecord.id ? nextRecord : record,
        ),
      );
      return nextRecord;
    });
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (event.key !== "Enter" || target.tagName === "BUTTON" || target.tagName === "TEXTAREA")
      return;
    event.preventDefault();
    if (activeTabIndex === tabs.length - 1) {
      handlePreview();
      return;
    }
    nextTab();
  }

  return (
    <div
      className={embedded ? "space-y-2" : "space-y-5"}
      key={formKey}
      onKeyDown={handleFormKeyDown}
      ref={formRef}
    >
      {!embedded ? <PageHeader title="Patient History" /> : null}

      <CenterModal
        onOpenChange={(open) => !open && setPreviewRecord(null)}
        open={Boolean(previewRecord)}
        title="Patient History Preview"
      >
        {previewRecord ? (
          <PatientHistoryPreview record={previewRecord} onFieldChange={handlePreviewFieldChange} />
        ) : null}
      </CenterModal>

      <div className={embedded ? "pt-0" : "pt-4"}>
        <div
          className={
            embedded
              ? "flex gap-1 overflow-x-auto border-b border-border px-1"
              : "flex gap-1 overflow-x-auto rounded-md bg-surface-muted p-1"
          }
          role="tablist"
          aria-label="Patient history sections"
        >
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={`${embedded ? "h-9 rounded-none border-b-2 px-3" : "h-8 rounded px-3"} shrink-0 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring ${
                activeTab === tab.id
                  ? embedded
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "bg-surface text-foreground shadow-sm"
                  : embedded
                    ? "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    : "text-muted-foreground hover:text-foreground"
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

        {activeTab === "medical" ? (
          <div className={embedded ? "mt-2" : "mt-4"} data-history-tab="medical">
            <Section
              action={
                <Button
                  onClick={() => setDiagnosisRows((rows) => [...rows, Date.now()])}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add Diagnosis
                </Button>
              }
              icon={HeartPulse}
              title="1. Past Medical History"
            >
              <div className="space-y-4">
                <Field label="Medical History Notes">
                  <TextArea placeholder="Enter past medical history" />
                </Field>
                <div className="space-y-2" data-history-field-group>
                  <span className={labelClass} data-history-field-label>
                    Known Comorbidities
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      "Hypertension",
                      "Diabetes Mellitus",
                      "Ischemic Heart Disease",
                      "COPD / Asthma",
                      "CKD",
                      "Hypothyroidism",
                      "Malignancy",
                      "Others",
                    ].map((item) => (
                      <Checkbox key={item} label={item} />
                    ))}
                  </div>
                </div>
                <Field label="Other Comorbidities">
                  <Input placeholder="Specify other comorbidities" />
                </Field>
                {diagnosisRows.map((row, index) => (
                  <div
                    className="space-y-4 rounded-lg border border-border bg-surface-muted/30 p-4"
                    key={row}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-foreground">
                        Additional Diagnosis {index + 1}
                      </div>
                      <Button
                        aria-label={`Remove additional diagnosis ${index + 1}`}
                        onClick={() =>
                          setDiagnosisRows((rows) => rows.filter((item) => item !== row))
                        }
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2" data-history-field-group>
                      <span className={labelClass} data-history-field-label>
                        Known Comorbidities
                      </span>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          "Hypertension",
                          "Diabetes Mellitus",
                          "Ischemic Heart Disease",
                          "COPD / Asthma",
                          "CKD",
                          "Hypothyroidism",
                          "Malignancy",
                          "Others",
                        ].map((item) => (
                          <Checkbox key={item} label={item} />
                        ))}
                      </div>
                    </div>
                    <Field label="Other Comorbidities">
                      <Input placeholder="Specify other comorbidities" />
                    </Field>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        ) : null}

        {activeTab === "surgical" ? (
          <div className={embedded ? "mt-2" : "mt-4"} data-history-tab="surgical">
            <Section
              action={
                <Button
                  onClick={() => setSurgeryRows((rows) => [...rows, Date.now()])}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add Surgery
                </Button>
              }
              icon={Stethoscope}
              title="2. Past Surgical History"
            >
              <div className="space-y-5">
                {surgeryRows.map((row, index) => (
                  <div className="space-y-5 rounded-lg border border-border p-4" key={row}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-foreground">
                        Surgery {index + 1}
                      </div>
                      {index > 0 ? (
                        <Button
                          aria-label={`Remove surgery ${index + 1}`}
                          onClick={() =>
                            setSurgeryRows((rows) => rows.filter((item) => item !== row))
                          }
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <Field label="Surgery / Procedure">
                        <Input placeholder="Enter surgery / procedure" required={index === 0} />
                      </Field>
                      <Field label="Year">
                        <DateField required={index === 0} />
                      </Field>
                      <Field label="Hospital / Center">
                        <Input placeholder="Enter hospital / center" />
                      </Field>
                      <Field label="Surgeon">
                        <Input placeholder="Enter surgeon" />
                      </Field>
                      <Field label="Type of Surgery">
                        <select className={selectClass} required={index === 0}>
                          <option value="">Select</option>
                          <option>Elective</option>
                          <option>Emergency</option>
                          <option>Day Care</option>
                        </select>
                      </Field>
                      <Field label="Notes">
                        <Input placeholder="Enter notes" />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <div className="space-y-2">
                        <span className={labelClass}>Biopsy (If Any)</span>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <Radio label="No Biopsy" name={`biopsy-${row}`} />
                          <Radio label="Biopsy Done" name={`biopsy-${row}`} />
                        </div>
                      </div>
                      <Field label="Site / Organ">
                        <Input placeholder="Enter site / organ" />
                      </Field>
                      <Field label="Date">
                        <DateField required={index === 0} />
                      </Field>
                      <Field label="Result / Findings">
                        <Input placeholder="Enter result / findings" />
                      </Field>
                      <div className="space-y-2">
                        <span className={labelClass}>Biopsy Result</span>
                        <div className="grid gap-2 pt-1">
                          <Radio label="Malignant" name={`biopsyResult-${row}`} />
                          <Radio label="Non-Malignant" name={`biopsyResult-${row}`} />
                        </div>
                      </div>
                      <Field label="Remarks">
                        <Input placeholder="Enter remarks" />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <div className="space-y-2">
                        <span className={labelClass}>Implant Placed (If Any)</span>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <Radio label="No Implant" name={`implantPlaced-${row}`} />
                          <Radio label="Implant Placed" name={`implantPlaced-${row}`} />
                        </div>
                      </div>
                      <Field label="Implant Name / Type">
                        <Input placeholder="Enter implant name / type" />
                      </Field>
                      <Field label="Material">
                        <Input placeholder="Enter material" />
                      </Field>
                      <Field label="Site / Location">
                        <Input placeholder="Enter site / location" />
                      </Field>
                      <Field label="Date Placed">
                        <DateField />
                      </Field>
                      <Field label="Manufacturer / Brand">
                        <Input placeholder="Enter manufacturer / brand" />
                      </Field>
                      <Field label="Implant Identification / Serial No.">
                        <Input placeholder="Enter implant ID / serial no." />
                      </Field>
                      <Field label="Purpose / Indication">
                        <Input placeholder="Enter purpose / indication" />
                      </Field>
                      <Field className="md:col-span-2 xl:col-span-4" label="Notes">
                        <Input placeholder="Enter notes" />
                      </Field>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                      <div className="space-y-2">
                        <span className={labelClass}>Past Surgical Complications</span>
                        <div className="grid gap-2 pt-1">
                          <Radio label="No Complications" name={`surgicalComplication-${row}`} />
                          <Radio
                            label="Complications Present"
                            name={`surgicalComplication-${row}`}
                          />
                        </div>
                      </div>
                      <Field label="Type of Complication">
                        <select className={selectClass}>
                          <option>Select complication</option>
                          <option>Bleeding</option>
                          <option>Infection</option>
                          <option>Wound Dehiscence</option>
                          <option>Other</option>
                        </select>
                      </Field>
                      <Field label="Details">
                        <Input placeholder="Enter details" />
                      </Field>
                      <Field label="Management">
                        <Input placeholder="Enter management" />
                      </Field>
                      <Field label="Outcome">
                        <select className={selectClass}>
                          <option>Select outcome</option>
                          <option>Resolved</option>
                          <option>Ongoing</option>
                          <option>Referred</option>
                        </select>
                      </Field>
                      <Field label="Date">
                        <DateField />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        ) : null}

        {activeTab === "medication" ? (
          <div className={embedded ? "mt-2" : "mt-4"} data-history-tab="medication">
            <Section
              action={
                <Button
                  onClick={() => setMedicationRows((rows) => [...rows, Date.now()])}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add Medication
                </Button>
              }
              icon={FileClock}
              title="3. Medication History"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-5">
                  <Radio label="Ongoing Medications" name="medicationStatus" />
                  <Radio label="Stopped Medications" name="medicationStatus" />
                </div>
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-surface-muted text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        {[
                          "S. No.",
                          "Medication Name",
                          "Dose",
                          "Frequency",
                          "Route",
                          "Duration",
                          "Indication",
                          "Stopped On",
                          "Reason",
                        ].map((heading) => (
                          <th className="border-b border-border px-3 py-2" key={heading}>
                            {heading}
                          </th>
                        ))}
                        <th aria-label="Actions" className="border-b border-border px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {!medicationRows.length ? (
                        <tr>
                          <td
                            className="px-3 py-8 text-center text-xs text-muted-foreground"
                            colSpan={10}
                          >
                            No medication history added.
                          </td>
                        </tr>
                      ) : (
                        medicationRows.map((row, index) => (
                          <tr key={row}>
                            <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                              {index + 1}
                            </td>
                            {[
                              ["Medication Name", "Enter medicine"],
                              ["Dose", "Dose"],
                              ["Frequency", "Frequency"],
                              ["Route", "Route"],
                              ["Duration", "Duration"],
                              ["Indication", "Indication"],
                              ["Stopped On", "Date"],
                              ["Reason", "Reason"],
                            ].map(([label, placeholder]) => (
                              <td className="px-2 py-2" key={label}>
                                <Input
                                  aria-label={`${label} ${index + 1}`}
                                  placeholder={placeholder}
                                />
                              </td>
                            ))}
                            <td className="px-2 py-2 text-center">
                              <Button
                                aria-label={`Remove medication ${index + 1}`}
                                onClick={() =>
                                  setMedicationRows((rows) => rows.filter((item) => item !== row))
                                }
                                size="icon"
                                type="button"
                                variant="ghost"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>
          </div>
        ) : null}

        {activeTab === "allergy" ? (
          <div className={embedded ? "mt-2" : "mt-4"} data-history-tab="allergy">
            <Section icon={ShieldAlert} title="4. Allergy History">
              <div className="space-y-5">
                <div className="flex flex-wrap gap-5">
                  <Checkbox label="No Allergy" />
                  <Checkbox label="Latex Allergy" />
                  <Checkbox label="Drug Allergy" />
                  <Checkbox label="Food Allergy" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                  <Field label="Allergy">
                    <select className={selectClass}>
                      <option>Select Allergy</option>
                    </select>
                  </Field>
                  <Field label="Allergy Type">
                    <select className={selectClass}>
                      <option>Select Type</option>
                      <option>Drug</option>
                      <option>Food</option>
                      <option>Latex</option>
                      <option>Environmental</option>
                    </select>
                  </Field>
                  <Field label="Reaction / Symptoms">
                    <Input placeholder="Enter symptoms" />
                  </Field>
                  <div className="space-y-2 xl:col-span-2">
                    <span className={labelClass}>Severity</span>
                    <div className="grid gap-2 pt-1">
                      <Radio label="Urticaria" name="severity" />
                      <Radio label="Angioedema" name="severity" />
                      <Radio label="Anaphylaxis / Shock" name="severity" />
                    </div>
                  </div>
                  <Field label="Date Noted">
                    <DateField required />
                  </Field>
                  <Field label="Notes">
                    <Input placeholder="Enter notes" />
                  </Field>
                </div>
                <div className="rounded-lg border border-border bg-surface p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    Allergy Override
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Checkbox label="Override this allergy" />
                    <Field className="md:col-span-2" label="Reason for Override">
                      <Input placeholder="Enter reason" />
                    </Field>
                    <Field label="Override Date & Time">
                      <DateField />
                    </Field>
                    <Field label="Countersigned By (Doctor)">
                      <select className={selectClass}>
                        <option>Select Doctor</option>
                      </select>
                    </Field>
                    <SignatureUpload label="Doctor Signature" />
                    <Field label="Countersigned By (Nurse)">
                      <select className={selectClass}>
                        <option>Select Nurse</option>
                      </select>
                    </Field>
                    <SignatureUpload label="Nurse Signature" />
                  </div>
                </div>
              </div>
            </Section>
          </div>
        ) : null}

        {activeTab === "social" ? (
          <div className={embedded ? "mt-2" : "mt-4"} data-history-tab="social">
            <Section icon={Users} title="5. Social History">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Clinical Frailty Scale (1 - 8)">
                    <select className={selectClass}>
                      <option>Select Score</option>
                      <option>1 - Very Fit</option>
                      <option>2 - Fit</option>
                      <option>3 - Managing Well</option>
                      <option>4 - Vulnerable</option>
                      <option>5 - Mildly Frail</option>
                      <option>6 - Moderately Frail</option>
                      <option>7 - Severely Frail</option>
                      <option>8 - Very Severely Frail</option>
                    </select>
                  </Field>
                  <Field label="Living Situation">
                    <select className={selectClass}>
                      <option>Select</option>
                      <option>Alone</option>
                      <option>With family</option>
                      <option>Assisted care</option>
                    </select>
                  </Field>
                  <Field label="Occupation">
                    <Input placeholder="Enter occupation" />
                  </Field>
                  <Field label="Marital Status">
                    <select className={selectClass}>
                      <option>Select</option>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Widowed</option>
                      <option>Separated</option>
                    </select>
                  </Field>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="mb-4 text-sm font-semibold text-foreground">
                    5A. Smoking History
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div className="space-y-2">
                      <span className={labelClass}>Smoking Status</span>
                      <div className="grid gap-2">
                        <Radio label="Never Smoker" name="smokingStatus" />
                        <Radio label="Past Smoker" name="smokingStatus" />
                        <Radio label="Current Smoker" name="smokingStatus" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className={labelClass}>Type</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Checkbox label="Cigarette" />
                        <Checkbox label="Bidi" />
                        <Checkbox label="Cigar" />
                        <Checkbox label="Others" />
                      </div>
                      <Input placeholder="Specify other type" />
                    </div>
                    <Field label="Amount / Pack Years">
                      <Input
                        inputMode="decimal"
                        min="0"
                        onBeforeInput={(event) => preventInvalidNumericInput(event, true)}
                        onInput={(event) => validateNumericInput(event, "Pack years", true)}
                        onPaste={(event) => preventInvalidNumericPaste(event, true)}
                        pattern="[0-9]*\\.?[0-9]*"
                        placeholder="Enter pack years"
                        title="Pack years must contain numbers only."
                      />
                    </Field>
                    <Field label="Years Consumed">
                      <Input
                        inputMode="decimal"
                        min="0"
                        onBeforeInput={(event) => preventInvalidNumericInput(event, true)}
                        onInput={(event) => validateNumericInput(event, "Years consumed", true)}
                        onPaste={(event) => preventInvalidNumericPaste(event, true)}
                        pattern="[0-9]*\\.?[0-9]*"
                        placeholder="Enter years"
                        title="Years consumed must contain numbers only."
                      />
                    </Field>
                    <Field label="Years Back Quit Since">
                      <Input
                        inputMode="decimal"
                        min="0"
                        onBeforeInput={(event) => preventInvalidNumericInput(event, true)}
                        onInput={(event) =>
                          validateNumericInput(event, "Years back quit since", true)
                        }
                        onPaste={(event) => preventInvalidNumericPaste(event, true)}
                        pattern="[0-9]*\\.?[0-9]*"
                        placeholder="Enter years"
                        title="Years back quit since must contain numbers only."
                      />
                    </Field>
                    <Field label="Chewable Tobacco">
                      <select className={selectClass}>
                        <option>Select status</option>
                        <option>Never</option>
                        <option>Past</option>
                        <option>Current</option>
                      </select>
                    </Field>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <div className="mb-4 text-sm font-semibold text-foreground">
                    5B. Alcohol History
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div className="space-y-2">
                      <span className={labelClass}>Alcohol Use</span>
                      <div className="flex flex-wrap gap-4">
                        <Radio label="Never" name="alcoholUse" />
                        <Radio label="Past" name="alcoholUse" />
                        <Radio label="Current" name="alcoholUse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className={labelClass}>Type</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Checkbox label="Beer" />
                        <Checkbox label="Wine" />
                        <Checkbox label="Whisky" />
                        <Checkbox label="Rum" />
                        <Checkbox label="Others" />
                      </div>
                    </div>
                    <Field label="Quantity">
                      <Input
                        inputMode="decimal"
                        min="0"
                        onBeforeInput={(event) => preventInvalidNumericInput(event, true)}
                        onInput={(event) => validateNumericInput(event, "Quantity", true)}
                        onPaste={(event) => preventInvalidNumericPaste(event, true)}
                        pattern="[0-9]*\\.?[0-9]*"
                        placeholder="Enter amount"
                        title="Quantity must contain numbers only."
                      />
                    </Field>
                    <Field label="Unit">
                      <select className={selectClass}>
                        <option>Select</option>
                        <option>ml</option>
                        <option>peg</option>
                        <option>bottle</option>
                      </select>
                    </Field>
                    <Field label="Frequency">
                      <select className={selectClass}>
                        <option>Select</option>
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </Field>
                    <Field label="Remarks">
                      <Input placeholder="Enter remarks" />
                    </Field>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        ) : null}
      </div>

      {!embedded ? (
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
              {activeTabIndex === tabs.length - 1 ? (
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
                <Button onClick={nextTab} size="sm" type="button">
                  Save & Continue
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
