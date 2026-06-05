"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, ClipboardCheck, Droplet, Eye, FileText, UserRound } from "lucide-react";

import { useRole } from "@/components/providers/role-provider";
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

type CompletedOrder = {
  id: string;
  date: string;
  bloodProducts: string;
  unitsTransfused: number;
  reason: string;
  instructions: string;
  completedBy: string;
  completedAt: string;
};

const nurseRoles: Role[] = ["Nurse", "Super Admin", "Hospital Admin"];

const completedOrders: CompletedOrder[] = [
  {
    id: "ORD-1001",
    date: "20 May 2024",
    bloodProducts: "Packed RBC",
    unitsTransfused: 2,
    reason: "Post-operative blood loss",
    instructions: "Monitor vitals during transfusion",
    completedBy: "Nurse Asha Patel",
    completedAt: "20 May 2024, 02:35 PM",
  },
  {
    id: "ORD-1002",
    date: "19 May 2024",
    bloodProducts: "Platelets",
    unitsTransfused: 1,
    reason: "Low platelet count",
    instructions: "Observe for allergic reaction",
    completedBy: "Nurse Meera Shah",
    completedAt: "19 May 2024, 11:10 AM",
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

function CompletedOrderDrawer({
  order,
  onClose,
}: {
  order: CompletedOrder | null;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={Boolean(order)}
      onOpenChange={(open) => !open && onClose()}
      title="Completed Order Details"
      description={order?.id}
    >
      {order ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-success/25 bg-success/10 p-3 text-success">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Transfusion completed
            </div>
            <div className="mt-1 text-xs leading-5 opacity-90">{order.completedAt}</div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Blood Product" value={order.bloodProducts} />
            <DetailItem label="Units Transfused" value={`${order.unitsTransfused} Unit${order.unitsTransfused > 1 ? "s" : ""}`} />
            <DetailItem label="Order Date" value={order.date} />
            <DetailItem label="Completed By" value={order.completedBy} />
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

function CompletedOrdersTable({ searchQuery }: { searchQuery: string }) {
  const [selectedOrder, setSelectedOrder] = React.useState<CompletedOrder | null>(null);

  const columns = React.useMemo<ColumnDef<CompletedOrder>[]>(
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
      {
        header: "Units transfused",
        cell: ({ row }) => `${row.original.unitsTransfused} Unit${row.original.unitsTransfused > 1 ? "s" : ""}`,
      },
      { header: "Reason", accessorKey: "reason" },
      { header: "Instructions", accessorKey: "instructions" },
      // {
      //   header: "Status",
      //   cell: () => <Badge tone="success">Completed</Badge>,
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
      return completedOrders;
    }

    return completedOrders.filter((order) =>
      [
        order.id,
        order.date,
        order.bloodProducts,
        order.unitsTransfused,
        order.reason,
        order.instructions,
        order.completedBy,
        order.completedAt,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [searchQuery]);

  return (
    <>
      <DataTable columns={columns} data={filteredOrders} />
      <CompletedOrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

export function CompletedOrderPage() {
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = React.useState("");
  const allowed = nurseRoles.includes(role);
  const [patientId, setPatientId] = React.useState(mockPatients[0]?.id ?? "");
  const patient = mockPatients.find((item) => item.id === patientId) ?? mockPatients[0];
  const totalUnitsTransfused = completedOrders.reduce((total, order) => total + order.unitsTransfused, 0);

  if (!allowed) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nurse access required"
        description="Switch to Nurse role to open completed blood order records."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Nursing - Completed Orders"
        title="Completed Orders"
        description="Review transfused blood orders and completed nursing instructions."
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
              <div className="text-xs font-medium text-muted-foreground">Completed Orders</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{completedOrders.length}</div>
            </div>
            <ClipboardCheck className="h-5 w-5 text-success" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Units Transfused</div>
              <div className="mt-1 text-2xl font-semibold text-foreground">{totalUnitsTransfused}</div>
            </div>
            <Droplet className="h-5 w-5 text-danger" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <div className="text-xs font-medium text-muted-foreground">Record Status</div>
              <div className="mt-2">
                <Badge tone="success">Verified</Badge>
              </div>
            </div>
            <FileText className="h-5 w-5 text-info" />
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <div className="w-full max-w-md space-y-2">
            {/* <label className="text-xs font-medium text-muted-foreground" htmlFor="completed-order-search">
              Search completed orders
            </label> */}
            <SearchInput id="completed-order-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search product, reason, date..." />
            {/* <CardDescription>Search filters the completed order list below.</CardDescription> */}
          </div>
          <Badge tone="success">Read only</Badge>
        </CardHeader>
        <CardContent>
          <CompletedOrdersTable searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  );
}
