"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ensureBusinessForUser } from "@/lib/account-provisioning";
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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        business_name: businessName,
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
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
