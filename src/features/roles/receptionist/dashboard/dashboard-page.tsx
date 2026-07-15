import Link from "next/link";
import { CreditCard, IdCard, ReceiptText, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { billingSnapshot, handoverItems, receptionStats, workQueues } from "./dashboard.data";

export function ReceptionistDashboardPage() {
  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Badge tone="info">Receptionist Role</Badge>
          <h1 className="mt-3 text-2xl font-semibold text-foreground">Front Office Dashboard</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Registration, appointments, OPD queue, admission reception, and billing collection in
            one role workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/receptionist/billing">
              <CreditCard className="h-4 w-4" />
              Billing Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/patients/register">
              <IdCard className="h-4 w-4" />
              Register Patient
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {receptionStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {stat.label}
                </p>
                <Badge tone={stat.tone}>{stat.meta}</Badge>
              </div>
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Billing Dashboard</CardTitle>
              <CardDescription>Reception billing status and collection queues</CardDescription>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/receptionist/billing">
                <ReceiptText className="h-4 w-4" />
                Open Billing
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {billingSnapshot.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-surface-muted p-4"
              >
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {item.label}
                </p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                  <p className="text-sm font-semibold text-muted-foreground">{item.amount}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Front Desk Queues</CardTitle>
              <CardDescription>Role shortcuts for daily reception work</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {workQueues.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-muted"
                  href={item.route}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">
                    {item.count}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Today Handover</CardTitle>
            <CardDescription>Reception focus list for smooth counter operations</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {handoverItems.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-lg border border-border bg-surface-muted p-3 text-sm text-muted-foreground"
            >
              <Users className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <span>{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
