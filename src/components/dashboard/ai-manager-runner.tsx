"use client";

import { Bot, Loader2, Route, Send } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  DeliveryManagerInput,
  DeliveryManagerResponse,
} from "@/lib/ai/delivery-manager";

type ApiResponse = {
  source: string;
  result: DeliveryManagerResponse;
};

export function AiManagerRunner({ input }: { input: DeliveryManagerInput }) {
  const [result, setResult] = useState<DeliveryManagerResponse | null>(null);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runAnalysis() {
    setLoading(true);
    const response = await fetch("/api/ai/delivery-manager", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await response.json()) as ApiResponse;
    setResult(data.result);
    setSource(data.source);
    setLoading(false);
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>AI Delivery Manager</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Analiza pedidos pendientes, zonas, mensajeros y horario del negocio.
            </p>
          </div>
          <Button onClick={runAnalysis} disabled={loading} variant="delivery">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Bot className="h-4 w-4" aria-hidden="true" />
            )}
            Analizar
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md bg-secondary p-4">
            <p className="text-2xl font-bold">{input.orders.length}</p>
            <p className="text-sm text-muted-foreground">Pedidos pendientes</p>
          </div>
          <div className="rounded-md bg-secondary p-4">
            <p className="text-2xl font-bold">{input.couriers.length}</p>
            <p className="text-sm text-muted-foreground">Mensajeros evaluados</p>
          </div>
          <div className="rounded-md bg-secondary p-4">
            <p className="text-2xl font-bold">{input.zones.length}</p>
            <p className="text-sm text-muted-foreground">Zonas activas</p>
          </div>
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="flex items-center gap-2">
            <Badge variant={source === "openai" ? "success" : "secondary"}>
              Fuente: {source}
            </Badge>
          </div>
          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prioridades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.priorities.map((priority) => (
                  <div key={priority.orderId} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{priority.orderId}</p>
                      <Badge
                        variant={
                          priority.level === "urgent" || priority.level === "high"
                            ? "delivery"
                            : "secondary"
                        }
                      >
                        {priority.level}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{priority.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Rutas sugeridas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.routes.map((route) => (
                  <div key={route.zone} className="rounded-md border p-3">
                    <p className="flex items-center gap-2 font-semibold">
                      <Route className="h-4 w-4 text-delivery" aria-hidden="true" />
                      {route.zone}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {route.rationale}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {route.orderIds.length} pedido(s), {route.wazeLinks.length} Waze link(s)
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes listos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.messages.map((message) => (
                  <div key={message.orderId} className="rounded-md bg-secondary p-3">
                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Send className="h-3 w-3" aria-hidden="true" />
                      {message.channel} / {message.orderId}
                    </p>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Alertas y mejoras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.alerts.map((alert, index) => (
                  <div key={`${alert.orderId}-${index}`} className="rounded-md border p-3">
                    <Badge variant={alert.severity === "critical" ? "destructive" : "delivery"}>
                      {alert.severity}
                    </Badge>
                    <p className="mt-2 text-sm">{alert.message}</p>
                  </div>
                ))}
                {result.suggestions.map((suggestion) => (
                  <p key={suggestion} className="rounded-md bg-secondary p-3 text-sm">
                    {suggestion}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
