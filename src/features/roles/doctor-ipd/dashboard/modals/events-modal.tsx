"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import { cn } from "@/lib/utils";

export function DashboardEventsPopup({ patient }: { patient: DoctorIpdPatient }) {
  const events = buildPatientEvents(patient);
  const [selectedEventIndex, setSelectedEventIndex] = React.useState(0);
  const [topTab, setTopTab] = React.useState<"active" | "collaboration">("active");
  const [detailTab, setDetailTab] = React.useState<"repeat" | "details">("repeat");
  const [actionStatus, setActionStatus] = React.useState("Ready for event review");
  const selectedEvent = events[selectedEventIndex] ?? events[0];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm">
      <div className="flex shrink-0 items-center border-b border-border bg-white text-sm font-semibold text-muted-foreground">
        <button className="flex h-12 w-12 cursor-pointer items-center justify-center border-r border-border text-xl text-muted-foreground transition hover:bg-slate-100 hover:text-foreground" type="button" aria-label="Previous patient" onClick={() => setActionStatus("Previous patient navigation selected")}>‹</button>
        <button className={cn("h-12 flex-1 cursor-pointer border-b-2 transition hover:bg-slate-50", topTab === "active" ? "border-primary text-primary" : "border-transparent text-muted-foreground")} type="button" onClick={() => setTopTab("active")}>Active Patient</button>
        <button className={cn("h-12 flex-1 cursor-pointer border-b-2 transition hover:bg-slate-50", topTab === "collaboration" ? "border-primary text-primary" : "border-transparent text-muted-foreground")} type="button" onClick={() => setTopTab("collaboration")}>Collaboration</button>
        <button className="flex h-12 w-12 cursor-pointer items-center justify-center border-l border-border text-xl text-foreground transition hover:bg-slate-100" type="button" aria-label="Next patient" onClick={() => setActionStatus("Next patient navigation selected")}>›</button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        <div className="overflow-x-auto rounded-sm border border-primary/20">
          <table className="w-full min-w-[480px] text-center text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground">
                <th className="px-3 py-3 font-semibold">Priority</th>
                <th className="px-3 py-3 font-semibold">Event Name</th>
                <th className="px-3 py-3 font-semibold">Value</th>
                <th className="px-3 py-3 font-semibold">Event Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr className="cursor-pointer border-t border-primary/20 transition" key={event.name} onClick={() => { setSelectedEventIndex(index); setActionStatus(`${event.name} selected`); }}>
                  <td className={cn("px-3 py-3", selectedEventIndex === index && "bg-primary/75")}><PriorityMeter level={event.priority} /></td>
                  <td className={cn("px-3 py-3 font-medium", selectedEventIndex === index && "bg-primary/75 text-primary-foreground")}>{event.name}</td>
                  <td className={cn("px-3 py-3 font-semibold", selectedEventIndex === index && "bg-primary/75 text-primary-foreground")}>{event.value}</td>
                  <td className={cn("whitespace-nowrap px-3 py-3", selectedEventIndex === index && "bg-primary/75 text-primary-foreground")}>{event.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 border-b border-border text-center text-sm font-semibold text-muted-foreground">
          <button className={cn("cursor-pointer border-b-2 px-4 py-3 transition hover:bg-slate-50", detailTab === "repeat" ? "border-primary text-primary" : "border-transparent text-muted-foreground")} type="button" onClick={() => setDetailTab("repeat")}>Repeat Bleed</button>
          <button className={cn("cursor-pointer border-b-2 px-4 py-3 transition hover:bg-slate-50", detailTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground")} type="button" onClick={() => setDetailTab("details")}>Details</button>
        </div>

        <div className="mt-3 space-y-2">
          <div className="min-h-24 rounded-sm bg-[#f3f3f3] p-3 text-sm font-medium text-foreground">
            {topTab === "active" && detailTab === "repeat"
              ? `${selectedEvent.name}: Coffee ground colour amount about 100 ml. Blood in the vomiting.`
              : topTab === "active"
                ? `${selectedEvent.name} details: value ${selectedEvent.value}, priority ${selectedEvent.priority}, recorded at ${selectedEvent.time}.`
                : `Collaboration note: care team notified for ${selectedEvent.name}. Nurse and doctor acknowledgement pending.`}
          </div>
          <div className="min-h-20 rounded-sm bg-[#f3f3f3] p-3 text-sm font-medium text-foreground">
            Comments: Blood pressure going down. Current BP {patient.abps.value}/{patient.abpd.value}, HR {patient.hr.value}.
          </div>
          <div className="rounded-sm border border-primary/20 bg-primary/5 p-2 text-xs font-semibold text-primary">{actionStatus}</div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-4">
          <Button className="min-w-24 bg-primary hover:bg-primary/90" type="button" onClick={() => setActionStatus(`Actions opened for ${selectedEvent.name}`)}>Actions</Button>
          <Button className="min-w-24 bg-primary hover:bg-primary/90" type="button" onClick={() => setActionStatus(`${selectedEvent.name} validated`)}>Validate</Button>
          <Button className="min-w-24 bg-primary hover:bg-primary/90" type="button" onClick={() => setActionStatus(`${selectedEvent.name} saved`)}>Save</Button>
        </div>
      </div>
    </div>
  );
}

function PriorityMeter({ level }: { level: "high" | "medium" | "low" }) {
  return (
    <div className="mx-auto h-4 w-24 rounded-full bg-slate-200 shadow-inner">
      <div className={cn("h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500", level === "high" && "w-20", level === "medium" && "w-14", level === "low" && "w-5")} />
    </div>
  );
}

function buildPatientEvents(patient: DoctorIpdPatient) {
  const highRisk = patientTone(patient) === "red";

  return [
    { name: patient.diagnosis.toLowerCase().includes("bleeding") ? "Bleeding" : "Clinical Alert", value: highRisk ? 1 : 0, time: "18/06/2026 20:03", priority: highRisk ? "high" : "medium" },
    { name: "Care Plan", value: 4, time: "18/06/2026 18:23", priority: "medium" },
    { name: "Microbiology", value: patient.temperature.tone === "red" ? 3 : 2, time: "18/06/2026 13:12", priority: patient.temperature.tone === "red" ? "high" : "low" },
  ] satisfies Array<{ name: string; value: number; time: string; priority: "high" | "medium" | "low" }>;
}
