"use client";

import { Building2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

import { useRole } from "@/components/providers/role-provider";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { hospitalContext } from "@/data/mock";
import { cn } from "@/lib/utils";

const CommandSearch = dynamic(
  () => import("@/components/shell/command-search").then((module) => module.CommandSearch),
  {
    ssr: false,
    loading: () => <div className="hidden h-11 min-w-64 rounded-lg border border-border bg-white shadow-sm lg:block" />,
  },
);
const MobileNavigation = dynamic(
  () => import("@/components/shell/mobile-navigation").then((module) => module.MobileNavigation),
  {
    ssr: false,
    loading: () => <div className="h-10 w-10 lg:hidden" />,
  },
);
const ProfileMenu = dynamic(
  () => import("@/components/shell/profile-menu").then((module) => module.ProfileMenu),
  {
    ssr: false,
    loading: () => <div className="h-10 w-10 rounded-lg border border-border bg-white" />,
  },
);

export function TopHeader() {
  const { role } = useRole();
  const isDoctor = role === "Doctor" || role === "Doctor OPD" || role === "Doctor IPD";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-1 border-b border-header-border bg-white/92 px-2 shadow-[0_1px_0_rgba(229,227,236,0.7)] backdrop-blur sm:gap-2 md:px-4">
      <MobileNavigation />
      <div className="min-w-0 flex-1 flex items-center gap-4">
        <Image
          src="/pi med.png"
          alt="Plasmit Healthcare IT Vector"
          width={150}
          height={61}
          priority
          className={cn("h-8 w-[112px] max-w-[34vw] object-contain object-left", !isDoctor && "lg:hidden")}
        />
        <div className="hidden items-center gap-2 text-sm font-bold text-foreground lg:flex">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">{hospitalContext.name}</span>
        </div>
      </div>
     
      <RoleSwitcher className="hidden sm:flex" />
      <ProfileMenu />
    </header>
  );
}
