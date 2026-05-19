import { NextResponse } from "next/server";

import { hasPayPalEnv, verifyPayPalWebhook } from "@/lib/paypal";

export async function POST(request: Request) {
  const event = await request.json();

  if (!hasPayPalEnv() || !process.env.PAYPAL_WEBHOOK_ID) {
    return NextResponse.json({
      mode: "demo",
      received: true,
      todo: "Configure PAYPAL_* env vars to verify and persist subscription events.",
    });
  }

  const verification = await verifyPayPalWebhook({
    headers: request.headers,
    event,
  });

  if (verification.verification_status !== "SUCCESS") {
    return NextResponse.json({ error: "Invalid PayPal webhook signature" }, { status: 401 });
  }

  // TODO: Persist subscription status in Supabase `subscriptions`.
  // Relevant events: BILLING.SUBSCRIPTION.ACTIVATED, CANCELLED, SUSPENDED,
  // PAYMENT.SALE.COMPLETED, PAYMENT.SALE.DENIED.
  return NextResponse.json({ received: true });
}
