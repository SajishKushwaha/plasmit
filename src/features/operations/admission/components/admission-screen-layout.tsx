import Link from "next/link";
import type { ReactNode } from "react";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { admissionScreenMap, admissionScreens, admissionWorkflowCards } from "@/features/operations/admission/data/admission-data";
import type { AdmissionScreenId } from "@/features/operations/admission/types";
import { cn } from "@/lib/utils";

const roleTabs: Array<{ label: string; route: string; activeIds: AdmissionScreenId[] }> = [
  { label: "Reception", route: "/admission/reception", activeIds: ["reception"] },
  { label: "Doctor", route: "/admission/doctor", activeIds: ["doctor"] },
  { label: "Admission Desk", route: "/admission/admission-desk", activeIds: ["admission-desk"] },
  { label: "Bed Manager", route: "/admission/bed-manager", activeIds: ["bed-manager"] },
  { label: "Nurse", route: "/admission/nurse-receive", activeIds: ["nurse-receive", "nurse-care"] },
  { label: "Billing", route: "/admission/billing", activeIds: ["billing"] },
  { label: "Admin", route: "/admission", activeIds: ["admin"] },
];

function stepRoute(label: string) {
  const title = label.replace(/^\d+\.\s*/, "");
  return admissionWorkflowCards.find((card) => card.title === title)?.route;
}

function stepTitle(label: string) {
  return label.replace(/^\d+\.\s*/, "");
}

export function AdmissionScreenLayout({
  activeScreen,
  activeStep,
  children,
}: {
  activeScreen: AdmissionScreenId;
  activeStep?: string;
  children: ReactNode;
}) {
  const screen = admissionScreenMap[activeScreen];
  const stepValue = activeStep ?? screen.steps[0];
  const activeStepTitle = stepTitle(stepValue);
  const workflowSteps = admissionScreenMap.admin.steps;

  return (
    <div className="space-y-4 py-4">
      <div className="flex flex-wrap gap-2">
        {roleTabs.map((tab) => {
          const active = tab.activeIds.includes(activeScreen);
          return (
            <Button asChild key={tab.label} size="sm" variant={active ? "default" : "outline"}>
              <Link href={tab.route}>{tab.label}</Link>
            </Button>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex flex-wrap gap-2">
          {workflowSteps.map((step) => {
            const route = stepRoute(step);
            const active = stepTitle(step) === activeStepTitle;
            const className = cn("min-h-8", active && "shadow-sm");
            return route ? (
              <Button asChild key={step} size="sm" variant={active ? "default" : "outline"} className={className}>
                <Link href={route}>
                  <ClipboardList className="h-4 w-4" />
                  {step}
                </Link>
              </Button>
            ) : (
              <Button key={step} size="sm" variant={active ? "default" : "outline"} className={className}>
                <ClipboardList className="h-4 w-4" />
                {step}
              </Button>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}

export function AdmissionQuickLinks({ activeScreen }: { activeScreen: AdmissionScreenId }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {admissionScreens
        .filter((screen) => screen.id !== activeScreen)
        .slice(0, 4)
        .map((screen) => (
          <Link
            className="rounded-lg border border-border bg-surface p-3 text-sm transition hover:border-primary/40 hover:bg-surface-muted"
            href={screen.route}
            key={screen.id}
          >
            <div className="font-semibold text-foreground">{screen.role}</div>
            <div className="mt-1 text-xs text-muted-foreground">{screen.roleSummary}</div>
          </Link>
        ))}
    </div>
  );
}
