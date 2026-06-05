"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Edit3, Save, Send, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { mockPatients } from "@/data/patients";
import { PatientSearchSelect } from "@/features/patients/patient-search-select";
import type { Role } from "@/types";

type FieldType = "Free text" | "Date" | "Time" | "Number" | "Dropdown" | "Checkbox";
type SelectionMode = "Single" | "Multi";
type AssessmentValue = string | boolean;

type AssessmentField = {
  id: string;
  name: string;
  type: FieldType;
  config: {
    dateFormat?: string;
    timeFormat?: string;
    decimalPlaces?: number;
    min?: number;
    max?: number;
    unit?: string;
    trackInIntake?: boolean;
    trackInOutput?: boolean;
    options?: string[];
    selectionMode?: SelectionMode;
    checkboxLabel?: string;
    checkboxDefault?: boolean;
  };
};

type LdtConfig = {
  id: string;
  name: string;
  type: "Line" | "Tube" | "Drain";
  assessments: AssessmentField[];
};

type AssessmentEntry = {
  id: string;
  fieldId: string;
  date: string;
  time: string;
  value: AssessmentValue;
};

type AssessmentFormValues = {
  fieldId: string;
  time: string;
  value: AssessmentValue;
};

type IntakeOutputEntry = {
  id: string;
  time: string;
  fieldName: string;
  type: "Intake" | "Output";
  volume: number;
  unit: string;
};

const nurseRoles: Role[] = ["Nurse", "Super Admin", "Hospital Admin"];

const ldtConfigurations: Record<string, LdtConfig> = {
  "ldt-001": {
    id: "ldt-001",
    name: "PICC double lumen",
    type: "Line",
    assessments: [
      { id: "assess-site", name: "Site Assessment", type: "Dropdown", config: { options: ["Clean", "Redness", "Swelling", "Discharge"], selectionMode: "Single" } },
      { id: "assess-status", name: "LDT Status", type: "Dropdown", config: { options: ["Patent", "Blocked", "Leaking", "Removed"], selectionMode: "Single" } },
      { id: "assess-dressing-type", name: "Dressing Type", type: "Dropdown", config: { options: ["Transparent", "Gauze", "Pressure", "Occlusive"], selectionMode: "Single" } },
      { id: "assess-dressing-status", name: "Dressing Status", type: "Dropdown", config: { options: ["Dry", "Soiled", "Loose", "Changed"], selectionMode: "Single" } },
      { id: "assess-volume", name: "Volume", type: "Number", config: { decimalPlaces: 0, min: 0, max: 500, unit: "ml", trackInIntake: true } },
    ],
  },
  "ldt-002": {
    id: "ldt-002",
    name: "Naso gastric tube",
    type: "Tube",
    assessments: [
      { id: "assess-site", name: "Site Assessment", type: "Free text", config: {} },
      { id: "assess-status", name: "LDT Status", type: "Dropdown", config: { options: ["In situ", "Dislodged", "Blocked", "Removed"], selectionMode: "Single" } },
      { id: "assess-dressing-type", name: "Dressing Type", type: "Dropdown", config: { options: ["Tape", "Securement device", "None"], selectionMode: "Single" } },
      { id: "assess-dressing-status", name: "Dressing Status", type: "Dropdown", config: { options: ["Secure", "Loose", "Reapplied"], selectionMode: "Single" } },
      { id: "assess-volume", name: "Volume", type: "Number", config: { decimalPlaces: 0, min: 0, max: 1000, unit: "ml", trackInOutput: true } },
      { id: "assess-next-change", name: "Next change date", type: "Date", config: { dateFormat: "YYYY-MM-DD" } },
    ],
  },
  "ldt-003": {
    id: "ldt-003",
    name: "Intercoastal drain",
    type: "Drain",
    assessments: [
      { id: "assess-site", name: "Site Assessment", type: "Dropdown", config: { options: ["Clean", "Tender", "Redness", "Leakage"], selectionMode: "Single" } },
      { id: "assess-status", name: "LDT Status", type: "Dropdown", config: { options: ["Swinging", "Not swinging", "Clamped", "Removed"], selectionMode: "Single" } },
      { id: "assess-dressing-type", name: "Dressing Type", type: "Dropdown", config: { options: ["Pressure", "Transparent", "Gauze"], selectionMode: "Single" } },
      { id: "assess-dressing-status", name: "Dressing Status", type: "Dropdown", config: { options: ["Dry", "Soaked", "Loose", "Changed"], selectionMode: "Single" } },
      { id: "assess-volume", name: "Volume", type: "Number", config: { decimalPlaces: 0, min: 0, max: 2000, unit: "ml", trackInOutput: true } },
      { id: "assess-check-time", name: "Review time", type: "Time", config: { timeFormat: "24 hour" } },
    ],
  },
};

const defaultLdtId = "ldt-001";
const hourlySlots = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, "0")}:00`);

function formatCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function makeEntryId() {
  return `assessment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getHourSlot(time: string) {
  const [hour = "00"] = time.split(":");
  return `${hour.padStart(2, "0")}:00`;
}

function getDefaultValue(field?: AssessmentField): AssessmentValue {
  if (field?.type === "Checkbox") return field.config.checkboxDefault ?? false;
  return "";
}

function isIoField(field: AssessmentField) {
  return field.type === "Number" && (field.config.trackInIntake || field.config.trackInOutput);
}

function isEmptyValue(value: AssessmentValue) {
  return typeof value === "boolean" ? false : value.trim() === "";
}

function displayValue(value: AssessmentValue, field: AssessmentField) {
  if (typeof value === "boolean") return value ? field.config.checkboxLabel ?? "Yes" : "No";
  return field.config.unit && field.type === "Number" ? `${value} ${field.config.unit}` : value;
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}:</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function FieldTypeBadges({ field }: { field: AssessmentField }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      <Badge tone="muted">{field.type}</Badge>
      {field.config.trackInIntake ? <Badge tone="success">Intake</Badge> : null}
      {field.config.trackInOutput ? <Badge tone="warning">Output</Badge> : null}
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function AssessmentValueInput({
  field,
  value,
  onChange,
}: {
  field: AssessmentField;
  value: AssessmentValue;
  onChange: (value: AssessmentValue) => void;
}) {
  if (field.type === "Date") return <Input type="date" value={String(value)} onChange={(event) => onChange(event.target.value)} />;
  if (field.type === "Time") return <Input type="time" value={String(value)} onChange={(event) => onChange(event.target.value)} />;
  if (field.type === "Number") {
    return (
      <div className="flex gap-2">
        <Input
          type="number"
          min={field.config.min}
          max={field.config.max}
          step={field.config.decimalPlaces ? 1 / 10 ** field.config.decimalPlaces : 1}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
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
        value={field.config.selectionMode === "Multi" ? String(value).split(",").filter(Boolean) : String(value)}
        onChange={(event) => {
          if (field.config.selectionMode === "Multi") {
            onChange(Array.from(event.target.selectedOptions).map((option) => option.value).join(","));
            return;
          }
          onChange(event.target.value);
        }}
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
    return (
      <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        {field.config.checkboxLabel ?? field.name}
      </label>
    );
  }
  return <Input value={String(value)} onChange={(event) => onChange(event.target.value)} placeholder={`Enter ${field.name.toLowerCase()}`} />;
}

function AssessmentEntryForm({
  fields,
  values,
  onChange,
  onSubmit,
}: {
  fields: AssessmentField[];
  values: AssessmentFormValues;
  onChange: (values: Partial<AssessmentFormValues>) => void;
  onSubmit: () => void;
}) {
  const selectedField = fields.find((field) => field.id === values.fieldId) ?? fields[0];

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-primary" />
            Add Assessment
          </CardTitle>
          <CardDescription>Enter assessment name, configured value, and time. Submit maps the value into the matching hourly slot.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 lg:grid-cols-[1fr_1fr_180px_auto] lg:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <SelectField
            label="Assessment name"
            value={values.fieldId}
            options={fields.map((field) => ({ label: field.name, value: field.id }))}
            onChange={(fieldId) => {
              const nextField = fields.find((field) => field.id === fieldId);
              onChange({ fieldId, value: getDefaultValue(nextField) });
            }}
          />
          <label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Configured field value</span>
            <AssessmentValueInput field={selectedField} value={values.value} onChange={(value) => onChange({ value })} />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Time</span>
            <Input type="time" value={values.time} onChange={(event) => onChange({ time: event.target.value })} />
          </label>
          <Button type="submit" className="lg:w-auto">
            <Save className="h-4 w-4" />
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AssessmentSlotTable({
  fields,
  entries,
  selectedDate,
  onDateChange,
  onEdit,
}: {
  fields: AssessmentField[];
  entries: AssessmentEntry[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onEdit: (entry: AssessmentEntry) => void;
}) {
  const entriesByFieldAndSlot = React.useMemo(() => {
    return entries.reduce<Record<string, AssessmentEntry>>((acc, entry) => {
      acc[`${entry.fieldId}-${getHourSlot(entry.time)}`] = entry;
      return acc;
    }, {});
  }, [entries]);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Assessment / Time</CardTitle>
          <CardDescription>Rows are assessment names. Columns are 1 hour time intervals, and each value appears in its mapped slot.</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            Date
            <Input className="h-9 w-[160px]" type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} />
          </label>
          <Badge tone={entries.length ? "success" : "muted"}>{entries.length} Values</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1800px] border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-primary text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                <tr>
                  <th className="sticky left-0 z-20 w-64 border-b border-r border-primary-foreground/20 bg-primary px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                    Assessment / Time
                  </th>
                  {hourlySlots.map((slot) => (
                    <th key={slot} className="min-w-32 border-b border-r border-primary-foreground/20 px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] text-center last:border-r-0">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className="border-b border-border last:border-0 hover:bg-primary/5">
                    <th className="sticky left-0 z-10 border-r border-border bg-primary/10 px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] align-top">
                      <div className="font-medium normal-case tracking-normal text-foreground">{field.name}</div>
                      {/* <FieldTypeBadges field={field} /> */}
                    </th>
                    {hourlySlots.map((slot) => {
                      const entry = entriesByFieldAndSlot[`${field.id}-${slot}`];
                      return (
                        <td key={`${field.id}-${slot}`} className="h-8 border-r border-border/60 px-1 py-2 align-top text-center last:border-r-0">
                          {entry ? (
                            <button
                              type="button"
                              onClick={() => onEdit(entry)}
                              className="mx-auto flex min-h-8 w-full flex-col items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-ring/20"
                            >
                              <span className="line-clamp-2">{displayValue(entry.value, field)}</span>
                              <span className="mt-1 flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                                <Edit3 className="h-3 w-3" />
                                {entry.time}
                              </span>
                            </button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] text-xs text-muted-foreground">
            Times with minutes are grouped into their hour slot, while the exact time remains visible inside the cell.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EditAssessmentDrawer({
  fields,
  entry,
  onOpenChange,
  onSave,
}: {
  fields: AssessmentField[];
  entry: AssessmentEntry | null;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: AssessmentEntry) => void;
}) {
  const [draft, setDraft] = React.useState<AssessmentEntry | null>(entry);
  const field = fields.find((item) => item.id === draft?.fieldId);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDraft(entry);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [entry]);

  return (
    <Drawer
      open={Boolean(entry)}
      onOpenChange={onOpenChange}
      title="Edit Assessment"
      description="Update the value or change time to remap this assessment into another slot."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!draft) return;
              onSave(draft);
            }}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      }
    >
      {draft && field ? (
        <div className="grid gap-4">
          <SelectField
            label="Assessment name"
            value={draft.fieldId}
            options={fields.map((item) => ({ label: item.name, value: item.id }))}
            onChange={(fieldId) => {
              const nextField = fields.find((item) => item.id === fieldId);
              setDraft((current) => (current ? { ...current, fieldId, value: getDefaultValue(nextField) } : current));
            }}
          />
          <label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Configured field value</span>
            <AssessmentValueInput field={field} value={draft.value} onChange={(value) => setDraft((current) => (current ? { ...current, value } : current))} />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Time</span>
            <Input type="time" value={draft.time} onChange={(event) => setDraft((current) => (current ? { ...current, time: event.target.value } : current))} />
          </label>
        </div>
      ) : null}
    </Drawer>
  );
}

function IntakeOutputPanel({ entries }: { entries: IntakeOutputEntry[] }) {
  const intakeTotal = entries.filter((entry) => entry.type === "Intake").reduce((total, entry) => total + entry.volume, 0);
  const outputTotal = entries.filter((entry) => entry.type === "Output").reduce((total, entry) => total + entry.volume, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Intake / Output Updates
          </CardTitle>
          <CardDescription>Number fields configured for Intake or Output are pushed here automatically.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="success">Intake {intakeTotal} ml</Badge>
          <Badge tone="warning">Output {outputTotal} ml</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">Time</th>
                    <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">Assessment</th>
                    <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">Module</th>
                    <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-border last:border-0">
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{entry.time}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{entry.fieldName}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                        <Badge tone={entry.type === "Intake" ? "success" : "warning"}>{entry.type}</Badge>
                      </td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] font-medium">
                        {entry.volume} {entry.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Submit a configured number value to create an Intake/Output update.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function LdtAssessmentPage({ ldtId = defaultLdtId }: { ldtId?: string }) {
  const { role } = useRole();
  const ldtConfig = ldtConfigurations[ldtId] ?? ldtConfigurations[defaultLdtId];
  const firstField = ldtConfig.assessments[0];
  const [formValues, setFormValues] = React.useState<AssessmentFormValues>(() => ({
    fieldId: firstField.id,
    time: formatCurrentTime(),
    value: getDefaultValue(firstField),
  }));
  const [entries, setEntries] = React.useState<AssessmentEntry[]>([]);
  const [selectedDate, setSelectedDate] = React.useState(formatCurrentDate);
  const [editingEntry, setEditingEntry] = React.useState<AssessmentEntry | null>(null);
  const [patientId, setPatientId] = React.useState(mockPatients[0]?.id ?? "");
  const patient = mockPatients.find((item) => item.id === patientId) ?? mockPatients[0];
  const allowed = nurseRoles.includes(role);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextFirstField = ldtConfig.assessments[0];
      setFormValues({ fieldId: nextFirstField.id, time: formatCurrentTime(), value: getDefaultValue(nextFirstField) });
      setEntries([]);
      setSelectedDate(formatCurrentDate());
      setEditingEntry(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [ldtConfig.id, ldtConfig.assessments]);

  const dateEntries = React.useMemo(() => entries.filter((entry) => entry.date === selectedDate), [entries, selectedDate]);

  const intakeOutputEntries = React.useMemo<IntakeOutputEntry[]>(() => {
    return entries.flatMap((entry) => {
      const field = ldtConfig.assessments.find((item) => item.id === entry.fieldId);
      if (!field || !isIoField(field)) return [];
      const volume = Number(entry.value);
      if (!Number.isFinite(volume) || volume <= 0) return [];

      const updates: IntakeOutputEntry[] = [];
      if (field.config.trackInIntake) {
        updates.push({ id: `${entry.id}-intake`, time: entry.time, fieldName: field.name, type: "Intake", volume, unit: field.config.unit ?? "ml" });
      }
      if (field.config.trackInOutput) {
        updates.push({ id: `${entry.id}-output`, time: entry.time, fieldName: field.name, type: "Output", volume, unit: field.config.unit ?? "ml" });
      }
      return updates;
    });
  }, [entries, ldtConfig.assessments]);

  const upsertEntry = (nextEntry: AssessmentEntry) => {
    setEntries((current) => {
      const nextSlot = getHourSlot(nextEntry.time);
      const withoutSameSlot = current.filter(
        (entry) =>
          entry.id === nextEntry.id ||
          entry.date !== nextEntry.date ||
          entry.fieldId !== nextEntry.fieldId ||
          getHourSlot(entry.time) !== nextSlot,
      );
      const exists = withoutSameSlot.some((entry) => entry.id === nextEntry.id);
      return exists ? withoutSameSlot.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry)) : [...withoutSameSlot, nextEntry];
    });
  };

  const handleSubmit = () => {
    const field = ldtConfig.assessments.find((item) => item.id === formValues.fieldId);
    if (!field) {
      toast.error("Select assessment name");
      return;
    }
    if (!formValues.time) {
      toast.error("Select assessment time");
      return;
    }
    if (isEmptyValue(formValues.value)) {
      toast.error("Enter assessment value");
      return;
    }

    upsertEntry({ id: makeEntryId(), fieldId: field.id, date: selectedDate, time: formValues.time, value: formValues.value });
    setFormValues((current) => ({ ...current, value: getDefaultValue(field) }));

    const ioTarget = isIoField(field) ? (field.config.trackInIntake && field.config.trackInOutput ? " and Intake/Output updated" : field.config.trackInIntake ? " and Intake updated" : " and Output updated") : "";
    toast.success(`${field.name} mapped to ${getHourSlot(formValues.time)} slot${ioTarget}`);
  };

  const handleSaveEditedEntry = (entry: AssessmentEntry) => {
    const field = ldtConfig.assessments.find((item) => item.id === entry.fieldId);
    if (!field || isEmptyValue(entry.value) || !entry.time) {
      toast.error("Complete assessment details");
      return;
    }
    upsertEntry(entry);
    setEditingEntry(null);
    toast.success(`${field.name} updated at ${entry.time}`);
  };

  if (!allowed) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nurse access required"
        description="Switch to Nurse role to open LDT assessment."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nursing - LDT Assessment"
        title={`${ldtConfig.name} Assessment`}
        description="Capture time-wise assessment values from the selected LDT admin configuration."
        className="static mx-0 border-b bg-transparent px-0 py-2"
        actions={
          <Button variant="outline" asChild>
            <Link href="/nurse/ldt-management">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <PatientSearchSelect patientId={patient.id} onPatientChange={setPatientId} />
          <DetailItem label="Age/Gender" value={`${patient.age} / ${patient.gender}`} />
          <DetailItem label="Blood Group" value={patient.bloodGroup} />
          <DetailItem label="LDT" value={`${ldtConfig.name} (${ldtConfig.type})`} />
        </CardContent>
      </Card>

      <AssessmentEntryForm
        fields={ldtConfig.assessments}
        values={formValues}
        onChange={(values) => setFormValues((current) => ({ ...current, ...values }))}
        onSubmit={handleSubmit}
      />

      <AssessmentSlotTable
        fields={ldtConfig.assessments}
        entries={dateEntries}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onEdit={setEditingEntry}
      />

      <IntakeOutputPanel entries={intakeOutputEntries} />

      <EditAssessmentDrawer
        fields={ldtConfig.assessments}
        entry={editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSave={handleSaveEditedEntry}
      />
    </div>
  );
}
