"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreVertical, Pill, Plus, Trash2, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { useRole } from "@/components/providers/role-provider";
import { mockPatients } from "@/data/patients";
import { PatientSearchSelect } from "@/features/patients/patient-search-select";
import type { Role } from "@/types";

type PatientForm = {
  patientName: string;
  mrn: string;
  dateOfBirth: string;
  ageGender: string;
  phone: string;
  date: string;
  consultant: string;
  address: string;
  diagnosis: string;
};

type DrugRow = {
  id: string;
  drugName: string;
  form: DrugForm;
  dosage: string;
  frequency: Frequency;
  route: Route;
  days: string;
  quantity: string;
  quantityEdited: boolean;
  instructions: string;
};

type Errors = Partial<Record<keyof PatientForm, string>> & {
  drugs?: string;
  drugRows?: Record<string, Partial<Record<"drugName" | "dosage", string>>>;
};

type DrugForm = (typeof drugForms)[number];
type Frequency = (typeof frequencies)[number];
type Route = (typeof routes)[number];
type SortKey = "drugName" | "form" | "dosage" | "frequency" | "route" | "days" | "quantity";
type SortState = { key: SortKey; direction: "asc" | "desc" };
type DrugColumn = {
  key: SortKey | "instructions" | "actions";
  label: string;
  sortable?: boolean;
  className?: string;
  render: (row: DrugRow, rowErrors: Partial<Record<"drugName" | "dosage", string>>, updateDrug: (row: DrugRow, values: Partial<DrugRow>) => void, onDelete: (id: string) => void) => React.ReactNode;
};

const doctorRoles: Role[] = ["Doctor", "Super Admin", "Hospital Admin"];
const drugForms = ["Tablet", "Capsule", "Syrup", "Injection", "IV Fluid", "Cream", "Drops"] as const;
const frequencies = ["OD", "BD", "TDS", "QID", "6 hrly", "8 hrly", "SOS", "Continuous", "Intermittent"] as const;
const routes = ["Oral", "IV", "IM", "SC", "Topical", "Inhalation"] as const;
const todayIso = new Date().toISOString().slice(0, 10);
const loggedInDoctorName = "Dr. Kavita Rao";

const frequencyMultiplier: Record<Frequency, number> = {
  OD: 1,
  BD: 2,
  TDS: 3,
  QID: 4,
  "6 hrly": 4,
  "8 hrly": 3,
  SOS: 1,
  Continuous: 1,
  Intermittent: 1,
};

function createDrugRow(): DrugRow {
  return {
    id: `drug-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    drugName: "",
    form: "Tablet",
    dosage: "",
    frequency: "OD",
    route: "Oral",
    days: "",
    quantity: "",
    quantityEdited: false,
    instructions: "",
  };
}

function calculateQuantity(frequency: Frequency, days: string) {
  const parsedDays = Number(days);
  if (!Number.isFinite(parsedDays) || parsedDays <= 0) return "";
  return String(Math.ceil(frequencyMultiplier[frequency] * parsedDays));
}

function getDateError(value: string, label: string) {
  if (!value.trim()) return `${label} is required.`;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const normalized = [
    String(date.getUTCFullYear()).padStart(4, "0"),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");

  if (!year || !month || !day || Number.isNaN(date.getTime()) || value !== normalized) {
    return `${label} must be a valid date.`;
  }

  return "";
}

function compareIsoDate(left: string, right: string) {
  const [leftYear, leftMonth, leftDay] = left.split("-").map(Number);
  const [rightYear, rightMonth, rightDay] = right.split("-").map(Number);
  return Date.UTC(leftYear, leftMonth - 1, leftDay) - Date.UTC(rightYear, rightMonth - 1, rightDay);
}

function FieldError({ children }: { children?: string }) {
  return children ? <div className="text-xs font-medium text-danger">{children}</div> : null;
}

function formatDisplayDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex min-h-10 items-center rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function SelectInput<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function PatientInformation({
  values,
  errors,
  onChange,
  selectedPatientId,
  onPatientSelect,
}: {
  values: PatientForm;
  errors: Errors;
  onChange: (values: Partial<PatientForm>) => void;
  selectedPatientId: string;
  onPatientSelect: (patientId: string) => void;
}) {
  const details = [
    { label: "MRN", value: values.mrn },
    { label: "Date of Birth", value: formatDisplayDate(values.dateOfBirth) },
    { label: "Age / Gender", value: values.ageGender },
    { label: "Phone", value: values.phone },
    { label: "Address", value: values.address },
    { label: "Consultant Name", value: values.consultant },
    { label: "Date", value: formatDisplayDate(values.date) },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <PatientSearchSelect patientId={selectedPatientId} onPatientChange={onPatientSelect} />
          {details.map((detail) => (
            <DetailItem key={detail.label} label={detail.label} value={detail.value || "-"} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Clinical Details</CardTitle>
            <CardDescription>Add the diagnosis for this prescription.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">
              Diagnosis <span className="text-danger">*</span>
            </span>
            <Input
              value={values.diagnosis}
              onChange={(event) => onChange({ diagnosis: event.target.value })}
              aria-invalid={Boolean(errors.diagnosis)}
              placeholder="Enter diagnosis"
            />
            <FieldError>{errors.diagnosis}</FieldError>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

const drugColumns: DrugColumn[] = [
  {
    key: "drugName",
    label: "Drug Name",
    sortable: true,
    render: (row, rowErrors, updateDrug) => (
      <>
        <Input value={row.drugName} onChange={(event) => updateDrug(row, { drugName: event.target.value })} aria-invalid={Boolean(rowErrors.drugName)} />
        <FieldError>{rowErrors.drugName}</FieldError>
      </>
    ),
  },
  {
    key: "form",
    label: "Form",
    sortable: true,
    render: (row, _rowErrors, updateDrug) => <SelectInput label="Form of drug" value={row.form} options={drugForms} onChange={(form) => updateDrug(row, { form })} />,
  },
  {
    key: "dosage",
    label: "Dosage",
    sortable: true,
    render: (row, rowErrors, updateDrug) => (
      <>
        <Input value={row.dosage} onChange={(event) => updateDrug(row, { dosage: event.target.value })} placeholder="500mg" aria-invalid={Boolean(rowErrors.dosage)} />
        <FieldError>{rowErrors.dosage}</FieldError>
      </>
    ),
  },
  {
    key: "frequency",
    label: "Frequency",
    sortable: true,
    render: (row, _rowErrors, updateDrug) => <SelectInput label="Frequency" value={row.frequency} options={frequencies} onChange={(frequency) => updateDrug(row, { frequency })} />,
  },
  {
    key: "route",
    label: "Route",
    sortable: true,
    render: (row, _rowErrors, updateDrug) => <SelectInput label="Route" value={row.route} options={routes} onChange={(route) => updateDrug(row, { route })} />,
  },
  {
    key: "days",
    label: "No. of Days",
    sortable: true,
    render: (row, _rowErrors, updateDrug) => <Input type="number" min={1} value={row.days} onChange={(event) => updateDrug(row, { days: event.target.value })} />,
  },
  {
    key: "quantity",
    label: "Total Quantity",
    sortable: true,
    render: (row, _rowErrors, updateDrug) => (
      <Input type="number" min={0} value={row.quantity} onChange={(event) => updateDrug(row, { quantity: event.target.value, quantityEdited: true })} />
    ),
  },
  {
    key: "instructions",
    label: "Instructions",
    render: (row, _rowErrors, updateDrug) => <Input value={row.instructions} onChange={(event) => updateDrug(row, { instructions: event.target.value })} />,
  },
  {
    key: "actions",
    label: "Action",
    className: "text-right",
    render: (row, _rowErrors, _updateDrug, onDelete) => (
      <div className="flex justify-end">
        <DrugActionsMenu onDelete={() => onDelete(row.id)} />
      </div>
    ),
  },
];

function DrugActionsMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button size="icon" variant="ghost" onClick={() => setOpen((value) => !value)} aria-label="Open drug row actions">
        <MoreVertical className="h-4 w-4" />
      </Button>
      {open ? (
        <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-border bg-surface p-1 shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm text-danger hover:bg-surface-muted"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SortButton({ label, column, sort, onSort }: { label: string; column: SortKey; sort: SortState; onSort: (key: SortKey) => void }) {
  const active = sort.key === column;
  const SortIcon = active ? (sort.direction === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <button className="flex items-center gap-2 text-left font-semibold uppercase tracking-wide hover:text-foreground" onClick={() => onSort(column)} type="button">
      {label}
      <SortIcon className={active ? "h-3.5 w-3.5 text-foreground" : "h-3.5 w-3.5 text-muted-foreground/70"} />
    </button>
  );
}

function DrugTable({
  rows,
  errors,
  onAdd,
  onDelete,
  onChange,
}: {
  rows: DrugRow[];
  errors: Errors;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onChange: (id: string, values: Partial<DrugRow>) => void;
}) {
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<SortState>({ key: "drugName", direction: "asc" });

  const sortedRows = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows
      .filter((row) => `${row.drugName} ${row.form} ${row.dosage} ${row.frequency} ${row.route} ${row.instructions}`.toLowerCase().includes(query))
      .sort((left, right) => {
        const leftValue = left[sort.key];
        const rightValue = right[sort.key];
        const result = Number.isFinite(Number(leftValue)) && Number.isFinite(Number(rightValue))
          ? Number(leftValue) - Number(rightValue)
          : String(leftValue).localeCompare(String(rightValue));
        return sort.direction === "asc" ? result : -result;
      });
  }, [rows, search, sort]);

  const updateSort = (key: SortKey) => {
    setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  };

  const updateDrug = (row: DrugRow, values: Partial<DrugRow>) => {
    const next = { ...row, ...values };
    const shouldAutoQuantity = !next.quantityEdited && ("days" in values || "frequency" in values);
    onChange(row.id, { ...values, ...(shouldAutoQuantity ? { quantity: calculateQuantity(next.frequency, next.days) } : {}) });
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Drug Table</CardTitle>
          <CardDescription>Add medicines, dosing, frequency, route, and dispensing quantity.</CardDescription>
        </div>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Drug
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput className="sm:w-80" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search drugs..." />
          <Badge tone="info">{rows.length} Row(s)</Badge>
        </div>
        <FieldError>{errors.drugs}</FieldError>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>
                  {drugColumns.map((column) => (
                    <th className={["border-b border-border px-3 py-2", column.className].filter(Boolean).join(" ")} key={column.key}>
                      {column.sortable ? <SortButton label={column.label} column={column.key as SortKey} sort={sort} onSort={updateSort} /> : column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => {
                  const rowErrors = errors.drugRows?.[row.id] ?? {};
                  return (
                    <tr className="border-b border-border last:border-0" key={row.id}>
                      {drugColumns.map((column) => (
                        <td className="px-3 py-2 align-top" key={column.key}>
                          {column.render(row, rowErrors, updateDrug, onDelete)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
            <span>{sortedRows.length} visible row(s)</span>
            {/* <span>Total Quantity auto-fills from frequency and No. of Days until edited manually.</span> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DoctorSignature({ registrationNumber, onRegistrationChange }: { registrationNumber: string; onRegistrationChange: (value: string) => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 md:ml-auto md:w-[420px]">
        <div>
          <div className="text-sm font-semibold text-foreground">Doctor&apos;s Name and Signature</div>
          <div className="mt-8 border-b border-foreground/70" />
          <div className="mt-1 text-xs text-muted-foreground">{loggedInDoctorName}</div>
        </div>
        <label className="space-y-1">
          <span className="text-sm font-medium text-foreground">Registration Number</span>
          <Input value={registrationNumber} onChange={(event) => onRegistrationChange(event.target.value)} />
        </label>
      </CardContent>
    </Card>
  );
}

function validatePrescription(patient: PatientForm, drugs: DrugRow[]) {
  const nextErrors: Errors = {};
  const drugRows: NonNullable<Errors["drugRows"]> = {};

  if (!patient.patientName.trim()) nextErrors.patientName = "Patient Name is required.";
  if (!patient.mrn.trim()) nextErrors.mrn = "MRN / Patient ID is required.";
  if (!patient.diagnosis.trim()) nextErrors.diagnosis = "Diagnosis is required.";

  const dobError = getDateError(patient.dateOfBirth, "Date of Birth");
  const prescriptionDateError = getDateError(patient.date, "Date");
  if (dobError) nextErrors.dateOfBirth = dobError;
  if (prescriptionDateError) nextErrors.date = prescriptionDateError;
  if (!dobError && compareIsoDate(patient.dateOfBirth, todayIso) > 0) {
    nextErrors.dateOfBirth = "Date of Birth cannot be in the future.";
  }
  if (!prescriptionDateError && compareIsoDate(patient.date, todayIso) > 0) {
    nextErrors.date = "Date cannot be in the future.";
  }
  if (!dobError && !prescriptionDateError && compareIsoDate(patient.date, patient.dateOfBirth) < 0) {
    nextErrors.date = "Date cannot be before Date of Birth.";
  }

  if (!drugs.length) nextErrors.drugs = "Add at least one drug row.";

  drugs.forEach((drug) => {
    const rowErrors: Partial<Record<"drugName" | "dosage", string>> = {};
    if (!drug.drugName.trim()) rowErrors.drugName = "Drug Name is required.";
    if (!drug.dosage.trim()) rowErrors.dosage = "Dosage is required.";
    if (Object.keys(rowErrors).length) drugRows[drug.id] = rowErrors;
  });

  if (Object.keys(drugRows).length) nextErrors.drugRows = drugRows;
  return nextErrors;
}

function buildPatientForm(patient: (typeof mockPatients)[number]): PatientForm {
  return {
    patientName: `${patient.firstName} ${patient.lastName}`,
    mrn: patient.uhid,
    dateOfBirth: patient.dateOfBirth,
    ageGender: `${patient.age} / ${patient.gender}`,
    phone: patient.mobile,
    date: todayIso,
    consultant: loggedInDoctorName,
    address: `${patient.city}, ${patient.state} ${patient.pinCode}`,
    diagnosis: "",
  };
}

export function PrescriptionPage() {
  const { role } = useRole();
  const router = useRouter();
  const patient = mockPatients[0];
  const [selectedPatientId, setSelectedPatientId] = React.useState(patient.id);
  const [patientForm, setPatientForm] = React.useState<PatientForm>(() => buildPatientForm(patient));
  const [drugs, setDrugs] = React.useState<DrugRow[]>([createDrugRow()]);
  const [registrationNumber, setRegistrationNumber] = React.useState("MMC-2014-48291");
  const [errors, setErrors] = React.useState<Errors>({});

  if (!doctorRoles.includes(role)) {
    return <EmptyState icon={UserRound} title="Doctor access required" description="Switch to Doctor role to create a prescription." />;
  }

  const submitPrescription = () => {
    const nextErrors = validatePrescription(patientForm, drugs);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    toast.success("Prescription submitted and sent to Drug Ordering queue");
    router.push("/doctor/orders?tab=drugs");
  };

  const selectPatient = (patientId: string) => {
    const selectedPatient = mockPatients.find((item) => item.id === patientId) ?? patient;
    setSelectedPatientId(selectedPatient.id);
    setPatientForm((current) => ({ ...buildPatientForm(selectedPatient), diagnosis: current.diagnosis }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Doctor Workspace"
        title="Prescription"
        description="Create a prescription and send medicines to the drug ordering queue."
        className="static mx-0 border-b bg-transparent px-0 py-2"
        // actions={
        //   <Button onClick={submitPrescription}>
        //     <Save className="h-4 w-4" />
        //     Submit Prescription
        //   </Button>
        // }
      />

      <PatientInformation
        values={patientForm}
        errors={errors}
        selectedPatientId={selectedPatientId}
        onPatientSelect={selectPatient}
        onChange={(values) => setPatientForm((current) => ({ ...current, ...values }))}
      />
      <DrugTable
        rows={drugs}
        errors={errors}
        onAdd={() => setDrugs((current) => [...current, createDrugRow()])}
        onDelete={(id) => setDrugs((current) => current.filter((drug) => drug.id !== id))}
        onChange={(id, values) => setDrugs((current) => current.map((drug) => (drug.id === id ? { ...drug, ...values } : drug)))}
      />
      <DoctorSignature registrationNumber={registrationNumber} onRegistrationChange={setRegistrationNumber} />
      <div className="flex justify-end">
        <Button onClick={submitPrescription}>
          <Pill className="h-4 w-4" />
          Submit Prescription
        </Button>
      </div>
    </div>
  );
}
