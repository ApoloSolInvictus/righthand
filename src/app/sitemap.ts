import type { MetadataRoute } from "next";

import { businesses, stores } from "@/lib/mock-data";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const storeUrls = stores.map((store) => ({
    url: absoluteUrl(`/tienda/${store.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const businessDirectorySignal = businesses.length ? 0.95 : 0.9;

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: businessDirectorySignal,
    },
    ...storeUrls,
  ];
}
