import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type BundleCategory = "Actions" | "Forms" | "Layout" | "Feedback" | "Data";

export type BundlePreviewApi = {
  openDrawer: () => void;
  showToast: () => void;
};

export type BundleItem = {
  id: string;
  category: BundleCategory;
  title: string;
  description: string;
  icon: LucideIcon;
  code: string;
  renderPreview: (api: BundlePreviewApi) => ReactNode;
};

export const fieldClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";
