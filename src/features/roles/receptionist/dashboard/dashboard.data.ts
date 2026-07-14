import { CalendarClock, DoorOpen, IdCard, Search, Stethoscope } from "lucide-react";

import type { BillingSnapshotItem, ReceptionStat, ReceptionWorkQueue } from "./dashboard.types";

export const receptionStats: ReceptionStat[] = [
  { label: "Token queue", value: "32", meta: "8 priority check-ins", tone: "warning" },
  { label: "Registrations", value: "46", meta: "12 new patients today", tone: "success" },
  { label: "Appointments", value: "118", meta: "84 checked in", tone: "info" },
  { label: "Billing due", value: "19", meta: "7 discharge clearances", tone: "critical" },
];

export const billingSnapshot: BillingSnapshotItem[] = [
  { label: "OPD bills", value: "72", amount: "₹2.48L" },
  { label: "IPD advances", value: "14", amount: "₹5.20L" },
  { label: "Refund queue", value: "3", amount: "₹18.4K" },
  { label: "Insurance desk", value: "9", amount: "Pre-auth pending" },
];

export const workQueues: ReceptionWorkQueue[] = [
  { label: "Patient Registration", route: "/patients/register", icon: IdCard, count: "12 waiting" },
  {
    label: "Appointment Booking",
    route: "/appointments/book",
    icon: CalendarClock,
    count: "18 slots open",
  },
  { label: "OPD Queue", route: "/opd", icon: Stethoscope, count: "27 active" },
  { label: "Admission Desk", route: "/admission/reception", icon: DoorOpen, count: "6 requests" },
  { label: "Patient Search", route: "/patients", icon: Search, count: "Quick lookup" },
];

export const handoverItems = [
  "Verify patient mobile and ABHA consent before registration",
  "Collect OPD billing before queue token release",
  "Mark IPD admission payment clearance before bed allocation",
];
