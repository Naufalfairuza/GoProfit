import type { PlanAdsInput, PlanAdsResult } from "../../domain/types";
import { calculateContribution } from "./contribution";
import { ratioToBasisPoints } from "./math";
import { calculateTargetProfit } from "./target-profit";
import { validatePlanInput } from "./validation";

export function planAds(input: PlanAdsInput): PlanAdsResult {
  const validation = validatePlanInput(input);
  if (!validation.valid) {
    throw new Error(`Invalid PlanAdsInput: ${validation.issues.map((i) => i.code).join(", ")}`);
  }

  const quantities = { units: 1, orders: 1 };
  const breakdown = calculateContribution(input, quantities);
  const revenue = breakdown.pricing.effectiveRevenue;
  const contribution = breakdown.contributionBeforeAds;

  if (contribution <= 0) {
    return {
      status: "NOT_ADS_FEASIBLE",
      breakdown,
      calculationRuleVersion: input.calculationRuleVersion,
    };
  }

  const breakEvenRoas = revenue / contribution;
  const breakEvenAcosBps = ratioToBasisPoints(contribution, revenue);

  const targetProfit = calculateTargetProfit(input.targetProfit, {
    effectiveRevenue: revenue,
    hpp: breakdown.hpp,
    orders: 1,
  });

  if (targetProfit === undefined) {
    return {
      status: "BREAK_EVEN_ONLY",
      breakdown,
      breakEvenRoas,
      breakEvenAcosBps,
      maxAdsCostAtBreakEven: contribution,
      calculationRuleVersion: input.calculationRuleVersion,
    };
  }

  if (targetProfit > contribution) {
    return {
      status: "TARGET_NOT_FEASIBLE",
      reason: "TARGET_EXCEEDS_CONTRIBUTION",
      breakdown,
      targetProfit,
      breakEvenRoas,
      breakEvenAcosBps,
      calculationRuleVersion: input.calculationRuleVersion,
    };
  }

  const maxAdsCostForTarget = contribution - targetProfit;
  if (maxAdsCostForTarget <= 0) {
    return {
      status: "TARGET_NOT_FEASIBLE",
      reason: "NO_ADS_ROOM_FOR_TARGET",
      breakdown,
      targetProfit,
      breakEvenRoas,
      breakEvenAcosBps,
      calculationRuleVersion: input.calculationRuleVersion,
    };
  }

  return {
    status: "TARGET_FEASIBLE",
    breakdown,
    targetProfit,
    maxAdsCostForTarget,
    breakEvenRoas,
    breakEvenAcosBps,
    minimumTargetRoas: revenue / maxAdsCostForTarget,
    calculationRuleVersion: input.calculationRuleVersion,
  };
}
