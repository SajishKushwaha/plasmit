"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { cn } from "@/lib/utils";

export function RoleSwitcher({ className, portal = true }: { className?: string; portal?: boolean }) {
  const { role, setRole, roles } = useRole();
  const selectableRoles = roles;

  if (selectableRoles.length <= 1) {
    return null;
  }

  const content = (
    <Select.Content className="z-[120] max-h-[min(20rem,60dvh)] overflow-hidden rounded-md border border-border bg-surface shadow-soft">
      <Select.Viewport className="max-h-[min(20rem,60dvh)] touch-pan-y overflow-y-auto p-1 [-webkit-overflow-scrolling:touch]">
        {selectableRoles.map((item) => (
          <Select.Item
            className="cursor-pointer rounded px-2 py-2 text-sm text-foreground outline-none hover:bg-surface-muted focus:bg-surface-muted data-[state=checked]:bg-primary/10"
            key={item}
            value={item}
          >
            <Select.ItemText>{item}</Select.ItemText>
          </Select.Item>
        ))}
      </Select.Viewport>
    </Select.Content>
  );

  return (
    <Select.Root value={role} onValueChange={(value) => setRole(value as typeof role)}>
      <Select.Trigger
        className={cn(
          "flex h-9 w-36 min-w-0 items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none hover:bg-surface-muted focus:ring-2 focus:ring-ring md:w-44",
          className,
        )}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Select.Icon>
      </Select.Trigger>
      {portal ? <Select.Portal>{content}</Select.Portal> : content}
    </Select.Root>
  );
}
