"use client";

import * as React from "react";
import { CheckCircle2, Edit2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { PatientSummaryBanner } from "./shared/patient-summary-banner";

type LabStatus = "Ordered" | "Sample Pending" | "Result Pending" | "Completed";
type LabPriority = "Routine" | "Urgent" | "Stat";

type LabOrder = {
  id: string;
  testName: string;
  testCategory: string;
  priority: LabPriority;
  clinicalNotes: string;
  sampleType: string;
  collectionRequired: boolean;
  preferredDateTime: string;
  instructions: string;
  status: LabStatus;
};
export const sampleTypes = ["Blood", "Urine", "Stool", "CSF", "Sputum", "Wound swab", "Pleural Fluid", "Ascitic Fluid", "Biopsy"];

// const sampleTypes = ["Blood", "Urine", "Stool", "CSF", "Sputum", "Swab"];
const categories = ["Hematology", "Biochemistry", "Microbiology", "Pathology", "Immunology"];
const priorities: LabPriority[] = ["Routine", "Urgent", "Stat"];

const initialOrders: LabOrder[] = [
  { id: "lab-1", testName: "CBC", testCategory: "Hematology", priority: "Routine", clinicalNotes: "Fever and weakness", sampleType: "Blood", collectionRequired: true, preferredDateTime: "2026-06-08T10:30", instructions: "Fasting not required", status: "Ordered" },
  { id: "lab-2", testName: "KFT", testCategory: "Biochemistry", priority: "Urgent", clinicalNotes: "Rule out renal dysfunction", sampleType: "Blood", collectionRequired: true, preferredDateTime: "2026-06-08T11:00", instructions: "Send stat if creatinine rises", status: "Sample Pending" },
  { id: "lab-3", testName: "Urine R/M", testCategory: "Pathology", priority: "Routine", clinicalNotes: "Dysuria", sampleType: "Urine", collectionRequired: true, preferredDateTime: "2026-06-08T12:00", instructions: "Midstream sample", status: "Result Pending" },
];

function StatTile({ label, value, meta }: { label: string; value: string; meta: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{meta}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: LabStatus }) {
  const tone = status === "Completed" ? "success" : status === "Result Pending" ? "warning" : status === "Sample Pending" ? "info" : "default";
  return <Badge tone={tone}>{status}</Badge>;
}

function confirmDelete(message: string) {
  return window.confirm(message);
}

export function LaboratoryTab() {
  const [activeTab, setActiveTab] = React.useState<"test-order" | "order-summary">("test-order");
  const [search, setSearch] = React.useState("");
  const [orders, setOrders] = React.useState<LabOrder[]>(initialOrders);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<LabOrder>({
    id: "",
    testName: "",
    testCategory: "Hematology",
    priority: "Routine",
    clinicalNotes: "",
    sampleType: "Blood",
    collectionRequired: true,
    preferredDateTime: "",
    instructions: "",
    status: "Ordered",
  });

  const filteredOrders = orders.filter((item) => `${item.testName} ${item.testCategory} ${item.status}`.toLowerCase().includes(search.trim().toLowerCase()));

  const saveOrder = () => {
    if (!draft.testName.trim()) {
      toast.error("Test Name is required");
      return;
    }
    if (editingId) {
      setOrders((current) => current.map((item) => (item.id === editingId ? { ...draft, id: editingId } : item)));
      toast.success("Laboratory order updated");
    } else {
      const id = `lab-${Date.now()}`;
      setOrders((current) => [{ ...draft, id }, ...current]);
      toast.success("Laboratory order saved");
    }
    setEditingId(null);
    setDraft({ ...draft, id: "", testName: "", clinicalNotes: "", preferredDateTime: "", instructions: "" });
  };

  const editOrder = (id: string) => {
    const item = orders.find((row) => row.id === id);
    if (!item) return;
    setEditingId(id);
    setDraft(item);
    setActiveTab("test-order");
  };

  const removeOrder = (id: string) => {
    if (!confirmDelete("Delete this laboratory order?")) return;
    setOrders((current) => current.filter((item) => item.id !== id));
    toast.success("Laboratory order deleted");
  };

  return (
    <div className="space-y-4">
      <PatientSummaryBanner />

      {/* <div className="grid gap-3 md:grid-cols-3">
        <StatTile label="Lab orders" value={`${orders.length}`} meta="Current request queue" />
        <StatTile label="Pending samples" value={`${orders.filter((item) => item.status === "Sample Pending").length}`} meta="Need collection" />
        <StatTile label="Completed" value={`${orders.filter((item) => item.status === "Completed").length}`} meta="Result ready" />
      </div> */}

      <Card>
        <CardHeader>
          <CardTitle>Laboratory Order</CardTitle>
          <CardDescription>Doctor-side lab order screen with test order, summary, and status review.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["test-order", "order-summary"] as const).map((tab) => (
              <Button key={tab} type="button" size="sm" variant={activeTab === tab ? "default" : "outline"} onClick={() => setActiveTab(tab)}>
                {tab === "test-order" ? "Test Order" : tab === "order-summary" ? "Order Summary" : "Result / Status Review"}
              </Button>
            ))}
          </div>

          {activeTab === "test-order" ? (
            <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Test Name</div>
                  <Input value={draft.testName} onChange={(e) => setDraft((d) => ({ ...d, testName: e.target.value }))} placeholder="CBC, KFT..." />
                </label>
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Test Category</div>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.testCategory} onChange={(e) => setDraft((d) => ({ ...d, testCategory: e.target.value }))}>
                    {categories.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Priority</div>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.priority} onChange={(e) => setDraft((d) => ({ ...d, priority: e.target.value as LabPriority }))}>
                    {priorities.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Sample Type</div>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={draft.sampleType} onChange={(e) => setDraft((d) => ({ ...d, sampleType: e.target.value }))}>
                    {sampleTypes.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="space-y-2 md:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Clinical Notes / Diagnosis</div>
                  <textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" value={draft.clinicalNotes} onChange={(e) => setDraft((d) => ({ ...d, clinicalNotes: e.target.value }))} />
                </label>
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Collection Required</div>
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={String(draft.collectionRequired)} onChange={(e) => setDraft((d) => ({ ...d, collectionRequired: e.target.value === "true" }))}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Preferred Date & Time</div>
                  <Input type="datetime-local" value={draft.preferredDateTime} onChange={(e) => setDraft((d) => ({ ...d, preferredDateTime: e.target.value }))} />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Instructions</div>
                  <textarea className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none" value={draft.instructions} onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))} />
                </label>
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-surface-muted p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Order Summary
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="rounded-md border border-border bg-white p-3"><span className="text-muted-foreground">Test:</span> <span className="font-semibold">{draft.testName || "-"}</span></div>
                  <div className="rounded-md border border-border bg-white p-3"><span className="text-muted-foreground">Category:</span> <span className="font-semibold">{draft.testCategory}</span></div>
                  <div className="rounded-md border border-border bg-white p-3"><span className="text-muted-foreground">Priority:</span> <span className="font-semibold">{draft.priority}</span></div>
                  <div className="rounded-md border border-border bg-white p-3"><span className="text-muted-foreground">Status:</span> <span className="font-semibold">{draft.status}</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button className="flex-1" onClick={saveOrder}><Save className="h-4 w-4" />Submit Order</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setActiveTab("order-summary")}>View Summary</Button>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "order-summary" ? (
            <div className="space-y-3">
              <div className="grid gap-3">
                {filteredOrders.map((item) => (
                  <div key={item.id} className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-[minmax(0,1fr)_120px_120px_auto] md:items-center">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.testName}</div>
                      <div className="text-xs text-muted-foreground">{item.testCategory} • {item.sampleType} • {item.instructions || "No instruction"}</div>
                    </div>
                    <StatusBadge status={item.status} />
                    <Badge tone={item.priority === "Stat" ? "danger" : item.priority === "Urgent" ? "warning" : "success"}>{item.priority}</Badge>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => editOrder(item.id)}><Edit2 className="h-4 w-4" />Edit</Button>
                      <Button size="sm" variant="outline" className="text-danger" onClick={() => removeOrder(item.id)}><Trash2 className="h-4 w-4" />Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={saveOrder}>Save</Button>
                <Button variant="outline" onClick={() => toast.success("Order submitted to lab queue")}>Submit Order</Button>
                {/* <Button variant="outline" onClick={() => setActiveTab("result-review")}>View Result / Status</Button> */}
              </div>
            </div>
          ) : null}

        </CardContent>
      </Card>
    </div>
  );
}
