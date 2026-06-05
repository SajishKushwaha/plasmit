import type * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { mockPatients } from "@/data/patients";
import { PatientSearchSelect } from "@/features/patients/patient-search-select";

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}:</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function NurseMedicationPatientSummary({
  patientId,
  onPatientChange,
}: {
  patientId: string;
  onPatientChange: (patientId: string) => void;
}) {
  const patient = mockPatients.find((item) => item.id === patientId) ?? mockPatients[0];

  return (
    <Card>
      <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <PatientSearchSelect patientId={patient.id} onPatientChange={onPatientChange} />
        <DetailItem label="Age/Gender" value={`${patient.age} / ${patient.gender}`} />
        {/* <DetailItem label="UHID" value={patient.uhid} /> */}
        {/* <DetailItem label="Ward/Bed" value="ICU-2" /> */}
        <DetailItem label="Allergy" value={patient.alertFlags.length ? <Badge tone="warning">{patient.alertFlags[0]}</Badge> : "-"} />
        {/* <DetailItem label="Shift" value="Morning" /> */}
      </CardContent>
    </Card>
  );
}
