"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shell/page-header";
import {
  bloodAdministrationEpisode,
  reactionSymptoms,
  otherComponentMonitoringSchedule,
  wholeBloodMonitoringSchedule,
  type MonitoringScheduleItem,
  type ReactionSymptom,
} from "./blood-administration-data";
import { PatientSummaryBanner } from "./shared/patient-summary-banner";

type VitalsRow = {
  id: string;
  date: string;
  time: string;
  timepointLabel: MonitoringScheduleItem["label"];
  pulse: string;
  systolic: string;
  diastolic: string;
  temperature: string;
  respiratoryRate: string;
  nurseName: string;
  clockNo: string;
};

type RowErrors = Partial<Record<keyof Omit<VitalsRow, "id">, string>>;

const timepointOptions: MonitoringScheduleItem["label"][] = wholeBloodMonitoringSchedule.map((item) => item.label);
const datePattern = /^\d{2} [A-Z][a-z]{2} \d{2}$/;
const timePattern = /^\d{2}:\d{2}$/;

function nowDate() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }).replace(/ /g, " ");
}

function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function makeRow(label: MonitoringScheduleItem["label"], patch: Partial<VitalsRow> = {}): VitalsRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: nowDate(),
    time: nowTime(),
    timepointLabel: label,
    pulse: "",
    systolic: "",
    diastolic: "",
    temperature: "",
    respiratoryRate: "",
    nurseName: "S. Reddy",
    clockNo: bloodAdministrationEpisode.clockNo,
    ...patch,
  };
}

function getScheduleFor(componentType: string) {
  return componentType === "Packed Red Cells" || componentType === "Whole Blood / Leucoreduced Red Cells"
    ? wholeBloodMonitoringSchedule
    : otherComponentMonitoringSchedule;
}

function validateRow(row: VitalsRow, index: number): RowErrors {
  const errors: RowErrors = {};
  if (!row.date) errors.date = `Entry ${index + 1}: date is required.`;
  else if (!datePattern.test(row.date)) errors.date = `Entry ${index + 1}: date must be in DD Mon YY format.`;
  if (!row.time) errors.time = `Entry ${index + 1}: time is required.`;
  else if (!timePattern.test(row.time)) errors.time = `Entry ${index + 1}: time must be in HH:MM format.`;
  if (!row.timepointLabel) errors.timepointLabel = `Entry ${index + 1}: timepoint label is required.`;
  if (!row.pulse) errors.pulse = `Entry ${index + 1}: pulse is required.`;
  else if (!/^\d+$/.test(row.pulse) || Number(row.pulse) < 0 || Number(row.pulse) > 250) errors.pulse = `Entry ${index + 1}: pulse must be 0-250.`;
  if (!row.systolic) errors.systolic = `Entry ${index + 1}: systolic BP is required.`;
  else if (!/^\d+$/.test(row.systolic) || Number(row.systolic) < 0 || Number(row.systolic) > 300) errors.systolic = `Entry ${index + 1}: systolic BP must be 0-300.`;
  if (!row.diastolic) errors.diastolic = `Entry ${index + 1}: diastolic BP is required.`;
  else if (!/^\d+$/.test(row.diastolic) || Number(row.diastolic) < 0 || Number(row.diastolic) > 200) errors.diastolic = `Entry ${index + 1}: diastolic BP must be 0-200.`;
  if (!row.temperature) errors.temperature = `Entry ${index + 1}: temperature is required.`;
  else if (!/^\d+(\.\d)?$/.test(row.temperature) || Number(row.temperature) < 30 || Number(row.temperature) > 43) errors.temperature = `Entry ${index + 1}: temperature must be 30.0-43.0 C.`;
  if (!row.respiratoryRate) errors.respiratoryRate = `Entry ${index + 1}: respiratory rate is required.`;
  else if (!/^\d+$/.test(row.respiratoryRate) || Number(row.respiratoryRate) < 0 || Number(row.respiratoryRate) > 60) errors.respiratoryRate = `Entry ${index + 1}: respiratory rate must be 0-60.`;
  if (!row.nurseName) errors.nurseName = `Entry ${index + 1}: nurse name is required.`;
  if (!row.clockNo) errors.clockNo = `Entry ${index + 1}: clock no. is required.`;
  return errors;
}

export function NurseBloodAdministrationPage() {
  const schedule = getScheduleFor(bloodAdministrationEpisode.componentType);
  const [rows, setRows] = React.useState<VitalsRow[]>([
    makeRow(schedule[0]?.label ?? "Immediately before starting transfusion", {
      pulse: String(bloodAdministrationEpisode.baselinePulse),
      systolic: String(bloodAdministrationEpisode.baselineSystolic),
      diastolic: String(bloodAdministrationEpisode.baselineDiastolic),
      temperature: String(bloodAdministrationEpisode.baselineTemperature.toFixed(1)),
      respiratoryRate: String(bloodAdministrationEpisode.baselineRespiratoryRate),
    }),
  ]);
  const [symptoms, setSymptoms] = React.useState<Record<ReactionSymptom, boolean>>(
    Object.fromEntries(reactionSymptoms.map((symptom) => [symptom, false])) as Record<ReactionSymptom, boolean>,
  );
  const [reactionDescription, setReactionDescription] = React.useState("");
  const [actionsTaken, setActionsTaken] = React.useState<Record<string, boolean>>({});
  const [episodeCompleted, setEpisodeCompleted] = React.useState(false);
  const [showReactionReportPrompt, setShowReactionReportPrompt] = React.useState(false);

  function updateRow(id: string, patch: Partial<VitalsRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    const nextTimepoint = schedule[Math.min(rows.length, schedule.length - 1)]?.label ?? "Ad-hoc / Reaction";
    setRows((current) => [...current, makeRow(nextTimepoint)]);
  }

  function toggleSymptom(symptom: ReactionSymptom) {
    setSymptoms((current) => {
      const next = { ...current, [symptom]: !current[symptom] };
      if (Object.values(next).some(Boolean)) setShowReactionReportPrompt(true);
      return next;
    });
  }

  function toggleAction(action: string) {
    setActionsTaken((current) => ({ ...current, [action]: !current[action] }));
  }

  const reactionTriggered = Object.values(symptoms).some(Boolean);
  const rowErrors = rows.map((row, index) => validateRow(row, index));
  const hasRowErrors = rowErrors.some((rowError) => Object.values(rowError).some(Boolean));
  const scheduleLabels = schedule.map((item) => item.label);
  const scheduleSatisfied = scheduleLabels.every((label) => rows.some((row) => row.timepointLabel === label));
  const requiresFinalPost = bloodAdministrationEpisode.componentType === "Packed Red Cells" || bloodAdministrationEpisode.componentType === "Whole Blood / Leucoreduced Red Cells";
  const hasFinalCompletion = rows.some((row) => row.timepointLabel === "At completion of each pack");
  const hasPostCompletion = !requiresFinalPost || rows.some((row) => row.timepointLabel === "One hour after completion");
  const reactionFieldsComplete = !reactionTriggered || (reactionDescription.trim().length > 0 && Object.values(actionsTaken).some(Boolean));
  const canComplete = !hasRowErrors && scheduleSatisfied && hasFinalCompletion && hasPostCompletion && reactionFieldsComplete;

  return (
    <div className="space-y-6">
      <PageHeader title="Blood Transfusion Monitoring" />
      <PatientSummaryBanner />

      <Card>
        <CardHeader>
          <CardTitle>Vitals Flowsheet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-stone-200">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-[1120px] w-full border-collapse text-sm">
              <thead className="bg-gradient-to-r from-stone-100 to-stone-50">
                <tr>
                  {["Timepoint", "Date", "Time", "Pulse /min", "BP Sys mmHg", "BP Dia mmHg", "Temp C", "RR /min", "Nurse / ID"].map((heading) => (
                    <th key={heading} className="border border-stone-200 px-3 py-3 text-left font-semibold text-stone-700 md:px-4">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {rows.map((row, index) => (
                  <tr key={row.id} className={index < 2 ? "bg-white hover:bg-stone-50" : "bg-stone-50/50 hover:bg-stone-100"}>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <select
                        className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                        value={row.timepointLabel}
                        onChange={(event) => updateRow(row.id, { timepointLabel: event.target.value as MonitoringScheduleItem["label"] })}
                      >
                        {timepointOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.date} onChange={(value) => updateRow(row.id, { date: value })} />
                      <InlineError message={rowErrors[index]?.date ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.time} onChange={(value) => updateRow(row.id, { time: value })} />
                      <InlineError message={rowErrors[index]?.time ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.pulse} onChange={(value) => updateRow(row.id, { pulse: value })} />
                      <InlineError message={rowErrors[index]?.pulse ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.systolic} onChange={(value) => updateRow(row.id, { systolic: value })} />
                      <InlineError message={rowErrors[index]?.systolic ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.diastolic} onChange={(value) => updateRow(row.id, { diastolic: value })} />
                      <InlineError message={rowErrors[index]?.diastolic ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.temperature} onChange={(value) => updateRow(row.id, { temperature: value })} />
                      <InlineError message={rowErrors[index]?.temperature ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4">
                      <CellInput value={row.respiratoryRate} onChange={(value) => updateRow(row.id, { respiratoryRate: value })} />
                      <InlineError message={rowErrors[index]?.respiratoryRate ?? ""} />
                    </td>
                    <td className="border border-stone-200 px-3 py-3 md:px-4"><CellInput value={`${row.nurseName} / ${row.clockNo}`} readOnly /></td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={addRow}>Add vitals entry</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Reaction Symptoms</CardTitle>
            <CardDescription>Tick if present during transfusion</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {reactionSymptoms.map((symptom) => (
              <label
                key={symptom}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${symptoms[symptom] ? "border-red-400 bg-red-50 text-red-950" : "border-stone-300 bg-white text-stone-800 hover:border-stone-400"}`}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-stone-400 text-danger focus:ring-danger"
                  checked={symptoms[symptom]}
                  onChange={() => toggleSymptom(symptom)}
                />
                <span>{symptom}</span>
              </label>
            ))}
          </div>

          {reactionTriggered ? (
            <div className="mt-6 space-y-4">
              <AlertBanner
                icon={AlertTriangle}
                tone="danger"
                title="STOP TRANSFUSION"
                className="rounded-lg border-danger/40 bg-danger/5 text-danger"
              >
                Stop transfusion immediately, inform doctor and Blood Bank, retain the blood bag, and keep the IV line patent.
              </AlertBanner>

              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-700">Reaction Description</p>
                <textarea
                  className="min-h-28 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
                  value={reactionDescription}
                  onChange={(event) => setReactionDescription(event.target.value)}
                  placeholder="Describe severity, onset, and timing of symptoms..."
                />
                <InlineError message={reactionDescription.trim() ? "" : "Required when any reaction symptom is selected."} />
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-700">Actions Taken</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {["Transfusion stopped", "Doctor informed", "IV line kept patent", "Blood bag retained", "Blood Bank notified", "Samples sent"].map((action) => (
                    <label key={action} className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 transition-colors hover:bg-stone-100">
                      <input type="checkbox" checked={Boolean(actionsTaken[action])} onChange={() => toggleAction(action)} className="h-4 w-4 rounded border-stone-400 text-danger focus:ring-danger" />
                      {action}
                    </label>
                  ))}
                </div>
                <InlineError message={Object.values(actionsTaken).some(Boolean) ? "" : "At least one action is required when reaction symptoms are selected."} />
              </div>
              {/* <Button type="button" variant="outline" onClick={() => setShowReactionReportPrompt(true)}>
                Open Transfusion Reaction Report
              </Button> */}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Sign-Off</CardTitle>
          <CardDescription>Completion signatures and timestamp</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <SignCard title="Nurse signature" name="S. Reddy" time="10:22" />
            <SignCard title="Doctor signature" name="Dr. R. Mehta" time="10:23" />
            <SignCard title="Timestamp" name="16 Jun 2025 - 02:15 pm" time="" />
          </div>
          <Button type="button" className="w-full" disabled={!canComplete} onClick={() => setEpisodeCompleted(true)}>
            Transfusion marked complete
          </Button>
          {!canComplete ? <p className="text-sm text-stone-500">Complete required vitals, schedule timepoints, and reaction fields before closing.</p> : null}
        </CardContent>
      </Card> */}
      <div className="flex justify-end gap-2">
        <Button type="button" disabled={!canComplete} onClick={() => setEpisodeCompleted(true)}>
            Transfusion marked complete
        </Button>
           {/* {!canComplete ? <p className="text-sm text-stone-500">Complete required vitals, schedule timepoints, and reaction fields before closing.</p> : null} */}
      </div>  
      {showReactionReportPrompt ? (
        <AlertBanner icon={AlertTriangle} tone="warning" title="Transfusion Reaction Report">
          Open this workflow to document the reaction details, retain the bag and samples, record compatibility form handling, notify doctor and Blood Bank, and close the episode only after the reaction fields are complete.
        </AlertBanner>
      ) : null}
      {episodeCompleted ? <AlertBanner icon={ShieldAlert} tone="success" title="Flowsheet completed">Monitoring episode closed for {bloodAdministrationEpisode.patientName}.</AlertBanner> : null}
    </div>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm shadow-sm">
      <div className="font-medium text-stone-600">{label}</div>
      <div className="mt-1 text-base font-semibold text-stone-900">{value}</div>
    </div>
  );
}

function SignCard({ title, name, time }: { title: string; name: string; time: string }) {
  return (
    <div className="rounded-lg border border-stone-300 bg-white p-4 shadow-sm">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-600">[ ] {title}</div>
      <div className="mt-2">
        <div className="text-base font-semibold text-stone-900">{name}</div>
        {time && <div className="mt-1 text-sm text-stone-600">{time}</div>}
      </div>
      <Button type="button" variant="outline" className="mt-4 w-full text-sm">
        Sign
      </Button>
    </div>
  );
}

function CellInput({
  value,
  onChange,
  placeholder,
  readOnly,
}: {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <Input
      className="h-10 rounded-md border-stone-300 bg-white text-center text-sm shadow-none outline-none transition-colors focus:ring-2 focus:ring-blue-500/20"
      value={value}
      placeholder={placeholder}
      readOnly={readOnly}
      onChange={(event) => onChange?.(event.target.value)}
    />
  );
}

function InlineError({ message }: { message: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-danger">{message}</p>;
}
