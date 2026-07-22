"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { CenterModal } from "@/components/ui/center-modal";
import { DashboardPagination } from "@/features/roles/doctor-ipd/dashboard/components/dashboard-pagination";
import { DashboardToolbar } from "@/features/roles/doctor-ipd/dashboard/components/dashboard-toolbar";
import { PatientTable } from "@/features/roles/doctor-ipd/dashboard/components/patient-table";
import { DashboardCollaborateTimeline as DashboardCollaborateModalContent } from "@/features/roles/doctor-ipd/dashboard/modals/collaborate-modal";
import { DashboardEventsPopup as DashboardEventsModalContent } from "@/features/roles/doctor-ipd/dashboard/modals/events-modal";
import { DashboardLabResultsPopup as DashboardLabResultsModalContent } from "@/features/roles/doctor-ipd/dashboard/modals/laboratory-modal";
import { MedicationInterventionPopup as MedicationInterventionModalContent } from "@/features/roles/doctor-ipd/dashboard/modals/medication-modal";
import { ProgressNoteModalContent } from "@/features/roles/doctor-ipd/dashboard/modals/progress-note-modal";
import { RadiologyResultReview } from "@/features/roles/doctor-ipd/dashboard/modals/radiology-modal";
import { DashboardVitalsPopup as DashboardVitalsModalContent } from "@/features/roles/doctor-ipd/dashboard/modals/vitals-modal";
import { orderedPatients } from "@/features/roles/doctor-ipd/dashboard/dashboard.data";
import { bpValue, csvCell, patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import type { DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";

const patientsPerPage = 10;

export function DoctorIpdDashboardPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [shiftSummaryPatient, setShiftSummaryPatient] = React.useState<DoctorIpdPatient | null>(null);
  const [collaboratePatient, setCollaboratePatient] = React.useState<DoctorIpdPatient | null>(null);
  const [eventPatient, setEventPatient] = React.useState<DoctorIpdPatient | null>(null);
  const [labResultsPatient, setLabResultsPatient] = React.useState<DoctorIpdPatient | null>(null);
  const [medicationPatient, setMedicationPatient] = React.useState<DoctorIpdPatient | null>(null);
  const [radiologyOrderPatient, setRadiologyOrderPatient] = React.useState<DoctorIpdPatient | null>(null);
  const [vitalsPatient, setVitalsPatient] = React.useState<DoctorIpdPatient | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const filteredPatients = orderedPatients.filter((patient) =>
    `${patient.name} ${patient.bed} ${patient.diagnosis}`.toLowerCase().includes(normalizedSearch),
  );
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / patientsPerPage));
  const visiblePatients = filteredPatients.slice((page - 1) * patientsPerPage, page * patientsPerPage);
  const firstVisiblePatient = filteredPatients.length ? (page - 1) * patientsPerPage + 1 : 0;
  const lastVisiblePatient = Math.min(page * patientsPerPage, filteredPatients.length);

  function exportExcel() {
    const headers = ["Patient", "Bed", "Diagnosis", "Priority", "HR (bpm)", "SpO2 (%)", "BP (mmHg)", "Temperature (C)"];
    const rows = filteredPatients.map((patient) => [
      patient.name,
      patient.bed,
      patient.diagnosis,
      patientTone(patient),
      patient.hr.value,
      patient.spo2.value,
      bpValue(patient),
      patient.temperature.value,
    ]);
    const csv = [headers, ...rows].map((rowValues) => rowValues.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "doctor-ipd-dashboard-patients.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function openRadiologyResultReview(patient: DoctorIpdPatient) {
    setRadiologyOrderPatient(patient);
  }

  function openPatientLaboratoryOrder(patient: DoctorIpdPatient) {
    setLabResultsPatient(null);
    router.push(`/doctor-ipd/patients/${patient.id}?tab=orders&orderTab=lab`);
  }

  return (
    <div className="space-y-4 py-4">
      <DashboardToolbar
        filteredCount={filteredPatients.length}
        onExportExcel={exportExcel}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        search={search}
      />

      <Card className="overflow-hidden rounded-md border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <PatientTable
            patients={visiblePatients}
            onOpenCollaborate={setCollaboratePatient}
            onOpenEvents={setEventPatient}
            onOpenLabResults={setLabResultsPatient}
            onOpenMedication={setMedicationPatient}
            onOpenProgressNote={setShiftSummaryPatient}
            onOpenRadiology={openRadiologyResultReview}
            onOpenVitals={setVitalsPatient}
          />
        </CardContent>
      </Card>

      <DashboardPagination
        filteredCount={filteredPatients.length}
        firstVisiblePatient={firstVisiblePatient}
        lastVisiblePatient={lastVisiblePatient}
        onPageChange={setPage}
        page={page}
        totalPages={totalPages}
      />
      <CenterModal
        bodyClassName="overflow-hidden p-0"
        className="h-[min(92dvh,860px)] w-[min(96vw,1180px)]"
        description={vitalsPatient ? `${vitalsPatient.name} | ${vitalsPatient.bed} | ${vitalsPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setVitalsPatient(null)}
        open={Boolean(vitalsPatient)}
        title="Patient Vitals"
      >
        {vitalsPatient ? <DashboardVitalsModalContent patient={vitalsPatient} /> : null}
      </CenterModal>

      <CenterModal
        bodyClassName="overflow-hidden p-0"
        className="h-[min(92dvh,760px)] w-[min(96vw,1180px)]"
        description={labResultsPatient ? `${labResultsPatient.name} | ${labResultsPatient.bed} | ${labResultsPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setLabResultsPatient(null)}
        open={Boolean(labResultsPatient)}
        title="Diagnosis Result"
      >
        {labResultsPatient ? <DashboardLabResultsModalContent onOpenLaboratoryOrder={() => openPatientLaboratoryOrder(labResultsPatient)} patient={labResultsPatient} /> : null}
      </CenterModal>
      <CenterModal
        className="w-[min(94vw,920px)]"
        description={
          medicationPatient
            ? `${medicationPatient.name} | ${medicationPatient.bed} | ${medicationPatient.diagnosis}`
            : undefined
        }
        onOpenChange={(open) => !open && setMedicationPatient(null)}
        open={Boolean(medicationPatient)}
        title="Medication & Intervention"
      >
        {medicationPatient ? <MedicationInterventionModalContent patient={medicationPatient} /> : null}
      </CenterModal>
      <CenterModal
        bodyClassName="p-0"
        className="h-[min(88dvh,860px)] w-[min(94vw,1220px)]"
        description={shiftSummaryPatient ? `${shiftSummaryPatient.name} | ${shiftSummaryPatient.bed} | ${shiftSummaryPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setShiftSummaryPatient(null)}
        open={Boolean(shiftSummaryPatient)}
        title="Add Progress"
      >
        {shiftSummaryPatient ? <ProgressNoteModalContent patient={shiftSummaryPatient} /> : null}
      </CenterModal>

      <CenterModal
        bodyClassName="overflow-hidden p-0"
        className="h-[min(92dvh,760px)] w-[min(96vw,1180px)]"
        description={radiologyOrderPatient ? `${radiologyOrderPatient.name} | ${radiologyOrderPatient.bed} | ${radiologyOrderPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setRadiologyOrderPatient(null)}
        open={Boolean(radiologyOrderPatient)}
        title="Diagnosis Result"
      >
        {radiologyOrderPatient ? <RadiologyResultReview patient={radiologyOrderPatient} /> : null}
      </CenterModal>

      <CenterModal
        className="w-[min(94vw,1040px)]"
        description={collaboratePatient ? `${collaboratePatient.name} | ${collaboratePatient.bed} | ${collaboratePatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setCollaboratePatient(null)}
        open={Boolean(collaboratePatient)}
        title="Collaborate"
      >
        {collaboratePatient ? <DashboardCollaborateModalContent patient={collaboratePatient} /> : null}
      </CenterModal>

      <CenterModal
        bodyClassName="overflow-hidden p-0"
        className="h-[min(92dvh,640px)] w-[min(94vw,640px)]"
        description={eventPatient ? `Events | ${eventPatient.bed} | ${eventPatient.diagnosis}` : undefined}
        onOpenChange={(open) => !open && setEventPatient(null)}
        open={Boolean(eventPatient)}
        title={eventPatient ? eventPatient.name : "Events"}
      >
        {eventPatient ? <DashboardEventsModalContent patient={eventPatient} /> : null}
      </CenterModal>
    </div>
  );
}
