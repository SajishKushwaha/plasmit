"use client";

import { Printer, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ResultsHeaderActions() {
  return (
    <>
      <Button variant="outline" onClick={() => window.location.reload()}>
        <RefreshCcw className="h-4 w-4" />
        Refresh
      </Button>
      <Button onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        Print
      </Button>
    </>
  );
}
