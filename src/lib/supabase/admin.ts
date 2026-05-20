import { createClient } from "@supabase/supabase-js";

import { getSupabaseProjectRef } from "@/lib/supabase/env";

function hasValue(value: string | undefined) {
  return Boolean(value && !value.includes("your-") && !value.includes("tu-"));
}

export function hasSupabaseAdminEnv() {
  return Boolean(
    hasValue(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      hasValue(process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey || !hasSupabaseAdminEnv()) {
    const projectRef = getSupabaseProjectRef();
    throw new Error(
      `Missing Supabase service role key for RightHand${projectRef ? ` (${projectRef})` : ""}.`,
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
