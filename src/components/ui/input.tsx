import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[var(--density-control-height)] w-full rounded-lg border border-input bg-white px-3.5 py-2 text-sm font-medium text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/75 focus:border-ring focus:ring-2 focus:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
