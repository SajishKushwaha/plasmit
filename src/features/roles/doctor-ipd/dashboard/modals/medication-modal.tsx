"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CenterModal } from "@/components/ui/center-modal";
import { DoctorOrdersPage } from "@/features/clinical/doctor-orders/doctor-orders";
import type { DashboardMedicationRow, DoctorIpdPatient } from "@/features/roles/doctor-ipd/dashboard/dashboard.types";
import { cn } from "@/lib/utils";

export function MedicationInterventionPopup({ patient }: { patient: DoctorIpdPatient }) {
  const [tab, setTab] = React.useState<"current" | "past" | "intervention">("current");
  const [addMedicineOpen, setAddMedicineOpen] = React.useState(false);
  const currentMedication: DashboardMedicationRow[] = [
    { name: "Inj. Pantoprazole", dose: "40 mg", route: "IV", frequency: "BD", startDate: "18/06/2026", status: "Active", prescribedBy: "Dr. Amandeep Singh" },
    { name: "Tab. Paracetamol", dose: "500 mg", route: "Oral", frequency: "SOS", startDate: "18/06/2026", status: "Active", prescribedBy: "Dr. Meera Rao" },
    { name: "Normal Saline", dose: "100 ml/hr", route: "IV", frequency: "Continuous", startDate: "18/06/2026", status: "Running", prescribedBy: "Dr. Super Admin" },
  ];
  const pastMedication: DashboardMedicationRow[] = [
    { name: "Tab. Azithromycin", dose: "500 mg", route: "Oral", frequency: "OD", startDate: "14/06/2026", endDate: "17/06/2026", status: "Completed", prescribedBy: "Dr. Meera Rao" },
    { name: "Inj. Ceftriaxone", dose: "1 g", route: "IV", frequency: "BD", startDate: "12/06/2026", endDate: "16/06/2026", status: "Stopped", prescribedBy: "Dr. Amandeep Singh" },
  ];
  const interventions = [
    { title: "Oxygen Support", detail: "Nasal cannula 2 L/min. Maintain SpO2 above 94%.", time: "18/06/2026 08:30 PM", status: "Active" },
    { title: "Fluid Monitoring", detail: "Strict input/output charting every 4 hours.", time: "18/06/2026 06:15 PM", status: "Ongoing" },
    { title: "Nursing Instruction", detail: "Monitor vitals every 30 minutes and inform doctor if BP drops.", time: "18/06/2026 05:45 PM", status: "Assigned" },
  ];

  return (
    <>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b bg-white p-3 text-sm font-semibold sm:flex-row sm:items-center">
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-1 rounded-lg bg-surface-muted/70 p-1">
            <MedicationTabButton active={tab === "current"} onClick={() => setTab("current")}>Current Medication</MedicationTabButton>
            <MedicationTabButton active={tab === "past"} onClick={() => setTab("past")}>Past Medication</MedicationTabButton>
            <MedicationTabButton active={tab === "intervention"} onClick={() => setTab("intervention")}>Intervention</MedicationTabButton>
          </div>
          <div className="group relative flex shrink-0 justify-end sm:items-center">
            <Button aria-label="Open medicine from drug orders" className="h-10 w-full shrink-0 gap-2 rounded-md px-3 font-bold sm:h-9 sm:w-9 sm:rounded-full sm:p-0" onClick={() => setAddMedicineOpen(true)} title="Medicine" type="button">
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">Medicine</span>
            </Button>
            {!addMedicineOpen ? <div className="pointer-events-none absolute right-11 top-1/2 z-[80] hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 sm:block">Medicine</div> : null}
          </div>
        </div>

        <div className="max-h-[60dvh] overflow-y-auto p-3 sm:p-5">
          {tab === "current" ? <div className="space-y-4"><MedicationTable type="current" rows={currentMedication} /></div> : null}
          {tab === "past" ? <MedicationTable type="past" rows={pastMedication} /> : null}
          {tab === "intervention" ? (
            <div className="space-y-3">
              {interventions.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <p className="mt-1 text-sm font-medium text-slate-600">{item.detail}</p>
                      <div className="mt-2 text-xs font-semibold text-slate-400">{item.time}</div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <CenterModal className="h-[min(88dvh,900px)] w-[min(96vw,1560px)]" description={`${patient.name} | ${patient.bed} | ${patient.diagnosis}`} onOpenChange={(open) => setAddMedicineOpen(open)} open={addMedicineOpen} title="Medicine">
        <DoctorOrdersPage defaultTab="drugs" drugsOnly />
      </CenterModal>
    </>
  );
}

function MedicationTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("min-h-14 rounded-lg border border-transparent px-2 py-2 text-center text-xs font-bold leading-tight transition sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-sm", active ? "bg-white text-primary shadow-sm" : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900")}>
      {children}
    </button>
  );
}

function MedicationTable({ rows, type }: { rows: DashboardMedicationRow[]; type: "current" | "past" }) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {rows.map((row) => (
          <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm" key={`${row.orderId ?? row.name}-${row.startDate}-mobile`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-extrabold leading-5 text-slate-900">{row.name}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">{row.dose} | {row.route} | {row.frequency}</div>
              </div>
              <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">{row.status}</span>
            </div>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between gap-3"><span className="text-slate-400">Start Date</span><span className="text-right text-slate-700">{row.startDate}</span></div>
              {type === "past" ? <div className="flex justify-between gap-3"><span className="text-slate-400">End Date</span><span className="text-right text-slate-700">{row.endDate ?? "-"}</span></div> : null}
              <div className="flex justify-between gap-3"><span className="text-slate-400">Prescribed By</span><span className="text-right text-slate-700">{row.prescribedBy}</span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 sm:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Medicine</th><th className="px-4 py-3">Dose</th><th className="px-4 py-3">Route</th><th className="px-4 py-3">Frequency</th><th className="px-4 py-3">Start Date</th>{type === "past" ? <th className="px-4 py-3">End Date</th> : null}<th className="px-4 py-3">Status</th><th className="px-4 py-3">Prescribed By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row) => (
              <tr key={`${row.orderId ?? row.name}-${row.startDate}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{row.name}</td><td className="px-4 py-3 font-medium text-slate-700">{row.dose}</td><td className="px-4 py-3 font-medium text-slate-700">{row.route}</td><td className="px-4 py-3 font-medium text-slate-700">{row.frequency}</td><td className="px-4 py-3 font-medium text-slate-700">{row.startDate}</td>{type === "past" ? <td className="px-4 py-3 font-medium text-slate-700">{row.endDate}</td> : null}<td className="px-4 py-3"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{row.status}</span></td><td className="px-4 py-3 font-medium text-slate-700">{row.prescribedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
