"use client";

export type PatientHistoryRecordField = {
  label: string;
  value: string;
};

export type PatientHistoryRecordSection = {
  tabId: string;
  tabLabel: string;
  fields: PatientHistoryRecordField[];
};

export type PatientHistoryRecord = {
  id: string;
  updatedAt: string;
  sections: PatientHistoryRecordSection[];
};

const patientHistoryRecordsKey = "plasmit-patient-history-records";

function isBrowser() {
  return typeof window !== "undefined";
}

function getFieldLabel(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const fieldGroup = field.closest("[data-history-field-group]");
  const fieldGroupLabel = fieldGroup
    ?.querySelector("[data-history-field-label]")
    ?.textContent?.trim();
  if (fieldGroupLabel) return fieldGroupLabel;

  const wrappingLabel = field.closest("label");
  const directLabel = wrappingLabel?.querySelector("span")?.textContent?.trim();
  return (
    directLabel ||
    wrappingLabel?.textContent?.trim() ||
    field.getAttribute("aria-label") ||
    field.name ||
    "Field"
  );
}

function getFieldValue(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (field instanceof HTMLInputElement) {
    if (field.type === "radio" || field.type === "checkbox") {
      return field.checked ? (field.closest("label")?.textContent?.trim() ?? field.value) : "";
    }
    if (field.type === "file") return field.files?.[0]?.name ?? "";
  }
  return field.value.trim();
}

function setFieldValue(
  field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string,
) {
  if (field instanceof HTMLInputElement && field.type === "radio") {
    field.checked = (field.closest("label")?.textContent?.trim() ?? field.value) === value;
    return;
  }
  if (field instanceof HTMLInputElement && field.type === "checkbox") {
    field.checked = value
      .split(", ")
      .includes(field.closest("label")?.textContent?.trim() ?? field.value);
    return;
  }
  if (field instanceof HTMLInputElement && field.type === "file") return;
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

export function readPatientHistoryRecords() {
  if (!isBrowser()) return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(patientHistoryRecordsKey) ?? "[]");
    return Array.isArray(records) ? (records as PatientHistoryRecord[]) : [];
  } catch {
    return [];
  }
}

export function writePatientHistoryRecords(records: PatientHistoryRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(patientHistoryRecordsKey, JSON.stringify(records));
}

export function findPatientHistoryRecord(id: string) {
  return readPatientHistoryRecords().find((record) => record.id === id) ?? null;
}

export function upsertPatientHistoryRecordSection(
  recordId: string | null,
  section: PatientHistoryRecordSection,
) {
  const records = readPatientHistoryRecords();
  const id = recordId || `history-${Date.now()}`;
  const existingRecord = records.find((record) => record.id === id);
  const updatedAt = new Date().toISOString();

  if (!existingRecord) {
    const nextRecord: PatientHistoryRecord = { id, updatedAt, sections: [section] };
    writePatientHistoryRecords([nextRecord, ...records]);
    return nextRecord;
  }

  const nextRecord: PatientHistoryRecord = {
    ...existingRecord,
    updatedAt,
    sections: [section, ...existingRecord.sections.filter((item) => item.tabId !== section.tabId)],
  };
  writePatientHistoryRecords(records.map((record) => (record.id === id ? nextRecord : record)));
  return nextRecord;
}

export function collectPatientHistorySection(
  form: HTMLFormElement,
  tabId: string,
  tabLabel: string,
): PatientHistoryRecordSection {
  const tabPanel = form.querySelector<HTMLElement>(`[data-history-tab="${tabId}"]`);
  if (!tabPanel) return { tabId, tabLabel, fields: [] };

  const fields = Array.from(
    tabPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ),
  );
  const entries: PatientHistoryRecordField[] = [];
  const seenRadioGroups = new Set<string>();
  const checkboxGroups = new Map<string, string[]>();

  fields.forEach((field) => {
    if (field.type === "hidden" || field.disabled) return;
    if (field instanceof HTMLInputElement && field.type === "radio") {
      if (seenRadioGroups.has(field.name)) return;
      seenRadioGroups.add(field.name);
      const checked = fields.find(
        (item) =>
          item instanceof HTMLInputElement &&
          item.type === "radio" &&
          item.name === field.name &&
          item.checked,
      );
      if (!checked) return;
      entries.push({ label: getFieldLabel(field), value: getFieldValue(checked) });
      return;
    }

    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      if (!field.checked) return;
      const label = getFieldLabel(field);
      checkboxGroups.set(label, [...(checkboxGroups.get(label) ?? []), getFieldValue(field)]);
      return;
    }

    const value = getFieldValue(field);
    if (!value || value === "Select" || value.startsWith("Select ")) return;
    entries.push({ label: getFieldLabel(field), value });
  });

  checkboxGroups.forEach((value, label) => entries.push({ label, value: value.join(", ") }));

  return { tabId, tabLabel, fields: entries };
}

export function applyPatientHistorySection(
  form: HTMLFormElement,
  section: PatientHistoryRecordSection,
) {
  const tabPanel = form.querySelector<HTMLElement>(`[data-history-tab="${section.tabId}"]`);
  if (!tabPanel) return;

  const fields = Array.from(
    tabPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    ),
  );
  const usedLabels = new Map<string, number>();

  fields.forEach((field) => {
    if (field.type === "hidden" || field.disabled) return;
    const label = getFieldLabel(field);
    const labelIndex =
      field instanceof HTMLInputElement && (field.type === "radio" || field.type === "checkbox")
        ? 0
        : (usedLabels.get(label) ?? 0);
    const matchingFields = section.fields.filter((item) => item.label === label);
    const recordField = matchingFields[labelIndex];
    if (!recordField) return;

    if (
      !(field instanceof HTMLInputElement) ||
      (field.type !== "radio" && field.type !== "checkbox")
    ) {
      usedLabels.set(label, labelIndex + 1);
    }
    setFieldValue(field, recordField.value);
  });
}

export function getPatientHistoryRecordValue(record: PatientHistoryRecord, label: string) {
  for (const section of record.sections) {
    const field = section.fields.find((item) => item.label === label);
    if (field?.value) return field.value;
  }
  return "";
}
