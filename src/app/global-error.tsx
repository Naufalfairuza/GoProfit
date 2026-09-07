"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="id">
      <body className="bg-[#f7f7f5] text-[#202124]">
        <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
          <section className="w-full rounded-2xl border border-[#e5e5e2] bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#f45a35]">
              GOProfit
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              Ada kendala saat membuka halaman
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#6f7075]">
              Coba muat ulang halaman. Jika masalah terus muncul, simpan waktu
              kejadian dan URL halaman untuk membantu proses perbaikan.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-5 min-h-11 rounded-xl bg-[#f45a35] px-4 text-sm font-bold text-white"
            >
              Coba lagi
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
