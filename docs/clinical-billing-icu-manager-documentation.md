# Clinical Examination, Billing Desk, And ICU Monitoring Documentation

## 1. Document Purpose

Ye document manager/demo explanation ke liye banaya gaya hai. Isme following modules ka complete functional overview hai:

- Clinical Examination
- Billing Desk
- ICU CVS Monitoring
- ICU Abdominal Monitoring
- ICU Drains & Tubes
- ICU Lines & Devices

Goal ye hai ki aap manager ke saamne confidently explain kar sako ki har module kya karta hai, kaun use karega, screens ka flow kya hai, aur future backend integration ka scope kya hai.

## 2. High-Level Summary

| Module | Primary User | Main Purpose |
| --- | --- | --- |
| Clinical Examination | Doctor / Consultant | Structured patient examination, specialty templates, scoring, notes |
| Billing Desk | Billing Executive / Front Office | Patient selection, services/tests/packages billing, payment collection |
| CVS Monitoring | ICU Doctor / ICU Nurse | Cardiovascular vitals and trends monitoring |
| Abdominal Monitoring | ICU Doctor / ICU Nurse | Abdominal pressure and output monitoring |
| Drains & Tubes | ICU Nurse / Surgeon / ICU Doctor | Drain/tube output, site status, alerts, history |
| Lines & Devices | ICU Nurse / ICU Doctor | Catheter/line/device patency, site, flow, alerts, history |

## 3. Clinical Examination Module

### 3.1 Route

`/clinical-examination`

### 3.2 Business Purpose

Clinical Examination module doctor ko structured clinical documentation workspace deta hai. Iska purpose free-text notes ko organized specialty-wise clinical findings me convert karna hai.

Doctor ek patient ke clinical status, vitals, specialty examination, severity, scoring, reports, notes, and approvals ko ek hi screen se manage kar sakta hai.

### 3.3 Patient Context

Screen demo patient context show karta hai:

- Patient name
- UHID
- Age/Gender
- IPD/OPD number
- Ward/Bed
- Consultant
- Allergy
- Risk flags

Example patient:

- Name: Meera Joshi
- UHID: PLH-240118
- Ward/Bed: ICU-2 / Bed 07
- Consultant: Dr. Kavita Rao
- Allergy: Penicillin allergy
- Flags: Fall risk, High BP watch, Anticoagulant review

### 3.4 Main Features

- Patient header with clinical identity
- Save draft
- Restore draft
- Print
- Quick actions
- Specialty picker
- Toggle-based clinical matrix
- Findings and notes
- Clinical scoring panel
- Trend card
- Risk alert
- Clinical timeline
- Report links
- Template builder references
- Backend API and database planning references

### 3.5 Quick Actions

Quick actions available:

- Clinical Examination
- Progress Notes
- Orders
- Prescription
- Vitals
- Reports
- Nursing Notes
- Discharge Summary

Manager explanation:

> Doctor ko ek single clinical workspace milta hai jahan patient ka examination, progress notes, orders, prescription, vitals, reports, nursing notes, and discharge workflow ek connected interface me available hai.

### 3.6 Specialty Templates

Specialties available:

- CVS
- CNS
- Respiratory
- Gastroenterology
- Orthopedic
- ENT
- Ophthalmology
- Gynecology
- Pediatrics
- Dermatology
- Psychiatry
- General Medicine

Each specialty has:

- Department mapping
- Template icon
- Recently used/favorite marking
- Structured findings
- Default notes
- Severity scoring

Manager explanation:

> Har department ka alag examination template hai. Doctor specialty select karke relevant findings fill kar sakta hai. Example: CVS me heart sounds, murmur, pulse, BP, JVP; CNS me GCS, motor power, reflexes; Respiratory me breath sounds, wheeze, SpO2.

### 3.7 Toggle-Based Clinical Matrix

Toggle options:

- Normal
- Mild
- Moderate
- Severe
- Absent
- Present
- Positive
- Negative

Purpose:

- Fast clinical entry
- Reduces typing
- Standardizes examination documentation
- Helps scoring and severity calculation

Manager explanation:

> Doctor long text type karne ke bajay one-click toggles se findings mark kar sakta hai. Isse documentation faster and standardized hoti hai.

### 3.8 Clinical Scoring

Scores shown:

- GCS
- Pain score
- NEWS score
- Fall risk

Purpose:

- Risk visibility
- Clinical decision support
- Consultant verification indication
- Patient safety tracking

### 3.9 Reports And Timeline

Report references:

- ECG
- Echo
- Lab reports
- X-ray

Timeline shows:

- Previous clinical examinations
- Doctor name
- Summary
- Status such as draft, final submitted, consultant verified

### 3.10 Future Backend Scope

Planned APIs referenced in data:

- `GET /api/v1/patients/:id`
- `GET /api/v1/clinical/templates`
- `POST /api/v1/clinical/examinations`
- `GET /api/v1/clinical/graphs/:patientId`
- `POST /api/v1/clinical/scores/calculate`
- `GET /api/v1/clinical/history/:patientId`
- `POST /api/v1/clinical/approvals`
- `GET /api/v1/clinical/examinations/:id/pdf`

Planned database tables:

- patients
- clinical_examinations
- examination_templates
- examination_sections
- examination_fields
- examination_results
- clinical_scores
- clinical_graph_data
- doctor_notes
- approvals
- attachments

### 3.11 Demo Script

1. Open `/clinical-examination`.
2. Show patient header and safety flags.
3. Explain quick actions.
4. Select CVS or Respiratory specialty.
5. Show toggle matrix.
6. Show findings and notes.
7. Show clinical scoring panel.
8. Show trend/report/timeline area.
9. Explain that backend integration can store templates, notes, approvals, and PDF export.

Manager closing line:

> Clinical Examination module standardizes doctor documentation and gives management better auditability, faster clinical entry, and structured patient history.

## 4. Billing Desk Module

### 4.1 Routes

| Screen | Route |
| --- | --- |
| Billing Desk Main | `/billing-desk` |
| Patient | `/billing-desk/patient` |
| Tests | `/billing-desk/tests` |
| Packages | `/billing-desk/packages` |
| Bill Summary | `/billing-desk/summary` |
| Payment | `/billing-desk/payment` |

### 4.2 Business Purpose

Billing Desk module OPD/IPD/front-office billing workflow ko handle karta hai. Billing executive patient select karta hai, referral mapping dekhta hai, appointment fees/tests/packages add karta hai, bill summary generate karta hai, and payment collect karta hai.

### 4.3 Billing Workflow Steps

Workflow tabs:

- Patient
- Referral
- Appointments
- Pathology
- Radiology
- Packages
- Quick Tests
- Individual Tests
- Bill Summary
- Payment

Manager explanation:

> Billing desk patient selection se payment tak complete flow cover karta hai. Patient identify karne ke baad referral, appointments, pathology, radiology, packages, bill summary, and payment ek guided workflow me manage hote hain.

### 4.4 Patient Selection

Patient data includes:

- Name
- UHID
- Phone
- Age/Gender
- Blood group
- Registered date
- Payer
- City
- Source
- Doctor
- Insurance status
- Last visit

Filters/search:

- Search patient
- Payer filter
- City filter
- Source filter
- Pagination

Patient registration draft fields:

- Name
- Phone
- Age
- Gender
- DOB
- Blood group
- Payer type
- Department
- Visit type
- City/state/address
- ID type and number
- Source
- Doctor

### 4.5 Referral Management

Referral types:

- Doctor
- Corporate
- TPA
- Walk-in
- Camp

Referral fields:

- Doctor/source
- Organization
- Commission
- Status
- Notes

Manager explanation:

> Referral section se billing team identify kar sakti hai ki patient walk-in hai, doctor referral hai, corporate case hai, TPA case hai, ya health camp se aaya hai.

### 4.6 Services And Tests

Supported service categories:

- Pathology
- Radiology
- Package
- Quick Test
- Individual Test
- Appointment

Example services:

- CBC with ESR
- Liver Function Test
- Thyroid Profile
- Chest X-ray PA
- USG Abdomen
- CT Brain Plain
- Executive Health Package
- Cardiac Risk Package
- Blood Sugar Random
- ECG 12 Lead
- Vitamin D
- OPD Consultation Fee

Each service can include:

- Price
- Discount
- Tax
- Urgency
- TAT
- Sample type
- Fasting requirement
- Contrast requirement
- Insurance coverage

### 4.7 Packages

Package flow supports included services.

Example:

- Executive Health Package can include CBC, LFT, ECG, X-ray.
- Included services may be added with package coverage logic.

Manager explanation:

> Packages add karte hi related tests automatically bill me add ho sakte hain. This helps reduce manual missed billing and duplicate entry.

### 4.8 Bill Calculation

Bill totals calculate:

- Subtotal
- Discount
- Tax
- Total
- Insurance amount
- Patient payable
- Paid amount
- Balance

Insurance handling:

- Approved or pre-auth cases can calculate insurance share.
- Patient payable amount is adjusted after insurance amount.

### 4.9 Payment

Payment modes:

- Cash
- Card
- UPI
- Insurance

Payment status:

- Pending
- Confirmed

Bill status:

- Draft
- Ready
- Paid
- Partial

### 4.10 Local Draft

Billing draft is saved in browser localStorage:

`plasmit-billing-desk-draft`

This stores draft context such as patient UHID, line count, and autosave time.

### 4.11 Future Backend Scope

Planned API endpoints:

- `GET /api/v1/patients`
- `POST /api/v1/patients`
- `GET /api/v1/referrals`
- `POST /api/v1/referrals`
- `GET /api/v1/appointments`
- `POST /api/v1/appointments`
- `GET /api/v1/tests`
- `GET /api/v1/packages`
- `GET /api/v1/billing/patients`
- `GET /api/v1/billing/tests`
- `GET /api/v1/billing/packages`
- `POST /api/v1/billing/create`
- `GET /api/v1/billing/:id`
- `POST /api/v1/billing/payment`
- `POST /api/v1/payments`
- `POST /api/v1/refunds`
- `GET /api/v1/billing/history/:patientId`

### 4.12 Demo Script

1. Open `/billing-desk`.
2. Show topbar and workflow tabs.
3. Open Patient tab and select a patient.
4. Explain payer/insurance status.
5. Show referral mapping.
6. Add pathology/radiology/quick test.
7. Add a package.
8. Open Bill Summary.
9. Explain subtotal, discount, tax, insurance, balance.
10. Open Payment.
11. Add payment mode and confirm.

Manager closing line:

> Billing Desk module reduces billing errors by connecting patient, referral, appointment, tests, packages, insurance, and payment in one guided billing workflow.

## 5. ICU Monitoring Module Overview

### 5.1 Parent Route

`/icu-monitoring`

### 5.2 ICU Module Sections

Current ICU sections:

- CVS: ready
- Abdominal: ready
- Drains & Tubes: ready
- Lines & Devices: ready

Placeholder sections:

- Respiratory
- Neuro
- Renal

Manager explanation:

> ICU Monitoring module is designed as a bedside monitoring workspace. It organizes high-risk ICU information into specialty panels like CVS, Abdominal, Drains, and Lines/Devices.

## 6. ICU CVS Monitoring

### 6.1 Routes

| Screen | Route |
| --- | --- |
| CVS Dashboard | `/icu-monitoring/cvs` |
| Add Record | `/icu-monitoring/cvs/add` |
| Heart Rate | `/icu-monitoring/cvs/heart-rate` |
| Temperature | `/icu-monitoring/cvs/temperature` |
| BP NIBP | `/icu-monitoring/cvs/bp-nibp` |
| BP Arterial | `/icu-monitoring/cvs/bp-arterial` |
| CVP | `/icu-monitoring/cvs/cvp` |
| PCWP | `/icu-monitoring/cvs/pcwp` |
| Records | `/icu-monitoring/cvs/records` |
| Trends | `/icu-monitoring/cvs/trends` |

### 6.2 Business Purpose

CVS module ICU cardiovascular monitoring ke liye hai. It helps ICU team track heart rate, temperature, blood pressure, arterial line, CVP, and PCWP.

### 6.3 CVS Parameters

Tracked metrics:

- Heart Rate
- Temperature
- BP NIBP
- BP Arterial Line
- CVP
- PCWP

Each metric includes:

- Label
- Current value
- Unit
- Detail/MAP where applicable
- Updated time
- Status
- Icon
- Color
- Sparkline trend

### 6.4 CVS Status

Status categories:

- Stable
- Watch
- Critical

### 6.5 CVS Trend Data

Trend points include:

- Time
- HR
- Temperature
- NIBP MAP
- Arterial MAP
- CVP
- PCWP

### 6.6 CVS Records

Records include:

- Date/time
- HR
- Temperature
- NIBP
- Arterial BP
- CVP
- PCWP
- Notes

### 6.7 CVS Insights

Example insights:

- MAP stable above 65 for last 6 readings
- No sudden BP drop detected
- CVP trend suggests stable volume status

### 6.8 Demo Script

1. Open `/icu-monitoring/cvs`.
2. Show cardiovascular metric cards.
3. Open Heart Rate or BP Arterial parameter.
4. Explain parameter-specific form.
5. Open `/icu-monitoring/cvs/trends`.
6. Show trend comparison.
7. Open records page and explain hourly documentation.

Manager closing line:

> CVS module gives ICU clinicians a compact cardiovascular dashboard with live-style metric cards, trend review, parameter forms, and clinical records.

## 7. ICU Abdominal Monitoring

### 7.1 Routes

| Screen | Route |
| --- | --- |
| Abdominal Dashboard | `/icu-monitoring/abdominal` |
| Abdominal Trends | `/icu-monitoring/abdominal/trends` |
| Abdominal Records | `/icu-monitoring/abdominal/records` |

### 7.2 Business Purpose

Abdominal module ICU abdominal pressure and output monitoring ke liye hai. This is useful for high-risk ICU patients where intra-abdominal pressure, NG output, gastrostomy output, and abdominal drains need close observation.

### 7.3 Patient Context

Demo patient:

- Name: Aarav Mehta
- MRN: MRN-ICU-20491
- Bed: ICU-2 / Bed 08
- Date/time: Today 18:00

### 7.4 Abdominal Parameters

Tracked metrics:

- Intra-abdominal Pressure
- NG Output Total
- Gastrostomy Output
- Abdominal Drains Output

Each metric includes:

- Current value
- Unit
- Updated time
- Status
- Sparkline
- Trend color

### 7.5 Abdominal Trends

Trend data tracks:

- IAP
- NG output
- Gastrostomy output
- Abdominal drains output

Chart cards include:

- Latest value
- Total/mean value
- Unit
- Trend color

### 7.6 Abdominal Records

Hourly records include:

- Time
- Value
- 12-hour total
- 24-hour total

Comparison records include:

- Parameter
- Hourly values
- Total 12 hours
- Total 24 hours

### 7.7 Abdominal Insights

Example insights:

- IAP stable below critical threshold.
- NG output increased by 18% in last 6 hours.
- Drain output pattern requires monitoring.
- No sudden abdominal pressure spike detected.

### 7.8 Future Backend Scope

Referenced endpoints:

- `GET /api/v1/icu/abdominal/:patientId/summary`
- `GET /api/v1/icu/abdominal/:patientId/trends`
- `GET /api/v1/icu/abdominal/:patientId/records`
- `POST /api/v1/icu/abdominal/:patientId/notes`

### 7.9 Demo Script

1. Open `/icu-monitoring/abdominal`.
2. Show patient context.
3. Explain IAP, NG output, gastrostomy output, drain output.
4. Open trends page.
5. Explain 12-hour and 24-hour output monitoring.
6. Open records page.
7. Show hourly documentation and comparison.

Manager closing line:

> Abdominal module helps ICU team monitor abdominal pressure and output trends so early warning signs can be detected faster.

## 8. ICU Drains & Tubes

### 8.1 Routes

| Screen | Route |
| --- | --- |
| Drains Overview | `/icu-monitoring/drains` |
| Add Drain | `/icu-monitoring/drains/add` |
| Drain Detail | `/icu-monitoring/drains/[id]` |
| Drain History | `/icu-monitoring/drains/[id]/history` |
| Drain Alerts | `/icu-monitoring/drains/alerts` |

### 8.2 Business Purpose

Drains & Tubes module ICU me drain/tube output, site condition, color, consistency, and alerts track karne ke liye hai.

This helps identify:

- High output
- Blood in drain
- No output / possible blockage
- Leakage
- Stoma color change
- Dressing compromise

### 8.3 Supported Drain Types

Supported types:

- Abdominal Drain
- NG Tube
- Flexi Seal
- Ileostomy
- PEG Tube
- ICC Chest Drain
- Pericardial Drain
- VAC Dressing

Demo records also include:

- Foley Catheter

### 8.4 Drain Record Fields

Each drain record includes:

- ID
- Type
- Name
- Output amount
- Output unit
- Output color
- Metadata
- Updated time
- Status
- Sparkline trend

### 8.5 Drain Status

Statuses:

- Normal
- Monitor
- High Output
- Critical

Alert severity:

- Critical
- Monitor
- Stable

### 8.6 Drain Entries

Drain entries include:

- Time
- Volume
- Color
- Consistency
- Site condition

Example:

- Time: 18:00
- Volume: 70 ml
- Color: Blood stained
- Consistency: Thin
- Site condition: Redness

### 8.7 Drain Alerts

Alert examples:

- Blood in pericardial drain
- High output detected
- Leakage reported
- Stoma color change
- Possible blockage
- Dressing compromised ruled out

### 8.8 Alert Triggers

Configured triggers:

- Sudden increase in output
- Blood in drain
- Foul smell
- No output / possible blockage
- Stoma color change
- Leakage / dressing compromised

### 8.9 Future Backend Scope

Referenced endpoints:

- `GET /api/v1/icu/drains`
- `POST /api/v1/icu/drains`
- `GET /api/v1/icu/drains/:id`
- `POST /api/v1/icu/drains/:id/entries`
- `GET /api/v1/icu/drains/:id/history`
- `GET /api/v1/icu/drains/alerts`

### 8.10 Demo Script

1. Open `/icu-monitoring/drains`.
2. Show drain cards and statuses.
3. Explain output amount, color, site metadata, and trend.
4. Open pericardial drain detail.
5. Show hourly entries.
6. Open history page.
7. Open alerts page and explain critical/monitor/stable alerts.
8. Show add drain page for new drain registration.

Manager closing line:

> Drains & Tubes module improves ICU safety by tracking drain output, detecting abnormal patterns, and surfacing alerts like blood in drain or possible blockage.

## 9. ICU Lines & Devices

### 9.1 Routes

| Screen | Route |
| --- | --- |
| Lines & Devices Overview | `/icu-monitoring/lines-devices` |
| Add Line/Device | `/icu-monitoring/lines-devices/add` |
| Line/Device Detail | `/icu-monitoring/lines-devices/[id]` |
| Line/Device History | `/icu-monitoring/lines-devices/[id]/history` |
| Line/Device Alerts | `/icu-monitoring/lines-devices/alerts` |

### 9.2 Business Purpose

Lines & Devices module ICU me inserted lines, catheters, and devices ka safety monitoring karta hai. This helps nursing and ICU team track insertion details, patency, dressing, site condition, flow, urine output, and critical alerts.

### 9.3 Supported Line/Device Types

Supported types:

- CVC
- Arterial Line
- Dialysis Line
- Foley Catheter
- ECMO Catheter
- PICC Line
- Midline Catheter
- Peripheral IV Line
- Chest Tube

### 9.4 Line/Device Fields

Each record includes:

- ID
- Type
- Name
- Insertion details
- Site
- Metadata
- Status
- Sparkline trend

Common fields:

- Insertion Date & Time
- Site
- Side
- Dressing Type
- Dressing Date
- Securement
- Notes

### 9.5 Line/Device Status

Statuses:

- Active
- Watch
- Critical
- Discontinued

Alert severity:

- Critical
- Monitor
- Stable

### 9.6 Lumen Status

For central-line style devices, lumen status includes:

- Color
- Patency
- Blood return
- Last flushed

Example:

- Blue: Patent, blood return yes
- Brown: Flushed, blood return yes
- White: Blocked, blood return no

### 9.7 Line/Device Entries

Entries include:

- Timestamp
- MAP
- Waveform
- Zeroed status
- Site condition

Useful for:

- Arterial line monitoring
- Waveform quality
- Site redness
- Zeroing status
- ICU documentation

### 9.8 Alerts

Alert examples:

- No blood return
- Low flow dialysis line
- High arterial pressure
- Low urine output
- Dressing leak
- Site infection risk stable

### 9.9 Alert Triggers

Configured triggers:

- No blood return / not flushing
- Site redness / infection
- Bleeding / oozing
- High pressure
- Low flow
- Low urine output
- Dressing leak

### 9.10 Future Backend Scope

Referenced endpoints:

- `GET /api/v1/icu/lines-devices`
- `POST /api/v1/icu/lines-devices`
- `GET /api/v1/icu/lines-devices/:id`
- `POST /api/v1/icu/lines-devices/:id/entries`
- `GET /api/v1/icu/lines-devices/:id/history`
- `GET /api/v1/icu/lines-devices/alerts`

### 9.11 Demo Script

1. Open `/icu-monitoring/lines-devices`.
2. Show available devices: CVC, arterial line, dialysis line, Foley, ECMO, PICC, etc.
3. Explain insertion details and status.
4. Open dialysis line or CVC detail.
5. Show lumen/patency or trend details.
6. Open alerts page.
7. Explain critical alerts such as no blood return or low flow.
8. Show add line/device page.

Manager closing line:

> Lines & Devices module helps ICU team prevent catheter/device complications by monitoring site condition, patency, dressing, flow, and alert triggers.

## 10. Complete Manager Demo Flow

Use this sequence for a smooth presentation:

1. Start with Clinical Examination:
   - Open `/clinical-examination`.
   - Show patient context, specialty templates, scoring, and notes.

2. Move to Billing Desk:
   - Open `/billing-desk`.
   - Select patient, add services/package, show summary/payment.

3. Move to ICU CVS:
   - Open `/icu-monitoring/cvs`.
   - Show HR, temperature, BP, CVP, PCWP metrics and trends.

4. Move to Abdominal:
   - Open `/icu-monitoring/abdominal`.
   - Explain IAP and output monitoring.

5. Move to Drains & Tubes:
   - Open `/icu-monitoring/drains`.
   - Show drain output, alerts, and detail/history.

6. Move to Lines & Devices:
   - Open `/icu-monitoring/lines-devices`.
   - Show device status, lumen status, and alerts.

## 11. Key Talking Points For Manager

- The system is role-focused: doctor, billing executive, ICU nurse, ICU doctor, and admin can each use their own workflow.
- Clinical Examination improves structured documentation and auditability.
- Billing Desk connects patient, referral, tests, packages, summary, and payment.
- CVS Monitoring gives cardiovascular trend visibility.
- Abdominal Monitoring tracks pressure and output trends.
- Drains & Tubes prevents missed drain complications.
- Lines & Devices prevents line-related safety issues.
- Current implementation is frontend/demo state and ready for backend API integration.

## 12. Current Technical Status

Implemented frontend files:

- `src/features/clinical-examination/clinical-examination-page.tsx`
- `src/data/clinical-examination.ts`
- `src/features/billing-desk/billing-desk-page.tsx`
- `src/data/billing-desk.ts`
- `src/features/icu-monitoring/icu-monitoring-pages.tsx`
- `src/data/icu-monitoring.ts`

Implemented route files:

- `src/app/(app)/clinical-examination/page.tsx`
- `src/app/(app)/billing-desk/*`
- `src/app/(app)/icu-monitoring/cvs/*`
- `src/app/(app)/icu-monitoring/abdominal/*`
- `src/app/(app)/icu-monitoring/drains/*`
- `src/app/(app)/icu-monitoring/lines-devices/*`

Environment note:

- Production build previously stopped because system disk was full (`ENOSPC`).
- This is storage-related, not module-specific business logic failure.

