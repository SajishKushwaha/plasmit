"use client";

import * as React from "react";
import { History, Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { groupedTests, priorities, specimenSources, testList, visitProblems } from "./data";
import type { PathologyPriority, PathologyOrderHistory, PathologyTest } from "./types";

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

function SelectField({ value, onChange, options }: { value: PathologyPriority; onChange: (value: PathologyPriority) => void; options: PathologyPriority[] }) {
  return (
    <select
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0"
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

export function PathologyTestOrderTab({
  search,
  onSearchChange,
  filteredTests,
  selectedTestIds,
  selectedGroupIds,
  problems,
  newProblem,
  onNewProblemChange,
  problemListVisible,
  activeProblemView,
  onProblemListVisibleChange,
  onActiveProblemViewChange,
  onAddProblem,
  onToggleTest,
  onToggleGroup,
  specimenSource,
  onSpecimenSourceChange,
  priority,
  onPriorityChange,
  fasting,
  onFastingChange,
  instructions,
  onInstructionsChange,
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
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filteredTests: PathologyTest[];
  selectedTestIds: string[];
  selectedGroupIds: string[];
  problems: string[];
  newProblem: string;
  onNewProblemChange: (value: string) => void;
  problemListVisible: boolean;
  activeProblemView: "Active" | "Find";
  onProblemListVisibleChange: (value: boolean) => void;
  onActiveProblemViewChange: (value: "Active" | "Find") => void;
  onAddProblem: () => void;
  onToggleTest: (id: string) => void;
  onToggleGroup: (id: string) => void;
  specimenSource: string;
  onSpecimenSourceChange: (value: string) => void;
  priority: PathologyPriority;
  onPriorityChange: (value: PathologyPriority) => void;
  fasting: boolean;
  onFastingChange: (value: boolean) => void;
  instructions: string;
  onInstructionsChange: (value: string) => void;
  clinicalNotes: string;
  onClinicalNotesChange: (value: string) => void;
  instructionsForLab: string;
  onInstructionsForLabChange: (value: string) => void;
  collectionDate: string;
  onCollectionDateChange: (value: string) => void;
  collectionTime: string;
  onCollectionTimeChange: (value: string) => void;
  onOpenSummary: () => void;
  onSave: () => void;
  onSaveAndBill: () => void;
  onAddToBill: () => void;
  onReorderPrevious: (historyId: string) => void;
}) {
  const historyOptions: PathologyOrderHistory[] = [
    { id: "hist-cbc", label: "CBC (12 Apr)", selectedTestIds: ["cbc"], selectedGroupIds: [] },
    { id: "hist-lft", label: "LFT (02 Mar)", selectedTestIds: ["lft"], selectedGroupIds: ["liver"] },
    { id: "hist-kft", label: "KFT (02 Mar)", selectedTestIds: ["kft"], selectedGroupIds: ["renal"] },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Test order :</div>
              <div className="mt-1 text-xs text-muted-foreground">Search by entering a few characters, then select individual tests or a profile bundle.</div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => onProblemListVisibleChange(!problemListVisible)}>
              {problemListVisible ? "Hide problems" : "Show problems"}
            </Button>
          </div>

          <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_260px]">
            <Card className="border-border bg-surface-muted">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <SectionTitle>Problems reported at visit</SectionTitle>
                  {/* <Button type="button" size="sm" variant="outline" onClick={onAddProblem}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button> */}
                </div>
                {problemListVisible ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {(["Active", "Find"] as const).map((mode) => (
                        <Button key={mode} type="button" size="sm" variant={activeProblemView === mode ? "default" : "outline"} onClick={() => onActiveProblemViewChange(mode)}>
                          {mode}
                        </Button>
                      ))}
                    </div>
                    {activeProblemView === "Find" ? <Input placeholder="Search problem..." value={newProblem} onChange={(event) => onNewProblemChange(event.target.value)} /> : null}
                    <div className="space-y-1">
                      {problems.map((problem) => (
                        <div key={problem} className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
                          {problem}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <SectionTitle>Select tests</SectionTitle>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by entering few characters" />
                </div>

                <div className="rounded-md border border-border bg-surface px-3">
                  {filteredTests.map((test) => (
                    <CheckboxRow key={test.id} label={`${test.name} - ${test.description}`} checked={selectedTestIds.includes(test.id)} onToggle={() => onToggleTest(test.id)} />
                  ))}
                  {filteredTests.some((test) => test.children?.length) ? (
                    <div className="pl-5">
                      {filteredTests.flatMap((test) => (test.children ?? []).map((child) => <CheckboxRow key={`${test.id}-${child}`} label={child} indent />))}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <SectionTitle>Select grouped tests</SectionTitle>
                <div className="rounded-md border border-border bg-surface px-3">
                  {groupedTests.map((group) => (
                    <CheckboxRow key={group.id} label={group.name} checked={selectedGroupIds.includes(group.id)} onToggle={() => onToggleGroup(group.id)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <label className="space-y-2">
              <SectionTitle>Specimen source</SectionTitle>
              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={specimenSource} onChange={(event) => onSpecimenSourceChange(event.target.value)}>
                {specimenSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <SectionTitle>Priority</SectionTitle>
              <SelectField value={priority} options={priorities} onChange={onPriorityChange} />
            </label>
            <label className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground">
              <input type="checkbox" className="h-4 w-4 rounded border-input accent-primary" checked={fasting} onChange={(event) => onFastingChange(event.target.checked)} />
              Fasting
            </label>
            {/* <div className="space-y-2">
              <SectionTitle>Reorder test</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {historyOptions.map((item) => (
                  <Button key={item.id} type="button" variant="outline" size="sm" onClick={() => onReorderPrevious(item.id)}>
                    <History className="h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div> */}
          </div>

          {/* <div className="space-y-2">
            <SectionTitle>ADD INSTRUCTIONS</SectionTitle>
            <textarea
              className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
              placeholder="Additional instructions for lab tech"
              value={instructions}
              onChange={(event) => onInstructionsChange(event.target.value)}
            />
          </div> */}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 md:col-span-2">
              <SectionTitle>Clinical Notes</SectionTitle>
              <textarea
                className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
                placeholder="Free text clinical notes"
                value={clinicalNotes}
                onChange={(event) => onClinicalNotesChange(event.target.value)}
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <SectionTitle>Instructions For Lab</SectionTitle>
              <textarea
                className="min-h-[92px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
                placeholder="Free text instructions for the lab"
                value={instructionsForLab}
                onChange={(event) => onInstructionsForLabChange(event.target.value)}
              />
            </label>
            <label className="space-y-2">
              <SectionTitle>Collection Date</SectionTitle>
              <Input type="date" value={collectionDate} onChange={(event) => onCollectionDateChange(event.target.value)} />
            </label>
            <label className="space-y-2">
              <SectionTitle>Collection Time</SectionTitle>
              <Input type="time" value={collectionTime} onChange={(event) => onCollectionTimeChange(event.target.value)} />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-4">
            <div className="text-sm text-muted-foreground">{selectedTestIds.length + selectedGroupIds.length} tests selected</div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onOpenSummary}>
                View order summary
              </Button>
              <Button type="button"  onClick={onSave}>
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
        </CardContent>
      </Card>
    </div>
  );
}
