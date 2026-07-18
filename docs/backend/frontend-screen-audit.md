# Frontend Screen Audit

Source of truth inspected:
- `src/data/navigation.ts`
- `src/config/roles.ts`
- `src/data/icu-nursing-role-permissions.ts`
- `src/app/(workspace)/(care-team)/icu-command-center/**/page.tsx`
- `src/app/(workspace)/(roles)/doctor-ipd/**/page.tsx`
- `src/app/(workspace)/(roles)/ward-nurse/**/page.tsx`
- `src/app/(workspace)/(roles)/head-nurse/**/page.tsx`
- `src/app/(workspace)/(roles)/unit-nurse/**/page.tsx`
- `src/features/care-team/icu-command-center/icu-admission-page.tsx`
- `src/features/care-team/nursing-icu/**`
- `src/features/roles/doctor-ipd/**`

This audit covers the requested backend-ready architecture for ICU Admin, Doctor IPD, Ward Nurse, Head Nurse, and Unit Nurse. Frontend labels are reused where possible.

## Common Screen Contract

Every list/table screen needs `page`, `limit`, `search`, `sortBy`, `sortOrder`, `status`, `departmentId`, `unitId`, `wardId`, `bedId`, `patientId`, `admissionId`, `assignedTo`, `fromDate`, and `toDate`.

Every card/dashboard screen needs summary metrics, trend data, alerts, and stale-data metadata.

Every form/action needs `createdBy` resolved from JWT, server-side validation, idempotency protection for critical submit actions, audit logging, and role/record-level authorization.

## ICU Admin

### Command

#### ICU Command Center
- Route: `/icu-command-center`
- Role access: ICU Admin, ICU, Doctor ICU, Nurse ICU 2, management-like ICU roles.
- Cards: ICU census, bed occupancy, critical alerts, device status, admissions/discharges, staff coverage.
- Tables: active ICU patients, tasks, alerts, device/patient mapping.
- Filters/search: patient, UHID/MRN, bed, unit, status, risk.
- Buttons/actions: view patient, open alert, acknowledge task, navigate to dashboard modules.
- Required backend data: ICU dashboard summary, bed status, admission queue, alerts, tasks, device signals.
- API dependency: `GET /api/v1/icu-admin/dashboard`, `GET /api/v1/icu/alerts`, `GET /api/v1/icu/tasks`.

#### Executive Dashboard
- Routes: `/icu-command-center/executive-dashboard`, `/drilldown`, `/documentation`, `/owner`, `/action`.
- Sections: operational overview, owners, action tracker, documentation completion, drilldowns.
- Required backend data: KPI cards, owner action list, documentation gaps, trend charts, drilldown rows.
- Actions: assign owner, update action, export, open drilldown.
- API dependency: `GET /api/v1/icu-admin/executive-dashboard`, `POST /api/v1/icu/actions`, `PUT /api/v1/icu/actions/:id`.

#### Notifications & Tasks
- Route: `/icu-command-center/notifications-tasks`
- Sections: notification list, task queue, priority/status badges.
- Required backend data: notifications, recipients, task assignments, related patient/admission.
- Actions: mark read, acknowledge, complete task, open related record.
- API dependency: `GET /api/v1/notifications`, `POST /api/v1/notifications/:id/read`, `POST /api/v1/tasks/:id/complete`.

### Patients

#### Patient Search
- Route: `/icu-command-center/patients/search`
- Sections: search bar, filters, patient result cards/table.
- Required backend data: patient identity, admission status, bed, doctor, nurse, risk, latest vitals.
- Actions: search, filter, view patient, open timeline/daily chart/admission.
- API dependency: `GET /api/v1/patients/search`, `GET /api/v1/admissions`.

#### Smart Bed View
- Route: `/icu-command-center/patients/smart-bed-view`
- Sections: bed map, bed status cards, equipment indicators.
- Required backend data: bed, room, ward, unit, current admission, cleaning/maintenance/isolation state, equipment.
- Actions: allocate, reserve, release, mark cleaning, mark available, view bed history.
- API dependency: `GET /api/v1/icu/beds`, `POST /api/v1/icu/beds/:bedId/allocate`, `POST /api/v1/icu/beds/:bedId/release`.

#### Admissions
- Route: `/icu-command-center/patients/admissions`
- Sections/tabs: path selection, Patient, Patient Status, Bed & Device, Medication, Review.
- Basic Demographics fields: UHID/MRN, Patient Name, DOB, Age, Gender, ID Proof, ID value, Contact Number, Email ID, Address, State, City, PIN Code, Referred By, Referred From, Referral Contact, Referral Type.
- Patient History sections: Past Medical, Past Surgical, Medication History, Allergy History, Social History.
- Clinical History and Physical Examination fields: Blood Group Reconfirm, Height, Weight, BMI, Allergies, Comorbidities, Smoking Status, Alcohol Use, Advance Directive, Notes.
- Patient Status fields: current patient status, diagnosis, condition, recovery status, risk, isolation, handover.
- Bed & Device fields: unit, bed, ventilator/support, devices, doctor, nurse, readiness checklist.
- Medication fields: medication, past medication, current medication, high-alert medication, allergy, procedures, nursing notes, handover confirmation.
- Actions: New Patient, Transfer/Existing Patient, Change path, select existing patient, Save Draft, Clear, Back, Save & Continue, Submit.
- Required backend data: patients, referrals, admission draft, admission request, bed availability, staff availability, device list, readiness checklist.
- API dependency: `POST /api/v1/icu/admission-requests`, `PUT /api/v1/icu/admission-drafts/:id`, `POST /api/v1/icu/admission-requests/:id/complete-admission`.

#### Discharges
- Routes: `/icu-command-center/patients/discharges`, `/icu-command-center/patients/discharges/:workflowId/summary`.
- Sections: discharge queue, discharge workflow, summary.
- Required backend data: planned discharge, checklist, doctor approval, pharmacy/billing/bed release, summary content.
- Actions: start discharge, approve, complete checklist, generate summary, release bed.
- API dependency: `GET /api/v1/discharges`, `POST /api/v1/discharges/:id/approve`, `POST /api/v1/discharges/:id/complete`.

#### Patient Detail, Daily Chart, Timeline, Unit Staff Availability
- Routes: `/icu-command-center/patients/:patientId`, `/daily-chart`, `/timeline`, `/unit-staff-availability`.
- Sections: overview, monitoring, results, events, shift summary, staffing.
- Required backend data: admission summary, vitals, charts, events, orders, notes, investigation results, staff roster.
- Actions: view chart, add event, view timeline, assign/see unit staff.
- API dependency: `GET /api/v1/admissions/:admissionId/clinical-summary`, `GET /api/v1/admissions/:admissionId/timeline`, `GET /api/v1/icu/staffing/coverage`.

### Critical Care

#### ICU Operations
- Route: `/icu-command-center/critical-care/operations`
- Required backend data: census, bed movements, pending admissions/transfers/discharges, emergency cases.
- Actions: filter, drilldown, open patient/bed.
- API dependency: `GET /api/v1/icu/operations`.

#### Device Monitoring
- Route: `/icu-command-center/critical-care/device-monitoring`
- Required backend data: device signals, patient-device mapping, alarm status, connectivity health.
- Actions: view device, acknowledge alarm, open signal trend.
- API dependency: `GET /api/v1/icu/devices/monitoring`, `POST /api/v1/device-alerts/:id/acknowledge`.

#### Clinical Alerts
- Route: `/icu-command-center/critical-care/clinical-alerts`
- Required backend data: abnormal vitals, lab critical values, sepsis/EWS triggers, acknowledgement status.
- Actions: acknowledge, escalate, assign owner, close.
- API dependency: `GET /api/v1/icu/clinical-alerts`, `POST /api/v1/alerts/:id/acknowledge`.

#### ICU Rounds
- Routes: `/icu-command-center/critical-care/rounds`, `/icu-round-2`
- Required backend data: round templates, patient list, SOAP notes, checklist, doctor assignments.
- Actions: create round, update, complete, sign.
- API dependency: `GET /api/v1/doctor-ipd/rounds`, `POST /api/v1/admissions/:admissionId/rounds`.

#### Escalation Center
- Route: `/icu-command-center/critical-care/escalation-center`
- Required backend data: escalation type, priority, owner, SLA, source event, status.
- Actions: create, acknowledge, assign, resolve, close.
- API dependency: `GET /api/v1/escalations`, `POST /api/v1/escalations`, `POST /api/v1/escalations/:id/resolve`.

### Clinical Workspace

#### Patient Overview
- Route: `/icu-command-center/clinical-workspace/patient-overview`
- Role access: ICU Admin, Ward Nurse, Head Nurse, ICU roles.
- Required backend data: active assigned patient, demographics, diagnosis, vitals, orders, alerts, care plan.
- Actions: view tabs, open monitoring/orders/events.
- API dependency: `GET /api/v1/admissions/:admissionId/clinical-summary`.

#### Progress Notes
- Route: `/icu-command-center/clinical-workspace/progress-notes`
- Required backend data: progress notes, drafts, signed notes, addendums, version history.
- Actions: create draft, save, sign, amend.
- API dependency: `GET /api/v1/admissions/:admissionId/progress-notes`, `POST /api/v1/admissions/:admissionId/progress-notes`.

#### Orders & Care Plans
- Route: `/icu-command-center/clinical-workspace/orders-care-plans`
- Required backend data: doctor orders, nursing tasks, care plan items.
- Actions: create/update order, acknowledge, complete, discontinue.
- API dependency: `GET /api/v1/admissions/:admissionId/orders`, `POST /api/v1/admissions/:admissionId/orders`.

#### Doctor Order Entry
- Route: `/icu-command-center/clinical-workspace/doctor-order-entry`
- Required backend data: patient context, order categories, medication/lab/radiology/procedure catalogs.
- Actions: place orders, save draft, submit.
- API dependency: `POST /api/v1/admissions/:admissionId/orders`.

#### Family Communication
- Route: `/icu-command-center/clinical-workspace/family-communication`
- Sections: communication logs, follow-ups, review.
- Fields: patient, UHID, bed, date, type, recorded by, attendees, discussion summary, questions, priority, consent/follow-up status.
- Actions: add update, edit, view, update follow-up, complete, escalate, mark reviewed.
- API dependency: `GET /api/v1/admissions/:admissionId/family-communications`, `POST /api/v1/admissions/:admissionId/family-communications`.

### Nursing

#### Nursing Station
- Route: `/icu-command-center/nursing/station`
- Required backend data: assigned patients, workload, pending tasks, alerts, shift status.
- Actions: open patient, assign/reassign, review tasks.
- API dependency: `GET /api/v1/nursing/station`.

#### Assigned Patients
- Route: `/icu-command-center/nursing/assigned-patients`
- Role access: Unit Nurse.
- Required backend data: nurse assignments, patient identity, bed, status, pending tasks.
- Actions: open patient, filter assignment, view monitoring/results/events.
- API dependency: `GET /api/v1/unit-nurse/assigned-patients`.

#### Nurse Entry
- Route: `/icu-command-center/nursing/nurse-entry`
- Required backend data: patient context, nursing assessment templates, vitals, care procedures.
- Actions: save assessment, submit, add nursing note.
- API dependency: `POST /api/v1/admissions/:admissionId/nursing-assessments`.

#### Nurse Review, First Level Review
- Routes: `/icu-command-center/nursing/nurse-review`, `/first-level-review`
- Required backend data: pending reviews, nursing submissions, statuses, reviewer notes.
- Actions: approve, ask clarification, reject, sign.
- API dependency: `GET /api/v1/nursing/reviews`, `POST /api/v1/nursing/reviews/:id/decision`.

#### Medication Administration, Medicine Receive & Verify, Patient Medication Chart
- Routes: `/icu-command-center/nursing/medication-administration`, `/medicine-receive-verify`, `/patient-medication`.
- Required backend data: MAR, medication orders, schedule, verification, administration history.
- Actions: verify medicine, administer, hold, refuse, mark missed, record adverse reaction.
- API dependency: `GET /api/v1/nursing/medication-administration`, `POST /api/v1/medication-orders/:orderId/administer`.

#### Early Warning Score, Pending Vitals
- Routes: `/icu-command-center/nursing/early-warning-score`, `/pending-vitals`.
- Required backend data: vitals, EWS calculation, thresholds, trend.
- Actions: record vitals, calculate score, escalate.
- API dependency: `POST /api/v1/admissions/:admissionId/vitals`, `GET /api/v1/admissions/:admissionId/vitals/trends`.

#### Intake Output
- Route: `/icu-command-center/nursing/intake-output`
- Required backend data: intake records, output records, shift/day balance calculations.
- Actions: add intake, add output, edit, delete draft, submit shift balance.
- API dependency: `GET /api/v1/admissions/:admissionId/intake-output`, `POST /api/v1/admissions/:admissionId/intake-output`.

#### Nursing Notes
- Route: `/icu-command-center/nursing/nursing-notes`
- Required backend data: shift notes, event notes, escalation notes, signed note versions.
- Actions: create, save draft, sign, add addendum.
- API dependency: `GET /api/v1/admissions/:admissionId/nursing-notes`, `POST /api/v1/admissions/:admissionId/nursing-notes`.

#### Orders and Pending Doctor Orders
- Routes: `/icu-command-center/nursing/order`, `/pending-doctor-orders`
- Required backend data: orders requiring nursing acknowledgement/action.
- Actions: acknowledge, start, complete, raise issue.
- API dependency: `GET /api/v1/nursing/orders`, `POST /api/v1/orders/:orderId/acknowledge`.

#### Shift Handover, Shift Pending Summary, Raise Issue
- Routes: `/icu-command-center/nursing/shift-handover`, `/shift-pending-summary`, `/raise-issue`
- Required backend data: outgoing/incoming nurses, patient-wise handover, pending work, acknowledgement.
- Actions: submit handover, verify, raise issue, resolve issue.
- API dependency: `GET /api/v1/nursing/shift-handovers`, `POST /api/v1/nursing/shift-handovers`.

#### Patient Event Update, Tasks & Assessments, Escalation Tracking/Decision, Bed-Ward-Nurse Link
- Routes: `/patient-event-update`, `/tasks-assessments`, `/escalation-tracking`, `/escalation-decision`, `/bed-ward-nurse-link`.
- Required backend data: events, tasks, escalations, bed/ward/nurse assignment links.
- Actions: add event, complete task, decide escalation, link bed/ward/nurse.
- API dependency: `POST /api/v1/admissions/:admissionId/events`, `GET /api/v1/nursing/tasks`, `POST /api/v1/escalations`.

### Diagnostics, Device Operations, Tele ICU, Analytics, Administration

Screens audited from navigation:
- Diagnostics: `/diagnostics/hub`, `/investigation-entry`, `/trends-charts`, `/hub/laboratory`, `/imaging`, `/pathology`, `/microbiology`, `/cardiology`, `/pulmonology`, `/report-details`, `/imaging-report-view`.
- Device Operations: `/device-operations/edge-device-management`, `/device-mapping`, `/connectivity-dashboard`, `/signal-health`.
- Tele ICU: `/tele-icu/remote-command-center`, `/remote-consultations`, `/escalated-cases`, `/readiness`, `/remote-md`, `/local-team`, `/sla`, and escalated case drilldowns.
- Analytics: `/analytics/operational`, `/clinical`, `/device`, `/pilot-outcome`, `/adoption`.
- Administration: `/administration/users-roles`, `/configuration`, `/audit-logs`.
- Required backend data: investigation orders/results, reports, device inventory/mapping/signals, remote consultation requests, escalations, KPI datasets, users/roles/config/audit logs.
- Key APIs: diagnostics `/api/v1/investigations/**`, devices `/api/v1/devices/**`, tele ICU `/api/v1/tele-icu/**`, analytics `/api/v1/icu-admin/analytics/**`, admin `/api/v1/users`, `/api/v1/roles`, `/api/v1/audit-logs`.

## Doctor IPD

### Dashboard / My Patient List
- Route: `/doctor-ipd`
- Sections: dashboard toolbar, summary cards, patient table/mobile cards, filters, pagination, modals.
- Cards: assigned patients, critical patients, pending rounds, pending orders, abnormal results, pending notes/discharge.
- Table fields: patient, UHID/MRN, bed/ward/unit, diagnosis, latest vitals, risk, pending tasks, alerts.
- Modals: vitals, laboratory, radiology, medication, progress note, collaborate, events.
- Actions: search/filter, open patient, open modal, add progress note, order lab/radiology/medication, collaborate.
- API dependency: `GET /api/v1/doctor-ipd/dashboard`, `GET /api/v1/doctor-ipd/patients`.

### Patient Details
- Route: `/doctor-ipd/patients/:patientId`
- Sections/tabs: overview, vitals/monitoring, orders, results, notes, assessment, intake-output, POCT.
- Components: patient banner, patient metrics, navigation tabs, overview cards.
- Actions: switch tab, create order, create note, view results, record assessment.
- API dependency: `GET /api/v1/admissions/:admissionId/clinical-summary`, `GET /api/v1/admissions/:admissionId/orders`.

### Clinical Examination, Assessment, Intake Output, Live Monitoring, Progress Notes
- Feature entry files: `src/features/roles/doctor-ipd/clinical-examination`, `assessment`, `intake-output`, `live-monitoring`, `progress-notes`.
- Required backend data: patient context, examination forms, vitals/monitoring streams, IO records, notes.
- Actions: save clinical examination, record assessment, review live monitoring, add progress note.
- API dependency: `POST /api/v1/admissions/:admissionId/clinical-examinations`, `GET /api/v1/admissions/:admissionId/monitoring/live`, `POST /api/v1/admissions/:admissionId/progress-notes`.

### Doctor Orders
- Routes: shared `/doctor/orders`, `/doctor/orders/ldt`.
- Tabs: drugs, laboratory, LDT, radiology, pathology, blood request, procedures, order sets, requests, refer consultation.
- Actions: create order, review result, acknowledge critical finding, request consultation, discontinue/cancel/hold/resume.
- API dependency: `POST /api/v1/admissions/:admissionId/orders`, `GET /api/v1/orders/:orderId`.

## Ward Nurse

Ward Nurse uses both dedicated `/ward-nurse/**` routes and ICU command nursing routes permitted by `icu-nursing-role-permissions.ts`.

### Dashboard / Assigned Patient
- Routes: `/ward-nurse`, `/icu-command-center/clinical-workspace/patient-overview`.
- Sections: assigned patient overview, patient banner, pending work, risk alerts.
- Required backend data: assigned admissions for authenticated nurse, patient status, latest vitals, pending tasks/orders.
- Actions: open patient, view monitoring/orders/events/shift summary/collaborate.
- API dependency: `GET /api/v1/ward-nurse/dashboard`, `GET /api/v1/ward-nurse/assigned-patients`.

### Bedside Documentation
- Routes: `/ward-nurse/nurse-entry`, `/early-warning-score`, `/intake-output`, `/patient-event-update`.
- Sections: nursing assessment form, EWS, IO update, event update.
- Required backend data: assessment templates, vitals thresholds, IO categories, event types.
- Actions: save/submit assessment, add vitals, calculate EWS, add IO/event.
- API dependency: `POST /api/v1/admissions/:admissionId/nursing-assessments`, `POST /api/v1/admissions/:admissionId/vitals`, `POST /api/v1/admissions/:admissionId/intake-output`.

### Nursing Work
- Routes: `/medicine-receive-verify`, `/order`, `/medication-administration`, `/nursing-notes`, `/patient-medication`, `/pending-medicines`, `/pending-doctor-orders`, `/pending-nursing-tasks`, `/pending-vitals`, `/tasks-assessments`.
- Required backend data: medication orders, medicine verification, MAR schedule, task queue, doctor orders, nursing notes.
- Actions: verify medicine, administer/hold/refuse/missed, acknowledge order, complete task, create/sign note.
- API dependency: `GET /api/v1/nursing/medication-administration`, `POST /api/v1/medication-orders/:orderId/administer`, `POST /api/v1/orders/:orderId/acknowledge`.

### Handover and Escalations
- Routes: `/shift-handover`, `/shift-pending-summary`, `/raise-issue`, `/escalation-tracking`, `/escalation-decision`, `/critical-alerts`, `/first-level-review`, `/nurse-review`.
- Required backend data: shift handover, pending work, issues, escalation status, critical alerts, review queues.
- Actions: submit handover, raise issue, acknowledge/resolve escalation, review critical alert.
- API dependency: `POST /api/v1/nursing/shift-handovers`, `POST /api/v1/escalations`, `POST /api/v1/alerts/:id/acknowledge`.

## Head Nurse

### Dashboard
- Routes: `/head-nurse`, `/nursing-icu/head-nurse?view=icu`, `/nursing-icu/head-nurse?view=patients`.
- Sections: ICU dashboard, patient dashboard, archived records.
- Cards: total ward/ICU patients, bed occupancy, nurses on duty, shortages, pending handovers/escalations, overdue tasks.
- Required backend data: census, staffing, tasks, handovers, escalations, workload.
- Actions: switch view, open patient, open escalation, review admissions.
- API dependency: `GET /api/v1/head-nurse/dashboard`.

### Admissions and Assignment
- Routes: `/head-nurse/new-admissions`, `/admission-queue`, `/admission-review`, `/unit-assignment`, `/patient-assignment`, `/staff-availability`, `/unit-availability`.
- Sections: queue, review, unit availability, staff availability, patient assignment.
- Required backend data: new admission queue, unit beds, staff roster, assignment workload, admission checklist.
- Actions: review admission, assign unit, assign patient to unit nurse, view availability.
- API dependency: `GET /api/v1/head-nurse/admission-queue`, `POST /api/v1/head-nurse/admissions/:id/review`, `POST /api/v1/head-nurse/patient-assignments`.

### Alerts, Handover, Audit
- Routes: `/alerts-delays`, `/escalations`, `/escalation`, `/shift-handover`, `/handover-verification`, `/audit-control`.
- Nursing ICU routes: `/nursing-icu/head-nurse/audit-control`, `/critical-delays`, `/quality`, `/reports`.
- Required backend data: delayed tasks, escalations, handover verification, audit controls, incident/quality records.
- Actions: acknowledge, assign, resolve, verify handover, export audit report.
- API dependency: `GET /api/v1/head-nurse/escalations`, `POST /api/v1/nursing/shift-handovers/:id/verify`, `GET /api/v1/head-nurse/audit-control`.

## Unit Nurse

### Assigned Patients
- Routes: `/unit-nurse`, `/icu-command-center/nursing/assigned-patients`.
- Sections: assigned patient list, patient tabs overview/monitoring/results/events/shift-summary.
- Required backend data: authenticated unit nurse, assigned patients, patient summaries, tasks.
- Actions: open patient, filter, view tabs.
- API dependency: `GET /api/v1/unit-nurse/assigned-patients`.

### Unit Monitoring and Assignment
- Routes: `/unit-nurse/monitoring`, `/ward-assignment`.
- Required backend data: unit patients, nurse-to-patient assignment, workload, ward/bed links.
- Actions: assign/reassign patient, update ward assignment, monitor unit status.
- API dependency: `GET /api/v1/unit-nurse/dashboard`, `POST /api/v1/unit-nurse/patient-assignments`.

### Handover, Issues, Escalation
- Routes: `/unit-nurse/handover-submit`, `/issue-review`, `/escalation`.
- Required backend data: unit handover, issues raised by ward nurses, escalation queue.
- Actions: submit unit handover, review issue, escalate/resolve.
- API dependency: `POST /api/v1/unit-nurse/handovers`, `GET /api/v1/unit-nurse/issues`, `POST /api/v1/escalations`.

## Static Dummy Data and Hardcoded Values to Backend Mapping

- Patient names, UHID/MRN, bed numbers, doctor/nurse names: map to `Patient`, `Admission`, `Bed`, `User`, `StaffAssignment`.
- ICU bed options/statuses: map to `Bed`, `BedHistory`, `BedAllocation`.
- Existing admission patients: map to `AdmissionRequest` and `Admission`.
- Blood groups, gender, referral type, patient status, risk, isolation, admission readiness: map to centralized enums/config endpoints.
- Medication static rows and color indicators: map to `MedicationHistory` and medication risk/color enum.
- Head nurse mock admissions/config: map to `AdmissionRequest`, `NurseAssignment`, `Handover`, `Escalation`, `AuditLog`.
- Dashboard cards/charts: map to summary endpoints and trend endpoints.

## Real-Time Requirements

- ICU bed occupancy and bed status changes.
- Critical vitals and EWS alerts.
- Device connectivity/signal health alarms.
- New doctor orders and discontinued orders.
- Medication overdue/task overdue.
- Admission queue state changes.
- Transfer/discharge state changes.
- Escalation ownership/SLA updates.
- Notifications.

Recommended transport: WebSocket/SSE channel `/api/v1/realtime/icu-events` with event types documented in `entity-json-schemas.md`.

## Unresolved Frontend Ambiguities

- Some `/head-nurse/**`, `/ward-nurse/**`, and `/unit-nurse/**` routes are thin wrappers around ICU command/nursing components; backend should expose both route aliases to the same canonical resources.
- Some dashboard and analytics screens are generated from static/mock datasets; exact chart grouping should be confirmed with stakeholders before production aggregation queries are locked.
- Admission module currently contains mock ID-proof address fetch. Production Aadhaar/passport/DL fetch requires legal/compliance approval and a verified KYC provider.
- Doctor IPD patient details tabs are extensible; backend should return feature flags and available tab metadata per admission/role.
