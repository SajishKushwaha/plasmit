"use client";

import * as React from "react";
import { AlertTriangle, BadgeCheck, BellRing, Clock3, Droplets, ScanLine, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shell/page-header";
import { PatientSummaryBanner } from "./shared/patient-summary-banner";
import { nurseBloodProductStaticRecords, nurseBloodProductTypes, type BagVerification } from "./receipt-verification-data";

type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

type VerificationRow = BagVerification & {
  id: string;
  scanValue: string;
  overrideReason: string;
  secondClinician: string;
};

type VitalsState = {
  pulse: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  respiratoryRate: string;
  temperature: string;
  painScore: string;
};

type FormState = {
  consentTaken: boolean;
  componentType: string;
  componentOtherText: string;
  patientBloodGroup: BloodGroup;
  patientIdentityVerified: boolean;
  prescriptionChecked: boolean;
  unitLabelChecked: boolean;
  bloodGroupConfirmed: boolean;
  crossmatchConfirmed: boolean;
  doctorSignature: string;
  nurseSignature: string;
  verifiedAt: string;
  vitals: VitalsState;
  bags: VerificationRow[];
  patientLabel: string;
  patientPhotoAvailable: boolean;
};

type VitalErrorKey = keyof VitalsState;
type BagErrorMap = Partial<Record<keyof VerificationRow, string>>;

const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const componentOptions = nurseBloodProductTypes;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentDateTimeValue() {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function makeBagRow(index: number): VerificationRow {
  return {
    id: `bag-${Date.now()}-${index}`,
    bagNo: "",
    scanValue: "",
    bloodGroup: "A+",
    collectionDate: todayIso(),
    expiryDate: "",
    compatibilityConfirmed: false,
    overrideReason: "",
    secondClinician: "",
  };
}

function compareDates(left: string, right: string) {
  if (!left || !right) return 0;
  return left === right ? 0 : left < right ? -1 : 1;
}

function isBloodGroupMatch(patient: string, bag: string) {
  return patient.trim() === bag.trim();
}

export function NurseReceiptVerificationPage() {
  const record = nurseBloodProductStaticRecords[0];
  const [form, setForm] = React.useState<FormState>({
    consentTaken: record.consentTaken === "Yes",
    componentType: record.componentType,
    componentOtherText: record.componentOtherText,
    patientBloodGroup: record.bloodGroup as BloodGroup,
    patientIdentityVerified: record.patientIdentityVerified,
    prescriptionChecked: record.prescriptionChecked,
    unitLabelChecked: record.unitLabelChecked,
    bloodGroupConfirmed: record.bloodGroupConfirmed,
    crossmatchConfirmed: record.compatibilityVerified,
    doctorSignature: record.doctorSignature,
    nurseSignature: record.nurseSignature,
    verifiedAt: currentDateTimeValue(),
    vitals: {
      pulse: record.pulse,
      bloodPressureSystolic: record.bloodPressure.split("/")[0] || "",
      bloodPressureDiastolic: record.bloodPressure.split("/")[1] || "",
      respiratoryRate: record.respiratoryRate,
      temperature: record.temperature,
      painScore: record.painScore,
    },
    bags: record.bags.map((bag, index) => ({ ...bag, id: `bag-${index}`, scanValue: "", overrideReason: "", secondClinician: "" })),
    patientLabel: `${record.patientName} | ${record.mrn}`,
    patientPhotoAvailable: true,
  });
  const [started, setStarted] = React.useState(false);

  const patientGroup = form.patientBloodGroup;
  const consentBlocked = !form.consentTaken;
  const hasOtherComponent = form.componentType === "Others";
  const hasMismatch = form.bags.some((bag) => bag.bloodGroup && !isBloodGroupMatch(patientGroup, bag.bloodGroup));
  const hasExpiredBag = form.bags.some((bag) => bag.expiryDate && compareDates(bag.expiryDate, todayIso()) < 0);
  const allBagCompatibilityConfirmed = form.bags.every((bag) => bag.compatibilityConfirmed);
  const vitalErrors = getVitalErrors(form.vitals);
  const bagErrors = getBagErrors(form.bags, patientGroup);
  const canStart = Boolean(
    !consentBlocked &&
      !hasMismatch &&
      !hasExpiredBag &&
      allBagCompatibilityConfirmed &&
      form.crossmatchConfirmed &&
      form.patientIdentityVerified &&
      form.prescriptionChecked &&
      form.unitLabelChecked &&
      form.bloodGroupConfirmed &&
      form.doctorSignature.trim() &&
      form.nurseSignature.trim() &&
      Object.values(vitalErrors).every((message) => !message) &&
      bagErrors.every((bagError) => Object.keys(bagError).length === 0) &&
      (!hasOtherComponent || form.componentOtherText.trim()),
  );

  function updateBag(id: string, patch: Partial<VerificationRow>) {
    setForm((current) => ({
      ...current,
      bags: current.bags.map((bag) => (bag.id === id ? { ...bag, ...patch } : bag)),
    }));
  }

  function addBag() {
    setForm((current) => ({ ...current, bags: [...current.bags, makeBagRow(current.bags.length)] }));
  }

  function removeBag(id: string) {
    setForm((current) => ({ ...current, bags: current.bags.length > 1 ? current.bags.filter((bag) => bag.id !== id) : current.bags }));
  }

  function applyBagScan(id: string) {
    setForm((current) => ({
      ...current,
      bags: current.bags.map((bag) => {
        if (bag.id !== id) return bag;
        const parts = bag.scanValue.split("|").map((part) => part.trim());
        const [bagNo, bloodGroup, collectionDate, expiryDate, compatibility] = parts;
        return {
          ...bag,
          bagNo: bagNo || bag.bagNo,
          bloodGroup: (bloodGroup as BloodGroup) || bag.bloodGroup,
          collectionDate: collectionDate || bag.collectionDate,
          expiryDate: expiryDate || bag.expiryDate,
          compatibilityConfirmed: compatibility ? compatibility.toLowerCase() === "yes" || compatibility.toLowerCase() === "true" : bag.compatibilityConfirmed,
        };
      }),
    }));
  }

  function validate() {
    const nextErrors: string[] = [];
    if (!form.consentTaken) nextErrors.push("Consent for transfusion must be checked before proceeding.");
    if (!form.patientIdentityVerified) nextErrors.push("Patient identity must be verified.");
    if (!form.prescriptionChecked) nextErrors.push("Prescription/order check must be completed.");
    if (!form.unitLabelChecked) nextErrors.push("Unit label check must be completed.");
    if (!form.bloodGroupConfirmed) nextErrors.push("Patient blood group must be confirmed.");
    if (!form.crossmatchConfirmed) nextErrors.push("Crossmatch compatibility confirmation must be checked.");
    if (!form.doctorSignature.trim()) nextErrors.push("Doctor signature is required.");
    if (!form.nurseSignature.trim()) nextErrors.push("Verifying nurse signature is required.");
    if (!form.componentType.trim()) nextErrors.push("Blood component type is required.");
    if (hasOtherComponent && !form.componentOtherText.trim()) nextErrors.push("Others component requires free text description.");

    if (form.vitals.pulse && (Number(form.vitals.pulse) < 0 || Number(form.vitals.pulse) > 250)) nextErrors.push("Pulse must stay within 0-250.");
    if (form.vitals.bloodPressureSystolic && (Number(form.vitals.bloodPressureSystolic) < 0 || Number(form.vitals.bloodPressureSystolic) > 300)) nextErrors.push("Systolic BP must stay within 0-300.");
    if (form.vitals.bloodPressureDiastolic && (Number(form.vitals.bloodPressureDiastolic) < 0 || Number(form.vitals.bloodPressureDiastolic) > 200)) nextErrors.push("Diastolic BP must stay within 0-200.");
    if (form.vitals.respiratoryRate && (Number(form.vitals.respiratoryRate) < 0 || Number(form.vitals.respiratoryRate) > 60)) nextErrors.push("Respiratory rate must stay within 0-60.");
    if (form.vitals.temperature && (Number(form.vitals.temperature) < 30 || Number(form.vitals.temperature) > 43)) nextErrors.push("Temperature must stay within 30.0-43.0.");
    if (form.vitals.temperature && Number(form.vitals.temperature) >= 38) nextErrors.push("Temperature is >= 38.0 C and needs delay review as per policy.");
    if (form.vitals.painScore && (Number(form.vitals.painScore) < 0 || Number(form.vitals.painScore) > 10)) nextErrors.push("Pain score must stay within 0-10.");

    nextErrors.push(...getBagErrors(form.bags, patientGroup).flatMap((bagError) => Object.values(bagError)));

    return nextErrors.length === 0;
  }

  function startTransfusion() {
    const ok = validate();
    if (!ok) {
      toast.error("Cannot start transfusion until validation passes.");
      return;
    }
    setStarted(true);
    toast.success("Transfusion marked as started.");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pre-Transfusion Bedside Verification"
      />

      {/* <AlertBanner icon={ShieldAlert} tone="warning" title="Safety gate">
        Consent refusal, blood group mismatch, expired bag, or unchecked crossmatch will block progression to transfusion.
      </AlertBanner> */}
      {consentBlocked ? <AlertBanner icon={AlertTriangle} tone="danger" title="Cannot proceed without consent">Cannot proceed with transfusion - contact ordering physician.</AlertBanner> : null}
      {hasMismatch ? <AlertBanner icon={ShieldAlert} tone="danger" title="Blood group mismatch">Bag blood group must match patient blood group. Override reason and second clinician sign-off are mandatory for each mismatched bag.</AlertBanner> : null}
      {hasExpiredBag ? <AlertBanner icon={Clock3} tone="danger" title="Expired unit">One or more units are expired. Return the unit to Blood Bank before proceeding.</AlertBanner> : null}
      {!form.crossmatchConfirmed ? <AlertBanner icon={Droplets} tone="warning" title="Crossmatch pending">Start Transfusion stays blocked until crossmatch compatibility is confirmed.</AlertBanner> : null}
      {form.vitals.temperature && Number(form.vitals.temperature) >= 38 ? <AlertBanner icon={BellRing} tone="warning" title="Temperature warning">Temperature is 38.0 C or above. Review whether transfusion should be delayed per policy.</AlertBanner> : null}
      <PatientSummaryBanner />

      <div className="grid gap-6 ">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verification checks</CardTitle>
              {/* <CardDescription>Patient banner is read-only; scan/confirm identity before handling the bag.</CardDescription> */}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Consent for transfusion taken" required>
                <Check label="Consent checked and documented" checked={form.consentTaken} onChange={(checked) => setForm((current) => ({ ...current, consentTaken: checked }))} />
              </Field>
              <Field label="Patient blood group" required>
                <Select value={form.patientBloodGroup} onChange={(value) => setForm((current) => ({ ...current, patientBloodGroup: value as BloodGroup }))}>
                  {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                </Select>
              </Field>
              <Field label="Type of blood component" required className="md:col-span-2">
                <Select value={form.componentType} onChange={(value) => setForm((current) => ({ ...current, componentType: value }))}>
                  {componentOptions.map((component) => <option key={component} value={component}>{component}</option>)}
                </Select>
              </Field>
              {hasOtherComponent ? (
                <Field label="Others description" required className="md:col-span-2">
                  <Input value={form.componentOtherText} onChange={(event) => setForm((current) => ({ ...current, componentOtherText: event.target.value }))} placeholder="Specify the component" />
                </Field>
              ) : null}
              {/* <Check label="Patient identity verified" checked={form.patientIdentityVerified} onChange={(checked) => setForm((current) => ({ ...current, patientIdentityVerified: checked }))} />
              <Check label="Prescription/order checked" checked={form.prescriptionChecked} onChange={(checked) => setForm((current) => ({ ...current, prescriptionChecked: checked }))} />
              <Check label="Unit label checked" checked={form.unitLabelChecked} onChange={(checked) => setForm((current) => ({ ...current, unitLabelChecked: checked }))} />
              <Check label="Patient blood group confirmed" checked={form.bloodGroupConfirmed} onChange={(checked) => setForm((current) => ({ ...current, bloodGroupConfirmed: checked }))} />
              <Check label="Crossmatch compatibility confirmed" checked={form.crossmatchConfirmed} onChange={(checked) => setForm((current) => ({ ...current, crossmatchConfirmed: checked }))} /> */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Bag verification</CardTitle>
                {/* <CardDescription>Repeat once for each unit or bag being transfused.</CardDescription> */}
              </div>
              <Button type="button" variant="outline" onClick={addBag}>
                Add bag
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.bags.map((bag, index) => {
                const bagMismatch = !!bag.bloodGroup && !isBloodGroupMatch(patientGroup, bag.bloodGroup);
                const bagExpired = !!bag.expiryDate && compareDates(bag.expiryDate, todayIso()) < 0;
                return (
                  <div key={bag.id} className="rounded-xl border border-border bg-surface-muted/40 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge tone="info">Bag {index + 1}</Badge>
                        {bagMismatch ? <Badge tone="danger">Blood group mismatch</Badge> : null}
                        {bagExpired ? <Badge tone="danger">Expired</Badge> : null}
                      </div>
                      <Button type="submit" variant="outline" className="sm:w-auto" onClick={() => applyBagScan(bag.id)}>
                        <ScanLine className="h-4 w-4" />
                          Scan
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => removeBag(bag.id)} disabled={form.bags.length === 1}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {/* <Field label="Scan bag barcode" required className="md:col-span-2 xl:col-span-4">
                        <div className="flex gap-2">
                          <Input
                            value={bag.scanValue}
                            onChange={(event) => updateBag(bag.id, { scanValue: event.target.value })}
                            placeholder="bagNo|bloodGroup|collectionDate|expiryDate|compatibility"
                          />
                          <Button type="button" variant="outline" onClick={() => applyBagScan(bag.id)}>
                            Scan
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Example: BU-10231|A+|2026-06-14|2026-06-21|Yes</p>
                      </Field> */}
                        
                      <Field label="Bag no." required>
                        <Input
                          value={bag.bagNo}
                          onChange={(event) => updateBag(bag.id, { bagNo: event.target.value })}
                          placeholder="Manual fallback"
                          className={bagErrors[index]?.bagNo ? "border-danger focus-visible:ring-danger/20" : ""}
                        />
                        <VitalMessage message={bagErrors[index]?.bagNo} />
                      </Field>
                      <Field label="Blood group on bag" required>
                        <Select value={bag.bloodGroup} onChange={(value) => updateBag(bag.id, { bloodGroup: value as BloodGroup })} >
                          {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
                        </Select>
                        <VitalMessage message={bagErrors[index]?.bloodGroup} />
                      </Field>
                      <Field label="Collection date" required>
                        <Input type="date" value={bag.collectionDate} max={todayIso()} onChange={(event) => updateBag(bag.id, { collectionDate: event.target.value })} className={bagErrors[index]?.collectionDate ? "border-danger focus-visible:ring-danger/20" : ""} />
                        <VitalMessage message={bagErrors[index]?.collectionDate} />
                      </Field>
                      <Field label="Expiry date" required>
                        <Input type="date" value={bag.expiryDate} min={todayIso()} onChange={(event) => updateBag(bag.id, { expiryDate: event.target.value })} className={bagErrors[index]?.expiryDate ? "border-danger focus-visible:ring-danger/20" : ""} />
                        <VitalMessage message={bagErrors[index]?.expiryDate} />
                      </Field>
                      <div className="md:col-span-2 xl:col-span-4">
                        <Check label="Crossmatch compatibility confirmed" checked={bag.compatibilityConfirmed} onChange={(checked) => updateBag(bag.id, { compatibilityConfirmed: checked })} />
                        <VitalMessage message={bagErrors[index]?.compatibilityConfirmed} />
                      </div>
                      {bagMismatch ? (
                        <>
                          <Field label="Override reason" required className="md:col-span-2 xl:col-span-4">
                            <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={bag.overrideReason} onChange={(event) => updateBag(bag.id, { overrideReason: event.target.value })} placeholder="Document mismatch reason" />
                            <VitalMessage message={bagErrors[index]?.overrideReason} />
                          </Field>
                          <Field label="Second clinician verification" required className="md:col-span-2 xl:col-span-4">
                            <Input value={bag.secondClinician} onChange={(event) => updateBag(bag.id, { secondClinician: event.target.value })} placeholder="Name / signature of second clinician" className={bagErrors[index]?.secondClinician ? "border-danger focus-visible:ring-danger/20" : ""} />
                            <VitalMessage message={bagErrors[index]?.secondClinician} />
                          </Field>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pre-transfusion vitals</CardTitle>
              {/* <CardDescription>Capture baseline vitals before transfusion begins.</CardDescription> */}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Pulse" required icon={<BadgeCheck className="h-4 w-4" />}>
                <Input type="number" value={form.vitals.pulse} onChange={(event) => setForm((current) => ({ ...current, vitals: { ...current.vitals, pulse: event.target.value } }))} className={vitalErrors.pulse ? "border-danger focus-visible:ring-danger/20" : ""} />
                <VitalMessage message={vitalErrors.pulse} />
              </Field>
              <Field label="Blood pressure systolic" required>
                <Input type="number" value={form.vitals.bloodPressureSystolic} onChange={(event) => setForm((current) => ({ ...current, vitals: { ...current.vitals, bloodPressureSystolic: event.target.value } }))} className={vitalErrors.bloodPressureSystolic ? "border-danger focus-visible:ring-danger/20" : ""} />
                <VitalMessage message={vitalErrors.bloodPressureSystolic} />
              </Field>
              <Field label="Blood pressure diastolic" required>
                <Input type="number" value={form.vitals.bloodPressureDiastolic} onChange={(event) => setForm((current) => ({ ...current, vitals: { ...current.vitals, bloodPressureDiastolic: event.target.value } }))} className={vitalErrors.bloodPressureDiastolic ? "border-danger focus-visible:ring-danger/20" : ""} />
                <VitalMessage message={vitalErrors.bloodPressureDiastolic} />
              </Field>
              <Field label="Respiratory rate" required>
                <Input type="number" value={form.vitals.respiratoryRate} onChange={(event) => setForm((current) => ({ ...current, vitals: { ...current.vitals, respiratoryRate: event.target.value } }))} className={vitalErrors.respiratoryRate ? "border-danger focus-visible:ring-danger/20" : ""} />
                <VitalMessage message={vitalErrors.respiratoryRate} />
              </Field>
              <Field label="Temperature" required>
                <Input type="number" step="0.1" value={form.vitals.temperature} onChange={(event) => setForm((current) => ({ ...current, vitals: { ...current.vitals, temperature: event.target.value } }))} className={vitalErrors.temperature ? "border-danger focus-visible:ring-danger/20" : ""} />
                <VitalMessage message={vitalErrors.temperature} />
              </Field>
              <Field label="Pain score">
                <Input type="number" value={form.vitals.painScore} onChange={(event) => setForm((current) => ({ ...current, vitals: { ...current.vitals, painScore: event.target.value } }))} className={vitalErrors.painScore ? "border-danger focus-visible:ring-danger/20" : ""} />
                <VitalMessage message={vitalErrors.painScore} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sign-off</CardTitle>
              {/* <CardDescription>Verification time becomes the transfusion start reference for Screen 3.</CardDescription> */}
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Doctor's signature" required>
                <Input value={form.doctorSignature} onChange={(event) => setForm((current) => ({ ...current, doctorSignature: event.target.value }))} placeholder="Digital signature" />
              </Field>
              <Field label="Verifying nurse signature" required>
                <Input value={form.nurseSignature} onChange={(event) => setForm((current) => ({ ...current, nurseSignature: event.target.value }))} placeholder="Digital signature" />
              </Field>
              <Field label="Date / time of verification" className="md:col-span-2">
                <Input value={form.verifiedAt} readOnly />
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          

          {/* <Card>
            <CardHeader>
              <CardTitle>Action</CardTitle>
              <CardDescription>The button below is the only path to Screen 3.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button type="button" className="w-full" onClick={startTransfusion} disabled={!canStart}>
                Start Transfusion
              </Button>
              {!canStart ? <div className="text-sm text-muted-foreground">Complete all mandatory checks to enable Screen 3.</div> : <div className="text-sm text-emerald-600">All hard-stop checks are clear.</div>}
            </CardContent>
          </Card> */}
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={startTransfusion} disabled={!canStart}>
               Start Transfusion
            </Button>
              {started ? <AlertBanner icon={ShieldCheck} tone="success" title="Transfusion started">Verification completed at {form.verifiedAt}. Use this timestamp for Screen 3.</AlertBanner> : null}
          </div>        
          {/* <Card>
            <CardHeader>
              <CardTitle>Validation summary</CardTitle>
              <CardDescription>Immediate reasons that block progression.</CardDescription>
            </CardHeader>
            <CardContent>
              {errors.length ? (
                <ul className="space-y-2 text-sm text-foreground">
                  {errors.map((error) => <li key={error} className="rounded-md border border-border bg-surface-muted px-3 py-2">{error}</li>)}
                </ul>
              ) : (
                <div className="text-sm text-muted-foreground">No blocking validation errors found.</div>
              )}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}

function getVitalErrors(vitals: VitalsState): Record<VitalErrorKey, string> {
  const errors: Record<VitalErrorKey, string> = {
    pulse: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    respiratoryRate: "",
    temperature: "",
    painScore: "",
  };

  const pulse = vitals.pulse ? Number(vitals.pulse) : NaN;
  const systolic = vitals.bloodPressureSystolic ? Number(vitals.bloodPressureSystolic) : NaN;
  const diastolic = vitals.bloodPressureDiastolic ? Number(vitals.bloodPressureDiastolic) : NaN;
  const respiratoryRate = vitals.respiratoryRate ? Number(vitals.respiratoryRate) : NaN;
  const temperature = vitals.temperature ? Number(vitals.temperature) : NaN;
  const painScore = vitals.painScore ? Number(vitals.painScore) : NaN;

  if (Number.isFinite(pulse) && (pulse < 0 || pulse > 250)) errors.pulse = "Pulse must be between 0 and 250 beats/min.";
  if (Number.isFinite(systolic) && (systolic < 0 || systolic > 300)) errors.bloodPressureSystolic = "Systolic BP must be between 0 and 300 mmHg.";
  if (Number.isFinite(diastolic) && (diastolic < 0 || diastolic > 200)) errors.bloodPressureDiastolic = "Diastolic BP must be between 0 and 200 mmHg.";
  if (Number.isFinite(respiratoryRate) && (respiratoryRate < 0 || respiratoryRate > 60)) errors.respiratoryRate = "Respiratory rate must be between 0 and 60 breaths/min.";
  if (Number.isFinite(temperature) && (temperature < 30 || temperature > 43)) errors.temperature = "Temperature must be between 30.0 and 43.0 C.";
  else if (Number.isFinite(temperature) && temperature >= 38) errors.temperature = "Temperature is 38.0 C or above. Review delay policy.";
  if (Number.isFinite(painScore) && (painScore < 0 || painScore > 10)) errors.painScore = "Pain score must be between 0 and 10.";

  return errors;
}

function getBagErrors(bags: VerificationRow[], patientGroup: BloodGroup): BagErrorMap[] {
  return bags.map((bag, index) => {
    const errors: BagErrorMap = {};

    if (!bag.bagNo.trim()) errors.bagNo = `Bag ${index + 1}: bag number is required.`;
    if (!bag.bloodGroup.trim()) errors.bloodGroup = `Bag ${index + 1}: blood group is required.`;
    if (!bag.collectionDate.trim()) errors.collectionDate = `Bag ${index + 1}: collection date is required.`;
    if (!bag.expiryDate.trim()) errors.expiryDate = `Bag ${index + 1}: expiry date is required.`;
    if (bag.expiryDate && compareDates(bag.expiryDate, todayIso()) < 0) errors.expiryDate = `Bag ${index + 1}: expiry date is in the past. Return the unit to Blood Bank.`;
    if (!bag.compatibilityConfirmed) errors.compatibilityConfirmed = `Bag ${index + 1}: crossmatch compatibility must be confirmed.`;

    const mismatch = bag.bloodGroup.trim() && !isBloodGroupMatch(patientGroup, bag.bloodGroup);
    if (mismatch && !bag.overrideReason.trim()) errors.overrideReason = `Bag ${index + 1}: override reason is required for blood group mismatch.`;
    if (mismatch && !bag.secondClinician.trim()) errors.secondClinician = `Bag ${index + 1}: second clinician verification is required for mismatch override.`;

    return errors;
  });
}

function VitalMessage({ message }: { message?: string }) {
  if (!message) {
    return <p className="text-xs text-muted-foreground"> </p>;
  }

  return <p className="text-xs font-medium text-danger">{message}</p>;
}

function Field({ label, required, children, icon, className }: { label: string; required?: boolean; children: React.ReactNode; icon?: React.ReactNode; className?: string }) {
  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        <span>{label}</span>
        {required ? <span className="text-red-500">*</span> : null}
      </div>
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button type="button" className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-left text-sm" onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className={`ml-3 inline-flex h-5 w-9 items-center rounded-full transition ${checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-700"}`}>
        <span className={`ml-0.5 inline-block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20">
      {children}
    </select>
  );
}
