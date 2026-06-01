/**
 * Doctor Dashboard Clinical Header
 * Compact clinical summary bar with key operational info
 */

"use client";

import { Bell, AlertCircle, Clock, Users, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/shell/role-switcher";
import { useDoctorContext, type AvailStatus } from "@/features/auth/doctor-context";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

const statusConfig: Record<
  AvailStatus,
  { label: string; dot: string; bg: string; border: string; text: string; desc: string }
> = {
  Available: {
    label: "Available",
    dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse",
    bg: "bg-emerald-50 hover:bg-emerald-100",
    border: "border-emerald-200",
    text: "text-emerald-700",
    desc: "Active and taking OPD / patient consults"
  },
  Busy: {
    label: "Busy",
    dot: "bg-orange-500",
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-200",
    text: "text-orange-700",
    desc: "Currently occupied with a patient or task"
  },
  "On Break": {
    label: "On Break",
    dot: "bg-amber-400",
    bg: "bg-amber-50 hover:bg-amber-100",
    border: "border-amber-200",
    text: "text-amber-700",
    desc: "Temporary break, returning shortly"
  },
  "Off Duty": {
    label: "Off Duty",
    dot: "bg-slate-400",
    bg: "bg-slate-50 hover:bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-700",
    desc: "Shift finished, not booking appointments"
  },
  "Emergency Call": {
    label: "Emergency",
    dot: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-ping",
    bg: "bg-red-50 hover:bg-red-100",
    border: "border-red-200",
    text: "text-red-700 font-bold",
    desc: "Attending emergency clinical escalation"
  },
};

export function DoctorTopHeader() {
  const { availStatus, setAvailStatus } = useDoctorContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStatusChange = (status: AvailStatus) => {
    setAvailStatus(status);
    setDropdownOpen(false);
    toast.success(`Status updated to ${statusConfig[status].label}`, {
      description: statusConfig[status].desc,
    });
  };

  const currentCfg = statusConfig[availStatus] || statusConfig.Available;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
        {/* Clinical Summary - Left */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Doctor Info - Compact */}
          <div className="flex items-center gap-2 text-xs whitespace-nowrap">
            <div className="font-semibold text-slate-900">Dr. Ananya Rao</div>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600">Cardiology</span>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Queue Status - Compact */}
          <div className="flex items-center gap-2 text-xs hidden sm:flex">
            <Users className="h-3.5 w-3.5 text-medical-blue-600" />
            <span className="font-medium text-slate-900">Queue: 8/12</span>
          </div>

          {/* Current Time */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 hidden md:flex">
            <Clock className="h-3.5 w-3.5" />
            <span>08:30 AM</span>
          </div>
        </div>

        {/* Clinical Actions - Right */}
        <div className="flex items-center gap-2">
          {/* Availability Status Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold shadow-xs transition hover:bg-slate-50 cursor-pointer ${currentCfg.bg} ${currentCfg.border} ${currentCfg.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${currentCfg.dot}`} />
              {currentCfg.label === "Emergency Call" ? "Emergency" : currentCfg.label}
              <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 mb-1">
                  Change Clinical Status
                </div>
                <div className="space-y-0.5">
                  {(Object.keys(statusConfig) as AvailStatus[]).map((key) => {
                    const cfg = statusConfig[key];
                    const isSelected = availStatus === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleStatusChange(key)}
                        className={`w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition ${
                          isSelected
                            ? "bg-slate-50 text-slate-900 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className={`h-2 w-2 rounded-full mt-1 shrink-0 ${cfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 font-medium">
                            <span className={cfg.text}>{cfg.label}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-slate-900 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-normal leading-normal">{cfg.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Critical Alert Badge */}
          <Button
            variant="ghost"
            size="sm"
            className="relative gap-1.5 text-xs h-8"
          >
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="hidden sm:inline">1 Critical</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>

          {/* Role Switcher */}
          <RoleSwitcher className="h-8 text-xs w-auto border-slate-200" />
        </div>
      </div>
    </header>
  );
}
