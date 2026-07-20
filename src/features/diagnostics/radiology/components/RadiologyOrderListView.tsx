"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, FileCheck2, FilePlus2, MonitorUp, Play, Search, Send, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalityBadge } from "@/features/diagnostics/radiology/components/ModalityBadge";
import { PriorityBadge } from "@/features/diagnostics/radiology/components/PriorityBadge";
import { RadiologyFilterBar } from "@/features/diagnostics/radiology/components/RadiologyFilterBar";
import { RadiologyNewOrderDialog } from "@/features/diagnostics/radiology/components/RadiologyNewOrderDialog";
import { RadiologyStatusBadge } from "@/features/diagnostics/radiology/components/RadiologyStatusBadge";
import type { Modality, Patient, RadiologyOrder, RadiologyStatus, RadiologyTest } from "@/features/diagnostics/radiology/types";
import { useRadiologyWorkspace } from "@/features/diagnostics/radiology/hooks/useRadiologyWorkspace";
import { formatDateTime } from "@/features/diagnostics/radiology/utils/formatters";

interface RadiologyOrderListViewProps {
  modalities: Modality[];
  orders: RadiologyOrder[];
  patients: Patient[];
  tests: RadiologyTest[];
}

interface FilterState {
  search: string;
  modalityId: string;
  status: RadiologyStatus | "ALL";
  dateRange: string;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function matchesDateRange(value: string | undefined, dateRange: string) {
  if (!value || dateRange === "ALL" || dateRange === "CUSTOM") {
    return true;
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return true;
  }

  const today = new Date();
  const targetKey = dateKey(target);

  if (dateRange === "TODAY") {
    return targetKey === dateKey(today);
  }

  if (dateRange === "TOMORROW") {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return targetKey === dateKey(tomorrow);
  }

  if (dateRange === "THIS_WEEK") {
    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);
    return target >= new Date(dateKey(today)) && target <= weekFromNow;
  }

  return true;
}

export function RadiologyOrderListView({ modalities, orders, patients, tests }: RadiologyOrderListViewProps) {
  const workspace = useRadiologyWorkspace();
  const allOrders = workspace.orders.length > 0 ? workspace.orders : orders;
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    modalityId: "ALL",
    status: "ALL",
    dateRange: "ALL",
  });

  const filteredOrders = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return allOrders.filter((order) => {
      const patient = patients.find((item) => item.id === order.patientId);
      const orderTests = tests.filter((test) => order.testIds.includes(test.id));
      const searchableText = [
        order.orderNo,
        order.clinicalIndication,
        order.provisionalDiagnosis,
        patient?.name,
        patient?.mrn,
        patient?.phone,
        ...orderTests.map((test) => test.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search.length === 0 || searchableText.includes(search);
      const matchesModality = filters.modalityId === "ALL" || order.modalityId === filters.modalityId;
      const matchesStatus = filters.status === "ALL" || order.status === filters.status;
      const matchesDate = matchesDateRange(order.scheduledAt ?? order.createdAt, filters.dateRange);

      return matchesSearch && matchesModality && matchesStatus && matchesDate;
    });
  }, [allOrders, filters, patients, tests]);

  function renderPrimaryAction(order: RadiologyOrder) {
    if (order.status === "PAYMENT_PENDING") {
      return (
        <Button onClick={() => workspace.actions.clearBilling(order.id)} size="sm" variant="outline">
          Clear Bill
        </Button>
      );
    }

    if (order.status === "PAYMENT_DONE" || order.status === "ORDER_CREATED") {
      return (
        <Button onClick={() => workspace.actions.scheduleOrder(order.id)} size="sm" variant="outline">
          Schedule
        </Button>
      );
    }

    if (order.status === "SCHEDULED") {
      return (
        <Button onClick={() => workspace.actions.checkIn(order.id)} size="sm" variant="outline">
          Check-in
        </Button>
      );
    }

    if (order.status === "PATIENT_ARRIVED" || order.status === "PREPARATION_PENDING") {
      return (
        <Button onClick={() => workspace.actions.completePreparation(order.id)} size="sm" variant="outline">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Prep Done
        </Button>
      );
    }

    if (order.status === "READY_FOR_SCAN") {
      return (
        <Button onClick={() => workspace.actions.startScan(order.id)} size="sm" variant="outline">
          <Play className="h-3.5 w-3.5" />
          Start Scan
        </Button>
      );
    }

    if (order.status === "SCAN_IN_PROGRESS") {
      return (
        <Button onClick={() => workspace.actions.completeScan(order.id)} size="sm" variant="outline">
          Complete Scan
        </Button>
      );
    }

    if (order.status === "SCAN_COMPLETED") {
      return (
        <Button onClick={() => workspace.actions.sendToPacs(order.id)} size="sm" variant="outline">
          <MonitorUp className="h-3.5 w-3.5" />
          Send PACS
        </Button>
      );
    }

    if (["IMAGE_SENT_TO_PACS", "REPORT_PENDING", "REPORT_DRAFTED"].includes(order.status)) {
      return (
        <Button asChild size="sm" variant="outline">
          <Link href="/radiology/reporting">
            <Send className="h-3.5 w-3.5" />
            Report
          </Link>
        </Button>
      );
    }

    if (order.status === "REPORT_VERIFIED") {
      return (
        <Button asChild size="sm" variant="outline">
          <Link href="/radiology/report-verification">
            <FileCheck2 className="h-3.5 w-3.5" />
            Release
          </Link>
        </Button>
      );
    }

    if (order.status === "REPORT_RELEASED") {
      return (
        <Button asChild size="sm" variant="outline">
          <Link href="/radiology/report-delivery">
            <Truck className="h-3.5 w-3.5" />
            Deliver
          </Link>
        </Button>
      );
    }

    return (
      <Button asChild size="sm" variant="outline">
        <Link href={`/radiology/orders/${order.id}`}>
          <Eye className="h-3.5 w-3.5" />
          View
        </Link>
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Radiology Order List</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search by patient, MRN, phone, order number, modality, or status.</p>
        </div>
        <RadiologyNewOrderDialog
          trigger={
            <Button type="button">
              <FilePlus2 className="h-4 w-4" />
              Create Order
            </Button>
          }
        />
      </div>

      <RadiologyFilterBar modalities={modalities} onChange={setFilters} />

      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Study</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredOrders.length === 0 ? (
              <tr>
                <td className="px-4 py-10 text-center text-muted-foreground" colSpan={7}>
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-muted-foreground" />
                    <p className="font-medium text-foreground">No matching orders</p>
                    <p>Change filters or create a new radiology order.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const patient = patients.find((item) => item.id === order.patientId);
                const orderTests = tests.filter((test) => order.testIds.includes(test.id));

                return (
                  <tr className="hover:bg-surface-muted" key={order.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-foreground">{order.orderNo}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{patient?.name ?? order.patientId}</p>
                      <p className="text-xs text-muted-foreground">{patient?.mrn ?? "MRN pending"} · {patient?.location ?? "Location pending"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{orderTests.map((test) => test.name).join(", ")}</p>
                      <div className="mt-1">
                        <ModalityBadge modalityId={order.modalityId} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={order.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <RadiologyStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{order.billingStatus}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {renderPrimaryAction(order)}
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/radiology/orders/${order.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
