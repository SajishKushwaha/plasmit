"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Clock3, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchResults } from "@/data/mock";

export function CommandSearch({ triggerClassName, compact = false }: { triggerClassName?: string; compact?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "/" || (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey))) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const groups = Array.from(new Set(searchResults.map((result) => result.type)));
  const recentSearches = searchResults.slice(0, 3);
  const popularActions = searchResults.filter((result) => result.type === "Action");

  return (
    <>
      {triggerClassName ? (
        <button className={triggerClassName} onClick={() => setOpen(true)} aria-label={compact ? "Open global search" : undefined} type="button">
          <Search className="h-4 w-4" />
          {compact ? null : (
            <>
              Search patient, module, bill...
              <span className="ml-auto rounded border border-border px-1.5 py-0.5 text-[10px]">/</span>
            </>
          )}
        </button>
      ) : (
        <>
          <button
            className="hidden h-11 min-w-64 items-center gap-2 rounded-lg border border-border bg-white px-3.5 text-left text-sm font-medium text-muted-foreground shadow-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 lg:flex"
            onClick={() => setOpen(true)}
            type="button"
          >
            <Search className="h-4 w-4" />
            Search patient, module, bill...
            <span className="ml-auto rounded-md border border-border bg-surface-muted px-1.5 py-0.5 text-[10px]">/</span>
          </button>
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-white text-muted-foreground shadow-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open global search"
            type="button"
          >
            <Search className="h-4 w-4" />
          </button>
        </>
      )}

      {open ? (
        <div className="fixed inset-0 z-[90] bg-black/35 p-0 backdrop-blur-sm sm:p-6" role="presentation">
          <div className="mx-auto flex h-dvh max-w-3xl flex-col overflow-hidden bg-surface shadow-soft sm:h-auto sm:max-h-[76dvh] sm:rounded-xl sm:border sm:border-border">
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command className="min-w-0 flex-1">
                <Command.Input
                  autoFocus
                  className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Search patients, doctors, modules, invoices, reports, actions..."
                />
                <Command.List className="max-h-[calc(100dvh-104px)] overflow-auto py-2 sm:max-h-[58dvh]">
                  <Command.Empty className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No result found. Try UHID, module name, doctor, invoice, or report number.
                  </Command.Empty>
                  <Command.Group
                    className="px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground"
                    heading="Recent"
                  >
                    {recentSearches.map((result) => (
                      <Command.Item
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 outline-none aria-selected:bg-surface-muted"
                        key={`recent-${result.id}`}
                        onSelect={() => {
                          setOpen(false);
                          router.push(result.route);
                        }}
                        value={`recent ${result.title} ${result.description}`}
                      >
                        <Clock3 className="h-4 w-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{result.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{result.meta}</div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  <Command.Group
                    className="px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground"
                    heading="Popular actions"
                  >
                    {popularActions.map((result) => (
                      <Command.Item
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 outline-none aria-selected:bg-surface-muted"
                        key={`action-${result.id}`}
                        onSelect={() => {
                          setOpen(false);
                          router.push(result.route);
                        }}
                        value={`action ${result.title} ${result.description}`}
                      >
                        <Search className="h-4 w-4 text-primary" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{result.title}</div>
                          <div className="truncate text-xs text-muted-foreground">{result.description}</div>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  {groups.map((group) => (
                    <Command.Group
                      className="px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground"
                      heading={group}
                      key={group}
                    >
                      {searchResults
                        .filter((result) => result.type === group)
                        .map((result) => (
                          <Command.Item
                            className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 outline-none aria-selected:bg-surface-muted"
                            key={result.id}
                            onSelect={() => {
                              setOpen(false);
                              router.push(result.route);
                            }}
                            value={`${result.title} ${result.description} ${result.meta}`}
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface-muted text-xs font-semibold">
                              {result.type.slice(0, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">{result.title}</div>
                              <div className="truncate text-xs text-muted-foreground">{result.description}</div>
                            </div>
                            <Badge tone="muted">{result.meta}</Badge>
                          </Command.Item>
                        ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} aria-label="Close search">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
