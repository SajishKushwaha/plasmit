"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";
import { previousTestOrders, resultBlocks as initialResultBlocks, groupedTests, summaryRows as initialSummaryRows, testList } from "./pathology/data";
import { PathologyOrderSummaryTab } from "./pathology/order-summary-tab";
import { PathologyResultReviewTab } from "./pathology/result-review-tab";
import { PathologyTestOrderTab } from "./pathology/test-order-tab";
import type { PathologyPriority, PathologyResultBlock, PathologySummaryRow } from "./pathology/types";

type MainTab = "test-order" | "order-summary" | "result-review";
type ReviewMode = "Result history" | "All results";
type SummarySortKey = keyof Pick<PathologySummaryRow, "name" | "loinc" | "cpt" | "specialty" | "specimen" | "priority">;

const selectedByDefault = ["cbc", "kft"];

export function PathologyTab() {
  const [activeTab, setActiveTab] = React.useState<MainTab>("test-order");
  const [search, setSearch] = React.useState("");
  const [selectedTestIds, setSelectedTestIds] = React.useState<string[]>(selectedByDefault);
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>(["renal"]);
  const [problemListVisible, setProblemListVisible] = React.useState(true);
  const [activeProblemView, setActiveProblemView] = React.useState<"Active" | "Find">("Active");
  const [problems, setProblems] = React.useState(["Diabetes Type 2", "Hypertension", "Fatigue"]);
  const [newProblem, setNewProblem] = React.useState("");
  const [specimenSource, setSpecimenSource] = React.useState("Blood");
  const [priority, setPriority] = React.useState<PathologyPriority>("Routine");
  const [fasting, setFasting] = React.useState(false);
  const [instructions, setInstructions] = React.useState("");
  const [clinicalNotes, setClinicalNotes] = React.useState("");
  const [instructionsForLab, setInstructionsForLab] = React.useState("");
  const [collectionDate, setCollectionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [collectionTime, setCollectionTime] = React.useState(new Date().toTimeString().slice(0, 5));
  const [summarySort, setSummarySort] = React.useState<{ key: SummarySortKey; direction: "asc" | "desc" }>({ key: "name", direction: "asc" });
  const [summaryRows, setSummaryRows] = React.useState(initialSummaryRows);
  const [resultMode, setResultMode] = React.useState<ReviewMode>("Result history");
  const [resultList, setResultList] = React.useState<PathologyResultBlock[]>(initialResultBlocks);
  const [diagnosisSearch, setDiagnosisSearch] = React.useState("");
  const [diagnosisType, setDiagnosisType] = React.useState("Primary");
  const [diagnosisOpen, setDiagnosisOpen] = React.useState(false);
  const [selectedDiagnosisLabel, setSelectedDiagnosisLabel] = React.useState("");
  const [billingNote, setBillingNote] = React.useState("Orders are ready.");
  const [deleteTarget, setDeleteTarget] = React.useState<PathologySummaryRow | null>(null);

  const selectedCount = selectedTestIds.length + selectedGroupIds.length;

  const filteredTests = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return testList.filter((test) => `${test.name} ${test.description} ${test.code ?? ""}`.toLowerCase().includes(query));
  }, [search]);

  const sortedSummaryRows = React.useMemo(() => {
    return [...summaryRows].sort((left, right) => {
      const leftValue = String(left[summarySort.key]);
      const rightValue = String(right[summarySort.key]);
      const comparison = leftValue.localeCompare(rightValue);
      return summarySort.direction === "asc" ? comparison : -comparison;
    });
  }, [summaryRows, summarySort]);

  const addProblem = () => {
    const value = newProblem.trim();
    if (!value) {
      toast.error("Please enter a problem or symptom");
      return;
    }
    setProblems((current) => [value, ...current]);
    setNewProblem("");
    setProblemListVisible(true);
    toast.success("Problem added");
  };

  const toggleTest = (id: string) => {
    setSelectedTestIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleGroup = (id: string) => {
    setSelectedGroupIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const selectHistory = (historyId: string) => {
    const history = previousTestOrders.find((item) => item.id === historyId);
    if (!history) return;
    setSelectedTestIds(history.selectedTestIds);
    setSelectedGroupIds(history.selectedGroupIds);
    toast.success(`${history.label} loaded`);
  };

  const handleOpenSummary = () => {
    const selectedRows = sortedSummaryRows.filter((row) => selectedTestIds.some((id) => row.name.toLowerCase().includes(id.replace(/-/g, " ").split(" ")[0])));
    if (!selectedRows.length) {
      toast.info("No matching summary rows found yet");
    }
    setActiveTab("order-summary");
  };

  const saveOrder = () => {
    setBillingNote("Pathology order saved successfully.");
    toast.success("Pathology order saved");
  };

  const saveAndBill = () => {
    setBillingNote("Order saved and sent to billing.");
    toast.success("Order saved and added to bill");
  };

  const addToBill = () => {
    setBillingNote("Order sent to billing queue.");
    toast.success("Added to billing queue");
  };

  const updateSummarySort = (key: SummarySortKey) => {
    setSummarySort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  const editSummaryRow = (id: string) => {
    const row = summaryRows.find((item) => item.id === id);
    if (!row) return;
    setSearch(row.name);
    const matchedTest = testList.find((test) => test.name.toLowerCase() === row.name.toLowerCase());
    if (matchedTest) {
      setSelectedTestIds((current) => Array.from(new Set([...current, matchedTest.id])));
    }
    const matchedGroup = groupedTests.find((group) => row.name.toLowerCase().includes(group.name.toLowerCase().split(" ")[0] ?? ""));
    if (matchedGroup) {
      setSelectedGroupIds((current) => Array.from(new Set([...current, matchedGroup.id])));
    }
    setActiveTab("test-order");
    toast.success(`Editing ${row.name}`);
  };

  const requestDeleteSummaryRow = (id: string) => {
    const row = summaryRows.find((item) => item.id === id);
    if (!row) return;
    setDeleteTarget(row);
  };

  const confirmDeleteSummaryRow = () => {
    if (!deleteTarget) return;
    setSummaryRows((current) => current.filter((row) => row.id !== deleteTarget.id));
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  };

  const addDiagnosis = () => {
    const label = diagnosisSearch.trim();
    if (!label) {
      toast.error("Search diagnosis first");
      return;
    }
    setSelectedDiagnosisLabel(`${label} (${diagnosisType})`);
    setDiagnosisOpen(false);
    toast.success("Diagnosis added");
  };

  const removeResultBlock = (id: string) => {
    setResultList((current) => current.filter((block) => block.id !== id));
    toast.success("Result removed");
  };

  const editResultBlock = (name: string) => {
    setDiagnosisSearch(name);
    setDiagnosisOpen(true);
    toast.success(`Editing ${name}`);
  };

  const reorderResult = (name: string) => {
    toast.success(`Reorder requested for ${name}`);
  };

  return (
    <div className="space-y-4">
      <PatientSummaryBanner />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MainTab)} className="w-full">
        <div className="space-y-3">
          <TabsList className="w-full gap-2 overflow-x-auto bg-transparent p-0 pb-4">
            <TabsTrigger
              value="test-order"
              className="flex h-10 min-w-[132px] items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Test order
            </TabsTrigger>
            <TabsTrigger
              value="order-summary"
              className="flex h-10 min-w-[132px] items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Order summary
            </TabsTrigger>
            <TabsTrigger
              value="result-review"
              className="flex h-10 min-w-[132px] items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Result review
            </TabsTrigger>
          </TabsList>

          {/* <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-muted px-4 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Patient already selected</span>
            <span>UHID-45821 - Ramesh Kumar - IPD</span>
          </div> */}

          {/* <div className="flex gap-2 overflow-x-auto pb-1">
            {pathologySubTabs.map((tab) => (
              <span
                key={tab}
                className={[
                  "inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-medium",
                  tab === "Pathology" ? "border-primary bg-primary/10 text-primary" : "border-border bg-white text-muted-foreground",
                ].join(" ")}
              >
                {tab}
              </span>
            ))}
          </div> */}
        </div>

        <TabsContent value="test-order" className="mt-0">
          <PathologyTestOrderTab
            search={search}
            onSearchChange={setSearch}
            filteredTests={filteredTests}
            selectedTestIds={selectedTestIds}
            selectedGroupIds={selectedGroupIds}
            problems={problems}
            newProblem={newProblem}
            onNewProblemChange={setNewProblem}
            problemListVisible={problemListVisible}
            activeProblemView={activeProblemView}
            onProblemListVisibleChange={setProblemListVisible}
            onActiveProblemViewChange={setActiveProblemView}
            onAddProblem={addProblem}
            onToggleTest={toggleTest}
            onToggleGroup={toggleGroup}
            specimenSource={specimenSource}
            onSpecimenSourceChange={setSpecimenSource}
            priority={priority}
            onPriorityChange={setPriority}
            fasting={fasting}
            onFastingChange={setFasting}
            instructions={instructions}
            onInstructionsChange={setInstructions}
            clinicalNotes={clinicalNotes}
            onClinicalNotesChange={setClinicalNotes}
            instructionsForLab={instructionsForLab}
            onInstructionsForLabChange={setInstructionsForLab}
            collectionDate={collectionDate}
            onCollectionDateChange={setCollectionDate}
            collectionTime={collectionTime}
            onCollectionTimeChange={setCollectionTime}
            onOpenSummary={handleOpenSummary}
            onSave={saveOrder}
            onSaveAndBill={saveAndBill}
            onAddToBill={addToBill}
            onReorderPrevious={selectHistory}
          />
        </TabsContent>
        <TabsContent value="order-summary" className="mt-0">
          <PathologyOrderSummaryTab
            rows={sortedSummaryRows}
            selectedCount={selectedCount}
            billingNote={billingNote}
            onSort={updateSummarySort}
            sort={summarySort}
            onSave={saveOrder}
            onAddToBill={addToBill}
            onSaveAndBill={saveAndBill}
            onEdit={editSummaryRow}
            onDelete={requestDeleteSummaryRow}
            onViewAll={() => setSummaryRows(initialSummaryRows)}
            onBackToTestOrder={() => setActiveTab("test-order")}
          />
        </TabsContent>
        <TabsContent value="result-review" className="mt-0">
          <PathologyResultReviewTab
            resultMode={resultMode}
            onResultModeChange={setResultMode}
            resultBlocks={resultList}
            diagnosisSearch={diagnosisSearch}
            diagnosisType={diagnosisType}
            diagnosisOpen={diagnosisOpen}
            selectedDiagnosisLabel={selectedDiagnosisLabel}
            onDiagnosisSearchChange={setDiagnosisSearch}
            onDiagnosisTypeChange={setDiagnosisType}
            onDiagnosisOpenChange={setDiagnosisOpen}
            onAddDiagnosis={addDiagnosis}
            onEditResult={editResultBlock}
            onDeleteResult={removeResultBlock}
            onReorderResult={reorderResult}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this pathology row"}? This action cannot be undone in the current screen.`}
        onConfirm={confirmDeleteSummaryRow}
      />
    </div>
  );
}
