import type { LucideIcon } from "lucide-react";
import type { StatusTone } from "@/types";

export type ReceptionStat = {
  label: string;
  value: string;
  meta: string;
  tone: StatusTone;
};

export type BillingSnapshotItem = {
  label: string;
  value: string;
  amount: string;
};

export type ReceptionWorkQueue = {
  label: string;
  route: string;
  icon: LucideIcon;
  count: string;
};
