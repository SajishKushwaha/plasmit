"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Droplet, FileSearch, FlaskConical, Layers, Pill, Stethoscope, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { BloodRequestTab } from "./tabs/blood-request-tab";
import { DrugsTab } from "./tabs/drugs-tab";
import { LaboratoryTab } from "./tabs/laboratory-tab";
import { OrderSetsTab } from "./tabs/order-sets-tab";
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

const tabs: OrderTab[] = [
  {
    id: "blood",
    label: "Blood Request",
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
    component: <RadiologyTab />,
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
  {
    id: "requests",
    label: "Requests",
    description: "General clinical requests and pending order follow-up.",
    icon: ClipboardCheck,
    component: <RequestsTab />,
  },
  {
    id: "ordersets",
    label: "Order Sets",
    description: "Reusable clinical order bundles for common workflows.",
    icon: Layers,
    component: <OrderSetsTab />,
  },
];

export function DoctorOrdersPage() {
//   const searchParams = useSearchParams();
//   const requestedTab = searchParams.get("tab") ?? undefined;

// const defaultTab =
//   requestedTab && tabs.some((tab) => tab.id === requestedTab)
//     ? requestedTab
//     : "blood";
const defaultTab = "blood"
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow=" Doctor Workspace"
        title="Order Management"
        description="Comprehensive portal for all clinical orders and investigations."
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
                  className="flex h-10 min-w-[132px] flex-row items-center justify-center gap-2 px-3"
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
