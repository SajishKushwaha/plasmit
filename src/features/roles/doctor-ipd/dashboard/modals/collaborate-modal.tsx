"use client";

import { ListTree } from "lucide-react";

import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";

export function DashboardCollaborateTimeline({ patient }: { patient: DoctorIpdPatient }) {
  const timeline = buildCollaborateTimeline(patient);

  return (
    <div className="relative max-h-[70dvh] space-y-6 overflow-y-auto pl-7 pr-2">
      <div className="absolute bottom-3 left-[18px] top-3 w-px bg-border" />
      {timeline.map((item) => (
        <div className="relative" key={item.id}>
          <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#2d8ac8] text-white shadow-sm">
            <ListTree className="h-3.5 w-3.5" />
          </div>
          <div className="mb-2 inline-flex rounded bg-[#2d8ac8] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">{item.timestamp}</div>
          <div className="rounded-md border border-border bg-[#f7f7f7] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
              <div className="font-semibold text-[#3ba3d8]">{item.title}</div>
              <div className="text-xs text-muted-foreground">Created By: {item.createdBy}</div>
            </div>
            <p className="px-3 py-3 text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildCollaborateTimeline(patient: DoctorIpdPatient) {
  const doctor = patientTone(patient) === "red" ? "Dr. Amandeep Singh" : patientTone(patient) === "orange" ? "Dr. Meera Rao" : "Dr. Super Admin";

  return [
    { id: "timeline-1", timestamp: "17/06/2026 06:43 PM", title: "Take medicine after meal everyday", description: `${patient.name}: medicine and clinical instruction shared with nursing team for ${patient.diagnosis}.`, createdBy: doctor },
    { id: "timeline-2", timestamp: "17/06/2026 02:36 PM", title: "Documentation", description: "Clinical notes, bedside status, and communication update added for doctor IPD review.", createdBy: "Nurse Priya Menon" },
    { id: "timeline-3", timestamp: "17/06/2026 12:51 PM", title: "Follow Doctor Instruction", description: "Care team acknowledged the latest instruction and will update the next response in timeline.", createdBy: "Nurse Super Admin" },
    { id: "timeline-4", timestamp: "17/06/2026 09:20 AM", title: "Follow diet as planned for you.", description: "Diet plan and routine monitoring message shared with the ward team.", createdBy: "Dietician Admin" },
  ];
}
