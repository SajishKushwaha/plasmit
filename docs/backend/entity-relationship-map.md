# Entity Relationship Map

## Organizational Structure

```text
Hospital 1--n Department
Department 1--n Unit
Unit 1--n Ward
Ward 1--n Room
Room 1--n Bed
Ward 1--n Bed
Department 1--n User
Unit 1--n User
User n--1 Role
Role n--m Permission
```

## Patient and Admission

```text
Patient 1--n Admission
Patient 1--n Allergy
Patient 1--n Comorbidity
Patient 1--n PatientIdentifier
Admission 1--1 CurrentBedAllocation
Admission 1--n AdmissionStatusHistory
AdmissionRequest 0..1--1 Admission
Admission n--1 PrimaryDoctor(User)
Admission n--m ConsultingDoctor(User)
Admission 1--n NurseAssignment
Admission 1--n Diagnosis
Admission 1--n Problem
Admission 1--n PatientEvent
```

## Bed and Equipment

```text
Bed 1--n BedAllocation
Bed 1--n BedStatusHistory
Bed n--m Equipment through EquipmentAssignment
Equipment n--1 EquipmentCategory
Equipment 1--n DeviceSignal
Equipment 1--n EquipmentMaintenance
Equipment 1--n EquipmentCalibration
```

## Clinical Core

```text
Admission 1--n VitalSign
Admission 1--n IntakeOutputRecord
Admission 1--n DoctorRound
Admission 1--n DoctorOrder
DoctorOrder 1--n OrderStatusHistory
DoctorOrder 0..1--1 MedicationOrder
DoctorOrder 0..1--1 LabOrder
DoctorOrder 0..1--1 RadiologyOrder
DoctorOrder 0..1--1 ProcedureOrder
DoctorOrder 0..1--1 ConsultationRequest
Admission 1--n ProgressNote
ProgressNote 1--n NoteVersion
ProgressNote 0..1--1 ElectronicSignature
Admission 1--n InvestigationResult
InvestigationResult 1--n FileAttachment
```

## Nursing

```text
Admission 1--n NursingAssessment
Admission 1--n NursingTask
DoctorOrder 0..n--n NursingTask
MedicationOrder 1--n MedicationAdministration
Admission 1--n NursingNote
NursingNote 1--n NoteVersion
Admission 1--n ShiftHandoverPatient
Shift 1--n ShiftHandover
ShiftHandover 1--n HandoverIssue
User 1--n StaffAssignment
StaffAssignment n--1 Shift
```

## Head Nurse and Unit Nurse Operations

```text
User(HeadNurse) 1--n ShiftRoster
User(UnitNurse) 1--n UnitNurseAssignment
Unit 1--n UnitHandover
Unit 1--n UnitChecklist
Escalation n--1 Admission
Escalation n--1 CreatedBy(User)
Escalation n--1 AssignedTo(User)
Incident n--1 Admission
Ward 1--n WardStock
WardStock n--1 InventoryItem
```

## Audit, Notifications, Security

```text
User 1--n AuditLog
User 1--n Notification
Patient 1--n AuditLog
Admission 1--n AuditLog
AnyEntity 1--n AuditLog by entityType/entityId
AnyEntity 1--n Notification by entityType/entityId
```

## Normalization Rules

- Store patient identity once in `Patient`; admission-specific data belongs in `Admission`.
- Store location hierarchy in Hospital/Department/Unit/Ward/Room/Bed.
- Store bed occupancy through `BedAllocation`, not on admission alone.
- Store signed notes as immutable `NoteVersion` records.
- Store status transitions in separate history tables for admission, bed, order, task, escalation, and discharge.
- Store user/role from authenticated token and server session, not frontend payload.

