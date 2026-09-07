import type { Metadata } from "next";

import { AppHeader } from "@/components/layout/AppHeader";

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
        <div className="min-h-screen bg-[var(--gp-background)]">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
