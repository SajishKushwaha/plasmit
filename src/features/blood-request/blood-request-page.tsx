"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Droplet, Eye, Send, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { PageHeader } from "@/components/shell/page-header";
import type { Role, StatusTone } from "@/types";

type BloodRequest = {
  id: string;
  patientName: string;
  // uhid: string;
  bloodGroup: string;
  unitsOrdered: number;
  date: string;
  bloodProducts: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
  instructions: string;
  status: "Pending" | "Sent" | "Received";
};

type RequestAction = "send" | "view";

const bloodBankRoles: Role[] = ["Blood Bank", "Super Admin", "Hospital Admin"];

const initialBloodRequests: BloodRequest[] = [
  {
    id: "BR-1021",
    patientName: "Rahul Sharma",
    // uhid: "UH1021",
    bloodGroup: "A+",
    unitsOrdered: 3,
    date: "20 May 2026",
    bloodProducts: "Packed RBC",
    reason: "Low Hemoglobin",
    priority: "High",
    instructions: "Crossmatch before issue",
    status: "Pending",
  },
  {
    id: "BR-1022",
    patientName: "Amit Verma",
    // uhid: "UH1022",
    bloodGroup: "O+",
    unitsOrdered: 4,
    date: "20 May 2026",
    bloodProducts: "Platelets",
    reason: "Platelet deficiency",
    priority: "Medium",
    instructions: "Handle carefully",
    status: "Sent",
  },
  {
    id: "BR-1023",
    patientName: "Sneha Patil",
    // uhid: "UH1023",
    bloodGroup: "B+",
    unitsOrdered: 5,
    date: "19 May 2026",
    bloodProducts: "Fresh Frozen Plasma",
    reason: "Surgery",
    priority: "Low",
    instructions: "Keep sample available",
    status: "Received",
  },
];

const priorityTone: Record<BloodRequest["priority"], StatusTone> = {
  High: "danger",
  Medium: "warning",
  Low: "success",
};

const statusTone: Record<BloodRequest["status"], StatusTone> = {
  Pending: "warning",
  Sent: "info",
  Received: "success",
};

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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
      {...props}
    />
  );
}

function RequestDrawer({
  action,
  request,
  onClose,
  onSend,
}: {
  action: RequestAction | null;
  request: BloodRequest | null;
  onClose: () => void;
  onSend: (request: BloodRequest) => void;
}) {
  const open = Boolean(action && request);
  const isSend = action === "send";

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onClose()}
      title={isSend ? "Send Blood" : "Blood Request Details"}
      description={request?.id}
      footer={
        request ? (
          <div className="flex justify-end gap-2">
            <Button className="bg-danger" onClick={onClose}>
              {isSend ? "Cancel" : "Close"}
            </Button>
            {isSend ? (
              <Button onClick={() => onSend(request)}>
                <Send className="h-4 w-4" />
                Confirm & Send
              </Button>
            ) : null}
          </div>
        ) : null
      }
    >
      {request ? (
        <div className="space-y-4">
          {isSend ? (
            <AlertBanner icon={ShieldCheck} tone="info" title="Crossmatch verification">
              Confirm blood unit details before sending this request to nursing.
            </AlertBanner>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Patient Name" value={request.patientName} />
            {/* <DetailItem label="UHID" value={request.uhid} /> */}
            <DetailItem label="Blood Group" value={request.bloodGroup} />
            <DetailItem label="Blood Product" value={request.bloodProducts} />
            <DetailItem label="Units Ordered" value={request.unitsOrdered} />
            <DetailItem label="Status" value={<Badge tone={statusTone[request.status]}>{request.status}</Badge>} />
          </div>

          {isSend ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <FieldLabel>Blood Unit No</FieldLabel>
                <Input defaultValue="BU-10231" placeholder="Enter unit no" />
              </label>
              <label className="space-y-2">
                <FieldLabel>Ordered Units</FieldLabel>
                <Input value={request.unitsOrdered} readOnly />
              </label>
              <label className="space-y-2 sm:col-span-2">
                <FieldLabel>Notes</FieldLabel>
                <Textarea rows={4} defaultValue="Crossmatch verified" />
              </label>
            </div>
          ) : (
            <>
              <DetailItem label="Reason" value={request.reason} />
              <div className="rounded-md border border-border bg-surface-muted p-3">
                <div className="text-xs font-medium text-muted-foreground">Instructions</div>
                <p className="mt-1 text-sm text-foreground">{request.instructions}</p>
              </div>
            </>
          )}
        </div>
      ) : null}
    </Drawer>
  );
}

function BloodRequestsTable({ searchQuery }: { searchQuery: string }) {
  const [requests, setRequests] = React.useState(initialBloodRequests);
  const [drawerState, setDrawerState] = React.useState<{ action: RequestAction; request: BloodRequest } | null>(null);

  const handleSend = React.useCallback((request: BloodRequest) => {
    setRequests((current) =>
      current.map((item) => (item.id === request.id ? { ...item, status: "Sent" } : item)),
    );
    setDrawerState(null);
    toast.success(`${request.id} sent to nursing`);
  }, []);

  const columns = React.useMemo<ColumnDef<BloodRequest>[]>(
    () => [
      {
        header: "Patient",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-foreground">{row.original.patientName}</div>
            {/* <div className="text-xs text-muted-foreground">{row.original.uhid}</div> */}
          </div>
        ),
      },
      { header: "Blood Group", accessorKey: "bloodGroup" },
      {
        header: "Blood Product",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Droplet className="h-4 w-4 text-danger" />
            <span>{row.original.bloodProducts}</span>
          </div>
        ),
      },
      { header: "Units", accessorKey: "unitsOrdered" },
      { header: "Reason", accessorKey: "reason" },
      { header: "Instructions", accessorKey: "instructions" },
      {
        header: "Priority",
        cell: ({ row }) => <Badge tone={priorityTone[row.original.priority]}>{row.original.priority}</Badge>,
      },
      // {
      //   header: "Status",
      //   cell: ({ row }) => <Badge tone={statusTone[row.original.status]}>{row.original.status}</Badge>,
      // },
      {
        header: "Actions",
        cell: ({ row }) => {
          const request = row.original;
          return request.status === "Pending" ? (
            <Button size="sm" onClick={() => setDrawerState({ action: "send", request })}>
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setDrawerState({ action: "view", request })}>
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
          );
        },
      },
    ],
    [],
  );

  const filteredRequests = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return requests;
    }

    return requests.filter((request) =>
      [
        request.id,
        request.patientName,
        // request.uhid,
        request.bloodGroup,
        request.unitsOrdered,
        request.date,
        request.bloodProducts,
        request.reason,
        request.priority,
        request.instructions,
        request.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [requests, searchQuery]);

  return (
    <>
      <DataTable columns={columns} data={filteredRequests} />
      <RequestDrawer
        action={drawerState?.action ?? null}
        request={drawerState?.request ?? null}
        onClose={() => setDrawerState(null)}
        onSend={handleSend}
      />
    </>
  );
}

export function BloodRequestPage() {
  const { role } = useRole();
  const [searchQuery, setSearchQuery] = React.useState("");
  const allowed = bloodBankRoles.includes(role);
  const pendingCount = initialBloodRequests.filter((request) => request.status === "Pending").length;
  const sentCount = initialBloodRequests.filter((request) => request.status === "Sent").length;
  const receivedCount = initialBloodRequests.filter((request) => request.status === "Received").length;

  if (!allowed) {
    return (
      <EmptyState
        icon={UserRound}
        title="Blood Bank access required"
        description="Switch to Blood Bank role to open blood request processing."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Blood Bank"
        title="Blood Requests"
        description="Review hospital requests, verify units, and send blood products for administration."
        className="static mx-0 border-b bg-transparent px-0 py-2"
      />

      <div className="grid gap-3 md:grid-cols-3">
     <Card>
        <CardContent className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Pending Requests:
            </div>

            <div className="text-2xl font-semibold text-foreground">
              {pendingCount}
            </div>
          </div>

          <Send className="h-5 w-5 text-warning" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Sent Requests:
            </div>

            <div className="text-2xl font-semibold text-foreground">
              {sentCount}
            </div>
          </div>

          <Send className="h-5 w-5 text-warning" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-muted-foreground">
              Received Requests:
            </div>

            <div className="text-2xl font-semibold text-foreground">
              {receivedCount}
            </div>
          </div>

          <Send className="h-5 w-5 text-warning" />
        </CardContent>
      </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="w-full max-w-md space-y-2">
            {/* <label className="text-xs font-medium text-muted-foreground" htmlFor="blood-request-search">
              Search requests
            </label> */}
            <SearchInput id="blood-request-search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search patient, blood group,unit,product,reason..." />
            {/* <CardDescription>Search filters the blood request queue below.</CardDescription> */}
          </div>
          <Badge tone="info">Blood Bank</Badge>
        </CardHeader>
        <CardContent>
          <BloodRequestsTable searchQuery={searchQuery} />
        </CardContent>
      </Card>
    </div>
  );
}
