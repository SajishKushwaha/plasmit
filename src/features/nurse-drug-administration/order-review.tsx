"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { nurseDrugCategories } from "./data";
import type { NurseDrugOrder } from "./types";
type NurseOrderAction = "Receive" | "Discontinue" | "Return" | "Modify";

function remainingQty(order: NurseDrugOrder) {
  return Math.max(order.receivedQty - order.administeredQty, 0);
}

function orderStatus(order: NurseDrugOrder) {
  if (order.receivedQty <= 0) return "Pending";
  if (order.receivedQty < order.orderedQty) return "Partially received";
  return "Received";
}

function ReadOnlyInput({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Input value={String(value)} readOnly className="bg-background font-semibold" />
    </label>
  );
}

function PopupShell({
  open,
  action,
  order,
  onOpenChange,
  children,
  footer,
}: {
  open: boolean;
  action: NurseOrderAction | "Status";
  order: NurseDrugOrder;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-white shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{action}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">{order.name} / {order.category}</Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close popup">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">{children}</div>
          <div className="flex justify-end gap-2 border-t border-border bg-surface p-3">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function OrderActionFields({ action, order, canReceive }: { action: NurseOrderAction | "Status"; order: NurseDrugOrder; canReceive: boolean }) {
  if (action === "Status") {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ReadOnlyInput label="Status" value={orderStatus(order)} />
        <ReadOnlyInput label="Received" value={`${order.receivedQty}/${order.orderedQty}`} />
        <ReadOnlyInput label="Administered" value={`${order.administeredQty}/${order.receivedQty}`} />
        <ReadOnlyInput label="Priority" value={order.priority || "Routine"} />
        <ReadOnlyInput label="Diluent" value={order.diluent || "-"} />
        <ReadOnlyInput label="Bolus route" value={order.bolusRoute || "-"} />
      </div>
    );
  }

  if (action === "Receive") {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-border bg-surface-muted p-3 text-sm">
          Pharmacy dispensed {order.dispensedQty} of {order.orderedQty}. Receive is {canReceive ? "enabled" : "disabled"} for this order.
        </div>
        <Input type="number" min={0} max={Math.max(order.dispensedQty - order.receivedQty, 0)} defaultValue={Math.max(order.dispensedQty - order.receivedQty, 0)} aria-label="Receive quantity" />
      </div>
    );
  }

  if (action === "Discontinue") {
    return (
      <label className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Reason for Discontinuing</span>
        <Input placeholder="Enter reason" defaultValue={order.discontinuedReason ?? ""} />
      </label>
    );
  }

  if (action === "Return") {
    return (
      <div className="grid gap-2 sm:grid-cols-4">
        <ReadOnlyInput label="Received qt" value={order.receivedQty} />
        <ReadOnlyInput label="Adm qt" value={order.administeredQty} />
        <ReadOnlyInput label="Remaining qt" value={remainingQty(order)} />
        <label className="space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Return qt</span>
          <Input type="number" min={0} max={remainingQty(order)} defaultValue={remainingQty(order)} />
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Reason for Modifying</span>
        <Input placeholder="Enter reason" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Start date</span>
          <Input type="date" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">End date</span>
          <Input type="date" />
        </label>
      </div>
    </div>
  );
}

function OrderActionPopup({
  open,
  action,
  order,
  onOpenChange,
}: {
  open: boolean;
  action: NurseOrderAction | "Status" | null;
  order: NurseDrugOrder | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!order || !action) return null;
  const canReceive = order.dispensedQty > order.receivedQty;

  const accept = () => {
    toast.success(`${action} saved for ${order.name}`);
    onOpenChange(false);
  };

  return (
    <PopupShell
      open={open}
      action={action}
      order={order}
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button className="bg-danger" onClick={() => onOpenChange(false)}>Cancel</Button>
          {action === "Status" ? null : (
            <Button onClick={accept} disabled={action === "Receive" && !canReceive}>
              <CheckCircle2 className="h-4 w-4" />
              {action === "Return" ? "Return" : "Accept"}
            </Button>
          )}
        </>
      }
    >
      <OrderActionFields action={action} order={order} canReceive={canReceive} />
    </PopupShell>
  );
}

function CategoryList({
  orders,
  activeCategory,
  onCategoryChange,
}: {
  orders: NurseDrugOrder[];
  activeCategory: NurseDrugOrder["category"];
  onCategoryChange: (category: NurseDrugOrder["category"]) => void;
}) {
  return (
    <Card className="xl:self-start">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Review pharmacy receipt and order actions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        {nurseDrugCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={[
              "flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
              activeCategory === category ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-surface-muted",
            ].join(" ")}
            onClick={() => onCategoryChange(category)}
          >
            <span>{category}</span>
            <span className="text-xs">{orders.filter((order) => order.category === category).length}</span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}

function OrderCard({ order, onAction }: { order: NurseDrugOrder; onAction: (order: NurseDrugOrder, action: NurseOrderAction | "Status") => void }) {
  const status = orderStatus(order);
  const canReceive = order.dispensedQty > order.receivedQty;

  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_150px_320px] lg:items-start">
        <div className="min-w-0 space-y-1">
          <div className="truncate text-sm font-semibold text-foreground">{order.name}</div>
          <div className="text-xs text-muted-foreground">
            {order.form} / {order.dosage || "-"} / {order.frequency || "-"} / {order.days || "-"} days
          </div>
          <div className="text-xs text-muted-foreground">Instructions: {order.instructions || "-"} {order.taperedDose ? `(Tapered dose: ${order.taperedDose})` : ""}</div>
          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <Badge tone="muted">{order.category}</Badge>
            {order.priority ? <Badge tone="info">{order.priority}</Badge> : null}
            {order.diluent ? <Badge tone="muted">{order.diluent}</Badge> : null}
            {order.bolusDose ? <Badge tone="warning">Bolus {order.bolusDose}</Badge> : null}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-muted-foreground">Status</div>
          <button
            type="button"
            title={`Status: ${status}. Received: ${order.receivedQty}/${order.orderedQty}. Administered: ${order.administeredQty}/${order.receivedQty}`}
            onClick={() => onAction(order, "Status")}
          >
            <Badge tone={status === "Received" ? "success" : status === "Partially received" ? "warning" : "muted"}>{status}</Badge>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          <Button type="button" size="sm" variant="outline" disabled={!canReceive} title={canReceive ? `Dispensed pending: ${order.dispensedQty - order.receivedQty}` : "Receive disabled after receiving dispensed drugs"} onClick={() => onAction(order, "Receive")}>Receive</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onAction(order, "Discontinue")}>Discontinue</Button>
          <Button type="button" size="sm" variant="outline" title={`Remaining quantity: ${remainingQty(order)}`} onClick={() => onAction(order, "Return")}>Return</Button>
          <Button type="button" size="sm" variant="outline" onClick={() => onAction(order, "Modify")}>Modify</Button>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({
  activeCategory,
  categoryOrders,
  onAction,
}: {
  activeCategory: NurseDrugOrder["category"];
  categoryOrders: NurseDrugOrder[];
  onAction: (order: NurseDrugOrder, action: NurseOrderAction | "Status") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{activeCategory}</CardTitle>
        <CardDescription>Status opens detail popup. Action buttons open accept popups.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {categoryOrders.length ? (
          categoryOrders.map((order) => <OrderCard key={order.id} order={order} onAction={onAction} />)
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No {activeCategory.toLowerCase()} drug orders found.</div>
        )}
      </CardContent>
    </Card>
  );
}

export function DrugOrderReviewTab({ orders }: { orders: NurseDrugOrder[] }) {
  const [activeCategory, setActiveCategory] = React.useState<NurseDrugOrder["category"]>("SOS");
  const [popupOrder, setPopupOrder] = React.useState<NurseDrugOrder | null>(null);
  const [popupAction, setPopupAction] = React.useState<NurseOrderAction | "Status" | null>(null);
  const categoryOrders = orders.filter((order) => order.category === activeCategory);

  const openPopup = (order: NurseDrugOrder, action: NurseOrderAction | "Status") => {
    setPopupOrder(order);
    setPopupAction(action);
  };

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <CategoryList orders={orders} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
        <OrdersPanel activeCategory={activeCategory} categoryOrders={categoryOrders} onAction={openPopup} />
      </div>
      <OrderActionPopup open={Boolean(popupOrder && popupAction)} action={popupAction} order={popupOrder} onOpenChange={(open) => !open && setPopupOrder(null)} />
    </>
  );
}
