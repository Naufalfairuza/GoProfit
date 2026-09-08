"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import type {
  ShopeeProgramDraft,
  ShopeeProgramId,
} from "@/config/marketplaces/shopee-programs";

import { ShopeeProgramFeeSection } from "./ShopeeProgramFeeSection";

interface FeeAndCostSectionProps {
  adminFeeBps: number | null;
  onAdminFeeChange: (value: number | null) => void;

  processFee: number | null;
  onProcessFeeChange: (value: number | null) => void;

  packingCost: number | null;
  onPackingCostChange: (value: number | null) => void;

  programs: ShopeeProgramDraft[];
  onProgramChange: (
    id: ShopeeProgramId,
    patch: Partial<ShopeeProgramDraft>,
  ) => void;
  idPrefix: string;
}

export function FeeAndCostSection({
  adminFeeBps,
  onAdminFeeChange,
  processFee,
  onProcessFeeChange,
  packingCost,
  onPackingCostChange,
  programs,
  onProgramChange,
  idPrefix,
}: FeeAndCostSectionProps) {
  return (
    <section className="rounded-[var(--gp-radius-card)] border border-[var(--gp-border)] bg-white p-5 md:p-6">
      <div className="border-b border-[var(--gp-border)] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--gp-brand-primary)]">
            2. Biaya Shopee & Program Toko
          </p>

          <span className="rounded-full bg-[var(--gp-brand-soft)] px-3 py-1 text-[11px] font-bold text-[var(--gp-brand-primary)]">
            SHOPEE · CUSTOM
          </span>
        </div>

        <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
          Masukkan biaya yang dikenakan
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--gp-text-secondary)]">
          Isi sesuai rincian biaya tokomu agar hasilnya tidak memakai
          perkiraan dari toko lain.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <PercentageInput
          id="admin-fee"
          label="Biaya admin Shopee"
          valueBps={adminFeeBps}
          onValueChange={onAdminFeeChange}
          placeholder="8"
          helperText="Contoh: isi 8 jika biaya admin tokomu 8%."
        />

        <CurrencyInput
          id="process-fee"
          label="Biaya Proses Pesanan"
          value={processFee}
          onValueChange={onProcessFeeChange}
          placeholder="Rp1.250"
          helperText="Biaya tetap yang dikenakan untuk setiap pesanan."
        />

        <CurrencyInput
          id="packing-cost"
          label="Biaya Packing"
          value={packingCost}
          onValueChange={onPackingCostChange}
          placeholder="Rp2.000"
          helperText="Plastik, kardus, bubble wrap, atau biaya kemasan lainnya."
        />
      </div>

      <ShopeeProgramFeeSection
        programs={programs}
        onProgramChange={onProgramChange}
        idPrefix={idPrefix}
      />
    </section>
  );
}
