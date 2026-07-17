export type ResultDepartment = "laboratory" | "radiology" | "poct";

export type ResultStatus =
  "Sample Collected" | "Processing" | "Verification Pending" | "Completed" | "Critical";

export type ResultPriority = "Routine" | "Urgent" | "Emergency";

export type ResultValue = {
  name: string;
  value: string;
  unit?: string;
  range?: string;
  flag?: "Low" | "Normal" | "High" | "Critical";
};

export type ResultTimelineEvent = {
  label: string;
  at: string;
  by: string;
};

export type ResultRecord = {
  id: string;
  patientName: string;
  mrn: string;
  ageSex: string;
  visitType: "OPD" | "IPD" | "Emergency";
  orderingDoctor: string;
  department: ResultDepartment;
  testName: string;
  orderedAt: string;
  collectedAt?: string;
  completedAt?: string;
  status: ResultStatus;
  priority: ResultPriority;
  reportAvailable: boolean;
  imageAvailable: boolean;
  resultSummary: string;
  location: string;
  accessionNo?: string;
  specimen?: string;
  values: ResultValue[];
  timeline: ResultTimelineEvent[];
};
