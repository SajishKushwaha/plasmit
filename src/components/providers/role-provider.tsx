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
const ICU_ROLE: Role = "ICU";
const accessScopeKey = "plasmit-access-scope";
const roleChangeEvent = "plasmit-role-change";
type AccessScope = "doctor-ipd" | "icu" | "admin";

function readAccessScope(): AccessScope {
  if (typeof window === "undefined") return "admin";
  const savedScope = window.localStorage.getItem(accessScopeKey);
  if (savedScope === "doctor-ipd" || savedScope === "icu") return savedScope;
  return "admin";
}

function getAllowedRoles(scope: AccessScope): Role[] {
  if (scope === "doctor-ipd") return [DOCTOR_IPD_ROLE];
  if (scope === "icu") return [ICU_ROLE];
  return allRoles;
}

function readStoredRole(): Role {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const accessScope = readAccessScope();
  if (accessScope === "doctor-ipd") return DOCTOR_IPD_ROLE;
  if (accessScope === "icu") return ICU_ROLE;

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
    const lockedRole = nextAccessScope === "doctor-ipd" ? DOCTOR_IPD_ROLE : nextAccessScope === "icu" ? ICU_ROLE : nextRole;
    window.localStorage.setItem("plasmit-role", lockedRole);
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
