export type PathologyPriority = "Routine" | "Urgent" | "STAT" | "ASAP";

export type PathologyTest = {
  id: string;
  name: string;
  description: string;
  code?: string;
  children?: string[];
};

export type PathologyGroupedTest = {
  id: string;
  name: string;
  selected?: boolean;
};

export type PathologyResultRow = {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: "N" | "H" | "L";
};

export type PathologyResultBlock = {
  id: string;
  name: string;
  specialty: string;
  rows: PathologyResultRow[];
};

export type PathologySummaryRow = {
  id: string;
  name: string;
  loinc: string;
  cpt: string;
  specialty: string;
  specimen: string;
  priority: PathologyPriority;
  status: "Ordered" | "Sample Collected" | "Received" | "Processing" | "Verified" | "Released" | "Cancelled";
  orderedBy: string;
  orderDateTime: string;
};

export type PathologyOrderHistory = {
  id: string;
  label: string;
  selectedTestIds: string[];
  selectedGroupIds: string[];
};
