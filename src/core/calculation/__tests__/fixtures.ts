import type { PlanAdsInput } from "../../../domain/types";
import { CALCULATION_RULE_VERSION } from "../constants";

export function basePlanInput(): PlanAdsInput {
  return {
    marketplace: "SHOPEE",
    currencyCode: "IDR",
    listPrice: 150_000,
    hppPerUnit: 80_000,
    adjustments: [],
    fees: [
      {
        id: "admin",
        name: "Admin Marketplace",
        feeType: "PERCENTAGE",
        rateBps: 800,
        calculationBase: "EFFECTIVE_SELLING_PRICE",
        scope: "PER_ORDER",
        source: "CUSTOM",
        active: true,
      },
      {
        id: "process",
        name: "Process Fee",
        feeType: "FIXED",
        fixedAmount: 1_250,
        calculationBase: "EFFECTIVE_SELLING_PRICE",
        scope: "PER_ORDER",
        source: "CUSTOM",
        active: true,
      },
    ],
    costs: [
      {
        id: "packing",
        type: "PACKAGING",
        name: "Packing",
        amount: 2_000,
        scope: "PER_ORDER",
      },
    ],
    targetProfit: { mode: "NONE" },
    calculationRuleVersion: CALCULATION_RULE_VERSION,
  };
}
