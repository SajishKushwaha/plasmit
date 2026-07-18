import type { BundleCategory, BundleItem } from "@/features/platform/bundle/bundle-types";
import { alertStatusBundle } from "@/features/platform/bundle/items/alert-status-bundle";
import { boxBundle } from "@/features/platform/bundle/items/box-bundle";
import { buttonBundle } from "@/features/platform/bundle/items/button-bundle";
import { drawerBundle } from "@/features/platform/bundle/items/drawer-bundle";
import { emptyLoadingBundle } from "@/features/platform/bundle/items/empty-loading-bundle";
import { formControlsBundle } from "@/features/platform/bundle/items/form-controls-bundle";
import { navbarBundle } from "@/features/platform/bundle/items/navbar-bundle";
import { searchBoxBundle } from "@/features/platform/bundle/items/search-box-bundle";
import { sidebarBundle } from "@/features/platform/bundle/items/sidebar-bundle";
import { tableBundle } from "@/features/platform/bundle/items/table-bundle";
import { tabsBundle } from "@/features/platform/bundle/items/tabs-bundle";
import { textareaBundle } from "@/features/platform/bundle/items/textarea-bundle";
import { textboxBundle } from "@/features/platform/bundle/items/textbox-bundle";
import { toastBundle } from "@/features/platform/bundle/items/toast-bundle";

export const bundleItems: BundleItem[] = [
  buttonBundle,
  textboxBundle,
  textareaBundle,
  searchBoxBundle,
  formControlsBundle,
  navbarBundle,
  sidebarBundle,
  boxBundle,
  tabsBundle,
  alertStatusBundle,
  drawerBundle,
  toastBundle,
  tableBundle,
  emptyLoadingBundle,
];

export const bundleCategories: BundleCategory[] = [
  "Actions",
  "Forms",
  "Layout",
  "Feedback",
  "Data",
];

export function getBundleItem(itemId?: string) {
  return bundleItems.find((item) => item.id === itemId) ?? bundleItems[0];
}
