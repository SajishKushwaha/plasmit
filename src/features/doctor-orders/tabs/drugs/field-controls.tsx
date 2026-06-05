"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { doseUnits, forms, frequencies, orderCategories, routes } from "./data";
import type { DraftCategory, OrderDraft, TaperDose } from "./types";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

export function SelectField<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (value: T) => void }) {
  return (
    <select
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    >
      <option value="">Select</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function CategoryRadioGroup({ value, onChange }: { value: DraftCategory; onChange: (category: DraftCategory) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {orderCategories.map((category) => (
        <label
          key={category}
          className={[
            "flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition",
            value === category ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-surface-muted",
          ].join(" ")}
        >
          <input type="radio" name="drug-category" className="h-4 w-4" checked={value === category} onChange={() => onChange(category)} />
          {category}
        </label>
      ))}
    </div>
  );
}

const createTaperDose = (): TaperDose => ({
  id: `taper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  dose: "",
  unit: "",
  frequency: "",
  fromDate: "",
  toDate: "",
});

export function DrugDraftFields({
  draft,
  flash,
  onChange,
}: {
  draft: OrderDraft;
  flash: boolean;
  onChange: (values: Partial<OrderDraft>) => void;
}) {
  const today = React.useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);
  const endDateMin = draft.startDate || today;
  const showFrequency = Boolean(draft.category) && draft.category !== "SOS" && draft.category !== "Unscheduled";
  const showDays = Boolean(draft.category) && draft.category !== "Continuous" && draft.category !== "Unscheduled";
  const showStartDate = Boolean(draft.category) && draft.category !== "SOS" && draft.category !== "Unscheduled";
  const showMaxDosage = draft.category === "SOS";
  const taperDoses = draft.taperDoses.length ? draft.taperDoses : [createTaperDose()];

  const updateTaperDose = (id: string, values: Partial<TaperDose>) => {
    const currentRows = draft.taperDoses.length ? draft.taperDoses : taperDoses;
    onChange({ taperDoses: currentRows.map((row) => (row.id === id ? { ...row, ...values } : row)) });
  };

  const addTaperDose = () => {
    onChange({ taperDoses: [...taperDoses, createTaperDose()] });
  };

  const removeTaperDose = (id: string) => {
    const nextRows = taperDoses.filter((row) => row.id !== id);
    onChange({ taperDoses: nextRows.length ? nextRows : [createTaperDose()] });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FieldLabel>Category</FieldLabel>
        <CategoryRadioGroup value={draft.category} onChange={(category) => onChange({ category })} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="space-y-2">
          <FieldLabel>Drug Name</FieldLabel>
          <Input value={draft.name} readOnly className="bg-surface-muted" />
        </label>
        <label className="space-y-2">
          <FieldLabel>Form</FieldLabel>
          <SelectField value={draft.form} options={forms} onChange={(form) => onChange({ form })} />
        </label>
        <label className="space-y-2">
          <FieldLabel>Dosage</FieldLabel>
          <div className="grid grid-cols-[1fr_110px] gap-2">
            <Input value={draft.dosage} onChange={(event) => onChange({ dosage: event.target.value })} />
            <SelectField value={draft.doseUnit} options={doseUnits} onChange={(doseUnit) => onChange({ doseUnit })} />
          </div>
        </label>
        <label className="space-y-2">
          <FieldLabel>Route</FieldLabel>
          <SelectField value={draft.route} options={routes} onChange={(route) => onChange({ route })} />
        </label>
        {showMaxDosage ? (
          <label className="space-y-2">
            <FieldLabel>Max Dosage</FieldLabel>
            <Input value={draft.maxDosage} onChange={(event) => onChange({ maxDosage: event.target.value })} />
          </label>
        ) : null}
        {showFrequency ? (
          <label className="space-y-2">
            <FieldLabel>Frequency</FieldLabel>
            <SelectField value={draft.frequency} options={frequencies} onChange={(frequency) => onChange({ frequency })} />
          </label>
        ) : null}
        {showDays ? (
          <label className="space-y-2">
            <FieldLabel>No. of Days</FieldLabel>
            <Input type="number" min={0} value={draft.days} onChange={(event) => onChange({ days: event.target.value })} />
          </label>
        ) : null}
        {showStartDate ? (
          <label className="space-y-2">
            <FieldLabel>Start Date</FieldLabel>
            <Input type="date" min={today} value={draft.startDate} onChange={(event) => onChange({ startDate: event.target.value })} />
          </label>
        ) : null}
        {draft.category === "Scheduled" || draft.category === "Intermittent" ? (
          <label className="space-y-2">
            <FieldLabel>End Date</FieldLabel>
            <Input type="date" min={endDateMin} value={draft.endDate} onChange={(event) => onChange({ endDate: event.target.value })} />
          </label>
        ) : null}
        <label className="space-y-2">
          <FieldLabel>Total Qty</FieldLabel>
          <Input
            type="number"
            min={0}
            readOnly
            className={flash ? "border-success bg-success/10 font-semibold ring-2 ring-success/20 transition" : "bg-surface-muted font-semibold transition"}
            value={draft.orderedQty}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <FieldLabel>Instructions</FieldLabel>
          <Input value={draft.instructions} onChange={(event) => onChange({ instructions: event.target.value })} />
        </label>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <FieldLabel>Taper dose</FieldLabel>
            <Button type="button" size="icon" variant="outline" onClick={addTaperDose} aria-label="Add taper dose">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {taperDoses.map((row) => (
              <div key={row.id} className="grid gap-2 rounded-md border border-border bg-surface-muted p-2 sm:grid-cols-[1fr_92px_120px_1fr_1fr_40px]">
                <Input
                  value={row.dose}
                  onChange={(event) => updateTaperDose(row.id, { dose: event.target.value })}
                  placeholder="Dose"
                />
                <SelectField value={row.unit} options={doseUnits} onChange={(unit) => updateTaperDose(row.id, { unit })} />
                <SelectField value={row.frequency} options={frequencies} onChange={(frequency) => updateTaperDose(row.id, { frequency })} />
                <Input
                  type="date"
                  value={row.fromDate}
                  min={today}
                  onChange={(event) => updateTaperDose(row.id, { fromDate: event.target.value })}
                  aria-label="From date"
                />
                <Input
                  type="date"
                  value={row.toDate}
                  min={row.fromDate || today}
                  onChange={(event) => updateTaperDose(row.id, { toDate: event.target.value })}
                  aria-label="To date"
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => removeTaperDose(row.id)} aria-label="Remove taper dose">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
