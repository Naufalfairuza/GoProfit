/**
 * GOProfit Beta intentionally ships without hard-coded Shopee fee rates.
 * Fee presets must be added only after their calculation bases, effective dates,
 * caps/rounding, and seller/program applicability have been verified.
 */
export const SHOPEE_MARKETPLACE = {
  code: "SHOPEE" as const,
  name: "Shopee",
  countryCode: "ID",
  currencyCode: "IDR" as const,
};

export const SHOPEE_INITIAL_FEE_PRESET = [] as const;
