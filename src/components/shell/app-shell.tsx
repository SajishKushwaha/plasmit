"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import { useUiPreference } from "@/components/providers/ui-preference-provider";
import { AppFooter } from "@/components/shell/app-footer";
import { TopHeader } from "@/components/shell/top-header";
import { cn } from "@/lib/utils";

const AppSidebar = dynamic(
  () => import("@/components/shell/app-sidebar").then((module) => module.AppSidebar),
  {
    ssr: false,
    loading: () => <div className="hidden h-dvh w-[264px] shrink-0 border-r border-border bg-white lg:fixed lg:left-0 lg:top-0 lg:z-50 lg:block" />,
  },
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { preference, setPreference } = useUiPreference();
  const [collapsed, setCollapsed] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const sidebarCollapsed =
    preference.sidebar === "collapsed" ||
    (preference.sidebar === "auto" && collapsed);

  React.useEffect(() => {
    if (window.localStorage.getItem("hk-general-auth") === "true") {
      setAuthenticated(true);
      setCheckingAuth(false);
      return;
    }

    setCheckingAuth(false);
    router.replace("/login");
  }, [router]);

  const handleCollapsedChange = React.useCallback(
    (nextCollapsed: boolean) => {
      if (preference.sidebar === "auto") {
        setCollapsed(nextCollapsed);
        return;
      }
      setPreference({
        ...preference,
        sidebar: nextCollapsed ? "collapsed" : "expanded",
      });
    },
    [preference, setPreference],
  );

  if (checkingAuth || !authenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#eef7f9] text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#b7e5ea] border-t-[#0b8f9a]" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh max-w-full overflow-x-hidden bg-[#f8f9fc] text-foreground">
      <div className="flex min-h-dvh min-w-0 max-w-full overflow-x-hidden">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={handleCollapsedChange}
        />
        <div
          className={cn(
            "flex min-w-0 max-w-full flex-1 flex-col overflow-x-hidden transition-[margin] duration-200 ease-out",
            sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[264px]",
          )}
        >
          <TopHeader />
          <main className="min-w-0 max-w-full flex-1 overflow-x-hidden px-4 pb-8 md:px-6">
            {children}
          </main>
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
