"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Edit3, Filter, MoreVertical, Plus, Scissors, Search, X } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { surgeryRequests, otBookings, otRooms, otTimes, type OtBooking, type SlotStatus, type SurgeryFilter, type SurgeryRequest, type SurgeryRequestStatus } from "@/features/surgery/surgery-data";
import { DetailRow, SurgeryShell, SurgeryStatus } from "@/features/surgery/surgery-shared";

type RequestDraft = SurgeryRequest;

const filterOptions: Array<{ label: string; value: SurgeryFilter["criteria"] }> = [
  { label: "Patient name", value: "patientName" },
  { label: "MRN", value: "mrn" },
  { label: "Requested by", value: "requestedBy" },
  { label: "Chief surgeon", value: "chiefSurgeon" },
  { label: "Anesthetist", value: "anesthetist" },
  { label: "Surgery name", value: "surgeryName" },
  { label: "Surgery date", value: "surgeryDate" },
  { label: "Surgery status", value: "status" },
];

const slotStatuses: SlotStatus[] = ["Scheduled", "Wheeled in", "Wheeled out", "Completed", "Stopped", "Differed"];
const defaultRequestStatusOptions: Array<{ label: string; value: SurgeryRequestStatus }> = [
  { label: "Requested", value: "Requested" },
  { label: "Accepted", value: "Accepted" },
  { label: "Scheduled", value: "Scheduled" },
  { label: "In OT", value: "In OT" },
  { label: "Completed", value: "Completed" },
  { label: "Deferred", value: "Deferred" },
  { label: "Stopped", value: "Stopped" },
];
const waitingRequestStatusOptions: Array<{ label: string; value: SurgeryRequestStatus }> = [
  { label: "Requested", value: "Requested" },
  { label: "Accepted", value: "Accepted" },
  { label: "Schedule", value: "Scheduled" },
];
const maxWaitingListFilters = 8;
const surgeryStorageEvent = "plasmit-surgery-storage-change";
const surgeryStorageCache = new Map<string, { raw: string | null; value: unknown }>();

function normalizeFilterValue(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function searchMatches(value: string, query: string) {
  const normalizedQuery = normalizeFilterValue(query);
  if (!normalizedQuery) return true;
  const searchableValue = normalizeFilterValue(value);
  const queryParts = query.trim().split(/\s+/).map(normalizeFilterValue).filter(Boolean);
  return searchableValue.includes(normalizedQuery) || queryParts.every((part) => searchableValue.includes(part));
}

function matchingSearchFields(request: SurgeryRequest, query: string) {
  if (!query.trim()) return [];
  const fields = [
    { label: "Patient", value: request.patientName },
    { label: "MRN", value: request.mrn },
    { label: "Surgery", value: request.surgeryName },
    { label: "Surgeon", value: request.chiefSurgeon },
    { label: "Anesthetist", value: request.anesthetist },
  ];
  return fields.filter((field) => searchMatches(field.value, query));
}

function todayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readPersistentSurgeryValue<T>(key: string, initialValue: T) {
  if (typeof window === "undefined") return initialValue;
  const stored = window.localStorage.getItem(key);
  const cached = surgeryStorageCache.get(key);
  if (cached && cached.raw === stored) return cached.value as T;
  if (!stored) return initialValue;
  try {
    const parsed = JSON.parse(stored) as T;
    surgeryStorageCache.set(key, { raw: stored, value: parsed });
    return parsed;
  } catch {
    surgeryStorageCache.set(key, { raw: stored, value: initialValue });
    return initialValue;
  }
}

function subscribeSurgeryStorage(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(surgeryStorageEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(surgeryStorageEvent, callback);
  };
}

function usePersistentSurgeryState<T>(key: string, initialValue: T) {
  const value = React.useSyncExternalStore(
    subscribeSurgeryStorage,
    () => readPersistentSurgeryValue(key, initialValue),
    () => initialValue,
  );

  const updateValue = React.useCallback((nextValue: React.SetStateAction<T>) => {
    const currentValue = readPersistentSurgeryValue(key, initialValue);
    const resolvedValue = typeof nextValue === "function" ? (nextValue as (current: T) => T)(currentValue) : nextValue;
    const raw = JSON.stringify(resolvedValue);
    surgeryStorageCache.set(key, { raw, value: resolvedValue });
    window.localStorage.setItem(key, raw);
    window.dispatchEvent(new Event(surgeryStorageEvent));
  }, [initialValue, key]);

  return [value, updateValue] as const;
}

function uniqueBookingsByRequest(bookings: OtBooking[]) {
  const seenRequestIds = new Set<string>();
  return bookings.filter((booking) => {
    if (seenRequestIds.has(booking.requestId)) return false;
    seenRequestIds.add(booking.requestId);
    return true;
  });
}

function ensureUniqueBookingIds(bookings: OtBooking[]) {
  const seenBookingIds = new Set<string>();
  return bookings.map((booking, index) => {
    if (!seenBookingIds.has(booking.id)) {
      seenBookingIds.add(booking.id);
      return booking;
    }
    const nextBooking = { ...booking, id: `${booking.id}-${booking.requestId}-${index}` };
    seenBookingIds.add(nextBooking.id);
    return nextBooking;
  });
}

function createBookingId(requestId: string, otId: string, time: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `bk-${crypto.randomUUID()}`;
  }
  return `bk-${requestId}-${otId}-${time.replace(/[^a-z0-9]/gi, "")}-${Date.now()}`;
}

function useSurgeryState() {
  const [requests, setRequests] = usePersistentSurgeryState<SurgeryRequest[]>("surgery.requests.v6", surgeryRequests);
  const [storedBookings, setStoredBookings] = usePersistentSurgeryState<OtBooking[]>("surgery.bookings.v6", otBookings);
  const [rooms, setRooms] = usePersistentSurgeryState<typeof otRooms>("surgery.rooms.v2", otRooms);
  const [times, setTimes] = usePersistentSurgeryState<string[]>("surgery.times.v2", otTimes);
  const bookings = React.useMemo(() => ensureUniqueBookingIds(uniqueBookingsByRequest(storedBookings)), [storedBookings]);
  const setBookings = React.useCallback((nextValue: React.SetStateAction<OtBooking[]>) => {
    setStoredBookings((currentBookings) => {
      const currentUniqueBookings = ensureUniqueBookingIds(uniqueBookingsByRequest(currentBookings));
      const resolvedBookings = typeof nextValue === "function" ? (nextValue as (current: OtBooking[]) => OtBooking[])(currentUniqueBookings) : nextValue;
      return ensureUniqueBookingIds(uniqueBookingsByRequest(resolvedBookings));
    });
  }, [setStoredBookings]);
  return { requests, setRequests, bookings, setBookings, rooms, setRooms, times, setTimes };
}

function CenterModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className={`fixed left-1/2 top-1/2 z-50 max-h-[88dvh] w-[min(calc(100vw-2rem),720px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none ${className ?? ""}`}>
          <div className="flex items-start justify-between gap-4 border-b border-border bg-surface px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="max-h-[calc(88dvh-62px)] overflow-auto p-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SurgeryRequestModal({
  draft,
  open,
  onOpenChange,
  onChange,
  onSave,
  onDelete,
  statusOptions = defaultRequestStatusOptions,
}: {
  draft: RequestDraft | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (draft: RequestDraft) => void;
  onSave: () => void;
  onDelete?: (draft: RequestDraft) => void;
  statusOptions?: Array<{ label: string; value: SurgeryRequestStatus }>;
}) {
  return (
    <CenterModal open={open} onOpenChange={onOpenChange} title="Edit surgery request" description={draft?.mrn} className="aspect-[5/4] w-[min(calc(100vw-2rem),860px)]">
      {draft ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <LabeledInput label="Patient name">
              <Input value={draft.patientName} onChange={(event) => onChange({ ...draft, patientName: event.target.value })} placeholder="Patient name" />
            </LabeledInput>
            <LabeledInput label="Age/Gender">
              <Input value={draft.ageGender} onChange={(event) => onChange({ ...draft, ageGender: event.target.value })} placeholder="Age/Gender" />
            </LabeledInput>
            <LabeledInput label="MRN">
              <Input value={draft.mrn} onChange={(event) => onChange({ ...draft, mrn: event.target.value })} placeholder="MRN" />
            </LabeledInput>
            <LabeledInput label="Requested by">
              <Input value={draft.requestedBy} onChange={(event) => onChange({ ...draft, requestedBy: event.target.value })} placeholder="Requested by" />
            </LabeledInput>
            <LabeledInput label="Chief surgeon">
              <Input value={draft.chiefSurgeon} onChange={(event) => onChange({ ...draft, chiefSurgeon: event.target.value })} placeholder="Chief surgeon" />
            </LabeledInput>
            <LabeledInput label="Anesthetist">
              <Input value={draft.anesthetist} onChange={(event) => onChange({ ...draft, anesthetist: event.target.value })} placeholder="Anesthetist" />
            </LabeledInput>
            <LabeledInput label="Surgery name">
              <Input value={draft.surgeryName} onChange={(event) => onChange({ ...draft, surgeryName: event.target.value })} placeholder="Surgery name" />
            </LabeledInput>
            <LabeledInput label="Surgery date">
              <Input value={draft.surgeryDate} onChange={(event) => onChange({ ...draft, surgeryDate: event.target.value })} placeholder="Surgery date" />
            </LabeledInput>
            <LabeledInput label="Duration minutes">
              <Input value={String(draft.durationMinutes)} type="number" onChange={(event) => onChange({ ...draft, durationMinutes: Number(event.target.value) })} placeholder="Duration minutes" />
            </LabeledInput>
            <LabeledInput label="Status">
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={draft.status} onChange={(event) => onChange({ ...draft, status: event.target.value as SurgeryRequestStatus })}>
                {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
              </select>
            </LabeledInput>
          </div>
          <LabeledInput label="Instructions">
            <textarea className="min-h-28 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={draft.instructions} onChange={(event) => onChange({ ...draft, instructions: event.target.value })} placeholder="Instructions" />
          </LabeledInput>
          <Button className="w-full" onClick={onSave}>Save request</Button>
          {onDelete ? <Button className="w-full" variant="danger" onClick={() => onDelete(draft)}>Delete request</Button> : null}
        </div>
      ) : null}
    </CenterModal>
  );
}

function LabeledInput({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm font-medium text-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

function RequestSummary({ request }: { request: SurgeryRequest }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <DetailRow label="Patient" value={`${request.patientName} (${request.ageGender})`} />
      <DetailRow label="MRN" value={request.mrn} />
      <DetailRow label="Surgery" value={request.surgeryName} />
      <DetailRow label="Duration" value={`${request.durationMinutes} min`} />
      <DetailRow label="Chief surgeon" value={request.chiefSurgeon} />
      <DetailRow label="Anesthetist" value={request.anesthetist} />
    </div>
  );
}

export function SurgeryDashboardPage() {
  const { requests, bookings } = useSurgeryState();
  const [scheduleMetricDate, setScheduleMetricDate] = React.useState(todayDateKey);
  const scheduledRequestIds = React.useMemo(() => new Set(bookings.map((booking) => booking.requestId)), [bookings]);
  const waitingListRequests = requests.filter((request) => request.status !== "Scheduled" && !scheduledRequestIds.has(request.id));
  const pending = waitingListRequests.filter((item) => item.status === "Requested").length;
  const accepted = waitingListRequests.filter((item) => item.status === "Accepted").length;
  const scheduledPatients = requests.filter((request) => request.status === "Scheduled" || scheduledRequestIds.has(request.id)).length;
  const scheduled = bookings.filter((booking) => booking.date === scheduleMetricDate).length;
  return (
    <SurgeryShell title="Surgery Schedule" description="OT command center for surgery waiting list, acceptance, scheduling, slot status, and theatre utilization." hideHeaderCopy>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={<ClipboardList className="h-5 w-5" />} label="Waiting requests" value={pending} />
        <Metric icon={<Scissors className="h-5 w-5" />} label="Accepted" value={accepted} />
        <Metric icon={<CalendarDays className="h-5 w-5" />} label="Scheduled" value={scheduledPatients} />
        <Metric
          icon={<CalendarDays className="h-5 w-5" />}
          label={scheduleMetricDate === todayDateKey() ? "Scheduled today" : "Scheduled patients"}
          value={scheduled}
        >
          <label className="mt-3 flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <input
              className="min-w-0 flex-1 bg-transparent text-foreground outline-none"
              type="date"
              value={scheduleMetricDate}
              onChange={(event) => setScheduleMetricDate(event.target.value)}
            />
          </label>
        </Metric>
      </div>
    </SurgeryShell>
  );
}

function Metric({ icon, label, value, children }: { icon: React.ReactNode; label: string; value: number; children?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export function SurgeryWaitingListPage() {
  const { requests, setRequests, bookings } = useSurgeryState();
  const [filters, setFilters] = React.useState<SurgeryFilter[]>([]);
  const [draft, setDraft] = React.useState<RequestDraft | null>(null);
  const [scheduleRequest, setScheduleRequest] = React.useState<SurgeryRequest | null>(null);
  const [page, setPage] = React.useState(1);
  const filterIdRef = React.useRef(1);
  const pageSize = 10;

  const scheduledRequestIds = React.useMemo(() => new Set(bookings.map((booking) => booking.requestId)), [bookings]);
  const filtered = requests.filter((request) => (
    request.status !== "Scheduled" &&
    !scheduledRequestIds.has(request.id) &&
    filters.every((filterItem) => normalizeFilterValue(String(request[filterItem.criteria])).includes(normalizeFilterValue(filterItem.value)))
  ));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const paginatedRequests = filtered.slice(pageStart, pageStart + pageSize);
  const firstVisibleRequest = filtered.length === 0 ? 0 : pageStart + 1;
  const lastVisibleRequest = Math.min(pageStart + pageSize, filtered.length);

  function addFilter() {
    if (filters.length >= maxWaitingListFilters) return;
    const id = `flt-local-${filterIdRef.current}`;
    filterIdRef.current += 1;
    setPage(1);
    setFilters((current) => [...current, { id, criteria: "patientName", value: "" }]);
  }

  function acceptRequest(id: string) {
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status: "Accepted" } : request));
  }

  function saveDraft() {
    if (!draft) return;
    setRequests((current) => current.map((request) => request.id === draft.id ? draft : request));
    setDraft(null);
  }

  function markRequestReadyForSchedule(request: SurgeryRequest) {
    setScheduleRequest(request);
  }

  return (
    <SurgeryShell title="Surgery Waiting List" description="Requests placed by doctors, ready for filtering, editing, acceptance, and scheduling." hideHeaderCopy>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Filter by</CardTitle>
            <CardDescription>Add multiple criteria filters for patient, MRN, surgeon, anesthetist, procedure, date, or status.</CardDescription>
          </div>
          <Button size="sm" onClick={addFilter} disabled={filters.length >= maxWaitingListFilters}><Plus className="h-4 w-4" />Add filter</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {filters.length === 0 ? <AlertBanner icon={Filter} title="No filters active">Add a filter to narrow the waiting list.</AlertBanner> : null}
          {filters.length >= maxWaitingListFilters ? <AlertBanner icon={Filter} title="Filter limit reached">Maximum 8 filters can be active at once.</AlertBanner> : null}
          {filters.map((filterItem) => (
            <div className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)_auto]" key={filterItem.id}>
              <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={filterItem.criteria} onChange={(event) => { setPage(1); setFilters((current) => current.map((item) => item.id === filterItem.id ? { ...item, criteria: event.target.value as SurgeryFilter["criteria"] } : item)); }}>
                {filterOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <Input value={filterItem.value} onChange={(event) => { setPage(1); setFilters((current) => current.map((item) => item.id === filterItem.id ? { ...item, value: event.target.value } : item)); }} placeholder="Filter value" />
              <Button variant="ghost" onClick={() => { setPage(1); setFilters((current) => current.filter((item) => item.id !== filterItem.id)); }}>Remove</Button>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Waiting list</CardTitle><CardDescription>{filtered.length} surgery requests</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1120px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>{["Patient name", "Patient ID", "Age/Gender", "MRN", "Requested by", "Chief surgeon", "Anesthetist", "Surgery name", "Date", "Instructions", "Status", "Actions"].map((head) => <th className="border-b border-border px-3 py-2 text-left" key={head}>{head}</th>)}</tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/60" key={request.id}>
                    <td className="px-3 py-2 font-medium">{request.patientName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{request.id}</td>
                    <td className="px-3 py-2">{request.ageGender}</td>
                    <td className="px-3 py-2">{request.mrn}</td>
                    <td className="px-3 py-2">{request.requestedBy}</td>
                    <td className="px-3 py-2">{request.chiefSurgeon}</td>
                    <td className="px-3 py-2">{request.anesthetist}</td>
                    <td className="px-3 py-2">{request.surgeryName}</td>
                    <td className="px-3 py-2">{request.surgeryDate}</td>
                    <td className="max-w-[220px] px-3 py-2 text-xs text-muted-foreground">{request.instructions}</td>
                    <td className="px-3 py-2"><SurgeryStatus status={request.status} /></td>
                    <td className="px-3 py-2">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <Button size="icon" variant="ghost" aria-label={`Actions for ${request.patientName}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-40 rounded-md border border-border bg-surface p-1 shadow-soft">
                            <DropdownMenu.Item
                              className="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm outline-none hover:bg-surface-muted focus:bg-surface-muted"
                              onSelect={() => setDraft(request)}
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </DropdownMenu.Item>
                            {request.status === "Requested" ? (
                              <DropdownMenu.Item
                                className="cursor-pointer rounded px-2 py-2 text-sm outline-none hover:bg-surface-muted focus:bg-surface-muted"
                                onSelect={() => acceptRequest(request.id)}
                              >
                                Accept
                              </DropdownMenu.Item>
                            ) : null}
                            <DropdownMenu.Item
                              className="cursor-pointer rounded px-2 py-2 text-sm outline-none hover:bg-surface-muted focus:bg-surface-muted"
                              onSelect={() => markRequestReadyForSchedule(request)}
                            >
                              Schedule
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={12}>
                      No surgery requests match the active filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div>
              Showing {firstVisibleRequest}-{lastVisibleRequest} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setPage((pageValue) => Math.max(1, pageValue - 1))}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="min-w-16 text-center text-xs font-medium text-foreground">
                {currentPage} / {pageCount}
              </span>
              <Button size="sm" variant="outline" disabled={currentPage === pageCount} onClick={() => setPage((pageValue) => Math.min(pageCount, pageValue + 1))}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <SurgeryRequestModal draft={draft} open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)} onChange={setDraft} onSave={saveDraft} statusOptions={waitingRequestStatusOptions} />
      <CenterModal open={Boolean(scheduleRequest)} onOpenChange={(open) => !open && setScheduleRequest(null)} title="Schedule surgery" description={scheduleRequest?.patientName} className="aspect-square">
        {scheduleRequest ? (
          <div className="space-y-4">
            <RequestSummary request={scheduleRequest} />
            <Button className="w-full" asChild><Link href={`/surgery/schedule?requestId=${scheduleRequest.id}`}>Open OT schedule</Link></Button>
          </div>
        ) : null}
      </CenterModal>
    </SurgeryShell>
  );
}

export function SurgeryGlobalSearchPage() {
  const { requests, bookings } = useSurgeryState();
  const [query, setQuery] = React.useState("");
  const scheduledRequestIds = React.useMemo(() => new Set(bookings.map((booking) => booking.requestId)), [bookings]);
  const searchValue = normalizeFilterValue(query);
  const rows = React.useMemo(() => {
    if (!searchValue) return [];
    return requests.filter((request) => {
      const searchableValues = [
        request.patientName,
        request.id,
        request.chiefSurgeon,
        request.requestedBy,
        request.anesthetist,
        request.surgeryName,
      ];
      return searchableValues.some((value) => normalizeFilterValue(value).includes(searchValue));
    });
  }, [requests, searchValue]);

  return (
    <SurgeryShell title="Global Search" description="Search surgery requests by patient name, patient ID, chief surgeon, requested by, anesthetist, or surgery name." hideHeaderCopy>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Search surgery data</CardTitle>
            <CardDescription>{rows.length} matching rows</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Patient name, Patient ID, chief surgeon, requested by, anesthetist, or surgery name" />
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[1120px] border-collapse text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  {["Patient name", "Patient ID", "MRN", "Chief surgeon", "Requested by", "Anesthetist", "Surgery name", "Date", "Priority", "Status"].map((head) => (
                    <th className="border-b border-border px-3 py-2 text-left" key={head}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((request) => (
                  <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/60" key={request.id}>
                    <td className="px-3 py-2 font-medium">{request.patientName}</td>
                    <td className="px-3 py-2 text-muted-foreground">{request.id}</td>
                    <td className="px-3 py-2">{request.mrn}</td>
                    <td className="px-3 py-2">{request.chiefSurgeon}</td>
                    <td className="px-3 py-2">{request.requestedBy}</td>
                    <td className="px-3 py-2">{request.anesthetist}</td>
                    <td className="px-3 py-2">{request.surgeryName}</td>
                    <td className="px-3 py-2">{request.surgeryDate}</td>
                    <td className="px-3 py-2">{request.priority}</td>
                    <td className="px-3 py-2"><SurgeryStatus status={scheduledRequestIds.has(request.id) ? "Scheduled" : request.status} /></td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-sm text-muted-foreground" colSpan={10}>
                      {query.trim() ? "No matching surgery requests found." : "Enter a search term to view matching surgery rows."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </SurgeryShell>
  );
}

function bookingColor(status: SlotStatus) {
  if (status === "Scheduled") return "border-black/70 bg-white text-black";
  if (status === "Wheeled in") return "border-black/70 bg-[#fff2cc] text-black";
  if (status === "Wheeled out") return "border-black/70 bg-[#d9ead3] text-black";
  if (status === "Completed") return "border-black/70 bg-[#6aa84f] text-black";
  if (status === "Stopped") return "border-black/70 bg-[#ff3333] text-black";
  if (status === "Differed") return "border-black/70 bg-[#ed7d31] text-black";
  return "border-black/70 bg-white text-black";
}

export function SurgerySchedulePage() {
  const { requests, setRequests, bookings, setBookings, rooms: scheduleRooms, setRooms: setScheduleRooms, times: scheduleTimes, setTimes: setScheduleTimes } = useSurgeryState();
  const searchParams = useSearchParams();
  const requestIdFromUrl = searchParams.get("requestId");
  const selectedRequestFromUrl = requestIdFromUrl ? requests.find((request) => request.id === requestIdFromUrl) : undefined;
  const defaultRequestId = requests.find((request) => request.status !== "Completed")?.id ?? requests[0].id;
  const initialSelectedRequestId = selectedRequestFromUrl?.id ?? defaultRequestId;
  const [date, setDate] = React.useState("2026-05-23");
  const [selectedRequestId, setSelectedRequestId] = React.useState(initialSelectedRequestId);
  const [requestSearch, setRequestSearch] = React.useState(() => selectedRequestFromUrl ? `${selectedRequestFromUrl.patientName} - ${selectedRequestFromUrl.surgeryName}` : "");
  const [requestSearchOpen, setRequestSearchOpen] = React.useState(false);
  const [selectedRequestVisible, setSelectedRequestVisible] = React.useState(Boolean(selectedRequestFromUrl));
  const [slotDetail, setSlotDetail] = React.useState<OtBooking | null>(null);
  const [scheduleDraft, setScheduleDraft] = React.useState<RequestDraft | null>(null);
  const [deleteRequestDraft, setDeleteRequestDraft] = React.useState<RequestDraft | null>(null);
  const [editingTime, setEditingTime] = React.useState<string | null>(null);
  const [timeDraft, setTimeDraft] = React.useState("");
  const [deleteTime, setDeleteTime] = React.useState<string | null>(null);
  const [timeError, setTimeError] = React.useState("");
  const [addSlotOpen, setAddSlotOpen] = React.useState(false);
  const [newSlotTime, setNewSlotTime] = React.useState("");
  const [deleteSlotOpen, setDeleteSlotOpen] = React.useState(false);
  const [slotToDelete, setSlotToDelete] = React.useState("");
  const [addOtOpen, setAddOtOpen] = React.useState(false);
  const [newOtName, setNewOtName] = React.useState("OT ");
  const [newOtSpecialty, setNewOtSpecialty] = React.useState("");
  const [deleteOtOpen, setDeleteOtOpen] = React.useState(false);
  const [otToDelete, setOtToDelete] = React.useState("");
  const [tableActionError, setTableActionError] = React.useState("");
  const [contextScheduleError, setContextScheduleError] = React.useState("");
  const otIdRef = React.useRef(7);
  const selectedRequest = requests.find((request) => request.id === selectedRequestId) ?? requests[0];
  const dateBookings = bookings.filter((booking) => booking.date === date);
  const selectedBooking = dateBookings.find((booking) => booking.requestId === selectedRequest.id);
  const selectedScheduleStatus = selectedBooking?.status ?? selectedRequest.status;
  const [contextOtId, setContextOtId] = React.useState(selectedBooking?.otId ?? scheduleRooms[0]?.id ?? "");
  const [contextTime, setContextTime] = React.useState(selectedBooking?.time || selectedRequest.surgeryTime || scheduleTimes[0]);
  const searchResults = requestSearch.trim()
    ? requests.flatMap((request) => matchingSearchFields(request, requestSearch).map((field) => ({ request, field })))
    : [];

  function bookingFor(otId: string, time: string) {
    return dateBookings.find((booking) => booking.otId === otId && booking.time === time);
  }

  function requestForBooking(booking: OtBooking) {
    return requests.find((request) => request.id === booking.requestId);
  }

  function scheduleSlot(otId: string, time: string) {
    if (!selectedRequestVisible) return;
    const existing = bookingFor(otId, time);
    if (existing) {
      setSlotDetail(existing);
      return;
    }
    setBookings((current) => {
      const existingForRequest = current.find((booking) => booking.requestId === selectedRequest.id);
      if (existingForRequest) {
        return current.map((booking) => booking.id === existingForRequest.id ? { ...booking, otId, time, date } : booking);
      }
      const next: OtBooking = { id: createBookingId(selectedRequest.id, otId, time), requestId: selectedRequest.id, otId, time, date, status: "Scheduled" };
      return [...current, next];
    });
    setRequests((current) => current.map((request) => request.id === selectedRequest.id ? { ...request, status: "Scheduled", surgeryDate: date, surgeryTime: time } : request));
    setRequestSearch("");
    setContextScheduleError("");
    setContextOtId(otId);
    setContextTime(time);
    setSelectedRequestVisible(false);
  }

  function syncContextDraftForRequest(request: SurgeryRequest) {
    const requestBooking = bookings.find((booking) => booking.requestId === request.id && booking.date === date);
    setContextOtId(requestBooking?.otId ?? scheduleRooms[0]?.id ?? "");
    setContextTime(requestBooking?.time || request.surgeryTime || scheduleTimes[0]);
    setContextScheduleError("");
  }

  function saveSelectedRequestSchedule() {
    if (!contextOtId || !contextTime) return;
    const occupiedBooking = dateBookings.find((booking) => booking.otId === contextOtId && booking.time === contextTime && booking.requestId !== selectedRequest.id);
    if (occupiedBooking) {
      const occupiedRequest = requestForBooking(occupiedBooking);
      setContextScheduleError(`This OT/time is already booked${occupiedRequest ? ` for ${occupiedRequest.patientName}` : ""}.`);
      return;
    }
    setContextScheduleError("");
    setBookings((current) => {
      const existingBooking = current.find((booking) => booking.requestId === selectedRequest.id);
      if (existingBooking) {
        return current.map((booking) => booking.id === existingBooking.id ? { ...booking, otId: contextOtId, time: contextTime, date } : booking);
      }
      const next: OtBooking = { id: createBookingId(selectedRequest.id, contextOtId, contextTime), requestId: selectedRequest.id, otId: contextOtId, time: contextTime, date, status: "Scheduled" };
      return [...current, next];
    });
    setRequests((current) => current.map((request) => request.id === selectedRequest.id ? { ...request, status: "Scheduled", surgeryDate: date, surgeryTime: contextTime } : request));
    setRequestSearch("");
    setSelectedRequestVisible(false);
  }

  function updateBookingStatus(bookingId: string, status: SlotStatus) {
    setBookings((current) => current.map((booking) => booking.id === bookingId ? { ...booking, status } : booking));
    const booking = bookings.find((item) => item.id === bookingId);
    if (booking) {
      const requestStatus: SurgeryRequestStatus = status === "Completed" ? "Completed" : status === "Stopped" ? "Stopped" : status === "Differed" ? "Deferred" : status === "Wheeled in" ? "In OT" : "Scheduled";
      setRequests((current) => current.map((request) => request.id === booking.requestId ? { ...request, status: requestStatus } : request));
    }
  }

  function saveScheduleDraft() {
    if (!scheduleDraft) return;
    setRequests((current) => current.map((request) => request.id === scheduleDraft.id ? scheduleDraft : request));
    setScheduleDraft(null);
  }

  function confirmDeleteRequest() {
    if (!deleteRequestDraft) return;
    const deletedRequestId = deleteRequestDraft.id;
    setRequests((current) => current.filter((request) => request.id !== deletedRequestId));
    setBookings((current) => current.filter((booking) => booking.requestId !== deletedRequestId));
    setSlotDetail((current) => current?.requestId === deletedRequestId ? null : current);
    setScheduleDraft(null);
    setDeleteRequestDraft(null);
    if (selectedRequestId === deletedRequestId) {
      const fallbackRequest = requests.find((request) => request.id !== deletedRequestId);
      if (fallbackRequest) {
        setSelectedRequestId(fallbackRequest.id);
        setRequestSearch(fallbackRequest.patientName);
        syncContextDraftForRequest(fallbackRequest);
      } else {
        setRequestSearch("");
      }
    }
  }

  function openEditTime(time: string) {
    setEditingTime(time);
    setTimeDraft(time);
    setTimeError("");
  }

  function saveTimeEdit() {
    if (!editingTime) return;
    const nextTime = timeDraft.trim();
    if (!nextTime) {
      setTimeError("Time required hai.");
      return;
    }
    const duplicate = scheduleTimes.some((time) => time !== editingTime && normalizeFilterValue(time) === normalizeFilterValue(nextTime));
    if (duplicate) {
      setTimeError("Ye time row already exist karta hai.");
      return;
    }
    setScheduleTimes((current) => current.map((time) => time === editingTime ? nextTime : time));
    setBookings((current) => current.map((booking) => booking.time === editingTime ? { ...booking, time: nextTime } : booking));
    setRequests((current) => current.map((request) => request.surgeryTime === editingTime ? { ...request, surgeryTime: nextTime } : request));
    setEditingTime(null);
    setTimeDraft("");
    setTimeError("");
  }

  function confirmDeleteTime() {
    if (!deleteTime) return;
    setScheduleTimes((current) => current.filter((time) => time !== deleteTime));
    setBookings((current) => current.filter((booking) => booking.time !== deleteTime));
    setSlotDetail((current) => current?.time === deleteTime ? null : current);
    setDeleteTime(null);
  }

  function addSlot() {
    const nextTime = newSlotTime.trim();
    if (!nextTime) {
      setTableActionError("Time required.");
      return;
    }
    if (scheduleTimes.some((time) => normalizeFilterValue(time) === normalizeFilterValue(nextTime))) {
      setTableActionError("This time slot already exists.");
      return;
    }
    setScheduleTimes((current) => [...current, nextTime]);
    setNewSlotTime("");
    setTableActionError("");
    setAddSlotOpen(false);
  }

  function deleteSelectedSlot() {
    if (!slotToDelete) {
      setTableActionError("Select a time slot to delete.");
      return;
    }
    setScheduleTimes((current) => current.filter((time) => time !== slotToDelete));
    setBookings((current) => current.filter((booking) => booking.time !== slotToDelete));
    setSlotDetail((current) => current?.time === slotToDelete ? null : current);
    setSlotToDelete("");
    setTableActionError("");
    setDeleteSlotOpen(false);
  }

  function addOt() {
    const roomName = newOtName.trim();
    const roomSpecialty = newOtSpecialty.trim();
    if (!roomName) {
      setTableActionError("OT name required.");
      return;
    }
    if (scheduleRooms.some((room) => normalizeFilterValue(room.name) === normalizeFilterValue(roomName))) {
      setTableActionError("This OT already exists.");
      return;
    }
    setScheduleRooms((current) => [...current, { id: `ot-local-${otIdRef.current}`, name: roomName, specialty: roomSpecialty || "General" }]);
    otIdRef.current += 1;
    setNewOtName("OT ");
    setNewOtSpecialty("");
    setTableActionError("");
    setAddOtOpen(false);
  }

  function deleteSelectedOt() {
    if (!otToDelete) {
      setTableActionError("Select an OT to delete.");
      return;
    }
    setScheduleRooms((current) => current.filter((room) => room.id !== otToDelete));
    setBookings((current) => current.filter((booking) => booking.otId !== otToDelete));
    setSlotDetail((current) => current?.otId === otToDelete ? null : current);
    setOtToDelete("");
    setTableActionError("");
    setDeleteOtOpen(false);
  }

  return (
    <SurgeryShell title="OT Schedule" description="Schedule all OTs in 15-minute slots and update patient movement status." hideHeaderCopy>
      <Card>
        <CardHeader><CardTitle>Patient details</CardTitle><CardDescription>Shown when user schedules against a patient.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} placeholder="Date" />
            <div className="relative min-w-0">
              <Input
                value={requestSearch}
                onChange={(event) => {
                  const nextSearch = event.target.value;
                  setRequestSearch(nextSearch);
                  setRequestSearchOpen(Boolean(nextSearch.trim()));
                  if (!nextSearch.trim()) {
                    setSelectedRequestVisible(false);
                    setContextScheduleError("");
                  }
                }}
                onFocus={() => setRequestSearchOpen(Boolean(requestSearch.trim()))}
                placeholder="Search patient, MRN, surgery, surgeon, anesthetist"
              />
              {requestSearchOpen && requestSearch.trim() ? (
                <div className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-surface shadow-soft">
                  {searchResults.map(({ request, field }) => (
                    <button
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-muted"
                      key={`${request.id}-${field.label}`}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setSelectedRequestId(request.id);
                        setRequestSearch(field.value);
                        setRequestSearchOpen(false);
                        setSelectedRequestVisible(true);
                        syncContextDraftForRequest(request);
                      }}
                    >
                      <span className="font-medium">{field.value}</span>
                    </button>
                  ))}
                  {searchResults.length === 0 ? <div className="px-3 py-2 text-sm text-muted-foreground">No request found</div> : null}
                </div>
              ) : null}
            </div>
          </div>
          {selectedRequestVisible ? (
            <div className="rounded-lg border border-border bg-surface-muted/50 p-3">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected request</div>
                  <div className="mt-1 font-semibold text-foreground">{selectedRequest.patientName}</div>
                  <div className="text-xs text-muted-foreground">{selectedRequest.mrn} • {selectedRequest.service}</div>
                </div>
                <div className="flex min-w-28 justify-end">
                  <SurgeryStatus status={selectedScheduleStatus} />
                </div>
              </div>
              <RequestSummary request={selectedRequest} />
              <div className="mt-3 rounded-md border border-border bg-surface p-2 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">Scheduling context</div>
                <div className="mt-2 grid gap-2">
                  <label className="space-y-1">
                    <span className="block font-medium text-foreground">OT</span>
                    <select
                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                      value={contextOtId}
                      onChange={(event) => setContextOtId(event.target.value)}
                    >
                      {scheduleRooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                    </select>
                  </label>
	                  <label className="space-y-1">
	                    <span className="block font-medium text-foreground">Time</span>
	                    <select
	                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                      value={contextTime}
                      onChange={(event) => setContextTime(event.target.value)}
                    >
	                      {scheduleTimes.map((time) => <option key={time} value={time}>{time}</option>)}
	                    </select>
	                  </label>
	                  <div className="flex justify-end">
	                    <Button className="min-w-16" size="sm" onClick={saveSelectedRequestSchedule}>OK</Button>
	                  </div>
	                </div>
	                {contextScheduleError ? <div className="mt-2 rounded-md border border-danger/30 bg-danger/10 px-2 py-1 text-danger">{contextScheduleError}</div> : null}
	              </div>
	            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card className="-mx-4 rounded-none border-x-0 md:-mx-6">
        <CardHeader><CardTitle>Schedule table</CardTitle><CardDescription>Click an empty slot to book. Click a booked slot to view full request details.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto border-y border-border">
            <table className="w-full min-w-[1280px] border-collapse text-sm">
                <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-3 py-2 text-left">Time</th>
                    {scheduleRooms.map((room) => <th className="border-b border-border px-3 py-2 text-left" key={room.id}>{room.name}</th>)}
                    <th className="border-b border-border px-3 py-2 text-left">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setTableActionError(""); setNewOtName("OT "); setAddOtOpen(true); }}>Add OT</Button>
                        <Button size="sm" variant="outline" onClick={() => { setTableActionError(""); setDeleteOtOpen(true); }}>Delete OT</Button>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleTimes.map((time) => (
                    <tr className="border-b border-border last:border-b-0" key={time}>
                      <td className="px-3 py-2 font-medium">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button className="rounded px-2 py-1 text-left font-medium hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-ring/20" type="button">
                              {time}
                            </button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Portal>
                            <DropdownMenu.Content align="start" sideOffset={6} className="z-50 min-w-36 rounded-md border border-border bg-surface p-1 shadow-soft">
                              <DropdownMenu.Item
                                className="cursor-pointer rounded px-2 py-2 text-sm outline-none hover:bg-surface-muted focus:bg-surface-muted"
                                onSelect={() => openEditTime(time)}
                              >
                                Edit time
                              </DropdownMenu.Item>
                              <DropdownMenu.Item
                                className="cursor-pointer rounded px-2 py-2 text-sm text-danger outline-none hover:bg-danger/10 focus:bg-danger/10"
                                onSelect={() => setDeleteTime(time)}
                              >
                                Delete
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                      {scheduleRooms.map((room) => {
                        const booking = bookingFor(room.id, time);
                        const request = booking ? requestForBooking(booking) : undefined;
                        return (
                          <td className="min-w-[150px] px-2 py-2 align-top" key={room.id}>
                            {booking && request ? (
                              <div className={`space-y-2 rounded-md border p-2 ${bookingColor(booking.status)}`}>
                                <button
                                  className="block text-left text-xs font-medium"
                                  onClick={() => {
                                    setSelectedRequestId(request.id);
                                    setRequestSearch(request.patientName);
                                    setSelectedRequestVisible(true);
                                    syncContextDraftForRequest(request);
                                    setScheduleDraft(request);
                                  }}
                                >
                                  {request.patientName}<br />
                                  {request.mrn}<br />
                                  {request.ageGender}<br />
                                  {request.surgeryName}<br />
                                  {request.durationMinutes} min<br />
                                  {request.chiefSurgeon}<br />
                                  {request.anesthetist}
                                </button>
                                <select className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs" value={booking.status} onChange={(event) => updateBookingStatus(booking.id, event.target.value as SlotStatus)}>
                                  {slotStatuses.map((status) => <option key={status}>{status}</option>)}
                                </select>
                              </div>
                            ) : (
                              <button
                                className="h-16 w-full rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={!selectedRequestVisible}
                                onClick={() => scheduleSlot(room.id, time)}
                              >
                                {selectedRequestVisible ? "Schedule" : "Select request"}
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-2 py-2" />
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-3" colSpan={scheduleRooms.length + 2}>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setTableActionError(""); setAddSlotOpen(true); }}>Add slot</Button>
                        <Button size="sm" variant="outline" onClick={() => { setTableActionError(""); setDeleteSlotOpen(true); }}>Delete slot</Button>
                      </div>
                    </td>
                  </tr>
                </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Status legend</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">{slotStatuses.map((status) => <SurgeryStatus key={status} status={status} />)}</CardContent>
      </Card>
      <Drawer open={Boolean(slotDetail)} onOpenChange={(open) => !open && setSlotDetail(null)} title="Booked OT slot" description={slotDetail?.time}>
        {slotDetail ? (
          <div className="space-y-4">
            <SurgeryStatus status={slotDetail.status} />
            {requestForBooking(slotDetail) ? <RequestSummary request={requestForBooking(slotDetail)!} /> : null}
          </div>
        ) : null}
      </Drawer>
      <SurgeryRequestModal draft={scheduleDraft} open={Boolean(scheduleDraft)} onOpenChange={(open) => !open && setScheduleDraft(null)} onChange={setScheduleDraft} onSave={saveScheduleDraft} onDelete={setDeleteRequestDraft} />
      <CenterModal open={Boolean(deleteRequestDraft)} onOpenChange={(open) => !open && setDeleteRequestDraft(null)} title="Delete request" description={deleteRequestDraft?.mrn}>
        <div className="space-y-4">
          <AlertBanner icon={ClipboardList} title="Warning">
            Deleting this request will remove the patient request and any OT schedule booking linked to it.
          </AlertBanner>
          <div className="rounded-md border border-border bg-surface-muted p-3 text-sm">
            <div className="font-medium">{deleteRequestDraft?.patientName}</div>
            <div className="text-muted-foreground">{deleteRequestDraft?.surgeryName}</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteRequestDraft(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteRequest}>Delete request</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={Boolean(editingTime)} onOpenChange={(open) => !open && setEditingTime(null)} title="Edit time row" description={editingTime ?? undefined}>
        <div className="space-y-3">
          <Input value={timeDraft} onChange={(event) => setTimeDraft(event.target.value)} placeholder="Example: 09:15" />
          {timeError ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{timeError}</div> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingTime(null)}>Cancel</Button>
            <Button onClick={saveTimeEdit}>Save time</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={Boolean(deleteTime)} onOpenChange={(open) => !open && setDeleteTime(null)} title="Delete time row" description={deleteTime ?? undefined}>
        <div className="space-y-4">
          <AlertBanner icon={CalendarDays} title="Warning">
            Deleting this time row will also remove any OT slots booked at this time.
          </AlertBanner>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteTime(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteTime}>Delete time</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={addSlotOpen} onOpenChange={setAddSlotOpen} title="Add time slot">
        <div className="space-y-3">
          <Input value={newSlotTime} onChange={(event) => setNewSlotTime(event.target.value)} placeholder="Example: 18:30" />
          {tableActionError ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{tableActionError}</div> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddSlotOpen(false)}>Cancel</Button>
            <Button onClick={addSlot}>Add slot</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={deleteSlotOpen} onOpenChange={setDeleteSlotOpen} title="Delete time slot">
        <div className="space-y-4">
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={slotToDelete} onChange={(event) => setSlotToDelete(event.target.value)}>
            <option value="">Select time slot</option>
            {scheduleTimes.map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
          <AlertBanner icon={CalendarDays} title="Warning">
            Deleting this time slot will also remove any OT bookings saved at this time.
          </AlertBanner>
          {tableActionError ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{tableActionError}</div> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteSlotOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={deleteSelectedSlot}>Delete slot</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={addOtOpen} onOpenChange={setAddOtOpen} title="Add OT">
        <div className="space-y-3">
          <Input value={newOtName} onChange={(event) => setNewOtName(event.target.value)} placeholder="Example: OT 7" />
          <Input value={newOtSpecialty} onChange={(event) => setNewOtSpecialty(event.target.value)} placeholder="Specialty" />
          {tableActionError ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{tableActionError}</div> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddOtOpen(false)}>Cancel</Button>
            <Button onClick={addOt}>Add OT</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={deleteOtOpen} onOpenChange={setDeleteOtOpen} title="Delete OT">
        <div className="space-y-4">
          <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={otToDelete} onChange={(event) => setOtToDelete(event.target.value)}>
            <option value="">Select OT</option>
            {scheduleRooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
          </select>
          <AlertBanner icon={Scissors} title="Warning">
            Deleting this OT will also remove all bookings saved under this OT.
          </AlertBanner>
          {tableActionError ? <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{tableActionError}</div> : null}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOtOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={deleteSelectedOt}>Delete OT</Button>
          </div>
        </div>
      </CenterModal>
    </SurgeryShell>
  );
}
