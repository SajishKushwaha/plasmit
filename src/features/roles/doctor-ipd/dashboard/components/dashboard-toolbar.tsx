"use client";

import { FileSpreadsheet, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

export function DashboardToolbar({
  filteredCount,
  onExportExcel,
  onSearchChange,
  search,
}: {
  filteredCount: number;
  onExportExcel: () => void;
  onSearchChange: (_value: string) => void;
  search: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <SearchInput
        aria-label="Search patients"
        className="w-full sm:max-w-md"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search patient, bed, or diagnosis..."
        value={search}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 text-xs font-semibold text-muted-foreground">
          {filteredCount} patient{filteredCount === 1 ? "" : "s"} found
        </div>
        <Button disabled={!filteredCount} onClick={onExportExcel} size="sm" variant="outline">
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </Button>
        <Button onClick={() => window.print()} size="sm" variant="outline">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}
