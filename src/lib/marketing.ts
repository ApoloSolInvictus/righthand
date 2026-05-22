import { z } from "zod";

import type { MarketingFormatId } from "@/lib/types";

export type MarketingFormat = {
  id: MarketingFormatId;
  label: string;
  description: string;
  width: number;
  height: number;
  imageSize: "1024x1024" | "1024x1536" | "1536x1024";
  aspectClass: string;
};

export const marketingFormats: MarketingFormat[] = [
  {
    id: "instagram_post",
    label: "Instagram Post",
    description: "Feed cuadrado para promociones y ofertas.",
    width: 1080,
    height: 1080,
    imageSize: "1024x1024",
    aspectClass: "aspect-square",
  },
  {
    id: "instagram_story",
    label: "Story / Reel",
    description: "Vertical para historias, reels y anuncios moviles.",
    width: 1080,
    height: 1920,
    imageSize: "1024x1536",
    aspectClass: "aspect-[9/16]",
  },
  {
    id: "facebook_ad",
    label: "Facebook Ad",
    description: "Horizontal para pauta y publicaciones compartibles.",
    width: 1200,
    height: 628,
    imageSize: "1536x1024",
    aspectClass: "aspect-[1200/628]",
  },
  {
    id: "whatsapp_status",
    label: "WhatsApp Status",
    description: "Vertical para estados y difusion transaccional.",
    width: 1080,
    height: 1920,
    imageSize: "1024x1536",
    aspectClass: "aspect-[9/16]",
  },
  {
    id: "flyer",
    label: "Flyer oferta",
    description: "Pieza vertical para tienda, mostrador y redes.",
    width: 1080,
    height: 1350,
    imageSize: "1024x1536",
    aspectClass: "aspect-[4/5]",
  },
];

export function getMarketingFormat(formatId: string | undefined) {
  return (
    marketingFormats.find((format) => format.id === formatId) || marketingFormats[0]
  );
}

export const MarketingImageInputSchema = z.object({
  businessName: z.string().trim().min(1).max(120),
  businessStyle: z.string().trim().max(160).optional().default("Negocio local"),
  title: z.string().trim().min(1).max(120),
  campaignGoal: z.string().trim().min(1).max(120),
  audience: z.string().trim().min(1).max(160),
  offerText: z.string().trim().min(1).max(400),
  instructions: z.string().trim().max(700).optional().default(""),
  formatId: z.enum([
    "instagram_post",
    "instagram_story",
    "facebook_ad",
    "whatsapp_status",
    "flyer",
  ]),
  referenceImages: z.array(z.string().startsWith("data:image/")).max(4).default([]),
});

export type MarketingImageInput = z.infer<typeof MarketingImageInputSchema>;

export type MarketingImageResult = {
  prompt: string;
  imageUrl: string;
  format: MarketingFormat;
  captions: string[];
  hashtags: string[];
};
