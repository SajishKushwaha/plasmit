import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doctorInstructions, icuAlerts, icuTasks } from "../../nursing-icu-data";
import { HeadNurseEmptyPatientState, HeadNursePatientContext, HeadNurseTonePill, InfoTile } from "../head-nurse-patient-context";
import type { HeadNursePageProps } from "../head-nurse-types";

export function EscalationsPage({ initialPatientId }: HeadNursePageProps) {
  return (
    <HeadNursePatientContext initialPatientId={initialPatientId} moduleId="escalations">
      {({ patient }) => {
        if (!patient) return <HeadNurseEmptyPatientState moduleLabel="escalations" />;
        const escalatedTasks = icuTasks.filter((task) => task.patientId === patient.id && task.status === "Escalated");
        const criticalAlerts = icuAlerts.filter((alert) => alert.patientId === patient.id && alert.severity === "Critical" && alert.status !== "Resolved");
        const escalatedOrders = doctorInstructions.filter((order) => order.patientId === patient.id && order.status === "Escalated");
        const totalEscalations = escalatedTasks.length + criticalAlerts.length + escalatedOrders.length;
        return (
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Escalation review</CardTitle>
              <CardDescription>Head Nurse coordinates ICU nurse and doctor action for unresolved high-risk items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <InfoTile label="Escalations" value={totalEscalations} />
                <InfoTile label="Duty doctor" value={patient.dutyDoctor} />
                <InfoTile label="Unit nurse" value={patient.assignedUnitNurse} />
                <InfoTile label="Priority" value={<HeadNurseTonePill tone={totalEscalations ? "danger" : "success"}>{totalEscalations ? "Open" : "Clear"}</HeadNurseTonePill>} />
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-950">Escalation path</p>
                <p className="mt-2 text-sm text-slate-600">ICU nurse raises or validates the issue. If escalation is required, Doctor and Head Nurse coordinate action, then close escalation after evidence is updated.</p>
              </div>
              <div className="flex justify-end gap-2"><Button variant="outline">Document review</Button><Button>Close reviewed escalation</Button></div>
            </CardContent>
          </Card>
        );
      }}
    </HeadNursePatientContext>
  );
}
