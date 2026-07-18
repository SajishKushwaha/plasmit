"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  CreditCard,
  MessageSquareText,
  Minus,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  billingAppointments,
  billingDeskSteps,
  billingDoctorFees,
  billingPatients,
  billingReferrals,
  billingServices,
  type BillingReferral,
  type BillingDeskPatient,
  type BillingDeskService,
  type BillingDeskStep,
  type BillingAppointment,
} from "@/data/billing-desk";
import { cn } from "@/lib/utils";

type BillLine = BillingDeskService & { qty: number };
type PaymentLine = {
  id: string;
  mode: "Cash" | "Card" | "UPI" | "Insurance";
  amount: number;
  status: "Pending" | "Confirmed";
};
type AppointmentVisitType = BillingAppointment["visitType"];
type AppointmentBillingStatus = BillingAppointment["billingStatus"];
type BillingTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  insuranceAmount: number;
  paid: number;
  balance: number;
  patientPayable: number;
};
type BillingInvoice = {
  id: string;
  invoiceNo: string;
  createdAt: string;
  patient: BillingDeskPatient;
  referral: BillingReferral;
  lines: BillLine[];
  payments: PaymentLine[];
  totals: BillingTotals;
  status: "Paid" | "Partial" | "Due";
};
type BillingState = {
  activePatient: BillingDeskPatient;
  patients: BillingDeskPatient[];
  activeReferral: BillingReferral;
  lines: BillLine[];
  payments: PaymentLine[];
  invoices: BillingInvoice[];
  removedLine: BillLine | null;
  billStatus: "Draft" | "Ready" | "Paid" | "Partial";
  discountPercent: number;
  lastSavedAt: string;
};
type BillingAction =
  | { type: "selectPatient"; patient: BillingDeskPatient }
  | { type: "registerPatient"; patient: BillingDeskPatient }
  | { type: "selectReferral"; referral: BillingReferral }
  | { type: "addService"; service: BillingDeskService; qty?: number }
  | { type: "addPackage"; service: BillingDeskService }
  | { type: "qty"; id: string; delta: number }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "undoRemove" }
  | { type: "reset" }
  | { type: "pay"; mode: PaymentLine["mode"]; amount: number }
  | { type: "removePayment"; id: string }
  | { type: "discount"; value: number }
  | { type: "saveInvoice"; invoice: BillingInvoice }
  | { type: "loadInvoices"; invoices: BillingInvoice[] };

const invoiceStorageKey = "plasmit-billing-desk-static-invoices";
const manualServiceStorageKey = "plasmit-billing-desk-manual-services";

function readStoredInvoices(): BillingInvoice[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(invoiceStorageKey);
    return stored ? (JSON.parse(stored) as BillingInvoice[]) : [];
  } catch {
    return [];
  }
}

function readManualServices(category: BillingDeskService["category"]) {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(manualServiceStorageKey);
    const parsed = stored ? (JSON.parse(stored) as BillingDeskService[]) : [];
    return parsed.filter((service) => service.category === category);
  } catch {
    return [];
  }
}

function calculateTotals(
  lines: BillLine[],
  payments: PaymentLine[],
  patient: BillingDeskPatient,
  discountPercent = 0,
): BillingTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const lineDiscount = lines.reduce(
    (sum, line) => sum + (line.price * line.qty * line.discount) / 100,
    0,
  );
  const taxableBeforeBillDiscount = Math.max(subtotal - lineDiscount, 0);
  const billDiscount =
    (taxableBeforeBillDiscount * Math.min(Math.max(discountPercent, 0), 100)) / 100;
  const taxScale = taxableBeforeBillDiscount
    ? (taxableBeforeBillDiscount - billDiscount) / taxableBeforeBillDiscount
    : 0;
  const tax = lines.reduce((sum, line) => {
    const base = line.price * line.qty;
    return sum + ((base - (base * line.discount) / 100) * taxScale * line.tax) / 100;
  }, 0);
  const discount = lineDiscount + billDiscount;
  const total = subtotal - discount + tax;
  const confirmedPaid = payments
    .filter((payment) => payment.status === "Confirmed")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const insuranceAmount =
    patient.insuranceStatus === "Approved" || patient.insuranceStatus === "Pre-auth required"
      ? Math.round(total * 0.55)
      : 0;
  const patientPayable = Math.max(total - insuranceAmount, 0);
  return {
    subtotal,
    discount,
    tax,
    total,
    insuranceAmount,
    paid: confirmedPaid,
    patientPayable,
    balance: Math.max(patientPayable - confirmedPaid, 0),
  };
}

const initialBillingState: BillingState = {
  activePatient: billingPatients[0],
  patients: billingPatients,
  activeReferral: billingReferrals[3],
  lines: [
    { ...billingServices[0], qty: 1 },
    { ...billingServices[9], qty: 1 },
    { ...billingServices[11], qty: 1 },
  ],
  payments: [],
  invoices: [],
  removedLine: null,
  billStatus: "Draft",
  discountPercent: 0,
  lastSavedAt: "Autosaved just now",
};

function referralForPatient(patient: BillingDeskPatient) {
  return (
    billingReferrals.find(
      (referral) =>
        referral.doctor === patient.referralSource ||
        referral.organization === patient.referralSource ||
        referral.source === patient.referralSource,
    ) ?? billingReferrals[0]
  );
}

function billingReducer(state: BillingState, action: BillingAction): BillingState {
  const saved = "Autosaved just now";
  if (action.type === "selectPatient") {
    return {
      ...state,
      activePatient: action.patient,
      activeReferral: referralForPatient(action.patient),
      billStatus: "Draft",
      lastSavedAt: saved,
    };
  }
  if (action.type === "registerPatient") {
    return {
      ...state,
      patients: [action.patient, ...state.patients],
      activePatient: action.patient,
      activeReferral: referralForPatient(action.patient),
      lastSavedAt: saved,
    };
  }
  if (action.type === "selectReferral")
    return { ...state, activeReferral: action.referral, lastSavedAt: saved };
  if (action.type === "addPackage") {
    const included = (action.service.includedServiceIds ?? [])
      .map((id) => billingServices.find((service) => service.id === id))
      .filter(Boolean) as BillingDeskService[];
    const withoutDupes = [
      action.service,
      ...included.map((service) => ({ ...service, discount: 100 })),
    ].filter((service) => !state.lines.some((line) => line.id === service.id));
    return {
      ...state,
      lines: [...state.lines, ...withoutDupes.map((service) => ({ ...service, qty: 1 }))],
      billStatus: "Ready",
      lastSavedAt: saved,
    };
  }
  if (action.type === "addService") {
    if (state.lines.some((line) => line.id === action.service.id)) return state;
    return {
      ...state,
      lines: [...state.lines, { ...action.service, qty: action.qty ?? 1 }],
      billStatus: "Ready",
      lastSavedAt: saved,
    };
  }
  if (action.type === "qty") {
    const targetLine = state.lines.find((line) => line.id === action.id);
    const nextQty = Math.max(0, (targetLine?.qty ?? 0) + action.delta);
    if (targetLine && nextQty === 0)
      return {
        ...state,
        lines: state.lines.filter((line) => line.id !== action.id),
        removedLine: targetLine,
        lastSavedAt: saved,
      };
    return {
      ...state,
      lines: state.lines.map((line) => (line.id === action.id ? { ...line, qty: nextQty } : line)),
      lastSavedAt: saved,
    };
  }
  if (action.type === "setQty") {
    const targetLine = state.lines.find((line) => line.id === action.id);
    const nextQty = Math.max(0, Math.floor(action.qty || 0));
    if (targetLine && nextQty === 0)
      return {
        ...state,
        lines: state.lines.filter((line) => line.id !== action.id),
        removedLine: targetLine,
        lastSavedAt: saved,
      };
    return {
      ...state,
      lines: state.lines.map((line) => (line.id === action.id ? { ...line, qty: nextQty } : line)),
      lastSavedAt: saved,
    };
  }
  if (action.type === "remove") {
    const removedLine = state.lines.find((line) => line.id === action.id) ?? null;
    return {
      ...state,
      lines: state.lines.filter((line) => line.id !== action.id),
      removedLine,
      lastSavedAt: saved,
    };
  }
  if (action.type === "undoRemove" && state.removedLine)
    return {
      ...state,
      lines: [...state.lines, state.removedLine],
      removedLine: null,
      lastSavedAt: saved,
    };
  if (action.type === "pay") {
    const payments = [
      ...state.payments,
      {
        id: `pay-${Date.now()}`,
        mode: action.mode,
        amount: action.amount,
        status: "Confirmed" as const,
      },
    ];
    const totals = calculateTotals(
      state.lines,
      payments,
      state.activePatient,
      state.discountPercent,
    );
    return {
      ...state,
      payments,
      billStatus: totals.balance <= 0 ? "Paid" : "Partial",
      lastSavedAt: saved,
    };
  }
  if (action.type === "removePayment") {
    const payments = state.payments.filter((payment) => payment.id !== action.id);
    const totals = calculateTotals(
      state.lines,
      payments,
      state.activePatient,
      state.discountPercent,
    );
    return {
      ...state,
      payments,
      billStatus: totals.paid ? "Partial" : "Ready",
      lastSavedAt: saved,
    };
  }
  if (action.type === "discount")
    return {
      ...state,
      discountPercent: Math.min(Math.max(action.value, 0), 100),
      billStatus: "Ready",
      lastSavedAt: saved,
    };
  if (action.type === "saveInvoice")
    return {
      ...state,
      invoices: [action.invoice, ...state.invoices].slice(0, 12),
      billStatus: action.invoice.status === "Paid" ? "Paid" : "Partial",
      lastSavedAt: saved,
    };
  if (action.type === "loadInvoices") return { ...state, invoices: action.invoices };
  if (action.type === "reset")
    return {
      ...initialBillingState,
      activePatient: state.activePatient,
      patients: state.patients,
      activeReferral: state.activeReferral,
      invoices: state.invoices,
    };
  return state;
}

const BillingDeskContext = React.createContext<{
  state: BillingState;
  totals: BillingTotals;
  dispatch: React.Dispatch<BillingAction>;
  addService: (_service: BillingDeskService) => void;
} | null>(null);

function useBillingDesk() {
  const context = React.useContext(BillingDeskContext);
  if (!context) throw new Error("BillingDeskContext missing");
  return context;
}

function BillingDeskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(billingReducer, initialBillingState);
  const invoicesLoadedRef = React.useRef(false);
  const totals = React.useMemo(
    () => calculateTotals(state.lines, state.payments, state.activePatient, state.discountPercent),
    [state.lines, state.payments, state.activePatient, state.discountPercent],
  );
  const addService = React.useCallback(
    (service: BillingDeskService) => {
      const duplicate = state.lines.some((line) => line.id === service.id);
      if (duplicate) {
        toast.warning(`${service.name} already added`);
        return;
      }
      dispatch(
        service.category === "Package"
          ? { type: "addPackage", service }
          : { type: "addService", service },
      );
      toast.success(`${service.name} added to bill`);
    },
    [state.lines],
  );
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      dispatch({ type: "loadInvoices", invoices: readStoredInvoices() });
      invoicesLoadedRef.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  React.useEffect(() => {
    window.localStorage.setItem(
      "plasmit-billing-desk-draft",
      JSON.stringify({
        patient: state.activePatient.uhid,
        lines: state.lines.length,
        discountPercent: state.discountPercent,
        at: state.lastSavedAt,
      }),
    );
  }, [state.activePatient.uhid, state.lines.length, state.discountPercent, state.lastSavedAt]);
  React.useEffect(() => {
    if (!invoicesLoadedRef.current) return;
    window.localStorage.setItem(invoiceStorageKey, JSON.stringify(state.invoices));
  }, [state.invoices]);
  return (
    <BillingDeskContext.Provider value={{ state, totals, dispatch, addService }}>
      {children}
    </BillingDeskContext.Provider>
  );
}

const stepRoute: Record<BillingDeskStep, string> = {
  patient: "/billing-desk/patient",
  referral: "/billing-desk",
  appointments: "/billing-desk",
  pathology: "/billing-desk/tests",
  radiology: "/billing-desk/tests",
  packages: "/billing-desk/packages",
  "quick-tests": "/billing-desk/tests",
  "individual-tests": "/billing-desk/tests",
  summary: "/billing-desk/summary",
  payment: "/billing-desk/payment",
};

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function invoiceStatus(totals: BillingTotals): BillingInvoice["status"] {
  if (totals.balance <= 0) return "Paid";
  return totals.paid > 0 ? "Partial" : "Due";
}

function createInvoiceNo() {
  const date = new Date();
  const dayKey = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `INV-${dayKey}-${String(date.getTime()).slice(-5)}`;
}

function PageMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function BillingDeskTopbar() {
  return (
    <Card className="sticky top-0 z-20">
      <CardContent className="flex flex-col gap-3 p-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search staff, settings, profile..." />
          <Badge tone="muted" className="hidden shrink-0 md:inline-flex">
            Ctrl K
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Messages">
            <MessageSquareText className="h-4 w-4" />
          </Button>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-2 shadow-sm">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              RB
            </div>
            <div className="hidden text-xs sm:block">
              <div className="font-bold text-foreground">Rohit B.</div>
              <div className="text-muted-foreground">Billing Desk</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowTabs({
  active,
  onChange,
}: {
  active: BillingDeskStep;
  onChange: (_step: BillingDeskStep) => void;
}) {
  return (
    <Card className="sticky top-16 z-10">
      <CardContent className="tabs-scroll-list relative flex gap-1 overflow-x-auto p-2 pb-3">
        {billingDeskSteps.slice(0, 9).map((step) => {
          const Icon = step.icon;
          const selected = active === step.id;
          return (
            <button
              key={step.id}
              onClick={() => onChange(step.id)}
              className={cn(
                "flex h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition",
                selected
                  ? "bg-primary text-white shadow-[0_8px_18px_rgba(115,103,240,0.20)]"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{step.label}</span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function PatientCard({
  patient,
  selected,
  onSelect,
}: {
  patient: BillingDeskPatient;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border bg-white p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:bg-primary-soft/40 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]",
        selected ? "border-primary ring-2 ring-primary/15" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-base font-bold text-foreground">{patient.name}</div>
          <div className="mt-1 text-xs font-semibold text-muted-foreground">
            {patient.uhid} • {patient.phone}
          </div>
        </div>
        {selected ? (
          <Badge tone="info">Selected</Badge>
        ) : (
          <Badge
            tone={
              patient.status === "Due"
                ? "warning"
                : patient.status === "Insurance"
                  ? "info"
                  : "muted"
            }
          >
            {patient.status}
          </Badge>
        )}
      </div>
      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
        <span>{patient.ageGender}</span>
        <span>Blood {patient.bloodGroup}</span>
        <span>Reg {patient.registeredAt}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="muted">{patient.payer}</Badge>
        <Badge
          tone={
            patient.insuranceStatus === "Approved"
              ? "success"
              : patient.insuranceStatus === "Pre-auth required" ||
                  patient.insuranceStatus === "Pending"
                ? "warning"
                : "muted"
          }
        >
          {patient.insuranceStatus}
        </Badge>
        <Badge tone="muted">{patient.lastVisit}</Badge>
      </div>
    </button>
  );
}

function PatientWorkspace({
  selectedPatient,
  patients,
  onSelect,
  onRegister,
}: {
  selectedPatient: BillingDeskPatient;
  patients: BillingDeskPatient[];
  onSelect: (_patient: BillingDeskPatient) => void;
  onRegister: (_patient: BillingDeskPatient) => void;
}) {
  const stateCityOptions: Record<string, string[]> = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
    Assam: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
    Bihar: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga"],
    Chandigarh: ["Chandigarh"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    Maharashtra: ["Pune", "Mumbai", "Nagpur", "Nashik", "Thane"],
    Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
    Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    Haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Kullu"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    Karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Belagavi"],
    Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
    Manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching"],
    Meghalaya: ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara"],
    Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
    Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Puri", "Sambalpur"],
    Puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Mohali"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    Sikkim: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
    Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
    "Uttar Pradesh": ["Noida", "Lucknow", "Ghaziabad", "Kanpur", "Varanasi"],
    Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
  };
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [payer, setPayer] = React.useState("All payers");
  const [city, setCity] = React.useState("All cities");
  const [source, setSource] = React.useState("All sources");
  const [page, setPage] = React.useState(1);
  const [registerOpen, setRegisterOpen] = React.useState(false);
  const [draft, setDraft] = React.useState({
    name: "",
    phone: "",
    age: "",
    gender: "Female",
    dob: "",
    bloodGroup: "O+",
    payerType: "Self",
    payer: "Self",
    department: "General Medicine",
    visitType: "OPD",
    city: "Pune",
    state: "Maharashtra",
    address: "",
    email: "",
    idType: "Aadhaar",
    idNumber: "",
    source: "Walk-in",
    doctor: "Dr. Kavita Rao",
  });
  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 220);
    return () => window.clearTimeout(timer);
  }, [search]);
  React.useEffect(() => {
    const timer = window.setTimeout(() => setPage(1), 0);
    return () => window.clearTimeout(timer);
  }, [debouncedSearch, payer, city, source]);
  const registerStateOptions = Object.keys(stateCityOptions);
  const registerCityOptions = stateCityOptions[draft.state] ?? [];
  const payers = ["All payers", ...Array.from(new Set(patients.map((patient) => patient.payer)))];
  const cities = ["All cities", ...Array.from(new Set(patients.map((patient) => patient.city)))];
  const sources = [
    "All sources",
    ...Array.from(new Set(patients.map((patient) => patient.source))),
  ];
  const rows = patients.filter((patient) => {
    const matchesSearch =
      `${patient.name} ${patient.uhid} ${patient.phone} ${patient.bloodGroup} ${patient.address} ${patient.payer} ${patient.city}`
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
    return (
      matchesSearch &&
      (payer === "All payers" || patient.payer === payer) &&
      (city === "All cities" || patient.city === city) &&
      (source === "All sources" || patient.source === source)
    );
  });
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visibleRows = rows.slice((page - 1) * pageSize, page * pageSize);
  const duplicate = patients.some(
    (patient) => patient.phone.replace(/\D/g, "") === draft.phone.replace(/\D/g, "") && draft.phone,
  );
  const createPatient = () => {
    if (!draft.name.trim() || draft.phone.replace(/\D/g, "").length < 8) {
      toast.error("Patient name and valid phone are required");
      return;
    }
    const now = Date.now().toString();
    const patient: BillingDeskPatient = {
      id: `pat-${now}`,
      name: draft.name.trim(),
      uhid: `PLH-${now.slice(-6)}`,
      phone: draft.phone,
      ageGender: `${draft.age || "New"}/${draft.gender.charAt(0)}`,
      bloodGroup: draft.bloodGroup,
      registeredAt: "Today",
      payer: draft.payer,
      address: draft.address || "Quick registration address pending",
      city: draft.city,
      source: draft.visitType,
      doctor: draft.doctor,
      status:
        draft.payerType === "Self"
          ? "Active"
          : draft.payerType === "Corporate"
            ? "Corporate"
            : "Insurance",
      referralSource: draft.source,
      lastVisit: "New registration",
      insuranceStatus: draft.payerType === "Self" ? "Not required" : "Pending",
    };
    onRegister(patient);
    setRegisterOpen(false);
    setDraft({
      name: "",
      phone: "",
      age: "",
      gender: "Female",
      dob: "",
      bloodGroup: "O+",
      payerType: "Self",
      payer: "Self",
      department: "General Medicine",
      visitType: "OPD",
      city: "Pune",
      state: "Maharashtra",
      address: "",
      email: "",
      idType: "Aadhaar",
      idNumber: "",
      source: "Walk-in",
      doctor: "Dr. Kavita Rao",
    });
    toast.success(`${patient.name} registered and selected`);
  };
  return (
    <div className="space-y-4">
      {!registerOpen ? (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 lg:flex-row">
              <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-white px-3 shadow-sm">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  className="border-0 shadow-none focus:ring-0"
                  placeholder="Search by patient, UHID, phone, payer, city..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <PatientFilter label="Payer" value={payer} onChange={setPayer} options={payers} />
              <PatientFilter label="City" value={city} onChange={setCity} options={cities} />
              <PatientFilter label="Source" value={source} onChange={setSource} options={sources} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{rows.length} matching patients</span>
              {search ||
              payer !== "All payers" ||
              city !== "All cities" ||
              source !== "All sources" ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setPayer("All payers");
                    setCity("All cities");
                    setSource("All sources");
                  }}
                >
                  Clear filters
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {patients.slice(0, 3).map((patient) => (
                <Button
                  key={patient.id}
                  size="sm"
                  variant={selectedPatient.id === patient.id ? "default" : "outline"}
                  onClick={() => onSelect(patient)}
                >
                  {patient.name}
                </Button>
              ))}
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {visibleRows.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  selected={selectedPatient.id === patient.id}
                  onSelect={() => {
                    onSelect(patient);
                    toast.success(`${patient.name} selected`);
                  }}
                />
              ))}
            </div>
            {!rows.length ? (
              <EmptyState
                icon={Search}
                title="No patient found"
                description="Try another UHID, phone number, city, payer, or blood group."
              />
            ) : null}
            {rows.length > pageSize ? (
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
                <span className="font-semibold text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      <Card className={registerOpen ? "" : "border-dashed"}>
        {!registerOpen ? (
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-bold text-foreground">Register New Patient</div>
              <div className="text-sm text-muted-foreground">
                Create UHID from the billing desk when no existing patient is found.
              </div>
            </div>
            <Button
              variant={registerOpen ? "default" : "outline"}
              onClick={() => setRegisterOpen((open) => !open)}
            >
              <Plus className="h-4 w-4" />
              {registerOpen ? "Close registration" : "Open quick registration"}
            </Button>
          </CardContent>
        ) : null}
        {registerOpen ? (
          <CardContent className="bg-surface-muted/45 p-4">
            {duplicate ? (
              <AlertHint text="Duplicate detection: this phone number already exists in patient master." />
            ) : null}
            <div className="rounded-xl border border-border bg-white shadow-soft">
              <div className="flex flex-col gap-2 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-base font-bold text-foreground">Patient details</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    Basic demographic and contact information
                  </div>
                </div>
                <Badge tone="info">New UHID</Badge>
              </div>
              <div className="grid gap-x-4 gap-y-5 p-5 md:grid-cols-2 xl:grid-cols-4">
                <QuickRegisterField
                  label="Patient name"
                  required
                  value={draft.name}
                  placeholder="e.g. Meera Joshi"
                  autoComplete="name"
                  onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
                />
                <QuickRegisterField
                  label="Phone"
                  required
                  type="tel"
                  value={draft.phone}
                  placeholder="+91 98765 44210"
                  autoComplete="tel"
                  onChange={(value) => setDraft((current) => ({ ...current, phone: value }))}
                />
                <QuickRegisterField
                  label="Age"
                  required
                  type="number"
                  value={draft.age}
                  placeholder="42"
                  autoComplete="off"
                  onChange={(value) => setDraft((current) => ({ ...current, age: value }))}
                />
                <QuickRegisterSelect
                  label="Gender"
                  required
                  value={draft.gender}
                  onChange={(value) => setDraft((current) => ({ ...current, gender: value }))}
                  options={["Female", "Male", "Other", "Unknown"].map((item) => ({
                    label: item,
                    value: item,
                  }))}
                />
                <QuickRegisterField
                  label="Date of birth"
                  type="date"
                  value={draft.dob}
                  placeholder="18 Apr 1984"
                  autoComplete="bday"
                  onChange={(value) => setDraft((current) => ({ ...current, dob: value }))}
                />
                <QuickRegisterSelect
                  label="Blood group"
                  value={draft.bloodGroup}
                  onChange={(value) => setDraft((current) => ({ ...current, bloodGroup: value }))}
                  options={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"].map(
                    (item) => ({ label: item, value: item }),
                  )}
                />
                <QuickRegisterSelect
                  label="ID type"
                  value={draft.idType}
                  onChange={(value) => setDraft((current) => ({ ...current, idType: value }))}
                  options={[
                    "Aadhaar",
                    "PAN",
                    "Passport",
                    "Driving license",
                    "Voter ID",
                    "Not available",
                  ].map((item) => ({ label: item, value: item }))}
                />
                <QuickRegisterField
                  label="ID number"
                  value={draft.idNumber}
                  placeholder="Masked / last 4 digits"
                  autoComplete="off"
                  onChange={(value) => setDraft((current) => ({ ...current, idNumber: value }))}
                />
                <QuickRegisterField
                  label="Email"
                  type="email"
                  value={draft.email}
                  placeholder="patient@example.com"
                  autoComplete="email"
                  onChange={(value) => setDraft((current) => ({ ...current, email: value }))}
                />
                <QuickRegisterSelect
                  label="State"
                  value={draft.state}
                  onChange={(value) =>
                    setDraft((current) => ({
                      ...current,
                      state: value,
                      city: stateCityOptions[value]?.[0] ?? "",
                    }))
                  }
                  options={registerStateOptions.map((item) => ({ label: item, value: item }))}
                />
                <QuickRegisterSelect
                  label="City"
                  value={draft.city}
                  onChange={(value) => setDraft((current) => ({ ...current, city: value }))}
                  options={registerCityOptions.map((item) => ({ label: item, value: item }))}
                />
                <QuickRegisterField
                  label="Address"
                  value={draft.address}
                  placeholder="House / area / landmark"
                  autoComplete="street-address"
                  onChange={(value) => setDraft((current) => ({ ...current, address: value }))}
                  className="md:col-span-2 xl:col-span-4"
                />
              </div>
              <div className="flex flex-col gap-3 border-t border-border bg-surface-muted/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="text-xs font-medium text-muted-foreground">
                  New patient will be auto-selected in Billing Desk after UHID creation.
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRegisterOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createPatient}>Create UHID & select</Button>
                </div>
              </div>
            </div>
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}

function QuickRegisterField({
  label,
  value,
  placeholder,
  onChange,
  required,
  className,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (_value: string) => void;
  required?: boolean;
  className?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
}) {
  const id = React.useId();
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-center justify-between gap-2 text-xs font-bold text-muted-foreground"
      >
        <span>{label}</span>
        {required ? <span className="text-[11px] font-bold text-danger">Required</span> : null}
      </label>
      <Input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="h-11 rounded-md border-input bg-white px-3 text-sm font-semibold shadow-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function QuickRegisterSelect({
  label,
  value,
  onChange,
  options,
  required,
  className,
}: {
  label: string;
  value: string;
  onChange: (_value: string) => void;
  options: { label: string; value: string }[];
  required?: boolean;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div className={cn("group space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-center justify-between gap-2 text-xs font-bold text-muted-foreground"
      >
        <span>{label}</span>
        {required ? <span className="text-[11px] font-bold text-danger">Required</span> : null}
      </label>
      <span className="relative block">
        <select
          id={id}
          required={required}
          className="h-11 w-full appearance-none rounded-md border border-input bg-white px-3 pr-10 text-sm font-semibold text-foreground shadow-sm outline-none transition hover:border-primary/45 focus:border-primary focus:ring-2 focus:ring-primary/15"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-muted text-muted-foreground transition group-focus-within:border-primary/30 group-focus-within:bg-primary-soft group-focus-within:text-primary">
          <ChevronDown className="h-4 w-4" />
        </span>
      </span>
    </div>
  );
}

function PatientFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (_value: string) => void;
  options: string[];
}) {
  return (
    <label className="relative min-w-[150px]">
      <span className="sr-only">{label}</span>
      <select
        className="h-10 w-full appearance-none rounded-lg border border-input bg-white px-3 pr-9 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
    </label>
  );
}

function ServiceCard({
  service,
  added,
  onAdd,
}: {
  service: BillingDeskService;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <Card
      className={cn(
        "transition hover:-translate-y-0.5 hover:shadow-[0_12px_26px_rgba(39,37,54,0.08)]",
        added ? "border-primary" : "",
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-bold text-foreground">{service.name}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {service.group} • {service.meta}
            </div>
          </div>
          <Badge
            tone={
              service.urgency === "Stat"
                ? "danger"
                : service.urgency === "Urgent"
                  ? "warning"
                  : "muted"
            }
          >
            {service.urgency ?? service.category}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {service.tat ? <Badge tone="muted">TAT {service.tat}</Badge> : null}
          {service.sample ? <Badge tone="muted">{service.sample}</Badge> : null}
          {service.modality ? <Badge tone="info">{service.modality}</Badge> : null}
          {service.fasting ? <Badge tone="warning">Fasting</Badge> : null}
          {service.contrast ? <Badge tone="warning">Contrast</Badge> : null}
          {service.insuranceCovered ? <Badge tone="success">Insurance covered</Badge> : null}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-foreground">{money(service.price)}</div>
          <Button size="sm" variant={added ? "outline" : "default"} onClick={onAdd}>
            {added ? "Added" : "Add"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReferralWorkspace({
  activeReferral,
  onSelect,
}: {
  activeReferral: BillingReferral;
  onSelect: (_referral: BillingReferral) => void;
}) {
  const [source, setSource] = React.useState<BillingReferral["source"]>(activeReferral.source);
  const [entryMode, setEntryMode] = React.useState<"Existing" | "Manual">(
    activeReferral.id.startsWith("manual-") ? "Manual" : "Existing",
  );
  const [manualDoctor, setManualDoctor] = React.useState("");
  const [manualClinic, setManualClinic] = React.useState("");
  const sources = Array.from(
    new Set(billingReferrals.map((item) => item.source)),
  ) as BillingReferral["source"][];
  const rows = billingReferrals.filter((item) => item.source === source);
  const selectedReferral =
    rows.find((referral) => referral.id === activeReferral.id) ?? rows[0] ?? activeReferral;
  const manualLabel =
    source === "Doctor"
      ? "Doctor name"
      : source === "Corporate"
        ? "Company / corporate name"
        : source === "TPA"
          ? "TPA name"
          : source === "Camp"
            ? "Camp / organizer name"
            : "Referral name";
  const organizationLabel = source === "Doctor" ? "Clinic / hospital" : "Organization details";
  const updateSource = (value: string) => {
    const nextSource = value as BillingReferral["source"];
    const nextRows = billingReferrals.filter((item) => item.source === nextSource);
    setSource(nextSource);
    setEntryMode("Existing");
    if (nextRows[0]) onSelect(nextRows[0]);
  };
  const clearReferral = () => {
    setManualDoctor("");
    setManualClinic("");
    const walkIn =
      billingReferrals.find((item) => item.source === "Walk-in") ?? billingReferrals[0];
    setSource(walkIn.source);
    setEntryMode("Existing");
    onSelect(walkIn);
  };
  const updateReferral = (id: string) => {
    if (id === "manual-entry" || id === "") {
      setEntryMode("Manual");
      setManualDoctor("");
      return;
    }
    const nextReferral = billingReferrals.find((referral) => referral.id === id);
    if (!nextReferral) return;
    setEntryMode("Existing");
    onSelect(nextReferral);
    toast.success(`${nextReferral.doctor} referral selected`);
  };
  const useManualReferral = () => {
    const doctor = manualDoctor.trim();
    if (!doctor) {
      toast.error("Enter referral doctor name");
      return;
    }
    const referral: BillingReferral = {
      id: `manual-${Date.now()}`,
      doctor,
      source,
      organization: manualClinic.trim() || "Manual referral",
      commission: "Manual review",
      status: "Approval needed",
      notes: "Manual referral added from billing desk. Verify commission before final bill audit.",
    };
    onSelect(referral);
    setEntryMode("Manual");
    toast.success(`${doctor} added as referral doctor`);
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Referral Details</CardTitle>
              <CardDescription>Referred-by information for this bill.</CardDescription>
            </div>
            <Badge
              tone={
                activeReferral.status === "Approval needed"
                  ? "warning"
                  : activeReferral.status === "Mapped"
                    ? "success"
                    : "muted"
              }
            >
              {activeReferral.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground">Referral type</div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {sources.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateSource(item)}
                    className={cn(
                      "h-10 rounded-md border px-3 text-sm font-bold transition",
                      source === item
                        ? "border-primary bg-primary text-white shadow-sm"
                        : "border-border bg-white text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-border bg-surface-muted p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <QuickRegisterSelect
                label="Entry mode"
                value={entryMode}
                onChange={(value) => setEntryMode(value as "Existing" | "Manual")}
                options={["Existing", "Manual"].map((item) => ({ label: item, value: item }))}
              />
              {entryMode === "Existing" ? (
                <QuickRegisterSelect
                  label="Referred by"
                  value={activeReferral.id.startsWith("manual-") ? "" : selectedReferral.id}
                  onChange={updateReferral}
                  options={[
                    ...rows.map((referral) => ({
                      label: `${referral.doctor} - ${referral.organization}`,
                      value: referral.id,
                    })),
                    { label: "Doctor not found - add manually", value: "manual-entry" },
                  ]}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <QuickRegisterField
                    label={manualLabel}
                    value={manualDoctor}
                    placeholder={`Enter ${manualLabel.toLowerCase()}`}
                    autoComplete="off"
                    onChange={setManualDoctor}
                  />
                  <QuickRegisterField
                    label={organizationLabel}
                    value={manualClinic}
                    placeholder="Optional"
                    autoComplete="organization"
                    onChange={setManualClinic}
                  />
                </div>
              )}
              {entryMode === "Manual" ? (
                <div className="md:col-start-2">
                  <Button className="h-11 w-full md:w-auto" onClick={useManualReferral}>
                    Add manual referral
                  </Button>
                </div>
              ) : null}
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">Referral note</span>
              <textarea
                className="min-h-24 w-full resize-none rounded-md border border-input bg-white px-3 py-2 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                defaultValue={activeReferral.notes}
                key={activeReferral.id}
              />
            </label>
          </div>

          <aside className="rounded-lg border border-border bg-white">
            <div className="border-b border-border px-4 py-3">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                Saved referral
              </div>
              <div className="mt-2 text-base font-bold text-foreground">
                {activeReferral.doctor}
              </div>
              <div className="mt-1 text-xs font-semibold text-muted-foreground">
                {activeReferral.organization}
              </div>
            </div>
            <div className="divide-y divide-border">
              <ReferralInfoCell label="Type" value={activeReferral.source} />
              <ReferralInfoCell label="Billing rule" value={activeReferral.commission} />
              <ReferralInfoCell
                label="Record"
                value={activeReferral.id.startsWith("manual-") ? "Manual" : "Master"}
              />
            </div>
            <div className="space-y-2 border-t border-border p-4">
              <Button
                className="w-full"
                onClick={() => toast.success("Referral saved for this bill")}
              >
                Save referral
              </Button>
              <Button className="w-full" variant="outline" onClick={clearReferral}>
                Mark walk-in
              </Button>
            </div>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}

function ReferralInfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <div className="text-xs font-bold text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function AppointmentsWorkspace({
  patient,
  onAdd,
}: {
  patient: BillingDeskPatient;
  onAdd: (_service: BillingDeskService) => void;
}) {
  const patientAppointments = billingAppointments.filter(
    (appointment) => appointment.patientId === patient.id,
  );
  const appointments = patientAppointments.length ? patientAppointments : billingAppointments;
  const firstAppointment = appointments[0];
  const appointmentDoctors = Array.from(
    new Set(appointments.map((appointment) => appointment.doctor)),
  );
  const [mappedDoctor, setMappedDoctor] = React.useState(firstAppointment.doctor);
  const availableAppointments = appointments.filter(
    (appointment) => appointment.doctor === mappedDoctor,
  );
  const [selectedId, setSelectedId] = React.useState(firstAppointment.id);
  const selected =
    availableAppointments.find((appointment) => appointment.id === selectedId) ??
    availableAppointments[0] ??
    firstAppointment;
  const [appointmentDepartment, setAppointmentDepartment] = React.useState(
    firstAppointment.department,
  );
  const [billingStatus, setBillingStatus] = React.useState(firstAppointment.billingStatus);
  const [visitType, setVisitType] = React.useState(firstAppointment.visitType);
  const doctorFee =
    billingDoctorFees.find((doctor) => doctor.doctor === mappedDoctor) ?? billingDoctorFees[0];
  const appointmentDepartments = Array.from(
    new Set([
      ...appointments.map((appointment) => appointment.department),
      ...billingDoctorFees.map((doctor) => doctor.department),
    ]),
  );
  const discount = billingStatus === "Package covered" ? 100 : 0;
  const billableAmount = doctorFee.fee - (doctorFee.fee * discount) / 100;
  const selectAppointment = (value: string) => {
    const next = availableAppointments.find((appointment) => appointment.id === value);
    setSelectedId(value);
    if (next) {
      setAppointmentDepartment(next.department);
      setBillingStatus(next.billingStatus);
      setVisitType(next.visitType);
    }
  };
  const selectDoctor = (value: string) => {
    const nextDoctor = billingDoctorFees.find((doctor) => doctor.doctor === value);
    const nextAppointment = appointments.find((appointment) => appointment.doctor === value);
    setMappedDoctor(value);
    if (nextAppointment) {
      setSelectedId(nextAppointment.id);
      setAppointmentDepartment(nextAppointment.department);
      setBillingStatus(nextAppointment.billingStatus);
      setVisitType(nextAppointment.visitType);
      return;
    }
    if (nextDoctor) setAppointmentDepartment(nextDoctor.department);
  };
  const addAppointmentFee = () => {
    onAdd({
      id: `appt-fee-${selected.id}-${mappedDoctor.toLowerCase().replaceAll(" ", "-").replaceAll(".", "")}`,
      name: `${appointmentDepartment} consultation fee`,
      category: "Appointment",
      group: appointmentDepartment,
      price: doctorFee.fee,
      discount,
      tax: 0,
      meta: `${selected.appointmentNo} • ${mappedDoctor} • ${visitType} • ${selected.slot}`,
    });
  };
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle>Appointment Billing</CardTitle>
            <CardDescription>
              Select an appointment and prepare consultation fee for the bill.
            </CardDescription>
          </div>
          <Badge
            tone={
              selected.status === "Checked-in" || selected.status === "Waiting"
                ? "success"
                : selected.status === "Completed"
                  ? "muted"
                  : "info"
            }
          >
            {selected.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-4 rounded-lg border border-border bg-surface-muted p-4 md:grid-cols-2">
            <SelectField
              label="Doctor"
              value={mappedDoctor}
              onChange={selectDoctor}
              options={appointmentDoctors.map((doctor) => ({ label: doctor, value: doctor }))}
            />
            <SelectField
              label="Appointment"
              value={selected.id}
              onChange={selectAppointment}
              options={availableAppointments.map((appointment) => ({
                label: `${appointment.appointmentNo} - ${appointment.slot}`,
                value: appointment.id,
              }))}
            />
            <SelectField
              label="Department"
              value={appointmentDepartment}
              onChange={setAppointmentDepartment}
              options={appointmentDepartments.map((department) => ({
                label: department,
                value: department,
              }))}
            />
            <SelectField
              label="Visit type"
              value={visitType}
              onChange={(value) => setVisitType(value as AppointmentVisitType)}
              options={["New", "Follow-up", "Review", "Teleconsult"].map((item) => ({
                label: item,
                value: item,
              }))}
            />
            <SelectField
              label="Billing status"
              value={billingStatus}
              onChange={(value) => setBillingStatus(value as AppointmentBillingStatus)}
              options={["Unbilled", "Billed", "Package covered"].map((item) => ({
                label: item,
                value: item,
              }))}
            />
          </div>

          <section className="rounded-lg border border-border bg-white">
            <div className="flex flex-col gap-3 border-b border-border px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase text-muted-foreground">
                  Selected appointment
                </div>
                <div className="mt-1 text-sm font-bold text-foreground">
                  {selected.appointmentNo}
                </div>
                <div className="mt-1 text-xs font-semibold text-muted-foreground">
                  {selected.department} • {selected.doctor}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="info">{selected.slot}</Badge>
                <Badge
                  tone={
                    billingStatus === "Package covered"
                      ? "warning"
                      : billingStatus === "Billed"
                        ? "success"
                        : "muted"
                  }
                >
                  {billingStatus}
                </Badge>
              </div>
            </div>
            <div className="grid gap-0 md:grid-cols-4">
              <ReferralInfoCell label="Department" value={appointmentDepartment} />
              <ReferralInfoCell label="Room" value={doctorFee.room} />
              <ReferralInfoCell label="Visit type" value={visitType} />
              <ReferralInfoCell label="Audit ref" value={selected.appointmentNo} />
            </div>
          </section>

          <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted-foreground">
            The selected doctor and billing status are used only to create a static consultation fee
            line in this bill.
          </div>
        </div>

        <aside className="rounded-lg border border-border bg-white">
          <div className="border-b border-border px-4 py-3">
            <div className="text-xs font-bold uppercase text-muted-foreground">Charge summary</div>
            <div className="mt-2 text-base font-bold text-foreground">
              {appointmentDepartment} consultation
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">{mappedDoctor}</div>
          </div>
          <div className="divide-y divide-border">
            <ReferralInfoCell label="Consultation fee" value={money(doctorFee.fee)} />
            <ReferralInfoCell label="Discount" value={`${discount}%`} />
            <ReferralInfoCell label="Billable amount" value={money(billableAmount)} />
          </div>
          <div className="space-y-2 border-t border-border p-4">
            <Button className="w-full" onClick={addAppointmentFee}>
              <Plus className="h-4 w-4" />
              Add consultation fee
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => toast.info(`${mappedDoctor} appointment billing confirmed`)}
            >
              Confirm details
            </Button>
          </div>
        </aside>
      </CardContent>
    </Card>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (_value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="relative space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <select
        className="h-10 w-full appearance-none rounded-lg border border-input bg-white px-3 pr-9 text-sm font-semibold text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/15"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 text-muted-foreground" />
    </label>
  );
}

function ServiceGrid({
  category,
  onAdd,
  lines,
}: {
  category: BillingDeskService["category"];
  onAdd: (_service: BillingDeskService) => void;
  lines: BillLine[];
}) {
  const [search, setSearch] = React.useState("");
  const [group, setGroup] = React.useState("All groups");
  const [urgency, setUrgency] = React.useState("All urgency");
  const [manualServices, setManualServices] = React.useState<BillingDeskService[]>([]);
  const manualServicesLoadedRef = React.useRef(false);
  const [manualOpen, setManualOpen] = React.useState(false);
  const defaultManualGroup =
    category === "Radiology"
      ? "X-ray"
      : category === "Package"
        ? "Preventive"
        : category === "Quick Test"
          ? "Favorites"
          : "Biochemistry";
  const [draft, setDraft] = React.useState({
    name: "",
    group: defaultManualGroup,
    price: "",
    tax: "5",
    urgency: "Routine",
    meta: "",
    tat: "",
    sample: "",
    modality: category === "Radiology" ? "X-ray" : "",
  });
  const createLabel =
    category === "Package"
      ? "Create package"
      : category === "Quick Test"
        ? "Create quick test"
        : "Create service";
  const baseServices = [
    ...billingServices.filter((service) => service.category === category),
    ...manualServices,
  ];
  const groups = [
    "All groups",
    ...Array.from(new Set(baseServices.map((service) => service.group))),
  ];
  const urgencies = ["All urgency", "Routine", "Urgent", "Stat"];
  const services = baseServices.filter((service) => {
    const matchesSearch =
      `${service.name} ${service.group} ${service.meta} ${service.sample ?? ""} ${service.modality ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return (
      matchesSearch &&
      (group === "All groups" || service.group === group) &&
      (urgency === "All urgency" || service.urgency === urgency)
    );
  });
  const canCreateManual =
    category === "Pathology" ||
    category === "Radiology" ||
    category === "Package" ||
    category === "Quick Test";
  React.useEffect(() => {
    if (!canCreateManual) return undefined;
    const timer = window.setTimeout(() => {
      setManualServices(readManualServices(category));
      manualServicesLoadedRef.current = true;
    }, 0);
    return () => window.clearTimeout(timer);
  }, [canCreateManual, category]);
  React.useEffect(() => {
    if (!canCreateManual || !manualServicesLoadedRef.current) return;
    try {
      const saved = window.localStorage.getItem(manualServiceStorageKey);
      const parsed = saved ? (JSON.parse(saved) as BillingDeskService[]) : [];
      const otherCategories = parsed.filter((service) => service.category !== category);
      window.localStorage.setItem(
        manualServiceStorageKey,
        JSON.stringify([...otherCategories, ...manualServices]),
      );
    } catch {
      // localStorage is only a convenience for this static billing desk.
    }
  }, [canCreateManual, category, manualServices]);
  const createManualService = () => {
    if (!draft.name.trim() || !Number(draft.price)) {
      toast.error("Service name and valid price are required");
      return;
    }
    const service: BillingDeskService = {
      id: `manual-${category.toLowerCase()}-${Date.now()}`,
      name: draft.name.trim(),
      category,
      group: draft.group.trim() || category,
      price: Number(draft.price),
      discount: 0,
      tax: Number(draft.tax) || 0,
      urgency: draft.urgency as BillingDeskService["urgency"],
      meta: draft.meta.trim() || "Manual billing service",
      tat: draft.tat || undefined,
      sample:
        category === "Pathology" || category === "Quick Test"
          ? draft.sample || undefined
          : undefined,
      modality: category === "Radiology" ? draft.modality || undefined : undefined,
      insuranceCovered: false,
    };
    setManualServices((current) => [service, ...current]);
    onAdd(service);
    setDraft({
      name: "",
      group: defaultManualGroup,
      price: "",
      tax: "5",
      urgency: "Routine",
      meta: "",
      tat: "",
      sample: "",
      modality: category === "Radiology" ? "X-ray" : "",
    });
    setManualOpen(false);
    toast.success(`${service.name} created and added`);
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle>{category} Catalog</CardTitle>
              <CardDescription>
                Search existing items or create a static billing item for this bill.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="muted">{services.length} shown</Badge>
              {manualServices.length ? (
                <Badge tone="info">{manualServices.length} manual</Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto] lg:items-end">
            <label className="space-y-1.5">
              <span className="text-xs font-bold text-muted-foreground">Search catalog</span>
              <Input
                className="h-10"
                placeholder={`Search ${category.toLowerCase()} catalog...`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <PatientFilter label="Category" value={group} onChange={setGroup} options={groups} />
            <PatientFilter
              label="Urgency"
              value={urgency}
              onChange={setUrgency}
              options={urgencies}
            />
            {canCreateManual ? (
              <Button
                className="h-10"
                variant={manualOpen ? "default" : "outline"}
                onClick={() => setManualOpen((open) => !open)}
              >
                <Plus className="h-4 w-4" />
                {createLabel}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      {canCreateManual && manualOpen ? (
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>
              Create{" "}
              {category === "Package"
                ? "package"
                : category === "Quick Test"
                  ? "quick test"
                  : "service"}
            </CardTitle>
            <CardDescription>Static item created for this billing session only.</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-3 md:grid-cols-2">
                <QuickRegisterField
                  label={
                    category === "Package"
                      ? "Package name"
                      : category === "Quick Test"
                        ? "Quick test name"
                        : "Service name"
                  }
                  required
                  value={draft.name}
                  placeholder={
                    category === "Package"
                      ? "e.g. Senior Health Package"
                      : category === "Quick Test"
                        ? "e.g. Troponin rapid"
                        : "e.g. Dengue IgM"
                  }
                  onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
                />
                <QuickRegisterField
                  label="Group"
                  value={draft.group}
                  placeholder={
                    category === "Package"
                      ? "Preventive"
                      : category === "Quick Test"
                        ? "Favorites"
                        : "Biochemistry"
                  }
                  onChange={(value) => setDraft((current) => ({ ...current, group: value }))}
                />
                <QuickRegisterField
                  label="Price"
                  required
                  type="number"
                  value={draft.price}
                  placeholder="1200"
                  onChange={(value) => setDraft((current) => ({ ...current, price: value }))}
                />
                <QuickRegisterField
                  label="Tax %"
                  type="number"
                  value={draft.tax}
                  placeholder="5"
                  onChange={(value) => setDraft((current) => ({ ...current, tax: value }))}
                />
                <QuickRegisterSelect
                  label="Urgency"
                  value={draft.urgency}
                  onChange={(value) => setDraft((current) => ({ ...current, urgency: value }))}
                  options={["Routine", "Urgent", "Stat"].map((item) => ({
                    label: item,
                    value: item,
                  }))}
                />
                <QuickRegisterField
                  label="TAT"
                  value={draft.tat}
                  placeholder="Same day"
                  onChange={(value) => setDraft((current) => ({ ...current, tat: value }))}
                />
                {category === "Pathology" || category === "Quick Test" ? (
                  <QuickRegisterField
                    label="Sample"
                    value={draft.sample}
                    placeholder="Serum / EDTA / Capillary"
                    onChange={(value) => setDraft((current) => ({ ...current, sample: value }))}
                  />
                ) : null}
                {category === "Radiology" ? (
                  <QuickRegisterField
                    label="Modality"
                    value={draft.modality}
                    placeholder="X-ray / CT / USG"
                    onChange={(value) => setDraft((current) => ({ ...current, modality: value }))}
                  />
                ) : null}
                <QuickRegisterField
                  label={
                    category === "Package"
                      ? "Included services / package notes"
                      : "Meta / instruction"
                  }
                  value={draft.meta}
                  placeholder={
                    category === "Package" ? "CBC, LFT, ECG, X-ray" : "Fasting / contrast / notes"
                  }
                  onChange={(value) => setDraft((current) => ({ ...current, meta: value }))}
                  className="md:col-span-2"
                />
              </div>
              <aside className="rounded-lg border border-border bg-surface-muted p-3">
                <div className="text-xs font-bold uppercase text-muted-foreground">Preview</div>
                <div className="mt-2 text-sm font-bold text-foreground">
                  {draft.name || "New billing item"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{draft.group || category}</div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">Price</span>
                  <span className="text-lg font-bold text-foreground">
                    {money(Number(draft.price) || 0)}
                  </span>
                </div>
                <div className="mt-3 grid gap-2">
                  <Button onClick={createManualService}>Create & add</Button>
                  <Button variant="outline" onClick={() => setManualOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </aside>
            </div>
          </CardContent>
        </Card>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            added={lines.some((line) => line.id === service.id)}
            onAdd={() => onAdd(service)}
          />
        ))}
      </div>
      {!services.length ? (
        <EmptyState
          icon={Search}
          title="No services found"
          description="Clear search or filters to view the diagnostic catalog."
        />
      ) : null}
    </div>
  );
}

function PackagesWorkspace({
  onAdd,
  lines,
}: {
  onAdd: (_service: BillingDeskService) => void;
  lines: BillLine[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <div className="text-sm font-bold text-foreground">Package Builder</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Create manual packages, add existing packages, and keep static package data saved on
              this browser without any API.
            </p>
          </div>
          <Badge tone="info">Static package desk</Badge>
        </CardContent>
      </Card>
      <ServiceGrid key="Package" category="Package" onAdd={onAdd} lines={lines} />
    </div>
  );
}

function AlertHint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning">
      <ShieldAlert className="h-4 w-4" />
      {text}
    </div>
  );
}

function SummaryTable({
  lines,
  totals,
  removedLine,
  discountPercent,
  onDiscount,
  onQty,
  onSetQty,
  onRemove,
  onUndo,
}: {
  lines: BillLine[];
  totals: BillingTotals;
  removedLine: BillLine | null;
  discountPercent: number;
  onDiscount: (_value: number) => void;
  onQty: (_id: string, _delta: number) => void;
  onSetQty: (_id: string, _qty: number) => void;
  onRemove: (_id: string) => void;
  onUndo: () => void;
}) {
  if (!lines.length)
    return (
      <EmptyState
        icon={ReceiptText}
        title="No bill items yet"
        description="Add pathology, radiology, packages, quick tests, or consultation charges to build the bill."
      />
    );
  return (
    <div className="space-y-4">
      {removedLine ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
          <span className="font-semibold text-warning">{removedLine.name} removed from bill.</span>
          <Button size="sm" variant="outline" onClick={onUndo}>
            Undo remove
          </Button>
        </div>
      ) : null}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>Bill Summary</CardTitle>
              <CardDescription>
                Review services, quantities, discount, tax, insurance and payable amount.
              </CardDescription>
            </div>
            <Badge tone={totals.balance <= 0 ? "success" : "warning"}>
              {totals.balance <= 0 ? "Paid" : "Payment pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>
                  {["Service", "Category", "Qty", "Rate", "Discount", "Tax", "Line total", ""].map(
                    (head) => (
                      <th key={head} className="px-3 py-3 text-left font-bold">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const base = line.price * line.qty;
                  const discount = (base * line.discount) / 100;
                  const tax = ((base - discount) * line.tax) / 100;
                  const lineTotal = base - discount + tax;
                  return (
                    <tr key={line.id} className="border-t border-border bg-white">
                      <td className="px-3 py-3">
                        <div className="font-bold text-foreground">{line.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{line.meta}</div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone="muted">{line.category}</Badge>
                      </td>
                      <td className="px-3 py-3">
                        <div className="inline-flex h-9 items-center rounded-md border border-border bg-white">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onQty(line.id, -1)}
                            aria-label={`Decrease ${line.name}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <input
                            className="h-8 w-12 border-x border-border bg-white text-center text-sm font-bold outline-none focus:bg-primary-soft/40"
                            type="number"
                            min={0}
                            value={line.qty}
                            onChange={(event) => onSetQty(line.id, Number(event.target.value))}
                            aria-label={`${line.name} quantity`}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onQty(line.id, 1)}
                            aria-label={`Increase ${line.name}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-semibold">{money(line.price)}</td>
                      <td className="px-3 py-3">{line.discount ? `${line.discount}%` : "-"}</td>
                      <td className="px-3 py-3">{money(tax)}</td>
                      <td className="px-3 py-3 font-bold text-foreground">{money(lineTotal)}</td>
                      <td className="px-3 py-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemove(line.id)}
                          aria-label={`Remove ${line.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <aside className="rounded-lg border border-border bg-white">
            <div className="border-b border-border px-3 py-2.5">
              <div className="text-[11px] font-bold uppercase text-muted-foreground">
                Amount summary
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">
                {money(totals.patientPayable)}
              </div>
              <div className="text-[11px] font-semibold text-muted-foreground">Patient payable</div>
            </div>
            <div className="space-y-2 p-3">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground">Bill discount %</span>
                <Input
                  className="h-9"
                  type="number"
                  min={0}
                  max={100}
                  value={discountPercent}
                  onChange={(event) => onDiscount(Number(event.target.value))}
                />
              </label>
              <SummaryAmountRow label="Subtotal" value={money(totals.subtotal)} />
              <SummaryAmountRow label="Discount" value={`- ${money(totals.discount)}`} />
              <SummaryAmountRow label="Tax" value={money(totals.tax)} />
              <SummaryAmountRow label="Grand total" value={money(totals.total)} />
              <SummaryAmountRow label="Insurance" value={`- ${money(totals.insuranceAmount)}`} />
              <SummaryAmountRow label="Paid" value={`- ${money(totals.paid)}`} />
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-xs font-bold text-foreground">Balance</span>
                <span className="text-base font-bold text-primary">{money(totals.balance)}</span>
              </div>
            </div>
          </aside>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryAmountRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  );
}

function PaymentWorkspace({
  total,
  balance,
  paid,
  payments,
  onPay,
  onRemovePayment,
}: {
  total: number;
  balance: number;
  paid: number;
  payments: PaymentLine[];
  onPay: (_mode: PaymentLine["mode"], _amount: number) => void;
  onRemovePayment: (_id: string) => void;
}) {
  const [mode, setMode] = React.useState<PaymentLine["mode"]>("UPI");
  const [amount, setAmount] = React.useState(Math.max(balance, 0).toString());
  React.useEffect(() => {
    const timer = window.setTimeout(() => setAmount(Math.max(balance, 0).toString()), 0);
    return () => window.clearTimeout(timer);
  }, [balance]);
  const submitPayment = () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }
    onPay(mode, Math.min(value, balance));
    toast.success(`${mode} payment recorded`);
  };
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payment workflow</CardTitle>
          <CardDescription>
            Cash, card, UPI, insurance, partial and split payment support.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              {(["Cash", "Card", "UPI", "Insurance"] as PaymentLine["mode"][]).map((item) => (
                <button
                  key={item}
                  onClick={() => setMode(item)}
                  className={cn(
                    "rounded-xl border bg-white p-4 text-left font-bold shadow-soft transition hover:border-primary hover:bg-primary-soft",
                    mode === item ? "border-primary ring-2 ring-primary/15" : "border-border",
                  )}
                >
                  {item}
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    Collect against {money(balance)}
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-surface-muted p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <SelectField
                  label="Payment mode"
                  value={mode}
                  onChange={(value) => setMode(value as PaymentLine["mode"])}
                  options={["Cash", "Card", "UPI", "Insurance"].map((item) => ({
                    label: item,
                    value: item,
                  }))}
                />
                <label className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Amount</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={submitPayment}>Record payment</Button>
                <Button variant="outline" onClick={() => toast.info("Refund workflow ready")}>
                  Refund
                </Button>
                <Button variant="outline" onClick={() => toast.success("PDF invoice queued")}>
                  Download PDF
                </Button>
              </div>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Split payment ledger</CardTitle>
                <CardDescription>Static payment rows recorded for this draft bill.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {payments.length ? (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-bold text-foreground">{payment.mode}</div>
                        <div className="text-xs text-muted-foreground">{payment.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{money(payment.amount)}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemovePayment(payment.id)}
                          aria-label={`Remove ${payment.mode} payment`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon={CreditCard}
                    title="No payment recorded"
                    description="Add cash, card, UPI, or insurance payment rows."
                    className="min-h-32"
                  />
                )}
              </CardContent>
            </Card>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary-soft/60 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Receipt preview
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient payable</span>
                <span className="font-bold">{money(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-bold">{money(paid)}</span>
              </div>
              <div className="flex justify-between border-t border-primary/15 pt-2">
                <span className="font-semibold">Live balance</span>
                <span className="text-xl font-bold text-primary">{money(balance)}</span>
              </div>
            </div>
            <Button
              className="mt-4 w-full"
              disabled={balance > 0}
              onClick={() => toast.success("Payment confirmed and receipt generated")}
            >
              <Printer className="h-4 w-4" />
              Print receipt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RightSummary({
  patient,
  lines,
  totals,
  referral,
  invoices,
  onSaveInvoice,
  onQuickPay,
  onReset,
}: {
  patient: BillingDeskPatient;
  lines: BillLine[];
  totals: BillingTotals;
  referral: BillingReferral;
  invoices: BillingInvoice[];
  onSaveInvoice: () => void;
  onQuickPay: (_mode: PaymentLine["mode"], _amount: number) => void;
  onReset: () => void;
}) {
  const [paymentMode, setPaymentMode] = React.useState<PaymentLine["mode"]>("UPI");
  const [paymentAmount, setPaymentAmount] = React.useState("");
  const [gateway, setGateway] = React.useState("Razorpay");
  const [gatewayRef, setGatewayRef] = React.useState("");
  const alerts = [
    patient.insuranceStatus === "Pre-auth required" ? "Insurance pre-approval required." : null,
    referral.status === "Mapped" ? "Doctor referral commission applied." : null,
    lines.some((line) => line.category === "Package")
      ? "Similar package savings applied to bill."
      : null,
    lines.some((line) => line.urgency === "Stat") ? "Stat diagnostic handoff required." : null,
  ].filter(Boolean) as string[];
  const latestInvoice = invoices[0];
  React.useEffect(() => {
    const timer = window.setTimeout(() => setPaymentAmount(String(Math.max(totals.balance, 0))), 0);
    return () => window.clearTimeout(timer);
  }, [totals.balance]);
  const submitQuickPayment = () => {
    const amount = Math.min(Number(paymentAmount), totals.balance);
    if (!amount || amount <= 0) {
      toast.error("Enter valid payment amount");
      return;
    }
    onQuickPay(paymentMode, amount);
    toast.success(`${paymentMode} payment recorded`);
  };
  const processGatewayPayment = () => {
    const amount = Math.min(Number(paymentAmount), totals.balance);
    if (!amount || amount <= 0) {
      toast.error("Enter valid gateway amount");
      return;
    }
    const ref = gatewayRef.trim() || `${gateway.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    onQuickPay(
      gateway === "Insurance Gateway" ? "Insurance" : gateway === "Card Gateway" ? "Card" : "UPI",
      amount,
    );
    setGatewayRef(ref);
    toast.success(`${gateway} payment processed: ${ref}`);
  };
  return (
    <div className="sticky top-20 space-y-3">
      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-foreground">{patient.name}</div>
              <div className="mt-0.5 text-xs font-semibold text-muted-foreground">
                {patient.uhid} • {patient.ageGender}
              </div>
            </div>
            <Badge
              tone={
                patient.insuranceStatus === "Approved"
                  ? "success"
                  : patient.insuranceStatus === "Not required"
                    ? "muted"
                    : "warning"
              }
            >
              {patient.insuranceStatus}
            </Badge>
          </div>
          <div className="grid gap-2 text-xs">
            <CompactSideRow label="Phone" value={patient.phone} />
            <CompactSideRow label="Payer" value={patient.payer} />
            <CompactSideRow label="Doctor" value={patient.doctor} />
          </div>
          <Button className="h-9 w-full" size="sm" variant="outline" asChild>
            <Link href={`/patients/${patient.id}`}>Open patient profile</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Bill Summary</div>
              <div className="mt-1 text-lg font-bold text-foreground">
                {money(totals.patientPayable)}
              </div>
            </div>
            <Badge tone={totals.balance <= 0 && lines.length ? "success" : "warning"}>
              {totals.balance <= 0 && lines.length ? "Paid" : "Due"}
            </Badge>
          </div>
          <div className="space-y-1.5">
            <CompactSideRow label="Subtotal" value={money(totals.subtotal)} />
            <CompactSideRow label="Discount" value={`- ${money(totals.discount)}`} />
            <CompactSideRow label="Insurance" value={`- ${money(totals.insuranceAmount)}`} />
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
              <span className="font-bold text-foreground">Balance</span>
              <span className="font-bold text-primary">{money(totals.balance)}</span>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="grid gap-2 border-t border-border pt-2">
              <SelectField
                label="Payment mode"
                value={paymentMode}
                onChange={(value) => setPaymentMode(value as PaymentLine["mode"])}
                options={["Cash", "Card", "UPI", "Insurance"].map((item) => ({
                  label: item,
                  value: item,
                }))}
              />
              <Input
                className="h-9"
                type="number"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
              />
              <Button
                className="h-9 w-full"
                size="sm"
                disabled={!lines.length || totals.balance <= 0}
                onClick={submitQuickPayment}
              >
                Record payment
              </Button>
            </div>
            <div className="grid gap-2 rounded-md border border-border bg-surface-muted p-2">
              <div className="text-[11px] font-bold uppercase text-muted-foreground">
                Payment gateway
              </div>
              <SelectField
                label="Gateway"
                value={gateway}
                onChange={setGateway}
                options={["Razorpay", "Paytm", "PhonePe", "Card Gateway", "Insurance Gateway"].map(
                  (item) => ({ label: item, value: item }),
                )}
              />
              <Input
                className="h-9"
                placeholder="Transaction ref / auto"
                value={gatewayRef}
                onChange={(event) => setGatewayRef(event.target.value)}
              />
              <Button
                className="h-9 w-full"
                size="sm"
                disabled={!lines.length || totals.balance <= 0}
                onClick={processGatewayPayment}
              >
                Process gateway payment
              </Button>
            </div>
            <Button
              className="h-9 w-full"
              size="sm"
              disabled={!lines.length}
              onClick={onSaveInvoice}
            >
              <ReceiptText className="h-4 w-4" />
              Save invoice
            </Button>
            <Button className="h-9 w-full" size="sm" variant="outline" onClick={onReset}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {alerts.length || latestInvoice ? (
        <Card>
          <CardContent className="space-y-2 p-3 text-xs">
            {latestInvoice ? (
              <CompactSideRow label="Last invoice" value={latestInvoice.invoiceNo} />
            ) : null}
            {alerts.slice(0, 2).map((alert) => (
              <div
                key={alert}
                className="rounded-md border border-warning/30 bg-warning/10 px-2 py-1.5 font-semibold text-warning"
              >
                {alert}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function CompactSideRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate text-right font-bold text-foreground">{value}</span>
    </div>
  );
}

export function BillingDeskPage({ initialStep = "patient" }: { initialStep?: BillingDeskStep }) {
  return (
    <BillingDeskProvider>
      <React.Suspense fallback={<BillingDeskLoading />}>
        <BillingDeskInner initialStep={initialStep} />
      </React.Suspense>
    </BillingDeskProvider>
  );
}

function BillingDeskLoading() {
  return (
    <PageMotion>
      <BillingDeskTopbar />
      <Card>
        <CardContent className="p-4 text-sm font-semibold text-muted-foreground">
          Loading billing desk...
        </CardContent>
      </Card>
    </PageMotion>
  );
}

function BillingDeskInner({ initialStep }: { initialStep: BillingDeskStep }) {
  const { state, totals, dispatch, addService } = useBillingDesk();
  const [active, setActive] = React.useState<BillingDeskStep>(initialStep);
  const searchParams = useSearchParams();
  const routedPatientId = searchParams.get("patientId");
  React.useEffect(() => {
    if (!routedPatientId || state.activePatient.id === routedPatientId) return;
    const routedPatient = state.patients.find((patient) => patient.id === routedPatientId);
    if (routedPatient) dispatch({ type: "selectPatient", patient: routedPatient });
  }, [dispatch, routedPatientId, state.activePatient.id, state.patients]);
  const changeStep = (step: BillingDeskStep) => {
    setActive(step);
    history.replaceState(null, "", stepRoute[step]);
  };
  const saveInvoice = () => {
    if (!state.lines.length) {
      toast.error("Add at least one bill item before invoice generation");
      return;
    }
    const invoice: BillingInvoice = {
      id: `invoice-${Date.now()}`,
      invoiceNo: createInvoiceNo(),
      createdAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      patient: state.activePatient,
      referral: state.activeReferral,
      lines: state.lines,
      payments: state.payments,
      totals,
      status: invoiceStatus(totals),
    };
    dispatch({ type: "saveInvoice", invoice });
    toast.success(`${invoice.invoiceNo} saved locally`);
    window.setTimeout(() => window.print(), 150);
  };
  return (
    <PageMotion>
      <BillingDeskTopbar />
      <WorkflowTabs active={active} onChange={changeStep} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <main className="min-w-0 space-y-4">
          {active === "patient" ? (
            <PatientWorkspace
              selectedPatient={state.activePatient}
              patients={state.patients}
              onSelect={(patient) => dispatch({ type: "selectPatient", patient })}
              onRegister={(patient) => dispatch({ type: "registerPatient", patient })}
            />
          ) : null}
          {active === "referral" ? (
            <ReferralWorkspace
              activeReferral={state.activeReferral}
              onSelect={(referral) => dispatch({ type: "selectReferral", referral })}
            />
          ) : null}
          {active === "appointments" ? (
            <AppointmentsWorkspace patient={state.activePatient} onAdd={addService} />
          ) : null}
          {active === "pathology" ? (
            <ServiceGrid
              key="Pathology"
              category="Pathology"
              onAdd={addService}
              lines={state.lines}
            />
          ) : null}
          {active === "radiology" ? (
            <ServiceGrid
              key="Radiology"
              category="Radiology"
              onAdd={addService}
              lines={state.lines}
            />
          ) : null}
          {active === "packages" ? (
            <PackagesWorkspace onAdd={addService} lines={state.lines} />
          ) : null}
          {active === "quick-tests" ? (
            <ServiceGrid
              key="Quick Test"
              category="Quick Test"
              onAdd={addService}
              lines={state.lines}
            />
          ) : null}
          {active === "individual-tests" ? (
            <ServiceGrid
              key="Individual Test"
              category="Individual Test"
              onAdd={addService}
              lines={state.lines}
            />
          ) : null}
          {active === "summary" ? (
            <SummaryTable
              lines={state.lines}
              totals={totals}
              removedLine={state.removedLine}
              discountPercent={state.discountPercent}
              onDiscount={(value) => dispatch({ type: "discount", value })}
              onQty={(id, delta) => dispatch({ type: "qty", id, delta })}
              onSetQty={(id, qty) => dispatch({ type: "setQty", id, qty })}
              onRemove={(id) => dispatch({ type: "remove", id })}
              onUndo={() => dispatch({ type: "undoRemove" })}
            />
          ) : null}
          {active === "payment" ? (
            <PaymentWorkspace
              total={totals.patientPayable}
              balance={totals.balance}
              paid={totals.paid}
              payments={state.payments}
              onPay={(mode, amount) => dispatch({ type: "pay", mode, amount })}
              onRemovePayment={(id) => dispatch({ type: "removePayment", id })}
            />
          ) : null}
        </main>
        <aside>
          <RightSummary
            patient={state.activePatient}
            lines={state.lines}
            totals={totals}
            referral={state.activeReferral}
            invoices={state.invoices}
            onSaveInvoice={saveInvoice}
            onQuickPay={(mode, amount) => dispatch({ type: "pay", mode, amount })}
            onReset={() => {
              dispatch({ type: "reset" });
              toast.info("Billing desk reset");
            }}
          />
        </aside>
      </div>
      <div className="fixed inset-x-3 bottom-3 z-30 flex gap-2 rounded-xl border border-border bg-white/95 p-2 shadow-[0_16px_40px_rgba(39,37,54,0.18)] backdrop-blur md:hidden">
        {(["patient", "pathology", "summary", "payment"] as BillingDeskStep[]).map((step) => (
          <Button
            key={step}
            className="flex-1"
            size="sm"
            variant={active === step ? "default" : "outline"}
            onClick={() => changeStep(step)}
          >
            {billingDeskSteps.find((item) => item.id === step)?.label}
          </Button>
        ))}
      </div>
    </PageMotion>
  );
}
