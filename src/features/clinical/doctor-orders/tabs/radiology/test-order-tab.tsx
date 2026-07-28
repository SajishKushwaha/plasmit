"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";

import { radiologyPriorities, radiologyTestGroups } from "./data";
import type { RadiologyPriority, RadiologyTest } from "./types";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{children}</div>;
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
      className={["flex w-full items-center gap-2 border-b border-border/60 py-2 text-left text-sm last:border-0", indent ? "pl-5 text-xs text-muted-foreground" : "text-foreground"].join(" ")}
    >
      <span className={["flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border", checked ? "border-primary bg-primary" : "border-border bg-white"].join(" ")}>
        {checked ? <span className="h-1.5 w-1.5 rounded-[1px] bg-white" /> : null}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

type SelectedOrderRow = {
  id: string;
  selectedTests: string;
  loincCode: string;
  category: string;
  specimenSource: string;
  specification: string;
  specificationOptions: string[];
  priority: RadiologyPriority;
};

const specOptionsByTest: Record<string, string[]> = {
  "CT Head": ["With Contrast", "Without Contrast", "Brain", "Orbit", "PNS"],
  "CT Spine": ["Cervical", "Thoracic", "Lumbar", "Whole Spine"],
  "CT Chest": ["With Contrast", "Without Contrast", "HRCT"],
  "CT Abdomen": ["Upper Abdomen", "Lower Abdomen", "Whole Abdomen"],
  "MRI Brain": ["With Contrast", "Without Contrast", "MRA", "MRV"],
  "MRI Spine": ["Cervical", "Thoracic", "Lumbar", "Whole Spine"],
  "MRI Knee": ["Left", "Right"],
  "USG Abdomen": ["Upper Abdomen", "Lower Abdomen", "Whole Abdomen"],
  "Chest X-Ray": ["PA View", "AP View", "Lateral View"],
  "Knee X-Ray": ["Left", "Right", "Bilateral", "AP View", "Lateral View"],
  Mammography: ["Left", "Right", "Bilateral", "Screening", "Diagnostic"],
  "Colour Doppler": ["Left", "Right", "Bilateral", "Arterial", "Venous"],
};

const genericSpecificationLabels = new Set(["as specified", "optional", "default"]);

function uniqueOptions(options: string[]) {
  const seen = new Set<string>();
  return options
    .map((option) => option.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((option) => {
      const key = option.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function stripModalityPrefix(value: string) {
  return value
    .replace(/^(x-ray|ct|mri|usg)\s+/i, "")
    .replace(/^doppler\s*-\s*/i, "")
    .replace(/^mammography\s+/i, "")
    .trim();
}

function splitSpecificationParts(value: string) {
  const withoutParentheses = value.replace(/\([^)]*\)/g, "");
  return withoutParentheses
    .split(/\s*\/\s*|\s*,\s*|\s+\bor\b\s+/i)
    .map((part) => stripModalityPrefix(part.replace(/\betc\.?/i, "").replace(/\band\b/i, "").trim()))
    .filter(Boolean);
}

function combineSpecificationParts(subjects: string[], suffixes: string[]) {
  if (!suffixes.length) return subjects;
  return subjects.flatMap((subject) => suffixes.map((suffix) => `${subject} ${suffix}`.trim()));
}

function deriveSpecificationOptions(test: RadiologyTest) {
  const name = test.name.replace(/\s+/g, " ").trim();
  const explicitSpecs = test.specifications ?? [];
  const usefulExplicitSpecs = explicitSpecs.filter((option) => !genericSpecificationLabels.has(option.toLowerCase()));
  const hasOptionalContrast = explicitSpecs.some((option) => option.toLowerCase() === "optional");
  const hasContrast = explicitSpecs.some((option) => option.toLowerCase() === "contrast");
  const hasRadiotracer = explicitSpecs.some((option) => option.toLowerCase() === "radiotracer");
  const hasFdg = explicitSpecs.some((option) => option.toLowerCase() === "fdg");

  if (/^doppler\s*-/i.test(name)) {
    return splitSpecificationParts(name.replace(/^doppler\s*-\s*/i, "")).map((part) => `${part} Doppler`);
  }

  if (/angiography/i.test(name) && /\//.test(name)) {
    const body = stripModalityPrefix(name.replace(/^(ct|mri)\s+/i, "").replace(/angiography/i, "").replace(/\(.*?\)/g, ""));
    return splitSpecificationParts(body).map((part) => `${part} Angiography`);
  }

  const [rawSubject = name, rawProtocol] = name.split(/\s+-\s+/, 2);
  const subject = stripModalityPrefix(rawSubject);
  const protocol = rawProtocol?.replace(/\)$/g, "").trim();
  const subjects = splitSpecificationParts(subject);
  const protocolParts = protocol ? splitSpecificationParts(protocol) : [];

  if (/with\s+/i.test(subject)) {
    const [base, withPart] = subject.split(/\s+with\s+/i, 2);
    return combineSpecificationParts(splitSpecificationParts(base), splitSpecificationParts(withPart));
  }

  if (protocolParts.length) return combineSpecificationParts(subjects, protocolParts);

  if (hasOptionalContrast) return combineSpecificationParts(subjects.length ? subjects : usefulExplicitSpecs, ["Plain", "Contrast"]);
  if (hasContrast) return combineSpecificationParts(subjects.length ? subjects : usefulExplicitSpecs, ["Contrast"]);
  if (hasRadiotracer) return combineSpecificationParts(subjects.length ? subjects : usefulExplicitSpecs, ["Radiotracer"]);
  if (hasFdg) return combineSpecificationParts(subjects.length ? subjects : usefulExplicitSpecs, ["FDG"]);

  return uniqueOptions(subjects.length ? subjects : usefulExplicitSpecs);
}

function getSpecificationOptions(test: RadiologyTest) {
  const derivedOptions = deriveSpecificationOptions(test);
  if (derivedOptions.length) return uniqueOptions(derivedOptions);

  const testName = test.name;
  const baseName = testName.includes(" - ") ? testName.split(" - ")[0] : testName;
  const matchedKey = Object.keys(specOptionsByTest).find((key) => baseName.toLowerCase().includes(key.toLowerCase()));
  return matchedKey ? specOptionsByTest[matchedKey] : ["Default"];
}

export function RadiologyTestOrderTab({
  search,
  onSearchChange,
  filteredTests,
  selectedTestIds,
  selectedGroupIds,
  onToggleTest,
  priority,
  onPriorityChange,
  notes,
  onNotesChange,
  onOpenSummary,
  onSave,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filteredTests: RadiologyTest[];
  selectedTestIds: string[];
  selectedGroupIds: string[];
  onToggleTest: (id: string) => void;
  priority: RadiologyPriority;
  onPriorityChange: (value: RadiologyPriority) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onOpenSummary: () => void;
  onSave: () => void;
}) {
  const [activeCategory, setActiveCategory] = React.useState("X-Ray");
  const [selectedSpecs, setSelectedSpecs] = React.useState<string[]>(["Left"]);
  const [specificationById, setSpecificationById] = React.useState<Record<string, string>>({});

  const visibleTests = React.useMemo(() => filteredTests.filter((test) => !activeCategory || test.category === activeCategory), [activeCategory, filteredTests]);
  const selectedOrders = React.useMemo(() => filteredTests.filter((test) => selectedTestIds.includes(test.id)), [filteredTests, selectedTestIds]);
  const activeTest = selectedOrders[0] ?? visibleTests[0] ?? filteredTests[0];
  const currentSpecs = React.useMemo(() => (activeTest ? getSpecificationOptions(activeTest) : ["Left", "Right", "Upper", "Lower", "Lateral"]), [activeTest]);
  const currentSpecsKey = currentSpecs.join("|");

  const selectedOrderRows = React.useMemo<SelectedOrderRow[]>(
    () =>
      selectedOrders.map((test) => {
        const options = getSpecificationOptions(test);
        const savedSpecification = specificationById[test.id];
        const specification = savedSpecification && options.includes(savedSpecification) ? savedSpecification : options[0] ?? "-";

        return {
          id: test.id,
          selectedTests: test.name,
          loincCode: test.code || "-",
          category: test.category ?? test.modality,
          specimenSource: "Blood",
          specificationOptions: options,
          specification,
          priority: priority ?? "Routine",
        };
      }),
    [priority, selectedOrders, specificationById],
  );

  const selectedOrderColumns = React.useMemo<ColumnDef<SelectedOrderRow>[]>(
    () => [
      { accessorKey: "selectedTests", header: "Selected Tests" },
      { accessorKey: "loincCode", header: "LOINC Code" },
      { accessorKey: "category", header: "Category" },
      {
        accessorKey: "specification",
        header: "Specification",
        cell: ({ row }) => {
          const options = row.original.specificationOptions.length ? row.original.specificationOptions : ["Default"];
          return (
            <select
              className="h-9 w-full rounded-md border border-input px-3 text-sm"
              value={row.original.specification}
              onChange={(event) => setSpecificationById((current) => ({ ...current, [row.original.id]: event.target.value }))}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          );
        },
      },
      {
        accessorKey: "priority",
        header: "Choose Priority",
        cell: ({ row }) => (
          <select
            className="h-9 w-full rounded-md border border-input px-3 text-sm"
            value={row.original.priority}
            onChange={(event) => onPriorityChange(event.target.value as RadiologyPriority)}
          >
            {radiologyPriorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ),
      },
    ],
    [onPriorityChange],
  );

  React.useEffect(() => {
    setSelectedSpecs((current) => {
      const next = current.filter((spec) => currentSpecs.includes(spec));
      if (next.length === current.length && next.every((spec, index) => spec === current[index])) return current;
      return next;
    });
  }, [currentSpecsKey]);

  const toggleSpec = (label: string) => {
    setSelectedSpecs((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  };

  return (
    <div className="space-y-4">
      <div className="grid min-w-0 gap-4 overflow-x-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid gap-3">
          <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <SectionTitle>Modality / Category</SectionTitle>
              <Button type="button" size="sm" className="ml-auto">
                <Plus className="h-4 w-4" />
                Add Test
              </Button>
            </div>
            <div className="mt-3 max-w-full overflow-hidden border border-border">
              <table className="w-full text-xs">
                <tbody>
                  {radiologyTestGroups.map((group, index) => (
                    <tr key={group.id} className={index % 2 === 0 ? "bg-background" : "bg-surface-muted/40"}>
                      <td className="border-t border-border px-2 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveCategory(group.name);
                          }}
                          className={["w-full text-left font-medium", activeCategory === group.name ? "text-primary" : "text-foreground"].join(" ")}
                        >
                          {group.name}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="max-w-full overflow-hidden rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <SectionTitle>Reorder from previous tests</SectionTitle>
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
                  <tr>
                    <td className="border-t border-r border-border px-2 py-2 text-muted-foreground">12 Apr 2026</td>
                    <td className="border-t border-r border-border px-2 py-2 font-medium text-foreground">CT Head</td>
                    <td className="border-t border-border px-2 py-2">
                      <Button type="button" size="sm" variant="outline">
                        Reorder
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search Test Name" />
            </div>
          </div>

          <div className="grid min-w-0 gap-4 ">
            {/* <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
              <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select grouped tests</div>
              <div className="max-h-[360px] overflow-auto px-3">
                {radiologyTestGroups.map((group) => (
                  <CheckboxRow key={group.id} label={group.name} checked={selectedGroupIds.includes(group.id)} onToggle={() => onToggleGroup(group.id)} />
                ))}
              </div>
            </div> */}

            <div className="min-w-0 overflow-hidden rounded-md border border-border bg-surface-muted">
              <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Select tests</div>
              <div className="max-h-[360px] overflow-auto px-3">
                {visibleTests.map((test) => (
                  <CheckboxRow key={test.id} label={test.name} checked={selectedTestIds.includes(test.id)} onToggle={() => onToggleTest(test.id)} />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
          <div className="grid min-w-0 gap-4">
            <DataTable data={selectedOrderRows} columns={selectedOrderColumns} />

            <label className="space-y-2">
              <SectionTitle>Instructions</SectionTitle>
              <textarea
                className="min-h-[92px] w-full rounded-md border border-input px-3 py-2 text-sm outline-none focus:border-border focus:ring-0"
                placeholder="Instructions for radiology"
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
              />
            </label>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-4">
            <div className="text-sm text-muted-foreground">{selectedTestIds.length + selectedGroupIds.length} tests selected</div>

            <div className="ml-auto flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onOpenSummary}>
                View order summary
              </Button>
              <Button type="button" onClick={onSave}>
                Save
              </Button>
            </div>
          </div>
    </div>
  );
}
