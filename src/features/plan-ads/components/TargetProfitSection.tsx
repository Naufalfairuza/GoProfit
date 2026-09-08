"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";

type TargetProfitMode =
  | "NONE"
  | "AMOUNT_PER_ORDER"
  | "NET_MARGIN_PERCENT"
  | "HPP_MARKUP_PERCENT";

interface TargetProfitSectionProps {
  mode: TargetProfitMode;
  onModeChange: (mode: TargetProfitMode) => void;

  amount: number | null;
  onAmountChange: (value: number | null) => void;

  rateBps: number | null;
  onRateChange: (value: number | null) => void;
}

export function TargetProfitSection({
  mode,
  onModeChange,
  amount,
  onAmountChange,
  rateBps,
  onRateChange,
}: TargetProfitSectionProps) {
  return (
    <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
      <div className="border-b border-[var(--gp-border)] pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
          3. Target Untung
        </p>

        <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
          Mau mendapatkan untung berapa?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Target ini boleh dikosongkan. Kalau belum tahu, GOProfit tetap bisa
          menghitung batas agar iklan tidak membuat produk rugi.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <TargetOption
          checked={mode === "NONE"}
          title="Saya belum tahu"
          description="Hitung ROAS impas saja."
          onClick={() => onModeChange("NONE")}
        />

        <TargetOption
          checked={mode === "AMOUNT_PER_ORDER"}
          title="Rupiah / pesanan"
          description="Contoh: ingin untung Rp25.000 per pesanan."
          onClick={() => onModeChange("AMOUNT_PER_ORDER")}
        />

        <TargetOption
          checked={mode === "NET_MARGIN_PERCENT"}
          title="Persentase omzet"
          description="Target untung berdasarkan omzet."
          onClick={() => onModeChange("NET_MARGIN_PERCENT")}
        />

        <TargetOption
          checked={mode === "HPP_MARKUP_PERCENT"}
          title="% dari modal"
          description="Target untung berdasarkan modal."
          onClick={() => onModeChange("HPP_MARKUP_PERCENT")}
        />
      </div>

      {mode !== "NONE" && (
        <div className="mt-6 rounded-xl bg-[var(--gp-surface-soft)] p-4">
          {mode === "AMOUNT_PER_ORDER" ? (
            <CurrencyInput
              id="target-profit-amount"
              label="Target untung / pesanan"
              value={amount}
              onValueChange={onAmountChange}
              placeholder="Rp25.000"
            />
          ) : (
            <PercentageInput
              id="target-profit-rate"
              label={
                mode === "NET_MARGIN_PERCENT"
                  ? "Target untung dari omzet"
                  : "Target untung dari modal"
              }
              valueBps={rateBps}
              onValueChange={onRateChange}
              placeholder={mode === "NET_MARGIN_PERCENT" ? "20" : "30"}
            />
          )}
        </div>
      )}
    </section>
  );
}

function TargetOption({
  checked,
  title,
  description,
  onClick,
}: {
  checked: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-4 text-left transition",
        checked
          ? "border-[var(--gp-brand-primary)] bg-[var(--gp-brand-soft)]"
          : "border-[var(--gp-border)] bg-white hover:border-[var(--gp-text-muted)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            checked
              ? "border-[var(--gp-brand-primary)]"
              : "border-[var(--gp-border)]",
          ].join(" ")}
        >
          {checked && (
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--gp-brand-primary)]" />
          )}
        </span>

        <span>
          <span className="block text-sm font-semibold">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-[var(--gp-text-secondary)]">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}
