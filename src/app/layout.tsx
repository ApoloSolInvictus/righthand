import type { Metadata } from "next";
import localFont from "next/font/local";

import { StoreConciergeChat } from "@/components/ai/store-concierge-chat";

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
  title: "RightHand | La mano derecha de tu tienda",
  description:
    "SaaS multi-tenant para vender mejor, entregar mas rapido y organizar clientes en PYMES de Costa Rica.",
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
        <StoreConciergeChat />
      </body>
    </html>
  );
}
