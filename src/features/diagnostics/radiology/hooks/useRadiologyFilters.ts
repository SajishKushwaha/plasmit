"use client";

import { useMemo, useState } from "react";

import type { RadiologyOrder, RadiologyStatus } from "@/features/diagnostics/radiology/types";

export interface RadiologyFilterState {
  search: string;
  modalityId: string;
  status: RadiologyStatus | "ALL";
}

export function useRadiologyFilters(orders: RadiologyOrder[]) {
  const [filters, setFilters] = useState<RadiologyFilterState>({
    search: "",
    modalityId: "ALL",
    status: "ALL",
  });

  const filteredOrders = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        order.orderNo.toLowerCase().includes(normalizedSearch) ||
        order.clinicalIndication.toLowerCase().includes(normalizedSearch);
      const matchesModality = filters.modalityId === "ALL" || order.modalityId === filters.modalityId;
      const matchesStatus = filters.status === "ALL" || order.status === filters.status;

      return matchesSearch && matchesModality && matchesStatus;
    });
  }, [filters, orders]);

  return {
    filters,
    filteredOrders,
    setFilters,
  };
}
