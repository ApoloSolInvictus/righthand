import type { Metadata } from "next";

export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://righthand.infiniti-ia.com"
).replace(/\/$/, "");

export const siteName = "RightHand";
export const siteSlogan = "La mano derecha de tu tienda.";
export const seoImagePath = "/images/seorh.jpg";
export const faviconPath = "/images/favicon.png";

export const seoDescription =
  "RightHand es una web app SaaS para PYMES de Costa Rica: tienda en linea, CRM, pedidos, inventario, entregas con Waze, ofertas, marketing con IA y AI Delivery Manager.";

export const seoKeywords = [
  "RightHand",
  "Right Hand Costa Rica",
  "RightHand Costa Rica",
  "RightHand SaaS",
  "RightHand PYMES",
  "software para PYMES Costa Rica",
  "tienda en linea Costa Rica",
  "sistema de pedidos para restaurantes",
  "CRM para PYMES Costa Rica",
  "delivery con Waze",
  "AI Delivery Manager",
  "inventario basico",
  "mensajeros independientes",
  "marketing digital con IA",
  "ventas por WhatsApp",
  "sodas restaurantes tiendas farmacias",
];

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) {
    return path;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const defaultOpenGraphImage = {
  url: seoImagePath,
  width: 1200,
  height: 630,
  alt: "RightHand - La mano derecha de tu tienda",
};

export function createSeoMetadata({
  title,
  description = seoDescription,
  path = "/",
  image = defaultOpenGraphImage,
  keywords = seoKeywords,
  noIndex = false,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: typeof defaultOpenGraphImage;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName,
      locale: "es_CR",
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
