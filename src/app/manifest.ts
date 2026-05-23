import type { MetadataRoute } from "next";

import { faviconPath, siteName, siteSlogan } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteName} - ${siteSlogan}`,
    short_name: siteName,
    description:
      "SaaS para PYMES de Costa Rica con tienda en linea, CRM, pedidos, entregas y marketing con IA.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#103A5C",
    icons: [
      {
        src: faviconPath,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
