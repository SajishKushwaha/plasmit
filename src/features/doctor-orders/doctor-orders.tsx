"use client";

import type { ReactNode } from "react";
import { ClipboardCheck, Droplet, FileSearch, FlaskConical, Layers, Microscope, Pill, Stethoscope, UserPlus } from "lucide-react";

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
import { LdtTab } from "./tabs/ldt-tab";
import { AddPoctPage } from "@/features/poct/poct-pages";

type OrderTab = {
  id: string;
  label: string;
  description: string;
  icon: typeof ClipboardCheck;
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

const tabs: OrderTab[] = [
  { id: "blood", label: "Blood", description: "Blood component request details for blood bank approval.", icon: Droplet, component: <BloodRequestTab /> },
  { id: "drugs", label: "Drug", description: "Medication orders, dosing, route, frequency, and review context.", icon: Pill, component: <DrugsTab /> },
  { id: "pathology", label: "Pathology", description: "Pathology test order, summary, and result review workflow.", icon: Microscope, component: <PathologyTab /> },
  { id: "lab", label: "Laboratory", description: "Laboratory investigations and sample request workflow.", icon: FlaskConical, component: <LaboratoryTab /> },
  { id: "radiology", label: "Radiology", description: "Imaging orders for radiology scheduling and reporting.", icon: FileSearch, component: <RadiologyTab /> },
  { id: "poct", label: "Add POCT", description: "Bedside POCT ordering and capture workflow.", icon: FlaskConical, component: <AddPoctPage embedded mode="add" showModeActions={false} /> },
  { id: "procedures", label: "Procedure", description: "Procedure orders, clinical notes, and operational instructions.", icon: Stethoscope, component: <ProceduresTab /> },
  { id: "referral", label: "Referral", description: "Specialist referral and consultation request workflow.", icon: UserPlus, component: <ReferConsultationTab /> },
  { id: "ordersets", label: "Master Order Sets", description: "Reusable clinical order bundles for common workflows.", icon: Layers, component: <OrderSetsTab /> },
  { id: "ldt", label: "LDT", description: "Line, drain, and tube order request workflow.", icon: ClipboardCheck, component: <LdtTab /> },
];

export function DoctorOrdersPage({
  defaultTab: defaultTabProp,
  drugsOnly = false,
}: {
  defaultTab?: string;
  drugsOnly?: boolean;
  patientContext?: DoctorOrdersPatientContext;
} = {}) {
  const visibleTabs = drugsOnly ? tabs.filter((tab) => tab.id === "drugs") : tabs;
  const defaultTab = defaultTabProp && visibleTabs.some((tab) => tab.id === defaultTabProp) ? defaultTabProp : visibleTabs[0]?.id ?? "drugs";

  return (
    <div className="space-y-4 px-2 py-2 sm:space-y-5 sm:px-0 sm:py-3">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="space-y-3 sm:space-y-4">
          {!drugsOnly ? (
            <div className="space-y-2">
              <TabsList className="w-full gap-1.5 overflow-x-auto px-1 py-1 sm:gap-2 sm:px-0">
                {visibleTabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex h-8 min-w-[110px] flex-row items-center justify-center gap-1.5 border border-transparent px-2.5 text-xs sm:h-10 sm:min-w-[132px] sm:gap-2 sm:px-3 sm:text-sm data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <tab.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="min-w-0 truncate leading-none">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          ) : null}
          {visibleTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-2 sm:mt-3">
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
