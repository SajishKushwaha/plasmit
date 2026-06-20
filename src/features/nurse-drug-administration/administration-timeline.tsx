"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { medicationTimeSlots, nurseDrugCategories } from "./data";
import type { AdministrationCell, NurseDrugOrder } from "./types";

function capsuleClass(cell?: AdministrationCell) {
  if (!cell || cell.status === "empty") return "bg-surface-muted text-muted-foreground";
  if (cell.status === "overdue") return "bg-danger text-danger-foreground";
  if (cell.status === "bolus") return "bg-primary text-primary-foreground";
  if (cell.status === "infusion") return "bg-success/20 text-success";
  if (cell.status === "administered") return "bg-success text-success-foreground";
  return "bg-warning text-warning-foreground";
}

function getCell(order: NurseDrugOrder, time: string) {
  return order.cells.find((cell) => cell.time === time);
}

function LegendItem({ className, label, meaning }: { className: string; label: string; meaning: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5">
      <span className={["h-3 w-8 rounded-full", className].join(" ")} />
      <span className="font-semibold text-foreground">{label}</span>
      <span className="text-muted-foreground">{meaning}</span>
    </div>
  );
}

function OrderInfo({ order }: { order: NurseDrugOrder }) {
  return (
    <div className="flex h-9 items-center border-r border-border bg-surface px-2 text-xs sm:px-3">
      <div className="truncate font-semibold text-foreground" title={order.name}>{order.name}</div>
    </div>
  );
}

export function AdministrationTimeline({
  orders,
  selectedDate,
  today,
  onDateChange,
  onCellSelect,
}: {
  orders: NurseDrugOrder[];
  selectedDate: string;
  today: string;
  onDateChange: (date: string) => void;
  onCellSelect: (order: NurseDrugOrder, cell?: AdministrationCell) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <CardTitle>Drug Administration Schedule</CardTitle>
          <CardDescription>24 hour MAR grid with 1 hour intervals, dosage visibility, and overdue flagging.</CardDescription>
        </div>
        <label className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
          Date
          <Input className="h-9 w-[160px]" type="date" value={selectedDate} onChange={(event) => onDateChange(event.target.value)} />
          {selectedDate === today ? <Badge tone="info">Today</Badge> : null}
        </label>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex max-w-full gap-2 overflow-x-auto pb-1 text-xs sm:flex-wrap sm:overflow-visible sm:pb-0">
          <LegendItem className="bg-warning" label="Due" meaning="Dose pending" />
          <LegendItem className="bg-success" label="Done" meaning="Dose administered" />
          <LegendItem className="bg-danger" label="Overdue" meaning="Scheduled dose missed by 1 hour" />
          <LegendItem className="bg-success/20" label="Infusion" meaning="Continuous fluid/medicine at ordered rate" />
          <LegendItem className="bg-primary" label="IV bolus" meaning="One-time IV push/flush dose" />
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="max-h-[70vh] max-w-full overflow-auto">
            <table className="w-full min-w-[1680px] border-collapse text-left text-sm sm:min-w-[1900px]">
              <thead className="sticky top-0 z-30 bg-primary text-xs font-semibold text-primary-foreground">
                <tr>
                  <th className="sticky left-0 z-20 w-44 border-b border-r border-primary-foreground/20 bg-primary px-2 py-2 sm:w-64">
                    <div className="flex items-center justify-between gap-2">
                      <span>Date</span>
                      <span>{selectedDate}</span>
                    </div>
                  </th>
                  {medicationTimeSlots.map((slot) => (
                    <th key={slot} className="min-w-16 border-b border-r border-primary-foreground/20 px-2 py-2 text-center last:border-r-0 sm:min-w-20">
                      {slot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nurseDrugCategories.map((category) => {
                  const categoryOrders = orders.filter((order) => order.category === category);
                  return (
                    <tr key={category} className="align-top">
                      <th className="sticky left-0 z-10 w-44 border-b border-r border-border bg-surface px-2 py-1.5 align-top text-xs sm:w-64">
                        <div className="mb-1.5 flex h-7 items-center justify-between gap-2 rounded-md border border-primary/20 bg-primary/10 px-2">
                          <span className="font-semibold text-primary">{category}</span>
                          <Badge tone="muted">{categoryOrders.length}</Badge>
                        </div>
                        {categoryOrders.length ? (
                          <div className="space-y-1.5">
                            {categoryOrders.map((order) => (
                              <OrderInfo key={order.id} order={order} />
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-md border border-dashed border-border p-3 text-muted-foreground">No orders</div>
                        )}
                      </th>
                      <td colSpan={medicationTimeSlots.length} className="border-b border-border p-0">
                        <div className="space-y-1.5 py-1.5">
                          <div className="h-7 border-b border-border/60 bg-surface-muted/45" />
                          {categoryOrders.length ? (
                            categoryOrders.map((order) => (
                              <div key={order.id} className="grid" style={{ gridTemplateColumns: `repeat(${medicationTimeSlots.length}, minmax(4rem, 1fr))` }}>
                                {medicationTimeSlots.map((slot) => {
                                  const cell = getCell(order, slot);
                                  return (
                                    <div
                                      key={`${order.id}-${slot}`}
                                      className="flex h-9 items-center justify-center border-r border-border bg-background px-1 text-center text-xs font-medium last:border-r-0"
                                    >
                                      {cell && (cell.status !== "empty" || cell.label) ? (
                                        <button
                                          type="button"
                                          className={["inline-flex min-h-6 max-w-full items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-ring/20", capsuleClass(cell)].join(" ")}
                                          onClick={() => onCellSelect(order, cell)}
                                          title={cell.status === "overdue" ? "Overdue: not administered within 1 hour" : "Open administration popup"}
                                        >
                                          <span className="line-clamp-2">
                                            {cell.status === "overdue" ? "Overdue" : null}
                                            {cell.status === "overdue" && cell.label ? " " : ""}
                                            {cell.label?.replace("Overdue ", "") ?? (cell.status === "infusion" ? `Infusion ${order.dosage}` : "")}
                                          </span>
                                        </button>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            ))
                          ) : (
                            <div className="grid" style={{ gridTemplateColumns: `repeat(${medicationTimeSlots.length}, minmax(4rem, 1fr))` }}>
                              {medicationTimeSlots.map((slot) => (
                                <div key={slot} className="h-9 border-r border-border bg-background last:border-r-0" />
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}