"use client";

import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { useRole } from "@/components/providers/role-provider";
import {
  canAccessNursingIcuRoute,
  getDefaultNursingIcuRoute,
  getNursingRolePermission,
} from "@/data/icu-nursing-role-permissions";

export function IcuNursingRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useRole();
  const [tab, setTab] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTab(new URLSearchParams(window.location.search).get("tab"));
  }, [pathname]);

  const allowed = canAccessNursingIcuRoute(role, pathname, tab);
  const permission = getNursingRolePermission(role);
  const defaultRoute = getDefaultNursingIcuRoute(role);

  React.useEffect(() => {
    if (!allowed && permission && pathname !== defaultRoute) {
      router.replace(defaultRoute);
    }
  }, [allowed, defaultRoute, pathname, permission, router]);

  if (allowed || !permission) {
    return <>{children}</>;
  }

  return null;
}
