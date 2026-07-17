"use client";

import { ClipboardList, Clock3, FileCheck2, Stethoscope } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";

import type { LdtOrder } from "./types";

export function LdtSummaryCards({ orders }: { orders: LdtOrder[] }) {
  const activeOrders = orders.filter((order) => order.status === "Active").length;
  const pendingOrders = orders.filter((order) => order.status === "Pending").length;
  const completedOrders = orders.filter((order) => order.status === "Completed").length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {/* <StatCard label="Total Orders" value={orders.length} change="All" context="LDT requests" tone="info" icon={ClipboardList} />
      <StatCard label="Active LDT" value={activeOrders} change="Open" context="Currently active" tone={activeOrders ? "warning" : "success"} icon={Stethoscope} />
      <StatCard label="Pending Orders" value={pendingOrders} change="Queued" context="Awaiting action" tone={pendingOrders ? "warning" : "success"} icon={Clock3} />
      <StatCard label="Completed Orders" value={completedOrders} change="Done" context="Closed out" tone="success" icon={FileCheck2} /> */}
    </div>
  );
}
