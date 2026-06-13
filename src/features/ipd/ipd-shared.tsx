"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Activity, AlertTriangle, BedDouble, LockKeyhole, Printer, RefreshCcw, Save, Search, ShieldAlert, UserRound } from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { PatientAlertChips } from "@/features/patients/patient-shared";
import { rapidAllowedRoles } from "@/features/rapid-review/rapid-review-data";
import { getPatientById, mockPatients, mockPatientVisits } from "@/data/patients";
import { mockAdmissions, mockInfectionIsolationFlags } from "@/data/ipd";
import type { AdmissionRecord, BedRecord, Role, StatusTone, TriagePriority } from "@/types";

export const ipdAccessRoles: Role[] = ["Super Admin", "Hospital Admin", "Doctor", "Doctor IPD", "Nurse", "Receptionist", "Billing Executive", "Pharmacist", "Management"];
export const ipdReadOnlyRoles: Role[] = ["Management", "Pharmacist"];

export type IpdPatientWorkspaceContext = {
  name: string;
  id: string;
  uhid: string;
  ageSex: string;
  wardBed: string;
  consultant: string;
  diagnosis: string;
};

export function useIpdAccess() {
  const { role } = useRole();
  return { role, allowed: ipdAccessRoles.includes(role), readOnly: ipdReadOnlyRoles.includes(role) };
}

export function ProtectedIpd({
  children,
  hidePatientHeader = false,
  patientContext,
}: {
  children: (state: { role: Role; readOnly: boolean }) => React.ReactNode;
  hidePatientHeader?: boolean;
  patientContext?: IpdPatientWorkspaceContext;
}) {
  const access = useIpdAccess();
  if (!access.allowed) {
    return <EmptyState icon={LockKeyhole} title="IPD/Emergency permission required" description="Your current static role cannot access Phase 6 inpatient or emergency workflows." />;
  }
  return (
    <div className="space-y-4">
      {hidePatientHeader ? null : <IpdPatientWorkspaceHeader patientContext={patientContext} />}
      {children({ role: access.role, readOnly: access.readOnly })}
    </div>
  );
}

export function ipdTone(status: string): StatusTone {
  if (["Available", "Completed", "Administered", "Discharged", "Approved", "Arrived", "Paid placeholder", "Active"].includes(status)) return "success";
  if (["Requested", "Reserved", "Cleaning", "Pending", "Due", "Due now", "Discharge initiated", "Triage pending", "Assigned", "Dispatched", "Nearing limit"].includes(status)) return "warning";
  if (["Overdue", "Missed", "Refused", "Delayed", "Maintenance", "Blocked", "Cancelled", "Deceased placeholder"].includes(status)) return "danger";
  if (["In ICU", "Isolation", "Red: immediate", "Orange: very urgent", "Critical", "Stabilizing"].includes(status)) return "critical";
  return "info";
}

export function IpdStatus({ status }: { status: string }) {
  return <StatusPill tone={ipdTone(status)}>{status}</StatusPill>;
}

export function TriageBadge({ priority }: { priority: TriagePriority | string }) {
  return <StatusPill tone={ipdTone(priority)}>{priority}</StatusPill>;
}

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

function IpdPatientWorkspaceHeader({ patientContext }: { patientContext?: IpdPatientWorkspaceContext }) {
  const { role } = useRole();
  const rapidReviewAccess = rapidAllowedRoles.includes(role);
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
  const displayFields = patientContext
    ? [
        ["IPD/OPD No.", patientContext.id],
        ["Ward/Bed", patientContext.wardBed],
        ["Consultant", patientContext.consultant],
        ["Diagnosis", patientContext.diagnosis],
      ]
    : fields;
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
              <h1 className="truncate text-lg font-bold text-foreground">{patientContext?.name ?? patientName(patient)}</h1>
              <Badge tone="muted">{patientContext?.id ?? patient.id}</Badge>
              {!patientContext && (nonAllergyFlags.length ? nonAllergyFlags : []).map((flag) => (
                <Badge key={flag} tone="warning">{flag}</Badge>
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
              <span>{patientContext?.uhid ?? patient.uhid}</span>
              <span>{patientContext?.ageSex ?? `${patient.age}/${patient.gender.charAt(0)}`}</span>
              <span>{patientContext?.wardBed ?? fields[1][1]}</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap justify-start gap-2 xl:justify-end">
            {!patientContext ? <div className="relative min-w-64 flex-1 xl:max-w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search IPD patient"
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
            </div> : null}
            {rapidReviewAccess ? (
              <Button size="sm" variant="outline" asChild>
                <Link href="/rapid-review?tab=entry">
                  <Activity className="h-4 w-4" />Rapid Review
                </Link>
              </Button>
            ) : null}
            <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Last IPD draft restored")}><RefreshCcw className="h-4 w-4" />Restore</Button>
            <Button size="sm" onClick={() => toast.success("IPD draft autosaved")}><Save className="h-4 w-4" />Save</Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
          {displayFields.map(([label, value]) => (
            <div className="rounded-md bg-surface-muted px-2.5 py-1.5" key={label}>
              <span className="font-semibold text-muted-foreground">{label}: </span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          ))}
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge tone="info">Autosave 20 sec</Badge>
            <Badge tone="muted">Shortcuts ready</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InpatientHeader({ admission }: { admission: AdmissionRecord }) {
  const patient = getPatientById(admission.patientId);
  const isolation = mockInfectionIsolationFlags.find((flag) => flag.patientId === admission.patientId);
  if (!patient) return null;
  return (
    <Card className="sticky top-[132px] z-20">
      <CardContent className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg border border-border bg-surface-muted p-3"><UserRound className="h-5 w-5 text-muted-foreground" /></div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{patient.firstName} {patient.lastName}</span>
              <Badge tone="muted">{patient.uhid}</Badge>
              <Badge tone="info">{patient.age}/{patient.gender}</Badge>
              <Badge tone="warning">{admission.admissionNo}</Badge>
            </div>
            <div className="mt-2"><PatientAlertChips alerts={patient.alertFlags} /></div>
          </div>
        </div>
        <div className="grid gap-2 text-xs sm:grid-cols-2 xl:min-w-[420px]">
          <div className="rounded-md border border-border bg-surface-muted p-2">Bed: {admission.bedId}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Ward: {admission.ward}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Consultant: {admission.consultant}</div>
          <div className="rounded-md border border-border bg-surface-muted p-2">Status: {admission.status}</div>
        </div>
        {isolation ? <Badge tone="critical">{isolation.type}</Badge> : null}
      </CardContent>
    </Card>
  );
}

export function BedCard({ bed, onAction }: { bed: BedRecord; onAction?: (bed: BedRecord) => void }) {
  const patient = bed.patientId ? getPatientById(bed.patientId) : undefined;
  return (
    <Card>
      <CardContent className="space-y-3 p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold">{bed.bedNo}</div>
            <div className="text-xs text-muted-foreground">{bed.ward} • {bed.roomNo} • {bed.bedType}</div>
          </div>
          <IpdStatus status={bed.status} />
        </div>
        {patient ? <div className="rounded-md bg-surface-muted p-2 text-xs">{patient.firstName} {patient.lastName} • {patient.uhid}</div> : null}
        <div className="text-xs text-muted-foreground">{bed.statusReason}</div>
        <div className="flex flex-wrap gap-1">
          {bed.isIsolationCapable ? <Badge tone="critical">Isolation capable</Badge> : null}
          <Badge tone="muted">{bed.genderRestriction}</Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => onAction?.(bed)}><BedDouble className="h-3.5 w-3.5" />Actions</Button>
      </CardContent>
    </Card>
  );
}

export function InpatientSafetyPanel({ patientId }: { patientId: string }) {
  const patient = getPatientById(patientId);
  const isolation = mockInfectionIsolationFlags.find((flag) => flag.patientId === patientId);
  return (
    <div className="space-y-2">
      {patient?.alertFlags.length ? (
        <AlertBanner icon={ShieldAlert} tone="warning" title="Patient safety context">
          {patient.alertFlags.join(", ")}. These alerts remain visible across nursing, MAR, bed, and emergency workflows.
        </AlertBanner>
      ) : null}
      {isolation ? (
        <AlertBanner icon={AlertTriangle} tone="critical" title="Isolation / infection risk">
          {isolation.type}: {isolation.notes}
        </AlertBanner>
      ) : null}
    </div>
  );
}
