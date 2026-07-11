import { AdmissionScreenLayout } from "@/features/operations/admission/components/admission-screen-layout";
import { AdminWorkflowOverview } from "@/features/operations/admission/components/admin-workflow-overview";
import { AdmissionRequestsWorkspace } from "@/features/operations/admission/components/admission-requests-workspace";
import { BedManagerWorkspace } from "@/features/operations/admission/components/bed-manager-workspace";
import { BillingClearanceWorkspace } from "@/features/operations/admission/components/billing-clearance-workspace";
import { DoctorAdmissionOrder } from "@/features/operations/admission/components/doctor-admission-order";
import { GenerateQrWorkspace } from "@/features/operations/admission/components/generate-qr-workspace";
import { NurseCareWorkspace } from "@/features/operations/admission/components/nurse-care-workspace";
import { NurseReceiveWorkspace } from "@/features/operations/admission/components/nurse-receive-workspace";
import { PatientLookupWorkspace } from "@/features/operations/admission/components/patient-lookup-workspace";

export function AdmissionAdminOverviewPage() {
  return (
    <AdmissionScreenLayout activeScreen="admin" activeStep="1. Patient Lookup">
      <AdminWorkflowOverview />
    </AdmissionScreenLayout>
  );
}

export function AdmissionReceptionPage() {
  return (
    <AdmissionScreenLayout activeScreen="reception">
      <PatientLookupWorkspace />
    </AdmissionScreenLayout>
  );
}

export function AdmissionDoctorPage() {
  return (
    <AdmissionScreenLayout activeScreen="doctor">
      <DoctorAdmissionOrder />
    </AdmissionScreenLayout>
  );
}

export function AdmissionDeskPage() {
  return (
    <AdmissionScreenLayout activeScreen="admission-desk">
      <AdmissionRequestsWorkspace />
    </AdmissionScreenLayout>
  );
}

export function AdmissionBillingPage() {
  return (
    <AdmissionScreenLayout activeScreen="billing">
      <BillingClearanceWorkspace />
    </AdmissionScreenLayout>
  );
}

export function AdmissionBedManagerPage() {
  return (
    <AdmissionScreenLayout activeScreen="bed-manager">
      <BedManagerWorkspace />
    </AdmissionScreenLayout>
  );
}

export function AdmissionNurseReceivePage() {
  return (
    <AdmissionScreenLayout activeScreen="nurse-receive" activeStep="1. Receive Patient">
      <NurseReceiveWorkspace />
    </AdmissionScreenLayout>
  );
}

export function AdmissionNurseCarePage() {
  return (
    <AdmissionScreenLayout activeScreen="nurse-care" activeStep="2. Patient Care">
      <NurseCareWorkspace />
    </AdmissionScreenLayout>
  );
}

export function AdmissionGenerateQrPage() {
  return (
    <AdmissionScreenLayout activeScreen="generate-qr" activeStep="8. Generate QR">
      <GenerateQrWorkspace />
    </AdmissionScreenLayout>
  );
}
