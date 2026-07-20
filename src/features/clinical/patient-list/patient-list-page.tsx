"use client";

import * as React from "react";
import Link from "next/link";
import { Edit3, Eye, MoreVertical, RefreshCw, Trash2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { getPatientRecordValue, readPatientRecords, writePatientRecords, type PatientRecord } from "@/features/clinical/patient-list/patient-records";

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function PatientListPreview({ record }: { record: PatientRecord }) {
  const patientName = getPatientRecordValue(record, "Patient Name") || "Unnamed patient";

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-3 sm:p-5">
      <div className="mx-auto w-full max-w-[210mm] overflow-hidden bg-white text-black shadow-soft">
        <div className="min-h-[297mm] p-6 sm:p-10">
          <div className="border-b-2 border-black pb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Plasmit Hospital HMS</div>
            <h2 className="mt-1 text-2xl font-bold text-black">Patient Details</h2>
            <p className="mt-1 text-sm text-neutral-600">{patientName}</p>
          </div>

          <div className="space-y-7 pt-6">
            {record.sections.map((section) => (
              <section className="break-inside-avoid" key={`${record.id}-${section.tabId}`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-px flex-1 bg-neutral-300" />
                  <h3 className="shrink-0 text-sm font-bold uppercase tracking-wide text-black">{section.tabLabel}</h3>
                  <div className="h-px flex-1 bg-neutral-300" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {section.fields.map((field, index) => (
                    <div className="rounded border border-neutral-300 p-2" key={`${section.tabId}-${field.label}-${index}`}>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{field.label}</div>
                      <div className="mt-1 break-words text-sm font-medium text-black">{field.value}</div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PatientListPage() {
  const [records, setRecords] = React.useState<PatientRecord[]>(() => readPatientRecords());
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; right: number } | null>(null);
  const [previewRecord, setPreviewRecord] = React.useState<PatientRecord | null>(null);

  function handleMenuToggle(recordId: string, event: React.MouseEvent<HTMLButtonElement>) {
    if (openMenuId === recordId) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    setOpenMenuId(recordId);
    setMenuPosition({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }

  function handleDelete(record: PatientRecord) {
    const patientName = getPatientRecordValue(record, "Patient Name") || "this patient";
    if (!window.confirm(`Delete ${patientName}?`)) return;
    const nextRecords = records.filter((item) => item.id !== record.id);
    writePatientRecords(nextRecords);
    setRecords(nextRecords);
    setOpenMenuId(null);
    setMenuPosition(null);
    if (previewRecord?.id === record.id) setPreviewRecord(null);
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-primary">
              <UsersRound className="h-4 w-4" />
            </span>
            <CardTitle>Saved Patient Details</CardTitle>
          </div>
          <Button onClick={() => setRecords(readPatientRecords())} size="sm" type="button" variant="outline">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {records.length ? (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <tr>
                    {["MRN / Patient ID", "Patient Name", "Age", "Gender", "Contact Number", "Updated At", "Action"].map((header) => (
                      <th className="border-b border-border px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]" key={header}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr className="border-b border-border last:border-0 hover:bg-surface-muted/70" key={record.id}>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{getPatientRecordValue(record, "MRN / Patient ID") || record.id}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)] font-medium text-foreground">{getPatientRecordValue(record, "Patient Name") || "Unnamed patient"}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{getPatientRecordValue(record, "Age") || "-"}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{getPatientRecordValue(record, "Gender") || "-"}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{getPatientRecordValue(record, "Contact Number") || "-"}</td>
                      <td className="px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">{formatUpdatedAt(record.updatedAt)}</td>
                      <td className="relative px-[var(--density-table-cell-x)] py-[var(--density-table-cell-y)]">
                        <Button
                          aria-expanded={openMenuId === record.id}
                          aria-label="Open patient actions"
                          onClick={(event) => handleMenuToggle(record.id, event)}
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {openMenuId === record.id && menuPosition ? (
                          <div
                            className="fixed z-[100] w-40 overflow-hidden rounded-md border border-border bg-surface py-1 text-sm shadow-soft"
                            style={{ top: menuPosition.top, right: menuPosition.right }}
                          >
                            <Link
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-foreground hover:bg-surface-muted"
                              href={`/patient-details?edit=${record.id}`}
                              onClick={() => {
                                setOpenMenuId(null);
                                setMenuPosition(null);
                              }}
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </Link>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-foreground hover:bg-surface-muted"
                              onClick={() => {
                                setPreviewRecord(record);
                                setOpenMenuId(null);
                                setMenuPosition(null);
                              }}
                              type="button"
                            >
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-danger hover:bg-surface-muted"
                              onClick={() => handleDelete(record)}
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-center">
              <UsersRound className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-foreground">No saved patient details yet</div>
                <div className="mt-1 text-xs text-muted-foreground">Save patient details from the Patient Details page to show them here.</div>
              </div>
              <Button asChild size="sm">
                <Link href="/patient-details">Add Patient Details</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CenterModal
        description={previewRecord ? getPatientRecordValue(previewRecord, "Patient Name") || previewRecord.id : undefined}
        onOpenChange={(open) => !open && setPreviewRecord(null)}
        open={Boolean(previewRecord)}
        title="Patient Details Preview"
      >
        {previewRecord ? <PatientListPreview record={previewRecord} /> : null}
      </CenterModal>
    </div>
  );
}
