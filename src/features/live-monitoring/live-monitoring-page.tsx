"use client";

import { RadioTower } from "lucide-react";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";

const liveMonitoringUrl = "https://icuvisualizer.up.railway.app/app";

export function LiveMonitoringPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Doctor IPD"
        title="Live Monitoring"
        description="ICU visualizer embedded inside the hospital workspace."
        actions={
          <Badge tone="info">
            <RadioTower className="h-3.5 w-3.5" />
            Live feed
          </Badge>
        }
      />
      <div className="min-h-[calc(100dvh-188px)] overflow-hidden rounded-lg border border-border bg-black shadow-soft">
        <iframe
          className="h-[calc(100dvh-188px)] min-h-[720px] w-full bg-black"
          src={liveMonitoringUrl}
          title="Live Monitoring"
        />
      </div>
    </div>
  );
}
