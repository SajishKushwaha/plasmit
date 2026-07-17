import { AppShell } from "@/components/shell/app-shell";
import { DashboardPage } from "@/features/platform/dashboard/dashboard-page";

export default function HomePage() {
  return (
    <AppShell>
      <DashboardPage />
    </AppShell>
  );
}
