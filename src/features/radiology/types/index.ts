export type RadiologyStatus =
  | "ORDER_CREATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_DONE"
  | "SCHEDULED"
  | "PATIENT_ARRIVED"
  | "PREPARATION_PENDING"
  | "READY_FOR_SCAN"
  | "SCAN_IN_PROGRESS"
  | "SCAN_COMPLETED"
  | "IMAGE_SENT_TO_PACS"
  | "REPORT_PENDING"
  | "REPORT_DRAFTED"
  | "REPORT_VERIFIED"
  | "REPORT_RELEASED"
  | "REPORT_DELIVERED"
  | "CANCELLED";

export type Priority = "ROUTINE" | "URGENT" | "EMERGENCY" | "STAT";

export type Gender = "Male" | "Female" | "Other";

export type PayerType = "Cash" | "TPA" | "Corporate" | "Government Scheme";

export interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  consultant: string;
  department: string;
  location: string;
  payerType: PayerType;
  allergies?: string;
  clinicalNotes?: string;
}

export interface Modality {
  id: string;
  code: string;
  name: string;
  location: string;
  room: string;
  machine: string;
  averageDurationMinutes: number;
  isActive: boolean;
}

export interface RadiologyTest {
  id: string;
  code: string;
  name: string;
  modalityId: string;
  bodyPart: string;
  contrast: boolean;
  durationMinutes: number;
  price: number;
  preparation: string;
  reportingTatMinutes: number;
}

export interface Technician {
  id: string;
  name: string;
  modalities: string[];
  shift: string;
  phone: string;
  status: "Available" | "Busy" | "On Break";
}

export interface Radiologist {
  id: string;
  name: string;
  specialization: string;
  modalities: string[];
  shift: string;
  status: "Available" | "Reporting" | "Off Duty";
}

export interface Schedule {
  id: string;
  orderId: string;
  patientId: string;
  testId: string;
  modalityId: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  technicianId: string;
  status: RadiologyStatus;
}

export interface OrderTimelineEvent {
  status: RadiologyStatus;
  label: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface RadiologyOrder {
  id: string;
  orderNo: string;
  patientId: string;
  testIds: string[];
  modalityId: string;
  priority: Priority;
  status: RadiologyStatus;
  billingStatus: "Pending" | "Paid" | "Corporate Approved" | "Package Covered";
  orderedBy: string;
  clinicalIndication: string;
  provisionalDiagnosis: string;
  createdAt: string;
  scheduledAt?: string;
  location: string;
  assignedTechnicianId?: string;
  assignedRadiologistId?: string;
  timeline: OrderTimelineEvent[];
}

export interface PACSStudy {
  id: string;
  accessionNo: string;
  orderId: string;
  patientId: string;
  modalityId: string;
  studyDescription: string;
  imageCount: number;
  studyDateTime: string;
  pacsStatus: "Queued" | "Images Available" | "Synced" | "Failed";
  viewerUrl: string;
}

export interface RadiologyReport {
  id: string;
  orderId: string;
  patientId: string;
  testId: string;
  radiologistId: string;
  templateName: string;
  findings: string;
  impression: string;
  status: "Draft" | "Pending Verification" | "Verified" | "Released";
  critical: boolean;
  createdAt: string;
  verifiedAt?: string;
  releasedAt?: string;
}

export interface CriticalAlert {
  id: string;
  orderId: string;
  patientId: string;
  severity: "High" | "Critical";
  finding: string;
  notifiedTo: string;
  notifiedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  status: "Open" | "Acknowledged" | "Closed";
}
