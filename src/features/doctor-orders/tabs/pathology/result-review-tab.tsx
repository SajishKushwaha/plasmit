"use client";

import * as React from "react";
import { Download, Eye, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { diagnosisTypes } from "./data";
import type { PathologyResultBlock } from "./types";

function FlagPill({ flag }: { flag: "N" | "H" | "L" }) {
  const className = flag === "H" ? "bg-danger/10 text-danger" : flag === "L" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>{flag}</span>;
}

export function PathologyResultReviewTab({
  resultMode,
  onResultModeChange,
  resultBlocks: blocks,
  diagnosisSearch,
  diagnosisType,
  diagnosisOpen,
  selectedDiagnosisLabel,
  onDiagnosisSearchChange,
  onDiagnosisTypeChange,
  onDiagnosisOpenChange,
  onAddDiagnosis,
  onEditResult,
  onDeleteResult,
  onReorderResult,
}: {
  resultMode: "Result history" | "All results";
  onResultModeChange: (value: "Result history" | "All results") => void;
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
  const suggestions = ["Diabetes mellitus", "Iron deficiency anemia", "Chronic kidney disease", "Hypertension"];

  const visibleBlocks = React.useMemo(() => {
    const query = diagnosisSearch.trim().toLowerCase();
    if (!query) return blocks;
    return blocks.filter((block) => `${block.name} ${block.specialty}`.toLowerCase().includes(query));
  }, [blocks, diagnosisSearch]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Result review</div>
              <div className="mt-1 text-xs text-muted-foreground">Review result history, add diagnosis, and take action on each result block.</div>
            </div>
            {/* <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm">
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button type="button" variant="outline" size="sm">
                <Eye className="h-4 w-4" />
                View report
              </Button>
            </div> */}
          </div>

          <div className="flex gap-2 border-b border-border">
            {(["Result history", "All results"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={[
                  "border-b-2 px-3 py-2 text-xs font-medium transition",
                  resultMode === item ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                ].join(" ")}
                onClick={() => onResultModeChange(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {visibleBlocks.map((block) => (
              <div key={block.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-foreground">{block.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>08 Jun 2026</span>
                    <Badge tone="info">{block.specialty}</Badge>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                    <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Parameter</th>
                        <th className="px-4 py-3">Result</th>
                        <th className="px-4 py-3">Unit</th>
                        <th className="px-4 py-3">Reference range</th>
                        <th className="px-4 py-3">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row) => (
                        <tr key={row.parameter} className="border-t border-border">
                          <td className="px-4 py-3 font-medium text-foreground">{row.parameter}</td>
                          <td className="px-4 py-3">{row.result}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.unit}</td>
                          <td className="px-4 py-3 text-muted-foreground">{row.referenceRange}</td>
                          <td className="px-4 py-3">
                            <FlagPill flag={row.flag} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onEditResult(block.name)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="text-danger" onClick={() => onDeleteResult(block.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => onReorderResult(block.name)}>
                    <RefreshCw className="h-4 w-4" />
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Card className="border-border bg-surface-muted">
            <CardContent className="space-y-3 p-4">
              <div className="text-sm font-semibold text-foreground">ADD DIAGNOSIS</div>
              <div className="flex flex-wrap items-end gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search diagnosis..."
                    value={diagnosisSearch}
                    onFocus={() => onDiagnosisOpenChange(true)}
                    onChange={(event) => onDiagnosisSearchChange(event.target.value)}
                  />
                  {diagnosisOpen ? (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-white p-1 shadow-md">
                      {suggestions
                        .filter((item) => item.toLowerCase().includes(diagnosisSearch.trim().toLowerCase()))
                        .map((item) => (
                          <button
                            key={item}
                            type="button"
                            className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-surface-muted"
                            onClick={() => {
                              onDiagnosisSearchChange(item);
                              onDiagnosisOpenChange(false);
                            }}
                          >
                            {item}
                          </button>
                        ))}
                    </div>
                  ) : null}
                </div>
                <span className="inline-flex rounded-md border border-info/30 bg-info/10 px-3 py-2 text-xs font-medium text-info">SNOMED CT</span>
                <div className="min-w-[130px]">
                  <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:border-border focus:ring-0" value={diagnosisType} onChange={(event) => onDiagnosisTypeChange(event.target.value)}>
                    <option value="">Type</option>
                    {diagnosisTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="button" onClick={onAddDiagnosis}>
                  OK
                </Button>
              </div>
              <textarea
                className="min-h-[56px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-border focus:ring-0"
                placeholder="Add conclusion or remarks..."
                value={selectedDiagnosisLabel}
                readOnly
              />
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
