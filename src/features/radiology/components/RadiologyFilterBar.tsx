"use client";

import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Modality, RadiologyStatus } from "@/features/radiology/types";
import { radiologyStatusLabels, radiologyStatusOrder } from "@/features/radiology/utils/status";

interface FilterValues {
  search: string;
  modalityId: string;
  status: RadiologyStatus | "ALL";
  dateRange: string;
}

interface RadiologyFilterBarProps {
  modalities: Modality[];
  onChange?: (values: FilterValues) => void;
}

const defaultFilterValues: FilterValues = {
  search: "",
  modalityId: "ALL",
  status: "ALL",
  dateRange: "ALL",
};

export function RadiologyFilterBar({ modalities, onChange }: RadiologyFilterBarProps) {
  const [values, setValues] = useState<FilterValues>(defaultFilterValues);

  function updateValues(nextValues: Partial<FilterValues>) {
    const mergedValues = { ...values, ...nextValues };
    setValues(mergedValues);
    onChange?.(mergedValues);
  }

  function resetFilters() {
    const resetValues = { ...defaultFilterValues };
    setValues(resetValues);
    onChange?.(resetValues);
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1.5fr)_repeat(3,minmax(150px,1fr))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            aria-label="Search radiology orders"
            className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            onChange={(event) => updateValues({ search: event.target.value })}
            placeholder="Search patient, MRN, order, or doctor"
            value={values.search}
          />
        </div>
        <select
          aria-label="Filter by modality"
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          onChange={(event) => updateValues({ modalityId: event.target.value })}
          value={values.modalityId}
        >
          <option value="ALL">All modalities</option>
          {modalities.map((modality) => (
            <option key={modality.id} value={modality.id}>
              {modality.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          onChange={(event) => updateValues({ status: event.target.value as RadiologyStatus | "ALL" })}
          value={values.status}
        >
          <option value="ALL">All statuses</option>
          {radiologyStatusOrder.map((status) => (
            <option key={status} value={status}>
              {radiologyStatusLabels[status]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by date"
          className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          onChange={(event) => updateValues({ dateRange: event.target.value })}
          value={values.dateRange}
        >
          <option value="ALL">All dates</option>
          <option value="TODAY">Today</option>
          <option value="TOMORROW">Tomorrow</option>
          <option value="THIS_WEEK">This week</option>
        </select>
        <Button className="h-10" onClick={resetFilters} type="button" variant="outline">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
