"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ModalFrame({
  title,
  children,
  onClose,
  maxWidth = "max-w-2xl",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`max-h-[88vh] w-full ${maxWidth} overflow-hidden rounded-lg border border-border bg-surface shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <Button
            aria-label="Close modal"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-[calc(88vh-56px)] overflow-auto p-4">{children}</div>
      </div>
    </div>
  );
}
