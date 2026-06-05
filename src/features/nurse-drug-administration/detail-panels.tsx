"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AdministrationAction, AdministrationDetail, FluidAdministrationDetail } from "./types";

const administrationActions: AdministrationAction[] = ["Administered", "Not administered", "Late administered"];

function formatCurrentDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function isFutureDateTime(date: string, time: string) {
  const currentDate = formatCurrentDate();
  const currentTime = formatCurrentTime();
  return date > currentDate || (date === currentDate && time > currentTime);
}

function validateAdministrationDateTime(date: string, time: string) {
  if (!date) return "Select administration date";
  if (!time) return "Select administration time";
  if (isFutureDateTime(date, time)) return "Administration date/time cannot be in the future";
  return "";
}

function isStopBeforeAdministration(stopAt: string, date: string, time: string) {
  if (!stopAt || !date || !time) return false;
  return stopAt < `${date}T${time}`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
}) {
  return (
    <select
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex h-9 items-center justify-between gap-3 rounded-md border border-input bg-background px-3">
      <div className="shrink-0 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="min-w-0 truncate text-sm font-semibold text-foreground">{value || "-"}</div>
    </div>
  );
}

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[88dvh] w-[min(94vw,720px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close popup">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
          <div className="border-t border-border bg-surface p-3">{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CounterCheckFields({
  checked,
  checkedBy,
  checkedAt,
  onChange,
}: {
  checked: boolean;
  checkedBy: string;
  checkedAt: string;
  onChange: (values: { checked?: boolean; checkedBy?: string; checkedAt?: string }) => void;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-border bg-surface-muted p-3">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange({ checked: event.target.checked })}
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
        />
        Counter-check by another nurse
      </label>
      {checked ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Nurse name">
            <Input value={checkedBy} onChange={(event) => onChange({ checkedBy: event.target.value })} placeholder="Counter-check nurse" />
          </FormField>
          <FormField label="Counter-check time">
            <Input type="time" value={checkedAt} onChange={(event) => onChange({ checkedAt: event.target.value })} />
          </FormField>
        </div>
      ) : null}
    </div>
  );
}

export function AdministrationDetailsPanel({
  open,
  detail,
  onOpenChange,
  onChange,
}: {
  open: boolean;
  detail: AdministrationDetail;
  onOpenChange: (open: boolean) => void;
  onChange: (detail: AdministrationDetail) => void;
}) {
  const reasonRequired = detail.action !== "Administered";

  const accept = () => {
    const dateTimeError = validateAdministrationDateTime(detail.administrationDate, detail.time);
    if (dateTimeError) {
      toast.error(dateTimeError);
      return;
    }
    if (reasonRequired && !detail.reason.trim()) {
      toast.error("Reason is mandatory for non-administration or late administration");
      return;
    }
    if (detail.counterChecked && (!detail.counterCheckedBy.trim() || !detail.counterCheckedAt)) {
      toast.error("Complete counter-check nurse name and time");
      return;
    }
    toast.success("Medication administration accepted");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Administration Details"
      description={`${detail.orderName} / ${detail.category}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button className="bg-danger" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={accept}>
            <CheckCircle2 className="h-4 w-4" />
            Accept
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        {/* Row 1 */}
        <div className="grid gap-3 md:grid-cols-3">
          <FormField label="Date">
            <Input
              type="date"
              max={formatCurrentDate()}
              value={detail.administrationDate}
              onChange={(event) =>
                onChange({ ...detail, administrationDate: event.target.value })
              }
            />
          </FormField>

          <FormField label="Dosage">
            <Input
              value={detail.dosage}
              onChange={(event) =>
                onChange({ ...detail, dosage: event.target.value })
              }
            />
          </FormField>

          <FormField label="Time">
            <Input
              type="time"
              value={detail.time}
              onChange={(event) =>
                onChange({ ...detail, time: event.target.value })
              }
            />
          </FormField>
        </div>

        {/* Row 2 */}
        <div className="grid gap-3 md:grid-cols-2">
          <ReadOnlyField
            label="Last administered at"
            value={detail.lastAdministeredAt}
          />

          <ReadOnlyField
            label="Last administered by"
            value={detail.lastAdministeredBy}
          />
        </div>

        {/* Row 3 */}
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Action">
            <SelectField
              value={detail.action}
              options={administrationActions}
              onChange={(action) => onChange({ ...detail, action })}
            />
          </FormField>

          {reasonRequired && (
            <FormField label="Reason">
              <Input
                value={detail.reason}
                onChange={(event) =>
                  onChange({ ...detail, reason: event.target.value })
                }
                placeholder="Enter reason"
              />
            </FormField>
          )}
        </div>

        <CounterCheckFields
          checked={detail.counterChecked}
          checkedBy={detail.counterCheckedBy}
          checkedAt={detail.counterCheckedAt}
          onChange={(values) =>
            onChange({
              ...detail,
              counterChecked: values.checked ?? detail.counterChecked,
              counterCheckedBy: values.checkedBy ?? detail.counterCheckedBy,
              counterCheckedAt: values.checkedAt ?? detail.counterCheckedAt,
            })
          }
        />
      </div>
    </Modal>
  );
}

export function FluidAdministrationDetailsPanel({
  open,
  detail,
  onOpenChange,
  onChange,
}: {
  open: boolean;
  detail: FluidAdministrationDetail;
  onOpenChange: (open: boolean) => void;
  onChange: (detail: FluidAdministrationDetail) => void;
}) {
  const canEditRate = detail.category === "Continuous";
  const bagVolume = Number(detail.bagVolume) || 0;
  const administered = Number(detail.volumeAdministered) || 0;
  const remaining = Math.max(bagVolume - administered, 0);

  React.useEffect(() => {
    const nextRemaining = String(remaining);
    if (detail.volumeRemaining !== nextRemaining) {
      onChange({ ...detail, volumeRemaining: nextRemaining });
    }
  }, [detail, onChange, remaining]);

  const updateNewBag = (newBag: boolean) => {
    const currentBagCount = Number(detail.bagCount) || 0;
    onChange({
      ...detail,
      newBag,
      bagCount: newBag ? String(currentBagCount + 1) : String(Math.max(currentBagCount - 1, 1)),
      volumeAdministered: newBag ? "0" : detail.volumeAdministered,
      volumeRemaining: newBag ? detail.bagVolume : detail.volumeRemaining,
    });
  };

  const accept = () => {
    const dateTimeError = validateAdministrationDateTime(detail.administrationDate, detail.time);
    if (dateTimeError) {
      toast.error(dateTimeError);
      return;
    }
    if (administered > bagVolume) {
      toast.error("Volume administered cannot be more than bag volume");
      return;
    }
    if (isStopBeforeAdministration(detail.stopAdministrationAt, detail.administrationDate, detail.time)) {
      toast.error("Stop administration time cannot be before administration time");
      return;
    }
    if (detail.counterChecked && (!detail.counterCheckedBy.trim() || !detail.counterCheckedAt)) {
      toast.error("Complete counter-check nurse name and time");
      return;
    }
    toast.success("Fluid administration accepted");
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Fluid Administration Details"
      description={`${detail.orderName} / ${detail.category}`}
      footer={
        <div className="flex justify-end gap-2">
          <Button className="bg-danger" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={accept}>
            <CheckCircle2 className="h-4 w-4" />
            Accept
          </Button>
        </div>
      }
    >
      <div className="grid gap-4">
        {/* Row 1 */}
        <div className="grid gap-3 md:grid-cols-3">
          <FormField label="Date">
            <Input
              type="date"
              max={formatCurrentDate()}
              value={detail.administrationDate}
              onChange={(event) =>
                onChange({ ...detail, administrationDate: event.target.value })
              }
            />
          </FormField>

          <FormField label="Rate">
            <Input
              value={detail.rate}
              readOnly={!canEditRate}
              className={!canEditRate ? "bg-surface-muted" : undefined}
              onChange={(event) =>
                onChange({ ...detail, rate: event.target.value })
              }
            />
          </FormField>

          <FormField label="Time">
            <Input
              type="time"
              value={detail.time}
              onChange={(event) =>
                onChange({ ...detail, time: event.target.value })
              }
            />
          </FormField>
        </div>

        {/* Row 2 */}
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnlyField
            label="Last administered at"
            value={detail.lastAdministeredAt}
          />

          <ReadOnlyField
            label="Last administered by"
            value={detail.lastAdministeredBy}
          />

          <ReadOnlyField
            label="Volume remaining"
            value={`${detail.volumeRemaining || remaining} ml`}
          />
        </div>

        {/* Row 3 */}
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Bag volume (ml)">
            <Input
              type="number"
              min={0}
              value={detail.bagVolume}
              onChange={(event) =>
                onChange({ ...detail, bagVolume: event.target.value })
              }
            />
          </FormField>

          <FormField label="Volume administered (ml)">
            <Input
              type="number"
              min={0}
              value={detail.volumeAdministered}
              onChange={(event) =>
                onChange({
                  ...detail,
                  volumeAdministered: event.target.value,
                })
              }
            />
          </FormField>
        </div>

        {/* Row 4 */}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3 text-sm font-medium text-foreground">
            <input
              type="checkbox"
              checked={detail.newBag}
              onChange={(event) => updateNewBag(event.target.checked)}
              className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
            />
            New bag
            <span className="ml-auto text-xs text-muted-foreground">
              Bag count: {detail.bagCount}
            </span>
          </label>

          <ReadOnlyField label="Bolus dose" value={detail.bolusDose} />
        </div>

        {/* Row 5 */}
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Stop administration">
            <Input
              type="datetime-local"
              value={detail.stopAdministrationAt}
              onChange={(event) =>
                onChange({
                  ...detail,
                  stopAdministrationAt: event.target.value,
                })
              }
            />
          </FormField>

          <FormField label="Reason">
            <Input
              value={detail.reason}
              onChange={(event) =>
                onChange({ ...detail, reason: event.target.value })
              }
              placeholder="Optional note"
            />
          </FormField>
        </div>

        {/* Counter Check Section */}
        <CounterCheckFields
          checked={detail.counterChecked}
          checkedBy={detail.counterCheckedBy}
          checkedAt={detail.counterCheckedAt}
          onChange={(values) =>
            onChange({
              ...detail,
              counterChecked: values.checked ?? detail.counterChecked,
              counterCheckedBy:
                values.checkedBy ?? detail.counterCheckedBy,
              counterCheckedAt:
                values.checkedAt ?? detail.counterCheckedAt,
            })
          }
        />
      </div>
    </Modal>
  );
}
