"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileClock,
  Filter,
  FlaskConical,
  LineChart,
  Plus,
  Printer,
  Save,
  Table2,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type FlowType = "intake" | "output";
type ViewWindow = "hourly" | "6-hourly" | "12-hours" | "24-hours";
type SourceType = "Drug administration" | "Blood administration" | "Urine assessment" | "Stool assessment" | "Emesis assessment" | "Manual";

type FlowEntry = {
  id: string;
  type: FlowType;
  category: string;
  component: string;
  quantityMl: number;
  comment: string;
  exactTime: string;
  source: SourceType;
};

type RowConfig = {
  type: FlowType;
  label: string;
  aliases?: string[];
  section?: boolean;
};

type Bucket = {
  key: string;
  label: string;
  startHour: number;
  endHour: number;
};

const intakeRows: RowConfig[] = [
  { type: "intake", label: "Intake", section: true },
  { type: "intake", label: "Oral" },
  { type: "intake", label: "P.O" },
  { type: "intake", label: "Oral supplements" },
  { type: "intake", label: "Gastric" },
  { type: "intake", label: "Enteral Tube", aliases: ["NG Tube"] },
  { type: "intake", label: "NG Tube", aliases: ["Enteral Tube"] },
  { type: "intake", label: "Gastric wash" },
  { type: "intake", label: "IV" },
  { type: "intake", label: "Blood" },
  { type: "intake", label: "Medicine 1" },
  { type: "intake", label: "Medicine 2" },
  { type: "intake", label: "Fluid 1" },
  { type: "intake", label: "Fluid 2" },
  { type: "intake", label: "Others" },
];

const outputRows: RowConfig[] = [
  { type: "output", label: "Output", section: true },
  { type: "output", label: "Est. Blood loss" },
  { type: "output", label: "Urine output" },
  { type: "output", label: "Stool/colostomy output", aliases: ["Stool output"] },
  { type: "output", label: "Emesis output" },
  { type: "output", label: "NG Aspiration" },
  { type: "output", label: "Drain Output" },
  { type: "output", label: "Drain 1" },
];

const rowConfigs = [...intakeRows, ...outputRows];
const editableRows = rowConfigs.filter((row) => !row.section);
const today = "2026-05-26";
const defaultFromDate = "2026-05-22";
const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";

const seedEntries: FlowEntry[] = [];

function padHour(hour: number) {
  return String(hour).padStart(2, "0");
}

function getBuckets(view: ViewWindow): Bucket[] {
  if (view === "hourly") {
    return Array.from({ length: 24 }, (_, hour) => ({
      key: String(hour),
      label: `${padHour(hour)}:00`,
      startHour: hour,
      endHour: hour + 1,
    }));
  }

  if (view === "6-hourly") {
    return [
      { key: "0-6", label: "00:00 - 06:00", startHour: 0, endHour: 6 },
      { key: "6-12", label: "06:00 - 12:00", startHour: 6, endHour: 12 },
      { key: "12-18", label: "12:00 - 18:00", startHour: 12, endHour: 18 },
      { key: "18-24", label: "18:00 - 00:00", startHour: 18, endHour: 24 },
    ];
  }

  if (view === "12-hours") {
    return [
      { key: "6-18", label: "06:00 - 18:00", startHour: 6, endHour: 18 },
      { key: "18-6", label: "18:00 - 06:00", startHour: 18, endHour: 30 },
      { key: "total", label: "Total", startHour: 0, endHour: 24 },
    ];
  }

  return [{ key: "date", label: "26 May 2026", startHour: 0, endHour: 24 }];
}

function entryHour(entry: FlowEntry) {
  return new Date(entry.exactTime).getHours();
}

function entryDateKey(entry: FlowEntry) {
  return entry.exactTime.slice(0, 10);
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateLabel(value: string) {
  const date = parseDateKey(value);
  if (!date) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}

function viewLabel(value: ViewWindow) {
  if (value === "6-hourly") return "6 hourly";
  if (value === "12-hours") return "12 hours";
  if (value === "24-hours") return "24 hours";
  return "Hourly";
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateRangeKeys(from: string, to: string) {
  const fromDate = parseDateKey(from);
  const toDate = parseDateKey(to);
  if (!fromDate || !toDate) return [today];

  const start = fromDate <= toDate ? fromDate : toDate;
  const end = fromDate <= toDate ? toDate : fromDate;
  const days: string[] = [];

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    days.push(dateKeyFromDate(date));
    if (days.length >= 31) break;
  }

  return days;
}

function isoToText(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

function textToIso(value: string) {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year || year.length !== 4) return "";
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join("/");
}

function textDateToParts(value: string) {
  const iso = textToIso(value);
  const date = iso ? parseDateKey(iso) : new Date();
  return { month: date?.getMonth() ?? new Date().getMonth(), year: date?.getFullYear() ?? new Date().getFullYear() };
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function yearRangeStart(year: number) {
  return Math.floor(year / 5) * 5;
}

function yearRangeLabel(start: number) {
  const end = start + 5;
  const endLabel = Math.floor(start / 100) === Math.floor(end / 100) ? String(end).slice(2) : String(end);
  return `${start} - ${endLabel}`;
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
  const lastYear = Math.max(currentYear + 125, yearRangeStart(visibleYear) + 25);
  const ranges = React.useMemo(() => Array.from({ length: Math.ceil((lastYear - 1900) / 5) + 1 }, (_, index) => 1900 + index * 5), [lastYear]);
  const [selectedRangeStart, setSelectedRangeStart] = React.useState<number | null>(null);
  const exactYears = selectedRangeStart ? Array.from({ length: 6 }, (_, index) => selectedRangeStart + index) : [];

  return (
    <div className="absolute inset-0 z-10 flex flex-col overflow-hidden rounded-lg bg-surface">
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="border-b border-border p-3">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <CalendarDays className="h-5 w-5 text-primary" />
            {selectedRangeStart ? yearRangeLabel(selectedRangeStart) : "Select Year"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{selectedRangeStart ? "Choose exact year" : "Choose a year range"}</p>
        </div>
        <div className="grid flex-1 gap-2 overflow-auto p-3 sm:grid-cols-2">
          {(selectedRangeStart ? exactYears : ranges).map((value) => {
            const active = selectedRangeStart ? visibleYear === value : visibleYear >= value && visibleYear <= value + 5;
            return (
              <button
                className={`min-h-12 rounded-md border px-3 text-sm font-medium transition ${
                  active ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:border-primary/50 hover:bg-surface-muted"
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
            );
          })}
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

function bucketIncludes(bucket: Bucket, hour: number) {
  if (bucket.key === "total") return true;
  if (bucket.endHour <= 24) return hour >= bucket.startHour && hour < bucket.endHour;
  return hour >= bucket.startHour || hour < bucket.endHour - 24;
}

function matchesCategory(entry: FlowEntry, row: RowConfig) {
  return entry.category === row.label || Boolean(row.aliases?.includes(entry.category));
}

function entriesForCell(entries: FlowEntry[], row: RowConfig, bucket: Bucket) {
  return entries.filter((entry) => entry.type === row.type && matchesCategory(entry, row) && bucketIncludes(bucket, entryHour(entry)));
}

function sumEntries(entries: FlowEntry[]) {
  return entries.reduce((total, entry) => total + entry.quantityMl, 0);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

function sourceTone(source: SourceType) {
  if (source === "Manual") return "muted" as const;
  if (source.includes("assessment")) return "info" as const;
  if (source === "Blood administration") return "danger" as const;
  return "success" as const;
}

function firstEditableCategory(type: FlowType) {
  return editableRows.find((row) => row.type === type)?.label ?? "";
}

function DateTextInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [displayValue, setDisplayValue] = React.useState(() => isoToText(value));
  const [open, setOpen] = React.useState(false);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() => textDateToParts(isoToText(value)).month);
  const [visibleYear, setVisibleYear] = React.useState(() => textDateToParts(isoToText(value)).year);
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const selected = value ? parseDateKey(value) : null;
  const monthNames = React.useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
  const totalDays = daysInMonth(visibleMonth, visibleYear);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setYearPickerOpen(false);
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

  function updatePopoverPosition() {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(352, window.innerWidth - 32);
    const left = Math.min(Math.max(rect.left, 16), window.innerWidth - width - 16);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow >= 360 ? rect.bottom + 8 : Math.max(16, rect.top - 360);
    setPopoverStyle({ left, top, width });
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = formatDateInput(event.target.value);
    setDisplayValue(nextValue);
    const iso = textToIso(nextValue);
    if (iso || !nextValue) onChange(iso);
    const nextDate = iso ? parseDateKey(iso) : null;
    if (nextDate) {
      setVisibleMonth(nextDate.getMonth());
      setVisibleYear(nextDate.getFullYear());
    }
  }

  function selectDate(day: number) {
    const iso = dateKeyFromDate(new Date(visibleYear, visibleMonth, day));
    setDisplayValue(isoToText(iso));
    onChange(iso);
    setOpen(false);
    setYearPickerOpen(false);
  }

  function moveMonth(direction: -1 | 1) {
    const nextDate = new Date(visibleYear, visibleMonth + direction, 1);
    setVisibleMonth(nextDate.getMonth());
    setVisibleYear(nextDate.getFullYear());
  }

  function selectToday() {
    const now = new Date();
    const iso = dateKeyFromDate(now);
    setVisibleMonth(now.getMonth());
    setVisibleYear(now.getFullYear());
    setDisplayValue(isoToText(iso));
    onChange(iso);
    setOpen(false);
    setYearPickerOpen(false);
  }

  function selectTodayYear() {
    const now = new Date();
    setVisibleMonth(now.getMonth());
    setVisibleYear(now.getFullYear());
    setYearPickerOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          aria-label="Select date"
          inputMode="numeric"
          maxLength={10}
          onChange={handleChange}
          onFocus={() => {
            updatePopoverPosition();
            setOpen(true);
          }}
          placeholder="DD / MM / YYYY"
          value={displayValue}
        />
        <button
          aria-label="Open date selector"
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground"
          onClick={() => {
            updatePopoverPosition();
            setOpen((current) => !current);
          }}
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
              <select aria-label="Select month" className={selectClass} onChange={(event) => setVisibleMonth(Number(event.target.value))} value={visibleMonth}>
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
              const active = selected?.getDate() === day && selected.getMonth() === visibleMonth && selected.getFullYear() === visibleYear;
              return (
                <button
                  className={`h-8 rounded-md text-xs font-medium transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-surface-muted"}`}
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
            <Button onClick={() => { setDisplayValue(""); onChange(""); setOpen(false); }} size="sm" type="button" variant="ghost">
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

export function IntakeOutputPage() {
  const [view, setView] = React.useState<ViewWindow>("hourly");
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [fromDate, setFromDate] = React.useState(defaultFromDate);
  const [toDate, setToDate] = React.useState(today);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [entries, setEntries] = React.useState<FlowEntry[]>(seedEntries);
  const [popupOpen, setPopupOpen] = React.useState(false);
  const [editingCell, setEditingCell] = React.useState<{ row: RowConfig; bucket: Bucket; dateKey: string } | null>(null);
  const [draft, setDraft] = React.useState({
    type: "intake" as FlowType,
    category: "Fluid 1",
    component: "",
    quantityMl: "",
    comment: "",
    exactTime: `${today}T${new Date().toTimeString().slice(0, 5)}`,
  });

  const activeSelectedDate = selectedDate || today;
  const buckets = React.useMemo(() => getBuckets(view), [view]);
  const selectedDayEntries = React.useMemo(() => entries.filter((entry) => entryDateKey(entry) === activeSelectedDate), [entries, activeSelectedDate]);
  const intakeTotal = sumEntries(selectedDayEntries.filter((entry) => entry.type === "intake"));
  const outputTotal = sumEntries(selectedDayEntries.filter((entry) => entry.type === "output"));
  const netTotal = intakeTotal - outputTotal;
  const previousDayNet = 320;

  const chartData = buckets.map((bucket) => {
    const intake = sumEntries(selectedDayEntries.filter((entry) => entry.type === "intake" && bucketIncludes(bucket, entryHour(entry))));
    const output = sumEntries(selectedDayEntries.filter((entry) => entry.type === "output" && bucketIncludes(bucket, entryHour(entry))));
    return { name: bucket.label, Intake: intake, Output: output, Balance: intake - output };
  });

  const cumulativeData = dateRangeKeys(fromDate, toDate).map((day) => {
    const dayEntries = entries.filter((entry) => entryDateKey(entry) === day);
    const intake = sumEntries(dayEntries.filter((entry) => entry.type === "intake"));
    const output = sumEntries(dayEntries.filter((entry) => entry.type === "output"));
    return { day, intake, output, balance: intake - output };
  });
  const filterSummary = `${viewLabel(view)} | ${formatDateLabel(activeSelectedDate)} | ${formatDateLabel(fromDate)} - ${formatDateLabel(toDate)}`;

  function openEntryPopup(row?: RowConfig, bucket?: Bucket) {
    const hour = bucket && bucket.startHour < 24 ? bucket.startHour : new Date().getHours();
    const type = row?.type ?? "intake";
    const cellEntries = row && bucket && !row.section ? entriesForCell(selectedDayEntries, row, bucket) : [];
    const firstEntry = cellEntries[0];

    setEditingCell(row && bucket && !row.section ? { row, bucket, dateKey: activeSelectedDate } : null);
    setDraft({
      type,
      category: row && !row.section ? row.label : firstEditableCategory(type),
      component: firstEntry?.component ?? "",
      quantityMl: cellEntries.length ? String(sumEntries(cellEntries)) : "",
      comment: firstEntry?.comment ?? "",
      exactTime: firstEntry?.exactTime ?? `${activeSelectedDate}T${padHour(hour)}:00`,
    });
    setPopupOpen(true);
  }

  function saveEntry() {
    const quantity = Number(draft.quantityMl);
    const component = draft.component.trim() || draft.category;

    if (!draft.category) {
      toast.error("Please select a component row.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error("Please enter a valid quantity in ml.");
      return;
    }

    if (!draft.exactTime || Number.isNaN(new Date(draft.exactTime).getTime())) {
      toast.error("Please select a valid exact time.");
      return;
    }

    setEntries((current) => {
      const nextEntry = {
        id: `manual-${Date.now()}`,
        type: draft.type,
        category: draft.category,
        component,
        quantityMl: quantity,
        comment: draft.comment.trim() || "Added from Intake-Output screen",
        exactTime: draft.exactTime,
        source: "Manual",
      } satisfies FlowEntry;

      if (!editingCell) return [...current, nextEntry];

      return [
        ...current.filter((entry) => !(entryDateKey(entry) === editingCell.dateKey && entry.type === editingCell.row.type && matchesCategory(entry, editingCell.row) && bucketIncludes(editingCell.bucket, entryHour(entry)))),
        nextEntry,
      ];
    });
    setPopupOpen(false);
    setEditingCell(null);
    toast.success("Intake-output entry saved.");
  }

  return (
    <>
      
          <div className="mb-4 mt-3 text-end">
            <Button className="mr-3 " variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 " />
              Print
            </Button>
            <Button onClick={() => openEntryPopup()}>
              <Plus className="h-4 w-4" />
              Add I/O
            </Button>
          </div>
        
      <div className="space-y-4 py-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Intake" value={intakeTotal} change="ml" context="Selected day total" tone="success" icon={Droplets} />
          <StatCard label="Output" value={outputTotal} change="ml" context="Selected day total" tone="info" icon={FlaskConical} />
          <StatCard label="Net balance" value={netTotal} change={netTotal >= 0 ? "Positive" : "Negative"} context="Intake minus output" tone={netTotal >= 0 ? "success" : "warning"} icon={Activity} />
          <StatCard label="Previous day" value={previousDayNet} change="Carry" context="Previous day I/O" tone="muted" icon={FileClock} />
        </div>

      

        <Card>
          <CardContent className="p-3">
            <button
              aria-expanded={filtersOpen}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-surface-muted px-3 py-2 text-left transition hover:bg-surface-muted/80 focus:outline-none focus:ring-2 focus:ring-ring/20"
              onClick={() => setFiltersOpen((current) => !current)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Filter className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold text-foreground">Filter</span>
                  <span className="block truncate text-xs text-muted-foreground">{filterSummary}</span>
                </span>
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", filtersOpen && "rotate-180")} />
            </button>

            {filtersOpen ? (
              <div className="mt-3 grid gap-3 md:grid-cols-4">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">View</span>
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={view} onChange={(event) => setView(event.target.value as ViewWindow)}>
                    <option value="hourly">Hourly</option>
                    <option value="6-hourly">6 hourly</option>
                    <option value="12-hours">12 Hours</option>
                    <option value="24-hours">24 Hours</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Date</span>
                  <DateTextInput value={selectedDate} onChange={setSelectedDate} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">From</span>
                  <DateTextInput value={fromDate} onChange={setFromDate} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">To</span>
                  <DateTextInput value={toDate} onChange={setToDate} />
                </label>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table">
              <Table2 className="mr-2 h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="graph">
              <LineChart className="mr-2 h-4 w-4" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="cumulative">
              <Activity className="mr-2 h-4 w-4" />
              Cumulative
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <IntakeOutputTable buckets={buckets} entries={selectedDayEntries} onCellDoubleClick={openEntryPopup} />
          </TabsContent>

          <TabsContent value="graph">
            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader>
                  <CardTitle>Intake vs Output Trend</CardTitle>
                  <CardDescription>Aggregated from the selected view buckets.</CardDescription>
                </CardHeader>
                <CardContent className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="Intake" stroke="#15803d" fill="#bbf7d0" />
                      <Area type="monotone" dataKey="Output" stroke="#0369a1" fill="#bae6fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <RunningTotal intake={intakeTotal} output={outputTotal} previousDayNet={previousDayNet} />
            </div>
          </TabsContent>

          <TabsContent value="cumulative">
            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader>
                  <CardTitle>Cumulative Daily Balance</CardTitle>
                  <CardDescription>Five-day date summary matching the workbook cumulative section.</CardDescription>
                </CardHeader>
                <CardContent className="h-[380px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cumulativeData} margin={{ left: 0, right: 12, top: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={formatDateLabel} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="intake" name="Intake" fill="#15803d" />
                      <Bar dataKey="output" name="Output" fill="#0369a1" />
                      <Bar dataKey="balance" name="Balance" fill="#a16207" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Reflection</CardTitle>
                  <CardDescription>Clinical source mapping from Sheet1.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {["Drug administration", "Blood administration", "Urine assessment", "Stool assessment", "Emesis assessment", "Manual"].map((source) => (
                    <div key={source} className="flex items-center justify-between gap-3 rounded-md border border-border p-2 text-sm">
                      <span>{source}</span>
                      <Badge tone={sourceTone(source as SourceType)}>{entries.filter((entry) => entry.source === source).length}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog.Root open={popupOpen} onOpenChange={setPopupOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[620px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
              <div>
                <Dialog.Title className="text-sm font-semibold text-foreground">Add intake-output detail</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                  Double-click flow capture with component, quantity, comment, and editable exact time.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Close popup">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <div className="space-y-3">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Type</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={draft.type}
                    onChange={(event) => {
                      const type = event.target.value as FlowType;
                      setDraft((current) => ({ ...current, type, category: firstEditableCategory(type) }));
                    }}
                  >
                    <option value="intake">Intake</option>
                    <option value="output">Output</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Component row</span>
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                    {editableRows.filter((row) => row.type === draft.type).map((row) => (
                      <option key={row.label} value={row.label}>
                        {row.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Component</span>
                  <Input value={draft.component} onChange={(event) => setDraft((current) => ({ ...current, component: event.target.value }))} placeholder="Free text component" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Quantity (ml)</span>
                  <Input inputMode="numeric" value={draft.quantityMl} onChange={(event) => setDraft((current) => ({ ...current, quantityMl: event.target.value }))} placeholder="Number" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Exact time</span>
                  <Input type="datetime-local" value={draft.exactTime} onChange={(event) => setDraft((current) => ({ ...current, exactTime: event.target.value }))} />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Comment</span>
                  <textarea
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={draft.comment}
                    onChange={(event) => setDraft((current) => ({ ...current, comment: event.target.value }))}
                    placeholder="Free text comment"
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border bg-surface p-3">
              <Button variant="outline" onClick={() => setPopupOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveEntry}>
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function IntakeOutputTable({
  buckets,
  entries,
  onCellDoubleClick,
}: {
  buckets: Bucket[];
  entries: FlowEntry[];
  onCellDoubleClick: (row: RowConfig, bucket: Bucket) => void;
}) {
  const intakeTotalByBucket = (bucket: Bucket) => sumEntries(entries.filter((entry) => entry.type === "intake" && bucketIncludes(bucket, entryHour(entry))));
  const outputTotalByBucket = (bucket: Bucket) => sumEntries(entries.filter((entry) => entry.type === "output" && bucketIncludes(bucket, entryHour(entry))));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Input Output Table</CardTitle>
          <CardDescription>Hover quantity cells for captured details. Double-click a cell to add a new entry.</CardDescription>
        </div>
        <Badge tone="success">{buckets.length} buckets</Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-muted">
                <th className="sticky left-0 z-10 min-w-48 border-b border-r border-border bg-surface-muted px-3 py-2 text-left font-semibold">Component</th>
                {buckets.map((bucket) => (
                  <th key={bucket.key} className="min-w-28 border-b border-r border-border px-3 py-2 text-center font-semibold">
                    {bucket.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowConfigs.map((row) => {
                if (row.section) {
                  return (
                    <tr key={row.label} className={cn(row.type === "intake" ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-sky-50 dark:bg-sky-950/20")}>
                      <td className="sticky left-0 z-10 border-b border-r border-border bg-inherit px-3 py-2 font-semibold">{row.label}</td>
                      {buckets.map((bucket) => (
                        <td key={bucket.key} className="border-b border-r border-border px-3 py-2" />
                      ))}
                    </tr>
                  );
                }

                return (
                  <tr key={`${row.type}-${row.label}`} className="hover:bg-surface-muted/60">
                    <td className="sticky left-0 z-10 border-b border-r border-border bg-surface px-3 py-2 font-medium">{row.label}</td>
                    {buckets.map((bucket) => {
                      const cellEntries = entriesForCell(entries, row, bucket);
                      const value = sumEntries(cellEntries);
                      return (
                        <td
                          key={bucket.key}
                          className="group relative h-11 border-b border-r border-border px-3 py-2 text-center"
                          onDoubleClick={() => onCellDoubleClick(row, bucket)}
                        >
                          <button className="h-7 min-w-16 rounded-md px-2 text-sm hover:bg-primary-soft" type="button">
                            {value ? `${value}` : ""}
                          </button>
                          {cellEntries.length ? <CellTooltip entries={cellEntries} /> : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <TotalRow label="Intake total" buckets={buckets} getValue={intakeTotalByBucket} className="bg-emerald-50 font-semibold dark:bg-emerald-950/20" />
              <TotalRow label="Output total" buckets={buckets} getValue={outputTotalByBucket} className="bg-sky-50 font-semibold dark:bg-sky-950/20" />
              <TotalRow label="Intake/Output" buckets={buckets} getValue={(bucket) => intakeTotalByBucket(bucket) - outputTotalByBucket(bucket)} className="bg-amber-50 font-semibold dark:bg-amber-950/20" />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function TotalRow({
  label,
  buckets,
  getValue,
  className,
}: {
  label: string;
  buckets: Bucket[];
  getValue: (bucket: Bucket) => number;
  className?: string;
}) {
  return (
    <tr className={className}>
      <td className="sticky left-0 z-10 border-b border-r border-border bg-inherit px-3 py-2">{label}</td>
      {buckets.map((bucket) => (
        <td key={bucket.key} className="border-b border-r border-border px-3 py-2 text-center">
          {getValue(bucket)}
        </td>
      ))}
    </tr>
  );
}

function CellTooltip({ entries }: { entries: FlowEntry[] }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-9 z-20 hidden w-72 -translate-x-1/2 rounded-md border border-border bg-surface p-3 text-left shadow-lg group-hover:block">
      <div className="mb-2 text-xs font-semibold">Captured details</div>
      <div className="space-y-2">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded border border-border p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold">{entry.component}</span>
              <Badge tone={sourceTone(entry.source)}>{entry.quantityMl} ml</Badge>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{formatTime(entry.exactTime)} | {entry.source}</div>
            <div className="mt-1 text-xs text-muted-foreground">{entry.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunningTotal({ intake, output, previousDayNet }: { intake: number; output: number; previousDayNet: number }) {
  const rows = [
    ["Intake", `${intake} ml`],
    ["Output", `${output} ml`],
    ["Intake/Output", `${intake - output} ml`],
    ["Previous day Intake/Output", `${previousDayNet} ml`],
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Running Total</CardTitle>
        <CardDescription>Matches the workbook running total panel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold">{value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
