"use client";

import * as React from "react";
import { ClipboardPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdmissionStore } from "@/features/operations/admission/admission-store";
import type { AdmissionPriority } from "@/features/operations/admission/types";

const controlClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

const electiveOptions = ["Daycare", "Plan", "Surgery", "Regular"];
const nonElectiveOptions = [
  "IPD Admission",
  "OT Admission",
  "Transfer to Home",
  "Transfer to Ward",
  "Transfer to ICU",
];
const _admittingTeams = [
  "Medical Team",
  "Surgical Team",
  "Critical Care Team",
  "Orthopedic Team",
  "Pediatric Team",
];
const doctorTeams = [
  "Dr. Sameer Mehta Team",
  "Dr. Kavita Rao Team",
  "Dr. Aman Verma Team",
  "Dr. Neha Malik Team",
  "Dr. Imran Shah Team",
  "Duty Doctor Team",
];

export function DoctorAdmissionOrder() {
  const { selectedPatient, activeRequest, state, actions } = useAdmissionStore();
  const selectedPatientKey = selectedPatient?.id ?? "";
  const [syncedPatientKey, setSyncedPatientKey] = React.useState(selectedPatientKey);
  const [patientName, setPatientName] = React.useState(selectedPatient?.name ?? "");
  const [uhid, setUhid] = React.useState(selectedPatient?.uhid ?? "Auto generated");
  const [admissionCategory, setAdmissionCategory] = React.useState<"Elective" | "Non Elective">(
    state.selectedScenario === "Emergency Unknown Patient" ? "Non Elective" : "Elective",
  );
  const [admissionSubtype, setAdmissionSubtype] = React.useState(
    state.selectedScenario === "Emergency Unknown Patient"
      ? nonElectiveOptions[0]
      : electiveOptions[0],
  );
  const [qrReference, setQrReference] = React.useState("");

  if (syncedPatientKey !== selectedPatientKey) {
    setSyncedPatientKey(selectedPatientKey);
    setPatientName(selectedPatient?.name ?? "");
    setUhid(selectedPatient?.uhid ?? "Auto generated");
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("patientName") ?? "").trim();
    if (!name) {
      toast.error("Patient name required.");
      return;
    }
    const doctorTeam = String(form.get("doctorTeam") ?? doctorTeams[0]);
    actions.submitDoctorOrder({
      patientName: name,
      uhid: String(form.get("uhid") ?? "") || "Auto generated",
      source: String(form.get("source") ?? "OPD"),
      doctor: doctorTeam,
      doctorTeam: [doctorTeam],
      admittingTeam: String(form.get("admittingTeam") ?? "Medical Team"),
      admissionCategory,
      type: admissionSubtype,
      ward: String(form.get("ward") ?? "General Ward"),
      priority: String(form.get("priority") ?? "Stable") as AdmissionPriority,
      allergyNote: String(form.get("allergyNote") ?? ""),
      instructions: String(form.get("instructions") ?? ""),
      qrReference: qrReference || `${String(form.get("uhid") ?? "AUTO")}-PENDING-QR`,
    });
    toast.success("Admission request submitted.");
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Patient Name">
              <Input
                name="patientName"
                placeholder="Enter patient name"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
              />
            </Field>
            <Field label="UHID / Patient ID">
              <Input name="uhid" value={uhid} onChange={(event) => setUhid(event.target.value)} />
            </Field>
            <Field label="Source">
              <select
                className={controlClass}
                name="source"
                defaultValue={
                  state.selectedScenario === "Emergency Unknown Patient" ? "Emergency" : "OPD"
                }
              >
                {["OPD", "Emergency", "IPD", "Daycare", "Transfer"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            {/* <Field label="Admitting Team">
              <select className={controlClass} name="admittingTeam" defaultValue="Medical Team">
                {admittingTeams.map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field> */}
            <Field label="Doctor Team">
              <select className={controlClass} name="doctorTeam" defaultValue={doctorTeams[0]}>
                {doctorTeams.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Admission Type">
              <select
                className={controlClass}
                name="admissionCategory"
                value={admissionCategory}
                onChange={(event) => {
                  const nextCategory = event.target.value as
                    "Elective" | "Non Elective" | "Daycare";
                  // setAdmissionCategory(nextCategory);
                  setAdmissionSubtype(
                    nextCategory === "Elective" ? electiveOptions[0] : nonElectiveOptions[0],
                  );
                }}
              >
                {["Elective", "Non Elective", "Daycare"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            {/* <Field label={admissionCategory === "Elective" ? "Elective Type" : "Non Elective Type"}>
              <select className={controlClass} name="type" value={admissionSubtype} onChange={(event) => setAdmissionSubtype(event.target.value)}>
                {(admissionCategory === "Elective" ? electiveOptions : nonElectiveOptions).map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field> */}
            <Field label="Requested Ward">
              <select className={controlClass} name="ward" defaultValue="ICU">
                {["ICU", "General Ward", "Private Ward", "Emergency", "Pediatric"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                className={controlClass}
                name="priority"
                defaultValue={
                  state.selectedScenario === "Emergency Unknown Patient" ? "Critical" : "Stable"
                }
              >
                {["Stable", "Critical"].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            {/* <label className="space-y-1 text-sm md:col-span-2 xl:col-span-3">
              <span className="font-medium text-foreground">Allergy Note</span>
              <textarea className={`${controlClass} h-auto min-h-20 resize-y`} name="allergyNote" placeholder="Add allergy details, unknown allergy status, or safety alerts" />
            </label> */}
            <label className="space-y-1 text-sm md:col-span-2 xl:col-span-3">
              <span className="font-medium text-foreground">Instruction Note</span>
              <textarea
                className={`${controlClass} h-auto min-h-24 resize-y`}
                name="instructions"
                placeholder="Add admission instructions, precautions, or nursing notes"
              />
            </label>
          </div>

          {/* <div className="rounded-lg border border-dashed border-border bg-surface-muted p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Generate QR</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {qrReference ? `QR reference: ${qrReference}` : "Create the admission QR reference after selecting admission details."}
                </div>
              </div>
              <Button type="button" variant="outline" onClick={generateQrReference}>
                <QrCode className="h-4 w-4" />
                Generate QR
              </Button>
            </div>
          </div> */}

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-muted-foreground">
              Active request:{" "}
              {activeRequest
                ? `${activeRequest.patient} | ${activeRequest.status}`
                : "No admission request submitted yet."}
            </span>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPatientName(selectedPatient?.name ?? "");
                  setUhid(selectedPatient?.uhid ?? "Auto generated");
                  const nextCategory =
                    state.selectedScenario === "Emergency Unknown Patient"
                      ? "Non Elective"
                      : "Elective";
                  setAdmissionCategory(nextCategory);
                  setAdmissionSubtype(
                    nextCategory === "Elective" ? electiveOptions[0] : nonElectiveOptions[0],
                  );
                  setQrReference("");
                }}
              >
                Clear
              </Button>
              <Button>
                <ClipboardPlus className="h-4 w-4" />
                Submit Admission Request
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
