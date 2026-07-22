"use client";

import * as React from "react";

import { NotesPage } from "@/features/clinical/notes/notes-page";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";

export function ProgressNoteModalContent({ patient }: { patient: DoctorIpdPatient }) {
  return (
    <div className="h-full overflow-y-auto bg-surface-muted/30 px-4 pb-5 pt-2" data-patient-id={patient.id}>
      <React.Suspense fallback={<div className="rounded-md border border-border bg-white p-4 text-sm font-semibold text-muted-foreground">Loading add progress...</div>}>
        <NotesPage />
      </React.Suspense>
    </div>
  );
}
