"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, SearchX, Trash2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";

import type { LdtOrder, LdtOrderPriority, LdtOrderStatus } from "./types";

const LDT_TYPE_OPTIONS = [
  "PICC Single Lumen",
  "PICC Double Lumen",
  "Foley Catheter",
  "Central Venous Catheter",
  "Peripheral IV Cannula",
  "Urinary Catheter",
  "Nasogastric Tube",
  "Chest Tube",
  "Arterial Line",
] as const;

const priorityOptions: LdtOrderPriority[] = ["Routine", "Urgent", "STAT"];
const statusOptions: LdtOrderStatus[] = ["Pending", "Active", "Completed", "Cancelled"];

const today = new Date().toISOString().slice(0, 10);

const initialOrders: LdtOrder[] = [
  { id: "ldt-001", orderNo: "LDT-9001", orderType: "Insert", ldtName: "PICC line", priority: "Routine", orderDate: today, status: "Pending" },
  { id: "ldt-002", orderNo: "LDT-9002", orderType: "Remove", ldtName: "Foley catheter", priority: "Urgent", orderDate: today, status: "Active" },
  { id: "ldt-003", orderNo: "LDT-9003", orderType: "Replace", ldtName: "Peripheral IV cannula", priority: "STAT", orderDate: today, status: "Completed" },
];

type DrawerMode = "create" | "edit" | "view";
type Draft = {
  ldtType: string;
  priority: LdtOrderPriority;
  reason: string;
  clinicalNotes: string;
  ldtName: string;
  orderDate: string;
  status: LdtOrderStatus;
};

export function LdtListPage() {
  const [search, setSearch] = React.useState("");
  const [priority, setPriority] = React.useState<LdtOrderPriority | "All Priority">("All Priority");
  const [status, setStatus] = React.useState<LdtOrderStatus | "All Status">("All Status");
  const [dateRange, setDateRange] = React.useState(today);
  const [orders, setOrders] = React.useState<LdtOrder[]>(initialOrders);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [drawerMode, setDrawerMode] = React.useState<DrawerMode>("create");
  const [editingOrder, setEditingOrder] = React.useState<LdtOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<LdtOrder | null>(null);
  const [draft, setDraft] = React.useState<Draft>({
    ldtType: "PICC Single Lumen",
    priority: "Routine",
    reason: "",
    clinicalNotes: "",
    ldtName: "",
    orderDate: today,
    status: "Pending",
  });

  const filteredOrders = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch = `${order.orderNo} ${order.orderType} ${order.ldtName} ${order.priority} ${order.orderDate} ${order.status}`.toLowerCase().includes(query);
      const matchesPriority = priority === "All Priority" || order.priority === priority;
      const matchesStatus = status === "All Status" || order.status === status;
      const matchesDate = !dateRange || order.orderDate >= dateRange;
      return matchesSearch && matchesPriority && matchesStatus && matchesDate;
    });
  }, [dateRange, orders, priority, search, status]);

  const resetDraft = React.useCallback((order?: LdtOrder | null) => {
    if (order) {
      setDraft({
        ldtType: order.ldtName,
        priority: order.priority,
        reason: `LDT order for ${order.ldtName}`,
        clinicalNotes: "",
        ldtName: order.ldtName,
        orderDate: order.orderDate,
        status: order.status,
      });
      return;
    }

    setDraft({
      ldtType: "PICC Single Lumen",
      priority: "Routine",
      reason: "",
      clinicalNotes: "",
      ldtName: "",
      orderDate: today,
      status: "Pending",
    });
  }, []);

  const openCreateDrawer = () => {
    setDrawerMode("create");
    setEditingOrder(null);
    resetDraft(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (order: LdtOrder) => {
    setDrawerMode("edit");
    setEditingOrder(order);
    resetDraft(order);
    setDrawerOpen(true);
  };

  const openViewDrawer = (order: LdtOrder) => {
    setDrawerMode("view");
    setEditingOrder(order);
    resetDraft(order);
    setDrawerOpen(true);
  };

  const handleSave = () => {
    const name = draft.ldtName.trim() || draft.ldtType;
    if (!name) return;

    if (drawerMode === "edit" && editingOrder) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editingOrder.id
            ? {
                ...order,
                orderType: "Insert",
                ldtName: name,
                priority: draft.priority,
                orderDate: draft.orderDate || today,
                status: draft.status,
              }
            : order,
        ),
      );
    } else if (drawerMode === "create") {
      const nextId = `ldt-${String(orders.length + 1).padStart(3, "0")}`;
      const nextOrderNo = `LDT-${9000 + orders.length + 1}`;
      setOrders((current) => [
        {
          id: nextId,
          orderNo: nextOrderNo,
          orderType: "Insert",
          ldtName: name,
          priority: draft.priority,
          orderDate: draft.orderDate || today,
          status: draft.status,
        },
        ...current,
      ]);
    }

    setDrawerOpen(false);
    setEditingOrder(null);
  };

  const columns = React.useMemo<ColumnDef<LdtOrder>[]>(
    () => [
      { header: "Order No", accessorKey: "orderNo" },
      { header: "LDT Name", accessorKey: "ldtName" },
      { header: "Priority", cell: ({ row }) => <Badge tone={row.original.priority === "STAT" ? "danger" : row.original.priority === "Urgent" ? "warning" : "success"}>{row.original.priority}</Badge> },
      { header: "Order Date", accessorKey: "orderDate" },
      { header: "Status", cell: ({ row }) => <Badge tone={row.original.status === "Completed" ? "success" : row.original.status === "Cancelled" ? "danger" : row.original.status === "Active" ? "info" : "warning"}>{row.original.status}</Badge> },
      {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" type="button" onClick={() => openViewDrawer(row.original)}>
              <Eye className="h-4 w-4" />
              
            </Button>
            <Button size="sm" variant="outline" type="button" onClick={() => openEditDrawer(row.original)}>
              <Pencil className="h-4 w-4" />
              
            </Button>
            <Button size="sm" variant="outline" type="button" className="text-danger" onClick={() => setDeleteTarget(row.original)}>
              <Trash2 className="h-4 w-4" />
            
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const drawerTitle = drawerMode === "create" ? "Create LDT Order" : drawerMode === "edit" ? "Edit LDT Order" : "View LDT Order";
  const isReadOnly = drawerMode === "view";

  return (
    <div className="space-y-4">
      <div className="space-y-4 p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-5">
          <label className="space-y-1 mt-1 text-xs font-medium text-muted-foreground">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search LDT orders..." aria-label="Search LDT orders" />
          </label>
          <SelectFilter label="" value={priority} onChange={setPriority} options={["All Priority", ...priorityOptions]} />
          <SelectFilter label="" value={status} onChange={setStatus} options={["All Status", ...statusOptions]} />
          <label className="space-y-1 mt-1 text-xs font-medium text-muted-foreground">
            <Input type="date" value={dateRange} onChange={(event) => setDateRange(event.target.value)} />
          </label>
          <Button className="sm:ml-auto mt-1" onClick={openCreateDrawer}>
            <Plus className="h-4 w-4" />
            Create LDT Order
          </Button>
        </div>

        <div className="flex justify-end">
        </div>

        {filteredOrders.length ? (
          <DataTable data={filteredOrders} columns={columns} />
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface-muted p-6 text-center">
            <SearchX className="mb-3 h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">No LDT Orders Found</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create your first LDT order.</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={openCreateDrawer}>
              <Plus className="h-4 w-4" />
              Create LDT Order
            </Button>
          </div>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingOrder(null);
        }}
        title={drawerTitle}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDrawerOpen(false)}>
              Close
            </Button>
            {!isReadOnly ? (
              <Button type="button" onClick={handleSave}>
                Save
              </Button>
            ) : null}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>LDT Type</span>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.ldtType}
                disabled={isReadOnly}
                onChange={(event) => setDraft((current) => ({ ...current, ldtType: event.target.value }))}
              >
                {LDT_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Priority </span>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.priority}
                disabled={isReadOnly}
                onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value as LdtOrderPriority }))}
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
              <span>Reason / Indication </span>
              <Input
                value={draft.reason}
                disabled={isReadOnly}
                onChange={(event) => setDraft((current) => ({ ...current, reason: event.target.value }))}
                placeholder="Enter reason or indication"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground sm:col-span-2">
              <span>Clinical Notes</span>
              <textarea
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
                value={draft.clinicalNotes}
                disabled={isReadOnly}
                onChange={(event) => setDraft((current) => ({ ...current, clinicalNotes: event.target.value }))}
                placeholder="Add clinical notes"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>LDT Name</span>
              <Input
                value={draft.ldtName}
                disabled={isReadOnly}
                onChange={(event) => setDraft((current) => ({ ...current, ldtName: event.target.value }))}
                placeholder="Enter LDT name"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Order Date</span>
              <Input type="date" value={draft.orderDate} disabled={isReadOnly} onChange={(event) => setDraft((current) => ({ ...current, orderDate: event.target.value }))} />
            </label>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete LDT order"
        description={`Are you sure you want to delete ${deleteTarget?.orderNo ?? "this LDT order"}?`}
        confirmLabel="Delete"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (deleteTarget) {
            setOrders((current) => current.filter((order) => order.id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

function SelectFilter<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (value: T) => void; options: readonly T[] }) {
  return (
    <label className="space-y-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
