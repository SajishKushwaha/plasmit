"use client";

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
  { label: "Blood Group", value: "A+" },
  // { label: "Time", value: "10:14 AM" },
  // { label: "Last updated", value: "10:14 AM" },
];

function PatientField({ label, value }: PatientSummaryField) {
  const isName = label === "Name";

  return (
    <div className={`min-w-0 rounded-lg border px-3 py-2 ${isName ? "border-primary/20 bg-primary/10" : "border-primary/10 bg-white/70"}`}>
      <div className="sr-only">{label}</div>
      <div className={`truncate leading-5 ${isName ? "text-base font-bold text-primary" : "text-sm font-semibold text-foreground"}`}>{value}</div>
    </div>
  );
}

export function PatientSummaryBanner() {
  return (
    <Card className="border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-white shadow-sm">
      <CardContent className="space-y-3 p-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">Patient Info</div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {patientFields.map((field) => (
            <PatientField key={field.label} {...field} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
