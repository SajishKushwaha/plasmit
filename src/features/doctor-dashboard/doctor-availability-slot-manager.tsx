"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDoctorContext, type AvailStatus } from "@/features/auth/doctor-context";

type SlotStatus = "available" | "booked" | "blocked" | "break" | "cancelled";
type SlotMode = "OPD" | "Telemedicine" | "Procedure";
type Screen = "schedule" | "configure" | "manage";

type Slot = {
  id: string;
  date: string;
  start: string;
  end: string;
  status: SlotStatus;
  mode: SlotMode;
  branch: string;
  room: string;
  patient?: string;
  note?: string;
};

const statuses: AvailStatus[] = ["Available", "Busy", "On Break", "Off Duty", "Emergency Call"];
const weekDays = [
  { id: 1, label: "M" },
  { id: 2, label: "T" },
  { id: 3, label: "W" },
  { id: 4, label: "T" },
  { id: 5, label: "F" },
  { id: 6, label: "S" },
  { id: 0, label: "S" },
];
const inputClass =
  "h-10 w-full rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateLabel(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function toMinutes(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");
  return Number(hours) * 60 + Number(minutes);
}

function toTime(value: number) {
  return `${pad(Math.floor(value / 60))}:${pad(value % 60)}`;
}

function buildDates(startDate: string, endDate: string, repeatDays: number[]) {
  const dates: string[] = [];
  let cursor = startDate;
  while (cursor <= endDate) {
    const day = new Date(`${cursor}T00:00:00`).getDay();
    if (repeatDays.includes(day)) dates.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function slotClass(status: SlotStatus) {
  switch (status) {
    case "available":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "booked":
      return "border-sky-200 bg-sky-50 text-sky-900";
    case "blocked":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "break":
      return "border-orange-200 bg-orange-50 text-orange-900";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-900";
  }
}

function statusLabel(status: SlotStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function defaultSlots(): Slot[] {
  const today = todayString();
  return [
    { id: "seed-0800", date: today, start: "08:00", end: "08:15", status: "available", mode: "OPD", branch: "Main Campus", room: "Room 4B" },
    { id: "seed-0915", date: today, start: "09:15", end: "09:30", status: "cancelled", mode: "OPD", branch: "Main Campus", room: "Room 4B", patient: "Elena Rodriguez", note: "Cancelled by patient" },
    { id: "seed-1045", date: today, start: "10:45", end: "11:00", status: "blocked", mode: "OPD", branch: "Main Campus", room: "Room 4B", note: "Emergency slot reserved" },
    { id: "seed-1200", date: today, start: "12:00", end: "13:00", status: "break", mode: "OPD", branch: "Main Campus", room: "Room 4B", note: "Lunch break" },
    { id: "seed-1330", date: today, start: "13:30", end: "13:45", status: "available", mode: "Telemedicine", branch: "Main Campus", room: "Virtual" },
    { id: "seed-1500", date: today, start: "15:00", end: "15:15", status: "blocked", mode: "OPD", branch: "Main Campus", room: "Room 4B", note: "Administrative work" },
  ];
}

export function DoctorAvailabilitySlotManager({
  setActiveTab,
}: {
  setActiveTab: (tab: "dashboard" | "availability") => void;
}) {
  const { availStatus, setAvailStatus } = useDoctorContext();
  const today = todayString();
  const [screen, setScreen] = useState<Screen>("schedule");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 7));
  const [repeatDays, setRepeatDays] = useState<number[]>([1, 3, 5]);
  const [shiftStart, setShiftStart] = useState("09:00");
  const [shiftEnd, setShiftEnd] = useState("14:00");
  const [interval, setInterval] = useState(20);
  const [mode, setMode] = useState<SlotMode>("OPD");
  const [branch, setBranch] = useState("Main Campus");
  const [room, setRoom] = useState("Room 4B");
  const [selectedDate, setSelectedDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>(defaultSlots);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bookingName, setBookingName] = useState("");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const generationDates = useMemo(
    () => buildDates(startDate, endDate, repeatDays),
    [endDate, repeatDays, startDate],
  );
  const slotsPerDay = useMemo(() => {
    const start = toMinutes(shiftStart);
    const end = toMinutes(shiftEnd);
    return end > start && interval > 0 ? Math.floor((end - start) / interval) : 0;
  }, [interval, shiftEnd, shiftStart]);
  const generatedCount = generationDates.length * slotsPerDay;
  const selectedSlots = slots.filter((slot) => selectedIds.includes(slot.id));
  const visibleSlots = useMemo(
    () => slots.filter((slot) => slot.date === selectedDate).sort((a, b) => a.start.localeCompare(b.start)),
    [selectedDate, slots],
  );
  const counts = useMemo(
    () => ({
      available: slots.filter((slot) => slot.status === "available").length,
      booked: slots.filter((slot) => slot.status === "booked").length,
      blocked: slots.filter((slot) => slot.status === "blocked" || slot.status === "break").length,
      cancelled: slots.filter((slot) => slot.status === "cancelled").length,
    }),
    [slots],
  );
  const nextAvailable = visibleSlots.find((slot) => slot.status === "available") ?? slots.find((slot) => slot.status === "available");

  function updateHashToDashboard() {
    window.history.replaceState(null, "", "/doctor-dashboard");
    setActiveTab("dashboard");
  }

  function toggleRepeatDay(day: number) {
    setRepeatDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort(),
    );
  }

  function generateSlots() {
    if (!repeatDays.length) {
      toast.error("Select at least one repeat day");
      return;
    }
    if (toMinutes(shiftEnd) <= toMinutes(shiftStart)) {
      toast.error("Shift end time must be after start time");
      return;
    }
    if (!generatedCount) {
      toast.error("No slots can be generated for this configuration");
      return;
    }

    const nextSlots: Slot[] = [];
    for (const date of generationDates) {
      for (let cursor = toMinutes(shiftStart); cursor + interval <= toMinutes(shiftEnd); cursor += interval) {
        const start = toTime(cursor);
        const end = toTime(cursor + interval);
        const isLunch = start >= "12:00" && start < "13:00";
        nextSlots.push({
          id: `slot-${date}-${start}-${mode}-${branch}`,
          date,
          start,
          end,
          status: isLunch ? "break" : "available",
          mode,
          branch,
          room: isLunch ? "Break" : room,
          note: isLunch ? "Lunch break" : undefined,
        });
      }
    }

    setSlots((current) => {
      const existing = new Set(current.map((slot) => `${slot.date}-${slot.start}-${slot.end}-${slot.branch}-${slot.mode}`));
      const merged = nextSlots.filter((slot) => !existing.has(`${slot.date}-${slot.start}-${slot.end}-${slot.branch}-${slot.mode}`));
      return [...current, ...merged];
    });
    setSelectedDate(generationDates[0] ?? today);
    setScreen("manage");
    toast.success(`${generatedCount} slots generated`);
  }

  function addCustomSlot() {
    if (toMinutes(shiftEnd) <= toMinutes(shiftStart)) {
      toast.error("End time must be after start time");
      return;
    }
    const id = `custom-${Date.now()}`;
    setSlots((current) => [
      {
        id,
        date: selectedDate,
        start: shiftStart,
        end: shiftEnd,
        status: "available",
        mode,
        branch,
        room,
      },
      ...current,
    ]);
    setSelectedIds([id]);
    setScreen("manage");
    toast.success("Custom slot added");
  }

  function setSlotStatus(ids: string[], status: SlotStatus, note?: string) {
    if (!ids.length) {
      toast.info("Select at least one slot first");
      return;
    }
    setSlots((current) =>
      current.map((slot) =>
        ids.includes(slot.id)
          ? {
              ...slot,
              status,
              patient: status === "available" || status === "blocked" || status === "break" ? undefined : slot.patient,
              note,
            }
          : slot,
      ),
    );
    toast.success(`${ids.length} slot(s) updated`);
  }

  function acceptBooking(slotId: string) {
    const patient = bookingName.trim() || "Walk-in Patient";
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId
          ? { ...slot, status: "booked", patient, note: "Booking accepted" }
          : slot,
      ),
    );
    setBookingName("");
    toast.success(`Booking accepted for ${patient}`);
  }

  function cancelBooking(slotId: string) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === slotId
          ? { ...slot, status: "cancelled", note: "Cancelled by clinic" }
          : slot,
      ),
    );
    toast.success("Booking cancelled");
  }

  function removeSelected() {
    if (!selectedIds.length) {
      toast.info("Select slots to remove");
      return;
    }
    setSlots((current) => current.filter((slot) => !selectedIds.includes(slot.id)));
    setSelectedIds([]);
    toast.success("Selected slots removed");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function saveFinalAvailability() {
    setPublishedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    toast.success("Final availability saved for patient booking portal");
  }

  return (
    <div className="min-h-[calc(100dvh-6rem)] bg-[#f3f7fb] text-[#0a2f5f]">
      <div className="grid min-h-[calc(100dvh-6rem)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#c8d5e3] bg-[#e7eff8] p-4 lg:flex lg:flex-col">
          <div className="text-lg font-bold">MedSync Pro</div>
          <button className="mt-16 flex h-11 items-center gap-3 rounded-md bg-[#0b5cad] px-4 text-sm font-semibold text-white" type="button">
            <CalendarCheck className="h-4 w-4" />
            Availability
          </button>
          <div className="mt-auto border-t border-[#c8d5e3] pt-6 text-sm">
            <div className="font-bold text-[#0b2447]">Dr. Smith</div>
            <div className="text-xs text-[#465a72]">Cardiology Specialist</div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="flex min-h-16 items-center justify-between border-b border-[#c8d5e3] bg-[#f8fbff] px-5">
            <div>
              <button className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#51657c]" onClick={updateHashToDashboard} type="button">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to doctor dashboard
              </button>
              <h1 className="text-xl font-bold">Availability Management</h1>
              <p className="text-xs text-[#51657c]">Generate slots, accept bookings, cancel bookings, and publish final availability.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#d9e8ff] px-4 py-1 text-xs font-bold text-[#0a3d78]">Active Session</span>
              <Bell className="h-5 w-5 text-[#0b2447]" />
            </div>
          </header>

          <div className="space-y-5 p-5">
            <div className="flex flex-wrap gap-2">
              {(["schedule", "configure", "manage"] as Screen[]).map((item) => (
                <button
                  className={`rounded-md border px-4 py-2 text-sm font-semibold capitalize ${
                    screen === item ? "border-[#0b5cad] bg-[#dbeafe] text-[#063d7a]" : "border-[#c8d5e3] bg-white text-[#51657c]"
                  }`}
                  key={item}
                  onClick={() => setScreen(item)}
                  type="button"
                >
                  {item === "schedule" ? "Today's Schedule" : item}
                </button>
              ))}
            </div>

            {screen === "schedule" ? (
              <ScheduleScreen
                acceptBooking={acceptBooking}
                bookingName={bookingName}
                cancelBooking={cancelBooking}
                counts={counts}
                nextAvailable={nextAvailable}
                publishedAt={publishedAt}
                selectedDate={selectedDate}
                setBookingName={setBookingName}
                setScreen={setScreen}
                setSelectedDate={setSelectedDate}
                setSlotStatus={setSlotStatus}
                slots={visibleSlots}
              />
            ) : null}

            {screen === "configure" ? (
              <ConfigureScreen
                addCustomSlot={addCustomSlot}
                availStatus={availStatus}
                branch={branch}
                endDate={endDate}
                generatedCount={generatedCount}
                generateSlots={generateSlots}
                interval={interval}
                mode={mode}
                repeatDays={repeatDays}
                room={room}
                setAvailStatus={setAvailStatus}
                setBranch={setBranch}
                setEndDate={setEndDate}
                setInterval={setInterval}
                setMode={setMode}
                setRoom={setRoom}
                setShiftEnd={setShiftEnd}
                setShiftStart={setShiftStart}
                setStartDate={setStartDate}
                shiftEnd={shiftEnd}
                shiftStart={shiftStart}
                startDate={startDate}
                statuses={statuses}
                toggleRepeatDay={toggleRepeatDay}
              />
            ) : null}

            {screen === "manage" ? (
              <ManageScreen
                removeSelected={removeSelected}
                saveFinalAvailability={saveFinalAvailability}
                selectedDate={selectedDate}
                selectedIds={selectedIds}
                selectedSlots={selectedSlots}
                setScreen={setScreen}
                setSelectedDate={setSelectedDate}
                setSelectedIds={setSelectedIds}
                setSlotStatus={setSlotStatus}
                slots={visibleSlots}
                toggleSelected={toggleSelected}
              />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number | string; tone: "green" | "blue" | "slate" | "red" }) {
  const toneClass = {
    green: "text-emerald-700",
    blue: "text-[#0b5cad]",
    slate: "text-slate-700",
    red: "text-red-700",
  }[tone];

  return (
    <div className="rounded-md border border-[#c8d5e3] bg-white p-4">
      <div className={`text-xs font-bold uppercase ${toneClass}`}>{label}</div>
      <div className="mt-2 text-2xl font-bold text-[#0b2447]">{value}</div>
    </div>
  );
}

function ScheduleScreen({
  acceptBooking,
  bookingName,
  cancelBooking,
  counts,
  nextAvailable,
  publishedAt,
  selectedDate,
  setBookingName,
  setScreen,
  setSelectedDate,
  setSlotStatus,
  slots,
}: {
  acceptBooking: (slotId: string) => void;
  bookingName: string;
  cancelBooking: (slotId: string) => void;
  counts: { available: number; booked: number; blocked: number; cancelled: number };
  nextAvailable?: Slot;
  publishedAt: string | null;
  selectedDate: string;
  setBookingName: (value: string) => void;
  setScreen: (screen: Screen) => void;
  setSelectedDate: (date: string) => void;
  setSlotStatus: (ids: string[], status: SlotStatus, note?: string) => void;
  slots: Slot[];
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Available Slots" value={counts.available} tone="green" />
        <MetricCard label="Booked" value={counts.booked} tone="blue" />
        <MetricCard label="Blocked" value={counts.blocked} tone="slate" />
        <MetricCard label="Cancelled" value={counts.cancelled} tone="red" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Today&apos;s Schedule</CardTitle>
                <CardDescription>{dateLabel(selectedDate)}</CardDescription>
              </div>
              <input className={inputClass} type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {slots.length ? slots.map((slot) => (
              <div className={`grid gap-3 rounded-md border p-3 md:grid-cols-[96px_minmax(0,1fr)_auto] ${slotClass(slot.status)}`} key={slot.id}>
                <div className="font-bold tabular-nums">{slot.start}<br />{slot.end}</div>
                <div>
                  <div className="font-bold">
                    {slot.status === "available" ? "Open Slot" : slot.status === "booked" ? `Patient: ${slot.patient}` : slot.note ?? statusLabel(slot.status)}
                  </div>
                  <div className="text-xs">{slot.mode} - {slot.branch} - {slot.room}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {slot.status === "available" ? (
                    <>
                      <input
                        className="h-9 w-40 rounded-md border border-[#c8d5e3] bg-white px-2 text-xs"
                        onChange={(event) => setBookingName(event.target.value)}
                        placeholder="Patient name"
                        value={bookingName}
                      />
                      <Button size="sm" onClick={() => acceptBooking(slot.id)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => setSlotStatus([slot.id], "blocked", "Blocked by clinic")}>Block</Button>
                    </>
                  ) : null}
                  {slot.status === "booked" ? (
                    <Button size="sm" variant="outline" onClick={() => cancelBooking(slot.id)}>Cancel Booking</Button>
                  ) : null}
                  {slot.status === "cancelled" || slot.status === "blocked" ? (
                    <Button size="sm" variant="outline" onClick={() => setSlotStatus([slot.id], "available")}>Re-open Slot</Button>
                  ) : null}
                </div>
              </div>
            )) : (
              <div className="rounded-md border border-dashed border-[#c8d5e3] p-8 text-center text-sm text-[#51657c]">
                No slots for this date. Generate slots to begin.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <button className="w-full rounded-md bg-[#0b5cad] p-4 text-left text-white shadow-sm" onClick={() => setScreen("configure")} type="button">
            <div className="text-xs uppercase">Next Available</div>
            <div className="mt-2 text-2xl font-bold">{nextAvailable ? nextAvailable.start : "--:--"}</div>
            <div className="mt-1 text-xs">{nextAvailable ? `${dateLabel(nextAvailable.date)}, ${nextAvailable.room}` : "No open slot"}</div>
          </button>
          <Card>
            <CardHeader>
              <CardTitle>Publish Status</CardTitle>
              <CardDescription>{publishedAt ? `Saved at ${publishedAt}` : "Draft changes not yet published"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setScreen("manage")}>
                Manage Generated Slots
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ConfigureScreen(props: {
  addCustomSlot: () => void;
  availStatus: AvailStatus;
  branch: string;
  endDate: string;
  generatedCount: number;
  generateSlots: () => void;
  interval: number;
  mode: SlotMode;
  repeatDays: number[];
  room: string;
  setAvailStatus: (status: AvailStatus) => void;
  setBranch: (value: string) => void;
  setEndDate: (value: string) => void;
  setInterval: (value: number) => void;
  setMode: (value: SlotMode) => void;
  setRoom: (value: string) => void;
  setShiftEnd: (value: string) => void;
  setShiftStart: (value: string) => void;
  setStartDate: (value: string) => void;
  shiftEnd: string;
  shiftStart: string;
  startDate: string;
  statuses: AvailStatus[];
  toggleRepeatDay: (day: number) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>1. Date Range</CardTitle>
            <CardDescription>Select active dates and repeat days.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">Start Date<input className={inputClass} type="date" value={props.startDate} onChange={(event) => props.setStartDate(event.target.value)} /></label>
              <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">End Date<input className={inputClass} type="date" value={props.endDate} onChange={(event) => props.setEndDate(event.target.value)} /></label>
            </div>
            <div className="flex gap-2 rounded-md bg-[#e7eff8] p-2">
              {weekDays.map((day) => (
                <button
                  className={`h-9 flex-1 rounded-md text-sm font-bold ${props.repeatDays.includes(day.id) ? "bg-[#0b5cad] text-white" : "bg-white text-[#51657c]"}`}
                  key={`${day.id}-${day.label}`}
                  onClick={() => props.toggleRepeatDay(day.id)}
                  type="button"
                >
                  {day.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Shift & Duration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">Start<input className={inputClass} type="time" value={props.shiftStart} onChange={(event) => props.setShiftStart(event.target.value)} /></label>
            <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">End<input className={inputClass} type="time" value={props.shiftEnd} onChange={(event) => props.setShiftEnd(event.target.value)} /></label>
            <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">Interval<select className={inputClass} value={props.interval} onChange={(event) => props.setInterval(Number(event.target.value))}><option value={10}>10 mins</option><option value={15}>15 mins</option><option value={20}>20 mins</option><option value={30}>30 mins</option></select></label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Facility & Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              {(["OPD", "Telemedicine", "Procedure"] as SlotMode[]).map((item) => (
                <button className={`rounded-md border p-3 text-left font-bold ${props.mode === item ? "border-[#0b5cad] bg-[#edf5ff]" : "border-[#c8d5e3] bg-white"}`} key={item} onClick={() => props.setMode(item)} type="button">{item}</button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">Branch<input className={inputClass} value={props.branch} onChange={(event) => props.setBranch(event.target.value)} /></label>
              <label className="space-y-1 text-xs font-bold uppercase text-[#51657c]">Room<input className={inputClass} value={props.room} onChange={(event) => props.setRoom(event.target.value)} /></label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Status</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {props.statuses.map((status) => (
              <button className={`flex h-10 items-center justify-between rounded-md border px-3 text-sm font-bold ${props.availStatus === status ? "border-[#0b5cad] bg-[#dbeafe]" : "border-[#c8d5e3] bg-white"}`} key={status} onClick={() => props.setAvailStatus(status)} type="button">
                {status}
                {props.availStatus === status ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="font-bold">Total New Slots</span>
              <span className="text-4xl font-bold text-[#0b5cad]">{props.generatedCount}</span>
            </div>
            <Button className="w-full" onClick={props.generateSlots}>Generate Slots<ChevronRight className="h-4 w-4" /></Button>
            <Button className="w-full" variant="outline" onClick={props.addCustomSlot}>Add Custom Slot<Plus className="h-4 w-4" /></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManageScreen({
  removeSelected,
  saveFinalAvailability,
  selectedDate,
  selectedIds,
  selectedSlots,
  setScreen,
  setSelectedDate,
  setSelectedIds,
  setSlotStatus,
  slots,
  toggleSelected,
}: {
  removeSelected: () => void;
  saveFinalAvailability: () => void;
  selectedDate: string;
  selectedIds: string[];
  selectedSlots: Slot[];
  setScreen: (screen: Screen) => void;
  setSelectedDate: (date: string) => void;
  setSelectedIds: (ids: string[]) => void;
  setSlotStatus: (ids: string[], status: SlotStatus, note?: string) => void;
  slots: Slot[];
  toggleSelected: (id: string) => void;
}) {
  const free = slots.filter((slot) => slot.status === "available").length;
  const booked = slots.filter((slot) => slot.status === "booked").length;
  const blocked = slots.filter((slot) => slot.status === "blocked" || slot.status === "break").length;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Manage Generated Slots</CardTitle>
              <CardDescription>Reviewing draft availability for {dateLabel(selectedDate)}</CardDescription>
            </div>
            <input className={inputClass} type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#c8d5e3] bg-[#eaf2fb] p-3">
            <span className="text-sm font-bold">Bulk Actions:</span>
            <Button size="sm" onClick={() => setSlotStatus(selectedIds, "available")}>Accept All</Button>
            <Button size="sm" variant="outline" onClick={() => setSlotStatus(selectedIds, "blocked", "Blocked by admin")}>Block Selected</Button>
            <Button size="sm" variant="outline" onClick={() => setSlotStatus(selectedIds, "break", "Break")}>Mark as Break</Button>
            <Button size="sm" variant="outline" onClick={() => setSlotStatus(selectedIds, "cancelled", "Cancelled by clinic")}>Cancel Selected</Button>
            <Button size="sm" variant="outline" onClick={removeSelected}>Remove Selected</Button>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <input checked={selectedIds.length === slots.length && slots.length > 0} onChange={(event) => setSelectedIds(event.target.checked ? slots.map((slot) => slot.id) : [])} type="checkbox" />
              Select All
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {slots.map((slot) => (
              <label className={`min-h-20 rounded-md border p-3 ${slotClass(slot.status)}`} key={slot.id}>
                <div className="flex items-start gap-2">
                  <input checked={selectedIds.includes(slot.id)} onChange={() => toggleSelected(slot.id)} type="checkbox" />
                  <div>
                    <div className="text-lg font-bold tabular-nums">{slot.start}</div>
                    <div className="text-[10px] font-bold uppercase">{statusLabel(slot.status)}</div>
                    <div className="mt-1 text-xs">{slot.patient ?? slot.note ?? slot.mode}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Shift Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Total Slots</span><b>{slots.length}</b></div>
            <div className="flex justify-between text-emerald-700"><span>Free</span><b>{free}</b></div>
            <div className="flex justify-between text-[#0b5cad]"><span>Booked</span><b>{booked}</b></div>
            <div className="flex justify-between text-slate-700"><span>Blocked</span><b>{blocked}</b></div>
            <div className="flex justify-between"><span>Selected</span><b>{selectedSlots.length}</b></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <Button className="w-full" onClick={saveFinalAvailability}><Save className="h-4 w-4" />Save Final Availability</Button>
            <Button className="w-full" variant="outline" onClick={() => setScreen("configure")}><Plus className="h-4 w-4" />Add More Slots</Button>
            <Button className="w-full" variant="ghost" onClick={() => setScreen("schedule")}><RotateCcw className="h-4 w-4" />Back to Schedule</Button>
          </CardContent>
        </Card>
        <div className="rounded-md border border-[#c8d5e3] bg-[#eaf6ff] p-4 text-center text-sm text-[#0b3d78]">
          Final review before publishing to patient portal.
        </div>
      </div>
    </div>
  );
}
