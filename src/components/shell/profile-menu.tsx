"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BadgeCheck, Building2, Clock3, LogOut, Settings2, ShieldCheck, Stethoscope, UserCircle } from "lucide-react";
import Link from "next/link";

import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { hospitalContext, users } from "@/data/mock";
import { getRoleDisplayName } from "@/lib/role-display";

export function ProfileMenu() {
  const { role } = useRole();
  const roleDisplayName = getRoleDisplayName(role);
  const matchedUser = users.find((item) => item.role === role);
  const baseUser = matchedUser ?? {
    name: "Plasmit User",
    department: hospitalContext.department,
    status: "Active",
  };
  const user = role === "Doctor IPD"
    ? {
      name: "Dr. Vivek Bindra",
      department: "Critical Care & Internal Medicine",
      status: "Active",
      designation: "Consultant Intensivist",
      registration: "MCI-DR-20486",
      patientLoad: "18 IPD patients",
    }
    : role === "ICU"
      ? {
        name: "ICU Admin",
        department: "Critical Care Operations",
        status: "Active",
        designation: "ICU Admin Role",
        registration: hospitalContext.code,
        patientLoad: "6 ICU beds visible",
      }
      : {
        ...baseUser,
        designation: role,
        registration: hospitalContext.code,
        patientLoad: "Workspace active",
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
        <DropdownMenu.Content align="end" className="z-[80] w-80 rounded-xl border border-border bg-white p-2 shadow-soft">
          <div className="rounded-lg border border-primary/15 bg-gradient-to-br from-primary/10 via-white to-surface-muted px-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-white shadow-sm">
                {role === "Doctor IPD" ? "VB" : role === "ICU" ? "ICU" : <UserCircle className="h-6 w-6" />}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-black text-foreground">{user.name}</div>
                <div className="mt-0.5 flex items-center gap-1 truncate text-xs font-bold text-primary">
                  <Stethoscope className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.designation}</span>
                </div>
                <div className="mt-1 text-[11px] font-semibold text-muted-foreground">{roleDisplayName} workspace</div>
              </div>
            </div>
          </div>
          <div className="grid gap-2 px-2 py-3 text-xs">
            <div className="rounded-lg border border-border bg-white px-3 py-2">
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-muted-foreground">Department</div>
                  <div className="truncate font-bold text-foreground">{user.department}</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
                <div className="font-semibold text-muted-foreground">Branch</div>
                <div className="mt-1 truncate font-bold text-foreground">{hospitalContext.branch}</div>
              </div>
              <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
                <div className="font-semibold text-muted-foreground">Registration</div>
                <div className="mt-1 truncate font-bold text-foreground">{user.registration}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
                <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Shift
                </div>
                <div className="mt-1 truncate font-bold text-foreground">{hospitalContext.shift}</div>
              </div>
              <div className="rounded-lg border border-success/25 bg-success/10 px-3 py-2">
                <div className="flex items-center gap-1.5 font-semibold text-success">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Status
                </div>
                <div className="mt-1 truncate font-bold text-success">{user.status}</div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2">
              <span className="font-semibold text-muted-foreground">Today's responsibility</span>
              <span className="font-black text-foreground">{user.patientLoad}</span>
            </div>
          </div>
          <DropdownMenu.Separator className="h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-foreground outline-none hover:bg-surface-muted focus:bg-surface-muted"
              href="/settings/ui"
              prefetch={false}
            >
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              Preferences
            </Link>
          </DropdownMenu.Item>
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Protected {roleDisplayName} session
          </div>
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
