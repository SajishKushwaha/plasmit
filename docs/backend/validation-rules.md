# Validation Rules

## Global

- IDs must be UUID.
- Date/time values must be ISO 8601.
- `page >= 1`, `limit` between 1 and 100.
- `sortOrder` must be `asc` or `desc`.
- `createdBy`, `updatedBy`, role, and organization scope come from JWT/session.
- Reject frontend-provided role escalation.
- Signed records cannot be overwritten; require addendum/version APIs.
- Administrative entities use soft delete with `deletedAt`.

## Patient

- Patient must have either existing `patientId` or enough demographics to create one.
- `fullName` required for new patients.
- `gender` in `MALE`, `FEMALE`, `OTHER`, `UNKNOWN`.
- `dateOfBirth` cannot be future date.
- `age` must match DOB if both provided.
- Phone must be normalized E.164 when possible.
- UHID/MRN must be unique when supplied.
- Aadhaar/passport/DL auto-fetch requires verified integration; mock frontend data cannot be trusted.

## Admission

- `patientId`, `admissionType`, `departmentId`, `unitId` required before final admission.
- `bedId` must be available/reserved for the same request.
- `primaryDoctorId` must be active doctor.
- `assignedNurseId` must be active nurse in unit/ward.
- Rejection/cancellation requires reason.
- Complete admission requires status `BED_RESERVED` or approved no-bed workflow if configured.

## Bed

- Cannot allocate occupied, blocked, or maintenance bed.
- Cannot release bed without active allocation.
- Cleaning completion requires cleanedAt and checkedBy.
- Isolation bed can be assigned to non-isolation patient only with override permission.

## Doctor Orders

- `orderType`, `priority`, `title`, `startDateTime` required.
- Medication orders require drug, dose, route, frequency/duration or stop condition.
- Lab/radiology orders require test/procedure code and clinical indication.
- Discontinue/hold/cancel requires reason.
- Doctor IPD can modify only their own active/draft order unless department override is granted.

## Notes

- Draft notes can be updated by author.
- Signed notes are immutable.
- Signing requires electronic signature confirmation.
- Addendum requires original signed note and addendum reason.

## Vitals

- Heart rate 0-250, respiratory rate 0-80, SpO2 0-100.
- Temperature supports Celsius/Fahrenheit.
- BP requires systolic and diastolic together.
- EWS calculated server-side.
- Critical vitals create alerts by rules engine.

## Medication Administration

- Dose can be administered only against active medication order and scheduled dose.
- Duplicate administration for same scheduled dose is rejected.
- High-alert medication may require witness.
- Held/refused/missed require reason.
- Administration time cannot be far future.

## Intake Output

- `recordedAt`, `type`, `category`, `volumeMl` required.
- `volumeMl >= 0`.
- Balance is calculated server-side.
- Shift/day totals use hospital shift config.

## Nursing Tasks

- `title`, `taskType`, `assignedTo`, `dueAt` required.
- Completing a task requires assigned user or permitted supervisor.
- Skipping/cancelling requires reason.

## Assignment and Roster

- Nurse cannot be assigned beyond configured workload limit unless overridden by Head Nurse.
- Shift time ranges cannot overlap for the same staff unless on-call policy permits.
- Patient assignment requires active admission and active nurse.

## Escalation

- `type`, `priority`, `title`, `assignedTo` required.
- Resolution requires resolution note.
- Closing requires resolved status or override permission.

## File Upload

- Allow only configured MIME types.
- Scan files before linking to clinical record.
- Store metadata, checksum, uploader, entity type/id.
- Sensitive files require signed URL access and expiry.

