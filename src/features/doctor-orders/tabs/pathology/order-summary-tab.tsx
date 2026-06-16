"use client";

import { ArrowLeftRight, Pencil, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { PathologySummaryRow } from "./types";

type SummarySortKey = keyof Pick<PathologySummaryRow, "name" | "loinc" | "cpt" | "specialty" | "specimen" | "priority">;

export function PathologyOrderSummaryTab({
  rows,
  selectedCount,
  billingNote,
  sort,
  onSort,
  onSave,
  onAddToBill,
  onSaveAndBill,
  onEdit,
  onDelete,
  onViewAll,
  onBackToTestOrder,
}: {
  rows: PathologySummaryRow[];
  selectedCount: number;
  billingNote: string;
  sort: { key: SummarySortKey; direction: "asc" | "desc" };
  onSort: (key: SummarySortKey) => void;
  onSave: () => void;
  onAddToBill: () => void;
  onSaveAndBill: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewAll: () => void;
  onBackToTestOrder: () => void;
}) {
  const headers: Array<{ key: SummarySortKey; label: string }> = [
    { key: "name", label: "Test name" },
    { key: "loinc", label: "LOINC code" },
    { key: "cpt", label: "CPT code" },
    { key: "specialty", label: "Speciality" },
    { key: "specimen", label: "Specimen" },
    { key: "priority", label: "Priority" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">ORDER SUMMARY</div>
              <div className="mt-1 text-xs text-muted-foreground">{selectedCount} selected tests ready for save.</div>
            </div>
            <Badge tone="info">PATHOLOGY</Badge>
          </div>

          <div className="rounded-md border border-border bg-surface-muted p-3 text-sm text-muted-foreground">{billingNote}</div>

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-[1200px] w-full border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  {headers.map((header) => (
                    <th key={header.key} className="px-4 py-3">
                      <button type="button" className="inline-flex items-center gap-2" onClick={() => onSort(header.key)}>
                        {header.label}
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ordered By</th>
                  <th className="px-4 py-3">Order Date Time</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.loinc}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.cpt}</td>
                    <td className="px-4 py-3">{row.specialty}</td>
                    <td className="px-4 py-3">{row.specimen}</td>
                    <td className="px-4 py-3">
                      <Badge tone={row.priority === "Urgent" || row.priority === "STAT" ? "warning" : "default"}>{row.priority}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={row.status === "Cancelled" ? "danger" : row.status === "Released" || row.status === "Verified" ? "success" : row.status === "Processing" ? "warning" : "info"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{row.orderedBy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.orderDateTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(row.id)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="text-danger" onClick={() => onDelete(row.id)}>
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* <Button type="button" variant="outline" onClick={onBackToTestOrder}>
              Edit order
            </Button> */}
            {/* <Button type="button" variant="outline" onClick={onViewAll}>
              View all summary
            </Button> */}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button type="button" onClick={onSave}>
                <Save className="h-4 w-4" />
                Save
              </Button>
              {/* <Button type="button" variant="outline" onClick={onAddToBill}>
                Add to bill
              </Button>
              <Button type="button" onClick={onSaveAndBill}>
                Save & add to bill
              </Button> */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
