"use client";

import { FileSearch, FlaskConical, Microscope, Plus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

export type ResultsOrderTarget = "lab" | "pathology" | "radiology";

const orderIcons = {
  lab: FlaskConical,
  pathology: Microscope,
  radiology: FileSearch,
} satisfies Record<ResultsOrderTarget, typeof FlaskConical>;

export function ResultsOrderAddMenu({
  onSelect,
  options,
}: {
  onSelect: (target: ResultsOrderTarget) => void;
  options: Array<{ id: ResultsOrderTarget; label: string }>;
}) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
  }, [open]);

  if (!options.length) return null;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <Button
        aria-label="Add new diagnostic order"
        className="h-10 w-10 rounded-full p-0 shadow-md"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Plus className="h-4 w-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-white p-1 shadow-soft">
          {options.map((option) => {
            const Icon = orderIcons[option.id];

            return (
              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-bold text-slate-700 transition hover:bg-primary-soft hover:text-primary"
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setOpen(false);
                }}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
