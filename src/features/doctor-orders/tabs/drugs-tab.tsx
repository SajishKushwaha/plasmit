"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FieldLabel } from "./drugs/field-controls";
import { initialOrders } from "./drugs/data";
import { OrderDetailsCard } from "./drugs/order-details-card";
import { SelectDrugsCard } from "./drugs/select-drugs-card";
import { SummaryCard } from "./drugs/summary-card";
import type { DrugOrder, OrderDraft } from "./drugs/types";
import { calculateAutoQty, makeDraft, remainingQty } from "./drugs/utils";

function SubmitOrderCard({ count, onSubmit }: { count: number; onSubmit: () => void }) {
  return (
    <Card className="xl:col-start-2">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">Ready to submit</div>
          <div className="mt-1 text-xs text-muted-foreground">{count ? `${count} selected drug order${count > 1 ? "s" : ""} will be submitted.` : "Select drugs before submitting."}</div>
        </div>
        <Button type="button" disabled={!count} onClick={onSubmit}>
          Submit
        </Button>
      </CardContent>
    </Card>
  );
}

function DrugAdministrationView({ orders }: { orders: DrugOrder[] }) {
  const activeOrders = orders.filter((order) => !order.isHistorical || order.modifiedFromId);
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Drug Administration</CardTitle>
          <CardDescription>Modified orders continue here as the same administration workflow.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeOrders.map((order) => (
          <div key={order.id} className="grid gap-2 rounded-md border border-border bg-surface-muted p-3 text-sm md:grid-cols-[1fr_150px_150px_150px]">
            <div className="min-w-0 space-y-1">
              <div className="font-semibold text-foreground">{order.name}</div>
              <div className="text-xs text-muted-foreground">
                {order.form} / {order.dosage || "-"} / {order.frequency || "-"} / {order.days || "-"} days
              </div>
              <div className="text-xs text-muted-foreground">Instructions: {order.instructions || "-"}</div>
            </div>
            <div>
              <FieldLabel>Received</FieldLabel>
              <div className="font-semibold">{order.receivedQty}</div>
            </div>
            <div>
              <FieldLabel>Administered</FieldLabel>
              <div className="font-semibold">{order.administeredQty}</div>
            </div>
            <div>
              <FieldLabel>Remaining</FieldLabel>
              <div className="font-semibold">{remainingQty(order)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DrugsTab() {
  const [orders] = React.useState<DrugOrder[]>(initialOrders);
  const [search, setSearch] = React.useState("");
  const [selectedDrugIds, setSelectedDrugIds] = React.useState<string[]>([]);
  const [drafts, setDrafts] = React.useState<Record<string, OrderDraft>>({});
  const [activeEditorId, setActiveEditorId] = React.useState<string | null>(null);
  const [flashIds, setFlashIds] = React.useState<Record<string, boolean>>({});
  const editorRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const filteredOrders = orders.filter((order) =>
    `${order.name} ${order.form}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const selectableOrders = filteredOrders;
  const selectedOrders = selectedDrugIds.map((id) => orders.find((order) => order.id === id)).filter(Boolean) as DrugOrder[];

  const flashTotalQty = (id: string) => {
    setFlashIds((current) => ({ ...current, [id]: true }));
    window.setTimeout(() => {
      setFlashIds((current) => ({ ...current, [id]: false }));
    }, 700);
  };

  const updateDraft = (id: string, values: Partial<OrderDraft>) => {
    setDrafts((current) => {
      const sourceOrder = orders.find((order) => order.id === id);
      const currentDraft = current[id] ?? (sourceOrder ? makeDraft(sourceOrder) : null);
      if (!currentDraft) return current;

      const nextDraft = { ...currentDraft, ...values };
      if (values.category === "SOS") {
        nextDraft.frequency = "";
      }
      if (values.category === "Continuous") {
        nextDraft.frequency = "Continuous";
      }
      if (values.category === "Unscheduled") {
        nextDraft.frequency = "";
        nextDraft.days = "";
        nextDraft.startDate = "";
        nextDraft.endDate = "";
      }
      if (values.category === "Discontinued") {
        nextDraft.days = "0";
        nextDraft.orderedQty = "0";
      }
      if (values.startDate && nextDraft.endDate && nextDraft.endDate < values.startDate) {
        nextDraft.endDate = "";
      }

      const shouldAutoFill = "frequency" in values || "days" in values || "category" in values;
      if (shouldAutoFill) {
        const nextQty = calculateAutoQty(nextDraft.category, nextDraft.frequency, nextDraft.days);
        const nextQtyValue = nextQty > 0 ? String(nextQty) : "";
        if (nextQtyValue !== nextDraft.orderedQty) {
          nextDraft.orderedQty = nextQtyValue;
          flashTotalQty(id);
        }
      }

      return { ...current, [id]: nextDraft };
    });
  };

  const toggleDrug = (order: DrugOrder, checked: boolean) => {
    if (checked) {
      setSelectedDrugIds((current) => (current.includes(order.id) ? current : [...current, order.id]));
      setDrafts((current) => ({ ...current, [order.id]: current[order.id] ?? makeDraft(order) }));
      setActiveEditorId(order.id);
      return;
    }

    setSelectedDrugIds((current) => current.filter((id) => id !== order.id));
    setActiveEditorId((current) => (current === order.id ? null : current));
  };

  const openSummaryEditor = (id: string) => {
    setActiveEditorId(id);
    window.setTimeout(() => {
      editorRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const deleteSummaryOrder = (id: string) => {
    setSelectedDrugIds((current) => current.filter((drugId) => drugId !== id));
    setActiveEditorId((current) => (current === id ? null : current));
    toast.success("Drug removed from summary");
  };

  const submitOrders = () => {
    toast.success(`${selectedOrders.length} drug order${selectedOrders.length > 1 ? "s" : ""} submitted`);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          <TabsTrigger value="orders" className="min-w-[96px]">
            Drug Orders
          </TabsTrigger>
          <TabsTrigger value="administration" className="min-w-[168px]">
            Drug Administration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <SelectDrugsCard
              orders={selectableOrders}
              selectedOrders={selectedOrders}
              selectedIds={selectedDrugIds}
              search={search}
              onSearchChange={setSearch}
              onToggleDrug={toggleDrug}
            />
            <OrderDetailsCard
              orders={selectedOrders}
              drafts={drafts}
              flashIds={flashIds}
              activeId={activeEditorId}
              panelRef={(id, node) => {
                editorRefs.current[id] = node;
              }}
              onActiveChange={setActiveEditorId}
              onDraftChange={updateDraft}
            />
            <SubmitOrderCard count={selectedOrders.length} onSubmit={submitOrders} />
            <SummaryCard orders={selectedOrders} drafts={drafts} onEdit={openSummaryEditor} onDelete={deleteSummaryOrder} />
          </div>
        </TabsContent>

        <TabsContent value="administration">
          <DrugAdministrationView orders={filteredOrders} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
