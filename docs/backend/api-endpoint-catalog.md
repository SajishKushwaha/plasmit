# API Endpoint Catalog

All endpoints are prefixed with `/api/v1`. All responses use the standard envelope documented in `api-request-response-examples.md`.

## Common Core

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| POST | `/auth/login` | Public | Authenticate user |
| POST | `/auth/refresh` | Authenticated | Refresh token |
| POST | `/auth/logout` | Authenticated | Revoke refresh token |
| GET | `/me` | Authenticated | Current user and role |
| GET | `/users` | USER_VIEW | User listing |
| POST | `/users` | USER_CREATE | Create user |
| GET | `/roles` | ROLE_VIEW | Role listing |
| GET | `/permissions` | PERMISSION_VIEW | Permission listing |
| GET | `/departments` | LOCATION_VIEW | Departments |
| GET | `/units` | LOCATION_VIEW | Units |
| GET | `/wards` | LOCATION_VIEW | Wards |
| GET | `/rooms` | LOCATION_VIEW | Rooms |
| GET | `/beds` | BED_VIEW | General bed listing |
| GET | `/patients/search` | PATIENT_SEARCH | Patient search |
| GET | `/patients/:patientId` | PATIENT_VIEW | Patient detail |
| POST | `/patients` | PATIENT_CREATE | Create patient |

## ICU Admin

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/icu-admin/dashboard` | ICU_DASHBOARD_VIEW | ICU dashboard summary |
| GET | `/icu-admin/executive-dashboard` | ICU_DASHBOARD_VIEW | Executive KPI dashboard |
| GET | `/icu-admin/analytics/:type` | ICU_ANALYTICS_VIEW | Operational/clinical/device analytics |
| GET | `/icu/beds` | ICU_BED_VIEW | ICU bed listing/map |
| GET | `/icu/beds/:bedId` | ICU_BED_VIEW | Bed detail |
| POST | `/icu/beds/:bedId/allocate` | ICU_BED_ALLOCATE | Allocate bed |
| POST | `/icu/beds/:bedId/reserve` | ICU_BED_RESERVE | Reserve bed |
| POST | `/icu/beds/:bedId/release` | ICU_BED_RELEASE | Release bed |
| POST | `/icu/beds/:bedId/mark-cleaning` | ICU_BED_UPDATE | Mark cleaning |
| POST | `/icu/beds/:bedId/mark-available` | ICU_BED_UPDATE | Mark available |
| POST | `/icu/beds/:bedId/mark-maintenance` | ICU_BED_UPDATE | Mark maintenance |
| GET | `/icu/beds/:bedId/history` | ICU_BED_VIEW | Bed history |
| GET | `/icu/admission-requests` | ICU_ADMISSION_VIEW | Admission queue |
| POST | `/icu/admission-requests` | ICU_ADMISSION_CREATE | Create admission request/draft |
| GET | `/icu/admission-requests/:id` | ICU_ADMISSION_VIEW | Admission request detail |
| POST | `/icu/admission-requests/:id/approve` | ICU_ADMISSION_APPROVE | Approve request |
| POST | `/icu/admission-requests/:id/reject` | ICU_ADMISSION_REJECT | Reject request |
| POST | `/icu/admission-requests/:id/reserve-bed` | ICU_BED_RESERVE | Reserve bed for admission |
| POST | `/icu/admission-requests/:id/complete-admission` | ICU_ADMISSION_COMPLETE | Admit patient |
| GET | `/icu/staff` | ICU_STAFF_VIEW | ICU staff list |
| GET | `/icu/shifts` | ICU_SHIFT_VIEW | Shift roster |
| POST | `/icu/shifts` | ICU_SHIFT_CREATE | Create shift |
| PUT | `/icu/shifts/:id` | ICU_SHIFT_UPDATE | Update shift |
| POST | `/icu/shifts/:id/assign-staff` | ICU_STAFF_ASSIGN | Assign staff |
| GET | `/icu/staffing/coverage` | ICU_STAFF_VIEW | Staff coverage |
| GET | `/icu/staffing/shortages` | ICU_STAFF_VIEW | Staff shortages |
| GET | `/icu/transfers` | ICU_TRANSFER_VIEW | Transfer list |
| POST | `/icu/transfers` | ICU_TRANSFER_CREATE | Create transfer |
| POST | `/icu/transfers/:id/approve` | ICU_TRANSFER_APPROVE | Approve transfer |
| POST | `/icu/transfers/:id/complete` | ICU_TRANSFER_COMPLETE | Complete transfer |
| GET | `/devices` | DEVICE_VIEW | Equipment/device list |
| POST | `/devices/:id/assign` | DEVICE_ASSIGN | Assign device |
| POST | `/devices/:id/maintenance` | DEVICE_MAINTENANCE | Maintenance status |
| GET | `/audit-logs` | AUDIT_VIEW | Audit logs |

## Doctor IPD

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/doctor-ipd/dashboard` | IPD_DASHBOARD_VIEW | Doctor dashboard |
| GET | `/doctor-ipd/patients` | IPD_PATIENT_VIEW | Assigned patients |
| GET | `/admissions/:admissionId/clinical-summary` | IPD_PATIENT_VIEW | Clinical summary |
| GET | `/doctor-ipd/rounds` | IPD_ROUND_VIEW | Doctor round worklist |
| POST | `/admissions/:admissionId/rounds` | IPD_ROUND_CREATE | Create round |
| GET | `/admissions/:admissionId/rounds` | IPD_ROUND_VIEW | Admission rounds |
| PUT | `/rounds/:roundId` | IPD_ROUND_UPDATE | Update round |
| POST | `/rounds/:roundId/complete` | IPD_ROUND_COMPLETE | Complete round |
| POST | `/admissions/:admissionId/orders` | IPD_ORDER_CREATE | Create order |
| GET | `/admissions/:admissionId/orders` | IPD_ORDER_VIEW | Admission orders |
| GET | `/orders/:orderId` | IPD_ORDER_VIEW | Order detail |
| PUT | `/orders/:orderId` | IPD_ORDER_UPDATE | Update order |
| POST | `/orders/:orderId/hold` | IPD_ORDER_HOLD | Hold order |
| POST | `/orders/:orderId/resume` | IPD_ORDER_RESUME | Resume order |
| POST | `/orders/:orderId/discontinue` | IPD_ORDER_DISCONTINUE | Discontinue order |
| POST | `/orders/:orderId/cancel` | IPD_ORDER_CANCEL | Cancel order |
| GET | `/admissions/:admissionId/progress-notes` | IPD_NOTE_VIEW | Notes list |
| POST | `/admissions/:admissionId/progress-notes` | IPD_NOTE_CREATE | Create note |
| POST | `/progress-notes/:id/sign` | IPD_NOTE_SIGN | Sign note |
| POST | `/progress-notes/:id/addendum` | IPD_NOTE_AMEND | Add addendum |
| GET | `/admissions/:admissionId/results` | RESULT_VIEW | Results |
| POST | `/admissions/:admissionId/consultation-requests` | IPD_CONSULT_CREATE | Request consultation |

## Ward Nurse

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/ward-nurse/dashboard` | WARD_NURSE_DASHBOARD_VIEW | Dashboard |
| GET | `/ward-nurse/assigned-patients` | WARD_PATIENT_VIEW | Assigned patient list |
| POST | `/admissions/:admissionId/nursing-assessments` | NURSING_ASSESSMENT_CREATE | Save assessment |
| GET | `/admissions/:admissionId/nursing-assessments` | NURSING_ASSESSMENT_VIEW | Assessment history |
| POST | `/admissions/:admissionId/vitals` | NURSING_VITALS_CREATE | Record vitals |
| GET | `/admissions/:admissionId/vitals` | NURSING_VITALS_VIEW | Vitals history |
| GET | `/admissions/:admissionId/vitals/latest` | NURSING_VITALS_VIEW | Latest vitals |
| GET | `/admissions/:admissionId/vitals/trends` | NURSING_VITALS_VIEW | Vitals trends |
| GET | `/nursing/medication-administration` | NURSING_MEDICATION_VIEW | MAR list |
| POST | `/medication-orders/:orderId/administer` | NURSING_MEDICATION_ADMINISTER | Administer dose |
| POST | `/medication-orders/:orderId/hold-dose` | NURSING_MEDICATION_HOLD | Hold dose |
| POST | `/medication-orders/:orderId/refuse` | NURSING_MEDICATION_REFUSE | Refuse dose |
| POST | `/medication-orders/:orderId/mark-missed` | NURSING_MEDICATION_UPDATE | Mark missed |
| GET | `/admissions/:admissionId/intake-output` | NURSING_IO_VIEW | Intake/output |
| POST | `/admissions/:admissionId/intake-output` | NURSING_IO_CREATE | Add IO record |
| GET | `/admissions/:admissionId/nursing-notes` | NURSING_NOTE_VIEW | Notes |
| POST | `/admissions/:admissionId/nursing-notes` | NURSING_NOTE_CREATE | Create note |
| GET | `/nursing/tasks` | NURSING_TASK_VIEW | Task list |
| POST | `/nursing/tasks/:id/complete` | NURSING_TASK_COMPLETE | Complete task |
| GET | `/nursing/shift-handovers` | NURSING_HANDOVER_VIEW | Handovers |
| POST | `/nursing/shift-handovers` | NURSING_HANDOVER_CREATE | Submit handover |

## Head Nurse

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/head-nurse/dashboard` | HEAD_NURSE_DASHBOARD_VIEW | Dashboard |
| GET | `/head-nurse/admission-queue` | HEAD_NURSE_ADMISSION_VIEW | Admission queue |
| POST | `/head-nurse/admissions/:id/review` | HEAD_NURSE_ADMISSION_REVIEW | Review admission |
| GET | `/head-nurse/staff-availability` | HEAD_NURSE_STAFF_VIEW | Staff availability |
| GET | `/head-nurse/unit-availability` | HEAD_NURSE_UNIT_VIEW | Unit availability |
| POST | `/head-nurse/patient-assignments` | HEAD_NURSE_ASSIGN_PATIENT | Assign patient |
| GET | `/head-nurse/roster` | HEAD_NURSE_MANAGE_ROSTER | Roster |
| POST | `/head-nurse/roster` | HEAD_NURSE_MANAGE_ROSTER | Create roster |
| PUT | `/head-nurse/roster/:id` | HEAD_NURSE_MANAGE_ROSTER | Update roster |
| POST | `/head-nurse/roster/bulk-assign` | HEAD_NURSE_MANAGE_ROSTER | Bulk assign |
| GET | `/head-nurse/escalations` | HEAD_NURSE_ESCALATION_VIEW | Escalations |
| POST | `/head-nurse/escalations/:id/assign` | HEAD_NURSE_ESCALATION_ASSIGN | Assign escalation |
| POST | `/nursing/shift-handovers/:id/verify` | HEAD_NURSE_VERIFY_HANDOVER | Verify handover |
| GET | `/head-nurse/audit-control` | HEAD_NURSE_AUDIT_VIEW | Audit control |

## Unit Nurse

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/unit-nurse/dashboard` | UNIT_NURSE_DASHBOARD_VIEW | Unit dashboard |
| GET | `/unit-nurse/assigned-patients` | UNIT_NURSE_PATIENT_VIEW | Assigned patients |
| POST | `/unit-nurse/patient-assignments` | UNIT_NURSE_ASSIGN_PATIENT | Assign/reassign patient |
| GET | `/unit-nurse/admission-preparation` | UNIT_NURSE_CHECKLIST_VIEW | Admission checklist |
| POST | `/unit-nurse/admission-preparation/:id/items/:code/complete` | UNIT_NURSE_COMPLETE_CHECKLIST | Complete checklist item |
| GET | `/unit-nurse/transfers` | UNIT_NURSE_TRANSFER_VIEW | Transfer coordination |
| POST | `/unit-nurse/transfers/:id/complete-checklist` | UNIT_NURSE_TRANSFER_UPDATE | Complete transfer checklist |
| GET | `/unit-nurse/handovers` | UNIT_NURSE_HANDOVER_VIEW | Unit handovers |
| POST | `/unit-nurse/handovers` | UNIT_NURSE_HANDOVER_CREATE | Submit handover |
| GET | `/unit-nurse/equipment` | UNIT_NURSE_EQUIPMENT_VIEW | Equipment tracking |
| GET | `/unit-nurse/issues` | UNIT_NURSE_ISSUE_VIEW | Issues |
| POST | `/unit-nurse/issues/:id/resolve` | UNIT_NURSE_ISSUE_UPDATE | Resolve issue |

