import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid max-w-[1180px] gap-12 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:items-center md:px-6 md:py-24">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-[var(--gp-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--gp-text-secondary)]">
            Hitung Untung & Iklan untuk Seller
          </div>

          <h1 className="max-w-[680px] text-4xl font-bold leading-[1.1] tracking-[-0.045em] text-[var(--gp-text-primary)] md:text-6xl">
            Tahu batas aman iklan sebelum{" "}
            <span className="text-[var(--gp-brand-primary)]">
              uangmu keluar.
            </span>
          </h1>

          <p className="mt-6 max-w-[610px] text-base leading-7 text-[var(--gp-text-secondary)] md:text-lg">
            Hitung untung produk, biaya Shopee, batas agar tidak rugi, dan target
            ROAS berdasarkan angka bisnismu sendiri.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/plan"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--gp-radius-button)] bg-[var(--gp-brand-primary)] px-6 font-semibold text-white transition hover:bg-[var(--gp-brand-hover)]"
            >
              Rencanakan Iklan
            </Link>

            <Link
              href="/check"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--gp-radius-button)] border border-[var(--gp-border)] bg-white px-6 font-semibold text-[var(--gp-text-primary)] transition hover:bg-[var(--gp-surface-soft)]"
            >
              Cek Iklan Saya
            </Link>
          </div>

          <p className="mt-5 text-sm text-[var(--gp-text-muted)]">
            Beta gratis • Tanpa login • Perhitungan dilakukan di perangkatmu
          </p>
        </div>

        <div className="relative">
          <div className="rounded-[var(--gp-radius-hero)] border border-[var(--gp-border)] bg-white p-5 shadow-[0_18px_60px_rgba(32,33,36,0.08)] md:p-7">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--gp-text-secondary)]">
                  Contoh hasil
                </p>
                <h2 className="mt-1 text-lg font-bold">
                  Batas Iklan Produkmu
                </h2>
              </div>

              <span className="rounded-full bg-[var(--gp-success-soft)] px-3 py-1 text-xs font-bold text-[var(--gp-success)]">
                TARGET TERCAPAI
              </span>
            </div>

            <div className="rounded-2xl bg-[var(--gp-brand-soft)] p-6">
              <p className="text-sm font-semibold text-[var(--gp-text-secondary)]">
                Minimum ROAS Aman
              </p>

              <div className="mt-2 text-5xl font-bold tracking-[-0.05em]">
                5,04
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--gp-text-secondary)]">
                Untuk menyisakan target untung Rp25.000 per pesanan.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="ROAS BEP" value="2,74" />
              <Metric label="Maks. biaya iklan / pesanan" value="Rp29.750" />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-xs font-semibold">
                <span className="text-[var(--gp-danger)]">RUGI</span>
                <span className="text-[var(--gp-warning)]">
                  DI BAWAH TARGET
                </span>
                <span className="text-[var(--gp-success)]">TARGET TERCAPAI</span>
              </div>

              <div className="grid grid-cols-[35fr_35fr_30fr] overflow-hidden rounded-full">
                <div className="h-2 bg-[var(--gp-danger-soft)]" />
                <div className="h-2 bg-[var(--gp-warning-soft)]" />
                <div className="h-2 bg-[var(--gp-success-soft)]" />
              </div>
            </div>

            <p className="mt-5 text-xs leading-5 text-[var(--gp-text-muted)]">
              Angka di atas hanya contoh tampilan dan bukan hasil perhitunganmu.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--gp-border)] bg-white">
        <div className="mx-auto grid max-w-[1180px] gap-4 px-4 py-10 md:grid-cols-3 md:px-6">
          <Feature
            number="01"
            title="Hitung sebelum beriklan"
            description="Cari tahu batas agar tidak rugi dan biaya iklan yang masih aman."
          />

          <Feature
            number="02"
            title="Cek setelah iklan berjalan"
            description="Lihat apakah iklan masih menghasilkan untung setelah semua biaya."
          />

          <Feature
            number="03"
            title="Bandingkan skenario"
            description="Uji perubahan harga, biaya, atau target tanpa merusak perhitungan utamamu."
          />
        </div>
      </section>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gp-border)] p-4">
      <p className="text-xs font-medium text-[var(--gp-text-secondary)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tracking-[-0.03em]">{value}</p>
    </div>
  );
}

function Feature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-5">
      <span className="text-xs font-bold text-[var(--gp-brand-primary)]">
        {number}
      </span>

      <h2 className="mt-4 text-lg font-bold tracking-[-0.025em]">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
        {description}
      </p>
    </article>
  );
}
