"use client";

import * as React from "react";
import { AlertTriangle, Code2, Copy } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { getBundleItem } from "@/features/platform/bundle/bundle-registry";
import type { BundlePreviewApi } from "@/features/platform/bundle/bundle-types";

function CodePanel({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Code2 className="h-4 w-4" />
          Next.js Code
        </div>
        <Button size="sm" variant="outline" onClick={onCopy}>
          <Copy className="h-4 w-4" />
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="max-h-[620px] overflow-auto bg-[#0b1020] p-4 text-xs leading-5 text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function BundlePage({ itemId }: { itemId?: string }) {
  const activeItem = getBundleItem(itemId);
  const ActiveIcon = activeItem.icon;
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(activeItem.code);
      setCopied(true);
      toast.success("Code copied");
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      toast.error("Copy failed");
    }
  }, [activeItem.code]);

  const previewApi = React.useMemo<BundlePreviewApi>(
    () => ({
      openDrawer: () => setDrawerOpen(true),
      showToast: () => toast.success("Saved successfully"),
    }),
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="UI Bundle"
        title={activeItem.title}
        description={activeItem.description}
        actions={<Badge tone="info">{activeItem.category}</Badge>}
      />

      <div className="grid gap-4 pt-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
        <section className="min-w-0 rounded-lg border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted">
              <ActiveIcon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-foreground">
                {activeItem.title} Preview
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Only this component type is shown here.
              </p>
            </div>
          </div>
          <div className="p-4">{activeItem.renderPreview(previewApi)}</div>
        </section>

        <section className="min-w-0">
          <CodePanel code={activeItem.code} onCopy={handleCopy} copied={copied} />
        </section>
      </div>

      <div className="rounded-lg border border-border bg-surface-muted p-3 text-xs text-muted-foreground">
        Sidebar ke `UI Bundle` submenu se doosra item select karoge to page sirf usi item ka preview
        aur code dikhayega.
      </div>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title="Patient action"
        description="Review details before save."
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setDrawerOpen(false)}>Save</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input placeholder="Reason" />
          <AlertBanner icon={AlertTriangle} title="Reason required" tone="warning">
            This drawer uses the shared side-panel component.
          </AlertBanner>
        </div>
      </Drawer>
    </div>
  );
}
