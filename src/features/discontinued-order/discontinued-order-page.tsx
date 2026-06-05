"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Ban, Droplet, Eye, FileWarning, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/shell/page-header";
import { mockPatients } from "@/data/patients";
import { PatientSearchSelect } from "@/features/patients/patient-search-select";
import type { Role } from "@/types";

type DiscontinuedOrder = {
  id: string;
  date: string;
  bloodProducts: string;
  unitsOrdered: number;
  reason: string;
  unitsTransfused: number;
  instructions: string;
  discontinuingReason: string;
  discontinuedBy: string;
  discontinuedAt: string;
};

const nurseRoles: Role[] = ["Nurse", "Super Admin", "Hospital Admin"];

const discontinuedOrders: DiscontinuedOrder[] = [
  {
    id: "DIS-1217",
    date: "18 May 2026",
    bloodProducts: "Packed RBC",
    unitsOrdered: 2,
    reason: "Surgery",
    unitsTransfused: 1,
    instructions: "Monitor vitals closely",
    discontinuingReason: "Patient developed mild reaction",
    discontinuedBy: "Nurse Asha Patel",
    discontinuedAt: "18 May 2026, 01:20 PM",
  },
  {
    id: "DIS-1364",
    date: "17 May 2026",
    bloodProducts: "Platelets",
    unitsOrdered: 1,
    reason: "Low platelet count",
    unitsTransfused: 0,
    instructions: "Consultant review required",
    discontinuingReason: "Order cancelled after repeat lab report",
    discontinuedBy: "Nurse Meera Shah",
    discontinuedAt: "17 May 2026, 10:45 AM",
  },
  {
    id: "DIS-2951",
    date: "16 May 2026",
    bloodProducts: "Fresh Frozen Plasma",
    unitsOrdered: 3,
    reason: "Coagulation support",
    unitsTransfused: 2,
    instructions: "Keep sample available",
    discontinuingReason: "Clinical condition improved",
    discontinuedBy: "Nurse Riya Mehta",
    discontinuedAt: "16 May 2026, 04:05 PM",
  },
];

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">
        {label}:
      </div>

      <div className="text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function DiscontinuedOrderDrawer({
  order,
  onClose,
}: {
  order: DiscontinuedOrder | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={Boolean(order)}
      onOpenChange={(open) => !open && onClose()}
      title="Discontinued Order Details"
      description={order?.id}
    >
      {order ? (
        <div className="space-y-4">
          <AlertBanner icon={AlertTriangle} tone="danger" title="Transfusion discontinued">
            {order.discontinuingReason}
          </AlertBanner>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Blood Product" value={order.bloodProducts} />
            <DetailItem label="Order Date" value={order.date} />
            <DetailItem label="Units Ordered" value={order.unitsOrdered} />
            <DetailItem label="Units Transfused" value={order.unitsTransfused} />
            <DetailItem label="Discontinued By" value={order.discontinuedBy} />
            <DetailItem label="Discontinued At" value={order.discontinuedAt} />
          </div>

          <DetailItem label="Reason" value={order.reason} />
          <div className="rounded-md border border-border bg-surface-muted p-3">
            <div className="text-xs font-medium text-muted-foreground">Instructions</div>
            <p className="mt-1 text-sm text-foreground">{order.instructions}</p>
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function DiscontinuedOrdersTable({ searchQuery }: { searchQuery: string }) {
  const [selectedOrder, setSelectedOrder] = React.useState<DiscontinuedOrder | null>(null);

  const columns = React.useMemo<ColumnDef<DiscontinuedOrder>[]>(
    () => [
      { header: "Date", accessorKey: "date" },
      {
        header: "Blood products",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-danger" />
            <span className="font-medium">{row.original.bloodProducts}</span>
          </div>
        ),
      },
      { header: "Units ordered", accessorKey: "unitsOrdered" },
      {
        header: "Units transfused",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.unitsTransfused}
          </span>
        ),
      },
      { header: "Reason", accessorKey: "reason" },
      { header: "Instructions", accessorKey: "instructions" },
      {
        header: "Discontinuing reason",
        cell: ({ row }) => <span>{row.original.discontinuingReason}</span>,
      },
      // {
      //   header: "Status",
      //   cell: () => <Badge tone="danger">Discontinued</Badge>,
      // },
      {
        header: "Actions",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(row.original)}>
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        ),
      },
    ],
    [],
  );

  const filteredOrders = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return discontinuedOrders;
    }

    return discontinuedOrders.filter((order) =>
      [
        order.id,
        order.date,
        order.bloodProducts,
        order.unitsOrdered,
        order.reason,
        order.unitsTransfused,
        order.instructions,
        order.discontinuingReason,
        order.discontinuedBy,
        order.discontinuedAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  return (
    <>
      <DataTable columns={columns} data={filteredOrders} />
      <DiscontinuedOrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

export function DiscontinuedOrderPage() {
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = React.useState("");
  const allowed = nurseRoles.includes(role);
  const [patientId, setPatientId] = React.useState(mockPatients[0]?.id ?? "");
  const patient = mockPatients.find((item) => item.id === patientId) ?? mockPatients[0];
  const totalUnitsOrdered = discontinuedOrders.reduce((total, order) => total + order.unitsOrdered, 0);
  const totalUnitsTransfused = discontinuedOrders.reduce((total, order) => total + order.unitsTransfused, 0);

  if (!allowed) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nurse access required"
        description="Switch to Nurse role to open discontinued blood order records."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nursing - Discontinued Orders"
        title="Discontinued Orders"
        description="Review blood orders that were stopped during the nursing workflow."
        className="static mx-0 border-b bg-transparent px-0 py-2"
      />

      <Card>
        <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <PatientSearchSelect patientId={patient.id} onPatientChange={setPatientId} />
          {/* <DetailItem label="UHID" value="UH1023" /> */}
          <DetailItem label="Age/Gender" value={`${patient.age} / ${patient.gender}`} />
          <DetailItem label="Blood Group" value={patient.bloodGroup} />
          {/* <DetailItem label="Ward/Bed" value="ICU-2" /> */}
        </CardContent>
      </Card>

      {/* <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Discontinued Orders</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{discontinuedOrders.length}</div>
            </div>
            <Ban className="h-5 w-5 text-danger" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Units Ordered</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{totalUnitsOrdered}</div>
            </div>
            <Droplet className="h-5 w-5 text-info" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Units Transfused</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{totalUnitsTransfused}</div>
            </div>
            <FileWarning className="h-5 w-5 text-warning" />
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <div className="w-full max-w-md space-y-2">
            {/* <label className="text-xs font-medium text-muted-foreground" htmlFor="discontinued-order-search">
              Search discontinued orders
            </label> */}
            <SearchInput id="discontinued-order-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search product, reason, nurse, date..." />
            {/* <CardDescription>Search filters the discontinued order list below.</CardDescription> */}
          </div>
          <Badge tone="danger">Stopped</Badge>
        </CardHeader>
        <CardContent>
          <DiscontinuedOrdersTable searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  );
}
