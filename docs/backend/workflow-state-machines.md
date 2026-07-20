# Workflow State Machines

Every transition must create `AuditLog`, may create `Notification`, and must validate record-level access.

## Admission Workflow

```text
REQUESTED -> UNDER_REVIEW -> APPROVED -> BED_RESERVED -> ADMITTED -> DISCHARGE_PLANNED -> DISCHARGED
```

| From | To | Roles | Payload | Validation | Audit event | Notification |
|---|---|---|---|---|---|---|
| null | REQUESTED | ICU Admin, Head Nurse | patient/referral/clinical data | Required identity + source | `ADMISSION_REQUESTED` | Head nurse/ICU admin |
| REQUESTED | UNDER_REVIEW | ICU Admin, Head Nurse | reviewerNote | Request open | `ADMISSION_UNDER_REVIEW` | requester |
| UNDER_REVIEW | APPROVED | ICU Admin | approvalNote, requestedUnitId | Clinical minimum + bed category | `ADMISSION_APPROVED` | Unit nurse |
| UNDER_REVIEW | REJECTED | ICU Admin | rejectionReason | Reason required | `ADMISSION_REJECTED` | requester |
| APPROVED | BED_RESERVED | ICU Admin, Unit Nurse | bedId | Bed available/reservable | `BED_RESERVED_FOR_ADMISSION` | ward/unit |
| BED_RESERVED | ADMITTED | ICU Admin | admissionDateTime, doctorId, nurseId | Patient, bed, doctor, nurse exist | `PATIENT_ADMITTED` | care team |
| ADMITTED | DISCHARGE_PLANNED | Doctor IPD, ICU Admin | plannedDate, reason | Doctor approval required | `DISCHARGE_PLANNED` | billing/pharmacy/nursing |
| DISCHARGE_PLANNED | DISCHARGED | ICU Admin, Doctor IPD | summaryId, dischargeAt | Checklist complete | `PATIENT_DISCHARGED` | bed cleaning |

## Bed Workflow

```text
AVAILABLE -> RESERVED -> OCCUPIED -> CLEANING -> AVAILABLE
```

Alternative states: `MAINTENANCE`, `BLOCKED`, `ISOLATION_RESERVED`.

| From | To | Roles | Payload | Validation | Audit event | Notification |
|---|---|---|---|---|---|---|
| AVAILABLE | RESERVED | ICU Admin, Unit Nurse | admissionRequestId, holdUntil | No current allocation | `BED_RESERVED` | requester |
| RESERVED | OCCUPIED | ICU Admin | admissionId | Reservation belongs to admission | `BED_OCCUPIED` | nursing |
| OCCUPIED | CLEANING | ICU Admin, Head Nurse | releaseReason | Admission discharged/transferred | `BED_CLEANING` | housekeeping |
| CLEANING | AVAILABLE | ICU Admin, Housekeeping | cleanedAt, checkedBy | Cleaning checklist complete | `BED_AVAILABLE` | admission queue |
| AVAILABLE/CLEANING | MAINTENANCE | ICU Admin, Biomedical | reason | Maintenance reason | `BED_MAINTENANCE` | operations |
| MAINTENANCE | AVAILABLE | ICU Admin, Biomedical | clearanceNote | Maintenance complete | `BED_AVAILABLE` | operations |

## Doctor Order Workflow

```text
DRAFT -> PLACED -> ACKNOWLEDGED -> IN_PROGRESS -> COMPLETED
```

Alternative transitions:
```text
ACTIVE -> ON_HOLD
ON_HOLD -> ACTIVE
ACTIVE -> DISCONTINUED
PLACED -> CANCELLED
```

| From | To | Roles | Payload | Validation | Audit event | Notification |
|---|---|---|---|---|---|---|
| null | DRAFT | Doctor IPD | order body | Admission accessible | `ORDER_DRAFT_CREATED` | none |
| DRAFT | PLACED | Doctor IPD | final order body | Required order fields | `ORDER_PLACED` | Ward nurse |
| PLACED | ACKNOWLEDGED | Ward Nurse | acknowledgementNote | Assigned nurse/ward | `ORDER_ACKNOWLEDGED` | doctor |
| ACKNOWLEDGED | IN_PROGRESS | Ward Nurse | startAt | Active schedule | `ORDER_IN_PROGRESS` | none |
| IN_PROGRESS | COMPLETED | Ward Nurse, Doctor IPD | completionNote | Completion requirements | `ORDER_COMPLETED` | doctor |
| ACTIVE | ON_HOLD | Doctor IPD | reason | Active order | `ORDER_HELD` | nursing |
| ON_HOLD | ACTIVE | Doctor IPD | resumeReason | Hold exists | `ORDER_RESUMED` | nursing |
| ACTIVE | DISCONTINUED | Doctor IPD | discontinueReason | Reason required | `ORDER_DISCONTINUED` | nursing |
| PLACED | CANCELLED | Doctor IPD | cancelReason | Not acknowledged or cancellation allowed | `ORDER_CANCELLED` | nursing |

## Nursing Task Workflow

```text
PENDING -> DUE -> IN_PROGRESS -> COMPLETED
```

Alternative:
```text
DUE -> OVERDUE
PENDING -> CANCELLED
DUE -> SKIPPED
```

| From | To | Roles | Payload | Validation | Audit event | Notification |
|---|---|---|---|---|---|---|
| null | PENDING | Doctor IPD, Ward Nurse, Head Nurse | task body | Assigned user exists | `TASK_CREATED` | assigned nurse |
| PENDING | DUE | System | scheduledAt | Time reached | `TASK_DUE` | assigned nurse |
| DUE | IN_PROGRESS | Ward Nurse | startNote | Assigned nurse | `TASK_STARTED` | none |
| IN_PROGRESS | COMPLETED | Ward Nurse | completionNotes | Required completion fields | `TASK_COMPLETED` | requester |
| DUE | OVERDUE | System | none | dueAt passed | `TASK_OVERDUE` | ward/head nurse |
| PENDING | CANCELLED | Doctor IPD, Head Nurse | reason | Reason required | `TASK_CANCELLED` | assigned nurse |
| DUE | SKIPPED | Ward Nurse, Head Nurse | reason | Reason required | `TASK_SKIPPED` | head nurse |

## Escalation Workflow

```text
OPEN -> ACKNOWLEDGED -> IN_PROGRESS -> RESOLVED -> CLOSED
```

Alternative: `OPEN -> REJECTED`, any open state -> `CANCELLED`.

## Medication Administration Workflow

```text
DUE -> ADMINISTERED
DUE -> DELAYED
DUE -> HELD
DUE -> REFUSED
DUE -> MISSED
```

Rules:
- `ADMINISTERED` requires dose, route, administeredAt, administeredBy.
- `HELD`, `REFUSED`, `MISSED`, and `NOT_AVAILABLE` require reason.
- High-alert medicines require witness if configured.

## Shift Handover Workflow

```text
DRAFT -> SUBMITTED -> ACKNOWLEDGED -> VERIFIED -> COMPLETED
```

Rules:
- Ward Nurse can create/submit own shift handover.
- Incoming nurse acknowledges.
- Head Nurse verifies if configured or if issue/critical patient is present.

