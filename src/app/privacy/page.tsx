import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Disclaimer",
  description: "Kebijakan privasi dan disclaimer penggunaan GOProfit.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-[860px] px-4 py-10 md:px-6 md:py-14">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        Privacy & disclaimer
      </p>

      <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] md:text-4xl">
        Cara GOProfit menggunakan data
      </h1>

      <p className="mt-4 text-sm leading-6 text-[var(--gp-text-secondary)]">
        Halaman ini menjelaskan data yang diproses GOProfit pada fase beta.
        Kami menjaga agar kalkulator tetap transparan dan tidak meminta akses
        ke akun Seller Centre.
      </p>

      <div className="mt-8 space-y-5">
        <PolicySection title="Data yang kamu masukkan">
          <p>
            Angka produk, biaya, program, dan campaign diproses untuk
            menghitung estimasi ROAS serta profit. Pada versi beta ini, data
            perhitungan disimpan di browser perangkatmu melalui localStorage
            atau sessionStorage agar hasil dapat dipulihkan.
          </p>
        </PolicySection>

        <PolicySection title="Yang belum kami lakukan">
          <p>
            GOProfit belum menghubungkan data ke akun Shopee, belum menjual
            data pengguna, dan belum menyediakan sinkronisasi antarperangkat.
            Jika browser storage dihapus atau perangkat diganti, data lokal
            dapat hilang.
          </p>
        </PolicySection>

        <PolicySection title="Disclaimer kalkulator">
          <p>
            Hasil GOProfit adalah estimasi berdasarkan input pengguna dan
            asumsi biaya yang dipilih. Tarif marketplace, program, atribusi,
            pembatalan, retur, refund, dan biaya lain dapat berubah atau
            memiliki syarat khusus. Selalu cocokkan hasil dengan rincian
            aktual di Seller Centre sebelum mengambil keputusan bisnis.
          </p>
        </PolicySection>

        <PolicySection title="Perubahan kebijakan">
          <p>
            Saat login, database, analytics, atau error monitoring ditambahkan,
            halaman ini akan diperbarui untuk menjelaskan data dan layanan
            pihak ketiga yang digunakan.
          </p>
        </PolicySection>
      </div>
    </main>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--gp-border)] bg-white p-5 md:p-6">
      <h2 className="text-base font-bold">{title}</h2>
      <div className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
        {children}
      </div>
    </section>
  );
}
