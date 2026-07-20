# Plasmit Hospital HMS API Contract Planning Document

## Document Control

| Item | Value |
| --- | --- |
| Document Type | API Contract Planning / Software Design Document |
| Scope | Backend API module planning for the existing Plasmit Hospital HMS frontend |
| Current Application State | Next.js frontend-only HMS with mock data, local workflow state, role-aware navigation, and no implemented App Router backend API handlers |
| Source Review | `src/app`, `src/features`, `src/data`, `src/config`, `src/types`, `README.md`, existing docs |
| Out of Scope | Database entities, SQL, DTOs, models, controllers, services, repositories, backend code, frontend code |

## Executive Summary

The existing project is an enterprise HMS frontend prototype for a single-hospital, multi-department workflow. It includes mature route coverage for Reception, Admission, IPD, ICU Command Center, Nursing ICU, Ward Nurse, Unit Nurse, Head Nurse, Diagnostics, Billing, Pharmacy, Inventory, HRMS, Reports, Integrations, Compliance, and role-based navigation.

No backend API routes are currently implemented in the Next.js application. The system uses static data from `src/data`, local state, and browser `localStorage` for demo workflows. Some data files include future API references as planning placeholders, and one patient document extraction integration is wired through a configurable external backend URL. Therefore, this document treats the current system as API-ready frontend scope and defines the enterprise module contract sequence needed before endpoint-level design.

## Existing API Assessment

| Area | Finding |
| --- | --- |
| Implemented backend APIs | No in-repository App Router API handlers were found. |
| Mock API references | Future API references exist in clinical examination, ICU monitoring, and billing desk data files. These should be treated as placeholders, not implemented contracts. |
| External integration candidate | Patient document extraction uses a configurable document AI backend URL. |
| State persistence | Auth role, UI preferences, admission workflow, POCT, billing desk, notes, radiology workspace, head nurse workflow, and patient records use browser storage. |
| API readiness | Strong frontend module coverage exists, but backend contract normalization, shared authorization, audit, and master-data governance are missing. |

## Existing Role-Based Access

| Role | Existing Access Pattern |
| --- | --- |
| ICU Admin | Not named exactly; closest existing roles are `ICU`, `Hospital Admin`, `Nurse ICU`, `Nurse ICU 2`, and ICU Command Center administration routes. |
| IPD | Existing IPD module is under clinical routes; `Doctor IPD`, `Nurse`, `Hospital Admin`, and admission roles interact with it. |
| Ward Nurse | Explicit role with bedside patient overview, nurse entry, medication, intake/output, handover, issue escalation, tasks, notes, and early warning score routes. |
| Unit Nurse | Explicit role with assigned patients, patient tabs, monitoring, escalation and ward assignment surfaces. |
| Head Nurse | Explicit role with admission queue, admission review, unit availability, staff availability, patient assignment, handover verification, escalations, alerts/delays, and audit control. |
| Reception | Existing role is named `Receptionist`; routes cover dashboard, patient registration/search, appointment booking, OPD queue, admission reception, and billing snapshot. |

## Missing Enterprise API Capabilities

- Central authentication and session lifecycle APIs.
- User, role, permission, and policy administration APIs.
- Hospital master setup APIs for departments, wards, units, beds, rooms, doctors, nurses, tariffs, service catalog, templates, and configuration.
- Patient identity, UHID, duplicate detection, consent, ABHA, document, and family/contact APIs.
- Admission orchestration APIs connecting reception, doctor order, billing clearance, bed manager, nurse receive, nurse care, and QR generation.
- IPD census, bed transfer, rounds, nursing station, medication, intake/output, care plan, package utilization, and discharge APIs.
- ICU command center APIs for patient board, smart bed, monitoring, devices, escalations, Tele-ICU, risk scoring, analytics, and audit.
- Ward Nurse, Unit Nurse, and Head Nurse task ownership, handover, escalation, and acknowledgement APIs.
- Clinical order, diagnostics, pharmacy, blood bank, billing, and insurance integration APIs.
- Report, audit, compliance, notification, and integration APIs.

## Step 2 - Module List Only

### ICU Admin

1. ICU Command Center
2. ICU Patient Search
3. ICU Smart Bed View
4. ICU Admissions
5. ICU Discharges
6. ICU Operations
7. ICU Monitoring
8. ICU Device Operations
9. ICU Diagnostics Hub
10. ICU Escalation Center
11. Tele ICU
12. ICU Analytics
13. ICU Configuration
14. ICU Users & Roles
15. ICU Audit Logs

### IPD

1. IPD Admissions
2. IPD Bed & Ward Management
3. IPD Nursing Station
4. IPD Doctor Rounds
5. IPD Medication Administration
6. IPD Nursing Assessment
7. IPD Intake / Output
8. IPD Transfers
9. IPD Packages
10. IPD Discharge
11. IPD Billing

### Ward Nurse

1. Ward Nurse Assigned Patient
2. Ward Nurse Nurse Entry
3. Ward Nurse Early Warning Score
4. Ward Nurse Intake / Output Update
5. Ward Nurse Medicine Receive & Verify
6. Ward Nurse Order
7. Ward Nurse Medication Administration
8. Ward Nurse Nursing Notes
9. Ward Nurse Tasks & Assessments
10. Ward Nurse Patient Event Update
11. Ward Nurse Shift Pending Summary
12. Ward Nurse Shift Handover
13. Ward Nurse Raise Issue

### Unit Nurse

1. Unit Nurse Assigned Patients
2. Unit Nurse Ward Assignment
3. Unit Nurse Monitoring
4. Unit Nurse Issue Review
5. Unit Nurse Escalation
6. Unit Nurse Handover Submit

### Head Nurse

1. Head Nurse Console
2. Head Nurse Admission Queue
3. Head Nurse Admission Review
4. Head Nurse New Admissions
5. Head Nurse Unit Availability
6. Head Nurse Staff Availability
7. Head Nurse Patient Assignment
8. Head Nurse Unit Assignment
9. Head Nurse Alerts & Delays
10. Head Nurse Escalations
11. Head Nurse Shift Handover
12. Head Nurse Handover Verification
13. Head Nurse Audit Control

### Reception

1. Receptionist Dashboard
2. Patient Registration
3. Patient Search
4. Appointment Booking
5. OPD Queue
6. Admission Reception
7. Front Office Billing
8. Billing Desk
9. Insurance Desk
10. Admission QR Generation

### Cross-Role Foundation

1. Authentication
2. User Management
3. Role Management
4. Permission Management
5. Department & Unit Master Setup
6. Bed Master Setup
7. Patient Identity
8. Notifications & Tasks
9. Audit Trail
10. Reports
11. Settings & Configuration
12. Integrations

## Step 4 - Development Sequence

### Phase 1 - Foundation

- Authentication
- User Management
- Role Management
- Permission Management
- Department & Unit Master Setup
- Bed Master Setup
- Audit Trail
- Notifications & Tasks

### Phase 2 - Reception

- Receptionist Dashboard
- Patient Registration
- Patient Search
- Appointment Booking
- OPD Queue
- Admission Reception
- Admission QR Generation
- Front Office Billing

### Phase 3 - IPD

- IPD Admissions
- IPD Bed & Ward Management
- IPD Nursing Station
- IPD Doctor Rounds
- IPD Medication Administration
- IPD Nursing Assessment
- IPD Intake / Output
- IPD Transfers
- IPD Packages
- IPD Discharge
- IPD Billing

### Phase 4 - ICU

- ICU Command Center
- ICU Patient Search
- ICU Smart Bed View
- ICU Admissions
- ICU Discharges
- ICU Operations
- ICU Monitoring
- ICU Device Operations
- ICU Diagnostics Hub
- ICU Escalation Center
- Tele ICU
- ICU Analytics
- ICU Configuration
- ICU Users & Roles
- ICU Audit Logs

### Phase 5 - Nursing

- Ward Nurse Assigned Patient
- Ward Nurse Documentation
- Ward Nurse Medication Workflow
- Ward Nurse Tasks & Assessments
- Ward Nurse Shift Handover
- Ward Nurse Issue Escalation
- Unit Nurse Assigned Patients
- Unit Nurse Monitoring
- Unit Nurse Issue Review
- Unit Nurse Escalation
- Head Nurse Console
- Head Nurse Admission Review
- Head Nurse Staff & Unit Availability
- Head Nurse Patient Assignment
- Head Nurse Handover Verification
- Head Nurse Audit Control

### Phase 6 - Reports

- Operational Reports
- Clinical Reports
- Bed Occupancy Reports
- Doctor Performance Reports
- Audit Reports
- Revenue Analytics
- MIS Reports
- Custom Report Builder

### Phase 7 - Settings

- Hospital Setup
- Departments
- Roles
- Permissions
- Security Policy
- ICU Configuration
- Assessment Configuration
- LDT Configuration
- Integrations
- Compliance Settings

## Enterprise Dependency Map

| Module | Depends On | Used By | Blocking Modules | Optional Modules |
| --- | --- | --- | --- | --- |
| Authentication | None | All modules | User Management, Role Management, Permission Management | MFA, SSO |
| User Management | Authentication | Role workflows, audit, task ownership | All role-based modules | HRMS |
| Role Management | Authentication, User Management | All access decisions | Permission Management, role dashboards | Custom roles |
| Permission Management | Role Management | Route/API authorization | Clinical, billing, ICU, reports | Policy engine |
| Department & Unit Master Setup | Authentication | IPD, ICU, Head Nurse, Unit Nurse | Bed Master, staff assignment | HRMS |
| Bed Master Setup | Department & Unit Master Setup | Admission, IPD, ICU, Head Nurse | Bed allocation, transfer, discharge | Device mapping |
| Patient Identity | Authentication | Reception, IPD, ICU, diagnostics, billing | Admissions, clinical records | ABHA, duplicate detection |
| Notifications & Tasks | Authentication, User Management | Nursing, ICU, IPD, escalation | Task workflows | SMS, WhatsApp, push |
| Audit Trail | Authentication, User Management | Compliance, clinical governance | High-risk clinical/billing changes | Audit reports |
| Receptionist Dashboard | Authentication, Patient Identity | Reception staff | Registration, appointment, admission queues | Billing snapshot |
| Patient Registration | Receptionist Dashboard, Patient Identity | OPD, IPD, ICU, Billing | Admission Reception, Appointment Booking | ABHA consent |
| Patient Search | Patient Identity | All patient-centric modules | Clinical context loading | Global search |
| Appointment Booking | Patient Registration, Doctor availability | OPD Queue, Billing | OPD visit flow | Teleconsultation |
| OPD Queue | Appointment Booking, Patient Registration | Doctors, Reception | OPD consultation | Token display |
| Admission Reception | Patient Registration, Patient Search | IPD Admissions, Bed Manager, Billing | Admission workflow | Emergency unknown patient |
| Admission QR Generation | Admission Reception | Nurse receive, patient journey | Nurse receive | QR scan audit |
| Front Office Billing | Patient Registration, Appointment Booking | Billing Desk, OPD Queue | OPD token release | Discounts |
| Billing Desk | Patient Identity, service catalog | IPD Billing, Reception, Insurance | Billing clearance | Refunds |
| Insurance Desk | Patient Identity, Billing Desk | IPD Billing, Admission clearance | Pre-auth workflows | TPA integrations |
| IPD Admissions | Admission Reception, Bed Master, Billing Desk | IPD, Nursing, ICU transfer | IPD Nursing Station | Admission QR |
| IPD Bed & Ward Management | Bed Master, IPD Admissions | Head Nurse, Unit Nurse, Transfers | Bed allocation | Housekeeping |
| IPD Nursing Station | IPD Admissions, Bed & Ward Management | Ward Nurse, Head Nurse | Nursing tasks | Nurse dashboard |
| IPD Doctor Rounds | IPD Admissions, Patient Identity | Orders, discharge, diagnostics | Care plan updates | Remote consult |
| IPD Medication Administration | Doctor Orders, Pharmacy | Ward Nurse, IPD | eMAR | High-risk verification |
| IPD Nursing Assessment | IPD Admissions, Nursing Station | Ward Nurse, Head Nurse | Care plans | Assessment templates |
| IPD Intake / Output | IPD Admissions, Nursing Station | Ward Nurse, Doctor, Renal | Fluid balance | Device integration |
| IPD Transfers | Bed & Ward Management, Admissions | IPD, ICU, Discharge | Transfer workflows | Transport |
| IPD Packages | Billing Desk, IPD Admissions | Billing, Insurance | Package utilization | Package masters |
| IPD Discharge | IPD Admissions, Billing Desk, Doctor Rounds | Reception, Billing, Reports | Bed release | Follow-up |
| IPD Billing | Billing Desk, IPD Admissions, Insurance Desk | Discharge, Finance | Billing clearance | Payment gateway |
| ICU Command Center | Authentication, Patient Identity, Bed Master | ICU Admin, ICU roles | ICU patient board | Executive dashboard |
| ICU Patient Search | ICU Command Center, Patient Identity | ICU Admin, Head Nurse, Unit Nurse | Patient context | Timeline |
| ICU Smart Bed View | ICU Command Center, Bed Master, Device Mapping | ICU Admin, Head Nurse | Bed/device oversight | Signal health |
| ICU Admissions | Admission Reception, Bed Master, ICU Command Center | Head Nurse, Unit Nurse | ICU bed allocation | Emergency flow |
| ICU Discharges | ICU Admissions, Billing, Clinical clearance | IPD, Reception | Bed release | Discharge summary |
| ICU Operations | ICU Command Center, Bed Master | ICU Admin, Management | Census operations | Capacity analytics |
| ICU Monitoring | ICU Admissions, Patient Identity | ICU Admin, Ward Nurse, Unit Nurse, Doctors | Escalations, trends | Device feeds |
| ICU Device Operations | Bed Master, ICU Monitoring | ICU Admin, Biomedical | Smart bed, signal health | PACS/devices |
| ICU Diagnostics Hub | Patient Identity, Doctor Orders, Diagnostics | ICU Admin, Doctors, Nurses | Result review | Critical result alerts |
| ICU Escalation Center | Notifications & Tasks, ICU Monitoring | ICU Admin, Head Nurse, Unit Nurse | Clinical escalation | Tele ICU |
| Tele ICU | ICU Command Center, Patient Identity, Escalations | ICU Admin, remote clinicians | Remote review | Video integration |
| ICU Analytics | ICU Command Center, Audit Trail | ICU Admin, Management | Reports | Predictive analytics |
| ICU Configuration | Role Management, Bed Master | ICU Admin | ICU thresholds | Advanced rules |
| ICU Users & Roles | User Management, Role Management | ICU Admin | ICU access governance | Custom teams |
| ICU Audit Logs | Audit Trail | ICU Admin, compliance | Audit review | Export |
| Ward Nurse Assigned Patient | Patient Assignment, IPD/ICU Admissions | Ward Nurse | All ward nurse actions | Patient tabs |
| Ward Nurse Nurse Entry | Assigned Patient | Ward Nurse, Unit Nurse | Vitals/EWS | Device vitals import |
| Ward Nurse Early Warning Score | Nurse Entry, ICU Monitoring | Ward Nurse, Unit Nurse, Head Nurse | Escalation triggers | Scoring engine |
| Ward Nurse Intake / Output Update | Assigned Patient | Ward Nurse, Doctors | Fluid balance | Renal module |
| Ward Nurse Medicine Receive & Verify | Pharmacy, Doctor Orders | Ward Nurse | Medication administration | Barcode scan |
| Ward Nurse Order | Doctor Orders | Ward Nurse | Order acknowledgement | Care plans |
| Ward Nurse Medication Administration | Medicine Receive & Verify | Ward Nurse, Unit Nurse | eMAR completion | Double verification |
| Ward Nurse Nursing Notes | Assigned Patient | Ward Nurse, Doctors, Head Nurse | Handover | Templates |
| Ward Nurse Tasks & Assessments | Notifications & Tasks, Assigned Patient | Ward Nurse, Unit Nurse | Task closure | Assessment config |
| Ward Nurse Patient Event Update | Assigned Patient | Ward Nurse, Unit Nurse | Event timeline | Escalation |
| Ward Nurse Shift Pending Summary | Tasks, Medication, Notes | Ward Nurse, Unit Nurse | Shift handover | Whole-shift summary |
| Ward Nurse Shift Handover | Shift Pending Summary | Unit Nurse, Head Nurse | Handover verification | Handover print |
| Ward Nurse Raise Issue | Assigned Patient, Tasks | Unit Nurse, Head Nurse | Escalation review | Attachment |
| Unit Nurse Assigned Patients | Patient Assignment | Unit Nurse | Unit supervision | Workload view |
| Unit Nurse Ward Assignment | Head Nurse Assignment, Bed Master | Unit Nurse, Ward Nurse | Patient ownership | Staffing |
| Unit Nurse Monitoring | Assigned Patients, ICU Monitoring | Unit Nurse, Head Nurse | Issue review | Trends |
| Unit Nurse Issue Review | Ward Nurse Raise Issue | Unit Nurse, Head Nurse | Escalation | SLA rules |
| Unit Nurse Escalation | Issue Review, Notifications | Head Nurse, ICU Admin | Escalation center | Tele ICU |
| Unit Nurse Handover Submit | Shift Handover | Head Nurse | Handover verification | Audit |
| Head Nurse Console | Authentication, Patient Assignment | Head Nurse | Nursing governance | ICU dashboard |
| Head Nurse Admission Queue | Admissions, Bed Master | Head Nurse, Unit Nurse | Admission review | QR |
| Head Nurse Admission Review | Admission Queue | Head Nurse, Unit Nurse | Patient assignment | Billing context |
| Head Nurse New Admissions | Admission Review | Head Nurse | Assignment queue | Alerts |
| Head Nurse Unit Availability | Bed Master, Staff availability | Head Nurse, ICU Admin | Patient assignment | Occupancy analytics |
| Head Nurse Staff Availability | User Management, HRMS | Head Nurse | Patient assignment | Shift roster |
| Head Nurse Patient Assignment | Unit Availability, Staff Availability | Unit Nurse, Ward Nurse | Assigned patient workflows | Auto-assignment |
| Head Nurse Unit Assignment | Unit Availability | Head Nurse, Unit Nurse | Unit coverage | Skill matrix |
| Head Nurse Alerts & Delays | Notifications, Tasks, Escalations | Head Nurse | Escalation response | SLA dashboard |
| Head Nurse Escalations | Unit Nurse Escalation, ICU Escalation Center | Head Nurse, ICU Admin | Closure workflow | Tele ICU |
| Head Nurse Shift Handover | Ward/Unit handovers | Head Nurse | Handover verification | Print/export |
| Head Nurse Handover Verification | Shift Handover, Audit Trail | Head Nurse | Shift closure | Compliance report |
| Head Nurse Audit Control | Audit Trail, Handover Verification | Head Nurse, Compliance | Nursing governance | Audit exports |
| Reports | Audit Trail, operational modules | Management, admins, roles | MIS, analytics | Scheduled reports |
| Settings & Configuration | Foundation modules | Admins, ICU Admin | Master governance | Approval workflow |
| Integrations | Authentication, Settings | External systems | ABHA, FHIR, PACS, SMS | Webhooks |

# Authentication

## Purpose

Establish secure staff access and session governance across all HMS modules.

## Description

The current frontend stores demo authentication state in browser storage and supports role-specific login routes. The backend API contract must convert this into a centralized authentication service with session lifecycle, password reset, OTP verification, role claims, scope claims, and audit hooks.

## Accessible Roles

All roles.

## Dependencies

Depends on no business module. Used by every clinical, operational, nursing, ICU, billing, reporting, and configuration module.

## Business Flow

Staff member signs in, the system validates credentials, assigns the active role and scope, issues a secure session, loads route/API permissions, and writes an audit event. Session refresh, logout, failed login, lockout, and password reset must be centrally governed.

## Development Priority

API Priority: High. Recommended Development Order: 1.

## Future APIs

Authentication, logout, session refresh, password reset, OTP verification, active session lookup, access scope resolution, and security event capture.

# User Management

## Purpose

Manage hospital staff users, employee identity, account status, and module ownership.

## Description

The UI contains administrative user records and role-driven workflow ownership. Backend APIs must support user creation, activation, locking, department assignment, designation mapping, contact details, and auditability.

## Accessible Roles

Hospital Admin, ICU Admin, Head Nurse for nursing-scoped assignment visibility, Management for read-only governance.

## Dependencies

Depends on Authentication. Used by Role Management, Permission Management, Head Nurse staffing, Unit Nurse assignment, audit trails, notifications, and reports.

## Business Flow

Admin creates or updates a staff account, maps the user to department/unit and role, validates status, and makes the user available for assignment, task ownership, escalation, and audit records.

## Development Priority

API Priority: High. Recommended Development Order: 2.

## Future APIs

User directory, account lifecycle, staff lookup, user status, department assignment, role assignment, lock/unlock, and profile audit.

# Role Management

## Purpose

Define enterprise roles and default landing routes matching the existing frontend role conventions.

## Description

Existing roles include Hospital Admin, ICU, Unit Nurse, Head Nurse, Ward Nurse, Receptionist, Doctor IPD, Nurse ICU, Billing Executive, and others. The backend contract must preserve these names while optionally introducing the business alias `ICU Admin` as a scoped admin capability over ICU Command Center.

## Accessible Roles

Hospital Admin, ICU Admin, Management.

## Dependencies

Depends on Authentication and User Management. Used by Permission Management, navigation access, API authorization, and module ownership.

## Business Flow

Admin maintains role definitions, assigns users to roles, sets default routes, and governs role availability by department or unit.

## Development Priority

API Priority: High. Recommended Development Order: 3.

## Future APIs

Role catalogue, role assignment, role default route, role status, role scope, and role audit.

# Permission Management

## Purpose

Control page, feature, action, and sensitive operation access for each role.

## Description

The current app has route-level permission logic and nursing persona-specific access. Backend APIs must enforce these rules server-side and support action-level authorization for clinical sign-off, medication verification, bed allocation, billing clearance, handover verification, and audit exports.

## Accessible Roles

Hospital Admin, ICU Admin, Management; read-only access for audit roles when introduced.

## Dependencies

Depends on Role Management. Used by all modules.

## Business Flow

Authorized admin configures permission policies, the backend evaluates access for every protected API capability, and sensitive changes generate audit entries.

## Development Priority

API Priority: High. Recommended Development Order: 4.

## Future APIs

Permission catalogue, role permission assignment, action authorization, route authorization, sensitive action policy, and permission audit.

# Department & Unit Master Setup

## Purpose

Create the organizational structure required for IPD, ICU, nursing, diagnostics, billing, and reporting.

## Description

The frontend includes departments, wards, ICU units, nurse stations, and hospital setup pages. Backend APIs must establish master records for operating units without exposing database design in this planning stage.

## Accessible Roles

Hospital Admin, ICU Admin for ICU-scoped units, Management read-only.

## Dependencies

Depends on Authentication, User Management, and Role Management. Used by Bed Master Setup, Admissions, IPD, ICU, Head Nurse, Unit Nurse, reports, and settings.

## Business Flow

Hospital admin configures departments and units, assigns clinical and administrative ownership, and enables downstream workflows such as bed assignment, staffing, admissions, and reports.

## Development Priority

API Priority: High. Recommended Development Order: 5.

## Future APIs

Department catalogue, unit catalogue, nurse station catalogue, department status, unit ownership, and organization audit.

# Bed Master Setup

## Purpose

Govern beds, wards, room types, ICU beds, isolation capability, and operational bed status.

## Description

The existing IPD and admission workflows use beds with statuses such as Available, Occupied, Reserved, Cleaning, Maintenance, Isolation, and Blocked. Backend APIs must make bed status authoritative for admission, transfer, discharge, smart bed, and occupancy reporting.

## Accessible Roles

Hospital Admin, ICU Admin, Head Nurse, Unit Nurse, Reception read-only for admission availability, IPD.

## Dependencies

Depends on Department & Unit Master Setup. Used by Admission Reception, IPD Admissions, IPD Transfers, ICU Smart Bed View, Head Nurse Unit Availability, and reports.

## Business Flow

Admin configures beds and wards; bed managers or authorized nursing leads reserve, occupy, clean, maintain, block, or release beds based on patient movement.

## Development Priority

API Priority: High. Recommended Development Order: 6.

## Future APIs

Bed catalogue, bed status, ward occupancy, bed reservation, bed release, bed maintenance, isolation flagging, and bed audit.

# Patient Identity

## Purpose

Provide a single patient identity layer for registration, admissions, clinical workflows, billing, and reporting.

## Description

The current app includes patients, patient details, patient history, duplicates, ABHA, consents, portal, family, documents, and visits. Backend APIs must establish authoritative UHID, duplicate prevention, consent capture, and patient context retrieval.

## Accessible Roles

Reception, IPD, ICU Admin, Ward Nurse, Unit Nurse, Head Nurse, Hospital Admin, Doctor IPD, Billing Executive, diagnostics roles.

## Dependencies

Depends on Authentication. Used by all patient-centric modules.

## Business Flow

Reception or authorized staff searches for a patient, registers a new patient if needed, resolves duplicates, captures consent and contacts, then makes the patient available for appointments, admission, clinical documentation, billing, and reporting.

## Development Priority

API Priority: High. Recommended Development Order: 7.

## Future APIs

Patient lookup, registration, duplicate check, UHID management, demographic update, ABHA consent, family/contact capture, document attachment, visit history, and patient audit.

# Notifications & Tasks

## Purpose

Coordinate clinical and operational task assignment, reminders, alerts, acknowledgements, and escalations.

## Description

The frontend includes notifications, worklist, ICU notifications and tasks, nursing tasks, pending orders, pending medicines, pending vitals, critical alerts, and escalation queues. Backend APIs must provide a consistent task and notification contract.

## Accessible Roles

All clinical and operational roles based on assigned scope.

## Dependencies

Depends on Authentication and User Management. Used by Ward Nurse, Unit Nurse, Head Nurse, ICU Admin, IPD, Reception, diagnostics, billing, and reports.

## Business Flow

System or user creates a task/notification, assigns an owner and due time, tracks status and SLA, and escalates if delayed or clinically critical.

## Development Priority

API Priority: High. Recommended Development Order: 8.

## Future APIs

Task queue, notification feed, acknowledgement, reassignment, due/overdue tracking, priority updates, escalation trigger, and closure evidence.

# Audit Trail

## Purpose

Record who did what, when, from where, and why across clinical, billing, nursing, security, and configuration changes.

## Description

The app includes audit logs, audit trail, activity, sessions, compliance, access control, and head nurse audit control screens. Backend APIs must make all high-risk actions traceable.

## Accessible Roles

Hospital Admin, ICU Admin, Head Nurse for nursing scope, Management, compliance users when introduced.

## Dependencies

Depends on Authentication, User Management, Role Management, and Permission Management. Used by all modules.

## Business Flow

Every sensitive action emits an audit event with actor, patient/module context, previous state, new state classification, source, and reason when required.

## Development Priority

API Priority: High. Recommended Development Order: 9.

## Future APIs

Audit event capture, audit search, audit export, session audit, access audit, clinical audit, billing audit, and configuration audit.

# Receptionist Dashboard

## Purpose

Give Reception a command view of registration, appointments, OPD queue, admission requests, patient search, and billing snapshot.

## Description

The existing Receptionist Dashboard shows token queue, registrations, appointments, billing due, patient registration, appointment booking, OPD queue, admission desk, and patient search.

## Accessible Roles

Reception.

## Dependencies

Depends on Authentication, Patient Identity, Appointment Booking, Admission Reception, Front Office Billing, and Notifications & Tasks.

## Business Flow

Reception starts each workflow from a queue-based dashboard, completes patient lookup/registration, books appointments or starts admission reception, and verifies billing-sensitive handoffs.

## Development Priority

API Priority: High. Recommended Development Order: 10.

## Future APIs

Reception dashboard summary, work queues, handover reminders, billing snapshot, and queue counts.

# Patient Registration

## Purpose

Capture new patient details and maintain demographic readiness for OPD/IPD/ICU workflows.

## Description

Existing routes include patient registration, emergency register, duplicates, ABHA, patient details, documents, family, visits, consents, and portal.

## Accessible Roles

Reception, Hospital Admin, IPD, ICU Admin read-only as needed, billing and clinical roles by patient context.

## Dependencies

Depends on Patient Identity and Receptionist Dashboard. Used by Appointment Booking, Admission Reception, Billing Desk, IPD Admissions, ICU Admissions, and Reports.

## Business Flow

Reception searches for an existing patient, performs duplicate checks, registers a new patient when required, captures consent/contact details, and routes the patient to appointment, billing, or admission.

## Development Priority

API Priority: High. Recommended Development Order: 11.

## Future APIs

Registration intake, patient update, duplicate resolution, consent update, ABHA linking, document capture, family contact update, and registration audit.

# Patient Search

## Purpose

Enable fast patient discovery across reception, IPD, ICU, nursing, diagnostics, and billing workflows.

## Description

Existing patient search appears in `/patients`, ICU Command Center patient search, global search, patient list, and role-specific patient context pages.

## Accessible Roles

Reception, IPD, ICU Admin, Ward Nurse, Unit Nurse, Head Nurse, Doctor IPD, Billing Executive, diagnostics roles, Hospital Admin.

## Dependencies

Depends on Patient Identity and Authentication. Used by nearly every patient-centric module.

## Business Flow

User searches by UHID, name, phone, bed, ward, admission number, or clinical context; the system returns scoped results according to role and access policy.

## Development Priority

API Priority: High. Recommended Development Order: 12.

## Future APIs

Patient search, scoped patient lookup, recent patients, admitted-patient search, ICU patient search, duplicate search, and search audit.

# Appointment Booking

## Purpose

Manage appointment slots, booking, follow-ups, calendar, token generation, and teleconsultation scheduling.

## Description

Existing appointment routes include booking, calendar, schedules, queue, tokens, follow-ups, and teleconsultation. Reception uses this for OPD flow.

## Accessible Roles

Reception, Hospital Admin, Doctor OPD, Billing Executive for billing-related visibility.

## Dependencies

Depends on Patient Registration, Patient Search, User Management, and doctor availability. Used by OPD Queue, Billing Desk, and Reports.

## Business Flow

Reception selects patient and doctor/department, checks availability, books or reschedules appointment, issues token, and sends the patient to billing or OPD queue.

## Development Priority

API Priority: Medium. Recommended Development Order: 13.

## Future APIs

Slot availability, appointment booking, reschedule, cancellation, token generation, follow-up scheduling, calendar view, and appointment audit.

# OPD Queue

## Purpose

Track patients waiting for OPD consultation and release clinically/billing-ready tokens.

## Description

The current OPD module includes queue, consultation, diagnosis, prescriptions, vitals, allergies, procedures, chronic care, vaccinations, notes, and templates.

## Accessible Roles

Reception, Doctor OPD, Nurse, Hospital Admin.

## Dependencies

Depends on Appointment Booking, Patient Registration, Front Office Billing, and Notifications & Tasks. Used by doctor consultation and billing workflows.

## Business Flow

Registered and billed patients enter OPD queue, nursing or reception updates token state, doctor completes consultation, and downstream billing, diagnostics, pharmacy, or admission handoff is initiated.

## Development Priority

API Priority: Medium. Recommended Development Order: 14.

## Future APIs

Queue list, token state, check-in, queue priority, consultation handoff, vitals readiness, and OPD queue audit.

# Admission Reception

## Purpose

Start the admission workflow for old patients, new patient admissions, and emergency unknown patients.

## Description

The admission frontend explicitly models reception, doctor order, admission desk, billing, bed manager, nurse receive, nurse care, and QR generation.

## Accessible Roles

Reception, IPD, Hospital Admin, Billing Executive, Head Nurse, Unit Nurse.

## Dependencies

Depends on Patient Registration, Patient Search, Bed Master Setup, Billing Desk, and Notifications & Tasks. Used by IPD Admissions and ICU Admissions.

## Business Flow

Reception selects admission scenario, identifies or creates patient context, initiates request, doctor/admission desk confirms admission order, billing reviews clearance, bed manager allocates bed, and nursing receives patient.

## Development Priority

API Priority: High. Recommended Development Order: 15.

## Future APIs

Admission request intake, scenario selection, doctor admission order, billing clearance handoff, bed allocation request, nurse receive handoff, admission activity timeline, and admission audit.

# Admission QR Generation

## Purpose

Create a scannable admission reference for patient movement and nursing receive workflows.

## Description

The existing admission store supports QR reference generation after an active admission request is selected.

## Accessible Roles

Reception, Admission Desk, IPD, Head Nurse, Unit Nurse, Ward Nurse read-only after handoff.

## Dependencies

Depends on Admission Reception and Patient Identity. Used by Nurse Receive, patient movement, and admission audit.

## Business Flow

After admission request creation, authorized staff generates a QR reference that accompanies the patient and can be validated during nurse receive or transfer.

## Development Priority

API Priority: Medium. Recommended Development Order: 16.

## Future APIs

QR generation, QR validation, QR status, QR reissue, patient movement validation, and QR audit.

# Front Office Billing

## Purpose

Collect front-office charges required before OPD queue release or admission clearance.

## Description

Reception dashboard exposes billing due and OPD/IPD billing snapshots. Billing desk pages cover patients, tests, packages, bill summary, and payment.

## Accessible Roles

Reception, Billing Executive, Hospital Admin, Management read-only.

## Dependencies

Depends on Patient Registration, Appointment Booking, Billing Desk, and service catalog configuration.

## Business Flow

Reception or billing staff selects patient, adds applicable services/tests/packages, applies policy-controlled discounts if allowed, collects payment, and releases queue/admission clearance.

## Development Priority

API Priority: High. Recommended Development Order: 17.

## Future APIs

Billing snapshot, charge selection, bill draft, bill confirmation, payment capture, receipt generation, refund initiation, and billing audit.

# Billing Desk

## Purpose

Provide the enterprise billing workbench for patient services, tests, packages, invoices, payments, refunds, tariffs, discounts, TPA, and insurance.

## Description

Existing routes cover billing worklist, IPD, OPD, invoices, payments, receipts, advances, refunds, credit, discounts, tariffs, packages, insurance, and TPA.

## Accessible Roles

Billing Executive, Hospital Admin, Reception for front-office scope, IPD for admission/discharge clearance visibility, Management read-only.

## Dependencies

Depends on Patient Identity, Front Office Billing, service catalog, tariffs, and Audit Trail. Used by Admission Reception, IPD Billing, Insurance Desk, IPD Discharge, and Reports.

## Business Flow

Billing staff manages financial transactions, service charges, package application, discounts, payment collection, refunds, invoices, advances, credit, and clearance decisions.

## Development Priority

API Priority: High. Recommended Development Order: 18.

## Future APIs

Billing worklist, bill draft, invoice lifecycle, payment collection, receipt management, advance payment, refund, discount approval, tariff lookup, package billing, and billing audit.

# Insurance Desk

## Purpose

Manage insurance company, TPA, policy, package mapping, claims, rejection, and settlement workflows.

## Description

Existing insurance routes include claims, companies, TPA, package mapping, policies, rejections, and settlements.

## Accessible Roles

Billing Executive, Hospital Admin, Reception read-only for patient clearance, Management read-only.

## Dependencies

Depends on Patient Identity, Billing Desk, IPD Admissions, and Audit Trail. Used by IPD Billing, Admission Reception, and Discharge.

## Business Flow

Insurance desk verifies policy, initiates pre-authorization, maps package eligibility, tracks claims and rejections, and provides financial clearance for admission/discharge.

## Development Priority

API Priority: Medium. Recommended Development Order: 19.

## Future APIs

Policy verification, company/TPA catalogue, pre-auth workflow, package mapping, claim lifecycle, rejection workflow, settlement tracking, and insurance audit.

# IPD Admissions

## Purpose

Manage admitted patient entry into inpatient care.

## Description

The IPD module includes admissions, admission details, ICU sub-route, nursing station, beds, wards, rounds, medication, assessment, intake/output, transfers, packages, and discharge.

## Accessible Roles

IPD, Doctor IPD, Hospital Admin, Head Nurse, Unit Nurse, Ward Nurse, Billing Executive by clearance scope.

## Dependencies

Depends on Admission Reception, Bed Master Setup, Patient Identity, Billing Desk, and Notifications & Tasks. Used by all IPD modules and ICU transfers.

## Business Flow

Admission request is accepted, billing/bed status is verified, patient is admitted to assigned ward/bed, nursing station receives context, and clinical care starts.

## Development Priority

API Priority: High. Recommended Development Order: 20.

## Future APIs

Admission list, admission detail, admission status, patient-bed binding, admission activity, clinical handoff, billing clearance status, and admission audit.

# IPD Bed & Ward Management

## Purpose

Control IPD bed availability, ward census, nurse station mapping, and bed movement.

## Description

Existing mock data models wards and beds with status, location, room type, nurse station, consultant, patient, and operational state.

## Accessible Roles

IPD, Head Nurse, Unit Nurse, Hospital Admin, Reception read-only for admission availability.

## Dependencies

Depends on Bed Master Setup and IPD Admissions. Used by IPD Transfers, IPD Discharge, Head Nurse Unit Availability, and reports.

## Business Flow

Authorized staff views ward census, reserves or assigns beds, updates cleaning/maintenance/isolation states, and supports transfer or discharge bed release.

## Development Priority

API Priority: High. Recommended Development Order: 21.

## Future APIs

Ward census, bed availability, bed assignment, bed status update, bed transfer readiness, nurse station mapping, and bed audit.

# IPD Nursing Station

## Purpose

Provide the inpatient nursing command surface for assigned beds, pending tasks, medication, handover, and assessment.

## Description

The route `/ipd/nursing-station` and related IPD nursing pages represent the central IPD nursing workflow.

## Accessible Roles

IPD, Ward Nurse, Unit Nurse, Head Nurse, Nurse, Hospital Admin read-only.

## Dependencies

Depends on IPD Admissions, Bed & Ward Management, Notifications & Tasks, and Patient Identity. Used by medication, assessment, intake/output, and handover workflows.

## Business Flow

Nurse station receives active admissions, displays assigned patients and pending work, coordinates vitals, medication, assessments, and handover tasks.

## Development Priority

API Priority: High. Recommended Development Order: 22.

## Future APIs

Nursing station census, assigned beds, pending tasks, nurse workload, patient summary, shift status, and nursing station audit.

# IPD Doctor Rounds

## Purpose

Capture doctor review, progress decisions, orders, diagnosis updates, and clinical follow-up.

## Description

Existing IPD and ICU screens include rounds, progress notes, doctor orders, doctor instructions, and doctor round decisions.

## Accessible Roles

Doctor IPD, IPD, ICU Admin read-only for ICU cases, Ward Nurse read-only/acknowledgement, Unit Nurse, Head Nurse.

## Dependencies

Depends on IPD Admissions, Patient Identity, Clinical Examination, and Doctor Orders. Used by medication, diagnostics, transfer, discharge, and nursing tasks.

## Business Flow

Doctor reviews patient, documents round findings, creates or updates orders, flags care plan changes, and hands off tasks to nursing, diagnostics, pharmacy, or discharge teams.

## Development Priority

API Priority: High. Recommended Development Order: 23.

## Future APIs

Round list, round note, clinical decision, order handoff, doctor instruction, round sign-off, and round audit.

# IPD Medication Administration

## Purpose

Support medication administration and eMAR workflows for admitted patients.

## Description

Existing IPD and nursing routes include medication administration, patient medication, medicine receive and verify, pending medicines, and high-risk workflow hints.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, IPD, Doctor IPD read-only/order owner, Pharmacy, ICU Admin for ICU cases.

## Dependencies

Depends on Doctor Orders, Pharmacy, IPD Nursing Station, Patient Identity, and Audit Trail. Used by nursing handover, task closure, and billing charge capture.

## Business Flow

Medication order is received from doctor/pharmacy, nurse verifies medicine, administers or holds/skips per policy, records reason, and escalates exceptions.

## Development Priority

API Priority: High. Recommended Development Order: 24.

## Future APIs

Medication schedule, medicine receive, verification, administration, hold/skip, late reason, high-risk double check, eMAR history, and medication audit.

# IPD Nursing Assessment

## Purpose

Document nursing assessments, risk scores, checklists, and care readiness.

## Description

Existing routes include nursing assessment, care plans, assessment configuration, task assessments, and nurse care workflows.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, IPD, Hospital Admin for configuration.

## Dependencies

Depends on IPD Nursing Station, Patient Identity, Notifications & Tasks, and assessment configuration. Used by care plans, handover, and reports.

## Business Flow

Nurse completes configured assessment, the system calculates or records risk/status, creates follow-up tasks when required, and exposes results to doctors and nurse supervisors.

## Development Priority

API Priority: Medium. Recommended Development Order: 25.

## Future APIs

Assessment template lookup, assessment capture, risk status, checklist completion, follow-up task generation, assessment review, and assessment audit.

# IPD Intake / Output

## Purpose

Track fluid balance for admitted patients.

## Description

Existing IPD, renal, ward nurse, and ICU routes include intake/output, fluid balance, drains, IV fluids, urine output, and 24-hour charting.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, IPD, Doctor IPD read-only/review, ICU Admin for ICU cases.

## Dependencies

Depends on IPD Admissions, IPD Nursing Station, Patient Identity, and nursing assignment. Used by renal, ICU monitoring, doctor rounds, and reports.

## Business Flow

Nurse records intake and output by shift/time period, reviews balance and alerts, doctor or unit nurse reviews abnormal trends, and unresolved concerns move to tasks or escalation.

## Development Priority

API Priority: Medium. Recommended Development Order: 26.

## Future APIs

Intake capture, output capture, shift summary, 24-hour balance, abnormal balance alert, renal handoff, and intake/output audit.

# IPD Transfers

## Purpose

Move patients between beds, wards, ICU, and departments while preserving clinical, billing, and nursing continuity.

## Description

Existing IPD data includes transfers, ward-to-ICU movement, bed-to-bed movement, and pending bed assignment.

## Accessible Roles

IPD, Head Nurse, Unit Nurse, Reception read-only, Billing Executive by clearance scope, ICU Admin for ICU transfer.

## Dependencies

Depends on IPD Admissions, Bed & Ward Management, Billing Desk, and Notifications & Tasks. Used by ICU Admissions, IPD Nursing Station, and reports.

## Business Flow

Authorized user requests transfer, system checks destination bed and billing/clinical restrictions, assigns receiving owner, captures handover, and updates patient location.

## Development Priority

API Priority: Medium. Recommended Development Order: 27.

## Future APIs

Transfer request, destination availability, approval, transfer handover, receive confirmation, transfer cancellation, and transfer audit.

# IPD Packages

## Purpose

Track IPD package applicability, utilization, exclusions, and warnings.

## Description

Existing IPD routes and billing routes include packages and package utilization data.

## Accessible Roles

Billing Executive, IPD, Hospital Admin, Reception read-only, Insurance Desk, Management read-only.

## Dependencies

Depends on Billing Desk, Insurance Desk, IPD Admissions, and service/package master setup. Used by IPD Billing, Discharge, and Reports.

## Business Flow

Applicable package is linked to admission, utilization is tracked, exclusions or limit warnings are raised, and billing/insurance teams resolve before discharge.

## Development Priority

API Priority: Medium. Recommended Development Order: 28.

## Future APIs

Package lookup, admission package assignment, utilization summary, exclusion tracking, package warning, package billing handoff, and package audit.

# IPD Discharge

## Purpose

Coordinate clinical, nursing, billing, pharmacy, and bed-release steps for inpatient discharge.

## Description

Existing discharge routes include IPD discharge, discharge summary views, discharge follow-up, medication reconciliation, billing clearance, and bed release implications.

## Accessible Roles

IPD, Doctor IPD, Ward Nurse, Unit Nurse, Head Nurse, Billing Executive, Reception, Hospital Admin.

## Dependencies

Depends on IPD Admissions, Doctor Rounds, Medication Administration, Billing Desk, Insurance Desk, Bed & Ward Management, and Audit Trail.

## Business Flow

Doctor initiates discharge, nursing completes checklist and education, pharmacy and billing clear dues, discharge summary is finalized, patient is released, and bed status changes for cleaning/availability.

## Development Priority

API Priority: High. Recommended Development Order: 29.

## Future APIs

Discharge initiation, checklist status, medication reconciliation, discharge summary status, billing clearance, final release, bed release, and discharge audit.

# IPD Billing

## Purpose

Manage inpatient billing, advances, package utilization, insurance clearance, discharge settlement, and receipts.

## Description

Existing billing routes distinguish IPD billing, invoices, payments, advances, discounts, packages, credit, insurance, and refunds.

## Accessible Roles

Billing Executive, IPD read-only clearance, Reception, Hospital Admin, Management read-only.

## Dependencies

Depends on Billing Desk, IPD Admissions, IPD Packages, Insurance Desk, and Audit Trail. Used by IPD Discharge and Finance.

## Business Flow

Billing team tracks active inpatient charges, validates package/insurance status, collects advances or payments, clears discharge settlement, and records invoice/receipt.

## Development Priority

API Priority: High. Recommended Development Order: 30.

## Future APIs

IPD bill summary, active charge ledger, advance payment, interim bill, discharge settlement, payment receipt, refund, and IPD billing audit.

# ICU Command Center

## Purpose

Provide the ICU operational command layer for census, alerts, patient search, smart beds, diagnostics, nursing, devices, escalations, and analytics.

## Description

The existing ICU Command Center is the largest route group, including command, patients, critical care, nursing, device operations, Tele ICU, analytics, administration, executive dashboard, and clinical intelligence.

## Accessible Roles

ICU Admin, ICU, Hospital Admin, Nurse ICU, Nurse ICU 2, Head Nurse, Unit Nurse, Ward Nurse by scoped submodule, Doctor ICU, Management read-only.

## Dependencies

Depends on Authentication, Patient Identity, Bed Master Setup, Department & Unit Master Setup, Notifications & Tasks, and Audit Trail.

## Business Flow

ICU users monitor census and bed status, search patients, review alerts/tasks, coordinate nursing and doctor actions, track devices and diagnostics, escalate risks, and review analytics.

## Development Priority

API Priority: High. Recommended Development Order: 31.

## Future APIs

ICU dashboard summary, command queues, patient board, bed status, notification summary, operational bottlenecks, executive summary, and ICU command audit.

# ICU Patient Search

## Purpose

Find ICU patients by bed, MRN/UHID, status, doctor, risk, ventilator state, or alert profile.

## Description

Existing routes include ICU Command Center patient search and patient detail pages with tabs for overview, monitoring, results, events, shift summary, and collaboration.

## Accessible Roles

ICU Admin, ICU, Head Nurse, Unit Nurse, Ward Nurse within assignment scope, Doctor ICU, Tele ICU Doctor.

## Dependencies

Depends on ICU Command Center and Patient Identity. Used by ICU Monitoring, Smart Bed View, Escalation Center, Tele ICU, and nursing workflows.

## Business Flow

User searches for ICU patient, selects context, backend validates role scope, and returns the patient summary with allowed tabs and modules.

## Development Priority

API Priority: High. Recommended Development Order: 32.

## Future APIs

ICU patient search, patient context, scoped patient tabs, patient timeline summary, active ICU stay lookup, and access audit.

# ICU Smart Bed View

## Purpose

Show bed-wise ICU occupancy, patient priority, live monitoring state, device status, staffing, and patient flow.

## Description

Smart Bed View exists under ICU command patients and Nursing ICU. It depends heavily on bed, device, patient, and monitoring data.

## Accessible Roles

ICU Admin, Head Nurse, Unit Nurse, ICU, Hospital Admin, Management read-only.

## Dependencies

Depends on ICU Command Center, Bed Master Setup, ICU Patient Search, ICU Device Operations, and ICU Monitoring.

## Business Flow

ICU user views bed grid, identifies occupied/reserved/maintenance states, checks patient risk and device signal health, and acts on bottlenecks or escalations.

## Development Priority

API Priority: High. Recommended Development Order: 33.

## Future APIs

Smart bed grid, bed-patient binding, live status snapshot, risk indicators, device indicators, staffing indicators, and smart bed audit.

# ICU Admissions

## Purpose

Handle patient arrival, ICU bed allocation, nurse assignment, doctor assignment, and initial condition capture.

## Description

Existing routes include ICU admissions, Nursing ICU arrival-bed-allocation, head nurse new admissions, admission queue, and patient assignment.

## Accessible Roles

ICU Admin, Head Nurse, Unit Nurse, Admission Desk, Reception read-only handoff, Ward Nurse after assignment.

## Dependencies

Depends on Admission Reception, Bed Master Setup, ICU Command Center, Patient Identity, and Billing Desk.

## Business Flow

ICU admission is requested, head/unit nurse reviews availability, bed and nurse are assigned, patient is received, and monitoring/task workflows start.

## Development Priority

API Priority: High. Recommended Development Order: 34.

## Future APIs

ICU admission queue, admission review, bed allocation, nurse assignment, doctor assignment, initial condition capture, receive confirmation, and ICU admission audit.

# ICU Discharges

## Purpose

Manage ICU discharge, transfer out, bed release, and continuity handoff.

## Description

Existing routes include ICU discharges, transfer-discharge, discharge summaries, and IPD transfer/discharge coordination.

## Accessible Roles

ICU Admin, Head Nurse, Unit Nurse, Doctor ICU, Ward Nurse, Billing Executive, IPD.

## Dependencies

Depends on ICU Admissions, IPD Transfers, Billing Desk, Doctor Rounds, and Bed Master Setup.

## Business Flow

Clinical team marks ICU discharge or transfer readiness, nursing prepares handover, billing/bed destination is checked, patient moves out, and ICU bed status changes.

## Development Priority

API Priority: Medium. Recommended Development Order: 35.

## Future APIs

ICU discharge readiness, transfer-out request, nursing handover, billing clearance, bed release, discharge summary handoff, and ICU discharge audit.

# ICU Operations

## Purpose

Operate ICU census, occupancy, nurse coverage, pending admissions, transfers, and bottlenecks.

## Description

The existing ICU Operations and executive dashboards present operational control and unit-level performance views.

## Accessible Roles

ICU Admin, Hospital Admin, Head Nurse, Management read-only.

## Dependencies

Depends on ICU Command Center, Bed Master Setup, ICU Admissions, Head Nurse staffing, and Notifications & Tasks.

## Business Flow

ICU admin monitors unit capacity and workload, resolves pending admissions or transfer bottlenecks, and reviews owner/action status.

## Development Priority

API Priority: Medium. Recommended Development Order: 36.

## Future APIs

ICU census, unit occupancy, pending admissions, pending transfers, workload summary, bottleneck queue, owner action list, and operations audit.

# ICU Monitoring

## Purpose

Capture and review ICU physiological, device, drain, line, abdominal, renal, neuro, and respiratory monitoring data.

## Description

Existing modules include ICU Monitoring, CVS, temperature, NIBP, arterial BP, CVP, PCWP, abdominal monitoring, drains and tubes, lines and devices, renal, neuro ICU, and early warning scores.

## Accessible Roles

ICU Admin, Ward Nurse, Unit Nurse, Head Nurse, Doctor ICU, Doctor IPD for admitted cases, Tele ICU Doctor read-only/recommendation.

## Dependencies

Depends on ICU Admissions, Patient Identity, ICU Smart Bed View, and Notifications & Tasks. Used by Escalation Center, Tele ICU, Analytics, and Reports.

## Business Flow

Nurse or device feed captures observations, system trends values and identifies threshold breaches, doctors review, and escalations/tasks are created when needed.

## Development Priority

API Priority: High. Recommended Development Order: 37.

## Future APIs

Vitals monitoring, CVS observations, abdominal observations, drain/tube monitoring, line/device monitoring, neuro observations, renal/fluid observations, trend summaries, threshold alerts, and monitoring audit.

# ICU Device Operations

## Purpose

Manage bedside devices, gateways, mapping, signal health, connectivity, downtime, and biomedical action.

## Description

Existing routes include device monitoring, edge device management, device mapping, connectivity dashboard, and signal health.

## Accessible Roles

ICU Admin, Biomedical Engineer, Head Nurse read-only/action visibility, Unit Nurse read-only, Hospital Admin.

## Dependencies

Depends on Bed Master Setup, ICU Smart Bed View, ICU Monitoring, and Integrations. Used by device analytics, signal health, and escalation workflows.

## Business Flow

Device is mapped to bed/patient, signal and connectivity are monitored, downtime creates tasks or escalation, biomedical updates action status, and clinical users see data quality warnings.

## Development Priority

API Priority: Medium. Recommended Development Order: 38.

## Future APIs

Device catalogue, bed-device mapping, patient-device association, signal health, connectivity status, downtime event, biomedical action, and device audit.

# ICU Diagnostics Hub

## Purpose

Unify ICU lab, radiology, pharmacy, critical values, pending reports, and doctor review status.

## Description

Existing ICU Diagnostics Hub includes laboratory, pathology, microbiology, imaging, cardiology, pulmonology, report details, imaging report view, trends/charts, and investigation entry.

## Accessible Roles

ICU Admin, Doctor ICU, Unit Nurse, Ward Nurse read-only/task follow-up, Head Nurse, Diagnostics Team.

## Dependencies

Depends on Patient Identity, Doctor Orders, Diagnostics, Notifications & Tasks, and ICU Command Center.

## Business Flow

ICU team orders or reviews investigations, diagnostics update status/results, critical results trigger alerts, and doctors/nurses acknowledge follow-up tasks.

## Development Priority

API Priority: Medium. Recommended Development Order: 39.

## Future APIs

Investigation summary, lab status, radiology status, critical result alert, report detail, doctor review state, nurse follow-up, and diagnostics hub audit.

# ICU Escalation Center

## Purpose

Centralize escalations for critical alerts, overdue tasks, delayed orders, device failures, abnormal results, and owner handoffs.

## Description

Existing escalation routes include escalation center, escalated cases, source, trigger, severity, owner chain, SLA, current action, and outcome.

## Accessible Roles

ICU Admin, Head Nurse, Unit Nurse, Doctor ICU, Tele ICU Doctor, Biomedical Engineer by device scope.

## Dependencies

Depends on Notifications & Tasks, ICU Monitoring, ICU Diagnostics Hub, ICU Device Operations, and Audit Trail.

## Business Flow

Clinical or operational trigger creates escalation, owner chain is assigned, SLA starts, action is tracked, and closure evidence is recorded.

## Development Priority

API Priority: High. Recommended Development Order: 40.

## Future APIs

Escalation queue, trigger classification, severity assignment, owner chain, SLA tracking, action update, outcome closure, and escalation audit.

# Tele ICU

## Purpose

Support remote intensivist review, consultation readiness, local team coordination, SLA tracking, and remote recommendations.

## Description

Existing routes include remote command center, remote consultations, local team, remote MD, readiness, SLA, and escalated cases.

## Accessible Roles

ICU Admin, Tele ICU Doctor, Doctor ICU, Head Nurse, Unit Nurse, Ward Nurse read-only as assigned.

## Dependencies

Depends on ICU Command Center, ICU Patient Search, ICU Monitoring, ICU Diagnostics Hub, and ICU Escalation Center.

## Business Flow

Patient is marked ready or escalated for remote review, local team context is assembled, remote doctor reviews data, recommendations are logged, and follow-up actions are assigned.

## Development Priority

API Priority: Medium. Recommended Development Order: 41.

## Future APIs

Remote review queue, readiness checklist, local team context, remote doctor assignment, consultation notes, recommendation handoff, SLA tracking, and Tele ICU audit.

# ICU Analytics

## Purpose

Measure ICU occupancy, clinical quality, device performance, adoption, pilot outcome, and operational KPIs.

## Description

Existing analytics routes include clinical, operational, device, adoption, pilot outcome, operational analytics, clinical analytics, device analytics, and executive dashboard drilldowns.

## Accessible Roles

ICU Admin, Hospital Admin, Management, Head Nurse scoped to nursing performance.

## Dependencies

Depends on ICU Command Center, ICU Monitoring, ICU Device Operations, Notifications & Tasks, and Audit Trail.

## Business Flow

System aggregates ICU activity and outcome signals, exposes role-scoped dashboards, supports drilldowns, and feeds enterprise reports.

## Development Priority

API Priority: Low. Recommended Development Order: 42.

## Future APIs

Clinical KPI summary, operational KPI summary, device KPI summary, adoption metrics, pilot outcome metrics, drilldown data, and analytics audit.

# ICU Configuration

## Purpose

Configure ICU units, beds, alert thresholds, escalation rules, medication timing rules, monitoring rules, and device behavior.

## Description

Existing ICU configuration and administration pages cover configuration, users/roles, audit logs, and related hospital admin configuration.

## Accessible Roles

ICU Admin, Hospital Admin.

## Dependencies

Depends on Permission Management, Bed Master Setup, ICU Command Center, and Settings & Configuration.

## Business Flow

Authorized admin configures ICU operating rules; changes are versioned/audited and applied to monitoring, tasks, escalation, and analytics.

## Development Priority

API Priority: Medium. Recommended Development Order: 43.

## Future APIs

ICU unit configuration, threshold configuration, escalation rule configuration, device rule configuration, medication timing policy, configuration versioning, and configuration audit.

# ICU Users & Roles

## Purpose

Manage ICU-specific access and team assignments across doctors, nurses, remote intensivists, biomedical, pharmacy, diagnostics, and quality users.

## Description

Existing ICU users and roles pages indicate an ICU-scoped governance layer in addition to global role management.

## Accessible Roles

ICU Admin, Hospital Admin.

## Dependencies

Depends on User Management, Role Management, Permission Management, and Department & Unit Master Setup.

## Business Flow

ICU admin assigns users to ICU-specific teams or responsibilities, with access constrained by unit, role, and action policy.

## Development Priority

API Priority: Medium. Recommended Development Order: 44.

## Future APIs

ICU team directory, ICU role assignment, unit scope assignment, temporary coverage, team availability, and ICU role audit.

# ICU Audit Logs

## Purpose

Review ICU-specific operational, clinical, device, escalation, and configuration actions.

## Description

Existing ICU administration audit logs and platform audit trails require a scoped audit search for ICU governance.

## Accessible Roles

ICU Admin, Hospital Admin, Management, compliance roles when introduced.

## Dependencies

Depends on Audit Trail and ICU Command Center. Used by Reports and Compliance.

## Business Flow

Authorized reviewer filters ICU audit events by patient, user, bed, device, action, severity, or time range and exports evidence when allowed.

## Development Priority

API Priority: Low. Recommended Development Order: 45.

## Future APIs

ICU audit search, patient audit, device audit, escalation audit, configuration audit, export, and access review.

# Ward Nurse Assigned Patient

## Purpose

Provide Ward Nurse with the assigned patient context required for bedside care.

## Description

Existing Ward Nurse default route is patient overview in ICU Command Center clinical workspace. Role permissions expose assigned patient, monitoring, orders, events, shift summary, and collaboration tabs.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, ICU Admin read-only.

## Dependencies

Depends on Head Nurse Patient Assignment, Patient Identity, IPD/ICU Admissions, and Permission Management.

## Business Flow

Ward Nurse sees assigned patient list or current patient, opens allowed tabs, and performs bedside actions within scope.

## Development Priority

API Priority: High. Recommended Development Order: 46.

## Future APIs

Assigned patient list, assigned patient detail, allowed patient tabs, assignment status, patient handoff context, and access audit.

# Ward Nurse Nurse Entry

## Purpose

Record bedside observations such as vitals, oxygen support, GCS, pain score, blood sugar, weight, notes, trends, and abnormal highlights.

## Description

Existing Nursing ICU pages define Nurse Entry and Vitals workflows for Ward Nurse.

## Accessible Roles

Ward Nurse, Unit Nurse review, Head Nurse review, Doctor read-only as patient context.

## Dependencies

Depends on Ward Nurse Assigned Patient, Patient Identity, and ICU/IPD Monitoring configuration.

## Business Flow

Ward Nurse enters observations, system validates thresholds, updates patient monitoring timeline, and creates alerts/tasks for abnormal values.

## Development Priority

API Priority: High. Recommended Development Order: 47.

## Future APIs

Observation entry, vitals history, abnormal value detection, note attachment, edit reason, observation review, and observation audit.

# Ward Nurse Early Warning Score

## Purpose

Calculate and track early warning scores for patient deterioration detection.

## Description

Existing Ward Nurse and ICU Command Center early warning score routes support score capture and escalation triggers.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, ICU Admin, Doctor read-only/review.

## Dependencies

Depends on Ward Nurse Nurse Entry, ICU Monitoring, scoring configuration, and Notifications & Tasks.

## Business Flow

Vitals are captured, score is calculated or confirmed, thresholds drive observation frequency and escalation tasks.

## Development Priority

API Priority: High. Recommended Development Order: 48.

## Future APIs

Score calculation, score capture, score trend, threshold policy, observation frequency recommendation, escalation trigger, and score audit.

# Ward Nurse Intake / Output Update

## Purpose

Allow bedside fluid chart updates for assigned patients.

## Description

Existing Ward Nurse routes include intake-output and the ICU workflow includes shift-wise and 24-hour balance charts.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, Doctor read-only.

## Dependencies

Depends on Assigned Patient, IPD Intake / Output or ICU Monitoring, and Patient Identity.

## Business Flow

Ward Nurse records intake/output events, system updates shift and 24-hour balance, and abnormal balances feed review tasks or escalations.

## Development Priority

API Priority: Medium. Recommended Development Order: 49.

## Future APIs

Bedside intake entry, bedside output entry, shift balance, fluid chart summary, abnormal balance alert, and fluid audit.

# Ward Nurse Medicine Receive & Verify

## Purpose

Confirm medicines received from pharmacy and verify readiness for bedside administration.

## Description

Existing Ward Nurse and Nursing ICU workflows include Medicine Receive & Verify before medication administration.

## Accessible Roles

Ward Nurse, Unit Nurse review, Head Nurse review, Pharmacy read-only/dispense integration.

## Dependencies

Depends on Doctor Orders, Pharmacy, Patient Identity, and Medication Administration.

## Business Flow

Ward Nurse confirms medicine received, checks patient/order match, flags missing or wrong medicine, and marks item ready for administration.

## Development Priority

API Priority: High. Recommended Development Order: 50.

## Future APIs

Medicine receive queue, verification status, exception reason, pharmacy clarification, ready-for-administration flag, and verification audit.

# Ward Nurse Order

## Purpose

Show and acknowledge active doctor orders assigned to Ward Nurse.

## Description

Existing routes include order, pending doctor orders, doctor instructions, orders and care plans, and pending nursing tasks.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, Doctor order owner read-only/review.

## Dependencies

Depends on Doctor Orders, Notifications & Tasks, and Assigned Patient.

## Business Flow

Ward Nurse reviews orders, acknowledges responsibilities, updates task progress, and escalates unclear or delayed orders.

## Development Priority

API Priority: High. Recommended Development Order: 51.

## Future APIs

Order queue, order acknowledgement, assigned action update, clarification request, order completion status, and order audit.

# Ward Nurse Medication Administration

## Purpose

Administer due medicines and record eMAR outcomes at bedside.

## Description

The route and workflow include due/administered/held/skipped/late medicine states and patient medication chart behavior.

## Accessible Roles

Ward Nurse, Unit Nurse review, Head Nurse review, Doctor read-only/order follow-up.

## Dependencies

Depends on Medicine Receive & Verify, Ward Nurse Order, Patient Identity, and Audit Trail.

## Business Flow

Ward Nurse administers medicine after verification, records administration or exception, and the system updates eMAR, tasks, and handover summary.

## Development Priority

API Priority: High. Recommended Development Order: 52.

## Future APIs

Due medicine list, administer medicine, hold/skip medicine, late administration reason, PRN administration, double verification, and eMAR audit.

# Ward Nurse Nursing Notes

## Purpose

Capture narrative and structured bedside notes for clinical continuity.

## Description

Existing routes include nursing-notes, notes, progress notes, and handover summary.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, Doctor read-only/review.

## Dependencies

Depends on Assigned Patient and Audit Trail. Used by Shift Handover and Doctor Rounds.

## Business Flow

Ward Nurse records note, classifies it by shift/event/care category, and makes it available for review and handover.

## Development Priority

API Priority: Medium. Recommended Development Order: 53.

## Future APIs

Nursing note create, note list, note edit with reason, note classification, note sign-off, and note audit.

# Ward Nurse Tasks & Assessments

## Purpose

Track bedside tasks, care assessments, checklist completion, and pending work.

## Description

Existing routes include tasks-assessments, pending nursing tasks, pending vitals, task board, and assessments.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, ICU Admin read-only.

## Dependencies

Depends on Notifications & Tasks, Assigned Patient, Nursing Assessment, and Permission Management.

## Business Flow

Ward Nurse views pending tasks, completes checklist or assessment, documents result, and unresolved tasks roll into shift summary or escalation.

## Development Priority

API Priority: Medium. Recommended Development Order: 54.

## Future APIs

Task list, assessment task, checklist completion, task deferment, task escalation, task evidence, and task audit.

# Ward Nurse Patient Event Update

## Purpose

Document notable patient events that should appear in timeline and handover.

## Description

Existing routes include patient-event-update, events tab, patient timeline, and escalation source trace.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse, Doctor read-only/review.

## Dependencies

Depends on Assigned Patient, Notifications & Tasks, and Audit Trail.

## Business Flow

Ward Nurse records patient event, tags severity/source, attaches follow-up if required, and system updates timeline and escalation context.

## Development Priority

API Priority: Medium. Recommended Development Order: 55.

## Future APIs

Patient event create, event list, event classification, follow-up task creation, event acknowledgement, and event audit.

# Ward Nurse Shift Pending Summary

## Purpose

Summarize pending care, medicines, tests, issues, and follow-up items before handover.

## Description

Existing workflow builds a whole-shift summary and supports Shift Pending Summary route.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse.

## Dependencies

Depends on Tasks & Assessments, Medication Administration, Nursing Notes, Intake / Output, and Patient Event Update.

## Business Flow

System assembles pending items; Ward Nurse reviews and confirms summary; unresolved items are carried to shift handover.

## Development Priority

API Priority: Medium. Recommended Development Order: 56.

## Future APIs

Pending summary generation, pending item review, carry-forward marking, summary confirmation, and summary audit.

# Ward Nurse Shift Handover

## Purpose

Submit outgoing shift handover with checklist, pending tasks, medication, IV fluids, transfusion, alerts, and acknowledgement.

## Description

Existing routes include shift-handover, shift-pending-summary, and head nurse handover verification.

## Accessible Roles

Ward Nurse, Unit Nurse, Head Nurse.

## Dependencies

Depends on Shift Pending Summary, Assigned Patient, Audit Trail, and Notifications & Tasks.

## Business Flow

Ward Nurse completes handover, incoming nurse/unit nurse acknowledges, pending issues are visible for verification and audit.

## Development Priority

API Priority: High. Recommended Development Order: 57.

## Future APIs

Handover draft, handover submit, handover acknowledgement, handover checklist, pending carry-forward, print/export, and handover audit.

# Ward Nurse Raise Issue

## Purpose

Escalate bedside concerns to Unit Nurse or Head Nurse.

## Description

Existing Ward Nurse route is Raise Issue to Unit Nurse; escalation flows connect to Unit Nurse issue review and Head Nurse escalation.

## Accessible Roles

Ward Nurse create, Unit Nurse review, Head Nurse oversight, ICU Admin read-only for critical cases.

## Dependencies

Depends on Assigned Patient, Notifications & Tasks, Unit Nurse Issue Review, and ICU Escalation Center.

## Business Flow

Ward Nurse raises issue with patient context and severity; Unit Nurse reviews and resolves or escalates; Head Nurse monitors delayed or critical issues.

## Development Priority

API Priority: High. Recommended Development Order: 58.

## Future APIs

Issue creation, issue classification, owner assignment, response update, escalation, closure evidence, and issue audit.

# Unit Nurse Assigned Patients

## Purpose

Give Unit Nurse a unit-level patient list and ownership view.

## Description

Existing Unit Nurse default route is assigned patients, with patient tabs for overview, monitoring, results, events, and shift summary.

## Accessible Roles

Unit Nurse, Head Nurse, ICU Admin read-only.

## Dependencies

Depends on Head Nurse Patient Assignment, Patient Identity, and Bed Master Setup.

## Business Flow

Unit Nurse receives patient assignments, monitors active patients and Ward Nurse activity, and reviews issues/handover.

## Development Priority

API Priority: High. Recommended Development Order: 59.

## Future APIs

Unit patient list, patient assignment detail, unit workload, patient tab access, and unit access audit.

# Unit Nurse Ward Assignment

## Purpose

Coordinate ward or patient assignment within a unit.

## Description

Existing Unit Nurse routes include ward assignment and Head Nurse unit assignment.

## Accessible Roles

Unit Nurse, Head Nurse.

## Dependencies

Depends on Head Nurse Unit Assignment, Bed Master Setup, Staff Availability, and Patient Assignment.

## Business Flow

Head Nurse assigns unit responsibility; Unit Nurse assigns or confirms ward/patient coverage and monitors workload.

## Development Priority

API Priority: Medium. Recommended Development Order: 60.

## Future APIs

Ward assignment list, coverage update, assignment confirmation, workload view, and assignment audit.

# Unit Nurse Monitoring

## Purpose

Supervise patient monitoring status, abnormal observations, and pending nurse actions.

## Description

Existing Unit Nurse monitoring route and ICU patient tabs provide a supervisor-level monitoring view.

## Accessible Roles

Unit Nurse, Head Nurse, ICU Admin read-only.

## Dependencies

Depends on Unit Nurse Assigned Patients, Ward Nurse Nurse Entry, ICU Monitoring, and Notifications & Tasks.

## Business Flow

Unit Nurse reviews patient monitoring, checks abnormal trends and pending work, and prompts Ward Nurse or escalates.

## Development Priority

API Priority: Medium. Recommended Development Order: 61.

## Future APIs

Unit monitoring summary, abnormal observation list, patient trend summary, pending action list, and monitoring review audit.

# Unit Nurse Issue Review

## Purpose

Review and resolve issues raised by Ward Nurse.

## Description

Existing route issue-review supports Unit Nurse review of raised concerns.

## Accessible Roles

Unit Nurse, Head Nurse, Ward Nurse read-only for submitted issues.

## Dependencies

Depends on Ward Nurse Raise Issue, Notifications & Tasks, and Audit Trail.

## Business Flow

Unit Nurse opens issue queue, reviews severity and patient context, responds, assigns action, resolves, or escalates to Head Nurse/ICU Admin.

## Development Priority

API Priority: High. Recommended Development Order: 62.

## Future APIs

Issue queue, issue detail, response update, resolution, escalation decision, owner reassignment, and issue review audit.

# Unit Nurse Escalation

## Purpose

Escalate unresolved unit issues to Head Nurse or ICU command escalation.

## Description

Existing routes include unit nurse escalation and broader ICU escalation center pages.

## Accessible Roles

Unit Nurse, Head Nurse, ICU Admin.

## Dependencies

Depends on Unit Nurse Issue Review, Notifications & Tasks, ICU Escalation Center, and Audit Trail.

## Business Flow

Unit Nurse escalates an unresolved or high-risk issue; system assigns owner, starts SLA, and tracks closure.

## Development Priority

API Priority: High. Recommended Development Order: 63.

## Future APIs

Escalation create, escalation priority, owner assignment, SLA start, update, closure, and escalation audit.

# Unit Nurse Handover Submit

## Purpose

Submit unit-level handover to Head Nurse for verification.

## Description

Existing Unit Nurse route includes handover submit, while Head Nurse has handover verification.

## Accessible Roles

Unit Nurse, Head Nurse.

## Dependencies

Depends on Ward Nurse Shift Handover, Unit Nurse Assigned Patients, and Audit Trail.

## Business Flow

Unit Nurse consolidates unit handover, confirms unresolved issues, submits to Head Nurse, and responds to verification feedback.

## Development Priority

API Priority: Medium. Recommended Development Order: 64.

## Future APIs

Unit handover draft, unit handover submit, verification status, feedback update, resubmission, and handover audit.

# Head Nurse Console

## Purpose

Provide Head Nurse command over nursing workload, patient assignment, unit status, escalations, handovers, and audit controls.

## Description

Existing Head Nurse routes include console, patient dashboard, ICU dashboard, admission queue, unit availability, staff availability, patient assignment, alerts/delays, escalations, handover, and audit control.

## Accessible Roles

Head Nurse, ICU Admin read-only/oversight, Hospital Admin read-only.

## Dependencies

Depends on User Management, Bed Master Setup, Patient Identity, Admissions, Notifications & Tasks, and Audit Trail.

## Business Flow

Head Nurse reviews unit status, staffing, admissions, assignments, alerts, escalations, and handover verification from one supervisory console.

## Development Priority

API Priority: High. Recommended Development Order: 65.

## Future APIs

Head nurse dashboard, workload summary, patient dashboard, ICU dashboard, action queue, and console audit.

# Head Nurse Admission Queue

## Purpose

Review incoming admissions requiring nursing readiness and assignment.

## Description

Existing routes include admission queue, new admissions, and ICU/admission review pages.

## Accessible Roles

Head Nurse, Unit Nurse read-only/assigned actions, ICU Admin.

## Dependencies

Depends on Admission Reception, ICU Admissions or IPD Admissions, Bed Master Setup, and Billing clearance visibility.

## Business Flow

Head Nurse views incoming admissions, checks unit/bed/staff readiness, flags concerns, and moves admission to review or assignment.

## Development Priority

API Priority: High. Recommended Development Order: 66.

## Future APIs

Admission queue, readiness status, billing/bed context, priority classification, queue action, and admission queue audit.

# Head Nurse Admission Review

## Purpose

Validate admission readiness and nursing requirements before patient assignment.

## Description

Admission review exists in Head Nurse role routes and Nursing ICU head nurse workflows.

## Accessible Roles

Head Nurse, Unit Nurse for delegated cases, ICU Admin read-only.

## Dependencies

Depends on Admission Queue, Bed Master Setup, Staff Availability, and Patient Identity.

## Business Flow

Head Nurse reviews patient context, bed/unit readiness, nursing capacity, and special instructions, then approves assignment or raises delay.

## Development Priority

API Priority: High. Recommended Development Order: 67.

## Future APIs

Admission review detail, approve/reject/hold decision, readiness checklist, delay reason, assignment handoff, and admission review audit.

# Head Nurse New Admissions

## Purpose

Track newly admitted patients entering the nursing workflow.

## Description

Existing routes separate new admissions from admission queue/review and patient assignment.

## Accessible Roles

Head Nurse, Unit Nurse, ICU Admin read-only.

## Dependencies

Depends on Admission Review and ICU/IPD Admissions.

## Business Flow

After admission review, Head Nurse monitors new patient arrivals, confirms receive state, and routes patient to assignment.

## Development Priority

API Priority: Medium. Recommended Development Order: 68.

## Future APIs

New admission list, arrival status, receive readiness, pending assignment, and new admission audit.

# Head Nurse Unit Availability

## Purpose

Display and govern unit capacity, occupancy, bed status, and overload signals.

## Description

Existing routes include unit availability and ICU unit/staff availability pages.

## Accessible Roles

Head Nurse, ICU Admin, Hospital Admin read-only.

## Dependencies

Depends on Bed Master Setup, ICU/IPD Admissions, and ICU Operations.

## Business Flow

Head Nurse reviews bed/unit load, identifies capacity constraints, and uses the view to support admission review and assignment decisions.

## Development Priority

API Priority: High. Recommended Development Order: 69.

## Future APIs

Unit availability, occupancy status, overload flags, bed readiness, admission capacity, and unit availability audit.

# Head Nurse Staff Availability

## Purpose

Display staff coverage, shift availability, workload, and assignment readiness.

## Description

Existing routes include staff availability in both Head Nurse and Nursing ICU head nurse paths.

## Accessible Roles

Head Nurse, ICU Admin, Hospital Admin, HR Manager read-only if integrated.

## Dependencies

Depends on User Management, Department & Unit Master Setup, HRMS optional, and shift roster configuration.

## Business Flow

Head Nurse checks nurse availability and workload, selects appropriate staff for patient/unit assignment, and monitors coverage gaps.

## Development Priority

API Priority: High. Recommended Development Order: 70.

## Future APIs

Staff availability, shift coverage, workload summary, skill/role mapping, availability update, and staff availability audit.

# Head Nurse Patient Assignment

## Purpose

Assign patients to Unit Nurse and Ward Nurse based on bed, unit, acuity, and staff availability.

## Description

Existing route patient assignment is central to Ward Nurse and Unit Nurse role workflows.

## Accessible Roles

Head Nurse, Unit Nurse read-only/receiving, Ward Nurse read-only/receiving, ICU Admin.

## Dependencies

Depends on Admission Review, Unit Availability, Staff Availability, Patient Identity, and Notifications & Tasks.

## Business Flow

Head Nurse assigns patient to responsible unit/ward nurse, system notifies receiving staff, and all role-specific patient workflows become available.

## Development Priority

API Priority: High. Recommended Development Order: 71.

## Future APIs

Patient assignment, reassignment, assignment acknowledgement, workload validation, assignment history, and assignment audit.

# Head Nurse Unit Assignment

## Purpose

Assign unit-level nursing ownership and coverage.

## Description

Existing routes include unit assignment and unit availability.

## Accessible Roles

Head Nurse, Unit Nurse, ICU Admin read-only.

## Dependencies

Depends on Unit Availability, Staff Availability, Department & Unit Master Setup, and User Management.

## Business Flow

Head Nurse maps Unit Nurses to units, defines coverage windows, and ensures units have accountable owners.

## Development Priority

API Priority: Medium. Recommended Development Order: 72.

## Future APIs

Unit assignment, coverage window, unit owner update, reassignment, assignment status, and unit assignment audit.

# Head Nurse Alerts & Delays

## Purpose

Monitor delayed tasks, admissions, handovers, orders, medication, and escalations.

## Description

Existing routes include alerts-delays and ICU notifications/tasks.

## Accessible Roles

Head Nurse, ICU Admin, Unit Nurse for assigned delays.

## Dependencies

Depends on Notifications & Tasks, Unit Nurse Escalation, Ward Nurse workflows, and Audit Trail.

## Business Flow

Head Nurse reviews delayed items, filters by severity/owner/unit, assigns follow-up, escalates if needed, and tracks closure.

## Development Priority

API Priority: High. Recommended Development Order: 73.

## Future APIs

Delay dashboard, delayed task list, owner filter, reminder, escalation, action update, and alerts/delays audit.

# Head Nurse Escalations

## Purpose

Resolve or escalate issues raised by Unit Nurses and critical nursing workflows.

## Description

Existing routes include Head Nurse escalations and ICU escalation center.

## Accessible Roles

Head Nurse, ICU Admin, Unit Nurse read-only/update by ownership.

## Dependencies

Depends on Unit Nurse Escalation, ICU Escalation Center, Notifications & Tasks, and Audit Trail.

## Business Flow

Head Nurse accepts escalation, assigns owner/action, monitors SLA, escalates to ICU Admin/Doctor/Tele ICU as required, and closes with evidence.

## Development Priority

API Priority: High. Recommended Development Order: 74.

## Future APIs

Escalation list, escalation detail, action assignment, owner chain update, SLA review, outcome closure, and escalation audit.

# Head Nurse Shift Handover

## Purpose

Review shift handovers across assigned units and patients.

## Description

Existing routes include shift handover and handover verification.

## Accessible Roles

Head Nurse, Unit Nurse, Ward Nurse read-only for own submissions.

## Dependencies

Depends on Ward Nurse Shift Handover, Unit Nurse Handover Submit, and Audit Trail.

## Business Flow

Head Nurse reviews handover completeness, pending items, unresolved issues, and confirms readiness for next shift verification.

## Development Priority

API Priority: Medium. Recommended Development Order: 75.

## Future APIs

Handover review list, handover detail, pending item review, feedback, verification decision, and handover review audit.

# Head Nurse Handover Verification

## Purpose

Formally verify submitted handovers and close shift accountability.

## Description

Existing Head Nurse route `handover-verification` provides this supervisory control.

## Accessible Roles

Head Nurse, ICU Admin read-only, Unit Nurse/Ward Nurse receiving feedback.

## Dependencies

Depends on Head Nurse Shift Handover, Audit Trail, and Notifications & Tasks.

## Business Flow

Head Nurse verifies handover, returns for correction if incomplete, closes shift if acceptable, and stores audit evidence.

## Development Priority

API Priority: High. Recommended Development Order: 76.

## Future APIs

Verification queue, handover verification, return for correction, closure evidence, correction tracking, and verification audit.

# Head Nurse Audit Control

## Purpose

Give Head Nurse scoped governance over nursing documentation, handover, assignment, and escalation audit.

## Description

Existing Head Nurse audit control route supports nursing-specific audit oversight.

## Accessible Roles

Head Nurse, ICU Admin, Hospital Admin read-only/oversight.

## Dependencies

Depends on Audit Trail, Handover Verification, Patient Assignment, and Notifications & Tasks.

## Business Flow

Head Nurse searches nursing audit events, identifies missing documentation or delayed actions, and follows up with assigned owners.

## Development Priority

API Priority: Medium. Recommended Development Order: 77.

## Future APIs

Nursing audit search, documentation completeness, assignment audit, handover audit, escalation audit, audit export, and audit control actions.

# Reports

## Purpose

Provide clinical, operational, financial, occupancy, audit, and management reporting.

## Description

Existing routes include MIS, operational, clinical, audit, revenue analytics, schedules, bed occupancy, financial, dashboard analytics, doctor performance, and custom builder.

## Accessible Roles

Hospital Admin, ICU Admin, Management, Head Nurse scoped reports, Billing Executive financial scope.

## Dependencies

Depends on Audit Trail, IPD, ICU, Billing, Reception, and Settings. Used by leadership and compliance.

## Business Flow

Authorized users select report type, filters, schedule/export options, and receive role-scoped metrics from operational systems.

## Development Priority

API Priority: Low. Recommended Development Order: 78.

## Future APIs

Report catalogue, report generation, filter metadata, scheduled reports, export, dashboard metrics, custom report builder, and report audit.

# Settings & Configuration

## Purpose

Centralize operational setup, security policy, hospital setup, LDT, assessments, properties, and role-sensitive configuration.

## Description

Existing routes include settings UI, admin hospital setup, roles, permissions, departments, security, hospital admin LDT, assessment configuration, properties configuration, and ICU configuration.

## Accessible Roles

Hospital Admin, ICU Admin for ICU scope, Management read-only.

## Dependencies

Depends on Authentication, User Management, Role Management, Permission Management, Audit Trail, and master setup modules.

## Business Flow

Admin configures hospital operating parameters, policies, templates, and module settings; changes are versioned and audited.

## Development Priority

API Priority: Medium. Recommended Development Order: 79.

## Future APIs

Hospital setup, property configuration, security policy, assessment configuration, LDT configuration, module settings, configuration versioning, and settings audit.

# Integrations

## Purpose

Connect HMS workflows to external clinical, messaging, identity, imaging, and interoperability systems.

## Description

Existing integration routes include ABHA, FHIR, PACS, WhatsApp API, SMS API, email, communication templates, emergency alerts, and platform API pages.

## Accessible Roles

Hospital Admin, ICU Admin for ICU device/PACS scope, Management read-only, integration administrators when introduced.

## Dependencies

Depends on Authentication, Settings, Audit Trail, Patient Identity, and module-specific workflows.

## Business Flow

Admin configures integration channel, validates connectivity, maps workflow events, monitors failures, and reviews audit logs.

## Development Priority

API Priority: Low. Recommended Development Order: 80.

## Future APIs

Integration configuration, connection health, message dispatch, webhook intake, retry queue, FHIR exchange, ABHA exchange, PACS integration, and integration audit.

# API Entity Contract JSON

This section contains the complete API entity mapping JSON for all modules in this document. It is intended for backend API implementation mapping and should remain the single source of truth with the planning sections above.

```json
{
  "document": {
    "name": "Plasmit Hospital HMS API Entity Contract",
    "version": "1.0.0",
    "sourceDocument": "docs/api-contract-planning.md",
    "purpose": "API implementation mapping contract for backend modules, request/response design, validation, and frontend integration.",
    "importantNote": "This is an API entity contract, not SQL, not database migration, and not backend code."
  },
  "namingConventions": {
    "entityKey": "PascalCase",
    "fieldKey": "camelCase",
    "identifierSuffix": "Id",
    "timestampFormat": "ISO-8601",
    "moneyFormat": "minor units or decimal string decided by backend standard",
    "booleanPrefix": "is / has / can",
    "statusField": "status",
    "auditFields": [
      "createdAt",
      "createdBy",
      "updatedAt",
      "updatedBy",
      "deletedAt",
      "deletedBy"
    ]
  },
  "globalFields": {
    "BaseEntity": {
      "fields": {
        "id": "string",
        "status": "string",
        "createdAt": "datetime",
        "createdBy": "string",
        "updatedAt": "datetime",
        "updatedBy": "string"
      }
    },
    "SoftDelete": {
      "fields": {
        "deletedAt": "datetime|null",
        "deletedBy": "string|null",
        "deleteReason": "string|null"
      }
    },
    "ClinicalAudit": {
      "fields": {
        "patientId": "string",
        "encounterId": "string|null",
        "actorUserId": "string",
        "actorRole": "string",
        "sourceModule": "string",
        "actionReason": "string|null"
      }
    }
  },
  "roles": [
    "Super Admin",
    "Hospital Admin",
    "ICU Admin",
    "ICU",
    "Doctor",
    "Doctor ICU",
    "Doctor OPD",
    "Doctor IPD",
    "Nurse",
    "Nurse ICU",
    "Nurse ICU 2",
    "Ward Nurse",
    "Unit Nurse",
    "Head Nurse",
    "Receptionist",
    "Billing Executive",
    "Lab Technician",
    "Radiologist",
    "Pharmacist",
    "Blood Bank",
    "HR Manager",
    "Management",
    "Tele ICU Doctor",
    "Biomedical Engineer",
    "Diagnostics Team",
    "ICU Pharmacist",
    "Quality Audit"
  ],
  "enums": {
    "Priority": [
      "Low",
      "Routine",
      "Medium",
      "High",
      "Urgent",
      "Critical",
      "Emergency"
    ],
    "RiskLevel": [
      "Low",
      "Medium",
      "High",
      "Critical"
    ],
    "AdmissionStatus": [
      "Draft",
      "Pending Bed Allotment",
      "Billing Hold",
      "Accepted",
      "Ready for Nursing",
      "Received",
      "Care Started",
      "Transferred",
      "Discharge Initiated",
      "Discharged",
      "Cancelled"
    ],
    "BedStatus": [
      "Available",
      "Occupied",
      "Reserved",
      "Cleaning",
      "Maintenance",
      "Isolation",
      "Blocked"
    ],
    "TaskStatus": [
      "Open",
      "Assigned",
      "In Progress",
      "Due",
      "Overdue",
      "Completed",
      "Skipped",
      "Cancelled"
    ],
    "NotificationStatus": [
      "Unread",
      "Read",
      "Acknowledged",
      "Resolved"
    ],
    "DocumentCategory": [
      "Referral Letter",
      "Lab Reports",
      "Radiology",
      "Prescription",
      "Consent",
      "Insurance",
      "Identity",
      "Others"
    ],
    "UploadStatus": [
      "Selected",
      "Validating",
      "Ready",
      "Uploading",
      "Uploaded",
      "Failed",
      "Cancelled",
      "Deleted"
    ],
    "OcrStatus": [
      "Not Required",
      "Queued",
      "Running",
      "Extracting",
      "Verification Ready",
      "Verified",
      "Failed"
    ],
    "TriageCategory": [
      "RED",
      "YELLOW",
      "GREEN",
      "BLACK"
    ],
    "MedicationAdministrationStatus": [
      "Scheduled",
      "Due",
      "Administered",
      "Held",
      "Skipped",
      "Delayed",
      "Cancelled"
    ],
    "EscalationStatus": [
      "Open",
      "Acknowledged",
      "In Progress",
      "Transferred",
      "Resolved",
      "Closed"
    ],
    "BillingStatus": [
      "Draft",
      "Pending",
      "Cleared",
      "Hold",
      "Partially Paid",
      "Paid",
      "Refunded",
      "Cancelled"
    ]
  },
  "entities": {
    "User": {
      "ownedBy": "User Management",
      "description": "Hospital staff account used for login, ownership, assignment, audit, and notifications.",
      "fields": {
        "id": "string",
        "employeeCode": "string",
        "fullName": "string",
        "email": "string",
        "mobile": "string",
        "designation": "string",
        "primaryRoleId": "string",
        "departmentIds": "string[]",
        "unitIds": "string[]",
        "status": "Active|Inactive|Locked|Invited",
        "lastLoginAt": "datetime|null"
      },
      "references": {
        "primaryRoleId": "Role.id",
        "departmentIds": "Department.id[]",
        "unitIds": "HospitalUnit.id[]"
      },
      "apiActions": [
        "listUsers",
        "getUser",
        "createUser",
        "updateUser",
        "lockUser",
        "assignUserRoles",
        "assignUserDepartments"
      ]
    },
    "Role": {
      "ownedBy": "Role Management",
      "description": "Role catalogue matching frontend role names and API authorization scopes.",
      "fields": {
        "id": "string",
        "name": "string",
        "type": "System|Custom",
        "description": "string",
        "defaultRoute": "string",
        "departmentScope": "Global|Department|Unit",
        "status": "Active|Inactive",
        "protected": "boolean"
      },
      "apiActions": [
        "listRoles",
        "getRole",
        "createRole",
        "updateRole",
        "activateRole",
        "deactivateRole"
      ]
    },
    "Permission": {
      "ownedBy": "Permission Management",
      "description": "Feature, route, and action authorization unit.",
      "fields": {
        "id": "string",
        "moduleKey": "string",
        "pageKey": "string",
        "tabKey": "string|null",
        "actionKey": "string",
        "description": "string",
        "sensitive": "boolean",
        "enabled": "boolean"
      },
      "references": {
        "moduleKey": "Module.moduleKey"
      },
      "apiActions": [
        "listPermissions",
        "assignPermissionToRole",
        "removePermissionFromRole",
        "checkPermission"
      ]
    },
    "Department": {
      "ownedBy": "Department & Unit Master Setup",
      "description": "Clinical, diagnostic, administrative, finance, or support department.",
      "fields": {
        "id": "string",
        "code": "string",
        "name": "string",
        "type": "Clinical|Diagnostic|Administrative|Support|Finance|Store",
        "headUserId": "string|null",
        "location": "string",
        "status": "Active|Inactive"
      },
      "references": {
        "headUserId": "User.id"
      },
      "apiActions": [
        "listDepartments",
        "getDepartment",
        "createDepartment",
        "updateDepartment"
      ]
    },
    "HospitalUnit": {
      "ownedBy": "Department & Unit Master Setup",
      "description": "Ward, ICU unit, nurse station, or operational care unit.",
      "fields": {
        "id": "string",
        "departmentId": "string",
        "name": "string",
        "unitType": "Ward|ICU|Emergency|OPD|Diagnostic|Store",
        "floor": "string",
        "nurseStation": "string|null",
        "status": "Active|Inactive"
      },
      "references": {
        "departmentId": "Department.id"
      },
      "apiActions": [
        "listUnits",
        "getUnit",
        "createUnit",
        "updateUnit"
      ]
    },
    "Bed": {
      "ownedBy": "Bed Master Setup",
      "description": "Authoritative bed and operational status record.",
      "fields": {
        "id": "string",
        "bedNo": "string",
        "unitId": "string",
        "wardName": "string",
        "roomNo": "string|null",
        "bedType": "General|Semi-private|Private|ICU|Isolation",
        "status": "BedStatus",
        "isIsolationCapable": "boolean",
        "genderRestriction": "Any|Male|Female|Other",
        "currentPatientId": "string|null",
        "lastStatusChangedAt": "datetime",
        "statusReason": "string|null"
      },
      "references": {
        "unitId": "HospitalUnit.id",
        "currentPatientId": "Patient.id"
      },
      "apiActions": [
        "listBeds",
        "getBed",
        "updateBedStatus",
        "reserveBed",
        "releaseBed"
      ]
    },
    "Patient": {
      "ownedBy": "Patient Identity",
      "description": "Single patient identity used across registration, OPD, IPD, ICU, billing, and reports.",
      "fields": {
        "id": "string",
        "uhid": "string",
        "mrn": "string|null",
        "firstName": "string",
        "middleName": "string|null",
        "lastName": "string",
        "displayName": "string",
        "dateOfBirth": "date|null",
        "age": "number|null",
        "gender": "Male|Female|Other|Unknown",
        "bloodGroup": "string|null",
        "mobile": "string|null",
        "email": "string|null",
        "address": "string|null",
        "city": "string|null",
        "state": "string|null",
        "pinCode": "string|null",
        "abhaId": "string|null",
        "status": "Active|Merged|Deceased|Inactive"
      },
      "apiActions": [
        "searchPatients",
        "getPatient",
        "registerPatient",
        "updatePatient",
        "checkDuplicatePatient",
        "mergePatient"
      ]
    },
    "PatientContact": {
      "ownedBy": "Patient Identity",
      "description": "Family, attendant, emergency, or guardian contact.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "name": "string",
        "relationship": "string",
        "mobile": "string",
        "email": "string|null",
        "isPrimary": "boolean",
        "canReceiveUpdates": "boolean",
        "status": "Active|Inactive"
      },
      "references": {
        "patientId": "Patient.id"
      },
      "apiActions": [
        "listPatientContacts",
        "createPatientContact",
        "updatePatientContact",
        "removePatientContact"
      ]
    },
    "PatientConsent": {
      "ownedBy": "Patient Identity",
      "description": "Consent forms for ABHA, treatment, communication, transfer, insurance, and procedures.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "consentType": "string",
        "source": "Paper|Digital|ABHA|Mobile",
        "status": "Pending|Signed|Rejected|Withdrawn|Expired",
        "signedBy": "string|null",
        "signedAt": "datetime|null",
        "validUntil": "datetime|null",
        "documentId": "string|null"
      },
      "references": {
        "patientId": "Patient.id",
        "documentId": "PatientDocument.id"
      },
      "apiActions": [
        "listConsents",
        "createConsent",
        "signConsent",
        "withdrawConsent"
      ]
    },
    "PatientDocument": {
      "ownedBy": "Patient Identity",
      "description": "Uploaded clinical, identity, insurance, referral, diagnostic, and consent document.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string|null",
        "category": "DocumentCategory",
        "fileName": "string",
        "mimeType": "string",
        "sizeBytes": "number",
        "storageKey": "string",
        "uploadStatus": "UploadStatus",
        "ocrStatus": "OcrStatus",
        "verified": "boolean",
        "uploadedBy": "string",
        "uploadedAt": "datetime"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "uploadedBy": "User.id"
      },
      "apiActions": [
        "createDocumentUploadSession",
        "confirmDocumentUpload",
        "listPatientDocuments",
        "getDocumentPreview",
        "updateDocumentCategory",
        "verifyDocument",
        "deleteDocument"
      ]
    },
    "Encounter": {
      "ownedBy": "Patient Identity",
      "description": "Visit or care episode across OPD, IPD, emergency, or ICU.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterNo": "string",
        "encounterType": "OPD|IPD|Emergency|ICU|Daycare",
        "status": "Open|Closed|Cancelled",
        "startedAt": "datetime",
        "endedAt": "datetime|null",
        "primaryDoctorId": "string|null",
        "departmentId": "string|null"
      },
      "references": {
        "patientId": "Patient.id",
        "primaryDoctorId": "User.id",
        "departmentId": "Department.id"
      },
      "apiActions": [
        "openEncounter",
        "getEncounter",
        "closeEncounter",
        "listPatientEncounters"
      ]
    },
    "Notification": {
      "ownedBy": "Notifications & Tasks",
      "description": "Role or user-targeted notification.",
      "fields": {
        "id": "string",
        "title": "string",
        "message": "string",
        "moduleKey": "string",
        "patientId": "string|null",
        "priority": "Priority",
        "status": "NotificationStatus",
        "recipientUserIds": "string[]",
        "recipientRoleNames": "string[]",
        "createdAt": "datetime",
        "acknowledgedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "recipientUserIds": "User.id[]"
      },
      "apiActions": [
        "listNotifications",
        "createNotification",
        "acknowledgeNotification",
        "resolveNotification"
      ]
    },
    "Task": {
      "ownedBy": "Notifications & Tasks",
      "description": "Clinical or operational work item assigned to staff or role.",
      "fields": {
        "id": "string",
        "title": "string",
        "description": "string|null",
        "moduleKey": "string",
        "patientId": "string|null",
        "encounterId": "string|null",
        "assignedToUserId": "string|null",
        "assignedToRole": "string|null",
        "priority": "Priority",
        "status": "TaskStatus",
        "dueAt": "datetime|null",
        "completedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "assignedToUserId": "User.id"
      },
      "apiActions": [
        "listTasks",
        "createTask",
        "assignTask",
        "updateTaskStatus",
        "completeTask",
        "escalateTask"
      ]
    },
    "AuditEvent": {
      "ownedBy": "Audit Trail",
      "description": "Immutable event for sensitive clinical, administrative, billing, and security actions.",
      "fields": {
        "id": "string",
        "moduleKey": "string",
        "eventType": "string",
        "actorUserId": "string",
        "actorRole": "string",
        "patientId": "string|null",
        "targetEntity": "string",
        "targetId": "string",
        "severity": "Info|Warning|Critical",
        "before": "object|null",
        "after": "object|null",
        "ipAddress": "string|null",
        "device": "string|null",
        "createdAt": "datetime"
      },
      "references": {
        "actorUserId": "User.id",
        "patientId": "Patient.id"
      },
      "apiActions": [
        "recordAuditEvent",
        "searchAuditEvents",
        "exportAuditEvents"
      ]
    },
    "Appointment": {
      "ownedBy": "Appointment Booking",
      "description": "OPD, follow-up, or teleconsult appointment.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "doctorId": "string",
        "departmentId": "string",
        "appointmentNo": "string",
        "appointmentType": "OPD|Follow-up|Teleconsultation",
        "scheduledAt": "datetime",
        "status": "Booked|Checked In|In Queue|Completed|Cancelled|No Show",
        "tokenNo": "string|null"
      },
      "references": {
        "patientId": "Patient.id",
        "doctorId": "User.id",
        "departmentId": "Department.id"
      },
      "apiActions": [
        "searchSlots",
        "bookAppointment",
        "rescheduleAppointment",
        "cancelAppointment",
        "checkInAppointment"
      ]
    },
    "OpdQueueToken": {
      "ownedBy": "OPD Queue",
      "description": "OPD queue position and status.",
      "fields": {
        "id": "string",
        "appointmentId": "string",
        "patientId": "string",
        "doctorId": "string",
        "tokenNo": "string",
        "priority": "Priority",
        "status": "Waiting|Called|In Consultation|Completed|Skipped",
        "calledAt": "datetime|null"
      },
      "references": {
        "appointmentId": "Appointment.id",
        "patientId": "Patient.id",
        "doctorId": "User.id"
      },
      "apiActions": [
        "listOpdQueue",
        "issueToken",
        "callToken",
        "skipToken",
        "completeToken"
      ]
    },
    "TriageRecord": {
      "ownedBy": "Patient Details - Triage",
      "description": "ED triage, referral, report upload, and transfer readiness record attached to patient details.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string|null",
        "triageCategory": "TriageCategory",
        "arrivalTime": "datetime",
        "triageTime": "datetime|null",
        "provisionalDiagnosis": "string|null",
        "reasonForTransfer": "string|null",
        "referralFacility": "string|null",
        "acceptingDoctorId": "string|null",
        "consentTaken": "boolean",
        "checklistDone": "boolean",
        "escort": "string|null",
        "ambulanceType": "ACLS|BLS|Internal|Not Applicable",
        "departureTime": "datetime|null",
        "handoverAcknowledged": "boolean",
        "remarks": "string|null",
        "status": "Draft|Ready|Transferred|Cancelled"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "acceptingDoctorId": "User.id"
      },
      "apiActions": [
        "getTriageRecord",
        "saveTriageDraft",
        "submitTriageRecord",
        "updateTriageCategory",
        "acknowledgeTriageHandover"
      ]
    },
    "TriageChecklistItem": {
      "ownedBy": "Patient Details - Triage",
      "description": "Pre-transfer checklist item status.",
      "fields": {
        "id": "string",
        "triageRecordId": "string",
        "label": "string",
        "sequence": "number",
        "done": "boolean",
        "checkedBy": "string|null",
        "checkedAt": "datetime|null",
        "remarks": "string|null"
      },
      "references": {
        "triageRecordId": "TriageRecord.id",
        "checkedBy": "User.id"
      },
      "apiActions": [
        "listTriageChecklist",
        "updateTriageChecklistItem",
        "completeTriageChecklist"
      ]
    },
    "MobileUploadSession": {
      "ownedBy": "Patient Details - Triage",
      "description": "Short-lived mobile upload token/session for attendant or staff phone uploads.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "triageRecordId": "string|null",
        "token": "string",
        "uploadLink": "string",
        "state": "Waiting for mobile|Connected|Uploading|Completed|Expired|Cancelled",
        "expiresAt": "datetime",
        "createdBy": "string",
        "completedAt": "datetime|null",
        "revokedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "triageRecordId": "TriageRecord.id",
        "createdBy": "User.id"
      },
      "apiActions": [
        "createMobileUploadSession",
        "subscribeToMobileUpload",
        "refreshMobileUploadSession",
        "cancelMobileUploadSession"
      ]
    },
    "AdmissionRequest": {
      "ownedBy": "Admission Reception",
      "description": "Admission workflow request connecting reception, doctor, billing, bed manager, and nursing receive.",
      "fields": {
        "id": "string",
        "requestNo": "string",
        "patientId": "string",
        "source": "OPD|Emergency|Referral|Transfer|Direct",
        "doctorId": "string",
        "admittingTeam": "string|null",
        "admissionCategory": "Elective|Non Elective|Emergency",
        "requestedWard": "string",
        "priority": "Priority",
        "status": "AdmissionStatus",
        "allergyNote": "string|null",
        "instructions": "string|null",
        "qrReference": "string|null",
        "createdAt": "datetime"
      },
      "references": {
        "patientId": "Patient.id",
        "doctorId": "User.id"
      },
      "apiActions": [
        "createAdmissionRequest",
        "listAdmissionRequests",
        "updateAdmissionStatus",
        "cancelAdmissionRequest"
      ]
    },
    "AdmissionQr": {
      "ownedBy": "Admission QR Generation",
      "description": "Printable/scannable admission reference.",
      "fields": {
        "id": "string",
        "admissionRequestId": "string",
        "patientId": "string",
        "qrReference": "string",
        "payload": "object",
        "status": "Generated|Scanned|Expired|Revoked",
        "generatedBy": "string",
        "generatedAt": "datetime",
        "expiresAt": "datetime|null"
      },
      "references": {
        "admissionRequestId": "AdmissionRequest.id",
        "patientId": "Patient.id",
        "generatedBy": "User.id"
      },
      "apiActions": [
        "generateAdmissionQr",
        "validateAdmissionQr",
        "revokeAdmissionQr"
      ]
    },
    "BillingAccount": {
      "ownedBy": "Billing Desk",
      "description": "Financial account for OPD/IPD/emergency billing.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string|null",
        "billingType": "OPD|IPD|Emergency|Pharmacy|Diagnostic",
        "status": "BillingStatus",
        "grossAmount": "decimal",
        "discountAmount": "decimal",
        "netAmount": "decimal",
        "paidAmount": "decimal",
        "balanceAmount": "decimal"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id"
      },
      "apiActions": [
        "getBillingAccount",
        "createBillingAccount",
        "addBillingCharge",
        "applyDiscount",
        "closeBillingAccount"
      ]
    },
    "BillingLineItem": {
      "ownedBy": "Billing Desk",
      "description": "Billable service, package, test, medicine, or procedure line.",
      "fields": {
        "id": "string",
        "billingAccountId": "string",
        "serviceCode": "string",
        "serviceName": "string",
        "category": "Consultation|Lab|Radiology|Pharmacy|Bed|Procedure|Package|Other",
        "quantity": "number",
        "rate": "decimal",
        "amount": "decimal",
        "status": "Draft|Posted|Cancelled|Refunded"
      },
      "references": {
        "billingAccountId": "BillingAccount.id"
      },
      "apiActions": [
        "listBillingItems",
        "addBillingItem",
        "updateBillingItem",
        "removeBillingItem"
      ]
    },
    "Payment": {
      "ownedBy": "Billing Desk",
      "description": "Payment, advance, refund, or receipt transaction.",
      "fields": {
        "id": "string",
        "billingAccountId": "string",
        "patientId": "string",
        "paymentType": "Payment|Advance|Refund",
        "mode": "Cash|Card|UPI|Bank Transfer|Insurance|Credit",
        "amount": "decimal",
        "status": "Pending|Success|Failed|Refunded|Cancelled",
        "transactionRef": "string|null",
        "receivedBy": "string",
        "receivedAt": "datetime"
      },
      "references": {
        "billingAccountId": "BillingAccount.id",
        "patientId": "Patient.id",
        "receivedBy": "User.id"
      },
      "apiActions": [
        "collectPayment",
        "listPayments",
        "issueRefund",
        "printReceipt"
      ]
    },
    "InsuranceCase": {
      "ownedBy": "Insurance Desk",
      "description": "Insurance, TPA, pre-auth, claim, and settlement case.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string|null",
        "companyName": "string",
        "tpaName": "string|null",
        "policyNo": "string",
        "preAuthStatus": "Not Required|Pending|Approved|Rejected|Expired",
        "claimStatus": "Draft|Submitted|Under Review|Rejected|Settled|Closed",
        "approvedAmount": "decimal|null",
        "settledAmount": "decimal|null"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id"
      },
      "apiActions": [
        "createInsuranceCase",
        "verifyPolicy",
        "submitPreAuth",
        "updateClaimStatus",
        "recordSettlement"
      ]
    },
    "IpdAdmission": {
      "ownedBy": "IPD Admissions",
      "description": "Admitted inpatient stay.",
      "fields": {
        "id": "string",
        "admissionNo": "string",
        "admissionRequestId": "string|null",
        "patientId": "string",
        "encounterId": "string",
        "departmentId": "string",
        "consultantId": "string",
        "admissionType": "Planned|Emergency|Transfer",
        "admittedAt": "datetime",
        "currentBedId": "string|null",
        "status": "AdmissionStatus",
        "diagnosis": "string|null"
      },
      "references": {
        "admissionRequestId": "AdmissionRequest.id",
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "departmentId": "Department.id",
        "consultantId": "User.id",
        "currentBedId": "Bed.id"
      },
      "apiActions": [
        "admitPatient",
        "getIpdAdmission",
        "listIpdAdmissions",
        "updateIpdAdmissionStatus"
      ]
    },
    "BedAssignment": {
      "ownedBy": "IPD Bed & Ward Management",
      "description": "Patient-to-bed assignment history.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "admissionId": "string",
        "bedId": "string",
        "assignedAt": "datetime",
        "releasedAt": "datetime|null",
        "assignedBy": "string",
        "status": "Active|Released|Cancelled"
      },
      "references": {
        "patientId": "Patient.id",
        "admissionId": "IpdAdmission.id",
        "bedId": "Bed.id",
        "assignedBy": "User.id"
      },
      "apiActions": [
        "assignBed",
        "transferBed",
        "releaseBedAssignment",
        "listBedAssignments"
      ]
    },
    "DoctorRound": {
      "ownedBy": "IPD Doctor Rounds",
      "description": "Doctor inpatient or ICU round note and decision.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "admissionId": "string",
        "doctorId": "string",
        "roundType": "Routine|Emergency|ICU|Discharge|Transfer",
        "roundAt": "datetime",
        "clinicalSummary": "string",
        "plan": "string|null",
        "status": "Draft|Signed|Amended"
      },
      "references": {
        "patientId": "Patient.id",
        "admissionId": "IpdAdmission.id",
        "doctorId": "User.id"
      },
      "apiActions": [
        "createRound",
        "updateRound",
        "signRound",
        "listRounds"
      ]
    },
    "DoctorOrder": {
      "ownedBy": "Doctor Orders",
      "description": "Medication, laboratory, radiology, procedure, nursing, or consultation order.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "orderedBy": "string",
        "orderType": "Medication|Laboratory|Radiology|Procedure|Nursing|Consultation|LDT|Blood",
        "priority": "Priority",
        "instructions": "string|null",
        "status": "Draft|Signed|Acknowledged|In Progress|Completed|Cancelled",
        "orderedAt": "datetime"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "orderedBy": "User.id"
      },
      "apiActions": [
        "createDoctorOrder",
        "signDoctorOrder",
        "acknowledgeDoctorOrder",
        "cancelDoctorOrder",
        "listDoctorOrders"
      ]
    },
    "MedicationAdministration": {
      "ownedBy": "IPD Medication Administration",
      "description": "eMAR administration event.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "orderId": "string",
        "medicineName": "string",
        "dose": "string",
        "route": "string",
        "scheduledAt": "datetime",
        "administeredAt": "datetime|null",
        "administeredBy": "string|null",
        "status": "MedicationAdministrationStatus",
        "reason": "string|null",
        "doubleVerifiedBy": "string|null"
      },
      "references": {
        "patientId": "Patient.id",
        "orderId": "DoctorOrder.id",
        "administeredBy": "User.id",
        "doubleVerifiedBy": "User.id"
      },
      "apiActions": [
        "listMedicationSchedule",
        "receiveMedicine",
        "verifyMedicine",
        "administerMedicine",
        "holdMedicine",
        "skipMedicine"
      ]
    },
    "NursingAssessment": {
      "ownedBy": "IPD Nursing Assessment",
      "description": "Nursing assessment and risk score record.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "admissionId": "string",
        "assessmentType": "string",
        "score": "string|null",
        "riskLevel": "RiskLevel",
        "notes": "string|null",
        "assessedBy": "string",
        "assessedAt": "datetime",
        "status": "Draft|Completed|Reviewed"
      },
      "references": {
        "patientId": "Patient.id",
        "admissionId": "IpdAdmission.id",
        "assessedBy": "User.id"
      },
      "apiActions": [
        "createNursingAssessment",
        "updateNursingAssessment",
        "completeNursingAssessment",
        "listNursingAssessments"
      ]
    },
    "IntakeOutputEntry": {
      "ownedBy": "IPD Intake / Output",
      "description": "Fluid intake or output event.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "entryType": "Intake|Output",
        "routeOrSource": "string",
        "amountMl": "number",
        "recordedAt": "datetime",
        "recordedBy": "string",
        "status": "Entered|Signed|Pending review|Cancelled"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "recordedBy": "User.id"
      },
      "apiActions": [
        "createIntakeOutputEntry",
        "listIntakeOutputEntries",
        "getFluidBalanceSummary",
        "signIntakeOutputShift"
      ]
    },
    "TransferRequest": {
      "ownedBy": "IPD Transfers",
      "description": "Patient transfer between beds, wards, units, ICU, or external facility.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "admissionId": "string",
        "fromLocation": "string",
        "toLocation": "string",
        "transferType": "Bed to Bed|Ward to ICU|ICU to Ward|External|Internal",
        "reason": "string",
        "requestedBy": "string",
        "status": "Requested|Approved|In Transit|Received|Cancelled|Rejected"
      },
      "references": {
        "patientId": "Patient.id",
        "admissionId": "IpdAdmission.id",
        "requestedBy": "User.id"
      },
      "apiActions": [
        "createTransferRequest",
        "approveTransferRequest",
        "confirmTransferReceive",
        "cancelTransferRequest"
      ]
    },
    "PackageAssignment": {
      "ownedBy": "IPD Packages",
      "description": "Package assignment and utilization tracking for admission.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "admissionId": "string",
        "packageName": "string",
        "status": "Active|Nearing Limit|Exceeded|Closed|Cancelled",
        "utilizationPercent": "number",
        "limitWarning": "boolean",
        "excludedItemsNote": "string|null"
      },
      "references": {
        "patientId": "Patient.id",
        "admissionId": "IpdAdmission.id"
      },
      "apiActions": [
        "assignPackage",
        "getPackageUtilization",
        "updatePackageWarning",
        "closePackage"
      ]
    },
    "DischargeWorkflow": {
      "ownedBy": "IPD Discharge",
      "description": "Clinical, nursing, pharmacy, billing, and bed-release discharge workflow.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "admissionId": "string",
        "initiatedBy": "string",
        "status": "Initiated|Clinical Clear|Nursing Clear|Billing Clear|Ready to Discharge|Discharged|Cancelled",
        "summaryStatus": "Pending|Draft|Signed|Printed",
        "billingClearanceStatus": "Pending|Cleared|Hold",
        "bedReleaseStatus": "Pending|Released",
        "initiatedAt": "datetime",
        "dischargedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "admissionId": "IpdAdmission.id",
        "initiatedBy": "User.id"
      },
      "apiActions": [
        "initiateDischarge",
        "updateDischargeChecklist",
        "clearDischargeBilling",
        "finalizeDischarge",
        "cancelDischarge"
      ]
    },
    "IcuStay": {
      "ownedBy": "ICU Command Center",
      "description": "ICU care episode linked to patient and admission.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "admissionId": "string|null",
        "icuUnitId": "string",
        "bedId": "string|null",
        "primaryDoctorId": "string|null",
        "status": "Pending Arrival|Active|Transfer Ready|Discharge Ready|Closed",
        "startedAt": "datetime",
        "endedAt": "datetime|null",
        "riskLevel": "RiskLevel"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "admissionId": "IpdAdmission.id",
        "icuUnitId": "HospitalUnit.id",
        "bedId": "Bed.id",
        "primaryDoctorId": "User.id"
      },
      "apiActions": [
        "openIcuStay",
        "getIcuStay",
        "listIcuPatients",
        "closeIcuStay"
      ]
    },
    "IcuAdmissionReview": {
      "ownedBy": "ICU Admissions",
      "description": "Head Nurse/ICU review before ICU arrival, bed allocation, and nurse assignment.",
      "fields": {
        "id": "string",
        "admissionRequestId": "string",
        "patientId": "string",
        "reviewedBy": "string|null",
        "readinessStatus": "Pending|Ready|Hold|Rejected",
        "bedId": "string|null",
        "unitNurseId": "string|null",
        "wardNurseId": "string|null",
        "reviewNotes": "string|null",
        "reviewedAt": "datetime|null"
      },
      "references": {
        "admissionRequestId": "AdmissionRequest.id",
        "patientId": "Patient.id",
        "reviewedBy": "User.id",
        "bedId": "Bed.id",
        "unitNurseId": "User.id",
        "wardNurseId": "User.id"
      },
      "apiActions": [
        "listIcuAdmissionQueue",
        "reviewIcuAdmission",
        "assignIcuBed",
        "assignIcuNurses"
      ]
    },
    "IcuMonitoringObservation": {
      "ownedBy": "ICU Monitoring",
      "description": "ICU vital, CVS, respiratory, abdominal, renal, neuro, drain, or line observation.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "icuStayId": "string",
        "observationType": "Vitals|CVS|Respiratory|Abdominal|Drain|LineDevice|Renal|Neuro",
        "parameterKey": "string",
        "value": "string|number|object",
        "unit": "string|null",
        "status": "Stable|Watch|Critical",
        "source": "Manual|Device|Imported",
        "recordedBy": "string|null",
        "recordedAt": "datetime"
      },
      "references": {
        "patientId": "Patient.id",
        "icuStayId": "IcuStay.id",
        "recordedBy": "User.id"
      },
      "apiActions": [
        "createIcuObservation",
        "listIcuObservations",
        "getIcuTrendSummary",
        "acknowledgeCriticalObservation"
      ]
    },
    "Device": {
      "ownedBy": "ICU Device Operations",
      "description": "Monitor, ventilator, infusion pump, gateway, or edge device.",
      "fields": {
        "id": "string",
        "assetTag": "string",
        "deviceType": "Monitor|Ventilator|Pump|Gateway|Other",
        "manufacturer": "string|null",
        "model": "string|null",
        "serialNo": "string|null",
        "status": "Active|Inactive|Maintenance|Faulty|Retired",
        "currentBedId": "string|null",
        "currentPatientId": "string|null"
      },
      "references": {
        "currentBedId": "Bed.id",
        "currentPatientId": "Patient.id"
      },
      "apiActions": [
        "listDevices",
        "registerDevice",
        "mapDeviceToBed",
        "unmapDevice",
        "updateDeviceStatus"
      ]
    },
    "DeviceSignalEvent": {
      "ownedBy": "ICU Device Operations",
      "description": "Connectivity, downtime, packet delay, missing data, and signal quality event.",
      "fields": {
        "id": "string",
        "deviceId": "string",
        "bedId": "string|null",
        "patientId": "string|null",
        "eventType": "Connected|Disconnected|Packet Delay|Missing Data|Low Signal|Recovered",
        "severity": "Info|Warning|Critical",
        "startedAt": "datetime",
        "resolvedAt": "datetime|null",
        "ownerUserId": "string|null"
      },
      "references": {
        "deviceId": "Device.id",
        "bedId": "Bed.id",
        "patientId": "Patient.id",
        "ownerUserId": "User.id"
      },
      "apiActions": [
        "listDeviceSignalEvents",
        "createDeviceSignalEvent",
        "resolveDeviceSignalEvent"
      ]
    },
    "DiagnosticOrder": {
      "ownedBy": "ICU Diagnostics Hub",
      "description": "Laboratory, radiology, pathology, microbiology, cardiology, or pulmonology diagnostic order.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "doctorOrderId": "string|null",
        "diagnosticType": "Laboratory|Radiology|Pathology|Microbiology|Cardiology|Pulmonology|POCT",
        "testName": "string",
        "priority": "Priority",
        "status": "Ordered|Sample Pending|In Process|Reported|Critical|Cancelled",
        "orderedAt": "datetime",
        "reportedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "doctorOrderId": "DoctorOrder.id"
      },
      "apiActions": [
        "createDiagnosticOrder",
        "listDiagnosticOrders",
        "updateDiagnosticStatus",
        "markCriticalResult"
      ]
    },
    "DiagnosticResult": {
      "ownedBy": "ICU Diagnostics Hub",
      "description": "Diagnostic result or report.",
      "fields": {
        "id": "string",
        "diagnosticOrderId": "string",
        "patientId": "string",
        "resultType": "Structured|PDF|Image|Narrative",
        "resultData": "object|string",
        "critical": "boolean",
        "verifiedBy": "string|null",
        "verifiedAt": "datetime|null",
        "doctorReviewed": "boolean"
      },
      "references": {
        "diagnosticOrderId": "DiagnosticOrder.id",
        "patientId": "Patient.id",
        "verifiedBy": "User.id"
      },
      "apiActions": [
        "getDiagnosticResult",
        "verifyDiagnosticResult",
        "acknowledgeCriticalResult",
        "markDoctorReviewed"
      ]
    },
    "EscalationCase": {
      "ownedBy": "ICU Escalation Center",
      "description": "Critical clinical, nursing, diagnostic, device, or operational escalation.",
      "fields": {
        "id": "string",
        "patientId": "string|null",
        "sourceModule": "string",
        "sourceEntity": "string",
        "sourceEntityId": "string",
        "trigger": "string",
        "severity": "RiskLevel",
        "status": "EscalationStatus",
        "ownerUserId": "string|null",
        "ownerRole": "string|null",
        "slaDueAt": "datetime|null",
        "closedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "ownerUserId": "User.id"
      },
      "apiActions": [
        "createEscalation",
        "listEscalations",
        "acknowledgeEscalation",
        "updateEscalationAction",
        "closeEscalation"
      ]
    },
    "TeleIcuConsult": {
      "ownedBy": "Tele ICU",
      "description": "Remote intensivist review request and recommendation.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "icuStayId": "string",
        "requestedBy": "string",
        "remoteDoctorId": "string|null",
        "readinessStatus": "Pending|Ready|Incomplete",
        "consultStatus": "Requested|Accepted|In Review|Recommendation Given|Closed|Cancelled",
        "recommendation": "string|null",
        "requestedAt": "datetime",
        "closedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "icuStayId": "IcuStay.id",
        "requestedBy": "User.id",
        "remoteDoctorId": "User.id"
      },
      "apiActions": [
        "requestTeleIcuConsult",
        "assignRemoteDoctor",
        "updateReadiness",
        "submitTeleIcuRecommendation",
        "closeTeleIcuConsult"
      ]
    },
    "NursePatientAssignment": {
      "ownedBy": "Head Nurse Patient Assignment",
      "description": "Patient assignment to Head Nurse, Unit Nurse, and Ward Nurse ownership chain.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "headNurseId": "string|null",
        "unitNurseId": "string|null",
        "wardNurseId": "string|null",
        "unitId": "string|null",
        "assignedAt": "datetime",
        "status": "Active|Reassigned|Released|Cancelled"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "headNurseId": "User.id",
        "unitNurseId": "User.id",
        "wardNurseId": "User.id",
        "unitId": "HospitalUnit.id"
      },
      "apiActions": [
        "assignPatientToNurses",
        "acknowledgeNurseAssignment",
        "reassignPatient",
        "releaseNurseAssignment"
      ]
    },
    "NurseEntry": {
      "ownedBy": "Ward Nurse Nurse Entry",
      "description": "Bedside nurse entry for vitals, oxygen, GCS, pain, sugar, weight, and notes.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "assignmentId": "string",
        "entryType": "Vitals|Oxygen|GCS|Pain|BloodSugar|Weight|Note",
        "entryData": "object",
        "abnormal": "boolean",
        "enteredBy": "string",
        "enteredAt": "datetime",
        "status": "Draft|Signed|Amended|Deleted"
      },
      "references": {
        "patientId": "Patient.id",
        "assignmentId": "NursePatientAssignment.id",
        "enteredBy": "User.id"
      },
      "apiActions": [
        "createNurseEntry",
        "updateNurseEntry",
        "signNurseEntry",
        "listNurseEntries"
      ]
    },
    "EarlyWarningScore": {
      "ownedBy": "Ward Nurse Early Warning Score",
      "description": "Patient deterioration score and escalation trigger.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "scoreType": "NEWS|MEWS|Custom",
        "score": "number",
        "riskLevel": "RiskLevel",
        "observationFrequency": "string|null",
        "calculatedAt": "datetime",
        "calculatedBy": "string|null",
        "escalationCaseId": "string|null"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "calculatedBy": "User.id",
        "escalationCaseId": "EscalationCase.id"
      },
      "apiActions": [
        "calculateEarlyWarningScore",
        "saveEarlyWarningScore",
        "listEarlyWarningScores",
        "triggerScoreEscalation"
      ]
    },
    "NursingNote": {
      "ownedBy": "Ward Nurse Nursing Notes",
      "description": "Structured or narrative nursing note.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "noteType": "Shift|Event|Care|Medication|Handover|Other",
        "content": "string",
        "createdBy": "string",
        "signedAt": "datetime|null",
        "status": "Draft|Signed|Amended|Deleted"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "createdBy": "User.id"
      },
      "apiActions": [
        "createNursingNote",
        "updateNursingNote",
        "signNursingNote",
        "listNursingNotes"
      ]
    },
    "PatientEvent": {
      "ownedBy": "Ward Nurse Patient Event Update",
      "description": "Timeline event for patient status change, clinical event, or operational handoff.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "encounterId": "string",
        "eventType": "Clinical|Operational|Medication|Device|Transfer|Family|Other",
        "severity": "RiskLevel",
        "summary": "string",
        "details": "string|null",
        "createdBy": "string",
        "createdAt": "datetime"
      },
      "references": {
        "patientId": "Patient.id",
        "encounterId": "Encounter.id",
        "createdBy": "User.id"
      },
      "apiActions": [
        "createPatientEvent",
        "listPatientEvents",
        "acknowledgePatientEvent"
      ]
    },
    "ShiftHandover": {
      "ownedBy": "Ward Nurse Shift Handover",
      "description": "Ward or unit shift handover package.",
      "fields": {
        "id": "string",
        "patientId": "string|null",
        "unitId": "string|null",
        "handoverType": "Patient|Unit|Shift",
        "fromUserId": "string",
        "toUserId": "string|null",
        "summary": "string",
        "pendingItems": "object[]",
        "status": "Draft|Submitted|Acknowledged|Returned|Verified|Closed",
        "submittedAt": "datetime|null",
        "verifiedBy": "string|null",
        "verifiedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "unitId": "HospitalUnit.id",
        "fromUserId": "User.id",
        "toUserId": "User.id",
        "verifiedBy": "User.id"
      },
      "apiActions": [
        "createShiftHandover",
        "submitShiftHandover",
        "acknowledgeShiftHandover",
        "verifyShiftHandover",
        "returnShiftHandover"
      ]
    },
    "IssueEscalation": {
      "ownedBy": "Ward Nurse Raise Issue / Unit Nurse Issue Review",
      "description": "Nursing issue raised by Ward Nurse and reviewed/escalated by Unit Nurse or Head Nurse.",
      "fields": {
        "id": "string",
        "patientId": "string",
        "raisedBy": "string",
        "assignedTo": "string|null",
        "issueType": "Medication|Vitals|DoctorOrder|Device|PatientCare|Handover|Other",
        "severity": "RiskLevel",
        "description": "string",
        "status": "Open|Reviewed|Escalated|Resolved|Closed",
        "raisedAt": "datetime",
        "resolvedAt": "datetime|null"
      },
      "references": {
        "patientId": "Patient.id",
        "raisedBy": "User.id",
        "assignedTo": "User.id"
      },
      "apiActions": [
        "raiseNursingIssue",
        "reviewNursingIssue",
        "escalateNursingIssue",
        "resolveNursingIssue"
      ]
    },
    "StaffAvailability": {
      "ownedBy": "Head Nurse Staff Availability",
      "description": "Nurse/staff availability and workload for assignment decisions.",
      "fields": {
        "id": "string",
        "userId": "string",
        "unitId": "string|null",
        "shiftDate": "date",
        "shiftName": "string",
        "availabilityStatus": "Available|Busy|On Break|On Leave|Unavailable",
        "assignedPatientCount": "number",
        "skillTags": "string[]"
      },
      "references": {
        "userId": "User.id",
        "unitId": "HospitalUnit.id"
      },
      "apiActions": [
        "listStaffAvailability",
        "updateStaffAvailability",
        "getStaffWorkload"
      ]
    },
    "ReportRequest": {
      "ownedBy": "Reports",
      "description": "Report generation or scheduled report request.",
      "fields": {
        "id": "string",
        "reportKey": "string",
        "requestedBy": "string",
        "filters": "object",
        "format": "PDF|XLSX|CSV|JSON",
        "status": "Queued|Running|Completed|Failed|Cancelled",
        "downloadUrl": "string|null",
        "requestedAt": "datetime",
        "completedAt": "datetime|null"
      },
      "references": {
        "requestedBy": "User.id"
      },
      "apiActions": [
        "listReports",
        "generateReport",
        "scheduleReport",
        "downloadReport"
      ]
    },
    "SystemConfiguration": {
      "ownedBy": "Settings & Configuration",
      "description": "Versioned module-level configuration.",
      "fields": {
        "id": "string",
        "moduleKey": "string",
        "configKey": "string",
        "configValue": "object",
        "version": "number",
        "status": "Draft|Active|Archived",
        "updatedBy": "string",
        "updatedAt": "datetime"
      },
      "references": {
        "updatedBy": "User.id"
      },
      "apiActions": [
        "getConfiguration",
        "updateConfiguration",
        "activateConfigurationVersion",
        "listConfigurationHistory"
      ]
    },
    "IntegrationConnection": {
      "ownedBy": "Integrations",
      "description": "External system connection such as ABHA, FHIR, PACS, SMS, WhatsApp, email, or payment.",
      "fields": {
        "id": "string",
        "integrationType": "ABHA|FHIR|PACS|SMS|WhatsApp|Email|Payment|Device",
        "name": "string",
        "status": "Active|Inactive|Failed|Testing",
        "healthStatus": "Healthy|Warning|Down|Unknown",
        "lastCheckedAt": "datetime|null",
        "configuration": "object"
      },
      "apiActions": [
        "listIntegrations",
        "testIntegration",
        "updateIntegration",
        "getIntegrationHealth"
      ]
    }
  },
  "moduleEntityMap": {
    "Authentication": {
      "primaryEntities": [
        "User",
        "Role",
        "Permission",
        "AuditEvent"
      ],
      "apiGroups": [
        "auth",
        "sessions",
        "password",
        "otp"
      ]
    },
    "User Management": {
      "primaryEntities": [
        "User",
        "Role",
        "Department",
        "HospitalUnit",
        "AuditEvent"
      ],
      "apiGroups": [
        "users",
        "userAssignments",
        "userStatus"
      ]
    },
    "Patient Identity": {
      "primaryEntities": [
        "Patient",
        "PatientContact",
        "PatientConsent",
        "PatientDocument",
        "Encounter"
      ],
      "apiGroups": [
        "patients",
        "patientSearch",
        "patientDocuments",
        "patientConsents",
        "patientContacts"
      ]
    },
    "Patient Details - Triage": {
      "primaryEntities": [
        "Patient",
        "Encounter",
        "TriageRecord",
        "TriageChecklistItem",
        "PatientDocument",
        "MobileUploadSession",
        "Notification",
        "AuditEvent"
      ],
      "apiGroups": [
        "patientTriage",
        "triageDocuments",
        "triageQr",
        "mobileUpload",
        "triageEmergencyActions",
        "triagePrint"
      ]
    },
    "Reception": {
      "primaryEntities": [
        "Patient",
        "Appointment",
        "OpdQueueToken",
        "AdmissionRequest",
        "AdmissionQr",
        "BillingAccount",
        "Payment"
      ],
      "apiGroups": [
        "receptionDashboard",
        "registration",
        "appointments",
        "opdQueue",
        "admissionReception",
        "frontOfficeBilling"
      ]
    },
    "IPD": {
      "primaryEntities": [
        "IpdAdmission",
        "Bed",
        "BedAssignment",
        "DoctorRound",
        "DoctorOrder",
        "MedicationAdministration",
        "NursingAssessment",
        "IntakeOutputEntry",
        "TransferRequest",
        "PackageAssignment",
        "DischargeWorkflow",
        "BillingAccount"
      ],
      "apiGroups": [
        "ipdAdmissions",
        "ipdBeds",
        "ipdRounds",
        "ipdMedication",
        "ipdNursing",
        "ipdTransfers",
        "ipdDischarge",
        "ipdBilling"
      ]
    },
    "ICU": {
      "primaryEntities": [
        "IcuStay",
        "IcuAdmissionReview",
        "IcuMonitoringObservation",
        "Device",
        "DeviceSignalEvent",
        "DiagnosticOrder",
        "DiagnosticResult",
        "EscalationCase",
        "TeleIcuConsult",
        "NursePatientAssignment",
        "AuditEvent"
      ],
      "apiGroups": [
        "icuCommandCenter",
        "icuPatientSearch",
        "icuSmartBed",
        "icuAdmissions",
        "icuMonitoring",
        "icuDevices",
        "icuDiagnostics",
        "icuEscalations",
        "teleIcu",
        "icuAnalytics"
      ]
    },
    "Ward Nurse": {
      "primaryEntities": [
        "NursePatientAssignment",
        "NurseEntry",
        "EarlyWarningScore",
        "IntakeOutputEntry",
        "MedicationAdministration",
        "DoctorOrder",
        "NursingNote",
        "PatientEvent",
        "Task",
        "ShiftHandover",
        "IssueEscalation"
      ],
      "apiGroups": [
        "wardNursePatients",
        "wardNurseEntry",
        "wardNurseEws",
        "wardNurseMedication",
        "wardNurseTasks",
        "wardNurseHandover",
        "wardNurseIssues"
      ]
    },
    "Unit Nurse": {
      "primaryEntities": [
        "NursePatientAssignment",
        "NurseEntry",
        "EarlyWarningScore",
        "IssueEscalation",
        "EscalationCase",
        "ShiftHandover",
        "StaffAvailability"
      ],
      "apiGroups": [
        "unitNursePatients",
        "unitNurseMonitoring",
        "unitNurseIssueReview",
        "unitNurseEscalation",
        "unitNurseHandover"
      ]
    },
    "Head Nurse": {
      "primaryEntities": [
        "IcuAdmissionReview",
        "NursePatientAssignment",
        "StaffAvailability",
        "IssueEscalation",
        "EscalationCase",
        "ShiftHandover",
        "AuditEvent"
      ],
      "apiGroups": [
        "headNurseConsole",
        "headNurseAdmissions",
        "headNurseAvailability",
        "headNurseAssignment",
        "headNurseEscalations",
        "headNurseHandover",
        "headNurseAudit"
      ]
    },
    "Billing": {
      "primaryEntities": [
        "BillingAccount",
        "BillingLineItem",
        "Payment",
        "InsuranceCase",
        "Patient",
        "Encounter",
        "AuditEvent"
      ],
      "apiGroups": [
        "billingDesk",
        "invoices",
        "payments",
        "refunds",
        "advances",
        "insurance",
        "tpa"
      ]
    },
    "Reports": {
      "primaryEntities": [
        "ReportRequest",
        "AuditEvent",
        "BillingAccount",
        "IcuStay",
        "IpdAdmission",
        "Task"
      ],
      "apiGroups": [
        "reports",
        "mis",
        "clinicalReports",
        "operationalReports",
        "financialReports",
        "auditReports"
      ]
    },
    "Settings & Integrations": {
      "primaryEntities": [
        "SystemConfiguration",
        "IntegrationConnection",
        "AuditEvent"
      ],
      "apiGroups": [
        "settings",
        "hospitalSetup",
        "securityPolicy",
        "integrations",
        "configurationHistory"
      ]
    }
  },
  "implementationSequence": [
    {
      "phase": 1,
      "name": "Foundation",
      "entities": [
        "User",
        "Role",
        "Permission",
        "Department",
        "HospitalUnit",
        "Bed",
        "AuditEvent",
        "Notification",
        "Task"
      ]
    },
    {
      "phase": 2,
      "name": "Patient & Reception",
      "entities": [
        "Patient",
        "PatientContact",
        "PatientConsent",
        "PatientDocument",
        "Encounter",
        "Appointment",
        "OpdQueueToken",
        "AdmissionRequest",
        "AdmissionQr",
        "TriageRecord",
        "TriageChecklistItem",
        "MobileUploadSession"
      ]
    },
    {
      "phase": 3,
      "name": "Billing & Insurance",
      "entities": [
        "BillingAccount",
        "BillingLineItem",
        "Payment",
        "InsuranceCase"
      ]
    },
    {
      "phase": 4,
      "name": "IPD",
      "entities": [
        "IpdAdmission",
        "BedAssignment",
        "DoctorRound",
        "DoctorOrder",
        "MedicationAdministration",
        "NursingAssessment",
        "IntakeOutputEntry",
        "TransferRequest",
        "PackageAssignment",
        "DischargeWorkflow"
      ]
    },
    {
      "phase": 5,
      "name": "ICU",
      "entities": [
        "IcuStay",
        "IcuAdmissionReview",
        "IcuMonitoringObservation",
        "Device",
        "DeviceSignalEvent",
        "DiagnosticOrder",
        "DiagnosticResult",
        "EscalationCase",
        "TeleIcuConsult"
      ]
    },
    {
      "phase": 6,
      "name": "Nursing",
      "entities": [
        "NursePatientAssignment",
        "NurseEntry",
        "EarlyWarningScore",
        "NursingNote",
        "PatientEvent",
        "ShiftHandover",
        "IssueEscalation",
        "StaffAvailability"
      ]
    },
    {
      "phase": 7,
      "name": "Reports, Settings, Integrations",
      "entities": [
        "ReportRequest",
        "SystemConfiguration",
        "IntegrationConnection"
      ]
    }
  ]
}
```
