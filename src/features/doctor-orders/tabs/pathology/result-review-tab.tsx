"use client";

import * as React from "react";
import { ArrowUpDown, ChevronDown, ChevronRight, Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { diagnosisTypes } from "./data";
import type { PathologyResultBlock } from "./types";
import { downloadLaboratoryPdf } from "../report-pdf-utils";

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "Pending"
      ? "bg-warning/10 text-warning"
      : status === "Received"
        ? "bg-success/10 text-success"
        : status === "Pending" || status === "Ordered"
          ? "bg-info/10 text-info"
          : "bg-surface-muted text-muted-foreground";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${tone}`}>{status}</span>;
}

export function PathologyResultReviewTab({
  resultBlocks: allBlocks,
  diagnosisSearch,
  diagnosisType,
  diagnosisOpen,
  selectedDiagnosisLabel,
  onDiagnosisSearchChange,
  onDiagnosisTypeChange,
  onDiagnosisOpenChange,
  onAddDiagnosis,
  onReorderResult,
}: {
  resultBlocks: PathologyResultBlock[];
  diagnosisSearch: string;
  diagnosisType: string;
  diagnosisOpen: boolean;
  selectedDiagnosisLabel: string;
  onDiagnosisSearchChange: (value: string) => void;
  onDiagnosisTypeChange: (value: string) => void;
  onDiagnosisOpenChange: (value: boolean) => void;
  onAddDiagnosis: () => void;
  onEditResult: (name: string) => void;
  onDeleteResult: (id: string) => void;
  onReorderResult: (name: string) => void;
}) {
  const [expandedBlocks, setExpandedBlocks] = React.useState<Record<string, boolean>>({});
  const diagnosisOptions = React.useMemo(
    () => [
      { conclusion: "Thrombocytopenic disorder", code: "302215000", type: "Primary" },
      { conclusion: "Iron deficiency anemia", code: "271737000", type: "Secondary" },
      { conclusion: "Leukocytosis", code: "267038008", type: "Differential" },
      { conclusion: "Chronic kidney disease", code: "709044004", type: "Primary" },
      { conclusion: "Hypertension", code: "38341003", type: "Secondary" },
    ],
    [],
  );
  const [selectedDiagnosis, setSelectedDiagnosis] = React.useState<(typeof diagnosisOptions)[number] | null>(null);
  const [commentDraft, setCommentDraft] = React.useState(selectedDiagnosisLabel);
  const [confirmedDiagnoses, setConfirmedDiagnoses] = React.useState<Array<{ id: string; type: string; diagnosis: string; snomed: string; comments: string }>>([]);

  const visibleBlocks = React.useMemo(() => {
    const query = diagnosisSearch.trim().toLowerCase();
    if (!query) return allBlocks;
    return allBlocks.filter((block) => `${block.name} ${block.specialty}`.toLowerCase().includes(query));
  }, [allBlocks, diagnosisSearch]);

  const downloadReport = () => {
    const reportBlocks = allBlocks
      .filter((block) => block.rows.every((row) => row.flag !== "N"))
      .map((block) => ({
        testName: block.name.replace(" - complete blood count", "").replace(" - kidney function test", ""),
        department: block.specialty,
        sampleCollectedOn: "12/05/2021",
        completedOn: "14/05/2021",
        reportStatus: "Final",
        barcodeNo: `BAR-${block.id}`,
        sampleType: "Blood",
        reportDate: "14/05/2021",
        interpretation: block.name.includes("CBC") ? "CBC pattern suggests anemia and low hematocrit." : "KFT indicates renal function abnormality.",
        rows: block.rows.map((row) => ({
          testName: block.name,
          parameter: row.parameter,
          value: row.result,
          unit: row.unit,
          referenceRange: row.referenceRange,
          flag: row.flag,
        })),
      }));
    downloadLaboratoryPdf(reportBlocks, "pathology-reports.pdf");
  };

  const filteredDiagnosisOptions = React.useMemo(() => {
    const query = diagnosisSearch.trim().toLowerCase();
    return diagnosisOptions.filter((item) => {
      const searchMatch = !query || `${item.conclusion} ${item.code}`.toLowerCase().includes(query);
      const typeMatch = !diagnosisType || item.type === diagnosisType;
      return searchMatch && typeMatch;
    });
  }, [diagnosisOptions, diagnosisSearch, diagnosisType]);

  React.useEffect(() => {
    if (!selectedDiagnosis && filteredDiagnosisOptions.length) setSelectedDiagnosis(filteredDiagnosisOptions[0]);
  }, [filteredDiagnosisOptions, selectedDiagnosis]);

  const openDiagnosisDialog = () => {
    setSelectedDiagnosis(null);
    setCommentDraft("");
    onDiagnosisSearchChange("");
    onDiagnosisTypeChange("");
    onDiagnosisOpenChange(true);
  };

  const closeDiagnosisDialog = () => {
    onDiagnosisOpenChange(false);
    setSelectedDiagnosis(null);
    setCommentDraft("");
  };

  return (
    <div className="space-y-4">
      {/* <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={downloadReport}>
          <Download className="h-4 w-4" />
          Download All Reports
        </Button>
      </div> */}

      <div className="overflow-auto rounded-md border border-border">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-3">LOINC Code</th>
              <th className="px-3 py-3">Test</th>
              {/* <th className="px-3 py-3">Units</th>
              <th className="px-3 py-3">Results</th>
              <th className="px-3 py-3">Range</th> */}
              <th className="px-3 py-3">Order Date</th>
              <th className="px-3 py-3">Order completion Date</th>
              {/* <th className="px-3 py-3">Result Status</th> */}
              <th className="px-3 py-3">Action</th>
              <th>
                <Button type="button" variant="outline" size="sm" onClick={downloadReport}>
                  <Download className="h-4 w-4" />
                    Download All Reports
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleBlocks.map((block) => {
              const expanded = Boolean(expandedBlocks[block.id]);
              const primaryRow = block.rows[0];
              const hasHigh = block.rows.some((item) => item.flag === "H");
              const hasLow = block.rows.some((item) => item.flag === "L");
              const hasPending = block.rows.some((item) => item.flag === "N");
              return (
                <React.Fragment key={block.id}>
                  <tr className="border-t border-border align-top">
                    <td className="px-3 py-3 text-xs text-muted-foreground">{block.name.toLowerCase().includes("cbc") ? "11273-0" : "28515-7"}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-foreground">{block.name.replace(" - complete blood count", "").replace(" - kidney function test", "")}</div>
                      <div className="text-xs text-muted-foreground">{block.specialty}</div>
                    </td>
                    {/* <td className="px-3 py-3 text-muted-foreground">{primaryRow?.unit ?? "-"}</td>
                    <td className="px-3 py-3">
                      <div className={["font-semibold", hasHigh ? "text-danger" : hasLow ? "text-warning" : "text-foreground"].join(" ")}>
                        {primaryRow?.result ?? "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">{primaryRow?.referenceRange ?? "-"}</td> */}
                    <td className="px-3 py-3 text-muted-foreground">12/05/2021</td>
                    <td className="px-3 py-3 text-muted-foreground">{hasPending ? "Pending" : "14/05/2021"}</td>
                    {/* <td className="px-3 py-3">
                      <StatusPill status={hasPending ? "Pending" : hasHigh ? "High" : "Low"} />
                    </td> */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onReorderResult(block.name)}>
                          <ArrowUpDown className="h-4 w-4" />
                          {/* Reorder */}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => {
                          if (block.rows.every((row) => row.flag === "N")) return;
                          downloadLaboratoryPdf([
                            {
                              testName: block.name.replace(" - complete blood count", "").replace(" - kidney function test", ""),
                              department: block.specialty,
                              sampleCollectedOn: "12/05/2021",
                              completedOn: "14/05/2021",
                              reportStatus: "Final",
                              barcodeNo: `BAR-${block.id}`,
                              sampleType: "Blood",
                              reportDate: "14/05/2021",
                              interpretation: block.name.includes("CBC") ? "CBC pattern suggests anemia and low hematocrit." : "KFT indicates renal function abnormality.",
                              rows: block.rows.map((row) => ({
                                testName: block.name,
                                parameter: row.parameter,
                                value: row.result,
                                unit: row.unit,
                                referenceRange: row.referenceRange,
                                flag: row.flag,
                              })),
                            },
                          ], "pathology-report.pdf");
                        }}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedBlocks((current) => ({ ...current, [block.id]: !expanded }))}
                        >
                          <Eye className="h-4 w-4"/>
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expanded ? (
                    <tr className="border-t border-border bg-surface-muted/20">
                      <td colSpan={9} className="px-3 py-3">
                        <div className="rounded-md border border-border bg-white p-3">
                          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            <span className="font-semibold text-foreground">{block.name.replace(" - complete blood count", "").replace(" - kidney function test", "")}</span>
                            <span className="text-muted-foreground">{block.specialty}</span>
                            <span className="text-muted-foreground">Sample: Blood</span>
                            <span className="text-muted-foreground">Collected On: 12/05/2021</span>
                            <span className="text-muted-foreground">Completed On: 14/05/2021</span>
                            <span className="text-muted-foreground">LOINC Code: {block.name.toLowerCase().includes("cbc") ? "11273-0" : "28515-7"}</span>
                          </div>
                          <div className="overflow-hidden rounded-md border border-border">
                            <table className="w-full border-collapse text-left text-sm">
                              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <tr>
                                  <th className="px-3 py-2">Parameter</th>
                                  <th className="px-3 py-2">Result</th>
                                  <th className="px-3 py-2">Unit</th>
                                  <th className="px-3 py-2">Range</th>
                                  <th className="px-3 py-2">Flag</th>
                                </tr>
                              </thead>
                              <tbody>
                                {block.rows.map((row) => (
                                  <tr key={row.parameter} className="border-t border-border">
                                    <td className="px-3 py-2 font-medium text-foreground">{row.parameter}</td>
                                    <td className="px-3 py-2 text-foreground">{row.result}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{row.unit}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{row.referenceRange}</td>
                                    <td className="px-3 py-2 text-muted-foreground">{row.flag}</td>                                   
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-3">
        {/* <Button type="button" variant="outline" onClick={openDiagnosisDialog}>
          Add Diagnosis
        </Button> */}
        <Button type="button" onClick={openDiagnosisDialog}> Add Diagnosis</Button>
      </div>
      <div className="rounded-md border border-border bg-surface-muted/30 p-4">
        <div className="mb-3 text-sm font-semibold text-foreground">Selected Diagnosis</div>
        {confirmedDiagnoses.length ? (
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Diagnosis</th>
                  <th className="px-3 py-2 text-left">SNOMED CT</th>
                  <th className="px-3 py-2 text-left">Comments</th>
                </tr>
              </thead>
              <tbody>
                {confirmedDiagnoses.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">{item.type}</td>
                    <td className="px-3 py-2 text-foreground">{item.diagnosis}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.snomed}</td>
                    <td className="px-3 py-2 text-muted-foreground">{item.comments || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No diagnosis selected yet.</div>
        )}
      </div>

      {diagnosisOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:items-center sm:p-4">
          <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-border bg-white shadow-xl sm:max-h-[calc(100vh-2rem)]">
            <div className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">Add Diagnosis</div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
                <div className="min-w-0">
                  <Input value={diagnosisSearch} onChange={(event) => onDiagnosisSearchChange(event.target.value)} placeholder="Search by clinical conclusion or SNOMED code" />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 text-xs font-medium text-muted-foreground">Diagnosis Type</div>
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0" value={diagnosisType} onChange={(event) => onDiagnosisTypeChange(event.target.value)}>
                    <option value="">All Types</option>
                    {diagnosisTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-hidden rounded-md border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left">Select</th>
                        <th className="px-3 py-2 text-left">Clinical Conclusion</th>
                        <th className="px-3 py-2 text-left">SNOMED CT Code</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDiagnosisOptions.map((item) => {
                        const checked = selectedDiagnosis?.code === item.code;
                        return (
                          <tr key={item.code} className={checked ? "bg-primary/5" : "border-t border-border"}>
                            <td className="px-3 py-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 accent-primary"
                                checked={checked}
                                onChange={(event) => {
                                  if (event.target.checked) {
                                    setSelectedDiagnosis(item);
                                  } else if (selectedDiagnosis?.code === item.code) {
                                    setSelectedDiagnosis(null);
                                  }
                                }}
                              />
                            </td>
                            <td className="px-3 py-2 text-foreground">{item.conclusion}</td>
                            <td className="px-3 py-2 text-muted-foreground">{item.code}</td>
                          </tr>
                        );
                      })}
                      {!filteredDiagnosisOptions.length ? (
                        <tr>
                          <td colSpan={3} className="px-3 py-6 text-center text-muted-foreground">
                            No diagnosis found
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Comments</div>
                  <textarea className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-border focus:ring-0" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Enter comments" />
                </label>
              </div>
            </div>
            <div className="flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDiagnosisDialog}>
                Close
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (selectedDiagnosis) {
                    setConfirmedDiagnoses((current) => [
                      {
                        id: `${selectedDiagnosis.code}-${Date.now()}`,
                        type: selectedDiagnosis.type,
                        diagnosis: selectedDiagnosis.conclusion,
                        snomed: selectedDiagnosis.code,
                        comments: commentDraft,
                      },
                      ...current,
                    ]);
                    onAddDiagnosis();
                    closeDiagnosisDialog();
                  }
                }}
              >
                Add Diagnosis
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
