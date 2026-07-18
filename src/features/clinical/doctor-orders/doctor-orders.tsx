"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ClipboardCheck,
  Droplet,
  FileSearch,
  FlaskConical,
  Layers,
  Microscope,
  Pill,
  Stethoscope,
  UserPlus,
  X,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientSummaryBanner } from "@/components/ui/patient-summary-banner";
import {
  doctorInstructions,
  icuPatients,
  medicationRows,
  type IcuPatient,
} from "@/features/care-team/nursing-icu/nursing-icu-data";

import { BloodRequestTab } from "./tabs/blood-request-tab";
import { DrugsTab } from "./tabs/drugs-tab";
import { LaboratoryTab } from "./tabs/laboratory-tab";
import { OrderSetsTab } from "./tabs/order-sets-tab";
import { PathologyTab } from "./tabs/pathology-tab";
import { ProceduresTab } from "./tabs/procedures-tab";
import { RadiologyTab } from "./tabs/radiology-tab";
import { ReferConsultationTab } from "./tabs/refer-consultation-tab";
import { LdtTab } from "./tabs/ldt-tab";
import { AddPoctPage } from "@/features/clinical/poct/poct-pages";

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
  {
    id: "blood",
    label: "Blood",
    description: "Blood component request details for blood bank approval.",
    icon: Droplet,
    component: <BloodRequestTab />,
  },
  {
    id: "drugs",
    label: "Drug",
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
    component: <RadiologyTab />,
  },
  {
    id: "poct",
    label: " POCT",
    description: "Bedside POCT ordering and capture workflow.",
    icon: FlaskConical,
    component: <AddPoctPage embedded mode="add" showModeActions={false} />,
  },
  {
    id: "procedures",
    label: "Procedure",
    description: "Procedure orders, clinical notes, and operational instructions.",
    icon: Stethoscope,
    component: <ProceduresTab />,
  },
  {
    id: "referral",
    label: "Referral",
    description: "Specialist referral and consultation request workflow.",
    icon: UserPlus,
    component: <ReferConsultationTab />,
  },
  {
    id: "ordersets",
    label: "Master Order Sets",
    description: "Reusable clinical order bundles for common workflows.",
    icon: Layers,
    component: <OrderSetsTab />,
  },
  {
    id: "ldt",
    label: "LDT",
    description: "Line, drain, and tube order request workflow.",
    icon: ClipboardCheck,
    component: <LdtTab />,
  },
];

type WardNurseOrder = {
  id: string;
  patientId: string;
  order: string;
  department: string;
  departmentLabel: string;
  orderedBy: string;
  time: string;
  status: string;
  instruction: string;
};

const wardNurseName = "Ward Nurse Kavita";

const departmentByInstruction = [
  { match: "abg", tab: "lab", label: "Laboratory" },
  { match: "electrolyte", tab: "lab", label: "Laboratory" },
  { match: "sample", tab: "lab", label: "Laboratory" },
  { match: "transfusion", tab: "blood", label: "Blood" },
  { match: "radiology", tab: "radiology", label: "Radiology" },
  { match: "x-ray", tab: "radiology", label: "Radiology" },
  { match: "ct", tab: "radiology", label: "Radiology" },
  { match: "transfer", tab: "procedures", label: "Procedure" },
  { match: "discharge", tab: "procedures", label: "Procedure" },
];

function assignedWardPatients() {
  return icuPatients.filter((patient) => patient.assignedWardNurse === wardNurseName);
}

function OrderPatientStrip({ patient }: { patient: IcuPatient }) {
  return (
    <div
      className="overflow-x-auto rounded-xl border px-4 py-3 text-white shadow-sm"
      style={{
        background: "linear-gradient(90deg, #7467f0 0%, #4f86f7 100%)",
        borderColor: "#bfdbfe",
      }}
    >
      <div className="flex min-w-max items-center gap-3">
        <span className="text-base font-bold">{patient.patientName}</span>
        <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold">
          MR: {patient.mrn}
        </span>
        <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold">
          Age/Sex: {patient.ageGender}
        </span>
        <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold">
          Bed: {patient.bedNo}
        </span>
        <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold">
          Unit: {patient.unit}
        </span>
        <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold">
          Doctor: {patient.dutyDoctor}
        </span>
        <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-bold">
          Nurse: {patient.assignedWardNurse}
        </span>
        <button
          className="ml-auto inline-flex h-9 items-center justify-center rounded-xl border border-white/30 bg-white px-4 text-xs font-semibold text-[#7367f0] shadow-sm transition hover:bg-white/90"
          onClick={() => window.history.back()}
          type="button"
        >
          Back
        </button>
      </div>
    </div>
  );
}

function instructionDepartment(instruction: string) {
  const normalized = instruction.toLowerCase();
  return (
    departmentByInstruction.find((item) => normalized.includes(item.match)) ?? {
      tab: "ordersets",
      label: "Nursing Care",
    }
  );
}

function patientOrders(patient: IcuPatient): WardNurseOrder[] {
  const medicationOrders = medicationRows
    .filter((medication) => medication.patientId === patient.id)
    .slice(0, 3)
    .map((medication) => ({
      id: `med-${medication.id}`,
      patientId: patient.id,
      order: `${medication.medication} ${medication.dose}`,
      department: "drugs",
      departmentLabel: "Drug",
      orderedBy: patient.dutyDoctor,
      time: medication.scheduledTime,
      status: medication.status,
      instruction: `${medication.route} | ${medication.frequency}`,
    }));

  const doctorOrders = doctorInstructions
    .filter((instruction) => instruction.patientId === patient.id)
    .map((instruction) => {
      const department = instructionDepartment(
        `${instruction.instructionType} ${instruction.instruction}`,
      );

      return {
        id: `doc-${instruction.id}`,
        patientId: patient.id,
        order: instruction.instruction,
        department: department.tab,
        departmentLabel: department.label,
        orderedBy: instruction.doctor,
        time: instruction.dueTime,
        status: instruction.status,
        instruction: instruction.remarks,
      };
    });

  const fallbackOrders: WardNurseOrder[] = [
    {
      id: `lab-${patient.id}`,
      patientId: patient.id,
      order: patient.criticalityScore >= 7 ? "ABG, CBC, electrolytes" : "CBC and renal profile",
      department: "lab",
      departmentLabel: "Laboratory",
      orderedBy: patient.dutyDoctor,
      time: "Today",
      status: patient.criticalityScore >= 7 ? "Pending" : "Ordered",
      instruction: "Collect sample and track report.",
    },
    {
      id: `rad-${patient.id}`,
      patientId: patient.id,
      order: patient.ventilatorStatus.includes("ventilation")
        ? "Portable chest X-ray"
        : "Radiology review if condition changes",
      department: "radiology",
      departmentLabel: "Radiology",
      orderedBy: patient.admittingDoctor,
      time: "Today",
      status: "Ordered",
      instruction: "Coordinate with radiology team.",
    },
  ];

  return [...medicationOrders, ...doctorOrders, ...fallbackOrders].slice(0, 7);
}

type DoctorOrdersPageProps = {
  defaultTab?: string;
  drugsOnly?: boolean;
  onlyTab?: string;
  patientContext?: DoctorOrdersPatientContext;
  radiologyDefaultTab?: "test-order" | "order-summary" | "result-review";
  showPatientBanner?: boolean;
  wardNurseMode?: boolean;
  patientId?: string;
  locked?: boolean;
  mode?: "list" | "detail";
  orderId?: string;
  department?: string;
};

export function DoctorOrdersPage({
  defaultTab: defaultTabProp,
  drugsOnly = false,
  onlyTab,
  patientContext,
  radiologyDefaultTab,
  showPatientBanner = false,
  wardNurseMode = false,
  patientId,
  locked = false,
  mode = "list",
  orderId,
  department,
}: DoctorOrdersPageProps = {}) {
  if (wardNurseMode) {
    return (
      <WardNurseDoctorOrdersPage
        patientId={patientId}
        locked={locked}
        mode={mode}
        orderId={orderId}
        department={department}
      />
    );
  }

  const visibleTabs = drugsOnly
    ? tabs.filter((tab) => tab.id === "drugs")
    : onlyTab
      ? tabs.filter((tab) => tab.id === onlyTab)
      : tabs;
  const preferredDefaultTab = defaultTabProp ?? department;
  const defaultTab =
    preferredDefaultTab && visibleTabs.some((tab) => tab.id === preferredDefaultTab)
      ? preferredDefaultTab
      : (visibleTabs[0]?.id ?? "drugs");

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
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex h-10 min-w-[132px] shrink-0 flex-row items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                    >
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
              {tab.id === "radiology" ? (
                <RadiologyTab defaultTab={radiologyDefaultTab} />
              ) : (
                tab.component
              )}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}

function WardNurseDoctorOrdersPage({
  patientId,
  locked: lockedFromRoute,
  mode,
  orderId,
  department,
}: Pick<DoctorOrdersPageProps, "patientId" | "locked" | "mode" | "orderId" | "department">) {
  const assignedPatients = React.useMemo(() => assignedWardPatients(), []);
  const locked = lockedFromRoute && Boolean(patientId);
  const initialPatientId =
    patientId && assignedPatients.some((patient) => patient.id === patientId) ? patientId : "";
  const [selectedPatientId, setSelectedPatientId] = React.useState(initialPatientId);
  const [activeTab, setActiveTab] = React.useState("blood");
  const [selectedOrderId, setSelectedOrderId] = React.useState<string | null>(orderId ?? null);
  const [modalOpen, setModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  React.useEffect(() => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
  }, [orderId]);

  const selectedPatient =
    assignedPatients.find((patient) => patient.id === selectedPatientId) ?? null;
  const orders = selectedPatient ? patientOrders(selectedPatient) : [];
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const selectedOrderTab = selectedOrder
    ? (tabs.find((tab) => tab.id === selectedOrder.department) ?? null)
    : null;
  const isDetailMode = mode === "detail" && Boolean(selectedPatient);

  React.useEffect(() => {
    if (department && tabs.some((tab) => tab.id === department)) {
      setActiveTab(department);
    } else if (selectedOrder) {
      setActiveTab(selectedOrder.department);
    }
  }, [department, selectedOrder]);

  function openOrder(order: WardNurseOrder) {
    setSelectedOrderId(order.id);
    setActiveTab(order.department);
    setModalOpen(true);
  }

  return (
    <div className="space-y-4 px-2 py-2 sm:space-y-5 sm:px-0 sm:py-3">
      {selectedPatient ? <OrderPatientStrip patient={selectedPatient} /> : null}

      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Doctor Orders</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {selectedPatient
                ? `${selectedPatient.bedNo} | ${selectedPatient.unit}`
                : "Select an assigned patient"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              className="h-10 min-w-[260px] rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={locked}
              onChange={(event) => {
                setSelectedPatientId(event.target.value);
                setSelectedOrderId(null);
              }}
              value={selectedPatientId}
            >
              <option value="">Select patient</option>
              {assignedPatients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.patientName} - {patient.bedNo}
                </option>
              ))}
            </select>
            {locked ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                Locked
              </span>
            ) : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="border-b border-border bg-surface-muted text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Ordered By</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  className="border-b border-border last:border-b-0 hover:bg-surface-muted/55"
                  key={order.id}
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-foreground">{order.order}</div>
                    <div className="mt-1 text-xs font-medium text-muted-foreground">
                      {order.instruction}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {order.departmentLabel}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.orderedBy}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.time}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-foreground">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => openOrder(order)}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
              {!selectedPatient || orders.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm font-semibold text-muted-foreground"
                    colSpan={6}
                  >
                    {selectedPatient
                      ? "No open orders for this patient."
                      : "Select patient to view orders."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isDetailMode ? (
        <>
          <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {selectedOrder?.departmentLabel ?? "Order"} workspace
                </h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {selectedOrder
                    ? `${selectedOrder.order} | ${selectedOrder.orderedBy} | ${selectedOrder.time}`
                    : "Open an order from the patient order list."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!selectedPatient) return;
                  const params = new URLSearchParams({
                    patientId: selectedPatient.id,
                    locked: locked ? "1" : "0",
                  });
                  window.location.href = `/icu-command-center/nursing/order?${params.toString()}`;
                }}
              >
                Back to orders
              </Button>
            </div>
          </section>

          <OrderWorkspaceTabs activeTab={activeTab} onActiveTabChange={setActiveTab} />
        </>
      ) : null}

      <Dialog.Root open={modalOpen && Boolean(selectedOrder)} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(92dvh,860px)] w-[min(96vw,1180px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
            <div className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Dialog.Title className="truncate text-base font-bold text-foreground">
                  {selectedOrder?.departmentLabel ?? "Order"} order
                </Dialog.Title>
                <Dialog.Description className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {selectedPatient
                    ? `${selectedPatient.patientName} | ${selectedPatient.bedNo} | ${selectedPatient.unit}`
                    : "Selected patient"}
                  {selectedOrder ? ` | ${selectedOrder.order}` : ""}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button
                  aria-label="Close order popup"
                  className="h-9 w-9 shrink-0 p-0"
                  type="button"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              {selectedOrderTab ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                        <selectedOrderTab.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {selectedOrderTab.label}
                        </p>
                        <p className="truncate text-xs font-medium text-muted-foreground">
                          {selectedOrder?.instruction}
                        </p>
                      </div>
                    </div>
                    <span className="w-fit rounded-full border border-border bg-background px-3 py-1 text-xs font-bold text-foreground">
                      {selectedOrder?.status}
                    </span>
                  </div>
                  {selectedOrderTab.id === "radiology" ? (
                    <RadiologyTab />
                  ) : (
                    selectedOrderTab.component
                  )}
                </div>
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function OrderWorkspaceTabs({
  activeTab,
  onActiveTabChange,
}: {
  activeTab: string;
  onActiveTabChange: (_tab: string) => void;
}) {
  return (
    <Tabs value={activeTab} onValueChange={onActiveTabChange} className="w-full">
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-xl border border-border bg-white/95 p-1 shadow-sm">
            <TabsList className="inline-flex h-auto w-max min-w-max rounded-lg bg-surface-muted/70 p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex h-10 min-w-[132px] shrink-0 flex-row items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-3 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  <tab.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                  <span className="min-w-0 truncate leading-none">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-2 sm:mt-3">
            {tab.id === "radiology" ? <RadiologyTab /> : tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
