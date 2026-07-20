"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  RotateCcw,
  Save,
} from "lucide-react";

import { AppShell } from "@/components/shell/app-shell";

type Screen = "schedule" | "generate" | "manage";
type SlotStatus = "free" | "booked" | "blocked" | "break" | "cancelled";

type Slot = {
  id: string;
  time: string;
  end: string;
  title: string;
  subtitle: string;
  status: SlotStatus;
  patient?: string;
};

const seedSlots: Slot[] = [
  { id: "s1", time: "08:00", end: "08:15", title: "Open Slot", subtitle: "General Cardiology Consultation", status: "free" },
  { id: "s2", time: "09:15", end: "09:30", title: "Patient: Elena Rodriguez", subtitle: "Cancelled by patient", status: "cancelled", patient: "Elena Rodriguez" },
  { id: "s3", time: "10:45", end: "11:00", title: "Emergency Slot", subtitle: "Priority: High - Room Reserved", status: "blocked" },
  { id: "s4", time: "12:00", end: "13:00", title: "Lunch Break", subtitle: "Duration: 45 min", status: "break" },
  { id: "s5", time: "13:30", end: "13:45", title: "Open Slot", subtitle: "Tele-Consultation Ready", status: "free" },
  { id: "s6", time: "15:00", end: "15:15", title: "Administrative Work", subtitle: "Documentation & Reports", status: "blocked" },
];

const statusStyle: Record<SlotStatus, string> = {
  free: "border-emerald-200 bg-emerald-50 text-emerald-900",
  booked: "border-sky-200 bg-sky-50 text-sky-900",
  blocked: "border-slate-200 bg-slate-100 text-slate-700",
  break: "border-orange-200 bg-orange-50 text-orange-900",
  cancelled: "border-rose-200 bg-rose-50 text-rose-900",
};

const statusLabel: Record<SlotStatus, string> = {
  free: "Free",
  booked: "Booked",
  blocked: "Blocked",
  break: "Break",
  cancelled: "Cancelled",
};

function buildGeneratedSlots(interval: number) {
  const slots: Slot[] = [];
  let minutes = 8 * 60;
  const end = 17 * 60;
  let index = 1;

  while (minutes + interval <= end) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const next = minutes + interval;
    const nextHour = Math.floor(next / 60);
    const nextMinute = next % 60;
    const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const endTime = `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
    const isLunch = time >= "12:00" && time < "13:00";

    slots.push({
      id: `g-${index}`,
      time,
      end: endTime,
      title: isLunch ? "Lunch Break" : "Open Slot",
      subtitle: isLunch ? "Scheduled break" : "OPD Appointment",
      status: isLunch ? "break" : "free",
    });
    minutes += interval;
    index += 1;
  }

  return slots;
}

function StatCard({ label, value, helper, tone }: { label: string; value: string; helper: string; tone: string }) {
  return (
    <div className="rounded-md border border-[#c4d0df] bg-white p-4">
      <div className={`text-xs font-bold uppercase ${tone}`}>{label}</div>
      <div className="mt-2 text-xl font-semibold text-[#092d57]">{value}</div>
      <div className="mt-2 text-xs text-[#51657c]">{helper}</div>
    </div>
  );
}

export default function DoctorAvailabilityPage() {
  const [screen, setScreen] = useState<Screen>("schedule");
  const [slots, setSlots] = useState<Slot[]>(seedSlots);
  const [selected, setSelected] = useState<string[]>([]);
  const [interval, setInterval] = useState(15);
  const [patientName, setPatientName] = useState("");

  const counts = useMemo(
    () => ({
      free: slots.filter((slot) => slot.status === "free").length,
      booked: slots.filter((slot) => slot.status === "booked").length,
      blocked: slots.filter((slot) => slot.status === "blocked" || slot.status === "break").length,
      cancelled: slots.filter((slot) => slot.status === "cancelled").length,
    }),
    [slots],
  );

  const generatedPreview = useMemo(() => buildGeneratedSlots(interval), [interval]);

  function updateSlot(id: string, status: SlotStatus) {
    setSlots((current) =>
      current.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              status,
              title: status === "booked" ? `Patient: ${patientName.trim() || "Walk-in Patient"}` : status === "free" ? "Open Slot" : slot.title,
              subtitle: status === "booked" ? "Booking accepted" : status === "cancelled" ? "Cancelled by clinic" : slot.subtitle,
            }
          : slot,
      ),
    );
    setPatientName("");
  }

  function bulkUpdate(status: SlotStatus) {
    setSlots((current) => current.map((slot) => (selected.includes(slot.id) ? { ...slot, status } : slot)));
    setSelected([]);
  }

  function publishGeneratedSlots() {
    setSlots(generatedPreview);
    setSelected([]);
    setScreen("manage");
  }

  return (
    <AppShell>
      <div className="space-y-5 pt-4 text-[#092d57]">
          <header className="flex min-h-16 items-center justify-between rounded-md border border-[#c4d0df] bg-[#f8fbff] px-5">
            <div>
              <h1 className="text-xl font-bold">Availability Management</h1>
              <p className="text-xs text-[#51657c]">Manage clinical schedule, generated slots, bookings, and cancellations.</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full bg-[#d9e8ff] px-4 py-1 text-xs font-bold text-[#0a3d78]">Active Session</span>
              <Bell className="h-5 w-5 text-[#0b2447]" />
            </div>
          </header>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {[
                ["schedule", "Today's Schedule"],
                ["generate", "Generate Slots"],
                ["manage", "Manage Slots"],
              ].map(([id, label]) => (
                <button
                  className={`rounded-md border px-4 py-2 text-sm font-semibold ${screen === id ? "border-[#075baa] bg-[#dbeafe] text-[#073d78]" : "border-[#c4d0df] bg-white text-[#51657c]"}`}
                  key={id}
                  onClick={() => setScreen(id as Screen)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            {screen === "schedule" ? (
              <section className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  <StatCard label="Available Slots" value={String(counts.free).padStart(2, "0")} helper="4 added today" tone="text-emerald-700" />
                  <StatCard label="Booked" value={String(counts.booked).padStart(2, "0")} helper="65% capacity" tone="text-[#075baa]" />
                  <StatCard label="Blocked" value={String(counts.blocked).padStart(2, "0")} helper="Breaks & admin" tone="text-slate-700" />
                  <StatCard label="Cancelled" value={String(counts.cancelled).padStart(2, "0")} helper="Today&apos;s total" tone="text-red-700" />
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="rounded-md border border-[#c4d0df] bg-white">
                    <div className="flex items-center justify-between border-b border-[#dbe3ee] px-4 py-3">
                      <div>
                        <h2 className="font-bold">Today&apos;s Schedule</h2>
                        <p className="text-xs text-[#51657c]">Oct 10, 2023</p>
                      </div>
                      <button className="rounded-md bg-[#075baa] px-4 py-2 text-sm font-bold text-white" onClick={() => setScreen("generate")} type="button">
                        <Plus className="mr-2 inline h-4 w-4" />
                        Generate New Slots
                      </button>
                    </div>
                    <div className="divide-y divide-[#e1e8f0]">
                      {slots.map((slot) => (
                        <div className={`grid gap-3 p-4 md:grid-cols-[90px_minmax(0,1fr)_auto] ${statusStyle[slot.status]}`} key={slot.id}>
                          <div className="font-semibold tabular-nums">{slot.time}<br />{slot.end}</div>
                          <div>
                            <div className="font-bold">{slot.title}</div>
                            <div className="text-xs">{slot.subtitle}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {slot.status === "free" ? (
                              <>
                                <input className="h-9 w-40 rounded-md border border-[#c4d0df] bg-white px-2 text-xs" onChange={(event) => setPatientName(event.target.value)} placeholder="Patient name" value={patientName} />
                                <button className="rounded-md bg-[#075baa] px-3 py-2 text-xs font-bold text-white" onClick={() => updateSlot(slot.id, "booked")} type="button">Accept</button>
                                <button className="rounded-md border border-[#c4d0df] bg-white px-3 py-2 text-xs font-bold" onClick={() => updateSlot(slot.id, "blocked")} type="button">Block</button>
                              </>
                            ) : null}
                            {slot.status === "booked" ? <button className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700" onClick={() => updateSlot(slot.id, "cancelled")} type="button">Cancel Booking</button> : null}
                            {slot.status === "cancelled" || slot.status === "blocked" ? <button className="rounded-md border border-[#c4d0df] bg-white px-3 py-2 text-xs font-bold" onClick={() => updateSlot(slot.id, "free")} type="button">Re-open Slot</button> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button className="w-full rounded-md bg-[#075baa] p-4 text-left text-white" onClick={() => setScreen("generate")} type="button">
                      <div className="text-xs uppercase">Next Available</div>
                      <div className="mt-2 text-2xl font-bold">{slots.find((slot) => slot.status === "free")?.time ?? "--:--"}</div>
                      <div className="mt-1 text-xs">Today, Room 4B</div>
                    </button>
                    <div className="rounded-md border border-[#c4d0df] bg-white p-4">
                      <div className="font-bold">Optimization Tip</div>
                      <p className="mt-2 text-xs text-[#51657c]">Based on rush history, add two extra slots between 4 PM and 6 PM.</p>
                      <button className="mt-4 w-full rounded-md bg-[#075baa] px-4 py-2 text-sm font-bold text-white" onClick={() => setScreen("generate")} type="button">Apply Suggestion</button>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {screen === "generate" ? (
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-4">
                  <div className="rounded-md border border-[#c4d0df] bg-white p-5">
                    <h2 className="text-lg font-bold">1. Date Range</h2>
                    <div className="mt-4 flex gap-2">
                      {["Today", "Tomorrow", "Next 7 Days"].map((item) => <button className="rounded-md border border-[#c4d0df] bg-white px-4 py-2 text-sm font-semibold first:bg-[#dbeafe]" key={item} type="button">{item}</button>)}
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <label className="text-xs font-bold uppercase">Start Date<input className="mt-2 h-10 w-full rounded-md border border-[#c4d0df] bg-[#eef4fb] px-3" defaultValue="2023-10-24" type="date" /></label>
                      <label className="text-xs font-bold uppercase">End Date<input className="mt-2 h-10 w-full rounded-md border border-[#c4d0df] bg-[#eef4fb] px-3" defaultValue="2023-11-24" type="date" /></label>
                    </div>
                    <div className="mt-5">
                      <div className="text-xs font-bold uppercase">Repeat Days</div>
                      <div className="mt-2 grid grid-cols-7 gap-2 rounded-md bg-[#e7eff8] p-2">
                        {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => <button className={`h-9 rounded-md border text-sm font-bold ${[0, 2, 4].includes(index) ? "bg-[#075baa] text-white" : "bg-white text-[#51657c]"}`} key={`${day}-${index}`} type="button">{day}</button>)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-md border border-[#c4d0df] bg-white p-5">
                    <h2 className="text-lg font-bold">2. Shift & Duration</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <label className="text-xs font-bold uppercase">Start<input className="mt-2 h-10 w-full rounded-md border border-[#c4d0df] bg-[#eef4fb] px-3" defaultValue="09:00" type="time" /></label>
                      <label className="text-xs font-bold uppercase">End<input className="mt-2 h-10 w-full rounded-md border border-[#c4d0df] bg-[#eef4fb] px-3" defaultValue="14:00" type="time" /></label>
                      <label className="text-xs font-bold uppercase">Slot Interval<select className="mt-2 h-10 w-full rounded-md border border-[#c4d0df] bg-[#eef4fb] px-3" onChange={(event) => setInterval(Number(event.target.value))} value={interval}><option value={10}>10 mins</option><option value={15}>15 mins</option><option value={20}>20 mins</option><option value={30}>30 mins</option></select></label>
                    </div>
                  </div>

                  <div className="rounded-md border border-[#c4d0df] bg-white p-5">
                    <h2 className="text-lg font-bold">3. Facility & Type</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {["OPD", "Telemedicine", "Procedure"].map((item) => <button className="rounded-md border border-[#c4d0df] bg-white p-3 text-left font-bold first:border-[#075baa] first:bg-[#edf5ff]" key={item} type="button">{item}</button>)}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-md border border-[#075baa] bg-[#edf5ff] p-4"><MapPin className="mb-2 h-5 w-5" /><b>Main Campus</b><div className="text-xs text-[#51657c]">Block B, 4th Floor</div></div>
                      <div className="rounded-md border border-[#c4d0df] bg-white p-4"><CalendarDays className="mb-2 h-5 w-5" /><b>Downtown Clinic</b><div className="text-xs text-[#51657c]">Suite 102</div></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border border-[#c4d0df] bg-[#e7eff8] p-5">
                    <div className="flex gap-3"><CalendarDays className="h-5 w-5" /><div><b>Active Days</b><div>M, W, F</div><div className="text-xs text-[#51657c]">Oct 24 - Nov 24</div></div></div>
                    <div className="mt-5 flex gap-3"><Clock3 className="h-5 w-5" /><div><b>Daily Shift</b><div>09:00 - 14:00</div><div className="text-xs text-[#51657c]">{interval} min slots</div></div></div>
                    <div className="mt-6 border-t border-[#c4d0df] pt-5">
                      <div className="flex items-center justify-between"><span className="font-bold">Total New Slots</span><span className="text-4xl font-bold text-[#075baa]">{generatedPreview.length}</span></div>
                      <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#075baa] px-4 py-3 font-bold text-white" onClick={publishGeneratedSlots} type="button">Generate Slots <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            {screen === "manage" ? (
              <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-md border border-[#c4d0df] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2 rounded-md border border-[#c4d0df] bg-[#eaf2fb] p-3">
                    <b>Bulk Actions:</b>
                    <button className="rounded-md bg-green-700 px-3 py-2 text-xs font-bold text-white" onClick={() => bulkUpdate("free")} type="button">Accept All</button>
                    <button className="rounded-md border border-[#c4d0df] bg-white px-3 py-2 text-xs font-bold" onClick={() => bulkUpdate("blocked")} type="button">Block Selected</button>
                    <button className="rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700" onClick={() => bulkUpdate("break")} type="button">Mark as Break</button>
                    <button className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700" onClick={() => bulkUpdate("cancelled")} type="button">Cancel Selected</button>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {slots.map((slot) => (
                      <label className={`min-h-20 rounded-md border p-3 ${statusStyle[slot.status]}`} key={slot.id}>
                        <div className="flex gap-2">
                          <input checked={selected.includes(slot.id)} onChange={() => setSelected((current) => current.includes(slot.id) ? current.filter((id) => id !== slot.id) : [...current, slot.id])} type="checkbox" />
                          <div><div className="text-lg font-bold">{slot.time}</div><div className="text-[10px] font-bold uppercase">{statusLabel[slot.status]}</div><div className="mt-1 text-xs">{slot.subtitle}</div></div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-md border border-[#c4d0df] bg-white p-4">
                    <h2 className="font-bold">Shift Overview</h2>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total Slots</span><b>{slots.length}</b></div>
                      <div className="flex justify-between text-emerald-700"><span>Free</span><b>{counts.free}</b></div>
                      <div className="flex justify-between text-[#075baa]"><span>Booked</span><b>{counts.booked}</b></div>
                      <div className="flex justify-between text-slate-700"><span>Blocked</span><b>{counts.blocked}</b></div>
                    </div>
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#075baa] px-4 py-3 font-bold text-white" type="button"><Save className="h-4 w-4" />Save Final Availability</button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md border border-[#c4d0df] bg-white px-4 py-3 font-bold" onClick={() => setScreen("generate")} type="button"><Plus className="h-4 w-4" />Add More Slots</button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-transparent px-4 py-3 font-bold" onClick={() => setScreen("schedule")} type="button"><RotateCcw className="h-4 w-4" />Back to Schedule</button>
                </div>
              </section>
            ) : null}
          </div>
      </div>
    </AppShell>
  );
}
