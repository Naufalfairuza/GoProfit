import Link from "next/link";

export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-[980px] px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Learn
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] md:text-4xl">
          Baca angka iklan dengan konteks profit
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--gp-text-secondary)] md:text-base">
          ROAS yang tinggi belum tentu berarti produkmu menghasilkan uang. Di
          bawah ini cara GOProfit membaca ekonomi per order.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <LearnCard
          number="01"
          title="ROAS"
          description="Revenue dari iklan dibagi biaya iklan. ROAS membantu membaca efisiensi iklan, tetapi belum memasukkan HPP, fee marketplace, dan biaya operasional."
          formula="ROAS = GMV dari Ads ÷ Ad Spend"
        />
        <LearnCard
          number="02"
          title="ROAS BEP"
          description="Batas ROAS ketika contribution sebelum iklan habis untuk membayar iklan. Di bawah angka ini, produk diperkirakan merugi."
          formula="ROAS BEP = Harga efektif ÷ Contribution sebelum iklan"
        />
        <LearnCard
          number="03"
          title="Minimum ROAS Aman"
          description="ROAS minimum untuk tetap menyisakan target profit yang kamu pilih per order."
          formula="Minimum ROAS = Harga efektif ÷ (Contribution − Target profit)"
        />
        <LearnCard
          number="04"
          title="Economic ROAS"
          description="Versi ROAS yang memakai seluruh biaya iklan, termasuk biaya campaign tambahan di luar media ad spend."
          formula="Economic ROAS = GMV dari Ads ÷ Total biaya iklan"
        />
      </div>

      <section className="mt-8 rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-[var(--gp-brand-soft)] p-5 md:p-6">
        <p className="text-sm font-bold">Catatan untuk Shopee</p>
        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Biaya admin, biaya proses, subsidi program, dan biaya lain bisa
          berbeda menurut kategori, program, dan kondisi toko. Masukkan angka
          dari rincian tokomu sendiri; GOProfit tidak menambahkan tarif preset
          yang belum diverifikasi.
        </p>
        <Link
          href="/plan"
          className="mt-4 inline-flex text-sm font-bold text-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-hover)]"
        >
          Mulai hitung ROAS →
        </Link>
      </section>
    </main>
  );
}

function LearnCard({
  number,
  title,
  description,
  formula,
}: {
  number: string;
  title: string;
  description: string;
  formula: string;
}) {
  return (
    <article className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <span className="text-xs font-bold text-[var(--gp-brand-primary)]">
        {number}
      </span>
      <h2 className="mt-3 text-lg font-bold tracking-[-0.03em]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
        {description}
      </p>
      <p className="mt-4 rounded-lg bg-[var(--gp-surface-soft)] p-3 text-xs font-semibold leading-5 text-[var(--gp-text-primary)]">
        {formula}
      </p>
    </article>
  );
}
