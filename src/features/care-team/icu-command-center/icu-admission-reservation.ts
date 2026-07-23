"use client";

export const ICU_ADMISSION_RESERVATION_EVENT = "plasmit-icu-admission-reservation";

const ICU_ADMISSION_RESERVATION_KEY = "plasmit-icu-admission-reservation-v1";

export type IcuAdmissionReservation = {
  id: string;
  patientName: string;
  uhid: string;
  bedNo: string;
  unit: string;
  status: "Reserved" | "Accepted";
  reservedAt: string;
};

export function readIcuAdmissionReservation() {
  if (typeof window === "undefined") return null;

  try {
    const saved = window.localStorage.getItem(ICU_ADMISSION_RESERVATION_KEY);
    return saved ? (JSON.parse(saved) as IcuAdmissionReservation) : null;
  } catch {
    return null;
  }
}

export function writeIcuAdmissionReservation(reservation: IcuAdmissionReservation) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ICU_ADMISSION_RESERVATION_KEY, JSON.stringify(reservation));
  window.dispatchEvent(new CustomEvent(ICU_ADMISSION_RESERVATION_EVENT, { detail: reservation }));
}

export function clearIcuAdmissionReservation() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ICU_ADMISSION_RESERVATION_KEY);
  window.dispatchEvent(new CustomEvent(ICU_ADMISSION_RESERVATION_EVENT, { detail: null }));
}
