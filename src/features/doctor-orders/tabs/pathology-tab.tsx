"use client";

import * as React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";
import { previousTestOrders, resultBlocks as initialResultBlocks, groupedTests, summaryRows as initialSummaryRows, testList } from "./pathology/data";
import { PathologyCriticalFindingsTab } from "./pathology/critical-findings-tab";
import { PathologyOrderSummaryTab } from "./pathology/order-summary-tab";
import { PathologyResultReviewTab } from "./pathology/result-review-tab";
import { PathologyTestOrderTab } from "./pathology/test-order-tab";
import type { PathologyPriority, PathologyResultBlock, PathologySummaryRow } from "./pathology/types";

type MainTab = "test-order" | "order-summary" | "result-review" | "critical-findings";
type SummarySortKey = keyof Pick<PathologySummaryRow, "name" | "loinc" | "cpt" | "department" | "specimen" | "priority">;

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
  const [specimenSourceById, setSpecimenSourceById] = React.useState<Record<string, string>>({});
  const [priority, setPriority] = React.useState<PathologyPriority>("Routine");
  const [fasting, setFasting] = React.useState(false);
  const [clinicalNotes, setClinicalNotes] = React.useState("");
  const [instructionsForLab, setInstructionsForLab] = React.useState("");
  const [collectionDate, setCollectionDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [collectionTime, setCollectionTime] = React.useState(new Date().toTimeString().slice(0, 5));
  const [summarySort, setSummarySort] = React.useState<{ key: SummarySortKey; direction: "asc" | "desc" }>({ key: "name", direction: "asc" });
  const [summaryRows, setSummaryRows] = React.useState(initialSummaryRows);
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

  const updateSpecimenSource = (id: string, value: string) => {
    setSpecimenSourceById((current) => ({ ...current, [id]: value }));
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

  const downloadAllReports = () => {
    toast.info("Preparing pathology reports download");
    // The actual PDF generation stays in the result review tab; this keeps the test-order action visible here.
  };

  return (
    <div className="space-y-4">
      {/* <PatientSummaryBanner /> */}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as MainTab)} className="w-full">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["test-order", "order-summary", "result-review", "critical-findings"] as const).map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="sm"
                  variant={activeTab === tab ? "default" : "outline"}
                  onClick={() => setActiveTab(tab)}
                  className="min-w-[132px]"
                >
                  {tab === "test-order" ? "Test Order" : tab === "order-summary" ? "Order Summary" : tab === "result-review" ? "Result Review" : "Critical Findings"}
                </Button>
              ))}
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
            specimenSourceById={specimenSourceById}
            onSpecimenSourceChange={updateSpecimenSource}
            priority={priority}
            onPriorityChange={setPriority}
            fasting={fasting}
            onFastingChange={setFasting}
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
            onDownloadAllReports={downloadAllReports}
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
        <TabsContent value="critical-findings" className="mt-0">
          <PathologyCriticalFindingsTab resultBlocks={resultList} />
        </TabsContent>
          </CardContent>
        </Card>
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
