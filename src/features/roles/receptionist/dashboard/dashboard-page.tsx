"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ambulance,
  BedDouble,
  Calculator,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  FileCheck2,
  FileText,
  IdCard,
  NotebookText,
  Phone,
  Printer,
  QrCode,
  Search,
  ShieldAlert,
  Stethoscope,
  UploadCloud,
  UserCheck,
  X,
} from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Tone = NonNullable<BadgeProps["tone"]>;
type Priority = "Critical" | "Emergency" | "Urgent" | "Stable";
type ArrivalType = "Referral from Another Hospital" | "Ambulance" | "Walk-in Emergency" | "Internal Transfer" | "Scheduled ICU Admission";
type StepId = "upload" | "ocr" | "verify" | "register" | "duplicate" | "bed" | "doctor" | "nurse" | "wristband" | "print" | "transfer" | "complete";
type DocumentCategory = "Referral Letter" | "Lab Reports" | "Radiology" | "Prescription" | "Consent" | "Insurance" | "Identity" | "Others";
type ClinicalWorkspaceTab = "orders" | "notes" | "calculator";
type UploadStatus = "idle" | "validating" | "uploading" | "uploaded" | "failed" | "cancelled";
type OCRStatus = "idle" | "ocrQueued" | "ocrRunning" | "extracting" | "verificationReady" | "verified" | "failed";
type SaveStatus = "Saved" | "Saving..." | "Save failed — Retry";
type MobileSessionState = "Waiting for mobile" | "Connected" | "Uploading" | "Completed" | "Expired";

type UploadedDocument = {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  status: UploadStatus;
  ocrStatus: OCRStatus;
  uploadProgress: number;
  ocrProgress: number;
  uploadedBy: string;
  uploadedAt: string;
  retries: number;
  verified: boolean;
  error?: string;
  file?: File;
  objectUrl?: string;
  extractedFields?: Array<{ label: string; value: string; confidence: number }>;
};

type PatientAdmissionDraft = {
  documents: UploadedDocument[];
  selectedCategory: DocumentCategory | "All";
  timeline: string[];
  auditLog: string[];
  saveStatus: SaveStatus;
};

type ToastMessage = {
  id: string;
  tone: Tone;
  title: string;
  detail?: string;
};

type PatientFieldSource = "Referral" | "OCR" | "Existing UHID" | "Manual entry" | "Previous admission" | "Insurance record" | "Doctor verified";

type WorkflowStep = {
  id: StepId;
  label: string;
  actionLabel: string;
  icon: LucideIcon;
};

type Patient = {
  id: string;
  uhid: string;
  name: string;
  age: string;
  gender: string;
  bloodGroup: string;
  priority: Priority;
  arrivalType: ArrivalType;
  hospital: string;
  arrival: string;
  diagnosis: string;
  icu: string;
  bed: string;
  doctor: string;
  nurse: string;
  currentStep: StepId;
  mobile: string;
  referralNo: string;
  timer: string;
  emergencyStatus: string;
  temporaryUhid?: string;
  referralId?: string;
  referralHospital?: string;
  referringDoctor?: string;
  requiredIcu?: string;
  expectedArrival?: string;
  status?: "waiting" | "in-progress" | "completed";
  admissionRecord?: ICUAdmissionPatient;
  duplicateFound?: boolean;
  completed?: boolean;
};

type ICUAdmissionPatient = {
  id: string;
  temporaryUhid: string;
  referralId: string;
  name: string;
  age: number;
  gender: string;
  mobile: string;
  referralHospital: string;
  referringDoctor?: string;
  diagnosis: string;
  requiredIcu: string;
  priority: "critical" | "emergency" | "urgent" | "stable";
  arrivalType: string;
  expectedArrival?: string;
  currentStep: StepId;
  status: "waiting" | "in-progress" | "completed";
};

type NewPatientIntakeForm = {
  arrivalType: ArrivalType;
  name: string;
  age: string;
  gender: string;
  mobile: string;
  referralNumber: string;
  referralHospital: string;
  referringDoctor: string;
  diagnosis: string;
  requiredIcu: string;
  priority: Priority;
  expectedArrival: string;
};

const workflowSteps: WorkflowStep[] = [
  { id: "upload", label: "Upload Reports", actionLabel: "Upload Reports", icon: UploadCloud },
  { id: "ocr", label: "OCR Extract", actionLabel: "Run OCR Extraction", icon: FileText },
  { id: "verify", label: "Verify OCR", actionLabel: "Confirm Extracted Data", icon: FileCheck2 },
  { id: "register", label: "Register", actionLabel: "Register Patient", icon: IdCard },
  { id: "duplicate", label: "Duplicate Check", actionLabel: "Continue Existing Admission", icon: ShieldAlert },
  { id: "bed", label: "Assign Bed", actionLabel: "Assign ICU Bed", icon: BedDouble },
  { id: "doctor", label: "Assign Doctor", actionLabel: "Assign Doctor", icon: Stethoscope },
  { id: "nurse", label: "Assign Nurse", actionLabel: "Assign Nurse", icon: UserCheck },
  { id: "wristband", label: "Wristband", actionLabel: "Generate Wristband", icon: ClipboardCheck },
  { id: "print", label: "Print Slip", actionLabel: "Print Admission Slip", icon: Printer },
  { id: "transfer", label: "Transfer", actionLabel: "Start ICU Transfer", icon: Ambulance },
  { id: "complete", label: "Complete", actionLabel: "Complete Admission", icon: CheckCircle2 },
];

const priorityTone: Record<Priority, Tone> = {
  Critical: "critical",
  Emergency: "danger",
  Urgent: "warning",
  Stable: "success",
};

const initialPatients: Patient[] = [
  {
    id: "REF-24071",
    uhid: "UHID-82944",
    name: "Aisha Khan",
    age: "42",
    gender: "Female",
    bloodGroup: "B+",
    priority: "Critical",
    arrivalType: "Referral from Another Hospital",
    hospital: "Alfa Trauma Centre",
    arrival: "12:05 PM",
    diagnosis: "Septic shock with ARDS",
    icu: "Medical ICU",
    bed: "Not assigned",
    doctor: "Not assigned",
    nurse: "Not assigned",
    currentStep: "upload",
    mobile: "98XXXX2140",
    referralNo: "ALF/ER/7742",
    timer: "14m",
    emergencyStatus: "ICU notified",
    duplicateFound: true,
  },
  {
    id: "REF-24072",
    uhid: "TEMP-24072",
    name: "Rohan Das",
    age: "63",
    gender: "Male",
    bloodGroup: "O+",
    priority: "Emergency",
    arrivalType: "Ambulance",
    hospital: "City Heart Hospital",
    arrival: "12:30 PM",
    diagnosis: "Post MI cardiogenic shock",
    icu: "Cardiac ICU",
    bed: "CICU-02",
    doctor: "Dr. Nisha Kapoor",
    nurse: "Not assigned",
    currentStep: "verify",
    mobile: "99XXXX7781",
    referralNo: "CITY/CARD/2099",
    timer: "6m",
    emergencyStatus: "Doctor pending",
  },
  {
    id: "REF-24073",
    uhid: "UHID-71300",
    name: "Irfan Qureshi",
    age: "31",
    gender: "Male",
    bloodGroup: "A-",
    priority: "Urgent",
    arrivalType: "Walk-in Emergency",
    hospital: "MedLife Emergency",
    arrival: "01:10 PM",
    diagnosis: "Head injury, low GCS",
    icu: "Neuro ICU",
    bed: "Not assigned",
    doctor: "Dr. Sana Sheikh",
    nurse: "Neuro nurse available",
    currentStep: "bed",
    mobile: "97XXXX4412",
    referralNo: "MEDLIFE/NEU/882",
    timer: "3m",
    emergencyStatus: "Bed required",
  },
  {
    id: "REF-24070",
    uhid: "UHID-65018",
    name: "Kabir Ali",
    age: "54",
    gender: "Male",
    bloodGroup: "AB+",
    priority: "Stable",
    arrivalType: "Scheduled ICU Admission",
    hospital: "Metro General",
    arrival: "11:30 AM",
    diagnosis: "COPD exacerbation",
    icu: "Medical ICU",
    bed: "MICU-01",
    doctor: "Dr. Arvind Rao",
    nurse: "Priya Nair",
    currentStep: "complete",
    mobile: "95XXXX8871",
    referralNo: "MET/ICU/110",
    timer: "52m",
    emergencyStatus: "Stable transfer",
    completed: true,
  },
];

const beds = [
  { id: "MICU-03", unit: "MICU", status: "Available", meta: "Ventilator, oxygen, monitor", nurse: "Priya", distance: "12 m", isolation: "No" },
  { id: "MICU-04", unit: "MICU", status: "Cleaning", meta: "Ready in 20 min", nurse: "Priya", distance: "15 m", isolation: "Yes" },
  { id: "SICU-01", unit: "SICU", status: "Reserved", meta: "Surgery hold", nurse: "Ritu", distance: "24 m", isolation: "No" },
  { id: "CCU-02", unit: "CCU", status: "Available", meta: "Cardiac monitor ready", nurse: "Sneha", distance: "9 m", isolation: "No" },
  { id: "NICU-04", unit: "NICU", status: "Occupied", meta: "Patient admitted", nurse: "Ritu", distance: "19 m", isolation: "No" },
  { id: "PICU-06", unit: "PICU", status: "Available", meta: "Pediatric oxygen ready", nurse: "Anjali", distance: "17 m", isolation: "No" },
  { id: "ISO-02", unit: "Isolation ICU", status: "Available", meta: "Negative pressure", nurse: "Priya", distance: "28 m", isolation: "Yes" },
];

const doctors = [
  { name: "Dr. Arvind Rao", unit: "Medical ICU", status: "Available", workload: "5 ICU patients", response: "3 min" },
  { name: "Dr. Nisha Kapoor", unit: "Cardiac ICU", status: "Available", workload: "4 ICU patients", response: "5 min" },
  { name: "Dr. Sana Sheikh", unit: "Neuro ICU", status: "Busy", workload: "8 ICU patients", response: "14 min" },
  { name: "Dr. Pooja Iyer", unit: "Pediatric ICU", status: "Available", workload: "3 ICU patients", response: "4 min" },
];

const nurses = [
  { name: "Priya Nair", unit: "Medical ICU", status: "Available", workload: "2 patients", response: "At station" },
  { name: "Sneha Patel", unit: "Cardiac ICU", status: "Available", workload: "2 patients", response: "2 min" },
  { name: "Ritu Sharma", unit: "Neuro ICU", status: "Busy", workload: "4 patients", response: "12 min" },
  { name: "Anjali Rao", unit: "Pediatric ICU", status: "Available", workload: "1 patient", response: "4 min" },
];

const arrivalTypes: ArrivalType[] = [
  "Referral from Another Hospital",
  "Ambulance",
  "Walk-in Emergency",
  "Internal Transfer",
  "Scheduled ICU Admission",
];

const documentCategories: DocumentCategory[] = ["Referral Letter", "Lab Reports", "Radiology", "Prescription", "Consent", "Insurance", "Identity", "Others"];
const clinicalWorkspaceTabs: ClinicalWorkspaceTab[] = ["orders", "notes", "calculator"];
const acceptedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxFileSizeBytes = 20 * 1024 * 1024;
const receptionistUser = "ICU Receptionist";

export function ReceptionistDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatients[0].id);
  const [search, setSearch] = useState("");
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [arrivalModalOpen, setArrivalModalOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [showOlderPatients, setShowOlderPatients] = useState(false);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<{ title: string; message: string; confirmLabel: string; onConfirm: () => void } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [clinicalTab, setClinicalTab] = useState<ClinicalWorkspaceTab>("orders");
  const [lastActivity, setLastActivity] = useState("Queue auto-refreshed");

  const activePatients = patients.filter((patient) => !patient.completed);
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? activePatients[0] ?? patients[0];
  const activeStep = selectedPatient.currentStep;
  const activeStepIndex = getStepIndex(activeStep);
  const currentStep = getStep(activeStep);
  const nextPatient = activePatients.find((patient) => patient.id !== selectedPatient.id) ?? null;
  const completedToday = patients.filter((patient) => patient.completed).length;
  const requestedClinicalTab = searchParams.get("tab") as ClinicalWorkspaceTab | null;
  const hasClinicalSubTab = Boolean(requestedClinicalTab && clinicalWorkspaceTabs.includes(requestedClinicalTab));
  const activeClinicalTab = hasClinicalSubTab ? requestedClinicalTab as ClinicalWorkspaceTab : clinicalTab;

  const visibleQueue = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query) {
      return patients.filter((patient) =>
        [patient.name, patient.mobile, patient.referralNo, patient.hospital].some((value) => value.toLowerCase().includes(query)),
      );
    }
    if (showOlderPatients) return activePatients;
    return [selectedPatient, nextPatient].filter(Boolean) as Patient[];
  }, [activePatients, nextPatient, patients, search, selectedPatient, showOlderPatients]);

  function notify(title: string, detail?: string, tone: Tone = "info") {
    const id = createId("toast");
    setToasts((current) => [...current.slice(-3), { id, title, detail, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4200);
  }

  function recordActivity(message: string, tone: Tone = "success") {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLastActivity(`${message} at ${timestamp}`);
    notify(message, `${selectedPatient.name} • ${timestamp}`, tone);
  }

  function updateSelectedPatient(update: Partial<Patient>) {
    setPatients((current) => current.map((patient) => (patient.id === selectedPatient.id ? { ...patient, ...update } : patient)));
  }

  function moveToStep(stepId: StepId) {
    const targetIndex = getStepIndex(stepId);
    if (targetIndex > activeStepIndex) {
      notify("Step blocked", `Complete ${currentStep.label} before opening ${getStep(stepId).label}.`, "warning");
      return;
    }
    updateSelectedPatient({ currentStep: stepId });
    recordActivity(`${getStep(stepId).label} opened`, "info");
  }

  function completeCurrentStep(update?: Partial<Patient>) {
    const nextStep = workflowSteps[activeStepIndex + 1]?.id ?? "complete";
    const completed = activeStep === "complete";
    setPatients((current) =>
      current.map((patient) =>
        patient.id === selectedPatient.id
          ? { ...patient, ...update, currentStep: nextStep, completed }
          : patient,
      ),
    );
    recordActivity(`${currentStep.actionLabel} completed`);

    if (completed) {
      const nextOpenPatient = activePatients.find((patient) => patient.id !== selectedPatient.id);
      if (nextOpenPatient) setSelectedPatientId(nextOpenPatient.id);
    }
  }

  function createPatient(form: NewPatientIntakeForm) {
    const temporaryUhid = `TEMP-${Date.now().toString().slice(-6)}`;
    const referralId = form.referralNumber.trim() || `REF-${Math.floor(10000 + Math.random() * 90000)}`;
    const admissionRecord: ICUAdmissionPatient = {
      id: createId("icu-patient"),
      temporaryUhid,
      referralId,
      name: form.name.trim(),
      age: Number(form.age),
      gender: form.gender,
      mobile: form.mobile.trim(),
      referralHospital: form.referralHospital.trim(),
      referringDoctor: form.referringDoctor.trim() || undefined,
      diagnosis: form.diagnosis.trim(),
      requiredIcu: form.requiredIcu,
      priority: form.priority.toLowerCase() as ICUAdmissionPatient["priority"],
      arrivalType: form.arrivalType,
      expectedArrival: form.expectedArrival || undefined,
      currentStep: "upload",
      status: "waiting",
    };
    const newPatient: Patient = {
      id: referralId,
      uhid: temporaryUhid,
      name: form.name.trim(),
      age: form.age,
      gender: form.gender,
      bloodGroup: "",
      priority: form.priority,
      arrivalType: form.arrivalType,
      hospital: form.referralHospital.trim(),
      arrival: form.expectedArrival || "Now",
      diagnosis: form.diagnosis.trim(),
      icu: form.requiredIcu,
      bed: "Not assigned",
      doctor: "Not assigned",
      nurse: "Not assigned",
      currentStep: "upload",
      mobile: form.mobile.trim(),
      referralNo: referralId,
      timer: "0m",
      emergencyStatus: "Workflow started",
      temporaryUhid,
      referralId,
      referralHospital: form.referralHospital.trim(),
      referringDoctor: form.referringDoctor.trim() || undefined,
      requiredIcu: form.requiredIcu,
      expectedArrival: form.expectedArrival || undefined,
      status: "waiting",
      admissionRecord,
    };
    setPatients((current) => [newPatient, ...current]);
    setSelectedPatientId(newPatient.id);
    setArrivalModalOpen(false);
    setLastActivity("New ICU patient created successfully.");
    notify("New ICU patient created successfully.", `${newPatient.name} is ready for Upload Reports.`, "success");
  }

  function previousStep() {
    const previous = workflowSteps[Math.max(0, activeStepIndex - 1)]?.id ?? "upload";
    if (previous === activeStep) {
      notify("Already at first step", "Upload Reports is the first available step.", "warning");
      return;
    }
    moveToStep(previous);
  }

  function nextStep() {
    completeCurrentStep();
  }

  function saveDraft() {
    recordActivity("Draft saved", "success");
  }

  function selectClinicalTab(tab: ClinicalWorkspaceTab) {
    setClinicalTab(tab);
    router.replace(`/receptionist?tab=${tab}`, { scroll: false });
  }

  function openNextPatient() {
    if (!nextPatient) {
      notify("No waiting patient", "There is no next patient in the queue.", "warning");
      return;
    }
    if (activeStep === "upload") {
      setConfirmation({
        title: "Switch patient?",
        message: "Upload work for the current patient is auto-saved. Switch to the next waiting patient?",
        confirmLabel: "Open Next Patient",
        onConfirm: () => {
          setSelectedPatientId(nextPatient.id);
          setConfirmation(null);
          recordActivity("Next patient opened", "info");
        },
      });
      return;
    }
    setSelectedPatientId(nextPatient.id);
    recordActivity("Next patient opened", "info");
  }

  function runEmergencyAction(action: string) {
    if (action.includes("Reserve Bed") || action === "Reserve Bed") {
      const availableBed = beds.find((bed) => bed.status === "Available");
      if (availableBed) {
        updateSelectedPatient({ bed: `${availableBed.id} reserved`, emergencyStatus: "Emergency bed reserved" });
        recordActivity(`Emergency bed ${availableBed.id} reserved`, "warning");
      }
      return;
    }
    if (action.includes("Print") || action.includes("Summary")) {
      printAdmissionDocument("Emergency Summary", selectedPatient, []);
      recordActivity("Emergency summary printed", "info");
      return;
    }
    setConfirmation({
      title: action,
      message: `Send ${action.toLowerCase()} notification for ${selectedPatient.name}?`,
      confirmLabel: "Send Notification",
      onConfirm: async () => {
        await sendReceptionNotification({ action, patient: selectedPatient });
        setConfirmation(null);
        recordActivity(`${action} sent`, "success");
      },
    });
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        nextStep();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        window.print();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDraft();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setShowMoreDetails(false);
        setEmergencyOpen(false);
        setArrivalModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="space-y-4 pb-28 pt-2">
      <PatientBanner patient={selectedPatient} onNewPatient={() => setArrivalModalOpen(true)} />

      <section className="rounded-xl border border-border bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Badge tone="info">Guided ICU Admission Assistant</Badge>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">What is the next action?</h1>
            <p className="mt-1 text-sm text-muted-foreground">Upload first. OCR fills details. The next patient opens automatically after completion.</p>
          </div>
          <div className="relative min-w-[280px] xl:w-[430px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-12 rounded-xl pl-12 text-base"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, UHID, mobile, referral no."
              value={search}
            />
          </div>
        </div>
      </section>

      <WorkflowProgress activeStep={activeStep} onStepSelect={moveToStep} />

      {hasClinicalSubTab ? <ClinicalHandoffWorkspace activeTab={activeClinicalTab} patient={selectedPatient} onTabChange={selectClinicalTab} /> : null}

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
        <WaitingPatientsPanel
          completedToday={completedToday}
          olderCount={Math.max(0, activePatients.length - 2)}
          patients={visibleQueue}
          showOlderPatients={showOlderPatients}
          selectedPatientId={selectedPatient.id}
          waitingCount={activePatients.length}
          onSelect={setSelectedPatientId}
          onToggleOlder={() => setShowOlderPatients((value) => !value)}
        />

        <CurrentTaskPanel
          patient={selectedPatient}
          step={activeStep}
          showMoreDetails={showMoreDetails}
          onComplete={completeCurrentStep}
          onNotify={notify}
          onRecordActivity={recordActivity}
          onShowMoreDetails={() => setShowMoreDetails((value) => !value)}
        />

        <GuidancePanel
          activeStepIndex={activeStepIndex}
          lastActivity={lastActivity}
          patient={selectedPatient}
          onEmergencyAction={runEmergencyAction}
        />
      </section>

      <EmergencyButton open={emergencyOpen} onAction={runEmergencyAction} onToggle={() => setEmergencyOpen((value) => !value)} />

      <BottomBar
        nextLabel={currentStep.actionLabel}
        onEmergency={() => setEmergencyOpen(true)}
        onNext={nextStep}
        onPrevious={previousStep}
        onPrint={() => setPrintMenuOpen(true)}
        onSaveDraft={saveDraft}
        onNextPatient={openNextPatient}
      />

      {arrivalModalOpen ? <ArrivalTypeModal onClose={() => setArrivalModalOpen(false)} onSelect={createPatient} /> : null}
      {printMenuOpen ? <PrintMenu patient={selectedPatient} onClose={() => setPrintMenuOpen(false)} onPrint={(label) => {
        printAdmissionDocument(label, selectedPatient, []);
        setPrintMenuOpen(false);
        recordActivity(`${label} printed`, "info");
      }} /> : null}
      {confirmation ? <ConfirmationModal {...confirmation} onCancel={() => setConfirmation(null)} /> : null}
      <ToastStack messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))} />
    </div>
  );
}

function PatientBanner({ patient, onNewPatient }: { patient: Patient; onNewPatient: () => void }) {
  const details = [
    { label: "UHID", value: patient.temporaryUhid ?? patient.uhid },
    { label: "Age/Gender", value: `${patient.age}Y ${patient.gender}` },
    { label: "Mobile", value: patient.mobile },
    { label: "ICU", value: patient.icu },
    { label: "Bed", value: patient.bed },
    { label: "Doctor", value: patient.doctor },
    { label: "Hospital", value: patient.hospital },
    { label: "Arrival", value: patient.arrivalType },
    { label: "Step", value: getStep(patient.currentStep).label },
  ];

  return (
    <section
      className="relative z-10 rounded-xl border border-[#7367f0]/40 text-white shadow-[0_8px_20px_rgba(115,103,240,0.24)]"
      style={{ background: "linear-gradient(90deg,#7367f0,#5b8def)" }}
    >
      <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 xl:px-4">
        <div className="horizontal-scrollbar min-w-0 overflow-x-auto overflow-y-hidden pb-1">
          <div className="flex min-w-full w-max flex-nowrap items-center justify-between gap-x-3 xl:gap-x-4 2xl:gap-x-5">
            <div className="flex shrink-0 items-center gap-2">
              <span className="max-w-[160px] truncate text-sm font-bold xl:max-w-[190px]">{patient.name}</span>
              <Badge className="border-white/30 bg-white/15 px-2.5 font-bold text-white shadow-sm" tone={priorityTone[patient.priority]}>
                {patient.priority}
              </Badge>
            </div>
            {details.map((item) => (
              <div className="shrink-0 whitespace-nowrap text-[13px] font-semibold leading-5 xl:text-sm" key={`${item.label}-${item.value}`}>
                <span className="text-white/80">{item.label}: </span>
                <span>{item.value}</span>
              </div>
            ))}
            <div className="shrink-0 whitespace-nowrap text-[13px] font-extrabold leading-5 text-orange-300 xl:text-sm">
              {patient.emergencyStatus}
            </div>
            <div className="shrink-0 whitespace-nowrap text-[13px] font-bold leading-5 text-yellow-200 xl:text-sm">
              Timer: {patient.timer}
            </div>
          </div>
        </div>
        <Button
          className="h-8 w-8 max-w-full shrink-0 border-white/25 bg-[#1d4ed8] px-0 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af] sm:w-auto sm:px-3 xl:px-4"
          type="button"
          onClick={onNewPatient}
          variant="outline"
        >
          <IdCard className="h-4 w-4" />
          <span className="hidden truncate sm:inline">New Patient</span>
        </Button>
      </div>
    </section>
  );
}

function WorkflowProgress({ activeStep, onStepSelect }: { activeStep: StepId; onStepSelect: (step: StepId) => void }) {
  return <ICUAdmissionStepScroller activeStep={activeStep} onStepSelect={onStepSelect} />;
}

function ClinicalHandoffWorkspace({
  activeTab,
  patient,
  onTabChange,
}: {
  activeTab: ClinicalWorkspaceTab;
  patient: Patient;
  onTabChange: (tab: ClinicalWorkspaceTab) => void;
}) {
  const tabs: Array<{ id: ClinicalWorkspaceTab; label: string; icon: LucideIcon; count?: string }> = [
    { id: "orders", label: "Doctor Orders", icon: ClipboardList, count: patient.doctor === "Not assigned" ? "0" : "3" },
    { id: "notes", label: "ED Notes", icon: NotebookText, count: patient.doctor === "Not assigned" ? "0" : "2" },
    { id: "calculator", label: "Medical Calculator", icon: Calculator },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border bg-white">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">Clinical Handoff</CardTitle>
              <RoleAccessBadge />
            </div>
            <CardDescription>Clinical handoff notes and receptionist-safe clinical references.</CardDescription>
          </div>
          <div className="flex gap-2 overflow-x-auto rounded-xl border border-border bg-surface-muted p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition",
                    selected ? "bg-white text-info shadow-soft" : "text-muted-foreground hover:bg-white/70 hover:text-foreground",
                  )}
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count ? <Badge tone={tab.count === "0" ? "muted" : "info"}>{tab.count}</Badge> : null}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ClinicalHandoffSummary patient={patient} />
        <div className="mt-4">
          {activeTab === "orders" ? <ReadOnlyDoctorOrders patient={patient} /> : null}
          {activeTab === "notes" ? <ReadOnlyDoctorNotes patient={patient} /> : null}
          {activeTab === "calculator" ? <RestrictedMedicalCalculator patient={patient} /> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function ClinicalHandoffSummary({ patient }: { patient: Patient }) {
  const reports = patient.currentStep === "upload" ? "Pending" : "In progress";

  return (
    <div className="rounded-xl border border-info/20 bg-info/5 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">{patient.name}</h3>
            <Badge tone={priorityTone[patient.priority]}>{patient.priority}</Badge>
            <FieldSourceBadge source="Referral" />
          </div>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {patient.hospital || "Not provided"} - {patient.diagnosis || "Not provided"} - {patient.icu || "Not provided"}
          </p>
        </div>
        <div className="grid gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-4 xl:min-w-[680px]">
          <SummaryChip label="Reports" value={reports} tone={reports === "Pending" ? "warning" : "info"} />
          <SummaryChip label="Bed" value={patient.bed || "Not assigned"} />
          <SummaryChip label="Doctor" value={patient.doctor || "Not assigned"} />
          <SummaryChip label="Nurse" value={patient.nurse || "Not assigned"} />
        </div>
      </div>
    </div>
  );
}

function ReadOnlyDoctorOrders({ patient }: { patient: Patient }) {
  const orders = patient.doctor === "Not assigned" ? [] : buildDoctorOrders(patient);

  if (!orders.length) {
    return (
      <PatientDataEmptyState
        actions={<><Button variant="outline" type="button">Notify Doctor</Button><Button variant="outline" type="button">Print Orders</Button></>}
        detail="The assigned doctor can add orders after accepting the patient."
        title="No doctor orders available yet."
      />
    );
  }

  return (
    <div className="space-y-3">
      <RoleAccessBadge label="Read-only Doctor Orders" />
      {orders.map((order) => (
        <div className="rounded-xl border border-border bg-white p-4" key={order.id}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{order.name}</h3>
                <Badge tone="info">{order.category}</Badge>
                <Badge tone={order.priority === "Critical" ? "critical" : order.priority === "Urgent" ? "warning" : "success"}>{order.priority}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{order.instructions}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{order.orderedBy} • {order.orderedAt} • {order.acknowledgement}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" type="button">Notify Doctor</Button>
              <Button size="sm" variant="outline" type="button">Print Orders</Button>
              <Button size="sm" variant="outline" type="button">Acknowledge Received</Button>
              <Button size="sm" variant="outline" type="button">View Details</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReadOnlyDoctorNotes({ patient }: { patient: Patient }) {
  const notes = patient.doctor === "Not assigned" ? [] : buildDoctorNotes(patient);

  if (!notes.length) {
    return (
      <PatientDataEmptyState
        actions={<><Button variant="outline" type="button">Notify Doctor</Button><Button variant="outline" type="button">Print Handoff Summary</Button><Button variant="outline" type="button">View Referral Note</Button></>}
        detail="ED notes have not been added."
        title="No ED notes have been added."
      />
    );
  }

  return (
    <div className="space-y-3">
      <RoleAccessBadge label="Read-only ED Notes" />
      {notes.map((note) => (
        <div className="rounded-xl border border-border bg-white p-4" key={note.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="info">{note.type}</Badge>
                <Badge tone="success">{note.status}</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">{note.doctor} • {note.department}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">{note.createdAt}</p>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{note.preview}</p>
            </div>
            <Button size="sm" variant="outline" type="button">View complete note</Button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" type="button">Notify Doctor</Button>
        <Button variant="outline" type="button">Print Handoff Summary</Button>
        <Button variant="outline" type="button">View Referral Note</Button>
      </div>
    </div>
  );
}

function RestrictedMedicalCalculator({ patient }: { patient: Patient }) {
  const previousResults: Array<{ name: string; result: string; calculatedBy: string; calculatedAt: string; status: string }> = [];

  return (
    <div className="space-y-4">
      <PatientDataEmptyState
        detail="Medical calculators are available to authorized clinical staff only. Receptionist cannot enter GCS, SOFA, APACHE, NEWS2, creatinine clearance, BMI medication, or ventilator calculations."
        title="Restricted to clinical staff"
      />
      {previousResults.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {previousResults.map((result) => (
            <div className="rounded-xl border border-border bg-white p-4" key={result.name}>
              <p className="text-xs font-bold uppercase text-muted-foreground">{result.name}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{result.result}</p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">{result.calculatedBy} • {result.calculatedAt} • {result.status}</p>
            </div>
          ))}
        </div>
      ) : (
        <PatientDataEmptyState detail={`No previous clinical calculator results are available for ${patient.name}.`} title="No calculated results" />
      )}
    </div>
  );
}

function RoleAccessBadge({ label = "Receptionist View" }: { label?: string }) {
  return <Badge tone="info">{label}</Badge>;
}

function FieldSourceBadge({ confidence, source }: { confidence?: number; source: PatientFieldSource }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      Source: {source}
      {confidence ? <span>• {confidence}%</span> : null}
    </span>
  );
}

function SummaryChip({ label, tone = "info", value }: { label: string; tone?: Tone; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2">
      <p className="text-[10px] uppercase">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="truncate text-foreground">{value}</span>
        <Badge tone={tone}>{tone === "warning" ? "Pending" : "Ready"}</Badge>
      </div>
    </div>
  );
}

function PatientDataEmptyState({ actions, detail, title }: { actions?: React.ReactNode; detail: string; title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-5 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm font-medium leading-6 text-muted-foreground">{detail}</p>
      {actions ? <div className="mt-4 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}

function buildDoctorOrders(patient: Patient) {
  return [
    {
      id: `${patient.id}-order-oxygen`,
      name: "ICU admission preparation",
      category: "Admission",
      priority: patient.priority,
      instructions: `Prepare ${patient.icu || "ICU"} receiving bay, verify monitors, and keep resuscitation support ready before arrival.`,
      orderedBy: patient.doctor,
      orderedAt: "Today, 12:42 PM",
      acknowledgement: "Pending receptionist acknowledgement",
    },
    {
      id: `${patient.id}-order-labs`,
      name: "Initial labs and imaging",
      category: "Diagnostics",
      priority: patient.priority === "Stable" ? "Urgent" : "Critical",
      instructions: "Coordinate CBC, electrolytes, ABG, ECG, chest imaging, and attach external reports to the admission record.",
      orderedBy: patient.doctor,
      orderedAt: "Today, 12:44 PM",
      acknowledgement: "Nursing team notified",
    },
    {
      id: `${patient.id}-order-handoff`,
      name: "Clinical handoff confirmation",
      category: "Handoff",
      priority: "Urgent",
      instructions: "Confirm referring hospital handoff, ambulance ETA, and contact details before bed transfer.",
      orderedBy: patient.doctor,
      orderedAt: "Today, 12:47 PM",
      acknowledgement: "Reception follow-up required",
    },
  ];
}

function buildDoctorNotes(patient: Patient) {
  return [
    {
      id: `${patient.id}-note-assessment`,
      type: "Assessment",
      status: "Signed",
      doctor: patient.doctor,
      department: patient.icu || "ICU",
      createdAt: "Today, 12:50 PM",
      preview: `${patient.name} is expected for ${patient.icu || "ICU"} admission with ${patient.diagnosis || "diagnosis pending"}. Keep admission workflow ready and avoid duplicate registration.`,
    },
    {
      id: `${patient.id}-note-handoff`,
      type: "Handoff Note",
      status: "Read-only",
      doctor: patient.doctor,
      department: "Critical Care",
      createdAt: "Today, 12:54 PM",
      preview: "Reception should complete demographic verification, upload external documents, and notify the ICU team once the patient reaches the facility.",
    },
  ];
}

function ICUAdmissionStepScroller({ activeStep, onStepSelect }: { activeStep: StepId; onStepSelect: (step: StepId) => void }) {
  const activeStepIndex = getStepIndex(activeStep);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Partial<Record<StepId, HTMLDivElement | null>>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollButtons() {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setCanScrollLeft(scroller.scrollLeft > 4);
    setCanScrollRight(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 4);
  }

  function scrollByPage(direction: "left" | "right") {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: direction === "left" ? -scroller.clientWidth * 0.75 : scroller.clientWidth * 0.75,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    updateScrollButtons();
    const resizeObserver = new ResizeObserver(updateScrollButtons);
    resizeObserver.observe(scroller);
    scroller.addEventListener("scroll", updateScrollButtons, { passive: true });

    return () => {
      resizeObserver.disconnect();
      scroller.removeEventListener("scroll", updateScrollButtons);
    };
  }, []);

  useEffect(() => {
    stepRefs.current[activeStep]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    window.setTimeout(updateScrollButtons, 250);
  }, [activeStep]);

  return (
    <section className="sticky top-[144px] z-20 rounded-xl border border-border bg-white/95 px-3 py-3 shadow-soft backdrop-blur">
      <div className="relative">
        {canScrollLeft ? (
          <button
            aria-label="Scroll workflow steps left"
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-soft hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/25 lg:flex"
            onClick={() => scrollByPage("left")}
            type="button"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : null}

        <div
          className="flex touch-pan-x gap-2 overflow-x-auto overflow-y-hidden scroll-smooth px-1 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          ref={scrollerRef}
          role="list"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") scrollByPage("left");
            if (event.key === "ArrowRight") scrollByPage("right");
          }}
        >
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const completed = index < activeStepIndex;
            const current = step.id === activeStep;
            const blocked = index > activeStepIndex + 1;
            const next = index === activeStepIndex + 1;
            const status = current ? "Current" : completed ? "Completed" : blocked ? "Blocked" : next ? "Next" : "Pending";

            return (
              <div
                aria-current={current ? "step" : undefined}
                aria-label={`${index + 1}. ${step.label}, ${status}`}
                className={cn(
                  "flex min-h-[72px] shrink-0 items-center gap-3 rounded-xl border bg-white px-3 py-3 shadow-soft outline-none transition focus-visible:ring-2 focus-visible:ring-ring/25",
                  step.label.length > 12 ? "min-w-[160px]" : "min-w-[140px]",
                  current && "border-info bg-info/10 shadow-[0_8px_24px_rgba(65,132,247,0.14)]",
                  completed && "border-success/30 bg-success/10",
                  blocked && "opacity-55",
                )}
                key={step.id}
                ref={(node) => {
                  stepRefs.current[step.id] = node;
                }}
                role="button"
                onClick={() => onStepSelect(step.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onStepSelect(step.id);
                  }
                }}
                tabIndex={0}
                title={blocked ? `Jump to ${step.label}` : `${step.label}: ${status}`}
              >
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border", current ? "border-info text-info" : completed ? "border-success text-success" : blocked ? "border-border text-muted-foreground" : "border-border text-foreground")}>
                  {completed ? <CheckCircle2 className="h-5 w-5" /> : blocked ? <ShieldAlert className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-sm font-semibold text-foreground">{index + 1}. {step.label}</span>
                  <span className={cn("mt-0.5 block text-xs font-medium", current ? "text-info" : completed ? "text-success" : blocked ? "text-muted-foreground" : "text-muted-foreground")}>{status}</span>
                </span>
              </div>
            );
          })}
        </div>

        {canScrollRight ? (
          <button
            aria-label="Scroll workflow steps right"
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white shadow-soft hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/25 lg:flex"
            onClick={() => scrollByPage("right")}
            type="button"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

function WaitingPatientsPanel({
  completedToday,
  olderCount,
  patients,
  showOlderPatients,
  selectedPatientId,
  waitingCount,
  onSelect,
  onToggleOlder,
}: {
  completedToday: number;
  olderCount: number;
  patients: Patient[];
  showOlderPatients: boolean;
  selectedPatientId: string;
  waitingCount: number;
  onSelect: (id: string) => void;
  onToggleOlder: () => void;
}) {
  const currentPatient = patients[0];
  const nextPatient = patients[1];
  const searchResults = patients.slice(2);

  return (
    <Card className="h-fit">
      <CardHeader>
        <div>
          <CardTitle>Waiting Patients</CardTitle>
          <CardDescription>Current, next, and counts only</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Counter label="Waiting" value={String(waitingCount)} />
          <Counter label="Completed" value={String(completedToday)} />
        </div>
        {currentPatient ? (
          <>
            <QueueSectionLabel label="Now" />
            <PatientCard
              current
              key={currentPatient.id}
              patient={currentPatient}
              selected={selectedPatientId === currentPatient.id}
              onSelect={() => onSelect(currentPatient.id)}
            />
          </>
        ) : null}
        {nextPatient ? (
          <>
            <QueueSectionLabel label="Next" />
            <PatientCard
              current={false}
              key={nextPatient.id}
              patient={nextPatient}
              selected={selectedPatientId === nextPatient.id}
              onSelect={() => onSelect(nextPatient.id)}
            />
          </>
        ) : null}
        {searchResults.length ? (
          <>
            <QueueSectionLabel label="Waiting" />
            {searchResults.map((patient) => (
              <CompactPatientRow key={patient.id} patient={patient} onSelect={() => onSelect(patient.id)} />
            ))}
          </>
        ) : null}
        {olderCount > 0 ? (
          <button className="w-full rounded-xl border border-border bg-surface-muted p-3 text-center text-sm font-semibold text-muted-foreground hover:bg-white" onClick={onToggleOlder} type="button">
            {showOlderPatients ? "Collapse older patients" : `${olderCount} older patients collapsed`}
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function QueueSectionLabel({ label }: { label: string }) {
  return <p className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>;
}

function CompactPatientRow({ patient, onSelect }: { patient: Patient; onSelect: () => void }) {
  return (
    <button className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2 text-left hover:bg-surface-muted" onClick={onSelect} type="button">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{patient.name}</p>
        <p className="truncate text-xs text-muted-foreground">{patient.hospital}</p>
      </div>
      <Badge tone={priorityTone[patient.priority]}>{getStep(patient.currentStep).label}</Badge>
    </button>
  );
}

function PatientCard({ current, patient, selected, onSelect }: { current: boolean; patient: Patient; selected: boolean; onSelect: () => void }) {
  const step = getStep(patient.currentStep);

  return (
    <div className={cn("rounded-2xl border bg-white p-4 transition", selected ? "border-info bg-info/5 ring-2 ring-info/10" : "border-border")}>
      <button className="w-full text-left" onClick={onSelect} type="button">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-muted text-lg font-bold text-info">
            {patient.name.split(" ").map((part) => part[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xl font-semibold text-foreground">{patient.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{patient.age}Y {patient.gender}</p>
              </div>
              <Badge className={patient.priority === "Critical" ? "px-3 py-1 text-xs" : undefined} tone={priorityTone[patient.priority]}>{patient.priority}</Badge>
            </div>
            <p className="mt-3 truncate text-sm text-muted-foreground">{patient.hospital}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{patient.diagnosis}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-muted-foreground">{patient.arrival}</span>
              <span className="text-sm font-semibold text-info">{step.label}</span>
            </div>
          </div>
        </div>
      </button>
      <Button className="mt-4 h-12 w-full text-base" onClick={onSelect}>
        {current ? step.actionLabel : "Open Next Patient"}
      </Button>
    </div>
  );
}

function CurrentTaskPanel({
  patient,
  step,
  showMoreDetails,
  onComplete,
  onNotify,
  onRecordActivity,
  onShowMoreDetails,
}: {
  patient: Patient;
  step: StepId;
  showMoreDetails: boolean;
  onComplete: (update?: Partial<Patient>) => void;
  onNotify: (title: string, detail?: string, tone?: Tone) => void;
  onRecordActivity: (message: string, tone?: Tone) => void;
  onShowMoreDetails: () => void;
}) {
  const workflowStep = getStep(step);
  const Icon = workflowStep.icon;

  return (
    <Card className="min-h-[560px]">
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Icon className="h-6 w-6 text-info" />
            {workflowStep.actionLabel}
          </CardTitle>
          <CardDescription>{patient.name} - auto-saving fields</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {step === "upload" ? <UploadTask key={patient.id} patient={patient} onComplete={onComplete} onNotify={onNotify} onRecordActivity={onRecordActivity} /> : null}
        {step === "ocr" ? <OcrTask onComplete={onComplete} /> : null}
        {step === "verify" ? <VerifyTask patient={patient} onComplete={onComplete} onNotify={onNotify} /> : null}
        {step === "register" ? <RegisterTask patient={patient} showMoreDetails={showMoreDetails} onComplete={onComplete} onShowMoreDetails={onShowMoreDetails} /> : null}
        {step === "duplicate" ? <DuplicateTask patient={patient} onComplete={onComplete} onNotify={onNotify} /> : null}
        {step === "bed" ? <BedTask onComplete={onComplete} onNotify={onNotify} /> : null}
        {step === "doctor" ? <DoctorTask onComplete={onComplete} onNotify={onNotify} /> : null}
        {step === "nurse" ? <NurseTask onComplete={onComplete} onNotify={onNotify} /> : null}
        {step === "wristband" ? <WristbandTask patient={patient} onComplete={onComplete} /> : null}
        {step === "print" ? <PrintSlipTask patient={patient} onComplete={onComplete} /> : null}
        {step === "transfer" ? <TransferTask patient={patient} onComplete={onComplete} /> : null}
        {step === "complete" ? <CompleteTask patient={patient} onComplete={onComplete} onNotify={onNotify} /> : null}
      </CardContent>
    </Card>
  );
}

function UploadTask({
  patient,
  onComplete,
  onNotify,
  onRecordActivity,
}: {
  patient: Patient;
  onComplete: () => void;
  onNotify: (title: string, detail?: string, tone?: Tone) => void;
  onRecordActivity: (message: string, tone?: Tone) => void;
}) {
  const upload = useDocumentUpload(patient, onNotify, onRecordActivity, onComplete);
  const browseInputRef = useRef<HTMLInputElement>(null);
  const mobileCaptureInputRef = useRef<HTMLInputElement>(null);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const validUploadCount = upload.documents.filter((document) => document.status !== "failed" && document.status !== "cancelled").length;
  const visibleDocuments = upload.selectedCategory === "All" ? upload.documents : upload.documents.filter((document) => document.category === upload.selectedCategory);
  const progress = buildUploadProgressStages(upload.documents);

  return (
    <div className="space-y-4">
      <input
        ref={browseInputRef}
        className="sr-only"
        type="file"
        multiple
        accept={Array.from(acceptedMimeTypes).join(",")}
        onChange={(event) => {
          upload.addFiles(event.target.files);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={mobileCaptureInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => {
          upload.addFiles(event.target.files, upload.selectedCategory === "All" ? "Others" : upload.selectedCategory);
          event.currentTarget.value = "";
        }}
      />
      <input
        ref={bulkInputRef}
        className="sr-only"
        type="file"
        multiple
        accept={Array.from(acceptedMimeTypes).join(",")}
        onChange={(event) => {
          upload.addFiles(event.target.files);
          event.currentTarget.value = "";
          event.currentTarget.removeAttribute("webkitdirectory");
        }}
      />

      <div
        className={cn(
          "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-info/40 bg-info/5 p-6 text-center outline-none transition",
          upload.dragActive && "border-info bg-info/10 ring-4 ring-info/10",
        )}
        onDragOver={upload.onDragOver}
        onDragLeave={upload.onDragLeave}
        onDrop={upload.onDrop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            browseInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <UploadCloud className="h-14 w-14 text-info" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Drop referral documents</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">PDF, images, Word, scanned reports. OCR starts immediately.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-5">
          <Button className="h-12" onClick={() => browseInputRef.current?.click()}>
            <UploadCloud className="h-5 w-5" />
            Browse
          </Button>
          <Button className="h-12" variant="outline" onClick={() => upload.setCameraOpen(true)}>
            <Camera className="h-5 w-5" />
            Camera
          </Button>
          <Button className="h-12" variant="outline" onClick={() => upload.setQrOpen(true)}>
            <QrCode className="h-5 w-5" />
            QR
          </Button>
          <Button className="h-12" variant="outline" onClick={() => upload.setMobileOpen(true)}>Mobile</Button>
          <Button className="h-12" variant="outline" onClick={() => upload.setBulkOpen(true)}>Bulk</Button>
        </div>
        {upload.errors.length ? (
          <div className="mt-4 w-full max-w-xl space-y-1 text-left">
            {upload.errors.slice(-3).map((error) => (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger" key={error}>{error}</p>
            ))}
          </div>
        ) : null}
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {progress.map((item) => (
          <div className="rounded-xl border border-border bg-white p-3" key={item.label}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
              <span className={cn("h-2 w-2 rounded-full", item.tone === "success" ? "bg-success" : item.tone === "danger" ? "bg-danger" : item.tone === "warning" ? "bg-warning" : "bg-info")} />
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full", item.tone === "success" ? "bg-success" : item.tone === "danger" ? "bg-danger" : item.tone === "warning" ? "bg-warning" : "bg-info")} style={{ width: `${item.progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="text-sm font-semibold text-foreground">Auto-created document folders</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {documentCategories.map((folder) => (
            <button
              className={cn("rounded-xl border px-3 py-2 text-left text-sm font-semibold transition", upload.selectedCategory === folder ? "border-info bg-info/10 text-info" : "border-border bg-surface-muted text-foreground hover:bg-white")}
              key={folder}
              onClick={() => upload.setSelectedCategory(folder)}
              onDragOver={upload.onDragOver}
              onDrop={(event) => upload.onFolderDrop(event, folder)}
              type="button"
            >
              {folder} ({upload.countByCategory(folder)})
            </button>
          ))}
        </div>
      </div>
      <UploadedFileList
        documents={visibleDocuments}
        emptyLabel={upload.selectedCategory === "All" ? "No documents selected yet." : `No ${upload.selectedCategory} documents yet.`}
        onCategoryChange={upload.updateCategory}
        onPreview={upload.setPreviewDocumentId}
        onRemove={upload.requestRemove}
        onRename={upload.renameDocument}
        onReplace={(documentId) => upload.startReplace(documentId, browseInputRef.current)}
        onRetry={upload.retryDocument}
      />
      <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px]">
        <Button
          className="h-14 w-full text-base"
          disabled={!validUploadCount || upload.uploading}
          onClick={() => upload.uploadAll(onComplete)}
        >
          <UploadCloud className="h-5 w-5" />
          {validUploadCount ? `Upload ${validUploadCount} Reports` : "Upload Reports"}
        </Button>
        <Button className="h-14" disabled={!upload.uploading} variant="outline" onClick={upload.cancelUploads}>
          Cancel
        </Button>
      </div>
      {upload.cameraOpen ? <CameraCaptureModal onAddFile={(file, category) => upload.addFiles([file], category)} onBrowseFallback={() => mobileCaptureInputRef.current?.click()} onClose={() => upload.setCameraOpen(false)} /> : null}
      {upload.qrOpen ? <QRScannerModal onApply={(data) => upload.applyQrReferral(data)} onClose={() => upload.setQrOpen(false)} /> : null}
      {upload.mobileOpen ? <MobileUploadModal patient={patient} onAddFile={(file, category) => upload.addFiles([file], category)} onClose={() => upload.setMobileOpen(false)} onNotify={onNotify} /> : null}
      {upload.bulkOpen ? (
        <BulkUploadModal
          onAddFiles={(files, category) => upload.addFiles(files, category)}
          onClose={() => upload.setBulkOpen(false)}
          onFolderSelect={() => {
            bulkInputRef.current?.setAttribute("webkitdirectory", "true");
            bulkInputRef.current?.click();
          }}
          onSelectFiles={() => bulkInputRef.current?.click()}
        />
      ) : null}
      {upload.previewDocument ? (
        <FilePreviewDrawer
          document={upload.previewDocument}
          onCategoryChange={upload.updateCategory}
          onClose={() => upload.setPreviewDocumentId(null)}
          onDelete={upload.requestRemove}
          onDownload={downloadDocument}
          onReplace={(documentId) => upload.startReplace(documentId, browseInputRef.current)}
        />
      ) : null}
      {upload.removeDocument ? (
        <ConfirmationModal
          title="Delete uploaded report?"
          message={`Remove ${upload.removeDocument.name}? This action is recorded in the audit log.`}
          confirmLabel="Delete Report"
          onCancel={() => upload.setRemoveDocumentId(null)}
          onConfirm={() => upload.removeConfirmed()}
        />
      ) : null}
    </div>
  );
}

function useDocumentUpload(
  patient: Patient,
  onNotify: (title: string, detail?: string, tone?: Tone) => void,
  onRecordActivity: (message: string, tone?: Tone) => void,
  onAutoComplete: () => void,
) {
  const storageKey = `icu-reception-documents:${patient.id}`;
  const [documents, setDocuments] = useState<UploadedDocument[]>(() => readDocumentDraft(storageKey).documents);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "All">(() => readDocumentDraft(storageKey).selectedCategory);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [previewDocumentId, setPreviewDocumentId] = useState<string | null>(null);
  const [removeDocumentId, setRemoveDocumentId] = useState<string | null>(null);
  const [replaceDocumentId, setReplaceDocumentId] = useState<string | null>(null);
  const cancelRef = useRef(false);
  const documentsRef = useRef(documents);

  const previewDocument = documents.find((document) => document.id === previewDocumentId) ?? null;
  const removeDocument = documents.find((document) => document.id === removeDocumentId) ?? null;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      writeDocumentDraft(storageKey, { documents, selectedCategory, timeline: [], auditLog: [], saveStatus: "Saved" });
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [documents, selectedCategory, storageKey]);

  useEffect(() => () => {
    documentsRef.current.forEach((document) => {
      if (document.objectUrl) URL.revokeObjectURL(document.objectUrl);
    });
  }, []);

  useEffect(() => {
    documentsRef.current = documents;
  }, [documents]);

  function pushError(message: string) {
    setErrors((current) => [...current.slice(-4), message]);
    onNotify("Upload issue", message, "danger");
  }

  async function addFiles(input: FileList | File[] | null, forcedCategory?: DocumentCategory) {
    if (!input?.length) return;
    const incoming = Array.from(input);
    if (replaceDocumentId && incoming[0]) {
      const file = incoming[0];
      const safeName = sanitizeFileName(file.name);
      const validation = validateUploadFile(file, safeName);
      if (!validation.ok) {
        pushError(`${safeName}: ${validation.message}`);
        return;
      }
      setDocuments((current) => current.map((document) => {
        if (document.id !== replaceDocumentId) return document;
        if (document.objectUrl) URL.revokeObjectURL(document.objectUrl);
        return {
          ...document,
          name: safeName,
          originalName: safeName,
          mimeType: file.type || inferMimeType(safeName),
          size: file.size,
          status: "validating",
          ocrStatus: "idle",
          uploadProgress: 0,
          ocrProgress: 0,
          file,
          objectUrl: URL.createObjectURL(file),
          error: undefined,
        };
      }));
      setReplaceDocumentId(null);
      onRecordActivity("Document replaced", "info");
      await uploadAndProcessDocument(replaceDocumentId);
      return;
    }
    const nextDocuments: UploadedDocument[] = [];
    const duplicateKeys = new Set(documents.map((document) => `${document.originalName}:${document.size}`));

    for (const file of incoming) {
      const safeName = sanitizeFileName(file.name);
      const duplicateKey = `${safeName}:${file.size}`;
      const validation = validateUploadFile(file, safeName);
      if (!validation.ok) {
        pushError(`${safeName}: ${validation.message}`);
        continue;
      }
      if (duplicateKeys.has(duplicateKey)) {
        pushError(`${safeName}: duplicate file skipped`);
        continue;
      }
      duplicateKeys.add(duplicateKey);
      nextDocuments.push({
        id: createId("doc"),
        name: safeName,
        originalName: safeName,
        mimeType: file.type || inferMimeType(safeName),
        size: file.size,
        category: forcedCategory ?? (selectedCategory === "All" ? detectDocumentCategory(safeName) : selectedCategory),
        status: "validating",
        ocrStatus: "idle",
        uploadProgress: 0,
        ocrProgress: 0,
        uploadedBy: receptionistUser,
        uploadedAt: new Date().toISOString(),
        retries: 0,
        verified: false,
        file,
        objectUrl: URL.createObjectURL(file),
      });
    }

    if (!nextDocuments.length) return;

    setDocuments((current) => [...nextDocuments, ...current]);
    onRecordActivity(`${nextDocuments.length} document(s) selected`, "info");
    setUploading(true);
    try {
      await Promise.all(nextDocuments.map((document) => uploadAndProcessDocument(document.id)));
      onRecordActivity("Reports uploaded and OCR started", "success");
      onAutoComplete();
    } finally {
      setUploading(false);
    }
  }

  async function uploadAndProcessDocument(documentId: string) {
    cancelRef.current = false;
    setDocuments((current) => updateDocument(current, documentId, { status: "uploading", uploadProgress: 8, error: undefined }));
    try {
      for (const progress of [18, 34, 52, 76, 100]) {
        await sleep(170);
        if (cancelRef.current) {
          setDocuments((current) => updateDocument(current, documentId, { status: "cancelled", error: "Upload cancelled" }));
          return;
        }
        setDocuments((current) => updateDocument(current, documentId, { uploadProgress: progress }));
      }
      await uploadReferralDocument(documentId);
      setDocuments((current) => updateDocument(current, documentId, { status: "uploaded", ocrStatus: "ocrQueued" }));
      await startDocumentOCR(documentId);
      for (const [ocrStatus, ocrProgress] of [["ocrRunning", 32], ["extracting", 68], ["verificationReady", 100]] as Array<[OCRStatus, number]>) {
        await sleep(220);
        setDocuments((current) => updateDocument(current, documentId, {
          ocrStatus,
          ocrProgress,
          extractedFields: ocrStatus === "verificationReady" ? mockExtractedFields() : undefined,
        }));
      }
    } catch {
      setDocuments((current) => updateDocument(current, documentId, { status: "failed", ocrStatus: "failed", error: "Server error while processing document" }));
    }
  }

  async function uploadAll(onComplete: () => void) {
    const validDocuments = documents.filter((document) => document.status !== "failed" && document.status !== "cancelled");
    if (!validDocuments.length) {
      onNotify("No valid reports", "Select at least one valid report before upload.", "warning");
      return;
    }
    setUploading(true);
    cancelRef.current = false;
    try {
      for (const document of validDocuments) {
        if (document.status !== "uploaded" || document.ocrStatus !== "verificationReady") {
          await uploadAndProcessDocument(document.id);
        }
      }
      onRecordActivity("Reports uploaded and OCR queued", "success");
      onComplete();
    } finally {
      setUploading(false);
    }
  }

  function cancelUploads() {
    cancelRef.current = true;
    setUploading(false);
    onNotify("Upload cancelled", "Running uploads were stopped. Completed reports are preserved.", "warning");
  }

  function updateCategory(documentId: string, category: DocumentCategory) {
    setDocuments((current) => updateDocument(current, documentId, { category }));
    updateDocumentCategory(documentId, category);
    onRecordActivity("Document category updated", "info");
  }

  function renameDocument(documentId: string, name: string) {
    const safeName = sanitizeFileName(name);
    if (!safeName) return;
    setDocuments((current) => updateDocument(current, documentId, { name: safeName }));
    onRecordActivity("Document renamed", "info");
  }

  function requestRemove(documentId: string) {
    setRemoveDocumentId(documentId);
  }

  async function removeConfirmed() {
    if (!removeDocumentId) return;
    await deleteDocument(removeDocumentId);
    setDocuments((current) => {
      const removed = current.find((document) => document.id === removeDocumentId);
      if (removed?.objectUrl) URL.revokeObjectURL(removed.objectUrl);
      return current.filter((document) => document.id !== removeDocumentId);
    });
    setRemoveDocumentId(null);
    setPreviewDocumentId(null);
    onRecordActivity("Document deleted", "warning");
  }

  function retryDocument(documentId: string) {
    setDocuments((current) => updateDocument(current, documentId, { retries: (current.find((document) => document.id === documentId)?.retries ?? 0) + 1, error: undefined }));
    uploadAndProcessDocument(documentId);
  }

  function startReplace(documentId: string, input: HTMLInputElement | null) {
    setReplaceDocumentId(documentId);
    input?.click();
  }

  function onDragOver(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(true);
  }

  function onDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  }

  function onFolderDrop(event: React.DragEvent, category: DocumentCategory) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files, category);
  }

  async function applyQrReferral(data: QRReferralData) {
    const details = await fetchReferralDetails(data);
    onNotify("QR applied", `${details.referralId} • ${details.hospitalName}`, "success");
    onRecordActivity("Referral QR scanned", "success");
  }

  function countByCategory(category: DocumentCategory) {
    return documents.filter((document) => document.category === category).length;
  }

  return {
    addFiles,
    applyQrReferral,
    bulkOpen,
    cameraOpen,
    cancelUploads,
    countByCategory,
    documents,
    dragActive,
    errors,
    mobileOpen,
    onDragLeave,
    onDragOver,
    onDrop,
    onFolderDrop,
    previewDocument,
    qrOpen,
    removeConfirmed,
    removeDocument,
    renameDocument,
    requestRemove,
    retryDocument,
    selectedCategory,
    setBulkOpen,
    setCameraOpen,
    setMobileOpen,
    setPreviewDocumentId,
    setQrOpen,
    setRemoveDocumentId,
    setSelectedCategory,
    startReplace,
    updateCategory,
    uploadAll,
    uploading,
    replaceDocumentId,
  };
}

function UploadedFileList({
  documents,
  emptyLabel,
  onCategoryChange,
  onPreview,
  onRemove,
  onRename,
  onReplace,
  onRetry,
}: {
  documents: UploadedDocument[];
  emptyLabel: string;
  onCategoryChange: (documentId: string, category: DocumentCategory) => void;
  onPreview: (documentId: string) => void;
  onRemove: (documentId: string) => void;
  onRename: (documentId: string, name: string) => void;
  onReplace: (documentId: string) => void;
  onRetry: (documentId: string) => void;
}) {
  if (!documents.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-sm font-semibold text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="border-b border-border bg-surface-muted px-4 py-3 text-sm font-semibold text-foreground">Selected reports</div>
      <div className="divide-y divide-border">
        {documents.map((document) => (
          <div className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1.3fr)_180px_160px_220px]" key={document.id}>
            <button className="min-w-0 text-left" onClick={() => onPreview(document.id)} type="button">
              <p className="truncate text-sm font-semibold text-foreground">{document.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{document.mimeType || "Unknown type"} • {formatBytes(document.size)} • {new Date(document.uploadedAt).toLocaleString()}</p>
              {document.error ? <p className="mt-1 text-xs font-semibold text-danger">{document.error}</p> : null}
            </button>
            <select className="h-10 rounded-xl border border-border bg-white px-3 text-sm font-semibold" onChange={(event) => onCategoryChange(document.id, event.target.value as DocumentCategory)} value={document.category}>
              {documentCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <div>
              <Badge tone={document.status === "failed" ? "danger" : document.ocrStatus === "verificationReady" ? "success" : document.status === "uploading" ? "info" : "warning"}>
                {document.ocrStatus === "verificationReady" ? "Verification Ready" : document.status}
              </Badge>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-info" style={{ width: `${Math.max(document.uploadProgress, document.ocrProgress)}%` }} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onPreview(document.id)}>Preview</Button>
              <Button size="sm" variant="outline" onClick={() => {
                const name = window.prompt("Rename report", document.name);
                if (name) onRename(document.id, name);
              }}>Rename</Button>
              <Button size="sm" variant="outline" onClick={() => onReplace(document.id)}>Replace</Button>
              {document.status === "failed" ? <Button size="sm" onClick={() => onRetry(document.id)}>Retry</Button> : null}
              <Button size="sm" variant="danger" onClick={() => onRemove(document.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type QRReferralData = {
  referralId: string;
  patientId?: string;
  uhid?: string;
  reportUrl?: string;
  hospitalName: string;
  token: string;
};

function CameraCaptureModal({
  onAddFile,
  onBrowseFallback,
  onClose,
}: {
  onAddFile: (file: File, category: DocumentCategory) => void;
  onBrowseFallback: () => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [capturedUrl, setCapturedUrl] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Referral Letter");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  useEffect(() => {
    let mounted = true;
    async function openCamera() {
      try {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setError("");
      } catch {
        setError("Camera permission denied or unavailable. Use Browse Files as fallback.");
      }
    }
    openCamera();
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [facingMode]);

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setCapturedUrl(canvas.toDataURL("image/jpeg", 0.92));
  }

  function usePhoto() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: "image/jpeg" });
      onAddFile(file, category);
      onClose();
    }, "image/jpeg", 0.92);
  }

  return (
    <ModalFrame title="Camera Capture" onClose={onClose}>
      <div className="space-y-4">
        {error ? <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">{error}</div> : null}
        <div className="overflow-hidden rounded-2xl border border-border bg-black">
          {capturedUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="max-h-[420px] w-full object-contain" src={capturedUrl} alt="Captured report" />
          ) : (
            <video ref={videoRef} className="max-h-[420px] w-full bg-black object-contain" autoPlay muted playsInline />
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <select className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold" value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)}>
          {documentCategories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <div className="grid gap-2 sm:grid-cols-4">
          <Button variant="outline" onClick={() => setFacingMode((mode) => mode === "environment" ? "user" : "environment")}>Switch</Button>
          {capturedUrl ? <Button variant="outline" onClick={() => setCapturedUrl("")}>Retake</Button> : <Button onClick={capture}>Capture</Button>}
          {capturedUrl ? <Button onClick={usePhoto}>Use Photo</Button> : <Button variant="outline" onClick={onBrowseFallback}>Browse Files</Button>}
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </ModalFrame>
  );
}

function QRScannerModal({ onApply, onClose }: { onApply: (data: QRReferralData) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [manualCode, setManualCode] = useState("REF-24071|UHID-82944|Alfa Trauma Centre|token-demo");
  const [result, setResult] = useState<QRReferralData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function openCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setError("QR camera access unavailable. Enter the QR code manually.");
      }
    }
    openCamera();
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function parseManual() {
    const parsed = parseReferralQr(manualCode);
    if (!parsed) {
      setError("Invalid, unsupported, or expired QR data.");
      return;
    }
    setResult(parsed);
    setError("");
  }

  return (
    <ModalFrame title="Referral QR Scanner" onClose={onClose}>
      <div className="space-y-4">
        <video ref={videoRef} className="max-h-[300px] w-full rounded-2xl border border-border bg-black object-cover" autoPlay muted playsInline />
        {error ? <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm font-semibold text-danger">{error}</div> : null}
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
          <Input value={manualCode} onChange={(event) => setManualCode(event.target.value)} placeholder="Paste referral QR code data" />
          <Button onClick={parseManual}>Validate</Button>
        </div>
        {result ? (
          <div className="rounded-xl border border-success/30 bg-success/10 p-3 text-sm">
            <p className="font-semibold text-foreground">Referral ID: {result.referralId}</p>
            <p className="text-muted-foreground">UHID: {result.uhid ?? "Pending"} • Hospital: {result.hospitalName}</p>
          </div>
        ) : null}
        <div className="grid gap-2 sm:grid-cols-2">
          <Button disabled={!result} onClick={() => {
            if (result) onApply(result);
            onClose();
          }}>Apply QR Result</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </ModalFrame>
  );
}

function MobileUploadModal({
  patient,
  onAddFile,
  onClose,
  onNotify,
}: {
  patient: Patient;
  onAddFile: (file: File, category: DocumentCategory) => void;
  onClose: () => void;
  onNotify: (title: string, detail?: string, tone?: Tone) => void;
}) {
  const [session, setSession] = useState(() => createMobileUploadSession(patient));
  const [state, setState] = useState<MobileSessionState>("Waiting for mobile");
  const [secondsLeft, setSecondsLeft] = useState(300);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setState("Expired");
          window.clearInterval(interval);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [session.token]);

  function refresh() {
    setSession(refreshMobileUploadSession(patient));
    setSecondsLeft(300);
    setState("Waiting for mobile");
  }

  return (
    <ModalFrame title="Mobile Upload Session" onClose={() => {
      cancelMobileUploadSession(session.token);
      onClose();
    }}>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="h-44 w-44 rounded-xl border border-border bg-white p-2" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(session.link)}`} alt="Mobile upload QR" />
          <div className="space-y-3">
            <Badge tone={state === "Expired" ? "danger" : state === "Completed" ? "success" : "info"}>{state}</Badge>
            <p className="break-all rounded-xl border border-border bg-surface-muted p-3 text-sm font-semibold text-foreground">{session.link}</p>
            <p className="text-sm text-muted-foreground">Expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => {
                navigator.clipboard?.writeText(session.link);
                onNotify("Upload link copied", "Share it with attendant or staff.", "success");
              }}>Copy Link</Button>
              <Button variant="outline" onClick={refresh}>New QR</Button>
              <Button onClick={() => fileInputRef.current?.click()}>Simulate Phone Upload</Button>
            </div>
          </div>
        </div>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          multiple
          accept={Array.from(acceptedMimeTypes).join(",")}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setState("Uploading");
            files.forEach((file) => onAddFile(file, detectDocumentCategory(file.name)));
            setState("Completed");
            event.currentTarget.value = "";
          }}
        />
      </div>
    </ModalFrame>
  );
}

function BulkUploadModal({
  onAddFiles,
  onClose,
  onFolderSelect,
  onSelectFiles,
}: {
  onAddFiles: (files: File[], category?: DocumentCategory) => void;
  onClose: () => void;
  onFolderSelect: () => void;
  onSelectFiles: () => void;
}) {
  const [bulkCategory, setBulkCategory] = useState<DocumentCategory | "Auto">("Auto");

  return (
    <ModalFrame title="Bulk Upload" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-xl border border-info/30 bg-info/10 p-3 text-sm font-semibold text-info">Files are validated, categorized, uploaded with limited concurrency, and successful uploads are preserved if another file fails.</div>
        <select className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold" value={bulkCategory} onChange={(event) => setBulkCategory(event.target.value as DocumentCategory | "Auto")}>
          <option>Auto</option>
          {documentCategories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button onClick={onSelectFiles}>Select Many Files</Button>
          <Button variant="outline" onClick={onFolderSelect}>Select Folder</Button>
          <Button variant="outline" onClick={() => {
            const demo = new File(["Bulk referral content"], `bulk-${Date.now()}.pdf`, { type: "application/pdf" });
            onAddFiles([demo], bulkCategory === "Auto" ? undefined : bulkCategory);
          }}>Upload All</Button>
          <Button variant="outline" onClick={() => onAddFiles([], undefined)}>Pause</Button>
          <Button variant="outline" onClick={() => onAddFiles([], undefined)}>Resume</Button>
          <Button variant="outline" onClick={() => onAddFiles([], undefined)}>Retry Failed</Button>
        </div>
      </div>
    </ModalFrame>
  );
}

function FilePreviewDrawer({
  document,
  onCategoryChange,
  onClose,
  onDelete,
  onDownload,
  onReplace,
}: {
  document: UploadedDocument;
  onCategoryChange: (documentId: string, category: DocumentCategory) => void;
  onClose: () => void;
  onDelete: (documentId: string) => void;
  onDownload: (document: UploadedDocument) => void;
  onReplace: (documentId: string) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isImage = document.mimeType.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";

  return (
    <ModalFrame title={document.name} onClose={onClose} wide>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-h-[460px] items-center justify-center overflow-auto rounded-2xl border border-border bg-surface-muted p-4">
          {isImage && document.objectUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="max-h-[620px] object-contain transition" src={document.objectUrl} alt={document.name} style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }} />
          ) : isPdf && document.objectUrl ? (
            <iframe className="h-[620px] w-full rounded-xl bg-white" src={document.objectUrl} title={document.name} />
          ) : (
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-info" />
              <p className="mt-3 font-semibold text-foreground">Preview unavailable for this format.</p>
              <p className="mt-1 text-sm text-muted-foreground">Download the document to view it.</p>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <SummaryRow label="Category" value={document.category} />
          <SummaryRow label="Uploaded By" value={document.uploadedBy} />
          <SummaryRow label="Uploaded At" value={new Date(document.uploadedAt).toLocaleString()} />
          <SummaryRow label="Verification" value={document.verified ? "Verified" : "Pending"} />
          <SummaryRow label="OCR" value={document.ocrStatus} />
          <select className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-semibold" value={document.category} onChange={(event) => onCategoryChange(document.id, event.target.value as DocumentCategory)}>
            {documentCategories.map((category) => <option key={category}>{category}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setZoom((value) => Math.min(2, value + 0.15))}>Zoom In</Button>
            <Button variant="outline" onClick={() => setZoom((value) => Math.max(0.5, value - 0.15))}>Zoom Out</Button>
            <Button variant="outline" onClick={() => setRotation((value) => value + 90)}>Rotate</Button>
            <Button variant="outline" onClick={() => onDownload(document)}>Download</Button>
            <Button variant="outline" onClick={() => onReplace(document.id)}>Replace</Button>
            <Button variant="danger" onClick={() => onDelete(document.id)}>Delete</Button>
          </div>
        </div>
      </div>
    </ModalFrame>
  );
}

function OcrTask({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
        <FileText className="mx-auto h-12 w-12 text-success" />
        <p className="mt-4 text-2xl font-semibold text-foreground">OCR extraction finished</p>
        <p className="mt-2 text-sm text-muted-foreground">Patient details, labs, vitals, diagnosis, insurance, medication extracted.</p>
        <Badge className="mt-4" tone="success">94% confidence</Badge>
      </div>
      <PrimaryAction icon={FileText} label="Run OCR Extraction" onClick={onComplete} />
    </div>
  );
}

function VerifyTask({ patient, onComplete, onNotify }: { patient: Patient; onComplete: () => void; onNotify: (title: string, detail?: string, tone?: Tone) => void }) {
  const extracted = [
    ["Patient Name", patient.name, "99%"],
    ["Age", `${patient.age}Y`, "96%"],
    ["Gender", patient.gender, "96%"],
    ["Blood Group", patient.bloodGroup, "89%"],
    ["Hospital", patient.hospital, "94%"],
    ["Diagnosis", patient.diagnosis, "91%"],
    ["UHID", "Existing match possible", "72%"],
    ["Insurance", "Cashless requested", "86%"],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-surface-muted p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Uploaded Document Preview</p>
            <Badge tone="success">OCR Ready</Badge>
          </div>
          <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-border bg-white p-6 text-center">
            <div>
              <FileText className="mx-auto h-12 w-12 text-info" />
              <p className="mt-3 font-semibold text-foreground">Referral-letter-Aisha.pdf</p>
              <p className="mt-1 text-sm text-muted-foreground">Preview placeholder</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {extracted.map(([label, value, confidence]) => {
            const score = Number(confidence.replace("%", ""));
            const tone: Tone = score >= 90 ? "success" : score >= 80 ? "warning" : "danger";
            return (
              <div className={cn("rounded-xl border p-3", tone === "success" && "border-success/30 bg-success/10", tone === "warning" && "border-warning/40 bg-warning/10", tone === "danger" && "border-danger/40 bg-danger/10")} key={label}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
                  <Badge tone={tone}>{confidence}</Badge>
                </div>
                <p className="mt-2 font-semibold text-foreground">{value}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Button className="h-12" variant="outline" onClick={() => onNotify("Edit mode opened", "Extracted fields are ready for inline review.", "info")}>Edit</Button>
        <PrimaryAction icon={FileCheck2} label="Confirm Extracted Data" onClick={onComplete} />
      </div>
    </div>
  );
}

function RegisterTask({
  patient,
  showMoreDetails,
  onComplete,
  onShowMoreDetails,
}: {
  patient: Patient;
  showMoreDetails: boolean;
  onComplete: (update?: Partial<Patient>) => void;
  onShowMoreDetails: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Patient name" value={patient.name} />
        <Field label="Mobile" value={patient.mobile} />
        <Field label="Age" value={patient.age} />
        <Field label="Gender" value={patient.gender} />
        <Field label="Referral number" value={patient.referralNo} />
        <Field label="Hospital" value={patient.hospital} />
        <Field label="Required ICU" value={patient.icu} />
      </div>
      {showMoreDetails ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Blood group" value={patient.bloodGroup} />
          <Field label="Arrival type" value={patient.arrivalType} />
          <Field label="Primary diagnosis" value={patient.diagnosis} />
          <Field label="Arrival time" value={patient.arrival} />
        </div>
      ) : null}
      <Button className="h-12 w-full" variant="outline" onClick={onShowMoreDetails}>
        {showMoreDetails ? "Hide More Details" : "More Details"}
      </Button>
      <PrimaryAction icon={IdCard} label="Register Patient" onClick={() => onComplete()} />
    </div>
  );
}

function DuplicateTask({ patient, onComplete, onNotify }: { patient: Patient; onComplete: () => void; onNotify: (title: string, detail?: string, tone?: Tone) => void }) {
  const duplicate = patient.duplicateFound;

  return (
    <div className="space-y-4">
      <div className={cn("rounded-2xl border p-5", duplicate ? "border-warning/40 bg-warning/10" : "border-success/30 bg-success/10")}>
        <p className="text-xl font-semibold text-foreground">{duplicate ? "Existing Patient Found" : "No Duplicate Found"}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Checked UHID, mobile, government ID, patient name, and date of birth.
        </p>
      </div>
      {duplicate ? (
        <div className="grid gap-2 md:grid-cols-3">
          <Button className="h-12" variant="outline" onClick={() => onNotify("Existing history opened", "Patient timeline and previous admissions are ready for review.", "info")}>View History</Button>
          <Button className="h-12" onClick={onComplete}>Continue Existing Admission</Button>
          <Button className="h-12" variant="outline" onClick={onComplete}>Create New Patient</Button>
        </div>
      ) : (
        <PrimaryAction icon={ShieldAlert} label="Continue Existing Admission" onClick={onComplete} />
      )}
    </div>
  );
}

function BedTask({ onComplete, onNotify }: { onComplete: (update?: Partial<Patient>) => void; onNotify: (title: string, detail?: string, tone?: Tone) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Recommended: MICU-03</p>
            <p className="mt-1 text-xs text-muted-foreground">Reason: ventilator available, monitor ready, closest nurse station, compatible ICU.</p>
          </div>
          <Badge tone="success">Best match</Badge>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {beds.map((bed) => {
          const available = bed.status === "Available";
          const cleaning = bed.status === "Cleaning";
          const reserved = bed.status === "Reserved";
          return (
            <button
              className={cn(
                "min-h-[150px] rounded-2xl border p-4 text-left transition hover:shadow-soft disabled:cursor-not-allowed",
                available && "border-success/40 bg-success/10",
                cleaning && "border-warning/40 bg-warning/10",
                reserved && "border-info/40 bg-info/10",
                bed.status === "Occupied" && "border-danger/40 bg-danger/10 opacity-75",
              )}
              key={bed.id}
              onClick={() => available ? onComplete({ bed: bed.id }) : onNotify("Bed unavailable", `${bed.id} is ${bed.status}. Choose an available green bed or request supervisor override.`, "warning")}
              type="button"
            >
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-foreground">{bed.id}</p>
                <Badge tone={available ? "success" : cleaning ? "warning" : reserved ? "info" : "danger"}>{bed.status}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{bed.unit}</p>
              <p className="mt-1 text-sm text-muted-foreground">{bed.meta}</p>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                <span>Ventilator: {bed.meta.includes("Ventilator") ? "Yes" : "No"}</span>
                <span>Monitor: {bed.meta.includes("monitor") || bed.meta.includes("Cardiac") ? "Yes" : "No"}</span>
                <span>Oxygen: Yes</span>
                <span>Isolation: {bed.isolation}</span>
                <span>Nurse: {bed.nurse}</span>
                <span>Distance: {bed.distance}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DoctorTask({ onComplete, onNotify }: { onComplete: (update?: Partial<Patient>) => void; onNotify: (title: string, detail?: string, tone?: Tone) => void }) {
  return <StaffTask items={doctors} label="Assign Doctor" onComplete={(name) => onComplete({ doctor: name })} onNotify={onNotify} />;
}

function NurseTask({ onComplete, onNotify }: { onComplete: (update?: Partial<Patient>) => void; onNotify: (title: string, detail?: string, tone?: Tone) => void }) {
  return <StaffTask items={nurses} label="Assign Nurse" onComplete={(name) => onComplete({ nurse: name })} onNotify={onNotify} />;
}

function StaffTask({
  items,
  label,
  onComplete,
  onNotify,
}: {
  items: Array<{ name: string; unit: string; status: string; workload: string; response: string }>;
  label: string;
  onComplete: (name: string) => void;
  onNotify: (title: string, detail?: string, tone?: Tone) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
        <p className="font-semibold text-foreground">Recommended: {items.find((item) => item.status === "Available")?.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">Recommended by availability, workload, response time, and ICU match.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const available = item.status === "Available";
          return (
            <button
              className={cn("min-h-[120px] rounded-2xl border p-4 text-left transition hover:shadow-soft disabled:cursor-not-allowed", available ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/10 opacity-80")}
              key={item.name}
              onClick={() => available ? onComplete(item.name) : onNotify("Staff unavailable", `${item.name} is currently busy. Select an available staff member or request supervisor override.`, "warning")}
              type="button"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-foreground">{item.name}</p>
                <Badge tone={available ? "success" : "warning"}>{item.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.unit}</p>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                <span>Workload: {item.workload}</span>
                <span>Response: {item.response}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-info">{available ? label : "Unavailable now"}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WristbandTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface-muted p-6 text-center">
        <ClipboardCheck className="mx-auto h-12 w-12 text-info" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Wristband, QR sticker, and labels ready</p>
        <p className="mt-2 text-sm text-muted-foreground">{patient.name} - {patient.referralNo}</p>
      </div>
      <PrimaryAction icon={ClipboardCheck} label="Generate Wristband" onClick={onComplete} />
    </div>
  );
}

function PrintSlipTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-white p-5">
        <p className="text-lg font-semibold text-foreground">Auto-generated documents</p>
        <p className="mt-1 text-sm text-muted-foreground">{patient.name} - {patient.referralNo}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Admission Form", "Bed Allocation Slip", "Referral Receipt", "Patient Labels"].map((item) => (
            <SummaryRow key={item} label={item} value="Ready to print / PDF" />
          ))}
        </div>
      </div>
      <PrimaryAction icon={Printer} label="Print Admission Slip" onClick={() => {
        window.print();
        onComplete();
      }} />
    </div>
  );
}

function TransferTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-info/30 bg-info/10 p-6 text-center">
        <Ambulance className="mx-auto h-12 w-12 text-info" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Transfer to ICU</p>
        <p className="mt-2 text-sm text-muted-foreground">ICU notified automatically for {patient.bed}.</p>
      </div>
      <PrimaryAction icon={Ambulance} label="Start ICU Transfer" onClick={onComplete} />
    </div>
  );
}

function CompleteTask({ patient, onComplete, onNotify }: { patient: Patient; onComplete: () => void; onNotify: (title: string, detail?: string, tone?: Tone) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <p className="mt-4 text-3xl font-semibold text-foreground">Admission Completed Successfully</p>
        <p className="mt-2 text-sm text-muted-foreground">{patient.name} is ready for ICU transfer.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryRow label="Assigned Bed" value={patient.bed} />
        <SummaryRow label="Assigned Doctor" value={patient.doctor} />
        <SummaryRow label="Assigned Nurse" value={patient.nurse} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Button className="h-12" variant="outline" onClick={() => window.print()}>
          <ClipboardCheck className="h-4 w-4" />
          Print Wristband
        </Button>
        <Button className="h-12" variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print Admission Slip
        </Button>
        <Button className="h-12" variant="outline" onClick={() => onNotify("ICU transfer started", "ICU team notified and transfer audit entry recorded.", "success")}>
          <Ambulance className="h-4 w-4" />
          Transfer to ICU
        </Button>
      </div>
      <PrimaryAction icon={CheckCircle2} label="Complete Admission" onClick={onComplete} />
    </div>
  );
}

function GuidancePanel({
  patient,
  activeStepIndex,
  lastActivity,
  onEmergencyAction,
}: {
  patient: Patient;
  activeStepIndex: number;
  lastActivity: string;
  onEmergencyAction: (action: string) => void;
}) {
  const remainingTasks = workflowSteps.slice(activeStepIndex + 1).map((step) => step.label);
  const nextStep = workflowSteps[activeStepIndex + 1]?.label ?? "None";
  const estimatedMinutes = Math.max(1, (workflowSteps.length - activeStepIndex - 1) * 2);
  const alerts = [
    patient.priority === "Critical" ? "Critical patient: ICU team notified" : null,
    patient.bed === "Not assigned" ? "Bed not assigned" : null,
    patient.doctor === "Not assigned" ? "Doctor not assigned" : null,
    patient.nurse === "Not assigned" ? "Nurse not assigned" : null,
  ].filter((alert): alert is string => Boolean(alert));
  const timeline = ["Patient Arrived", "Report Uploaded", "OCR Completed", "Registration", "Bed Assigned", "Doctor Assigned", "Transfer Started", "Admission Completed"];

  return (
    <Card className="h-fit">
      <CardHeader>
        <div>
          <CardTitle>Guidance</CardTitle>
          <CardDescription>Only what matters now</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <PanelBox title="Current Task" value={getStep(patient.currentStep).actionLabel} tone="info" />
        <PanelBox title="Next Step" value={nextStep} tone="muted" />
        <PanelBox title="Estimated Time Remaining" value={`${estimatedMinutes} min`} tone="warning" />
        {patient.priority === "Critical" ? <CriticalModeActions onAction={onEmergencyAction} /> : null}
        <PanelList title="Remaining Tasks" items={remainingTasks.length ? remainingTasks : ["None"]} />
        <PanelList critical title="Critical Alerts" items={alerts.length ? alerts : ["No critical alerts"]} />
        <PanelBox title="Recent Activity" value={lastActivity} tone="success" />
        <div className="rounded-xl border border-border bg-surface-muted p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Live Timeline</p>
          <div className="mt-3 space-y-2">
            {timeline.slice(0, 6).map((item, index) => (
              <div className="flex gap-2" key={item}>
                <span className={cn("mt-1 h-2 w-2 rounded-full", index <= activeStepIndex ? "bg-info" : "bg-muted")} />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Checklist</p>
          <div className="mt-3 space-y-2">
            {["Registration", "Reports", "OCR", "Bed", "Doctor", "Nurse", "Insurance", "Consent", "Wristband", "Print", "Transfer", "Completed"].slice(0, 8).map((item, index) => (
              <div className="flex items-center justify-between" key={item}>
                <span className="text-sm font-medium text-foreground">{item}</span>
                <span className={cn("text-sm font-bold", index <= activeStepIndex ? "text-success" : "text-muted-foreground")}>{index <= activeStepIndex ? "✓" : "○"}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CriticalModeActions({ onAction }: { onAction: (action: string) => void }) {
  const actions = ["Notify ICU", "Notify Doctor", "Notify Nurse", "Reserve Bed", "Emergency Print"];

  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-danger">
        <AlertTriangle className="h-4 w-4" />
        Emergency Mode
      </p>
      <div className="mt-3 grid gap-2">
        {actions.map((action) => (
          <Button className="h-11 justify-start" key={action} variant="danger" onClick={() => onAction(action)}>
            {action}
          </Button>
        ))}
      </div>
    </div>
  );
}

function BottomBar({
  nextLabel,
  onEmergency,
  onNext,
  onNextPatient,
  onPrevious,
  onPrint,
}: {
  nextLabel: string;
  onEmergency: () => void;
  onNext: () => void;
  onNextPatient: () => void;
  onPrevious: () => void;
  onPrint: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 px-4 py-3 shadow-[0_-12px_28px_rgba(39,37,54,0.08)] backdrop-blur lg:left-[var(--app-sidebar-offset,264px)]">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 md:grid-cols-5">
        <BarButton label="Previous Step" variant="outline" onClick={onPrevious} />
        <BarButton icon={AlertTriangle} label="Emergency" variant="danger" onClick={onEmergency} />
        <BarButton label={nextLabel} onClick={onNext} />
        <BarButton icon={Printer} label="Print" variant="outline" onClick={onPrint} />
        <BarButton label="Next Patient" variant="outline" onClick={onNextPatient} />
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">Enter = next step | Tab = next field | Ctrl+S = save | Ctrl+P = print | Esc = cancel</p>
    </div>
  );
}

function EmergencyButton({ open, onAction, onToggle }: { open: boolean; onAction: (action: string) => void; onToggle: () => void }) {
  const actions = ["Notify ICU", "Notify Doctor", "Notify Nurse", "Reserve Bed", "Emergency Print"];

  return (
    <div className="fixed bottom-28 right-6 z-40 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[250px] rounded-2xl border border-danger/30 bg-white p-2 shadow-2xl">
          {actions.map((action) => (
            <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-danger/10" key={action} onClick={() => onAction(action)} type="button">
              <Phone className="h-4 w-4 text-danger" />
              {action}
            </button>
          ))}
        </div>
      ) : null}
      <button
        className="flex h-14 w-14 items-center justify-center rounded-full bg-danger text-white shadow-[0_16px_32px_rgba(234,84,85,0.28)]"
        onClick={onToggle}
        type="button"
      >
        {open ? <X className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
      </button>
    </div>
  );
}

function ArrivalTypeModal({ onClose, onSelect }: { onClose: () => void; onSelect: (form: NewPatientIntakeForm) => void }) {
  const [selectedArrivalType, setSelectedArrivalType] = useState<ArrivalType | null>(null);
  const [form, setForm] = useState<NewPatientIntakeForm>(() => buildNewPatientDraft("Referral from Another Hospital"));
  const [errors, setErrors] = useState<Partial<Record<keyof NewPatientIntakeForm, string>>>({});
  const [draftSaved, setDraftSaved] = useState(false);

  function selectArrivalType(arrivalType: ArrivalType) {
    setSelectedArrivalType(arrivalType);
    setForm((current) => ({
      ...buildNewPatientDraft(arrivalType),
      name: current.name,
      mobile: current.mobile,
      age: current.age,
      gender: current.gender || "Female",
    }));
    setErrors({});
  }

  function updateField<Key extends keyof NewPatientIntakeForm>(key: Key, value: NewPatientIntakeForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setDraftSaved(false);
  }

  function saveDraft() {
    window.localStorage.setItem("icu-reception-new-patient-draft", JSON.stringify(form));
    setDraftSaved(true);
  }

  function submit() {
    const nextErrors = validateNewPatientForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSelect(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Patient arrival</p>
            <h2 className="text-xl font-semibold text-foreground">{selectedArrivalType ? "New ICU Patient" : "How did the patient arrive?"}</h2>
          </div>
          <Button size="sm" variant="ghost" type="button" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {!selectedArrivalType ? (
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {arrivalTypes.map((item) => (
              <button className="min-h-[104px] rounded-2xl border border-border bg-white p-4 text-left transition hover:bg-info/5 hover:ring-2 hover:ring-info/10" key={item} onClick={() => selectArrivalType(item)} type="button">
                <p className="font-semibold text-foreground">{arrivalTypeLabel(item)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Open patient intake and start at Upload Reports</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 p-5">
            <div className="rounded-xl border border-info/30 bg-info/10 p-3">
              <p className="text-sm font-semibold text-info">{arrivalTypeLabel(selectedArrivalType)}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">Complete mandatory fields, then create the patient and continue to Upload Reports.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <IntakeField error={errors.name} label="Patient name" value={form.name} onChange={(value) => updateField("name", value)} />
              <IntakeField error={errors.age} label="Age" type="number" value={form.age} onChange={(value) => updateField("age", value)} />
              <IntakeSelect error={errors.gender} label="Gender" value={form.gender} options={["Female", "Male", "Other"]} onChange={(value) => updateField("gender", value)} />
              <IntakeField error={errors.mobile} label="Mobile number" value={form.mobile} onChange={(value) => updateField("mobile", value)} />
              <IntakeField error={errors.referralNumber} label="Referral number" value={form.referralNumber} onChange={(value) => updateField("referralNumber", value)} />
              <IntakeField error={errors.referralHospital} label="Referring hospital" value={form.referralHospital} onChange={(value) => updateField("referralHospital", value)} />
              <IntakeField label="Referring doctor" value={form.referringDoctor} onChange={(value) => updateField("referringDoctor", value)} />
              <IntakeField error={errors.diagnosis} label="Diagnosis" value={form.diagnosis} onChange={(value) => updateField("diagnosis", value)} />
              <IntakeSelect error={errors.requiredIcu} label="Required ICU" value={form.requiredIcu} options={["Medical ICU", "Cardiac ICU", "Neuro ICU", "Surgical ICU", "Pediatric ICU", "Isolation ICU"]} onChange={(value) => updateField("requiredIcu", value)} />
              <IntakeSelect error={errors.priority} label="Priority" value={form.priority} options={["Critical", "Emergency", "Urgent", "Stable"]} onChange={(value) => updateField("priority", value as Priority)} />
              <IntakeField label="Expected arrival time" type="datetime-local" value={form.expectedArrival} onChange={(value) => updateField("expectedArrival", value)} />
            </div>
            {draftSaved ? <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm font-semibold text-success">Draft saved.</p> : null}
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="outline" type="button" onClick={saveDraft}>Save Draft</Button>
              <Button type="button" onClick={submit}>Create Patient & Continue</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IntakeField({
  error,
  label,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <Input className={cn("h-12 rounded-xl text-base", error && "border-danger")} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      {error ? <span className="mt-1 block text-xs font-semibold text-danger">{error}</span> : null}
    </label>
  );
}

function IntakeSelect({
  error,
  label,
  onChange,
  options,
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <select className={cn("h-12 w-full rounded-xl border border-border bg-white px-3 text-base font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/20", error && "border-danger")} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      {error ? <span className="mt-1 block text-xs font-semibold text-danger">{error}</span> : null}
    </label>
  );
}

function PrimaryAction({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <Button className="h-14 w-full text-base" onClick={onClick}>
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );
}

function BarButton({ icon: Icon, label, onClick, variant = "default" }: { icon?: LucideIcon; label: string; onClick: () => void; variant?: "default" | "outline" | "danger" }) {
  return (
    <Button className="h-12 text-sm" variant={variant} onClick={onClick}>
      {Icon ? <Icon className="h-5 w-5" /> : null}
      {label}
    </Button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      <Input className="h-12 rounded-xl text-base" defaultValue={value} />
      <span className="mt-1 block text-[11px] text-success">Auto-saved</span>
    </label>
  );
}

function Counter({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PanelBox({ title, value, tone }: { title: string; value: string; tone: Tone }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{title}</p>
        <Badge tone={tone}>Live</Badge>
      </div>
      <p className="mt-2 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PanelList({ title, items, critical = false }: { title: string; items: string[]; critical?: boolean }) {
  return (
    <div className={cn("rounded-xl border p-3", critical ? "border-critical/30 bg-critical/10" : "border-border bg-white")}>
      <p className={cn("text-xs font-semibold uppercase", critical ? "text-critical" : "text-muted-foreground")}>{title}</p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <p className="text-sm font-medium text-foreground" key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function ModalFrame({ children, onClose, title, wide = false }: { children: React.ReactNode; onClose: () => void; title: string; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className={cn("max-h-[92dvh] w-full overflow-y-auto rounded-2xl border border-border bg-white shadow-2xl", wide ? "max-w-6xl" : "max-w-3xl")}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white p-5">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  confirmLabel,
  message,
  onCancel,
  onConfirm,
  title,
}: {
  confirmLabel: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  return (
    <ModalFrame title={title} onClose={onCancel}>
      <div className="space-y-4">
        <p className="text-sm font-medium leading-6 text-muted-foreground">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </ModalFrame>
  );
}

function PrintMenu({ onClose, onPrint, patient }: { onClose: () => void; onPrint: (label: string) => void; patient: Patient }) {
  const options = [
    "Print Uploaded Document List",
    "Print Referral Summary",
    "Print Patient Labels",
    "Print Temporary Admission Sheet",
    "Print Emergency Summary",
  ];

  return (
    <ModalFrame title="Print" onClose={onClose}>
      <div className="space-y-3">
        <div className="rounded-xl border border-border bg-surface-muted p-3 text-sm font-semibold text-foreground">
          {patient.name} • {patient.referralNo} • {patient.diagnosis}
        </div>
        {options.map((option) => (
          <button className="flex w-full items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-left font-semibold hover:bg-surface-muted" key={option} onClick={() => onPrint(option)} type="button">
            {option}
            <Printer className="h-4 w-4 text-info" />
          </button>
        ))}
      </div>
    </ModalFrame>
  );
}

function ToastStack({ messages, onDismiss }: { messages: ToastMessage[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed right-4 top-20 z-[60] w-full max-w-sm space-y-2">
      {messages.map((message) => (
        <button className="w-full rounded-xl border border-border bg-white p-3 text-left shadow-2xl" key={message.id} onClick={() => onDismiss(message.id)} type="button">
          <div className="flex items-start gap-2">
            <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", message.tone === "success" ? "bg-success" : message.tone === "danger" || message.tone === "critical" ? "bg-danger" : message.tone === "warning" ? "bg-warning" : "bg-info")} />
            <span>
              <span className="block text-sm font-semibold text-foreground">{message.title}</span>
              {message.detail ? <span className="mt-0.5 block text-xs font-medium text-muted-foreground">{message.detail}</span> : null}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function readDocumentDraft(storageKey: string): PatientAdmissionDraft {
  if (typeof window === "undefined") return emptyDraft();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? "");
    return {
      documents: Array.isArray(parsed.documents) ? parsed.documents.map((document: UploadedDocument) => ({ ...document, file: undefined, objectUrl: undefined })) : [],
      selectedCategory: documentCategories.includes(parsed.selectedCategory) || parsed.selectedCategory === "All" ? parsed.selectedCategory : "All",
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      auditLog: Array.isArray(parsed.auditLog) ? parsed.auditLog : [],
      saveStatus: "Saved",
    };
  } catch {
    return emptyDraft();
  }
}

function writeDocumentDraft(storageKey: string, draft: PatientAdmissionDraft) {
  if (typeof window === "undefined") return;
  const serializable = {
    ...draft,
    documents: draft.documents.map((document) => ({
      id: document.id,
      name: document.name,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      category: document.category,
      status: document.status,
      ocrStatus: document.ocrStatus,
      uploadProgress: document.uploadProgress,
      ocrProgress: document.ocrProgress,
      uploadedBy: document.uploadedBy,
      uploadedAt: document.uploadedAt,
      retries: document.retries,
      verified: document.verified,
      error: document.error,
      extractedFields: document.extractedFields,
    })),
    saveStatus: "Saved",
  };
  window.localStorage.setItem(storageKey, JSON.stringify(serializable));
}

function emptyDraft(): PatientAdmissionDraft {
  return { documents: [], selectedCategory: "All", timeline: [], auditLog: [], saveStatus: "Saved" };
}

function validateUploadFile(file: File, safeName: string): { ok: true } | { ok: false; message: string } {
  const mimeType = file.type || inferMimeType(safeName);
  if (!acceptedMimeTypes.has(mimeType)) return { ok: false, message: "unsupported file format" };
  if (file.size > maxFileSizeBytes) return { ok: false, message: "file is larger than 20 MB" };
  if (/\.(exe|sh|bat|cmd|js|msi|app)$/i.test(safeName)) return { ok: false, message: "executable uploads are blocked" };
  return { ok: true };
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-()\s]/g, "_").replace(/\s+/g, " ").trim().slice(0, 140) || `document-${Date.now()}`;
}

function inferMimeType(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

function detectDocumentCategory(name: string): DocumentCategory {
  const lower = name.toLowerCase();
  if (lower.includes("lab") || lower.includes("path") || lower.includes("blood")) return "Lab Reports";
  if (lower.includes("xray") || lower.includes("x-ray") || lower.includes("ct") || lower.includes("mri") || lower.includes("radio")) return "Radiology";
  if (lower.includes("rx") || lower.includes("prescription") || lower.includes("medicine")) return "Prescription";
  if (lower.includes("consent")) return "Consent";
  if (lower.includes("insurance") || lower.includes("tpa") || lower.includes("policy")) return "Insurance";
  if (lower.includes("id") || lower.includes("aadhaar") || lower.includes("identity")) return "Identity";
  if (lower.includes("ref") || lower.includes("letter")) return "Referral Letter";
  return "Others";
}

function updateDocument(documents: UploadedDocument[], documentId: string, update: Partial<UploadedDocument>) {
  return documents.map((document) => document.id === documentId ? { ...document, ...update } : document);
}

function buildUploadProgressStages(documents: UploadedDocument[]) {
  const total = Math.max(1, documents.length);
  const uploaded = documents.filter((document) => document.status === "uploaded").length;
  const ocrRunning = documents.filter((document) => document.ocrStatus === "ocrRunning" || document.ocrStatus === "extracting").length;
  const extracting = documents.filter((document) => document.ocrStatus === "extracting").length;
  const ready = documents.filter((document) => document.ocrStatus === "verificationReady").length;
  const failed = documents.filter((document) => document.status === "failed" || document.ocrStatus === "failed").length;
  const toneFor = (count: number): Tone => failed ? "danger" : count === total && documents.length ? "success" : count ? "info" : "muted";
  return [
    { label: "Uploading", progress: Math.round((uploaded / total) * 100), detail: `${uploaded}/${documents.length} uploaded`, tone: toneFor(uploaded) },
    { label: "OCR Running", progress: Math.round(((ocrRunning + ready) / total) * 100), detail: `${ocrRunning} active`, tone: toneFor(ocrRunning + ready) },
    { label: "Extracting Data", progress: Math.round(((extracting + ready) / total) * 100), detail: `${extracting} extracting`, tone: toneFor(extracting + ready) },
    { label: "Verification Ready", progress: Math.round((ready / total) * 100), detail: `${ready}/${documents.length} ready`, tone: toneFor(ready) },
  ];
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function mockExtractedFields() {
  return [
    { label: "Patient name", value: "Aisha Khan", confidence: 0.97 },
    { label: "Referral hospital", value: "Alfa Trauma Centre", confidence: 0.94 },
    { label: "Diagnosis", value: "Septic shock with ARDS", confidence: 0.91 },
  ];
}

function parseReferralQr(value: string): QRReferralData | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed) as Partial<QRReferralData>;
    if (parsed.referralId && parsed.hospitalName && parsed.token) return parsed as QRReferralData;
  } catch {
    // Fallback to pipe-delimited legacy referral QR format.
  }
  const [referralId, uhid, hospitalName, token] = trimmed.split("|").map((part) => part.trim());
  if (!referralId || !hospitalName || !token) return null;
  return { referralId, uhid, hospitalName, token };
}

function downloadDocument(document: UploadedDocument) {
  if (!document.objectUrl) return;
  const link = window.document.createElement("a");
  link.href = document.objectUrl;
  link.download = document.name;
  link.click();
}

function printAdmissionDocument(label: string, patient: Patient, documents: UploadedDocument[]) {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head><title>${label}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827} h1{font-size:22px} table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #d1d5db;padding:8px;text-align:left}.badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#fee2e2;color:#991b1b;font-weight:700}</style></head>
      <body>
        <h1>${label}</h1>
        <p><strong>${patient.name}</strong> • ${patient.uhid} • ${patient.age}Y ${patient.gender}</p>
        <p class="badge">${patient.priority}</p>
        <table>
          <tr><th>Referral No</th><td>${patient.referralNo}</td><th>Hospital</th><td>${patient.hospital}</td></tr>
          <tr><th>Diagnosis</th><td>${patient.diagnosis}</td><th>Arrival</th><td>${patient.arrival}</td></tr>
          <tr><th>ICU</th><td>${patient.icu}</td><th>Bed</th><td>${patient.bed}</td></tr>
          <tr><th>Doctor</th><td>${patient.doctor}</td><th>Nurse</th><td>${patient.nurse}</td></tr>
        </table>
        <h2>Documents</h2>
        <ul>${documents.map((document) => `<li>${document.name} - ${document.category} - ${document.ocrStatus}</li>`).join("") || "<li>No documents attached to this print packet.</li>"}</ul>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

async function uploadReferralDocument(documentId: string) {
  await sleep(120);
  return { documentId, signedUploadUrl: `/api/uploads/${documentId}` };
}

async function startDocumentOCR(documentId: string) {
  await sleep(120);
  return { jobId: `ocr-${documentId}` };
}

async function fetchReferralDetails(data: QRReferralData) {
  await sleep(150);
  return data;
}

async function sendReceptionNotification(payload: { action: string; patient: Patient }) {
  await sleep(220);
  return { id: createId("notification"), delivered: true, ...payload };
}

function updateDocumentCategory(documentId: string, category: DocumentCategory) {
  return { documentId, category };
}

async function deleteDocument(documentId: string) {
  await sleep(120);
  return { documentId, deleted: true };
}

function createMobileUploadSession(patient: Patient) {
  const token = createId("mobile");
  return {
    token,
    link: `${window.location.origin}/mobile/reception-upload?token=${token}&ref=${encodeURIComponent(patient.referralNo)}`,
  };
}

function refreshMobileUploadSession(patient: Patient) {
  return createMobileUploadSession(patient);
}

function cancelMobileUploadSession(token: string) {
  return { token, revoked: true };
}

function buildNewPatientDraft(arrivalType: ArrivalType): NewPatientIntakeForm {
  const emergencyPriority: Priority = arrivalType === "Ambulance" || arrivalType === "Walk-in Emergency" ? "Emergency" : "Urgent";
  return {
    arrivalType,
    name: "",
    age: "",
    gender: "Female",
    mobile: "",
    referralNumber: generateReferralId(),
    referralHospital: arrivalType === "Internal Transfer" ? "Internal Hospital Transfer" : "",
    referringDoctor: "",
    diagnosis: "",
    requiredIcu: arrivalType === "Ambulance" ? "Medical ICU" : "Medical ICU",
    priority: emergencyPriority,
    expectedArrival: "",
  };
}

function validateNewPatientForm(form: NewPatientIntakeForm) {
  const errors: Partial<Record<keyof NewPatientIntakeForm, string>> = {};
  if (!form.name.trim()) errors.name = "Patient name is required.";
  if (!form.age.trim()) {
    errors.age = "Age is required.";
  } else if (!Number.isFinite(Number(form.age)) || Number(form.age) <= 0 || Number(form.age) > 120) {
    errors.age = "Enter a valid age.";
  }
  if (!form.gender) errors.gender = "Gender is required.";
  if (!form.mobile.trim()) {
    errors.mobile = "Mobile number is required.";
  } else if (!/^[0-9+\-\s]{8,15}$/.test(form.mobile.trim())) {
    errors.mobile = "Enter a valid mobile number.";
  }
  if (!form.referralNumber.trim()) errors.referralNumber = "Referral number is required.";
  if (!form.referralHospital.trim()) errors.referralHospital = "Referring hospital is required.";
  if (!form.diagnosis.trim()) errors.diagnosis = "Diagnosis is required.";
  if (!form.requiredIcu) errors.requiredIcu = "Required ICU is required.";
  if (!form.priority) errors.priority = "Priority is required.";
  return errors;
}

function arrivalTypeLabel(arrivalType: ArrivalType) {
  const labels: Record<ArrivalType, string> = {
    "Referral from Another Hospital": "Referral from another hospital",
    Ambulance: "Ambulance arrival",
    "Walk-in Emergency": "Walk-in emergency",
    "Internal Transfer": "Internal hospital transfer",
    "Scheduled ICU Admission": "Scheduled ICU admission",
  };
  return labels[arrivalType];
}

function generateReferralId() {
  return `REF-${new Date().getFullYear().toString().slice(2)}${Math.floor(10000 + Math.random() * 90000)}`;
}

function getStep(stepId: StepId) {
  return workflowSteps.find((step) => step.id === stepId) ?? workflowSteps[0];
}

function getStepIndex(stepId: StepId) {
  return workflowSteps.findIndex((step) => step.id === stepId);
}
