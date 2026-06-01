"use client";

import { Toaster } from "sonner";

import { RoleProvider } from "@/components/providers/role-provider";
import { UiPreferenceProvider } from "@/components/providers/ui-preference-provider";
import { DoctorProvider } from "@/features/auth/doctor-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UiPreferenceProvider>
      <RoleProvider>
        <DoctorProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </DoctorProvider>
      </RoleProvider>
    </UiPreferenceProvider>
  );
}
