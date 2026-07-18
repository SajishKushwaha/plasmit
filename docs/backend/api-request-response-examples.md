# API Request Response Examples

## Standard Envelopes

### Success
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-07-18T10:30:00.000Z",
    "requestId": "req_unique_id"
  }
}
```

### Paginated
```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "meta": {
    "timestamp": "2026-07-18T10:30:00.000Z",
    "requestId": "req_unique_id"
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "patientId",
        "message": "Patient ID is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-18T10:30:00.000Z",
    "requestId": "req_unique_id"
  }
}
```

## ICU Admin Dashboard

`GET /api/v1/icu-admin/dashboard`

Response:
```json
{
  "success": true,
  "message": "ICU dashboard fetched successfully",
  "data": {
    "summary": {
      "totalBeds": 40,
      "occupiedBeds": 32,
      "availableBeds": 5,
      "reservedBeds": 1,
      "cleaningBeds": 1,
      "maintenanceBeds": 1,
      "occupancyPercentage": 80
    },
    "patientStatus": {
      "critical": 8,
      "unstable": 5,
      "stable": 19,
      "onVentilator": 6,
      "isolation": 2
    },
    "operations": {
      "pendingAdmissions": 3,
      "pendingTransfers": 2,
      "pendingDischarges": 4
    },
    "staffing": {
      "doctorsOnDuty": 6,
      "nursesOnDuty": 18,
      "nursePatientRatio": "1:2"
    },
    "alerts": [],
    "charts": {
      "occupancyTrend": [],
      "admissionDischargeTrend": [],
      "unitWiseOccupancy": []
    }
  },
  "meta": {
    "timestamp": "2026-07-18T10:30:00.000Z",
    "requestId": "req_icu_dash_001"
  }
}
```

## ICU Admission Request

`POST /api/v1/icu/admission-requests`

Request:
```json
{
  "path": "NEW_PATIENT",
  "patient": {
    "uhid": null,
    "mrn": null,
    "fullName": "Samar Ali",
    "dateOfBirth": "1972-07-16",
    "age": 54,
    "gender": "MALE",
    "identifier": {
      "type": "AADHAAR_CARD",
      "value": "123412341234"
    },
    "phone": "+919999999999",
    "email": "samar@example.com",
    "address": {
      "line1": "42 Green Park Extension",
      "city": "New Delhi",
      "state": "Delhi",
      "pinCode": "110016"
    }
  },
  "referral": {
    "referredBy": "Dr. A Kumar",
    "referredFrom": "ER",
    "referralContact": "+919888888888",
    "referralType": "DOCTOR"
  },
  "patientHistory": {
    "pastMedicalHistory": "",
    "pastSurgicalHistoryStatus": "NO",
    "medicationHistory": [],
    "allergy": {
      "hasAllergy": true,
      "type": "DRUG",
      "date": "2026-07-18",
      "remark": "Penicillin allergy"
    },
    "socialHistory": {}
  },
  "clinicalHistoryPhysicalExamination": {
    "bloodGroupReconfirm": "B_POSITIVE",
    "heightCm": 170,
    "weightKg": 72,
    "bmi": 24.9,
    "advanceDirective": "NOT_KNOWN",
    "notes": ""
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Admission request created successfully",
  "data": {
    "id": "uuid",
    "requestNumber": "ICU-REQ-1001",
    "status": "PENDING_REVIEW",
    "patientId": "uuid",
    "draftCompleteness": 68
  },
  "meta": {
    "timestamp": "2026-07-18T10:30:00.000Z",
    "requestId": "req_adm_001"
  }
}
```

## Doctor IPD Patients

`GET /api/v1/doctor-ipd/patients?page=1&limit=20&search=rahul&clinicalStatus=CRITICAL`

Response item:
```json
{
  "patientId": "uuid",
  "admissionId": "uuid",
  "uhid": "UHID-1001",
  "patientName": "Rahul Kumar",
  "age": 54,
  "gender": "MALE",
  "ward": "Medical Ward",
  "bedNumber": "B-12",
  "admissionDate": "2026-07-18T06:30:00.000Z",
  "primaryDiagnosis": "Pneumonia",
  "clinicalStatus": "CRITICAL",
  "latestVitals": {
    "temperature": 101.2,
    "heartRate": 110,
    "respiratoryRate": 26,
    "spo2": 89,
    "bloodPressure": "90/60"
  },
  "pendingTasks": 4,
  "alerts": []
}
```

## Create Doctor Order

`POST /api/v1/admissions/:admissionId/orders`

Request:
```json
{
  "orderType": "MEDICATION",
  "priority": "ROUTINE",
  "title": "Paracetamol",
  "instructions": "Give after food",
  "startDateTime": "2026-07-18T11:00:00.000Z",
  "frequency": "BD",
  "medication": {
    "drugId": "uuid",
    "dose": "500 mg",
    "route": "ORAL",
    "duration": "5 days"
  }
}
```

Response data:
```json
{
  "id": "uuid",
  "orderNumber": "ORD-10001",
  "status": "PLACED",
  "nursingTaskIds": ["uuid"]
}
```

## Record Vitals

`POST /api/v1/admissions/:admissionId/vitals`

Request:
```json
{
  "recordedAt": "2026-07-18T10:30:00.000Z",
  "temperature": 98.6,
  "temperatureUnit": "F",
  "heartRate": 80,
  "respiratoryRate": 18,
  "systolicBP": 120,
  "diastolicBP": 80,
  "spo2": 98,
  "oxygenSupport": {
    "required": false,
    "device": null,
    "flowRate": null,
    "fio2": null
  },
  "bloodGlucose": null,
  "painScore": 2,
  "consciousnessLevel": "ALERT",
  "remarks": ""
}
```

Response data:
```json
{
  "id": "uuid",
  "earlyWarningScore": 0,
  "alertCreated": false
}
```

## Medication Administration

`POST /api/v1/medication-orders/:orderId/administer`

Request:
```json
{
  "scheduledDoseId": "uuid",
  "administeredAt": "2026-07-18T10:30:00.000Z",
  "doseGiven": "500 mg",
  "route": "ORAL",
  "site": null,
  "witnessedBy": null,
  "remarks": "Tolerated well"
}
```

Response data:
```json
{
  "id": "uuid",
  "status": "ADMINISTERED",
  "nextScheduledAt": "2026-07-18T22:30:00.000Z"
}
```

## Head Nurse Patient Assignment

`POST /api/v1/head-nurse/patient-assignments`

Request:
```json
{
  "admissionId": "uuid",
  "unitId": "uuid",
  "wardId": "uuid",
  "assignedNurseId": "uuid",
  "shiftId": "uuid",
  "assignmentReason": "New ICU admission"
}
```

Response data:
```json
{
  "assignmentId": "uuid",
  "status": "ACTIVE",
  "nursePatientRatio": "1:2"
}
```

## Unit Checklist Item Completion

`POST /api/v1/unit-nurse/admission-preparation/:id/items/:code/complete`

Request:
```json
{
  "isCompleted": true,
  "remarks": "Monitor and oxygen ready"
}
```

Response data:
```json
{
  "checklistId": "uuid",
  "itemCode": "MONITOR_AVAILABLE",
  "status": "COMPLETED",
  "overallStatus": "IN_PROGRESS"
}
```

