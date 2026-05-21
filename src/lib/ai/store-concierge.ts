import { z } from "zod";

import {
  businesses,
  deliveryZones,
  products,
  stores,
} from "@/lib/mock-data";
import type { BusinessCategory, SubscriptionPlan } from "@/lib/types";
import { crcCurrency } from "@/lib/utils";
import { generateWazeLink } from "@/lib/waze";

export const StoreConciergeInputSchema = z.object({
  message: z.string().trim().min(1).max(800),
  path: z.string().trim().max(200).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().max(1200),
      }),
    )
    .max(8)
    .default([]),
});

export const StoreConciergeResponseSchema = z.object({
  language: z.string(),
  answer: z.string(),
  recommendations: z.array(
    z.object({
      businessName: z.string(),
      storeSlug: z.string(),
      storeUrl: z.string(),
      reason: z.string(),
      location: z.string(),
      hours: z.string(),
      physicalAddress: z.string(),
      wazeUrl: z.string(),
      products: z.array(z.string()),
      deliveryZones: z.array(z.string()),
    }),
  ),
  quickReplies: z.array(z.string()),
});

export type StoreConciergeInput = z.infer<typeof StoreConciergeInputSchema>;
export type StoreConciergeResponse = z.infer<typeof StoreConciergeResponseSchema>;

export type StoreConciergeBusiness = {
  id: string;
  name: string;
  slug: string;
  plan: SubscriptionPlan;
  category: BusinessCategory;
  description: string;
  province: string;
  city: string;
  businessStyle: string;
  offerSummary: string;
  searchTags: string[];
  storeUrl: string;
  hours: string;
  physicalAddress: string;
  wazeUrl: string;
  products: Array<{
    name: string;
    description: string;
    price: number;
    stock: number;
  }>;
  deliveryZones: Array<{
    name: string;
    fee: number;
    etaMinutes: number;
  }>;
};

export type StoreConciergeContext = {
  generatedAt: string;
  businesses: StoreConciergeBusiness[];
};

export function formatStoreHours(hours: unknown) {
  if (!hours) {
    return "Horario no publicado";
  }

  if (typeof hours === "string") {
    return hours.trim() || "Horario no publicado";
  }

  if (typeof hours === "object" && !Array.isArray(hours)) {
    const entries = Object.entries(hours as Record<string, unknown>);

    if (entries.length === 0) {
      return "Horario no publicado";
    }

    return entries
      .map(([day, value]) => `${day}: ${String(value)}`)
      .join(", ");
  }

  return String(hours);
}

export function getMockStoreConciergeContext(): StoreConciergeContext {
  return {
    generatedAt: new Date().toISOString(),
    businesses: businesses.map((business) => {
      const store = stores.find((item) => item.businessId === business.id);
      const businessProducts = products
        .filter((product) => product.businessId === business.id && product.active)
        .map((product) => ({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
        }));

      return {
        id: business.id,
        name: business.name,
        slug: business.slug,
        plan: business.plan,
        category: business.type,
        description: business.description,
        province: business.province,
        city: business.city,
        businessStyle: business.businessStyle,
        offerSummary: business.offerSummary,
        searchTags: business.searchTags,
        storeUrl: `/tienda/${business.slug}`,
        hours: store?.hours || "Horario no publicado",
        physicalAddress: store?.physicalAddress || `${business.city}, ${business.province}`,
        wazeUrl: generateWazeLink({
          lat: store?.lat,
          lng: store?.lng,
          address: store?.physicalAddress || `${business.city}, ${business.province}`,
        }),
        products: businessProducts,
        deliveryZones: deliveryZones
          .filter((zone) => zone.businessId === business.id)
          .map((zone) => ({
            name: zone.name,
            fee: zone.fee,
            etaMinutes: zone.etaMinutes,
          })),
      };
    }),
  };
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectFallbackLanguage(message: string) {
  const text = normalize(message);

  if (/\b(where|what|open|hours|near|food|clothes|pharmacy|delivery)\b/.test(text)) {
    return "en";
  }

  if (/\b(onde|loja|comida|roupa|farmacia|horario)\b/.test(text)) {
    return "pt";
  }

  if (/\b(ou|trouver|magasin|restaurant|pharmacie|horaire)\b/.test(text)) {
    return "fr";
  }

  if (/\b(dove|negozio|ristorante|farmacia|orario)\b/.test(text)) {
    return "it";
  }

  if (/\b(wo|laden|restaurant|apotheke|zeiten)\b/.test(text)) {
    return "de";
  }

  return "es";
}

function translateFallback(language: string, payload: Record<string, string>) {
  const messages: Record<string, Record<string, string>> = {
    en: {
      intro: `I found ${payload.count} RightHand business options for you.`,
      empty:
        "I could not find an exact match, but I can search by food, clothes, pharmacy, city or delivery area.",
      question: "What are you looking for next?",
    },
    pt: {
      intro: `Encontrei ${payload.count} opcoes de negocios RightHand para voce.`,
      empty:
        "Nao encontrei uma correspondencia exata, mas posso buscar por comida, roupa, farmacia, cidade ou zona de entrega.",
      question: "O que voce procura agora?",
    },
    fr: {
      intro: `J'ai trouve ${payload.count} options de commerces RightHand pour vous.`,
      empty:
        "Je n'ai pas trouve de resultat exact, mais je peux chercher par nourriture, vetements, pharmacie, ville ou zone de livraison.",
      question: "Que cherchez-vous maintenant ?",
    },
    it: {
      intro: `Ho trovato ${payload.count} opzioni di negozi RightHand per te.`,
      empty:
        "Non ho trovato una corrispondenza esatta, ma posso cercare cibo, vestiti, farmacia, citta o zona di consegna.",
      question: "Cosa stai cercando adesso?",
    },
    de: {
      intro: `Ich habe ${payload.count} RightHand-Geschaefte fuer dich gefunden.`,
      empty:
        "Ich habe keinen genauen Treffer gefunden, kann aber nach Essen, Kleidung, Apotheke, Stadt oder Lieferzone suchen.",
      question: "Wonach suchst du als Naechstes?",
    },
    es: {
      intro: `Encontre ${payload.count} opciones de negocios RightHand para ayudarte.`,
      empty:
        "No encontre una coincidencia exacta, pero puedo buscar por comida, ropa, farmacia, ciudad o zona de entrega.",
      question: "Que buscas ahora?",
    },
  };

  return messages[language] || messages.es;
}

export function heuristicStoreConcierge(
  input: StoreConciergeInput,
  context: StoreConciergeContext,
): StoreConciergeResponse {
  const language = detectFallbackLanguage(input.message);
  const query = normalize(input.message);
  const scored = context.businesses
    .map((business) => {
      const haystack = normalize(
        [
          business.name,
          business.category,
          business.description,
          business.province,
          business.city,
          business.businessStyle,
          business.offerSummary,
          business.physicalAddress,
          business.searchTags.join(" "),
          business.products.map((product) => product.name).join(" "),
          business.products.map((product) => product.description).join(" "),
          business.deliveryZones.map((zone) => zone.name).join(" "),
        ].join(" "),
      );

      const words = query.split(/\s+/).filter((word) => word.length > 2);
      const score =
        words.reduce((sum, word) => sum + (haystack.includes(word) ? 2 : 0), 0) +
        (haystack.includes(query) ? 3 : 0);

      return { business, score };
    })
    .sort((left, right) => right.score - left.score);

  const matches = scored.filter((item) => item.score > 0).slice(0, 3);
  const selected = matches.length ? matches : scored.slice(0, 3);
  const copy = translateFallback(language, { count: String(selected.length) });
  const locationConnector =
    {
      en: "in",
      pt: "em",
      fr: "a",
      it: "a",
      de: "in",
      es: "en",
    }[language] || "en";
  const recommendations = selected.map(({ business }) => ({
    businessName: business.name,
    storeSlug: business.slug,
    storeUrl: business.storeUrl,
    reason: `${business.businessStyle}: ${business.offerSummary}`,
    location: `${business.city}, ${business.province}`,
    hours: business.hours,
    physicalAddress: business.physicalAddress,
    wazeUrl: business.wazeUrl,
    products: business.products.slice(0, 4).map((product) => product.name),
    deliveryZones: business.deliveryZones.map(
      (zone) => `${zone.name} (${zone.etaMinutes} min, ${crcCurrency(zone.fee)})`,
    ),
  }));

  return {
    language,
    answer:
      matches.length > 0
        ? `${copy.intro} ${recommendations
            .map(
              (item) =>
                `${item.businessName} ${locationConnector} ${item.location}`,
            )
            .join("; ")}. ${copy.question}`
        : copy.empty,
    recommendations,
    quickReplies: [
      "Lunch near San Pedro",
      "Ropa casual en Escazu",
      "Farmacia abierta",
      "Delivery zones",
    ],
  };
}
