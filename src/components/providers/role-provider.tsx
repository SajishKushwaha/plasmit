"use client";

import * as React from "react";

import { roles } from "@/config/app-roles";
import type { Role } from "@/types";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  roles: Role[];
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

const DEFAULT_ROLE: Role = "Hospital Admin";
const roleChangeEvent = "plasmit-role-change";

function readStoredRole(): Role {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const saved = window.localStorage.getItem("plasmit-role");
  if (saved === "Doctor") return "Doctor OPD";
  return saved && roles.includes(saved as Role) ? (saved as Role) : DEFAULT_ROLE;
}

function subscribeRole(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", callback);
  window.addEventListener(roleChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(roleChangeEvent, callback);
  };
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const role = React.useSyncExternalStore(subscribeRole, readStoredRole, () => DEFAULT_ROLE);

  const setRole = React.useCallback((nextRole: Role) => {
    window.localStorage.setItem("plasmit-role", nextRole);
    window.dispatchEvent(new Event(roleChangeEvent));
  }, []);

  const value = React.useMemo(
    () => ({ role, setRole, roles }),
    [role, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used inside RoleProvider");
  }
  return context;
}
