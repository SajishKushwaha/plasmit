import type { NavigationChildItem, NavigationItem } from "@/types";

type NavigationRouteNode = Pick<NavigationItem, "route" | "children"> | NavigationChildItem;

export function normalizeNavigationHref(route: string) {
  const [href = ""] = route.split("#");
  if (
    !href ||
    href.startsWith("http:") ||
    href.startsWith("https:") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return null;
  }
  return href;
}

export function collectNavigationHrefs(items: NavigationRouteNode[], limit = 8) {
  const hrefs = new Set<string>();

  function addRoute(item: NavigationRouteNode) {
    const href = normalizeNavigationHref(item.route);
    if (href) hrefs.add(href);
    item.children?.forEach(addRoute);
  }

  items.forEach(addRoute);
  return Array.from(hrefs).slice(0, limit);
}
