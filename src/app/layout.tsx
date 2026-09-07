import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import { AppHeader } from "@/components/layout/AppHeader";
import { LegalFooter } from "@/components/layout/LegalFooter";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "GOProfit",
    template: "%s | GOProfit",
  },
  description:
    "Hitung profit, fee, dan batas ROAS berdasarkan ekonomi produkmu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <div className="gp-shell min-h-screen">
          <AppHeader />
          {children}
          <LegalFooter />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
