export type PoctStatus = "Completed" | "Verified" | "Pending";

export type PoctTest = {
  id: string;
  name: string;
  unit: string;
  labMasterCode: string;
  equipment: string;
};

export type PoctResult = {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  testName: string;
  result: string;
  unit: string;
  performedBy: string;
  verifiedBy: string;
  status: PoctStatus;
  notes: string;
};

export const poctPatients = [
  { id: "100123", name: "Rahul Sharma" },
  { id: "100124", name: "Meera Joshi" },
  { id: "100125", name: "Arvind Nair" },
];

export const poctUsers = ["Nurse John", "Nurse Asha", "Nurse Neha", "Dr. Smith", "Dr. Rohan Mehta"];

export const poctTests: PoctTest[] = [
  { id: "blood-glucose", name: "Blood Glucose", unit: "mg/dL", labMasterCode: "LAB-POCT-001", equipment: "Glucometer" },
 
 
  { id: "blood-gas", name: "Blood gas and electrolytes analysis", unit: "value", labMasterCode: "LAB-POCT-004", equipment: "Blood gas analyzer" },
  { id: "act", name: "Activated clotting time", unit: "sec", labMasterCode: "LAB-POCT-005", equipment: "ACT analyzer" },
  
  { id: "hemoglobin", name: "Hemoglobin/Hematocrit", unit: "g/dL", labMasterCode: "LAB-POCT-007", equipment: "Hemoglobin analyzer" },
  { id: "cardiac-markers", name: "Rapid cardiac markers diagnosis", unit: "ng/mL", labMasterCode: "LAB-POCT-008", equipment: "Rapid cardiac marker reader" },
  { id: "urine-strips", name: "Urine strips (Dipstick)", unit: "value", labMasterCode: "LAB-POCT-009", equipment: "Urine strip reader" },
  { id: "hcg", name: "Pregnancy test (HCG)", unit: "result", labMasterCode: "LAB-POCT-010", equipment: "Rapid HCG kit" },
  { id: "fecal-occult", name: "Fecal occult blood analysis", unit: "result", labMasterCode: "LAB-POCT-011", equipment: "FOBT rapid kit" },
  { id: "rapid-hiv", name: "Rapid HIV", unit: "result", labMasterCode: "LAB-POCT-012", equipment: "Rapid HIV kit" },
  { id: "tsh", name: "Thyroid stimulating hormone (TSH)", unit: "mIU/L", labMasterCode: "LAB-POCT-013", equipment: "TSH rapid analyzer" },
  { id: "creatinine", name: "Creatinine", unit: "mg/dL", labMasterCode: "LAB-POCT-014", equipment: "Creatinine analyzer" },
  { id: "pt-inr", name: "Prothrombin time/International normalized ratio (PT/INR)", unit: "ratio", labMasterCode: "LAB-POCT-015", equipment: "Coagulation analyzer" },
];

export const defaultPoctResults: PoctResult[] = [
  {
    id: "poct-001",
    patientId: "100123",
    patientName: "Rahul Sharma",
    date: "2025-05-26",
    time: "08:30 AM",
    testName: "Blood Glucose",
    result: "120",
    unit: "mg/dL",
    performedBy: "Nurse John",
    verifiedBy: "Dr. Smith",
    status: "Completed",
    notes: "Fasting sample",
  },
  {
    id: "poct-002",
    patientId: "100123",
    patientName: "Rahul Sharma",
    date: "2025-05-26",
    time: "08:30 AM",
    testName: "SpO2",
    result: "98",
    unit: "%",
    performedBy: "Nurse John",
    verifiedBy: "Dr. Smith",
    status: "Completed",
    notes: "Room air",
  },
  {
    id: "poct-003",
    patientId: "100123",
    patientName: "Rahul Sharma",
    date: "2025-05-26",
    time: "08:30 AM",
    testName: "Blood Pressure",
    result: "120 / 80",
    unit: "mmHg",
    performedBy: "Nurse John",
    verifiedBy: "Dr. Smith",
    status: "Completed",
    notes: "Left arm",
  },
  {
    id: "poct-004",
    patientId: "100123",
    patientName: "Rahul Sharma",
    date: "2025-05-26",
    time: "10:30 AM",
    testName: "Blood Glucose",
    result: "135",
    unit: "mg/dL",
    performedBy: "Nurse John",
    verifiedBy: "Dr. Smith",
    status: "Completed",
    notes: "Post breakfast",
  },
  {
    id: "poct-005",
    patientId: "100123",
    patientName: "Rahul Sharma",
    date: "2025-05-26",
    time: "12:30 PM",
    testName: "Blood Glucose",
    result: "110",
    unit: "mg/dL",
    performedBy: "Nurse John",
    verifiedBy: "Dr. Smith",
    status: "Verified",
    notes: "Before lunch",
  },
];

export const poctStorageKey = "plasmit-poct-results-v1";
export const poctSelectedTestsStorageKey = "plasmit-poct-selected-tests-v1";

export function readPoctResults() {
  if (typeof window === "undefined") return defaultPoctResults;
  try {
    const saved = window.localStorage.getItem(poctStorageKey);
    return saved ? (JSON.parse(saved) as PoctResult[]) : defaultPoctResults;
  } catch {
    return defaultPoctResults;
  }
}

export function writePoctResults(results: PoctResult[]) {
  window.localStorage.setItem(poctStorageKey, JSON.stringify(results));
}

export function readSelectedPoctTests() {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(poctSelectedTestsStorageKey);
    const parsed = saved ? (JSON.parse(saved) as string[]) : [];
    return parsed.filter((id) => poctTests.some((test) => test.id === id));
  } catch {
    return [];
  }
}

export function writeSelectedPoctTests(testIds: string[]) {
  window.localStorage.setItem(poctSelectedTestsStorageKey, JSON.stringify(testIds));
  window.dispatchEvent(new Event("plasmit-poct-selected-tests-change"));
}
