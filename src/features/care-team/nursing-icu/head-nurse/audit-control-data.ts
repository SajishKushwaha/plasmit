export type AuditSeverity = "Critical" | "High" | "Medium" | "Low";
export type AuditStatus = "Pending Review" | "Action Pending" | "Escalated" | "Closed";

export type CriticalDelayRecord = {
  id: string;
  patient: string;
  patientId: string;
  bed: string;
  unit: string;
  nurse: string;
  activity: string;
  dueTime: string;
  completionTime: string;
  delayMinutes: number;
  severity: AuditSeverity;
  status: AuditStatus;
};

export type QualityRecord = {
  id: string;
  patient: string;
  patientId: string;
  bed: string;
  auditArea: string;
  qualityGap: string;
  nurse: string;
  severity: AuditSeverity;
  correctiveAction: string;
  status: AuditStatus;
};

export const criticalDelayRecords: CriticalDelayRecord[] = [
  { id: "delay-1", patient: "Aman Khan", patientId: "ICU-P001", bed: "ICU/B-09", unit: "Cardiothoracic ICU", nurse: "Nurse Priya", activity: "Urgent doctor order", dueTime: "09:30", completionTime: "--", delayMinutes: 65, severity: "Critical", status: "Pending Review" },
  { id: "delay-2", patient: "Raj Kumar", patientId: "ICU-P002", bed: "ICU/B-12", unit: "Medical ICU", nurse: "Reena", activity: "Medication administration", dueTime: "10:00", completionTime: "--", delayMinutes: 35, severity: "High", status: "Escalated" },
  { id: "delay-3", patient: "Sara Ali", patientId: "ICU-P003", bed: "ICU/B-03", unit: "General ICU", nurse: "Kavita", activity: "Vitals recording", dueTime: "10:15", completionTime: "--", delayMinutes: 20, severity: "High", status: "Action Pending" },
  { id: "delay-4", patient: "Meera Das", patientId: "ICU-P004", bed: "ICU/B-05", unit: "Neuro ICU", nurse: "Zoya", activity: "Device site review", dueTime: "11:00", completionTime: "11:18", delayMinutes: 18, severity: "Medium", status: "Closed" },
];

export const qualityRecords: QualityRecord[] = [
  { id: "quality-1", patient: "Meera Das", patientId: "ICU-P004", bed: "ICU/B-05", auditArea: "Assessment", qualityGap: "Fall risk not recorded", nurse: "Nurse D", severity: "Medium", correctiveAction: "Complete fall-risk assessment", status: "Action Pending" },
  { id: "quality-2", patient: "Raj Kumar", patientId: "ICU-P002", bed: "ICU/B-12", auditArea: "Medication", qualityGap: "High-alert double check missing", nurse: "Nurse A", severity: "High", correctiveAction: "Add second-nurse verification", status: "Escalated" },
  { id: "quality-3", patient: "Sara Ali", patientId: "ICU-P003", bed: "ICU/B-03", auditArea: "Device Care", qualityGap: "IV site review overdue", nurse: "Nurse E", severity: "Medium", correctiveAction: "Review IV site and document finding", status: "Pending Review" },
  { id: "quality-4", patient: "Aman Khan", patientId: "ICU-P001", bed: "ICU/B-09", auditArea: "Nursing Notes", qualityGap: "Shift note incomplete", nurse: "Nurse Priya", severity: "Low", correctiveAction: "Complete and sign shift note", status: "Closed" },
];
