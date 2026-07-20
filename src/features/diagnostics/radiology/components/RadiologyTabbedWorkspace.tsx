"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileCheck2,
  FilePlus2,
  FileText,
  LayoutTemplate,
  ListChecks,
  MonitorUp,
  Printer,
  Settings,
  Truck,
  UserCheck,
  Users,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { RadiologyCreateOrderView } from "@/features/diagnostics/radiology/components/RadiologyCreateOrderView";
import { RadiologyOrderListView } from "@/features/diagnostics/radiology/components/RadiologyOrderListView";
import { RadiologyMastersView, RadiologyReportTemplatesView } from "@/features/diagnostics/radiology/components/RadiologyConfigurationViews";
import {
  RadiologyAnalyticsWorkflowView,
  RadiologyBillingStatusView,
  RadiologyCheckInView,
  RadiologyCriticalAlertsView,
  RadiologyDeliveryWorkflowView,
  RadiologyDashboardView,
  RadiologyPacsStudiesView,
  RadiologyPatientQueueView,
  RadiologyPreparationView,
  RadiologyReportPreviewWorkflowView,
  RadiologyReportingWorkflowView,
  RadiologyScanWorkflowView,
  RadiologySchedulingWorkflowView,
  RadiologyTechnicianWorklistView,
  RadiologyVerificationWorkflowView,
} from "@/features/diagnostics/radiology/components/RadiologyWorkflowViews";
import { radiologyModalities } from "@/features/diagnostics/radiology/data/modalities";
import { radiologyOrders } from "@/features/diagnostics/radiology/data/radiologyOrders";
import { radiologyPatients } from "@/features/diagnostics/radiology/data/patients";
import { radiologyTests } from "@/features/diagnostics/radiology/data/tests";
import { cn } from "@/lib/utils";

type RadiologyTab = {
  id: string;
  label: string;
  role: string;
  summary: string;
  icon: ReactNode;
  content: ReactNode;
};

function RadiologyWorkspaceTabs({
  title,
  description,
  tabs,
}: {
  title: string;
  description: string;
  tabs: RadiologyTab[];
}) {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? "");
  const activeTab = useMemo(() => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0], [activeTabId, tabs]);

  if (!activeTab) {
    return null;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 max-w-4xl text-sm text-muted-foreground">{description}</p>
          </div>
          <Badge tone="info">{tabs.length} tabs</Badge>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          {tabs.map((tab) => {
            const active = tab.id === activeTab.id;

            return (
              <button
                className={cn(
                  "min-h-[76px] rounded-lg border px-3 py-3 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "border-primary bg-primary/5 ring-1 ring-inset ring-primary/20" : "border-border bg-background",
                )}
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md border", active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-surface text-muted-foreground")}>
                    {tab.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{tab.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{tab.role}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {activeTab.icon}
              {activeTab.label}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{activeTab.summary}</p>
          </div>
          <Badge tone="muted">{activeTab.role}</Badge>
        </div>
        {activeTab.content}
      </section>
    </div>
  );
}

export function RadiologyOverviewWorkspace() {
  return <RadiologyDashboardView />;
}

export function RadiologyOrdersWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="Orders Workspace"
      description="Order creation, order tracking, and billing clearance are grouped here so reception and doctors do not need multiple sidebar entries."
      tabs={[
        {
          id: "order-list",
          label: "Order List",
          role: "Doctor / Reception",
          summary: "Track all radiology orders, current status, billing state, and next workflow action.",
          icon: <ClipboardList className="h-4 w-4" />,
          content: <RadiologyOrderListView modalities={radiologyModalities} orders={radiologyOrders} patients={radiologyPatients} tests={radiologyTests} />,
        },
        {
          id: "create-order",
          label: "Create Order",
          role: "Doctor / Reception",
          summary: "Register patient, select radiology tests, set priority, capture clinical indication, and create an order.",
          icon: <FilePlus2 className="h-4 w-4" />,
          content: <RadiologyCreateOrderView patients={radiologyPatients} tests={radiologyTests} />,
        },
        {
          id: "billing",
          label: "Billing Status",
          role: "Billing / Reception",
          summary: "Clear pending payment before scheduling or scan room movement.",
          icon: <CreditCard className="h-4 w-4" />,
          content: <RadiologyBillingStatusView />,
        },
      ]}
    />
  );
}

export function RadiologyFrontOfficeWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="Front Office Workspace"
      description="Scheduling, patient arrival, queue handling, and preparation checklist are grouped for reception and floor staff."
      tabs={[
        {
          id: "scheduling",
          label: "Scheduling",
          role: "Reception",
          summary: "Book or reschedule radiology studies and manage modality slots.",
          icon: <CalendarClock className="h-4 w-4" />,
          content: <RadiologySchedulingWorkflowView />,
        },
        {
          id: "queue",
          label: "Patient Queue",
          role: "Reception",
          summary: "View patient queue and move cases toward check-in or preparation.",
          icon: <Users className="h-4 w-4" />,
          content: <RadiologyPatientQueueView />,
        },
        {
          id: "check-in",
          label: "Check-in",
          role: "Reception",
          summary: "Mark scheduled patients as arrived and route them into preparation.",
          icon: <UserCheck className="h-4 w-4" />,
          content: <RadiologyCheckInView />,
        },
        {
          id: "preparation",
          label: "Preparation",
          role: "Nurse / Technician",
          summary: "Complete contrast, consent, fasting, safety, and preparation steps before scan.",
          icon: <ClipboardCheck className="h-4 w-4" />,
          content: <RadiologyPreparationView />,
        },
      ]}
    />
  );
}

export function RadiologyScanRoomWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="Scan Room Workspace"
      description="Technician queue and scan execution are grouped so scan-room users can work from one place."
      tabs={[
        {
          id: "technician-worklist",
          label: "Technician Worklist",
          role: "Technician",
          summary: "See ready-for-scan cases and start the next scan room action.",
          icon: <ListChecks className="h-4 w-4" />,
          content: <RadiologyTechnicianWorklistView />,
        },
        {
          id: "scan-management",
          label: "Scan Management",
          role: "Technician",
          summary: "Start scans, complete scans, and send completed studies forward.",
          icon: <Activity className="h-4 w-4" />,
          content: <RadiologyScanWorkflowView />,
        },
      ]}
    />
  );
}

export function RadiologyPacsWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="PACS Workspace"
      description="Image study list and PACS readiness are grouped here for technician and radiologist review."
      tabs={[
        {
          id: "pacs-studies",
          label: "PACS Study List",
          role: "Technician / Radiologist",
          summary: "Confirm image transfer, accession details, PACS status, and study readiness.",
          icon: <MonitorUp className="h-4 w-4" />,
          content: <RadiologyPacsStudiesView />,
        },
      ]}
    />
  );
}

export function RadiologyReportingWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="Reporting Workspace"
      description="Radiologist reporting, templates, verification, and print preview are grouped into one reporting screen."
      tabs={[
        {
          id: "workbench",
          label: "Workbench",
          role: "Radiologist",
          summary: "Draft report findings and impressions from PACS-ready studies.",
          icon: <FileText className="h-4 w-4" />,
          content: <RadiologyReportingWorkflowView />,
        },
        {
          id: "templates",
          label: "Templates",
          role: "Radiologist / Admin",
          summary: "Create and manage structured report templates by modality.",
          icon: <LayoutTemplate className="h-4 w-4" />,
          content: <RadiologyReportTemplatesView />,
        },
        {
          id: "verification",
          label: "Verification",
          role: "Radiologist",
          summary: "Verify drafted reports and release verified reports.",
          icon: <FileCheck2 className="h-4 w-4" />,
          content: <RadiologyVerificationWorkflowView />,
        },
        {
          id: "preview",
          label: "Preview / Print",
          role: "Doctor / Radiologist",
          summary: "Preview released reports and print report copies.",
          icon: <Printer className="h-4 w-4" />,
          content: <RadiologyReportPreviewWorkflowView />,
        },
      ]}
    />
  );
}

export function RadiologyDeliveryAlertsWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="Delivery & Alerts Workspace"
      description="Report delivery and critical communication are grouped for front office, radiologist, and clinical teams."
      tabs={[
        {
          id: "delivery",
          label: "Report Delivery",
          role: "Reception / Doctor",
          summary: "Release reports, mark reports delivered, and handle patient/portal dispatch.",
          icon: <Truck className="h-4 w-4" />,
          content: <RadiologyDeliveryWorkflowView />,
        },
        {
          id: "alerts",
          label: "Critical Alerts",
          role: "Radiologist / Doctor",
          summary: "Acknowledge, close, and monitor critical radiology findings.",
          icon: <AlertTriangle className="h-4 w-4" />,
          content: <RadiologyCriticalAlertsView />,
        },
      ]}
    />
  );
}

export function RadiologyAdminMisWorkspace() {
  return (
    <RadiologyWorkspaceTabs
      title="Admin & MIS Workspace"
      description="Masters and analytics are grouped for admin and management users."
      tabs={[
        {
          id: "masters",
          label: "Masters",
          role: "Admin",
          summary: "Manage modalities, tests, technicians, radiologists, and configuration references.",
          icon: <Settings className="h-4 w-4" />,
          content: <RadiologyMastersView />,
        },
        {
          id: "analytics",
          label: "Analytics / MIS",
          role: "Admin / Management",
          summary: "Monitor utilization, revenue, turnaround time, reports, and alerts.",
          icon: <BarChart3 className="h-4 w-4" />,
          content: <RadiologyAnalyticsWorkflowView />,
        },
      ]}
    />
  );
}

export const radiologyTabUseGuide = [
  { page: "Dashboard", use: "Overall radiology view for queue, scans, reporting, and alerts." },
  { page: "Orders", use: "Order list, create order, and billing clearance." },
  { page: "Front Office", use: "Scheduling, queue, check-in, and preparation." },
  { page: "Scan Room", use: "Technician worklist and scan execution." },
  { page: "PACS", use: "Image transfer and PACS study readiness." },
  { page: "Reporting", use: "Report drafting, templates, verification, and print preview." },
  { page: "Delivery & Alerts", use: "Report delivery and critical alert communication." },
  { page: "Admin & MIS", use: "Masters and operational analytics." },
] as const;
