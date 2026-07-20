"use client";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-background p-6 text-center shadow-sm">
      <div className="text-lg font-bold text-slate-900">Unable to load patient</div>
      <p className="text-sm font-medium text-muted-foreground">{error.message || "Please retry the patient details page."}</p>
      <Button onClick={reset} type="button">
        Retry
      </Button>
    </div>
  );
}
