"use client";

import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";

import type { LdtOrder } from "./types";

export function LdtDetailsDrawer({ order, open, onOpenChange }: { order: LdtOrder | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={order ? order.orderNo : "LDT Order"} description="LDT order details preview." className="md:w-[720px]">
      {order ? (
        <div className="space-y-3">
          <Row label="Order Type" value={order.orderType} />
          <Row label="LDT Name" value={order.ldtName} />
          <Row label="Priority" value={<Badge tone={order.priority === "STAT" ? "danger" : order.priority === "Urgent" ? "warning" : "success"}>{order.priority}</Badge>} />
          <Row label="Order Date" value={order.orderDate} />
          <Row label="Patient" value={order.ldtName} />
          <Row label="Doctor" value={order.orderNo} />
          <Row label="Status" value={<Badge tone={order.status === "Completed" ? "success" : order.status === "Cancelled" ? "danger" : order.status === "Active" ? "info" : "warning"}>{order.status}</Badge>} />
          <Row label="Notes" value="-" />
        </div>
      ) : null}
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-border py-2 text-sm last:border-0">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="min-w-0 text-foreground">{value}</div>
    </div>
  );
}
