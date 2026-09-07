import type { ScenarioFee } from "../../domain/types";

export type ShopeeProgramId =
  | "gratis-ongkir-xtra"
  | "shopee-live-xtra"
  | "promo-xtra"
  | "promo-xtra-plus";

export interface ShopeeProgramConfig {
  id: ShopeeProgramId;
  name: string;
  description: string;
  defaultRateBps: number | null;
  defaultCapAmountPerUnit: number | null;
  sourceNote: string;
  sourceUrl?: string;
}

export interface ShopeeProgramDraft extends ShopeeProgramConfig {
  enabled: boolean;
  rateBps: number | null;
  capAmountPerUnit: number | null;
}

/**
 * Reference presets are deliberately editable. Shopee fees can vary by
 * category, seller status, campaign eligibility, product size, and date.
 */
export const SHOPEE_PROGRAMS: readonly ShopeeProgramConfig[] = [
  {
    id: "gratis-ongkir-xtra",
    name: "Gratis Ongkir XTRA",
    description: "Tarif mengikuti kategori; batas bergantung ukuran produk.",
    defaultRateBps: null,
    defaultCapAmountPerUnit: null,
    sourceNote:
      "Referensi batas Rp40.000 regular / Rp60.000 special; cek Seller Centre.",
    sourceUrl: "https://help.shopee.co.id/portal/4/article/71196?seo=1",
  },
  {
    id: "shopee-live-xtra",
    name: "Shopee Live XTRA",
    description: "3% atau 2% jika ikut Promo XTRA/XTRA+, maksimal Rp20.000/unit.",
    defaultRateBps: 300,
    defaultCapAmountPerUnit: 20_000,
    sourceNote:
      "Rate otomatis 2% jika Promo XTRA/XTRA+ aktif; hanya untuk order teratribusi Live.",
    sourceUrl: "https://seller.shopee.co.id/edu/article/19969",
  },
  {
    id: "promo-xtra",
    name: "Promo XTRA",
    description: "Referensi 4,5% dengan batas Rp60.000 per unit.",
    defaultRateBps: 450,
    defaultCapAmountPerUnit: 60_000,
    sourceNote: "Referensi halaman bantuan Shopee; eligibility tetap perlu dicek.",
    sourceUrl: "https://help.shopee.co.id/portal/4/article/71223",
  },
  {
    id: "promo-xtra-plus",
    name: "Promo XTRA+",
    description: "Referensi 6,5% dengan batas Rp80.000 per unit.",
    defaultRateBps: 650,
    defaultCapAmountPerUnit: 80_000,
    sourceNote: "Referensi halaman bantuan Shopee; eligibility tetap perlu dicek.",
    sourceUrl: "https://help.shopee.co.id/portal/4/article/196507",
  },
] as const;

export function createShopeeProgramDrafts(): ShopeeProgramDraft[] {
  return SHOPEE_PROGRAMS.map((program) => ({
    ...program,
    enabled: false,
    rateBps: program.defaultRateBps,
    capAmountPerUnit: program.defaultCapAmountPerUnit,
  }));
}

export function buildShopeeProgramFees(
  programs: ShopeeProgramDraft[],
): ScenarioFee[] {
  return programs
    .flatMap((program) => {
      if (!program.enabled || program.rateBps === null) return [];

      return [
        {
          id: `shopee-program-${program.id}`,
          name: program.name,
          feeType: "PERCENTAGE" as const,
          rateBps: program.rateBps,
          ...(program.capAmountPerUnit !== null
            ? { capAmountPerUnit: program.capAmountPerUnit }
            : {}),
          calculationBase: "EFFECTIVE_SELLING_PRICE" as const,
          scope: "PER_ORDER" as const,
          attribution:
            program.id === "shopee-live-xtra"
              ? ("SHOPEE_LIVE" as const)
              : ("ALL_SALES" as const),
          source: "CUSTOM" as const,
          active: true,
        },
      ];
    });
}

export function updateShopeeProgramDrafts(
  current: ShopeeProgramDraft[],
  id: ShopeeProgramId,
  patch: Partial<ShopeeProgramDraft>,
): ShopeeProgramDraft[] {
  const promoWasActive = current.some(
    (program) =>
      program.enabled &&
      (program.id === "promo-xtra" || program.id === "promo-xtra-plus"),
  );
  const next = current.map((program) =>
    program.id === id ? { ...program, ...patch } : program,
  );
  const promoIsActive = next.some(
    (program) =>
      program.enabled &&
      (program.id === "promo-xtra" || program.id === "promo-xtra-plus"),
  );
  const live = next.find((program) => program.id === "shopee-live-xtra");

  if (!live) return next;

  if (id === "shopee-live-xtra" && patch.enabled === true) {
    return next.map((program) =>
      program.id === "shopee-live-xtra"
        ? { ...program, rateBps: promoIsActive ? 200 : 300 }
        : program,
    );
  }

  const liveDefaultBeforeChange = promoWasActive ? 200 : 300;
  if (
    (id === "promo-xtra" || id === "promo-xtra-plus") &&
    patch.enabled !== undefined &&
    live.enabled &&
    live.rateBps === liveDefaultBeforeChange
  ) {
    return next.map((program) =>
      program.id === "shopee-live-xtra"
        ? { ...program, rateBps: promoIsActive ? 200 : 300 }
        : program,
    );
  }

  return next;
}

export function restoreShopeeProgramDrafts(
  fees: ScenarioFee[],
): ShopeeProgramDraft[] {
  const promoActive = fees.some(
    (fee) =>
      fee.active &&
      (fee.id === "shopee-program-promo-xtra" ||
        fee.id === "shopee-program-promo-xtra-plus"),
  );

  return SHOPEE_PROGRAMS.map((program) => {
    const fee = fees.find(
      (candidate) => candidate.id === `shopee-program-${program.id}`,
    );

    return {
      ...program,
      enabled: Boolean(fee),
      rateBps:
        program.id === "shopee-live-xtra" && promoActive
          ? 200
          : fee?.rateBps ?? program.defaultRateBps,
      capAmountPerUnit:
        fee?.capAmountPerUnit ?? program.defaultCapAmountPerUnit,
    };
  });
}

export function areShopeeProgramDraftsReady(
  programs: ShopeeProgramDraft[],
): boolean {
  return programs.every(
    (program) => !program.enabled || program.rateBps !== null,
  );
}
