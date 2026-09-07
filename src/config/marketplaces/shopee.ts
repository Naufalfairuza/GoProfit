/**
 * GOProfit keeps seller-entered fees editable because Shopee rates can vary by
 * category, seller status, program eligibility, and effective date.
 */
export const SHOPEE_MARKETPLACE = {
  code: "SHOPEE" as const,
  name: "Shopee",
  countryCode: "ID",
  currencyCode: "IDR" as const,
};

export const SHOPEE_INITIAL_FEE_PRESET = [] as const;

export * from "./shopee-programs";
