"use client";

import { useState } from "react";

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

export function RadiologyFilterBar({ modalities, onChange }: RadiologyFilterBarProps) {
  const [values, setValues] = useState<FilterValues>({
    search: "",
    modalityId: "ALL",
    status: "ALL",
    dateRange: "ALL",
  });

  function updateValues(nextValues: Partial<FilterValues>) {
    const mergedValues = { ...values, ...nextValues };
    setValues(mergedValues);
    onChange?.(mergedValues);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
          onChange={(event) => updateValues({ search: event.target.value })}
          placeholder="Search MRN, order, patient, indication"
          value={values.search}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
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
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
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
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
          onChange={(event) => updateValues({ dateRange: event.target.value })}
          value={values.dateRange}
        >
          <option value="ALL">All dates</option>
          <option value="TODAY">Today</option>
          <option value="TOMORROW">Tomorrow</option>
          <option value="THIS_WEEK">This week</option>
          <option value="CUSTOM">Custom range</option>
        </select>
      </div>
    </div>
  );
}
