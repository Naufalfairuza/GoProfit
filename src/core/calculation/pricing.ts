import type {
  Money,
  PricingBreakdown,
  QuantityContext,
  SellerAdjustment,
} from "../../domain/types";
import { scopeMultiplier } from "./math";

function totalAdjustment(
  adjustments: SellerAdjustment[],
  quantities: QuantityContext,
  predicate: (item: SellerAdjustment) => boolean,
): Money {
  return adjustments
    .filter(predicate)
    .reduce(
      (total, item) => total + item.amount * scopeMultiplier(item.scope, quantities),
      0,
    );
}

export function calculatePricing(
  listPricePerUnit: Money,
  adjustments: SellerAdjustment[],
  quantities: QuantityContext,
): PricingBreakdown {
  const listRevenue = listPricePerUnit * quantities.units;

  const productDiscount = totalAdjustment(
    adjustments,
    quantities,
    (item) => item.type === "PRODUCT_DISCOUNT",
  );

  const afterProductDiscount = listRevenue - productDiscount;

  const otherSellerAdjustments = totalAdjustment(
    adjustments,
    quantities,
    (item) => item.type !== "PRODUCT_DISCOUNT",
  );

  const effectiveRevenue = afterProductDiscount - otherSellerAdjustments;

  return {
    listRevenue,
    productDiscount,
    afterProductDiscount,
    otherSellerAdjustments,
    effectiveRevenue,
  };
}
