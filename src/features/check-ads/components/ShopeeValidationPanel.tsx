"use client";

import { useState } from "react";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import type { CheckAdsInput, CheckAdsResult } from "@/domain/types";

import {
  calculateShopeeValidation,
  type ShopeeValidationComparison,
  type ShopeeValidationData,
} from "../shopee-validation";

interface ShopeeValidationPanelProps {
  result: CheckAdsResult;
  input: CheckAdsInput;
}

interface ShopeeValidationDraft {
  actualGmv: number | null;
  actualHpp: number | null;
  actualMarketplaceFees: number | null;
  actualOperationalCosts: number | null;
  actualAdvertisingCost: number | null;
  actualRefunds: number | null;
}

const fieldLabels: Record<keyof ShopeeValidationDraft, string> = {
  actualGmv: "GMV / penjualan aktual",
  actualHpp: "Total HPP aktual",
  actualMarketplaceFees: "Fee marketplace dan program",
  actualOperationalCosts: "Shipping, packing, dan operasional",
  actualAdvertisingCost: "Total biaya iklan",
  actualRefunds: "Refund, retur, dan pembatalan",
};

export function ShopeeValidationPanel({
  result,
  input,
}: ShopeeValidationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<ShopeeValidationDraft>(() =>
    createInitialDraft(result, input),
  );
  const [comparison, setComparison] =
    useState<ShopeeValidationComparison | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function updateField(
    field: keyof ShopeeValidationDraft,
    value: number | null,
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setComparison(null);
    setFormError(null);
  }

  function compareData() {
    if (
      draft.actualGmv === null ||
      draft.actualHpp === null ||
      draft.actualMarketplaceFees === null ||
      draft.actualOperationalCosts === null ||
      draft.actualAdvertisingCost === null ||
      draft.actualRefunds === null
    ) {
      setComparison(null);
      setFormError("Lengkapi semua angka aktual terlebih dahulu.");
      return;
    }

    const values = [
      draft.actualGmv,
      draft.actualHpp,
      draft.actualMarketplaceFees,
      draft.actualOperationalCosts,
      draft.actualAdvertisingCost,
      draft.actualRefunds,
    ];

    if (values.some((value) => value < 0)) {
      setComparison(null);
      setFormError("Angka aktual tidak boleh bernilai negatif.");
      return;
    }

    const data: ShopeeValidationData = {
      actualGmv: draft.actualGmv,
      actualHpp: draft.actualHpp,
      actualMarketplaceFees: draft.actualMarketplaceFees,
      actualOperationalCosts: draft.actualOperationalCosts,
      actualAdvertisingCost: draft.actualAdvertisingCost,
      actualRefunds: draft.actualRefunds,
    };

    setComparison(
      calculateShopeeValidation(data, result.estimatedProfitAfterAds),
    );
    setFormError(null);
  }

  function resetDraft() {
    setDraft(createInitialDraft(result, input));
    setComparison(null);
    setFormError(null);
  }

  return (
    <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
            Validasi
          </p>
          <h3 className="mt-1 text-lg font-bold tracking-[-0.03em]">
            Bandingkan dengan data Shopee
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gp-text-secondary)]">
            Masukkan angka dari Seller Centre untuk periode dan campaign yang
            sama. GOProfit akan membandingkan untung aktual dengan perkiraan di
            atas.
          </p>
        </div>

        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="shrink-0 rounded-[var(--gp-radius-button)] border border-[var(--gp-border)] px-3 py-2 text-xs font-bold text-[var(--gp-brand-primary)] transition hover:border-[var(--gp-brand-primary)]"
        >
          {isOpen ? "Tutup" : "Mulai validasi"}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 border-t border-[var(--gp-border)] pt-5">
          <div className="rounded-xl border border-[var(--gp-info)] bg-[var(--gp-info-soft)] p-4">
            <p className="text-xs font-bold text-[var(--gp-info)]">
              Cara mengisi
            </p>
            <p className="mt-1 text-[11px] leading-5 text-[var(--gp-text-secondary)]">
              Nilai awal mengikuti input campaign dan perkiraan GOProfit. Ganti
              dengan angka Seller Centre yang benar-benar kamu lihat. Jangan
              masukkan password, token, atau data login.
            </p>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <CurrencyInput
              id="validation-actual-gmv"
              label={fieldLabels.actualGmv}
              value={draft.actualGmv}
              onValueChange={(value) => updateField("actualGmv", value)}
              helperText="Gunakan scope yang sama dengan campaign. Jika GMV sudah bersih dari refund, isi refund Rp0 agar tidak dihitung dua kali."
              required
            />

            <CurrencyInput
              id="validation-actual-hpp"
              label={fieldLabels.actualHpp}
              value={draft.actualHpp}
              onValueChange={(value) => updateField("actualHpp", value)}
              helperText="Total modal untuk unit dalam scope tersebut, bukan HPP per unit."
              required
            />

            <CurrencyInput
              id="validation-marketplace-fees"
              label={fieldLabels.actualMarketplaceFees}
              value={draft.actualMarketplaceFees}
              onValueChange={(value) =>
                updateField("actualMarketplaceFees", value)
              }
              helperText="Gabungkan biaya admin, layanan, dan program yang dibebankan ke toko."
              required
            />

            <CurrencyInput
              id="validation-operational-costs"
              label={fieldLabels.actualOperationalCosts}
              value={draft.actualOperationalCosts}
              onValueChange={(value) =>
                updateField("actualOperationalCosts", value)
              }
              helperText="Masukkan ongkir atau biaya lain yang benar-benar ditanggung toko."
              required
            />

            <CurrencyInput
              id="validation-advertising-cost"
              label={fieldLabels.actualAdvertisingCost}
              value={draft.actualAdvertisingCost}
              onValueChange={(value) =>
                updateField("actualAdvertisingCost", value)
              }
              helperText="Gabungkan media ad spend dan biaya iklan tambahan bila ada."
              required
            />

            <CurrencyInput
              id="validation-refunds"
              label={fieldLabels.actualRefunds}
              value={draft.actualRefunds}
              onValueChange={(value) => updateField("actualRefunds", value)}
              helperText="Isi Rp0 jika sudah dikurangkan dari GMV aktual."
              required
            />
          </div>

          {formError && (
            <p
              role="alert"
              className="mt-4 rounded-xl border border-[var(--gp-danger)] bg-[var(--gp-danger-soft)] p-3 text-xs font-semibold text-[var(--gp-danger)]"
            >
              {formError}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={compareData}
              className="min-h-11 rounded-[var(--gp-radius-button)] bg-[var(--gp-brand-primary)] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[var(--gp-brand-hover)]"
            >
              Bandingkan hasil
            </button>
            <button
              type="button"
              onClick={resetDraft}
              className="min-h-11 rounded-[var(--gp-radius-button)] border border-[var(--gp-border)] px-5 text-sm font-bold text-[var(--gp-text-secondary)] transition hover:border-[var(--gp-brand-primary)] hover:text-[var(--gp-brand-primary)]"
            >
              Isi ulang nilai awal
            </button>
          </div>

          {comparison && <ComparisonResult comparison={comparison} />}

          <p className="mt-5 text-[11px] leading-5 text-[var(--gp-text-muted)]">
            Data validasi ini hanya diproses di browser dan tidak otomatis
            dikirim ke Shopee atau Sentry. Hasilnya adalah pembanding
            operasional, bukan laporan laba bersih akuntansi.
          </p>
        </div>
      )}
    </section>
  );
}

function createInitialDraft(
  result: CheckAdsResult,
  input: CheckAdsInput,
): ShopeeValidationDraft {
  return {
    actualGmv: input.campaign.attributedGmv,
    actualHpp: result.breakdown.hpp,
    actualMarketplaceFees: result.breakdown.fees.total,
    actualOperationalCosts: result.breakdown.costs.total,
    actualAdvertisingCost: result.totalAdvertisingCost,
    actualRefunds: 0,
  };
}

function ComparisonResult({
  comparison,
}: {
  comparison: ShopeeValidationComparison;
}) {
  const differenceTone =
    comparison.difference > 0
      ? "border-[var(--gp-success)] bg-[var(--gp-success-soft)] text-[var(--gp-success)]"
      : comparison.difference < 0
        ? "border-[var(--gp-danger)] bg-[var(--gp-danger-soft)] text-[var(--gp-danger)]"
        : "border-[var(--gp-border)] bg-[var(--gp-surface-soft)] text-[var(--gp-text-primary)]";

  const differenceLabel =
    comparison.difference > 0
      ? "Untung aktual lebih tinggi dari perkiraan"
      : comparison.difference < 0
        ? "Untung aktual lebih rendah dari perkiraan"
        : "Untung aktual sama dengan perkiraan";

  return (
    <div className="mt-6 rounded-2xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
        Hasil validasi
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ValidationMetric
          label="Untung aktual"
          value={formatMoney(comparison.actualProfit)}
          strong
        />
        <ValidationMetric
          label="Perkiraan GOProfit"
          value={formatMoney(comparison.estimatedProfit)}
        />
        <ValidationMetric
          label="Selisih aktual − estimasi"
          value={formatSignedMoney(comparison.difference)}
        />
      </div>

      <div className={`mt-4 rounded-xl border p-4 ${differenceTone}`}>
        <p className="text-sm font-bold">{differenceLabel}</p>
        <p className="mt-1 text-xs leading-5">
          {comparison.difference === 0
            ? "Angka aktual dan estimasi berada di titik yang sama."
            : "Gunakan selisih ini untuk mencari biaya atau transaksi yang belum masuk ke rumus."}
        </p>
      </div>

      {comparison.actualMarginBps !== undefined && (
        <p className="mt-4 text-xs text-[var(--gp-text-secondary)]">
          Margin operasional aktual: {formatPercentage(comparison.actualMarginBps)}
        </p>
      )}
    </div>
  );
}

function ValidationMetric({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--gp-border)] bg-white p-3">
      <p className="text-[10px] leading-4 text-[var(--gp-text-muted)]">{label}</p>
      <p
        className={`mt-1 text-sm font-bold text-[var(--gp-text-primary)] ${
          strong ? "sm:text-base" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function formatMoney(value: number): string {
  if (value < 0) return `-Rp${Math.abs(value).toLocaleString("id-ID")}`;
  return `Rp${value.toLocaleString("id-ID")}`;
}

function formatSignedMoney(value: number): string {
  if (value > 0) return `+${formatMoney(value)}`;
  return formatMoney(value);
}

function formatPercentage(bps: number): string {
  return `${(bps / 100).toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}
