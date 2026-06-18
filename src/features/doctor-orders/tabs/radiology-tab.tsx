"use client";

import Link from "next/link";
import { CalendarClock, FileSearch, ScanSearch, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { DoctorOrdersPatientContext } from "@/features/doctor-orders/doctor-orders";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";
import { RadiologyStatusBadge } from "@/features/radiology/components/RadiologyStatusBadge";
import { radiologyPatients } from "@/features/radiology/data/patients";
import { radiologyOrders } from "@/features/radiology/data/radiologyOrders";
import { radiologyReports } from "@/features/radiology/data/reports";
import { radiologyTests } from "@/features/radiology/data/tests";
import { formatDateTime } from "@/features/radiology/utils/formatters";
import { priorityLabels } from "@/features/radiology/utils/status";

export function RadiologyTab({ patientContext }: { patientContext?: DoctorOrdersPatientContext }) {
  const radiologyPatient = patientContext?.radiologyPatientId
    ? radiologyPatients.find((patient) => patient.id === patientContext.radiologyPatientId)
    : undefined;
  const rows = patientContext?.radiologyPatientId
    ? radiologyOrders.filter((order) => order.patientId === patientContext.radiologyPatientId)
    : radiologyOrders;
  const displayPatientName = patientContext?.name ?? radiologyPatient?.name ?? "All patients";

  return (
    <div className="space-y-4">
      <Card className="border-border/80">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-base font-semibold text-foreground">Radiology Orders</div>
              {patientContext ? <Badge tone="info">Single patient</Badge> : <Badge tone="muted">All patients</Badge>}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {displayPatientName}
              {patientContext?.uhid ? ` | ${patientContext.uhid}` : null}
              {patientContext?.wardBed ? ` | ${patientContext.wardBed}` : null}
            </div>
            {patientContext?.diagnosis ? (
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                Diagnosis: <span className="text-foreground">{patientContext.diagnosis}</span>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/radiology/order-list">Open radiology worklist</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/radiology/orders/create">New radiology order</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((order) => {
            const patient = radiologyPatients.find((item) => item.id === order.patientId);
            const tests = order.testIds
              .map((testId) => radiologyTests.find((test) => test.id === testId)?.name ?? testId)
              .join(", ");
            const report = radiologyReports.find((item) => item.orderId === order.id);

            return (
              <Card className="border-border/80" key={order.id}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">{order.orderNo}</span>
                        <ModalityBadge modalityId={order.modalityId} />
                        <RadiologyStatusBadge compact status={order.status} />
                        <Badge tone={order.priority === "STAT" || order.priority === "EMERGENCY" ? "critical" : order.priority === "URGENT" ? "warning" : "muted"}>
                          {priorityLabels[order.priority]}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm font-medium text-foreground">{tests}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {patientContext ? displayPatientName : patient?.name ?? order.patientId}
                        {patientContext?.ageSex ? ` | ${patientContext.ageSex}` : patient ? ` | ${patient.age} yrs / ${patient.gender}` : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/radiology/orders/${order.id}`}>Details</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/results/radiology">Result</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <RadiologyInfo icon={CalendarClock} label="Scheduled" value={order.scheduledAt ? formatDateTime(order.scheduledAt) : "Not scheduled"} />
                    <RadiologyInfo icon={ScanSearch} label="Location" value={order.location} />
                    <RadiologyInfo icon={FileSearch} label="Report" value={report ? `${report.status}${report.critical ? " | Critical" : ""}` : "Pending"} />
                  </div>

                  <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm">
                    <div className="font-semibold text-foreground">{order.provisionalDiagnosis}</div>
                    <div className="mt-1 text-muted-foreground">{order.clinicalIndication}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={ScanSearch}
          title="No radiology orders for this patient"
          description="Create a radiology order to schedule imaging and track reports for the selected IPD patient."
        />
      )}
    </div>
  );
}

function RadiologyInfo({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
