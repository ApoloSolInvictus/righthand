import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentAccount } from "@/lib/account-context";
import { createSeoMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createSeoMetadata({
  title: "Dashboard RightHand",
  description: "Panel privado de RightHand para administrar tienda, pedidos y clientes.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();

  return <DashboardShell plan={account.plan}>{children}</DashboardShell>;
}
