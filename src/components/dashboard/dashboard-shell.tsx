import {
  Bot,
  Boxes,
  Calculator,
  CreditCard,
  FileSearch,
  LayoutDashboard,
  MapPinned,
  PackageCheck,
  Send,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { canUseFeature, planDetails, type DashboardFeature } from "@/lib/plans";
import type { SubscriptionPlan } from "@/lib/types";

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  feature: DashboardFeature;
}> = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard, feature: "dashboard" },
  {
    href: "/dashboard/profile",
    label: "Perfil negocio",
    icon: FileSearch,
    feature: "businessProfile",
  },
  { href: "/dashboard/store", label: "Tienda", icon: Store, feature: "store" },
  { href: "/dashboard/products", label: "Productos", icon: ShoppingBag, feature: "products" },
  { href: "/dashboard/orders", label: "Pedidos", icon: PackageCheck, feature: "orders" },
  { href: "/dashboard/customers", label: "Clientes", icon: Users, feature: "customers" },
  {
    href: "/dashboard/accounting",
    label: "Contabilidad",
    icon: Calculator,
    feature: "accounting",
  },
  { href: "/dashboard/deliveries", label: "Entregas", icon: MapPinned, feature: "deliveries" },
  { href: "/dashboard/couriers", label: "Mensajeros", icon: Send, feature: "couriers" },
  { href: "/dashboard/ai-manager", label: "AI Manager", icon: Bot, feature: "aiManager" },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, feature: "billing" },
];

export function DashboardShell({
  children,
  plan,
}: {
  children: ReactNode;
  plan: SubscriptionPlan;
}) {
  const visibleNavItems = navItems.filter((item) => canUseFeature(plan, item.feature));

  return (
    <div className="min-h-screen bg-background">
      <div className="no-print border-b bg-card">
        <div className="container flex min-h-16 items-center justify-between gap-4 py-3">
          <Link href="/" className="flex items-center gap-3 font-bold text-primary">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="h-5 w-5" aria-hidden="true" />
            </span>
            RightHand
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/tienda/soda-luna">Ver tienda</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/courier/orders">Mensajero</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container grid gap-6 py-6 lg:grid-cols-[230px_1fr]">
        <aside className="no-print lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <nav className="grid gap-1 rounded-lg border bg-card p-2">
            <div className="mb-1 flex items-center justify-between rounded-md bg-secondary px-3 py-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Plan
              </span>
              <Badge variant={plan === "free" ? "secondary" : "success"}>
                {planDetails[plan].label}
              </Badge>
            </div>
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
