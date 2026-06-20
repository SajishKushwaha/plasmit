export type TimepointLabel =
  | "Immediately before starting transfusion"
  | "15 min after commencement"
  | "Hourly during transfusion"
  | "At completion of each pack"
  | "One hour after completion"
  | "Ad-hoc / Reaction";

export type ComponentCategory =
  | "Whole Blood / Leucoreduced Red Cells"
  | "Packed Red Cells"
  | "Platelets Concentrate"
  | "F.F.P (Fresh Frozen Plasma)"
  | "Cryoprecipitate"
  | "Factor VIII poor plasma"
  | "Platelets on Cell Separator"
  | "Plasma on Cell Separator"
  | "Washed Red Cells"
  | "Others / Procedure";

export type MonitoringScheduleItem = {
  label: TimepointLabel;
  dueMinutes: number | null;
};

export type ReactionSymptom =
  | "Chills"
  | "Fever"
  | "Urticaria"
  | "Pain at site of transfusion"
  | "Dyspnoea"
  | "Hypotension"
  | "Shock"
  | "Hemoglobinuria"
  | "Oliguria/Anuria";

export type BloodAdministrationEpisode = {
  patientName: string;
  mrn: string;
  wardBed: string;
  bloodGroup: string;
  componentType: ComponentCategory;
  bagNo: string;
  startTime: string;
  baselinePulse: number;
  baselineSystolic: number;
  baselineDiastolic: number;
  baselineTemperature: number;
  baselineRespiratoryRate: number;
  clockNo: string;
};

export const bloodAdministrationEpisode: BloodAdministrationEpisode = {
  patientName: "Amit Kumar",
  mrn: "00284761",
  wardBed: "Ward 4B - Bed 12",
  bloodGroup: "B +ve",
  componentType: "Packed Red Cells",
  bagNo: "PRC-2024-00871",
  startTime: "09:15",
  baselinePulse: 78,
  baselineSystolic: 118,
  baselineDiastolic: 76,
  baselineTemperature: 36.8,
  baselineRespiratoryRate: 16,
  clockNo: "4421",
};

export const wholeBloodMonitoringSchedule: MonitoringScheduleItem[] = [
  { label: "Immediately before starting transfusion", dueMinutes: 0 },
  { label: "15 min after commencement", dueMinutes: 15 },
  { label: "Hourly during transfusion", dueMinutes: 60 },
  { label: "At completion of each pack", dueMinutes: null },
  { label: "One hour after completion", dueMinutes: 60 },
];

export const otherComponentMonitoringSchedule: MonitoringScheduleItem[] = [
  { label: "Immediately before starting transfusion", dueMinutes: 0 },
  { label: "15 min after commencement", dueMinutes: 15 },
  { label: "At completion of each pack", dueMinutes: null },
];

export const reactionSymptoms: ReactionSymptom[] = [
  "Chills",
  "Fever",
  "Urticaria",
  "Pain at site of transfusion",
  "Dyspnoea",
  "Hypotension",
  "Shock",
  "Hemoglobinuria",
  "Oliguria/Anuria",
];
