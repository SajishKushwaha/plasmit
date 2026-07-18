"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, LockKeyhole, Scissors, Search } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { cn } from "@/lib/utils";
import type { Role, StatusTone } from "@/types";

export const surgeryAccessRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Doctor",
  "Nurse",
  "Nurse ICU 2",
  "Receptionist",
  "Management",
];
export const surgeryFullAccessRoles: Role[] = [
  "Super Admin",
  "Hospital Admin",
  "Doctor",
  "Nurse",
  "Nurse ICU 2",
];

export function useSurgeryAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: surgeryAccessRoles.includes(role),
    readOnly: !surgeryFullAccessRoles.includes(role),
  };
}

export function ProtectedSurgery({
  children,
}: {
  children: (_state: { role: Role; readOnly: boolean }) => React.ReactNode;
}) {
  const access = useSurgeryAccess();
  if (!access.allowed) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title="Surgery permission required"
        description="Your current role cannot access surgery scheduling workflows."
      />
    );
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only surgery access">
          {access.role} can review surgery requests and OT schedule in this preview, but edits and
          scheduling actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function SurgeryShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <ProtectedSurgery>
      {() => (
        <>
          <PageHeader
            title={title}
            description={description}
            eyebrow="Surgery module"
            actions={
              <>
                <SurgerySectionNav />
                {actions}
              </>
            }
          />
          <div className="space-y-4">{children}</div>
        </>
      )}
    </ProtectedSurgery>
  );
}

function SurgerySectionNav() {
  const pathname = usePathname();
  const items = [
    { label: "Dashboard", href: "/surgery", icon: Scissors },
    { label: "Waiting list", href: "/surgery/waiting-list", icon: ClipboardList },
    { label: "Schedule", href: "/surgery/schedule", icon: CalendarDays },
    { label: "Global Search", href: "/surgery/global-search", icon: Search },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Button
            className={cn(
              active &&
                "border-primary bg-primary text-primary-foreground hover:bg-primary hover:brightness-95",
            )}
            key={item.href}
            size="sm"
            variant={active ? "outline" : "ghost"}
            asChild
          >
            <Link href={item.href}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

export function surgeryTone(status: string): StatusTone {
  if (["Accepted", "Scheduled", "Completed", "Wheeled out"].includes(status)) return "success";
  if (["Requested", "Wheeled in"].includes(status)) return "warning";
  if (["Stopped"].includes(status)) return "danger";
  if (["Emergency"].includes(status)) return "critical";
  if (["Deferred", "Differed", "In OT"].includes(status)) return "info";
  return "muted";
}

export function SurgeryStatus({ status }: { status: string }) {
  const scheduleClassName =
    status === "Scheduled"
      ? "border-black/70 bg-white text-black"
      : status === "Wheeled in"
        ? "border-black/70 bg-[#fff2cc] text-black"
        : status === "Wheeled out"
          ? "border-black/70 bg-[#d9ead3] text-black"
          : status === "Completed"
            ? "border-black/70 bg-[#6aa84f] text-black"
            : status === "Stopped"
              ? "border-black/70 bg-[#ff3333] text-black"
              : status === "Differed"
                ? "border-black/70 bg-[#ed7d31] text-black"
                : undefined;
  return (
    <Badge className={scheduleClassName} tone={surgeryTone(status)}>
      {status}
    </Badge>
  );
}

export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}
