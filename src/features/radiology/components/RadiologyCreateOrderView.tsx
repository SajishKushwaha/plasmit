"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ClipboardList, CreditCard, FilePlus2, Search, UserRound, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";
import { PriorityBadge } from "@/features/radiology/components/PriorityBadge";
import { RadiologyStatsCard } from "@/features/radiology/components/RadiologyStatsCard";
import { radiologyModalities } from "@/features/radiology/data/modalities";
import { useRadiologyWorkspace } from "@/features/radiology/hooks/useRadiologyWorkspace";
import type { Patient, Priority, RadiologyOrder, RadiologyTest } from "@/features/radiology/types";
import { formatCurrency, formatPatientAgeGender } from "@/features/radiology/utils/formatters";

interface RadiologyCreateOrderViewProps {
  patients: Patient[];
  tests: RadiologyTest[];
  onCancel?: () => void;
  onCreated?: (orderId: string) => void;
}

interface FormErrors {
  patientId?: string;
  testIds?: string;
  orderedBy?: string;
  clinicalIndication?: string;
  provisionalDiagnosis?: string;
}

const priorityOptions: Priority[] = ["ROUTINE", "URGENT", "EMERGENCY", "STAT"];

function fieldClass(hasError = false) {
  return [
    "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring",
    hasError ? "border-danger" : "border-input",
  ].join(" ");
}

function priorityLabel(priority: Priority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

export function RadiologyCreateOrderView({ patients, tests, onCancel, onCreated }: RadiologyCreateOrderViewProps) {
  const router = useRouter();
  const workspace = useRadiologyWorkspace();
  const [patientSearch, setPatientSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [modalityFilter, setModalityFilter] = useState("ALL");
  const [contrastFilter, setContrastFilter] = useState("ALL");
  const [patientId, setPatientId] = useState(patients[0]?.id ?? "");
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(tests[0]?.id ? [tests[0].id] : []);
  const [priority, setPriority] = useState<Priority>("ROUTINE");
  const [billingStatus, setBillingStatus] = useState<RadiologyOrder["billingStatus"]>("Pending");
  const [clinicalIndication, setClinicalIndication] = useState("");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [orderedBy, setOrderedBy] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPatient = patients.find((patient) => patient.id === patientId);
  const selectedTests = tests.filter((test) => selectedTestIds.includes(test.id));
  const selectedModalityId = selectedTests[0]?.modalityId ?? "ALL";
  const total = selectedTests.reduce((sum, test) => sum + test.price, 0);
  const totalDuration = selectedTests.reduce((sum, test) => sum + test.durationMinutes, 0);
  const maxReportingTat = selectedTests.reduce((max, test) => Math.max(max, test.reportingTatMinutes), 0);

  const visiblePatients = useMemo(() => {
    const search = patientSearch.trim().toLowerCase();
    if (!search) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.mrn, patient.phone, patient.consultant, patient.department, patient.location]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [patientSearch, patients]);

  const visibleTests = useMemo(() => {
    const search = testSearch.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        search.length === 0 ||
        [test.name, test.code, test.bodyPart, test.preparation].join(" ").toLowerCase().includes(search);
      const matchesModality = modalityFilter === "ALL" || test.modalityId === modalityFilter;
      const matchesContrast =
        contrastFilter === "ALL" || (contrastFilter === "CONTRAST" ? test.contrast : !test.contrast);

      return matchesSearch && matchesModality && matchesContrast;
    });
  }, [contrastFilter, modalityFilter, testSearch, tests]);

  function selectPatient(patient: Patient) {
    setPatientId(patient.id);
    setOrderedBy((current) => current || patient.consultant);
    setClinicalIndication((current) => current || patient.clinicalNotes || "");
    setErrors((current) => ({ ...current, patientId: undefined }));
  }

  function toggleTest(test: RadiologyTest) {
    setSelectedTestIds((current) => {
      if (current.includes(test.id)) {
        return current.filter((id) => id !== test.id);
      }

      const currentTests = tests.filter((item) => current.includes(item.id));
      const currentModalityId = currentTests[0]?.modalityId;

      if (currentModalityId && currentModalityId !== test.modalityId) {
        return [test.id];
      }

      return [...current, test.id];
    });
    setErrors((current) => ({ ...current, testIds: undefined }));
  }

  function removeTest(testId: string) {
    setSelectedTestIds((current) => current.filter((id) => id !== testId));
  }

  function resetForm() {
    const firstPatient = patients[0];
    setPatientSearch("");
    setTestSearch("");
    setModalityFilter("ALL");
    setContrastFilter("ALL");
    setPatientId(firstPatient?.id ?? "");
    setSelectedTestIds(tests[0]?.id ? [tests[0].id] : []);
    setPriority("ROUTINE");
    setBillingStatus("Pending");
    setClinicalIndication("");
    setProvisionalDiagnosis("");
    setOrderedBy(firstPatient?.consultant ?? "");
    setErrors({});
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!patientId) {
      nextErrors.patientId = "Select a patient before creating the order.";
    }

    if (selectedTestIds.length === 0) {
      nextErrors.testIds = "Select at least one radiology test.";
    }

    if (orderedBy.trim().length < 3) {
      nextErrors.orderedBy = "Enter the ordering doctor or clinician.";
    }

    if (clinicalIndication.trim().length < 5) {
      nextErrors.clinicalIndication = "Enter a meaningful clinical indication.";
    }

    if (provisionalDiagnosis.trim().length < 3) {
      nextErrors.provisionalDiagnosis = "Enter a provisional diagnosis.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const orderId = workspace.actions.createOrder({
      patientId,
      testIds: selectedTestIds,
      priority,
      billingStatus,
      clinicalIndication: clinicalIndication.trim(),
      provisionalDiagnosis: provisionalDiagnosis.trim(),
      orderedBy: orderedBy.trim(),
    });

    if (orderId) {
      if (onCreated) {
        setIsSubmitting(false);
        resetForm();
        onCreated(orderId);
        return;
      }

      router.push(`/radiology/orders/${orderId}`);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RadiologyStatsCard icon={<UserRound className="h-5 w-5" />} subtext="Search and select patient" title="Step 1" value="Patient" />
        <RadiologyStatsCard icon={<ClipboardList className="h-5 w-5" />} subtext="Choose same-modality tests" title="Step 2" value={selectedTests.length} />
        <RadiologyStatsCard icon={<CreditCard className="h-5 w-5" />} subtext={`${totalDuration || 0} min scan time`} title="Estimated Bill" value={formatCurrency(total)} />
        <RadiologyStatsCard subtext="Current draft status" title="Billing Mode" value={billingStatus} />
      </section>

      {Object.keys(errors).length > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">Please complete the required fields.</p>
            <ul className="mt-1 list-inside list-disc">
              {Object.values(errors).filter(Boolean).map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">1. Patient Search</h2>
                <p className="mt-1 text-sm text-muted-foreground">Search by MRN, name, phone, consultant, department, or location.</p>
              </div>
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => setPatientSearch(event.target.value)}
              placeholder="Search patient"
              value={patientSearch}
            />
            <div className="mt-3 max-h-[360px] divide-y divide-border overflow-auto rounded-lg border border-border">
              {visiblePatients.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No matching patient found.</div>
              ) : (
                visiblePatients.map((patient) => (
                  <button
                    className={[
                      "flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm hover:bg-surface-muted",
                      patientId === patient.id ? "bg-primary-soft text-foreground" : "bg-surface",
                    ].join(" ")}
                    key={patient.id}
                    onClick={() => selectPatient(patient)}
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{patient.name}</span>
                      <span className="text-xs text-muted-foreground">{patient.mrn} - {patient.phone}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{patient.location}</span>
                  </button>
                ))
              )}
            </div>
            {errors.patientId ? <p className="mt-2 text-xs font-medium text-danger">{errors.patientId}</p> : null}
          </div>

          {selectedPatient ? (
            <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">Selected Patient</h3>
              <div className="mt-3 grid gap-3 text-sm">
                <div>
                  <p className="font-semibold text-foreground">{selectedPatient.name}</p>
                  <p className="text-muted-foreground">{selectedPatient.mrn} - {formatPatientAgeGender(selectedPatient.age, selectedPatient.gender)}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <p><span className="font-medium text-foreground">Consultant:</span> {selectedPatient.consultant}</p>
                  <p><span className="font-medium text-foreground">Department:</span> {selectedPatient.department}</p>
                  <p><span className="font-medium text-foreground">Payer:</span> {selectedPatient.payerType}</p>
                  <p><span className="font-medium text-foreground">Location:</span> {selectedPatient.location}</p>
                </div>
                {selectedPatient.allergies ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-900">
                    <span className="font-semibold">Allergy note:</span> {selectedPatient.allergies}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">2. Clinical Order Details</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="text-sm font-medium text-foreground">
                Ordered by
                <input className={`${fieldClass(Boolean(errors.orderedBy))} mt-1`} onChange={(event) => setOrderedBy(event.target.value)} placeholder="Ordering doctor" value={orderedBy} />
              </label>
              <label className="text-sm font-medium text-foreground">
                Priority
                <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setPriority(event.target.value as Priority)} value={priority}>
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>{priorityLabel(option)}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-foreground md:col-span-2">
                Clinical indication
                <textarea
                  className={`${fieldClass(Boolean(errors.clinicalIndication))} mt-1 min-h-24`}
                  onChange={(event) => setClinicalIndication(event.target.value)}
                  placeholder="Example: Head trauma, rule out bleed"
                  value={clinicalIndication}
                />
              </label>
              <label className="text-sm font-medium text-foreground md:col-span-2">
                Provisional diagnosis
                <input
                  className={`${fieldClass(Boolean(errors.provisionalDiagnosis))} mt-1`}
                  onChange={(event) => setProvisionalDiagnosis(event.target.value)}
                  placeholder="Example: Rule out intracranial hemorrhage"
                  value={provisionalDiagnosis}
                />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface shadow-sm">
            <div className="border-b border-border p-4">
              <h2 className="text-base font-semibold text-foreground">3. Select Radiology Tests</h2>
              <p className="mt-1 text-sm text-muted-foreground">One order supports tests from the same modality. Selecting another modality starts a new test selection.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px_160px]">
                <input
                  className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  onChange={(event) => setTestSearch(event.target.value)}
                  placeholder="Search test, code, body part"
                  value={testSearch}
                />
                <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setModalityFilter(event.target.value)} value={modalityFilter}>
                  <option value="ALL">All modalities</option>
                  {radiologyModalities.map((modality) => (
                    <option key={modality.id} value={modality.id}>{modality.name}</option>
                  ))}
                </select>
                <select className="rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setContrastFilter(event.target.value)} value={contrastFilter}>
                  <option value="ALL">All contrast types</option>
                  <option value="CONTRAST">Contrast</option>
                  <option value="NON_CONTRAST">Non-contrast</option>
                </select>
              </div>
            </div>
            <div className="max-h-[430px] divide-y divide-border overflow-auto">
              {visibleTests.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No tests match the selected filters.</div>
              ) : (
                visibleTests.map((test) => {
                  const isSelected = selectedTestIds.includes(test.id);

                  return (
                    <button
                      className={["flex w-full items-start justify-between gap-4 px-4 py-3 text-left hover:bg-surface-muted", isSelected ? "bg-primary-soft" : "bg-surface"].join(" ")}
                      key={test.id}
                      onClick={() => toggleTest(test)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-foreground">{test.name}</span>
                          {isSelected ? <CheckCircle2 className="h-4 w-4 text-primary" /> : null}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {test.code} - {test.bodyPart} - {test.durationMinutes} min - TAT {test.reportingTatMinutes} min
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{test.preparation}</span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-2">
                        <ModalityBadge modalityId={test.modalityId} />
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(test.price)}</span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          {errors.testIds ? <p className="text-xs font-medium text-danger">{errors.testIds}</p> : null}

          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">4. Billing and Review</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Billing status
                  <select className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setBillingStatus(event.target.value as RadiologyOrder["billingStatus"])} value={billingStatus}>
                    <option value="Pending">Payment pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Corporate Approved">Corporate approved</option>
                    <option value="Package Covered">Package covered</option>
                  </select>
                </label>
                <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm">
                  <p className="font-semibold text-foreground">Order Summary</p>
                  <div className="mt-2 grid gap-2 text-muted-foreground">
                    <p>Patient: <span className="font-medium text-foreground">{selectedPatient?.name ?? "Not selected"}</span></p>
                    <p>Priority: <PriorityBadge priority={priority} /></p>
                    <p>Modality: {selectedModalityId !== "ALL" ? <ModalityBadge modalityId={selectedModalityId} /> : "Not selected"}</p>
                    <p>Estimated scan time: <span className="font-medium text-foreground">{totalDuration} min</span></p>
                    <p>Reporting TAT: <span className="font-medium text-foreground">{maxReportingTat} min</span></p>
                    <p>Total amount: <span className="font-semibold text-foreground">{formatCurrency(total)}</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Selected Tests</p>
                {selectedTests.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">No test selected.</div>
                ) : (
                  selectedTests.map((test) => (
                    <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-muted p-3 text-sm" key={test.id}>
                      <div>
                        <p className="font-medium text-foreground">{test.name}</p>
                        <p className="text-xs text-muted-foreground">{test.code} - {formatCurrency(test.price)}</p>
                      </div>
                      <button className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground" onClick={() => removeTest(test.id)} type="button" aria-label={`Remove ${test.name}`}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 flex flex-wrap items-center justify-end gap-2 rounded-lg border border-border bg-surface/95 p-3 shadow-sm backdrop-blur">
            {onCancel ? (
              <Button onClick={onCancel} type="button" variant="outline">
                Cancel
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/radiology/order-list">Cancel</Link>
              </Button>
            )}
            <Button onClick={resetForm} type="button" variant="outline">
              Reset
            </Button>
            <Button disabled={isSubmitting} type="submit">
              <FilePlus2 className="h-4 w-4" />
              {isSubmitting ? "Creating Order..." : "Create Order"}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}
