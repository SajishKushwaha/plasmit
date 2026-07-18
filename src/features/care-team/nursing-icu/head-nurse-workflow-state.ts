export type HeadNurseReviewStatus =
  "Waiting Review" | "Reviewed" | "On Hold" | "Verification Failed";
export type HeadNurseAssignmentStatus = "Not Ready" | "Pending Assignment" | "Assigned";
export type HeadNurseCareItem = "Ventilator" | "Oxygen" | "Isolation" | "Monitor" | "Infusion Pump";

export const headNurseHoldReasons = [
  "Patient identity mismatch",
  "Bed not confirmed",
  "Nurse unavailable",
  "Equipment not ready",
  "Consent/document missing",
] as const;

export function isHeadNurseReviewBlocked(admission: HeadNurseAdmission) {
  return admission.reviewStatus === "On Hold" || admission.reviewStatus === "Verification Failed";
}

export function canAssignUnitNurse(admission: HeadNurseAdmission) {
  return admission.reviewStatus === "Reviewed" && admission.assignmentStatus !== "Not Ready";
}

export function canRunHeadNurseAudit(admission: HeadNurseAdmission) {
  return (
    admission.reviewStatus === "Reviewed" &&
    admission.assignmentStatus === "Assigned" &&
    admission.handoverStatus !== "Handover Verified"
  );
}

export function canVerifyHeadNurseHandover(admission: HeadNurseAdmission) {
  return (
    admission.reviewStatus === "Reviewed" &&
    admission.assignmentStatus === "Assigned" &&
    admission.auditStatus === "Audit Complete"
  );
}

export type HeadNurseAdmission = {
  id: string;
  patientId: string;
  uhid: string;
  patientName: string;
  ageGender: string;
  diagnosis: string;
  admittedFrom: string;
  admissionTime: string;
  icuUnit: string;
  bed: string;
  priority: "Critical" | "High" | "Moderate" | "Stable";
  careRequired: HeadNurseCareItem[];
  reviewStatus: HeadNurseReviewStatus;
  reviewStatusReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
  holdReason?: string;
  failedReasons?: string[];
  manualVerification?: {
    patientIdentityVerified: boolean;
    admissionDetailsVerified: boolean;
    icuBedAllocationVerified: boolean;
    careRequirementsReviewed: boolean;
    requiredEquipmentConfirmed: boolean;
    unitNurseAvailabilityConfirmed: boolean;
  };
  auditStatus?: "Pending Audit" | "Under Audit" | "Audit Complete";
  auditFindings?: string[];
  handoverStatus?: "Not Ready" | "Pending Handover" | "Handover Verified";
  handoverBy?: string;
  handoverAt?: string;
  systemChecks?: Array<{ label: string; status: "Passed" | "Warning" | "Failed"; detail?: string }>;
  manualChecks?: Array<{ label: string; checked: boolean }>;
  staffAvailability: string;
  assignmentStatus: HeadNurseAssignmentStatus;
  assignedHeadNurse?: string;
  assignedUnitNurse?: string;
  availableUnitNurses: number;
  availableWardNurses: number;
  nursePatientRatio: string;
  workloadStatus: string;
};
export function normalizeHeadNurseAdmission(admission: HeadNurseAdmission): HeadNurseAdmission {
  const reviewStatus = admission.reviewStatus;
  const allManualChecks = {
    patientIdentityVerified: true,
    admissionDetailsVerified: true,
    icuBedAllocationVerified: true,
    careRequirementsReviewed: true,
    requiredEquipmentConfirmed: true,
    unitNurseAvailabilityConfirmed: true,
  };
  const manualVerification =
    reviewStatus === "Reviewed" || admission.auditStatus === "Audit Complete"
      ? { ...allManualChecks, ...admission.manualVerification }
      : admission.manualVerification;
  const assignmentStatus =
    reviewStatus === "Reviewed"
      ? admission.assignmentStatus === "Assigned"
        ? "Assigned"
        : "Pending Assignment"
      : reviewStatus === "On Hold" || reviewStatus === "Verification Failed"
        ? "Not Ready"
        : admission.assignmentStatus;

  const auditStatus =
    reviewStatus === "Reviewed"
      ? (admission.auditStatus ?? "Pending Audit")
      : reviewStatus === "On Hold"
        ? "Pending Audit"
        : admission.auditStatus;

  const handoverStatus =
    reviewStatus === "Reviewed"
      ? (admission.handoverStatus ?? "Pending Handover")
      : reviewStatus === "On Hold" || reviewStatus === "Verification Failed"
        ? "Not Ready"
        : admission.handoverStatus;

  return {
    ...admission,
    manualVerification,
    assignmentStatus,
    auditStatus,
    handoverStatus,
  };
}
const STORAGE_KEY = "nursing-icu-head-nurse-admissions";

const defaultAdmissions: HeadNurseAdmission[] = [
  {
    id: "admission-001",
    patientId: "ICU001",
    uhid: "UHID-240201",
    patientName: "Aarav Mehta",
    ageGender: "42 / Male",
    diagnosis: "Acute respiratory distress",
    admittedFrom: "ER",
    admissionTime: "2026-07-03 08:20",
    icuUnit: "Medical ICU",
    bed: "MICU-12",
    priority: "Critical",
    careRequired: ["Ventilator", "Monitor"],
    reviewStatus: "Waiting Review",
    staffAvailability: "Available",
    assignmentStatus: "Not Ready",
    auditStatus: "Pending Audit",
    handoverStatus: "Not Ready",
    availableUnitNurses: 3,
    availableWardNurses: 2,
    nursePatientRatio: "1:2",
    workloadStatus: "Balanced",
    systemChecks: [
      { label: "Patient details complete", status: "Passed" },
      { label: "ICU bed assigned and available", status: "Passed" },
      { label: "Required equipment available", status: "Passed" },
      { label: "At least one Unit Nurse available", status: "Passed" },
      { label: "Care requirements available", status: "Passed" },
    ],
    manualChecks: [
      { label: "Patient identity checked", checked: false },
      { label: "Allergy / alert checked", checked: false },
      { label: "Bedside monitor ready", checked: false },
      { label: "Oxygen and suction ready", checked: false },
      { label: "Required device readiness confirmed", checked: false },
      { label: "Admission handover note received", checked: false },
    ],
  },
  {
    id: "admission-002",
    patientId: "ICU002",
    uhid: "UHID-240202",
    patientName: "Nisha Verma",
    ageGender: "58 / Female",
    diagnosis: "Sepsis",
    admittedFrom: "Ward",
    admissionTime: "2026-07-03 09:05",
    icuUnit: "Surgical ICU",
    bed: "SICU-04",
    priority: "High",
    careRequired: ["Oxygen", "Infusion Pump"],
    reviewStatus: "Reviewed",
    reviewedBy: "Dr. Khanna",
    reviewedAt: "2026-07-03 09:45",
    staffAvailability: "Busy",
    assignmentStatus: "Pending Assignment",
    auditStatus: "Pending Audit",
    handoverStatus: "Not Ready",
    availableUnitNurses: 2,
    availableWardNurses: 1,
    nursePatientRatio: "1:3",
    workloadStatus: "Moderate",
    systemChecks: [
      { label: "Patient details complete", status: "Passed" },
      { label: "ICU bed assigned and available", status: "Passed" },
      { label: "Required equipment available", status: "Passed" },
      { label: "At least one Unit Nurse available", status: "Passed" },
      { label: "Care requirements available", status: "Passed" },
    ],
    manualChecks: [
      { label: "Patient identity checked", checked: true },
      { label: "Allergy / alert checked", checked: true },
      { label: "Bedside monitor ready", checked: true },
      { label: "Oxygen and suction ready", checked: true },
      { label: "Required device readiness confirmed", checked: true },
      { label: "Admission handover note received", checked: true },
    ],
  },
  {
    id: "admission-003",
    patientId: "ICU003",
    uhid: "UHID-240203",
    patientName: "Imran Qureshi",
    ageGender: "61 / Male",
    diagnosis: "Post operative monitoring",
    admittedFrom: "OT",
    admissionTime: "2026-07-03 09:25",
    icuUnit: "Medical ICU",
    bed: "MICU-07",
    priority: "Moderate",
    careRequired: ["Monitor"],
    reviewStatus: "On Hold",
    holdReason: "Awaiting family consent",
    failedReasons: ["Admission handover note missing"],
    staffAvailability: "Available",
    assignmentStatus: "Not Ready",
    auditStatus: "Under Audit",
    handoverStatus: "Not Ready",
    availableUnitNurses: 1,
    availableWardNurses: 1,
    nursePatientRatio: "1:4",
    workloadStatus: "High",
    systemChecks: [
      { label: "Patient details complete", status: "Passed" },
      { label: "ICU bed assigned and available", status: "Warning" },
      { label: "Required equipment available", status: "Passed" },
      { label: "At least one Unit Nurse available", status: "Passed" },
      { label: "Care requirements available", status: "Failed" },
    ],
    manualChecks: [
      { label: "Patient identity checked", checked: true },
      { label: "Allergy / alert checked", checked: false },
      { label: "Bedside monitor ready", checked: true },
      { label: "Oxygen and suction ready", checked: false },
      { label: "Required device readiness confirmed", checked: false },
      { label: "Admission handover note received", checked: true },
    ],
  },
  {
    id: "admission-004",
    patientId: "ICU004",
    uhid: "UHID-240204",
    patientName: "Aisha Khan",
    ageGender: "12 / Female",
    diagnosis: "Pediatric pneumonia",
    admittedFrom: "ER",
    admissionTime: "2026-07-03 09:55",
    icuUnit: "Pediatric ICU",
    bed: "PICU-02",
    priority: "Critical",
    careRequired: ["Ventilator", "Isolation", "Monitor"],
    reviewStatus: "Verification Failed",
    failedReasons: ["ICU bed not yet confirmed", "Ventilator allocation pending"],
    staffAvailability: "Critical",
    assignmentStatus: "Not Ready",
    auditStatus: "Pending Audit",
    handoverStatus: "Not Ready",
    availableUnitNurses: 0,
    availableWardNurses: 1,
    nursePatientRatio: "1:5",
    workloadStatus: "Overloaded",
    systemChecks: [
      { label: "Patient details complete", status: "Passed" },
      { label: "ICU bed assigned and available", status: "Failed" },
      { label: "Required equipment available", status: "Failed" },
      { label: "At least one Unit Nurse available", status: "Warning" },
      { label: "Care requirements available", status: "Passed" },
    ],
    manualChecks: [
      { label: "Patient identity checked", checked: false },
      { label: "Allergy / alert checked", checked: false },
      { label: "Bedside monitor ready", checked: false },
      { label: "Oxygen and suction ready", checked: false },
      { label: "Required device readiness confirmed", checked: false },
      { label: "Admission handover note received", checked: false },
    ],
  },
];

let cachedAdmissions = defaultAdmissions.map(normalizeHeadNurseAdmission);

function loadAdmissions() {
  if (typeof window === "undefined") return cachedAdmissions;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cachedAdmissions;
    const parsed = JSON.parse(raw) as HeadNurseAdmission[];
    if (!Array.isArray(parsed)) return cachedAdmissions;
    cachedAdmissions = parsed.map(normalizeHeadNurseAdmission);
    return cachedAdmissions;
  } catch {
    return cachedAdmissions;
  }
}

function saveAdmissions(admissions: HeadNurseAdmission[]) {
  cachedAdmissions = admissions.map(normalizeHeadNurseAdmission);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedAdmissions));
}

import React from "react";

export function useHeadNurseAdmissions() {
  const [admissions, setAdmissions] = React.useState<HeadNurseAdmission[]>(() =>
    defaultAdmissions.map(normalizeHeadNurseAdmission),
  );

  React.useEffect(() => {
    setAdmissions(loadAdmissions());
  }, []);

  const updateAdmission = React.useCallback(
    (patientId: string, updater: (_admission: HeadNurseAdmission) => HeadNurseAdmission) => {
      setAdmissions((current) => {
        const next = current.map((admission) =>
          admission.patientId === patientId ? updater(admission) : admission,
        );
        saveAdmissions(next);
        return next;
      });
    },
    [],
  );

  const updateReview = React.useCallback(
    (
      patientId: string,
      payload: Partial<
        Pick<
          HeadNurseAdmission,
          | "reviewStatus"
          | "reviewedBy"
          | "reviewedAt"
          | "remarks"
          | "holdReason"
          | "assignmentStatus"
          | "failedReasons"
          | "manualVerification"
          | "auditStatus"
          | "auditFindings"
          | "handoverStatus"
          | "handoverBy"
          | "handoverAt"
        >
      >,
    ) => {
      updateAdmission(patientId, (admission) =>
        normalizeHeadNurseAdmission({
          ...admission,
          ...payload,
        }),
      );
    },
    [updateAdmission],
  );

  const assignUnitNurse = React.useCallback(
    (patientId: string, assignedUnitNurse: string, remarks?: string) => {
      updateAdmission(patientId, (admission) =>
        normalizeHeadNurseAdmission({
          ...admission,
          assignedUnitNurse,
          assignmentStatus: "Assigned",
          remarks: remarks ?? admission.remarks,
        }),
      );
    },
    [updateAdmission],
  );

  return { admissions, updateAdmission, updateReview, assignUnitNurse };
}

export function resetHeadNurseAdmissions() {
  saveAdmissions(defaultAdmissions.map(normalizeHeadNurseAdmission));
}

export function getHeadNurseAdmissionByPatientId(patientId: string) {
  return loadAdmissions().find((admission) => admission.patientId === patientId);
}

export const headNurseUnitNurseOptions = [
  {
    value: "Nurse Kavita",
    label: "Nurse Kavita",
    shift: "Morning",
    patientCount: 2,
    availabilityStatus: "Available",
  },
  {
    value: "Nurse Rina",
    label: "Nurse Rina",
    shift: "Evening",
    patientCount: 3,
    availabilityStatus: "Busy",
  },
  {
    value: "Nurse Aditi",
    label: "Nurse Aditi",
    shift: "Night",
    patientCount: 1,
    availabilityStatus: "Available",
  },
] as const;
