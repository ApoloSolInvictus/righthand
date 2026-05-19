"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard?demo=1");
  }

  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=auth");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
