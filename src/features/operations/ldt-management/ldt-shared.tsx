"use client";

import * as React from "react";
import { ScanLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type LdtType = "Line" | "Tube" | "Drain";
export type LdtFieldType = "Free text" | "Date" | "Time" | "Number" | "Dropdown" | "Checkbox";
export type LdtSelectionMode = "Single" | "Multi";
export type LdtPropertyValue = string | boolean;
export type LdtPropertyValues = Record<string, LdtPropertyValue>;

export type LdtOption = {
  id: string;
  name: string;
  type: LdtType;
};

export type LdtFieldConfig = {
  dateFormat?: string;
  timeFormat?: string;
  decimalPlaces?: number;
  min?: number;
  max?: number;
  unit?: string;
  options?: string[];
  selectionMode?: LdtSelectionMode;
  checkboxLabel?: string;
  checkboxDefault?: boolean;
};

export type LdtDynamicField = {
  id: string;
  name: string;
  type: LdtFieldType;
  config: LdtFieldConfig;
};

export type ScannableLdtItem = {
  barcode: string;
  ldtId: string;
  itemName: string;
  propertyValues: LdtPropertyValues;
};

export function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}:</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

export function LdtTypeItemPicker({
  type,
  value,
  options,
  onTypeChange,
  onItemChange,
}: {
  type: LdtType | "";
  value: string;
  options: LdtOption[];
  onTypeChange: (type: LdtType | "") => void;
  onItemChange: (id: string) => void;
}) {
  const filteredOptions = type ? options.filter((option) => option.type === type) : [];

  return (
    <div className="grid gap-2 md:grid-cols-[220px_1fr]">
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        value={type}
        onChange={(event) => {
          onTypeChange(event.target.value as LdtType | "");
          onItemChange("");
        }}
        aria-label="Select LDT type"
      >
        <option value="">Line / Drain / Tube</option>
        <option value="Line">Line</option>
        <option value="Drain">Drain</option>
        <option value="Tube">Tube</option>
      </select>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
        value={value}
        onChange={(event) => onItemChange(event.target.value)}
        disabled={!type}
        aria-label="Select LDT item"
      >
        <option value="">{type ? `Select ${type}` : "Select type first"}</option>
        {filteredOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DynamicLdtInput({
  field,
  value,
  onChange,
}: {
  field: LdtDynamicField;
  value?: LdtPropertyValue;
  onChange?: (value: LdtPropertyValue) => void;
}) {
  const textValue = onChange ? (typeof value === "string" ? value : "") : undefined;

  if (field.type === "Date") {
    return <Input type="date" value={textValue} onChange={(event) => onChange?.(event.target.value)} />;
  }
  if (field.type === "Time") {
    return <Input type="time" value={textValue} onChange={(event) => onChange?.(event.target.value)} />;
  }
  if (field.type === "Number") {
    return (
      <div className="flex gap-2">
        <Input
          type="number"
          min={field.config.min}
          max={field.config.max}
          step={field.config.decimalPlaces ? 1 / 10 ** field.config.decimalPlaces : 1}
          value={textValue}
          onChange={(event) => onChange?.(event.target.value)}
        />
        {field.config.unit ? (
          <div className="flex h-9 min-w-12 items-center justify-center rounded-md border border-border bg-surface-muted px-3 text-sm font-medium text-muted-foreground">
            {field.config.unit}
          </div>
        ) : null}
      </div>
    );
  }
  if (field.type === "Dropdown") {
    return (
      <select
        multiple={field.config.selectionMode === "Multi"}
        className="min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        value={textValue}
        onChange={(event) => onChange?.(event.target.value)}
      >
        <option value="">Select</option>
        {field.config.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "Checkbox") {
    const controlled = typeof value === "boolean" || Boolean(onChange);
    return (
      <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={controlled ? Boolean(value ?? field.config.checkboxDefault) : undefined}
          defaultChecked={controlled ? undefined : field.config.checkboxDefault}
          onChange={(event) => onChange?.(event.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        {field.config.checkboxLabel ?? field.name}
      </label>
    );
  }
  return <Input placeholder={`Enter ${field.name.toLowerCase()}`} value={textValue} onChange={(event) => onChange?.(event.target.value)} />;
}

export function LdtFieldShell({
  field,
  value,
  onChange,
}: {
  field: LdtDynamicField;
  value?: LdtPropertyValue;
  onChange?: (value: LdtPropertyValue) => void;
}) {
  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <FieldLabel>{field.name}</FieldLabel>
        <Badge tone="muted">{field.type}</Badge>
      </div>
      <DynamicLdtInput field={field} value={value} onChange={onChange} />
    </label>
  );
}

export function LdtPropertiesForm({
  fields,
  values,
  onValueChange,
}: {
  fields: LdtDynamicField[];
  values: LdtPropertyValues;
  onValueChange: (fieldId: string, value: LdtPropertyValue) => void;
}) {
  return (
    <div className="grid gap-4">
      {fields.map((field) => (
        <LdtFieldShell key={field.id} field={field} value={values[field.id]} onChange={(value) => onValueChange(field.id, value)} />
      ))}
    </div>
  );
}

export function LdtBarcodePropertiesEntry({
  barcode,
  exampleBarcodes,
  onBarcodeChange,
  onSubmit,
}: {
  barcode: string;
  exampleBarcodes?: string[];
  onBarcodeChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Properties Entry</CardTitle>
          <CardDescription>Scan item barcode to auto-fill properties, or open Properties and enter details manually.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="relative flex-1">
            <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={barcode}
              onChange={(event) => onBarcodeChange(event.target.value)}
              placeholder="Scan or enter item barcode"
              aria-label="Scan or enter item barcode"
            />
          </div>
          <Button type="submit" className="sm:w-auto">
            <ScanLine className="h-4 w-4" />
            Scan
          </Button>
        </form>
        {exampleBarcodes?.length ? (
          <div className="mt-2 text-xs text-muted-foreground">Demo barcodes: {exampleBarcodes.join(", ")}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
