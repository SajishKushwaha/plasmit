"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { appointmentTimeline } from "@/data/mock";

export function AppointmentTimelineChart() {
  return (
    <ResponsiveContainer height={220} width="100%">
      <BarChart data={appointmentTimeline} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--surface-muted))" }}
          contentStyle={{
            background: "hsl(var(--surface))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
