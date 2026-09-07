import type { BasisPoints, CalculationBase, FeeType, Money } from "@/domain/types";

export type ShopeeSellerStatus =
  | "REGULAR"
  | "STAR"
  | "STAR_PLUS"
  | "MALL"
  | "OTHER";

export type ShopeeProductSize = "REGULAR" | "SPECIAL";

export interface ShopeeFeeRuleContext {
  categoryId: string;
  sellerStatus: ShopeeSellerStatus;
  productSize: ShopeeProductSize;
  effectiveDate: string;
}

export interface ShopeeFeeRule {
  id: string;
  version: string;
  ruleKey: string;
  categoryId: string | "ANY";
  sellerStatus: ShopeeSellerStatus | "ANY";
  productSize: ShopeeProductSize | "ANY";
  effectiveFrom: string;
  effectiveTo?: string;
  name: string;
  feeType: FeeType;
  rateBps?: BasisPoints;
  fixedAmount?: Money;
  capAmountPerUnit?: Money;
  calculationBase: CalculationBase;
  sourceUrl: string;
  sourceNote: string;
}

/**
 * Intentionally empty until the exact seller/category/date matrix is
 * validated against Seller Centre examples. An empty registry is safer than
 * presenting invented rates as official Shopee fees.
 */
export const SHOPEE_FEE_RULES: readonly ShopeeFeeRule[] = [];

export const SHOPEE_FEE_RULES_SOURCE =
  "https://seller.shopee.co.id/edu/article/3489";

export function resolveShopeeFeeRules(
  context: ShopeeFeeRuleContext,
  rules: readonly ShopeeFeeRule[] = SHOPEE_FEE_RULES,
): ShopeeFeeRule[] {
  const matchingRules = rules.filter((rule) =>
    matchesRule(rule, context),
  );
  const selectedByKey = new Map<string, ShopeeFeeRule>();

  for (const rule of matchingRules) {
    const current = selectedByKey.get(rule.ruleKey);
    if (!current || compareRulePriority(rule, current, context) > 0) {
      selectedByKey.set(rule.ruleKey, rule);
    }
  }

  return [...selectedByKey.values()].sort((left, right) =>
    left.ruleKey.localeCompare(right.ruleKey),
  );
}

function matchesRule(
  rule: ShopeeFeeRule,
  context: ShopeeFeeRuleContext,
): boolean {
  return (
    (rule.categoryId === "ANY" || rule.categoryId === context.categoryId) &&
    (rule.sellerStatus === "ANY" ||
      rule.sellerStatus === context.sellerStatus) &&
    (rule.productSize === "ANY" ||
      rule.productSize === context.productSize) &&
    context.effectiveDate >= rule.effectiveFrom &&
    (rule.effectiveTo === undefined ||
      context.effectiveDate <= rule.effectiveTo)
  );
}

function compareRulePriority(
  left: ShopeeFeeRule,
  right: ShopeeFeeRule,
  context: ShopeeFeeRuleContext,
): number {
  const specificityDifference =
    ruleSpecificity(left, context) - ruleSpecificity(right, context);

  if (specificityDifference !== 0) return specificityDifference;

  return left.effectiveFrom.localeCompare(right.effectiveFrom);
}

function ruleSpecificity(
  rule: ShopeeFeeRule,
  context: ShopeeFeeRuleContext,
): number {
  return (
    (rule.categoryId === context.categoryId ? 4 : 0) +
    (rule.sellerStatus === context.sellerStatus ? 2 : 0) +
    (rule.productSize === context.productSize ? 1 : 0)
  );
}
