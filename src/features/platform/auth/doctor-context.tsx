/**
 * Doctor Role State & Context Management
 * Manages doctor-specific state, UI preferences, and configuration
 */

"use client";

import * as React from "react";
import { useRole } from "@/components/providers/role-provider";
import {
  doctorAllowedModules,
  doctorBlockedModules,
  doctorPermissions,
} from "@/config/roles";

export type AvailStatus = "Available" | "Busy" | "On Break" | "Off Duty" | "Emergency Call";

export interface WeeklySlot {
  id: string;
  day: string;
  time: string;
  end: string;
  mode: "OPD" | "Video" | "Emergency" | "Follow-up";
  branch: string;
  capacity: number;
  occupied: number;
}

export interface BlockedPeriod {
  id: string;
  dateStr: string;
  start: string;
  end: string;
  reason: string;
  affectedCount: number;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  slots: Omit<WeeklySlot, "id">[];
}

export interface DoctorUIConfig {
  showSidebar: boolean;
  showTopbar: boolean;
  showAdminFeatures: boolean;
  disabledModules: string[];
  allowedFeatures: string[];
}

export interface DoctorContextType {
  isDoctor: boolean;
  canAccessModule: (module: string) => boolean;
  canPerformAction: (action: string) => boolean;
  getDoctorUIConfig: () => DoctorUIConfig;
  getPrimaryDashboard: () => string;

  // Availability management
  availStatus: AvailStatus;
  setAvailStatus: (status: AvailStatus) => void;
  weeklySlots: WeeklySlot[];
  addWeeklySlot: (slot: Omit<WeeklySlot, "id">) => void;
  deleteWeeklySlot: (id: string) => void;
  blockedPeriods: BlockedPeriod[];
  addBlockedPeriod: (block: Omit<BlockedPeriod, "id">) => void;
  deleteBlockedPeriod: (id: string) => void;
  templates: PresetTemplate[];
  saveTemplate: (name: string, description: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
}

const DoctorContext = React.createContext<DoctorContextType | null>(null);

const defaultWeeklySlots: WeeklySlot[] = [
  { id: "slot-1", day: "Mon", time: "08:00", end: "10:30", mode: "OPD", branch: "Apollo OPD", capacity: 18, occupied: 15 },
  { id: "slot-2", day: "Mon", time: "11:00", end: "13:00", mode: "Follow-up", branch: "Apollo OPD", capacity: 12, occupied: 10 },
  { id: "slot-3", day: "Tue", time: "09:00", end: "11:30", mode: "Video", branch: "Digital Clinic", capacity: 10, occupied: 5 },
  { id: "slot-4", day: "Wed", time: "08:30", end: "12:00", mode: "OPD", branch: "North Wing", capacity: 22, occupied: 18 },
  { id: "slot-5", day: "Thu", time: "13:30", end: "15:30", mode: "Emergency", branch: "Apollo OPD", capacity: 8, occupied: 3 },
  { id: "slot-6", day: "Fri", time: "10:00", end: "14:00", mode: "OPD", branch: "Apollo OPD", capacity: 20, occupied: 12 },
];

const defaultTemplates: PresetTemplate[] = [
  {
    id: "temp-default",
    name: "Standard Weekly OPD Layout",
    description: "Regular Monday-Friday morning and afternoon OPD & Video consult slots.",
    slots: [
      { day: "Mon", time: "09:00", end: "13:00", mode: "OPD", branch: "Main Clinic", capacity: 20, occupied: 0 },
      { day: "Wed", time: "09:00", end: "13:00", mode: "OPD", branch: "Main Clinic", capacity: 20, occupied: 0 },
      { day: "Fri", time: "09:00", end: "13:00", mode: "OPD", branch: "Main Clinic", capacity: 20, occupied: 0 },
    ],
  },
];

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readStoredAvailStatus(): AvailStatus {
  if (typeof window === "undefined") return "Available";
  const saved = window.localStorage.getItem("doctor-avail-status") as AvailStatus | null;
  return saved ?? "Available";
}

/**
 * Doctor Provider - Manages doctor-specific context
 */
export function DoctorProvider({ children }: { children: React.ReactNode }) {
  const { role } = useRole();
  const isDoctor = role === "Doctor" || role === "Doctor OPD" || role === "Doctor IPD";

  // Availability Management States
  const [availStatus, setAvailStatusState] = React.useState<AvailStatus>("Available");
  const [weeklySlots, setWeeklySlots] = React.useState<WeeklySlot[]>(defaultWeeklySlots);
  const [blockedPeriods, setBlockedPeriods] = React.useState<BlockedPeriod[]>([]);
  const [templates, setTemplates] = React.useState<PresetTemplate[]>(defaultTemplates);

  React.useEffect(() => {
    queueMicrotask(() => {
      setAvailStatusState(readStoredAvailStatus());
      setWeeklySlots(readStoredJson("doctor-weekly-slots", defaultWeeklySlots));
      setBlockedPeriods(readStoredJson("doctor-blocked-periods", []));
      setTemplates(readStoredJson("doctor-availability-templates", defaultTemplates));
    });
  }, []);

  const setAvailStatus = React.useCallback((status: AvailStatus) => {
    setAvailStatusState(status);
    if (typeof window !== "undefined") {
      localStorage.setItem("doctor-avail-status", status);
      window.dispatchEvent(new Event("doctor-avail-status-change"));
    }
  }, []);

  const addWeeklySlot = React.useCallback((slot: Omit<WeeklySlot, "id">) => {
    setWeeklySlots((prev) => {
      const newSlot: WeeklySlot = {
        ...slot,
        id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updated = [...prev, newSlot];
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-weekly-slots", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deleteWeeklySlot = React.useCallback((id: string) => {
    setWeeklySlots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-weekly-slots", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const addBlockedPeriod = React.useCallback((block: Omit<BlockedPeriod, "id">) => {
    setBlockedPeriods((prev) => {
      const newBlock: BlockedPeriod = {
        ...block,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const updated = [...prev, newBlock];
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-blocked-periods", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const deleteBlockedPeriod = React.useCallback((id: string) => {
    setBlockedPeriods((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-blocked-periods", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const saveTemplate = React.useCallback((name: string, description: string) => {
    setTemplates((prev) => {
      const newTemplate: PresetTemplate = {
        id: `temp-${Date.now()}`,
        name,
        description,
        slots: weeklySlots.map(({ day, time, end, mode, branch, capacity, occupied }) => ({
          day,
          time,
          end,
          mode,
          branch,
          capacity,
          occupied,
        })),
      };
      const updated = [...prev, newTemplate];
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-availability-templates", JSON.stringify(updated));
      }
      return updated;
    });
  }, [weeklySlots]);

  const loadTemplate = React.useCallback((templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const newSlots = template.slots.map((s, idx) => ({
        ...s,
        id: `slot-loaded-${Date.now()}-${idx}`,
      }));
      setWeeklySlots(newSlots);
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-weekly-slots", JSON.stringify(newSlots));
      }
    }
  }, [templates]);

  const deleteTemplate = React.useCallback((templateId: string) => {
    setTemplates((prev) => {
      const updated = prev.filter((t) => t.id !== templateId);
      if (typeof window !== "undefined") {
        localStorage.setItem("doctor-availability-templates", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const canAccessModule = React.useCallback(
    (module: string): boolean => {
      if (!isDoctor) return true; // Non-doctors have full access
      return doctorAllowedModules.some((allowed) => module.startsWith(allowed));
    },
    [isDoctor],
  );

  const canPerformAction = React.useCallback(
    (action: string): boolean => {
      if (!isDoctor) return true; // Admins can perform all actions
      return doctorPermissions.includes(action);
    },
    [isDoctor],
  );

  const getDoctorUIConfig = React.useCallback((): DoctorUIConfig => {
    if (!isDoctor) {
      return {
        showSidebar: true,
        showTopbar: true,
        showAdminFeatures: true,
        disabledModules: [],
        allowedFeatures: [],
      };
    }

    return {
      showSidebar: false, // Doctor dashboard uses standalone layout
      showTopbar: true,
      showAdminFeatures: false, // Hide admin-only buttons/cards
      disabledModules: [...doctorBlockedModules],
      allowedFeatures: [
        "VIEW_DOCTOR_DASHBOARD",
        "MANAGE_APPOINTMENTS",
        "CLINICAL_NOTES",
        "PRESCRIPTIONS",
        "TELEMEDICINE",
        "EMERGENCY_ALERTS",
        "VIEW_PATIENT_RECORDS",
        "REQUEST_LAB_TEST",
        "MANAGE_FOLLOW_UPS",
      ] as const,
    };
  }, [isDoctor]);

  const getPrimaryDashboard = React.useCallback((): string => {
    if (role === "Doctor IPD") return "/doctor-ipd";
    return isDoctor ? "/doctor-dashboard" : "/dashboard";
  }, [isDoctor, role]);

  const value: DoctorContextType = React.useMemo(
    () => ({
      isDoctor,
      canAccessModule,
      canPerformAction,
      getDoctorUIConfig,
      getPrimaryDashboard,
      availStatus,
      setAvailStatus,
      weeklySlots,
      addWeeklySlot,
      deleteWeeklySlot,
      blockedPeriods,
      addBlockedPeriod,
      deleteBlockedPeriod,
      templates,
      saveTemplate,
      loadTemplate,
      deleteTemplate,
    }),
    [
      isDoctor,
      canAccessModule,
      canPerformAction,
      getDoctorUIConfig,
      getPrimaryDashboard,
      availStatus,
      setAvailStatus,
      weeklySlots,
      addWeeklySlot,
      deleteWeeklySlot,
      blockedPeriods,
      addBlockedPeriod,
      deleteBlockedPeriod,
      templates,
      saveTemplate,
      loadTemplate,
      deleteTemplate,
    ],
  );

  return (
    <DoctorContext.Provider value={value}>{children}</DoctorContext.Provider>
  );
}

/**
 * Hook to use doctor context
 */
export function useDoctorContext(): DoctorContextType {
  const context = React.useContext(DoctorContext);
  if (!context) {
    throw new Error("useDoctorContext must be used inside DoctorProvider");
  }
  return context;
}

/**
 * Hook to check if user is doctor
 */
export function useDoctorMode(): boolean {
  const { isDoctor } = useDoctorContext();
  return isDoctor;
}

/**
 * Hook to check module accessibility for doctor
 */
export function useDoctorModuleAccess(module: string): boolean {
  const { canAccessModule } = useDoctorContext();
  return canAccessModule(module);
}

/**
 * Hook to check action permissions for doctor
 */
export function useDoctorActionPermission(action: string): boolean {
  const { canPerformAction } = useDoctorContext();
  return canPerformAction(action);
}

/**
 * Hook to get doctor UI configuration
 */
export function useDoctorUIConfig(): DoctorUIConfig {
  const { getDoctorUIConfig } = useDoctorContext();
  return getDoctorUIConfig();
}

/**
 * Component to conditionally render based on doctor role
 */
export interface ShowForDoctorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ShowForDoctor({ children, fallback }: ShowForDoctorProps) {
  const { isDoctor } = useDoctorContext();
  return isDoctor ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to hide from doctor role
 */
export interface HideFromDoctorProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HideFromDoctor({ children, fallback }: HideFromDoctorProps) {
  const { isDoctor } = useDoctorContext();
  return !isDoctor ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component for admin-only features (with fallback for doctors)
 */
export interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  const { role } = useRole();
  const isAdmin =
    role === "Super Admin" ||
    role === "Hospital Admin" ||
    role === "Management";
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component for doctor-only features
 */
export interface DoctorOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function DoctorOnly({ children, fallback }: DoctorOnlyProps) {
  const { isDoctor } = useDoctorContext();
  return isDoctor ? <>{children}</> : <>{fallback}</>;
}
