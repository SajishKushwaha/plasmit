"use client";

import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DatePicker({ value, onChange, ariaLabel = "Select date", className }: { value: string; onChange: (value: string) => void; ariaLabel?: string; className?: string }) {
  const selected = parseDate(value);
  const [month, setMonth] = React.useState(() => selected ?? new Date());
  const days = calendarDays(month);
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button aria-label={ariaLabel} className={cn("h-10 justify-start rounded-xl px-3 font-semibold", !value && "text-slate-500", className)} variant="outline">
          <CalendarDays className="h-4 w-4" />{selected ? selected.toLocaleDateString("en-GB") : "Select date"}
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" className="z-[70] w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl" sideOffset={4}>
          <div className="mb-3 flex items-center justify-between">
            <Button aria-label="Previous month" className="h-8 w-8 p-0" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} variant="ghost"><ChevronLeft className="h-4 w-4" /></Button>
            <p className="text-sm font-bold text-slate-900">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            <Button aria-label="Next month" className="h-8 w-8 p-0" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} variant="ghost"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">{"SMTWTFS".split("").map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map(({ date, currentMonth }) => {
              const key = toDateKey(date); const active = key === value;
              return <Popover.Close asChild key={key}><Button className={cn("h-8 w-8 rounded-lg p-0 text-xs", !currentMonth && "text-slate-300", active && "bg-[#6878E8] text-white hover:bg-[#5B6CE0]")} onClick={() => onChange(key)} variant="ghost">{date.getDate()}</Button></Popover.Close>;
            })}
          </div>
          {value ? <Popover.Close asChild><Button className="mt-3 h-9 w-full" onClick={() => onChange("")} variant="outline">Clear date</Button></Popover.Close> : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function parseDate(value: string) { const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value); return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null; }
function toDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function calendarDays(month: Date) { const first = new Date(month.getFullYear(), month.getMonth(), 1); const start = new Date(first); start.setDate(first.getDate() - first.getDay()); return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return { date, currentMonth: date.getMonth() === month.getMonth() }; }); }
