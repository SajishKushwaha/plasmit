# Entity JSON Schemas

All entities use UUID primary keys, ISO 8601 timestamps, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, and administrative entities support `deletedAt`.

## Common Core

### User
```json
{
  "id": "uuid",
  "employeeId": "EMP-1001",
  "firstName": "Amit",
  "lastName": "Sharma",
  "fullName": "Dr. Amit Sharma",
  "email": "amit@hospital.com",
  "phone": "+919999999999",
  "roleId": "uuid",
  "departmentId": "uuid",
  "unitId": "uuid",
  "status": "ACTIVE",
  "profileImageUrl": null,
  "lastLoginAt": null,
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

### Role
```json
{
  "id": "uuid",
  "code": "DOCTOR_IPD",
  "name": "Doctor IPD",
  "description": "IPD doctor role",
  "permissions": ["IPD_PATIENT_VIEW"]
}
```

### Patient
```json
{
  "id": "uuid",
  "uhid": "UHID-2026-0001",
  "mrn": "MRN-10001",
  "firstName": "Rahul",
  "lastName": "Kumar",
  "fullName": "Rahul Kumar",
  "dateOfBirth": "1990-05-20",
  "age": 36,
  "gender": "MALE",
  "bloodGroup": "B_POSITIVE",
  "phone": "+919999999999",
  "email": "rahul@example.com",
  "address": {
    "line1": "42 Green Park Extension",
    "city": "New Delhi",
    "state": "Delhi",
    "pinCode": "110016",
    "country": "India"
  },
  "emergencyContact": {
    "name": "Ramesh Kumar",
    "relationship": "Father",
    "phone": "+919888888888"
  },
  "allergies": [],
  "comorbidities": [],
  "status": "ACTIVE",
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

### Admission
```json
{
  "id": "uuid",
  "admissionNumber": "ADM-2026-0001",
  "patientId": "uuid",
  "admissionType": "EMERGENCY",
  "admissionDateTime": "ISO_DATE",
  "departmentId": "uuid",
  "unitId": "uuid",
  "wardId": "uuid",
  "roomId": "uuid",
  "bedId": "uuid",
  "primaryDoctorId": "uuid",
  "consultingDoctorIds": [],
  "admissionDiagnosis": [],
  "reasonForAdmission": "",
  "clinicalStatus": "STABLE",
  "admissionStatus": "ADMITTED",
  "dischargeDateTime": null
}
```

### Bed
```json
{
  "id": "uuid",
  "bedNumber": "ICU-B12",
  "bedType": "ICU",
  "wardId": "uuid",
  "roomId": "uuid",
  "status": "OCCUPIED",
  "currentAdmissionId": "uuid",
  "isIsolationBed": false,
  "equipment": [],
  "lastCleanedAt": "ISO_DATE"
}
```

## ICU Admin

### AdmissionRequest
```json
{
  "id": "uuid",
  "requestNumber": "ICU-REQ-1001",
  "patientId": "uuid",
  "sourceType": "ER",
  "sourceHospital": null,
  "referringDoctorName": "Dr. Mehta",
  "clinicalSummary": "Respiratory distress",
  "currentVitals": {},
  "oxygenSupport": "NIV",
  "ventilatorRequired": false,
  "isolationRequired": false,
  "priority": "HIGH",
  "requestedUnitId": "uuid",
  "bedRequirement": "ICU",
  "status": "PENDING_REVIEW",
  "rejectionReason": null,
  "waitingSince": "ISO_DATE"
}
```

### Equipment
```json
{
  "id": "uuid",
  "assetCode": "VENT-001",
  "name": "Ventilator 1",
  "category": "VENTILATOR",
  "status": "AVAILABLE",
  "unitId": "uuid",
  "bedId": null,
  "patientId": null,
  "lastMaintenanceAt": "ISO_DATE",
  "nextCalibrationAt": "ISO_DATE"
}
```

## Doctor IPD

### DoctorRound
```json
{
  "id": "uuid",
  "admissionId": "uuid",
  "doctorId": "uuid",
  "roundDateTime": "ISO_DATE",
  "roundType": "MORNING",
  "subjective": "",
  "objective": "",
  "assessment": "",
  "plan": "",
  "clinicalStatus": "STABLE",
  "diagnosisUpdates": [],
  "ordersCreated": [],
  "followUpInstructions": "",
  "nextReviewAt": "ISO_DATE",
  "status": "COMPLETED"
}
```

### DoctorOrder
```json
{
  "id": "uuid",
  "orderNumber": "ORD-10001",
  "admissionId": "uuid",
  "patientId": "uuid",
  "orderedBy": "uuid",
  "orderType": "MEDICATION",
  "priority": "ROUTINE",
  "title": "",
  "instructions": "",
  "startDateTime": "ISO_DATE",
  "endDateTime": null,
  "frequency": null,
  "status": "ACTIVE",
  "acknowledgedBy": null,
  "acknowledgedAt": null,
  "completedAt": null,
  "discontinuedBy": null,
  "discontinuedAt": null,
  "discontinueReason": null
}
```

### ProgressNote
```json
{
  "id": "uuid",
  "admissionId": "uuid",
  "authorId": "uuid",
  "noteType": "SOAP",
  "subjective": "",
  "objective": "",
  "assessment": "",
  "plan": "",
  "freeText": "",
  "status": "DRAFT",
  "signedAt": null,
  "version": 1
}
```

## Ward Nurse

### VitalSign
```json
{
  "id": "uuid",
  "admissionId": "uuid",
  "recordedBy": "uuid",
  "recordedAt": "ISO_DATE",
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
  "earlyWarningScore": 0,
  "remarks": ""
}
```

### NursingTask
```json
{
  "id": "uuid",
  "admissionId": "uuid",
  "taskType": "VITALS",
  "title": "Record vital signs",
  "description": "",
  "priority": "HIGH",
  "scheduledAt": "ISO_DATE",
  "dueAt": "ISO_DATE",
  "assignedTo": "uuid",
  "createdFromOrderId": "uuid",
  "status": "PENDING",
  "completedAt": null,
  "completionNotes": null
}
```

### MedicationAdministration
```json
{
  "id": "uuid",
  "medicationOrderId": "uuid",
  "admissionId": "uuid",
  "scheduledAt": "ISO_DATE",
  "status": "DUE",
  "administeredAt": null,
  "administeredBy": null,
  "doseGiven": null,
  "route": "ORAL",
  "site": null,
  "witnessedBy": null,
  "remarks": null,
  "adverseReaction": null
}
```

## Head Nurse

### StaffAssignment
```json
{
  "id": "uuid",
  "userId": "uuid",
  "roleCode": "WARD_NURSE",
  "unitId": "uuid",
  "wardId": "uuid",
  "admissionId": "uuid",
  "shiftId": "uuid",
  "assignmentType": "PATIENT",
  "status": "ACTIVE",
  "assignedBy": "uuid",
  "assignedAt": "ISO_DATE"
}
```

### ShiftRoster
```json
{
  "id": "uuid",
  "userId": "uuid",
  "unitId": "uuid",
  "wardId": "uuid",
  "shiftType": "MORNING",
  "startDateTime": "ISO_DATE",
  "endDateTime": "ISO_DATE",
  "status": "SCHEDULED"
}
```

## Unit Nurse

### UnitChecklist
```json
{
  "id": "uuid",
  "unitId": "uuid",
  "admissionRequestId": "uuid",
  "checklistType": "ADMISSION_PREPARATION",
  "items": [
    {
      "code": "BED_READY",
      "label": "Bed ready",
      "isCompleted": true,
      "completedBy": "uuid",
      "completedAt": "ISO_DATE"
    }
  ],
  "status": "IN_PROGRESS"
}
```

## Audit and Notification

### AuditLog
```json
{
  "id": "uuid",
  "userId": "uuid",
  "roleCode": "WARD_NURSE",
  "action": "MEDICATION_ADMINISTERED",
  "entityType": "MedicationAdministration",
  "entityId": "uuid",
  "admissionId": "uuid",
  "patientId": "uuid",
  "oldValue": {},
  "newValue": {},
  "reason": null,
  "ipAddress": "",
  "userAgent": "",
  "createdAt": "ISO_DATE"
}
```

### Notification
```json
{
  "id": "uuid",
  "recipientUserId": "uuid",
  "type": "CRITICAL_VITAL_ALERT",
  "title": "Critical SpO2 detected",
  "message": "Patient Rahul Kumar has SpO2 of 82%",
  "priority": "CRITICAL",
  "entityType": "VitalSign",
  "entityId": "uuid",
  "patientId": "uuid",
  "admissionId": "uuid",
  "isRead": false,
  "createdAt": "ISO_DATE"
}
```

