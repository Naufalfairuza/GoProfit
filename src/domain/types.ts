export type Money = number;
export type BasisPoints = number;
export type CurrencyCode = "IDR";
export type MarketplaceCode = "SHOPEE";

export type FeeType = "PERCENTAGE" | "FIXED";
export type FeeSource = "PRESET" | "CUSTOM";
export type FeeAttribution = "ALL_SALES" | "SHOPEE_LIVE";
export type CalculationBase =
  | "LIST_PRICE"
  | "AFTER_PRODUCT_DISCOUNT"
  | "EFFECTIVE_SELLING_PRICE";

export type CostScope = "PER_UNIT" | "PER_ORDER" | "PER_CAMPAIGN";

export type AdjustmentType =
  | "PRODUCT_DISCOUNT"
  | "SELLER_VOUCHER"
  | "OTHER_SELLER_FUNDED";

export interface SellerAdjustment {
  id: string;
  type: AdjustmentType;
  amount: Money;
  scope: CostScope;
}

export interface ScenarioFee {
  id: string;
  name: string;
  feeType: FeeType;
  rateBps?: BasisPoints;
  fixedAmount?: Money;
  /** Optional maximum fee for each sold unit. */
  capAmountPerUnit?: Money;
  calculationBase: CalculationBase;
  scope: CostScope;
  attribution?: FeeAttribution;
  source: FeeSource;
  active: boolean;
}

export type ScenarioCostType =
  | "PACKAGING"
  | "HANDLING"
  | "OPERATIONAL"
  | "OTHER";

export interface ScenarioCost {
  id: string;
  type: ScenarioCostType;
  name: string;
  amount: Money;
  scope: CostScope;
}

export type TargetProfit =
  | { mode: "NONE" }
  | { mode: "AMOUNT_PER_ORDER"; amount: Money }
  | { mode: "NET_MARGIN_PERCENT"; rateBps: BasisPoints }
  | { mode: "HPP_MARKUP_PERCENT"; rateBps: BasisPoints };

export interface PlanAdsInput {
  marketplace: MarketplaceCode;
  currencyCode: CurrencyCode;
  listPrice: Money;
  hppPerUnit: Money;
  adjustments: SellerAdjustment[];
  fees: ScenarioFee[];
  costs: ScenarioCost[];
  targetProfit: TargetProfit;
  calculationRuleVersion: string;
}

export interface CampaignInput {
  mediaAdSpend: Money;
  additionalAdCost: Money;
  attributedGmv: Money;
  directGmv?: Money;
  orders: number;
  unitsSold: number;
  clicks?: number;
  liveOrders?: number;
  liveUnitsSold?: number;
}

export interface CheckAdsInput {
  economics: PlanAdsInput;
  campaign: CampaignInput;
  calculationRuleVersion: string;
}

export interface QuantityContext {
  orders: number;
  units: number;
  liveOrders?: number;
  liveUnits?: number;
}

export interface PricingBreakdown {
  listRevenue: Money;
  productDiscount: Money;
  afterProductDiscount: Money;
  otherSellerAdjustments: Money;
  effectiveRevenue: Money;
}

export interface FeeResultItem {
  feeId: string;
  name: string;
  amount: Money;
  source: FeeSource;
  calculationBase: CalculationBase;
}

export interface FeeCalculationResult {
  items: FeeResultItem[];
  total: Money;
}

export interface CostResultItem {
  costId: string;
  name: string;
  amount: Money;
  scope: CostScope;
}

export interface CostCalculationResult {
  items: CostResultItem[];
  total: Money;
}

export interface ContributionBreakdown {
  pricing: PricingBreakdown;
  hpp: Money;
  fees: FeeCalculationResult;
  costs: CostCalculationResult;
  contributionBeforeAds: Money;
}

export type PlanAdsResult =
  | {
      status: "NOT_ADS_FEASIBLE";
      breakdown: ContributionBreakdown;
      calculationRuleVersion: string;
    }
  | {
      status: "BREAK_EVEN_ONLY";
      breakdown: ContributionBreakdown;
      breakEvenRoas: number;
      breakEvenAcosBps: BasisPoints;
      maxAdsCostAtBreakEven: Money;
      calculationRuleVersion: string;
    }
  | {
      status: "TARGET_NOT_FEASIBLE";
      reason: "TARGET_EXCEEDS_CONTRIBUTION" | "NO_ADS_ROOM_FOR_TARGET";
      breakdown: ContributionBreakdown;
      targetProfit: Money;
      breakEvenRoas: number;
      breakEvenAcosBps: BasisPoints;
      calculationRuleVersion: string;
    }
  | {
      status: "TARGET_FEASIBLE";
      breakdown: ContributionBreakdown;
      targetProfit: Money;
      maxAdsCostForTarget: Money;
      breakEvenRoas: number;
      breakEvenAcosBps: BasisPoints;
      minimumTargetRoas: number;
      calculationRuleVersion: string;
    };

export type CampaignDiagnosis =
  | "LOSS"
  | "BREAK_EVEN"
  | "PROFITABLE"
  | "BELOW_TARGET"
  | "TARGET_MET";

export type CalculationWarningCode =
  | "GMV_UNIT_ECONOMICS_MISMATCH"
  | "USING_PRESET_FEE"
  | "NO_CLICKS"
  | "NO_ORDERS"
  | "NO_MEDIA_AD_SPEND"
  | "ATTRIBUTED_DATA_ESTIMATE"
  | "MULTI_UNIT_ORDER_ESTIMATE"
  | "LIVE_ATTRIBUTION_ESTIMATE";

export interface CalculationWarning {
  code: CalculationWarningCode;
  severity: "INFO" | "WARNING";
}

export interface CheckAdsResult {
  breakdown: ContributionBreakdown;
  totalAdvertisingCost: Money;
  estimatedProfitAfterAds: Money;
  estimatedProfitPerOrder?: Money;
  targetProfitTotal?: Money;
  reportedRoas?: number;
  economicRoas?: number;
  reportedAcosBps?: BasisPoints;
  economicAcosBps?: BasisPoints;
  cpa?: Money;
  cpc?: Money;
  diagnosis: CampaignDiagnosis;
  warnings: CalculationWarning[];
  calculationRuleVersion: string;
}

export interface ValidationIssue {
  field: string;
  code: string;
}

export type ValidationResult =
  | { valid: true; issues: [] }
  | { valid: false; issues: ValidationIssue[] };
