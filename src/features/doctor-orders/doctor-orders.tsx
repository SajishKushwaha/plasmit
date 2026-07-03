"use client";

import type { ReactNode } from "react";
import { ClipboardCheck, Droplet, FileSearch, FlaskConical, Layers, Microscope, Pill, Stethoscope, UserPlus } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientSummaryBanner } from "@/components/ui/patient-summary-banner";

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
  { id: "poct", label: " POCT", description: "Bedside POCT ordering and capture workflow.", icon: FlaskConical, component: <AddPoctPage embedded mode="add" showModeActions={false} /> },
  { id: "procedures", label: "Procedure", description: "Procedure orders, clinical notes, and operational instructions.", icon: Stethoscope, component: <ProceduresTab /> },
  { id: "referral", label: "Referral", description: "Specialist referral and consultation request workflow.", icon: UserPlus, component: <ReferConsultationTab /> },
  { id: "ordersets", label: "Master Order Sets", description: "Reusable clinical order bundles for common workflows.", icon: Layers, component: <OrderSetsTab /> },
  { id: "ldt", label: "LDT", description: "Line, drain, and tube order request workflow.", icon: ClipboardCheck, component: <LdtTab /> },
];

export function DoctorOrdersPage({
  defaultTab: defaultTabProp,
  drugsOnly = false,
  onlyTab,
  patientContext,
  showPatientBanner = false,
}: {
  defaultTab?: string;
  drugsOnly?: boolean;
  onlyTab?: string;
  patientContext?: DoctorOrdersPatientContext;
  showPatientBanner?: boolean;
} = {}) {
  const visibleTabs = drugsOnly
    ? tabs.filter((tab) => tab.id === "drugs")
    : onlyTab
      ? tabs.filter((tab) => tab.id === onlyTab)
      : tabs;
  const defaultTab = defaultTabProp && visibleTabs.some((tab) => tab.id === defaultTabProp) ? defaultTabProp : visibleTabs[0]?.id ?? "drugs";

  return (
    <div className="space-y-4 px-2 py-2 sm:space-y-5 sm:px-0 sm:py-3">
      {showPatientBanner && patientContext ? (
        <PatientSummaryBanner
          title="Selected Patient Orders"
          fields={[
            { label: "Name", value: patientContext.name },
            { label: "UHID", value: patientContext.uhid ?? patientContext.id },
            { label: "Age/Sex", value: patientContext.ageSex ?? "Not recorded" },
            { label: "Ward/Bed", value: patientContext.wardBed ?? "Not assigned" },
            { label: "Diagnosis", value: patientContext.diagnosis ?? "Not recorded" },
          ]}
        />
      ) : null}
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="space-y-3 sm:space-y-4">
          {!drugsOnly && !onlyTab ? (
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-xl border border-border bg-white/95 p-1 shadow-sm">
                <TabsList className="inline-flex h-auto w-max min-w-max rounded-lg bg-surface-muted/70 p-1">
                  {visibleTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="flex h-10 min-w-[132px] shrink-0 flex-row items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                      <tab.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="min-w-0 truncate leading-none">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
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
