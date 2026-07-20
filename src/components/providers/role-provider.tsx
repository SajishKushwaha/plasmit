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
const UNIT_NURSE_ROLE: Role = "Unit Nurse";
const HEAD_NURSE_ROLE: Role = "Head Nurse";
const WARD_NURSE_ROLE: Role = "Ward Nurse";
const ER_NURSE_ROLE: Role = "ER Nurse";
const RECEPTIONIST_ROLE: Role = "Receptionist";
const accessScopeKey = "plasmit-access-scope";
const roleChangeEvent = "plasmit-role-change";
type AccessScope = "doctor-ipd" | "icu" | "unit-nurse" | "head-nurse" | "ward-nurse" | "er-nurse" | "receptionist" | "admin";

function readAccessScope(): AccessScope {
  if (typeof window === "undefined") return "admin";
  const savedScope = window.localStorage.getItem(accessScopeKey);
  if (savedScope === "receptionlist") return "receptionist";
  if (savedScope === "receptionist") return "receptionist";
  if (
    savedScope === "doctor-ipd" ||
    savedScope === "icu" ||
    savedScope === "unit-nurse" ||
    savedScope === "head-nurse" ||
    savedScope === "ward-nurse" ||
    savedScope === "er-nurse" ||
    savedScope === "receptionist"
  ) return savedScope;
  return "admin";
}

function getAllowedRoles(scope: AccessScope): Role[] {
  if (scope === "doctor-ipd") return [DOCTOR_IPD_ROLE];
  if (scope === "icu") return [ICU_ROLE];
  if (scope === "unit-nurse") return [UNIT_NURSE_ROLE];
  if (scope === "head-nurse") return [HEAD_NURSE_ROLE];
  if (scope === "ward-nurse") return [WARD_NURSE_ROLE];
  if (scope === "er-nurse") return [ER_NURSE_ROLE];
  if (scope === "receptionist") return [RECEPTIONIST_ROLE];
  return allRoles;
}

function readStoredRole(): Role {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  const accessScope = readAccessScope();
  if (accessScope === "doctor-ipd") return DOCTOR_IPD_ROLE;
  if (accessScope === "icu") return ICU_ROLE;
  if (accessScope === "unit-nurse") return UNIT_NURSE_ROLE;
  if (accessScope === "head-nurse") return HEAD_NURSE_ROLE;
  if (accessScope === "ward-nurse") return WARD_NURSE_ROLE;
  if (accessScope === "er-nurse") return ER_NURSE_ROLE;
  if (accessScope === "receptionist") return RECEPTIONIST_ROLE;

  const saved = window.localStorage.getItem("plasmit-role");
  if (saved === "Doctor") return "Doctor OPD";
  if (saved === "Receptionlist") return "Receptionist";
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
    const lockedRole =
      nextAccessScope === "doctor-ipd"
        ? DOCTOR_IPD_ROLE
        : nextAccessScope === "icu"
          ? ICU_ROLE
          : nextAccessScope === "unit-nurse"
            ? UNIT_NURSE_ROLE
            : nextAccessScope === "head-nurse"
              ? HEAD_NURSE_ROLE
              : nextAccessScope === "ward-nurse"
                ? WARD_NURSE_ROLE
                : nextAccessScope === "er-nurse"
                  ? ER_NURSE_ROLE
                  : nextAccessScope === "receptionist"
                    ? RECEPTIONIST_ROLE
                    : nextRole;
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
