import type {
  FeeCalculationResult,
  Money,
  PricingBreakdown,
  QuantityContext,
  ScenarioFee,
} from "../../domain/types";
import { applyBasisPoints, scopeMultiplier } from "./math";

function resolveBase(
  fee: ScenarioFee,
  pricing: PricingBreakdown,
): Money {
  switch (fee.calculationBase) {
    case "LIST_PRICE":
      return pricing.listRevenue;
    case "AFTER_PRODUCT_DISCOUNT":
      return pricing.afterProductDiscount;
    case "EFFECTIVE_SELLING_PRICE":
      return pricing.effectiveRevenue;
  }
}

export function calculateFees(
  pricing: PricingBreakdown,
  fees: ScenarioFee[],
  quantities: QuantityContext,
  livePricing?: PricingBreakdown,
): FeeCalculationResult {
  const items = fees
    .filter((fee) => fee.active)
    .map((fee) => {
      const isLiveFee = fee.attribution === "SHOPEE_LIVE";
      const feePricing =
        isLiveFee && livePricing !== undefined ? livePricing : pricing;
      const feeQuantities =
        isLiveFee && quantities.liveUnits !== undefined
          ? {
              units: quantities.liveUnits,
              orders: quantities.liveOrders ?? quantities.liveUnits,
            }
          : quantities;
      let amount: Money;

      if (fee.feeType === "PERCENTAGE") {
        if (fee.rateBps === undefined) {
          throw new Error(`Percentage fee ${fee.name} is missing rateBps.`);
        }
        // Percentage base is already aggregate for the current quantity context.
        // Do not multiply again by fee.scope or the fee would be double-counted.
        amount = applyBasisPoints(resolveBase(fee, feePricing), fee.rateBps);

        if (fee.capAmountPerUnit !== undefined) {
          amount = Math.min(
            amount,
            fee.capAmountPerUnit * feeQuantities.units,
          );
        }
      } else {
        if (fee.fixedAmount === undefined) {
          throw new Error(`Fixed fee ${fee.name} is missing fixedAmount.`);
        }
        amount = fee.fixedAmount * scopeMultiplier(fee.scope, feeQuantities);
      }

      return {
        feeId: fee.id,
        name: fee.name,
        amount,
        source: fee.source,
        calculationBase: fee.calculationBase,
      };
    });

  return {
    items,
    total: items.reduce((sum, item) => sum + item.amount, 0),
  };
}
