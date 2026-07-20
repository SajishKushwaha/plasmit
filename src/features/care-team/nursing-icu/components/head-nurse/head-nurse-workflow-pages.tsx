"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Search, Users, ClipboardCheck, ArrowRightLeft, ShieldCheck, GitCompareArrows, FileText, Clock3, CheckCircle, AlertTriangle, ClipboardList, WandSparkles, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/features/operations/admin/admin-shared";
import { cn } from "@/lib/utils";
import { icuPatients } from "../../nursing-icu-data";
import {
  getHeadNurseAdmissionByPatientId,
  headNurseUnitNurseOptions,
  useHeadNurseAdmissions,
  type HeadNurseAdmission,
} from "../../head-nurse-workflow-state";

const workflowRoutes = {
  review: "/nursing-icu/head-nurse-console/review-new-admission",
  assign: "/nursing-icu/head-nurse-console/assign-patient-to-unit-nurse",
  audit: "/nursing-icu/head-nurse-console/audit-and-control",
  verify: "/nursing-icu/head-nurse-console/verify-handover",
} as const;

type WorkflowMode = keyof typeof workflowRoutes;

function statusTone(status?: string | null) {
  const lower = (status ?? "").toLowerCase();
  if (lower.includes("complete") || lower.includes("verified") || lower.includes("reviewed") || lower.includes("assigned") || lower.includes("clear")) return "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200";
  if (lower.includes("pending") || lower.includes("waiting") || lower.includes("under") || lower.includes("due") || lower.includes("running") || lower.includes("open")) return "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200";
  if (lower.includes("failed") || lower.includes("hold") || lower.includes("critical") || lower.includes("not ready")) return "bg-red-600 text-white border-red-600 shadow-sm shadow-red-200";
  return "bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200";
}

function tableCellTone(status?: string | null) {
  const lower = (status ?? "").toLowerCase();
  if (lower.includes("clear") || lower.includes("verified") || lower.includes("completed") || lower.includes("assigned")) return "bg-emerald-500";
  if (lower.includes("pending") || lower.includes("waiting") || lower.includes("under") || lower.includes("due") || lower.includes("running") || lower.includes("open")) return "bg-orange-500";
  if (lower.includes("failed") || lower.includes("hold") || lower.includes("critical") || lower.includes("not ready")) return "bg-red-600";
  return "bg-sky-600";
}

function CollapsibleCommandPanel({
  children,
  summary,
  title,
}: {
  children: React.ReactNode;
  summary: string;
  title: string;
}) {
  const panelId = React.useId();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]">
      <input className="peer sr-only" id={panelId} type="checkbox" />
      <label className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition duration-150 hover:bg-sky-50 peer-checked:[&_svg]:rotate-180" htmlFor={panelId}>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-950">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-slate-500">{summary}</span>
        </span>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-600 shadow-sm">
          <ChevronDown className="h-4 w-4 transition-transform" />
        </span>
      </label>
      <div className="hidden border-t border-slate-100 peer-checked:block">{children}</div>
    </section>
  );
}
function patientToAdmission(patientId?: string) {
  return patientId ? getHeadNurseAdmissionByPatientId(patientId) ?? null : null;
}

function DashboardCommandMetric({ label, value, tone }: { label: string; value: React.ReactNode; tone: "info" | "warning" | "danger" | "success" | "critical" | "purple" | "muted" }) {
  const toneClass = dashboardMetricToneClass(tone);
  return (
    <div className={cn("inline-flex min-w-32 shrink-0 items-center justify-between gap-3 rounded-full border px-3 py-1.5 shadow-sm", toneClass)}>
      <span className="text-[11px] font-bold uppercase">{label}</span>
      <span className="text-sm font-black">{value}</span>
    </div>
  );
}

function dashboardMetricToneClass(tone: "info" | "warning" | "danger" | "success" | "critical" | "purple" | "muted") {
  if (tone === "success") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (tone === "warning") return "border-orange-200 bg-orange-50 text-orange-800";
  if (tone === "danger" || tone === "critical") return "border-red-200 bg-red-50 text-red-800";
  if (tone === "purple") return "border-violet-200 bg-violet-50 text-violet-800";
  if (tone === "muted") return "border-slate-200 bg-slate-50 text-slate-600";
  return "border-sky-200 bg-sky-50 text-sky-800";
}

function normalizePatientId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function useHeadNursePatientContext() {
  const searchParams = useSearchParams();
  const requestedPatientId = searchParams.get("patientId") ?? "";
  const { admissions, updateReview, assignUnitNurse } = useHeadNurseAdmissions();
  const [query, setQuery] = React.useState("");
  const initialAdmission = React.useMemo(() => {
    const normalized = normalizePatientId(requestedPatientId);
    return admissions.find((admission) => normalizePatientId(admission.patientId) === normalized) ?? admissions[0] ?? null;
  }, [admissions, requestedPatientId]);
  const [selectedPatientId, setSelectedPatientId] = React.useState(initialAdmission?.patientId || requestedPatientId || admissions[0]?.patientId || "");

  React.useEffect(() => {
    if (requestedPatientId) {
      const matchedAdmission = admissions.find((admission) => normalizePatientId(admission.patientId) === normalizePatientId(requestedPatientId));
      setSelectedPatientId(matchedAdmission?.patientId || requestedPatientId);
    }
  }, [admissions, requestedPatientId]);

  const selectedAdmission = admissions.find((admission) => normalizePatientId(admission.patientId) === normalizePatientId(selectedPatientId)) ?? initialAdmission;
  const selectedPatient = icuPatients.find((patient) => normalizePatientId(patient.id) === normalizePatientId(selectedAdmission?.patientId ?? selectedPatientId)) ?? null;
  const filteredPatients = icuPatients.filter((patient) => {
    const text = `${patient.patientName} ${patient.mrn} ${patient.bedNo} ${patient.diagnosis} ${patient.assignedUnitNurse} ${patient.assignedWardNurse}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return { admissions, assignUnitNurse, query, filteredPatients, requestedPatientId, selectedAdmission, selectedPatient, selectedPatientId, setQuery, setSelectedPatientId, updateReview };
}

function PatientPicker({
  admissions,
  query,
  onQuery,
  onSelect,
  patients,
  selectedPatientId,
}: {
  admissions: HeadNurseAdmission[];
  query: string;
  onQuery: (value: string) => void;
  onSelect: (value: string) => void;
  patients: typeof icuPatients;
  selectedPatientId: string;
}) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-black text-slate-950">Select Patient</CardTitle>
        <CardDescription>Search the ICU list, then the page will auto-fill patient details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search patient, MRN, bed, unit, nurse..." value={query} onChange={(event) => onQuery(event.target.value)} />
        </div>
        <div className="grid gap-2">
          {patients.map((patient) => (
            <button
              className={cn("rounded-xl border px-3 py-2 text-left transition", selectedPatientId === patient.id ? "border-sky-300 bg-sky-50" : "border-slate-200 bg-white hover:bg-slate-50")}
              key={patient.id}
              onClick={() => onSelect(patient.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-950">{patient.patientName}</p>
                  <p className="text-xs font-medium text-slate-500">{patient.mrn} | {patient.bedNo} | {patient.unit}</p>
                </div>
                <Badge className={statusTone(admissions.find((item) => item.patientId === patient.id)?.reviewStatus)}>{admissions.find((item) => item.patientId === patient.id)?.reviewStatus ?? "Waiting Review"}</Badge>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PatientSummaryCard({ admission, patient }: { admission: HeadNurseAdmission | null; patient: typeof icuPatients[number] | null }) {
  if (!admission || !patient) return null;
  return (
    <div className="max-w-full overflow-x-auto rounded-md border border-[#dcd8ff] bg-gradient-to-r from-[#7064EC] via-[#6878E8] to-[#6888E8] px-4 py-3 text-white shadow-sm">
      <div className="flex min-w-max items-center gap-6 text-sm font-semibold">
        <span className="text-base font-bold">{patient.patientName ?? "Patient not selected"}</span>
        <span className="rounded-full border border-white/35 bg-white/15 px-2.5 py-1 text-xs">{admission.reviewStatus}</span>
        <span>MR: {patient.mrn}</span>
        <span>Age/Sex: {patient.ageGender}</span>
        <span>Bed: {admission.bed}</span>
        <span>Unit: {admission.icuUnit}</span>
        <span>Doctor: {patient.admittingDoctor}</span>
        <span>Nurse: {patient.assignedWardNurse}</span>
      </div>
    </div>
  );
}

function HeadNurseActionPage({ mode }: { mode: WorkflowMode }) {
  const context = useHeadNursePatientContext();
  const admission = context.selectedAdmission;
  const patient = context.selectedPatient;
  const [note, setNote] = React.useState("");
  const [selectedNurse, setSelectedNurse] = React.useState<string>(headNurseUnitNurseOptions[0]?.value ?? "");
  const [manualVerification, setManualVerification] = React.useState({
    patientIdentityVerified: Boolean(admission?.manualVerification?.patientIdentityVerified),
    admissionDetailsVerified: Boolean(admission?.manualVerification?.admissionDetailsVerified),
    icuBedAllocationVerified: Boolean(admission?.manualVerification?.icuBedAllocationVerified),
    careRequirementsReviewed: Boolean(admission?.manualVerification?.careRequirementsReviewed),
    requiredEquipmentConfirmed: Boolean(admission?.manualVerification?.requiredEquipmentConfirmed),
    unitNurseAvailabilityConfirmed: Boolean(admission?.manualVerification?.unitNurseAvailabilityConfirmed),
  });

  React.useEffect(() => {
    setNote(admission?.remarks ?? admission?.holdReason ?? "");
    setManualVerification({
      patientIdentityVerified: Boolean(admission?.manualVerification?.patientIdentityVerified),
      admissionDetailsVerified: Boolean(admission?.manualVerification?.admissionDetailsVerified),
      icuBedAllocationVerified: Boolean(admission?.manualVerification?.icuBedAllocationVerified),
      careRequirementsReviewed: Boolean(admission?.manualVerification?.careRequirementsReviewed),
      requiredEquipmentConfirmed: Boolean(admission?.manualVerification?.requiredEquipmentConfirmed),
      unitNurseAvailabilityConfirmed: Boolean(admission?.manualVerification?.unitNurseAvailabilityConfirmed),
    });
  }, [admission?.holdReason, admission?.manualVerification, admission?.remarks, admission?.patientId]);

  React.useEffect(() => {
    if (admission?.assignedHeadNurse) setSelectedNurse(admission.assignedHeadNurse);
  }, [admission?.assignedHeadNurse]);

  if (!context.selectedPatientId || !admission || !patient) {
    return <PatientPicker admissions={context.admissions} query={context.query} onQuery={context.setQuery} onSelect={context.setSelectedPatientId} patients={context.filteredPatients} selectedPatientId={context.selectedPatientId} />;
  }

  const commonHeader = <PatientSummaryCard admission={admission} patient={patient} />;
  const isWaitingReview = admission.reviewStatus === "Waiting Review";
  const isOnHold = admission.reviewStatus === "On Hold";
  const isReviewed = admission.reviewStatus === "Reviewed";

  if (mode === "review") {
    return (
      <div className="space-y-4">
        {commonHeader}
        <Card className="border-slate-200 shadow-sm">
         
          <CardContent className="space-y-4 pt-4">
            {isReviewed ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                <p className="text-sm font-bold">Review completed</p>
                <p className="mt-1 text-sm">Reviewed by: {admission.reviewedBy || "Head Nurse"}</p>
                <p className="mt-1 text-sm">Reviewed at: {admission.reviewedAt || "Just now"}</p>
                {admission.remarks ? <p className="mt-1 text-sm">Remarks: {admission.remarks}</p> : null}
              </div>
            ) : isOnHold ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                <p className="text-sm font-bold">Review is on hold</p>
                <p className="mt-1 text-sm">Hold reason: {admission.holdReason || "Pending clarification"}</p>
              </div>
            ) : null}

            <div className="grid gap-3 lg:grid-cols-3">
              <div className="space-y-3">
                <InlineField label="Diagnosis" value={patient.diagnosis} />
                <InlineField label="Admission Source" value={admission.admittedFrom} />
                <InlineField label="Available Unit Nurses" value={String(headNurseUnitNurseOptions.length)} />
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nurse Patient Ratio</span><Badge className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", (admission.nursePatientRatio || "1:2") === "1:2" ? "bg-emerald-600 text-white border-emerald-600" : (admission.nursePatientRatio || "1:2") === "1:3" ? "bg-yellow-500 text-white border-yellow-500" : "bg-red-600 text-white border-red-600")}>{admission.nursePatientRatio || "1:2"}</Badge></div>
              </div>
              <div className="space-y-3">
               
                <InlineField label="Admission Date & Time" value={admission.admissionTime} />
                <InlineField label="Priority" value={admission.priority} />
                <InlineField label="Current Status" value={admission.reviewStatus} />
                <InlineField label="Suggested Unit Nurse" value={admission.assignedUnitNurse ?? "Pending assignment"} />
              </div>
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-950">Manual Verification Checklist</p>
                <div className="grid gap-2">
                  {Object.entries(manualVerification).map(([key, checked]) => (
                    <label className={cn("flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition", checked ? "border-emerald-200 bg-emerald-50 text-emerald-950" : isReviewed ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 bg-white")} key={key}>
                      <input checked={checked} disabled={isReviewed} onChange={(event) => setManualVerification((current) => ({ ...current, [key]: event.target.checked }))} type="checkbox" />
                      <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <Input placeholder={isOnHold ? "Resume review remarks" : "Review remarks"} value={note} onChange={(event) => setNote(event.target.value)} disabled={isReviewed} />

            <div className="flex flex-wrap gap-2">
              {isReviewed ? (
                <Button variant="ghost" onClick={() => window.history.back()}>Back</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
                  <Button variant="outline" onClick={() => {
                    if (!note.trim() && !admission.holdReason) {
                      toast.error("Enter hold reason before saving hold admission");
                      return;
                    }
                    context.updateReview(patient.id, {
                      reviewStatus: "On Hold",
                      holdReason: note || admission.holdReason,
                      remarks: note || admission.remarks,
                      manualVerification,
                    });
                    toast.success("Admission placed on hold");
                  }}>Hold Admission</Button>
                  <Button onClick={() => {
                    if (!Object.values(manualVerification).every(Boolean)) {
                      toast.error("Complete all manual verification items first");
                      return;
                    }
                    context.updateReview(patient.id, {
                      reviewStatus: "Reviewed",
                      reviewedBy: "Head Nurse",
                      reviewedAt: "Just now",
                      remarks: note || admission.remarks,
                      manualVerification,
                      assignmentStatus: "Pending Assignment",
                      auditStatus: "Under Audit",
                      handoverStatus: "Pending Handover",
                    });
                    toast.success("Admission reviewed");
                  }} disabled={!Object.values(manualVerification).every(Boolean)}>Mark Reviewed</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  if (mode === "assign") {
    return (
      <div className="space-y-4">
        {commonHeader}
        <Card className="border-slate-200 shadow-sm">
          
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 lg:grid-cols-2">
                <InlineField label="Diagnosis" value={patient.diagnosis} />
                <InlineField label="Admission Source" value={admission.admittedFrom} />
                <InlineField label="Assignment Status" value={admission.assignmentStatus} />
                <InlineField label="Available Unit Nurses" value={String(headNurseUnitNurseOptions.length)} />
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nurse Patient Ratio</span><Badge className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", (admission.nursePatientRatio || "1:2") === "1:2" ? "bg-emerald-600 text-white border-emerald-600" : (admission.nursePatientRatio || "1:2") === "1:3" ? "bg-yellow-500 text-white border-yellow-500" : "bg-red-600 text-white border-red-600")}>{admission.nursePatientRatio || "1:2"}</Badge></div>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current Workload</span><Badge className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", admission.workloadStatus === "Balanced" ? "bg-emerald-600 text-white border-emerald-600" : admission.workloadStatus === "Moderate" ? "bg-yellow-500 text-white border-yellow-500" : "bg-red-600 text-white border-red-600")}>{admission.workloadStatus === "Balanced" ? "Balanced" : admission.workloadStatus === "Moderate" ? "Moderate" : "High"}</Badge></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-950">Unit Nurse Selection</p>
                </div>
                <Badge className={statusTone(admission.assignmentStatus)}>{admission.assignmentStatus}</Badge>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {headNurseUnitNurseOptions.map((option) => {
                  const isSelected = selectedNurse === option.value;
                  return (
                    <button
                      className={cn("rounded-xl border p-3 text-left transition", isSelected ? "border-sky-300 bg-sky-50 shadow-sm" : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/40")}
                      key={option.value}
                      onClick={() => setSelectedNurse(option.value)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-950">{option.label}</p>
                          <p className="text-xs text-slate-500">Shift: {option.shift}</p>
                          <p className="text-xs text-slate-500">Current load: {option.patientCount} patients</p>
                        </div>
                        <Badge className={statusTone(option.availabilityStatus)}>{option.availabilityStatus}</Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Input placeholder="Assignment remarks" value={note} onChange={(event) => setNote(event.target.value)} />

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
              {admission.assignmentStatus !== "Assigned" ? (
                <Button onClick={() => {
                  context.assignUnitNurse(patient.id, selectedNurse, note);
                  toast.success(`Assigned to ${selectedNurse}`);
                }}>Save Unit Nurse</Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "audit") {
    return (
      <div className="space-y-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-black text-slate-950">Audit and Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <StatusRow label="Review status" value={admission.reviewStatus} detail="" />
              <StatusRow label="Assignment status" value={admission.assignmentStatus} detail="" />
              <StatusRow label="Audit status" value={admission.auditStatus ?? "Pending Audit"} detail="" />
              <StatusRow label="Handover status" value={admission.handoverStatus ?? "Not Ready"} detail="" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-950">Manual Verification Checklist</p>
              <div className="mt-3 grid gap-2">
                {Object.entries(admission.manualVerification ?? manualVerification).map(([key, checked]) => (
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" key={key}>
                    <input checked={Boolean(checked)} disabled type="checkbox" />
                    <span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <Input placeholder="Audit findings or exceptions" value={note} onChange={(event) => setNote(event.target.value)} />
              <Input placeholder="Audit remarks" value={admission.remarks ?? ""} readOnly />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
              <Button variant="outline" onClick={() => {
                context.updateReview(patient.id, {
                  auditStatus: "Under Audit",
                  auditFindings: [note.trim() || "No audit exceptions"],
                  remarks: note || admission.remarks,
                });
                toast.success("Audit started");
              }}>Mark Under Audit</Button>
              <Button onClick={() => {
                const findings = note.trim() ? note.split("\n").map((item) => item.trim()).filter(Boolean) : ["No audit exceptions"];
                context.updateReview(patient.id, {
                  auditStatus: "Audit Complete",
                  auditFindings: findings,
                  remarks: note || admission.remarks,
                });
                toast.success("Audit completed");
              }}>Complete Audit</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {commonHeader}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-black text-slate-950">Verify Handover</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StatusRow label="Review status" value={admission.reviewStatus} />
          <StatusRow label="Assignment status" value={admission.assignmentStatus} />
          {/* <StatusRow label="Audit status" value={admission.auditStatus ?? "Pending Audit"} /> */}
          {/* <StatusRow label="Handover status" value={admission.handoverStatus ?? "Not Ready"} /> */}
          {/* <Input placeholder="Handover remarks" value={note} onChange={(event) => setNote(event.target.value)} /> */}
          {/* <Button onClick={() => {
            context.updateReview(patient.id, { handoverStatus: "Handover Verified", handoverBy: "Head Nurse", handoverAt: "Just now", remarks: note || admission.remarks });
            toast.success("Handover verified");
          }}>Verify Handover</Button> */}
        </CardContent>
      </Card>
    </div>
  );
}

function InlineField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-950 text-right">{value}</span>
    </div>
  );
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}
function StatusRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          {detail ? <p className="text-xs text-slate-500">{detail}</p> : null}
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-xs font-bold", statusTone(value))}>{value}</span>
      </div>
    </div>
  );
}

function HeadNurseDashboardTable() {
  const { admissions } = useHeadNurseAdmissions();
  const patients = icuPatients;
  const [search, setSearch] = React.useState("");
  const [reviewFilter, setReviewFilter] = React.useState("All reviews");
  const [assignmentFilter, setAssignmentFilter] = React.useState("All assignments");
  const [handoverFilter, setHandoverFilter] = React.useState("All handovers");
  const [unitFilter, setUnitFilter] = React.useState("All units");

  const unitOptions = React.useMemo(() => ["All units", ...Array.from(new Set(admissions.map((row) => row.icuUnit)))], [admissions]);
  const visibleRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return admissions.filter((row) => {
      const patient = patients.find((item) => item.id === row.patientId);
      const text = `${row.patientName} ${row.uhid} ${row.patientId} ${row.icuUnit} ${row.bed} ${row.reviewStatus} ${row.assignmentStatus} ${row.handoverStatus ?? ""} ${patient?.mrn ?? ""} ${patient?.diagnosis ?? ""}`.toLowerCase();
      return (!query || text.includes(query))
        && (reviewFilter === "All reviews" || row.reviewStatus === reviewFilter)
        && (assignmentFilter === "All assignments" || row.assignmentStatus === assignmentFilter)
        && (handoverFilter === "All handovers" || (row.handoverStatus ?? "Not Ready") === handoverFilter)
        && (unitFilter === "All units" || row.icuUnit === unitFilter);
    });
  }, [admissions, assignmentFilter, handoverFilter, patients, reviewFilter, search, unitFilter]);

  const summary = React.useMemo(() => ({
    total: admissions.length,
    waitingReview: admissions.filter((row) => row.reviewStatus === "Waiting Review").length,
    reviewed: admissions.filter((row) => row.reviewStatus === "Reviewed").length,
    onHold: admissions.filter((row) => row.reviewStatus === "On Hold").length,
    pendingAssignment: admissions.filter((row) => row.assignmentStatus === "Pending Assignment").length,
    assigned: admissions.filter((row) => row.assignmentStatus === "Assigned").length,
    pendingHandover: admissions.filter((row) => (row.handoverStatus ?? "Not Ready") === "Pending Handover").length,
    verifiedHandover: admissions.filter((row) => row.handoverStatus === "Handover Verified").length,
  }), [admissions]);

  return (
    <div className="space-y-4">
      <CollapsibleCommandPanel summary={`${summary.waitingReview} waiting review | ${summary.assigned} assigned | ${visibleRows.length} filtered`} title="Head Nurse dashboard metrics & filters">
        
        <div className="grid gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCommandMetric label="Patients" value={summary.total} tone="info" />
          <DashboardCommandMetric label="Waiting review" value={summary.waitingReview} tone={summary.waitingReview ? "warning" : "success"} />
          <DashboardCommandMetric label="On hold" value={summary.onHold} tone={summary.onHold ? "danger" : "success"} />
          <DashboardCommandMetric label="Reviewed" value={summary.reviewed} tone="success" />
          <DashboardCommandMetric label="Pending assignment" value={summary.pendingAssignment} tone={summary.pendingAssignment ? "warning" : "success"} />
          <DashboardCommandMetric label="Assigned" value={summary.assigned} tone="success" />
          <DashboardCommandMetric label="Pending handover" value={summary.pendingHandover} tone={summary.pendingHandover ? "warning" : "success"} />
          <DashboardCommandMetric label="Handover verified" value={summary.verifiedHandover} tone={summary.verifiedHandover ? "success" : "muted"} />
        </div>
        <div className="space-y-3 px-4 py-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_170px_190px_135px_105px] lg:items-end">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Search admissions</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Patient, MRN, bed, unit, nurse..." />
              </div>
            </label>
            <NativeSelect label="Review status" value={reviewFilter} onChange={setReviewFilter} options={["All reviews", "Waiting Review", "Reviewed", "On Hold", "Verification Failed"]} />
            <NativeSelect label="Assignment status" value={assignmentFilter} onChange={setAssignmentFilter} options={["All assignments", "Not Ready", "Pending Assignment", "Assigned"]} />
            <NativeSelect label="Handover status" value={handoverFilter} onChange={setHandoverFilter} options={["All handovers", "Not Ready", "Pending Handover", "Handover Verified"]} />
            <NativeSelect label="Unit" value={unitFilter} onChange={setUnitFilter} options={unitOptions} />
            <Button className="h-10" variant="outline" onClick={() => {
              setSearch("");
              setReviewFilter("All reviews");
              setAssignmentFilter("All assignments");
              setHandoverFilter("All handovers");
              setUnitFilter("All units");
            }}>Reset</Button>
          </div> 
        </div>
      </CollapsibleCommandPanel>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-sm">
              <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-center">Review Status</th>
                  <th className="px-4 py-3 text-center">Assignment Status</th>
                  {/* <th className="px-4 py-3 text-center">Audit Status</th>
                  <th className="px-4 py-3 text-center">Handover Status</th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {visibleRows.map((row) => {
                  const patient = patients.find((item) => item.id === row.patientId);
                  const canProceed = row.reviewStatus === "Reviewed";
                  const canHandover = row.auditStatus === "Audit Complete";
                  return (
                    <tr className="align-middle hover:bg-sky-50/40" key={row.id}>
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <p className="text-sm font-black tracking-tight text-slate-950">{patient?.patientName ?? row.patientName ?? "Unknown patient"}</p>
                          <p className="text-xs font-semibold text-slate-700">{row.icuUnit} | {row.bed}</p>
                          <p className="text-xs text-slate-500">{row.uhid} | {patient?.ageGender ?? row.ageGender}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link className={cn("inline-flex min-w-[96px] cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition hover:brightness-95 hover:shadow-md", statusTone(row.reviewStatus))} href={`${workflowRoutes.review}?patientId=${row.patientId}`}>
                          {row.reviewStatus}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link aria-disabled={!canProceed} className={cn("inline-flex min-w-[96px] items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition hover:brightness-95 hover:shadow-md", statusTone(row.assignmentStatus), !canProceed && "pointer-events-none opacity-50")} href={canProceed ? `${workflowRoutes.assign}?patientId=${row.patientId}` : "#"} onClick={(event) => { if (!canProceed) { event.preventDefault(); } }}>{row.assignmentStatus}</Link>
                      </td>
                      {/* <td className="px-4 py-4 text-center">
                        <Link aria-disabled={!canProceed} className={cn("inline-flex min-w-[96px] items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition hover:brightness-95 hover:shadow-md", statusTone(row.auditStatus), !canProceed && "pointer-events-none opacity-50")} href={canProceed ? `${workflowRoutes.audit}?patientId=${row.patientId}` : "#"} onClick={(event) => { if (!canProceed) { event.preventDefault(); } }}>{row.auditStatus ?? "Pending Audit"}</Link>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link aria-disabled={!canHandover} className={cn("inline-flex min-w-[96px] items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition hover:brightness-95 hover:shadow-md", statusTone(row.handoverStatus), !canHandover && "pointer-events-none opacity-50")} href={canHandover ? `${workflowRoutes.verify}?patientId=${row.patientId}` : "#"} onClick={(event) => { if (!canHandover) { event.preventDefault(); } }}>{row.handoverStatus ?? "Pending Handover"}</Link>
                      </td> */}
                    </tr>
                  );
                })}
                {!visibleRows.length ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={5}>No ICU patient matched the selected dashboard filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function HeadNurseAdmissionQueueTable() {
  const { admissions } = useHeadNurseAdmissions();
  const patients = icuPatients;
  const [search, setSearch] = React.useState("");
  const [unitFilter, setUnitFilter] = React.useState("All units");
  const [priorityFilter, setPriorityFilter] = React.useState("All priorities");
  const [sourceFilter, setSourceFilter] = React.useState("All sources");
  const [reviewFilter, setReviewFilter] = React.useState("All reviews");

  const unitOptions = React.useMemo(() => ["All units", ...Array.from(new Set(admissions.map((row) => row.icuUnit)))], [admissions]);
  const sourceOptions = React.useMemo(() => ["All sources", ...Array.from(new Set(patients.map((patient) => patient.admissionSource)))], [patients]);
  const visibleRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return admissions.filter((row) => {
      const patient = patients.find((item) => item.id === row.patientId);
      const text = `${row.patientName} ${row.uhid} ${row.patientId} ${row.icuUnit} ${row.bed} ${row.priority} ${row.reviewStatus} ${row.assignmentStatus} ${patient?.mrn ?? ""} ${patient?.diagnosis ?? ""} ${patient?.admissionSource ?? ""}`.toLowerCase();
      return (!query || text.includes(query))
        && (unitFilter === "All units" || row.icuUnit === unitFilter)
        && (priorityFilter === "All priorities" || row.priority === priorityFilter)
        && (sourceFilter === "All sources" || patient?.admissionSource === sourceFilter)
        && (reviewFilter === "All reviews" || row.reviewStatus === reviewFilter);
    });
  }, [admissions, patients, priorityFilter, reviewFilter, search, sourceFilter, unitFilter]);

  const summary = React.useMemo(() => ({
    total: admissions.length,
    waitingReview: admissions.filter((row) => row.reviewStatus === "Waiting Review").length,
    onHold: admissions.filter((row) => row.reviewStatus === "On Hold").length,
    reviewed: admissions.filter((row) => row.reviewStatus === "Reviewed").length,
    pendingAssignment: admissions.filter((row) => row.assignmentStatus === "Pending Assignment").length,
  }), [admissions]);

  return (
    <div className="space-y-4">
      <CollapsibleCommandPanel summary={`${summary.total} admissions | ${summary.waitingReview} waiting review | ${summary.onHold} on hold | ${visibleRows.length} filtered`} title="New Admission Queue">
        <div className="border-b border-slate-200 bg-slate-50/60 px-4 py-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <DashboardCommandMetric label="New Admissions" value={summary.total} tone="info" />
            <DashboardCommandMetric label="Waiting Review" value={summary.waitingReview} tone={summary.waitingReview ? "warning" : "success"} />
            <DashboardCommandMetric label="On Hold" value={summary.onHold} tone={summary.onHold ? "danger" : "success"} />
            <DashboardCommandMetric label="Reviewed" value={summary.reviewed} tone="success" />
            <DashboardCommandMetric label="Pending Assignment" value={summary.pendingAssignment} tone={summary.pendingAssignment ? "warning" : "success"} />
          </div>
        </div>
        <div className="space-y-3 bg-white px-4 py-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_190px_170px_190px_135px_105px] lg:items-end">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">Search &amp; Filters</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="h-10 rounded-xl border-slate-200 bg-white pl-9 shadow-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Patient name / UHID / bed / unit..." />
              </div>
            </label>
            <NativeSelect label="ICU Unit" value={unitFilter} onChange={setUnitFilter} options={unitOptions} />
            <NativeSelect label="Priority" value={priorityFilter} onChange={setPriorityFilter} options={["All priorities", "Critical", "High", "Moderate", "Stable"]} />
            <NativeSelect label="Admission Source" value={sourceFilter} onChange={setSourceFilter} options={sourceOptions} />
            <NativeSelect label="Review Status" value={reviewFilter} onChange={setReviewFilter} options={["All reviews", "Waiting Review", "Reviewed", "On Hold", "Verification Failed"]} />
          </div>
        </div>
      </CollapsibleCommandPanel>
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-sm">
              <thead className="bg-white text-[11px] uppercase tracking-wide text-sky-700">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">ICU Unit</th>
                  <th className="px-4 py-3 text-center">Bed</th>
                  <th className="px-4 py-3 text-center">Priority</th>
                  <th className="px-4 py-3 text-center">Review Status</th>
                  <th className="px-4 py-3 text-center">Assignment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {visibleRows.map((row) => {
                  const patient = patients.find((item) => item.id === row.patientId);
                  const reviewHref = `${workflowRoutes.review}?patientId=${row.patientId}`;
                  const assignHref = `${workflowRoutes.assign}?patientId=${row.patientId}`;
                  return (
                    <tr className="align-middle hover:bg-sky-50/40" key={row.id}>
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <p className="text-sm font-black tracking-tight text-slate-950">{patient?.patientName ?? row.patientName ?? "Unknown patient"}</p>
                          <p className="text-xs font-semibold text-slate-700">{row.uhid} | {patient?.mrn ?? row.patientId}</p>
                          <p className="text-xs text-slate-500">{patient?.ageGender ?? row.ageGender} | {patient?.diagnosis ?? row.diagnosis}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-left text-sm font-semibold text-slate-700">{row.icuUnit}</td>
                      <td className="px-4 py-4 text-center text-sm font-semibold text-slate-700">{row.bed}</td>
                      <td className="px-4 py-4 text-center"><span className={cn("inline-flex min-w-[96px] items-center justify-center rounded-full border px-4 py-2 text-xs font-bold", statusTone(row.priority))}>{row.priority}</span></td>
                      <td className="px-4 py-4 text-center"><Link className={cn("inline-flex min-w-[120px] items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition hover:brightness-95 hover:shadow-md", statusTone(row.reviewStatus))} href={reviewHref}>{row.reviewStatus}</Link></td>
                      <td className="px-4 py-4 text-center"><Link aria-disabled={row.reviewStatus !== "Reviewed"} className={cn("inline-flex min-w-[120px] items-center justify-center rounded-full border px-4 py-2 text-xs font-bold transition hover:brightness-95 hover:shadow-md", statusTone(row.assignmentStatus), row.reviewStatus !== "Reviewed" && "pointer-events-none opacity-50")} href={row.reviewStatus === "Reviewed" ? assignHref : "#"} onClick={(event) => { if (row.reviewStatus !== "Reviewed") event.preventDefault(); }}>{row.assignmentStatus}</Link></td>
                    </tr>
                  );
                })}
                {!visibleRows.length ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={6}>No ICU patient matched the selected admission queue filters.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HeadNurseAdmissionQueuePage() {
  return <HeadNurseAdmissionQueueTable />;
}

export function HeadNurseDashboard() {
  return <HeadNurseDashboardTable />;
}

export function HeadNurseConsolePage() {
  return (
    <React.Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading head nurse workspace...</div>}>
      <HeadNurseActionPage mode="review" />
    </React.Suspense>
  );
}

export function ReviewNewAdmissionPage() {
  return (
    <React.Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading head nurse workspace...</div>}>
      <HeadNurseActionPage mode="review" />
    </React.Suspense>
  );
}

export function AssignPatientToUnitNursePage() {
  return (
    <React.Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading head nurse workspace...</div>}>
      <HeadNurseActionPage mode="assign" />
    </React.Suspense>
  );
}

export function AuditAndControlPage() {
  return (
    <React.Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading head nurse workspace...</div>}>
      <HeadNurseActionPage mode="audit" />
    </React.Suspense>
  );
}

export function VerifyHandoverPage() {
  return (
    <React.Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading head nurse workspace...</div>}>
      <HeadNurseActionPage mode="verify" />
    </React.Suspense>
  );
}


















































