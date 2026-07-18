"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ambulance,
  BedDouble,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  IdCard,
  Phone,
  Printer,
  QrCode,
  ReceiptText,
  ShieldAlert,
  Stethoscope,
  UploadCloud,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { billingSnapshot, handoverItems, receptionStats, workQueues } from "./dashboard.data";

type Tone = NonNullable<BadgeProps["tone"]>;
type Priority = "Critical" | "Emergency" | "Urgent" | "Stable";
type ArrivalType =
  | "Referral from Another Hospital"
  | "Ambulance"
  | "Walk-in Emergency"
  | "Internal Transfer"
  | "Scheduled ICU Admission";
type StepId =
  | "upload"
  | "ocr"
  | "verify"
  | "register"
  | "duplicate"
  | "bed"
  | "doctor"
  | "nurse"
  | "wristband"
  | "print"
  | "transfer"
  | "complete";

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
  duplicateFound?: boolean;
  completed?: boolean;
};

const workflowSteps: WorkflowStep[] = [
  { id: "upload", label: "Upload Reports", actionLabel: "Upload Reports", icon: UploadCloud },
  { id: "ocr", label: "OCR Extract", actionLabel: "Run OCR Extraction", icon: FileText },
  { id: "verify", label: "Verify OCR", actionLabel: "Confirm Extracted Data", icon: FileCheck2 },
  { id: "register", label: "Register", actionLabel: "Register Patient", icon: IdCard },
  {
    id: "duplicate",
    label: "Duplicate Check",
    actionLabel: "Continue Existing Admission",
    icon: ShieldAlert,
  },
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
  {
    id: "MICU-03",
    unit: "MICU",
    status: "Available",
    meta: "Ventilator, oxygen, monitor",
    nurse: "Priya",
    distance: "12 m",
    isolation: "No",
  },
  {
    id: "MICU-04",
    unit: "MICU",
    status: "Cleaning",
    meta: "Ready in 20 min",
    nurse: "Priya",
    distance: "15 m",
    isolation: "Yes",
  },
  {
    id: "SICU-01",
    unit: "SICU",
    status: "Reserved",
    meta: "Surgery hold",
    nurse: "Ritu",
    distance: "24 m",
    isolation: "No",
  },
  {
    id: "CCU-02",
    unit: "CCU",
    status: "Available",
    meta: "Cardiac monitor ready",
    nurse: "Sneha",
    distance: "9 m",
    isolation: "No",
  },
  {
    id: "NICU-04",
    unit: "NICU",
    status: "Occupied",
    meta: "Patient admitted",
    nurse: "Ritu",
    distance: "19 m",
    isolation: "No",
  },
  {
    id: "PICU-06",
    unit: "PICU",
    status: "Available",
    meta: "Pediatric oxygen ready",
    nurse: "Anjali",
    distance: "17 m",
    isolation: "No",
  },
  {
    id: "ISO-02",
    unit: "Isolation ICU",
    status: "Available",
    meta: "Negative pressure",
    nurse: "Priya",
    distance: "28 m",
    isolation: "Yes",
  },
];

const doctors = [
  {
    name: "Dr. Arvind Rao",
    unit: "Medical ICU",
    status: "Available",
    workload: "5 ICU patients",
    response: "3 min",
  },
  {
    name: "Dr. Nisha Kapoor",
    unit: "Cardiac ICU",
    status: "Available",
    workload: "4 ICU patients",
    response: "5 min",
  },
  {
    name: "Dr. Sana Sheikh",
    unit: "Neuro ICU",
    status: "Busy",
    workload: "8 ICU patients",
    response: "14 min",
  },
  {
    name: "Dr. Pooja Iyer",
    unit: "Pediatric ICU",
    status: "Available",
    workload: "3 ICU patients",
    response: "4 min",
  },
];

const nurses = [
  {
    name: "Priya Nair",
    unit: "Medical ICU",
    status: "Available",
    workload: "2 patients",
    response: "At station",
  },
  {
    name: "Sneha Patel",
    unit: "Cardiac ICU",
    status: "Available",
    workload: "2 patients",
    response: "2 min",
  },
  {
    name: "Ritu Sharma",
    unit: "Neuro ICU",
    status: "Busy",
    workload: "4 patients",
    response: "12 min",
  },
  {
    name: "Anjali Rao",
    unit: "Pediatric ICU",
    status: "Available",
    workload: "1 patient",
    response: "4 min",
  },
];

const arrivalTypes: ArrivalType[] = [
  "Referral from Another Hospital",
  "Ambulance",
  "Walk-in Emergency",
  "Internal Transfer",
  "Scheduled ICU Admission",
];

export function ReceptionistDashboardPage() {
  const [patients, setPatients] = useState(initialPatients);
  const [selectedPatientId, setSelectedPatientId] = useState(initialPatients[0].id);
  const [search, _setSearch] = useState("");
  const [_showMoreDetails, setShowMoreDetails] = useState(false);
  const [_arrivalModalOpen, setArrivalModalOpen] = useState(false);
  const [_emergencyOpen, setEmergencyOpen] = useState(false);
  const [_lastActivity, setLastActivity] = useState("Queue auto-refreshed");

  const activePatients = patients.filter((patient) => !patient.completed);
  const selectedPatient =
    patients.find((patient) => patient.id === selectedPatientId) ??
    activePatients[0] ??
    patients[0];
  const activeStep = selectedPatient.currentStep;
  const activeStepIndex = getStepIndex(activeStep);
  const currentStep = getStep(activeStep);
  const nextPatient = activePatients.find((patient) => patient.id !== selectedPatient.id) ?? null;
  const _completedToday = patients.filter((patient) => patient.completed).length;

  const _visibleQueue = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query) {
      return patients.filter((patient) =>
        [patient.name, patient.mobile, patient.referralNo, patient.hospital].some((value) =>
          value.toLowerCase().includes(query),
        ),
      );
    }
    return [selectedPatient, nextPatient].filter(Boolean) as Patient[];
  }, [nextPatient, patients, search, selectedPatient]);

  function updateSelectedPatient(update: Partial<Patient>) {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === selectedPatient.id ? { ...patient, ...update } : patient,
      ),
    );
  }

  function moveToStep(stepId: StepId) {
    updateSelectedPatient({ currentStep: stepId });
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
    setLastActivity(`${currentStep.actionLabel} completed`);

    if (completed) {
      const nextOpenPatient = activePatients.find((patient) => patient.id !== selectedPatient.id);
      if (nextOpenPatient) setSelectedPatientId(nextOpenPatient.id);
    }
  }

  function _createPatient(arrivalType: ArrivalType) {
    const newPatient: Patient = {
      id: `REF-${Math.floor(30000 + Math.random() * 50000)}`,
      uhid: "Auto-generating",
      name: "New ICU Patient",
      age: "",
      gender: "",
      bloodGroup: "",
      priority:
        arrivalType === "Walk-in Emergency" || arrivalType === "Ambulance" ? "Emergency" : "Urgent",
      arrivalType,
      hospital: arrivalType === "Internal Transfer" ? "Internal Ward" : "",
      arrival: "Now",
      diagnosis: "Pending OCR",
      icu: "Pending",
      bed: "Not assigned",
      doctor: "Not assigned",
      nurse: "Not assigned",
      currentStep: "upload",
      mobile: "",
      referralNo: "Pending",
      timer: "0m",
      emergencyStatus: "Workflow started",
    };
    setPatients((current) => [newPatient, ...current]);
    setSelectedPatientId(newPatient.id);
    setArrivalModalOpen(false);
    setLastActivity(`${arrivalType} started`);
  }

  function _previousStep() {
    const previous = workflowSteps[Math.max(0, activeStepIndex - 1)]?.id ?? "upload";
    moveToStep(previous);
  }

  function nextStep() {
    completeCurrentStep();
  }

  function saveDraft() {
    setLastActivity("Draft auto-saved just now");
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
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Badge tone="info">Receptionist Role</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Front Office Dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Registration, appointments, OPD queue, admission reception, and billing collection in
            one role workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/receptionist/billing">
              <CreditCard className="h-4 w-4" />
              Billing Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/patients/register">
              <IdCard className="h-4 w-4" />
              Register Patient
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {receptionStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {stat.label}
                </p>
                <Badge tone={stat.tone}>{stat.meta}</Badge>
              </div>
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Billing Dashboard</CardTitle>
              <CardDescription>Reception billing status and collection queues</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/receptionist/billing">
                <ReceiptText className="h-4 w-4" />
                Open Billing
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {billingSnapshot.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-surface-muted p-4"
              >
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {item.label}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{item.amount}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Front Desk Queues</CardTitle>
              <CardDescription>Role shortcuts for daily reception work</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {workQueues.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                  href={item.route}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div>
            <Badge tone="info">Guided ICU Admission Assistant</Badge>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              What is the next action?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload first. OCR fills details. The next patient opens automatically after
              completion.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {handoverItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted-foreground"
            >
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PatientBanner({ patient, onNewPatient }: { patient: Patient; onNewPatient: () => void }) {
  return (
    <section className="sticky top-16 z-30 rounded-xl border border-border bg-white p-3 shadow-soft">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-muted text-base font-bold text-info">
            {patient.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          <div className="min-w-[180px]">
            <p className="truncate text-lg font-semibold text-foreground">{patient.name}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {patient.uhid} - {patient.age}Y {patient.gender}
            </p>
          </div>
          <Badge tone={priorityTone[patient.priority]}>{patient.priority}</Badge>
          <CommandChip label="Step" value={getStep(patient.currentStep).label} />
          <CommandChip label="ICU" value={patient.icu} />
          <CommandChip label="Bed" value={patient.bed} />
          <CommandChip label="Doctor" value={patient.doctor} />
          <CommandChip label="Hospital" value={patient.hospital} />
          <CommandChip label="Arrival" value={patient.arrivalType} />
          <Badge tone={patient.priority === "Critical" ? "critical" : "warning"}>
            {patient.emergencyStatus}
          </Badge>
          <Badge tone="warning">Timer {patient.timer}</Badge>
        </div>
        <Button className="h-11" onClick={onNewPatient}>
          <IdCard className="h-4 w-4" />
          New Patient
        </Button>
      </div>
    </section>
  );
}

function CommandChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted px-3 py-2">
      <p className="text-[10px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="max-w-[150px] truncate text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function WorkflowProgress({
  activeStep,
  onStepSelect,
}: {
  activeStep: StepId;
  onStepSelect: (_step: StepId) => void;
}) {
  return <ICUAdmissionStepScroller activeStep={activeStep} onStepSelect={onStepSelect} />;
}

function ICUAdmissionStepScroller({
  activeStep,
  onStepSelect,
}: {
  activeStep: StepId;
  onStepSelect: (_step: StepId) => void;
}) {
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
    <section className="sticky top-[128px] z-20 rounded-xl border border-border bg-white/95 px-3 py-3 shadow-soft backdrop-blur">
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
            const status = current
              ? "Current"
              : completed
                ? "Completed"
                : blocked
                  ? "Blocked"
                  : next
                    ? "Next"
                    : "Pending";

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
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    current
                      ? "border-info text-info"
                      : completed
                        ? "border-success text-success"
                        : blocked
                          ? "border-border text-muted-foreground"
                          : "border-border text-foreground",
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : blocked ? (
                    <ShieldAlert className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block whitespace-nowrap text-sm font-semibold text-foreground">
                    {index + 1}. {step.label}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block text-xs font-medium",
                      current
                        ? "text-info"
                        : completed
                          ? "text-success"
                          : blocked
                            ? "text-muted-foreground"
                            : "text-muted-foreground",
                    )}
                  >
                    {status}
                  </span>
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
  selectedPatientId,
  waitingCount,
  onSelect,
}: {
  completedToday: number;
  olderCount: number;
  patients: Patient[];
  selectedPatientId: string;
  waitingCount: number;
  onSelect: (_id: string) => void;
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
              <CompactPatientRow
                key={patient.id}
                patient={patient}
                onSelect={() => onSelect(patient.id)}
              />
            ))}
          </>
        ) : null}
        {olderCount > 0 ? (
          <div className="rounded-xl border border-border bg-surface-muted p-3 text-center text-sm font-semibold text-muted-foreground">
            {olderCount} older patients collapsed
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function QueueSectionLabel({ label }: { label: string }) {
  return (
    <p className="pt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
  );
}

function CompactPatientRow({ patient, onSelect }: { patient: Patient; onSelect: () => void }) {
  return (
    <button
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-white px-3 py-2 text-left hover:bg-surface-muted"
      onClick={onSelect}
      type="button"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{patient.name}</p>
        <p className="truncate text-xs text-muted-foreground">{patient.hospital}</p>
      </div>
      <Badge tone={priorityTone[patient.priority]}>{getStep(patient.currentStep).label}</Badge>
    </button>
  );
}

function PatientCard({
  current,
  patient,
  selected,
  onSelect,
}: {
  current: boolean;
  patient: Patient;
  selected: boolean;
  onSelect: () => void;
}) {
  const step = getStep(patient.currentStep);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 transition",
        selected ? "border-info bg-info/5 ring-2 ring-info/10" : "border-border",
      )}
    >
      <button className="w-full text-left" onClick={onSelect} type="button">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-muted text-lg font-bold text-info">
            {patient.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xl font-semibold text-foreground">{patient.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {patient.age}Y {patient.gender}
                </p>
              </div>
              <Badge
                className={patient.priority === "Critical" ? "px-3 py-1 text-xs" : undefined}
                tone={priorityTone[patient.priority]}
              >
                {patient.priority}
              </Badge>
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
  onShowMoreDetails,
}: {
  patient: Patient;
  step: StepId;
  showMoreDetails: boolean;
  onComplete: (_update?: Partial<Patient>) => void;
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
        {step === "upload" ? <UploadTask onComplete={onComplete} /> : null}
        {step === "ocr" ? <OcrTask onComplete={onComplete} /> : null}
        {step === "verify" ? <VerifyTask patient={patient} onComplete={onComplete} /> : null}
        {step === "register" ? (
          <RegisterTask
            patient={patient}
            showMoreDetails={showMoreDetails}
            onComplete={onComplete}
            onShowMoreDetails={onShowMoreDetails}
          />
        ) : null}
        {step === "duplicate" ? <DuplicateTask patient={patient} onComplete={onComplete} /> : null}
        {step === "bed" ? <BedTask onComplete={onComplete} /> : null}
        {step === "doctor" ? <DoctorTask onComplete={onComplete} /> : null}
        {step === "nurse" ? <NurseTask onComplete={onComplete} /> : null}
        {step === "wristband" ? <WristbandTask patient={patient} onComplete={onComplete} /> : null}
        {step === "print" ? <PrintSlipTask patient={patient} onComplete={onComplete} /> : null}
        {step === "transfer" ? <TransferTask patient={patient} onComplete={onComplete} /> : null}
        {step === "complete" ? <CompleteTask patient={patient} onComplete={onComplete} /> : null}
      </CardContent>
    </Card>
  );
}

function UploadTask({ onComplete }: { onComplete: () => void }) {
  const progress = ["Uploading", "OCR Running", "Extracting Data", "Verification Ready"];
  const folders = [
    "Referral Letter",
    "Lab Reports",
    "Radiology",
    "Prescription",
    "Consent",
    "Insurance",
    "Identity",
    "Others",
  ];

  return (
    <div className="space-y-4">
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-info/40 bg-info/5 p-6 text-center">
        <UploadCloud className="h-14 w-14 text-info" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Drop referral documents</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          PDF, images, Word, scanned reports. OCR starts immediately.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-5">
          <Button className="h-12" onClick={onComplete}>
            <UploadCloud className="h-5 w-5" />
            Browse
          </Button>
          <Button className="h-12" variant="outline" onClick={onComplete}>
            <Camera className="h-5 w-5" />
            Camera
          </Button>
          <Button className="h-12" variant="outline" onClick={onComplete}>
            <QrCode className="h-5 w-5" />
            QR
          </Button>
          <Button className="h-12" variant="outline" onClick={onComplete}>
            Mobile
          </Button>
          <Button className="h-12" variant="outline" onClick={onComplete}>
            Bulk
          </Button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {progress.map((item, index) => (
          <div className="rounded-xl border border-border bg-white p-3" key={item}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">{item}</p>
              <span className={cn("h-2 w-2 rounded-full", index < 3 ? "bg-info" : "bg-success")} />
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  index < 3 ? "w-2/3 bg-info" : "w-full bg-success",
                )}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="text-sm font-semibold text-foreground">Auto-created document folders</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {folders.map((folder) => (
            <div
              className="rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-foreground"
              key={folder}
            >
              {folder}
            </div>
          ))}
        </div>
      </div>
      <PrimaryAction icon={UploadCloud} label="Upload Reports" onClick={onComplete} />
    </div>
  );
}

function OcrTask({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
        <FileText className="mx-auto h-12 w-12 text-success" />
        <p className="mt-4 text-2xl font-semibold text-foreground">OCR extraction finished</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Patient details, labs, vitals, diagnosis, insurance, medication extracted.
        </p>
        <Badge className="mt-4" tone="success">
          94% confidence
        </Badge>
      </div>
      <PrimaryAction icon={FileText} label="Run OCR Extraction" onClick={onComplete} />
    </div>
  );
}

function VerifyTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
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
              <div
                className={cn(
                  "rounded-xl border p-3",
                  tone === "success" && "border-success/30 bg-success/10",
                  tone === "warning" && "border-warning/40 bg-warning/10",
                  tone === "danger" && "border-danger/40 bg-danger/10",
                )}
                key={label}
              >
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
        <Button
          className="h-12"
          variant="outline"
          onClick={() => window.alert("Extracted fields are ready for inline editing.")}
        >
          Edit
        </Button>
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
  onComplete: (_update?: Partial<Patient>) => void;
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

function DuplicateTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
  const duplicate = patient.duplicateFound;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-2xl border p-5",
          duplicate ? "border-warning/40 bg-warning/10" : "border-success/30 bg-success/10",
        )}
      >
        <p className="text-xl font-semibold text-foreground">
          {duplicate ? "Existing Patient Found" : "No Duplicate Found"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Checked UHID, mobile, government ID, patient name, and date of birth.
        </p>
      </div>
      {duplicate ? (
        <div className="grid gap-2 md:grid-cols-3">
          <Button
            className="h-12"
            variant="outline"
            onClick={() => window.alert("Opening existing patient history.")}
          >
            View History
          </Button>
          <Button className="h-12" onClick={onComplete}>
            Continue Existing Admission
          </Button>
          <Button className="h-12" variant="outline" onClick={onComplete}>
            Create New Patient
          </Button>
        </div>
      ) : (
        <PrimaryAction
          icon={ShieldAlert}
          label="Continue Existing Admission"
          onClick={onComplete}
        />
      )}
    </div>
  );
}

function BedTask({ onComplete }: { onComplete: (_update?: Partial<Patient>) => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-foreground">Recommended: MICU-03</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reason: ventilator available, monitor ready, closest nurse station, compatible ICU.
            </p>
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
              onClick={() =>
                available
                  ? onComplete({ bed: bed.id })
                  : window.alert(
                      `${bed.id} is ${bed.status}. Choose an available green bed or override with supervisor approval.`,
                    )
              }
              type="button"
            >
              <div className="flex items-center justify-between">
                <p className="text-2xl font-semibold text-foreground">{bed.id}</p>
                <Badge
                  tone={available ? "success" : cleaning ? "warning" : reserved ? "info" : "danger"}
                >
                  {bed.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{bed.unit}</p>
              <p className="mt-1 text-sm text-muted-foreground">{bed.meta}</p>
              <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                <span>Ventilator: {bed.meta.includes("Ventilator") ? "Yes" : "No"}</span>
                <span>
                  Monitor:{" "}
                  {bed.meta.includes("monitor") || bed.meta.includes("Cardiac") ? "Yes" : "No"}
                </span>
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

function DoctorTask({ onComplete }: { onComplete: (_update?: Partial<Patient>) => void }) {
  return (
    <StaffTask
      items={doctors}
      label="Assign Doctor"
      onComplete={(name) => onComplete({ doctor: name })}
    />
  );
}

function NurseTask({ onComplete }: { onComplete: (_update?: Partial<Patient>) => void }) {
  return (
    <StaffTask
      items={nurses}
      label="Assign Nurse"
      onComplete={(name) => onComplete({ nurse: name })}
    />
  );
}

function StaffTask({
  items,
  label,
  onComplete,
}: {
  items: Array<{ name: string; unit: string; status: string; workload: string; response: string }>;
  label: string;
  onComplete: (_name: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-4">
        <p className="font-semibold text-foreground">
          Recommended: {items.find((item) => item.status === "Available")?.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Recommended by availability, workload, response time, and ICU match.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const available = item.status === "Available";
          return (
            <button
              className={cn(
                "min-h-[120px] rounded-2xl border p-4 text-left transition hover:shadow-soft disabled:cursor-not-allowed",
                available
                  ? "border-success/40 bg-success/10"
                  : "border-warning/40 bg-warning/10 opacity-80",
              )}
              key={item.name}
              onClick={() =>
                available
                  ? onComplete(item.name)
                  : window.alert(
                      `${item.name} is currently busy. Select an available staff member or request supervisor override.`,
                    )
              }
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
              <p className="mt-3 text-sm font-semibold text-info">
                {available ? label : "Unavailable now"}
              </p>
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
        <p className="mt-4 text-2xl font-semibold text-foreground">
          Wristband, QR sticker, and labels ready
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {patient.name} - {patient.referralNo}
        </p>
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
        <p className="mt-1 text-sm text-muted-foreground">
          {patient.name} - {patient.referralNo}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {["Admission Form", "Bed Allocation Slip", "Referral Receipt", "Patient Labels"].map(
            (item) => (
              <SummaryRow key={item} label={item} value="Ready to print / PDF" />
            ),
          )}
        </div>
      </div>
      <PrimaryAction
        icon={Printer}
        label="Print Admission Slip"
        onClick={() => {
          window.print();
          onComplete();
        }}
      />
    </div>
  );
}

function TransferTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-info/30 bg-info/10 p-6 text-center">
        <Ambulance className="mx-auto h-12 w-12 text-info" />
        <p className="mt-4 text-2xl font-semibold text-foreground">Transfer to ICU</p>
        <p className="mt-2 text-sm text-muted-foreground">
          ICU notified automatically for {patient.bed}.
        </p>
      </div>
      <PrimaryAction icon={Ambulance} label="Start ICU Transfer" onClick={onComplete} />
    </div>
  );
}

function CompleteTask({ patient, onComplete }: { patient: Patient; onComplete: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-8 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <p className="mt-4 text-3xl font-semibold text-foreground">
          Admission Completed Successfully
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {patient.name} is ready for ICU transfer.
        </p>
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
        <Button
          className="h-12"
          variant="outline"
          onClick={() => window.alert("ICU transfer started and team notified.")}
        >
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
}: {
  patient: Patient;
  activeStepIndex: number;
  lastActivity: string;
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
  const timeline = [
    "Patient Arrived",
    "Report Uploaded",
    "OCR Completed",
    "Registration",
    "Bed Assigned",
    "Doctor Assigned",
    "Transfer Started",
    "Admission Completed",
  ];

  return (
    <Card className="h-fit">
      <CardHeader>
        <div>
          <CardTitle>Guidance</CardTitle>
          <CardDescription>Only what matters now</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <PanelBox
          title="Current Task"
          value={getStep(patient.currentStep).actionLabel}
          tone="info"
        />
        <PanelBox title="Next Step" value={nextStep} tone="muted" />
        <PanelBox
          title="Estimated Time Remaining"
          value={`${estimatedMinutes} min`}
          tone="warning"
        />
        {patient.priority === "Critical" ? <CriticalModeActions /> : null}
        <PanelList
          title="Remaining Tasks"
          items={remainingTasks.length ? remainingTasks : ["None"]}
        />
        <PanelList
          critical
          title="Critical Alerts"
          items={alerts.length ? alerts : ["No critical alerts"]}
        />
        <PanelBox title="Recent Activity" value={lastActivity} tone="success" />
        <div className="rounded-xl border border-border bg-surface-muted p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Live Timeline</p>
          <div className="mt-3 space-y-2">
            {timeline.slice(0, 6).map((item, index) => (
              <div className="flex gap-2" key={item}>
                <span
                  className={cn(
                    "mt-1 h-2 w-2 rounded-full",
                    index <= activeStepIndex ? "bg-info" : "bg-muted",
                  )}
                />
                <span className="text-sm font-medium text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Checklist</p>
          <div className="mt-3 space-y-2">
            {[
              "Registration",
              "Reports",
              "OCR",
              "Bed",
              "Doctor",
              "Nurse",
              "Insurance",
              "Consent",
              "Wristband",
              "Print",
              "Transfer",
              "Completed",
            ]
              .slice(0, 8)
              .map((item, index) => (
                <div className="flex items-center justify-between" key={item}>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      index <= activeStepIndex ? "text-success" : "text-muted-foreground",
                    )}
                  >
                    {index <= activeStepIndex ? "✓" : "○"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CriticalModeActions() {
  const actions = ["Notify ICU", "Notify Doctor", "Notify Nurse", "Reserve Bed", "Emergency Print"];

  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-danger">
        <AlertTriangle className="h-4 w-4" />
        Emergency Mode
      </p>
      <div className="mt-3 grid gap-2">
        {actions.map((action) => (
          <Button
            className="h-11 justify-start"
            key={action}
            variant="danger"
            onClick={() => window.alert(`${action} sent.`)}
          >
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
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Enter = next step | Tab = next field | Ctrl+S = save | Ctrl+P = print | Esc = cancel
      </p>
    </div>
  );
}

function EmergencyButton({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const actions = [
    "Call ICU",
    "Call Doctor",
    "Call Nurse",
    "Call Ambulance",
    "Code Blue",
    "Emergency Transfer",
  ];

  return (
    <div className="fixed bottom-28 right-6 z-40 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[250px] rounded-2xl border border-danger/30 bg-white p-2 shadow-2xl">
          {actions.map((action) => (
            <button
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-danger/10"
              key={action}
              onClick={() => window.alert(`${action} sent.`)}
              type="button"
            >
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

function ArrivalTypeModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (_arrivalType: ArrivalType) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Patient arrival</p>
            <h2 className="text-xl font-semibold text-foreground">How did the patient arrive?</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2">
          {arrivalTypes.map((item) => (
            <button
              className="min-h-[92px] rounded-2xl border border-border bg-white p-4 text-left transition hover:bg-info/5 hover:ring-2 hover:ring-info/10"
              key={item}
              onClick={() => onSelect(item)}
              type="button"
            >
              <p className="font-semibold text-foreground">{item}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Workflow starts at Upload Referral Documents
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrimaryAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button className="h-14 w-full text-base" onClick={onClick}>
      <Icon className="h-5 w-5" />
      {label}
    </Button>
  );
}

function BarButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "danger";
}) {
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
      <span className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </span>
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

function PanelList({
  title,
  items,
  critical = false,
}: {
  title: string;
  items: string[];
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        critical ? "border-critical/30 bg-critical/10" : "border-border bg-white",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase",
          critical ? "text-critical" : "text-muted-foreground",
        )}
      >
        {title}
      </p>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <p className="text-sm font-medium text-foreground" key={item}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function getStep(stepId: StepId) {
  return workflowSteps.find((step) => step.id === stepId) ?? workflowSteps[0];
}

function getStepIndex(stepId: StepId) {
  return workflowSteps.findIndex((step) => step.id === stepId);
}
