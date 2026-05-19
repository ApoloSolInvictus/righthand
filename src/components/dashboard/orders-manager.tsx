"use client";

import { Clock3, StepForward, XCircle } from "lucide-react";
import { useState } from "react";

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
import { usePersistentState } from "@/lib/local-demo-store";
import type { Order, OrderStatus } from "@/lib/types";
import { crcCurrency } from "@/lib/utils";

const statuses: OrderStatus[] = [
  "new",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "in_route",
  "delivered",
  "cancelled",
];

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  new: "confirmed",
  confirmed: "preparing",
  preparing: "ready_for_delivery",
  ready_for_delivery: "in_route",
  in_route: "delivered",
};

export function OrdersManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = usePersistentState("righthand:orders", initialOrders);
  const [message, setMessage] = useState("");

  function updateStatus(orderId: string, status: OrderStatus) {
    setOrders((current) =>
      current.map((order) => (order.id === orderId ? { ...order, status } : order)),
    );
    setMessage(`Pedido actualizado a ${status}.`);
  }

  function advanceOrder(order: Order) {
    const status = nextStatus[order.status];
    if (status) {
      updateStatus(order.id, status);
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">Pedidos</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Flujo operativo
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-7">
        {statuses.map((status) => (
          <div key={status} className="rounded-lg border bg-card p-3 text-center">
            <p className="text-2xl font-bold">
              {orders.filter((order) => order.status === status).length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{status}</p>
          </div>
        ))}
      </div>

      {message ? (
        <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
          {message}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Pedidos activos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-semibold">{order.publicTrackingCode}</TableCell>
                  <TableCell>
                    <p>{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                  </TableCell>
                  <TableCell>
                    <p>{order.zone}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {new Date(order.promisedAt).toLocaleTimeString("es-CR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.items.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">{crcCurrency(order.total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={!nextStatus[order.status]}
                        onClick={() => advanceOrder(order)}
                      >
                        <StepForward className="h-4 w-4" aria-hidden="true" />
                        Avanzar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={["delivered", "cancelled"].includes(order.status)}
                        onClick={() => updateStatus(order.id, "cancelled")}
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Cancelar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
