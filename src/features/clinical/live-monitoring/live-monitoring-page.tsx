"use client";

const liveMonitoringUrl = "https://visualizer.187.127.162.139.sslip.io/";

export function LiveMonitoringPage() {
  return (
    <div className="space-y-4">
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
