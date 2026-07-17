"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRightLeft,
  BedDouble,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  FileText,
  FlaskConical,
  HeartPulse,
  MessageSquareText,
  Pill,
  RadioTower,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  handoverSteps,
  icuAlerts,
  icuMeds,
  icuPatients,
  icuTasks,
  journeyEvents,
  type IcuPatient,
  type IcuTask,
} from "@/features/care-team/icu-nursing/icu-nursing-data";
import { AdministrationTimeline } from "@/features/care-team/nurse-drug-administration/administration-timeline";
import {
  defaultAdministrationDetail,
  defaultFluidDetail,
  nurseDrugOrders,
} from "@/features/care-team/nurse-drug-administration/data";
import {
  AdministrationDetailsPanel,
  FluidAdministrationDetailsPanel,
} from "@/features/care-team/nurse-drug-administration/detail-panels";
import { DrugOrderReviewTab } from "@/features/care-team/nurse-drug-administration/order-review";
import { NurseMedicationPatientSummary } from "@/features/care-team/nurse-drug-administration/patient-summary";
import type {
  AdministrationCell,
  AdministrationDetail,
  FluidAdministrationDetail,
  NurseDrugOrder,
} from "@/features/care-team/nurse-drug-administration/types";

type IcuNursingModule =
  | "station"
  | "patients"
  | "medications"
  | "tasks"
  | "handover"
  | "family"
  | "journey"
  | "transfer-discharge"
  | "emergency";

const moduleMeta: Record<IcuNursingModule, { title: string; description: string }> = {
  station: {
    title: "Nurse Station",
    description:
      "ICU command workspace for admissions, assigned patients, STAT work, medications, assessments, and shift risk.",
  },
  patients: {
    title: "Assigned Patients",
    description:
      "Critical-first ICU patient cards with vitals, scores, devices, escalation, and care actions.",
  },
  medications: {
    title: "Medication Administration",
    description:
      "Nurse medication workflow from doctor order to pharmacy verification and bedside administration.",
  },
  tasks: {
    title: "Clinical Tasks",
    description: "STAT orders, nursing tasks, assessment due items, and active priority tracking.",
  },
  handover: {
    title: "Shift Handover",
    description:
      "Structured responsibility transfer with compliance, risk analysis, verification, and acceptance.",
  },
  family: {
    title: "Family Communication",
    description:
      "Counselling history, consent tracking, family updates, and collaborative care plan goals.",
  },
  journey: {
    title: "Patient Journey",
    description:
      "Chronological ICU timeline for admission, orders, lab, radiology, transfusion, handover, transfer, and discharge.",
  },
  "transfer-discharge": {
    title: "Transfer & Discharge",
    description:
      "Doctor approval, nursing checklist, clearances, destination selection, and final handoff verification.",
  },
  emergency: {
    title: "Emergency Center",
    description:
      "Code blue, rapid response, critical lab, sepsis alert, emergency medication, and active event controls.",
  },
};

export function IcuNursingPage({ module = "station" }: { module?: IcuNursingModule }) {
  const meta = moduleMeta[module];

  return (
    <div className="space-y-5 py-4">
      <header className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-[#edf8ff] to-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            ICU Nursing Management
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">{meta.title}</h1>
          <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-muted-foreground">
            {meta.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="info">Unit 4A</Badge>
          <Badge tone="success">RN Sarah Jenkins</Badge>
          <Badge tone="warning">Shift ends in 05:14</Badge>
        </div>
      </header>

      {module === "station" ? <NurseStation /> : null}
      {module === "patients" ? <AssignedPatients /> : null}
      {module === "medications" ? <MedicationAdministration /> : null}
      {module === "tasks" ? <ClinicalTasks /> : null}
      {module === "handover" ? <ShiftHandover /> : null}
      {module === "family" ? <FamilyCommunication /> : null}
      {module === "journey" ? <PatientJourney /> : null}
      {module === "transfer-discharge" ? <TransferDischarge /> : null}
      {module === "emergency" ? <EmergencyCenter /> : null}
    </div>
  );
}

function NurseStation() {
  const critical = icuPatients.filter((patient) => patient.critical).length;
  const dueMeds = icuMeds.filter((med) => med.status !== "Completed").length;
  const pendingTasks = icuTasks.filter((task) => task.status !== "Completed").length;

  return (
    <>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BedDouble} label="New ICU admissions" value="2" tone="info" />
        <Metric icon={Users} label="Assigned patients" value={icuPatients.length} tone="info" />
        <Metric icon={ShieldAlert} label="Critical patients" value={critical} tone="danger" />
        <Metric icon={Pill} label="Medications due" value={dueMeds} tone="warning" />
        <Metric icon={ClipboardCheck} label="Assessments due" value="5" tone="warning" />
        <Metric icon={AlertTriangle} label="STAT orders" value="3" tone="critical" />
        <Metric icon={HeartPulse} label="Shift remaining" value="05:14" tone="info" />
        <Metric icon={Bell} label="Critical alerts" value={icuAlerts.length} tone="danger" />
      </section>
      <QuickActions />
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Critical-first patient snapshot</CardTitle>
              <CardDescription>
                Nurse-relevant state only. Critical patients are automatically sorted first.
              </CardDescription>
            </div>
            <Badge tone="danger">{critical} critical</Badge>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {sortPatients(icuPatients)
              .slice(0, 4)
              .map((patient) => (
                <PatientCard key={patient.id} patient={patient} compact />
              ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Critical alerts</CardTitle>
              <CardDescription>Lab, sepsis, escalation, and emergency triggers.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {icuAlerts.map((alert) => (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3" key={alert.id}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-red-700">{alert.type}</div>
                  <Badge tone="danger">{alert.patient}</Badge>
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{alert.label}</div>
                <Button className="mt-3 w-full" size="sm" variant="outline">
                  Acknowledge
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function AssignedPatients() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {sortPatients(icuPatients).map((patient) => (
        <PatientCard key={patient.id} patient={patient} />
      ))}
    </div>
  );
}

function MedicationAdministration() {
  const [administrationDetail, setAdministrationDetail] = React.useState<AdministrationDetail>(
    defaultAdministrationDetail,
  );
  const [fluidDetail, setFluidDetail] =
    React.useState<FluidAdministrationDetail>(defaultFluidDetail);
  const [administrationOpen, setAdministrationOpen] = React.useState(false);
  const [fluidOpen, setFluidOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(formatCurrentDate);
  const [selectedPatientId, setSelectedPatientId] = React.useState("pat-icu-405");
  const today = React.useMemo(() => formatCurrentDate(), []);

  const displayedOrders = React.useMemo(() => {
    if (selectedDate < today) {
      return nurseDrugOrders.map((order) => ({
        ...order,
        lastAdministeredAt: order.lastAdministeredAt || "Yesterday 22:00",
        cells: order.cells.map((cell) => ({
          ...cell,
          label:
            cell.label?.replace("Overdue ", "") ??
            (cell.status === "infusion" ? `${order.dosage} infusion` : undefined),
          status: cell.status === "empty" ? cell.status : ("administered" as const),
        })),
      }));
    }

    if (selectedDate > today) {
      return nurseDrugOrders.map((order) => ({
        ...order,
        lastAdministeredAt: "",
        lastAdministeredBy: "",
        administeredVolume: 0,
        cells: order.cells.map((cell) => ({
          ...cell,
          label:
            cell.status === "infusion"
              ? `${order.dosage} planned`
              : cell.label?.replace("Overdue ", ""),
          status: cell.status === "empty" ? cell.status : ("due" as const),
        })),
      }));
    }

    return nurseDrugOrders;
  }, [selectedDate, today]);

  const medicationStats = React.useMemo(() => {
    const cells = displayedOrders.flatMap((order) => order.cells);
    return {
      due: cells.filter((cell) => cell.status === "due").length,
      overdue: cells.filter((cell) => cell.status === "overdue").length,
      administered: cells.filter((cell) => cell.status === "administered").length,
      highRisk: displayedOrders.filter(
        (order) => order.route === "IV" || order.category === "Continuous",
      ).length,
    };
  }, [displayedOrders]);

  const handleCellSelect = (order: NurseDrugOrder, cell?: AdministrationCell) => {
    if (order.category === "Continuous" || order.form === "IV Fluid") {
      setFluidDetail(buildFluidDetail(order, selectedDate));
      setFluidOpen(true);
      return;
    }
    setAdministrationDetail(buildAdministrationDetail(order, selectedDate, cell));
    setAdministrationOpen(true);
  };

  return (
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={Pill} label="Due doses" value={medicationStats.due} tone="warning" />
        <Metric
          icon={AlertTriangle}
          label="Overdue doses"
          value={medicationStats.overdue}
          tone="danger"
        />
        <Metric
          icon={CheckCircle2}
          label="Administered"
          value={medicationStats.administered}
          tone="info"
        />
        <Metric
          icon={ShieldAlert}
          label="High-risk meds"
          value={medicationStats.highRisk}
          tone="critical"
        />
      </section>

      <NurseMedicationPatientSummary
        patientId={selectedPatientId}
        onPatientChange={setSelectedPatientId}
      />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4">
          <Card className="border-blue-100 bg-blue-50/40">
            <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-bold text-foreground">
                  Bedside medication administration record
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">
                  Verify patient, medicine, dose, route, time, allergy, order receipt, and
                  counter-check before accepting administration.
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <RadioTower className="h-4 w-4" />
                  Scan barcode
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4" />
                  Print MAR
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="administration" className="space-y-4">
            <TabsList className="w-full gap-2 overflow-x-auto bg-primary/10 p-1 sm:w-fit">
              <TabsTrigger
                value="administration"
                className="min-w-[168px] border border-primary/20 bg-background text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                MAR Timeline
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="min-w-[132px] border border-primary/20 bg-background text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Drug Orders
              </TabsTrigger>
              <TabsTrigger
                value="audit"
                className="min-w-[132px] border border-primary/20 bg-background text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="administration">
              <AdministrationTimeline
                orders={displayedOrders}
                selectedDate={selectedDate}
                today={today}
                onDateChange={setSelectedDate}
                onCellSelect={handleCellSelect}
              />
            </TabsContent>

            <TabsContent value="orders">
              <DrugOrderReviewTab orders={displayedOrders} />
            </TabsContent>

            <TabsContent value="audit">
              <MedicationAuditPanel orders={displayedOrders} />
            </TabsContent>
          </Tabs>
        </div>

        <MedicationSafetyPanel />
      </section>

      <AdministrationDetailsPanel
        open={administrationOpen}
        detail={administrationDetail}
        onOpenChange={setAdministrationOpen}
        onChange={setAdministrationDetail}
      />
      <FluidAdministrationDetailsPanel
        open={fluidOpen}
        detail={fluidDetail}
        onOpenChange={setFluidOpen}
        onChange={setFluidDetail}
      />
    </div>
  );
}

function formatCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function formatCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function buildAdministrationDetail(
  order: NurseDrugOrder,
  selectedDate: string,
  cell?: AdministrationCell,
): AdministrationDetail {
  const isOverdue = cell?.status === "overdue";
  return {
    ...defaultAdministrationDetail,
    orderId: order.id,
    orderName: order.name,
    category: order.category,
    administrationDate: selectedDate,
    dosage: cell?.label?.replace("Overdue ", "") || order.dosage,
    time: formatCurrentTime(),
    lastAdministeredAt: order.lastAdministeredAt ?? "",
    lastAdministeredBy: order.lastAdministeredBy ?? "",
    action: isOverdue ? "Late administered" : "Administered",
    reason: isOverdue ? "Scheduled dose overdue by more than 1 hour" : "",
    counterChecked: order.route === "IV" || order.category === "Intermittent",
    counterCheckedBy: "",
    counterCheckedAt: "",
  };
}

function buildFluidDetail(order: NurseDrugOrder, selectedDate: string): FluidAdministrationDetail {
  const bagVolume = order.bagVolume ?? 500;
  const volumeAdministered = order.administeredVolume ?? 0;
  const volumeRemaining = Math.max(bagVolume - volumeAdministered, 0);

  return {
    ...defaultFluidDetail,
    orderId: order.id,
    orderName: order.name,
    category: order.category,
    administrationDate: selectedDate,
    rate: order.dosage,
    time: formatCurrentTime(),
    lastAdministeredAt: order.lastAdministeredAt ?? "",
    lastAdministeredBy: order.lastAdministeredBy ?? "",
    bagVolume: String(bagVolume),
    volumeAdministered: String(volumeAdministered),
    volumeRemaining: String(volumeRemaining),
    newBag: false,
    bagCount: String(order.bagCount ?? 1),
    bolusDose: order.bolusDose ?? "",
    counterChecked: true,
    counterCheckedBy: "",
    counterCheckedAt: "",
  };
}

function MedicationSafetyPanel() {
  const rights = [
    "Right patient matched with wristband and UHID",
    "Right medication and active doctor order",
    "Right dose, route, frequency, and time",
    "Allergy, renal status, and interaction reviewed",
    "Counter-check completed for IV/high-risk medication",
  ];

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div>
            <CardTitle className="text-red-800">Safety gate</CardTitle>
            <CardDescription>
              Administration cannot be accepted safely without these bedside checks.
            </CardDescription>
          </div>
          <Badge tone="danger">Required</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {rights.map((item) => (
            <label
              key={item}
              className="flex items-start gap-2 rounded-md border border-red-100 bg-white/80 p-2 text-xs font-semibold text-foreground"
            >
              <input
                className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring"
                type="checkbox"
              />
              <span>{item}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Escalation rules</CardTitle>
            <CardDescription>Auto-alert conditions for nurse and doctor review.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <ServiceItem
            icon={AlertTriangle}
            title="Overdue dose"
            body="Late by more than 60 minutes requires reason and audit trail."
            tone="warning"
          />
          <ServiceItem
            icon={ShieldAlert}
            title="High-risk IV"
            body="Counter-check nurse name and time are mandatory."
            tone="critical"
          />
          <ServiceItem
            icon={Pill}
            title="Discontinued order"
            body="Stopped medicines stay visible and blocked from administration."
            tone="info"
          />
        </CardContent>
      </Card>

      <ClinicalServicesPanel />
    </div>
  );
}

function MedicationAuditPanel({ orders }: { orders: NurseDrugOrder[] }) {
  const auditRows = orders
    .filter((order) => order.lastAdministeredAt || order.category === "Discontinued")
    .map((order) => ({
      id: order.id,
      title: order.name,
      meta:
        order.category === "Discontinued"
          ? `Discontinued - ${order.discontinuedReason ?? "Reason not recorded"}`
          : `${order.lastAdministeredAt} by ${order.lastAdministeredBy || "Nurse pending"}`,
      status: order.category === "Discontinued" ? "Stopped" : "Signed",
    }));

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Medication Audit Trail</CardTitle>
          <CardDescription>
            Recent administration, discontinued orders, and signed nurse actions.
          </CardDescription>
        </div>
        <Badge tone="info">{auditRows.length} events</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {auditRows.map((row) => (
          <div
            key={row.id}
            className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
          >
            <div className="min-w-0">
              <div className="font-semibold text-foreground">{row.title}</div>
              <div className="text-xs text-muted-foreground">{row.meta}</div>
            </div>
            <Badge tone={row.status === "Stopped" ? "warning" : "success"}>{row.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ClinicalTasks() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>STAT Orders, Nursing Tasks, and Assessments</CardTitle>
          <CardDescription>
            Vitals, I/O, dressing, catheter care, lab collection, transfusion, pain, and GCS
            assessment.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {icuTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </CardContent>
    </Card>
  );
}

function ShiftHandover() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Handover Compliance Tracker</CardTitle>
            <CardDescription>
              Auto-trigger window opens 15 minutes before shift end.
            </CardDescription>
          </div>
          <Badge tone="info">45% completed</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-5">
            {handoverSteps.map((step, index) => (
              <div
                className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center"
                key={step}
              >
                <div
                  className={cn(
                    "mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                    index < 2 ? "bg-primary text-white" : "bg-blue-100 text-primary",
                  )}
                >
                  {index + 1}
                </div>
                <div className="text-xs font-semibold">{step}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div>
            <CardTitle className="text-red-800">High risk status detected</CardTitle>
            <CardDescription>
              Overdue medications, pending critical orders, and missing documentation require audit.
            </CardDescription>
          </div>
          <Button size="sm" variant="danger">
            Audit required
          </Button>
        </CardHeader>
      </Card>
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-lg font-bold">Responsibility Transfer</div>
              <div className="text-xs text-white/80">
                Incoming nurse name, digital signature, and acceptance are required.
              </div>
            </div>
            <Button variant="outline">Download PDF handover</Button>
          </div>
          <Input
            className="bg-white/95 text-foreground"
            placeholder="Incoming nurse full legal name"
          />
          <div className="min-h-28 rounded-lg bg-white p-3 text-xs italic text-muted-foreground">
            Digital signature field
          </div>
          <label className="flex items-start gap-2 text-xs">
            <input className="mt-0.5" type="checkbox" />I accept full clinical responsibility and
            certify that risk analysis has been completed.
          </label>
          <Button className="w-full bg-white text-primary hover:bg-white/90">
            Authorize transfer of care
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function FamilyCommunication() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Counselling History</CardTitle>
            <CardDescription>
              Family updates, doctor discussions, nursing updates, and support status.
            </CardDescription>
          </div>
          <Button size="sm" variant="outline">
            New log
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Dr. Aris Thorne: prognosis discussion with primary attendant.",
            "RN Sarah Jenkins: bedside update on alarms and line care.",
            "Respiratory therapist: ventilator weaning counselling.",
          ].map((note) => (
            <div className="rounded-lg border border-border bg-slate-50 p-3 text-sm" key={note}>
              {note}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Consent Tracking</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {[
            "Procedure consent",
            "Blood consent",
            "Ventilator consent",
            "DNR/DNI",
            "Organ donation",
            "RRT consent",
          ].map((item, index) => (
            <div className="rounded-lg border border-border p-3 text-center" key={item}>
              <CheckCircle2
                className={cn(
                  "mx-auto mb-2 h-5 w-5",
                  index === 3 || index === 4 ? "text-muted-foreground" : "text-primary",
                )}
              />
              <div className="text-xs font-semibold">{item}</div>
              <Badge
                className="mt-2"
                tone={index === 4 ? "warning" : index === 3 ? "muted" : "success"}
              >
                {index === 4 ? "Pending" : index === 3 ? "N/A" : "Active"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Collaborative Care Plan</CardTitle>
          <Badge tone="info">Shift goals</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            "Physician: aggressive fluid removal",
            "Respiratory: spontaneous breathing trial",
            "Physiotherapy: passive ROM / dangle",
            "Dietician: nutrition optimization",
          ].map((goal, index) => (
            <div className="rounded-lg border border-border p-3" key={goal}>
              <div className="font-semibold">{goal}</div>
              <div className="mt-2 h-2 rounded-full bg-blue-100">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${[75, 25, 10, 100][index]}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function PatientJourney() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Chronological Patient Journey</CardTitle>
          <CardDescription>
            ER arrival through ICU transfer, doctor orders, labs, radiology, transfusion, rounds,
            handover, transfer, and discharge.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {journeyEvents.map((event) => (
          <div
            className="grid gap-3 border-l-2 border-primary pl-4 md:grid-cols-[80px_minmax(0,1fr)]"
            key={`${event.time}-${event.action}`}
          >
            <div className="font-mono text-sm font-bold text-primary">{event.time}</div>
            <div className="rounded-lg border border-border p-3">
              <div className="font-semibold">{event.action}</div>
              <div className="text-xs text-muted-foreground">
                {event.user} . {event.department}
              </div>
              <div className="mt-2 text-sm">{event.remarks}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TransferDischarge() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Transfer and Discharge Checklist</CardTitle>
            <CardDescription>
              Doctor approval to nurse checklist to lab, pharmacy, billing clearance to transfer or
              discharge.
            </CardDescription>
          </div>
          <Badge tone="warning">45% complete</Badge>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nurse">
            <TabsList>
              <TabsTrigger value="nurse">Nurse</TabsTrigger>
              <TabsTrigger value="clearance">Clearances</TabsTrigger>
            </TabsList>
            <TabsContent className="space-y-3" value="nurse">
              {[
                "IV line removal",
                "Final skin assessment",
                "Medication reconciliation",
                "Patient education",
                "Equipment return",
              ].map((item) => (
                <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-3" key={item}>
                  <input className="mt-1 h-4 w-4" type="checkbox" />
                  <span>
                    <span className="block font-semibold">{item}</span>
                    <span className="text-xs text-muted-foreground">
                      Nurse verification required before closure.
                    </span>
                  </span>
                </label>
              ))}
            </TabsContent>
            <TabsContent className="grid gap-3 md:grid-cols-3" value="clearance">
              {["Lab cleared", "Pharmacy pending returns", "Billing awaiting approval"].map(
                (item) => (
                  <div className="rounded-lg border border-border p-3 font-semibold" key={item}>
                    {item}
                  </div>
                ),
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Destination Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
            {["Ward", "OT", "Another ICU", "External transfer", "Home discharge"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-semibold text-primary">
            Clinical handoff verification required
          </div>
          <Button className="w-full">Confirm final transfer</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function EmergencyCenter() {
  const actions = [
    "Code Blue",
    "Rapid Response",
    "Doctor Escalation",
    "Critical Lab Alert",
    "Sepsis Alert",
    "Emergency Medication",
  ];
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Emergency Actions</CardTitle>
            <CardDescription>
              Dedicated ICU emergency response controls for nurse workflow.
            </CardDescription>
          </div>
          <Badge tone="danger">Active alert: 4A-12</Badge>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {actions.map((action, index) => (
            <Button
              className={cn("h-16 justify-start", index < 2 && "bg-red-700 hover:bg-red-800")}
              key={action}
              variant={index < 2 ? "default" : "outline"}
            >
              <ShieldAlert className="h-5 w-5" />
              {action}
            </Button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Active Emergency Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {icuAlerts.map((alert) => (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3" key={alert.id}>
              <div className="text-xs font-bold uppercase text-red-700">{alert.type}</div>
              <div className="mt-1 font-semibold">{alert.label}</div>
              <div className="text-xs text-muted-foreground">{alert.patient}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ClinicalServicesPanel() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Clinical Services</CardTitle>
          <CardDescription>
            Nurse-relevant pharmacy, lab, radiology, and blood bank states.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ServiceItem
          icon={Pill}
          title="Pharmacy"
          body="Heparin infusion awaiting high-risk verification."
          tone="warning"
        />
        <ServiceItem
          icon={FlaskConical}
          title="Laboratory"
          body="ABG panel collected. Blood culture results awaited."
          tone="info"
        />
        <ServiceItem
          icon={RadioTower}
          title="Radiology"
          body="CT pulmonary angiogram ETA 09:15. Patient ready for transport."
          tone="info"
        />
        <ServiceItem
          icon={Droplets}
          title="Blood Bank"
          body="PRBC issued. Double verification required before transfusion."
          tone="critical"
        />
      </CardContent>
    </Card>
  );
}

function PatientCard({ patient, compact = false }: { patient: IcuPatient; compact?: boolean }) {
  return (
    <Card className={cn(patient.critical && "border-red-300 bg-red-50")}>
      <CardHeader className={cn("gap-2", compact && "px-3 py-2")}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-primary">{patient.bed}</span>
            <CardTitle className="text-base">{patient.name}</CardTitle>
          </div>
          <CardDescription>
            {patient.mrn} . {patient.ageGender} . {patient.diagnosis}
          </CardDescription>
        </div>
        <Badge tone={patient.critical ? "danger" : "info"}>
          {patient.critical ? "Critical" : "Active"}
        </Badge>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "p-3")}>
        <div className="flex flex-wrap gap-2">
          <Badge
            tone={patient.allergy === "None" || patient.allergy === "NKA" ? "muted" : "danger"}
          >
            {patient.allergy}
          </Badge>
          <Badge tone="info">{patient.isolation}</Badge>
          <Badge tone={patient.fallRisk === "High" ? "warning" : "muted"}>
            Fall: {patient.fallRisk}
          </Badge>
          <Badge tone="muted">Braden {patient.braden}</Badge>
        </div>
        <div className="grid grid-cols-4 gap-2 rounded-lg bg-blue-50 p-2 text-center text-xs">
          <Vital label="HR" value={patient.hr} />
          <Vital label="BP" value={patient.bp} />
          <Vital label="SpO2" value={`${patient.spo2}%`} />
          <Vital label="RR" value={patient.rr} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <Score label="NEWS2" value={patient.news2} danger={patient.news2 >= 7} />
          <Score label="MEWS" value={patient.mews} danger={patient.mews >= 4} />
          <Score label="Sepsis" value={patient.sepsis} danger={patient.sepsis === "High"} />
        </div>
        {!compact ? (
          <>
            <div className="flex flex-wrap gap-2">
              {patient.deviceStatus.map((item) => (
                <Badge key={item} tone="info">
                  {item}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Escalation: {patient.escalation}</span>
              <span>Last review: {patient.lastReview}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button size="sm" variant="outline" asChild>
                <Link href={`/patients/${patient.patientId}`}>Open patient</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/icu-monitoring/cvs?patientId=${patient.patientId}`}>View vitals</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/rapid-review?patientId=${patient.patientId}`}>Escalate</Link>
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    { label: "Record vitals", icon: HeartPulse, href: "/icu-nursing/patients" },
    { label: "Medication administration", icon: Syringe, href: "/icu-nursing/medications" },
    { label: "Lab draw", icon: FlaskConical, href: "/icu-nursing/tasks" },
    { label: "Blood transfusion", icon: Droplets, href: "/icu-nursing/medications" },
    { label: "Start handover", icon: ArrowRightLeft, href: "/icu-nursing/handover" },
    { label: "Emergency response", icon: ShieldAlert, href: "/icu-nursing/emergency" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Fast nurse actions routed to real ICU workflows.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              asChild
              className="h-auto justify-start p-3"
              key={action.label}
              variant="outline"
            >
              <Link href={action.href}>
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  tone: "info" | "warning" | "danger" | "critical";
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>
        <Badge tone={tone}>
          <Icon className="h-3.5 w-3.5" />
        </Badge>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task }: { task: IcuTask }) {
  return (
    <div className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[140px_minmax(0,1fr)_auto] md:items-center">
      <Badge
        tone={
          task.priority === "STAT" || task.priority === "Critical"
            ? "danger"
            : task.priority === "High"
              ? "warning"
              : "muted"
        }
      >
        {task.priority}
      </Badge>
      <div>
        <div className="font-semibold">{task.title}</div>
        <div className="text-xs text-muted-foreground">
          {task.patient} . Due {task.due}
        </div>
      </div>
      <Badge
        tone={
          task.status === "Completed"
            ? "success"
            : task.status === "In Progress"
              ? "info"
              : "warning"
        }
      >
        {task.status}
      </Badge>
    </div>
  );
}

function ServiceItem({
  icon: Icon,
  title,
  body,
  tone,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  tone: "info" | "warning" | "critical";
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-slate-50 p-3">
      <Badge tone={tone}>
        <Icon className="h-4 w-4" />
      </Badge>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}

function Vital({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-muted-foreground">{label}</div>
      <div className="font-bold text-foreground">{value}</div>
    </div>
  );
}

function Score({
  label,
  value,
  danger,
}: {
  label: string;
  value: React.ReactNode;
  danger: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-2",
        danger
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-blue-100 bg-blue-50 text-primary",
      )}
    >
      <div className="font-bold">{value}</div>
      <div className="text-[10px] uppercase">{label}</div>
    </div>
  );
}

function sortPatients(patients: IcuPatient[]) {
  return [...patients].sort((a, b) => Number(b.critical) - Number(a.critical));
}
