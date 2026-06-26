"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import type { LdtOrderStatus } from "./types";

type AssessmentHistoryRow = {
  id: string;
  dateTime: string;
  assessment: string;
  value: string;
  documentedBy: string;
};

type IntakeOutputRow = {
  id: string;
  dateTime: string;
  volume: string;
  unit: string;
};

const historyRows: AssessmentHistoryRow[] = [
  { id: "hist-1", dateTime: "24-Jun-2026 10:00", assessment: "Site Assessment", value: "Clean", documentedBy: "Nurse Mary" },
  { id: "hist-2", dateTime: "24-Jun-2026 14:00", assessment: "Dressing Status", value: "Intact", documentedBy: "Nurse Mary" },
  { id: "hist-3", dateTime: "24-Jun-2026 18:00", assessment: "LDT Status", value: "Functioning", documentedBy: "Nurse Mary" },
  { id: "hist-4", dateTime: "25-Jun-2026 08:30", assessment: "Signs of Infection", value: "Absent", documentedBy: "Nurse John" },
  { id: "hist-5", dateTime: "25-Jun-2026 12:00", assessment: "Complications", value: "None", documentedBy: "Nurse John" },
];

const intakeOutputRows: IntakeOutputRow[] = [
  { id: "io-1", dateTime: "24-Jun-2026 12:00", volume: "100", unit: "mL" },
  { id: "io-2", dateTime: "24-Jun-2026 18:00", volume: "75", unit: "mL" },
];

type ReviewModel = {
  ldtType: string;
  orderNo: string;
  status: LdtOrderStatus | "Ordered" | "Inserted" | "Active" | "Removed" | "Cancelled";
  priority: string;
  orderedBy: string;
  orderDate: string;
  orderTime: string;
  indication: string;
  clinicalNotes: string;
  insertedBy: string;
  insertionDate: string;
  insertionTime: string;
  insertionSite: string;
  placementVerification: string;
  verificationBy: string;
  currentAssessment: Array<{ assessment: string; currentValue: string }>;
  showIntakeOutput: boolean;
  removalBy: string;
  removalDate: string;
  removalTime: string;
  removalReason: string;
};

const reviewData: ReviewModel = {
  ldtType: "PICC Double Lumen",
  orderNo: "LDT-002",
  status: "Inserted",
  priority: "Urgent",
  orderedBy: "Dr. Sharma",
  orderDate: "24-Jun-2026",
  orderTime: "09:15",
  indication: "Urine output monitoring and access support",
  clinicalNotes: "Patient requires close monitoring for fluid balance.",
  insertedBy: "Nurse Mary",
  insertionDate: "24-Jun-2026",
  insertionTime: "10:45",
  insertionSite: "Right upper arm",
  placementVerification: "X-ray verified",
  verificationBy: "Dr. Sharma",
  currentAssessment: [
    { assessment: "Site Assessment", currentValue: "Clean" },
    { assessment: "LDT Status", currentValue: "Functioning" },
    { assessment: "Dressing Status", currentValue: "Intact" },
    { assessment: "Dressing Type", currentValue: "Transparent" },
    { assessment: "Signs of Infection", currentValue: "Absent" },
    { assessment: "Complications", currentValue: "None" },
  ],
  showIntakeOutput: true,
  removalBy: "",
  removalDate: "",
  removalTime: "",
  removalReason: "",
};

export function LdtResultReviewTab() {
  const [search, setSearch] = React.useState("");

  const filteredHistory = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return historyRows.filter((row) => `${row.dateTime} ${row.assessment} ${row.value} ${row.documentedBy}`.toLowerCase().includes(query));
  }, [search]);

  const historyColumns = React.useMemo<ColumnDef<AssessmentHistoryRow>[]>(
    () => [
      { header: "Date & Time", accessorKey: "dateTime" },
      { header: "Assessment", accessorKey: "assessment" },
      { header: "Value", accessorKey: "value" },
      { header: "Documented By", accessorKey: "documentedBy" },
    ],
    [],
  );

  const intakeOutputColumns = React.useMemo<ColumnDef<IntakeOutputRow>[]>(
    () => [
      { header: "Date & Time", accessorKey: "dateTime" },
      { header: "Volume", accessorKey: "volume" },
      { header: "Unit", accessorKey: "unit" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <HeaderStat label="LDT Type" value={reviewData.ldtType} />
            <HeaderStat label="Order No" value={reviewData.orderNo} />
            <HeaderStat label="Status" value={<StatusBadge status={reviewData.status} />} />
            <HeaderStat label="Priority" value={reviewData.priority} />
            <HeaderStat label="Ordered By" value={reviewData.orderedBy} />
            <HeaderStat label="Order Date" value={`${reviewData.orderDate} ${reviewData.orderTime}`} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-4">
            <SectionTitle title="LDT Information" />
            <DetailGrid
              items={[
                { label: "LDT Type", value: reviewData.ldtType },
                { label: "Priority", value: reviewData.priority },
                { label: "Indication / Reason", value: reviewData.indication },
                { label: "Clinical Notes", value: reviewData.clinicalNotes },
                { label: "Ordered By", value: reviewData.orderedBy },
                { label: "Order Date & Time", value: `${reviewData.orderDate} ${reviewData.orderTime}` },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <SectionTitle title="Insertion Details" />
            <DetailGrid
              items={[
                { label: "Inserted By", value: reviewData.insertedBy },
                { label: "Insertion Date", value: reviewData.insertionDate },
                { label: "Insertion Time", value: reviewData.insertionTime },
                { label: "Insertion Site", value: reviewData.insertionSite },
                { label: "Placement Verification", value: reviewData.placementVerification },
                { label: "Verification By", value: reviewData.verificationBy },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <SectionTitle title="Current Assessment" />
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-[640px] w-full border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Assessment</th>
                  <th className="px-4 py-3">Current Value</th>
                </tr>
              </thead>
              <tbody>
                {reviewData.currentAssessment.map((row) => (
                  <tr key={row.assessment} className="border-t border-border">
                    <td className="px-4 py-3">{row.assessment}</td>
                    <td className="px-4 py-3">{row.currentValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle title="Assessment History" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assessment history..." aria-label="Search assessment history" className="sm:max-w-xs" />
          </div>
          <DataTable data={filteredHistory} columns={historyColumns} />
        </CardContent>
      </Card>

      {reviewData.showIntakeOutput ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <SectionTitle title="Intake / Output" />
            <DataTable data={intakeOutputRows} columns={intakeOutputColumns} />
          </CardContent>
        </Card>
      ) : null}

      {reviewData.status === "Removed" ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <SectionTitle title="Removal Details" />
            <DetailGrid
              items={[
                { label: "Removed By", value: reviewData.removalBy || "-" },
                { label: "Removal Date", value: reviewData.removalDate || "-" },
                { label: "Removal Time", value: reviewData.removalTime || "-" },
                { label: "Removal Reason", value: reviewData.removalReason || "-" },
                { label: "Actions", value: "Read-only" },
              ]}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Removed" || status === "Cancelled"
      ? "danger"
      : status === "Active" || status === "Inserted"
        ? "info"
        : "warning";

  return <Badge tone={tone as never}>{status}</Badge>;
}

function HeaderStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted/30 p-3">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function DetailGrid({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-surface-muted/30 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-sm font-semibold text-foreground">{title}</h3>;
}
