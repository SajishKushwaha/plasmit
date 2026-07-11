"use client";

import * as React from "react";

import {
  admissionBeds,
  admissionRequests,
  billingClearances,
  lookupPatients,
  nurseReceiveChecklist,
} from "@/features/operations/admission/data/admission-data";
import type {
  AdmissionActivity,
  AdmissionBedStatus,
  AdmissionPatient,
  AdmissionPriority,
  AdmissionRequest,
  AdmissionScenario,
  AdmissionStoreState,
  BillingClearance,
  BillingClearanceStatus,
  NurseCareRecord,
  NurseReceiveRecord,
} from "@/features/operations/admission/types";

const STORAGE_KEY = "plasmit-admission-frontend-state-v1";
const STORE_EVENT = "plasmit-admission-store";

type DoctorOrderInput = {
  patientName: string;
  uhid: string;
  source: string;
  doctor: string;
  doctorTeam: string[];
  admittingTeam: string;
  admissionCategory: AdmissionRequest["admissionCategory"];
  type: string;
  ward: string;
  priority: AdmissionPriority;
  allergyNote: string;
  instructions: string;
  qrReference: string;
};

type BillingReviewInput = {
  clearanceId: string;
  status: BillingClearanceStatus;
  note?: string;
};

function nowLabel() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createActivity(title: string, detail: string): AdmissionActivity {
  return {
    id: `act-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    detail,
    at: nowLabel(),
  };
}

function withActivity(state: AdmissionStoreState, title: string, detail: string): AdmissionStoreState {
  return {
    ...state,
    activities: [createActivity(title, detail), ...state.activities].slice(0, 12),
  };
}

function initialState(): AdmissionStoreState {
  const requests = admissionRequests.map((request) => ({ ...request, createdAt: "20 May, 04:31 PM" }));
  return {
    patients: lookupPatients,
    requests,
    clearances: billingClearances.map((clearance, index) => ({
      ...clearance,
      requestId: requests[index % requests.length]?.id,
      status: "Pending",
    })),
    beds: admissionBeds,
    selectedPatientId: lookupPatients[0]?.id ?? null,
    activeRequestId: requests[0]?.id ?? null,
    selectedScenario: null,
    receiveRecords: [],
    careRecords: [],
    activities: [
      {
        id: "act-seeded",
        title: "Admission module ready",
        detail: "Frontend workflow state is loaded for reception, doctor, desk, billing, beds, and nursing.",
        at: "Initial",
      },
    ],
  };
}

function readState(): AdmissionStoreState {
  if (typeof window === "undefined") {
    return initialState();
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const seeded = initialState();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return { ...initialState(), ...JSON.parse(saved) } as AdmissionStoreState;
  } catch {
    return initialState();
  }
}

function writeState(state: AdmissionStoreState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: state }));
}

function generatedUhid(prefix = "UHID") {
  return `${prefix}-${Math.floor(20000 + Math.random() * 70000)}`;
}

function estimateRisk(priority: AdmissionPriority): BillingClearance["risk"] {
  if (priority === "Critical") return "High";
  return "Low";
}

export function useAdmissionStore() {
  const [state, setState] = React.useState<AdmissionStoreState>(() => readState());

  React.useEffect(() => {
    const handleStoreEvent = (event: Event) => {
      setState((event as CustomEvent<AdmissionStoreState>).detail ?? readState());
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setState(readState());
      }
    };

    window.addEventListener(STORE_EVENT, handleStoreEvent);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(STORE_EVENT, handleStoreEvent);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const update = React.useCallback((recipe: (current: AdmissionStoreState) => AdmissionStoreState) => {
    setState((current) => {
      const next = recipe(current);
      writeState(next);
      return next;
    });
  }, []);

  const actions = React.useMemo(() => ({
    resetDemo() {
      const next = initialState();
      writeState(next);
      setState(next);
    },
    selectPatient(patientId: string) {
      update((current) => ({ ...current, selectedPatientId: patientId }));
    },
    setActiveRequest(requestId: string) {
      update((current) => ({ ...current, activeRequestId: requestId }));
    },
    startScenario(scenario: AdmissionScenario) {
      update((current) => {
        let next = { ...current, selectedScenario: scenario };
        if (scenario === "New Patient Admission" || scenario === "Emergency Unknown Patient") {
          const patient: AdmissionPatient = {
            id: `pat-${Date.now()}`,
            name: scenario === "Emergency Unknown Patient" ? "Unknown Emergency Patient" : "New Admission Patient",
            uhid: generatedUhid(scenario === "Emergency Unknown Patient" ? "TEMP" : "UHID"),
            ageSex: scenario === "Emergency Unknown Patient" ? "Approx age" : "New",
            phone: scenario === "Emergency Unknown Patient" ? "Not available" : "Pending",
            status: "Clear for admission",
          };
          next = {
            ...next,
            patients: [patient, ...current.patients],
            selectedPatientId: patient.id,
          };
        }
        return withActivity(next, scenario, "Reception scenario selected and ready for doctor admission order.");
      });
    },
    submitDoctorOrder(input: DoctorOrderInput) {
      update((current) => {
        const patient =
          current.patients.find((item) => item.id === current.selectedPatientId) ??
          current.patients.find((item) => item.uhid === input.uhid);
        const request: AdmissionRequest = {
          id: `req-${Date.now()}`,
          patient: input.patientName || patient?.name || "Admission Patient",
          uhid: input.uhid || patient?.uhid || generatedUhid(),
          patientId: patient?.id,
          source: input.source,
          doctor: input.doctor,
          doctorTeam: input.doctorTeam,
          admittingTeam: input.admittingTeam,
          admissionCategory: input.admissionCategory,
          type: input.type,
          ward: input.ward,
          priority: input.priority,
          status: "Pending Bed Allotment",
          allergyNote: input.allergyNote,
          instructions: input.instructions,
          qrReference: input.qrReference,
          createdAt: nowLabel(),
        };
        const clearance: BillingClearance = {
          id: `bill-${Date.now()}`,
          patient: request.patient,
          uhid: request.uhid,
          requestId: request.id,
          holdType: input.priority === "Stable" ? "Self Pay" : "Pre-auth Pending",
          risk: estimateRisk(input.priority),
          estimate: input.ward === "ICU" ? 42000 : input.ward === "Private Ward" ? 28500 : 16000,
          note: input.priority === "Stable" ? "Stable admission billing review." : "Critical admission requires billing clearance before final bed confirmation.",
          status: "Pending",
        };
        return withActivity(
          {
            ...current,
            requests: [request, ...current.requests],
            clearances: [clearance, ...current.clearances],
            activeRequestId: request.id,
          },
          "Admission order submitted",
          `${request.patient} request created for ${request.ward}.`,
        );
      });
    },
    updateRequestStatus(requestId: string, status: AdmissionRequest["status"]) {
      update((current) => {
        const request = current.requests.find((item) => item.id === requestId);
        return withActivity(
          {
            ...current,
            requests: current.requests.map((item) => (item.id === requestId ? { ...item, status } : item)),
            activeRequestId: requestId,
          },
          "Request updated",
          `${request?.patient ?? "Request"} moved to ${status}.`,
        );
      });
    },
    reviewBilling(input: BillingReviewInput) {
      update((current) => {
        const clearance = current.clearances.find((item) => item.id === input.clearanceId);
        const requestId = clearance?.requestId;
        const requestStatus: AdmissionRequest["status"] = input.status === "Cleared" ? "Accepted" : "Billing Hold";
        return withActivity(
          {
            ...current,
            clearances: current.clearances.map((item) =>
              item.id === input.clearanceId ? { ...item, status: input.status, note: input.note || item.note } : item,
            ),
            requests: requestId
              ? current.requests.map((item) => (item.id === requestId ? { ...item, status: requestStatus } : item))
              : current.requests,
            activeRequestId: requestId ?? current.activeRequestId,
          },
          input.status === "Cleared" ? "Billing cleared" : "Billing hold",
          `${clearance?.patient ?? "Patient"} marked ${input.status}.`,
        );
      });
    },
    allotBed(bedId: string, requestId?: string) {
      update((current) => {
        const targetRequestId = requestId ?? current.activeRequestId;
        const request = current.requests.find((item) => item.id === targetRequestId);
        const bed = current.beds.find((item) => item.id === bedId);
        if (!targetRequestId || !request || !bed || bed.status !== "Available") {
          return withActivity(current, "Bed allotment blocked", "Select an available bed and active request before allotment.");
        }
        return withActivity(
          {
            ...current,
            beds: current.beds.map((item) => (item.id === bedId ? { ...item, status: "Reserved" as AdmissionBedStatus } : item)),
            requests: current.requests.map((item) =>
              item.id === targetRequestId ? { ...item, status: "Ready for Nursing", bedNo: bed.bedNo, ward: bed.ward } : item,
            ),
            activeRequestId: targetRequestId,
          },
          "Bed allotted",
          `${bed.bedNo} reserved for ${request.patient}.`,
        );
      });
    },
    confirmReceive(record: Omit<NurseReceiveRecord, "checklist"> & { checklist: string[] }) {
      update((current) => {
        const request = current.requests.find((item) => item.id === record.requestId);
        const checklist = nurseReceiveChecklist.filter((item) => record.checklist.includes(item));
        return withActivity(
          {
            ...current,
            receiveRecords: [
              { ...record, checklist },
              ...current.receiveRecords.filter((item) => item.requestId !== record.requestId),
            ],
            requests: current.requests.map((item) => (item.id === record.requestId ? { ...item, status: "Received" } : item)),
            activeRequestId: record.requestId,
          },
          "Patient received",
          `${request?.patient ?? "Patient"} received by ${record.receivedBy}.`,
        );
      });
    },
    startCare(record: NurseCareRecord) {
      update((current) => {
        const request = current.requests.find((item) => item.id === record.requestId);
        return withActivity(
          {
            ...current,
            careRecords: [record, ...current.careRecords.filter((item) => item.requestId !== record.requestId)],
            requests: current.requests.map((item) => (item.id === record.requestId ? { ...item, status: "Care Started" } : item)),
            activeRequestId: record.requestId,
          },
          "Patient care started",
          `${request?.patient ?? "Patient"} initial vitals recorded.`,
        );
      });
    },
    generateQr(requestId?: string) {
      update((current) => {
        const targetRequestId = requestId ?? current.activeRequestId ?? current.requests[0]?.id;
        const request = current.requests.find((item) => item.id === targetRequestId);
        if (!targetRequestId || !request) {
          return withActivity(current, "QR generation blocked", "Select an admission request before generating QR.");
        }
        const qrReference = `${request.uhid || "AUTO"}-${targetRequestId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        return withActivity(
          {
            ...current,
            requests: current.requests.map((item) => (item.id === targetRequestId ? { ...item, qrReference } : item)),
            activeRequestId: targetRequestId,
          },
          "Admission QR generated",
          `${request.patient} QR reference created.`,
        );
      });
    },
  }), [update]);

  const selectedPatient = state.patients.find((patient) => patient.id === state.selectedPatientId) ?? null;
  const activeRequest = state.requests.find((request) => request.id === state.activeRequestId) ?? state.requests[0] ?? null;

  return {
    state,
    selectedPatient,
    activeRequest,
    actions,
  };
}
