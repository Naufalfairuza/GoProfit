"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import type {
  ShopeeProgramDraft,
  ShopeeProgramId,
} from "@/config/marketplaces/shopee-programs";

interface ShopeeProgramFeeSectionProps {
  programs: ShopeeProgramDraft[];
  onProgramChange: (
    id: ShopeeProgramId,
    patch: Partial<ShopeeProgramDraft>,
  ) => void;
  idPrefix: string;
}

export function ShopeeProgramFeeSection({
  programs,
  onProgramChange,
  idPrefix,
}: ShopeeProgramFeeSectionProps) {
  return (
    <div className="mt-6 border-t border-[var(--gp-border)] pt-6">
      <div>
        <p className="text-sm font-bold">Program Shopee</p>
        <p className="mt-1 text-xs leading-5 text-[var(--gp-text-muted)]">
          Aktifkan hanya program yang benar-benar diikuti toko. Biaya di bawah
          ini ditambahkan ke biaya admin dan biaya proses.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {programs.map((program) => (
          <div
            key={program.id}
            className="rounded-xl border border-[var(--gp-border)] bg-[var(--gp-surface-soft)] p-4"
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={program.enabled}
                onChange={(event) =>
                  onProgramChange(program.id, {
                    enabled: event.target.checked,
                  })
                }
                className="mt-1 h-4 w-4 accent-[var(--gp-brand-primary)]"
              />
              <span>
                <span className="block text-sm font-bold text-[var(--gp-text-primary)]">
                  {program.name}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--gp-text-secondary)]">
                  {program.description}
                </span>
              </span>
            </label>

            {program.enabled && (
              <div className="mt-4 grid gap-4 border-t border-[var(--gp-border)] pt-4 md:grid-cols-2">
                <PercentageInput
                  id={`${idPrefix}-${program.id}-rate`}
                  label="Biaya program"
                  valueBps={program.rateBps}
                  onValueChange={(valueBps) =>
                    onProgramChange(program.id, { rateBps: valueBps })
                  }
                  placeholder="4,5"
                  helperText="Isi sesuai biaya yang ditanggung toko."
                />

                <CurrencyInput
                  id={`${idPrefix}-${program.id}-cap`}
                  label="Batas / unit (opsional)"
                  value={program.capAmountPerUnit}
                  onValueChange={(capAmountPerUnit) =>
                    onProgramChange(program.id, { capAmountPerUnit })
                  }
                  placeholder="Rp60.000"
                  helperText="Kosongkan jika tidak ada batas per unit."
                />
              </div>
            )}

            <p className="mt-3 text-[11px] leading-5 text-[var(--gp-text-muted)]">
              {program.sourceNote}
            </p>

            {program.sourceUrl && (
              <a
                href={program.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-[11px] font-bold text-[var(--gp-brand-primary)] hover:underline"
              >
                Lihat sumber resmi ↗
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-[var(--gp-warning-soft)] p-4">
        <p className="text-xs leading-5 text-[var(--gp-text-secondary)]">
          Program bisa saling beririsan dengan diskon atau voucher seller.
          Gunakan angka dari rincian biaya pesanan agar biaya tidak dihitung
          dua kali.
        </p>
      </div>
    </div>
  );
}
