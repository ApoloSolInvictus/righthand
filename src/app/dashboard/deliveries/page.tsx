import { ExternalLink, PackageCheck } from "lucide-react";

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
import { PlanUpgradeCard } from "@/components/dashboard/plan-upgrade-card";
import { getCurrentAccount } from "@/lib/account-context";
import { getBusinessDataset } from "@/lib/mock-data";
import { canUseFeature } from "@/lib/plans";
import { generateWazeLink } from "@/lib/waze";

export default async function DeliveriesPage() {
  const account = await getCurrentAccount();

  if (!canUseFeature(account.plan, "deliveries")) {
    return <PlanUpgradeCard feature="deliveries" currentPlan={account.plan} />;
  }

  const { deliveries, orders, couriers } = getBusinessDataset();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">Entregas</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Rutas y asignaciones
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos asignados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Mensajero</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Estado pedido</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Waze</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => {
                const order = orders.find((item) => item.id === delivery.orderId);
                const courier = couriers.find((item) => item.id === delivery.courierId);
                return (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-semibold">
                      {order?.publicTrackingCode}
                    </TableCell>
                    <TableCell>{courier?.name || "Sin asignar"}</TableCell>
                    <TableCell className="max-w-xs">{delivery.dropoffAddress}</TableCell>
                    <TableCell>{order ? <StatusBadge status={order.status} /> : null}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <PackageCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild size="sm" variant="outline">
                        <a
                          href={generateWazeLink({
                            lat: delivery.lat,
                            lng: delivery.lng,
                            address: delivery.dropoffAddress,
                          })}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          Abrir
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
