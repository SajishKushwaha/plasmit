"use client";

import type * as React from "react";
import { Droplet, Info, StickyNote } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-xs font-medium text-muted-foreground">{children}</span>;
}
function FieldSelect({
  id,
  defaultValue,
  children,
}: {
  id: string;
  defaultValue: string;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      defaultValue={defaultValue}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
    >
      {children}
    </select>
  );
}

export function BloodRequestTab() {
  const [showStatus, setShowStatus] = useState(false);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-danger" />
              Blood Request
            </CardTitle>
            <CardDescription>Request details for blood bank approval.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-2">
              <FieldLabel>Blood Group</FieldLabel>
              <Input id="blood-group" defaultValue="A+" readOnly/>
            </label>

            <label className="space-y-2">
              <FieldLabel>No. Of Units</FieldLabel>
              <Input id="units" min={1} type="number" defaultValue="2" placeholder="Enter number of units" onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") {
                  e.preventDefault();
                }
              }}/>
            </label>

            <label className="space-y-2">
              <FieldLabel>Reasons</FieldLabel>
              <Input id="reasons" defaultValue="Low Hemoglobin" placeholder="Enter reasons" />
            </label>

            <label className="space-y-2">
              <FieldLabel>Priority</FieldLabel>
              <FieldSelect id="priority" defaultValue="High">
                <option value="" disabled>
                  Select
                </option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </FieldSelect>
            </label>

            <label className="space-y-2">
              <FieldLabel>Blood Products</FieldLabel>
              <Input id="blood-product" defaultValue="Packed RBC" placeholder="Enter blood products" />
            </label>
          </div>

          <label className="block space-y-2">
            <FieldLabel>Instructions</FieldLabel>
            <div className="relative">
              <textarea
                id="instructions"
                rows={3}
                className="min-h-24 w-full rounded-md border border-input bg-background py-3 pl-10 pr-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                placeholder="Notes"
                defaultValue="Transfuse slowly and monitor BP every 30 minutes."
              />
              <StickyNote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" onClick={() => setShowStatus(true)}>
          Submit Request
        </Button>
      </div>
      {showStatus && (
        <Card className="border-warning/30 bg-warning/10 mt-4">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Info className="h-4 w-4 text-warning" />
                Current Blood Request Status
              </div>

              <p className="text-sm text-muted-foreground">
                Request submitted successfully for Blood Bank approval.
              </p>
            </div>

            <Badge tone="warning" className="px-3 py-1">
              Pending Approval
            </Badge>
          </CardContent>
        </Card>
    )}

    </div>
  );
}
