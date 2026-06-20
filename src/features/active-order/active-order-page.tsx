"use client";

import * as React from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Droplet,
  Link2,
  PlayCircle,
  Plus,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { useRole } from "@/components/providers/role-provider";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shell/page-header";
import { mockPatients } from "@/data/patients";
import { PatientSearchSelect } from "@/features/patients/patient-search-select";
import type { Role, StatusTone } from "@/types";

type UnitStatus = "In Progress" | "Completed" | "Discontinued";

type Unit = {
  id: number;
  bloodUnitNo: string;
  startTime: string;
  endTime: string;
  volume: string;
  comments: string;
  status: UnitStatus;
};

const nurseRoles: Role[] = ["Nurse", "Super Admin", "Hospital Admin"];
const totalUnits = 3;

const unitStatusTone: Record<UnitStatus, StatusTone> = {
  "In Progress": "warning",
  Completed: "success",
  Discontinued: "danger",
};

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">
        {label}:
      </div>

      <div className="text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={[
        "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

function ActiveOrdersCard() {
  const [showReleaseDrawer, setShowReleaseDrawer] = React.useState(false);
  const [showDiscontinueDrawer, setShowDiscontinueDrawer] = React.useState(false);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [discontinueReason, setDiscontinueReason] = React.useState("");

  const releasedUnits = units.length;
  const completedUnits = units.filter((unit) => unit.status === "Completed").length;
  const activeUnit = units.find((unit) => unit.status === "In Progress");
  const releaseDisabled = Boolean(activeUnit) || releasedUnits >= totalUnits;

  const handleReleaseUnit = React.useCallback(() => {
    const nextUnitNumber = units.length + 1;

    const newUnit: Unit = {
      id: nextUnitNumber,
      bloodUnitNo: `BB-00${nextUnitNumber}`,
      startTime: "",
      endTime: "",
      volume: "",
      comments: "",
      status: "In Progress",
    };

    setUnits((current) => [...current, newUnit]);
    setShowReleaseDrawer(false);
    toast.success(`Unit ${nextUnitNumber} released for transfusion`);
  }, [units.length]);

  const handleCompleteUnit = React.useCallback((id: number) => {
    setUnits((current) =>
      current.map((unit) => (unit.id === id ? { ...unit, status: "Completed" } : unit)),
    );
    toast.success(`Transfusion Unit ${id} completed`);
  }, []);

  const handleDiscontinue = React.useCallback(() => {
    if (!activeUnit) return;

    setUnits((current) =>
      current.map((unit) =>
        unit.id === activeUnit.id
          ? {
              ...unit,
              status: "Discontinued",
              comments: discontinueReason,
            }
          : unit,
      ),
    );

    toast.success(`Transfusion Unit ${activeUnit.id} discontinued`);
    setDiscontinueReason("");
    setShowDiscontinueDrawer(false);
  }, [activeUnit, discontinueReason]);

  const updateUnitField = React.useCallback(
    (id: number, field: keyof Pick<Unit, "startTime" | "endTime" | "volume" | "comments">, value: string) => {
      setUnits((current) => current.map((unit) => (unit.id === id ? { ...unit, [field]: value } : unit)));
    },
    [],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-danger" />
              Active Blood Order
            </CardTitle>
            <CardDescription>Release units sequentially and record transfusion details.</CardDescription>
          </div>
          <Button onClick={() => setShowReleaseDrawer(true)} disabled={releaseDisabled}>
            <Plus className="h-4 w-4" />
            Release
          </Button>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Order Date" value="May 20, 2024" />
            <DetailItem label="Blood Product" value="Packed RBC" />
            <DetailItem label="Units Ordered" value={`${totalUnits} Units`} />
            <DetailItem label="Priority" value={<Badge tone="danger">URGENT</Badge>} />
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.2fr]">
            <DetailItem label="Reason" value="Post-operative blood loss" />
            <DetailItem label="Instructions" value="Monitor vitals" />
            <label className="flex items-center gap-3 rounded-md border border-border bg-surface-muted p-3">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                <Link2 className="h-3.5 w-3.5" />
                Link Line
              </span>

              <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20">
                <option>Central Line - A</option>
                <option>Peripheral Line</option>
              </select>
            </label>
          </div>

          {/* <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3 sm:grid-cols-3">
            <DetailItem label="Ordered" value={totalUnits} />
            <DetailItem label="Released" value={releasedUnits} />
            <DetailItem label="Completed" value={completedUnits} />
          </div> */}

          <div className="space-y-4">
            {units.length === 0 ? (
              <AlertBanner icon={PlayCircle} tone="info" title="No unit released yet">
                Release the first blood unit to start administration.
              </AlertBanner>
            ) : null}

            {units.map((unit) => (
              <Card key={unit.id} className="shadow-none">
                <CardHeader>
                  <div>
                    <CardTitle>Transfusion Unit {unit.id}</CardTitle>
                    <CardDescription>{unit.bloodUnitNo}</CardDescription>
                  </div>
                  <Badge tone={unitStatusTone[unit.status]}>{unit.status}</Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <label className="space-y-2">
                      <FieldLabel>Blood Unit No</FieldLabel>
                      <Input value={unit.bloodUnitNo} readOnly />
                    </label>
                    <label className="space-y-2">
                      <FieldLabel>Start Time</FieldLabel>
                      <Input
                        type="time"
                        value={unit.startTime}
                        disabled={unit.status !== "In Progress"}
                        onChange={(event) => updateUnitField(unit.id, "startTime", event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <FieldLabel>End Time</FieldLabel>
                      <Input
                        type="time"
                        value={unit.endTime}
                        disabled={unit.status !== "In Progress"}
                        onChange={(event) => updateUnitField(unit.id, "endTime", event.target.value)}
                      />
                    </label>
                    <label className="space-y-2">
                      <FieldLabel>Volume</FieldLabel>
                      <Input
                        type="number"
                        placeholder="250"
                        value={unit.volume}
                        min='0'
                        disabled={unit.status !== "In Progress"}
                        onChange={(event) => updateUnitField(unit.id, "volume", event.target.value)} onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      />
                    </label>
                    <label className="space-y-2 md:col-span-2 xl:col-span-1">
                      <FieldLabel>Comments</FieldLabel>
                      <Textarea
                        rows={1}
                        placeholder="Enter comments"
                        value={unit.comments}
                        disabled={unit.status !== "In Progress"}
                        onChange={(event) => updateUnitField(unit.id, "comments", event.target.value)}
                      />
                    </label>
                  </div>

                  {unit.status === "In Progress" ? (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                      <Button
                        className="w-full sm:w-auto bg-danger"
                        onClick={() => setShowDiscontinueDrawer(true)}
                      >
                        <Ban className="h-4 w-4" />
                        Discontinue
                      </Button>

                      <Button
                        className="w-full sm:w-auto"
                        onClick={() => handleCompleteUnit(unit.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete Unit
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Drawer
        open={showReleaseDrawer}
        onOpenChange={setShowReleaseDrawer}
        title="Release Blood Unit"
        description="Confirm the next unit before administration starts."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReleaseDrawer(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleaseUnit} disabled={releaseDisabled}>
              <PlayCircle className="h-4 w-4" />
              Release Next Unit
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <DetailItem label="Ordered Units" value={totalUnits} />
          <DetailItem label="Received Units" value={totalUnits} />
          <DetailItem label="Released Units" value={releasedUnits} />
          {activeUnit ? (
            <AlertBanner icon={AlertTriangle} tone="warning" title="Unit already in progress">
              Complete or discontinue the active unit before releasing another one.
            </AlertBanner>
          ) : null}
        </div>
      </Drawer>

      <Drawer
        open={showDiscontinueDrawer}
        onOpenChange={setShowDiscontinueDrawer}
        title="Discontinue Transfusion"
        description={activeUnit ? `Transfusion Unit ${activeUnit.id}` : undefined}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDiscontinueDrawer(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDiscontinue} disabled={!discontinueReason.trim()}>
              <Ban className="h-4 w-4" />
              Discontinue
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <AlertBanner icon={AlertTriangle} tone="danger" title="Discontinue confirmation">
            This will stop the currently active transfusion unit.
          </AlertBanner>
          <label className="block space-y-2">
            <FieldLabel>Reason</FieldLabel>
            <Textarea
              rows={5}
              value={discontinueReason}
              onChange={(event) => setDiscontinueReason(event.target.value)}
              placeholder="Enter discontinue reason"
            />
          </label>
        </div>
      </Drawer>
    </>
  );
}

export function ActiveOrderPage() {
  const { role } = useRole();
  const allowed = nurseRoles.includes(role);
  const [patientId, setPatientId] = React.useState(mockPatients[0]?.id ?? "");
  const patient = mockPatients.find((item) => item.id === patientId) ?? mockPatients[0];

  if (!allowed) {
    return (
      <EmptyState
        icon={UserRound}
        title="Nurse access required"
        description="Switch to Nurse role to open active blood order administration."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Active Order"
        className="static mx-0 border-b bg-transparent px-0 py-2"
      />

      <Card className="sticky top-4 z-20">
        <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <PatientSearchSelect patientId={patient.id} onPatientChange={setPatientId} />
          {/* <DetailItem label="UHID" value="UH1023" /> */}
          <DetailItem label="Age/Gender" value={`${patient.age} / ${patient.gender}`} />
          <DetailItem label="Blood Group" value={patient.bloodGroup} />
          {/* <DetailItem label="Ward/Bed" value="ICU-2" /> */}
        </CardContent>
      </Card>

      <ActiveOrdersCard />
    </div>
  );
}
