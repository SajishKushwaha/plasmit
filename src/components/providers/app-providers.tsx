"use client";

import { Toaster } from "sonner";

import { IcuNursingRouteGuard } from "@/components/providers/icu-nursing-route-guard";
import { RoleProvider } from "@/components/providers/role-provider";
import { UiPreferenceProvider } from "@/components/providers/ui-preference-provider";
import { DoctorProvider } from "@/features/auth/doctor-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UiPreferenceProvider>
      <RoleProvider>
        <DoctorProvider>
          <IcuNursingRouteGuard>{children}</IcuNursingRouteGuard>
          <Toaster richColors closeButton position="top-right" />
        </DoctorProvider>
      </RoleProvider>
    </UiPreferenceProvider>
  );
}
