"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, ShieldCheck, UserCircle } from "lucide-react";
import Link from "next/link";

import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { hospitalContext, users } from "@/data/mock";

export function ProfileMenu() {
  const { role } = useRole();
  const user = users.find((item) => item.role === role) ?? {
    name: "Plasmit User",
    department: hospitalContext.department,
    status: "Active",
  };

  function handleLogout() {
    window.localStorage.removeItem("hk-general-auth");
    window.localStorage.removeItem("hk-general-remember");
    window.localStorage.removeItem("plasmit-access-scope");
    window.localStorage.removeItem("plasmit-role");
    window.localStorage.removeItem("plasmit-ui-preference-v1");
    window.location.href = "/login";
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="icon" variant="outline" aria-label="Open profile menu">
          <UserCircle className="h-4 w-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className="z-[80] w-72 rounded-xl border border-border bg-white p-2 shadow-soft">
          <div className="border-b border-border px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <UserCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground">{user.name}</div>
                <div className="truncate text-xs font-medium text-muted-foreground">{role}</div>
              </div>
            </div>
          </div>
          <div className="space-y-2 px-3 py-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Department</span>
              <span className="truncate font-medium text-foreground">{user.department}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Branch</span>
              <span className="truncate font-medium text-foreground">{hospitalContext.branch}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Shift</span>
              <span className="truncate font-medium text-foreground">{hospitalContext.shift}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-success">{user.status}</span>
            </div>
          </div>
          <DropdownMenu.Separator className="h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-foreground outline-none hover:bg-surface-muted focus:bg-surface-muted"
              href="/settings/ui"
              prefetch={false}
            >
              <ShieldCheck className="h-4 w-4" />
              UI Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-danger outline-none hover:bg-danger/10 focus:bg-danger/10"
            onSelect={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
