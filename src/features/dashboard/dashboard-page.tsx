"use client";

import {
  Activity,
  AlertTriangle,
  BedDouble,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FlaskConical,
  IdCard,
  Pill,
  Stethoscope,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

import { useRole } from "@/components/providers/role-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dashboardQuickActions } from "@/data/navigation";
import { bedOccupancy, dashboardStats, departmentActivity, recentActivity } from "@/data/mock";

const statIcons = [Stethoscope, IdCard, CalendarClock, Users, BedDouble, BedDouble, FlaskConical, Pill, CreditCard, AlertTriangle];
const AppointmentTimelineChart = dynamic(
  () => import("@/features/dashboard/appointment-timeline-chart").then((module) => module.AppointmentTimelineChart),
  {
    ssr: false,
    loading: () => <div className="h-[220px] rounded-md bg-surface-muted" />,
  },
);

export function DashboardPage() {
  const { role } = useRole();
  const quickActions =
    role === "Doctor"
      ? dashboardQuickActions.filter((action) => ["consult", "sample", "monitor"].includes(action.id))
      : role === "Nurse"
        ? dashboardQuickActions.filter((action) => ["admit", "monitor", "sample"].includes(action.id))
        : role === "Billing Executive"
          ? dashboardQuickActions.filter((action) => ["bill", "register"].includes(action.id))
          : role === "Management"
            ? dashboardQuickActions.filter((action) => ["bill", "monitor", "inventory"].includes(action.id))
            : dashboardQuickActions;

  return (
    <div className="space-y-5">
      <section className="grid gap-3 pt-4 sm:grid-cols-2 xl:grid-cols-5">
        {dashboardStats.map((stat, index) => (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" key={stat.id} style={{ animationDelay: `${index * 25}ms` }}>
            <StatCard
              label={stat.label}
              value={stat.value}
              change={stat.change}
              context={stat.context}
              tone={stat.tone}
              icon={statIcons[index] ?? Activity}
              currency={stat.id === "revenue"}
            />
          </div>
        ))}
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Role-Aware Quick Actions</CardTitle>
            <CardDescription>Actions update with the selected static role and route into future phase workspaces.</CardDescription>
          </div>
          <StatusPill tone="success">{role}</StatusPill>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button asChild className="h-auto justify-start p-3" key={action.id} variant="outline">
                  <Link href={action.route} prefetch={false}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-left">
                      <span className="block text-sm font-semibold">{action.label}</span>
                      <span className="block text-xs font-normal text-muted-foreground">Open {action.route}</span>
                    </span>
                  </Link>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Department Activity</CardTitle>
              <CardDescription>Queue pressure, appointments, and doctor availability.</CardDescription>
            </div>
            <StatusPill tone="info">Live-looking static</StatusPill>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr] border-b border-border bg-surface-muted px-3 py-2 text-xs font-semibold uppercase text-muted-foreground">
                  <span>Department</span>
                  <span>Queue</span>
                  <span>Doctors</span>
                  <span>Status</span>
                </div>
                {departmentActivity.map((item) => (
                  <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr] items-center border-b border-border px-3 py-3 text-sm last:border-0" key={item.department}>
                    <span className="font-medium text-foreground">{item.department}</span>
                    <span>{item.queue}</span>
                    <span>{item.doctors}</span>
                    <StatusPill tone={item.tone}>{item.status}</StatusPill>
                  </div>
                ))}
              </div>
              <div className="min-h-[260px] rounded-lg border border-border p-3">
                <div className="mb-3 text-sm font-semibold text-foreground">Appointment Timeline</div>
                <AppointmentTimelineChart />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Critical Work</CardTitle>
            <CardDescription>Alerts, approvals, and recent movement.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="alerts">
              <TabsList>
                <TabsTrigger value="alerts">Activity</TabsTrigger>
                <TabsTrigger value="beds">Beds</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>
              <TabsContent value="alerts" className="space-y-2">
                {recentActivity.map((item) => (
                  <div className="rounded-lg border border-border bg-surface-muted p-3" key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>
                      </div>
                      <StatusPill tone={item.tone}>{item.tone}</StatusPill>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="beds" className="space-y-3">
                {bedOccupancy.map((item) => {
                  const pct = Math.round((item.occupied / item.total) * 100);
                  return (
                    <div key={item.ward}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-medium text-foreground">{item.ward}</span>
                        <span className="text-muted-foreground">{item.occupied}/{item.total}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </TabsContent>
              <TabsContent value="tasks" className="space-y-2">
                {["Approve emergency discount", "Acknowledge critical lab alert", "Review ICU discharge readiness"].map((task) => (
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3" key={task}>
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{task}</span>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
