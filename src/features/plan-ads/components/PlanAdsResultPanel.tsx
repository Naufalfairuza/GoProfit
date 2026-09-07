import type { PlanAdsResult } from "@/domain/types";

interface PlanAdsResultPanelProps {
  result: PlanAdsResult;
}

export function PlanAdsResultPanel({
  result,
}: PlanAdsResultPanelProps) {
  if (result.status === "NOT_ADS_FEASIBLE") {
    return <NotAdsFeasibleResult result={result} />;
  }

  if (result.status === "TARGET_NOT_FEASIBLE") {
    return <TargetNotFeasibleResult result={result} />;
  }

  if (result.status === "BREAK_EVEN_ONLY") {
    return <BreakEvenResult result={result} />;
  }

  return <TargetFeasibleResult result={result} />;
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
              Hasil Perhitungan
            </p>

            <h2 className="mt-2 text-lg font-bold">
              Batas ekonomi iklanmu
            </h2>
          </div>

          <span className="rounded-full bg-[var(--gp-success-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gp-success)]">
            TARGET FEASIBLE
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
            Untuk mempertahankan target profit{" "}
            <strong>{formatMoney(result.targetProfit)}</strong> per order.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard
            label="ROAS BEP"
            value={formatRoas(result.breakEvenRoas)}
          />

          <MetricCard
            label="Max Ads / Order"
            value={formatMoney(result.maxAdsCostForTarget)}
          />
        </div>

        <div className="mt-5 rounded-xl border border-[var(--gp-border)] p-4">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-[var(--gp-danger)]">
              LOSS
            </span>

            <span className="text-[var(--gp-warning)]">
              BELOW TARGET
            </span>

            <span className="text-[var(--gp-success)]">
              TARGET
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
          &quot;Aman&quot; berarti memenuhi target profit berdasarkan
          data yang kamu masukkan. Angka ini bukan jaminan performa
          campaign marketplace.
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
          Hasil Perhitungan
        </p>

        <h2 className="mt-2 text-lg font-bold">
          ROAS Impas Kamu
        </h2>

        <div className="mt-5 rounded-2xl bg-[var(--gp-brand-soft)] p-5">
          <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
            ROAS BEP
          </p>

          <p className="mt-1 text-5xl font-bold tracking-[-0.06em]">
            {formatRoas(result.breakEvenRoas)}
          </p>

          <p className="mt-3 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Di bawah angka ini, estimasi biaya iklan menghabiskan
            ruang profit produkmu.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MetricCard
            label="BEP ACOS"
            value={formatBps(result.breakEvenAcosBps)}
          />

          <MetricCard
            label="Ruang Ads hingga BEP"
            value={formatMoney(result.maxAdsCostAtBreakEven)}
          />
        </div>

        <div className="mt-4 rounded-xl bg-[var(--gp-info-soft)] p-4">
          <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
            Kamu belum menentukan target profit. Karena itu GOProfit
            hanya menampilkan titik impas, bukan Minimum ROAS Aman.
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
          TARGET BELUM MEMUNGKINKAN
        </span>

        <h2 className="mt-4 text-xl font-bold">
          Target profit terlalu tinggi untuk kondisi saat ini
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Produk masih memiliki contribution sebelum iklan, tetapi
          ruang profit yang tersedia belum cukup untuk target yang
          kamu pilih sekaligus memberi ruang untuk ads.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard
            label="Profit sebelum iklan"
            value={formatMoney(
              result.breakdown.contributionBeforeAds,
            )}
          />

          <MetricCard
            label="Target profit"
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

        <div className="mt-5 rounded-xl bg-[var(--gp-warning-soft)] p-4">
          <p className="text-sm font-semibold">
            Yang bisa kamu coba
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Turunkan target profit, naikkan harga, kurangi potongan,
            atau periksa kembali biaya produk dan marketplace.
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
          BELUM LAYAK UNTUK ADS
        </span>

        <h2 className="mt-4 text-xl font-bold">
          Produk belum punya ruang untuk iklan
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Setelah modal, fee, dan biaya dihitung, tidak ada contribution
          positif yang bisa digunakan untuk membayar iklan.
        </p>

        <div className="mt-5 rounded-2xl bg-[var(--gp-danger-soft)] p-5">
          <p className="text-xs font-semibold text-[var(--gp-text-secondary)]">
            Profit sebelum iklan
          </p>

          <p className="mt-1 text-3xl font-bold text-[var(--gp-danger)]">
            {formatMoney(
              result.breakdown.contributionBeforeAds,
            )}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-[var(--gp-border)] p-4">
          <p className="text-sm font-semibold">
            Periksa kembali
          </p>

          <p className="mt-2 text-xs leading-5 text-[var(--gp-text-secondary)]">
            Harga jual, HPP, diskon atau voucher, biaya marketplace,
            dan biaya operasional produkmu.
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
        Rincian Perhitungan
      </h3>

      <p className="mt-1 text-xs leading-5 text-[var(--gp-text-secondary)]">
        Dari harga jual sampai ruang profit sebelum iklan.
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
            label="Profit sebelum iklan"
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