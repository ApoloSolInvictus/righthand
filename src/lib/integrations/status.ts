import { getSupabaseStatus } from "@/lib/supabase/env";

function bool(value: string | undefined) {
  if (!value || value.trim().length === 0) {
    return false;
  }

  const normalized = value.toLowerCase();
  return !(
    normalized.includes("your-") ||
    normalized.includes("tu-") ||
    normalized.includes("xxxx") ||
    normalized.includes("yyyy")
  );
}

export function getIntegrationStatus() {
  const paypalConfigured = Boolean(
    bool(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) &&
      bool(process.env.PAYPAL_CLIENT_ID) &&
      bool(process.env.PAYPAL_CLIENT_SECRET) &&
      bool(process.env.PAYPAL_PLAN_PYME_ID) &&
      bool(process.env.PAYPAL_PLAN_PRO_ID),
  );

  return {
    checkedAt: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "local",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || null,
    integrations: {
      supabase: getSupabaseStatus(),
      openai: {
        service: "OpenAI",
        configured: bool(process.env.OPENAI_API_KEY),
        ready: bool(process.env.OPENAI_API_KEY),
        mode: bool(process.env.OPENAI_API_KEY) ? "live" : "heuristic",
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        detail: bool(process.env.OPENAI_API_KEY)
          ? "AI Delivery Manager usa OpenAI."
          : "AI Delivery Manager usa heuristica local hasta conectar OPENAI_API_KEY.",
      },
      paypal: {
        service: "PayPal",
        configured: paypalConfigured,
        ready: paypalConfigured,
        mode: paypalConfigured ? process.env.PAYPAL_ENVIRONMENT || "sandbox" : "demo",
        webhookConfigured: bool(process.env.PAYPAL_WEBHOOK_ID),
        detail: paypalConfigured
          ? "Billing renderiza botones oficiales de PayPal."
          : "Billing necesita NEXT_PUBLIC_PAYPAL_CLIENT_ID y credenciales PayPal.",
      },
    },
  };
}

export type IntegrationStatus = ReturnType<typeof getIntegrationStatus>;
