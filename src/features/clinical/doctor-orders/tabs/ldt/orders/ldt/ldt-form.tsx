"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

import type { LdtOrder, LdtOrderFormValues } from "./types";

const emptyForm: LdtOrderFormValues = {
  orderType: "Insert",
  ldtName: "",
  priority: "Routine",
  orderDate: new Date().toISOString().slice(0, 16),
  status: "Pending",
  patientName: "",
  patientId: "",
  doctorName: "",
  notes: "",
};

export function LdtFormDrawer({
  open,
  onOpenChange,
  onSave,
  editingOrder,
  existingOrders,
}: {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onSave: (_values: LdtOrderFormValues, _editingId?: string) => void;
  editingOrder: LdtOrder | null;
  existingOrders: LdtOrder[];
}) {
  const [values, setValues] = React.useState<LdtOrderFormValues>(emptyForm);

  React.useEffect(() => {
    setValues(
      editingOrder
        ? {
            orderType: editingOrder.orderType,
            ldtName: editingOrder.ldtName,
            priority: editingOrder.priority,
            orderDate: editingOrder.orderDate,
            status: editingOrder.status,
            patientName: editingOrder.patientName,
            patientId: editingOrder.patientId,
            doctorName: editingOrder.doctorName,
            notes: editingOrder.notes,
          }
        : emptyForm,
    );
  }, [editingOrder, open]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = values.ldtName.trim();
    if (!nextName) return;
    const duplicate = existingOrders.some(
      (order) =>
        order.ldtName.toLowerCase() === nextName.toLowerCase() && order.id !== editingOrder?.id,
    );
    if (duplicate) return;
    onSave({ ...values, ldtName: nextName }, editingOrder?.id);
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={editingOrder ? "Edit LDT Order" : "Create LDT Order"}
      description="Form implementation will be added in the next task."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              (document.getElementById("ldt-order-form") as HTMLFormElement | null)?.requestSubmit()
            }
          >
            Save
          </Button>
        </div>
      }
    >
      <form id="ldt-order-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Order Type">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={values.orderType}
            onChange={(e) =>
              setValues((current) => ({
                ...current,
                orderType: e.target.value as LdtOrderFormValues["orderType"],
              }))
            }
          >
            {["Insert", "Remove", "Replace"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={values.priority}
            onChange={(e) =>
              setValues((current) => ({
                ...current,
                priority: e.target.value as LdtOrderFormValues["priority"],
              }))
            }
          >
            {["Routine", "Urgent", "STAT"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="LDT Name">
          <Input
            value={values.ldtName}
            onChange={(e) => setValues((current) => ({ ...current, ldtName: e.target.value }))}
          />
        </Field>
        <Field label="Order Date">
          <Input
            type="datetime-local"
            value={values.orderDate}
            onChange={(e) => setValues((current) => ({ ...current, orderDate: e.target.value }))}
          />
        </Field>
        <Field label="Patient Name">
          <Input
            value={values.patientName}
            onChange={(e) => setValues((current) => ({ ...current, patientName: e.target.value }))}
          />
        </Field>
        <Field label="Patient ID">
          <Input
            value={values.patientId}
            onChange={(e) => setValues((current) => ({ ...current, patientId: e.target.value }))}
          />
        </Field>
        <Field label="Doctor Name">
          <Input
            value={values.doctorName}
            onChange={(e) => setValues((current) => ({ ...current, doctorName: e.target.value }))}
          />
        </Field>
        <Field label="Status">
          <select
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={values.status}
            onChange={(e) =>
              setValues((current) => ({
                ...current,
                status: e.target.value as LdtOrderFormValues["status"],
              }))
            }
          >
            {["Pending", "Active", "Completed", "Cancelled"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
            value={values.notes}
            onChange={(e) => setValues((current) => ({ ...current, notes: e.target.value }))}
          />
        </Field>
      </form>
    </Drawer>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`space-y-1 text-sm ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
