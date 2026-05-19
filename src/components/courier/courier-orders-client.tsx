"use client";

import { Camera, CheckCircle2, ExternalLink, PackageOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readFileAsDataUrl, usePersistentState } from "@/lib/local-demo-store";
import type { Courier, Delivery, Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { generateWazeLink } from "@/lib/waze";

type CourierOrdersClientProps = {
  courier: Courier;
  initialDeliveries: Delivery[];
  initialOrders: Order[];
};

export function CourierOrdersClient({
  courier,
  initialDeliveries,
  initialOrders,
}: CourierOrdersClientProps) {
  const [deliveries, setDeliveries] = usePersistentState(
    "righthand:courier-deliveries",
    initialDeliveries,
  );
  const [orders, setOrders] = usePersistentState(
    "righthand:courier-orders",
    initialOrders,
  );
  const [message, setMessage] = useState("");

  function markPickedUp(deliveryId: string, orderId: string) {
    setDeliveries((current) =>
      current.map((delivery) =>
        delivery.id === deliveryId ? { ...delivery, status: "picked_up" } : delivery,
      ),
    );
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "in_route" } : order,
      ),
    );
    setMessage("Pedido marcado como recogido y en ruta.");
  }

  function markDelivered(deliveryId: string, orderId: string) {
    setDeliveries((current) =>
      current.map((delivery) =>
        delivery.id === deliveryId ? { ...delivery, status: "delivered" } : delivery,
      ),
    );
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "delivered" } : order,
      ),
    );
    setMessage("Entrega completada.");
  }

  async function attachPhoto(deliveryId: string, file: File | undefined) {
    if (!file) {
      return;
    }

    const proofPhotoUrl = await readFileAsDataUrl(file);
    setDeliveries((current) =>
      current.map((delivery) =>
        delivery.id === deliveryId ? { ...delivery, proofPhotoUrl } : delivery,
      ),
    );
    setMessage("Foto de entrega agregada.");
  }

  const assigned = deliveries.filter((delivery) => delivery.courierId === courier.id);

  return (
    <main className="min-h-screen bg-background">
      <div className="container grid gap-6 py-6">
        <header className="flex flex-col justify-between gap-4 border-b pb-6 md:flex-row md:items-center">
          <div>
            <Link href="/" className="text-sm font-semibold text-primary">
              RightHand
            </Link>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-primary">
              Pedidos asignados
            </h1>
            <p className="text-muted-foreground">
              {courier.name} / {courier.zone}
            </p>
          </div>
          <Badge variant={courier.available ? "success" : "muted"}>
            {courier.available ? "Disponible" : "No disponible"}
          </Badge>
        </header>

        {message ? (
          <p className="rounded-md bg-success/10 p-3 text-sm font-medium text-success">
            {message}
          </p>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          {assigned.map((delivery) => {
            const order = orders.find((item) => item.id === delivery.orderId);
            const fileInputId = `proof-${delivery.id}`;

            if (!order) {
              return null;
            }

            return (
              <Card key={delivery.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{order.publicTrackingCode}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.customerName} / {order.customerPhone}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="rounded-md bg-secondary p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Entregar en
                    </p>
                    <p className="mt-1 font-medium">{delivery.dropoffAddress}</p>
                  </div>
                  {delivery.proofPhotoUrl ? (
                    <img
                      src={delivery.proofPhotoUrl}
                      alt=""
                      className="h-36 w-full rounded-md object-cover"
                    />
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button asChild variant="delivery">
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
                        Abrir en Waze
                      </a>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={delivery.status === "delivered"}
                      onClick={() => markPickedUp(delivery.id, order.id)}
                    >
                      <PackageOpen className="h-4 w-4" aria-hidden="true" />
                      Recogido
                    </Button>
                    <Button
                      type="button"
                      variant="success"
                      disabled={delivery.status === "delivered"}
                      onClick={() => markDelivered(delivery.id, order.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Entregado
                    </Button>
                    <input
                      id={fileInputId}
                      className="hidden"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        attachPhoto(delivery.id, event.target.files?.[0])
                      }
                    />
                    <label
                      htmlFor={fileInputId}
                      className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}
                    >
                      <Camera className="h-4 w-4" aria-hidden="true" />
                      Foto opcional
                    </label>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
