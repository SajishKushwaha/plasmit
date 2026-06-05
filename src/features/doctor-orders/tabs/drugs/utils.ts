import { frequencyMultiplier } from "./data";
import type { DraftCategory, DrugCategory, DrugOrder, OrderDraft } from "./types";

export function categoryTone(category: DrugCategory) {
  if (category === "Scheduled") return "info";
  if (category === "SOS") return "warning";
  if (category === "Continuous") return "success";
  if (category === "Discontinued") return "danger";
  return "muted";
}

export function remainingQty(order: DrugOrder) {
  return Math.max(order.receivedQty - order.administeredQty, 0);
}

export function calculateAutoQty(category: DraftCategory, frequency: string, days: string) {
  if (!category) return 0;
  if (category === "Unscheduled") return 1;
  if (category === "Discontinued") return 0;
  const parsedDays = Number(days);
  const multiplier = frequencyMultiplier[frequency] ?? 1;
  if (!Number.isFinite(parsedDays) || parsedDays <= 0) return 0;
  return Math.max(Math.ceil(multiplier * parsedDays), 1);
}

export function makeDraft(order: DrugOrder): OrderDraft {
  return {
    name: order.name,
    form: order.form,
    dosage: "",
    maxDosage: "",
    frequency: "",
    days: "",
    startDate: "",
    endDate: "",
    instructions: "",
    category: "",
    orderedQty: "",
    route: "",
    doseUnit: "",
    taperDoses: [],
  };
}
