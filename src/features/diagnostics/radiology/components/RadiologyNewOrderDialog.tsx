"use client";

import { type ReactNode, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadiologyCreateOrderView } from "@/features/diagnostics/radiology/components/RadiologyCreateOrderView";
import { radiologyPatients } from "@/features/diagnostics/radiology/data/patients";
import { radiologyTests } from "@/features/diagnostics/radiology/data/tests";

export function RadiologyNewOrderDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[80] flex h-[min(88dvh,820px)] w-[min(94vw,1120px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border bg-surface px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-foreground">Create Radiology Order</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Search patient, select tests, add clinical details, and create the order without leaving this screen.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close new order window" size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-5">
            <RadiologyCreateOrderView
              onCancel={() => setOpen(false)}
              onCreated={() => setOpen(false)}
              patients={radiologyPatients}
              tests={radiologyTests}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
