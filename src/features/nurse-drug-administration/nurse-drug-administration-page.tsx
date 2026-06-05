"use client";

import * as React from "react";
import { UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockPatients } from "@/data/patients";
import type { Role } from "@/types";

import { AdministrationTimeline } from "./administration-timeline";
import { defaultAdministrationDetail, defaultFluidDetail, nurseDrugOrders } from "./data";
import { AdministrationDetailsPanel, FluidAdministrationDetailsPanel } from "./detail-panels";
import { DrugOrderReviewTab } from "./order-review";
import { NurseMedicationPatientSummary } from "./patient-summary";
import type { AdministrationCell, AdministrationDetail, FluidAdministrationDetail, NurseDrugOrder } from "./types";

const nurseRoles: Role[] = ["Nurse", "Super Admin", "Hospital Admin"];

function formatCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function buildAdministrationDetail(order: NurseDrugOrder, selectedDate: string, cell?: AdministrationCell): AdministrationDetail {
  const isOverdue = cell?.status === "overdue";
  return {
    ...defaultAdministrationDetail,
    orderId: order.id,
    orderName: order.name,
    category: order.category,
    administrationDate: selectedDate,
    dosage: cell?.label?.replace("Overdue ", "") || order.dosage,
    time: formatCurrentTime(),
    lastAdministeredAt: order.lastAdministeredAt ?? "",
    lastAdministeredBy: order.lastAdministeredBy ?? "",
    action: isOverdue ? "Late administered" : "Administered",
    reason: isOverdue ? "Scheduled dose overdue by more than 1 hour" : "",
    counterChecked: false,
    counterCheckedBy: "",
    counterCheckedAt: "",
  };
}

function buildFluidDetail(order: NurseDrugOrder, selectedDate: string): FluidAdministrationDetail {
  const bagVolume = order.bagVolume ?? 500;
  const volumeAdministered = order.administeredVolume ?? 0;
  const volumeRemaining = Math.max(bagVolume - volumeAdministered, 0);

  return {
    ...defaultFluidDetail,
    orderId: order.id,
    orderName: order.name,
    category: order.category,
    administrationDate: selectedDate,
    rate: order.dosage,
    time: formatCurrentTime(),
    lastAdministeredAt: order.lastAdministeredAt ?? "",
    lastAdministeredBy: order.lastAdministeredBy ?? "",
    bagVolume: String(bagVolume),
    volumeAdministered: String(volumeAdministered),
    volumeRemaining: String(volumeRemaining),
    newBag: false,
    bagCount: String(order.bagCount ?? 1),
    bolusDose: order.bolusDose ?? "",
    counterChecked: false,
    counterCheckedBy: "",
    counterCheckedAt: "",
  };
}

export function NurseDrugAdministrationPage() {
  const { role } = useRole();
  const allowed = nurseRoles.includes(role);
  const [administrationDetail, setAdministrationDetail] = React.useState<AdministrationDetail>(defaultAdministrationDetail);
  const [fluidDetail, setFluidDetail] = React.useState<FluidAdministrationDetail>(defaultFluidDetail);
  const [administrationOpen, setAdministrationOpen] = React.useState(false);
  const [fluidOpen, setFluidOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(formatCurrentDate);
  const [selectedPatientId, setSelectedPatientId] = React.useState(mockPatients[0]?.id ?? "");
  const today = React.useMemo(() => formatCurrentDate(), []);

  const displayedOrders = React.useMemo(() => {
    if (selectedDate < today) {
      return nurseDrugOrders.map((order) => ({
        ...order,
        lastAdministeredAt: order.lastAdministeredAt || "Yesterday 22:00",
        cells: order.cells.map((cell) => ({
          ...cell,
          label: cell.label?.replace("Overdue ", "") ?? (cell.status === "infusion" ? `${order.dosage} infusion` : undefined),
          status: cell.status === "empty" ? cell.status : ("administered" as const),
        })),
      }));
    }

    if (selectedDate > today) {
      return nurseDrugOrders.map((order) => ({
        ...order,
        lastAdministeredAt: "",
        lastAdministeredBy: "",
        administeredVolume: 0,
        cells: order.cells.map((cell) => ({
          ...cell,
          label: cell.status === "infusion" ? `${order.dosage} planned` : cell.label?.replace("Overdue ", ""),
          status: cell.status === "empty" ? cell.status : ("due" as const),
        })),
      }));
    }

    return nurseDrugOrders;
  }, [selectedDate, today]);

  if (!allowed) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nurse access required"
        description="Switch to Nurse role to open drug administration."
      />
    );
  }

  const handleCellSelect = (order: NurseDrugOrder, cell?: AdministrationCell) => {
    if (order.category === "Continuous" || order.form === "IV Fluid") {
      setFluidDetail(buildFluidDetail(order, selectedDate));
      setFluidOpen(true);
      return;
    }
    setAdministrationDetail(buildAdministrationDetail(order, selectedDate, cell));
    setAdministrationOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nursing - Medication Administration"
        title="Drug Administration"
        description="Time-wise MAR view for scheduled, SOS, intermittent, continuous, discontinued, and unscheduled drugs."
        className="static mx-0 border-b bg-transparent px-0 py-2"
      />

      <NurseMedicationPatientSummary patientId={selectedPatientId} onPatientChange={setSelectedPatientId} />

      {/* <AlertBanner icon={Pill} tone="info" title="Administration safety">
        Select a time slot to review administration details, counter-check requirements, overdue status, and fluid bag information before accepting.
      </AlertBanner> */}

      <Tabs defaultValue="drug-order" className="space-y-4">
        <TabsList className="w-full gap-2 overflow-x-auto bg-primary/10 p-1 sm:w-fit">
          <TabsTrigger
            value="drug-order"
            className="min-w-[120px] border border-primary/20 bg-background text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Drug Order
          </TabsTrigger>
          <TabsTrigger
            value="drug-administration"
            className="min-w-[168px] border border-primary/20 bg-background text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Drug Administration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drug-order">
          <DrugOrderReviewTab orders={displayedOrders} />
        </TabsContent>

        <TabsContent value="drug-administration">
          <AdministrationTimeline
            orders={displayedOrders}
            selectedDate={selectedDate}
            today={today}
            onDateChange={setSelectedDate}
            onCellSelect={handleCellSelect}
          />
        </TabsContent>
      </Tabs>
      <AdministrationDetailsPanel
        open={administrationOpen}
        detail={administrationDetail}
        onOpenChange={setAdministrationOpen}
        onChange={setAdministrationDetail}
      />
      <FluidAdministrationDetailsPanel open={fluidOpen} detail={fluidDetail} onOpenChange={setFluidOpen} onChange={setFluidDetail} />
    </div>
  );
}
