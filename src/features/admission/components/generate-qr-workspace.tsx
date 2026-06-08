"use client";

import * as React from "react";
import { CheckCircle2, QrCode } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmissionStore } from "@/features/admission/admission-store";
import { AdmissionStatusBadge } from "@/features/admission/components/admission-status-badge";
import { cn } from "@/lib/utils";

function qrCells(seed: string) {
  const source = seed || "ADMISSION-QR";
  return Array.from({ length: 81 }, (_, index) => {
    const charCode = source.charCodeAt(index % source.length);
    return (charCode + index * 7) % 5 < 2;
  });
}

export function GenerateQrWorkspace() {
  const { state, activeRequest, actions } = useAdmissionStore();
  const cells = React.useMemo(() => qrCells(activeRequest?.qrReference ?? activeRequest?.id ?? ""), [activeRequest?.id, activeRequest?.qrReference]);

  function generateQr(requestId?: string) {
    actions.generateQr(requestId);
    toast.success("Admission QR generated.");
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Generate QR</CardTitle>
            <CardDescription>Step 8 admission QR reference for patient verification and print handoff.</CardDescription>
          </div>
          <Button onClick={() => generateQr(activeRequest?.id)} disabled={!activeRequest}>
            <QrCode className="h-4 w-4" />
            Generate QR
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeRequest ? (
            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-lg border border-border bg-white p-4">
                <div className="grid aspect-square grid-cols-9 gap-1 rounded-md bg-white p-2">
                  {cells.map((filled, index) => (
                    <span
                      className={cn("rounded-[2px]", filled ? "bg-foreground" : "bg-surface-muted")}
                      key={`${activeRequest.id}-${index}`}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-3 rounded-lg border border-border bg-surface-muted p-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Patient</div>
                  <div className="mt-1 font-semibold text-foreground">{activeRequest.patient}</div>
                  <div className="text-xs text-muted-foreground">{activeRequest.uhid}</div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info label="Admission Type" value={`${activeRequest.admissionCategory ?? "Admission"} / ${activeRequest.type}`} />
                  <Info label="Admitting Team" value={activeRequest.admittingTeam ?? activeRequest.doctor} />
                  <Info label="Ward" value={activeRequest.ward} />
                  <Info label="Priority" value={activeRequest.priority} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">QR Reference</div>
                  <div className="mt-1 break-all font-mono text-xs font-semibold text-foreground">
                    {activeRequest.qrReference ?? "Not generated"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              No admission request is selected.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Admission Requests</CardTitle>
            <CardDescription>Select any request and generate its QR.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.requests.map((request) => {
            const active = request.id === activeRequest?.id;
            return (
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  "w-full cursor-pointer rounded-lg border border-border p-3 text-left text-sm transition hover:border-primary/40 hover:bg-surface-muted",
                  active && "border-primary/50 bg-primary-soft",
                )}
                key={request.id}
                onClick={() => actions.setActiveRequest(request.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    actions.setActiveRequest(request.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-foreground">{request.patient}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{request.uhid}</div>
                  </div>
                  {request.qrReference ? <CheckCircle2 className="h-4 w-4 text-success" /> : <QrCode className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <AdmissionStatusBadge value={request.priority} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                      event.stopPropagation();
                      generateQr(request.id);
                    }}
                  >
                    Generate
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}
