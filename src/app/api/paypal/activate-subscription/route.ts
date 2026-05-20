import { NextResponse } from "next/server";

import { getCurrentAccount } from "@/lib/account-context";
import {
  getPayPalSubscription,
  getPlanFromPayPalPlanId,
  hasPayPalEnv,
} from "@/lib/paypal";
import { isEntitlementStatusActive, normalizeSubscriptionPlan } from "@/lib/plans";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { SubscriptionPlan } from "@/lib/types";

type ActivateSubscriptionBody = {
  plan?: string;
  planId?: string;
  subscriptionId?: string;
};

function normalizeStatus(status: string | null | undefined) {
  return String(status || "approval_pending").toLowerCase();
}

async function persistSubscription({
  businessId,
  plan,
  paypalSubscriptionId,
  status,
  currentPeriodEnd,
}: {
  businessId: string;
  plan: SubscriptionPlan;
  paypalSubscriptionId: string;
  status: string;
  currentPeriodEnd?: string | null;
}) {
  const admin = createAdminClient();
  const entitlementPlan = isEntitlementStatusActive(status) ? plan : "free";

  await admin.from("subscriptions").upsert(
    {
      business_id: businessId,
      plan,
      paypal_subscription_id: paypalSubscriptionId,
      status,
      current_period_end: currentPeriodEnd || null,
    },
    { onConflict: "paypal_subscription_id" },
  );

  await admin.from("businesses").update({ plan: entitlementPlan }).eq("id", businessId);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ActivateSubscriptionBody;
  const subscriptionId = body.subscriptionId?.trim();

  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing PayPal subscription ID" }, { status: 400 });
  }

  const requestedPlan = normalizeSubscriptionPlan(body.plan);

  if (!hasPayPalEnv() || !hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    return NextResponse.json({
      mode: "demo",
      plan: requestedPlan,
      status: "approved",
      subscriptionId,
    });
  }

  const account = await getCurrentAccount();

  if (account.source !== "supabase") {
    return NextResponse.json(
      { error: "Login required to activate a paid plan" },
      { status: 401 },
    );
  }

  const subscription = await getPayPalSubscription(subscriptionId);
  const plan =
    getPlanFromPayPalPlanId(subscription.plan_id || body.planId) || requestedPlan;
  const status = normalizeStatus(subscription.status);

  await persistSubscription({
    businessId: account.businessId,
    plan,
    paypalSubscriptionId: subscriptionId,
    status,
    currentPeriodEnd: subscription.billing_info?.next_billing_time || null,
  });

  return NextResponse.json({
    received: true,
    plan: isEntitlementStatusActive(status) ? plan : "free",
    status,
    subscriptionId,
  });
}
