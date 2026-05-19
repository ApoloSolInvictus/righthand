const placeholderValues = new Set([
  "https://your-project.supabase.co",
  "https://tu-proyecto.supabase.co",
  "sb_publishable_or_anon_key",
  "supabase_publishable_key",
]);

function isEnabledFlag(value: string | undefined) {
  return value?.toLowerCase() === "true";
}

function isPlaceholder(value: string | undefined) {
  if (!value) {
    return false;
  }

  return placeholderValues.has(value) || value.includes("your-project");
}

export function isSupabaseConnectionEnabled() {
  return (
    isEnabledFlag(process.env.RIGHTHAND_SUPABASE_ENABLED) ||
    isEnabledFlag(process.env.NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED)
  );
}

export function getSupabaseProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    return null;
  }

  try {
    const hostname = new URL(url).hostname;
    const [projectRef] = hostname.split(".");
    return projectRef || null;
  } catch {
    return null;
  }
}

export function getSupabaseStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const enabled = isSupabaseConnectionEnabled();
  const configured = Boolean(url && key);
  const placeholder = isPlaceholder(url) || isPlaceholder(key);
  const ready = enabled && configured && !placeholder;

  return {
    service: "Supabase",
    enabled,
    configured,
    placeholder,
    ready,
    mode: ready ? "live" : "demo",
    projectRef: configured && !placeholder ? getSupabaseProjectRef() : null,
    checks: [
      {
        label: "Proyecto dedicado de RightHand",
        ok: enabled,
        detail:
          "Activa NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true solo cuando el proyecto Supabase sea el correcto.",
      },
      {
        label: "URL y publishable key",
        ok: configured && !placeholder,
        detail:
          "Usa la URL y publishable key del proyecto Supabase dedicado a RightHand.",
      },
    ],
  };
}

export function hasSupabaseEnv() {
  return getSupabaseStatus().ready;
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!getSupabaseStatus().ready || !url || !key) {
    throw new Error(
      "Supabase is not enabled for RightHand. Set NEXT_PUBLIC_RIGHTHAND_SUPABASE_ENABLED=true with a dedicated Supabase project.",
    );
  }

  return { url, key };
}
