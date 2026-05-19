"use client";

import { CheckCircle2, Clock3, PackageCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/lib/types";
import { crcCurrency } from "@/lib/utils";

const steps = [
  "new",
  "confirmed",
  "preparing",
  "ready_for_delivery",
  "in_route",
  "delivered",
] as const;

export function TrackingCard({
  fallbackOrder,
  publicTrackingCode,
}: {
  fallbackOrder: Order;
  publicTrackingCode: string;
}) {
  const [order, setOrder] = useState(fallbackOrder);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("righthand:orders");
      const localOrders = raw ? (JSON.parse(raw) as Order[]) : [];
      const localOrder = localOrders.find(
        (item) =>
          item.publicTrackingCode.toLowerCase() ===
          publicTrackingCode.toLowerCase(),
      );

      if (localOrder) {
        setOrder(localOrder);
      }
    } catch {
      setOrder(fallbackOrder);
    }
  }, [fallbackOrder, publicTrackingCode]);

  const currentIndex = steps.indexOf(order.status as (typeof steps)[number]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <Link href="/" className="text-sm font-semibold text-primary">
          RightHand
        </Link>
        <CardTitle className="text-2xl">Pedido {order.publicTrackingCode}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.status} />
          <Badge variant="secondary">{crcCurrency(order.total)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="rounded-md bg-secondary p-4">
          <p className="font-semibold">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.address}</p>
        </div>
        <div className="grid gap-3">
          {steps.map((step, index) => {
            const done = currentIndex >= 0 && index <= currentIndex;
            return (
              <div key={step} className="flex items-center gap-3">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step === "in_route" ? (
                    <Truck className="h-4 w-4" aria-hidden="true" />
                  ) : step === "ready_for_delivery" ? (
                    <PackageCheck className="h-4 w-4" aria-hidden="true" />
                  ) : done ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                  )}
                </span>
                <span className="text-sm font-medium">{step}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
