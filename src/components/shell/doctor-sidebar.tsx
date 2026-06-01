/**
 * Doctor Dashboard Navigation Sidebar - Clinical Version
 * Compact, clinical hospital workflow design
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarClock,
  Stethoscope,
  ClipboardList,
  Users,
  Pill,
  FlaskConical,
  AlertCircle,
  Video,
  MessageSquareText,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/providers/role-provider";

const doctorNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    route: "/doctor-dashboard",
  },
  {
    id: "appointments",
    label: "Appointments",
    icon: CalendarClock,
    route: "/appointments",
  },
  { id: "opd", label: "OPD", icon: Stethoscope, route: "/opd" },
  {
    id: "clinical-exam",
    label: "Clinical Exam",
    icon: ClipboardList,
    route: "/clinical-examination",
  },
  {
    id: "patients",
    label: "Patient Records",
    icon: Users,
    route: "/doctor-dashboard#patients",
  },
  {
    id: "prescriptions",
    label: "Prescriptions",
    icon: Pill,
    route: "/doctor-dashboard#prescriptions",
  },
  {
    id: "lab-reports",
    label: "Lab Reports",
    icon: FlaskConical,
    route: "/doctor-dashboard#lab",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: AlertCircle,
    route: "/emergency",
  },
  {
    id: "telemedicine",
    label: "Telemedicine",
    icon: Video,
    route: "/doctor-dashboard#telemedicine",
  },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquareText,
    route: "/doctor-dashboard#messages",
  },
];

interface DoctorSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function DoctorSidebar({
  collapsed = false,
  onCollapsedChange,
}: DoctorSidebarProps) {
  const pathname = usePathname();
  const { setRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setRole("Hospital Admin");
  };

  const sidebarContent = (
    <div
      className={cn(
        "flex h-full flex-col bg-white border-r border-slate-200 text-slate-900 shadow-sm",
        collapsed ? "w-[68px]" : "w-[240px]",
      )}
    >
      {/* Logo - Compact Clinical */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-slate-200 px-3 py-3",
          collapsed && "justify-center",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-medical-blue-50">
              <Stethoscope className="h-4 w-4 text-medical-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">DR</div>
              <div className="text-[10px] text-slate-500">Clinical</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-medical-blue-50">
            <Stethoscope className="h-4 w-4 text-medical-blue-600" />
          </div>
        )}
      </div>

      {/* Navigation - Compact Clinical Style */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-2">
        {doctorNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.route || pathname.startsWith(item.route);

          return (
            <Link
              key={item.id}
              href={item.route}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "bg-medical-blue-50 text-medical-blue-700 border-l-2 border-medical-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout - Compact */}
      <div className="border-t border-slate-200 space-y-1 px-1.5 py-2">
        <Link
          href="/doctor-dashboard#settings"
          className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Switch</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden h-dvh shrink-0 lg:flex">{sidebarContent}</aside>

      {/* Mobile Toggle */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-40"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        {mobileOpen && <>{sidebarContent}</>}
      </div>
    </>
  );
}
