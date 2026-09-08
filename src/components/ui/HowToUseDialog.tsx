"use client";

import { useEffect, useState } from "react";

type HowToUseVariant = "plan" | "check";

interface HowToUseDialogProps {
  variant: HowToUseVariant;
}

const guideContent: Record<
  HowToUseVariant,
  {
    title: string;
    intro: string;
    steps: string[];
    note: string;
  }
> = {
  plan: {
    title: "Cara pakai Plan My Ads",
    intro:
      "Gunakan halaman ini sebelum menjalankan campaign agar kamu tahu batas biaya iklan yang masih aman.",
    steps: [
      "Masukkan modal atau HPP untuk satu barang.",
      "Masukkan harga jual sebelum diskon atau voucher.",
      "Tambahkan diskon dan voucher jika memang mengurangi uang yang diterima toko.",
      "Isi biaya admin, biaya proses, biaya packing, dan program Shopee sesuai rincian tokomu.",
      "Masukkan target untung per pesanan, atau pilih Saya belum tahu jika belum punya target.",
      "Klik Hitung ROAS Saya.",
      "Baca ROAS BEP, Minimum ROAS Aman, dan maksimum biaya iklan per pesanan.",
      "Jika memakai GMV Max ROAS, masukkan angka yang sesuai ke pengaturan iklan Shopee.",
    ],
    note:
      "Semua angka diisi manual. GOProfit tidak terhubung langsung ke akun Shopee dan tidak meminta password atau token.",
  },
  check: {
    title: "Cara pakai Check My Ads",
    intro:
      "Gunakan halaman ini setelah campaign berjalan untuk melihat apakah iklan benar-benar menghasilkan untung.",
    steps: [
      "Buka laporan campaign di Shopee dan siapkan data dari periode yang sama.",
      "Masukkan modal, harga jual, diskon, voucher, dan biaya Shopee untuk produk yang dianalisis.",
      "Masukkan biaya iklan, penjualan dari iklan, jumlah pesanan, dan jumlah barang terjual.",
      "Isi jumlah klik jika ingin melihat biaya per klik. Biaya iklan tambahan boleh dikosongkan jika tidak ada.",
      "Masukkan target untung jika ingin mengecek apakah hasil campaign sudah sesuai target.",
      "Klik Analisis Iklan Saya.",
      "Baca perkiraan untung setelah iklan dan bagian Apa artinya untuk iklanmu?.",
      "Bandingkan lagi dengan data Shopee menggunakan Validasi jika ingin mengecek selisihnya.",
    ],
    note:
      "Gunakan data dari produk dan periode yang sama. Jangan masukkan password, token, atau data login ke GOProfit.",
  },
};

export function HowToUseDialog({
  variant,
}: HowToUseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = guideContent[variant];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="inline-flex min-h-10 items-center justify-center rounded-[var(--gp-radius-button)] border border-[var(--gp-brand-primary)] bg-white px-4 text-sm font-bold text-[var(--gp-brand-primary)] transition hover:bg-[var(--gp-brand-soft)]"
      >
        Cara pakai
      </button>

      {isOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(32,33,36,0.52)] p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`how-to-use-title-${variant}`}
            className="max-h-[min(760px,calc(100vh-2rem))] w-full max-w-2xl overflow-y-auto rounded-[var(--gp-radius-hero)] border border-[var(--gp-border)] bg-white p-5 shadow-[0_24px_80px_rgba(32,33,36,0.22)] md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
                  Panduan singkat
                </p>
                <h2
                  id={`how-to-use-title-${variant}`}
                  className="mt-2 text-2xl font-bold tracking-[-0.04em]"
                >
                  {content.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
                  {content.intro}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup panduan"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gp-border)] text-xl leading-none text-[var(--gp-text-secondary)] transition hover:bg-[var(--gp-surface-soft)]"
              >
                ×
              </button>
            </div>

            <ol className="mt-6 space-y-3">
              {content.steps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--gp-brand-primary)] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-5 text-[var(--gp-text-primary)]">
                    {step}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-xl border border-[var(--gp-info)] bg-[var(--gp-info-soft)] p-4">
              <p className="text-xs font-bold text-[var(--gp-info)]">
                Catatan penting
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
                {content.note}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-5 min-h-11 w-full rounded-[var(--gp-radius-button)] bg-[var(--gp-brand-primary)] px-5 text-sm font-bold text-white transition hover:bg-[var(--gp-brand-hover)]"
            >
              Siap, saya mengerti
            </button>
          </section>
        </div>
      )}
    </>
  );
}
