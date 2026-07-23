"use client";

import { FileSpreadsheet, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";

export function DashboardToolbar({
  dashboardView,
  filteredCount,
  onExportExcel,
  onDashboardViewChange,
  onSearchChange,
  search,
}: {
  dashboardView: "dashboard-1" | "dashboard-2";
  filteredCount: number;
  onExportExcel: () => void;
  onDashboardViewChange: (value: "dashboard-1" | "dashboard-2") => void;
  onSearchChange: (value: string) => void;
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
        <label className="sr-only" htmlFor="doctor-ipd-dashboard-view">Dashboard view</label>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-ring/20"
          id="doctor-ipd-dashboard-view"
          onChange={(event) => onDashboardViewChange(event.target.value as "dashboard-1" | "dashboard-2")}
          value={dashboardView}
        >
          <option value="dashboard-1">Dashboard 1</option>
          <option value="dashboard-2">Dashboard 2</option>
        </select>
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
