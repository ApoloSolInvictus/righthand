"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureBusinessForUser } from "@/lib/account-provisioning";
import { normalizeBusinessCategory, parseSearchTags } from "@/lib/business-profile";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard?demo=1");
  }

  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");
  const businessName = String(formData.get("businessName") || "");
  const province = String(formData.get("province") || "");
  const city = String(formData.get("city") || "");
  const businessCategory = normalizeBusinessCategory(
    String(formData.get("businessCategory") || ""),
  );
  const businessStyle = String(formData.get("businessStyle") || "");
  const offerSummary = String(formData.get("offerSummary") || "");
  const searchTags = parseSearchTags(String(formData.get("searchTags") || ""));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
        province,
        city,
        business_category: businessCategory,
        business_style: businessStyle,
        offer_summary: offerSummary,
        search_tags: searchTags,
      },
    },
  });

  if (error) {
    redirect("/register?error=auth");
  }

  if (data.user?.id) {
    await ensureBusinessForUser({
      userId: data.user.id,
      email,
      fullName,
      businessName,
      province,
      city,
      businessCategory,
      businessStyle,
      offerSummary,
      searchTags,
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
