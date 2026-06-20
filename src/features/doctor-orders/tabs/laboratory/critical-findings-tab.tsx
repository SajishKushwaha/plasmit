"use client";

import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";

import type { LaboratoryResultBlock } from "./types";

type CriticalFinding = {
  id: string;
  test: string;
  parameter: string;
  result: string;
  range: string;
  flag: "H" | "L";
};

export function LaboratoryCriticalFindingsTab({ resultBlocks }: { resultBlocks: LaboratoryResultBlock[] }) {
  const findings = React.useMemo<CriticalFinding[]>(
    () =>
      resultBlocks.flatMap((block) =>
        block.rows
          .filter((row) => row.flag !== "N")
          .map((row, index) => ({
            id: `${block.id}-${row.parameter}-${index}`,
            test: block.name,
            parameter: row.parameter,
            result: row.result,
            range: row.referenceRange,
            flag: row.flag as "H" | "L",
          })),
      ),
    [resultBlocks],
  );

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        
        <div className="rounded-md border border-danger/30 bg-danger/5 p-4">
          <div className="text-sm font-semibold text-danger">⚠ Critical Findings</div>
          {findings.length ? (
            <div className="mt-3 overflow-auto rounded-md border border-danger/20 bg-white">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead className="bg-danger/10 text-xs font-semibold uppercase tracking-wide text-danger">
                  <tr>
                    <th className="px-3 py-2">Test</th>
                    <th className="px-3 py-2">Parameter</th>
                    <th className="px-3 py-2">Result</th>
                    <th className="px-3 py-2">Range</th>
                    <th className="px-3 py-2">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((finding) => (
                    <tr key={finding.id} className="border-t border-danger/10">
                      <td className="px-3 py-2 font-medium text-foreground">{finding.test}</td>
                      <td className="px-3 py-2 text-muted-foreground">{finding.parameter}</td>
                      <td className="px-3 py-2 font-semibold text-danger">{finding.result}</td>
                      <td className="px-3 py-2 text-muted-foreground">{finding.range}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">{finding.flag}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground">No critical findings available.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
