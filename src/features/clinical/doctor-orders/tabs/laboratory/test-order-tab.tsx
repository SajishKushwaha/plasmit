"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { admissionPackageProfiles, groupedTests, priorities, specimenSources, testList, visitProblems } from "./data";
import type {
  LaboratoryIndicationType,
  LaboratoryOrderHistory,
  LaboratoryPackageBundle,
  LaboratoryPriority,
  LaboratoryRequestType,
  LaboratorySex,
  LaboratoryTest,
} from "./types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{children}</div>;
}

function CheckboxRow({ label, checked, indent = false, onToggle }: { label: string; checked?: boolean; indent?: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={["flex w-full items-center gap-2 border-b border-border/60 py-2 text-left text-sm last:border-0", indent ? "pl-5 text-xs text-muted-foreground" : "text-foreground"].join(" ")}
    >
      <span className={["flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border", checked ? "border-primary bg-primary" : "border-border bg-white"].join(" ")}>
        {checked ? <span className="h-1.5 w-1.5 rounded-[1px] bg-white" /> : null}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function SelectField({ value, onChange, options }: { value: LaboratoryPriority; onChange: (value: LaboratoryPriority) => void; options: LaboratoryPriority[] }) {
  return (
    <select
      className="h-9 w-full rounded-md border border-input px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0"
      value={value}
      onChange={(event) => onChange(event.target.value as LaboratoryPriority)}
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
  priority: LaboratoryPriority;
};

export function LaboratoryTestOrderTab({
  search,
  onSearchChange,
  filteredTests,
  departmentFilter = "All",
  onDepartmentFilterChange = () => {},
  selectedTestIds,
  selectedGroupIds,
  patientName = "",
  onPatientNameChange = () => {},
  uhid = "",
  onUhidChange = () => {},
  admissionNo = "",
  onAdmissionNoChange = () => {},
  age = "",
  onAgeChange = () => {},
  sex = "Female",
  onSexChange = () => {},
  wardBedNo = "",
  onWardBedNoChange = () => {},
  consultant = "",
  onConsultantChange = () => {},
  requestingDoctor = "",
  onRequestingDoctorChange = () => {},
  clinicalDiagnosis = "",
  onClinicalDiagnosisChange = () => {},
  indicationType = "Therapeutic",
  onIndicationTypeChange = () => {},
  surgicalProcedure = "",
  onSurgicalProcedureChange = () => {},
  previousTransfusion = "No",
  onPreviousTransfusionChange = () => {},
  previousTransfusionDetails = "",
  onPreviousTransfusionDetailsChange = () => {},
  previousReaction = "No",
  onPreviousReactionChange = () => {},
  previousReactionDetails = "",
  onPreviousReactionDetailsChange = () => {},
  pregnancies = "N/A",
  onPregnanciesChange = () => {},
  miscarriage = "",
  onMiscarriageChange = () => {},
  stillBirth = "",
  onStillBirthChange = () => {},
  erythroblastosis = "",
  onErythroblastosisChange = () => {},
  antibodiesDetected = "No",
  onAntibodiesDetectedChange = () => {},
  antibodyNames = "",
  onAntibodyNamesChange = () => {},
  patientBloodGroup = "",
  onPatientBloodGroupChange = () => {},
  patientRh = "",
  onPatientRhChange = () => {},
  groupScreenDate = "",
  onGroupScreenDateChange = () => {},
  wbc = "",
  onWbcChange = () => {},
  rbc = "",
  onRbcChange = () => {},
  hb = "",
  onHbChange = () => {},
  pcv = "",
  onPcvChange = () => {},
  platelets = "",
  onPlateletsChange = () => {},
  pt = "",
  onPtChange = () => {},
  ptt = "",
  onPttChange = () => {},
  otherLabs = "",
  onOtherLabsChange = () => {},
  requestType = "Routine",
  onRequestTypeChange = () => {},
  requiredDate = "",
  onRequiredDateChange = () => {},
  requiredTime = "",
  onRequiredTimeChange = () => {},
  natureOfEmergency = "",
  onNatureOfEmergencyChange = () => {},
  consentExplained = true,
  onConsentExplainedChange = () => {},
  doctorSignature = "",
  onDoctorSignatureChange = () => {},
  consentText = "",
  onConsentTextChange = () => {},
  errors = [],
  problems: _problems,
  newProblem: _newProblem,
  onNewProblemChange: _onNewProblemChange,
  problemListVisible: _problemListVisible,
  activeProblemView: _activeProblemView,
  onProblemListVisibleChange: _onProblemListVisibleChange,
  onActiveProblemViewChange: _onActiveProblemViewChange,
  onAddProblem: _onAddProblem,
  onToggleTest,
  onToggleGroup,
  onSelectGroup,
  onRemoveSelectedTest,
  onClearSelection,
  specimenSourceById,
  onSpecimenSourceChange,
  priority,
  onPriorityChange,
  fasting,
  onFastingChange,
  clinicalNotes,
  onClinicalNotesChange,
  instructionsForLab,
  onInstructionsForLabChange,
  collectionDate,
  onCollectionDateChange,
  collectionTime,
  onCollectionTimeChange,
  onOpenSummary,
  onSave,
  onSaveAndBill,
  onAddToBill,
  onReorderPrevious,
  onDownloadAllReports,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filteredTests: LaboratoryTest[];
  departmentFilter?: string;
  onDepartmentFilterChange?: (value: string) => void;
  selectedTestIds: string[];
  selectedGroupIds: string[];
   patientName?: string;
   onPatientNameChange?: (value: string) => void;
   uhid?: string;
   onUhidChange?: (value: string) => void;
   admissionNo?: string;
   onAdmissionNoChange?: (value: string) => void;
   age?: string;
   onAgeChange?: (value: string) => void;
   sex?: LaboratorySex;
   onSexChange?: (value: LaboratorySex) => void;
   wardBedNo?: string;
   onWardBedNoChange?: (value: string) => void;
   consultant?: string;
   onConsultantChange?: (value: string) => void;
   requestingDoctor?: string;
   onRequestingDoctorChange?: (value: string) => void;
   clinicalDiagnosis?: string;
   onClinicalDiagnosisChange?: (value: string) => void;
   indicationType?: LaboratoryIndicationType;
   onIndicationTypeChange?: (value: LaboratoryIndicationType) => void;
   surgicalProcedure?: string;
   onSurgicalProcedureChange?: (value: string) => void;
   previousTransfusion?: string;
   onPreviousTransfusionChange?: (value: string) => void;
   previousTransfusionDetails?: string;
   onPreviousTransfusionDetailsChange?: (value: string) => void;
   previousReaction?: string;
   onPreviousReactionChange?: (value: string) => void;
   previousReactionDetails?: string;
   onPreviousReactionDetailsChange?: (value: string) => void;
   pregnancies?: string;
   onPregnanciesChange?: (value: string) => void;
   miscarriage?: string;
   onMiscarriageChange?: (value: string) => void;
   stillBirth?: string;
   onStillBirthChange?: (value: string) => void;
   erythroblastosis?: string;
   onErythroblastosisChange?: (value: string) => void;
   antibodiesDetected?: string;
   onAntibodiesDetectedChange?: (value: string) => void;
   antibodyNames?: string;
   onAntibodyNamesChange?: (value: string) => void;
   patientBloodGroup?: string;
   onPatientBloodGroupChange?: (value: string) => void;
   patientRh?: string;
   onPatientRhChange?: (value: string) => void;
   groupScreenDate?: string;
   onGroupScreenDateChange?: (value: string) => void;
   wbc?: string;
   onWbcChange?: (value: string) => void;
   rbc?: string;
   onRbcChange?: (value: string) => void;
   hb?: string;
   onHbChange?: (value: string) => void;
   pcv?: string;
   onPcvChange?: (value: string) => void;
   platelets?: string;
   onPlateletsChange?: (value: string) => void;
   pt?: string;
   onPtChange?: (value: string) => void;
   ptt?: string;
   onPttChange?: (value: string) => void;
   otherLabs?: string;
   onOtherLabsChange?: (value: string) => void;
   requestType?: LaboratoryRequestType;
   onRequestTypeChange?: (value: LaboratoryRequestType) => void;
   requiredDate?: string;
   onRequiredDateChange?: (value: string) => void;
   requiredTime?: string;
   onRequiredTimeChange?: (value: string) => void;
   natureOfEmergency?: string;
   onNatureOfEmergencyChange?: (value: string) => void;
   consentExplained?: boolean;
   onConsentExplainedChange?: (value: boolean) => void;
   doctorSignature?: string;
   onDoctorSignatureChange?: (value: string) => void;
   consentText?: string;
   onConsentTextChange?: (value: string) => void;
  errors?: string[];
  problems?: string[];
  newProblem?: string;
  onNewProblemChange?: (value: string) => void;
  problemListVisible?: boolean;
  activeProblemView?: "Active" | "Find";
  onProblemListVisibleChange?: (value: boolean) => void;
  onActiveProblemViewChange?: (value: "Active" | "Find") => void;
  onAddProblem?: () => void;
  onToggleTest?: (id: string) => void;
  onToggleGroup?: (id: string) => void;
  onSelectGroup?: (id: string) => void;
  onRemoveSelectedTest?: (id: string) => void;
  onClearSelection?: () => void;
  specimenSourceById?: Record<string, string>;
  onSpecimenSourceChange?: (id: string, value: string) => void;
  priority?: LaboratoryPriority;
  onPriorityChange?: (value: LaboratoryPriority) => void;
  fasting?: boolean;
  onFastingChange?: (value: boolean) => void;
  clinicalNotes?: string;
  onClinicalNotesChange?: (value: string) => void;
  instructionsForLab?: string;
  onInstructionsForLabChange?: (value: string) => void;
  collectionDate?: string;
  onCollectionDateChange?: (value: string) => void;
  collectionTime?: string;
  onCollectionTimeChange?: (value: string) => void;
  onOpenSummary?: () => void;
  onSave?: () => void;
  onSaveAndBill?: () => void;
  onAddToBill?: () => void;
  onReorderPrevious?: (historyId: string) => void;
  onDownloadAllReports?: () => void;
}) {
  const [orderMode, setOrderMode] = React.useState<"single" | "public" | "package">("single");
  const [activeGroupId, setActiveGroupId] = React.useState("er-emergency-basic");
  const [activePackageId, setActivePackageId] = React.useState(admissionPackageProfiles[0]?.id ?? "");
  const historyOptions: LaboratoryOrderHistory[] = [
    { id: "hist-cbc", label: "CBC (12 Apr 2026)", selectedTestIds: ["cbc"], selectedGroupIds: [] },
    { id: "hist-lft", label: "LFT (02 Mar 2025)", selectedTestIds: ["lft"], selectedGroupIds: ["liver-profile"] },
    { id: "hist-kft", label: "KFT (02 Mar 2025)", selectedTestIds: ["rft-kft"], selectedGroupIds: ["renal-profile"] },
  ];
  const selectedTests = testList.filter((test) => selectedTestIds.includes(test.id));
  const commonOrderGroups = React.useMemo(
    () => groupedTests.filter((group) => group.section?.toLowerCase().includes("common order sets")),
    [],
  );
  const publicOrderGroups = React.useMemo(
    () => groupedTests.filter((group) => group.section?.toLowerCase().includes("admission & ot")),
    [],
  );
  const activeGroups = orderMode === "single" ? commonOrderGroups : orderMode === "public" ? publicOrderGroups : [];
  const activeGroup = activeGroups.find((group) => group.id === activeGroupId) ?? activeGroups[0] ?? groupedTests[0];
  const activePackage = admissionPackageProfiles.find((profile) => profile.id === activePackageId) ?? admissionPackageProfiles[0];
  const visibleTests = React.useMemo(() => {
    if (orderMode === "package") return [];
    const panelTests = activeGroup?.testIds.map((id) => testList.find((test) => test.id === id)).filter((test): test is LaboratoryTest => Boolean(test)) ?? filteredTests;
    const filteredIds = new Set(filteredTests.map((test) => test.id));
    return panelTests.filter((test) => filteredIds.has(test.id));
  }, [activeGroup, filteredTests, orderMode]);
  const visiblePackageBundles = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    const bundles = activePackage?.bundles ?? [];
    if (!query) return bundles;
    return bundles.filter((bundle) => {
      const testNames = bundle.testIds
        .map((id) => testList.find((test) => test.id === id)?.name ?? id)
        .join(" ");
      return `${bundle.label} ${testNames} ${bundle.purpose ?? ""}`.toLowerCase().includes(query);
    });
  }, [activePackage, search]);
  const getSpecimenSource = (id: string) => specimenSourceById?.[id] ?? "Blood";
  const selectedTestRows = React.useMemo<SelectedTestRow[]>(
    () =>
      selectedTests.map((test) => ({
        id: test.id,
        selectedTests: test.name,
        type: "Individual Test",
        department: test.department,
        specimenSource: getSpecimenSource(test.id),
        fastingStatus: Boolean(fasting),
        priority: priority ?? "Routine",
      })),
    [fasting, getSpecimenSource, priority, selectedTests],
  );
  const filteredGroupedTests = React.useMemo(() => {
    return activeGroups;
  }, [activeGroups]);
  const selectPanel = (id: string) => {
    setActiveGroupId(id);
    if (orderMode === "public") {
      onClearSelection?.();
      onSelectGroup?.(id);
    }
  };
  const selectPackage = (id: string) => {
    setActivePackageId(id);
  };
  const getBundleLabel = (bundle: LaboratoryPackageBundle) => {
    const names = bundle.testIds.map((id) => testList.find((test) => test.id === id)?.name ?? id).join(", ");
    return `${bundle.label} (${names})`;
  };
  const isBundleSelected = (bundle: LaboratoryPackageBundle) => bundle.testIds.every((id) => selectedTestIds.includes(id));
  const toggleBundle = (bundle: LaboratoryPackageBundle) => {
    const checked = isBundleSelected(bundle);
    bundle.testIds.forEach((id) => {
      const selected = selectedTestIds.includes(id);
      if ((checked && selected) || (!checked && !selected)) onToggleTest?.(id);
    });
  };
  const showSingleOrders = () => {
    setOrderMode("single");
    setActiveGroupId("er-emergency-basic");
    onClearSelection?.();
  };
  const showPublicOrders = () => {
    setOrderMode("public");
    setActiveGroupId("adm-er");
    onClearSelection?.();
    onSelectGroup?.("adm-er");
  };
  const showPackageOrders = () => {
    setOrderMode("package");
    setActivePackageId(admissionPackageProfiles[0]?.id ?? "");
    onClearSelection?.();
  };
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
            onChange={(event) => onPriorityChange?.(event.target.value as LaboratoryPriority)}
          >
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ),
      },
      {
        id: "actions",
        header: "Remove",
        cell: ({ row }) => (
          <Button type="button" size="sm" variant="outline" className="text-danger" onClick={() => onRemoveSelectedTest?.(row.original.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    [onFastingChange, onPriorityChange, onRemoveSelectedTest, onSpecimenSourceChange],
  );
  const departmentOptions = [
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
            <div className="text-sm font-semibold text-foreground">Please fix these validation errors</div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
              {errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          </CardContent>
        </Card>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-max min-w-max gap-1 rounded-lg bg-surface-muted/70 p-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={showSingleOrders}
            className={[
              "h-10 min-w-[120px] shrink-0 rounded-lg px-3 text-sm font-bold",
              orderMode === "single" ? "bg-white text-primary shadow-sm hover:bg-white" : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900",
            ].join(" ")}
          >
            Single
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={showPublicOrders}
            className={[
              "h-10 min-w-[120px] shrink-0 rounded-lg px-3 text-sm font-bold",
              orderMode === "public" ? "bg-white text-primary shadow-sm hover:bg-white" : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900",
            ].join(" ")}
          >
            Public
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={showPackageOrders}
            className={[
              "h-10 min-w-[140px] shrink-0 rounded-lg px-3 text-sm font-bold",
              orderMode === "package" ? "bg-white text-primary shadow-sm hover:bg-white" : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900",
            ].join(" ")}
          >
            Package Name
          </Button>
        </div>
      </div>
      {/* <Card>
        <CardContent className="space-y-4 p-4"> */}
        <div className="grid min-w-0 gap-4 overflow-x-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="grid gap-3">
            <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
              <div className="flex items-center gap-2">
                <SectionTitle>
                  {orderMode === "single" ? "Common Order Sets / Profiles" : orderMode === "public" ? "Admission & OT Profiles" : "Package Name"}
                </SectionTitle>
              </div>
              <div className="mt-3 max-w-full overflow-hidden border border-border">
                <table className="w-full text-xs">
                  <tbody>
                    {orderMode === "package"
                      ? admissionPackageProfiles.map((profile, index) => (
                          <tr key={profile.id} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                            <td className="border-t border-border px-2 py-2">
                              <button
                                type="button"
                                onClick={() => selectPackage(profile.id)}
                                className={["w-full text-left font-medium", activePackageId === profile.id ? "text-primary" : "text-foreground"].join(" ")}
                              >
                                <span className="block">{profile.name}</span>
                                <span className="block text-[11px] font-medium text-muted-foreground">{profile.trigger}</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      : filteredGroupedTests.map((group, index) => (
                          <tr key={group.id} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                            <td className="border-t border-border px-2 py-2">
                              <button
                                type="button"
                                onClick={() => selectPanel(group.id)}
                                className={[
                                  "w-full text-left font-medium",
                                  activeGroupId === group.id || selectedGroupIds.includes(group.id) ? "text-primary" : "text-foreground",
                                ].join(" ")}
                              >
                                {group.name}
                              </button>
                            </td>
                          </tr>
                        ))}
                    {orderMode !== "package" && !filteredGroupedTests.length ? (
                      <tr>
                        <td className="border-t border-border px-2 py-4 text-center text-muted-foreground">
                          No profiles found
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
                      <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                        <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">{item.label.split("(")[1]?.replace(")", "") ?? "-"}</td>
                        <td className="border-t border-r border-border px-2 py-2 font-medium text-foreground">{item.label.split(" (")[0]}</td>
                        <td className="border-t border-border px-2 py-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => onReorderPrevious?.(item.id)}>
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
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by entering few characters." />
              </div>
              <select
                className="h-10 min-w-[220px] rounded-md border border-input px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0"
                value={departmentFilter}
                onChange={(event) => onDepartmentFilterChange(event.target.value)}
              >
                {departmentOptions.map((department, index) => (
                  <option key={`${department}-${index}`} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid min-w-0 gap-4">
              <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
                <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {orderMode === "package" ? activePackage?.name : `Select tests ${activeGroup?.name ? `- ${activeGroup.name}` : ""}`}
                </div>
                <div className="max-h-[360px] overflow-auto px-3">
                  {orderMode === "package"
                    ? visiblePackageBundles.map((bundle) => (
                        <div key={bundle.id} className="border-b border-border/60 last:border-0">
                          <CheckboxRow label={getBundleLabel(bundle)} checked={isBundleSelected(bundle)} onToggle={() => toggleBundle(bundle)} />
                          {bundle.purpose ? <div className="-mt-1 pb-2 pl-6 text-xs text-muted-foreground">{bundle.purpose}</div> : null}
                        </div>
                      ))
                    : visibleTests.map((test) => (
                        <CheckboxRow key={test.id} label={`${test.name} - ${test.description}`} checked={selectedTestIds.includes(test.id)} onToggle={() => onToggleTest?.(test.id)} />
                      ))}
                  {orderMode !== "package" && visibleTests.some((test) => test.children?.length) ? (
                    <div className="pl-5">
                      {visibleTests.flatMap((test) => (test.children ?? []).map((child) => <CheckboxRow key={`${test.id}-${child}`} label={child} indent />))}
                    </div>
                  ) : null}
                  {orderMode === "package" && !visiblePackageBundles.length ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">No package rows found</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

        </div>
          {selectedTestRows.length ? (
            <>
              <div className="grid min-w-0 gap-4">
                <DataTable data={selectedTestRows} columns={selectedTestColumns} />

                <label className="space-y-2">
                  <SectionTitle>Instructions</SectionTitle>
                  <textarea
                    className="min-h-[92px] w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
                    placeholder="Instructions for the lab"
                    value={instructionsForLab}
                    onChange={(event) => onInstructionsForLabChange?.(event.target.value)}
                  />
                </label>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-4">
                <div className="text-sm text-muted-foreground">
                  {selectedTestIds.length + selectedGroupIds.length} tests selected
                  {selectedTestIds.length ? `, ${selectedTestIds.length} test(s)` : ""}
                  {selectedGroupIds.length ? `, ${selectedGroupIds.length} group(s)` : ""}
                </div>

                <div className="ml-auto flex flex-wrap gap-2">
                  {/* <Button type="button" variant="outline" onClick={() => onDownloadAllReports?.()}>
                    Download All Reports
                  </Button> */}
                  <Button type="button" variant="outline" onClick={() => onOpenSummary?.()}>
                    View
                  </Button>
                  <Button type="button"  onClick={() => onSave?.()}>
                    Save
                  </Button>
                  {/* <Button type="button" variant="outline" onClick={onAddToBill}>
                    Add to bill
                  </Button>
                  <Button type="button" onClick={onSaveAndBill}>
                    Save & add to bill
                  </Button> */}
                </div>
              </div>
            </>
          ) : null}
      {/* </CardContent>
    </Card> */}
      </div>
  );
}
