"use client";

import * as React from "react";
import { Camera, Download, Eye, FileText, FolderOpen, QrCode, RefreshCw, Save, Smartphone, Trash2, Upload, UserRound } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type OldRecordFile = {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  status: string;
  ocrStatus: string;
  uploadedBy: "Reception" | "ER Nurse";
  uploadedAt: string;
};

type UploadStatus = "Ready" | "Uploading" | "Uploaded" | "Failed";
type OcrStatus = "Pending" | "Processing" | "Verification Ready" | "Failed";

type UploadDocument = {
  id: string;
  name: string;
  category: string;
  type: string;
  size: number;
  status: UploadStatus;
  progress: number;
  ocrStatus: OcrStatus;
  uploadedBy: "Reception";
  uploadedAt: string;
  objectUrl?: string;
  error?: string;
};

const oldRecordsKey = "plasmit-patient-old-record-files";
const oldRecordsEvent = "plasmit-patient-old-record-files-change";
const basicDraftKey = "plasmit-receptionist-basic-demographic";
const inputClass = "h-10 rounded-lg";
const selectClass = "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";
const textareaClass = "min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20";
const countryCodes = ["+91", "+1", "+44", "+61", "+971", "+65"];
const idProofTypes = ["Aadhaar", "Driving Licence", "PAN", "Passport"];
const reportCategories = ["Referral Letter", "Lab Reports", "Radiology", "Prescription", "Consent", "Insurance", "Identity", "Others"];
const acceptedReportMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const maxReportFileSize = 20 * 1024 * 1024;

function todayInputDate() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function readOldRecordFiles() {
  if (typeof window === "undefined") return [];
  try {
    const records = JSON.parse(window.localStorage.getItem(oldRecordsKey) ?? "[]");
    return Array.isArray(records) ? (records as OldRecordFile[]) : [];
  } catch {
    return [];
  }
}

function writeOldRecordFiles(records: OldRecordFile[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(oldRecordsKey, JSON.stringify(records));
  window.dispatchEvent(new Event(oldRecordsEvent));
}

function saveUploadedOldRecord(document: UploadDocument) {
  const nextRecord: OldRecordFile = {
    id: document.id,
    name: document.name,
    category: document.category,
    type: document.type,
    size: document.size,
    status: "Uploaded",
    ocrStatus: document.ocrStatus === "Failed" ? "Failed" : "Verification Ready",
    uploadedBy: "Reception",
    uploadedAt: new Date().toLocaleString("en-IN"),
  };
  const records = readOldRecordFiles();
  writeOldRecordFiles([nextRecord, ...records.filter((record) => record.id !== nextRecord.id)].slice(0, 200));
}

function createUploadId() {
  return `reception-upload-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-() ]/g, "_").replace(/\s+/g, " ").trim();
}

function inferMimeType(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "";
}

function validateReportFile(file: File, safeName: string) {
  const mimeType = file.type || inferMimeType(safeName);
  if (!acceptedReportMimeTypes.has(mimeType)) return `${safeName}: unsupported format. Use PDF, JPG, PNG, DOC, or DOCX.`;
  if (file.size > maxReportFileSize) return `${safeName}: file must be 20 MB or smaller.`;
  return "";
}

function detectReportCategory(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.includes("lab") || lower.includes("pathology") || lower.includes("cbc") || lower.includes("abg")) return "Lab Reports";
  if (lower.includes("xray") || lower.includes("x-ray") || lower.includes("ct") || lower.includes("mri") || lower.includes("radio")) return "Radiology";
  if (lower.includes("rx") || lower.includes("prescription") || lower.includes("medicine")) return "Prescription";
  if (lower.includes("consent")) return "Consent";
  if (lower.includes("insurance") || lower.includes("policy") || lower.includes("tpa")) return "Insurance";
  if (lower.includes("id") || lower.includes("aadhaar") || lower.includes("identity")) return "Identity";
  if (lower.includes("ref") || lower.includes("letter") || lower.includes("sbar")) return "Referral Letter";
  return "Others";
}

function formatFileSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {children}
    </label>
  );
}

function UploadReportsSection() {
  const browseInputRef = React.useRef<HTMLInputElement | null>(null);
  const bulkInputRef = React.useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = React.useState<UploadDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [dragActive, setDragActive] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [errors, setErrors] = React.useState<string[]>([]);
  const [previewDocumentId, setPreviewDocumentId] = React.useState<string | null>(null);
  const visibleDocuments = selectedCategory === "All" ? documents : documents.filter((document) => document.category === selectedCategory);
  const validUploadCount = documents.filter((document) => document.status !== "Uploaded" && document.status !== "Failed").length;
  const previewDocument = documents.find((document) => document.id === previewDocumentId) ?? null;

  React.useEffect(() => () => {
    documents.forEach((document) => {
      if (document.objectUrl) URL.revokeObjectURL(document.objectUrl);
    });
  }, [documents]);

  function pushError(message: string) {
    setErrors((current) => [...current.slice(-3), message]);
    toast.error(message);
  }

  function addFiles(input: FileList | File[] | null, forcedCategory?: string) {
    if (!input?.length) return;
    const duplicateKeys = new Set(documents.map((document) => `${document.name}:${document.size}`));
    const nextDocuments: UploadDocument[] = [];

    Array.from(input).forEach((file) => {
      const safeName = sanitizeFileName(file.name);
      const validationError = validateReportFile(file, safeName);
      const duplicateKey = `${safeName}:${file.size}`;
      if (validationError) {
        pushError(validationError);
        return;
      }
      if (duplicateKeys.has(duplicateKey)) {
        pushError(`${safeName}: duplicate file skipped.`);
        return;
      }
      duplicateKeys.add(duplicateKey);
      nextDocuments.push({
        id: createUploadId(),
        name: safeName,
        category: forcedCategory ?? (selectedCategory === "All" ? detectReportCategory(safeName) : selectedCategory),
        type: file.type || inferMimeType(safeName),
        size: file.size,
        status: "Ready",
        progress: 0,
        ocrStatus: "Pending",
        uploadedBy: "Reception",
        uploadedAt: new Date().toLocaleString("en-IN"),
        objectUrl: URL.createObjectURL(file),
      });
    });

    if (!nextDocuments.length) return;
    setDocuments((current) => [...nextDocuments, ...current]);
    toast.success(`${nextDocuments.length} report(s) added.`);
  }

  function updateDocument(documentId: string, update: Partial<UploadDocument>) {
    setDocuments((current) => current.map((document) => (document.id === documentId ? { ...document, ...update } : document)));
  }

  async function uploadAll() {
    const uploadableDocuments = documents.filter((document) => document.status !== "Uploaded" && document.status !== "Failed");
    if (!uploadableDocuments.length) {
      toast.warning("Select at least one valid report before upload.");
      return;
    }
    setUploading(true);
    for (const document of uploadableDocuments) {
      updateDocument(document.id, { status: "Uploading", progress: 10, error: undefined });
      for (const progress of [35, 65, 90, 100]) {
        await new Promise((resolve) => window.setTimeout(resolve, 120));
        updateDocument(document.id, { progress });
      }
      updateDocument(document.id, { status: "Uploaded", ocrStatus: "Processing" });
      await new Promise((resolve) => window.setTimeout(resolve, 180));
      updateDocument(document.id, { ocrStatus: "Verification Ready" });
      saveUploadedOldRecord({ ...document, status: "Uploaded", progress: 100, ocrStatus: "Verification Ready" });
    }
    setUploading(false);
    toast.success("Reports uploaded and added to Patient Old records.");
  }

  function removeDocument(documentId: string) {
    const removed = documents.find((document) => document.id === documentId);
    if (removed?.objectUrl) URL.revokeObjectURL(removed.objectUrl);
    setDocuments((current) => current.filter((document) => document.id !== documentId));
    if (previewDocumentId === documentId) setPreviewDocumentId(null);
    toast.success("Document removed.");
  }

  function onDrop(event: React.DragEvent<HTMLElement>, category?: string) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files, category);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          multiple
          onChange={(event) => {
            addFiles(event.target.files);
            event.currentTarget.value = "";
          }}
          ref={browseInputRef}
          type="file"
        />
        <input
          accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          multiple
          onChange={(event) => {
            addFiles(event.target.files);
            event.currentTarget.value = "";
          }}
          ref={bulkInputRef}
          type="file"
        />

        <div
          className={`rounded-lg border border-dashed p-5 text-center transition ${dragActive ? "border-primary bg-primary/5" : "border-border bg-surface-muted/50"}`}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDrop={(event) => onDrop(event)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              browseInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <Upload className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 text-base font-semibold text-foreground">Drop triage and referral reports here</p>
          <p className="mt-1 text-sm text-muted-foreground">PDF, JPG, PNG, DOC, DOCX • Max 20 MB per file</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-5">
            <Button type="button" onClick={() => browseInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Browse
            </Button>
            <Button type="button" variant="outline" onClick={() => toast.info("Camera upload control is ready for device integration.")}>
              <Camera className="h-4 w-4" />
              Camera
            </Button>
            <Button type="button" variant="outline" onClick={() => toast.info("QR upload control is ready for referral-link integration.")}>
              <QrCode className="h-4 w-4" />
              QR
            </Button>
            <Button type="button" variant="outline" onClick={() => toast.info("Mobile upload control is ready for patient-attendant uploads.")}>
              <Smartphone className="h-4 w-4" />
              Mobile
            </Button>
            <Button type="button" variant="outline" onClick={() => bulkInputRef.current?.click()}>
              <FolderOpen className="h-4 w-4" />
              Bulk
            </Button>
          </div>
          {errors.length ? (
            <div className="mx-auto mt-4 max-w-2xl space-y-1 text-left">
              {errors.map((error) => (
                <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger" key={error}>{error}</p>
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-4">
          <button
            className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${selectedCategory === "All" ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-surface-muted"}`}
            onClick={() => setSelectedCategory("All")}
            type="button"
          >
            All ({documents.length})
          </button>
          {reportCategories.map((category) => (
            <button
              className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${selectedCategory === category ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-surface-muted"}`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDrop={(event) => onDrop(event, category)}
              type="button"
            >
              {category} ({documents.filter((document) => document.category === category).length})
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Uploaded File List</h3>
              <p className="text-xs text-muted-foreground">{selectedCategory === "All" ? "Showing all categories" : `Filtered by ${selectedCategory}`}</p>
            </div>
            <Button disabled={!validUploadCount || uploading} type="button" onClick={uploadAll}>
              <Upload className="h-4 w-4" />
              {validUploadCount ? `Upload ${validUploadCount} Reports` : "Upload Reports"}
            </Button>
          </div>

          {visibleDocuments.length ? (
            <div className="divide-y divide-border">
              {visibleDocuments.map((document) => (
                <div className="grid gap-3 p-3 lg:grid-cols-[minmax(0,1fr)_160px_140px_140px_160px]" key={document.id}>
                  <button className="min-w-0 text-left" onClick={() => setPreviewDocumentId(document.id)} type="button">
                    <p className="truncate text-sm font-semibold text-foreground">{document.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{document.type || "Unknown type"} • {formatFileSize(document.size)} • {document.uploadedBy}</p>
                    {document.error ? <p className="mt-1 text-xs font-semibold text-danger">{document.error}</p> : null}
                  </button>
                  <select className={selectClass} value={document.category} onChange={(event) => updateDocument(document.id, { category: event.target.value })}>
                    {reportCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{document.status}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${document.progress}%` }} />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{document.ocrStatus}</p>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button aria-label="Preview document" size="icon" type="button" variant="outline" onClick={() => setPreviewDocumentId(document.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button aria-label="Download document" disabled={!document.objectUrl} size="icon" type="button" variant="outline" onClick={() => {
                      if (!document.objectUrl) return;
                      const link = window.document.createElement("a");
                      link.href = document.objectUrl;
                      link.download = document.name;
                      link.click();
                    }}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button aria-label="Remove document" size="icon" type="button" variant="outline" onClick={() => removeDocument(document.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm font-semibold text-foreground">{selectedCategory === "All" ? "No documents selected yet." : `No ${selectedCategory} documents yet.`}</p>
              <p className="mt-1 text-xs text-muted-foreground">Use Browse, Camera, QR, Mobile, Bulk, or drag files into this area.</p>
            </div>
          )}
        </div>

        {previewDocument ? (
          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{previewDocument.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{previewDocument.category} • {formatFileSize(previewDocument.size)} • {previewDocument.uploadedAt}</p>
              </div>
              <Button size="sm" type="button" variant="outline" onClick={() => setPreviewDocumentId(null)}>Close</Button>
            </div>
            {previewDocument.objectUrl && previewDocument.type.startsWith("image/") ? (
              <img alt={previewDocument.name} className="mt-3 max-h-80 w-full rounded-lg border border-border object-contain" src={previewDocument.objectUrl} />
            ) : previewDocument.objectUrl && previewDocument.type === "application/pdf" ? (
              <iframe className="mt-3 h-80 w-full rounded-lg border border-border" src={previewDocument.objectUrl} title={previewDocument.name} />
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Preview is not available for this file type. Use download instead.</div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BasicDemographicForm() {
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const [arrivalDate, setArrivalDate] = React.useState(() => todayInputDate());
  const [permanentAddress, setPermanentAddress] = React.useState("");
  const [currentAddress, setCurrentAddress] = React.useState("");
  const [sameAsPermanent, setSameAsPermanent] = React.useState(false);

  React.useEffect(() => {
    if (!formRef.current) return;
    const draft = window.localStorage.getItem(basicDraftKey);
    if (!draft) return;
    try {
      const values = JSON.parse(draft) as Record<string, string>;
      setArrivalDate(values.arrivalDate || todayInputDate());
      setPermanentAddress(values.permanentAddress || "");
      setCurrentAddress(values.currentAddress || "");
      setSameAsPermanent(values.sameAsPermanent === "true");
      Object.entries(values).forEach(([name, value]) => {
        const field = formRef.current?.elements.namedItem(name);
        if (field instanceof HTMLInputElement && field.type === "checkbox") {
          field.checked = value === "true";
        } else if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          field.value = value;
        }
      });
    } catch {
      window.localStorage.removeItem(basicDraftKey);
    }
  }, []);

  function saveDraft() {
    if (!formRef.current) return;
    const fields = Array.from(formRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea"));
    const values = Object.fromEntries(fields.filter((field) => field.name).map((field) => [
      field.name,
      field instanceof HTMLInputElement && field.type === "checkbox" ? String(field.checked) : field.value,
    ]));
    window.localStorage.setItem(basicDraftKey, JSON.stringify(values));
    toast.success("Basic demographic draft saved.");
  }

  function updatePermanentAddress(value: string) {
    setPermanentAddress(value);
    if (sameAsPermanent) setCurrentAddress(value);
  }

  function updateSameAsPermanent(checked: boolean) {
    setSameAsPermanent(checked);
    if (checked) setCurrentAddress(permanentAddress);
  }

  function clearForm() {
    formRef.current?.reset();
    setArrivalDate(todayInputDate());
    setPermanentAddress("");
    setCurrentAddress("");
    setSameAsPermanent(false);
  }

  return (
    <form className="space-y-4" ref={formRef}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <UserRound className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">Basic Demographic</CardTitle>
              <CardDescription>Receptionist-only demographic capture. This file is independent from ER Nurse patient details.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Patient</h4>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <Field label="Date Patient Arrives"><Input className={inputClass} name="arrivalDate" onChange={(event) => setArrivalDate(event.target.value)} type="date" value={arrivalDate} /></Field>
            <Field label="MRN / Patient ID"><Input className={inputClass} name="mrn" /></Field>
            <Field label="UHID"><Input className={inputClass} name="uhid" /></Field>
            <Field className="xl:col-span-2" label="Patient Name"><Input className={inputClass} name="patientName" required /></Field>
            <Field label="Date of Birth"><Input className={inputClass} name="dateOfBirth" placeholder="DD / MM / YYYY" /></Field>
            <Field label="Age"><Input className={inputClass} inputMode="numeric" name="age" /></Field>
            <Field label="Gender">
              <select className={selectClass} name="gender" defaultValue="">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="ID Proof Type *">
              <select className={selectClass} name="identityType" required defaultValue="">
                <option value="">Select</option>
                {idProofTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
            </Field>
            <Field label="ID Proof Number *"><Input className={inputClass} name="identityNumber" required /></Field>
            <Field label="Blood Group">
              <select className={selectClass} name="bloodGroup" defaultValue="">
                <option value="">Select</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Known"].map((group) => <option key={group}>{group}</option>)}
              </select>
            </Field>
            <Field label="Country Code">
              <select className={selectClass} name="countryCode" defaultValue="+91">
                {countryCodes.map((code) => <option key={code}>{code}</option>)}
              </select>
            </Field>
            <Field label="Contact Number"><Input className={inputClass} inputMode="numeric" name="contactNumber" /></Field>
            <Field label="Alternative Contact Number"><Input className={inputClass} inputMode="numeric" name="alternativeContactNumber" /></Field>
            <Field label="WhatsApp Number"><Input className={inputClass} inputMode="numeric" name="whatsappNumber" /></Field>
            <Field label="Email Address"><Input className={inputClass} name="email" type="email" /></Field>
            <Field label="Insurance Number"><Input className={inputClass} name="insuranceNumber" /></Field>
            <Field label="Insurance Provider"><Input className={inputClass} name="insuranceProvider" /></Field>
            <Field label="Policy Number"><Input className={inputClass} name="policyNumber" /></Field>
            <Field label="City"><Input className={inputClass} name="city" /></Field>
            <Field label="State"><Input className={inputClass} name="state" /></Field>
            <Field label="PIN Code"><Input className={inputClass} inputMode="numeric" name="pinCode" /></Field>
            <Field className="md:col-span-2 xl:col-span-3" label="Permanent Address">
              <textarea className={textareaClass} name="permanentAddress" onChange={(event) => updatePermanentAddress(event.target.value)} value={permanentAddress} />
            </Field>
            <div className="space-y-1.5 md:col-span-2 xl:col-span-3">
              <div className="flex min-h-5 items-center justify-between gap-3">
                <span className="text-xs font-semibold text-foreground">Current Address</span>
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input checked={sameAsPermanent} name="sameAsPermanent" onChange={(event) => updateSameAsPermanent(event.target.checked)} type="checkbox" />
                  Same as permanent
                </label>
              </div>
              <textarea className={textareaClass} disabled={sameAsPermanent} name="currentAddress" onChange={(event) => setCurrentAddress(event.target.value)} value={currentAddress} />
            </div>
            <Field className="xl:col-span-2" label="Referred By (Dr. / Facility Name)"><Input className={inputClass} name="referredBy" /></Field>
            <Field label="Referred From"><Input className={inputClass} name="referredFrom" /></Field>
            <Field label="Referral Contact"><Input className={inputClass} name="referralContact" /></Field>
            <Field className="xl:col-span-2" label="Referral Type">
              <select className={selectClass} name="referralType" defaultValue="">
                <option value="">Select</option>
                <option>Self</option>
                <option>Doctor</option>
                <option>Hospital / Facility</option>
                <option>Others</option>
              </select>
            </Field>
            <Field className="md:col-span-2 xl:col-span-4" label="Referral Notes"><Input className={inputClass} name="referralNotes" placeholder="Enter referral notes if any" /></Field>
          </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Emergency Contact</h4>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
              <Field label="Emergency Contact Name"><Input className={inputClass} name="emergencyContactName" /></Field>
              <Field label="Emergency Contact Number"><Input className={inputClass} inputMode="numeric" name="emergencyContactNumber" /></Field>
              <Field label="Relationship to Patient"><Input className={inputClass} name="relationshipToPatient" /></Field>
              <Field label="Nationality"><Input className={inputClass} name="nationality" /></Field>
              <Field label="Preferred Language"><Input className={inputClass} name="preferredLanguage" /></Field>
              <Field label="Contact Number"><Input className={inputClass} inputMode="numeric" name="emergencyContactAlternateNumber" /></Field>
              <Field label="WhatsApp Number"><Input className={inputClass} inputMode="numeric" name="emergencyWhatsappNumber" /></Field>
              <Field label="Email"><Input className={inputClass} name="emergencyEmail" type="email" /></Field>
              <Field label="ID Proof Type *">
                <select className={selectClass} name="emergencyIdentityType" required defaultValue="">
                  <option value="">Select</option>
                  {idProofTypes.map((type) => <option key={type}>{type}</option>)}
                </select>
              </Field>
              <Field className="xl:col-span-2" label="ID Proof Number *"><Input className={inputClass} name="emergencyIdentityNumber" required /></Field>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">ER Staff Details</h4>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Field label="ER Nurse Assigned"><Input className={inputClass} name="erNurseAssigned" /></Field>
              <Field label="Duty Doctor"><Input className={inputClass} name="dutyDoctor" /></Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <UploadReportsSection />

      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={clearForm}>Clear</Button>
          <Button type="button" onClick={saveDraft}>
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        </div>
      </div>
    </form>
  );
}

function PatientOldRecords() {
  const [records, setRecords] = React.useState<OldRecordFile[]>([]);

  React.useEffect(() => {
    const refresh = () => setRecords(readOldRecordFiles());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(oldRecordsEvent, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(oldRecordsEvent, refresh);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-base">Patient Old records</CardTitle>
          <CardDescription>Files uploaded from Reception and ER Nurse upload workflows.</CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={() => setRecords(readOldRecordFiles())}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {records.length ? (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">File Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3">Uploaded At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">OCR</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr className="border-t border-border" key={record.id}>
                    <td className="max-w-[260px] truncate px-4 py-3 font-semibold text-foreground">{record.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatFileSize(record.size)}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{record.uploadedBy}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{record.uploadedAt}</td>
                    <td className="px-4 py-3 font-semibold text-foreground">{record.status}</td>
                    <td className="px-4 py-3 text-muted-foreground">{record.ocrStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-semibold text-foreground">No uploaded old records yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">Uploaded files from Reception or ER Nurse will show here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReceptionistBasicDemographicPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="Reception" />
      <Tabs defaultValue="basic">
        <TabsList aria-label="Receptionist patient details sections">
          <TabsTrigger value="basic">Basic Demographic</TabsTrigger>
          <TabsTrigger value="old-records">Patient Old records</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <BasicDemographicForm />
        </TabsContent>
        <TabsContent value="old-records">
          <PatientOldRecords />
        </TabsContent>
      </Tabs>
    </div>
  );
}
