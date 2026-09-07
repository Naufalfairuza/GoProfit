import type {
  ContributionBreakdown,
  PlanAdsInput,
  QuantityContext,
} from "../../domain/types";
import { calculateCosts } from "./costs";
import { calculateFees } from "./fees";
import { calculatePricing } from "./pricing";

export function calculateContribution(
  input: PlanAdsInput,
  quantities: QuantityContext,
): ContributionBreakdown {
  const pricing = calculatePricing(input.listPrice, input.adjustments, quantities);
  const hpp = input.hppPerUnit * quantities.units;
  const fees = calculateFees(pricing, input.fees, quantities);
  const costs = calculateCosts(input.costs, quantities);

  const contributionBeforeAds =
    pricing.effectiveRevenue - hpp - fees.total - costs.total;

  return {
    pricing,
    hpp,
    fees,
    costs,
    contributionBeforeAds,
  };
}
