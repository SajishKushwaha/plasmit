"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { groupedTests, priorities, specimenSources } from "./data";
import type {
  PathologyIndicationType,
  PathologyPriority,
  PathologyOrderHistory,
  PathologyRequestType,
  PathologySex,
  PathologyTest,
} from "./types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
      {children}
    </div>
  );
}

function CheckboxRow({
  label,
  checked,
  indent = false,
  onToggle,
}: {
  label: string;
  checked?: boolean;
  indent?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        "flex w-full items-center gap-2 border-b border-border/60 py-2 text-left text-sm last:border-0",
        indent ? "pl-5 text-xs text-muted-foreground" : "text-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
          checked ? "border-primary bg-primary" : "border-border bg-white",
        ].join(" ")}
      >
        {checked ? <span className="h-1.5 w-1.5 rounded-[1px] bg-white" /> : null}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function SelectField({
  value,
  onChange,
  options,
}: {
  value: PathologyPriority;
  onChange: (_value: PathologyPriority) => void;
  options: PathologyPriority[];
}) {
  return (
    <select
      className="h-9 w-full rounded-md border border-input px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0"
      value={value}
      onChange={(event) => onChange(event.target.value as PathologyPriority)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

type SelectedTestRow = {
  id: string;
  selectedTests: string;
  type: string;
  department: string;
  specimenSource: string;
  fastingStatus: boolean;
  priority: PathologyPriority;
};

export function PathologyTestOrderTab({
  search,
  onSearchChange,
  filteredTests,
  selectedTestIds,
  selectedGroupIds,
  patientName: _patientName = "",
  onPatientNameChange: _onPatientNameChange = () => {},
  uhid: _uhid = "",
  onUhidChange: _onUhidChange = () => {},
  admissionNo: _admissionNo = "",
  onAdmissionNoChange: _onAdmissionNoChange = () => {},
  age: _age = "",
  onAgeChange: _onAgeChange = () => {},
  sex: _sex = "Female",
  onSexChange: _onSexChange = () => {},
  wardBedNo: _wardBedNo = "",
  onWardBedNoChange: _onWardBedNoChange = () => {},
  consultant: _consultant = "",
  onConsultantChange: _onConsultantChange = () => {},
  requestingDoctor: _requestingDoctor = "",
  onRequestingDoctorChange: _onRequestingDoctorChange = () => {},
  clinicalDiagnosis: _clinicalDiagnosis = "",
  onClinicalDiagnosisChange: _onClinicalDiagnosisChange = () => {},
  indicationType: _indicationType = "Therapeutic",
  onIndicationTypeChange: _onIndicationTypeChange = () => {},
  surgicalProcedure: _surgicalProcedure = "",
  onSurgicalProcedureChange: _onSurgicalProcedureChange = () => {},
  previousTransfusion: _previousTransfusion = "No",
  onPreviousTransfusionChange: _onPreviousTransfusionChange = () => {},
  previousTransfusionDetails: _previousTransfusionDetails = "",
  onPreviousTransfusionDetailsChange: _onPreviousTransfusionDetailsChange = () => {},
  previousReaction: _previousReaction = "No",
  onPreviousReactionChange: _onPreviousReactionChange = () => {},
  previousReactionDetails: _previousReactionDetails = "",
  onPreviousReactionDetailsChange: _onPreviousReactionDetailsChange = () => {},
  pregnancies: _pregnancies = "N/A",
  onPregnanciesChange: _onPregnanciesChange = () => {},
  miscarriage: _miscarriage = "",
  onMiscarriageChange: _onMiscarriageChange = () => {},
  stillBirth: _stillBirth = "",
  onStillBirthChange: _onStillBirthChange = () => {},
  erythroblastosis: _erythroblastosis = "",
  onErythroblastosisChange: _onErythroblastosisChange = () => {},
  antibodiesDetected: _antibodiesDetected = "No",
  onAntibodiesDetectedChange: _onAntibodiesDetectedChange = () => {},
  antibodyNames: _antibodyNames = "",
  onAntibodyNamesChange: _onAntibodyNamesChange = () => {},
  patientBloodGroup: _patientBloodGroup = "",
  onPatientBloodGroupChange: _onPatientBloodGroupChange = () => {},
  patientRh: _patientRh = "",
  onPatientRhChange: _onPatientRhChange = () => {},
  groupScreenDate: _groupScreenDate = "",
  onGroupScreenDateChange: _onGroupScreenDateChange = () => {},
  wbc: _wbc = "",
  onWbcChange: _onWbcChange = () => {},
  rbc: _rbc = "",
  onRbcChange: _onRbcChange = () => {},
  hb: _hb = "",
  onHbChange: _onHbChange = () => {},
  pcv: _pcv = "",
  onPcvChange: _onPcvChange = () => {},
  platelets: _platelets = "",
  onPlateletsChange: _onPlateletsChange = () => {},
  pt: _pt = "",
  onPtChange: _onPtChange = () => {},
  ptt: _ptt = "",
  onPttChange: _onPttChange = () => {},
  otherLabs: _otherLabs = "",
  onOtherLabsChange: _onOtherLabsChange = () => {},
  requestType: _requestType = "Routine",
  onRequestTypeChange: _onRequestTypeChange = () => {},
  requiredDate: _requiredDate = "",
  onRequiredDateChange: _onRequiredDateChange = () => {},
  requiredTime: _requiredTime = "",
  onRequiredTimeChange: _onRequiredTimeChange = () => {},
  natureOfEmergency: _natureOfEmergency = "",
  onNatureOfEmergencyChange: _onNatureOfEmergencyChange = () => {},
  consentExplained: _consentExplained = true,
  onConsentExplainedChange: _onConsentExplainedChange = () => {},
  doctorSignature: _doctorSignature = "",
  onDoctorSignatureChange: _onDoctorSignatureChange = () => {},
  consentText: _consentText = "",
  onConsentTextChange: _onConsentTextChange = () => {},
  errors = [],
  problems,
  newProblem,
  onNewProblemChange,
  problemListVisible,
  activeProblemView,
  onProblemListVisibleChange: _onProblemListVisibleChange,
  onActiveProblemViewChange,
  onAddProblem: _onAddProblem,
  onToggleTest,
  onToggleGroup,
  specimenSourceById,
  onSpecimenSourceChange,
  priority,
  onPriorityChange,
  fasting,
  onFastingChange,
  clinicalNotes: _clinicalNotes,
  onClinicalNotesChange: _onClinicalNotesChange,
  instructionsForLab,
  onInstructionsForLabChange,
  collectionDate: _collectionDate,
  onCollectionDateChange: _onCollectionDateChange,
  collectionTime: _collectionTime,
  onCollectionTimeChange: _onCollectionTimeChange,
  onOpenSummary,
  onSave,
  onSaveAndBill: _onSaveAndBill,
  onAddToBill: _onAddToBill,
  onReorderPrevious,
  onDownloadAllReports: _onDownloadAllReports,
}: {
  search: string;
  onSearchChange: (_value: string) => void;
  filteredTests: PathologyTest[];
  selectedTestIds: string[];
  selectedGroupIds: string[];
  patientName?: string;
  onPatientNameChange?: (_value: string) => void;
  uhid?: string;
  onUhidChange?: (_value: string) => void;
  admissionNo?: string;
  onAdmissionNoChange?: (_value: string) => void;
  age?: string;
  onAgeChange?: (_value: string) => void;
  sex?: PathologySex;
  onSexChange?: (_value: PathologySex) => void;
  wardBedNo?: string;
  onWardBedNoChange?: (_value: string) => void;
  consultant?: string;
  onConsultantChange?: (_value: string) => void;
  requestingDoctor?: string;
  onRequestingDoctorChange?: (_value: string) => void;
  clinicalDiagnosis?: string;
  onClinicalDiagnosisChange?: (_value: string) => void;
  indicationType?: PathologyIndicationType;
  onIndicationTypeChange?: (_value: PathologyIndicationType) => void;
  surgicalProcedure?: string;
  onSurgicalProcedureChange?: (_value: string) => void;
  previousTransfusion?: string;
  onPreviousTransfusionChange?: (_value: string) => void;
  previousTransfusionDetails?: string;
  onPreviousTransfusionDetailsChange?: (_value: string) => void;
  previousReaction?: string;
  onPreviousReactionChange?: (_value: string) => void;
  previousReactionDetails?: string;
  onPreviousReactionDetailsChange?: (_value: string) => void;
  pregnancies?: string;
  onPregnanciesChange?: (_value: string) => void;
  miscarriage?: string;
  onMiscarriageChange?: (_value: string) => void;
  stillBirth?: string;
  onStillBirthChange?: (_value: string) => void;
  erythroblastosis?: string;
  onErythroblastosisChange?: (_value: string) => void;
  antibodiesDetected?: string;
  onAntibodiesDetectedChange?: (_value: string) => void;
  antibodyNames?: string;
  onAntibodyNamesChange?: (_value: string) => void;
  patientBloodGroup?: string;
  onPatientBloodGroupChange?: (_value: string) => void;
  patientRh?: string;
  onPatientRhChange?: (_value: string) => void;
  groupScreenDate?: string;
  onGroupScreenDateChange?: (_value: string) => void;
  wbc?: string;
  onWbcChange?: (_value: string) => void;
  rbc?: string;
  onRbcChange?: (_value: string) => void;
  hb?: string;
  onHbChange?: (_value: string) => void;
  pcv?: string;
  onPcvChange?: (_value: string) => void;
  platelets?: string;
  onPlateletsChange?: (_value: string) => void;
  pt?: string;
  onPtChange?: (_value: string) => void;
  ptt?: string;
  onPttChange?: (_value: string) => void;
  otherLabs?: string;
  onOtherLabsChange?: (_value: string) => void;
  requestType?: PathologyRequestType;
  onRequestTypeChange?: (_value: PathologyRequestType) => void;
  requiredDate?: string;
  onRequiredDateChange?: (_value: string) => void;
  requiredTime?: string;
  onRequiredTimeChange?: (_value: string) => void;
  natureOfEmergency?: string;
  onNatureOfEmergencyChange?: (_value: string) => void;
  consentExplained?: boolean;
  onConsentExplainedChange?: (_value: boolean) => void;
  doctorSignature?: string;
  onDoctorSignatureChange?: (_value: string) => void;
  consentText?: string;
  onConsentTextChange?: (_value: string) => void;
  errors?: string[];
  problems?: string[];
  newProblem?: string;
  onNewProblemChange?: (_value: string) => void;
  problemListVisible?: boolean;
  activeProblemView?: "Active" | "Find";
  onProblemListVisibleChange?: (_value: boolean) => void;
  onActiveProblemViewChange?: (_value: "Active" | "Find") => void;
  onAddProblem?: () => void;
  onToggleTest?: (_id: string) => void;
  onToggleGroup?: (_id: string) => void;
  specimenSourceById?: Record<string, string>;
  onSpecimenSourceChange?: (_id: string, _value: string) => void;
  priority?: PathologyPriority;
  onPriorityChange?: (_value: PathologyPriority) => void;
  fasting?: boolean;
  onFastingChange?: (_value: boolean) => void;
  clinicalNotes?: string;
  onClinicalNotesChange?: (_value: string) => void;
  instructionsForLab?: string;
  onInstructionsForLabChange?: (_value: string) => void;
  collectionDate?: string;
  onCollectionDateChange?: (_value: string) => void;
  collectionTime?: string;
  onCollectionTimeChange?: (_value: string) => void;
  onOpenSummary?: () => void;
  onSave?: () => void;
  onSaveAndBill?: () => void;
  onAddToBill?: () => void;
  onReorderPrevious?: (_historyId: string) => void;
  onDownloadAllReports?: () => void;
}) {
  const historyOptions: PathologyOrderHistory[] = [
    { id: "hist-cbc", label: "CBC (12 Apr 2026)", selectedTestIds: ["cbc"], selectedGroupIds: [] },
    {
      id: "hist-lft",
      label: "LFT (02 Mar 2025)",
      selectedTestIds: ["lft"],
      selectedGroupIds: ["liver"],
    },
    {
      id: "hist-kft",
      label: "KFT (02 Mar 2025)",
      selectedTestIds: ["kft"],
      selectedGroupIds: ["renal"],
    },
  ];
  const _doctorSuggestions = [
    "Dr. Kavita Rao",
    "Dr. Aman Verma",
    "Dr. Priya Singh",
    "Dr. Rohit Mehta",
    "Dr. Neha Sharma",
    "Dr. Sandeep Yadav",
  ];
  const filteredProblems = React.useMemo(() => {
    const safeProblems = problems ?? [];
    const query = (newProblem ?? "").trim().toLowerCase();
    if (!query) return safeProblems;
    return safeProblems.filter((problem) => problem.toLowerCase().includes(query));
  }, [newProblem, problems]);
  const selectedTests = filteredTests.filter((test) => selectedTestIds.includes(test.id));
  const selectedGroups = groupedTests.filter((group) => selectedGroupIds.includes(group.id));
  const filteredGroupedTests = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groupedTests;
    return groupedTests.filter((group) => `${group.name}`.toLowerCase().includes(query));
  }, [search]);
  const selectedTestRows = React.useMemo<SelectedTestRow[]>(() => {
    const getSpecimenSource = (id: string) => specimenSourceById?.[id] ?? "Blood";
    return [
      ...selectedTests.map((test) => ({
        id: test.id,
        selectedTests: test.name,
        type: "Individual Test",
        department: test.department,
        specimenSource: getSpecimenSource(test.id),
        fastingStatus: Boolean(fasting),
        priority: priority ?? "Routine",
      })),
      ...selectedGroups.map((group) => ({
        id: group.id,
        selectedTests: group.name,
        type: "Profile",
        department: group.department,
        specimenSource: getSpecimenSource(group.id),
        fastingStatus: Boolean(fasting),
        priority: priority ?? "Routine",
      })),
    ];
  }, [fasting, priority, selectedGroups, selectedTests, specimenSourceById]);
  const selectedTestColumns = React.useMemo<ColumnDef<SelectedTestRow>[]>(
    () => [
      { accessorKey: "selectedTests", header: "Selected Tests" },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "department", header: "Department" },
      {
        accessorKey: "specimenSource",
        header: "Choose Specimen Source",
        cell: ({ row }) => (
          <select
            className="h-9 w-full rounded-md border border-input px-3 text-sm"
            value={row.original.specimenSource}
            onChange={(event) => onSpecimenSourceChange?.(row.original.id, event.target.value)}
          >
            {specimenSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: "fastingStatus",
        header: "Choose Fasting Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={!row.original.fastingStatus}
                onChange={() => onFastingChange?.(false)}
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={row.original.fastingStatus}
                onChange={() => onFastingChange?.(true)}
              />
              <span className="text-sm">No</span>
            </label>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Choose Priority",
        cell: ({ row }) => (
          <select
            className="h-9 w-full rounded-md border border-input px-3 text-sm"
            value={row.original.priority}
            onChange={(event) => onPriorityChange?.(event.target.value as PathologyPriority)}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ),
      },
    ],
    [onFastingChange, onPriorityChange, onSpecimenSourceChange],
  );
  const _departmentOptions = [
    "All",
    "Hematology",
    "Biochemistry",
    "Microbiology",
    "Serology",
    "Clinical Pathology",
    "Histopathology",
    "Cytology",
    "Immunology",
    "Molecular Biology",
    "Toxicology",
    "Blood Bank / Transfusion Medicine",
    "Genetics",
  ];

  return (
    <div className="space-y-4">
      {errors.length ? (
        <Card className="border-danger/30 bg-danger/10">
          <CardContent className="space-y-1 p-4">
            <div className="text-sm font-semibold text-foreground">
              Please fix these validation errors
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      {/* <Card>
        <CardContent className="space-y-4 p-4"> */}
      <div className="grid min-w-0 gap-4 overflow-x-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* <Card className="min-w-0 overflow-hidden border-border">
              <CardContent className="space-y-4 p-4"> */}
        <div className="grid gap-3 ">
          <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <SectionTitle>Clinical Diagnosis</SectionTitle>
              {/* <Button type="button" size="sm" variant="outline" onClick={onAddProblem}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button> */}
              <div className="ml-auto flex overflow-hidden border border-input bg-surface-muted">
                {(["Active", "Find"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={[
                      "border-l border-input px-3 py-1 text-xs font-medium first:border-l-0",
                      activeProblemView === mode
                        ? "bg-white text-primary shadow-sm"
                        : "text-muted-foreground",
                    ].join(" ")}
                    onClick={() => onActiveProblemViewChange?.(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            {activeProblemView === "Find" ? (
              <div className="mt-3">
                <Input
                  placeholder="Search problem..."
                  value={newProblem}
                  onChange={(event) => onNewProblemChange?.(event.target.value)}
                />
              </div>
            ) : null}
            <div className="mt-3 max-w-full overflow-hidden border border-border">
              <table className="w-full text-xs">
                <thead className="bg-surface-muted text-muted-foreground">
                  <tr>
                    <th className="border-r border-border px-2 py-2 text-left">Date</th>
                    <th className="border-r border-border px-2 py-2 text-left">Clinical Dx</th>
                    <th className="px-2 py-2 text-left">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {(problemListVisible ? filteredProblems : [])
                    .slice(0, 4)
                    .map((problem, index) => (
                      <tr
                        key={problem}
                        className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}
                      >
                        <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">
                          12 May 2026
                        </td>
                        <td className="border-t border-r border-border px-2 py-2 text-foreground">
                          {problem}
                        </td>
                        <td className="border-t border-border px-2 py-2 text-muted-foreground">
                          -
                        </td>
                      </tr>
                    ))}
                  {problemListVisible && !filteredProblems.length ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border-t border-border px-2 py-4 text-center text-muted-foreground"
                      >
                        No problems reported
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Reorder from previous tests</SectionTitle>
              {/* <Button type="button" size="sm" variant="outline" onClick={() => onProblemListVisibleChange(!problemListVisible)}>
                        {problemListVisible ? "Hide" : "Show"}
                      </Button> */}
            </div>
            <div className="mt-3 max-w-full overflow-hidden border border-border">
              <table className="w-full text-xs">
                <thead className="bg-surface-muted text-muted-foreground">
                  <tr>
                    <th className="border-r border-border px-2 py-2 text-left">Date</th>
                    <th className="border-r border-border px-2 py-2 text-left">Test Name</th>
                    <th className="px-2 py-2 text-left">Options</th>
                  </tr>
                </thead>
                <tbody>
                  {historyOptions.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}
                    >
                      <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">
                        {item.label.split("(")[1]?.replace(")", "") ?? "-"}
                      </td>
                      <td className="border-t border-r border-border px-2 py-2 font-medium text-foreground">
                        {item.label.split(" (")[0]}
                      </td>
                      <td className="border-t border-border px-2 py-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onReorderPrevious?.(item.id)}
                        >
                          Reorder
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* </CardContent>
            </Card> */}

        <div className="min-w-0 space-y-4">
          {/* <Card className="min-w-0 overflow-hidden">
                <CardContent className="space-y-3 p-4"> */}
          <div className="flex flex-wrap items-center gap-3">
            {/* <SectionTitle>Find</SectionTitle> */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search by entering few characters."
              />
            </div>
          </div>

          <div className="grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
            <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
              <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Select grouped tests
              </div>
              <div className="max-h-[360px] overflow-auto px-3">
                {filteredGroupedTests.map((group) => (
                  <CheckboxRow
                    key={group.id}
                    label={group.name}
                    checked={selectedGroupIds.includes(group.id)}
                    onToggle={() => onToggleGroup?.(group.id)}
                  />
                ))}
              </div>
            </div>

            <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
              <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Select tests
              </div>
              <div className="max-h-[360px] overflow-auto px-3">
                {filteredTests.map((test) => (
                  <CheckboxRow
                    key={test.id}
                    label={`${test.name} - ${test.description}`}
                    checked={selectedTestIds.includes(test.id)}
                    onToggle={() => onToggleTest?.(test.id)}
                  />
                ))}
                {filteredTests.some((test) => test.children?.length) ? (
                  <div className="pl-5">
                    {filteredTests.flatMap((test) =>
                      (test.children ?? []).map((child) => (
                        <CheckboxRow key={`${test.id}-${child}`} label={child} indent />
                      )),
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {/* </CardContent>
              </Card> */}
        </div>
      </div>

      <div className="grid min-w-0 gap-4 ">
        <DataTable data={selectedTestRows} columns={selectedTestColumns} />
        <label className="space-y-2">
          <SectionTitle>Instructions</SectionTitle>
          <textarea
            className="min-h-[92px] w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
            placeholder="Free text instructions for the lab"
            value={instructionsForLab}
            onChange={(event) => onInstructionsForLabChange?.(event.target.value)}
          />
        </label>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-4">
        <div className="text-sm text-muted-foreground">
          {selectedTestIds.length + selectedGroupIds.length} tests selected
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenSummary?.()}>
            View order summary
          </Button>
          <Button type="button" onClick={() => onSave?.()}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
