"use client";

import Link from "next/link";
import { ClipboardList, FileText, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadiologyNewOrderDialog } from "@/features/diagnostics/radiology/components/RadiologyNewOrderDialog";

export function RadiologyModuleHeaderActions() {
  return (
    <>
      <Button asChild variant="outline">
        <Link href="/radiology/order-list">
          <ClipboardList className="h-4 w-4" />
          Orders
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/radiology/front-office">
          <Users className="h-4 w-4" />
          Front Office
        </Link>
      </Button>
      <RadiologyNewOrderDialog
        trigger={
          <Button type="button">
            <FileText className="h-4 w-4" />
            New Order
          </Button>
        }
      />
    </>
  );
}
