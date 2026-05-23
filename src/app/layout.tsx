import type { Metadata } from "next";
import localFont from "next/font/local";

import { StoreConciergeChat } from "@/components/ai/store-concierge-chat";
import { SiteTranslator } from "@/components/i18n/site-translator";
import {
  createSeoMetadata,
  faviconPath,
  seoDescription,
  seoKeywords,
  siteName,
  siteSlogan,
  siteUrl,
} from "@/lib/seo";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  ...createSeoMetadata({
    title: `${siteName} | ${siteSlogan}`,
    description: seoDescription,
    path: "/",
    keywords: seoKeywords,
  }),
  applicationName: siteName,
  authors: [{ name: "RightHand" }],
  creator: "RightHand",
  publisher: "RightHand",
  category: "Business Software",
  icons: {
    icon: [{ url: faviconPath, type: "image/png" }],
    shortcut: [{ url: faviconPath, type: "image/png" }],
    apple: [{ url: faviconPath, type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SiteTranslator />
        <StoreConciergeChat />
      </body>
    </html>
  );
}
