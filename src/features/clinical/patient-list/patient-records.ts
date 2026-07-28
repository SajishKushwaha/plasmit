"use client";

export type PatientRecordField = {
  label: string;
  value: string;
};

export type PatientRecordSection = {
  tabId: string;
  tabLabel: string;
  fields: PatientRecordField[];
};

export type PatientRecord = {
  id: string;
  updatedAt: string;
  sections: PatientRecordSection[];
};

const patientRecordsKey = "plasmit-patient-records";

function isBrowser() {
  return typeof window !== "undefined";
}

function getFieldLabel(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  const fieldGroup = field.closest("[data-patient-field-group]");
  const fieldGroupLabel = fieldGroup?.querySelector("[data-patient-field-label]")?.textContent?.trim();
  if (fieldGroupLabel) return fieldGroupLabel;

  const wrappingLabel = field.closest("label");
  const directLabel = wrappingLabel?.querySelector("span")?.textContent?.trim();
  return directLabel || field.getAttribute("aria-label") || field.name || "Field";
}

function getFieldValue(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) {
  if (field instanceof HTMLInputElement) {
    if (field.type === "radio") {
      return field.checked ? field.closest("label")?.textContent?.trim() ?? field.value : "";
    }
    if (field.type === "checkbox") {
      return field.checked ? field.closest("label")?.textContent?.trim() ?? field.value : "";
    }
    if (field.type === "file") return field.files?.[0]?.name ?? "";
  }
  return field.value.trim();
}

function setFieldValue(field: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  if (field instanceof HTMLInputElement && field.type === "radio") {
    field.checked = (field.closest("label")?.textContent?.trim() ?? field.value) === value;
    return;
  }
  if (field instanceof HTMLInputElement && field.type === "file") return;
  field.value = value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

export function readPatientRecords() {
  if (!isBrowser()) return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(patientRecordsKey) ?? "[]");
    return Array.isArray(records) ? (records as PatientRecord[]) : [];
  } catch {
    return [];
  }
}

export function writePatientRecords(records: PatientRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(patientRecordsKey, JSON.stringify(records));
}

export function findPatientRecord(id: string) {
  return readPatientRecords().find((record) => record.id === id) ?? null;
}

export function upsertPatientRecordSection(recordId: string | null, section: PatientRecordSection) {
  const records = readPatientRecords();
  const id = recordId || `patient-${Date.now()}`;
  const existingRecord = records.find((record) => record.id === id);
  const updatedAt = new Date().toISOString();

  if (!existingRecord) {
    const nextRecord: PatientRecord = { id, updatedAt, sections: [section] };
    writePatientRecords([nextRecord, ...records]);
    return nextRecord;
  }

  const nextRecord: PatientRecord = {
    ...existingRecord,
    updatedAt,
    sections: [section, ...existingRecord.sections.filter((item) => item.tabId !== section.tabId)],
  };
  writePatientRecords(records.map((record) => (record.id === id ? nextRecord : record)));
  return nextRecord;
}

export function collectPatientSection(form: HTMLFormElement, tabId: string, tabLabel: string): PatientRecordSection {
  const tabPanel = form.querySelector<HTMLElement>(`[data-patient-tab="${tabId}"]`);
  if (!tabPanel) return { tabId, tabLabel, fields: [] };

  const fields = Array.from(tabPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
  const entries: PatientRecordField[] = [];
  const seenRadioGroups = new Set<string>();

  fields.forEach((field) => {
    if (field.type === "hidden" || field.disabled) return;
    if (field instanceof HTMLInputElement && field.type === "radio") {
      if (seenRadioGroups.has(field.name)) return;
      seenRadioGroups.add(field.name);
      const checked = fields.find((item) => item instanceof HTMLInputElement && item.type === "radio" && item.name === field.name && item.checked);
      if (!checked) return;
      entries.push({ label: getFieldLabel(field), value: getFieldValue(checked) });
      return;
    }

    const value = getFieldValue(field);
    if (!value || value === "Select" || value === "Select Department") return;
    entries.push({ label: getFieldLabel(field), value });
  });

  return { tabId, tabLabel, fields: entries };
}

export function applyPatientSection(form: HTMLFormElement, section: PatientRecordSection) {
  const tabPanel = form.querySelector<HTMLElement>(`[data-patient-tab="${section.tabId}"]`);
  if (!tabPanel) return;

  const fields = Array.from(tabPanel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
  const usedLabels = new Map<string, number>();

  fields.forEach((field) => {
    if (field.type === "hidden" || field.disabled) return;
    const label = getFieldLabel(field);
    const labelIndex = usedLabels.get(label) ?? 0;
    const matchingFields = section.fields.filter((item) => item.label === label);
    const recordField = matchingFields[labelIndex];
    if (!recordField) return;

    if (!(field instanceof HTMLInputElement) || field.type !== "radio") {
      usedLabels.set(label, labelIndex + 1);
    }
    setFieldValue(field, recordField.value);
  });
}

export function getPatientRecordValue(record: PatientRecord, label: string) {
  for (const section of record.sections) {
    const field = section.fields.find((item) => item.label === label);
    if (field?.value) return field.value;
  }
  return "";
}
