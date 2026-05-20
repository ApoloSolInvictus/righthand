import { getPrimaryBusiness } from "@/lib/mock-data";
import {
  OWNER_PRO_EMAIL,
  isEntitlementStatusActive,
  normalizeSubscriptionPlan,
} from "@/lib/plans";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { SubscriptionPlan } from "@/lib/types";

type CurrentAccountSource =
  | "demo"
  | "anonymous"
  | "supabase"
  | "supabase-no-business"
  | "fallback";

export type CurrentAccount = {
  email: string | null;
  businessId: string;
  businessName: string;
  businessSlug: string;
  plan: SubscriptionPlan;
  isOwnerOverride: boolean;
  source: CurrentAccountSource;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  plan?: string | null;
};

type MembershipRow = {
  business_id: string;
  businesses?: BusinessRow | BusinessRow[] | null;
};

type SubscriptionRow = {
  plan?: string | null;
  status?: string | null;
};

function demoAccount(source: CurrentAccountSource = "demo"): CurrentAccount {
  const business = getPrimaryBusiness();

  return {
    email: null,
    businessId: business.id,
    businessName: business.name,
    businessSlug: business.slug,
    plan: "free",
    isOwnerOverride: false,
    source,
  };
}

function normalizeEmail(email: string | null | undefined) {
  return String(email || "").trim().toLowerCase();
}

function firstBusiness(row: MembershipRow | null): BusinessRow | null {
  const raw = row?.businesses;

  if (!raw) {
    return null;
  }

  return Array.isArray(raw) ? raw[0] || null : raw;
}

export async function getCurrentAccount(): Promise<CurrentAccount> {
  if (!hasSupabaseEnv()) {
    return demoAccount("demo");
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return demoAccount("anonymous");
    }

    const email = normalizeEmail(user.email);
    const isOwnerOverride = email === OWNER_PRO_EMAIL;

    const { data: membershipData } = await supabase
      .from("business_members")
      .select("business_id, businesses(id,name,slug,plan)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    const business = firstBusiness(membershipData as MembershipRow | null);

    if (!business) {
      return {
        ...demoAccount("supabase-no-business"),
        email,
        plan: isOwnerOverride ? "pro" : "free",
        isOwnerOverride,
      };
    }

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("plan,status")
      .eq("business_id", business.id)
      .order("updated_at", { ascending: false })
      .limit(5)
      .returns<SubscriptionRow[]>();

    const activeSubscription = (subscriptions || []).find((subscription) =>
      isEntitlementStatusActive(subscription.status),
    );

    const plan = isOwnerOverride
      ? "pro"
      : normalizeSubscriptionPlan(activeSubscription?.plan || business.plan);

    return {
      email,
      businessId: business.id,
      businessName: business.name,
      businessSlug: business.slug,
      plan,
      isOwnerOverride,
      source: "supabase",
    };
  } catch (error) {
    console.error("RightHand account context failed", error);
    return demoAccount("fallback");
  }
}
