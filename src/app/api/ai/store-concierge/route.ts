import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";

import {
  formatStoreHours,
  getMockStoreConciergeContext,
  heuristicStoreConcierge,
  StoreConciergeInputSchema,
  StoreConciergeResponseSchema,
  type StoreConciergeBusiness,
  type StoreConciergeContext,
} from "@/lib/ai/store-concierge";
import { createAdminClient, hasSupabaseAdminEnv } from "@/lib/supabase/admin";
import type { BusinessCategory, SubscriptionPlan } from "@/lib/types";

export const runtime = "nodejs";

function hasUsableOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && !key.includes("your-key"));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(
      () => reject(new Error(`OpenAI request timed out after ${timeoutMs}ms`)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

type BusinessRef = {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  province: string | null;
  city: string | null;
  business_category: BusinessCategory | null;
  business_style: string | null;
  offer_summary: string | null;
  search_tags: string[] | null;
};

type StoreRow = {
  id: string;
  business_id: string;
  slug: string;
  name: string;
  description: string | null;
  hours: unknown;
  is_published: boolean;
  businesses: BusinessRef | BusinessRef[] | null;
};

type ProductRow = {
  business_id: string;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
};

type ZoneRow = {
  business_id: string;
  name: string;
  fee: number | string;
  eta_minutes: number;
};

function getBusinessRef(store: StoreRow) {
  return Array.isArray(store.businesses) ? store.businesses[0] : store.businesses;
}

async function getSupabaseStoreConciergeContext(): Promise<StoreConciergeContext | null> {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const admin = createAdminClient();
  const { data: storeRows, error } = await admin
    .from("stores")
    .select(
      `
        id,
        business_id,
        slug,
        name,
        description,
        hours,
        is_published,
        businesses (
          id,
          name,
          slug,
          plan,
          province,
          city,
          business_category,
          business_style,
          offer_summary,
          search_tags
        )
      `,
    )
    .eq("is_published", true)
    .limit(100);

  if (error || !storeRows?.length) {
    if (error) {
      console.error("Store concierge Supabase stores query failed", error);
    }
    return null;
  }

  const stores = (storeRows as unknown as StoreRow[]).filter((store) =>
    Boolean(getBusinessRef(store)),
  );
  const businessIds = stores.map((store) => store.business_id);

  const [{ data: productRows, error: productsError }, { data: zoneRows, error: zonesError }] =
    await Promise.all([
      admin
        .from("products")
        .select("business_id, name, description, price, stock")
        .in("business_id", businessIds)
        .eq("active", true)
        .limit(500),
      admin
        .from("delivery_zones")
        .select("business_id, name, fee, eta_minutes")
        .in("business_id", businessIds)
        .eq("active", true)
        .limit(300),
    ]);

  if (productsError) {
    console.error("Store concierge Supabase products query failed", productsError);
  }

  if (zonesError) {
    console.error("Store concierge Supabase zones query failed", zonesError);
  }

  const productsByBusiness = new Map<string, ProductRow[]>();
  (productRows as ProductRow[] | null | undefined)?.forEach((product) => {
    productsByBusiness.set(product.business_id, [
      ...(productsByBusiness.get(product.business_id) || []),
      product,
    ]);
  });

  const zonesByBusiness = new Map<string, ZoneRow[]>();
  (zoneRows as ZoneRow[] | null | undefined)?.forEach((zone) => {
    zonesByBusiness.set(zone.business_id, [
      ...(zonesByBusiness.get(zone.business_id) || []),
      zone,
    ]);
  });

  return {
    generatedAt: new Date().toISOString(),
    businesses: stores.map((store): StoreConciergeBusiness => {
      const business = getBusinessRef(store)!;

      return {
        id: business.id,
        name: business.name,
        slug: store.slug || business.slug,
        plan: business.plan || "free",
        category: business.business_category || "pyme",
        description: store.description || "",
        province: business.province || "Costa Rica",
        city: business.city || "Costa Rica",
        businessStyle: business.business_style || "Negocio local",
        offerSummary: business.offer_summary || store.description || "Productos locales.",
        searchTags: business.search_tags || [],
        storeUrl: `/tienda/${store.slug || business.slug}`,
        hours: formatStoreHours(store.hours),
        products: (productsByBusiness.get(store.business_id) || []).map((product) => ({
          name: product.name,
          description: product.description || "",
          price: Number(product.price),
          stock: product.stock,
        })),
        deliveryZones: (zonesByBusiness.get(store.business_id) || []).map((zone) => ({
          name: zone.name,
          fee: Number(zone.fee),
          etaMinutes: zone.eta_minutes,
        })),
      };
    }),
  };
}

async function getStoreConciergeContext() {
  return (await getSupabaseStoreConciergeContext()) || getMockStoreConciergeContext();
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = StoreConciergeInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid store concierge payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const context = await getStoreConciergeContext();

  if (!hasUsableOpenAIKey()) {
    return NextResponse.json({
      source: "heuristic",
      result: heuristicStoreConcierge(parsed.data, context),
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const timeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || 15000);
    const response = await withTimeout(
      client.responses.parse({
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        instructions:
          "Eres RightHand Concierge, el vendedor estrella de una red de PYMES de Costa Rica. Responde siempre en el idioma del visitante. Recomienda negocios, productos, horarios, ubicaciones y zonas de entrega usando solo el contexto recibido. Incluye negocios gratis y pagados por igual; no favorezcas ningun plan. Si no hay una coincidencia exacta, sugiere alternativas cercanas y pide un dato para afinar. No inventes horarios, precios ni productos.",
        input: JSON.stringify({
          site:
            "RightHand: La mano derecha de tu tienda. SaaS y directorio publico de negocios afiliados en Costa Rica.",
          visitorMessage: parsed.data.message,
          currentPath: parsed.data.path || "/",
          recentConversation: parsed.data.history,
          catalogContext: context,
        }),
        text: {
          format: zodTextFormat(
            StoreConciergeResponseSchema,
            "store_concierge_response",
          ),
        },
      }),
      timeoutMs,
    );

    return NextResponse.json({
      source: "openai",
      result: response.output_parsed || heuristicStoreConcierge(parsed.data, context),
    });
  } catch (error) {
    console.error("OpenAI store concierge failed", error);
    return NextResponse.json({
      source: "heuristic_fallback",
      result: heuristicStoreConcierge(parsed.data, context),
    });
  }
}
