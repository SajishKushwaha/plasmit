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
const deletedReceptionistSeedDraftsKey = "plasmit-receptionist-deleted-seed-drafts";
const receptionistSeedDrafts: PatientRecord[] = [
  {
    id: "receptionist-draft-aisha-khan",
    updatedAt: "2026-07-22T08:30:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-94346597930" },
          { label: "Registration Date", value: "22/07/2026" },
          { label: "First Name", value: "Aisha" },
          { label: "Last Name", value: "Khan" },
          { label: "Date of Birth", value: "30/12/1995" },
          { label: "Age", value: "30" },
          { label: "Gender", value: "Female" },
          { label: "Marital Status", value: "Married" },
          { label: "Nationality", value: "Indian" },
          { label: "Preferred Language", value: "Hindi" },
          { label: "Permanent Address", value: "Flat 402, Green Park, New Delhi" },
          { label: "City", value: "New Delhi" },
          { label: "State", value: "Delhi" },
          { label: "PIN Code", value: "110016" },
          { label: "Current Address", value: "Flat 402, Green Park, New Delhi" },
          { label: "Same as permanent", value: "Yes" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9876543210" },
          { label: "Identification Type", value: "Aadhaar Card" },
          { label: "Aadhaar Card Number", value: "123412341234" },
          { label: "Contact Name", value: "Imran Khan" },
          { label: "Relationship to Patient", value: "Spouse" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9876501234" },
          { label: "Identification Type", value: "Aadhaar Card" },
          { label: "Identity Document Number", value: "432143214321" },
          { label: "ER Nurse Assigned", value: "Nurse Priya" },
          { label: "Duty Doctor", value: "Dr. Mehta" },
        ],
      },
    ],
  },
  {
    id: "receptionist-draft-ravi-menon",
    updatedAt: "2026-07-22T09:10:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-82944" },
          { label: "Registration Date", value: "22/07/2026" },
          { label: "First Name", value: "Ravi" },
          { label: "Last Name", value: "Menon" },
          { label: "Date of Birth", value: "12/04/1986" },
          { label: "Age", value: "40" },
          { label: "Gender", value: "Male" },
          { label: "Nationality", value: "Indian" },
          { label: "Permanent Address", value: "12 Lake View Road, Kochi" },
          { label: "Current Address", value: "BLK Max Hospital guest desk, Delhi" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9123456780" },
          { label: "Identification Type", value: "PAN" },
          { label: "PAN", value: "ABCDE1234F" },
          { label: "Contact Name", value: "Leela Menon" },
          { label: "Relationship to Patient", value: "Mother" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9988776655" },
          { label: "Identification Type", value: "PAN" },
          { label: "Identity Document Number", value: "LMNOP9876G" },
          { label: "Duty Doctor", value: "Dr. Rao" },
        ],
      },
    ],
  },
  {
    id: "receptionist-demo-meera-sharma",
    updatedAt: "2026-07-22T09:25:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-53109" },
          { label: "Registration Date", value: "22/07/2026" },
          { label: "First Name", value: "Meera" },
          { label: "Last Name", value: "Sharma" },
          { label: "Gender", value: "Female" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9811122233" },
          { label: "Contact Name", value: "Rohit Sharma" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9811100002" },
          { label: "Duty Doctor", value: "Dr. Kapoor" },
        ],
      },
    ],
  },
  {
    id: "receptionist-demo-kabir-ali",
    updatedAt: "2026-07-21T10:10:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-65018" },
          { label: "Registration Date", value: "21/07/2026" },
          { label: "First Name", value: "Kabir" },
          { label: "Last Name", value: "Ali" },
          { label: "Gender", value: "Male" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9555567812" },
          { label: "Contact Name", value: "Sana Ali" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9555567800" },
          { label: "Duty Doctor", value: "Dr. Iyer" },
        ],
      },
    ],
  },
  {
    id: "receptionist-demo-priya-nair",
    updatedAt: "2026-07-21T11:40:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-72041" },
          { label: "Registration Date", value: "21/07/2026" },
          { label: "First Name", value: "Priya" },
          { label: "Last Name", value: "Nair" },
          { label: "Gender", value: "Female" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9700012345" },
          { label: "Contact Name", value: "Vikram Nair" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9700098765" },
          { label: "Duty Doctor", value: "Dr. Sen" },
        ],
      },
    ],
  },
  {
    id: "receptionist-demo-arjun-patel",
    updatedAt: "2026-07-20T13:05:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-17011" },
          { label: "Registration Date", value: "20/07/2026" },
          { label: "First Name", value: "Arjun" },
          { label: "Last Name", value: "Patel" },
          { label: "Gender", value: "Male" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9898981212" },
          { label: "Contact Name", value: "Kavita Patel" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9898983434" },
          { label: "Duty Doctor", value: "Dr. Gupta" },
        ],
      },
    ],
  },
  {
    id: "receptionist-demo-neha-verma",
    updatedAt: "2026-07-20T15:45:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-44562" },
          { label: "Registration Date", value: "20/07/2026" },
          { label: "First Name", value: "Neha" },
          { label: "Last Name", value: "Verma" },
          { label: "Gender", value: "Female" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9000011122" },
          { label: "Contact Name", value: "Anil Verma" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9000022233" },
          { label: "Duty Doctor", value: "Dr. Rao" },
        ],
      },
    ],
  },
  {
    id: "receptionist-demo-sohan-gupta",
    updatedAt: "2026-07-19T09:30:00.000Z",
    sections: [
      {
        tabId: "basic",
        tabLabel: "Basic Demographic",
        fields: [
          { label: "Patient ID / UHID", value: "UHID-88420" },
          { label: "Registration Date", value: "19/07/2026" },
          { label: "First Name", value: "Sohan" },
          { label: "Last Name", value: "Gupta" },
          { label: "Gender", value: "Male" },
          { label: "Mobile Country Code", value: "+91" },
          { label: "Mobile Number", value: "9112233445" },
          { label: "Contact Name", value: "Pooja Gupta" },
          { label: "Contact Country Code", value: "+91" },
          { label: "Contact Number", value: "9112200001" },
          { label: "Duty Doctor", value: "Dr. Mehta" },
        ],
      },
    ],
  },
];

function isBrowser() {
  return typeof window !== "undefined";
}

function readDeletedSeedDraftIds() {
  if (!isBrowser()) return new Set<string>();
  try {
    const ids = JSON.parse(window.localStorage.getItem(deletedReceptionistSeedDraftsKey) ?? "[]");
    return new Set(Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function writeDeletedSeedDraftIds(ids: Set<string>) {
  if (!isBrowser()) return;
  window.localStorage.setItem(deletedReceptionistSeedDraftsKey, JSON.stringify(Array.from(ids)));
}

export function readPatientRecords() {
  if (!isBrowser()) return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(receptionistPatientRecordsKey) ?? "[]");
    const deletedSeedDraftIds = readDeletedSeedDraftIds();
    const visibleSeedDrafts = receptionistSeedDrafts.filter((record) => !deletedSeedDraftIds.has(record.id));
    if (!Array.isArray(records)) return visibleSeedDrafts;
    const savedRecords = records as PatientRecord[];
    const savedIds = new Set(savedRecords.map((record) => record.id));
    return [...savedRecords, ...visibleSeedDrafts.filter((record) => !savedIds.has(record.id))];
  } catch {
    const deletedSeedDraftIds = readDeletedSeedDraftIds();
    return receptionistSeedDrafts.filter((record) => !deletedSeedDraftIds.has(record.id));
  }
}

export function writePatientRecords(records: PatientRecord[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(receptionistPatientRecordsKey, JSON.stringify(records));
}

export function findPatientRecord(id: string) {
  return readPatientRecords().find((record) => record.id === id) ?? null;
}

export function deletePatientRecord(id: string) {
  const seedDraftIds = new Set(receptionistSeedDrafts.map((record) => record.id));
  if (seedDraftIds.has(id)) {
    const deletedSeedDraftIds = readDeletedSeedDraftIds();
    deletedSeedDraftIds.add(id);
    writeDeletedSeedDraftIds(deletedSeedDraftIds);
  }
  writePatientRecords(readPatientRecords().filter((record) => record.id !== id));
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
