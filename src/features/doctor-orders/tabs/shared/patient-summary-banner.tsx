"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PatientSummaryField = {
  label: string;
  value: string;
};

const patientFields: PatientSummaryField[] = [
  { label: "Name", value: "Meera Joshi" },
  { label: "I.D. No. (Hospital ID / UHID)", value: "UHID-45821" },
  { label: "I.P. No. (Admission No.)", value: "ADM-90211" },
  { label: "Age", value: "42 years" },
  { label: "Sex", value: "Female" },
  { label: "Ward / Bed No.", value: "Ward 3 / Bed 12" },
  // { label: "Date", value: "08 Jun 2026" },
  // { label: "Time", value: "10:14 AM" },
  // { label: "Last updated", value: "10:14 AM" },
];

function PatientField({ label, value }: PatientSummaryField) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="truncate text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function PatientSummaryBanner() {
  return (
    <Card className="border-primary/10 bg-gradient-to-r from-surface to-white shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Patient Demographics</div>
            {/* <div className="mt-1 text-xs text-muted-foreground">Selected inpatient context remains aligned across drug and pathology orders.</div> */}
          </div>
          {/* <Badge tone="info">IPD</Badge> */}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {patientFields.map((field) => (
            <PatientField key={field.label} {...field} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
