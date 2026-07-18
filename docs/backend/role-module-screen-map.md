# Role Module Screen Map

Canonical role codes:
- `ICU_ADMIN`
- `DOCTOR_IPD`
- `WARD_NURSE`
- `HEAD_NURSE`
- `UNIT_NURSE`
- `ER_NURSE`
- `RECEPTIONLIST`

## ICU Admin

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Command | `/icu-command-center`, `/executive-dashboard`, `/notifications-tasks` | ICU metrics, actions, notifications, tasks |
| Patients | `/patients/search`, `/patients/smart-bed-view`, `/patients/admissions`, `/patients/discharges`, `/patients/:patientId`, `/daily-chart`, `/timeline`, `/unit-staff-availability` | Patient, AdmissionRequest, Admission, Bed, BedAllocation, StaffAssignment |
| Critical Care | `/critical-care/operations`, `/device-monitoring`, `/clinical-alerts`, `/rounds`, `/icu-round-2`, `/escalation-center` | Alert, Device, DeviceSignal, DoctorRound, Escalation |
| Clinical Workspace | `/clinical-workspace/patient-overview`, `/progress-notes`, `/orders-care-plans`, `/doctor-order-entry`, `/family-communication` | ClinicalSummary, ProgressNote, DoctorOrder, CarePlan, FamilyCommunication |
| Nursing | `/nursing/station`, `/assigned-patients`, `/nurse-entry`, `/nurse-review`, `/medication-administration`, `/early-warning-score`, `/shift-handover`, `/tasks-assessments` and related pending/review routes | NursingAssessment, NursingTask, MedicationAdministration, Handover, Vitals |
| Diagnostics | `/diagnostics/hub`, `/investigation-entry`, `/trends-charts`, `/hub/*` | InvestigationOrder, LabResult, RadiologyReport, ReportAttachment |
| Tele ICU | `/tele-icu/*` | RemoteConsultation, TeleIcuEscalation, SLA, LocalTeam |
| Device Operations | `/device-operations/*` | Device, DeviceMapping, DeviceMaintenance, DeviceConnectivity |
| Clinical Intelligence | `/clinical-intelligence/patient-risk-center`, `/early-warning-scores` | RiskScore, EarlyWarningScore, AlertRule |
| Analytics | `/analytics/operational`, `/clinical`, `/device`, `/pilot-outcome`, `/adoption` | Aggregated metrics and chart datasets |
| Administration | `/administration/users-roles`, `/configuration`, `/audit-logs` | User, Role, Permission, Configuration, AuditLog |

## Doctor IPD

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Dashboard | `/doctor-ipd` | DoctorDashboard, AssignedPatient, Alert, PendingTask |
| Patient Detail | `/doctor-ipd/patients/:patientId` | ClinicalSummary, Admission, Vitals, Orders, Results, Notes |
| Orders | `/doctor/orders`, `/doctor/orders/ldt` | DoctorOrder, MedicationOrder, LabOrder, RadiologyOrder, LdtOrder, ConsultationRequest |
| Progress Notes | feature `doctor-ipd/progress-notes` | ProgressNote, NoteVersion, ElectronicSignature |
| Assessment / Clinical Exam | feature `doctor-ipd/assessment`, `clinical-examination` | ClinicalExamination, Diagnosis, ProblemList |
| Intake Output / Live Monitoring | feature `doctor-ipd/intake-output`, `live-monitoring` | IntakeOutput, DeviceSignal, VitalsTrend |

## Ward Nurse

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Assigned Patient | `/ward-nurse`, `/assigned-patients`, `/icu-command-center/clinical-workspace/patient-overview` | AssignedPatient, Patient, Admission |
| Bedside Documentation | `/nurse-entry`, `/early-warning-score`, `/intake-output`, `/patient-event-update` | NursingAssessment, VitalSign, IntakeOutput, PatientEvent |
| Nursing Work | `/medicine-receive-verify`, `/order`, `/medication-administration`, `/nursing-notes`, `/patient-medication` | MedicationAdministration, DoctorOrder, NursingNote |
| Pending Work | `/pending-doctor-orders`, `/pending-medicines`, `/pending-nursing-tasks`, `/pending-vitals`, `/tasks-assessments` | NursingTask, OrderAcknowledgement, MAR |
| Handover | `/shift-handover`, `/shift-pending-summary`, `/raise-issue` | ShiftHandover, HandoverIssue |
| Review / Escalation | `/critical-alerts`, `/first-level-review`, `/nurse-review`, `/escalation-tracking`, `/escalation-decision` | Alert, NursingReview, Escalation |
| Assignment Link | `/bed-ward-nurse-link` | StaffAssignment, BedAssignment |

## Head Nurse

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Dashboard | `/head-nurse`, `/nursing-icu/head-nurse?view=icu`, `/nursing-icu/head-nurse?view=patients` | HeadNurseDashboard, Census, Workload |
| Admissions | `/new-admissions`, `/admission-queue`, `/admission-review` | AdmissionRequest, AdmissionReview |
| Assignment | `/unit-assignment`, `/patient-assignment`, `/staff-availability`, `/unit-availability` | Unit, Bed, StaffRoster, NurseAssignment |
| Escalations | `/alerts-delays`, `/escalations`, `/escalation` | Escalation, CriticalDelay |
| Handover | `/shift-handover`, `/handover-verification` | ShiftHandover, HandoverVerification |
| Audit & Control | `/audit-control`, `/nursing-icu/head-nurse/audit-control/*` | AuditLog, QualityAudit, CriticalDelayReport |

## Unit Nurse

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Assigned Patients | `/unit-nurse`, `/icu-command-center/nursing/assigned-patients` | UnitNurseAssignment, AssignedPatient |
| Monitoring | `/unit-nurse/monitoring` | UnitDashboard, Vitals, Alerts, Tasks |
| Ward Assignment | `/unit-nurse/ward-assignment` | WardAssignment, StaffAssignment |
| Handover | `/unit-nurse/handover-submit` | UnitHandover |
| Issue Review | `/unit-nurse/issue-review` | HandoverIssue, WardIssue |
| Escalation | `/unit-nurse/escalation` | UnitEscalation |

## ER Nurse

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Dashboard | `/receptionist/emergency-reception` | EmergencyIntake, TriageAssessment, VitalSign, EmergencyPatient |
| Patient Details | `/receptionist/patient-details` | Patient |

## Receptionlist

| Module | Screens / Routes | Primary backend resources |
|---|---|---|
| Reception | `/receptionist/patient-details` (`Basic Demographic`) | Patient, PatientIdentity, PatientContact, Referral |
