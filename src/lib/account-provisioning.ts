import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import { OWNER_PRO_EMAIL } from "@/lib/plans";
import type { SubscriptionPlan } from "@/lib/types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function slugifyBusinessName(name: string, userId: string) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tienda";

  return `${base}-${userId.slice(0, 8)}`;
}

export async function ensureBusinessForUser({
  userId,
  email,
  fullName,
  businessName,
}: {
  userId: string;
  email: string;
  fullName: string;
  businessName: string;
}) {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const admin = createAdminClient();
  const normalizedEmail = normalizeEmail(email);
  const plan: SubscriptionPlan =
    normalizedEmail === OWNER_PRO_EMAIL ? "pro" : "free";

  await admin.from("profiles").upsert({
    id: userId,
    full_name: fullName,
  });

  const { data: existingMembership } = await admin
    .from("business_members")
    .select("business_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingMembership?.business_id) {
    await admin
      .from("businesses")
      .update({ plan })
      .eq("id", existingMembership.business_id);

    return existingMembership.business_id as string;
  }

  const trimmedBusinessName = businessName.trim() || "Mi tienda";
  const businessSlug = slugifyBusinessName(trimmedBusinessName, userId);

  const { data: business, error: businessError } = await admin
    .from("businesses")
    .insert({
      name: trimmedBusinessName,
      slug: businessSlug,
      email: normalizedEmail,
      plan,
    })
    .select("id")
    .single();

  if (businessError || !business?.id) {
    throw businessError || new Error("Could not create RightHand business");
  }

  const businessId = business.id as string;

  await admin.from("business_members").insert({
    business_id: businessId,
    user_id: userId,
    role: "owner",
  });

  await admin
    .from("profiles")
    .update({ primary_business_id: businessId })
    .eq("id", userId);

  await admin.from("stores").insert({
    business_id: businessId,
    slug: businessSlug,
    name: trimmedBusinessName,
    description: "Tienda creada en RightHand.",
    primary_color: "#103A5C",
    success_color: "#219E6B",
    delivery_color: "#F97316",
    hours: {},
    is_published: false,
  });

  return businessId;
}
