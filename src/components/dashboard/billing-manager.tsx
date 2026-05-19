"use client";

import { CheckCircle2, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersistentState } from "@/lib/local-demo-store";
import type { SubscriptionPlan } from "@/lib/types";
import { usdCurrency } from "@/lib/utils";

const plans = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    description: "20 productos y 30 pedidos/mes.",
    features: ["Tienda publica", "Checkout basico", "Pedidos limitados"],
  },
  {
    id: "pyme",
    name: "PYME",
    price: 19,
    description: "Productos ilimitados, CRM y entregas.",
    features: ["Inventario ilimitado", "CRM", "Entregas y zonas"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    description: "AI Delivery Manager, mensajeros y reportes.",
    features: ["AI Manager", "Mensajeros", "Reportes avanzados"],
  },
] as const;

type CheckoutResult = {
  plan: string;
  subscriptionId: string;
  approvalUrl: string;
  mode: string;
};

export function BillingManager({ currentPlan }: { currentPlan: SubscriptionPlan }) {
  const [plan, setPlan] = usePersistentState<SubscriptionPlan>(
    "righthand:billing-plan",
    currentPlan,
  );
  const [loadingPlan, setLoadingPlan] = useState("");
  const [result, setResult] = useState<CheckoutResult | null>(null);

  async function activatePlan(nextPlan: SubscriptionPlan) {
    if (nextPlan === "free") {
      setPlan("free");
      setResult({
        plan: "free",
        subscriptionId: "FREE-DEMO",
        approvalUrl: "/dashboard/billing",
        mode: "local",
      });
      return;
    }

    setLoadingPlan(nextPlan);
    const response = await fetch("/api/paypal/create-subscription", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: nextPlan }),
    });
    const data = (await response.json()) as Omit<CheckoutResult, "plan">;
    setPlan(nextPlan);
    setResult({ ...data, plan: nextPlan });
    setLoadingPlan("");
  }

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">PayPal</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Suscripcion SaaS
        </h1>
        <p className="mt-2 text-muted-foreground">
          Plan actual: <span className="font-semibold">{plan}</span>
        </p>
      </div>

      {result ? (
        <Card className="border-success">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold">Plan {result.plan} activado en modo {result.mode}</p>
              <p className="text-sm text-muted-foreground">
                Suscripcion: {result.subscriptionId}
              </p>
            </div>
            <Button asChild variant="outline">
              <a href={result.approvalUrl}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Ver checkout
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((item) => (
          <Card key={item.id} className={item.id === plan ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>{item.name}</CardTitle>
                {item.id === plan ? <Badge>Actual</Badge> : null}
              </div>
              <p className="text-3xl font-black">
                {usdCurrency(item.price)}
                <span className="text-sm font-medium text-muted-foreground">/mes</span>
              </p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {item.features.map((feature) => (
                  <p key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
                    {feature}
                  </p>
                ))}
              </div>
              <Button
                type="button"
                className="w-full"
                variant={item.id === "pro" ? "delivery" : "outline"}
                disabled={loadingPlan === item.id}
                onClick={() => activatePlan(item.id)}
              >
                {loadingPlan === item.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <CreditCard className="h-4 w-4" aria-hidden="true" />
                )}
                {item.id === plan ? "Reactivar plan" : "Activar con PayPal"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Webhook configurado</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          La ruta <code>/api/paypal/webhook</code> recibe eventos de PayPal y esta
          lista para actualizar <code>subscriptions</code> cuando conectes
          credenciales reales.
        </CardContent>
      </Card>
    </div>
  );
}
