"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";

import type { DrugOrder } from "./types";

export function SelectDrugsCard({
  orders,
  selectedOrders,
  selectedIds,
  search,
  onSearchChange,
  onToggleDrug,
}: {
  orders: DrugOrder[];
  selectedOrders: DrugOrder[];
  selectedIds: string[];
  search: string;
  onSearchChange: (value: string) => void;
  onToggleDrug: (order: DrugOrder, checked: boolean) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const selectedValue = selectedOrders.map((order) => order.name).join(", ");

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const openDropdown = () => {
    setOpen(true);
    onSearchChange("");
  };

  return (
    <Card className="xl:sticky xl:top-4 xl:self-start">
      <CardHeader>
        <div>
          <CardTitle>Select Drugs</CardTitle>
          <CardDescription>Search and tick drugs to add them into the order summary.</CardDescription>
        </div>
        {/* <Badge tone="info">{selectedIds.length} Selected</Badge> */}
      </CardHeader>
      <CardContent className="space-y-3">
        <div ref={rootRef} className="relative">
          <div className="relative">
            <SearchInput
              ref={inputRef}
              className="[&_input]:pr-9"
              value={open ? search : selectedValue}
              onFocus={openDropdown}
              onClick={() => setOpen(true)}
              onChange={(event) => {
                if (!open) setOpen(true);
                onSearchChange(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  inputRef.current?.blur();
                }
              }}
              placeholder={open ? "Search ordered drugs..." : "Select drugs..."}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
              aria-label={open ? "Close drug options" : "Open drug options"}
              onClick={() => {
                if (open) {
                  setOpen(false);
                  inputRef.current?.blur();
                  return;
                }

                openDropdown();
                window.setTimeout(() => inputRef.current?.focus(), 0);
              }}
            >
              <ChevronDown className={["h-4 w-4 transition", open ? "rotate-180" : ""].join(" ")} />
            </button>
          </div>

          {open ? (
            <div className="absolute z-20 mt-2 max-h-[360px] w-full space-y-2 overflow-auto rounded-md border border-border bg-surface p-2 shadow-lg">
              {orders.length ? (
                orders.map((order) => {
                  const checked = selectedIds.includes(order.id);

                  return (
                    <label
                      key={order.id}
                      className={[
                        "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition",
                        checked
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:bg-surface-muted",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-input accent-primary focus:ring-ring"
                        checked={checked}
                        onChange={(event) => onToggleDrug(order, event.target.checked)}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {order.name}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {order.form}
                        </div>
                      </div>
                    </label>
                  );
                })
              ) : (
                <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No drugs match the search.
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* {selectedIds.length ? (
          <div className="space-y-2">
            {selectedOrders.map((order) => {
              return (
                <div key={order.id} className="rounded-md border border-border bg-surface-muted px-3 py-2">
                  <div className="truncate text-sm font-medium text-foreground">{order.name}</div>
                  <div className="text-xs text-muted-foreground">{order.form}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">No drugs selected.</div>
        )} */}
      </CardContent>
    </Card>
  );
}
