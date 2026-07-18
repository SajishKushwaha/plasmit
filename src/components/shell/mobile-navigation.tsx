"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Menu, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/components/providers/role-provider";
import {
  collectNavigationHrefs,
  normalizeNavigationHref,
} from "@/components/shell/navigation-prefetch";
import { roleRoutes } from "@/config/roles";
import { getNavigationItemsForRole } from "@/data/navigation";
import { getRoleDisplayName } from "@/lib/role-display";
import { cn } from "@/lib/utils";
import type { NavigationChildItem } from "@/types";

function routeSearchMatches(routeSearch: string, currentSearch: string) {
  if (!routeSearch) return true;
  const routeParams = new URLSearchParams(routeSearch);
  const currentParams = new URLSearchParams(currentSearch);
  return Array.from(routeParams.entries()).every(
    ([key, value]) => currentParams.get(key) === value,
  );
}

function routeIsActive(route: string, pathname: string, currentSearch = "") {
  const [routePath = "/"] = route.split("#");
  const [routePathname = "/", routeSearch = ""] = routePath.split("?");
  return pathname === routePathname && routeSearchMatches(routeSearch, currentSearch);
}

function childIsActive(child: NavigationChildItem, pathname: string, currentSearch = ""): boolean {
  return (
    routeIsActive(child.route, pathname, currentSearch) ||
    (child.children?.some((nestedChild) => childIsActive(nestedChild, pathname, currentSearch)) ??
      false)
  );
}

function getDashboard1PoctMode(child: NavigationChildItem) {
  if (child.id === "poct-add") return "add";
  if (child.id === "poct-results") return "results";
  return null;
}

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const edgeSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { role, roles, setRole } = useRole();
  const roleDisplayName = getRoleDisplayName(role);
  const homeRoute = roleRoutes[role] ?? "/dashboard";
  const visibleItems = useMemo(() => getNavigationItemsForRole(role), [role]);
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));
  const currentSearch = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const warmRoute = useCallback(
    (route: string) => {
      const href = normalizeNavigationHref(route);
      if (!href || href === pathname) return;
      router.prefetch(href);
      void fetch(href, { cache: "force-cache" }).catch(() => undefined);
    },
    [pathname, router],
  );
  const prefetchRoutes = useMemo(
    () =>
      collectNavigationHrefs(visibleItems, role === "Doctor IPD" ? 6 : 8).filter(
        (href) => href !== pathname,
      ),
    [pathname, role, visibleItems],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      prefetchRoutes.forEach(warmRoute);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [prefetchRoutes, warmRoute]);

  useEffect(() => {
    const edgeWidth = 24;
    const openDistance = 64;
    const maxVerticalDrift = 48;

    const handleTouchStart = (event: TouchEvent) => {
      if (open || window.innerWidth >= 1024) return;
      const touch = event.touches[0];
      if (!touch || touch.clientX > edgeWidth) {
        edgeSwipeStartRef.current = null;
        return;
      }
      edgeSwipeStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const start = edgeSwipeStartRef.current;
      const touch = event.touches[0];
      if (!start || !touch) return;

      const deltaX = touch.clientX - start.x;
      const deltaY = Math.abs(touch.clientY - start.y);
      if (deltaX > openDistance && deltaY < maxVerticalDrift) {
        setOpen(true);
        edgeSwipeStartRef.current = null;
      } else if (deltaY > maxVerticalDrift) {
        edgeSwipeStartRef.current = null;
      }
    };

    const resetSwipe = () => {
      edgeSwipeStartRef.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", resetSwipe, { passive: true });
    window.addEventListener("touchcancel", resetSwipe, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", resetSwipe);
      window.removeEventListener("touchcancel", resetSwipe);
    };
  }, [open]);

  const renderChildItem = (child: NavigationChildItem, depth = 0) => {
    const hasNestedChildren = Boolean(child.children?.length);
    const active = childIsActive(child, pathname, currentSearch);
    const expanded = openItems[child.id] ?? active;
    const poctMode = getDashboard1PoctMode(child);

    if (hasNestedChildren) {
      return (
        <div key={child.id}>
          <button
            className={cn(
              "flex min-h-9 w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium outline-none transition hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25",
              active && "bg-sidebar-active/80 text-sidebar-active-foreground",
              depth > 0 && "text-[11px]",
            )}
            onClick={() => setOpenItems((current) => ({ ...current, [child.id]: !expanded }))}
            type="button"
          >
            <span className="min-w-0 flex-1 truncate text-left">{child.label}</span>
            <ChevronDown
              className={cn("h-3.5 w-3.5 shrink-0 transition", expanded && "rotate-180")}
            />
          </button>
          {expanded ? (
            <div
              className={cn(
                "mt-1 space-y-1 border-l border-sidebar-foreground/15 pl-2",
                depth === 0 ? "ml-3" : "ml-2",
              )}
            >
              {child.children?.map((nestedChild) => renderChildItem(nestedChild, depth + 1))}
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <Link
        className={cn(
          "flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium outline-none transition hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25",
          active && "bg-sidebar-active/80 text-sidebar-active-foreground",
          depth > 0 && "text-[11px]",
        )}
        href={child.route}
        key={child.id}
        onFocus={() => warmRoute(child.route)}
        onMouseEnter={() => warmRoute(child.route)}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          if (poctMode && pathname.startsWith("/doctor-ipd/patients/")) {
            event.preventDefault();
            window.dispatchEvent(
              new CustomEvent("plasmit-doctor-ipd-poct-mode", { detail: { mode: poctMode } }),
            );
          }
          setOpen(false);
        }}
      >
        <span className="min-w-0 flex-1 truncate">{child.label}</span>
        {child.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
      </Link>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className="lg:hidden" size="icon" variant="outline" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="mobile-drawer-overlay fixed inset-0 z-[80] bg-black/35" />
        <Dialog.Content
          className="mobile-drawer-content fixed left-0 top-0 z-[90] flex h-[100dvh] max-h-[100dvh] w-[min(88vw,360px)] flex-col overflow-hidden overscroll-none border-r border-border bg-sidebar text-sidebar-foreground shadow-soft outline-none"
          onPointerDownOutside={() => setRoleOpen(false)}
        >
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-3">
            <Dialog.Title className="sr-only">Plasmit Hospital navigation</Dialog.Title>
            <Dialog.Description className="sr-only">Mobile navigation</Dialog.Description>
            <Link
              aria-label={`${roleDisplayName} home dashboard`}
              href={homeRoute}
              onClick={() => setOpen(false)}
            >
              <Image
                src="/plasmit-sidebar-logo.webp"
                alt="Plasmit Healthcare IT Vector"
                width={210}
                height={85}
                priority
                className="h-auto w-[190px] object-contain"
              />
            </Link>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          {roles.length > 1 ? (
            <div className="relative shrink-0 border-b border-border p-3">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/55">
                Select role
              </div>
              <button
                className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-sidebar px-3 text-sm font-medium text-sidebar-foreground outline-none hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25"
                onClick={() => setRoleOpen((value) => !value)}
                type="button"
              >
                <span className="truncate">{roleDisplayName}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition",
                    roleOpen && "rotate-180",
                  )}
                />
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
                        router.push(roleRoutes[item] ?? "/dashboard");
                        setRoleOpen(false);
                        setOpen(false);
                      }}
                      type="button"
                    >
                      <span className="truncate">{getRoleDisplayName(item)}</span>
                      {item === role ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <nav
            className="min-h-0 flex-1 touch-pan-y scroll-pb-6 overflow-y-auto overscroll-y-none p-2 pb-6 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
            onScroll={() => setRoleOpen(false)}
          >
            {groups.map((group) => (
              <div className="mb-3" key={group}>
                <div className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sidebar-foreground/55">
                  {group}
                </div>
                <div className="space-y-1">
                  {visibleItems
                    .filter((item) => item.group === group)
                    .map((item) => {
                      const Icon = item.icon;
                      const hasChildren = Boolean(item.children?.length);
                      const childActive =
                        item.children?.some((child) =>
                          childIsActive(child, pathname, currentSearch),
                        ) ?? false;
                      const moreSpecificRouteActive = visibleItems.some(
                        (candidate) =>
                          candidate.id !== item.id &&
                          candidate.route.startsWith(`${item.route}/`) &&
                          (routeIsActive(candidate.route, pathname, currentSearch) ||
                            pathname.startsWith(`${candidate.route.split("?")[0]}/`)),
                      );
                      const active =
                        routeIsActive(item.route, pathname, currentSearch) ||
                        childActive ||
                        (!moreSpecificRouteActive &&
                          item.route !== "/dashboard" &&
                          pathname.startsWith(`${item.route.split("?")[0]}/`));
                      const expanded = openItems[item.id] ?? active;

                      if (hasChildren) {
                        return (
                          <div key={item.id}>
                            <button
                              className={cn(
                                "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium outline-none transition hover:bg-sidebar-active/10 focus-visible:ring-2 focus-visible:ring-ring/25",
                                active && "bg-sidebar-active text-sidebar-active-foreground",
                              )}
                              onClick={() =>
                                setOpenItems((current) => ({ ...current, [item.id]: !expanded }))
                              }
                              type="button"
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="min-w-0 flex-1 truncate text-left">
                                {item.label}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 transition",
                                  expanded && "rotate-180",
                                )}
                              />
                            </button>
                            {expanded ? (
                              <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-foreground/15 pl-2">
                                {item.children?.map((child) => renderChildItem(child))}
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
                          onFocus={() => warmRoute(item.route)}
                          onMouseEnter={() => warmRoute(item.route)}
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
