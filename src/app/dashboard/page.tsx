import {
  Banknote,
  PackageCheck,
  ShoppingBasket,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getBusinessDataset } from "@/lib/mock-data";
import { crcCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const dataset = getBusinessDataset();
  const sales = dataset.orders.reduce((sum, order) => sum + order.total, 0);
  const pending = dataset.orders.filter(
    (order) => !["delivered", "cancelled"].includes(order.status),
  ).length;
  const avgTicket = sales / dataset.orders.length;
  const recurring = dataset.customers.filter((customer) => customer.totalOrders >= 5).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">
            {dataset.business.name}
          </p>
          <h1 className="text-3xl font-black tracking-normal text-primary">
            Dashboard del negocio
          </h1>
          <p className="mt-2 text-muted-foreground">
            Ventas, pedidos, clientes, inventario y entregas del dia demo.
          </p>
        </div>
        <Button asChild variant="delivery">
          <Link href="/dashboard/ai-manager">Abrir AI Manager</Link>
        </Button>
      </div>

      <section className="grid dashboard-grid gap-4">
        <MetricCard
          title="Ventas del dia"
          value={crcCurrency(sales)}
          detail="Pedidos demo acumulados"
          icon={Banknote}
          tone="success"
        />
        <MetricCard
          title="Pedidos pendientes"
          value={String(pending)}
          detail="Requieren seguimiento"
          icon={PackageCheck}
          tone="delivery"
        />
        <MetricCard
          title="Ticket promedio"
          value={crcCurrency(avgTicket)}
          detail="Promedio por orden"
          icon={TrendingUp}
          tone="primary"
        />
        <MetricCard
          title="Clientes recurrentes"
          value={String(recurring)}
          detail="5+ compras historicas"
          icon={Users}
          tone="neutral"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataset.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.publicTrackingCode}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.zone}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right">{crcCurrency(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mas vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dataset.products.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock {product.stock} unidades
                  </p>
                </div>
                <Badge variant="secondary">{crcCurrency(product.price)}</Badge>
              </div>
            ))}
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/products">
                <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                Ver inventario
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
