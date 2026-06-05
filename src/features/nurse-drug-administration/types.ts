export type NurseDrugCategory = "Scheduled" | "SOS" | "Intermittent" | "Continuous" | "Discontinued" | "Unscheduled";
export type AdministrationCellStatus = "due" | "overdue" | "administered" | "bolus" | "infusion" | "empty";
export type AdministrationAction = "Administered" | "Not administered" | "Late administered";

export type AdministrationCell = {
  time: string;
  label?: string;
  status: AdministrationCellStatus;
};

export type NurseDrugOrder = {
  id: string;
  category: NurseDrugCategory;
  name: string;
  form: string;
  dosage: string;
  frequency: string;
  days: string;
  route: string;
  instructions: string;
  orderedQty: number;
  dispensedQty: number;
  receivedQty: number;
  administeredQty: number;
  discontinuedReason?: string;
  taperedDose?: string;
  bolusDose?: string;
  bagVolume?: number;
  administeredVolume?: number;
  bagCount?: number;
  lastAdministeredAt?: string;
  lastAdministeredBy?: string;
  cells: AdministrationCell[];
};

export type AdministrationDetail = {
  orderId: string;
  orderName: string;
  category: NurseDrugCategory;
  administrationDate: string;
  dosage: string;
  time: string;
  lastAdministeredAt: string;
  lastAdministeredBy: string;
  action: AdministrationAction;
  reason: string;
  counterChecked: boolean;
  counterCheckedBy: string;
  counterCheckedAt: string;
};

export type FluidAdministrationDetail = {
  orderId: string;
  orderName: string;
  category: NurseDrugCategory;
  administrationDate: string;
  rate: string;
  time: string;
  lastAdministeredAt: string;
  lastAdministeredBy: string;
  counterCheckedBy: string;
  counterCheckedAt: string;
  counterChecked: boolean;
  bagVolume: string;
  volumeAdministered: string;
  volumeRemaining: string;
  newBag: boolean;
  bagCount: string;
  bolusDose: string;
  stopAdministrationAt: string;
  reason: string;
};
