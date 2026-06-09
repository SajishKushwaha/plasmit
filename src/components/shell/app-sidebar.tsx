"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRole } from "@/components/providers/role-provider";
import { navigationItems } from "@/data/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar({
  collapsed,
  onCollapsedChange,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const { role } = useRole();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const visibleItems = useMemo(() => {
    const roleItems = navigationItems.filter((item) => item.allowedRoles.includes(role));

    if (role === "Super Admin") {
      return roleItems.filter((item) => ["nursing", "radiology-mnt", "results", "surgery"].includes(item.id));
    }

    if (role === "Nurse") {
      return roleItems.filter((item) => item.id.startsWith("icu-nursing-") || item.id.startsWith("nurse-") || item.id === "radiology-mnt" || item.id === "results");
    }

    if (role === "Nurse ICU") {
      return roleItems.filter((item) => item.id === "nursing-icu");
    }

    if (role === "Nurse ICU 2") {
      const nurseIcu2Modules = new Set(["icu-command-center", "nursing-icu", "worklist", "nursing", "radiology-mnt", "results", "surgery"]);
      return roleItems.filter((item) => nurseIcu2Modules.has(item.id));
    }

    if (role === "Doctor IPD") {
      const workItemIds = new Set([
        "admission",
        "clinical-examination",
        "rapid-review",
        "icu-command-center",
        "intake-output",
        "poct-add",
        "poct-results",
      ]);
      const groupOrder = new Map([
        ["Main", 0],
        ["Doctor", 1],
        ["Work", 2],
        ["Clinical", 3],
        ["Diagnostics", 4],
        ["Radiology", 5],
        ["Platform", 6],
      ]);
      const itemOrder = new Map([
        ["admission", 0],
        ["clinical-examination", 1],
        ["rapid-review", 2],
        ["icu-command-center", 3],
        ["intake-output", 4],
        ["poct-add", 5],
        ["poct-results", 6],
        ["doctor-patients", 0],
        ["ipd", 1],
        ["doctor-live-monitoring", 2],
        ["doctor-ipd-results", 3],
        ["doctor-lab", 4],
        ["doctor-radiology", 5],
        ["doctor-emergency", 6],
      ]);

      return roleItems
        .map((item) => (workItemIds.has(item.id) ? { ...item, group: "Work" } : item))
        .sort((a, b) => {
          const groupDifference = (groupOrder.get(a.group) ?? 100) - (groupOrder.get(b.group) ?? 100);
          if (groupDifference !== 0) return groupDifference;
          return (itemOrder.get(a.id) ?? 100) - (itemOrder.get(b.id) ?? 100);
        });
    }

    return roleItems;
  }, [role]);
  const groups = useMemo(
    () => Array.from(new Set(visibleItems.map((item) => item.group))),
    [visibleItems],
  );

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 border-r border-border bg-white text-sidebar-foreground shadow-[8px_0_28px_rgba(39,37,54,0.04)] transition-all lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-[264px]",
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-20 items-center border-b border-border px-3", collapsed ? "justify-center" : "justify-start")}>
        {collapsed ? (
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <Image
              src="/plasmit-logo-mark.png"
              alt="Plasmit Healthcare IT logo mark"
              width={160}
              height={320}
              priority
              className="h-10 w-10 object-contain"
            />
          </div>
        ) : (
          <Image
            src="/plasmit-sidebar-logo.webp"
            alt="Plasmit Healthcare IT Vector"
            width={220}
            height={89}
            priority
            className="h-auto w-[220px] object-contain"
          />
        )}
      </div>

      {/* Nav */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => (
          <div className="mb-4" key={group}>
            {!collapsed ? (
              <div className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground/55">
                {group}
              </div>
            ) : null}
            <div className="space-y-1">
              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const hasChildren = Boolean(item.children?.length);
                  const [itemPath = "/", itemHash] = item.route.split("#");
                  const itemRoutePath = itemPath || "/";
                  const itemRouteHash = itemHash ? `#${itemHash}` : "";
                  const exactRouteActive =
                    pathname === itemRoutePath &&
                    (itemRouteHash ? currentHash === itemRouteHash : !currentHash);
                  const childActive = item.children?.some((child) => {
                    const [childPath = "/", childHash] = child.route.split("#");
                    const childRouteHash = childHash ? `#${childHash}` : "";
                    return pathname === (childPath || "/") && (childRouteHash ? currentHash === childRouteHash : !currentHash);
                  }) ?? false;
                  const moreSpecificRouteActive = visibleItems.some((candidate) => {
                    if (candidate.id === item.id) return false;
                    const [candidatePath = "/", candidateHash] = candidate.route.split("#");
                    const candidateRoutePath = candidatePath || "/";
                    const candidateRouteHash = candidateHash ? `#${candidateHash}` : "";
                    const candidateMatches =
                      pathname === candidateRoutePath ||
                      (!candidateRouteHash && candidateRoutePath !== "/dashboard" && candidateRoutePath !== "/doctor-dashboard" && pathname.startsWith(`${candidateRoutePath}/`));

                    return (
                      candidateMatches &&
                      (!candidateRouteHash || currentHash === candidateRouteHash) &&
                      candidateRoutePath.startsWith(`${itemRoutePath}/`)
                    );
                  });
                  const active =
                    exactRouteActive ||
                    childActive ||
                    (!moreSpecificRouteActive &&
                      !itemRouteHash &&
                      itemRoutePath !== "/dashboard" &&
                      itemRoutePath !== "/doctor-dashboard" &&
                      pathname.startsWith(`${itemRoutePath}/`));
                  const expanded = openItems[item.id] ?? active;
                  const neuroIcu = item.id === "neuro-icu";

                  if (hasChildren && !collapsed) {
                    return (
                      <div key={item.id}>
                        <button
                          className={cn(
                            "group flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-sm font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
                            active && "bg-gradient-to-r from-[#7367f0] to-[#5b8def] text-sidebar-active-foreground shadow-[0_8px_20px_rgba(115,103,240,0.24)] hover:text-white",
                            neuroIcu && !active && "hover:bg-[linear-gradient(90deg,rgba(79,110,247,0.10),rgba(124,107,255,0.10))] hover:text-[#4F6EF7]",
                            neuroIcu && active && "bg-[linear-gradient(90deg,#4F6EF7,#7C6BFF)] shadow-[0_10px_26px_rgba(79,110,247,0.34),0_0_0_1px_rgba(124,107,255,0.22)]",
                          )}
                          onClick={() => setOpenItems((curr) => ({ ...curr, [item.id]: !expanded }))}
                          type="button"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                          <ChevronDown className={cn("h-4 w-4 shrink-0 transition", expanded && "rotate-180")} />
                        </button>
                        {expanded ? (
                          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-2">
                            {item.children?.map((child) => {
                              const [childPath = "/", childHash] = child.route.split("#");
                              const childRouteHash = childHash ? `#${childHash}` : "";
                              const childIsActive = pathname === (childPath || "/") && (childRouteHash ? currentHash === childRouteHash : !currentHash);
                              return (
                                <Link
                                  className={cn(
                                    "flex min-h-8 items-center rounded-md px-2 py-1.5 text-xs font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
                                    childIsActive && "bg-primary-soft text-primary",
                                  )}
                                  href={child.route}
                                  key={child.id}
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
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        "group flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-semibold outline-none transition hover:bg-primary-soft hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/25",
                        active && "bg-gradient-to-r from-[#7367f0] to-[#5b8def] text-sidebar-active-foreground shadow-[0_8px_20px_rgba(115,103,240,0.24)] hover:text-white",
                        neuroIcu && !active && "hover:bg-[linear-gradient(90deg,rgba(79,110,247,0.10),rgba(124,107,255,0.10))] hover:text-[#4F6EF7]",
                        neuroIcu && active && "bg-[linear-gradient(90deg,#4F6EF7,#7C6BFF)] shadow-[0_10px_26px_rgba(79,110,247,0.34),0_0_0_1px_rgba(124,107,255,0.22)]",
                        collapsed && "justify-center",
                      )}
                      href={item.route}
                      key={item.id}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
                      {!collapsed && item.status === "planned" ? <Badge tone="muted">Plan</Badge> : null}
                      {/* Emergency alert red dot */}
                      {item.id === "doctor-emergency-alerts" && !collapsed ? (
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                      ) : null}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section — same for all roles */}
      <div className="border-t border-border p-2.5">
        <Button
          className={cn("w-full", collapsed && "px-0")}
          onClick={() => onCollapsedChange(!collapsed)}
          variant="ghost"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
