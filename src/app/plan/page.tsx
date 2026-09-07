import { PlanAdsForm } from "@/features/plan-ads/components/PlanAdsForm";

export default function PlanPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-4 py-10 md:px-6 md:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Plan My Ads
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] md:text-4xl">
          Rencanakan Iklan
        </h1>

        <p className="mt-3 text-sm leading-6 text-[var(--gp-text-secondary)] md:text-base">
          Masukkan angka produkmu untuk mengetahui batas ekonomi iklan sebelum
          campaign dijalankan.
        </p>
      </div>

      <PlanAdsForm />
    </main>
  );
}