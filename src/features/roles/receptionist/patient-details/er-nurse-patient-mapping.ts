"use client";

import type { PatientRecordSection } from "@/features/roles/receptionist/patient-details/receptionist-patient-records";

function sectionValue(section: PatientRecordSection, ...labels: string[]) {
  for (const label of labels) {
    const field = section.fields.find((item) => item.label === label);
    if (field?.value) return field.value;
  }
  return "";
}

function appendMappedField(fields: PatientRecordSection["fields"], label: string, value: string) {
  if (!value) return;
  fields.push({ label, value });
}

export function buildErNurseBasicSection(section: PatientRecordSection): PatientRecordSection {
  if (section.tabId !== "basic") return section;

  const firstName = sectionValue(section, "First Name");
  const middleName = sectionValue(section, "Middle Name");
  const lastName = sectionValue(section, "Last Name");
  const patientName = sectionValue(section, "Patient Name") || [firstName, middleName, lastName].filter(Boolean).join(" ");
  const patientId = sectionValue(section, "MRN / Patient ID", "Patient ID / UHID", "UHID");
  const address = sectionValue(section, "Address", "Current Address", "Permanent Address");
  const contactNumber = sectionValue(section, "Mobile Number", "Contact Number");
  const emergencyContact = [
    sectionValue(section, "Contact Name"),
    sectionValue(section, "Relationship to Patient"),
    sectionValue(section, "Contact Number"),
  ].filter(Boolean).join(" | ");
  const patientIdNumber = sectionValue(section, "Aadhaar Card Number", "PAN", "Passport Number", "Voter ID Number", "Driving License Number", "Identity Document Number");
  const idProof = [sectionValue(section, "Identification Type"), patientIdNumber].filter(Boolean).join(" - ");
  const fields: PatientRecordSection["fields"] = [];

  appendMappedField(fields, "MRN / Patient ID", patientId);
  appendMappedField(fields, "UHID", patientId);
  appendMappedField(fields, "ER Visit / Episode No.", sectionValue(section, "ER Visit / Episode No.") || (patientId ? `ER-${patientId.replace(/[^0-9A-Za-z]/g, "").slice(-6)}` : ""));
  appendMappedField(fields, "Patient Name", patientName);
  appendMappedField(fields, "Sex / Gender", sectionValue(section, "Sex / Gender", "Gender"));
  appendMappedField(fields, "Contact Number", contactNumber);
  appendMappedField(fields, "Email ID", sectionValue(section, "Email ID", "Email Address"));
  appendMappedField(fields, "Address", address);
  appendMappedField(fields, "ID Proof Type & Number", idProof);
  appendMappedField(fields, "Date & Time of Arrival", sectionValue(section, "Date & Time of Arrival", "Registration Date"));
  appendMappedField(fields, "Mode of Arrival", sectionValue(section, "Mode of Arrival") || "Walk-in");
  appendMappedField(fields, "Brought By / Informant", sectionValue(section, "Brought By / Informant", "Contact Name"));
  appendMappedField(fields, "OPD / ER Routing Decision", sectionValue(section, "OPD / ER Routing Decision") || "ER");
  appendMappedField(fields, "Payer Type", sectionValue(section, "Payer Type") || (sectionValue(section, "Insurance Provider") ? "Insurance / TPA" : ""));
  appendMappedField(fields, "Insurance / TPA Name & Policy No.", [sectionValue(section, "Insurance Provider"), sectionValue(section, "Policy Number")].filter(Boolean).join(" - "));
  appendMappedField(fields, "Emergency Contact", emergencyContact);

  const mappedLabels = new Set(fields.map((field) => field.label));
  return { ...section, fields: [...fields, ...section.fields.filter((field) => !mappedLabels.has(field.label))] };
}
