"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Menu, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/components/providers/role-provider";
import { navigationItems } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { role, roles, setRole } = useRole();
  const roleItems = navigationItems.filter((item) => item.allowedRoles.includes(role));
  const visibleItems =
    role === "Super Admin"
      ? roleItems.filter((item) => item.id === "nursing" || item.id === "surgery")
      : role === "Nurse"
        ? roleItems.filter((item) => item.id.startsWith("icu-nursing-") || item.id.startsWith("nurse-"))
      : role === "Nurse ICU" || role === "Nurse ICU 2"
        ? roleItems.filter((item) => item.id === "nursing-icu")
      : roleItems;
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="lg:hidden" size="icon" variant="outline" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/35" />
        <Dialog.Content className="fixed left-0 top-0 z-[90] flex h-[100dvh] max-h-[100dvh] w-[min(88vw,360px)] flex-col overflow-hidden overscroll-none border-r border-border bg-sidebar text-sidebar-foreground shadow-soft outline-none" onPointerDownOutside={() => setRoleOpen(false)}>
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-3">
            <Dialog.Title className="sr-only">Plasmit Hospital navigation</Dialog.Title>
            <Dialog.Description className="sr-only">Mobile navigation</Dialog.Description>
            <Image
              src="/plasmit-sidebar-logo.webp"
              alt="Plasmit Healthcare IT Vector"
              width={210}
              height={85}
              priority
              className="h-auto w-[190px] object-contain"
            />
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="relative shrink-0 border-b border-border p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/55">Select role</div>
            <button
              className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-sidebar px-3 text-sm font-medium text-sidebar-foreground outline-none hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25"
              onClick={() => setRoleOpen((value) => !value)}
              type="button"
            >
              <span className="truncate">{role}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", roleOpen && "rotate-180")} />
            </button>
            {roleOpen ? (
              <div className="absolute left-3 right-3 top-[calc(100%-10px)] z-[110] max-h-56 touch-pan-y overflow-y-auto rounded-md border border-border bg-white p-1 shadow-soft [-webkit-overflow-scrolling:touch]">
                {roles.map((item) => (
                  <button
                    className={cn(
                      "flex h-10 w-full items-center justify-between rounded px-3 text-left text-sm font-medium text-foreground outline-none hover:bg-surface-muted focus-visible:bg-surface-muted",
                      item === role && "bg-primary/10 text-primary",
                    )}
                    key={item}
                    onClick={() => {
                      setRole(item);
                      setRoleOpen(false);
                    }}
                    type="button"
                  >
                    <span className="truncate">{item}</span>
                    {item === role ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <nav className="min-h-0 flex-1 touch-pan-y scroll-pb-6 overflow-y-auto overscroll-y-none p-2 pb-6 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]" onScroll={() => setRoleOpen(false)}>
            {groups.map((group) => (
              <div className="mb-3" key={group}>
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/55">{group}</div>
                <div className="space-y-1">
                  {visibleItems
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      const hasChildren = Boolean(item.children?.length);
                      const childActive = item.children?.some((child) => pathname === child.route) ?? false;
                      const moreSpecificRouteActive = visibleItems.some((candidate) => (
                        candidate.id !== item.id &&
                        candidate.route.startsWith(`${item.route}/`) &&
                        (pathname === candidate.route || pathname.startsWith(`${candidate.route}/`))
                      ));
                      const active = pathname === item.route || childActive || (!moreSpecificRouteActive && item.route !== "/dashboard" && pathname.startsWith(`${item.route}/`));
                      const expanded = openItems[item.id] ?? active;

                      if (hasChildren) {
                        return (
                          <div key={item.id}>
                            <button
                              className={cn(
                                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25",
                                active && "bg-sidebar-active text-sidebar-active-foreground",
                              )}
                              onClick={() => setOpenItems((current) => ({ ...current, [item.id]: !expanded }))}
                              type="button"
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                              <ChevronDown className={cn("h-4 w-4 shrink-0 transition", expanded && "rotate-180")} />
                            </button>
                            {expanded ? (
                              <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-foreground/15 pl-2">
                                {item.children?.map((child) => {
                                  const childIsActive = pathname === child.route;
                                  return (
                                    <Link
                                      className={cn(
                                        "flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium outline-none transition hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25",
                                        childIsActive && "bg-sidebar-active/80 text-sidebar-active-foreground",
                                      )}
                                      href={child.route}
                                      key={child.id}
                                      onClick={() => setOpen(false)}
                                    >
                                      <span className="min-w-0 flex-1 truncate">{child.label}</span>
                                      {child.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
                                    </Link>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        );
                      }

                      return (
                        <Link
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25",
                            active && "bg-sidebar-active text-sidebar-active-foreground",
                          )}
                          href={item.route}
                          key={item.id}
                          onClick={() => setOpen(false)}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          {item.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
                        </Link>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
