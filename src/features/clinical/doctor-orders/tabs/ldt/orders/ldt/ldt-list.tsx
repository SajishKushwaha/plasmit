"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, SearchX, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shell/page-header";
import { SearchInput } from "@/components/ui/search-input";

import { LdtSummaryCards } from "./ldt-summary-cards";
import type { LdtOrder } from "./types";

const initialOrders: LdtOrder[] = [
  {
    id: "ldt-001",
    orderNo: "LDT-9001",
    orderType: "Insert",
    ldtName: "PICC line",
    priority: "Routine",
    orderDate: "2026-06-23 09:15",
    status: "Pending",
    patientName: "Meera Joshi",
    patientId: "UHID-45821",
    doctorName: "Dr. Kavita Rao",
    notes: "Maintain sterile dressing.",
  },
  {
    id: "ldt-002",
    orderNo: "LDT-9002",
    orderType: "Remove",
    ldtName: "Foley catheter",
    priority: "Urgent",
    orderDate: "2026-06-23 10:20",
    status: "Active",
    patientName: "Meera Joshi",
    patientId: "UHID-45821",
    doctorName: "Dr. Kavita Rao",
    notes: "Remove after output review.",
  },
  {
    id: "ldt-003",
    orderNo: "LDT-9003",
    orderType: "Replace",
    ldtName: "Peripheral IV cannula",
    priority: "STAT",
    orderDate: "2026-06-23 11:40",
    status: "Completed",
    patientName: "Meera Joshi",
    patientId: "UHID-45821",
    doctorName: "Dr. Kavita Rao",
    notes: "Replacement completed.",
  },
];

const orderTypeOptions = ["All Types", "Insert", "Remove", "Replace"] as const;
const priorityOptions = ["All Priority", "Routine", "Urgent", "STAT"] as const;
const statusOptions = ["All Status", "Pending", "Active", "Completed", "Cancelled"] as const;

export function LdtListPage() {
  const [search, setSearch] = React.useState("");
  const [orderType, setOrderType] = React.useState<(typeof orderTypeOptions)[number]>("All Types");
  const [priority, setPriority] = React.useState<(typeof priorityOptions)[number]>("All Priority");
  const [status, setStatus] = React.useState<(typeof statusOptions)[number]>("All Status");
  const [dateRange, setDateRange] = React.useState("");
  const [createDrawerOpen, setCreateDrawerOpen] = React.useState(false);

  const filteredOrders = React.useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialOrders.filter((order) => {
      const matchesSearch =
        `${order.orderNo} ${order.orderType} ${order.ldtName} ${order.priority} ${order.orderDate} ${order.status}`
          .toLowerCase()
          .includes(query);
      const matchesType = orderType === "All Types" || order.orderType === orderType;
      const matchesPriority = priority === "All Priority" || order.priority === priority;
      const matchesStatus = status === "All Status" || order.status === status;
      const matchesDate = !dateRange || order.orderDate.slice(0, 10) === dateRange;

      return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesDate;
    });
  }, [dateRange, orderType, priority, search, status]);

  const columns = React.useMemo<ColumnDef<LdtOrder>[]>(
    () => [
      { header: "Order No", accessorKey: "orderNo" },
      { header: "Order Type", accessorKey: "orderType" },
      { header: "LDT Name", accessorKey: "ldtName" },
      {
        header: "Priority",
        cell: ({ row }) => (
          <Badge
            tone={
              row.original.priority === "STAT"
                ? "danger"
                : row.original.priority === "Urgent"
                  ? "warning"
                  : "success"
            }
          >
            {row.original.priority}
          </Badge>
        ),
      },
      { header: "Order Date", accessorKey: "orderDate" },
      {
        header: "Status",
        cell: ({ row }) => (
          <Badge
            tone={
              row.original.status === "Completed"
                ? "success"
                : row.original.status === "Cancelled"
                  ? "danger"
                  : row.original.status === "Active"
                    ? "info"
                    : "warning"
            }
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        header: "Actions",
        cell: () => (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" type="button">
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button size="sm" variant="outline" type="button">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="outline" type="button">
              <XCircle className="h-3.5 w-3.5" />
              Cancel
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="LDT Orders"
        actions={
          <Button onClick={() => setCreateDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Create LDT Order
          </Button>
        }
      />

      <LdtSummaryCards orders={initialOrders} />

      <Card>
        <CardContent className="space-y-4 p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_repeat(4,minmax(160px,1fr))]">
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search LDT orders..."
              aria-label="Search LDT orders"
            />
            <SelectFilter
              label="Order Type"
              value={orderType}
              onChange={(value) => setOrderType(value as (typeof orderTypeOptions)[number])}
              options={orderTypeOptions}
            />
            <SelectFilter
              label="Priority"
              value={priority}
              onChange={(value) => setPriority(value as (typeof priorityOptions)[number])}
              options={priorityOptions}
            />
            <SelectFilter
              label="Status"
              value={status}
              onChange={(value) => setStatus(value as (typeof statusOptions)[number])}
              options={statusOptions}
            />
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Date Range</span>
              <Input
                type="date"
                value={dateRange}
                onChange={(event) => setDateRange(event.target.value)}
              />
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setSearch("");
                setOrderType("All Types");
                setPriority("All Priority");
                setStatus("All Status");
                setDateRange("");
              }}
            >
              Reset Filters
            </Button>
          </div>

          {filteredOrders.length ? (
            <DataTable data={filteredOrders} columns={columns} />
          ) : (
            <EmptyState
              icon={SearchX}
              title="No LDT Orders Found"
              description="Create your first LDT order."
              action="Create LDT Order"
            />
          )}
        </CardContent>
      </Card>

      <Drawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        title="Create LDT Order"
        description="Form implementation will be added in the next task."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setCreateDrawerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setCreateDrawerOpen(false)}>
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg border border-dashed border-border bg-surface-muted p-4">
            LDT order form fields will be added in the next task.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Order Type</span>
              <Input disabled value="Insert" />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Priority</span>
              <Input disabled value="Routine" />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>LDT Name</span>
              <Input disabled value="" placeholder="Coming next task" />
            </label>
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              <span>Order Date</span>
              <Input disabled value="" placeholder="Coming next task" />
            </label>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <label className="space-y-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
