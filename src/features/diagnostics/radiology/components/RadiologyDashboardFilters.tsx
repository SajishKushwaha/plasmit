"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModalityBadge } from "@/features/diagnostics/radiology/components/ModalityBadge";
import { RadiologyStatusBadge } from "@/features/diagnostics/radiology/components/RadiologyStatusBadge";
import type { Modality, RadiologyStatus } from "@/features/diagnostics/radiology/types";
import {
  radiologyStatusLabels,
  radiologyStatusOrder,
} from "@/features/diagnostics/radiology/utils/status";
import { cn } from "@/lib/utils";

export interface RadiologyDashboardFilterValues {
  search: string;
  modalityId: string;
  status: RadiologyStatus | "ALL";
  dateRange: string;
}

export interface RadiologyDashboardSearchRecord {
  age: number;
  consultant: string;
  department: string;
  gender: string;
  id: string;
  location: string;
  modalityId: string;
  mrn: string;
  orderNo: string;
  patientName: string;
  status: RadiologyStatus;
  testName: string;
}

interface RadiologyDashboardFiltersProps {
  availableDates?: string[];
  modalities: Modality[];
  onChange: (values: RadiologyDashboardFilterValues) => void;
  searchRecords?: RadiologyDashboardSearchRecord[];
}

interface FilterOption {
  label: string;
  meta?: string;
  value: string;
}

const defaultValues: RadiologyDashboardFilterValues = {
  search: "",
  modalityId: "ALL",
  status: "ALL",
  dateRange: "ALL",
};

const dateTabs = [
  { label: "All dates", value: "ALL" },
  { label: "Today", value: "TODAY" },
  { label: "Tomorrow", value: "TOMORROW" },
] as const;

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const selectedDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && getLocalDateKey(date) === value;
}

function formatDateKeyLabel(value: string) {
  return isValidDateKey(value)
    ? selectedDateFormatter.format(new Date(`${value}T12:00:00`))
    : "Select a valid date";
}

function DashboardSelect({
  ariaLabel,
  label,
  onChange,
  options,
  value,
}: {
  ariaLabel: string;
  label: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  value: string;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <Select.Root onValueChange={onChange} value={value}>
      <Select.Trigger
        aria-label={ariaLabel}
        className="flex h-12 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left shadow-sm outline-none transition hover:bg-surface-muted focus:border-ring focus:ring-2 focus:ring-ring/20"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-semibold uppercase text-muted-foreground">
            {label}
          </span>
          <Select.Value>
            <span className="block truncate text-sm font-semibold text-foreground">
              {selected?.label}
            </span>
          </Select.Value>
        </span>
        <Select.Icon>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-[90] max-h-80 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-lg"
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                className="relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-md px-3 py-2.5 pr-9 text-sm text-foreground outline-none transition focus:bg-surface-muted data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary"
                key={option.value}
                value={option.value}
              >
                <span className="min-w-0">
                  <Select.ItemText>
                    <span className="block truncate font-medium">{option.label}</span>
                  </Select.ItemText>
                  {option.meta ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {option.meta}
                    </span>
                  ) : null}
                </span>
                <Select.ItemIndicator className="absolute right-3">
                  <Check className="h-4 w-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function RadiologyDashboardFilters({
  availableDates = [],
  modalities,
  onChange,
  searchRecords = [],
}: RadiologyDashboardFiltersProps) {
  const [values, setValues] = useState<RadiologyDashboardFilterValues>(defaultValues);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const modalityOptions: FilterOption[] = [
    { label: "All modalities", meta: "Every imaging service", value: "ALL" },
    ...modalities.map((modality) => ({
      label: modality.name,
      meta: `${modality.location} | ${modality.room}`,
      value: modality.id,
    })),
  ];

  const statusOptions: FilterOption[] = [
    { label: "All statuses", meta: "Complete workflow", value: "ALL" },
    ...radiologyStatusOrder.map((status) => ({
      label: radiologyStatusLabels[status],
      value: status,
    })),
  ];

  const patientMatches = useMemo(() => {
    const query = values.search.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return searchRecords
      .filter((record) =>
        [
          record.patientName,
          record.mrn,
          record.orderNo,
          record.consultant,
          record.department,
          record.testName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query),
      )
      .slice(0, 5);
  }, [searchRecords, values.search]);

  const customDate = values.dateRange.startsWith("CUSTOM:") ? values.dateRange.slice(7) : "";
  const dateCounts = useMemo(
    () =>
      availableDates.reduce<Record<string, number>>((counts, value) => {
        const key = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
        if (key) {
          counts[key] = (counts[key] ?? 0) + 1;
        }
        return counts;
      }, {}),
    [availableDates],
  );
  const latestAvailableDate = Object.keys(dateCounts).sort().at(-1) ?? "";
  const calendarCells = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(calendarStart);
      date.setDate(calendarStart.getDate() + index);

      return {
        dateKey: getLocalDateKey(date),
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      };
    });
  }, [visibleMonth]);

  const activeFilterCount = [
    values.search.trim().length > 0,
    values.modalityId !== "ALL",
    values.status !== "ALL",
    values.dateRange !== "ALL",
  ].filter(Boolean).length;

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!searchContainerRef.current?.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function updateValues(nextValues: Partial<RadiologyDashboardFilterValues>) {
    const mergedValues = { ...values, ...nextValues };
    setValues(mergedValues);
    onChange(mergedValues);
  }

  function openCustomDateDialog() {
    const initialDate = customDate || latestAvailableDate || getLocalDateKey(new Date());
    setDraftDate(initialDate);
    setVisibleMonth(new Date(`${initialDate}T12:00:00`));
    setCustomDateOpen(true);
  }

  function changeDraftDate(nextDate: string) {
    setDraftDate(nextDate);
    if (isValidDateKey(nextDate)) {
      const selectedDate = new Date(`${nextDate}T12:00:00`);
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }

  function applyCustomDate() {
    if (!isValidDateKey(draftDate)) {
      return;
    }

    updateValues({ dateRange: `CUSTOM:${draftDate}` });
    setCustomDateOpen(false);
  }

  function selectPatient(record: RadiologyDashboardSearchRecord) {
    updateValues({ search: record.patientName });
    setSearchOpen(false);
  }

  function clearSearch() {
    updateValues({ search: "" });
    setSearchOpen(false);
  }

  return (
    <section
      aria-label="Radiology dashboard filters"
      className="overflow-visible rounded-lg border border-border bg-surface shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Dashboard View</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Filter the operational summary, queue, and alerts together.
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-semibold",
            activeFilterCount > 0
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border bg-surface-muted text-muted-foreground",
          )}
        >
          {activeFilterCount > 0 ? `${activeFilterCount} active` : "All records"}
        </span>
      </div>

      <div className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(320px,1fr)_220px_220px]">
          <div className="relative sm:col-span-2 lg:col-span-1" ref={searchContainerRef}>
            <label className="sr-only" htmlFor="radiology-dashboard-search">
              Search radiology dashboard
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              aria-autocomplete="list"
              aria-controls="radiology-patient-suggestions"
              aria-expanded={searchOpen && values.search.trim().length > 0}
              className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-10 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
              id="radiology-dashboard-search"
              onChange={(event) => {
                updateValues({ search: event.target.value });
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(values.search.trim().length > 0)}
              placeholder="Search patient, MRN, order, or doctor"
              role="combobox"
              value={values.search}
            />
            {values.search ? (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-border bg-surface text-foreground shadow-sm outline-none transition hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                onClick={clearSearch}
                type="button"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            ) : null}

            {searchOpen && values.search.trim() ? (
              <div
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
                id="radiology-patient-suggestions"
                role="listbox"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted px-3 py-2">
                  <span className="text-xs font-semibold text-foreground">Patient matches</span>
                  <span className="text-[11px] text-muted-foreground">
                    {patientMatches.length} shown
                  </span>
                </div>

                {patientMatches.length > 0 ? (
                  <div className="max-h-[360px] overflow-y-auto p-1.5">
                    {patientMatches.map((record) => (
                      <button
                        aria-selected={values.search === record.patientName}
                        className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-md px-3 py-3 text-left outline-none transition hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        key={record.id}
                        onClick={() => selectPatient(record)}
                        role="option"
                        type="button"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-primary">
                          <UserRound className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {record.patientName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {record.mrn} | {record.age}Y / {record.gender.charAt(0)}
                            </span>
                          </span>
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {record.department} | {record.location} | {record.consultant}
                          </span>
                          <span className="mt-1 block truncate text-xs font-medium text-foreground">
                            {record.testName} | {record.orderNo}
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-2">
                            <RadiologyStatusBadge compact status={record.status} />
                            <ModalityBadge modalityId={record.modalityId} />
                          </span>
                        </span>
                        <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-foreground">No matching patient</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Try a patient name, MRN, order number, or doctor.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <DashboardSelect
            ariaLabel="Filter dashboard by modality"
            label="Modality"
            onChange={(modalityId) => updateValues({ modalityId })}
            options={modalityOptions}
            value={values.modalityId}
          />
          <DashboardSelect
            ariaLabel="Filter dashboard by status"
            label="Status"
            onChange={(status) => updateValues({ status: status as RadiologyStatus | "ALL" })}
            options={statusOptions}
            value={values.status}
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 md:flex-row md:items-center">
          <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Date range
          </div>
          <div
            aria-label="Filter dashboard by date range"
            className="grid grid-cols-2 gap-1 rounded-lg bg-surface-muted p-1 sm:inline-grid sm:grid-cols-[repeat(3,auto)_auto_auto]"
            role="tablist"
          >
            {dateTabs.map((tab) => {
              const isActive = values.dateRange === tab.value;

              return (
                <button
                  aria-selected={isActive}
                  className={cn(
                    "h-8 rounded-md px-3 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  key={tab.value}
                  onClick={() => updateValues({ dateRange: tab.value })}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              );
            })}
            <button
              aria-selected={values.dateRange.startsWith("CUSTOM:")}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                values.dateRange.startsWith("CUSTOM:")
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() =>
                customDate
                  ? updateValues({ dateRange: `CUSTOM:${customDate}` })
                  : openCustomDateDialog()
              }
              role="tab"
              type="button"
            >
              Custom
            </button>
            <button
              aria-label="Open custom date calendar"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground outline-none transition hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              onClick={openCustomDateDialog}
              title="Select custom date"
              type="button"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          {customDate ? (
            <span className="text-xs font-medium text-muted-foreground">
              Selected: {formatDateKeyLabel(customDate)}
            </span>
          ) : null}
        </div>
      </div>

      <Dialog.Root open={customDateOpen} onOpenChange={setCustomDateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[min(92vw,390px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
              <div>
                <Dialog.Title className="text-base font-semibold text-foreground">
                  Select Custom Date
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                  Choose a date from the calendar or enter it manually.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button aria-label="Close calendar" size="icon" type="button" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="space-y-3 p-3">
              <label className="block rounded-lg border border-border bg-background p-3">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Manual date
                </span>
                <Input
                  className="mt-2 h-10"
                  onChange={(event) => changeDraftDate(event.target.value)}
                  type="date"
                  value={draftDate}
                />
                <span
                  className={cn(
                    "mt-2 block text-xs",
                    isValidDateKey(draftDate) ? "text-muted-foreground" : "text-critical",
                  )}
                >
                  {formatDateKeyLabel(draftDate)}
                </span>
              </label>

              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Button
                    aria-label="Previous month"
                    onClick={() =>
                      setVisibleMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                      )
                    }
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm font-semibold text-foreground">
                    {monthFormatter.format(visibleMonth)}
                  </div>
                  <Button
                    aria-label="Next month"
                    onClick={() =>
                      setVisibleMonth(
                        (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                      )
                    }
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-muted-foreground">
                  {weekdayLabels.map((day) => (
                    <span className="py-1" key={day}>
                      {day}
                    </span>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                  {calendarCells.map((cell) => {
                    const isSelected = draftDate === cell.dateKey;
                    const isToday = getLocalDateKey(new Date()) === cell.dateKey;
                    const count = dateCounts[cell.dateKey] ?? 0;

                    return (
                      <button
                        aria-label={`${formatDateKeyLabel(cell.dateKey)}${count ? `, ${count} patients` : ""}`}
                        className={cn(
                          "relative flex h-9 items-center justify-center rounded-md border text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                          cell.inCurrentMonth
                            ? "border-border bg-surface text-foreground hover:bg-surface-muted"
                            : "border-transparent text-muted-foreground/45",
                          isToday && "border-info/50 text-info",
                          isSelected &&
                            "border-primary bg-primary text-primary-foreground hover:bg-primary",
                        )}
                        key={cell.dateKey}
                        onClick={() => changeDraftDate(cell.dateKey)}
                        type="button"
                      >
                        {cell.day}
                        {count > 0 ? (
                          <span
                            className={cn(
                              "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                              isSelected ? "bg-primary-foreground" : "bg-primary",
                            )}
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Dates with patient records are marked with a dot.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-muted px-3 py-3">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button disabled={!isValidDateKey(draftDate)} onClick={applyCustomDate} type="button">
                Apply Date
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
