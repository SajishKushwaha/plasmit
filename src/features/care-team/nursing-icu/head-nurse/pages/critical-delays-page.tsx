"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuditControlPage } from "./audit-control-page";

function AuditNav({ active }: { active: string }) {
  const items = [
    { id: "critical-delays", label: "Critical Delays", href: "/nursing-icu/head-nurse/audit-control/critical-delays" },
    { id: "quality", label: "Quality", href: "/nursing-icu/head-nurse/audit-control/quality" },
    { id: "reports", label: "Reports", href: "/nursing-icu/head-nurse/audit-control/reports" },
  ];
  return (
    <nav className="mb-4 flex gap-2" aria-label="Audit control nav">
      {items.map((it) => (
        <Link
          key={it.id}
          href={it.href}
          className={"inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold " + (active === it.id ? "bg-sky-600 text-white" : "border border-slate-200 bg-white text-slate-700")}
        >
          {it.label}
        </Link>
      ))}
    </nav>
  );
}

export default function CriticalDelaysPage() {
  const pathname = usePathname();
  const active = pathname?.endsWith("critical-delays") ? "critical-delays" : "";
  return (
    <div>
      <AuditNav active={active} />
      <AuditControlPage mode="critical-delays" />
    </div>
  );
}
