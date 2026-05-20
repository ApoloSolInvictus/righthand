import { NextResponse } from "next/server";

import {
  getPayPalSubscription,
  getPlanFromPayPalPlanId,
  hasPayPalEnv,
  verifyPayPalWebhook,
} from "@/lib/paypal";
import { isEntitlementStatusActive, normalizeSubscriptionPlan } from "@/lib/plans";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";

type PayPalWebhookEvent = {
  event_type?: string;
  resource?: {
    id?: string;
    plan_id?: string;
    custom_id?: string;
    status?: string;
    billing_agreement_id?: string;
    billing_info?: {
      next_billing_time?: string;
    };
  };
};

function normalizeStatus(status: string | null | undefined, eventType: string | undefined) {
  if (status) {
    return status.toLowerCase();
  }

  if (eventType?.endsWith(".CANCELLED")) {
    return "cancelled";
  }

  if (eventType?.endsWith(".SUSPENDED")) {
    return "suspended";
  }

  if (eventType?.endsWith(".ACTIVATED") || eventType === "PAYMENT.SALE.COMPLETED") {
    return "active";
  }

  return "received";
}

async function persistPayPalEvent(event: PayPalWebhookEvent) {
  if (!hasSupabaseAdminEnv()) {
    return { persisted: false, reason: "missing_supabase_admin_env" };
  }

  const eventType = event.event_type;
  const resource = event.resource || {};
  const subscriptionId = eventType?.startsWith("PAYMENT.")
    ? resource.billing_agreement_id || resource.id
    : resource.id || resource.billing_agreement_id;

  if (!subscriptionId) {
    return { persisted: false, reason: "missing_subscription_id" };
  }

  const admin = createAdminClient();
  const { data: existingSubscription } = await admin
    .from("subscriptions")
    .select("business_id, plan")
    .eq("paypal_subscription_id", subscriptionId)
    .maybeSingle();

  let subscriptionDetails:
    | Awaited<ReturnType<typeof getPayPalSubscription>>
    | null = null;

  if (!resource.plan_id || !resource.custom_id) {
    try {
      subscriptionDetails = await getPayPalSubscription(subscriptionId);
    } catch (error) {
      console.error("PayPal subscription lookup from webhook failed", error);
    }
  }

  const businessId =
    resource.custom_id ||
    subscriptionDetails?.custom_id ||
    (existingSubscription?.business_id as string | undefined);
  const plan =
    getPlanFromPayPalPlanId(resource.plan_id || subscriptionDetails?.plan_id) ||
    normalizeSubscriptionPlan(existingSubscription?.plan);
  const status = normalizeStatus(
    resource.status || subscriptionDetails?.status,
    eventType,
  );

  if (!businessId) {
    return { persisted: false, reason: "missing_business_id", subscriptionId };
  }

  await admin.from("subscriptions").upsert(
    {
      business_id: businessId,
      plan,
      paypal_subscription_id: subscriptionId,
      status,
      current_period_end:
        resource.billing_info?.next_billing_time ||
        subscriptionDetails?.billing_info?.next_billing_time ||
        null,
    },
    { onConflict: "paypal_subscription_id" },
  );

  await admin
    .from("businesses")
    .update({ plan: isEntitlementStatusActive(status) ? plan : "free" })
    .eq("id", businessId);

  return { persisted: true, plan, status, subscriptionId };
}

export async function POST(request: Request) {
  const event = (await request.json()) as PayPalWebhookEvent;

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

  const persistence = await persistPayPalEvent(event);

  return NextResponse.json({ received: true, persistence });
}
