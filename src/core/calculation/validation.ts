import type {
  CheckAdsInput,
  PlanAdsInput,
  ValidationIssue,
  ValidationResult,
} from "../../domain/types";

function result(issues: ValidationIssue[]): ValidationResult {
  return issues.length === 0
    ? { valid: true, issues: [] }
    : { valid: false, issues };
}

export function validatePlanInput(input: PlanAdsInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (!Number.isSafeInteger(input.listPrice) || input.listPrice <= 0) {
    issues.push({ field: "listPrice", code: "LIST_PRICE_INVALID" });
  }
  if (!Number.isSafeInteger(input.hppPerUnit) || input.hppPerUnit < 0) {
    issues.push({ field: "hppPerUnit", code: "HPP_INVALID" });
  }

  for (const adjustment of input.adjustments) {
    if (!Number.isSafeInteger(adjustment.amount) || adjustment.amount < 0) {
      issues.push({ field: `adjustments.${adjustment.id}`, code: "ADJUSTMENT_INVALID" });
    }
  }

  for (const fee of input.fees) {
    if (fee.feeType === "PERCENTAGE") {
      if (
        fee.rateBps === undefined ||
        !Number.isSafeInteger(fee.rateBps) ||
        fee.rateBps < 0
      ) {
        issues.push({ field: `fees.${fee.id}`, code: "FEE_RATE_INVALID" });
      }
      if (fee.fixedAmount !== undefined) {
        issues.push({ field: `fees.${fee.id}`, code: "FEE_TYPE_CONFLICT" });
      }
    } else {
      if (
        fee.fixedAmount === undefined ||
        !Number.isSafeInteger(fee.fixedAmount) ||
        fee.fixedAmount < 0
      ) {
        issues.push({ field: `fees.${fee.id}`, code: "FIXED_FEE_INVALID" });
      }
      if (fee.rateBps !== undefined) {
        issues.push({ field: `fees.${fee.id}`, code: "FEE_TYPE_CONFLICT" });
      }
    }

    if (
      fee.capAmountPerUnit !== undefined &&
      (!Number.isSafeInteger(fee.capAmountPerUnit) ||
        fee.capAmountPerUnit < 0)
    ) {
      issues.push({ field: `fees.${fee.id}`, code: "FEE_CAP_INVALID" });
    }
  }

  for (const cost of input.costs) {
    if (!Number.isSafeInteger(cost.amount) || cost.amount < 0) {
      issues.push({ field: `costs.${cost.id}`, code: "COST_INVALID" });
    }
  }

  switch (input.targetProfit.mode) {
    case "AMOUNT_PER_ORDER":
      if (
        !Number.isSafeInteger(input.targetProfit.amount) ||
        input.targetProfit.amount < 0
      ) {
        issues.push({ field: "targetProfit", code: "TARGET_AMOUNT_INVALID" });
      }
      break;
    case "NET_MARGIN_PERCENT":
    case "HPP_MARKUP_PERCENT":
      if (
        !Number.isSafeInteger(input.targetProfit.rateBps) ||
        input.targetProfit.rateBps < 0
      ) {
        issues.push({ field: "targetProfit", code: "TARGET_RATE_INVALID" });
      }
      break;
    case "NONE":
      break;
  }

  // Plan My Ads V1 = one unit in one order.
  const productDiscount = input.adjustments
    .filter((item) => item.type === "PRODUCT_DISCOUNT")
    .reduce((sum, item) => sum + item.amount, 0);
  const otherAdjustments = input.adjustments
    .filter((item) => item.type !== "PRODUCT_DISCOUNT")
    .reduce((sum, item) => sum + item.amount, 0);

  if (productDiscount > input.listPrice) {
    issues.push({ field: "adjustments", code: "DISCOUNT_EXCEEDS_PRICE" });
  }
  if (input.listPrice - productDiscount - otherAdjustments <= 0) {
    issues.push({ field: "adjustments", code: "EFFECTIVE_PRICE_NON_POSITIVE" });
  }

  return result(issues);
}

export function validateCheckInput(input: CheckAdsInput): ValidationResult {
  const planValidation = validatePlanInput(input.economics);
  const issues: ValidationIssue[] = [...planValidation.issues];
  const c = input.campaign;

  const moneyFields: Array<[string, number]> = [
    ["campaign.mediaAdSpend", c.mediaAdSpend],
    ["campaign.additionalAdCost", c.additionalAdCost],
    ["campaign.attributedGmv", c.attributedGmv],
  ];
  if (c.directGmv !== undefined) moneyFields.push(["campaign.directGmv", c.directGmv]);

  for (const [field, value] of moneyFields) {
    if (!Number.isSafeInteger(value) || value < 0) {
      issues.push({ field, code: "CAMPAIGN_MONEY_INVALID" });
    }
  }

  if (!Number.isSafeInteger(c.orders) || c.orders < 0) {
    issues.push({ field: "campaign.orders", code: "ORDERS_INVALID" });
  }
  if (!Number.isSafeInteger(c.unitsSold) || c.unitsSold < 0) {
    issues.push({ field: "campaign.unitsSold", code: "UNITS_INVALID" });
  }
  if (c.clicks !== undefined && (!Number.isSafeInteger(c.clicks) || c.clicks < 0)) {
    issues.push({ field: "campaign.clicks", code: "CLICKS_INVALID" });
  }

  if (
    c.liveOrders !== undefined &&
    (!Number.isSafeInteger(c.liveOrders) ||
      c.liveOrders < 0 ||
      c.liveOrders > c.orders)
  ) {
    issues.push({ field: "campaign.liveOrders", code: "LIVE_ORDERS_INVALID" });
  }
  if (
    c.liveUnitsSold !== undefined &&
    (!Number.isSafeInteger(c.liveUnitsSold) ||
      c.liveUnitsSold < 0 ||
      c.liveUnitsSold > c.unitsSold)
  ) {
    issues.push({
      field: "campaign.liveUnitsSold",
      code: "LIVE_UNITS_INVALID",
    });
  }

  return result(issues);
}
