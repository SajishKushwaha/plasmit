"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, Eye, FileText, FlaskConical, Printer, RefreshCcw, ScanSearch, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailRow, FilterBar, NativeSelect } from "@/features/operations/admin/admin-shared";
import { PatientMini } from "@/features/operations/appointments/appointment-shared";
import { CriticalBanner, DiagnosticStatus, ProtectedDiagnostics } from "@/features/diagnostics/diagnostics/diagnostics-shared";
import {
  getLabOrderById,
  getRadiologyOrderById,
  mockLabOrders,
  mockLabResults,
  mockLabTests,
  mockRadiologyOrders,
  mockRadiologyReports,
} from "@/data/diagnostics";
import { mockAdmissions } from "@/data/ipd";
import { getPatientById } from "@/data/patients";

type ResultCategory = "Lab" | "Radiology";

type DoctorResultRow = {
  id: string;
  category: ResultCategory;
  orderNo: string;
  patientId: string;
  patientName: string;
  uhid: string;
  bedWard: string;
  source: string;
  testName: string;
  priority: string;
  status: string;
  critical: boolean;
  summary: string;
  owner: string;
  updatedAt: string;
  orderRoute: string;
  rawId: string;
};

const allStatuses = ["All status", "Critical", "Draft", "Approval pending", "Correction requested", "Report draft", "Approved"];
const allCategories = ["All result", "Lab", "Radiology"];

function buildPatientName(patientId: string) {
  const patient = getPatientById(patientId);
  if (!patient) return "Unknown patient";
  return `${patient.firstName} ${patient.lastName}`;
}

function getBedWard(patientId: string) {
  const admission = mockAdmissions.find((item) => item.patientId === patientId);
  return admission ? `${admission.ward} / ${admission.bedId}` : "No active IPD bed";
}

function buildLabRows(): DoctorResultRow[] {
  return mockLabResults.map((result) => {
    const order = getLabOrderById(result.orderId);
    const patient = order ? getPatientById(order.patientId) : undefined;
    const test = mockLabTests.find((item) => item.id === result.testId);
    return {
      id: `lab-${result.id}`,
      category: "Lab",
      orderNo: order?.orderNo ?? "Unknown order",
      patientId: order?.patientId ?? "",
      patientName: order ? buildPatientName(order.patientId) : "Unknown patient",
      uhid: patient?.uhid ?? "Unknown",
      bedWard: order ? getBedWard(order.patientId) : "No active IPD bed",
      source: order?.source ?? "Lab",
      testName: test?.name ?? "Lab result",
      priority: order?.priority ?? "Routine",
      status: result.status,
      critical: result.critical,
      summary: result.parameters.map((item) => `${item.parameter}: ${item.value} ${item.unit}`).join(" | "),
      owner: result.approvedBy === "Pending" ? result.enteredBy : result.approvedBy,
      updatedAt: result.approvedAt === "Pending" ? order?.orderedAt ?? "Pending" : result.approvedAt,
      orderRoute: "/laboratory/results",
      rawId: result.id,
    };
  });
}

function buildRadiologyRows(): DoctorResultRow[] {
  return mockRadiologyReports.map((report) => {
    const order = getRadiologyOrderById(report.orderId);
    const patient = order ? getPatientById(order.patientId) : undefined;

    return {
      id: `radiology-${report.id}`,
      category: "Radiology",
      orderNo: order?.orderNo ?? "Unknown order",
      patientId: order?.patientId ?? "",
      patientName: order ? buildPatientName(order.patientId) : "Unknown patient",
      uhid: patient?.uhid ?? "Unknown",
      bedWard: order ? getBedWard(order.patientId) : "No active IPD bed",
      source: order?.source ?? "Radiology",
      testName: order ? `${order.modality} - ${order.study}` : "Radiology report",
      priority: order?.priority ?? "Routine",
      status: report.status,
      critical: report.criticalFinding,
      summary: report.impression,
      owner: report.radiologist,
      updatedAt: report.approvedAt,
      orderRoute: "/radiology/reports",
      rawId: report.id,
    };
  });
}

function getRows() {
  return [...buildLabRows(), ...buildRadiologyRows()].sort((a, b) => Number(b.critical) - Number(a.critical));
}

function includes(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export function ResultsList() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All result");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<DoctorResultRow | null>(null);
  const rows = React.useMemo(() => getRows(), []);
  const filteredRows = rows.filter((row) => {
    const text = `${row.category} ${row.orderNo} ${row.patientName} ${row.uhid} ${row.bedWard} ${row.testName} ${row.priority} ${row.status} ${row.summary}`;
    return includes(text, search) && (category === "All result" || row.category === category) && (status === "All status" || row.status === status);
  });
  const labPending = mockLabOrders.filter((item) => ["Not entered", "Draft", "Approval pending"].includes(item.resultStatus)).length;
  const radiologyPending = mockRadiologyOrders.filter((item) => ["Not entered", "Report draft", "Approval pending"].includes(item.reportStatus)).length;
  const columns = React.useMemo<ColumnDef<DoctorResultRow>[]>(() => [
    { header: "Patient", cell: ({ row }) => <PatientMini patientId={row.original.patientId} /> },
    { header: "IPD / bed", accessorKey: "bedWard" },
    { header: "Result", cell: ({ row }) => <div><div className="font-semibold">{row.original.testName}</div><div className="text-xs text-muted-foreground">{row.original.category} | {row.original.orderNo}</div></div> },
    { header: "Priority", cell: ({ row }) => <DiagnosticStatus status={row.original.priority} /> },
    { header: "Status", cell: ({ row }) => <DiagnosticStatus status={row.original.status} /> },
    { header: "Critical", cell: ({ row }) => row.original.critical ? <Badge tone="critical">Critical</Badge> : <Badge tone="muted">No</Badge> },
    { header: "Summary", cell: ({ row }) => <span className="line-clamp-2 text-xs">{row.original.summary}</span> },
    { header: "Owner", accessorKey: "owner" },
    { header: "Action", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-4 w-4" />View</Button> },
  ], []);

  return (
    <ProtectedDiagnostics module="lab">
      {() => (
        <>
          <PageHeader
            eyebrow="Doctor IPD"
            title="Result"
            description="Patient-wise lab and radiology result review with IPD bed context, priority, status, critical flags, and report details."
            actions={
              <>
                <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
                <Button variant="outline" onClick={() => toast.info("Result list refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
              </>
            }
          />
          <SummaryGrid>
            <StatCard label="Total results" value={rows.length} change="Lab + Radiology" context="Current mock worklist" tone="info" icon={FileText} />
            <StatCard label="Critical" value={rows.filter((row) => row.critical).length} change="Review now" context="Visible flag" tone="critical" icon={AlertTriangle} />
            <StatCard label="Lab pending" value={labPending} change="LIS" context="Draft / approval" tone="warning" icon={FlaskConical} />
            <StatCard label="Radiology pending" value={radiologyPending} change="RIS" context="Draft / approval" tone="warning" icon={ScanSearch} />
          </SummaryGrid>
          <Tabs defaultValue="list" className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Result List</TabsTrigger>
              <TabsTrigger value="critical">Critical</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="space-y-4">
              <FilterBar search={search} onSearch={setSearch} placeholder="Search patient, UHID, bed, order, test, result...">
                <NativeSelect label="Type" value={category} onChange={setCategory} options={allCategories} />
                <NativeSelect label="Status" value={status} onChange={setStatus} options={allStatuses} />
              </FilterBar>
              <DataTable data={filteredRows} columns={columns} />
            </TabsContent>
            <TabsContent value="critical" className="space-y-4">
              {rows.some((row) => row.critical) ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {rows.filter((row) => row.critical).map((row) => (
                    <Card key={row.id}>
                      <CardContent className="space-y-3 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold">{row.patientName}</div>
                            <div className="text-xs text-muted-foreground">{row.uhid} | {row.bedWard}</div>
                          </div>
                          <Badge tone="critical">{row.category}</Badge>
                        </div>
                        <CriticalBanner>{row.testName}: {row.summary}</CriticalBanner>
                        <Button size="sm" variant="outline" onClick={() => setSelected(row)}><Eye className="h-4 w-4" />Open detail</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Search} title="No critical results" description="No current result row is marked critical." />
              )}
            </TabsContent>
          </Tabs>
          <ResultDetailDrawer result={selected} open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} />
        </>
      )}
    </ProtectedDiagnostics>
  );
}

function ResultDetailDrawer({ result, open, onOpenChange }: { result: DoctorResultRow | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const labResult = result?.category === "Lab" ? mockLabResults.find((item) => item.id === result.rawId) : undefined;
  const radiologyReport = result?.category === "Radiology" ? mockRadiologyReports.find((item) => item.id === result.rawId) : undefined;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="Result detail" description={result?.orderNo}>
      {result ? (
        <div className="space-y-4">
          {result.critical ? <CriticalBanner>Critical result requires doctor review and acknowledgement before clinical closure.</CriticalBanner> : null}
          <Card>
            <CardContent className="space-y-1 p-4">
              <DetailRow label="Patient" value={`${result.patientName} (${result.uhid})`} />
              <DetailRow label="IPD / bed" value={result.bedWard} />
              <DetailRow label="Order" value={`${result.orderNo} | ${result.source}`} />
              <DetailRow label="Result" value={result.testName} />
              <DetailRow label="Priority" value={<DiagnosticStatus status={result.priority} />} />
              <DetailRow label="Status" value={<DiagnosticStatus status={result.status} />} />
              <DetailRow label="Owner" value={result.owner} />
              <DetailRow label="Updated" value={result.updatedAt} />
            </CardContent>
          </Card>
          {labResult ? <LabParameterPanel result={labResult} /> : null}
          {radiologyReport ? <RadiologyReportPanel report={radiologyReport} /> : null}
          <Button asChild className="w-full" variant="outline">
            <Link href={result.orderRoute}>Open source module</Link>
          </Button>
        </div>
      ) : null}
    </Drawer>
  );
}

function LabParameterPanel({ result }: { result: (typeof mockLabResults)[number] }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="text-sm font-semibold">Parameter details</div>
        <div className="space-y-2">
          {result.parameters.map((item) => (
            <div className="rounded-md border border-border bg-surface-muted p-3 text-xs" key={item.parameter}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{item.parameter}</span>
                <DiagnosticStatus status={item.flag} />
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <span>Value: <strong>{item.value} {item.unit}</strong></span>
                <span>Reference: {item.referenceRange}</span>
                <span>Previous: {item.previousValue}</span>
                <span>{item.comment}</span>
              </div>
            </div>
          ))}
        </div>
        <DetailRow label="Version" value={result.version} />
        <DetailRow label="Correction" value={result.correctionReason || "None"} />
        <DetailRow label="Addendum" value={result.addendum || "None"} />
      </CardContent>
    </Card>
  );
}

function RadiologyReportPanel({ report }: { report: (typeof mockRadiologyReports)[number] }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="text-sm font-semibold">Radiology report</div>
        <DetailRow label="Findings" value={report.findings} />
        <DetailRow label="Impression" value={report.impression} />
        <DetailRow label="Version" value={report.version} />
        <DetailRow label="Correction" value={report.correctionReason || "None"} />
        <DetailRow label="Addendum" value={report.addendum || "None"} />
      </CardContent>
    </Card>
  );
}
