"use client";

import * as React from "react";

import { defaultPoctResults, poctStorageKey, type PoctResult } from "@/features/clinical/poct/poct-data";

function normalizePoctNotes(results: PoctResult[]) {
  return results.map((result) => {
    if (typeof result.notes === "string" && result.notes.trim()) return result;

    const defaultResult = defaultPoctResults.find((item) => item.id === result.id)
      ?? defaultPoctResults.find((item) =>
        item.patientId === result.patientId
        && item.date === result.date
        && item.time === result.time
        && item.testName === result.testName,
      );

    return { ...result, notes: defaultResult?.notes ?? "" };
  });
}

function syncStoredPoctNotes() {
  try {
    const saved = window.localStorage.getItem(poctStorageKey);
    if (!saved) return;

    const parsed = JSON.parse(saved) as PoctResult[];
    const normalized = normalizePoctNotes(parsed);
    const changed = normalized.some((result, index) => result.notes !== parsed[index]?.notes);

    if (changed) window.localStorage.setItem(poctStorageKey, JSON.stringify(normalized));
  } catch {
    window.localStorage.removeItem(poctStorageKey);
  }
}

export function PoctResultsNotesLayout({ children }: { children: React.ReactNode }) {
  React.useMemo(() => {
    if (typeof window !== "undefined") syncStoredPoctNotes();
  }, []);

  return <>{children}</>;
}
