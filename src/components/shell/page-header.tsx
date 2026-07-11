import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  metrics,
  className,
  variant = "default",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  metrics?: ReactNode;
  className?: string;
  variant?: "default" | "primary";
}) {
  const primary = variant === "primary";

  return (
    <div
      className={cn(
        "-mx-4 px-4 py-5 md:-mx-6 md:px-6",
        primary
          ? "border-[#7367f0]/40 bg-gradient-to-r from-[#7367f0] to-[#5b8def] text-white shadow-[0_8px_20px_rgba(115,103,240,0.24)]"
          : "",
        className,
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-full">
          {eyebrow ? <div className={cn("mb-1 text-xs font-bold", primary ? "text-white/80" : "text-primary")}>{eyebrow}</div> : null}
          <h1 className={cn("truncate text-2xl font-bold tracking-tight", primary ? "text-white" : "text-foreground")}>{title}</h1>
          {description ? <p className={cn("mt-1.5 max-w-full break-words text-sm font-medium leading-6 lg:max-w-3xl", primary ? "text-white/85" : "text-muted-foreground")}>{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {metrics ? <div className="mt-3">{metrics}</div> : null}
    </div>
  );
}
