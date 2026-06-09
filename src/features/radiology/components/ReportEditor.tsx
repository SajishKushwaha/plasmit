"use client";

import { useState } from "react";

import type { RadiologyReport } from "@/features/radiology/types";

interface ReportEditorProps {
  report?: RadiologyReport;
}

const defaultFindings =
  "Technique: Multiplanar imaging performed as per department protocol.\n\nFindings:\n- Relevant anatomy is evaluated.\n- No gross acute abnormality is identified in the provided sample template.\n- Correlate clinically and compare with prior imaging if available.";

const defaultImpression = "No acute radiological abnormality in this sample draft.";

export function ReportEditor({ report }: ReportEditorProps) {
  const [findings, setFindings] = useState(report?.findings ?? defaultFindings);
  const [impression, setImpression] = useState(report?.impression ?? defaultImpression);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-950">Radiologist Reporting Workbench</h2>
        <p className="mt-1 text-sm text-slate-500">Structured editor with findings, impression, verification queue, and critical alert hooks.</p>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <label className="text-sm font-medium text-slate-900" htmlFor="report-findings">
            Findings
          </label>
          <textarea
            className="mt-2 min-h-[320px] w-full rounded-lg border border-slate-300 p-3 font-mono text-sm leading-6 text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
            id="report-findings"
            onChange={(event) => setFindings(event.target.value)}
            value={findings}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-900" htmlFor="report-impression">
            Impression
          </label>
          <textarea
            className="mt-2 min-h-[180px] w-full rounded-lg border border-slate-300 p-3 text-sm leading-6 text-slate-900 outline-none focus:border-sky-700 focus:ring-2 focus:ring-sky-100"
            id="report-impression"
            onChange={(event) => setImpression(event.target.value)}
            value={impression}
          />
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium text-slate-900">Voice dictation placeholder</p>
            <p className="mt-1">Future integration can connect speech-to-text, PACS viewer context, and auto template suggestions.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" type="button">
              Save draft
            </button>
            <button className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-800" type="button">
              Send for verification
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
