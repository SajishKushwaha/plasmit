import { UserRound } from "lucide-react";

import type { NavigationItem } from "@/types";

export const patientDetailsNavigationItem: NavigationItem = {
  id: "patient-details",
  label: "Patient Details",
  icon: UserRound,
  route: "/patient-details",
  group: "Patient Management",
  allowedRoles: [
    "Super Admin",
    "Hospital Admin",
    "Doctor",
    "Nurse",
    "Receptionlist",
    "Billing Executive",
    "Management",
  ],
  status: "ready",
};
