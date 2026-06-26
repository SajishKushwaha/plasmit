"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";

import type { RadiologySummaryRow } from "./types";

type SummarySortKey = keyof Pick<RadiologySummaryRow, "selectedTests" | "loincCode" | "category" | "specification" | "priority" | "status" | "orderDateTime">;

export function RadiologyOrderSummaryTab({
  rows,
  billingNote: _billingNote = "",
  sort,
  onSort,
  onSave,
  onAddToBill,
  onSaveAndBill,
  onEdit,
  onDelete,
}: {
  rows: RadiologySummaryRow[];
  billingNote?: string;
  sort: { key: SummarySortKey; direction: "asc" | "desc" };
  onSort: (key: SummarySortKey) => void;
  onSave: () => void;
  onAddToBill: () => void;
  onSaveAndBill: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const columns = React.useMemo<ColumnDef<RadiologySummaryRow>[]>(
    () => [
      { accessorKey: "selectedTests", header: "Selected Test" },
      { accessorKey: "loincCode", header: "Code" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "specification", header: "Specification" },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <Badge>{row.original.priority}</Badge>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <Badge tone={row.original.status === "Completed" || row.original.status === "Reviewed" ? "success" : "info"}>{row.original.status}</Badge>,
      },
      { accessorKey: "orderDateTime", header: "Order Date Time" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            {/* <Button type="button" size="sm" variant="outline" onClick={() => onEdit(row.original.id)}>
              <Pencil className="h-4 w-4" />
            </Button> */}
            <Button type="button" size="sm" variant="outline" className="text-danger" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [onDelete, onEdit],
  );

  return (
    <div className="space-y-4">
      <DataTable data={rows} columns={columns} />
      <div className="flex flex-wrap items-center gap-2">
        {/* <div className="text-sm text-muted-foreground">{billingNote}</div> */}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button type="button" onClick={onSave}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button type="button" variant="outline" onClick={onAddToBill}>
            Add to bill
          </Button>
        </div>
      </div>
    </div>
  );
}
