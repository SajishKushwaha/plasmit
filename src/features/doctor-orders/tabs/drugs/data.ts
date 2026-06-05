import type { DoseUnit, DrugCategory, DrugOrder } from "./types";

export const orderCategories: DrugCategory[] = ["Scheduled", "SOS", "Intermittent", "Continuous", "Discontinued", "Unscheduled"];
export const forms = ["Tablet", "Capsule", "Syrup", "Injection", "IV Fluid", "Cream", "Drops"];
export const frequencies = ["OD", "BD", "TDS", "QID", "6 hrly", "8 hrly", "Continuous", "Intermittent"];
export const routes = ["Oral", "IV", "IM", "SC", "Topical", "Inhalation", "Nebulization", "Eye", "Ear"];
export const doseUnits: DoseUnit[] = ["mg", "mcg", "g", "ml", "units", "drops", "puffs"];

export const frequencyMultiplier: Record<string, number> = {
  OD: 1,
  BD: 2,
  TDS: 3,
  QID: 4,
  "6 hrly": 4,
  "8 hrly": 3,
  Continuous: 1,
  Intermittent: 1,
};

export const initialOrders: DrugOrder[] = [
  { id: "drug-001", category: "Scheduled", name: "Aspirin", form: "Tablet", dosage: "75mg", maxDosage: "", frequency: "OD", days: "30", startDate: "2026-05-25", endDate: "", instructions: "After food.", orderedQty: 30, dispensedQty: 30, receivedQty: 0, administeredQty: 0 },
  { id: "drug-002", category: "Scheduled", name: "Atorvastatin", form: "Tablet", dosage: "20mg", maxDosage: "", frequency: "OD", days: "30", startDate: "2026-05-25", endDate: "", instructions: "At bedtime.", orderedQty: 30, dispensedQty: 12, receivedQty: 0, administeredQty: 0 },
  { id: "drug-003", category: "SOS", name: "Paracetamol", form: "Tablet", dosage: "650mg", maxDosage: "3 tablets/day", frequency: "SOS", days: "3", startDate: "", endDate: "", instructions: "For fever or pain.", orderedQty: 6, dispensedQty: 6, receivedQty: 0, administeredQty: 0 },
  { id: "drug-004", category: "Intermittent", name: "Salbutamol", form: "Drops", dosage: "2 puffs", maxDosage: "", frequency: "8 hrly", days: "5", startDate: "2026-05-25", endDate: "", instructions: "Use with spacer.", orderedQty: 2, dispensedQty: 1, receivedQty: 1, administeredQty: 0 },
  { id: "drug-005", category: "Continuous", name: "Normal Saline", form: "IV Fluid", dosage: "100ml/hr", maxDosage: "", frequency: "Continuous", days: "1", startDate: "2026-05-25", endDate: "", instructions: "Monitor intake output.", orderedQty: 3, dispensedQty: 2, receivedQty: 2, administeredQty: 1 },
  { id: "drug-006", category: "Discontinued", name: "Ibuprofen", form: "Tablet", dosage: "400mg", maxDosage: "", frequency: "BD", days: "0", startDate: "2026-05-20", endDate: "2026-05-22", instructions: "Stopped due gastritis.", orderedQty: 10, dispensedQty: 10, receivedQty: 10, administeredQty: 2, discontinuedReason: "Gastritis", isHistorical: true },
  { id: "drug-007", category: "Unscheduled", name: "Calamine", form: "Cream", dosage: "Thin layer", maxDosage: "", frequency: "", days: "", startDate: "", endDate: "", instructions: "Apply locally if itching.", orderedQty: 1, dispensedQty: 0, receivedQty: 0, administeredQty: 0 },
];
