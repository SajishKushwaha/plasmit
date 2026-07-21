# Role Permission Matrix

## Permission Codes

Core:
- `USER_VIEW`, `USER_CREATE`, `USER_UPDATE`, `ROLE_VIEW`, `PERMISSION_VIEW`
- `PATIENT_SEARCH`, `PATIENT_VIEW`, `PATIENT_CREATE`, `PATIENT_UPDATE`
- `LOCATION_VIEW`, `BED_VIEW`, `AUDIT_VIEW`, `NOTIFICATION_VIEW`

ICU Admin:
- `ICU_DASHBOARD_VIEW`, `ICU_ANALYTICS_VIEW`
- `ICU_BED_VIEW`, `ICU_BED_ALLOCATE`, `ICU_BED_RESERVE`, `ICU_BED_RELEASE`, `ICU_BED_UPDATE`
- `ICU_ADMISSION_VIEW`, `ICU_ADMISSION_CREATE`, `ICU_ADMISSION_APPROVE`, `ICU_ADMISSION_REJECT`, `ICU_ADMISSION_COMPLETE`
- `ICU_STAFF_VIEW`, `ICU_STAFF_ASSIGN`, `ICU_SHIFT_VIEW`, `ICU_SHIFT_CREATE`, `ICU_SHIFT_UPDATE`
- `ICU_TRANSFER_VIEW`, `ICU_TRANSFER_CREATE`, `ICU_TRANSFER_APPROVE`, `ICU_TRANSFER_COMPLETE`
- `DEVICE_VIEW`, `DEVICE_ASSIGN`, `DEVICE_MAINTENANCE`

Doctor IPD:
- `IPD_DASHBOARD_VIEW`, `IPD_PATIENT_VIEW`
- `IPD_ROUND_VIEW`, `IPD_ROUND_CREATE`, `IPD_ROUND_UPDATE`, `IPD_ROUND_COMPLETE`
- `IPD_ORDER_VIEW`, `IPD_ORDER_CREATE`, `IPD_ORDER_UPDATE`, `IPD_ORDER_HOLD`, `IPD_ORDER_RESUME`, `IPD_ORDER_DISCONTINUE`, `IPD_ORDER_CANCEL`
- `IPD_NOTE_VIEW`, `IPD_NOTE_CREATE`, `IPD_NOTE_SIGN`, `IPD_NOTE_AMEND`
- `IPD_CONSULT_CREATE`, `RESULT_VIEW`

Ward Nurse:
- `WARD_NURSE_DASHBOARD_VIEW`, `WARD_PATIENT_VIEW`
- `NURSING_ASSESSMENT_VIEW`, `NURSING_ASSESSMENT_CREATE`
- `NURSING_VITALS_VIEW`, `NURSING_VITALS_CREATE`
- `NURSING_MEDICATION_VIEW`, `NURSING_MEDICATION_ADMINISTER`, `NURSING_MEDICATION_HOLD`, `NURSING_MEDICATION_REFUSE`, `NURSING_MEDICATION_UPDATE`
- `NURSING_IO_VIEW`, `NURSING_IO_CREATE`
- `NURSING_NOTE_VIEW`, `NURSING_NOTE_CREATE`, `NURSING_NOTE_SIGN`
- `NURSING_TASK_VIEW`, `NURSING_TASK_COMPLETE`
- `NURSING_HANDOVER_VIEW`, `NURSING_HANDOVER_CREATE`

Head Nurse:
- `HEAD_NURSE_DASHBOARD_VIEW`, `HEAD_NURSE_ADMISSION_VIEW`, `HEAD_NURSE_ADMISSION_REVIEW`
- `HEAD_NURSE_STAFF_VIEW`, `HEAD_NURSE_UNIT_VIEW`
- `HEAD_NURSE_ASSIGN_PATIENT`, `HEAD_NURSE_ASSIGN_STAFF`, `HEAD_NURSE_MANAGE_ROSTER`
- `HEAD_NURSE_ESCALATION_VIEW`, `HEAD_NURSE_ESCALATION_ASSIGN`
- `HEAD_NURSE_VERIFY_HANDOVER`, `HEAD_NURSE_AUDIT_VIEW`

Unit Nurse:
- `UNIT_NURSE_DASHBOARD_VIEW`, `UNIT_NURSE_PATIENT_VIEW`, `UNIT_NURSE_ASSIGN_PATIENT`
- `UNIT_NURSE_CHECKLIST_VIEW`, `UNIT_NURSE_COMPLETE_CHECKLIST`
- `UNIT_NURSE_TRANSFER_VIEW`, `UNIT_NURSE_TRANSFER_UPDATE`
- `UNIT_NURSE_HANDOVER_VIEW`, `UNIT_NURSE_HANDOVER_CREATE`
- `UNIT_NURSE_EQUIPMENT_VIEW`, `UNIT_NURSE_ISSUE_VIEW`, `UNIT_NURSE_ISSUE_UPDATE`

ER Nurse:
- `ER_RECEPTION_VIEW`, `ER_TRIAGE_CREATE`, `ER_TRIAGE_UPDATE`
- `ER_VITALS_CREATE`, `ER_PATIENT_SEARCH`, `ER_PATIENT_VIEW`

Receptionist:
- `RECEPTION_VIEW`, `BASIC_DEMOGRAPHIC_CREATE`, `BASIC_DEMOGRAPHIC_UPDATE`
- `PATIENT_SEARCH`, `PATIENT_VIEW`, `PATIENT_CREATE`

## Matrix

| Permission area | ICU Admin | Doctor IPD | Ward Nurse | Head Nurse | Unit Nurse | ER Nurse | Receptionist |
|---|---:|---:|---:|---:|---:|---:|---:|
| View assigned/authorized patients | Yes | Yes | Yes | Yes | Yes | ER scope | Demographic scope |
| Create patient/admission request | Yes | No | No | Review only | No | Emergency intake | Basic demographic |
| Approve/reject ICU admission | Yes | No | No | Review/recommend | No | No | No |
| Allocate/release ICU bed | Yes | No | No | Recommend | Unit scope | No | No |
| View ICU dashboard/analytics | Yes | Limited | Limited | Nursing scope | Unit scope | No | No |
| Create doctor orders | No | Yes | No | No | No | No | No |
| Hold/resume/discontinue orders | No | Yes | No | No | No | No | No |
| Acknowledge doctor orders | No | Read only | Yes | Monitor | Monitor | No | No |
| Create/sign doctor progress notes | No | Yes | No | No | No | No | No |
| Record vitals | No | View | Yes | Monitor | Monitor | ER triage only | No |
| Medication administration | No | View | Yes | Monitor | Monitor | No | No |
| Create nursing notes | No | View | Yes | View | View | ER notes only | No |
| Submit shift handover | No | No | Yes | Verify | Yes for unit | No | No |
| Assign nurse/patient | ICU staffing | No | No | Yes | Unit scope | No | No |
| Manage roster | ICU staffing | No | No | Yes | View only | No | No |
| Escalation create | Yes | Yes | Yes | Yes | Yes | Yes | No |
| Escalation assign | Yes | No | No | Yes | Unit scope | No | No |
| Escalation resolve | Yes | Own/clinical | Own | Yes | Unit scope | Own ER intake | No |
| Audit logs | Yes | Own clinical records | Own records | Nursing scope | Unit scope | Own ER records | Own demographic records |
| Export reports | Yes | Clinical assigned | Own ward | Nursing reports | Unit reports | ER intake reports | Basic demographic reports |

## Record-Level Authorization

- `ICU_ADMIN`: ICU-scoped operations; can manage ICU operational records but cannot edit signed doctor notes.
- `DOCTOR_IPD`: admitted patients assigned to the doctor, consultation patients, or department-authorized patients.
- `WARD_NURSE`: assigned patients and permitted ward patients only.
- `HEAD_NURSE`: assigned wards/ICU nursing operations and nurse-managed workflow records.
- `UNIT_NURSE`: assigned unit patients, unit checklists, unit handovers, and unit equipment only.
- `ER_NURSE`: emergency reception patients and triage/vitals records only.
- `RECEPTIONIST`: front office patient basic demographic records only.

## Sensitive Action Rules

- Signed clinical notes are immutable. Use addendum/version APIs.
- Medication administration requires authenticated nurse and scheduled dose validation.
- Bed allocation requires bed availability and admission status validation.
- Admission approval/rejection requires reason/comment and audit log.
- Role and user IDs must be resolved server-side from JWT.
