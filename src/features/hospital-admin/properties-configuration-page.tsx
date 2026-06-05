"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarDays, CheckSquare, Clock, Hash, ListChecks, Pencil, Plus, Save, SlidersHorizontal, Trash2, Type } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { AdminSection, FilterBar, ProtectedAdmin, StickyActionBar } from "@/features/admin/admin-shared";

type PropertyType = "Free text" | "Date" | "Time" | "Number" | "Dropdown" | "Checkbox";
type SelectionMode = "Single" | "Multi";

type PropertyConfig = {
  dateFormat?: string;
  timeFormat?: string;
  options?: string[];
  selectionMode?: SelectionMode;
  checkboxLabel?: string;
  checkboxDefault?: boolean;
};

type PropertyRecord = {
  id: string;
  name: string;
  type: PropertyType;
  config: PropertyConfig;
  // updatedAt: string;
};

type PropertyFormValues = {
  name: string;
  type: PropertyType;
  dateFormat: string;
  timeFormat: string;
  options: string[];
  selectionMode: SelectionMode;
  checkboxLabel: string;
  checkboxDefault: boolean;
};

type PropertyDrawerState = { type: "add" } | { type: "edit"; record: PropertyRecord };
type FormErrors = Partial<Record<"name" | "options", string>>;

const propertyTypes: PropertyType[] = ["Free text", "Date", "Time", "Number", "Dropdown", "Checkbox"];
const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const timeFormats = ["12 hour", "24 hour"];
const selectionModes: SelectionMode[] = ["Single", "Multi"];

const emptyForm: PropertyFormValues = {
  name: "",
  type: "Free text",
  dateFormat: dateFormats[0],
  timeFormat: timeFormats[0],
  options: [""],
  selectionMode: "Single",
  checkboxLabel: "",
  checkboxDefault: false,
};

const initialPropertyRecords: PropertyRecord[] = [
  {
    id: "prop-001",
    name: "LDT Number",
    type: "Free text",
    config: {  },
    // updatedAt: "22 May 2026",
  },
  {
    id: "prop-002",
    name: "Placement date",
    type: "Date",
    config: { dateFormat: "DD/MM/YYYY" },
    // updatedAt: "21 May 2026",
  },
  {
    id: "prop-003",
    name: "Location of insertion:",
    type: "Dropdown",
    config: { options: ["Bacilic", "Brachial", "Femoral"], selectionMode: "Single" },
    // updatedAt: "19 May 2026",
  },
];

function toFormValues(record?: PropertyRecord): PropertyFormValues {
  if (!record) return emptyForm;

  return {
    ...emptyForm,
    name: record.name,
    type: record.type,
    dateFormat: record.config.dateFormat ?? emptyForm.dateFormat,
    timeFormat: record.config.timeFormat ?? emptyForm.timeFormat,
    options: record.config.options?.length ? record.config.options : [""],
    selectionMode: record.config.selectionMode ?? "Single",
    checkboxLabel: record.config.checkboxLabel ?? "",
    checkboxDefault: record.config.checkboxDefault ?? false,
  };
}

function buildConfig(values: PropertyFormValues): PropertyConfig {
  if (values.type === "Date") return { dateFormat: values.dateFormat };
  if (values.type === "Time") return { timeFormat: values.timeFormat };
  if (values.type === "Number") return {};
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

function getConfigSummary(record: PropertyRecord) {
  const { config } = record;
  if (record.type === "Date") return config.dateFormat ?? "Date";
  if (record.type === "Time") return config.timeFormat ?? "Time";
  if (record.type === "Number") return "Number field";
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

function DropdownOptionsField({
  values,
  error,
  onChange,
}: {
  values: PropertyFormValues;
  error?: string;
  onChange: (values: Partial<PropertyFormValues>) => void;
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

function CheckboxPropertyFields({
  values,
  onChange,
}: {
  values: PropertyFormValues;
  onChange: (values: Partial<PropertyFormValues>) => void;
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

function DynamicPropertyFields({
  values,
  errors,
  onChange,
}: {
  values: PropertyFormValues;
  errors: FormErrors;
  onChange: (values: Partial<PropertyFormValues>) => void;
}) {
  if (values.type === "Date") {
    return <SelectField label="Date format" value={values.dateFormat} options={dateFormats} onChange={(dateFormat) => onChange({ dateFormat })} />;
  }
  if (values.type === "Time") {
    return <SelectField label="Time format" value={values.timeFormat} options={timeFormats} onChange={(timeFormat) => onChange({ timeFormat })} />;
  }
  if (values.type === "Number") {
    return null;
  }
  if (values.type === "Dropdown") {
    return <DropdownOptionsField values={values} error={errors.options} onChange={onChange} />;
  }
  if (values.type === "Checkbox") {
    return <CheckboxPropertyFields values={values} onChange={onChange} />;
  }
  return null;
}

function PropertyTypeIcon({ type }: { type: PropertyType }) {
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

function PropertyFormDrawer({
  state,
  records,
  onClose,
  onSave,
}: {
  state: PropertyDrawerState | null;
  records: PropertyRecord[];
  onClose: () => void;
  onSave: (values: PropertyFormValues, editingId?: string) => void;
}) {
  const editingRecord = state?.type === "edit" ? state.record : null;
  const [values, setValues] = React.useState<PropertyFormValues>(emptyForm);
  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => {
    if (!state) return;
    const timeoutId = window.setTimeout(() => {
      setValues(toFormValues(editingRecord ?? undefined));
      setErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [editingRecord, state]);

  const updateValues = (nextValues: Partial<PropertyFormValues>) => {
    setValues((current) => ({ ...current, ...nextValues }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const name = values.name.trim();
    const dropdownOptions = values.options.map((option) => option.trim()).filter(Boolean);
    const nameExists = records.some((record) => record.name.toLowerCase() === name.toLowerCase() && record.id !== editingRecord?.id);

    if (!name) nextErrors.name = "Property name is required.";
    if (nameExists) nextErrors.name = "Property name already exists.";
    if (values.type === "Dropdown" && dropdownOptions.length === 0) nextErrors.options = "Add at least one dropdown option.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({ ...values, name, options: dropdownOptions }, editingRecord?.id);
  };

  return (
    <Drawer
      open={Boolean(state)}
      onOpenChange={(open) => !open && onClose()}
      title={editingRecord ? "Edit Property" : "Add Property"}
      description="Properties configuration"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" className="bg-danger" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="property-form">
            <Save className="h-4 w-4" />
            {editingRecord ? "Save Property" : "Add Property"}
          </Button>
        </div>
      }
    >
      <form id="property-form" className="grid gap-4" onSubmit={handleSubmit}>
        <FieldShell label="Property Name" error={errors.name}>
          <Input value={values.name} onChange={(event) => updateValues({ name: event.target.value })} placeholder="Enter property name" />
        </FieldShell>
        <SelectField label="Type" value={values.type} options={propertyTypes} onChange={(type) => updateValues({ type })} />
        <DynamicPropertyFields values={values} errors={errors} onChange={updateValues} />
      </form>
    </Drawer>
  );
}

export function PropertiesConfigurationPage({ ldtId }: { ldtId?: string }) {
  const [records, setRecords] = React.useState<PropertyRecord[]>(initialPropertyRecords);
  const [search, setSearch] = React.useState("");
  const [drawerState, setDrawerState] = React.useState<PropertyDrawerState | null>(null);

  const filteredRecords = records.filter((record) =>
    `${record.name} ${record.type} ${getConfigSummary(record)}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleSave = React.useCallback((values: PropertyFormValues, editingId?: string) => {
    const config = buildConfig(values);
    if (editingId) {
      setRecords((current) =>
        current.map((record) => (record.id === editingId ? { ...record, name: values.name, type: values.type, config, updatedAt: formatDate() } : record)),
      );
      toast.success("Property updated");
    } else {
      setRecords((current) => [
        ...current,
        { id: `prop-${Date.now()}`, name: values.name, type: values.type, config, updatedAt: formatDate() },
      ]);
      toast.success("Property added");
    }
    setDrawerState(null);
  }, []);

  const handleDelete = React.useCallback((record: PropertyRecord) => {
    setRecords((current) => current.filter((item) => item.id !== record.id));
    toast.success(`${record.name} deleted`);
  }, []);

  const columns = React.useMemo<ColumnDef<PropertyRecord>[]>(
    () => [
      {
        header: "Property",
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
            <PropertyTypeIcon type={row.original.type} />
            <Badge tone="info">{row.original.type}</Badge>
          </div>
        ),
      },
      {
        header: "Configuration",
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{getConfigSummary(row.original)}</span>,
      },
      // { header: "Updated", accessorKey: "updatedAt" },
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
            eyebrow="Hospital Admin"
            title="Properties Configuration"
            description={ldtId ? `Manage properties for selected LDT: ${ldtId}.` : "Manage hospital-level operational properties and workflow defaults."}
            className="static mx-0 border-b bg-transparent px-0 py-2"
            actions={
              <Button disabled={readOnly} onClick={() => setDrawerState({ type: "add" })}>
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            }
          />
          {/* <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Configured" value={records.length} icon={SlidersHorizontal} change="Live" context="Available records" tone="info" />
            <StatCard label="Dropdowns" value={records.filter((record) => record.type === "Dropdown").length} icon={ListChecks} change="Options" context="Selection records" tone="success" />
            <StatCard label="Numeric" value={records.filter((record) => record.type === "Number").length} icon={Hash} change="Ranges" context="Measured records" tone="warning" />
          </div> */}
          <FilterBar search={search} onSearch={setSearch} placeholder="Search property, type, configuration..." />
          <AdminSection
            title={ldtId ? `Properties Configuration - ${ldtId}` : "Properties Configuration"}
            description="Create reusable properties with type-specific configuration for the selected workflow."
          >
            <DataTable data={filteredRecords} columns={columns} />
          </AdminSection>
          <PropertyFormDrawer state={drawerState} records={records} onClose={() => setDrawerState(null)} onSave={handleSave} />
          {/* <StickyActionBar readOnly={readOnly} saveLabel="Save Properties Configuration" /> */}
        </>
      )}
    </ProtectedAdmin>
  );
}
