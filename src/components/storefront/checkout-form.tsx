"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { crcCurrency } from "@/lib/utils";
import type { Product, Store } from "@/lib/types";

type CheckoutFormProps = {
  store: Store;
  products: Product[];
  selectedProductId?: string;
};

export function CheckoutForm({ store, products, selectedProductId }: CheckoutFormProps) {
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      products
        .slice(0, 4)
        .map((product, index) => [
          product.id,
          selectedProductId
            ? product.id === selectedProductId
              ? 1
              : 0
            : index === 0
              ? 1
              : 0,
        ]),
    ),
  );
  const zone = store.deliveryZones[0];
  const subtotal = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.price * (quantities[product.id] || 0),
        0,
      ),
    [products, quantities],
  );
  const total = subtotal + (subtotal > 0 ? zone?.fee || 0 : 0);

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        storeSlug: store.slug,
        customerName: formData.get("customerName"),
        customerPhone: formData.get("customerPhone"),
        address: formData.get("address"),
        items: products
          .filter((product) => (quantities[product.id] || 0) > 0)
          .map((product) => ({
            productId: product.id,
            quantity: quantities[product.id],
          })),
      }),
    });
    const data = (await response.json()) as { trackingCode?: string };
    setTrackingCode(data.trackingCode || "RH-DEMO");
  }

  return (
    <form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="customerName">Nombre</Label>
          <Input id="customerName" name="customerName" required placeholder="Tu nombre" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="customerPhone">Telefono</Label>
          <Input id="customerPhone" name="customerPhone" required placeholder="+506 8888-0000" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Direccion de entrega</Label>
          <Textarea
            id="address"
            name="address"
            required
            placeholder="Provincia, canton, distrito y senas"
          />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-delivery" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Carrito</h2>
        </div>
        <div className="grid gap-3">
          {products.slice(0, 4).map((product) => (
            <label
              key={product.id}
              className="grid grid-cols-[1fr_84px] items-center gap-3 rounded-md border p-3"
            >
              <span>
                <span className="block text-sm font-medium">{product.name}</span>
                <span className="text-xs text-muted-foreground">{crcCurrency(product.price)}</span>
              </span>
              <Input
                aria-label={`Cantidad de ${product.name}`}
                min={0}
                max={9}
                type="number"
                value={quantities[product.id] || 0}
                onChange={(event) =>
                  setQuantities((current) => ({
                    ...current,
                    [product.id]: Number(event.target.value),
                  }))
                }
              />
            </label>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{crcCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Entrega {zone?.name}</span>
            <span>{crcCurrency(subtotal > 0 ? zone?.fee || 0 : 0)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{crcCurrency(total)}</span>
          </div>
        </div>
        <Button className="mt-5 w-full" variant="delivery" disabled={subtotal <= 0}>
          Confirmar pedido
        </Button>
        {trackingCode ? (
          <div className="mt-4 rounded-md bg-success/10 p-3 text-sm font-medium text-success">
            <p>Pedido creado: {trackingCode}</p>
            <Button asChild className="mt-3" size="sm" variant="success">
              <Link href={`/order/${trackingCode}`}>Ver seguimiento</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </form>
  );
}
