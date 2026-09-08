import Link from "next/link";

export default function LearnPage() {
  return (
    <main className="mx-auto w-full max-w-[980px] px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Learn
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] md:text-4xl">
          Pahami hasil iklan dengan bahasa sederhana
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--gp-text-secondary)] md:text-base">
          ROAS yang tinggi belum tentu berarti produkmu untung. Di bawah ini
          penjelasan angka-angka penting sebelum kamu menambah budget iklan.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <LearnCard
          number="01"
          title="ROAS"
          description="Penjualan dari iklan dibagi biaya iklan. ROAS menunjukkan hasil iklan, tetapi belum menghitung modal dan biaya lain."
          formula="ROAS = Penjualan dari iklan ÷ Biaya iklan"
        />
        <LearnCard
          number="02"
          title="ROAS BEP"
          description="Batas ROAS saat sisa uang dari penjualan habis untuk membayar iklan. Di bawah angka ini, produk berpotensi rugi."
          formula="ROAS BEP = Harga efektif ÷ Sisa sebelum iklan"
        />
        <LearnCard
          number="03"
          title="Minimum ROAS Aman"
          description="ROAS terendah agar setelah semua biaya dan iklan dibayar, target untung per pesanan masih tersisa."
          formula="Minimum ROAS = Harga efektif ÷ (Sisa sebelum iklan − Target untung)"
        />
        <LearnCard
          number="04"
          title="ROAS setelah semua biaya"
          description="ROAS yang menghitung semua biaya iklan, termasuk biaya iklan tambahan."
          formula="ROAS setelah semua biaya = Penjualan dari iklan ÷ Total biaya iklan"
        />
        <LearnCard
          number="05"
          title="ACOS dari Shopee"
          description="Persentase biaya iklan utama dibanding penjualan dari iklan. Ini biasanya angka yang terlihat di dashboard Shopee."
          formula="ACOS dari Shopee = Biaya iklan utama ÷ Penjualan dari iklan"
        />
        <LearnCard
          number="06"
          title="ACOS setelah semua biaya"
          description="Persentase seluruh biaya iklan dibanding penjualan dari iklan. Angka ini juga memasukkan biaya iklan tambahan."
          formula="ACOS setelah semua biaya = Total biaya iklan ÷ Penjualan dari iklan"
        />
        <LearnCard
          number="07"
          title="CPC"
          description="Rata-rata biaya untuk mendapatkan satu klik. CPC tidak tersedia jika jumlah klik kosong atau 0."
          formula="CPC = Total biaya iklan ÷ Klik"
        />
        <LearnCard
          number="08"
          title="CPA"
          description="Rata-rata biaya iklan untuk mendapatkan satu pesanan. Bandingkan dengan untung per pesanan."
          formula="CPA = Total biaya iklan ÷ Order"
        />
      </div>

      <section className="mt-8 rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          GMV Max
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-[-0.03em]">
          Pilih arah iklan berdasarkan tujuanmu
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          GOProfit membantu menghitung batas biaya iklan. Pengaturan iklannya
          tetap dilakukan di Shopee Ads.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <LearnCard
            number="A"
            title="GMV Max ROAS"
            description="Pilih jika ingin memasukkan target ROAS. Bandingkan angka dari GOProfit dengan rekomendasi Shopee dan hasil iklan sebelumnya."
            formula="Tujuan: menjaga efisiensi sesuai target"
          />
          <LearnCard
            number="B"
            title="GMV Max Auto"
            description="Pilih jika ingin Shopee mengatur strategi secara otomatis. Setelah berjalan, cek ROAS setelah semua biaya dan untung setelah iklan."
            formula="Tujuan: eksplorasi dan optimasi otomatis"
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--gp-text-muted)]">
          Target ROAS terlalu tinggi dapat membatasi jangkauan dan pengeluaran
          campaign. Selalu periksa rekomendasi terbaru di Shopee Ads.
        </p>
      </section>

      <section className="mt-8 rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-[var(--gp-brand-soft)] p-5 md:p-6">
        <p className="text-sm font-bold">Catatan untuk Shopee</p>
        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Biaya admin, biaya proses, subsidi program, dan biaya lain bisa
          berbeda menurut kategori, program, dan kondisi toko. GOProfit
          menyediakan referensi awal untuk Promo XTRA dan Promo XTRA+, serta
          input manual untuk Gratis Ongkir XTRA dan Shopee Live XTRA. Masukkan
          angka dari rincian tokomu sendiri dan jangan aktifkan program yang
          tidak diikuti.
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
    <article className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(32,33,36,0.07)]">
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
