import type { CriticalAlert } from "@/features/radiology/types";

export const criticalAlerts: CriticalAlert[] = [
  {
    id: "alert-1",
    orderId: "ord-7002",
    patientId: "pat-1002",
    severity: "Critical",
    finding: "Small acute left temporal extra-axial hemorrhage on CT head.",
    notifiedTo: "Dr. Raghav Menon, Emergency",
    notifiedAt: "2026-05-21T10:02:00+05:30",
    acknowledgedBy: "Dr. Raghav Menon",
    acknowledgedAt: "2026-05-21T10:05:00+05:30",
    status: "Acknowledged",
  },
  {
    id: "alert-2",
    orderId: "ord-7001",
    patientId: "pat-1001",
    severity: "High",
    finding: "Incidental 7 mm right lower lobe pulmonary nodule.",
    notifiedTo: "Dr. Neha Suri, Cardiology",
    notifiedAt: "2026-05-21T11:28:00+05:30",
    status: "Open",
  },
];
