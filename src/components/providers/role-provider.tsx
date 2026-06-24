"use client";

import * as React from "react";

import { roles as allRoles } from "@/config/app-roles";
import type { Role } from "@/types";

type RoleContextValue = {
  role: Role;
  setRole: (role: Role) => void;
  roles: Role[];
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

const DEFAULT_ROLE: Role = "Hospital Admin";
const DOCTOR_IPD_ROLE: Role = "Doctor IPD";
const accessScopeKey = "plasmit-access-scope";
const roleChangeEvent = "plasmit-role-change";
type AccessScope = "doctor-ipd" | "admin";

function readAccessScope(): AccessScope {
  if (typeof window === "undefined") return "admin";
  return window.localStorage.getItem(accessScopeKey) === "doctor-ipd" ? "doctor-ipd" : "admin";
}

function getAllowedRoles(scope: AccessScope): Role[] {
  return scope === "doctor-ipd" ? [DOCTOR_IPD_ROLE] : allRoles;
}

function readStoredRole(): Role {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const accessScope = readAccessScope();
  if (accessScope === "doctor-ipd") return DOCTOR_IPD_ROLE;

  const saved = window.localStorage.getItem("plasmit-role");
  if (saved === "Doctor") return "Doctor OPD";
  return saved && allRoles.includes(saved as Role) ? (saved as Role) : DEFAULT_ROLE;
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
  const accessScope = React.useSyncExternalStore<AccessScope>(subscribeRole, readAccessScope, () => "admin");
  const allowedRoles = React.useMemo(() => getAllowedRoles(accessScope), [accessScope]);

  const setRole = React.useCallback((nextRole: Role) => {
    const nextAccessScope = readAccessScope();
    window.localStorage.setItem("plasmit-role", nextAccessScope === "doctor-ipd" ? DOCTOR_IPD_ROLE : nextRole);
    window.dispatchEvent(new Event(roleChangeEvent));
  }, []);

  const value = React.useMemo(
    () => ({ role, setRole, roles: allowedRoles }),
    [role, setRole, allowedRoles],
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
