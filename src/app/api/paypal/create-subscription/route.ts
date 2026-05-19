import { NextResponse } from "next/server";

import {
  createPayPalSubscription,
  getPayPalPlanId,
  hasPayPalEnv,
} from "@/lib/paypal";

export async function POST(request: Request) {
  const body = (await request.json()) as { plan?: string; businessId?: string };
  const plan = body.plan || "pyme";
  const planId = getPayPalPlanId(plan);
  const origin = new URL(request.url).origin;

  if (!hasPayPalEnv() || !planId) {
    return NextResponse.json({
      mode: "demo",
      subscriptionId: `PAYPAL-DEMO-${plan.toUpperCase()}`,
      approvalUrl: `${origin}/dashboard/billing?demoPayPal=${plan}`,
    });
  }

  const subscription = await createPayPalSubscription({
    planId,
    returnUrl: `${origin}/dashboard/billing?paypal=success`,
    cancelUrl: `${origin}/dashboard/billing?paypal=cancelled`,
  });

  const approvalUrl = subscription.links?.find((link) => link.rel === "approve")?.href;

  return NextResponse.json({
    mode: "paypal",
    subscriptionId: subscription.id,
    status: subscription.status,
    approvalUrl,
  });
}
