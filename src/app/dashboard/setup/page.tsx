import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CreditCard,
  Database,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getIntegrationStatus } from "@/lib/integrations/status";

export const dynamic = "force-dynamic";

function StatusPill({ ready }: { ready: boolean }) {
  return (
    <Badge variant={ready ? "success" : "delivery"}>
      {ready ? "Conectado" : "Demo seguro"}
    </Badge>
  );
}

export default function SetupPage() {
  const status = getIntegrationStatus();
  const supabase = status.integrations.supabase;
  const openai = status.integrations.openai;
  const paypal = status.integrations.paypal;

  const cards = [
    {
      title: "Supabase",
      icon: Database,
      ready: supabase.ready,
      detail: supabase.ready
        ? `Conectado al proyecto ${supabase.projectRef}.`
        : supabase.projectRef
          ? `Variables detectadas para ${supabase.projectRef}, pero RightHand sigue bloqueado.`
          : "Bloqueado para evitar mezclar datos con otro proyecto.",
      lines: [
        `Bandera RightHand: ${supabase.enabled ? "activa" : "pendiente"}`,
        `URL y key: ${supabase.configured && !supabase.placeholder ? "presentes" : "pendientes"}`,
      ],
    },
    {
      title: "OpenAI",
      icon: Bot,
      ready: openai.ready,
      detail: openai.detail,
      lines: [`Modelo: ${openai.model}`, `Modo: ${openai.mode}`],
    },
    {
      title: "PayPal",
      icon: CreditCard,
      ready: paypal.ready,
      detail: paypal.detail,
      lines: [
        `Modo: ${paypal.mode}`,
        `Webhook: ${paypal.webhookConfigured ? "configurado" : "pendiente"}`,
      ],
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-delivery">
            Go-live checklist
          </p>
          <h1 className="text-3xl font-black tracking-normal text-primary">
            Setup de APIs
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            RightHand corre en demo hasta que conectes credenciales propias. Supabase
            requiere una bandera explicita para no usar por accidente otro proyecto.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/health" target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Ver JSON
          </a>
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {cards.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <item.icon className="h-5 w-5 text-delivery" aria-hidden="true" />
                  {item.title}
                </CardTitle>
                <StatusPill ready={item.ready} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm text-muted-foreground">{item.detail}</p>
              <div className="grid gap-2">
                {item.lines.map((line) => (
                  <p key={line} className="rounded-md bg-secondary p-3 text-sm">
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-delivery">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-delivery" aria-hidden="true" />
              Proteccion anti-mezcla
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Aunque Vercel tenga variables Supabase, RightHand no las usa hasta que
              exista `NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true`.
            </p>
            <p>
              Eso evita que clientes de prueba escriban datos en una base de otro
              proyecto.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pasos para activar produccion</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              "Crear un proyecto Supabase nuevo llamado RightHand.",
              "Ejecutar supabase/migrations/0001_righthand_init.sql.",
              "Agregar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en Vercel.",
              "Agregar NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true solo cuando confirmes que es el proyecto correcto.",
              "Conectar OPENAI_API_KEY y PayPal sandbox antes de cobrar en vivo.",
            ].map((step) => (
              <div key={step} className="flex gap-3 rounded-md border p-3 text-sm">
                {step.includes("solo cuando") ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-delivery" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" aria-hidden="true" />
                )}
                <span>{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
