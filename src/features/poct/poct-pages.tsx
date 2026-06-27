"use client";

import * as React from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { users } from "@/data/mock";
import { cn } from "@/lib/utils";
import {
  poctPatients,
  poctTests,
  poctUsers,
  readSelectedPoctTests,
  readPoctResults,
  writeSelectedPoctTests,
  writePoctResults,
  type PoctResult,
  type PoctStatus,
  type PoctTest,
} from "@/features/poct/poct-data";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";
const labelClass = "text-xs font-medium text-foreground";
const fieldClass = "space-y-1.5";

type DraftCard = {
  id: string;
  test: PoctTest;
  result: string;
  unit: string;
  performedBy: string;
  verifiedBy: string;
  date: string;
  time: string;
  status: PoctStatus;
  notes: string;
};

type DraftErrors = Partial<Record<"result" | "date" | "time" | "performedBy", string>>;
type PoctWorkspaceMode = "add" | "results";

type PoctWorkspaceProps = {
  embedded?: boolean;
  mode?: PoctWorkspaceMode;
  onModeChange?: (mode: PoctWorkspaceMode) => void;
  showModeActions?: boolean;
};

type DraftAction =
  | { type: "add"; drafts: DraftCard[] }
  | { type: "remove"; id: string }
  | { type: "replace"; drafts: DraftCard[] }
  | { type: "reset" }
  | { type: "syncPerformer"; performedBy: string }
  | { type: "update"; id: string; patch: Partial<DraftCard> };

function draftsReducer(drafts: DraftCard[], action: DraftAction) {
  switch (action.type) {
    case "add":
      return [...drafts, ...action.drafts];
    case "remove":
      return drafts.filter((draft) => draft.id !== action.id);
    case "replace":
      return action.drafts;
    case "reset":
      return [];
    case "syncPerformer":
      return drafts.map((draft) => ({ ...draft, performedBy: action.performedBy }));
    case "update":
      return drafts.map((draft) => (draft.id === action.id ? { ...draft, ...action.patch } : draft));
  }
}

function formatDateForStorage(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isoToDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function displayDateToIso(value: string) {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year || year.length !== 4) return value;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function parseDateValue(value: string) {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year || year.length !== 4) return null;
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const date = new Date(parsedYear, parsedMonth - 1, parsedDay);
  return date.getFullYear() === parsedYear && date.getMonth() === parsedMonth - 1 && date.getDate() === parsedDay ? date : null;
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
  return { day: date.getDate(), month: date.getMonth(), year: date.getFullYear() };
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
            return selectedRangeStart ? (
              <button
                className={`min-h-12 rounded-md border px-3 text-sm font-medium transition ${
                  active ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:border-primary/50 hover:bg-surface-muted"
                }`}
                key={value}
                onClick={() => {
                  onSelectYear(value);
                  onClose();
                }}
                type="button"
              >
                {value}
              </button>
            ) : (
              <button
                className={`min-h-12 rounded-md border px-3 text-sm font-medium transition ${
                  active ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:border-primary/50 hover:bg-surface-muted"
                }`}
                key={value}
                onClick={() => setSelectedRangeStart(value)}
                type="button"
              >
                {yearRangeLabel(value)}
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

function preventInvalidDateInput(event: React.FormEvent<HTMLInputElement>) {
  const nativeEvent = event.nativeEvent as InputEvent;
  const data = nativeEvent.data ?? "";
  if (data && /\D/.test(data)) event.preventDefault();
}

function preventInvalidDatePaste(event: React.ClipboardEvent<HTMLInputElement>) {
  if (/\D/.test(event.clipboardData.getData("text"))) event.preventDefault();
}

function getPoctPerformer(role: ReturnType<typeof useRole>["role"]) {
  return users.find((user) => user.role === role)?.name ?? "Nurse John";
}

function makeDraft(test: PoctTest, performedBy = "Nurse John"): DraftCard {
  return {
    id: `${test.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    test,
    result: "",
    unit: test.unit,
    performedBy,
    verifiedBy: "Dr. Smith",
    date: formatDateForStorage(new Date()),
    time: "08:30",
    status: "Completed",
    notes: "",
  };
}

function displayDate(value: string) {
  return value.includes("-") ? isoToDisplayDate(value) : value;
}

function displayTime(value: string) {
  if (!value.includes(":")) return value;
  const [hourText, minute] = value.split(":");
  const hour = Number(hourText);
  const period = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 || 12;
  return `${String(normalized).padStart(2, "0")}:${minute} ${period}`;
}

function statusTone(status: PoctStatus) {
  if (status === "Verified") return "info";
  if (status === "Completed") return "success";
  return "warning";
}

function DateTextInput({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [yearPickerOpen, setYearPickerOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(() => textDateToParts(value).month);
  const [visibleYear, setVisibleYear] = React.useState(() => textDateToParts(value).year);
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const selected = parseDateValue(value);
  const monthNames = React.useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
  const totalDays = daysInMonth(visibleMonth, visibleYear);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextValue = formatDateInput(event.target.value);
    onChange(nextValue);
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

  function toggleCalendar() {
    updatePopoverPosition();
    setOpen((current) => !current);
  }

  function selectDate(day: number) {
    onChange(datePartsToText(day, visibleMonth, visibleYear));
    setOpen(false);
  }

  function moveMonth(direction: -1 | 1) {
    const nextDate = new Date(visibleYear, visibleMonth + direction, 1);
    setVisibleMonth(nextDate.getMonth());
    setVisibleYear(nextDate.getFullYear());
  }

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
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
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    onChange(datePartsToText(today.getDate(), today.getMonth(), today.getFullYear()));
    setOpen(false);
  }

  function selectTodayYear() {
    const today = new Date();
    setVisibleMonth(today.getMonth());
    setVisibleYear(today.getFullYear());
    setYearPickerOpen(false);
  }

  function clearDate() {
    onChange("");
    setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          aria-label="Select date"
          inputMode="numeric"
          maxLength={10}
          onBeforeInput={preventInvalidDateInput}
          onChange={handleChange}
          onFocus={() => {
            updatePopoverPosition();
            setOpen(true);
          }}
          onPaste={preventInvalidDatePaste}
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
        <div className="fixed z-[100] h-[356px] rounded-lg border border-border bg-surface p-3 shadow-soft" style={popoverStyle}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button aria-label="Previous month" onClick={() => moveMonth(-1)} size="icon" type="button" variant="ghost">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="grid flex-1 grid-cols-[1fr_6rem] gap-2">
              <select aria-label="Select month" className={selectClass} onChange={(event) => setVisibleMonth(Number(event.target.value))} value={visibleMonth}>
                {monthNames.map((monthName, index) => <option key={monthName} value={index}>{monthName}</option>)}
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
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => <span key={dayName}>{dayName}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: new Date(visibleYear, visibleMonth, 1).getDay() }).map((_, index) => <span key={`blank-${index}`} />)}
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
            <Button onClick={clearDate} size="sm" type="button" variant="ghost">Clear</Button>
            <Button onClick={selectToday} size="sm" type="button" variant="outline">Today</Button>
          </div>
          {yearPickerOpen ? <YearRangePicker onClose={() => setYearPickerOpen(false)} onSelectYear={setVisibleYear} onToday={selectTodayYear} visibleYear={visibleYear} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ActionButtons({ mode, onModeChange }: { mode?: PoctWorkspaceMode; onModeChange?: (mode: PoctWorkspaceMode) => void }) {
  return (
    <>
      <Button
        className={cn(
          "rounded-lg border-transparent bg-transparent font-bold text-slate-700 hover:bg-white/70 hover:text-slate-900",
          mode === "add" && "bg-white text-primary shadow-sm hover:bg-white hover:text-primary",
        )}
        size="sm"
        type="button"
        variant="outline"
        onClick={() => onModeChange?.("add")}
      >
        Add POCT
      </Button>
      <Button
        className={cn(
          "rounded-lg border-transparent bg-transparent font-bold text-slate-700 hover:bg-white/70 hover:text-slate-900",
          mode === "results" && "bg-white text-primary shadow-sm hover:bg-white hover:text-primary",
        )}
        size="sm"
        type="button"
        variant="outline"
        onClick={() => onModeChange?.("results")}
      >
        View POCT Result
      </Button>
    </>
  );
}

function TestPicker({
  selectedTests,
  search,
  onSearchChange,
  onToggle,
  onAddAnotherTime,
  actions,
}: {
  selectedTests: string[];
  search: string;
  onSearchChange: (value: string) => void;
  onToggle: (id: string) => void;
  onAddAnotherTime: () => void;
  actions?: React.ReactNode;
}) {
  const filtered = poctTests.filter((test) => test.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Card className="shadow-none">
      <CardContent className="space-y-3 p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="min-w-[180px] md:pb-2 xl:min-w-[220px]">
            <span className={labelClass}>Configured POCT Tests <span className="text-danger">*</span></span>
          </div>
          <label className="min-w-[260px] flex-1 space-y-1.5">
            <span className="sr-only">Search configured POCT tests</span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search lab master tests linked to equipment..." value={search} onChange={(event) => onSearchChange(event.target.value)} />
            </div>
          </label>
          {/* <Button className="shrink-0" size="sm" type="button" onClick={onAddAnotherTime} disabled={!selectedTests.length}>
            Add another time
          </Button> */}
          {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
        <div className="rounded-md border border-border bg-background p-2">
          <div className="mb-2 flex flex-wrap gap-1">
            {selectedTests.length ? selectedTests.map((id) => {
              const test = poctTests.find((item) => item.id === id);
              return test ? (
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary" key={id}>
                  {test.name}
                  <button aria-label={`Remove ${test.name}`} type="button" onClick={() => onToggle(id)}><X className="h-3 w-3" /></button>
                </span>
              ) : null;
            }) : <span className="text-xs text-muted-foreground">Select one or more tests</span>}
          </div>
          <div className="grid gap-1 border-t border-border pt-2 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((test) => (
              <label className="grid cursor-pointer grid-cols-[auto_1fr] gap-2 rounded px-2 py-1.5 text-xs hover:bg-surface-muted" key={test.id}>
                <input checked={selectedTests.includes(test.id)} className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-ring" onChange={() => onToggle(test.id)} type="checkbox" />
                <span>
                  <span className="block font-medium text-foreground">{test.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{test.labMasterCode} / {test.equipment}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DraftCardForm({
  draft,
  errors,
  onChange,
  onRemove,
}: {
  draft: DraftCard;
  errors?: DraftErrors;
  onChange: (id: string, patch: Partial<DraftCard>) => void;
  onRemove: (id: string) => void;
}) {
  const errorInputClass = "border-danger focus:border-danger focus:ring-danger/20";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3">
        <div>
          <CardTitle className="text-primary">{draft.test.name}</CardTitle>
          <div className="mt-1 text-xs text-muted-foreground">{draft.test.labMasterCode} / {draft.test.equipment}</div>
        </div>
        <Button aria-label="Remove test card" size="icon" type="button" variant="ghost" onClick={() => onRemove(draft.id)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        <label className={fieldClass}>
          <span className={labelClass}>Result <span className="text-danger">*</span></span>
          <Input className={errors?.result ? errorInputClass : undefined} value={draft.result} onChange={(event) => onChange(draft.id, { result: event.target.value })} />
          {errors?.result ? <span className="text-[11px] font-medium text-danger">{errors.result}</span> : null}
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Unit</span>
          <select className={selectClass} value={draft.unit} onChange={(event) => onChange(draft.id, { unit: event.target.value })}>
            <option>{draft.test.unit}</option>
            <option>value</option>
            <option>result</option>
          </select>
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Date <span className="text-danger">*</span></span>
          <DateTextInput value={displayDate(draft.date)} onChange={(value) => onChange(draft.id, { date: displayDateToIso(value) })} required />
          {errors?.date ? <span className="text-[11px] font-medium text-danger">{errors.date}</span> : null}
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Time <span className="text-danger">*</span></span>
          <Input className={errors?.time ? errorInputClass : undefined} type="time" value={draft.time} onChange={(event) => onChange(draft.id, { time: event.target.value })} />
          {errors?.time ? <span className="text-[11px] font-medium text-danger">{errors.time}</span> : null}
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Performed By <span className="text-danger">*</span></span>
          <Input
            className={errors?.performedBy ? errorInputClass : undefined}
            readOnly
            value={draft.performedBy}
          />
          {errors?.performedBy ? <span className="text-[11px] font-medium text-danger">{errors.performedBy}</span> : null}
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Verified By</span>
          <Input list="poct-staff-options" value={draft.verifiedBy} onChange={(event) => onChange(draft.id, { verifiedBy: event.target.value })} />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Status <span className="text-danger">*</span></span>
          <select className={selectClass} value={draft.status} onChange={(event) => onChange(draft.id, { status: event.target.value as PoctStatus })}>
            <option>Completed</option>
            <option>Verified</option>
            <option>Pending</option>
          </select>
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Notes</span>
          <input
            className="h-9 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
            style={{
              minWidth: "100%",
              width: `${Math.min(72, Math.max(24, draft.notes.length + 14))}ch`,
            }}
            value={draft.notes}
            onChange={(event) => onChange(draft.id, { notes: event.target.value })}
          />
        </label>
      </CardContent>
    </Card>
  );
}

export function AddPoctPage({ embedded = false, mode, onModeChange, showModeActions = true }: PoctWorkspaceProps = {}) {
  const { role } = useRole();
  const performedBy = getPoctPerformer(role);
  const [localMode, setLocalMode] = React.useState<PoctWorkspaceMode>("add");
  const activeMode = mode ?? localMode;
  const changeMode = React.useCallback(
    (nextMode: PoctWorkspaceMode) => {
      if (onModeChange) onModeChange(nextMode);
      else setLocalMode(nextMode);
    },
    [onModeChange],
  );
  const [search, setSearch] = React.useState("");
  const [patientId, setPatientId] = React.useState("100123");
  const [selectedTests, setSelectedTests] = React.useState<string[]>(() => readSelectedPoctTests());
  const [drafts, dispatchDrafts] = React.useReducer(
    draftsReducer,
    null,
    () =>
    readSelectedPoctTests()
      .map((id) => poctTests.find((test) => test.id === id))
      .filter(Boolean)
      .map((test) => makeDraft(test as PoctTest, performedBy)),
  );
  const [draftErrors, setDraftErrors] = React.useState<Record<string, DraftErrors>>({});
  const selectedPatient = poctPatients.find((patient) => patient.id === patientId) ?? poctPatients[0];

  React.useEffect(() => {
    writeSelectedPoctTests(selectedTests);
  }, [selectedTests]);

  React.useEffect(() => {
    dispatchDrafts({ type: "syncPerformer", performedBy });
  }, [performedBy]);

  function toggleTest(id: string) {
    const test = poctTests.find((item) => item.id === id);
    if (!test) return;

    if (selectedTests.includes(id)) {
      setSelectedTests((current) => current.filter((item) => item !== id));
      dispatchDrafts({ type: "replace", drafts: drafts.filter((draft) => draft.test.id !== id) });
      return;
    }

    setSelectedTests((current) => [...current, id]);
    dispatchDrafts({ type: "add", drafts: [makeDraft(test, performedBy)] });
  }

  function addAnotherTimeForSelectedTests() {
    const tests = selectedTests.map((id) => poctTests.find((test) => test.id === id)).filter(Boolean) as PoctTest[];
    if (!tests.length) {
      toast.warning("Select at least one POCT test.");
      return;
    }
    dispatchDrafts({ type: "add", drafts: tests.map((test) => makeDraft(test, performedBy)) });
    toast.success(`${tests.length} repeat POCT entr${tests.length > 1 ? "ies" : "y"} added.`);
  }

  function updateDraft(id: string, patch: Partial<DraftCard>) {
    dispatchDrafts({ type: "update", id, patch });
    setDraftErrors((current) => {
      const nextErrors = { ...(current[id] ?? {}) };
      Object.keys(patch).forEach((key) => {
        delete nextErrors[key as keyof DraftErrors];
      });
      return { ...current, [id]: nextErrors };
    });
  }

  function removeDraft(id: string) {
    const nextDrafts = drafts.filter((draft) => draft.id !== id);
    dispatchDrafts({ type: "remove", id });
    setSelectedTests(Array.from(new Set(nextDrafts.map((draft) => draft.test.id))));
    setDraftErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    toast.info("POCT card removed.");
  }

  function resetForm() {
    setSearch("");
    setPatientId("100123");
    setSelectedTests([]);
    dispatchDrafts({ type: "reset" });
    setDraftErrors({});
    toast.info("Add POCT form reset.");
  }

  function saveResults() {
    if (!drafts.length) {
      toast.error("Select at least one POCT test before saving.");
      return;
    }

    const nextErrors = drafts.reduce<Record<string, DraftErrors>>((errors, draft) => {
      const fieldErrors: DraftErrors = {};
      if (!draft.result.trim()) fieldErrors.result = "Enter result.";
      if (!draft.date) fieldErrors.date = "Select date.";
      if (!draft.time) fieldErrors.time = "Select time.";
      if (!draft.performedBy.trim()) fieldErrors.performedBy = "Enter performed by.";
      if (Object.keys(fieldErrors).length) errors[draft.id] = fieldErrors;
      return errors;
    }, {});

    if (Object.keys(nextErrors).length) {
      setDraftErrors(nextErrors);
      toast.error("Please complete required POCT fields.");
      return;
    }
    setDraftErrors({});

    const saved = readPoctResults();
    const nextResults: PoctResult[] = [
      ...saved,
      ...drafts.map((draft) => ({
        id: draft.id,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        date: draft.date,
        time: displayTime(draft.time),
        testName: draft.test.name,
        result: draft.result,
        unit: draft.unit,
        performedBy: draft.performedBy,
        verifiedBy: draft.verifiedBy,
        status: draft.status,
        notes: draft.notes,
      })),
    ];
    writePoctResults(nextResults);
    toast.success("POCT results saved.");
  }

  if (activeMode === "results") {
    return <ViewPoctResultPage embedded={embedded} mode="results" onModeChange={changeMode} showModeActions={showModeActions} />;
  }

  return (
    <div className="space-y-4">
      <datalist id="poct-staff-options">
        {poctUsers.map((user) => <option key={user} value={user} />)}
      </datalist>
      {/* <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <label className={fieldClass}>
            <span className={labelClass}>Patient <span className="text-danger">*</span></span>
            <select className={selectClass} value={patientId} onChange={(event) => setPatientId(event.target.value)}>
              {poctPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.id} - {patient.name}</option>)}
            </select>
          </label>
          <label className={fieldClass}>
            <span className={labelClass}>Selected Patient</span>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-surface-muted px-3 py-2 text-sm font-medium text-foreground shadow-sm">
              {selectedPatient.name}
            </div>
          </label>
          <label className={fieldClass}>
            <span className={labelClass}>Source</span>
            <div className="flex h-9 w-full items-center rounded-md border border-input bg-surface-muted px-3 py-2 text-sm font-medium text-foreground shadow-sm">
              Lab master + equipment master
            </div>
          </label>
        </CardContent>
      </Card> */}
      <TestPicker
        actions={showModeActions ? <ActionButtons mode="add" onModeChange={changeMode} /> : null}
        selectedTests={selectedTests}
        search={search}
        onSearchChange={setSearch}
        onToggle={toggleTest}
        onAddAnotherTime={addAnotherTimeForSelectedTests}
      />
      <section className="grid gap-4 xl:grid-cols-3">
        {drafts.map((draft) => <DraftCardForm draft={draft} errors={draftErrors[draft.id]} key={draft.id} onChange={updateDraft} onRemove={removeDraft} />)}
      </section>
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
          <Button type="button" onClick={saveResults}>
            <CheckCircle2 className="h-4 w-4" />
            Save & Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildResultSlot(result: PoctResult) {
  return `${result.date} ${result.time}`;
}

function ResultsMatrix({ results }: { results: PoctResult[] }) {
  const slots = Array.from(new Set(results.map(buildResultSlot))).sort();
  const testNames = Array.from(new Set(results.map((result) => result.testName))).sort();

  if (!results.length) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">No POCT results match the selected filters.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>POCT Result Matrix</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-64 border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">Test</th>
                {slots.map((slot) => {
                  const [date, ...timeParts] = slot.split(" ");
                  return (
                    <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]" key={slot}>
                      <span className="block">{displayDate(date)}</span>
                      <span className="block normal-case text-muted-foreground">{timeParts.join(" ")}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {testNames.map((testName) => (
                <tr className="border-b border-border last:border-0 hover:bg-surface-muted/70" key={testName}>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] align-top">
                    <div className="font-medium text-foreground">{testName}</div>
                    <div className="text-xs text-muted-foreground">Result</div>
                  </td>
                  {slots.map((slot) => {
                    const result = results.find((row) => row.testName === testName && buildResultSlot(row) === slot);
                    return (
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] align-top" key={slot}>
                        {result ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{result.result} <span className="font-normal text-muted-foreground">{result.unit}</span></div>
                            <StatusPill tone={statusTone(result.status)}>{result.status}</StatusPill>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function ViewPoctResultPage({ embedded = false, mode, onModeChange, showModeActions = true }: PoctWorkspaceProps = {}) {
  const [localMode, setLocalMode] = React.useState<PoctWorkspaceMode>("results");
  const activeMode = mode ?? localMode;
  const changeMode = React.useCallback(
    (nextMode: PoctWorkspaceMode) => {
      if (onModeChange) onModeChange(nextMode);
      else setLocalMode(nextMode);
    },
    [onModeChange],
  );
  const [results, setResults] = React.useState<PoctResult[]>(() => readPoctResults());
  const [syncedTestIds, setSyncedTestIds] = React.useState<string[]>(() => readSelectedPoctTests());
  const [patient, setPatient] = React.useState("All");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [test, setTest] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const [selectedResult, setSelectedResult] = React.useState<PoctResult | null>(null);
  const pageSize = 5;

  React.useEffect(() => {
    const syncFromStorage = () => {
      setResults(readPoctResults());
      setSyncedTestIds(readSelectedPoctTests());
    };
    const syncSelectedTests = () => setSyncedTestIds(readSelectedPoctTests());
    const onFocus = () => syncFromStorage();
    window.addEventListener("focus", onFocus);
    window.addEventListener("plasmit-poct-selected-tests-change", syncSelectedTests);
    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("plasmit-poct-selected-tests-change", syncSelectedTests);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  const syncedTestNames = React.useMemo(
    () => syncedTestIds.map((id) => poctTests.find((item) => item.id === id)?.name).filter(Boolean) as string[],
    [syncedTestIds],
  );
  const testOptions = React.useMemo(() => (syncedTestNames.length ? syncedTestNames : poctTests.map((item) => item.name)), [syncedTestNames]);
  const effectiveTest = test !== "All" && testOptions.includes(test) ? test : "All";

  const filtered = results.filter((row) => {
    const inPatient = patient === "All" || row.patientId === patient;
    const inDate = (!fromDate || row.date >= fromDate) && (!toDate || row.date <= toDate);
    const inSyncedTests = !syncedTestNames.length || syncedTestNames.includes(row.testName);
    const inTest = effectiveTest === "All" || row.testName === effectiveTest;
    const inStatus = status === "All" || row.status === status;
    return inPatient && inDate && inSyncedTests && inTest && inStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function searchResults() {
    setResults(readPoctResults());
    setPage(1);
    toast.success("POCT results filtered.");
  }

  function resetFilters() {
    setPatient("All");
    setFromDate("");
    setToDate("");
    setTest("All");
    setStatus("All");
    setResults(readPoctResults());
    setPage(1);
    toast.info("POCT filters reset.");
  }

  if (activeMode === "add") {
    return <AddPoctPage embedded={embedded} mode="add" onModeChange={changeMode} showModeActions={showModeActions} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-[1.3fr_0.9fr_0.9fr_1fr_0.9fr_auto_auto_auto]">
          <label className={fieldClass}>
            <span className={labelClass}>Patient <span className="text-danger">*</span></span>
            <select className={selectClass} value={patient} onChange={(event) => setPatient(event.target.value)}>
              <option value="All">All patients</option>
              {poctPatients.map((item) => <option key={item.id} value={item.id}>{item.id} - {item.name}</option>)}
            </select>
          </label>
          <label className={fieldClass}>
            <span className={labelClass}>From Date</span>
            <DateTextInput value={displayDate(fromDate)} onChange={(value) => setFromDate(displayDateToIso(value))} />
          </label>
          <label className={fieldClass}>
            <span className={labelClass}>To Date</span>
            <DateTextInput value={displayDate(toDate)} onChange={(value) => setToDate(displayDateToIso(value))} />
          </label>
          <label className={fieldClass}>
            <span className={labelClass}>Test</span>
            <select className={selectClass} value={effectiveTest} onChange={(event) => setTest(event.target.value)}>
              <option>All</option>
              {testOptions.map((item) => <option key={item}>{item}</option>)}
            </select>
            <span className="text-[11px] text-muted-foreground">
              {syncedTestNames.length ? "Synced with Add POCT selection" : "No tests selected in Add POCT"}
            </span>
          </label>
          <label className={fieldClass}>
            <span className={labelClass}>Status</span>
            <select className={selectClass} value={status} onChange={(event) => setStatus(event.target.value)}>
              <option>All</option>
              <option>Completed</option>
              <option>Verified</option>
              <option>Pending</option>
            </select>
          </label>
          <div className="flex items-end"><Button className="w-full" type="button" onClick={searchResults}>Search</Button></div>
          <div className="flex items-end"><Button className="w-full" type="button" variant="outline" onClick={resetFilters}>Reset</Button></div>
          {showModeActions ? (
            <div className="flex items-end justify-end xl:min-w-[220px]">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <ActionButtons mode="results" onModeChange={changeMode} />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ResultsMatrix results={filtered} />

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                {["#", "Date", "Time", "Test Name", "Result", "Unit", "Performed By", "Verified By", "Status", "Notes", "Action"].map((header) => (
                  <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]" key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr className="border-b border-border last:border-0 hover:bg-surface-muted/70" key={row.id}>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{displayDate(row.date)}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.time}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.testName}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.result}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.unit}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.performedBy}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.verifiedBy}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]"><StatusPill tone={statusTone(row.status)}>{row.status}</StatusPill></td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{row.notes}</td>
                  <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                    <Button aria-label="View POCT result" size="icon" type="button" variant="outline" onClick={() => setSelectedResult(row)}>
                      <Eye className="h-4 w-4 text-primary" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] text-xs text-muted-foreground">
          <span>
            Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>{"<"}</Button>
            {Array.from({ length: Math.min(5, pageCount) }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Button key={pageNumber} size="sm" variant={pageNumber === currentPage ? "default" : "outline"} onClick={() => setPage(pageNumber)}>
                  {pageNumber}
                </Button>
              );
            })}
            <Button size="sm" variant="outline" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>{">"}</Button>
          </div>
        </div>
      </div>
      <Drawer
        open={Boolean(selectedResult)}
        onOpenChange={(open) => !open && setSelectedResult(null)}
        title="POCT Result Detail"
        description={selectedResult ? `${selectedResult.testName} / ${selectedResult.date} ${selectedResult.time}` : undefined}
        className="!inset-auto !bottom-auto !left-1/2 !right-auto !top-1/2 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg md:!inset-auto md:!left-1/2 md:!right-auto md:!top-1/2 md:h-auto md:max-h-[90dvh] md:w-[560px] md:rounded-lg"
      >
        {selectedResult ? (
          <Card>
            <CardContent className="space-y-1 p-4">
              <DetailRow label="Patient" value={`${selectedResult.patientId} - ${selectedResult.patientName}`} />
              <DetailRow label="Date" value={displayDate(selectedResult.date)} />
              <DetailRow label="Time" value={selectedResult.time} />
              <DetailRow label="Test Name" value={selectedResult.testName} />
              <DetailRow label="Result" value={selectedResult.result} />
              <DetailRow label="Unit" value={selectedResult.unit} />
              <DetailRow label="Performed By" value={selectedResult.performedBy} />
              <DetailRow label="Verified By" value={selectedResult.verifiedBy} />
              <DetailRow label="Status" value={<StatusPill tone={statusTone(selectedResult.status)}>{selectedResult.status}</StatusPill>} />
              <DetailRow label="Notes" value={selectedResult.notes || "No notes"} />
            </CardContent>
          </Card>
        ) : null}
      </Drawer>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-border/60 py-2 text-sm last:border-0 sm:grid-cols-[140px_1fr]">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}
