# Frontend Field API Mapping

## ICU Admission

```json
{
  "role": "ICU_ADMIN",
  "module": "Patients",
  "screen": "Admissions",
  "route": "/icu-command-center/patients/admissions",
  "initialLoadApis": [
    {
      "method": "GET",
      "endpoint": "/api/v1/icu/beds?status=AVAILABLE",
      "purpose": "Populate bed availability"
    },
    {
      "method": "GET",
      "endpoint": "/api/v1/icu/staffing/coverage",
      "purpose": "Populate doctor and nurse availability"
    }
  ],
  "actionApis": [
    {
      "action": "Save Draft",
      "method": "POST",
      "endpoint": "/api/v1/icu/admission-requests",
      "permission": "ICU_ADMISSION_CREATE"
    },
    {
      "action": "Select Existing Patient",
      "method": "GET",
      "endpoint": "/api/v1/patients/search",
      "permission": "PATIENT_SEARCH"
    },
    {
      "action": "Save & Continue",
      "method": "PUT",
      "endpoint": "/api/v1/icu/admission-requests/:id",
      "permission": "ICU_ADMISSION_CREATE"
    },
    {
      "action": "Submit",
      "method": "POST",
      "endpoint": "/api/v1/icu/admission-requests/:id/complete-admission",
      "permission": "ICU_ADMISSION_COMPLETE"
    }
  ],
  "requiredFields": ["patient.fullName", "patient.gender", "patient.phone", "admission.unitId"],
  "responseFieldMapping": {
    "draft.uhid": "patient.uhid || patient.mrn",
    "draft.patientName": "patient.fullName",
    "draft.dateOfBirth": "patient.dateOfBirth",
    "draft.age": "patient.age",
    "draft.gender": "patient.gender",
    "draft.contactNumber": "patient.phone",
    "draft.email": "patient.email",
    "draft.address": "patient.address.line1",
    "draft.state": "patient.address.state",
    "draft.city": "patient.address.city",
    "draft.pinCode": "patient.address.pinCode",
    "draft.referredBy": "referral.referredBy",
    "draft.referredFrom": "referral.referredFrom",
    "draft.referralContact": "referral.referralContact",
    "draft.referralType": "referral.referralType"
  },
  "loadingState": true,
  "emptyState": true,
  "errorState": true
}
```

## Doctor IPD Dashboard

```json
{
  "role": "DOCTOR_IPD",
  "module": "Dashboard",
  "screen": "My Patient List",
  "route": "/doctor-ipd",
  "initialLoadApis": [
    {
      "method": "GET",
      "endpoint": "/api/v1/doctor-ipd/dashboard",
      "purpose": "Show summary cards"
    },
    {
      "method": "GET",
      "endpoint": "/api/v1/doctor-ipd/patients",
      "purpose": "Show assigned patient table"
    }
  ],
  "actionApis": [
    {
      "action": "Search / Filter",
      "method": "GET",
      "endpoint": "/api/v1/doctor-ipd/patients",
      "permission": "IPD_PATIENT_VIEW"
    },
    {
      "action": "Open Vitals Modal",
      "method": "GET",
      "endpoint": "/api/v1/admissions/:admissionId/vitals/latest",
      "permission": "IPD_PATIENT_VIEW"
    },
    {
      "action": "Add Progress Note",
      "method": "POST",
      "endpoint": "/api/v1/admissions/:admissionId/progress-notes",
      "permission": "IPD_NOTE_CREATE"
    }
  ],
  "requiredFields": [],
  "responseFieldMapping": {
    "patientTable.patientName": "items[].patientName",
    "patientTable.latestVitals": "items[].latestVitals",
    "patientTable.pendingTasks": "items[].pendingTasks"
  },
  "loadingState": true,
  "emptyState": true,
  "errorState": true
}
```

## Ward Nurse Vitals

```json
{
  "role": "WARD_NURSE",
  "module": "Vitals",
  "screen": "Early Warning Score / Pending Vitals",
  "route": "/icu-command-center/nursing/early-warning-score",
  "initialLoadApis": [
    {
      "method": "GET",
      "endpoint": "/api/v1/admissions/:admissionId/vitals/latest",
      "purpose": "Show latest vital signs"
    },
    {
      "method": "GET",
      "endpoint": "/api/v1/admissions/:admissionId/vitals/trends",
      "purpose": "Render vitals trend chart"
    }
  ],
  "actionApis": [
    {
      "action": "Save Vitals",
      "method": "POST",
      "endpoint": "/api/v1/admissions/:admissionId/vitals",
      "permission": "NURSING_VITALS_CREATE"
    },
    {
      "action": "Escalate",
      "method": "POST",
      "endpoint": "/api/v1/escalations",
      "permission": "NURSING_TASK_COMPLETE"
    }
  ],
  "requiredFields": ["recordedAt", "heartRate", "respiratoryRate", "spo2"],
  "responseFieldMapping": {
    "ews.score": "earlyWarningScore",
    "alerts.created": "alertCreated"
  },
  "loadingState": true,
  "emptyState": true,
  "errorState": true
}
```

## Ward Nurse Medication Administration

```json
{
  "role": "WARD_NURSE",
  "module": "Medication Administration",
  "screen": "MAR",
  "route": "/icu-command-center/nursing/medication-administration",
  "initialLoadApis": [
    {
      "method": "GET",
      "endpoint": "/api/v1/nursing/medication-administration",
      "purpose": "Load due/overdue/administered medicines"
    }
  ],
  "actionApis": [
    {
      "action": "Administer",
      "method": "POST",
      "endpoint": "/api/v1/medication-orders/:orderId/administer",
      "permission": "NURSING_MEDICATION_ADMINISTER"
    },
    {
      "action": "Hold",
      "method": "POST",
      "endpoint": "/api/v1/medication-orders/:orderId/hold-dose",
      "permission": "NURSING_MEDICATION_HOLD"
    },
    {
      "action": "Refuse",
      "method": "POST",
      "endpoint": "/api/v1/medication-orders/:orderId/refuse",
      "permission": "NURSING_MEDICATION_REFUSE"
    },
    {
      "action": "Mark Missed",
      "method": "POST",
      "endpoint": "/api/v1/medication-orders/:orderId/mark-missed",
      "permission": "NURSING_MEDICATION_UPDATE"
    }
  ],
  "requiredFields": ["scheduledDoseId", "status"],
  "responseFieldMapping": {
    "row.status": "status",
    "row.administeredAt": "administeredAt"
  },
  "loadingState": true,
  "emptyState": true,
  "errorState": true
}
```

## Head Nurse Assignment

```json
{
  "role": "HEAD_NURSE",
  "module": "Patient Assignment",
  "screen": "Assign Patient to Nurse",
  "route": "/head-nurse/patient-assignment",
  "initialLoadApis": [
    {
      "method": "GET",
      "endpoint": "/api/v1/head-nurse/admission-queue",
      "purpose": "Load patients waiting assignment"
    },
    {
      "method": "GET",
      "endpoint": "/api/v1/head-nurse/staff-availability",
      "purpose": "Load nurses and workload"
    }
  ],
  "actionApis": [
    {
      "action": "Assign",
      "method": "POST",
      "endpoint": "/api/v1/head-nurse/patient-assignments",
      "permission": "HEAD_NURSE_ASSIGN_PATIENT"
    }
  ],
  "requiredFields": ["admissionId", "assignedNurseId", "shiftId"],
  "responseFieldMapping": {
    "assignment.status": "status",
    "assignment.nursePatientRatio": "nursePatientRatio"
  },
  "loadingState": true,
  "emptyState": true,
  "errorState": true
}
```

## Unit Nurse Assigned Patients

```json
{
  "role": "UNIT_NURSE",
  "module": "Assigned Patients",
  "screen": "Assigned Patients",
  "route": "/icu-command-center/nursing/assigned-patients",
  "initialLoadApis": [
    {
      "method": "GET",
      "endpoint": "/api/v1/unit-nurse/assigned-patients",
      "purpose": "Load unit nurse patient assignments"
    }
  ],
  "actionApis": [
    {
      "action": "Open Patient",
      "method": "GET",
      "endpoint": "/api/v1/admissions/:admissionId/clinical-summary",
      "permission": "UNIT_NURSE_PATIENT_VIEW"
    },
    {
      "action": "Reassign",
      "method": "POST",
      "endpoint": "/api/v1/unit-nurse/patient-assignments",
      "permission": "UNIT_NURSE_ASSIGN_PATIENT"
    }
  ],
  "requiredFields": [],
  "responseFieldMapping": {
    "patientList.items": "items",
    "patientList.status": "items[].clinicalStatus"
  },
  "loadingState": true,
  "emptyState": true,
  "errorState": true
}
```

## Remaining Button Mapping Rule

For screens not expanded above, use this mapping:
- `View`, eye icon: `GET entity detail endpoint`.
- `Edit`, pencil icon: `PUT/PATCH entity endpoint` with existing row id.
- `Add`, plus icon: `POST collection endpoint`.
- `Save Draft`: `POST` or `PUT` with `status=DRAFT`.
- `Submit`: `POST transition endpoint` or `PUT status`.
- `Approve/Reject`: dedicated transition endpoint with reason/comment.
- `Acknowledge`: `POST /:id/acknowledge`.
- `Complete`: `POST /:id/complete`.
- `Escalate`: `POST /api/v1/escalations`.
- `Export`: `GET collection/export` with current filters.

Each action must expose loading, disabled, success toast/message, and error envelope handling.

