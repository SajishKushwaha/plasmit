import type { HeadNurseIcuPatient } from "./head-nurse-data";

const HOSPITAL_TIME_ZONE = "Asia/Kolkata";
const MONTH_NUMBERS: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

export function getHospitalDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: HOSPITAL_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value])) as Record<string, string>;
  return `${values.year}-${values.month}-${values.day}`;
}

export function getDischargeDateKey(dischargeTime?: string) {
  if (!dischargeTime) return null;
  const match = dischargeTime.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTH_NUMBERS[monthName];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

export function isPatientArchived(patient: Pick<HeadNurseIcuPatient, "dischargeTime">, hospitalDateKey = getHospitalDateKey()) {
  const dischargeDateKey = getDischargeDateKey(patient.dischargeTime);
  return dischargeDateKey !== null && dischargeDateKey < hospitalDateKey;
}
