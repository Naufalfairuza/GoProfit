import { CheckAdsForm } from "@/features/check-ads/components/CheckAdsForm";

export default function CheckAdsPage() {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-8 md:px-6 md:py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Check My Ads
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] md:text-4xl">
          Iklanmu benar-benar profit?
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--gp-text-secondary)] md:text-base">
          Masukkan ekonomi produk
          dan hasil campaign.
          GOProfit membantu melihat
          profit setelah biaya
          iklan, bukan hanya ROAS
          yang terlihat bagus.
        </p>
      </div>

      <CheckAdsForm />
    </main>
  );
}