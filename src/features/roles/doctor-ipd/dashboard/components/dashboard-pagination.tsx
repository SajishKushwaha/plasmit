"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DashboardPagination({
  filteredCount,
  firstVisiblePatient,
  lastVisiblePatient,
  onPageChange,
  page,
  totalPages,
}: {
  filteredCount: number;
  firstVisiblePatient: number;
  lastVisiblePatient: number;
  onPageChange: (_page: number) => void;
  page: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <Badge tone="danger">Patient order: red first</Badge>
        <Badge tone="warning">Orange next</Badge>
        <Badge tone="info">Blue stable</Badge>
        <Badge tone="success">Green: stable</Badge>
        <Badge tone="warning">Orange: warning</Badge>
        <Badge tone="danger">Red: urgent</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Showing {firstVisiblePatient}-{lastVisiblePatient} of {filteredCount} | Page {page} of{" "}
          {totalPages}
        </span>
        <Button
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
