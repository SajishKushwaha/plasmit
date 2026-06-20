"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, CheckSquare, ClipboardCheck, Clock, Hash, ListChecks, Pencil, Plus, Save, Trash2, Type } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { AdminSection, FilterBar, ProtectedAdmin, StickyActionBar } from "@/features/admin/admin-shared";

type AssessmentFieldType = "Free text" | "Date" | "Time" | "Number" | "Dropdown" | "Checkbox";
type SelectionMode = "Single" | "Multi";

type AssessmentConfig = {
  dateFormat?: string;
  timeFormat?: string;
  trackInIntake?: boolean;
  trackInOutput?: boolean;
  options?: string[];
  selectionMode?: SelectionMode;
  checkboxLabel?: string;
  checkboxDefault?: boolean;
};

type AssessmentRecord = {
  id: string;
  name: string;
  type: AssessmentFieldType;
  config: AssessmentConfig;
  updatedAt: string;
};

type AssessmentFormValues = {
  name: string;
  type: AssessmentFieldType;
  dateFormat: string;
  timeFormat: string;
  trackInIntake: boolean;
  trackInOutput: boolean;
  options: string[];
  selectionMode: SelectionMode;
  checkboxLabel: string;
  checkboxDefault: boolean;
};

type AssessmentDrawerState = { type: "add" } | { type: "edit"; record: AssessmentRecord };
type FormErrors = Partial<Record<"name" | "options", string>>;

const assessmentTypes: AssessmentFieldType[] = ["Free text", "Date", "Time", "Number", "Dropdown", "Checkbox"];
const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const timeFormats = ["12 hour", "24 hour"];
const selectionModes: SelectionMode[] = ["Single", "Multi"];

const emptyForm: AssessmentFormValues = {
  name: "",
  type: "Free text",
  dateFormat: dateFormats[0],
  timeFormat: timeFormats[0],
  trackInIntake: false,
  trackInOutput: false,
  options: [""],
  selectionMode: "Single",
  checkboxLabel: "",
  checkboxDefault: false,
};

const initialAssessmentRecords: AssessmentRecord[] = [
  {
    id: "assess-001",
    name: "Tube Drainage Volume",
    type: "Number",
    config: { trackInIntake: false, trackInOutput: true },
    updatedAt: "22 May 2026",
  },
  {
    id: "assess-002",
    name: "Insertion Site Condition",
    type: "Dropdown",
    config: { options: ["Clean", "Redness", "Swelling", "Discharge"], selectionMode: "Single" },
    updatedAt: "20 May 2026",
  },
  {
    id: "assess-003",
    name: "Dressing Changed",
    type: "Checkbox",
    config: { checkboxLabel: "Dressing changed", checkboxDefault: false },
    updatedAt: "17 May 2026",
  },
];

function toFormValues(record?: AssessmentRecord): AssessmentFormValues {
  if (!record) return emptyForm;

  return {
    ...emptyForm,
    name: record.name,
    type: record.type,
    dateFormat: record.config.dateFormat ?? emptyForm.dateFormat,
    timeFormat: record.config.timeFormat ?? emptyForm.timeFormat,
    trackInIntake: record.config.trackInIntake ?? false,
    trackInOutput: record.config.trackInOutput ?? false,
    options: record.config.options?.length ? record.config.options : [""],
    selectionMode: record.config.selectionMode ?? "Single",
    checkboxLabel: record.config.checkboxLabel ?? "",
    checkboxDefault: record.config.checkboxDefault ?? false,
  };
}

function buildConfig(values: AssessmentFormValues): AssessmentConfig {
  if (values.type === "Date") return { dateFormat: values.dateFormat };
  if (values.type === "Time") return { timeFormat: values.timeFormat };
  if (values.type === "Number") {
    return {
      trackInIntake: values.trackInIntake,
      trackInOutput: values.trackInOutput,
    };
  }
  if (values.type === "Dropdown") {
    return {
      options: values.options.map((option) => option.trim()).filter(Boolean),
      selectionMode: values.selectionMode,
    };
  }
  if (values.type === "Checkbox") {
    return {
      checkboxLabel: values.checkboxLabel.trim() || values.name.trim(),
      checkboxDefault: values.checkboxDefault,
    };
  }
  return {};
}

function formatDate() {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date());
}

function getConfigSummary(record: AssessmentRecord) {
  const { config } = record;
  if (record.type === "Date") return config.dateFormat ?? "Date";
  if (record.type === "Time") return config.timeFormat ?? "Time";
  if (record.type === "Number") {
    const tracking = [
      config.trackInIntake ? "Intake" : null,
      config.trackInOutput ? "Output" : null,
    ].filter(Boolean).join(", ");
    return tracking ? `Number field, tracks ${tracking}` : "Number field";
  }
  if (record.type === "Dropdown") return `${config.options?.length ?? 0} options, ${config.selectionMode ?? "Single"} select`;
  if (record.type === "Checkbox") return `${config.checkboxLabel ?? record.name}, default ${config.checkboxDefault ? "checked" : "unchecked"}`;
  return "Free text";
}

function FieldShell({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

function SelectField<T extends string>({
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

function TrackingCheckboxes({
  values,
  onChange,
}: {
  values: AssessmentFormValues;
  onChange: (values: Partial<AssessmentFormValues>) => void;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="mb-3 text-sm font-medium text-foreground">Intake / Output tracking</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            checked={values.trackInIntake}
            onChange={(event) => onChange({ trackInIntake: event.target.checked })}
          />
          Track in Intake?
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            checked={values.trackInOutput}
            onChange={(event) => onChange({ trackInOutput: event.target.checked })}
          />
          Track in Output?
        </label>
      </div>
    </div>
  );
}

function NumberAssessmentFields({
  values,
  onChange,
}: {
  values: AssessmentFormValues;
  onChange: (values: Partial<AssessmentFormValues>) => void;
}) {
  return (
    <div>
      <TrackingCheckboxes values={values} onChange={onChange} />
    </div>
  );
}

function DropdownOptionsField({
  values,
  error,
  onChange,
}: {
  values: AssessmentFormValues;
  error?: string;
  onChange: (values: Partial<AssessmentFormValues>) => void;
}) {
  const updateOption = (index: number, value: string) => {
    onChange({ options: values.options.map((option, optionIndex) => (optionIndex === index ? value : option)) });
  };

  const deleteOption = (index: number) => {
    onChange({ options: values.options.filter((_, optionIndex) => optionIndex !== index) });
  };

  return (
    <div className="space-y-4">
      <SelectField label="Select mode" value={values.selectionMode} options={selectionModes} onChange={(selectionMode) => onChange({ selectionMode })} />
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Options</span>
          <Button type="button" size="sm" variant="outline" onClick={() => onChange({ options: [...values.options, ""] })}>
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

function CheckboxAssessmentFields({
  values,
  onChange,
}: {
  values: AssessmentFormValues;
  onChange: (values: Partial<AssessmentFormValues>) => void;
}) {
  return (
    <div className="space-y-4">
      <FieldShell label="Checkbox label">
        <Input value={values.checkboxLabel} onChange={(event) => onChange({ checkboxLabel: event.target.value })} placeholder="Visible checkbox label" />
      </FieldShell>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          checked={values.checkboxDefault}
          onChange={(event) => onChange({ checkboxDefault: event.target.checked })}
        />
        Default value
      </label>
    </div>
  );
}

function DynamicAssessmentFields({
  values,
  errors,
  onChange,
}: {
  values: AssessmentFormValues;
  errors: FormErrors;
  onChange: (values: Partial<AssessmentFormValues>) => void;
}) {
  if (values.type === "Date") {
    return <SelectField label="Date format" value={values.dateFormat} options={dateFormats} onChange={(dateFormat) => onChange({ dateFormat })} />;
  }
  if (values.type === "Time") {
    return <SelectField label="Time format" value={values.timeFormat} options={timeFormats} onChange={(timeFormat) => onChange({ timeFormat })} />;
  }
  if (values.type === "Number") {
    return <NumberAssessmentFields values={values} onChange={onChange} />;
  }
  if (values.type === "Dropdown") {
    return <DropdownOptionsField values={values} error={errors.options} onChange={onChange} />;
  }
  if (values.type === "Checkbox") {
    return <CheckboxAssessmentFields values={values} onChange={onChange} />;
  }
  return null;
}

function AssessmentTypeIcon({ type }: { type: AssessmentFieldType }) {
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

function AssessmentFormDrawer({
  state,
  records,
  onClose,
  onSave,
}: {
  state: AssessmentDrawerState | null;
  records: AssessmentRecord[];
  onClose: () => void;
  onSave: (values: AssessmentFormValues, editingId?: string) => void;
}) {
  const editingRecord = state?.type === "edit" ? state.record : null;
  const [values, setValues] = React.useState<AssessmentFormValues>(emptyForm);
  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => {
    if (!state) return;
    const timeoutId = window.setTimeout(() => {
      setValues(toFormValues(editingRecord ?? undefined));
      setErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [editingRecord, state]);

  const updateValues = (nextValues: Partial<AssessmentFormValues>) => {
    setValues((current) => ({ ...current, ...nextValues }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const name = values.name.trim();
    const dropdownOptions = values.options.map((option) => option.trim()).filter(Boolean);
    const nameExists = records.some((record) => record.name.toLowerCase() === name.toLowerCase() && record.id !== editingRecord?.id);

    if (!name) nextErrors.name = "Assessment field name is required.";
    if (nameExists) nextErrors.name = "Assessment field name already exists.";
    if (values.type === "Dropdown" && dropdownOptions.length === 0) nextErrors.options = "Add at least one dropdown option.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({ ...values, name, options: dropdownOptions }, editingRecord?.id);
  };

  return (
    <Drawer
      open={Boolean(state)}
      onOpenChange={(open) => !open && onClose()}
      title={editingRecord ? "Edit Assessment" : "Add Assessment"}
      description="Assessment field configuration"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" className="bg-danger" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="assessment-form">
            <Save className="h-4 w-4" />
            {editingRecord ? "Save Assessment" : "Add Assessment"}
          </Button>
        </div>
      }
    >
      <form id="assessment-form" className="grid gap-4" onSubmit={handleSubmit}>
        <FieldShell label="Assessment Field Name" error={errors.name}>
          <Input value={values.name} onChange={(event) => updateValues({ name: event.target.value })} placeholder="Enter assessment field name" />
        </FieldShell>
        <SelectField label="Type" value={values.type} options={assessmentTypes} onChange={(type) => updateValues({ type })} />
        <DynamicAssessmentFields values={values} errors={errors} onChange={updateValues} />
      </form>
    </Drawer>
  );
}

export function AssessmentConfigurationPage({ ldtId }: { ldtId?: string }) {
  const [records, setRecords] = React.useState<AssessmentRecord[]>(initialAssessmentRecords);
  const [search, setSearch] = React.useState("");
  const [drawerState, setDrawerState] = React.useState<AssessmentDrawerState | null>(null);

  const filteredRecords = records.filter((record) =>
    `${record.name} ${record.type} ${getConfigSummary(record)}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleSave = React.useCallback((values: AssessmentFormValues, editingId?: string) => {
    const config = buildConfig(values);

    if (editingId) {
      setRecords((current) =>
        current.map((record) => (record.id === editingId ? { ...record, name: values.name, type: values.type, config, updatedAt: formatDate() } : record)),
      );
      toast.success("Assessment updated");
    } else {
      setRecords((current) => [
        ...current,
        { id: `assess-${Date.now()}`, name: values.name, type: values.type, config, updatedAt: formatDate() },
      ]);
      toast.success("Assessment added");
    }

    setDrawerState(null);
  }, []);

  const handleDelete = React.useCallback((record: AssessmentRecord) => {
    setRecords((current) => current.filter((item) => item.id !== record.id));
    toast.success(`${record.name} deleted`);
  }, []);

  const columns = React.useMemo<ColumnDef<AssessmentRecord>[]>(
    () => [
      {
        header: "Assessment",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">{row.original.id}</div>
          </div>
        ),
      },
      {
        header: "Type",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <AssessmentTypeIcon type={row.original.type} />
            <Badge tone="info">{row.original.type}</Badge>
          </div>
        ),
      },
      {
        header: "Configuration",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{getConfigSummary(row.original)}</span>,
      },
      { header: "Updated", accessorKey: "updatedAt" },
      {
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setDrawerState({ type: "edit", record })}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDelete(record)}>
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [handleDelete],
  );

  return (
    <ProtectedAdmin allowed={["Hospital Admin", "Super Admin"]}>
      {({ readOnly }) => (
        <>
          <PageHeader
            title="Assessment Configuration"
            className="static mx-0 border-b bg-transparent px-0 py-2"
            actions={
              <Button disabled={readOnly} onClick={() => setDrawerState({ type: "add" })}>
                <Plus className="h-4 w-4" />
                Add Assessment
              </Button>
            }
          />
          {/* <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Configured" value={records.length} icon={ListChecks} change="Live" context="Available records" tone="info" />
            <StatCard label="Numbers" value={records.filter((record) => record.type === "Number").length} icon={Hash} change="I/O ready" context="Trackable fields" tone="success" />
            <StatCard
              label="I/O Tracked"
              value={records.filter((record) => record.config.trackInIntake || record.config.trackInOutput).length}
              icon={ClipboardCheck}
              change="Volume"
              context="Intake/output fields"
              tone="warning"
            />
          </div> */}
          <FilterBar search={search} onSearch={setSearch} placeholder="Search assessment, type, configuration..." />
          <AdminSection
            title={ldtId ? `Assessment Configuration - ${ldtId}` : "Assessment Configuration"}
            description="Create assessment fields with type-specific configuration and number-based intake/output tracking."
          >
            <DataTable data={filteredRecords} columns={columns} />
          </AdminSection>
          <AssessmentFormDrawer state={drawerState} records={records} onClose={() => setDrawerState(null)} onSave={handleSave} />
          {/* <StickyActionBar readOnly={readOnly} saveLabel="Save Assessment Configuration" /> */}
        </>
      )}
    </ProtectedAdmin>
  );
}
