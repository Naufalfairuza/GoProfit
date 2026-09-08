import type { PlanAdsResult } from "@/domain/types";

interface PlanAdsResultPanelProps {
  result: PlanAdsResult;
}

export function PlanAdsResultPanel({
  result,
}: PlanAdsResultPanelProps) {
  return (
    <div className="space-y-5">
      {result.status === "NOT_ADS_FEASIBLE" ? (
        <NotAdsFeasibleResult result={result} />
      ) : result.status === "TARGET_NOT_FEASIBLE" ? (
        <TargetNotFeasibleResult result={result} />
      ) : result.status === "BREAK_EVEN_ONLY" ? (
        <BreakEvenResult result={result} />
      ) : (
        <TargetFeasibleResult result={result} />
      )}

      <ShopeeAdsDirection result={result} />
    </div>
  );
}

function TargetFeasibleResult({
  result,
}: {
  result: Extract<
    PlanAdsResult,
    { status: "TARGET_FEASIBLE" }
  >;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[var(--gp-radius-hero)] border border-[var(--gp-border)] bg-white p-5 shadow-[0_18px_60px_rgba(32,33,36,0.07)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
              Hasil hitung
            </p>

            <h2 className="mt-2 text-lg font-bold">
              Batas aman iklan produkmu
            </h2>
          </div>

          <span className="rounded-full bg-[var(--gp-success-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gp-success)]">
            TARGET TERCAPAI
          </span>
        </div>

        <div className="mt-5 rounded-2xl bg-[var(--gp-brand-soft)] p-5">
          <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
            Minimum ROAS Aman
          </p>

          <p className="mt-1 text-5xl font-bold tracking-[-0.06em]">
            {formatRoas(result.minimumTargetRoas)}
          </p>

          <p className="mt-3 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Agar tetap menyisakan target untung{" "}
            <strong>{formatMoney(result.targetProfit)}</strong> per pesanan.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard
            label="ROAS BEP"
            value={formatRoas(result.breakEvenRoas)}
          />

          <MetricCard
            label="Maks. biaya iklan / pesanan"
            value={formatMoney(result.maxAdsCostForTarget)}
          />
        </div>

        <PlanMetricGuide
          items={[
            {
              name: "ROAS BEP",
              description:
                "ROAS terendah agar iklan tidak membuat produk rugi. Di bawah angka ini, sisa uang dari penjualan tidak cukup untuk membayar iklan.",
              formula: "Harga efektif ÷ sisa sebelum iklan",
            },
            {
              name: "Minimum ROAS Aman",
              description:
                "ROAS terendah agar setelah semua biaya dan iklan dibayar, target untungmu masih tersisa.",
              formula: "Harga efektif ÷ (sisa sebelum iklan − target untung)",
            },
            {
              name: "BEP ACOS",
              description:
                "Batas persentase biaya iklan sebelum produk mulai rugi.",
              formula: "Sisa sebelum iklan ÷ harga efektif",
            },
            {
              name: "Maks. biaya iklan / pesanan",
              description:
                "Biaya iklan paling besar untuk satu pesanan agar target untung masih tercapai.",
              formula: "Sisa sebelum iklan − target untung",
            },
          ]}
        />

        <div className="mt-5 rounded-xl border border-[var(--gp-border)] p-4">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-[var(--gp-danger)]">
              RUGI
            </span>

            <span className="text-[var(--gp-warning)]">
              DI BAWAH TARGET
            </span>

            <span className="text-[var(--gp-success)]">
              TARGET TERCAPAI
            </span>
          </div>

          <div className="mt-2 grid grid-cols-[35fr_35fr_30fr] overflow-hidden rounded-full">
            <div className="h-2.5 bg-[var(--gp-danger-soft)]" />
            <div className="h-2.5 bg-[var(--gp-warning-soft)]" />
            <div className="h-2.5 bg-[var(--gp-success-soft)]" />
          </div>

          <div className="mt-3 flex justify-between text-xs text-[var(--gp-text-secondary)]">
            <span>
              BEP{" "}
              <strong className="text-[var(--gp-text-primary)]">
                {formatRoas(result.breakEvenRoas)}
              </strong>
            </span>

            <span>
              Target{" "}
              <strong className="text-[var(--gp-text-primary)]">
                {formatRoas(result.minimumTargetRoas)}
              </strong>
            </span>
          </div>
        </div>

        <p className="mt-4 text-[11px] leading-5 text-[var(--gp-text-muted)]">
          &quot;Aman&quot; berarti target untung masih tercapai berdasarkan
          angka yang kamu masukkan. Ini bukan jaminan campaign pasti
          menghasilkan hasil yang sama.
        </p>
      </section>

      <FinancialBreakdown result={result} />
    </div>
  );
}

function BreakEvenResult({
  result,
}: {
  result: Extract<
    PlanAdsResult,
    { status: "BREAK_EVEN_ONLY" }
  >;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[var(--gp-radius-hero)] border border-[var(--gp-border)] bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          Hasil hitung
        </p>

        <h2 className="mt-2 text-lg font-bold">
          Batas agar tidak rugi
        </h2>

        <div className="mt-5 rounded-2xl bg-[var(--gp-brand-soft)] p-5">
          <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
            ROAS BEP
          </p>

          <p className="mt-1 text-5xl font-bold tracking-[-0.06em]">
            {formatRoas(result.breakEvenRoas)}
          </p>

          <p className="mt-3 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Jika ROAS di bawah angka ini, biaya iklan bisa menghabiskan
            seluruh untung produk.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard
            label="BEP ACOS"
            value={formatBps(result.breakEvenAcosBps)}
          />

          <MetricCard
            label="Maks. biaya iklan / pesanan"
            value={formatMoney(result.maxAdsCostAtBreakEven)}
          />
        </div>

        <PlanMetricGuide
          items={[
            {
              name: "ROAS BEP",
              description:
                "ROAS terendah agar biaya iklan tertutup dan produk tidak rugi.",
              formula: "Harga efektif ÷ sisa sebelum iklan",
            },
            {
              name: "BEP ACOS",
              description:
                "Batas persentase GMV yang boleh dipakai untuk iklan sebelum produk mulai rugi.",
              formula: "Sisa sebelum iklan ÷ harga efektif",
            },
            {
              name: "Maks. biaya iklan / pesanan",
              description:
                "Biaya iklan paling besar per pesanan sebelum untung produk menjadi nol.",
              formula: "Sisa sebelum iklan",
            },
          ]}
        />

        <div className="mt-4 rounded-xl bg-[var(--gp-info-soft)] p-4">
          <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
            Kamu belum mengisi target untung. Jadi GOProfit hanya
            menampilkan batas agar tidak rugi, bukan Minimum ROAS Aman.
          </p>
        </div>
      </section>

      <FinancialBreakdown result={result} />
    </div>
  );
}

function TargetNotFeasibleResult({
  result,
}: {
  result: Extract<
    PlanAdsResult,
    { status: "TARGET_NOT_FEASIBLE" }
  >;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[var(--gp-radius-hero)] border border-[var(--gp-border)] bg-white p-5">
        <span className="rounded-full bg-[var(--gp-warning-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gp-warning)]">
          TARGET BELUM BISA DICAPAI
        </span>

        <h2 className="mt-4 text-xl font-bold">
          Target untung terlalu tinggi untuk angka saat ini
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Setelah modal dan biaya produk dihitung, sisa untungnya belum
          cukup untuk memenuhi target sekaligus membayar iklan.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard
            label="Untung sebelum iklan"
            value={formatMoney(
              result.breakdown.contributionBeforeAds,
            )}
          />

          <MetricCard
            label="Target untung"
            value={formatMoney(result.targetProfit)}
          />

          <MetricCard
            label="ROAS BEP"
            value={formatRoas(result.breakEvenRoas)}
          />

          <MetricCard
            label="BEP ACOS"
            value={formatBps(result.breakEvenAcosBps)}
          />
        </div>

        <PlanMetricGuide
          items={[
            {
              name: "Untung sebelum iklan",
              description:
                "Sisa uang dari penjualan sebelum biaya iklan dibayar. Target untung tidak boleh melebihi angka ini jika masih ingin beriklan.",
              formula: "Harga efektif − modal − biaya Shopee − biaya operasional",
            },
            {
              name: "ROAS BEP",
              description:
                "ROAS terendah agar biaya iklan tertutup tanpa untung atau rugi.",
              formula: "Harga efektif ÷ sisa sebelum iklan",
            },
            {
              name: "BEP ACOS",
              description:
                "Batas persentase biaya iklan terhadap GMV sebelum produk mulai rugi.",
              formula: "Sisa sebelum iklan ÷ harga efektif",
            },
          ]}
        />

        <div className="mt-5 rounded-xl bg-[var(--gp-warning-soft)] p-4">
          <p className="text-sm font-semibold">
            Yang bisa dicoba
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Turunkan target untung, naikkan harga, kurangi potongan,
            atau cek lagi modal dan biaya Shopee.
          </p>
        </div>
      </section>

      <FinancialBreakdown result={result} />
    </div>
  );
}

function NotAdsFeasibleResult({
  result,
}: {
  result: Extract<
    PlanAdsResult,
    { status: "NOT_ADS_FEASIBLE" }
  >;
}) {
  return (
    <div className="space-y-5">
      <section className="rounded-[var(--gp-radius-hero)] border border-[var(--gp-border)] bg-white p-5">
        <span className="rounded-full bg-[var(--gp-danger-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gp-danger)]">
          PRODUK BELUM SIAP UNTUK IKLAN
        </span>

        <h2 className="mt-4 text-xl font-bold">
          Produk belum menyisakan untung untuk iklan
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Setelah modal dan biaya dihitung, tidak ada sisa untung
          yang bisa digunakan untuk membayar iklan.
        </p>

        <div className="mt-5 rounded-2xl bg-[var(--gp-danger-soft)] p-5">
          <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
            Untung sebelum iklan
          </p>

          <p className="mt-1 text-3xl font-bold text-[var(--gp-danger)]">
            {formatMoney(
              result.breakdown.contributionBeforeAds,
            )}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-[var(--gp-border)] p-4">
          <p className="text-sm font-semibold">
            Cek lagi angka ini
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Harga jual, modal, diskon atau voucher, biaya Shopee,
            dan biaya operasional produk.
          </p>
        </div>
      </section>

      <FinancialBreakdown result={result} />
    </div>
  );
}

function FinancialBreakdown({
  result,
}: {
  result: PlanAdsResult;
}) {
  const breakdown = result.breakdown;

  return (
    <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <h3 className="text-base font-bold">
        Rincian hitungan
      </h3>

      <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
        Dari harga jual sampai sisa untung sebelum iklan.
      </p>

      <div className="mt-5 space-y-3">
        <BreakdownRow
          label="Harga normal"
          value={formatMoney(breakdown.pricing.listRevenue)}
        />

        {breakdown.pricing.productDiscount > 0 && (
          <BreakdownRow
            label="Diskon produk"
            value={`-${formatMoney(
              breakdown.pricing.productDiscount,
            )}`}
            muted
          />
        )}

        {breakdown.pricing.otherSellerAdjustments > 0 && (
          <BreakdownRow
            label="Voucher / potongan seller"
            value={`-${formatMoney(
              breakdown.pricing.otherSellerAdjustments,
            )}`}
            muted
          />
        )}

        <BreakdownRow
          label="Harga efektif"
          value={formatMoney(
            breakdown.pricing.effectiveRevenue,
          )}
          strong
        />

        <div className="border-t border-[var(--gp-border)] pt-3">
          <BreakdownRow
            label="Modal / HPP"
            value={`-${formatMoney(breakdown.hpp)}`}
            muted
          />
        </div>

        {breakdown.fees.items.map((fee) => (
          <BreakdownRow
            key={fee.feeId}
            label={fee.name}
            value={`-${formatMoney(fee.amount)}`}
            muted
          />
        ))}

        {breakdown.costs.items.map((cost) => (
          <BreakdownRow
            key={cost.costId}
            label={cost.name}
            value={`-${formatMoney(cost.amount)}`}
            muted
          />
        ))}

        <div className="border-t border-[var(--gp-border)] pt-4">
          <BreakdownRow
            label="Untung sebelum iklan"
            value={formatMoney(
              breakdown.contributionBeforeAds,
            )}
            strong
          />
        </div>
      </div>
    </section>
  );
}

function BreakdownRow({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-bold"
            : muted
              ? "text-sm text-[var(--gp-text-secondary)]"
              : "text-sm"
        }
      >
        {label}
      </span>

      <span
        className={[
          "shrink-0 text-right text-sm",
          strong ? "font-bold" : "font-medium",
          muted
            ? "text-[var(--gp-text-secondary)]"
            : "text-[var(--gp-text-primary)]",
        ].join(" ")}
      >
        {value}
      </span>
    </div>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-white p-3.5">
      <p className="text-[11px] font-medium text-[var(--gp-text-secondary)]">
        {label}
      </p>

      <p className="mt-1 text-base font-bold tracking-[-0.03em]">
        {value}
      </p>
    </div>
  );
}

function PlanMetricGuide({
  items,
}: {
  items: Array<{
    name: string;
    description: string;
    formula: string;
  }>;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--gp-brand-soft)] text-xs font-bold text-[var(--gp-brand-primary)]"
        >
          i
        </span>
        <div>
          <p className="text-sm font-bold text-[var(--gp-text-primary)]">
            Arti angka-angka ini
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Gunakan angka ini untuk menentukan apakah iklan masih masuk akal,
            bukan hanya untuk melihat skor dari marketplace.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article
            key={item.name}
            className="rounded-xl border border-[var(--gp-border)] bg-white p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(32,33,36,0.06)]"
          >
            <p className="text-xs font-bold text-[var(--gp-text-primary)]">
              {item.name}
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
              {item.description}
            </p>
            <p className="mt-2 text-[10px] font-semibold text-[var(--gp-brand-primary)]">
              Rumus: {item.formula}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ShopeeAdsDirection({
  result,
}: {
  result: PlanAdsResult;
}) {
  const hasBreakEven = "breakEvenRoas" in result;
  const hasTarget = "minimumTargetRoas" in result;
  const referenceLabel = hasTarget
    ? "Minimum ROAS Aman"
    : "ROAS BEP";
  const referenceValue = hasTarget
    ? formatRoas(result.minimumTargetRoas)
    : hasBreakEven
      ? formatRoas(result.breakEvenRoas)
      : "Belum tersedia";
  const canAdvertise = result.status !== "NOT_ADS_FEASIBLE";

  return (
    <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        Cara memakai hasil ini
      </p>

      <h3 className="mt-1 text-lg font-bold tracking-[-0.03em]">
        Angka ini dimasukkan ke mana di Shopee?
      </h3>

      <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
        GOProfit menghitung batas biaya iklan berdasarkan angka produkmu.
        Angka ini bukan target otomatis dari Shopee. Jika ingin target untung
        tetap tercapai, jangan pasang target ROAS di bawah angka ini.
      </p>

      <div className="mt-5 rounded-2xl bg-[var(--gp-brand-soft)] p-4">
        <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
          Patokan dari GOProfit
        </p>
        <p className="mt-1 text-2xl font-bold tracking-[-0.04em]">
          {referenceValue}
        </p>
        <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
          {canAdvertise
            ? `${referenceLabel} adalah ROAS terendah agar target untungmu masih tercapai.`
            : "Perbaiki angka produk terlebih dahulu karena belum ada sisa untung untuk iklan."}
        </p>
      </div>

      {hasTarget && (
        <div className="mt-3 rounded-xl border border-[var(--gp-warning)]/30 bg-[var(--gp-warning-soft)] p-4">
          <p className="text-xs font-bold text-[var(--gp-text-primary)]">
            Cara membaca angka {referenceValue}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Pasang target ROAS minimal {referenceValue} atau lebih agar target
            untungmu masih didukung oleh hitungan ini. Di bawah angka itu,
            campaign mungkin masih untung, tetapi untungnya bisa lebih kecil
            dari target. Jika turun di bawah ROAS BEP, campaign berpotensi rugi.
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ShopeeAdsModeCard
          title="GMV Max ROAS"
          label="Jika ingin mengatur target ROAS"
          description={
            canAdvertise
              ? `Jika target untung harus dijaga, jangan memasukkan target di bawah ${referenceValue}. Bandingkan juga dengan rekomendasi Shopee dan ROAS sebelumnya karena target terlalu tinggi bisa mengurangi jangkauan iklan.`
              : "Jangan menaikkan target atau menambah budget sebelum produk memiliki sisa untung yang cukup."
          }
        />

        <ShopeeAdsModeCard
          title="GMV Max Auto"
          label="Jika ingin Shopee mengatur otomatis"
          description="Shopee akan mengatur strategi dan memberi perkiraan ROAS. GOProfit tidak menentukan target untuk mode ini. Setelah campaign berjalan, gunakan Check My Ads untuk melihat apakah iklannya benar-benar menghasilkan untung."
        />
      </div>

      <p className="mt-4 text-[11px] leading-5 text-[var(--gp-text-muted)]">
        Shopee menjelaskan bahwa target ROAS yang terlalu tinggi dapat membuat
        penayangan dan pengeluaran lebih selektif. Baca aturan dan rekomendasi
        terbaru di{" "}
        <a
          href="https://iklan.shopee.co.id/learn/faq/555/2031"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--gp-brand-primary)] underline underline-offset-2"
        >
          pusat edukasi Shopee Ads
        </a>
        .
      </p>
    </section>
  );
}

function ShopeeAdsModeCard({
  title,
  label,
  description,
}: {
  title: string;
  label: string;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold">{title}</h4>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-[var(--gp-text-secondary)]">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--gp-text-secondary)]">
        {description}
      </p>
    </article>
  );
}

function formatMoney(value: number): string {
  if (value < 0) {
    return `-Rp${Math.abs(value).toLocaleString("id-ID")}`;
  }

  return `Rp${value.toLocaleString("id-ID")}`;
}

function formatRoas(value: number): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatBps(valueBps: number): string {
  return `${(valueBps / 100).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
