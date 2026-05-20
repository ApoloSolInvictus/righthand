"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePersistentState } from "@/lib/local-demo-store";
import type { SubscriptionPlan } from "@/lib/types";
import { usdCurrency } from "@/lib/utils";

const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
  "ASD1rB8kXGsp_nsxtjfVYBvC2kGi_seJ8ldLfrA0xiGEt768cfwS0aqegjVMf886YksbwoCoGCS2P9bs";

const plans = [
  {
    id: "pyme",
    name: "PYME",
    price: 19,
    description: "Productos ilimitados, CRM y entregas.",
    features: ["Inventario ilimitado", "CRM", "Entregas y zonas"],
    planId: "P-7ER35589F36485216NIGO3JQ",
    paypalColor: "gold",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    description: "AI Delivery Manager, mensajeros y reportes.",
    features: ["AI Manager", "Mensajeros", "Reportes avanzados"],
    planId: "P-8BN67865HY6507532NIGO4PI",
    paypalColor: "blue",
  },
] as const;

type PayPalSubscriptionData = {
  subscriptionID?: string;
};

type PayPalButtonsActions = {
  subscription: {
    create: (input: { plan_id: string; custom_id?: string }) => Promise<string>;
  };
};

type PayPalButtonOptions = {
  style: {
    shape: "pill";
    color: "gold" | "blue";
    layout: "vertical";
    label: "subscribe";
  };
  createSubscription: (
    data: unknown,
    actions: PayPalButtonsActions,
  ) => Promise<string>;
  onApprove: (data: PayPalSubscriptionData) => void;
  onError: (error: unknown) => void;
};

type PayPalNamespace = {
  Buttons: (options: PayPalButtonOptions) => {
    render: (selector: string) => Promise<void>;
  };
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

function sdkUrl() {
  const params = new URLSearchParams({
    "client-id": PAYPAL_CLIENT_ID,
    vault: "true",
    intent: "subscription",
    components: "buttons",
  });

  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

function planLabel(plan: SubscriptionPlan) {
  if (plan === "free") {
    return "sin plan activo";
  }

  return plan;
}

export function BillingManager({
  currentPlan,
  businessId,
  isOwnerOverride,
}: {
  currentPlan: SubscriptionPlan;
  businessId: string;
  isOwnerOverride: boolean;
}) {
  const [plan, setPlan] = usePersistentState<SubscriptionPlan>(
    `righthand:billing-plan:${businessId}`,
    currentPlan,
  );
  const [sdkReady, setSdkReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const renderedPlans = useRef<Set<string>>(new Set());

  const activateSubscription = useCallback(
    async (item: (typeof plans)[number], data: PayPalSubscriptionData) => {
      const subscriptionId = data.subscriptionID;

      if (!subscriptionId) {
        setPlan(item.id);
        setMessage(`PayPal aprobo ${item.name}. El webhook terminara la activacion.`);
        return;
      }

      try {
        const response = await fetch("/api/paypal/activate-subscription", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            plan: item.id,
            planId: item.planId,
            subscriptionId,
          }),
        });

        const payload = (await response.json()) as {
          plan?: SubscriptionPlan;
          mode?: string;
          status?: string;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "PayPal activation failed");
        }

        const activatedPlan = payload.plan || item.id;
        setPlan(activatedPlan);
        setError("");
        setMessage(
          `Suscripcion ${item.name} aprobada: ${subscriptionId}. Servicios ${activatedPlan.toUpperCase()} activos${payload.mode === "demo" ? " en modo demo" : ""}.`,
        );
      } catch (activationError) {
        console.error("PayPal activation persistence failed", activationError);
        setPlan(item.id);
        setMessage(
          `PayPal aprobo ${item.name}: ${subscriptionId}. Si el webhook esta activo, la base se sincronizara automaticamente.`,
        );
      }
    },
    [setPlan],
  );

  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.getElementById("paypal-subscriptions-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => setSdkReady(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-subscriptions-sdk";
    script.src = sdkUrl();
    script.async = true;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.onload = () => setSdkReady(true);
    script.onerror = () =>
      setError("No se pudo cargar PayPal. Revisa el Client ID Live y el dominio.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!sdkReady || !window.paypal) {
      return;
    }

    const paypal = window.paypal;

    plans.forEach((item) => {
      const containerId = `paypal-button-container-${item.planId}`;
      const container = document.getElementById(containerId);

      if (!container || renderedPlans.current.has(item.planId)) {
        return;
      }

      container.innerHTML = "";
      renderedPlans.current.add(item.planId);

      paypal
        .Buttons({
          style: {
            shape: "pill",
            color: item.paypalColor,
            layout: "vertical",
            label: "subscribe",
          },
          createSubscription(_data, actions) {
            return actions.subscription.create({
              plan_id: item.planId,
              custom_id: businessId,
            });
          },
          onApprove(data) {
            void activateSubscription(item, data);
          },
          onError(paypalError) {
            console.error("PayPal subscription failed", paypalError);
            setError(
              `PayPal no pudo iniciar el plan ${item.name}. Confirma que el plan esta activo en Live.`,
            );
          },
        })
        .render(`#${containerId}`)
        .catch((renderError) => {
          renderedPlans.current.delete(item.planId);
          console.error("PayPal button render failed", renderError);
          setError(`No se pudo renderizar el boton de PayPal para ${item.name}.`);
        });
    });
  }, [activateSubscription, businessId, sdkReady]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-delivery">PayPal Live</p>
        <h1 className="text-3xl font-black tracking-normal text-primary">
          Suscripcion SaaS
        </h1>
        <p className="mt-2 text-muted-foreground">
          Plan actual: <span className="font-semibold">{planLabel(plan)}</span>
        </p>
        {isOwnerOverride ? (
          <p className="mt-2 text-sm font-medium text-success">
            Tu correo maestro tiene acceso Pro permanente.
          </p>
        ) : null}
      </div>

      {message ? (
        <Card className="border-success">
          <CardContent className="flex items-start gap-3 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-success" aria-hidden="true" />
            <div>
              <p className="font-semibold">Suscripcion recibida</p>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
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
              <div
                id={`paypal-button-container-${item.planId}`}
                className="min-h-[150px]"
              >
                {!sdkReady ? (
                  <p className="rounded-md bg-secondary p-3 text-sm text-muted-foreground">
                    Cargando boton oficial de PayPal...
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Webhook configurado</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          La ruta <code>/api/paypal/webhook</code> recibe eventos de PayPal. Los
          botones usan los planes Live oficiales y el SDK se carga una sola vez en
          esta pantalla.
        </CardContent>
      </Card>
    </div>
  );
}
