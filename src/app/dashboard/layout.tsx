import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentAccount } from "@/lib/account-context";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();

  return <DashboardShell plan={account.plan}>{children}</DashboardShell>;
}
