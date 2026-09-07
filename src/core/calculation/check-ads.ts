import type {
  CalculationWarning,
  CampaignDiagnosis,
  CheckAdsInput,
  CheckAdsResult,
} from "../../domain/types";
import { calculateContribution } from "./contribution";
import { ratioToBasisPoints, roundMoney, safeDivide } from "./math";
import { calculateTargetProfit } from "./target-profit";
import { validateCheckInput } from "./validation";

function diagnose(
  profitAfterAds: number,
  targetProfitTotal: number | undefined,
): CampaignDiagnosis {
  if (profitAfterAds < 0) return "LOSS";
  if (profitAfterAds === 0) return "BREAK_EVEN";
  if (targetProfitTotal === undefined) return "PROFITABLE";
  return profitAfterAds >= targetProfitTotal ? "TARGET_MET" : "BELOW_TARGET";
}

export function checkAds(input: CheckAdsInput): CheckAdsResult {
  const validation = validateCheckInput(input);
  if (!validation.valid) {
    throw new Error(`Invalid CheckAdsInput: ${validation.issues.map((i) => i.code).join(", ")}`);
  }

  const quantities = {
    units: input.campaign.unitsSold,
    orders: input.campaign.orders,
  };
  const breakdown = calculateContribution(input.economics, quantities);

  const totalAdvertisingCost =
    input.campaign.mediaAdSpend + input.campaign.additionalAdCost;
  const estimatedProfitAfterAds =
    breakdown.contributionBeforeAds - totalAdvertisingCost;

  const reportedRoas = safeDivide(
    input.campaign.attributedGmv,
    input.campaign.mediaAdSpend,
  );
  const economicRoas = safeDivide(
    input.campaign.attributedGmv,
    totalAdvertisingCost,
  );

  const reportedAcosBps =
    input.campaign.attributedGmv > 0
      ? ratioToBasisPoints(input.campaign.mediaAdSpend, input.campaign.attributedGmv)
      : undefined;
  const economicAcosBps =
    input.campaign.attributedGmv > 0
      ? ratioToBasisPoints(totalAdvertisingCost, input.campaign.attributedGmv)
      : undefined;

  const cpa =
    input.campaign.orders > 0
      ? roundMoney(totalAdvertisingCost / input.campaign.orders)
      : undefined;
  const cpc =
    input.campaign.clicks !== undefined && input.campaign.clicks > 0
      ? roundMoney(totalAdvertisingCost / input.campaign.clicks)
      : undefined;
  const estimatedProfitPerOrder =
    input.campaign.orders > 0
      ? roundMoney(estimatedProfitAfterAds / input.campaign.orders)
      : undefined;

  const targetProfitTotal = calculateTargetProfit(input.economics.targetProfit, {
    effectiveRevenue: breakdown.pricing.effectiveRevenue,
    hpp: breakdown.hpp,
    orders: input.campaign.orders,
  });

  const warnings: CalculationWarning[] = [];
  if (input.economics.fees.some((fee) => fee.active && fee.source === "PRESET")) {
    warnings.push({ code: "USING_PRESET_FEE", severity: "INFO" });
  }
  if (input.campaign.clicks === 0) {
    warnings.push({ code: "NO_CLICKS", severity: "INFO" });
  }
  if (input.campaign.orders === 0) {
    warnings.push({ code: "NO_ORDERS", severity: "INFO" });
  }
  if (input.campaign.mediaAdSpend === 0) {
    warnings.push({ code: "NO_MEDIA_AD_SPEND", severity: "INFO" });
  }
  if (input.campaign.unitsSold !== input.campaign.orders) {
    warnings.push({ code: "MULTI_UNIT_ORDER_ESTIMATE", severity: "INFO" });
  }
  if (Math.abs(input.campaign.attributedGmv - breakdown.pricing.effectiveRevenue) > 1) {
    warnings.push({ code: "GMV_UNIT_ECONOMICS_MISMATCH", severity: "WARNING" });
  }
  if (input.campaign.attributedGmv > 0) {
    warnings.push({ code: "ATTRIBUTED_DATA_ESTIMATE", severity: "INFO" });
  }

  return {
    breakdown,
    totalAdvertisingCost,
    estimatedProfitAfterAds,
    estimatedProfitPerOrder,
    targetProfitTotal,
    reportedRoas,
    economicRoas,
    reportedAcosBps,
    economicAcosBps,
    cpa,
    cpc,
    diagnosis: diagnose(estimatedProfitAfterAds, targetProfitTotal),
    warnings,
    calculationRuleVersion: input.calculationRuleVersion,
  };
}
