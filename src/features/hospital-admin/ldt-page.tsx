"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { FlaskConical, ListChecks, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { AdminSection, FilterBar, ProtectedAdmin, StickyActionBar } from "@/features/admin/admin-shared";
import { MasterDialog } from "@/features/pharmacy-master/components/master-dialog";

type LdtRecord = {
  id: string;
  name: string;
  type: string;
};

type LdtFormValues = Omit<LdtRecord, "id">;
type LdtDrawerState = { type: "add" } | { type: "edit"; record: LdtRecord };

const initialLdtRecords: LdtRecord[] = [
  { id: "ldt-001", name: "PICC double lumen", type: "Line" },
  { id: "ldt-002", name: "Naso gastric tube", type: "Tube" },
  { id: "ldt-003", name: "Intercoastal drain", type: "Drain" },
];

const ldtTypeOptions = ["Line", "Tube", "Drain"];

const emptyForm: LdtFormValues = {
  name: "",
  type: ldtTypeOptions[0],
};

function LdtFormDrawer({
  state,
  records,
  onClose,
  onSave,
}: {
  state: LdtDrawerState | null;
  records: LdtRecord[];
  onClose: () => void;
  onSave: (values: LdtFormValues, editingId?: string) => void;
}) {
  const editingRecord = state?.type === "edit" ? state.record : null;
  const [values, setValues] = React.useState<LdtFormValues>(emptyForm);
  const [errors, setErrors] = React.useState<Partial<Record<keyof LdtFormValues, string>>>({});

  React.useEffect(() => {
    if (!state) return;
    const timeoutId = window.setTimeout(() => {
      setValues(editingRecord ? { name: editingRecord.name, type: editingRecord.type } : emptyForm);
      setErrors({});
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [editingRecord, state]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Partial<Record<keyof LdtFormValues, string>> = {};
    const name = values.name.trim();
    const type = values.type.trim();
    const nameExists = records.some((record) => record.name.toLowerCase() === name.toLowerCase() && record.id !== editingRecord?.id);

    if (name.length < 3) nextErrors.name = "Enter at least 3 characters.";
    if (!type) nextErrors.type = "LDT type is required.";
    if (nameExists) nextErrors.name = "LDT name already exists.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    onSave({ name, type }, editingRecord?.id);
  };

  return (
    <MasterDialog
      open={Boolean(state)}
      onOpenChange={(open) => !open && onClose()}
      title={editingRecord ? "Edit LDT" : "Add LDT"}
      description="LDT master"
      submitLabel="Save LDT"
      onSubmit={() => {
        const form = document.getElementById("ldt-form") as HTMLFormElement | null;
        form?.requestSubmit();
      }}
    >
      <form id="ldt-form" className="grid gap-4" onSubmit={handleSubmit}>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">LDT Name</span>
          <Input value={values.name} onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))} placeholder="Enter LDT Name" />
          {errors.name ? <span className="text-xs font-medium text-danger">{errors.name}</span> : null}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-foreground">LDT Type</span>
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
            value={values.type}
            onChange={(event) => setValues((current) => ({ ...current, type: event.target.value }))}
          >
            {ldtTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type ? <span className="text-xs font-medium text-danger">{errors.type}</span> : null}
        </label>
      </form>
    </MasterDialog>
  );
}

export function LdtPage() {
  const [records, setRecords] = React.useState<LdtRecord[]>(initialLdtRecords);
  const [search, setSearch] = React.useState("");
  const [drawerState, setDrawerState] = React.useState<LdtDrawerState | null>(null);
  const filteredRecords = records.filter((record) =>
    `${record.name} ${record.type}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const handleSave = React.useCallback((values: LdtFormValues, editingId?: string) => {
    if (editingId) {
      setRecords((current) => current.map((record) => record.id === editingId ? { ...record, ...values } : record));
      toast.success("LDT updated");
    } else {
      setRecords((current) => [...current, { ...values, id: `ldt-${Date.now()}` }]);
      toast.success("LDT added");
    }
    setDrawerState(null);
  }, []);

  const handleDelete = React.useCallback((record: LdtRecord) => {
    setRecords((current) => current.filter((item) => item.id !== record.id));
    toast.success(`${record.name} deleted`);
  }, []);

  const columns = React.useMemo<ColumnDef<LdtRecord>[]>(
    () => [
      { header: "LDT Name", accessorKey: "name" },
      { header: "LDT Type", accessorKey: "type" },
      {
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original;
          return (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/hospital-admin/properties-configuration?ldtId=${record.id}`}>
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Properties
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/hospital-admin/assessment-configuration?ldtId=${record.id}`}>
                  <ListChecks className="h-3.5 w-3.5" />
                  Assessment
                </Link>
              </Button>
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
            title="LDT"
            className="static mx-0 border-b bg-transparent px-0 py-2"
            actions={
              <>
                <Button disabled={readOnly} onClick={() => setDrawerState({ type: "add" })}>
                  <Plus className="h-4 w-4" />
                  Add LDT
                </Button>
              </>
            }
          />

          <FilterBar search={search} onSearch={setSearch} placeholder="Search LDT name or type..." />

          <AdminSection title="LDT">
            <DataTable data={filteredRecords} columns={columns} />
          </AdminSection>

          <LdtFormDrawer
            state={drawerState}
            records={records}
            onClose={() => setDrawerState(null)}
            onSave={handleSave}
          />
          {/* <StickyActionBar readOnly={readOnly} saveLabel="Save LDT" /> */}
        </>
      )}
    </ProtectedAdmin>
  );
}
