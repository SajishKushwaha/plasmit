"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function Select({ value, onValueChange, options, ariaLabel, className, disabled }: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly (string | { value: string; label: string })[];
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SelectPrimitive.Root disabled={disabled} onValueChange={onValueChange} value={value}>
      <SelectPrimitive.Trigger aria-label={ariaLabel} className={cn("flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50 disabled:opacity-50", className)}>
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon><ChevronDown className="h-4 w-4 text-slate-400" /></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="z-[70] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl" position="popper" sideOffset={4}>
          <SelectPrimitive.Viewport>
            {options.map((option) => {
              const item = typeof option === "string" ? { value: option, label: option } : option;
              return (
                <SelectPrimitive.Item className="relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm font-medium text-slate-700 outline-none data-[highlighted]:bg-sky-50 data-[highlighted]:text-sky-900" key={item.value} value={item.value}>
                  <SelectPrimitive.ItemIndicator className="absolute left-2"><Check className="h-4 w-4" /></SelectPrimitive.ItemIndicator>
                  <SelectPrimitive.ItemText>{item.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
