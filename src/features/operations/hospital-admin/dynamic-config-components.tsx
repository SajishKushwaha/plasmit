"use client";

import * as React from "react";
import { CalendarDays, CheckSquare, Clock, Hash, ListChecks, Plus, Trash2, Type } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type AdminFieldType = "Free text" | "Date" | "Time" | "Number" | "Dropdown" | "Checkbox";
export type AdminSelectionMode = "Single" | "Multi";

export type OptionConfigValues = {
  options: string[];
  selectionMode: AdminSelectionMode;
};

export type CheckboxConfigValues = {
  checkboxLabel: string;
  checkboxDefault: boolean;
};

export function FieldShell({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <FieldShell label={label}>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function DropdownOptionsField<TValues extends OptionConfigValues>({
  values,
  error,
  selectionModes,
  onChange,
}: {
  values: TValues;
  error?: string;
  selectionModes: AdminSelectionMode[];
  onChange: (values: Partial<TValues>) => void;
}) {
  const updateOption = (index: number, value: string) => {
    onChange({ options: values.options.map((option, optionIndex) => (optionIndex === index ? value : option)) } as Partial<TValues>);
  };

  const deleteOption = (index: number) => {
    onChange({ options: values.options.filter((_, optionIndex) => optionIndex !== index) } as Partial<TValues>);
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="Select mode"
        value={values.selectionMode}
        options={selectionModes}
        onChange={(selectionMode) => onChange({ selectionMode } as Partial<TValues>)}
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Options</span>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ options: [...values.options, ""] } as Partial<TValues>)}>
            <Plus className="h-3.5 w-3.5" />
            Add Option
          </Button>
        </div>
        <div className="space-y-2">
          {values.options.map((option, index) => (
            <div className="flex gap-2" key={index}>
              <Input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} />
              <Button type="button" size="icon" variant="outline" onClick={() => deleteOption(index)} disabled={values.options.length === 1} aria-label="Delete option">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
      </div>
    </div>
  );
}

export function CheckboxConfigFields<TValues extends CheckboxConfigValues>({
  values,
  onChange,
}: {
  values: TValues;
  onChange: (values: Partial<TValues>) => void;
}) {
  return (
    <div className="space-y-4">
      <FieldShell label="Checkbox label">
        <Input value={values.checkboxLabel} onChange={(event) => onChange({ checkboxLabel: event.target.value } as Partial<TValues>)} placeholder="Visible checkbox label" />
      </FieldShell>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          checked={values.checkboxDefault}
          onChange={(event) => onChange({ checkboxDefault: event.target.checked } as Partial<TValues>)}
        />
        Default value
      </label>
    </div>
  );
}

export function ConfigTypeIcon({ type }: { type: AdminFieldType }) {
  const Icon =
    type === "Date"
      ? CalendarDays
      : type === "Time"
        ? Clock
        : type === "Number"
          ? Hash
          : type === "Dropdown"
            ? ListChecks
            : type === "Checkbox"
              ? CheckSquare
              : Type;

  return <Icon className="h-4 w-4 text-muted-foreground" />;
}
