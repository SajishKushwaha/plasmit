"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, Droplet, FileSearch, FlaskConical, Layers, Pill, Search, Stethoscope, UserPlus } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockAdmissions } from "@/data/ipd";
import { mockPatients, mockPatientVisits } from "@/data/patients";

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

function patientName(patient: (typeof mockPatients)[number]) {
  return `${patient.firstName} ${patient.middleName ? `${patient.middleName} ` : ""}${patient.lastName}`.trim();
}

function patientSearchText(patient: (typeof mockPatients)[number]) {
  return [
    patient.id,
    patient.uhid,
    patient.firstName,
    patient.middleName ?? "",
    patient.lastName,
    patient.mobile,
    patient.department,
    patient.status,
  ].join(" ").toLowerCase();
}

function OrderPatientSearchHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestedPatientId = searchParams.get("patientId") ?? "pat-001";
  const patient = mockPatients.find((record) => record.id === requestedPatientId) ?? mockPatients[0];
  const [patientSearch, setPatientSearch] = React.useState("");
  const visits = mockPatientVisits.filter((visit) => visit.patientId === patient.id);
  const admission = mockAdmissions.find((record) => record.patientId === patient.id);
  const allergyFlags = patient.alertFlags.filter((flag) => flag.toLowerCase().includes("allergy"));
  const nonAllergyFlags = patient.alertFlags.filter((flag) => !flag.toLowerCase().includes("allergy"));
  const encounterRefs = [
    admission?.admissionNo,
    ...visits.map((visit) => visit.referenceNumber),
  ].filter(Boolean);
  const fields = [
    ["IPD/OPD No.", encounterRefs.join(" / ") || "No active encounter"],
    ["Ward/Bed", admission ? `${admission.ward} / ${admission.bedId}` : `${patient.department} OPD`],
    ["Consultant", admission?.consultant ?? visits[0]?.provider ?? "Duty consultant"],
    ["Allergy", allergyFlags.length ? allergyFlags.map((flag) => flag.replace(/^Allergy:\s*/i, "")).join(", ") : "No known allergy"],
  ];
  const filteredPatients = React.useMemo(() => {
    const query = patientSearch.trim().toLowerCase();
    if (!query) return [];
    return mockPatients.filter((record) => patientSearchText(record).includes(query)).slice(0, 8);
  }, [patientSearch]);

  const selectPatient = (patientId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("patientId", patientId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setPatientSearch("");
  };

  return (
    <Card className="sticky top-16 z-30 overflow-visible border-border bg-white shadow-soft">
      <CardContent className="relative space-y-3 p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-foreground">{patientName(patient)}</h1>
              <Badge tone="muted">{patient.id}</Badge>
              {(nonAllergyFlags.length ? nonAllergyFlags : []).map((flag) => (
                <Badge key={flag} tone="warning">{flag}</Badge>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              <span>{patient.uhid}</span>
              <span>{patient.age}/{patient.gender.charAt(0)}</span>
              <span>{fields[1][1]}</span>
            </div>
          </div>
          <div className="relative min-w-64 flex-1 xl:max-w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search order patient"
              className="h-9 bg-white pl-9 text-sm font-semibold"
              placeholder="Search patient / UHID"
              value={patientSearch}
              onChange={(event) => setPatientSearch(event.target.value)}
            />
            {patientSearch ? (
              <div className="absolute left-0 top-10 z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-white p-1 shadow-soft">
                {filteredPatients.length ? filteredPatients.map((record) => (
                  <button
                    className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm outline-none hover:bg-surface-muted focus-visible:bg-surface-muted"
                    key={record.id}
                    onClick={() => selectPatient(record.id)}
                    type="button"
                  >
                    <span className="truncate font-semibold text-foreground">{patientName(record)}</span>
                    <span className="truncate text-xs text-muted-foreground">{record.uhid} | {record.age}/{record.gender} | {record.department}</span>
                  </button>
                )) : (
                  <div className="px-3 py-3 text-sm text-muted-foreground">No patient found.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
          {fields.map(([label, value]) => (
            <div className="rounded-md bg-surface-muted px-2.5 py-1.5" key={label}>
              <span className="font-semibold text-muted-foreground">{label}: </span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          ))}
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge tone="info">Orders patient context</Badge>
            <Badge tone="muted">URL linked</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DoctorOrdersPage() {
  const defaultTab = "blood";

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
      <OrderPatientSearchHeader />

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
