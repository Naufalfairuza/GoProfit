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
          3. Target Profit
        </p>

        <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
          Mau mempertahankan profit berapa?
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Target bersifat opsional. Kalau belum tahu, GOProfit tetap dapat
          menghitung ROAS impas.
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
          title="Rupiah / order"
          description="Contoh target Rp25.000."
          onClick={() => onModeChange("AMOUNT_PER_ORDER")}
        />

        <TargetOption
          checked={mode === "NET_MARGIN_PERCENT"}
          title="Net Margin"
          description="Target profit dari omzet."
          onClick={() => onModeChange("NET_MARGIN_PERCENT")}
        />

        <TargetOption
          checked={mode === "HPP_MARKUP_PERCENT"}
          title="% dari HPP"
          description="Target profit berdasarkan modal."
          onClick={() => onModeChange("HPP_MARKUP_PERCENT")}
        />
      </div>

      {mode !== "NONE" && (
        <div className="mt-6 rounded-xl bg-[var(--gp-surface-soft)] p-4">
          {mode === "AMOUNT_PER_ORDER" ? (
            <CurrencyInput
              id="target-profit-amount"
              label="Target Profit / Order"
              value={amount}
              onValueChange={onAmountChange}
              placeholder="Rp25.000"
            />
          ) : (
            <PercentageInput
              id="target-profit-rate"
              label={
                mode === "NET_MARGIN_PERCENT"
                  ? "Target Net Margin"
                  : "Target Profit dari HPP"
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