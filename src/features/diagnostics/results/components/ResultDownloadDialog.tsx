"use client";

import { type ReactNode, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Download, FileSpreadsheet, FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ResultRecord } from "@/features/diagnostics/results/types";

type DownloadFormat = "PDF" | "Excel" | "Word";

const formatOptions: Array<{
  format: DownloadFormat;
  title: string;
  description: string;
  className: string;
  icon: ReactNode;
}> = [
  {
    format: "PDF",
    title: "Download as PDF",
    description: "Best for printing and sharing",
    className: "border-danger/20 bg-danger/10 text-danger",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    format: "Excel",
    title: "Download as Excel",
    description: "Best for data analysis and calculations",
    className: "border-success/20 bg-success/10 text-success",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    format: "Word",
    title: "Download as Word",
    description: "Best for editing and documentation",
    className: "border-primary/20 bg-primary/10 text-primary",
    icon: <FileText className="h-4 w-4" />,
  },
];

function cleanFilePart(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x20-\x7e]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function reportRows(result: ResultRecord) {
  return [
    ["Report ID", result.id],
    ["Patient", `${result.patientName} (${result.mrn})`],
    ["Age / Sex", result.ageSex],
    ["Visit Type", result.visitType],
    ["Department", result.department],
    ["Test", result.testName],
    ["Status", result.status],
    ["Priority", result.priority],
    ["Ordering Doctor", result.orderingDoctor],
    ["Location", result.location],
    ["Ordered At", result.orderedAt],
    ["Completed At", result.completedAt ?? "-"],
    ["Specimen / Accession", result.specimen ?? result.accessionNo ?? "-"],
    ["Summary", result.resultSummary],
  ];
}

function buildHtmlReport(result: ResultRecord, variant: "excel" | "word") {
  const rows = reportRows(result)
    .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
    .join("");
  const values = result.values
    .map(
      (value) =>
        `<tr><td>${escapeHtml(value.name)}</td><td>${escapeHtml(value.value)}</td><td>${escapeHtml(value.unit ?? "")}</td><td>${escapeHtml(value.range ?? "-")}</td><td>${escapeHtml(value.flag ?? "-")}</td></tr>`,
    )
    .join("");
  const timeline = result.timeline
    .map((event) => `<tr><td>${escapeHtml(event.label)}</td><td>${escapeHtml(event.at)}</td><td>${escapeHtml(event.by)}</td></tr>`)
    .join("");

  const css =
    variant === "excel"
      ? "table{border-collapse:collapse;width:100%}th,td{border:1px solid #9ca3af;padding:8px;text-align:left}th{background:#e5f3ff}"
      : "body{font-family:Arial,Helvetica,sans-serif;color:#111827}table{border-collapse:collapse;width:100%;margin:12px 0}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}th{background:#eff6ff}";

  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
    <h1>Plasmit Hospital Diagnostic Report</h1>
    <h2>${escapeHtml(result.testName)}</h2>
    <table>${rows}</table>
    <h3>Result Values</h3>
    <table><thead><tr><th>Name</th><th>Value</th><th>Unit</th><th>Range</th><th>Flag</th></tr></thead><tbody>${values}</tbody></table>
    <h3>Timeline</h3>
    <table><thead><tr><th>Event</th><th>Time</th><th>By</th></tr></thead><tbody>${timeline}</tbody></table>
  </body></html>`;
}

function buildPdfReport(result: ResultRecord) {
  const lines = [
    "Plasmit Hospital Diagnostic Report",
    result.testName,
    "",
    ...reportRows(result).map(([label, value]) => `${label}: ${value}`),
    "",
    "Result Values",
    ...result.values.map((value) => `${value.name}: ${value.value} ${value.unit ?? ""} | Range: ${value.range ?? "-"} | ${value.flag ?? "-"}`),
    "",
    "Timeline",
    ...result.timeline.map((event) => `${event.at} - ${event.label} - ${event.by}`),
  ].slice(0, 42);

  const content = [
    "BT",
    "/F1 12 Tf",
    "50 760 Td",
    ...lines.map((line, index) => `${index === 0 ? "" : "0 -16 Td\n"}(${escapePdfText(line)}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadResult(result: ResultRecord, format: DownloadFormat) {
  const baseName = `${cleanFilePart(result.id)}-${cleanFilePart(result.patientName)}-report`;

  if (format === "PDF") {
    downloadBlob(new Blob([buildPdfReport(result)], { type: "application/pdf" }), `${baseName}.pdf`);
    return;
  }

  if (format === "Excel") {
    downloadBlob(new Blob([buildHtmlReport(result, "excel")], { type: "application/vnd.ms-excel" }), `${baseName}.xls`);
    return;
  }

  downloadBlob(new Blob([buildHtmlReport(result, "word")], { type: "application/msword" }), `${baseName}.doc`);
}

export function ResultDownloadDialog({
  onDownloaded,
  result,
  trigger,
}: {
  onDownloaded?: (format: DownloadFormat) => void;
  result: ResultRecord;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const subtext = useMemo(() => `${result.patientName} | ${result.mrn} | ${result.testName}`, [result.mrn, result.patientName, result.testName]);

  function handleDownload(format: DownloadFormat) {
    downloadResult(result, format);
    onDownloaded?.(format);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-4 shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-foreground">Download Report</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Choose the format you want to download the report in.
              </Dialog.Description>
              <p className="mt-2 truncate text-xs text-muted-foreground">{subtext}</p>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close download options" size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-2">
            {formatOptions.map((option) => (
              <button
                className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                key={option.format}
                onClick={() => handleDownload(option.format)}
                type="button"
              >
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${option.className}`}>{option.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{option.title}</span>
                  <span className="block text-xs text-muted-foreground">{option.description}</span>
                </span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
                  <Download className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
