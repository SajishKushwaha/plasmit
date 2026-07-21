"use client";

import {
  applyPatientSection,
  collectPatientSection,
  getPatientRecordValue,
  type PatientRecord,
  type PatientRecordSection,
} from "@/features/patient-list/patient-records";

export {
  applyPatientSection,
  collectPatientSection,
  getPatientRecordValue,
  type PatientRecord,
  type PatientRecordSection,
};

const receptionistPatientRecordsKey = "plasmit-receptionist-patient-records";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readPatientRecords() {
  if (!isBrowser()) return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(receptionistPatientRecordsKey) ?? "[]");
    return Array.isArray(records) ? (records as PatientRecord[]) : [];
  } catch {
    return [];
  }
}

export function writePatientRecords(records: PatientRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(receptionistPatientRecordsKey, JSON.stringify(records));
}

export function findPatientRecord(id: string) {
  return readPatientRecords().find((record) => record.id === id) ?? null;
}

export function upsertPatientRecordSection(recordId: string | null, section: PatientRecordSection) {
  const records = readPatientRecords();
  const id = recordId || `receptionist-patient-${Date.now()}`;
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
