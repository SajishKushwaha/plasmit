export type LaboratoryPriority = "Routine" | "Urgent" | "STAT" | "ASAP";
export type LaboratorySex = "Male" | "Female" | "Other";
export type LaboratoryIndicationType = "Therapeutic" | "Surgery";
export type LaboratoryRequestType = "Routine" | "Emergency";

export type LaboratoryTest = {
  id: string;
  name: string;
  description: string;
  department: string;
  code?: string;
  children?: string[];
};

export type LaboratoryGroupedTest = {
  id: string;
  name: string;
  department: string;
  section?: string;
  notes?: string;
  testIds: string[];
  selected?: boolean;
};

export type LaboratoryPackageBundle = {
  id: string;
  label: string;
  testIds: string[];
  purpose?: string;
};

export type LaboratoryPackageProfile = {
  id: string;
  name: string;
  trigger: string;
  bundles: LaboratoryPackageBundle[];
};

export type LaboratoryResultRow = {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: "N" | "H" | "L";
};

export type LaboratoryResultBlock = {
  id: string;
  name: string;
  specimen:string;
  specialty: string;
  rows: LaboratoryResultRow[];
};

export type LaboratorySummaryRow = {
  id: string;
  name: string;
  loinc: string;
  cpt: string;
  department: string;
  specimen: string;
  priority: LaboratoryPriority;
  status: "Ordered" | "Sample Collected" | "Received" | "Processing" | "Verified" | "Released" | "Cancelled";
  orderedBy: string;
  orderDateTime: string;
};

export type LaboratoryOrderHistory = {
  id: string;
  label: string;
  selectedTestIds: string[];
  selectedGroupIds: string[];
};
