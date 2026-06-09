"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, ClipboardList, LayoutDashboard, LockKeyhole, Settings, UserRoundCheck } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/shell/page-header";
import { cn } from "@/lib/utils";
import type { Role, StatusTone } from "@/types";

export const nursingAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Nurse", "Nurse ICU 2", "Management"];
export const nursingFullAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Nurse", "Nurse ICU 2"];

export function useNursingAccess() {
  const { role } = useRole();
  return {
    role,
    allowed: nursingAccessRoles.includes(role),
    readOnly: !nursingFullAccessRoles.includes(role),
  };
}

export function ProtectedNursing({ children }: { children: (state: { role: Role; readOnly: boolean }) => React.ReactNode }) {
  const access = useNursingAccess();
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="Nursing permission required" description="Your current role cannot access nursing documentation screens." />;
  }
  return (
    <div className="space-y-4">
      {access.readOnly ? (
        <AlertBanner icon={LockKeyhole} tone="warning" title="Read-only nursing access">
          {access.role} can review nursing assessments and care plans in this static preview, but documentation and master configuration actions are disabled.
        </AlertBanner>
      ) : null}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function NursingShell({
  title,
  description,
  children,
  actions,
  showSectionNav = true,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  showSectionNav?: boolean;
}) {
  const pathname = usePathname();

  const buttonLinks = [
    { href: "/nurse", label: "Dashboard", active: pathname === "/nurse", icon: LayoutDashboard },
    { href: "/worklist", label: "Worklist", active: pathname === "/worklist", icon: ClipboardList },
    { href: "/nurse/assessments", label: "Assessment", active: pathname === "/nurse/assessments", icon: ClipboardCheck },
    {
      href: "/nurse/assessments/configuration",
      label: "Assessment configuration",
      active: pathname === "/nurse/assessments/configuration",
      icon: Settings,
    },
    { href: "/nurse/care-plans", label: "Care plan", active: pathname === "/nurse/care-plans", icon: UserRoundCheck },
  ];

  const defaultActions = (
    <>
      {buttonLinks.map((button) => (
        <Button key={button.href} size="sm" variant={button.active ? "default" : "outline"} asChild>
          <Link href={button.href}>
            <button.icon className="h-4 w-4" />
            {button.label}
          </Link>
        </Button>
      ))}
    </>
  );

  return (
    <ProtectedNursing>
      {() => (
        <>
          <PageHeader
            title={title}
            description={description}
            eyebrow="Nurse module"
            actions={showSectionNav ? (actions ? <>{defaultActions}{actions}</> : defaultActions) : actions}
          />
          <div className="space-y-4">{children}</div>
        </>
      )}
    </ProtectedNursing>
  );
}

export function NursingStatus({ status }: { status: string }) {
  let tone: StatusTone = "muted";
  if (["Active", "Achieved", "Completed", "Resolved", "Yes"].includes(status)) tone = "success";
  if (["Pending", "Partially achieved", "Adequate for discharge"].includes(status)) tone = "warning";
  if (["Calculated", "Dropdown", "In progress"].includes(status)) tone = "info";
  return <Badge tone={tone}>{status}</Badge>;
}

export function NursingQuickNav() {
  const pathname = usePathname();
  const items = [
    { label: "Assessments", href: "/nurse/assessments", icon: ClipboardCheck },
    { label: "Worklist", href: "/worklist", icon: ClipboardList },
    { label: "Assessment configuration", href: "/nurse/assessments/configuration", icon: Settings },
    { label: "Care plans", href: "/nurse/care-plans", icon: UserRoundCheck },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link className={cn("rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:bg-surface-muted", active && "border-primary bg-primary text-primary-foreground hover:bg-primary hover:brightness-95")} href={item.href} key={item.href}>
            <Icon className={cn("mb-3 h-5 w-5 text-muted-foreground", active && "text-white")} />
            <div className="text-sm font-semibold">{item.label}</div>
            <div className={cn("mt-1 text-xs text-muted-foreground", active && "text-white/75")}>Open reusable nursing workspace</div>
          </Link>
        );
      })}
    </div>
  );
}

export function NursingPatientStrip() {
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Aarav Sharma</span>
            <Badge tone="muted">UHID PL-20418</Badge>
            <Badge tone="info">IPD-1188</Badge>
            <NursingStatus status="Active" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Orthopedics ward • OW-204 • Consultant Dr. Aman Verma</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FieldLabel({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}
