"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Droplet, FileSearch, FlaskConical, Layers, Microscope, Pill, Stethoscope, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BloodRequestTab } from "./tabs/blood-request-tab";
import { DrugsTab } from "./tabs/drugs-tab";
import { LaboratoryTab } from "./tabs/laboratory-tab";
import { OrderSetsTab } from "./tabs/order-sets-tab";
import { PathologyTab } from "./tabs/pathology-tab";
import { ProceduresTab } from "./tabs/procedures-tab";
import { RadiologyTab } from "./tabs/radiology-tab";
import { ReferConsultationTab } from "./tabs/refer-consultation-tab";
import { RequestsTab } from "./tabs/requests-tab";

type OrderTab = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  component: ReactNode;
};

export type DoctorOrdersPatientContext = {
  id: string;
  name: string;
  uhid?: string;
  ageSex?: string;
  wardBed?: string;
  diagnosis?: string;
  radiologyPatientId?: string;
};

function getOrderTabs(patientContext?: DoctorOrdersPatientContext): OrderTab[] {
  return [
    {
      id: "blood",
      label: "Blood/Blood Product",
      description: "Blood component request details for blood bank approval.",
      icon: Droplet,
      component: <BloodRequestTab />,
    },
    {
      id: "drugs",
      label: "Drugs",
      description: "Medication orders, dosing, route, frequency, and review context.",
      icon: Pill,
      component: <DrugsTab />,
    },
    {
      id: "pathology",
      label: "Pathology",
      description: "Pathology test order, summary, and result review workflow.",
      icon: Microscope,
      component: <PathologyTab />,
    },
    {
      id: "lab",
      label: "Laboratory",
      description: "Laboratory investigations and sample request workflow.",
      icon: FlaskConical,
      component: <LaboratoryTab />,
    },
    {
      id: "radiology",
      label: "Radiology",
      description: "Imaging orders for radiology scheduling and reporting.",
      icon: FileSearch,
      component: <RadiologyTab patientContext={patientContext} />,
    },
    {
      id: "procedures",
      label: "Procedures",
      description: "Procedure orders, clinical notes, and operational instructions.",
      icon: Stethoscope,
      component: <ProceduresTab />,
    },
    {
      id: "referral",
      label: "Refer/Consult",
      description: "Specialist referral and consultation request workflow.",
      icon: UserPlus,
      component: <ReferConsultationTab />,
    },
    // {
    //   id: "requests",
    //   label: "Requests",
    //   description: "General clinical requests and pending order follow-up.",
    //   icon: ClipboardCheck,
    //   component: <RequestsTab />,
    // },
    {
      id: "ordersets",
      label: "Master Order Sets",
      description: "Reusable clinical order bundles for common workflows.",
      icon: Layers,
      component: <OrderSetsTab />,
    },
  ];
}

export function DoctorOrdersPage({
  defaultTab: defaultTabProp,
  patientContext,
}: {
  defaultTab?: string;
  patientContext?: DoctorOrdersPatientContext;
} = {}) {
  const searchParams = useSearchParams();
  const tabs = getOrderTabs(patientContext);
  const requestedTab = searchParams.get("tab") ?? undefined;

  const defaultTab =
    requestedTab && tabs.some((tab) => tab.id === requestedTab)
      ? requestedTab
      : defaultTabProp && tabs.some((tab) => tab.id === defaultTabProp)
        ? defaultTabProp
        : "blood";
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow=" Doctor Workspace"
        title="Order Management"
        description={patientContext ? `Clinical orders and investigations for ${patientContext.name}.` : "Comprehensive portal for all clinical orders and investigations."}
        className="static mx-0 border-b bg-transparent px-0 py-2"
        // actions={
        //   <Button>
        //     <Plus className="h-4 w-4" />
        //     Quick Order
        //   </Button>
        // }
      />

      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Clinical Orders</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Select an order type to enter or review request details.
              </p>
            </div>
            <TabsList className="w-full gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex h-10 min-w-[132px] flex-row items-center justify-center gap-2 border border-transparent px-3 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate leading-none">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              {/* <div className="mb-4 flex items-start gap-3 rounded-md border border-border bg-surface-muted p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
                  <tab.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">{tab.label}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{tab.description}</p>
                </div>
              </div> */}
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
