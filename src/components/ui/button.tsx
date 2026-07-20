import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#7367f0] to-[#5b8def] text-primary-foreground shadow-[0_8px_18px_rgba(115,103,240,0.22)] hover:brightness-[0.98] active:brightness-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        outline: "border border-border bg-white text-foreground shadow-sm hover:bg-surface-muted",
        ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        danger: "bg-danger text-danger-foreground shadow-sm hover:brightness-95",
      },
      size: {
        sm: "h-[var(--density-control-height-sm)] px-[var(--density-control-x-sm)] text-xs",
        md: "h-[var(--density-control-height)] px-[var(--density-control-x)]",
        lg: "h-[var(--density-control-height-lg)] px-[var(--density-control-x-lg)]",
        icon: "h-[var(--density-control-height)] w-[var(--density-control-height)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
