"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PatientSummaryField = {
  label: string;
  value: string;
};

const defaultFields: PatientSummaryField[] = [
  { label: "Name", value: "Meera Joshi" },
  { label: "UHID", value: "UHID-45821" },
  { label: "Age/Sex", value: "42 years / Female" },
  { label: "Ward/Bed", value: "Ward 3 / Bed 12" },
];

export function PatientSummaryBanner({
  title = "",
  fields = defaultFields,
  className,
  children,
}: {
  title?: string;
  fields?: PatientSummaryField[];
  className?: string;
  children?: React.ReactNode;
}) {
  const [primaryField, ...rest] = fields;

  return (
    <Card className={cn("border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-white shadow-sm", className)}>
      <CardContent className="space-y-2 p-3 sm:p-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70 sm:text-xs">{title}</div>
        {primaryField ? <PatientPrimaryField field={primaryField} /> : null}
        {rest.length ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:flex xl:flex-wrap">
            {rest.map((field) => (
              <PatientMetaField key={field.label} field={field} />
            ))}
          </div>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}

function PatientPrimaryField({ field }: { field: PatientSummaryField }) {
  return <div className="break-words text-base font-bold leading-5 text-primary sm:text-lg lg:text-xl">{field.value}</div>;
}

function PatientMetaField({ field }: { field: PatientSummaryField }) {
  return (
    <div className="min-w-0 rounded-md bg-white/60 px-2 py-1.5 ring-1 ring-primary/10">
      <div className="flex min-w-0 flex-col gap-0.5 text-[11px] leading-4 sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
        <span className="shrink-0 font-semibold text-muted-foreground">{field.label}:</span>
        <span className="break-words font-semibold text-foreground">{field.value}</span>
      </div>
    </div>
  );
}
